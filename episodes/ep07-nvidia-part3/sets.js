// Episode 7 set pieces: Casanova's Venice, the three masks, the hotel corridor, the empty stage. Night painterly (episode 3 template).
import { W, H, clamp, lerp, rand, text } from '../../pipeline/engine.js';
import { sky, stars, moon, clouds, rain, mist, beam, glow, splashes } from '../../pipeline/scenery.js';
import { jacket } from '../ep05-nvidia-part2/sets.js';

// ---------------------------------------------------------------- 1. Venice canal at night
function palazzo(g, x0, x1, base, top, { seed = 1, side = 1, color = '#1a1430', lit = 0.4, depth = 1 } = {}) {
  const r = rand(seed);
  g.fillStyle = color; g.beginPath(); g.moveTo(x0, base); g.lineTo(x0, top[0]); g.lineTo(x1, top[1]); g.lineTo(x1, base); g.closePath(); g.fill();
  // arched windows (Venetian gothic), warm light inside
  const rows = 4, cols = 6;
  for (let rr = 0; rr < rows; rr++) for (let c = 0; c < cols; c++) {
    const u = (c + 0.5) / cols, x = lerp(x0, x1, u), tt = lerp(top[0], top[1], u), y = lerp(tt + 40 * depth, base - 70 * depth, (rr + 0.3) / rows);
    const w = Math.abs(x1 - x0) / cols * 0.42, h = (base - tt) / rows * 0.5;
    const on = r() < lit;
    g.fillStyle = on ? `rgba(255,${180 + r() * 40},${100 + r() * 40},${0.75 + r() * 0.25})` : 'rgba(30,24,52,0.9)';
    g.beginPath(); g.moveTo(x - w / 2, y + h); g.lineTo(x - w / 2, y); g.quadraticCurveTo(x - w / 2, y - h * 0.45, x, y - h * 0.6); g.quadraticCurveTo(x + w / 2, y - h * 0.45, x + w / 2, y); g.lineTo(x + w / 2, y + h); g.closePath(); g.fill();
    if (on) glow(g, x, y + h * 0.3, w * 2.2, '255,180,110', 0.18);
  }
  // rim light on the canal-side edge
  g.strokeStyle = 'rgba(255,190,140,0.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(side > 0 ? x1 : x0, base); g.lineTo(side > 0 ? x1 : x0, side > 0 ? top[1] : top[0]); g.stroke();
}
function lantern(g, t, x, y, s, seed = 0) {
  const fl = 0.85 + 0.15 * Math.sin(t * 9 + seed * 3) * Math.sin(t * 5.3 + seed);
  g.strokeStyle = '#0c0a16'; g.lineWidth = 6 * s; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 260 * s); g.stroke();
  glow(g, x, y - 20 * s, 180 * s, '255,190,110', 0.55 * fl);
  g.fillStyle = `rgba(255,215,150,${0.95 * fl})`; g.beginPath(); g.moveTo(x - 16 * s, y - 40 * s); g.lineTo(x + 16 * s, y - 40 * s); g.lineTo(x + 11 * s, y); g.lineTo(x - 11 * s, y); g.closePath(); g.fill();
  g.fillStyle = '#0c0a16'; g.fillRect(x - 20 * s, y - 48 * s, 40 * s, 9 * s);
}
function gondola(g, t, x, y, s) {
  const bob = Math.sin(t * 1.3) * 4 * s, tilt = Math.sin(t * 1.3 + 0.6) * 0.015;
  g.save(); g.translate(x, y + bob); g.rotate(tilt); g.scale(s, s);
  g.fillStyle = '#07050d';
  g.beginPath(); g.moveTo(-330, -10); g.quadraticCurveTo(-200, 30, 0, 26); g.quadraticCurveTo(220, 30, 320, -30); g.quadraticCurveTo(350, -70, 330, -110); g.lineTo(318, -105); g.quadraticCurveTo(320, -40, 280, -20); g.quadraticCurveTo(0, 0, -300, -20); g.quadraticCurveTo(-345, -40, -360, -70); g.closePath(); g.fill();
  // ferro (the prow comb)
  g.fillStyle = '#cfc6e8'; g.fillRect(-358, -104, 9, 50); for (let i = 0; i < 6; i++) g.fillRect(-358, -96 + i * 7, -18, 3); g.beginPath(); g.arc(-353, -106, 8, Math.PI, 0); g.fill();
  // gondolier: rim-lit silhouette, rowing slowly (heavy oar = slow inertia)
  const row = Math.sin(t * 0.9) * 0.25;
  g.fillStyle = '#0a0812'; g.beginPath(); g.ellipse(210, -150, 22, 26, 0, 0, Math.PI * 2); g.fill(); g.fillRect(186, -128, 48, 110);
  g.fillStyle = '#0a0812'; g.fillRect(186, -176, 48, 10); g.fillRect(196, -196, 28, 22); // boater hat
  g.strokeStyle = 'rgba(255,200,150,0.6)'; g.lineWidth = 3; g.beginPath(); g.arc(210, -150, 24, -1.2, 0.6); g.stroke();
  g.save(); g.translate(205, -100); g.rotate(0.5 + row); g.strokeStyle = '#0a0812'; g.lineWidth = 8; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 230); g.stroke(); g.restore();
  g.restore();
}
/** Casanova's Venice. tower: 0..1 fades a glass office tower into the canal's reflection */
export function venice(g, t, { tower = 0 } = {}) {
  const hy = 640;
  sky(g, { top: '#07061a', mid: '#1b1640', horizon: '#4a3256', glow: 'rgba(255,160,110,0.25)', hy });
  stars(g, t, { n: 140, maxY: 380, alpha: 0.6, seed: 71 });
  moon(g, 1420, 150, 50);
  clouds(g, t, { y: 170, h: 120, seed: 72, n: 9, scale: 0.75, lx: 1420, ly: 150, speed: 5 });
  // far: the bell tower and dome silhouettes on the horizon (depth occlusion, hazy)
  g.fillStyle = '#231b3e'; g.fillRect(890, 330, 60, 310); g.beginPath(); g.moveTo(880, 330); g.lineTo(920, 250); g.lineTo(960, 330); g.closePath(); g.fill();
  g.beginPath(); g.ellipse(1080, 560, 110, 90, 0, Math.PI, 0); g.fill(); g.fillRect(970, 560, 220, 80); g.fillRect(1072, 440, 16, 40);
  g.fillStyle = 'rgba(255,190,120,0.8)'; g.fillRect(912, 360, 16, 22);
  // mid: palazzi lining both sides, converging on the vanishing point
  palazzo(g, -40, 700, hy, [120, 470], { seed: 3, side: 1, color: '#18122c', lit: 0.45 });
  palazzo(g, 1220, 1960, hy, [470, 80], { seed: 4, side: -1, color: '#1a1430', lit: 0.4 });
  // water: deep gradient, lantern and window reflections as rippled vertical streaks
  const wg = g.createLinearGradient(0, hy, 0, H); wg.addColorStop(0, '#1c1638'); wg.addColorStop(1, '#06050f'); g.fillStyle = wg; g.fillRect(0, hy, W, H - hy);
  const r = rand(11);
  for (let i = 0; i < 70; i++) { const x = r() * W, y = hy + 10 + r() * 380, len = 30 + r() * 120, warm = r() < 0.55; const ph = Math.sin(t * 2 + i) * 6;
    g.strokeStyle = warm ? `rgba(255,190,120,${0.08 + r() * 0.18})` : `rgba(170,160,255,${0.05 + r() * 0.1})`; g.lineWidth = 2 + r() * 4; g.beginPath(); g.moveTo(x + ph, y); g.lineTo(x - ph, y + len * 0.3); g.stroke(); }
  // moon path on the water
  for (let i = 0; i < 26; i++) { const y = hy + 20 + i * 16, w = 30 + i * 6 + Math.sin(t * 2 + i) * 10; g.fillStyle = `rgba(230,225,255,${0.1 - i * 0.003})`; g.fillRect(1420 - w / 2 + Math.sin(t * 1.5 + i * 0.7) * 12, y, w, 3); }
  // the reflection becomes a glass tower (Santa Clara): cool blue grid rippling in the canal
  if (tower > 0) {
    g.save(); g.globalAlpha = tower * 0.55; g.globalCompositeOperation = 'lighter'; const tx = 960, tw = 300;
    const tg = g.createLinearGradient(0, hy, 0, hy + 420); tg.addColorStop(0, 'rgba(90,140,255,0.55)'); tg.addColorStop(1, 'rgba(90,140,255,0)');
    for (let y = hy + 4; y < hy + 420; y += 10) { if (Math.sin(y * 0.37 + t * 3) > 0.6) continue; const off = Math.sin(t * 2.4 + y * 0.05) * 10 * (y - hy) / 420; g.fillStyle = tg; g.fillRect(tx - tw / 2 + off, y, tw, 6); }
    for (let rr = 0; rr < 12; rr++) for (let c = 0; c < 8; c++) if (rand(rr * 8 + c)() < 0.6) { const off = Math.sin(t * 2.4 + rr) * 8 * rr / 12; g.fillStyle = `rgba(190,220,255,${0.5 - rr * 0.035})`; g.fillRect(tx - tw / 2 + 18 + c * 36 + off, hy + 14 + rr * 32, 20, 10); }
    g.restore();
  }
  mist(g, t, { y: hy - 20, h: 120, alpha: 0.25, color: '150,130,190' });
  // near: mooring poles (pali) with candy stripes, lanterns, gondola
  [[220, 0.95], [420, 0.7], [1600, 0.8], [1780, 1.05]].forEach(([x, s], i) => { g.fillStyle = '#0d0a18'; g.fillRect(x - 10 * s, hy - 80 * s, 20 * s, H); for (let k = 0; k < 5; k++) { g.fillStyle = 'rgba(160,60,80,0.6)'; g.fillRect(x - 10 * s, hy - 70 * s + k * 50 * s, 20 * s, 16 * s); } lantern(g, t, x, hy - 120 * s, s, i); });
  gondola(g, t, 900 + Math.sin(t * 0.15) * 60, 860, 1.05);
  // near quay (foreground occlusion) and depth-scaled rain
  g.fillStyle = '#05040b'; g.beginPath(); g.moveTo(0, H); g.lineTo(0, 990); g.lineTo(360, 1010); g.lineTo(380, H); g.closePath(); g.fill();
  rain(g, t, { n: 500, alpha: 0.35 }); splashes(g, t, { y0: 700, y1: H, n: 50 });
}

// ---------------------------------------------------------------- 2. three masks in a dark palazzo hall
export function mask(g, t, x, y, s, { tint = '#f1e9ff', trim = '#d9b45a', feather = '#5a1d4a', blank = false, lit = 1 } = {}) {
  g.save(); g.translate(x, y + Math.sin(t * 0.8 + x) * 3); g.scale(s, s);
  // feathers behind, swaying (light = reacts fast)
  if (!blank) for (let i = 0; i < 5; i++) { const a = -0.9 + i * 0.25 + Math.sin(t * 2.2 + i) * 0.04; g.save(); g.rotate(a); const fg = g.createLinearGradient(0, -40, 0, -260); fg.addColorStop(0, feather); fg.addColorStop(1, 'rgba(120,60,140,0.2)'); g.fillStyle = fg; g.beginPath(); g.ellipse(60, -150, 26, 120, 0.25, 0, Math.PI * 2); g.fill(); g.restore(); }
  // mask body: a half-mask with almond eyes, key light from top-left
  const mg = g.createLinearGradient(-160, -80, 160, 80); mg.addColorStop(0, tint); mg.addColorStop(0.6, blank ? '#cfc8dc' : '#c9bde0'); mg.addColorStop(1, blank ? '#8e88a0' : '#6d5d8e');
  g.fillStyle = mg; g.beginPath();
  g.moveTo(-170, -30); g.quadraticCurveTo(-150, -110, 0, -100); g.quadraticCurveTo(150, -110, 170, -30); g.quadraticCurveTo(160, 60, 60, 70); g.quadraticCurveTo(20, 40, 0, 70); g.quadraticCurveTo(-20, 40, -60, 70); g.quadraticCurveTo(-160, 60, -170, -30); g.closePath(); g.fill();
  // eye holes
  g.fillStyle = '#05040b'; [-1, 1].forEach((sd) => { g.beginPath(); g.ellipse(sd * 72, -18, 46, 22, sd * 0.15, 0, Math.PI * 2); g.fill(); });
  if (!blank) { g.strokeStyle = trim; g.lineWidth = 5; [-1, 1].forEach((sd) => { g.beginPath(); g.ellipse(sd * 72, -18, 52, 28, sd * 0.15, 0, Math.PI * 2); g.stroke(); }); g.beginPath(); g.moveTo(-150, -70); g.quadraticCurveTo(0, -130, 150, -70); g.stroke(); for (let i = 0; i < 7; i++) { g.fillStyle = trim; g.beginPath(); g.arc(-120 + i * 40, 40 + Math.abs(i - 3) * -6, 5, 0, Math.PI * 2); g.fill(); } }
  else text(g, '?', 0, 50, { font: 'Jakarta', weight: 800, size: 80, color: 'rgba(60,50,80,0.5)', align: 'center' });
  // rim light on the right edge
  g.strokeStyle = `rgba(255,210,170,${0.7 * lit})`; g.lineWidth = 4; g.beginPath(); g.moveTo(170, -30); g.quadraticCurveTo(160, 60, 60, 70); g.stroke();
  g.restore();
}
/** labels: text under each mask; lit: 0..1 per mask (spotlight on) */
export function masks(g, t, { lit = [1, 1, 1], labels = ['Reported · NYT', 'Reported · NYT', 'Reported · Reuters'] } = {}) {
  // hall: deep plum walls, columns receding, velvet curtains
  const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#0a0718'); bg.addColorStop(1, '#170d26'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 6; i++) { const x = 140 + i * 330, cg = g.createLinearGradient(x - 40, 0, x + 40, 0); cg.addColorStop(0, '#120c22'); cg.addColorStop(0.5, '#2a1f42'); cg.addColorStop(1, '#0e0a1c'); g.fillStyle = cg; g.fillRect(x - 40, 60, 80, 860); }
  for (const side of [-1, 1]) for (let i = 0; i < 8; i++) { const x0 = side < 0 ? i * 30 : W - (i + 1) * 30, sway = Math.sin(t * 0.6 + i) * 3; const vg = g.createLinearGradient(x0, 0, x0 + 30, 0); vg.addColorStop(0, '#2a0a1e'); vg.addColorStop(0.5, '#5a1636'); vg.addColorStop(1, '#22081a'); g.fillStyle = vg; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 + 31, 0); g.quadraticCurveTo(x0 + 31 + sway, 600, x0 + 31, H); g.lineTo(x0, H); g.closePath(); g.fill(); }
  // floor: polished marble with reflections
  const fg = g.createLinearGradient(0, 860, 0, H); fg.addColorStop(0, '#1d1430'); fg.addColorStop(1, '#07050f'); g.fillStyle = fg; g.fillRect(0, 860, W, H - 860);
  g.strokeStyle = 'rgba(185,162,255,0.08)'; g.lineWidth = 2; for (let i = -10; i < 20; i++) { g.beginPath(); g.moveTo(960 + i * 60, 860); g.lineTo(960 + i * 220, H); g.stroke(); }
  [480, 960, 1440].forEach((x, k) => {
    const L = lit[k] ?? 1;
    if (L > 0) beam(g, t + k, x, -60, Math.PI / 2, { len: 980, spread: 0.12, color: k === 2 ? '200,210,255' : '255,215,170', alpha: 0.32 * L, motes: 40, seed: 30 + k });
    // pedestal
    const pg = g.createLinearGradient(x - 90, 0, x + 90, 0); pg.addColorStop(0, '#1a1428'); pg.addColorStop(0.5, `rgba(${80 + 60 * L},${66 + 50 * L},${100 + 40 * L},1)`); pg.addColorStop(1, '#120e1e');
    g.fillStyle = pg; g.fillRect(x - 80, 640, 160, 240); g.fillRect(x - 110, 620, 220, 30); g.fillRect(x - 110, 860, 220, 26);
    // stand
    g.fillStyle = '#0a0812'; g.fillRect(x - 6, 470, 12, 160);
    g.save(); g.globalAlpha = 0.25 + 0.75 * L; mask(g, t, x, 440, 0.95, { blank: k === 2, lit: L, feather: k === 0 ? '#6a1d4a' : '#3a2a7a', tint: k === 1 ? '#f6e7d8' : '#f1e9ff' }); g.restore();
    // reflection on marble
    glow(g, x, 900, 220, k === 2 ? '200,210,255' : '255,200,150', 0.12 * L);
    // brass plaque
    if (labels[k]) { g.fillStyle = `rgba(150,120,60,${0.5 + 0.5 * L})`; g.beginPath(); g.roundRect(x - 120, 720, 240, 56, 8); g.fill(); text(g, labels[k], x, 757, { font: 'Jakarta', weight: 700, size: 22, color: '#1d1408', align: 'center' }); }
  });
  mist(g, t, { y: 860, h: 120, alpha: 0.18, color: '150,120,200' });
}

// ---------------------------------------------------------------- 3. hotel corridor, a phone recording
export function corridor(g, t, { nda = 0, rec = 1 } = {}) {
  const vx = 960, vy = 470;
  g.fillStyle = '#0c0812'; g.fillRect(0, 0, W, H);
  // walls, ceiling, carpet in one-point perspective
  const wall = (pts, c0, c1) => { const gg = g.createLinearGradient(pts[0][0], 0, vx, 0); gg.addColorStop(0, c0); gg.addColorStop(1, c1); g.fillStyle = gg; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); };
  wall([[0, 0], [vx - 120, vy - 90], [vx - 120, vy + 90], [0, H]], '#2a1a26', '#120c16');
  wall([[W, 0], [vx + 120, vy - 90], [vx + 120, vy + 90], [W, H]], '#2a1a26', '#120c16');
  g.fillStyle = '#0e0a14'; g.beginPath(); g.moveTo(0, 0); g.lineTo(W, 0); g.lineTo(vx + 120, vy - 90); g.lineTo(vx - 120, vy - 90); g.closePath(); g.fill();
  const cg = g.createLinearGradient(0, vy, 0, H); cg.addColorStop(0, '#2a0e1a'); cg.addColorStop(1, '#4a1426'); g.fillStyle = cg; g.beginPath(); g.moveTo(0, H); g.lineTo(vx - 120, vy + 90); g.lineTo(vx + 120, vy + 90); g.lineTo(W, H); g.closePath(); g.fill();
  // carpet pattern stripes
  for (let i = 1; i < 14; i++) { const u = Math.pow(i / 14, 1.8), y = lerp(vy + 90, H, u), hw = lerp(120, 960, u); g.strokeStyle = 'rgba(220,170,90,0.12)'; g.lineWidth = lerp(1, 6, u); g.beginPath(); g.moveTo(vx - hw, y); g.lineTo(vx + hw, y); g.stroke(); }
  // doors and warm wall sconces (exponential falloff pools)
  for (let i = 0; i < 6; i++) { const u = 1 - Math.pow(0.68, i + 1), s = 1 - u;
    for (const sd of [-1, 1]) { const x = lerp(sd < 0 ? 60 : W - 60, vx + sd * 120, u), top = lerp(160, vy - 60, u), bot = lerp(H - 60, vy + 80, u), dw = 150 * s;
      g.fillStyle = '#1a0f16'; g.beginPath(); g.moveTo(x, top); g.lineTo(x + sd * -dw, top + 20 * s * sd * 0); g.lineTo(x + sd * -dw, bot); g.lineTo(x, bot); g.closePath(); g.fill();
      const sx = x + sd * -dw * 1.6, sy = lerp(300, vy - 30, u); glow(g, sx, sy, 260 * s + 30, '255,180,110', 0.4); g.fillStyle = 'rgba(255,220,170,0.95)'; g.beginPath(); g.arc(sx, sy, 10 * s + 2, 0, Math.PI * 2); g.fill(); } }
  // end of corridor: a security silhouette, offering a paper
  const sx = vx, sb = vy + 86; glow(g, vx, vy, 220, '255,200,150', 0.3);
  g.fillStyle = '#06040a'; g.beginPath(); g.ellipse(sx, sb - 128, 13, 16, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.moveTo(sx - 28, sb - 108); g.lineTo(sx + 28, sb - 108); g.lineTo(sx + 24, sb); g.lineTo(sx - 24, sb); g.closePath(); g.fill();
  if (nda > 0) { g.save(); g.globalAlpha = nda; g.translate(sx + 34, sb - 70); g.rotate(-0.2); g.fillStyle = '#f2ece0'; g.fillRect(-14, -18, 28, 36); g.restore(); glow(g, sx + 34, sb - 70, 40, '255,240,210', 0.4 * nda); }
  // foreground: a hand holding a phone, recording (screen shows the corridor, blurred, with two silhouettes)
  g.save(); g.translate(1400, 760); g.rotate(-0.08);
  g.fillStyle = '#14101c'; g.beginPath(); g.roundRect(-150, -300, 300, 600, 40); g.fill(); g.strokeStyle = 'rgba(255,200,160,0.45)'; g.lineWidth = 3; g.stroke();
  const sg = g.createLinearGradient(0, -280, 0, 280); sg.addColorStop(0, '#3a2232'); sg.addColorStop(1, '#5a2a36'); g.fillStyle = sg; g.beginPath(); g.roundRect(-136, -284, 272, 568, 30); g.fill();
  g.filter = 'blur(3px)'; g.fillStyle = 'rgba(20,10,20,0.9)'; [[-30, 40], [25, 44]].forEach(([dx, sc]) => { g.beginPath(); g.ellipse(dx, -40, 22, 26, 0, 0, Math.PI * 2); g.fill(); g.fillRect(dx - 36, -14, 72, 200); }); g.filter = 'none';
  glow(g, 0, -60, 160, '255,190,140', 0.25);
  if (rec && Math.floor(t * 1.6) % 2 === 0) { g.fillStyle = '#ff3b4e'; g.beginPath(); g.arc(-96, -240, 10, 0, Math.PI * 2); g.fill(); }
  text(g, 'REC', -76, -232, { font: 'Jakarta', weight: 800, size: 24, color: '#fff' });
  text(g, `00:0${Math.floor(t % 10)}`, 70, -232, { font: 'Jakarta', weight: 700, size: 22, color: '#fff', align: 'center' });
  // the hand (silhouette, rim-lit)
  g.fillStyle = '#0a0710'; g.beginPath(); g.moveTo(-170, 140); g.quadraticCurveTo(-200, 300, -120, 420); g.lineTo(120, 420); g.quadraticCurveTo(170, 300, 160, 200); g.lineTo(150, 120); g.quadraticCurveTo(140, 90, 120, 120); g.lineTo(110, 220); g.lineTo(-140, 220); g.closePath(); g.fill();
  [[-170, 60], [-178, 110], [-174, 160]].forEach(([fx, fy]) => { g.beginPath(); g.roundRect(fx, fy, 50, 40, 20); g.fill(); });
  g.strokeStyle = 'rgba(255,190,140,0.4)'; g.lineWidth = 3; g.beginPath(); g.moveTo(-180, 70); g.quadraticCurveTo(-200, 300, -120, 420); g.stroke();
  g.restore();
}

// ---------------------------------------------------------------- 4. the empty keynote stage
export function emptyStage(g, t, { screen = 'Q3 EARNINGS · TUESDAY' } = {}) {
  g.fillStyle = '#05040c'; g.fillRect(0, 0, W, H);
  // giant screen, cool green-tinted glow, nobody in front of it
  const sx = 360, sy = 90, sw = 1200, sh = 520;
  glow(g, 960, 350, 900, '118,185,0', 0.12);
  const scg = g.createLinearGradient(0, sy, 0, sy + sh); scg.addColorStop(0, '#0d1a12'); scg.addColorStop(1, '#07100b'); g.fillStyle = scg; g.fillRect(sx, sy, sw, sh);
  g.strokeStyle = 'rgba(118,185,0,0.35)'; g.lineWidth = 3; g.strokeRect(sx, sy, sw, sh);
  for (let i = 0; i < 30; i++) { const r = rand(i + 50); g.strokeStyle = `rgba(118,185,0,${0.05 + r() * 0.08})`; g.lineWidth = 2; g.beginPath(); g.moveTo(sx + r() * sw, sy); g.lineTo(sx + r() * sw, sy + sh); g.stroke(); }
  text(g, screen, 960, 380, { font: 'Jakarta', weight: 800, size: 70, color: 'rgba(200,240,160,0.85)', align: 'center', spacing: 6 });
  // stage floor with a glossy edge
  const st = g.createLinearGradient(0, 680, 0, 900); st.addColorStop(0, '#1a1626'); st.addColorStop(1, '#0b0912'); g.fillStyle = st; g.fillRect(0, 680, W, 220);
  g.fillStyle = 'rgba(200,190,255,0.25)'; g.fillRect(0, 680, W, 3);
  // the spotlight: volumetric cone onto a lone chair with the leather jacket
  beam(g, t, 960, -80, Math.PI / 2, { len: 900, spread: 0.11, color: '255,236,210', alpha: 0.4, motes: 70, seed: 81 });
  g.save(); g.globalCompositeOperation = 'lighter'; const pool = g.createRadialGradient(960, 770, 10, 960, 770, 260); pool.addColorStop(0, 'rgba(255,236,210,0.35)'); pool.addColorStop(1, 'rgba(255,236,210,0)'); g.fillStyle = pool; g.beginPath(); g.ellipse(960, 770, 280, 60, 0, 0, Math.PI * 2); g.fill(); g.restore();
  jacket(g, t, 960, 770, 0.62, { lit: 1 });
  g.fillStyle = '#0a0812'; g.fillRect(902, 780, 10, 70); g.fillRect(1008, 780, 10, 70);
  // audience: rows of seat backs (near = big, dark), a few phone screens glowing
  for (let row = 0; row < 3; row++) { const y = 930 + row * 60, s = 1 + row * 0.35, r = rand(row + 9);
    for (let x = -40 + row * 30; x < W + 60; x += 120 * s) { g.fillStyle = `rgb(${8 - row * 2},${6 - row * 2},${16 - row * 4})`; g.beginPath(); g.roundRect(x, y, 100 * s, 120 * s, 18 * s); g.fill(); if (r() < 0.08) { glow(g, x + 50 * s, y - 10, 50, '160,200,255', 0.4); } } }
}
