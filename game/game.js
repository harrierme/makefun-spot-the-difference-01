/* SELISIH — game logic: state, rendering, input, timer, hints, scoring.
   The scenes (scenes.js) only draw; everything about play lives here. */

const canvasLeft = document.getElementById('canvasLeft');
const canvasRight = document.getElementById('canvasRight');
const ctxLeft = canvasLeft.getContext('2d');
const ctxRight = canvasRight.getContext('2d');

const el = (id) => document.getElementById(id);
const levelNameEl = el('levelName');
const levelNumEl = el('levelNum');
const timerBarEl = el('timerBar');
const timerTextEl = el('timerText');
const remainNumEl = el('remainNum');
const scoreNumEl = el('scoreNum');
const hintNumEl = el('hintNum');
const overlayEl = el('overlay');
const floatLayerEl = el('floatLayer');

const state = {
  phase: 'menu', // menu | playing | complete | over | won
  level: 0,
  found: new Set(),
  score: 0,
  stars: 0,
  mistakes: 0,
  hintsLeft: 3,
  timeLeft: 0,
  levelTime: 0,
  endAt: 0,
  hint: null, // { diff, until }
  lastClickAt: 0,
};

function currentLevel() {
  return LEVELS[state.level];
}

function markerPos(diff, isRight) {
  if (diff.spots) return diff.spots[isRight ? 1 : 0];
  return [diff.x, diff.y];
}

/* ---------- rendering ---------- */

function drawMarker(ctx, x, y, r, pulse) {
  const rr = r + 7 + (pulse ? Math.sin(Date.now() / 180) * 3 : 0);
  ctx.beginPath();
  ctx.arc(x, y, rr, 0, Math.PI * 2);
  ctx.strokeStyle = pulse ? '#ffd97a' : '#37c978';
  ctx.lineWidth = 4;
  ctx.setLineDash(pulse ? [8, 6] : []);
  ctx.stroke();
  ctx.setLineDash([]);
  if (!pulse) {
    ctx.beginPath();
    ctx.moveTo(x - 7, y);
    ctx.lineTo(x - 2, y + 6);
    ctx.lineTo(x + 9, y - 7);
    ctx.strokeStyle = '#37c978';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke();
  }
}

function renderPanels() {
  const level = currentLevel();
  level.draw(ctxLeft, false);
  level.draw(ctxRight, true);
  for (const diff of level.differences) {
    if (!state.found.has(diff.id)) continue;
    const [lx, ly] = markerPos(diff, false);
    const [rx, ry] = markerPos(diff, true);
    drawMarker(ctxLeft, lx, ly, diff.r, false);
    drawMarker(ctxRight, rx, ry, diff.r, false);
  }
  if (state.hint && Date.now() < state.hint.until) {
    const diff = state.hint.diff;
    const [lx, ly] = markerPos(diff, false);
    const [rx, ry] = markerPos(diff, true);
    drawMarker(ctxLeft, lx, ly, diff.r, true);
    drawMarker(ctxRight, rx, ry, diff.r, true);
  }
}

function renderHud() {
  const level = currentLevel();
  levelNameEl.textContent = level.name + ' · ' + level.sub;
  levelNumEl.textContent = 'Level ' + (state.level + 1) + ' / ' + LEVELS.length;
  remainNumEl.textContent = level.differences.length - state.found.size;
  scoreNumEl.textContent = state.score;
  hintNumEl.textContent = state.hintsLeft;
  const frac = Math.max(0, state.timeLeft / state.levelTime);
  timerBarEl.style.width = (frac * 100).toFixed(1) + '%';
  timerBarEl.classList.toggle('low', state.timeLeft <= 30);
  timerTextEl.textContent = Math.ceil(state.timeLeft);
  document.querySelectorAll('#levelDots .dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === state.level);
    dot.classList.toggle('done', i < state.level);
  });
}

/* ---------- overlays ---------- */

function showOverlay(html) {
  overlayEl.innerHTML = '<div class="overlay-card">' + html + '</div>';
  overlayEl.classList.add('show');
  const btn = overlayEl.querySelector('button');
  if (btn) btn.focus();
}

function hideOverlay() {
  overlayEl.classList.remove('show');
}

function showStartOverlay() {
  overlayEl.innerHTML = `
    <div class="overlay-card">
      <h1>SELISIH</h1>
      <p class="tagline">Dua gambar hampir sama. Temukan semua bedanya sebelum waktu habis.</p>
      <ul class="howto">
        <li><b>3 malam, 21 beda.</b> Pasar lentera, taman kucing, lalu dermaga bintang — makin malam makin sulit.</li>
        <li><b>Klik</b> bedanya di panel kiri atau kanan. Lingkaran hijau menandai yang sudah ketemu.</li>
        <li><b>H</b> minta petunjuk (terbatas). Klik salah memotong waktu 3 detik. Temuan memberi bonus waktu 2 detik.</li>
      </ul>
      <button id="btnPlay" type="button" class="primary big">▶ Mainkan</button>
      <p class="keys">Keyboard: H petunjuk · R ulangi level · M suara · N level berikut · Enter mulai</p>
    </div>`;
  overlayEl.classList.add('show');
  el('btnPlay').addEventListener('click', () => { playClick(); startGame(); });
}

/* ---------- flow ---------- */

function startGame() {
  state.score = 0;
  state.stars = 0;
  state.level = 0;
  loadLevel(0);
  hideOverlay();
}

function loadLevel(index) {
  state.level = index;
  const level = currentLevel();
  state.found = new Set();
  state.mistakes = 0;
  state.hintsLeft = level.hints;
  state.levelTime = level.time;
  state.timeLeft = level.time;
  state.endAt = Date.now() + level.time * 1000;
  state.hint = null;
  state.phase = 'playing';
  renderHud();
  renderPanels();
}

function levelComplete() {
  state.phase = 'complete';
  const timeBonus = Math.round(state.timeLeft) * 5;
  state.score += timeBonus;
  const frac = state.timeLeft / state.levelTime;
  const stars = frac >= 0.4 && state.mistakes === 0 ? 3 : frac >= 0.2 ? 2 : 1;
  state.stars += stars;
  playLevelClear();
  renderHud();
  const last = state.level === LEVELS.length - 1;
  showOverlay(`
    <h2>${last ? 'Semua malam selesai!' : 'Level selesai!'}</h2>
    <p class="big-stat">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</p>
    <p class="big-stat">Bonus waktu: <b>+${timeBonus}</b> &nbsp;·&nbsp; Skor: <b>${state.score}</b></p>
    <p class="tagline">${last ? 'Kamu menemukan 21 beda di tiga malam.' : 'Malam berikutnya menunggu.'}</p>
    <button id="btnNext" type="button" class="primary big">${last ? '★ Lihat hasil akhir' : '▶ Level berikut'}</button>
    <p class="keys">Tekan N untuk lanjut · R untuk mengulang level ini</p>`);
  el('btnNext').addEventListener('click', () => { playClick(); advanceLevel(); });
}

function advanceLevel() {
  if (state.level === LEVELS.length - 1) {
    showWin();
  } else {
    hideOverlay();
    loadLevel(state.level + 1);
  }
}

function showWin() {
  state.phase = 'won';
  playWin();
  renderHud();
  showOverlay(`
    <h1>★ MENANG ★</h1>
    <h2>Semua 21 beda ketemu!</h2>
    <p class="big-stat">Skor akhir: <b>${state.score}</b> &nbsp;·&nbsp; Bintang: <b>${state.stars} / 9</b></p>
    <p class="tagline">Tiga malam — pasar lentera, taman kucing, dermaga bintang — selesai.</p>
    <button id="btnAgain" type="button" class="primary big">↺ Main lagi</button>
    <p class="keys">Tekan R untuk main lagi dari awal</p>`);
  el('btnAgain').addEventListener('click', () => { playClick(); startGame(); });
}

function gameOver() {
  state.phase = 'over';
  playGameOver();
  renderHud();
  const level = currentLevel();
  showOverlay(`
    <h2>Waktu habis!</h2>
    <p class="big-stat">Kamu menemukan <b>${state.found.size} dari ${level.differences.length}</b> beda di ${level.name}.</p>
    <p class="tagline">Coba lagi — bedanya masih di sana, menunggu ditemukan.</p>
    <button id="btnRetry" type="button" class="primary big">↺ Coba level ini lagi</button>
    <p class="keys">Tekan R untuk mengulang level · Enter untuk mulai dari awal</p>`);
  el('btnRetry').addEventListener('click', () => { playClick(); loadLevel(state.level); hideOverlay(); });
}

/* ---------- input ---------- */

function floatText(x, y, text, bad) {
  const span = document.createElement('span');
  span.className = 'float-text' + (bad ? ' bad' : '');
  span.textContent = text;
  span.style.left = x + 'px';
  span.style.top = y + 'px';
  floatLayerEl.appendChild(span);
  setTimeout(() => span.remove(), 1000);
}

function canvasPoint(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  const stageRect = el('stage').getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (canvas.width / rect.width),
    y: (event.clientY - rect.top) * (canvas.height / rect.height),
    fx: event.clientX - stageRect.left,
    fy: event.clientY - stageRect.top,
  };
}

function onPanelClick(event, isRight) {
  if (state.phase !== 'playing') return;
  const now = Date.now();
  if (now - state.lastClickAt < 250) return; // anti-spam cooldown
  state.lastClickAt = now;
  const canvas = isRight ? canvasRight : canvasLeft;
  const p = canvasPoint(event, canvas);
  const level = currentLevel();
  for (const diff of level.differences) {
    if (state.found.has(diff.id)) continue;
    const spots = diff.spots || [[diff.x, diff.y]];
    for (const [sx, sy] of spots) {
      if (Math.hypot(p.x - sx, p.y - sy) <= diff.r + 10) {
        state.found.add(diff.id);
        state.score += 100;
        state.timeLeft = Math.min(state.levelTime, state.timeLeft + 2);
        state.endAt = Date.now() + state.timeLeft * 1000;
        playFound();
        floatText(p.fx - 20, p.fy - 12, '+100', false);
        renderHud();
        renderPanels();
        if (state.found.size === level.differences.length) levelComplete();
        return;
      }
    }
  }
  // Miss: wrong spot.
  state.mistakes += 1;
  state.timeLeft = Math.max(0, state.timeLeft - 3);
  state.endAt = Date.now() + state.timeLeft * 1000;
  playMiss();
  floatText(p.fx - 12, p.fy - 12, '−3 dtk', true);
  canvas.classList.remove('shake');
  void canvas.offsetWidth;
  canvas.classList.add('shake');
  renderHud();
}

function useHint() {
  if (state.phase !== 'playing') return;
  if (state.hintsLeft <= 0) return;
  const level = currentLevel();
  const remaining = level.differences.filter((d) => !state.found.has(d.id));
  if (!remaining.length) return;
  state.hintsLeft -= 1;
  const pick = remaining[Math.floor(Math.random() * remaining.length)];
  state.hint = { diff: pick, until: Date.now() + 2500 };
  playHint();
  renderHud();
}

canvasLeft.addEventListener('click', (e) => onPanelClick(e, false));
canvasRight.addEventListener('click', (e) => onPanelClick(e, true));

el('btnHint').addEventListener('click', useHint);
el('btnRestart').addEventListener('click', () => { if (state.phase !== 'menu') { playClick(); loadLevel(state.level); hideOverlay(); } });
el('btnSound').addEventListener('click', () => {
  const m = setMuted(!isMuted());
  el('btnSound').textContent = (m ? '🔇 Senyap ' : '🔊 Suara ') + 'M';
  if (!m) playClick();
});
el('btnStart').addEventListener('click', () => { playClick(); startGame(); });

document.addEventListener('keydown', (e) => {
  if (e.key === 'h' || e.key === 'H') useHint();
  else if (e.key === 'm' || e.key === 'M') el('btnSound').click();
  else if (e.key === 'r' || e.key === 'R') {
    if (state.phase === 'won' || state.phase === 'menu') startGame();
    else if (state.phase !== 'menu') { loadLevel(state.level); hideOverlay(); }
  } else if (e.key === 'n' || e.key === 'N') {
    if (state.phase === 'complete') advanceLevel();
  } else if (e.key === 'Enter') {
    if (state.phase === 'menu') startGame();
    else if (state.phase === 'complete') advanceLevel();
    else if (state.phase === 'over') { loadLevel(state.level); hideOverlay(); }
    else if (state.phase === 'won') startGame();
  }
});

/* ---------- main loop: timer + hint pulse ---------- */

function tick() {
  if (state.phase === 'playing') {
    state.timeLeft = Math.max(0, (state.endAt - Date.now()) / 1000);
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      renderPanels();
      renderHud();
      gameOver();
    } else {
      renderPanels();
      renderHud();
    }
  }
  requestAnimationFrame(tick);
}

/* ---------- boot: preview level 1 behind the start overlay ---------- */

loadLevel(0);
state.phase = 'menu';
state.timeLeft = state.levelTime;
renderHud();
renderPanels();
showStartOverlay();
requestAnimationFrame(tick);

// Small handle for play-testing (read state, drive clicks from a script).
window.SELISIH = { state, LEVELS };
