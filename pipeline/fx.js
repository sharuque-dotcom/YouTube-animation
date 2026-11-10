// Story effects and characters: the "act it out" layer on top of shots.
//   hearts / chipRain / spy / scanHUD  — reusable effects tied to a spoken word
//   person                              — a flat 2D character rig (blinks, bobs, arms move)
//   diner                               — a re-enactment scene (three founders in a diner booth)

import { W, H, clamp, lerp, rand, text } from './engine.js';
import { UI, spring, ease, card } from './lightui.js';
import { ez, span } from './motion.js';

// ---------------------------------------------------------------- particles
export function heart(g, x, y, s, color) {
  g.save(); g.translate(x, y); g.scale(s / 40, s / 40);
  g.fillStyle = color;
  g.beginPath();
  g.moveTo(0, 12);
  g.bezierCurveTo(-34, -10, -18, -38, 0, -20);
  g.bezierCurveTo(18, -38, 34, -10, 0, 12);
  g.fill();
  g.restore();
}

/** Hearts drifting down from the top, swaying, for `dur` seconds after `at` */
export function hearts(g, t, at, dur = 3, { count = 46, seed = 4 } = {}) {
  if (t < at || t > at + dur + 2.5) return;
  const r = rand(seed);
  const cols = ['#ff5c8a', '#ff8fb1', '#e2412e', '#ffb3c9', '#c94f9b'];
  for (let i = 0; i < count; i++) {
    const born = at + r() * dur, x0 = r() * W, sp = 280 + r() * 260, sz = 26 + r() * 46, ph = r() * 6, c = cols[i % cols.length];
    const lt = t - born;
    if (lt < 0) continue;
    const y = -60 + lt * sp, x = x0 + Math.sin(lt * 2.2 + ph) * 40;
    if (y > H + 80) continue;
    g.save(); g.globalAlpha = Math.min(1, lt * 4) * (1 - clamp((y - H * 0.75) / (H * 0.3)));
    g.translate(x, y); g.rotate(Math.sin(lt * 1.7 + ph) * 0.4);
    heart(g, 0, 0, sz, c);
    g.restore();
  }
}

/** A small Nvidia-style chip */
export function chipIcon(g, x, y, s, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s / 84, s / 84);
  g.fillStyle = '#2b2440'; g.beginPath(); g.roundRect(-42, -42, 84, 84, 12); g.fill();
  g.fillStyle = '#76b900'; g.beginPath(); g.roundRect(-26, -26, 52, 52, 8); g.fill();
  g.strokeStyle = '#2b2440'; g.lineWidth = 5;
  for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(i * 15, -42); g.lineTo(i * 15, -56); g.moveTo(i * 15, 42); g.lineTo(i * 15, 56); g.moveTo(-42, i * 15); g.lineTo(-56, i * 15); g.moveTo(42, i * 15); g.lineTo(56, i * 15); g.stroke(); }
  g.restore();
}

/** Chips rain down and bounce on the floor */
export function chipRain(g, t, at, dur = 2.5, { count = 26, seed = 7 } = {}) {
  if (t < at) return;
  const r = rand(seed), floor = H - 90;
  for (let i = 0; i < count; i++) {
    const born = at + r() * dur, x = 80 + r() * (W - 160), sz = 50 + r() * 50, spin = (r() - 0.5) * 6;
    const lt = t - born;
    if (lt < 0) continue;
    const gAcc = 2600, v0 = 0;
    let y = -80 + v0 * lt + 0.5 * gAcc * lt * lt, rot = spin * lt;
    const tHit = Math.sqrt((2 * (floor + 80)) / gAcc);
    if (lt > tHit) { const b = lt - tHit, vUp = gAcc * tHit * 0.35; y = floor - Math.max(0, vUp * b - 0.5 * gAcc * b * b); rot = spin * tHit; }
    chipIcon(g, x, y, sz, rot);
  }
}

/** A trench-coat spy silhouette sliding in from the left, peering through a magnifier */
export function spy(g, t, at, { x = 360, y = 980, out = 1e9 } = {}) {
  const p = spring(t, at, { freq: 1.2, damp: 0.75 });
  const o = ez.p3In(clamp((t - out) / 0.45));
  if (p <= 0.01 || o >= 1) return;
  const px = lerp(-300, x, Math.min(1, p)) - o * 700, bob = Math.sin((t - at) * 3) * 4;
  g.save(); g.translate(px, y + bob);
  g.fillStyle = '#2b2440';
  // coat
  g.beginPath(); g.moveTo(-90, 0); g.lineTo(-70, -330); g.quadraticCurveTo(0, -370, 70, -330); g.lineTo(95, 0); g.closePath(); g.fill();
  // head + hat
  g.beginPath(); g.arc(0, -390, 52, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(0, -420, 110, 22, 0, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.roundRect(-58, -500, 116, 86, 18); g.fill();
  g.fillStyle = '#4a2a8c'; g.fillRect(-58, -440, 116, 16);
  // arm + magnifier
  g.strokeStyle = '#2b2440'; g.lineWidth = 34; g.lineCap = 'round';
  g.beginPath(); g.moveTo(40, -290); g.lineTo(150, -330); g.stroke();
  g.lineWidth = 14; g.strokeStyle = '#2b2440';
  g.beginPath(); g.moveTo(150, -330); g.lineTo(200, -360); g.stroke();
  g.fillStyle = 'rgba(217,204,255,0.35)'; g.strokeStyle = '#2b2440'; g.lineWidth = 12;
  g.beginPath(); g.arc(250, -395, 62, 0, Math.PI * 2); g.fill(); g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.6)'; g.beginPath(); g.ellipse(232, -414, 18, 10, -0.6, 0, Math.PI * 2); g.fill();
  g.restore();
}

/**
 * Surveillance HUD over a rect: red corner brackets, a sweeping scan line, a magnifying lens
 * that glides over the target (magnifying what is underneath), and typed readout lines.
 */
export function scanHUD(g, t, at, [rx, ry, rw, rh], { lines = [], label = 'SURVEILLANCE', lensPath = null, readout = [rx + rw + 60, ry + 40] } = {}) {
  const on = ease(t, at, 0.4);
  if (on <= 0) return;
  const red = '#ff3b4e';
  g.save();
  // corner brackets closing in
  const inset = lerp(60, 0, on), L = 60;
  g.strokeStyle = red; g.lineWidth = 6; g.lineCap = 'round'; g.globalAlpha = on;
  const x0 = rx - 24 - inset, y0 = ry - 24 - inset, x1 = rx + rw + 24 + inset, y1 = ry + rh + 24 + inset;
  [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]].forEach(([cx, cy, sx, sy]) => {
    g.beginPath(); g.moveTo(cx, cy + sy * L); g.lineTo(cx, cy); g.lineTo(cx + sx * L, cy); g.stroke();
  });
  // scan line
  const sp = ((t - at) * 0.8) % 1;
  const sy2 = ry + sp * rh;
  const grad = g.createLinearGradient(0, sy2 - 60, 0, sy2);
  grad.addColorStop(0, 'rgba(255,59,78,0)'); grad.addColorStop(1, 'rgba(255,59,78,0.35)');
  g.fillStyle = grad; g.fillRect(rx, sy2 - 60, rw, 60);
  g.fillStyle = red; g.fillRect(rx, sy2, rw, 3);
  // REC label
  const blink = Math.floor((t - at) * 2) % 2 === 0;
  g.fillStyle = blink ? red : 'rgba(255,59,78,0.3)'; g.beginPath(); g.arc(x0 + 14, y0 - 30, 10, 0, Math.PI * 2); g.fill();
  text(g, label, x0 + 34, y0 - 20, { font: UI.BODY, weight: 600, size: 26, color: red, spacing: 4 });
  g.restore();
  // lens: magnify what is under it
  const lp = clamp((t - at - 0.3) / 2.6);
  if (lp > 0) {
    const path = lensPath || [[rx + rw * 0.3, ry + rh * 0.3], [rx + rw * 0.7, ry + rh * 0.45], [rx + rw * 0.5, ry + rh * 0.35]];
    const seg = Math.min(path.length - 2, Math.floor(lp * (path.length - 1)));
    const f = ez.p2InOut(lp * (path.length - 1) - seg);
    const lx = lerp(path[seg][0], path[seg + 1][0], f), ly = lerp(path[seg][1], path[seg + 1][1], f);
    const R = 120, Z = 1.7;
    g.save();
    g.beginPath(); g.arc(lx, ly, R, 0, Math.PI * 2); g.clip();
    g.drawImage(g.canvas, lx - R / Z, ly - R / Z, (2 * R) / Z, (2 * R) / Z, lx - R, ly - R, 2 * R, 2 * R);
    g.restore();
    g.save();
    g.strokeStyle = '#2b2440'; g.lineWidth = 14; g.beginPath(); g.arc(lx, ly, R, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 22; g.lineCap = 'round'; g.beginPath(); g.moveTo(lx + R * 0.72, ly + R * 0.72); g.lineTo(lx + R * 1.35, ly + R * 1.35); g.stroke();
    g.strokeStyle = 'rgba(255,59,78,0.8)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(lx - 30, ly); g.lineTo(lx + 30, ly); g.moveTo(lx, ly - 30); g.lineTo(lx, ly + 30); g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.ellipse(lx - 45, ly - 55, 34, 16, -0.6, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  // readout lines, typed
  lines.forEach((ln, i) => {
    const la = at + 0.5 + i * 0.55;
    const n = Math.floor(clamp((t - la) / 0.5) * ln.length);
    if (n <= 0) return;
    const [ox, oy] = readout;
    text(g, ln.slice(0, n), ox, oy + i * 48, { font: UI.BODY, weight: 600, size: 26, color: i === lines.length - 1 ? '#ff8a96' : '#ffd6da', spacing: 3 });
  });
}

// ---------------------------------------------------------------- characters
/**
 * A flat character: head, hair, body, arms. pose: { armL, armR } angles (radians from straight down).
 * t drives blinking and a breathing bob.
 */
export function person(g, x, y, s, t, { skin = '#f3c9a3', hair = '#2b2440', shirt = '#7c5cc4', jacket = null, armL = 0.2, armR = -0.2, seed = 1, glasses = false } = {}) {
  const r = rand(seed);
  const bob = Math.sin(t * 2.2 + r() * 6) * 3 * s;
  const blink = ((t + r() * 4) % 3.6) < 0.12;
  g.save(); g.translate(x, y + bob); g.scale(s, s);
  // body
  g.fillStyle = jacket || shirt;
  g.beginPath(); g.moveTo(-70, 120); g.quadraticCurveTo(-72, -10, 0, -14); g.quadraticCurveTo(72, -10, 70, 120); g.closePath(); g.fill();
  if (jacket) { g.fillStyle = shirt; g.beginPath(); g.moveTo(-14, -12); g.lineTo(0, 50); g.lineTo(14, -12); g.fill(); }
  // arms
  g.strokeStyle = jacket || shirt; g.lineWidth = 30; g.lineCap = 'round';
  [[-58, armL], [58, armR]].forEach(([sx, a]) => {
    g.beginPath(); g.moveTo(sx, 10); g.lineTo(sx + Math.sin(a) * 95, 10 + Math.cos(a) * 95); g.stroke();
    g.fillStyle = skin; g.beginPath(); g.arc(sx + Math.sin(a) * 102, 10 + Math.cos(a) * 102, 16, 0, Math.PI * 2); g.fill();
  });
  // head
  g.fillStyle = skin; g.beginPath(); g.ellipse(0, -70, 52, 58, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = hair; g.beginPath(); g.ellipse(0, -100, 56, 34, 0, Math.PI, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(-30, -96, 26, 20, -0.4, 0, Math.PI * 2); g.fill();
  // face
  g.fillStyle = '#2b2440';
  if (blink) { g.fillRect(-26, -72, 16, 3); g.fillRect(10, -72, 16, 3); }
  else { g.beginPath(); g.arc(-18, -70, 6, 0, Math.PI * 2); g.arc(18, -70, 6, 0, Math.PI * 2); g.fill(); }
  if (glasses) { g.strokeStyle = '#2b2440'; g.lineWidth = 3; g.strokeRect(-32, -82, 26, 22); g.strokeRect(6, -82, 26, 22); g.beginPath(); g.moveTo(-6, -72); g.lineTo(6, -72); g.stroke(); }
  g.strokeStyle = '#2b2440'; g.lineWidth = 4; g.lineCap = 'round';
  g.beginPath(); g.arc(0, -46, 14, 0.2, Math.PI - 0.2); g.stroke();
  g.restore();
}

/** Re-enactment: three founders in a diner booth sketching the plan on a napkin */
export function diner(g, x, { year = '1993', sketchAt, sign = 'DINER' } = {}) {
  const t = x.T, k = ease(t, x.a, 3.5);
  // camera: start wide, push towards the napkin
  const z = lerp(1, 1.35, ez.p2InOut(clamp((t - (sketchAt ?? x.a + 2)) / 2.4)));
  g.save(); g.translate(W / 2, 760); g.scale(z, z); g.translate(-W / 2, -760);
  // wall, window, neon
  const wall = g.createLinearGradient(0, 0, 0, H); wall.addColorStop(0, '#ffe9dc'); wall.addColorStop(1, '#f6d6c6');
  g.fillStyle = wall; g.fillRect(-300, -300, W + 600, H + 600);
  g.fillStyle = '#2b2a55'; g.beginPath(); g.roundRect(560, 110, 800, 330, 26); g.fill();
  const r = rand(9);
  for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(255,236,180,${0.4 + r() * 0.5})`; g.beginPath(); g.arc(580 + r() * 760, 140 + r() * 280, 1.5 + r() * 2.5, 0, Math.PI * 2); g.fill(); }
  g.strokeStyle = '#f6d6c6'; g.lineWidth = 14; g.beginPath(); g.moveTo(960, 110); g.lineTo(960, 440); g.stroke();
  const flick = (Math.floor(t * 9) % 23 === 0) ? 0.4 : 1;
  g.save(); g.shadowColor = '#c084fc'; g.shadowBlur = 40 * flick;
  text(g, sign, 300, 250, { font: UI.HEAD, weight: 700, size: 92, color: `rgba(168,85,247,${flick})`, align: 'center', spacing: 8 });
  g.restore();
  text(g, year, 1620, 250, { font: UI.HEAD, weight: 700, size: 92, color: 'rgba(255,90,60,0.85)', align: 'center' });
  // booth back
  g.fillStyle = '#c0392b'; g.beginPath(); g.roundRect(300, 470, 1320, 300, 50); g.fill();
  g.fillStyle = '#a93226'; for (let i = 0; i < 6; i++) { g.beginPath(); g.roundRect(330 + i * 215, 500, 180, 240, 30); g.fill(); }
  // three founders
  const sk = sketchAt ?? x.a + 2;
  const draw = ((t - sk) % 0.8) / 0.8;
  person(g, 640, 690, 1.25, t, { shirt: '#4a2a8c', armL: 0.3, armR: -0.5, seed: 2 });
  person(g, 960, 670, 1.3, t, { shirt: '#2b2440', jacket: null, armL: 0.2, armR: t > sk ? -0.9 - Math.sin(draw * Math.PI * 2) * 0.15 : -0.3, seed: 3, glasses: true });
  person(g, 1280, 690, 1.25, t, { shirt: '#1f8a5b', armL: 0.5, armR: -0.2, seed: 5 });
  // table + mugs + napkin
  g.fillStyle = '#ffffff'; g.beginPath(); g.roundRect(380, 830, 1160, 70, 20); g.fill();
  g.fillStyle = '#e6dcff'; g.fillRect(380, 880, 1160, 20);
  [[560, '#ffffff'], [1360, '#ffffff']].forEach(([mx]) => { g.fillStyle = '#fff'; g.strokeStyle = '#d0c8e4'; g.lineWidth = 4; g.beginPath(); g.roundRect(mx - 34, 760, 68, 74, 10); g.fill(); g.stroke(); g.beginPath(); g.arc(mx + 40, 795, 18, -1.2, 1.2); g.stroke(); });
  // napkin with the plan being sketched
  g.save(); g.translate(1010, 832); g.rotate(-0.06);
  g.fillStyle = '#fffdf6'; g.shadowColor = 'rgba(0,0,0,0.12)'; g.shadowBlur = 10; g.fillRect(-120, -70, 240, 140); g.shadowColor = 'transparent';
  const sp = clamp((t - sk) / 3);
  g.strokeStyle = '#4a2a8c'; g.lineWidth = 4; g.lineCap = 'round';
  const seg = (p, a, b) => { if (sp > p) { const q = clamp((sp - p) / 0.25); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(lerp(a[0], b[0], q), lerp(a[1], b[1], q)); g.stroke(); } };
  seg(0, [-80, -40], [-20, -40]); seg(0.1, [-20, -40], [-20, 20]); seg(0.2, [-20, 20], [-80, 20]); seg(0.3, [-80, 20], [-80, -40]);
  seg(0.45, [0, -10], [70, -10]); seg(0.55, [55, -22], [70, -10]); seg(0.6, [55, 2], [70, -10]);
  if (sp > 0.7) text(g, 'GPU', 80, 40, { font: UI.HEAD, weight: 700, size: 26, color: '#4a2a8c', align: 'center', alpha: clamp((sp - 0.7) * 4) });
  g.restore();
  g.restore();
}
