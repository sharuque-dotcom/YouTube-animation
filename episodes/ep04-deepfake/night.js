// Episode 4 night sets (episode-3 standard): layered depth, warm key / cool fill, rain, mist,
// volumetric beams, glows. Characters are lit into the scene with litToon.
import { W, H, clamp, lerp, rand, text } from '../../pipeline/engine.js';
import { sky, stars, moon, clouds, skyline, rain, mist, beam, glow, crowd } from '../../pipeline/scenery.js';
import { view, landRings } from '../../pipeline/map.js';
import { toon, litToon, lit, parrot } from '../../pipeline/cast.js';
import { dotFace, waveform } from './sets.js';

const ez = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
export const EMP = { outfit: '#5b6ea8', hair: '#3b2a1a', skin: '#e8b48f', seed: 23 };
export const CEO = { outfit: '#1d1b2e', hairStyle: 'grey', skin: '#f2c9a5', tie: '#e2412e', glasses: true, seed: 31 };

/** The city through a window: sky, moon, rim-lit clouds, two skyline layers, mist, rain */
export function cityWindow(g, t, [x, y, w, h], { moonAt = [0.3, 0.25], rainA = 0.4, seed = 0 } = {}) {
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.save(); g.translate(x, y); g.scale(w / W, h / H);
  sky(g, { top: '#06061c', mid: '#17163f', horizon: '#3b2d5e', hy: H * 0.78 });
  stars(g, t, { n: 120, maxY: H * 0.45, alpha: 0.6, seed: 3 + seed });
  moon(g, W * moonAt[0], H * moonAt[1], 46, { halo: 0.3 });
  clouds(g, t, { y: H * 0.22, h: 120, seed: 70 + seed, n: 9, scale: 0.8, lx: W * moonAt[0], ly: H * moonAt[1], speed: 5, alpha: 0.85 });
  skyline(g, t, { base: H * 0.8, seed: 80 + seed, depth: 0.2, color: '#221f48', lit: 0.2, tall: 1.1, fog: 'rgba(90,70,130,0.45)' });
  skyline(g, t, { base: H * 0.9, seed: 90 + seed, depth: 0.6, color: '#120f2b', lit: 0.3, minW: 80, maxW: 200, tall: 1.2, fog: 'rgba(70,55,110,0.35)' });
  mist(g, t, { y: H * 0.8, h: 160, alpha: 0.2 });
  g.restore();
  if (rainA) rain(g, t, { n: 420, alpha: rainA, rect: [x, y, w, h] });
  g.restore();
}
function wall(g, c0 = '#0f0b20', c1 = '#1b1430') { const gr = g.createLinearGradient(0, 0, W, 0); gr.addColorStop(0, c0); gr.addColorStop(1, c1); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
function frame(g, [x, y, w, h], mull = true) {
  g.fillStyle = '#1a1430'; g.fillRect(x - 18, y - 18, w + 36, 18); g.fillRect(x - 18, y + h, w + 36, 26); g.fillRect(x - 18, y, 18, h); g.fillRect(x + w, y, 18, h);
  if (mull) { g.fillRect(x + w / 2 - 7, y, 14, h); }
  g.fillStyle = 'rgba(170,160,255,0.35)'; g.fillRect(x, y + h, w, 3);
}
function deskLamp(g, t, x, y, { flip = 1 } = {}) {
  g.save(); g.translate(x, y); g.scale(flip, 1);
  g.fillStyle = '#2a2140'; g.fillRect(-60, -14, 120, 14);
  g.strokeStyle = '#2a2140'; g.lineWidth = 12; g.beginPath(); g.moveTo(0, -14); g.lineTo(40, -200); g.lineTo(150, -260); g.stroke();
  g.save(); g.translate(160, -262); g.rotate(0.6); g.fillStyle = '#3a3156'; g.beginPath(); g.moveTo(-50, -8); g.lineTo(50, -8); g.lineTo(76, 56); g.lineTo(-76, 56); g.closePath(); g.fill(); g.restore();
  g.restore();
  beam(g, t, x + flip * 175, y - 220, flip > 0 ? 1.3 : Math.PI - 1.3, { len: 520, spread: 0.45, color: '255,200,130', alpha: 0.3, motes: 50, seed: x });
  glow(g, x + flip * 180, y - 200, 220, '255,200,130', 0.5);
}
function monitor(g, x, y, w, h, drawScreen) {
  g.fillStyle = '#0a0812'; g.beginPath(); g.roundRect(x, y, w, h, 12); g.fill();
  g.save(); g.beginPath(); g.rect(x + 12, y + 12, w - 24, h - 24); g.clip(); drawScreen(g, x + 12, y + 12, w - 24, h - 24); g.restore();
  g.fillStyle = '#0a0812'; g.fillRect(x + w / 2 - 18, y + h, 36, 30); g.fillRect(x + w / 2 - 70, y + h + 26, 140, 10);
  glow(g, x + w / 2, y + h / 2, Math.max(w, h) * 0.9, '150,170,255', 0.18);
}
function sheetScreen(g, x, y, w, h) { g.fillStyle = '#1e2a4a'; g.fillRect(x, y, w, h); for (let r = 0; r < 10; r++) for (let c = 0; c < 5; c++) { g.fillStyle = r === 0 ? '#3b4f86' : (r + c) % 2 ? '#25345c' : '#2a3a66'; g.fillRect(x + 4 + c * (w - 8) / 5, y + 4 + r * (h - 8) / 10, (w - 8) / 5 - 3, (h - 8) / 10 - 3); } }
function deskPhone(g, t, x, y, ringAt, label = 'CEO calling') {
  const ringing = t > ringAt, shake = ringing ? Math.sin(t * 70) * (Math.floor((t - ringAt) * 2) % 2 ? 0 : 2.5) : 0;
  g.save(); g.translate(x + shake, y);
  g.fillStyle = '#16122a'; g.beginPath(); g.roundRect(-150, -50, 300, 130, 26); g.fill();
  g.fillStyle = '#221b3c'; g.beginPath(); g.roundRect(-170, -96, 110, 190, 44); g.fill();
  g.fillStyle = ringing ? '#cfffee' : '#2a2448'; g.beginPath(); g.roundRect(-40, -30, 170, 52, 9); g.fill();
  if (ringing) text(g, label, 45, 3, { font: 'Jakarta', weight: 800, size: 22, color: '#145a46', align: 'center' });
  g.restore();
  if (ringing) { glow(g, x + 45, y - 4, 220, '120,255,210', 0.4 + 0.2 * Math.sin(t * 10)); for (let i = 0; i < 3; i++) { const ph = ((t - ringAt) * 1.2 + i / 3) % 1; g.strokeStyle = `rgba(120,255,210,${0.45 * (1 - ph)})`; g.lineWidth = 3; g.beginPath(); g.arc(x - 110, y - 70, 40 + ph * 110, -2.6, -0.5); g.stroke(); } }
}

// ---------------------------------------------------------------- 1. the accountant, working late
export function nightOffice(g, t, o = {}) {
  wall(g);
  const win = [980, 70, 860, 600];
  cityWindow(g, t, win, { moonAt: [0.25, 0.22] });
  frame(g, win);
  // blinds partly down, catching moonlight
  for (let i = 0; i < 7; i++) { g.fillStyle = i % 2 ? '#2a2246' : '#231c3d'; g.fillRect(win[0], win[1] + i * 16, win[2], 12); g.fillStyle = 'rgba(200,190,255,0.12)'; g.fillRect(win[0], win[1] + i * 16, win[2], 2); }
  // moonlight spill on the wall + floor (cool fill)
  g.save(); g.globalCompositeOperation = 'lighter'; const sp = g.createLinearGradient(win[0], win[1] + win[3], win[0] - 300, H); sp.addColorStop(0, 'rgba(120,110,210,0.16)'); sp.addColorStop(1, 'rgba(120,110,210,0)'); g.fillStyle = sp; g.beginPath(); g.moveTo(win[0], win[1] + win[3]); g.lineTo(win[0] + win[2], win[1] + win[3]); g.lineTo(win[0] + win[2] - 300, H); g.lineTo(win[0] - 400, H); g.closePath(); g.fill(); g.restore();
  // wall clock (late)
  g.fillStyle = '#1d1630'; g.beginPath(); g.arc(780, 190, 66, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#3a3156'; g.lineWidth = 8; g.stroke();
  g.strokeStyle = '#cfc6ff'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(780, 190); g.lineTo(780 + Math.cos(-1.75) * 30, 190 + Math.sin(-1.75) * 30); g.stroke(); g.lineWidth = 4; g.beginPath(); g.moveTo(780, 190); g.lineTo(780 + Math.cos(-1.4 + t * 0.1) * 48, 190 + Math.sin(-1.4 + t * 0.1) * 48); g.stroke();
  // shelf with binders
  g.fillStyle = '#2a2045'; g.fillRect(90, 300, 520, 14); ['#4a2a8c', '#2b4a3a', '#5a1f2e', '#3a3156', '#4a2a8c', '#2b4a6a'].forEach((c, i) => { g.fillStyle = c; g.fillRect(110 + i * 76, 170, 60, 130); g.fillStyle = 'rgba(255,255,255,0.2)'; g.fillRect(120 + i * 76, 196, 40, 9); });
  // the accountant (warm key from the lamp, cool rim from the window)
  litToon(g, 760, 770, 1.45, t, { ...EMP, seated: true, expr: o.expr || 'neutral', look: o.look ?? 0, armL: 0.45, armR: o.armR ?? -0.35, sweat: o.sweat || 0, prop: o.prop || null }, { light: [1100, 300], color: '190,180,255', key: 0.12, keyColor: '255,200,150', shade: 'rgba(10,8,40,0.45)' });
  // desk
  const dg = g.createLinearGradient(0, 760, 0, H); dg.addColorStop(0, '#3a2b4a'); dg.addColorStop(1, '#140f22');
  g.fillStyle = dg; g.fillRect(0, 760, W, H - 760); g.fillStyle = 'rgba(200,190,255,0.25)'; g.fillRect(0, 760, W, 3);
  monitor(g, 100, 470, 430, 280, o.screen || sheetScreen);
  deskLamp(g, t, 1640, 820, { flip: -1 });
  deskPhone(g, t, 1260, 860, o.ringAt ?? 0.4);
  // mug + papers in the lamp light
  g.fillStyle = '#d9cfe8'; g.beginPath(); g.roundRect(620, 790, 60, 66, 9); g.fill(); g.strokeStyle = '#d9cfe8'; g.lineWidth = 8; g.beginPath(); g.arc(686, 822, 16, -1.3, 1.3); g.stroke();
  for (let i = 0; i < 3; i++) { const ph = (t * 0.35 + i / 3) % 1; g.strokeStyle = `rgba(255,255,255,${0.35 * Math.sin(ph * Math.PI)})`; g.lineWidth = 3; g.beginPath(); g.moveTo(640 + i * 10, 780 - ph * 60); g.bezierCurveTo(628 + i * 10, 760 - ph * 60, 652 + i * 10, 740 - ph * 60, 638 + i * 10, 720 - ph * 60); g.stroke(); }
  g.save(); g.translate(930, 940); g.rotate(-0.08); g.fillStyle = '#e8e0f4'; g.fillRect(-150, -60, 300, 180); g.fillStyle = '#c9bfe0'; for (let i = 0; i < 5; i++) g.fillRect(-120, -30 + i * 28, 240 - (i % 2) * 60, 9); g.restore();
  glow(g, 1380, 900, 600, '255,190,120', 0.16);
}

// ---------------------------------------------------------------- 2. the "CEO" in a glass corner office (shimmering)
export function ceoOffice(g, t, o = {}) {
  wall(g, '#0c0a1c', '#16112a');
  const win = [60, 60, 1800, 720];
  cityWindow(g, t, win, { moonAt: [0.8, 0.2], rainA: 0.25, seed: 5 });
  g.fillStyle = 'rgba(10,8,24,0.35)'; g.fillRect(...win);
  for (let i = 1; i < 6; i++) { g.fillStyle = '#100c20'; g.fillRect(win[0] + i * 300 - 6, win[1], 12, win[3]); }
  g.fillStyle = '#100c20'; g.fillRect(0, win[1] + win[3], W, 300);
  litToon(g, o.x ?? 640, 1040, 2.2, t, { ...CEO, expr: 'talk', talk: 1, armR: -2.4, prop: 'phone', look: 1 }, { light: [1500, 150], color: '200,190,255', key: 0.1, keyColor: '220,210,255', shade: 'rgba(8,6,30,0.5)' });
  // digital shimmer: scanlines sweeping over him
  for (let i = 0; i < 7; i++) { const y = 250 + ((t * 160 + i * 110) % 760); g.fillStyle = 'rgba(62,224,181,0.16)'; g.fillRect((o.x ?? 640) - 260, y, 520, 3); }
}

// ---------------------------------------------------------------- 3. the real CEO, asleep (the running gag)
export function asleep(g, t) {
  wall(g, '#0b091a', '#151029');
  const win = [1180, 90, 600, 520];
  cityWindow(g, t, win, { moonAt: [0.5, 0.3], rainA: 0, seed: 8 });
  frame(g, win);
  beam(g, t, win[0] + 300, win[1] + 260, 2.3, { len: 1000, spread: 0.22, color: '170,160,255', alpha: 0.16, motes: 40 });
  // bed
  g.fillStyle = '#2a2040'; g.beginPath(); g.roundRect(160, 600, 1300, 120, 30); g.fill();
  g.fillStyle = '#e8e2f4'; g.beginPath(); g.ellipse(420, 640, 170, 60, 0, 0, Math.PI * 2); g.fill();
  // the CEO lying down: rotate the toon, blanket over the body
  lit(g, (cg) => { cg.save(); cg.translate(790, 650); cg.rotate(-Math.PI / 2); toon(cg, 0, 0, 1.2, t, { ...CEO, glasses: false, expr: 'sleep', tie: null, outfit: '#7a8ac4' }); cg.restore(); }, { light: [1480, 300], color: '190,180,255', key: 0.06 });
  const bl = g.createLinearGradient(0, 620, 0, 900); bl.addColorStop(0, '#5a4a9a'); bl.addColorStop(1, '#2a2050');
  g.fillStyle = bl; g.beginPath(); g.moveTo(560, 600); g.quadraticCurveTo(900, 570 + Math.sin(t * 1.4) * 6, 1440, 610); g.lineTo(1470, 820); g.lineTo(540, 820); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(200,190,255,0.35)'; g.lineWidth = 3; g.beginPath(); g.moveTo(560, 600); g.quadraticCurveTo(900, 570 + Math.sin(t * 1.4) * 6, 1440, 610); g.stroke();
  g.fillStyle = '#1d1630'; g.fillRect(140, 720, 1350, 300);
  // Zzz
  for (let i = 0; i < 3; i++) { const ph = (t * 0.4 + i / 3) % 1; text(g, 'z', 560 + ph * 120, 470 - ph * 160, { font: 'Jakarta', weight: 800, size: 40 + ph * 30, color: `rgba(200,190,255,${Math.sin(ph * Math.PI)})` }); }
  // nightstand with a dark phone: 0 calls
  g.fillStyle = '#2a2140'; g.fillRect(1520, 640, 260, 380); g.fillStyle = '#3a2d55'; g.fillRect(1500, 620, 300, 26);
  g.save(); g.translate(1650, 600); g.fillStyle = '#0a0812'; g.beginPath(); g.roundRect(-44, -16, 88, 22, 6); g.fill(); g.restore();
  g.fillStyle = '#1d1630'; g.beginPath(); g.roundRect(1560, 470, 180, 64, 14); g.fill();
  text(g, '0 calls', 1650, 512, { font: 'Jakarta', weight: 800, size: 28, color: '#9fffe0', align: 'center' });
  glow(g, 1650, 500, 140, '120,255,210', 0.25);
}

// ---------------------------------------------------------------- 4. dark world map with glowing coasts and city lights
let mapCache = null;
export function darkMap(g, t, lon, lat, k) {
  const proj = view(lon, lat, k);
  const key = `${lon}|${lat}|${k.toFixed(2)}`;
  const path = new Path2D();
  for (const ring of landRings('110m')) { let prev = null; for (const pt of ring) { const [x, y] = proj([pt[0], Math.max(-70, pt[1])]); if (!prev || Math.abs(pt[0] - prev[0]) > 180) path.moveTo(x, y); else path.lineTo(x, y); prev = pt; } path.closePath(); }
  const bg = g.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, W * 0.8); bg.addColorStop(0, '#0e1030'); bg.addColorStop(1, '#05051a');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.fillStyle = '#17153d'; g.fill(path);
  g.save(); g.shadowColor = 'rgba(140,120,255,0.8)'; g.shadowBlur = 14; g.strokeStyle = 'rgba(160,140,255,0.55)'; g.lineWidth = 1.6; g.stroke(path); g.restore();
  if (!mapCache || mapCache.key !== key) {
    const r = rand(5), pts = [];
    for (let i = 0; i < 3000 && pts.length < 700; i++) { const x = r() * W, y = r() * H; if (g.isPointInPath(path, x, y)) pts.push([x, y, r()]); }
    mapCache = { key, pts };
  }
  mapCache.pts.forEach(([x, y, v]) => { g.fillStyle = `rgba(255,${200 + v * 40},${130 + v * 60},${0.25 + v * 0.5})`; g.fillRect(x, y, 2, 2); });
  return proj;
}

// ---------------------------------------------------------------- 5. the impressionist's stage
export function theater(g, t, o = {}) {
  g.fillStyle = '#07051a'; g.fillRect(0, 0, W, H);
  // curtains with folds, rim-lit by the spotlight
  for (let side of [-1, 1]) for (let i = 0; i < 10; i++) {
    const x0 = side < 0 ? i * 46 : W - (i + 1) * 46, sway = Math.sin(t * 0.7 + i) * 4;
    const cg = g.createLinearGradient(x0, 0, x0 + 46, 0); cg.addColorStop(0, '#3a0f22'); cg.addColorStop(0.5, '#7a1f3a'); cg.addColorStop(1, '#2a0a18');
    g.fillStyle = cg; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 + 47, 0); g.quadraticCurveTo(x0 + 47 + sway, 500, x0 + 47 + side * -i * 3, 920); g.lineTo(x0 + side * -i * 3, 920); g.closePath(); g.fill();
  }
  g.fillStyle = '#5a1430'; g.fillRect(0, 0, W, 90); for (let i = 0; i < 24; i++) { g.fillStyle = i % 2 ? '#6a1a38' : '#4a1028'; g.beginPath(); g.ellipse(i * 82 + 40, 90, 44, 30, 0, 0, Math.PI); g.fill(); }
  // stage boards
  const sg = g.createLinearGradient(0, 820, 0, H); sg.addColorStop(0, '#3a2418'); sg.addColorStop(1, '#120a08'); g.fillStyle = sg; g.fillRect(0, 820, W, H - 820);
  for (let i = 0; i < 14; i++) { g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, 830 + i * 18, W, 2); }
  // spotlight from above, dust in the beam (warm key)
  const sx = o.x ?? 760;
  beam(g, t, sx, -60, Math.PI / 2, { len: 1000, spread: 0.2, color: '255,230,190', alpha: 0.32, motes: 90, seed: 3 });
  g.save(); g.globalCompositeOperation = 'lighter'; const pool = g.createRadialGradient(sx, 880, 10, sx, 880, 260); pool.addColorStop(0, 'rgba(255,230,190,0.45)'); pool.addColorStop(1, 'rgba(255,230,190,0)'); g.fillStyle = pool; g.beginPath(); g.ellipse(sx, 880, 280, 60, 0, 0, Math.PI * 2); g.fill(); g.restore();
  // audience heads in the dark foreground
  crowd(g, t, { y: 1170, n: 16, depth: 0.95, color: '#030208', seed: 9, rim: 'rgba(255,220,180,0.35)', rimSide: 1 });
}

// ---------------------------------------------------------------- 6. a moonlit study (the parrot)
export function study(g, t) {
  wall(g, '#0d0a1e', '#18122c');
  const win = [1240, 120, 520, 560];
  cityWindow(g, t, win, { moonAt: [0.45, 0.28], rainA: 0.2, seed: 11 });
  frame(g, win);
  beam(g, t, win[0] + 200, win[1] + 280, 2.5, { len: 1100, spread: 0.2, color: '170,160,255', alpha: 0.2, motes: 60, seed: 4 });
  // bookshelves
  for (let r = 0; r < 4; r++) { g.fillStyle = '#2a1f3c'; g.fillRect(80, 180 + r * 170, 640, 14); for (let i = 0; i < 12; i++) { const h = 100 + ((i * 37 + r * 11) % 50); g.fillStyle = ['#4a2a8c', '#2b4a3a', '#5a1f2e', '#3a3156', '#5a3a2a'][(i + r) % 5]; g.fillRect(96 + i * 50, 180 + r * 170 - h, 40, h); } }
  const fg = g.createLinearGradient(0, 880, 0, H); fg.addColorStop(0, '#2a1f3c'); fg.addColorStop(1, '#0e0a1a'); g.fillStyle = fg; g.fillRect(0, 880, W, H - 880);
  glow(g, 1500, 900, 500, '170,160,255', 0.14);
}

// ---------------------------------------------------------------- 7. the earnings-call auditorium
export function auditorium(g, t, o = {}) {
  g.fillStyle = '#06051a'; g.fillRect(0, 0, W, H);
  // the big screen: soft glow, light falls on the stage
  const sx = 360, sy = 80, sw = 1200, sh = 520;
  glow(g, sx + sw / 2, sy + sh / 2, 900, '120,100,255', 0.35);
  const sc = g.createLinearGradient(sx, sy, sx, sy + sh); sc.addColorStop(0, '#3b2a7a'); sc.addColorStop(1, '#22184a');
  g.fillStyle = sc; g.beginPath(); g.roundRect(sx, sy, sw, sh, 18); g.fill();
  text(g, 'Q3 EARNINGS CALL', sx + sw / 2, sy + 110, { font: 'Jakarta', weight: 800, size: 62, color: '#ffffff', align: 'center' });
  g.strokeStyle = '#b9a2ff'; g.lineWidth = 7; g.lineJoin = 'round'; g.beginPath(); [[440, 500], [580, 450], [720, 470], [860, 380], [1000, 350], [1140, 300], [1280, 230], [1440, 200]].forEach(([a, b], i) => (i ? g.lineTo(a, b) : g.moveTo(a, b))); g.stroke();
  // stage
  const st = g.createLinearGradient(0, 760, 0, 900); st.addColorStop(0, '#2a2045'); st.addColorStop(1, '#120d22'); g.fillStyle = st; g.fillRect(0, 760, W, 160);
  g.fillStyle = 'rgba(185,162,255,0.35)'; g.fillRect(0, 760, W, 3);
  // spotlight + podium + CEO
  const cx = o.x ?? 760;
  beam(g, t, cx + 300, -40, 1.75, { len: 1000, spread: 0.12, color: '255,235,200', alpha: 0.28, motes: 50, seed: 8 });
  litToon(g, cx, 800, 1.7, t, { ...CEO, expr: 'talk', talk: 1, armR: -1.1, armL: 0.5 }, { light: [cx + 300, 0], color: '255,230,200', key: 0.12, keyColor: '255,230,200', shade: 'rgba(8,6,30,0.4)' });
  g.fillStyle = '#3a2a22'; g.fillRect(cx - 120, 640, 240, 160); g.fillStyle = '#4a3428'; g.fillRect(cx - 140, 620, 280, 30);
  g.strokeStyle = '#222'; g.lineWidth = 6; g.beginPath(); g.moveTo(cx + 60, 620); g.lineTo(cx + 60, 540); g.stroke(); g.fillStyle = '#333'; g.beginPath(); g.ellipse(cx + 60, 530, 12, 18, 0, 0, Math.PI * 2); g.fill();
  // audience
  crowd(g, t, { y: 1080, n: 22, depth: 0.7, color: '#05040e', seed: 21, rim: 'rgba(160,140,255,0.4)', rimSide: -1 });
  crowd(g, t, { y: 1220, n: 12, depth: 1.0, color: '#020107', seed: 22, rim: 'rgba(160,140,255,0.5)', rimSide: -1 });
}
export { dotFace, waveform, parrot, toon, litToon, lit, ez };
void lerp; void clamp;
