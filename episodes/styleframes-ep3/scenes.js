// Episode 3 style frames: four detailed set pieces (Asunción at night, the tower going dark,
// the march on Congress, the domino at dawn). Each is animated (pure function of time).
import { W, H, clamp, lerp, rand, text } from '../../pipeline/engine.js';
import { sky, stars, moon, clouds, skyline, rain, splashes, mist, beam, glow, reflect, nightFinish, crowd, flagCloth, fire, buf } from '../../pipeline/scenery.js';

export const look = { finish: nightFinish };
export const hits = [];
const ez = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);

// ---------------------------------------------------------------- 1. 3:24 a.m.
function s1(g, s) {
  const t = s.t + 2;
  const win = [300, 110, 980, 690];
  // the city outside
  sky(g, { top: '#06061c', mid: '#17163f', horizon: '#3b2d5e', hy: 720 });
  stars(g, t, { n: 120, maxY: 420, alpha: 0.6 });
  moon(g, 470, 210, 40, { halo: 0.3 });
  clouds(g, t, { y: 200, h: 120, seed: 11, n: 10, scale: 0.6, alpha: 0.7, lx: 470, ly: 210, speed: 4 });
  skyline(g, t, { base: 690, seed: 21, depth: 0.15, color: '#221f48', lit: 0.18, tall: 0.8, fog: 'rgba(90,70,130,0.45)' });
  clouds(g, t, { y: 300, h: 120, seed: 12, n: 9, scale: 0.75, lx: 470, ly: 210, speed: 7 });
  skyline(g, t, { base: 770, seed: 22, depth: 0.55, color: '#120f2b', lit: 0.28, minW: 70, maxW: 180, fog: 'rgba(70,55,110,0.35)' });
  mist(g, t, { y: 700, h: 140, alpha: 0.18 });
  rain(g, t, { n: 500, alpha: 0.4, rect: win });
  // the room: walls with a window hole
  g.save();
  const wall = g.createLinearGradient(0, 0, W, 0); wall.addColorStop(0, '#0e0b1d'); wall.addColorStop(0.7, '#16112a'); wall.addColorStop(1, '#1d1530');
  g.fillStyle = wall; g.beginPath(); g.rect(0, 0, W, H); g.rect(win[0], win[1], win[2], win[3]); g.fill('evenodd');
  // moonlight spilling onto the wall and floor through the window
  g.globalCompositeOperation = 'lighter';
  const spill = g.createLinearGradient(win[0], win[1] + win[3], win[0] + 300, H);
  spill.addColorStop(0, 'rgba(120,110,200,0.18)'); spill.addColorStop(1, 'rgba(120,110,200,0)');
  g.fillStyle = spill; g.beginPath(); g.moveTo(win[0], win[1] + win[3]); g.lineTo(win[0] + win[2], win[1] + win[3]); g.lineTo(win[0] + win[2] + 260, H); g.lineTo(win[0] + 200, H); g.closePath(); g.fill();
  g.globalCompositeOperation = 'source-over';
  g.restore();
  // glass: droplets and trickles
  const r = rand(4);
  g.save(); g.beginPath(); g.rect(...win); g.clip();
  for (let i = 0; i < 260; i++) {
    const x = win[0] + r() * win[2], y0 = win[1] + r() * win[3], sz = 1.5 + r() * 4, slide = r() < 0.12 ? ((t * (20 + r() * 40)) % win[3]) : 0, y = y0 + slide;
    g.fillStyle = 'rgba(190,185,255,0.18)'; g.beginPath(); g.arc(x, y, sz, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.55)'; g.fillRect(x - sz * 0.3, y - sz * 0.5, sz * 0.35, sz * 0.35);
    if (slide) { g.strokeStyle = 'rgba(190,185,255,0.12)'; g.lineWidth = sz * 0.7; g.beginPath(); g.moveTo(x, y - 60); g.lineTo(x, y); g.stroke(); }
  }
  g.restore();
  // window frame with a cool rim on the inner edges
  g.fillStyle = '#1a1430';
  g.fillRect(win[0] - 24, win[1] - 24, win[2] + 48, 24); g.fillRect(win[0] - 24, win[1] + win[3], win[2] + 48, 34);
  g.fillRect(win[0] - 24, win[1], 24, win[3]); g.fillRect(win[0] + win[2], win[1], 24, win[3]);
  g.fillRect(win[0] + win[2] / 2 - 9, win[1], 18, win[3]); g.fillRect(win[0], win[1] + win[3] * 0.42 - 9, win[2], 18);
  g.fillStyle = 'rgba(170,160,255,0.35)';
  g.fillRect(win[0], win[1] + win[3], win[2], 3); g.fillRect(win[0] + win[2] / 2 - 9, win[1], 2, win[3]);
  // curtains with folds, rim-lit by the window
  [[win[0] - 200, 230, 1], [win[0] + win[2] - 30, 240, -1]].forEach(([cx, cw, side]) => {
    for (let i = 0; i < 9; i++) {
      const fx = cx + (i / 9) * cw, sway = Math.sin(t * 0.6 + i) * 3;
      const fg = g.createLinearGradient(fx, 0, fx + cw / 9, 0);
      fg.addColorStop(0, '#231a3d'); fg.addColorStop(0.5, '#3a2b5e'); fg.addColorStop(1, '#1a132e');
      g.fillStyle = fg; g.beginPath(); g.moveTo(fx, 60); g.lineTo(fx + cw / 9 + 1, 60); g.quadraticCurveTo(fx + cw / 9 + sway, 600, fx + cw / 9 + sway * 2 + side * i * 2, 940); g.lineTo(fx + sway * 2 + side * i * 2, 940); g.closePath(); g.fill();
    }
    g.fillStyle = 'rgba(180,170,255,0.35)'; g.fillRect(side > 0 ? cx + cw - 3 : cx, 60, 3, 880);
  });
  g.fillStyle = '#2a2140'; g.fillRect(win[0] - 260, 50, win[2] + 560, 12);
  // bed edge, lower left, catching moonlight
  const bed = g.createLinearGradient(0, 860, 0, H); bed.addColorStop(0, '#3a3264'); bed.addColorStop(1, '#16112b');
  g.fillStyle = bed; g.beginPath(); g.moveTo(0, 900); g.quadraticCurveTo(400, 860, 760, 905); g.lineTo(820, H); g.lineTo(0, H); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(200,190,255,0.35)'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 900); g.quadraticCurveTo(400, 860, 760, 905); g.stroke();
  for (let i = 0; i < 5; i++) { g.strokeStyle = 'rgba(10,8,25,0.35)'; g.lineWidth = 6; g.beginPath(); g.moveTo(80 + i * 140, 905); g.quadraticCurveTo(120 + i * 140, 990, 60 + i * 150, H); g.stroke(); }
  // bedside table
  const tt = g.createLinearGradient(0, 830, 0, H); tt.addColorStop(0, '#2b2142'); tt.addColorStop(1, '#120d22');
  g.fillStyle = '#3a2d55'; g.beginPath(); g.moveTo(1180, 830); g.lineTo(1920, 830); g.lineTo(1920, 870); g.lineTo(1150, 870); g.closePath(); g.fill();
  g.fillStyle = tt; g.fillRect(1150, 870, 770, 220);
  g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(1150, 960, 770, 4);
  g.fillStyle = '#c9a24a'; g.beginPath(); g.arc(1500, 1000, 7, 0, Math.PI * 2); g.fill();
  // alarm clock: the warm key
  g.fillStyle = '#1a1426'; g.beginPath(); g.roundRect(1230, 750, 190, 90, 18); g.fill();
  g.fillStyle = '#2b2140'; g.beginPath(); g.roundRect(1244, 762, 162, 64, 10); g.fill();
  text(g, '03:24', 1325, 812, { font: 'Jakarta', weight: 700, size: 48, color: '#ffb347', align: 'center' });
  glow(g, 1325, 795, 260, '255,170,80', 0.28);
  // phone on a stand: the cool light
  const buzz = Math.sin(t * 60) * (Math.floor(t * 2) % 3 === 0 ? 2.5 : 0);
  g.save(); g.translate(1640 + buzz, 640); g.rotate(-0.06);
  g.fillStyle = '#0a0812'; g.beginPath(); g.roundRect(-118, -230, 236, 460, 34); g.fill();
  const sc = g.createLinearGradient(0, -215, 0, 215); sc.addColorStop(0, '#3b2a7a'); sc.addColorStop(1, '#1d1442');
  g.fillStyle = sc; g.beginPath(); g.roundRect(-106, -218, 212, 436, 26); g.fill();
  text(g, '3:24', 0, -110, { font: 'Jakarta', weight: 300, size: 78, color: '#f3efff', align: 'center' });
  text(g, 'Monday, 2 November', 0, -66, { font: 'Inter', weight: 600, size: 15, color: '#cfc6ff', align: 'center' });
  g.fillStyle = 'rgba(255,255,255,0.92)'; g.beginPath(); g.roundRect(-96, -30, 192, 112, 16); g.fill();
  g.fillStyle = '#4a2a8c'; g.beginPath(); g.roundRect(-84, -18, 30, 30, 8); g.fill();
  text(g, 'BCP', -69, 2, { font: 'Jakarta', weight: 700, size: 11, color: '#fff', align: 'center' });
  text(g, 'Banco Central del Paraguay', -46, 0, { font: 'Inter', weight: 600, size: 11, color: '#1d1b29' });
  text(g, 'Comunicado oficial · ahora', -84, 34, { font: 'Inter', weight: 600, size: 12, color: '#1d1b29' });
  g.fillStyle = '#d9d3e8'; g.fillRect(-84, 46, 160, 7); g.fillRect(-84, 60, 120, 7);
  g.fillStyle = '#d0c8ff'; g.beginPath(); g.roundRect(-40, 196, 80, 5, 3); g.fill();
  g.restore();
  g.fillStyle = '#241b38'; g.beginPath(); g.moveTo(1560, 860); g.lineTo(1720, 860); g.lineTo(1700, 830); g.lineTo(1580, 830); g.closePath(); g.fill();
  glow(g, 1640, 640, 520, '150,130,255', 0.32);
  // glass of water catching both lights
  g.fillStyle = 'rgba(200,200,255,0.12)'; g.beginPath(); g.moveTo(1460, 760); g.lineTo(1520, 760); g.lineTo(1512, 850); g.lineTo(1468, 850); g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(1468, 770, 3, 70);
  g.fillStyle = 'rgba(255,180,90,0.5)'; g.fillRect(1508, 780, 2, 50);
}

// ---------------------------------------------------------------- 2. the tower goes dark
function s2(g, s) {
  const t = s.t + 1.5;
  sky(g, { top: '#05051a', mid: '#141238', horizon: '#33284f', hy: 840 });
  stars(g, t, { n: 90, maxY: 380, alpha: 0.5 });
  moon(g, 1560, 190, 44);
  clouds(g, t, { y: 220, h: 140, seed: 31, n: 14, scale: 0.8, lx: 1560, ly: 190, speed: 5 });
  skyline(g, t, { base: 840, seed: 41, depth: 0.2, color: '#1f1c44', lit: 0.2, tall: 0.9, fog: 'rgba(80,65,125,0.5)' });
  // the tower
  const x0 = 720, x1 = 1120, x2 = 1260, top = 110, base = 880, floors = 34, rows = (base - top - 60) / floors;
  const off = clamp((t - 0.8) / 9.5) * floors; // floors gone dark from the top
  // side face
  g.fillStyle = '#0d0c22'; g.beginPath(); g.moveTo(x1, top + 30); g.lineTo(x2, top + 70); g.lineTo(x2, base); g.lineTo(x1, base); g.closePath(); g.fill();
  // front face: dark glass with a sky reflection gradient
  const fg = g.createLinearGradient(x0, 0, x1, 0); fg.addColorStop(0, '#1d1a45'); fg.addColorStop(1, '#141233');
  g.fillStyle = fg; g.fillRect(x0, top, x1 - x0, base - top);
  // windows
  for (let f = 0; f < floors; f++) {
    const y = top + 60 + f * rows, lit = f >= off;
    const edge = Math.abs(f - off) < 1 ? (Math.floor(t * 20) % 2 ? 0.4 : 1) : 1;
    for (let c = 0; c < 12; c++) {
      const on = lit && rand(f * 13 + c)() < 0.82;
      g.fillStyle = on ? `rgba(255,${200 + ((f * c) % 40)},${140 + ((f + c) % 50)},${0.85 * edge})` : 'rgba(40,36,80,0.6)';
      g.fillRect(x0 + 14 + c * 32, y, 24, rows * 0.62);
    }
    for (let c = 0; c < 4; c++) {
      const on = lit && rand(f * 17 + c + 99)() < 0.7;
      g.fillStyle = on ? 'rgba(220,170,120,0.6)' : 'rgba(25,22,55,0.7)';
      const sx = x1 + 10 + c * 34, skew = ((sx - x1) / (x2 - x1)) * 40;
      g.fillRect(sx, y + skew * 0.3, 24, rows * 0.6);
    }
  }
  // mullions + rim light from the moon on the right edge
  g.fillStyle = 'rgba(10,8,30,0.6)'; for (let c = 0; c <= 12; c++) g.fillRect(x0 + 8 + c * 32, top, 4, base - top);
  g.fillStyle = 'rgba(210,200,255,0.8)'; g.fillRect(x1 - 2, top, 3, base - top);
  g.fillStyle = 'rgba(210,200,255,0.4)'; g.beginPath(); g.moveTo(x1, top + 30); g.lineTo(x2, top + 70); g.lineTo(x2, top + 74); g.lineTo(x1, top + 34); g.closePath(); g.fill();
  // crown + sign
  g.fillStyle = '#0d0c22'; g.fillRect(x0 - 10, top - 20, x1 - x0 + 20, 30);
  const signOn = off < 1.5 ? 1 : (Math.floor(t * 7) % 5 === 0 ? 0.6 : 0);
  if (signOn > 0) glow(g, (x0 + x1) / 2, top - 70, 300, '120,255,210', 0.35 * signOn);
  text(g, 'ueno', (x0 + x1) / 2, top - 40, { font: 'Jakarta', weight: 800, size: 96, color: signOn > 0 ? `rgba(160,255,225,${signOn})` : 'rgba(60,70,90,0.9)', align: 'center' });
  if (Math.floor(t * 1.2) % 2 === 0) { g.fillStyle = '#ff3b3b'; g.beginPath(); g.arc(x1 - 20, top - 30, 7, 0, Math.PI * 2); g.fill(); glow(g, x1 - 20, top - 30, 80, '255,60,60', 0.6); }
  // nearer buildings either side
  skyline(g, t, { base: 900, seed: 42, depth: 0.7, color: '#0c0a20', lit: 0.25, minW: 120, maxW: 220, tall: 0.75, fog: 'rgba(60,50,100,0.3)', towers: [] });
  // street + entrance
  g.fillStyle = '#0a0918'; g.fillRect(0, 880, W, 200);
  g.fillStyle = '#16132e'; g.fillRect(x0 + 80, 760, 240, 120);
  g.fillStyle = 'rgba(200,190,255,0.25)'; g.fillRect(x0 + 90, 770, 105, 110); g.fillRect(x0 + 205, 770, 105, 110);
  g.fillStyle = '#f3efe6'; g.fillRect(x0 + 140, 805, 120, 34);
  text(g, 'CERRADO', x0 + 200, 830, { font: 'Jakarta', weight: 800, size: 22, color: '#e2412e', align: 'center' });
  // street lamps with volumetric cones
  [[300, 560], [1640, 560]].forEach(([lx, ly]) => {
    g.fillStyle = '#0a0918'; g.fillRect(lx - 4, ly, 8, 880 - ly); g.fillRect(lx - 30, ly - 6, 60, 10);
    beam(g, t, lx, ly + 6, Math.PI / 2, { len: 360, spread: 0.45, color: '255,205,150', alpha: 0.32, motes: 50, seed: lx });
    glow(g, lx, ly + 4, 60, '255,210,160', 0.9);
  });
  // people waiting with umbrellas
  [[600, 0], [670, 1], [1240, 2], [1330, 3]].forEach(([px, k]) => {
    const bob = Math.sin(t * 2 + k) * 2;
    g.fillStyle = '#05040d'; g.beginPath(); g.arc(px, 812 + bob, 12, 0, Math.PI * 2); g.fill(); g.fillRect(px - 16, 822 + bob, 32, 58);
    g.fillStyle = ['#3b2a7a', '#5a1f2e', '#1f3b4a', '#2b2b2b'][k]; g.beginPath(); g.arc(px, 800 + bob, 40, Math.PI, 0); g.fill();
    g.strokeStyle = 'rgba(200,190,255,0.4)'; g.lineWidth = 2; g.beginPath(); g.arc(px, 800 + bob, 40, Math.PI * 1.1, Math.PI * 1.6); g.stroke();
  });
  mist(g, t, { y: 870, h: 120, alpha: 0.22 });
  reflect(g, t, 880, 200, { alpha: 0.5 });
  rain(g, t, { n: 900, alpha: 0.45 });
  splashes(g, t, { y0: 900, y1: 1075, n: 70 });
}

// ---------------------------------------------------------------- 3. the march on Congress
function s3(g, s) {
  const t = s.t + 2;
  sky(g, { top: '#08061a', mid: '#1d1336', horizon: '#5a2a3a', glow: 'rgba(255,120,60,0.35)', hy: 760 });
  stars(g, t, { n: 60, maxY: 300, alpha: 0.4 });
  clouds(g, t, { y: 170, h: 120, seed: 51, n: 12, scale: 0.8, body: '#2a1d3f', shade: '#160f26', rim: 'rgba(255,150,100,0.55)', lx: 1600, ly: 900, speed: 4 });
  // Congress: a modern glass-fronted building
  const bx = 360, bw = 1200, by = 380, bh = 330;
  g.fillStyle = '#16122c'; g.fillRect(bx - 40, by - 30, bw + 80, 34);
  g.fillStyle = '#1d1838'; g.fillRect(bx, by, bw, bh);
  const glass = g.createLinearGradient(0, by, 0, by + bh); glass.addColorStop(0, '#2a2858'); glass.addColorStop(1, '#151330');
  g.fillStyle = glass; g.fillRect(bx, by, bw, bh);
  for (let c = 0; c < 60; c++) for (let rr = 0; rr < 10; rr++) {
    const v = rand(c * 31 + rr * 7)();
    const col = v < 0.35 ? `rgba(255,214,160,${0.35 + v})` : v < 0.55 ? `rgba(170,190,255,${0.3 + v * 0.4})` : 'rgba(30,28,70,0.6)';
    g.fillStyle = col; g.fillRect(bx + 6 + c * 19.9, by + 8 + rr * 32, 15, 26);
  }
  g.fillStyle = 'rgba(10,8,25,0.7)'; for (let c = 0; c <= 12; c++) g.fillRect(bx + c * 100 - 3, by, 6, bh);
  g.fillStyle = 'rgba(10,8,25,0.6)'; g.fillRect(bx, by + bh * 0.5 - 3, bw, 6);
  g.fillStyle = 'rgba(255,170,120,0.35)'; g.fillRect(bx + bw - 3, by, 3, bh);
  // fire light washing the right side of the facade
  g.save(); g.globalCompositeOperation = 'lighter';
  const fw = g.createRadialGradient(1560, 900, 50, 1560, 900, 900); fw.addColorStop(0, 'rgba(255,110,50,0.25)'); fw.addColorStop(1, 'rgba(255,110,50,0)');
  g.fillStyle = fw; g.fillRect(bx, by, bw, bh); g.restore();
  g.fillStyle = '#2a2448'; g.fillRect(bx - 60, by + bh, bw + 120, 26);
  text(g, 'CONGRESO NACIONAL', bx + bw / 2, by - 6, { font: 'Jakarta', weight: 700, size: 22, color: 'rgba(230,225,255,0.7)', align: 'center', spacing: 8 });
  // flag on the roof
  g.strokeStyle = '#ddd'; g.lineWidth = 4; g.beginPath(); g.moveTo(bx + bw / 2, by - 30); g.lineTo(bx + bw / 2, by - 190); g.stroke();
  flagCloth(g, t, bx + bw / 2, by - 186, 130, 78, 2);
  // police lights sweeping
  const ph = t * 2.2;
  [[180, 760, '255,40,60'], [260, 760, '60,90,255']].forEach(([px, py, col], k) => {
    const a = (k ? Math.PI : 0) + ph;
    beam(g, t, px, py, -Math.PI / 2 + Math.sin(a) * 0.9, { len: 700, spread: 0.12, color: col, alpha: 0.18 * (0.6 + 0.4 * Math.sin(a * 2)), motes: 0 });
    glow(g, px, py, 120, col, 0.5 + 0.4 * Math.sin(a * 3));
  });
  mist(g, t, { y: 720, h: 200, color: '90,60,90', alpha: 0.3 });
  // crowd in three depth layers
  crowd(g, t, { y: 800, n: 170, depth: 0.15, color: '#1a1230', seed: 61, rim: null });
  crowd(g, t, { y: 900, n: 70, depth: 0.5, color: '#110c22', seed: 62, flags: 3, signs: [{ x: 640, w: 330, h: 120, size: 34, text: '¡DEVUELVAN|NUESTRO DINERO!' }, { x: 1180, w: 220, h: 90, size: 40, text: 'JUSTICIA', color: '#ffd166' }], rimSide: 1 });
  // the barricade fire
  g.fillStyle = '#120a10';
  for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(1560 + (i - 1.5) * 70, 975 - (i % 2) * 20, 60, 26, 0, 0, Math.PI * 2); g.fill(); }
  fire(g, t, 1560, 960, 260);
  crowd(g, t, { y: 1150, n: 20, depth: 0.95, color: '#06040c', seed: 63, rim: 'rgba(255,140,70,0.75)', rimSide: 1 });
}

// ---------------------------------------------------------------- 4. the domino (dawn)
function s4(g, s) {
  const t = s.t + 1.6;
  const gr = g.createLinearGradient(0, 0, 0, 860);
  gr.addColorStop(0, '#2a1d55'); gr.addColorStop(0.55, '#a8507a'); gr.addColorStop(1, '#ffb07a');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  glow(g, 300, 860, 700, '255,190,120', 0.5);
  clouds(g, t, { y: 260, h: 110, seed: 71, n: 10, scale: 0.7, body: '#7a4a7a', shade: '#4a2d5f', rim: 'rgba(255,210,160,0.9)', lx: 300, ly: 860, speed: 3, speckle: false });
  skyline(g, t, { base: 860, seed: 81, depth: 0.15, color: '#5a3a6a', lit: 0.05, tall: 0.7, fog: 'rgba(255,170,130,0.35)' });
  // ground with long shadows
  const gg = g.createLinearGradient(0, 860, 0, H); gg.addColorStop(0, '#3a2440'); gg.addColorStop(1, '#1d1228');
  g.fillStyle = gg; g.fillRect(0, 860, W, 220);
  // the palace (Palacio de López, stylised): white, columns, central tower, flag
  const px = 1180, pw = 620, pb = 860;
  const palTilt = clamp((t - 6.4) / 1.2) * 0.12;
  g.save(); g.translate(px + pw, pb); g.rotate(palTilt); g.translate(-(px + pw), -pb);
  const pal = g.createLinearGradient(px, 0, px + pw, 0); pal.addColorStop(0, '#fff3e6'); pal.addColorStop(1, '#d9c6c8');
  g.fillStyle = pal; g.fillRect(px, pb - 220, pw, 220);
  g.fillRect(px + pw / 2 - 70, pb - 380, 140, 170);
  g.beginPath(); g.moveTo(px + pw / 2 - 90, pb - 380); g.lineTo(px + pw / 2, pb - 450); g.lineTo(px + pw / 2 + 90, pb - 380); g.closePath(); g.fill();
  g.fillStyle = '#c9b3b8';
  for (let i = 0; i < 12; i++) { g.fillRect(px + 20 + i * 50, pb - 200, 16, 190); }
  g.fillStyle = 'rgba(120,80,110,0.55)';
  for (let i = 0; i < 11; i++) { g.beginPath(); g.moveTo(px + 42 + i * 50, pb - 120); g.lineTo(px + 42 + i * 50, pb - 160); g.arc(px + 54 + i * 50, pb - 160, 12, Math.PI, 0); g.lineTo(px + 66 + i * 50, pb - 120); g.closePath(); g.fill(); }
  // upper storey balustrade, cornice, lit windows, lawn
  g.fillStyle = '#efe0d6'; g.fillRect(px - 10, pb - 230, pw + 20, 14);
  for (let i = 0; i < 40; i++) { g.fillStyle = '#d8c6c4'; g.fillRect(px + 4 + i * 15.4, pb - 246, 6, 16); }
  g.fillStyle = '#efe0d6'; g.fillRect(px - 6, pb - 250, pw + 12, 6);
  for (let i = 0; i < 11; i++) if (rand(i + 5)() < 0.4) { g.fillStyle = 'rgba(255,200,120,0.75)'; g.fillRect(px + 46 + i * 50, pb - 116, 16, 30); }
  g.fillStyle = 'rgba(80,50,90,0.35)'; g.fillRect(px + pw / 2 - 70, pb - 380, 18, 170);
  g.fillStyle = 'rgba(255,220,180,0.7)'; g.fillRect(px, pb - 222, 4, 222);
  g.fillStyle = '#3c5a3a'; g.fillRect(px - 60, pb, pw + 120, 14);
  g.strokeStyle = '#ccc'; g.lineWidth = 3; g.beginPath(); g.moveTo(px + pw / 2, pb - 450); g.lineTo(px + pw / 2, pb - 560); g.stroke();
  flagCloth(g, t, px + pw / 2, pb - 558, 90, 54, 4);
  g.restore();
  // the Ueno tower, falling toward the palace (pivot at its bottom-right corner)
  const fall = ez(clamp((t - 1) / 4.6));
  const ang = fall * 0.62;
  const tx0 = 560, tx1 = 860, ttop = 140;
  g.save(); g.translate(tx1, pb); g.rotate(ang); g.translate(-tx1, -pb);
  const tg = g.createLinearGradient(tx0, ttop, tx1, pb); tg.addColorStop(0, '#2a2050'); tg.addColorStop(0.5, '#4a2f62'); tg.addColorStop(1, '#1a1433');
  g.fillStyle = tg; g.fillRect(tx0, ttop, tx1 - tx0, pb - ttop);
  // dawn reflected in the glass
  const rg = g.createLinearGradient(tx0, 0, tx1, 0); rg.addColorStop(0, 'rgba(255,170,120,0.35)'); rg.addColorStop(0.4, 'rgba(255,170,120,0)');
  g.fillStyle = rg; g.fillRect(tx0, ttop, tx1 - tx0, pb - ttop);
  for (let f = 0; f < 30; f++) for (let c = 0; c < 9; c++) { g.fillStyle = rand(f * 9 + c)() < 0.05 ? 'rgba(255,200,140,0.6)' : 'rgba(20,16,45,0.55)'; g.fillRect(tx0 + 12 + c * 32, ttop + 40 + f * 23.5, 22, 14); }
  g.fillStyle = 'rgba(255,200,150,0.8)'; g.fillRect(tx0, ttop, 3, pb - ttop);
  text(g, 'ueno', (tx0 + tx1) / 2, ttop - 10, { font: 'Jakarta', weight: 800, size: 80, color: 'rgba(60,70,90,0.95)', align: 'center' });
  // falling debris from the crown
  const r = rand(9);
  for (let i = 0; i < 26; i++) { const ph = ((t * 0.8 + r()) % 1); g.fillStyle = `rgba(40,30,60,${1 - ph})`; g.fillRect(tx0 + r() * (tx1 - tx0), ttop + ph * 300, 6 + r() * 10, 6 + r() * 8); }
  g.restore();
  // motion arcs behind the falling tower
  g.strokeStyle = 'rgba(255,230,210,0.35)'; g.lineWidth = 3;
  for (let i = 0; i < 4; i++) { const rr = 600 - i * 90; g.beginPath(); g.arc(tx1, pb, rr, -Math.PI / 2 - 0.05, -Math.PI / 2 + ang - 0.04); g.stroke(); }
  // dust billowing at the base
  g.save(); g.filter = 'blur(10px)';
  for (let i = 0; i < 26; i++) { const k = r(), dx = (k - 0.3) * 520 * fall, rad = (20 + r() * 60) * (0.4 + fall); g.fillStyle = `rgba(230,180,170,${0.22 * fall})`; g.beginPath(); g.arc(tx1 - 150 + dx, pb - rad * 0.4 + Math.sin(t + i) * 6, rad, 0, Math.PI * 2); g.fill(); }
  g.restore();
  // birds scattering
  for (let i = 0; i < 9; i++) { const bx = 900 + i * 60 + t * 40 * (1 + i * 0.1), byy = 260 - i * 18 - t * 12, fl = Math.sin(t * 10 + i) * 6; g.strokeStyle = '#2a1d3f'; g.lineWidth = 3; g.beginPath(); g.moveTo(bx - 12, byy - fl); g.lineTo(bx, byy); g.lineTo(bx + 12, byy - fl); g.stroke(); }
}

export const scenes = { s1, s2, s3, s4 };
void lerp; void buf;
