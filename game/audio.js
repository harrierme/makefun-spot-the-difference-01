/* SELISIH — all sounds are synthesized with WebAudio. No audio files.
   One shared AudioContext, created lazily on the first user gesture. */

let audioCtx = null;
let muted = false;

function ensureAudioContext() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) audioCtx = new AC();
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function setMuted(value) {
  muted = !!value;
  return muted;
}

function isMuted() {
  return muted;
}

/* Play one short oscillator note. */
function playTone(freq, startAt, dur, type, vol) {
  const ctx = ensureAudioContext();
  if (!ctx || muted) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type || 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, ctx.currentTime + startAt);
  gain.gain.exponentialRampToValueAtTime(vol || 0.18, ctx.currentTime + startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startAt + dur);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + startAt);
  osc.stop(ctx.currentTime + startAt + dur + 0.05);
}

/* A difference was found: bright two-note chime. */
function playFound() {
  playTone(659.25, 0, 0.16, 'triangle', 0.22); // E5
  playTone(880.0, 0.09, 0.22, 'triangle', 0.22); // A5
}

/* Wrong click: low dull buzz. */
function playMiss() {
  playTone(140, 0, 0.18, 'square', 0.10);
  playTone(110, 0.05, 0.18, 'square', 0.08);
}

/* Hint used: soft high ping. */
function playHint() {
  playTone(1174.66, 0, 0.25, 'sine', 0.14); // D6
  playTone(1567.98, 0.12, 0.3, 'sine', 0.10); // G6
}

/* Level complete: rising arpeggio. */
function playLevelClear() {
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => playTone(f, i * 0.11, 0.22, 'triangle', 0.2));
}

/* Whole game won: longer fanfare. */
function playWin() {
  [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.5].forEach((f, i) =>
    playTone(f, i * 0.12, 0.26, 'triangle', 0.2));
}

/* Time ran out: descending sigh. */
function playGameOver() {
  [392.0, 329.63, 261.63].forEach((f, i) => playTone(f, i * 0.16, 0.3, 'sine', 0.16));
}

/* Plain UI click. */
function playClick() {
  playTone(880, 0, 0.06, 'sine', 0.08);
}
