/* SELISIH — the three scenes. Every picture is drawn in code on a canvas:
   no image files, no copied art. Each scene function draws one panel;
   `right` true draws the right panel with its differences applied.
   Panel size is 560 x 420. Difference targets are panel coordinates. */

const PANEL_W = 560;
const PANEL_H = 420;

/* ---------- small drawing helpers ---------- */

function circle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function roundRect(ctx, x, y, w, h, r, fill) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

function poly(ctx, points, fill) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function line(ctx, x1, y1, x2, y2, color, width) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = width || 2;
  ctx.stroke();
}

function curve(ctx, x1, y1, cx, cy, x2, y2, color, width) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(cx, cy, x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = width || 2;
  ctx.lineCap = 'round';
  ctx.stroke();
}

function vGrad(ctx, stops) {
  const g = ctx.createLinearGradient(0, 0, 0, PANEL_H);
  for (const [at, color] of stops) g.addColorStop(at, color);
  return g;
}

function drawStars(ctx, list) {
  for (const [x, y, r] of list) circle(ctx, x, y, r, 'rgba(255, 244, 200, 0.9)');
}

/* A paper lantern hanging from a string point. */
function lantern(ctx, x, y, color) {
  line(ctx, x, y - 14, x, y - 6, '#3a2a18', 2);
  roundRect(ctx, x - 15, y - 6, 30, 34, 12, color);
  rect(ctx, x - 9, y - 10, 18, 5, '#7a5a2e');
  rect(ctx, x - 9, y + 28, 18, 5, '#7a5a2e');
  line(ctx, x, y + 33, x, y + 42, '#ffd97a', 2);
  circle(ctx, x, y + 11, 4, 'rgba(255, 233, 168, 0.85)');
}

/* A sitting cat, facing right. Body + head + ears + tail. */
function sittingCat(ctx, x, y, coat, tailUp) {
  ellipse(ctx, x, y, 20, 15, coat);
  circle(ctx, x + 14, y - 14, 11, coat);
  poly(ctx, [[x + 6, y - 20], [x + 9, y - 30], [x + 13, y - 21]], coat);
  poly(ctx, [[x + 16, y - 22], [x + 21, y - 31], [x + 24, y - 21]], coat);
  if (tailUp) curve(ctx, x - 18, y + 6, x - 30, y - 8, x - 26, y - 22, coat, 5);
  else curve(ctx, x - 18, y + 6, x - 30, y + 12, x - 24, y + 16, coat, 5);
  circle(ctx, x + 18, y - 16, 1.6, '#241c38');
}

/* ---------- Scene 1: Pasar Lentera (Lantern Market) ---------- */

function drawLanternMarket(ctx, right) {
  ctx.fillStyle = vGrad(ctx, [[0, '#241640'], [0.55, '#5b2a52'], [0.8, '#c65a4e'], [1, '#1a1026']]);
  ctx.fillRect(0, 0, PANEL_W, PANEL_H);

  drawStars(ctx, [[40, 40, 1.5], [90, 25, 1.2], [160, 50, 1.8], [230, 30, 1.2], [300, 45, 1.5],
    [350, 25, 1.2], [420, 40, 1.6], [500, 30, 1.2], [540, 60, 1.5], [120, 80, 1.2],
    [260, 70, 1.4], [380, 70, 1.2]]);

  // Moon with three craters; the small one vanishes on the right.
  circle(ctx, 478, 64, 32, '#ffe9a8');
  circle(ctx, 468, 56, 5, '#f0d488');
  circle(ctx, 472, 78, 3, '#f0d488');
  if (!right) circle(ctx, 490, 72, 4, '#f0d488');

  // Lantern string sagging across the top.
  ctx.beginPath();
  ctx.moveTo(10, 55);
  ctx.quadraticCurveTo(280, 105, 550, 70);
  ctx.strokeStyle = '#3a2a18';
  ctx.lineWidth = 2;
  ctx.stroke();
  const lanternSpots = [[60, 74], [140, 84], [215, 88], [295, 88], [375, 86], [455, 80], [520, 72]];
  const lanternColors = ['#e63946', '#f4a261', '#e63946', '#ffc857', '#e63946', '#f4a261', '#e63946'];
  lanternSpots.forEach(([x, y], i) => {
    let color = lanternColors[i];
    if (right && i === 2) color = '#2ec4b6'; // difference 2: this lantern turns teal
    lantern(ctx, x, y, color);
  });

  // Balloons, identical on both sides.
  line(ctx, 70, 190, 55, 152, '#d9cdf0', 1.5);
  line(ctx, 70, 190, 76, 140, '#d9cdf0', 1.5);
  line(ctx, 70, 190, 96, 154, '#d9cdf0', 1.5);
  circle(ctx, 55, 150, 13, '#e63946');
  circle(ctx, 76, 138, 13, '#ffc857');
  circle(ctx, 96, 152, 13, '#2e86ab');

  // Left stall: striped awning, LENTERA sign, jars on the counter.
  poly(ctx, [[35, 210], [245, 210], [250, 252], [30, 252]], '#fff3d6');
  for (let i = 0; i < 6; i++) {
    if (i % 2 === 0) rect(ctx, 35 + i * 36, 210, 18, 42, '#e63946');
  }
  rect(ctx, 85, 232, 110, 26, '#2b1d4e');
  ctx.fillStyle = '#ffd97a';
  ctx.font = 'bold 15px Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('LENTERA', 140, 250);
  rect(ctx, 45, 290, 190, 70, '#7a4a2b');
  rect(ctx, 40, 282, 200, 12, '#a4713f');
  circle(ctx, 75, 270, 10, '#f4a261');
  circle(ctx, 115, 268, 12, '#2ec4b6');
  if (!right) circle(ctx, 155, 270, 10, '#e63946'); // difference 4: jar goes missing

  // Right stall: teal-striped awning, pumpkins, basket.
  poly(ctx, [[315, 210], [525, 210], [530, 252], [310, 252]], '#fff3d6');
  for (let i = 0; i < 6; i++) {
    const stripeColor = (right && i === 3) ? '#ff7bac' : '#2e86ab'; // difference 3: stripe turns pink
    if (i % 2 === 1) rect(ctx, 315 + i * 36, 210, 18, 42, stripeColor);
  }
  rect(ctx, 320, 290, 200, 70, '#6b3a24');
  rect(ctx, 315, 282, 210, 12, '#a4713f');
  circle(ctx, 360, 270, 14, '#f4a261');
  circle(ctx, 410, 272, 12, '#e07856');
  roundRect(ctx, 455, 262, 44, 22, 6, '#b98a4e');

  // Ground, potted plant, crate; the cat sits on the crate (left only).
  rect(ctx, 0, 360, 560, 60, '#1a1026');
  ellipse(ctx, 90, 395, 26, 7, '#2c2140');
  ellipse(ctx, 300, 405, 30, 7, '#2c2140');
  ellipse(ctx, 500, 392, 24, 7, '#2c2140');
  poly(ctx, [[282, 352], [308, 352], [303, 372], [287, 372]], '#c65a4e');
  ellipse(ctx, 288, 342, 7, 14, '#37c978');
  ellipse(ctx, 298, 338, 7, 15, '#2e9e5b');
  ellipse(ctx, 306, 344, 6, 12, '#37c978');
  rect(ctx, 440, 330, 64, 44, '#8a5a33');
  line(ctx, 440, 330, 504, 374, '#6b4226', 3);
  line(ctx, 504, 330, 440, 374, '#6b4226', 3);
  if (!right) sittingCat(ctx, 458, 322, '#3d3d5c', true); // difference 5: the cat is gone
}

/* ---------- Scene 2: Taman Kucing Senja (Dusk Cat Garden) ---------- */

function drawCatGarden(ctx, right) {
  ctx.fillStyle = vGrad(ctx, [[0, '#16233f'], [0.55, '#3f5a7a'], [0.78, '#e8a56b'], [1, '#1f4d2a']]);
  ctx.fillRect(0, 0, PANEL_W, PANEL_H);

  // Setting sun and soft clouds.
  circle(ctx, 88, 86, 30, '#ffb347');
  circle(ctx, 88, 86, 42, 'rgba(255, 179, 71, 0.25)');
  ellipse(ctx, 300, 60, 46, 12, 'rgba(243, 234, 216, 0.5)');
  ellipse(ctx, 430, 90, 56, 13, 'rgba(243, 234, 216, 0.45)');

  // Big tree with three apples; one apple is picked on the right.
  poly(ctx, [[148, 180], [172, 180], [178, 330], [142, 330]], '#6b4226');
  circle(ctx, 140, 140, 55, '#2e6b34');
  circle(ctx, 200, 120, 60, '#357a3b');
  circle(ctx, 250, 150, 48, '#2e6b34');
  circle(ctx, 165, 130, 7, '#e63946');
  circle(ctx, 245, 150, 7, '#e63946');
  if (!right) circle(ctx, 215, 105, 7, '#e63946'); // difference 1: apple gone

  // Wooden fence across the middle; an orange cat sits on it.
  rect(ctx, 0, 268, 560, 8, '#8a5a33');
  rect(ctx, 0, 298, 560, 8, '#8a5a33');
  for (let x = 20; x < 560; x += 70) rect(ctx, x, 250, 12, 70, '#7a4a2b');
  sittingCat(ctx, 372, 258, '#f4a261', !right); // difference 2: tail points up / down

  // Pond with lily pads and one lotus flower.
  ellipse(ctx, 440, 365, 90, 26, '#2e86ab');
  ellipse(ctx, 440, 362, 78, 20, '#3a9bc2');
  circle(ctx, 400, 360, 14, '#37c978');
  circle(ctx, 490, 358, 12, '#37c978');
  circle(ctx, 450, 372, 16, '#2e9e5b');
  if (!right) { // difference 3: lotus flower gone
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      ellipse(ctx, 450 + Math.cos(a) * 8, 366 + Math.sin(a) * 6, 6, 4, '#ff7bac');
    }
    circle(ctx, 450, 366, 4, '#ffd97a');
  }

  // Tulips along the bottom; one changes colour.
  const tulipXs = [60, 120, 180, 240, 300];
  tulipXs.forEach((x, i) => {
    let color = i % 2 === 0 ? '#ff7bac' : '#ffc857';
    if (right && i === 2) color = '#ffc857'; // difference 4: pink tulip turns yellow
    line(ctx, x, 398, x, 378, '#2e9e5b', 3);
    circle(ctx, x, 372, 9, color);
    circle(ctx, x - 6, 376, 6, color);
    circle(ctx, x + 6, 376, 6, color);
  });

  // Birdhouse on a pole; its door is boarded up on the right.
  rect(ctx, 505, 190, 8, 120, '#6b4226');
  rect(ctx, 478, 150, 62, 48, '#a4713f');
  poly(ctx, [[472, 152], [509, 122], [546, 152]], '#7a4a2b');
  if (right) circle(ctx, 509, 178, 8, '#a4713f'); // difference 5: no door hole
  else circle(ctx, 509, 178, 8, '#241c38');

  // Fireflies; one has flown away on the right.
  const flies = [[250, 90], [320, 120], [90, 180], [420, 150], [150, 220], [280, 200]];
  flies.forEach(([x, y], i) => {
    if (right && i === 1) return; // difference 6: firefly gone
    circle(ctx, x, y, 8, 'rgba(255, 217, 122, 0.25)');
    circle(ctx, x, y, 3, '#ffd97a');
  });

  // Stepping stones; the middle one is missing on the right.
  ellipse(ctx, 240, 400, 22, 8, '#b9b9b9');
  if (!right) ellipse(ctx, 290, 395, 22, 8, '#b9b9b9'); // difference 7
  ellipse(ctx, 340, 400, 22, 8, '#b9b9b9');
  ellipse(ctx, 390, 395, 22, 8, '#b9b9b9');

  // A grey cat sleeps curled by the pond, identical on both sides.
  circle(ctx, 350, 348, 16, '#3d3d5c');
  poly(ctx, [[338, 336], [341, 326], [346, 336]], '#3d3d5c');
  poly(ctx, [[356, 334], [361, 325], [364, 335]], '#3d3d5c');
}

/* ---------- Scene 3: Dermaga Bintang (Star Pier) ---------- */

function drawStarPier(ctx, right) {
  ctx.fillStyle = vGrad(ctx, [[0, '#0b1030'], [0.6, '#1d2b5e'], [1, '#123a5e']]);
  ctx.fillRect(0, 0, PANEL_W, PANEL_H);

  drawStars(ctx, [[80, 40, 1.5], [150, 70, 1.2], [220, 35, 1.8], [300, 55, 1.2], [360, 30, 1.5],
    [420, 65, 1.2], [500, 40, 1.6], [540, 90, 1.2], [120, 110, 1.2], [250, 100, 1.4],
    [330, 110, 1.2], [470, 120, 1.5], [60, 140, 1.2], [180, 150, 1.4], [380, 140, 1.2]]);

  // Crescent moon, identical both sides.
  circle(ctx, 64, 58, 26, '#ffe9a8');
  circle(ctx, 76, 50, 24, '#0b1030');

  // Sea with three wave strokes.
  rect(ctx, 0, 300, 560, 120, '#123a5e');
  for (const y of [330, 360, 395]) {
    ctx.beginPath();
    for (let x = 0; x <= 560; x += 20) ctx.lineTo(x, y + Math.sin(x / 45) * 4);
    ctx.strokeStyle = 'rgba(243, 234, 216, 0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // A fish jumps out of the water (left only).
  if (!right) { // difference 1: jumping fish gone
    ellipse(ctx, 150, 318, 16, 7, '#c9d6e8');
    poly(ctx, [[164, 318], [176, 310], [176, 326]], '#c9d6e8');
    circle(ctx, 138, 316, 2, '#0b1030');
    line(ctx, 132, 332, 142, 326, 'rgba(243, 234, 216, 0.7)', 2);
    line(ctx, 158, 332, 168, 326, 'rgba(243, 234, 216, 0.7)', 2);
  }

  // Lighthouse: tapered tower, red bands, lamp room, sweeping beam.
  poly(ctx, [[425, 300], [470, 300], [460, 120], [435, 120]], '#f3ead8');
  rect(ctx, 428, 220, 40, 20, '#e63946');
  const bandColor = right ? '#2e86ab' : '#e63946'; // difference 3: middle band turns blue
  rect(ctx, 431, 160, 34, 20, bandColor);
  rect(ctx, 430, 108, 54, 16, '#241c38');
  rect(ctx, 438, 88, 38, 22, '#2b1d4e');
  circle(ctx, 457, 99, 9, '#ffd97a');
  ctx.save();
  ctx.globalAlpha = 0.28;
  if (!right) poly(ctx, [[440, 96], [120, 165], [120, 235]], '#ffd97a'); // difference 2: beam left
  else poly(ctx, [[458, 96], [556, 150], [556, 215]], '#ffd97a'); // difference 2: beam right
  ctx.restore();

  // Pier deck and posts.
  rect(ctx, 0, 290, 560, 26, '#8a5a33');
  for (let x = 20; x < 560; x += 40) line(ctx, x, 290, x, 316, '#6b4226', 2);
  for (const x of [40, 180, 320, 500]) rect(ctx, x, 316, 12, 26, '#6b4226');

  // Two boats; the red sail turns green on the right.
  poly(ctx, [[170, 350], [232, 350], [222, 362], [180, 362]], '#7a4a2b');
  line(ctx, 201, 350, 201, 306, '#3a2a18', 3);
  const sailColor = right ? '#37c978' : '#e63946'; // difference 4
  poly(ctx, [[201, 308], [201, 348], [228, 348]], sailColor);
  poly(ctx, [[306, 362], [356, 362], [348, 372], [314, 372]], '#6b4226');
  line(ctx, 331, 362, 331, 326, '#3a2a18', 3);
  poly(ctx, [[331, 328], [331, 360], [352, 360]], '#2e86ab');

  // Buoys; the far one turns yellow on the right.
  circle(ctx, 95, 375, 12, '#f4a261');
  rect(ctx, 83, 371, 24, 7, '#f3ead8');
  const buoyColor = right ? '#ffc857' : '#f4a261'; // difference 5
  circle(ctx, 500, 378, 12, buoyColor);
  rect(ctx, 488, 374, 24, 7, '#f3ead8');

  // Seagulls; one is gone on the right.
  curve(ctx, 192, 80, 198, 74, 204, 80, '#f3ead8', 2);
  curve(ctx, 204, 80, 210, 74, 216, 80, '#f3ead8', 2);
  if (!right) { // difference 6
    curve(ctx, 292, 62, 298, 56, 304, 62, '#f3ead8', 2);
    curve(ctx, 304, 62, 310, 56, 316, 62, '#f3ead8', 2);
  }

  // Fishing rod leaning on a post; its bobber is gone on the right.
  line(ctx, 380, 292, 340, 240, '#3a2a18', 3);
  line(ctx, 340, 240, 340, 252, 'rgba(243, 234, 216, 0.6)', 1.5);
  if (!right) { // difference 7
    circle(ctx, 340, 252, 6, '#e63946');
    circle(ctx, 340, 249, 3, '#f3ead8');
  }

  // Bucket with a fish tail sticking out; the tail is gone on the right.
  poly(ctx, [[108, 300], [132, 300], [128, 316], [112, 316]], '#c65a4e');
  if (!right) poly(ctx, [[114, 300], [120, 284], [126, 300]], '#c9d6e8'); // difference 8

  // Coiled rope on the deck; gone on the right.
  if (!right) { // difference 9
    circle(ctx, 250, 312, 12, '#d9c9a8');
    circle(ctx, 250, 312, 8, '#b8a67e');
    circle(ctx, 250, 312, 4, '#d9c9a8');
  }
}

/* ---------- Level table ---------- */

const LEVELS = [
  {
    name: 'Pasar Lentera',
    sub: 'Lantern Market',
    time: 120,
    hints: 3,
    draw: drawLanternMarket,
    differences: [
      { id: 'moon-crater', x: 490, y: 72, r: 12 },
      { id: 'lantern-teal', x: 215, y: 112, r: 20 },
      { id: 'awning-stripe', x: 432, y: 231, r: 16 },
      { id: 'jar-missing', x: 155, y: 270, r: 16 },
      { id: 'cat-missing', x: 470, y: 318, r: 26 },
    ],
  },
  {
    name: 'Taman Kucing Senja',
    sub: 'Dusk Cat Garden',
    time: 150,
    hints: 3,
    draw: drawCatGarden,
    differences: [
      { id: 'apple-missing', x: 215, y: 105, r: 12 },
      { id: 'cat-tail', x: 352, y: 250, r: 14 },
      { id: 'lotus-missing', x: 450, y: 366, r: 16 },
      { id: 'tulip-color', x: 180, y: 376, r: 14 },
      { id: 'birdhouse-door', x: 509, y: 178, r: 12 },
      { id: 'firefly-missing', x: 320, y: 120, r: 12 },
      { id: 'stone-missing', x: 290, y: 395, r: 16 },
    ],
  },
  {
    name: 'Dermaga Bintang',
    sub: 'Star Pier',
    time: 180,
    hints: 3,
    draw: drawStarPier,
    differences: [
      { id: 'fish-missing', x: 150, y: 318, r: 18 },
      { id: 'beam-direction', spots: [[280, 195], [510, 180]], r: 30 },
      { id: 'tower-band', x: 447, y: 170, r: 16 },
      { id: 'sail-color', x: 212, y: 328, r: 18 },
      { id: 'buoy-color', x: 500, y: 378, r: 16 },
      { id: 'gull-missing', x: 304, y: 62, r: 14 },
      { id: 'bobber-missing', x: 340, y: 252, r: 12 },
      { id: 'bucket-fish', x: 120, y: 292, r: 12 },
      { id: 'rope-missing', x: 250, y: 312, r: 16 },
    ],
  },
];
