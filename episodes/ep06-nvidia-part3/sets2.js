// Episode 6 set pieces for chapters 2–6 and the outro. Pure functions of time t.
import { W, H, clamp, lerp, rand, text } from '../../pipeline/engine.js';
import { sky, stars, moon, clouds, skyline, rain, mist, beam, glow, reflect } from '../../pipeline/scenery.js';
import { ez, out3, span, spring } from '../../pipeline/scenekit.js';
import { cityWindow } from '../ep04-deepfake/night.js';
import { seated } from '../ep05-nvidia-part2/sets.js';
import { jacketOnly } from './jacket.js';
import { chipBody, execChair } from './sets.js';

const INK = '#f3efff', LAV = '#b9a2ff', RED = '#ff5c6e', GOLD = '#ffc93c', TEAL = '#3ee0b5', NV = '#76b900';
const SERIF = "'Playfair Display'";
const greek = (g, x, y, w, n, { gap = 30, h = 9, color = '#cfc8b8', seed = 1 } = {}) => { const r = rand(seed); g.fillStyle = color; for (let i = 0; i < n; i++) g.fillRect(x, y + i * gap, w * (0.62 + r() * 0.38), h); };
/** faceless bust for cards */
const bust = (g, x, y, s, hair = false) => { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#0a0812'; if (hair) { g.beginPath(); g.ellipse(0, -34, 52, 62, 0, 0, Math.PI * 2); g.fill(); } g.beginPath(); g.ellipse(0, -40, 40, 50, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(0, 80, 92, 64, 0, Math.PI, Math.PI * 2); g.fill(); g.restore(); };

// ---------------------------------------------------------------- chips as weapons: the vault
export function vault(g, t) {
  const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#07061a'); bg.addColorStop(1, '#0d0a22'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 9; i++) { g.fillStyle = i % 2 ? '#0c0a20' : '#100d28'; g.fillRect(i * 220 - 20, 0, 214, 760); }
  const fl = g.createLinearGradient(0, 760, 0, H); fl.addColorStop(0, '#1a1534'); fl.addColorStop(1, '#06050d'); g.fillStyle = fl; g.fillRect(0, 760, W, H - 760);
  // pedestal + glass case, top light as key
  beam(g, t, 960, -60, Math.PI / 2, { len: 900, spread: 0.22, color: '210,220,255', alpha: 0.22, motes: 60, seed: 2 });
  g.fillStyle = '#211b40'; g.beginPath(); g.moveTo(820, 660); g.lineTo(1100, 660); g.lineTo(1140, 900); g.lineTo(780, 900); g.closePath(); g.fill(); g.fillStyle = '#2f2858'; g.fillRect(800, 640, 320, 24);
  g.strokeStyle = 'rgba(255,220,180,0.5)'; g.lineWidth = 3; g.beginPath(); g.moveTo(820, 664); g.lineTo(780, 900); g.stroke();
  g.fillStyle = '#c9a24a'; g.fillRect(880, 740, 160, 44); text(g, 'RESTRICTED', 960, 770, { font: 'Jakarta', weight: 800, size: 20, color: '#2a1c08', align: 'center', spacing: 3 });
  g.save(); g.translate(960, 450 + Math.sin(t * 1.2) * 10); g.rotate(Math.sin(t * 0.7) * 0.06); chipBody(g, 105, t, 1); g.restore();
  g.fillStyle = 'rgba(170,190,255,0.07)'; g.fillRect(770, 250, 380, 390); g.strokeStyle = 'rgba(210,220,255,0.6)'; g.lineWidth = 4; g.strokeRect(770, 250, 380, 390);
  g.save(); g.beginPath(); g.rect(770, 250, 380, 390); g.clip(); const gx = 700 + ((t * 90) % 700); g.fillStyle = 'rgba(255,255,255,0.1)'; g.beginPath(); g.moveTo(gx, 250); g.lineTo(gx + 60, 250); g.lineTo(gx - 80, 640); g.lineTo(gx - 140, 640); g.closePath(); g.fill(); g.restore();
  // laser grid
  [[330, 0.04], [470, -0.03], [590, 0.02], [700, -0.05]].forEach(([y, sl], k) => { const a = 0.55 + 0.45 * Math.sin(t * 5 + k * 2); g.save(); g.shadowColor = 'rgba(255,50,70,0.9)'; g.shadowBlur = 14; g.strokeStyle = `rgba(255,80,100,${a})`; g.lineWidth = 3; g.beginPath(); g.moveTo(0, y - sl * 960); g.lineTo(W, y + sl * 960); g.stroke(); g.restore(); });
  // guard with a torch
  const sw = Math.sin(t * 0.9) * 0.22;
  beam(g, t, 330, 760, -0.42 + sw, { len: 1200, spread: 0.1, color: '255,225,170', alpha: 0.3, motes: 30, seed: 5 });
  g.save(); g.translate(250, 1060); g.scale(1.25, 1.25); g.fillStyle = '#05040c'; g.beginPath(); g.ellipse(0, -330, 42, 52, 0, 0, Math.PI * 2); g.fill(); g.fillRect(-52, -350, 104, 14); g.beginPath(); g.moveTo(-105, -40); g.lineTo(-112, -200); g.quadraticCurveTo(-108, -258, -36, -264); g.lineTo(36, -264); g.quadraticCurveTo(108, -258, 112, -200); g.lineTo(105, -40); g.closePath(); g.fill(); g.strokeStyle = 'rgba(255,220,170,0.6)'; g.lineWidth = 3; g.beginPath(); g.moveTo(36, -264); g.quadraticCurveTo(108, -258, 112, -200); g.lineTo(105, -40); g.stroke(); g.restore();
  reflect(g, t, 900, 180, { alpha: 0.3 });
}

// ---------------------------------------------------------------- the export wall as a dam
export function dam(g, t, { rise = 1, leak = 0 } = {}) {
  sky(g, { top: '#05061a', mid: '#12123a', horizon: '#2a2452', hy: 660 }); stars(g, t, { n: 110, maxY: 420, alpha: 0.5, seed: 14 }); moon(g, 300, 150, 36);
  clouds(g, t, { y: 210, h: 120, seed: 91, n: 9, scale: 0.75, lx: 300, ly: 150, speed: 5, alpha: 0.85 });
  // valley walls
  const hill = (pts, c) => { g.fillStyle = c; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); };
  hill([[0, 640], [0, 360], [180, 300], [420, 430], [640, 560], [860, 640]], '#141236'); hill([[W, 640], [W, 330], [1700, 290], [1480, 420], [1260, 560], [1060, 640]], '#110f2e');
  g.strokeStyle = 'rgba(200,190,255,0.35)'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 360); g.lineTo(180, 300); g.lineTo(420, 430); g.lineTo(640, 560); g.stroke();
  mist(g, t, { y: 560, h: 120, alpha: 0.22 });
  const k = ez(clamp(rise)), dx0 = 860, dx1 = 1060, top = lerp(900, 380, k);
  // river: full on the left, drying on the right
  const wl = g.createLinearGradient(0, 640, 0, 900); wl.addColorStop(0, '#16205a'); wl.addColorStop(1, '#0a0e30'); g.fillStyle = wl; g.fillRect(0, 640, dx1, 260);
  const wr = g.createLinearGradient(0, 640, 0, 900); wr.addColorStop(0, `rgba(22,32,90,${1 - k})`); wr.addColorStop(1, `rgba(10,14,48,${1 - k})`); g.fillStyle = '#0b0a1e'; g.fillRect(dx1, 640, W - dx1, 260); g.fillStyle = wr; g.fillRect(dx1, 640, W - dx1, 260);
  if (k > 0.3) { g.strokeStyle = `rgba(0,0,0,${0.5 * k})`; g.lineWidth = 3; const rc = rand(8); for (let i = 0; i < 26; i++) { const x = dx1 + 40 + rc() * 780, y = 670 + rc() * 210; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rc() - 0.5) * 90, y + (rc() - 0.5) * 50); g.lineTo(x + (rc() - 0.5) * 120, y + (rc() - 0.5) * 70); g.stroke(); } }
  // chips flowing in the current (depth-scaled: nearer rows bigger and faster)
  const r = rand(41);
  for (let i = 0; i < 170; i++) { const d = r(), sp = 0.05 + d * 0.07, ph = (t * sp + r()) % 1, y = 660 + d * 220, sz = 6 + d * 10; let x = ph * W; let a = 1; if (x > dx0 - 10) { if (k > 0.05) { a = x > dx1 ? (1 - k) : 1 - k; x = x > dx1 ? x : x; } } if (k > 0.5 && x > dx0 - 14 && x < dx1) continue; g.globalAlpha = a * (0.5 + 0.5 * Math.sin(t * 3 + i)); g.fillStyle = i % 4 ? '#9be36a' : '#d6ffb8'; g.fillRect(x, y, sz, sz); if (a > 0.5 && i % 5 === 0) glow(g, x + sz / 2, y + sz / 2, sz * 3, '118,185,0', 0.4); }
  g.globalAlpha = 1;
  // chips pile up behind the wall
  const rp = rand(43); for (let i = 0; i < 90 * k; i++) { const x = dx0 - 16 - rp() * 190 * rp(), y = 660 + rp() * 225, sz = 8 + rp() * 10; g.fillStyle = i % 3 ? '#9be36a' : '#d6ffb8'; g.globalAlpha = 0.6 + 0.4 * Math.sin(t * 2 + i); g.fillRect(x + Math.sin(t * 1.5 + i) * 3, y, sz, sz); } g.globalAlpha = 1;
  glow(g, dx0 - 80, 770, 260, '118,185,0', 0.16 * k);
  // the dam wall (heavy: rises slowly), warm lamps along the top, moon rim on the left face
  if (k > 0.01) {
    const cg = g.createLinearGradient(dx0, 0, dx1, 0); cg.addColorStop(0, '#9a96b8'); cg.addColorStop(0.5, '#6a6688'); cg.addColorStop(1, '#3a3658'); g.fillStyle = cg; g.beginPath(); g.moveTo(dx0 + 20, top); g.lineTo(dx1 - 20, top); g.lineTo(dx1 + 30, 900); g.lineTo(dx0 - 30, 900); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(30,26,60,0.45)'; g.lineWidth = 3; for (let y = top + 60; y < 900; y += 60) { g.beginPath(); g.moveTo(dx0 - 20, y); g.lineTo(dx1 + 20, y); g.stroke(); }
    g.fillStyle = '#b8b4d2'; g.fillRect(dx0, top - 16, dx1 - dx0, 18);
    g.strokeStyle = 'rgba(225,220,255,0.8)'; g.lineWidth = 3; g.beginPath(); g.moveTo(dx0 + 20, top); g.lineTo(dx0 - 30, 900); g.stroke();
    for (let i = 0; i < 4; i++) glow(g, dx0 + 25 + i * 50, top - 24, 34, '255,205,140', 0.9);
    if (k > 0.85) { const a = span(k, 0.85, 0.15); ['EXPORT', 'CONTROLS', '2022'].forEach((s, i) => text(g, s, 960, top + 110 + i * 50, { font: 'Jakarta', weight: 800, size: i === 2 ? 46 : 30, color: i === 2 ? '#ffe9a8' : '#1d1b3a', align: 'center', spacing: 3, alpha: a })); }
    beam(g, t, 960, top - 20, -Math.PI / 2 + Math.sin(t * 0.6) * 0.5, { len: 800, spread: 0.06, color: '220,225,255', alpha: 0.18 * k, motes: 0 });
  }
  // foreground bank
  const fg = g.createLinearGradient(0, 900, 0, H); fg.addColorStop(0, '#12102a'); fg.addColorStop(1, '#05040c'); g.fillStyle = fg; g.fillRect(0, 900, W, H - 900);
  // leaks: thin streams that find a way around, under the bank
  if (leak > 0) {
    const lp = ez(clamp(leak));
    [[700, 1010, 1300], [600, 1060, 1420]].forEach(([x0, cy, x1], j) => {
      const P = (u) => [(1 - u) * (1 - u) * x0 + 2 * u * (1 - u) * 960 + u * u * x1, (1 - u) * (1 - u) * 890 + 2 * u * (1 - u) * (cy + 110) + u * u * 890];
      g.save(); g.shadowColor = 'rgba(118,185,0,0.9)'; g.shadowBlur = 14; g.strokeStyle = 'rgba(155,227,106,0.75)'; g.lineWidth = 4; g.setLineDash([14, 12]); g.lineDashOffset = -t * 60; g.beginPath(); for (let i = 0; i <= 40 * lp; i++) { const [x, y] = P(i / 40); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); g.restore();
      for (let m = 0; m < 4; m++) { const u = ((t * 0.22 + m / 4 + j * 0.13) % 1); if (u < lp) { const [x, y] = P(u); g.fillStyle = '#d6ffb8'; g.fillRect(x - 6, y - 6, 12, 12); glow(g, x, y, 26, '155,227,106', 0.7); } }
    });
  }
}

// ---------------------------------------------------------------- the dock in Singapore
const CCOL = ['#2a6f6a', '#8a4030', '#4a3a8a', '#24406a', '#3d6a14', '#7a6a2a'];
export function dock(g, t, { n = 1, dim = 0 } = {}) {
  sky(g, { top: '#05061a', mid: '#12123a', horizon: '#33285a', hy: 640 }); stars(g, t, { n: 80, maxY: 360, alpha: 0.4, seed: 19 });
  clouds(g, t, { y: 170, h: 110, seed: 95, n: 9, scale: 0.7, lx: 1500, ly: 100, speed: 5, alpha: 0.8 });
  skyline(g, t, { base: 620, seed: 96, depth: 0.25, color: '#1b1844', lit: 0.3, tall: 1.1, fog: 'rgba(90,70,140,0.5)' });
  const wg = g.createLinearGradient(0, 620, 0, 780); wg.addColorStop(0, '#141a4a'); wg.addColorStop(1, '#090c28'); g.fillStyle = wg; g.fillRect(0, 620, W, 160);
  reflect(g, t, 620, 150, { alpha: 0.5 });
  // a ship on the water
  g.save(); g.translate(330 + Math.sin(t * 0.3) * 10, 700 + Math.sin(t * 0.8) * 3); g.fillStyle = '#0a0918'; g.beginPath(); g.moveTo(-230, 0); g.lineTo(230, 0); g.lineTo(200, 46); g.lineTo(-200, 46); g.closePath(); g.fill(); g.fillRect(110, -70, 70, 70); for (let i = 0; i < 6; i++) { g.fillStyle = CCOL[i % 6]; g.fillRect(-200 + i * 50, -30, 46, 30); } glow(g, 150, -50, 26, '255,220,160', 0.9); g.restore();
  // quay
  const qg = g.createLinearGradient(0, 780, 0, H); qg.addColorStop(0, '#231d3c'); qg.addColorStop(1, '#08070f'); g.fillStyle = qg; g.fillRect(0, 780, W, H - 780); g.fillStyle = 'rgba(255,201,60,0.5)'; for (let i = 0; i < 24; i++) g.fillRect(i * 84, 790, 50, 8);
  // gantry crane with a container swinging on its cable (heavy: slow sway)
  g.strokeStyle = '#0c0a1a'; g.lineWidth = 22; g.beginPath(); g.moveTo(420, 1000); g.lineTo(500, 250); g.moveTo(640, 1000); g.lineTo(560, 250); g.stroke(); g.lineWidth = 18; g.beginPath(); g.moveTo(380, 250); g.lineTo(1150, 250); g.stroke(); g.lineWidth = 8; g.beginPath(); g.moveTo(530, 150); g.lineTo(530, 250); g.moveTo(530, 150); g.lineTo(1100, 246); g.moveTo(530, 150); g.lineTo(400, 246); g.stroke();
  g.strokeStyle = 'rgba(255,215,160,0.55)'; g.lineWidth = 3; g.beginPath(); g.moveTo(380, 240); g.lineTo(1150, 240); g.stroke();
  glow(g, 530, 150, 30, '255,70,80', 0.5 + 0.5 * Math.sin(t * 3));
  const sw = Math.sin(t * 0.9) * 0.07, hx = 900 + Math.sin(t * 0.35) * 60;
  g.save(); g.translate(hx, 258); g.rotate(sw); g.strokeStyle = '#3a3558'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 210); g.stroke(); g.fillStyle = CCOL[1]; g.fillRect(-80, 210, 160, 72); g.fillStyle = 'rgba(0,0,0,0.25)'; for (let i = 0; i < 9; i++) g.fillRect(-74 + i * 17, 214, 5, 64); g.restore();
  beam(g, t, 1040, 256, 1.2, { len: 760, spread: 0.3, color: '255,215,160', alpha: 0.22, motes: 40, seed: 11 }); glow(g, 1040, 256, 60, '255,225,180', 0.9);
  // the stack grows, crate by crate
  const total = 30, shown = Math.floor(clamp(n) * total);
  for (let i = 0; i < total; i++) { if (i >= shown && n < 1) break; const col = i % 6, row = Math.floor(i / 6), x = 1010 + col * 148, y = 930 - row * 72; const p = n >= 1 ? 1 : Math.min(1, spring(clamp(n) * total - i, 0, 0.5, 0.75)); g.save(); g.translate(x, y - (1 - p) * 300); g.globalAlpha = Math.min(1, p * 2); const c = CCOL[(i * 7 + row) % 6]; g.fillStyle = c; g.fillRect(0, 0, 144, 68); g.fillStyle = 'rgba(0,0,0,0.22)'; for (let k2 = 0; k2 < 10; k2++) g.fillRect(6 + k2 * 14, 4, 5, 60); g.fillStyle = 'rgba(255,215,160,0.3)'; g.fillRect(0, 0, 144, 4); g.restore(); }
  glow(g, 1450, 760, 520, '255,200,140', 0.1);
  rain(g, t, { n: 420, alpha: 0.3 });
  reflect(g, t, 1004, 76, { alpha: 0.3 });
  if (dim) { g.fillStyle = `rgba(6,5,16,${0.55 * dim})`; g.fillRect(0, 0, W, H); }
}

// ---------------------------------------------------------------- two name cards
export function nameCards(g, t, { a1 = 0.1, a2 = 0.6, hs = 99, nr = 99 } = {}) {
  const bg = g.createRadialGradient(960, 520, 60, 960, 560, 1100); bg.addColorStop(0, '#3a2d4a'); bg.addColorStop(1, '#0b0816'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  beam(g, t, 960, -80, Math.PI / 2, { len: 1100, spread: 0.5, color: '255,210,150', alpha: 0.16, motes: 50, seed: 13 });
  const card = (x, rot, a, name, l1, l2, isJ) => {
    const p = spring(t, a, 1.5, 0.65); if (p <= 0.01) return;
    g.save(); g.translate(x, 520 + (1 - Math.min(1, p)) * 200); g.rotate(rot + Math.sin(t * 0.8 + x) * 0.006); g.globalAlpha = Math.min(1, p * 1.5);
    g.shadowColor = 'rgba(0,0,0,0.55)'; g.shadowBlur = 40; g.shadowOffsetY = 18; g.fillStyle = '#f4efe6'; g.beginPath(); g.roundRect(-330, -210, 660, 420, 22); g.fill(); g.shadowColor = 'transparent';
    g.fillStyle = isJ ? '#2d4a12' : '#4a2a8c'; g.beginPath(); g.roundRect(-330, -210, 660, 70, [22, 22, 0, 0]); g.fill();
    text(g, isJ ? 'NVIDIA' : 'MEGASPEED', -300, -162, { font: 'Jakarta', weight: 800, size: 30, color: '#fff', spacing: 5 });
    g.fillStyle = '#1d1a3a'; g.fillRect(-300, -110, 200, 260);
    if (isJ) jacketOnly(g, t, -200, 118, 0.42, { lit: 1 }); else bust(g, -200, 30, 1, true);
    const hp = ez(span(t, hs, 0.5)); const [first, last] = name.split(' ');
    g.font = '800 54px Jakarta'; const fw = g.measureText(first + ' ').width, lw = g.measureText(last).width;
    if (hp > 0) { g.fillStyle = 'rgba(255,201,60,0.75)'; g.fillRect(-66 + fw, -92, (lw + 12) * hp, 66); }
    text(g, name, -60, -40, { font: 'Jakarta', weight: 800, size: 54, color: '#1d1b29' });
    text(g, l1, -60, 20, { font: 'Inter', weight: 600, size: 28, color: '#3a3448' }); text(g, l2, -60, 62, { font: 'Inter', weight: 600, size: 26, color: '#6a6478' });
    greek(g, -60, 100, 340, 2, { gap: 26, seed: x });
    g.restore();
  };
  card(520, -0.035, a1, 'Alice Huang', 'Managing director', 'March – November 2023', false);
  card(1400, 0.03, a2, 'Jensen Huang', 'Founder and CEO', 'since 1993', true);
  const np = spring(t, nr, 1.8, 0.6);
  if (np > 0.01) { g.save(); g.translate(960, 870); g.scale(Math.min(1.05, np), Math.min(1.05, np)); g.fillStyle = 'rgba(20,14,44,0.92)'; g.strokeStyle = TEAL; g.lineWidth = 3; g.beginPath(); g.roundRect(-270, -48, 540, 96, 48); g.fill(); g.stroke(); text(g, 'not reported to be related', 0, 13, { font: 'Jakarta', weight: 800, size: 34, color: '#9fffe0', align: 'center' }); g.restore(); }
}

// ---------------------------------------------------------------- "had been watching": surveillance wall
export function watchers(g, t) {
  g.fillStyle = '#04040c'; g.fillRect(0, 0, W, H);
  for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) {
    const x = 150 + c * 550, y = 70 + r * 370, w = 520, h = 340, k = r * 3 + c, rr = rand(k + 3);
    const sg = g.createLinearGradient(0, y, 0, y + h); sg.addColorStop(0, '#1d4260'); sg.addColorStop(1, '#122a40'); g.fillStyle = sg; g.fillRect(x, y, w, h);
    g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
    const zx = 0.9 + rr() * 0.9, ox = x + w * (0.3 + rr() * 0.4) + Math.sin(t * 0.5 + k) * 30, oy = y + h * (0.75 + rr() * 0.2);
    g.fillStyle = '#2a5878'; g.fillRect(x, oy - 40, w, h); glow(g, ox, oy - 150, 200, '160,220,255', 0.25); // ground band + backlight
    g.save(); g.translate(ox, oy); g.scale(zx * 0.55, zx * 0.55); g.fillStyle = '#04070c'; g.beginPath(); g.ellipse(0, -330, 46, 58, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(0, -322, 54, 60, 0, Math.PI, 0); g.fill(); g.beginPath(); g.moveTo(-70, 0); g.lineTo(-84, -210); g.quadraticCurveTo(-80, -262, -30, -266); g.lineTo(30, -266); g.quadraticCurveTo(80, -262, 84, -210); g.lineTo(70, 0); g.closePath(); g.fill(); g.restore();
    // crosshair tracking the figure
    const cxh = ox, cyh = oy - 180 * zx; g.strokeStyle = 'rgba(255,80,100,0.9)'; g.lineWidth = 3; const s = 46 + Math.sin(t * 4 + k) * 5; [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([a, b]) => { g.beginPath(); g.moveTo(cxh + a * s, cyh + b * s * 0.5); g.lineTo(cxh + a * s, cyh + b * s); g.lineTo(cxh + a * s * 0.5, cyh + b * s); g.stroke(); });
    g.fillStyle = 'rgba(120,200,255,0.06)'; for (let i = 0; i < h; i += 6) g.fillRect(x, y + i, w, 2);
    const sy = y + ((t * 120 + k * 60) % h); g.fillStyle = 'rgba(160,220,255,0.12)'; g.fillRect(x, sy, w, 18);
    g.restore();
    if (Math.sin(t * 5 + k) > -0.3) { g.fillStyle = '#ff4a5e'; g.beginPath(); g.arc(x + 26, y + 28, 8, 0, Math.PI * 2); g.fill(); }
    text(g, `CAM ${k + 1}`, x + 44, y + 36, { font: 'Jakarta', weight: 800, size: 20, color: '#bfe6ff', spacing: 2 });
    g.strokeStyle = '#1a2a3c'; g.lineWidth = 6; g.strokeRect(x, y, w, h); glow(g, x + w / 2, y + h / 2, 360, '90,170,255', 0.08);
  }
  const fl = g.createLinearGradient(0, 800, 0, H); fl.addColorStop(0, 'rgba(4,4,12,0)'); fl.addColorStop(1, '#04040c'); g.fillStyle = fl; g.fillRect(0, 800, W, H - 800);
  seated(g, 620, 1130, 1.5, { side: 1, rim: 'rgba(120,200,255,0.7)' }); seated(g, 1320, 1150, 1.6, { side: -1, rim: 'rgba(120,200,255,0.7)' });
}

// ---------------------------------------------------------------- newspapers landing on a table
export function papers(g, t, items) {
  const bg = g.createRadialGradient(960, 520, 60, 960, 560, 1100); bg.addColorStop(0, '#4a3540'); bg.addColorStop(1, '#0d0914'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  items.forEach((it, i) => {
    const u = clamp((t - it.at) / 0.45); if (t < it.at) return;
    const e = 1 - Math.pow(1 - u, 3), b = t > it.at + 0.45 ? Math.exp(-(t - it.at - 0.45) * 8) * Math.sin((t - it.at - 0.45) * 30) * 0.015 : 0;
    g.save(); g.translate(it.x, it.y); g.rotate(lerp((it.rot || 0) - 0.5, it.rot || 0, e)); g.scale(lerp(2.2, 1, e) + b, lerp(2.2, 1, e) + b); g.globalAlpha = Math.min(1, u * 3);
    g.shadowColor = 'rgba(0,0,0,0.55)'; g.shadowBlur = 36; g.shadowOffsetY = 16; g.fillStyle = '#ece6d8'; g.fillRect(-300, -200, 600, 400); g.shadowColor = 'transparent';
    text(g, it.name, 0, -140, { font: SERIF, weight: 900, size: it.name.length > 20 ? 34 : 40, color: '#1d1b29', align: 'center' });
    g.fillStyle = '#1d1b29'; g.fillRect(-270, -118, 540, 4); g.fillRect(-270, -108, 540, 1.5);
    g.fillStyle = '#2a2836'; g.fillRect(-270, -86, 400, 26); g.fillRect(-270, -50, 300, 26);
    g.fillStyle = '#1d1a3a'; g.fillRect(90, 0, 180, 170); bust(g, 180, 86, 0.62, it.hair);
    greek(g, -270, 6, 330, 7, { gap: 24, h: 8, color: '#b8b2a6', seed: i + 5 });
    g.restore();
  });
  beam(g, t, 200, -80, 0.8, { len: 1500, spread: 0.3, color: '255,205,150', alpha: 0.18, motes: 50, seed: 4 });
}

// ---------------------------------------------------------------- "thousands of customers": a swarm around the jacket
export function swarm(g, t, a) {
  g.fillStyle = '#06051a'; g.fillRect(0, 0, W, H);
  glow(g, 960, 540, 700, '150,130,255', 0.12);
  const r = rand(55), p = ez(span(t, a, 1.6));
  for (let i = 0; i < 520; i++) { const ang = r() * Math.PI * 2 + t * (0.05 + r() * 0.12) * (i % 2 ? 1 : -1), d = r(), R = lerp(900, 210 + d * 420, p * (0.6 + 0.4 * r())), s = 3.5 + d * 6; const x = 960 + Math.cos(ang) * R * 1.25, y = 540 + Math.sin(ang) * R * 0.72; g.fillStyle = `rgba(${i % 5 ? '185,162,255' : '62,224,181'},${0.5 + 0.5 * Math.abs(Math.sin(t * 2 + i))})`; g.beginPath(); g.arc(x, y, s, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = '#0c0a16'; g.beginPath(); g.arc(960, 540, 150, 0, Math.PI * 2); g.fill(); g.strokeStyle = GOLD; g.lineWidth = 5; g.stroke(); glow(g, 960, 540, 300, '255,201,60', 0.14);
  jacketOnly(g, t, 960, 606, 0.44, { lit: 1 });
}

// ---------------------------------------------------------------- the campus on Sunday: every window lights up
export function campus(g, t, a) {
  sky(g, { top: '#05061a', mid: '#12123a', horizon: '#2b2350', hy: 840 }); stars(g, t, { n: 120, maxY: 420, alpha: 0.55, seed: 23 }); moon(g, 1560, 170, 38);
  clouds(g, t, { y: 220, h: 120, seed: 97, n: 9, scale: 0.75, lx: 1560, ly: 170, speed: 5, alpha: 0.85 });
  skyline(g, t, { base: 800, seed: 98, depth: 0.15, color: '#191640', lit: 0.08, tall: 0.35, fog: 'rgba(80,65,125,0.5)' });
  mist(g, t, { y: 760, h: 110, alpha: 0.2 });
  const x0 = 260, x1 = 1660, y0 = 420, y1 = 840, rows = 5, cols = 26, cw = (x1 - x0) / cols, rh = (y1 - y0 - 30) / rows;
  // faceted roofline
  g.fillStyle = '#1a1740'; g.beginPath(); g.moveTo(x0 - 30, y0 + 20); for (let i = 0; i <= 14; i++) g.lineTo(x0 - 30 + i * ((x1 - x0 + 60) / 14), y0 + (i % 2 ? -46 : 6)); g.lineTo(x1 + 30, y1); g.lineTo(x0 - 30, y1); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(210,200,255,0.5)'; g.lineWidth = 3; g.beginPath(); for (let i = 0; i <= 14; i++) { const x = x0 - 30 + i * ((x1 - x0 + 60) / 14), y = y0 + (i % 2 ? -46 : 6); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
  const r = rand(29); let lit = 0;
  for (let ry = 0; ry < rows; ry++) for (let c = 0; c < cols; c++) { const at0 = a + r() * 2.6, on = ez(span(t, at0, 0.35)), x = x0 + c * cw + 6, y = y0 + 34 + ry * rh; g.fillStyle = `rgba(${lerp(40, 215, on)},${lerp(36, 205, on)},${lerp(84, 255, on)},${0.6 + 0.4 * on})`; g.fillRect(x, y, cw - 12, rh - 14); if (on > 0.5) { lit++; if ((c + ry) % 4 === 0) glow(g, x + cw / 2, y + rh / 2, 60, '190,175,255', 0.3 * on); } const rp = (t - at0) / 0.9; if (rp > 0 && rp < 1 && (c * 3 + ry) % 5 === 0) { g.strokeStyle = `rgba(215,205,255,${0.7 * (1 - rp)})`; g.lineWidth = 3; g.beginPath(); g.arc(x + cw / 2 - 6, y + rh / 2 - 7, 10 + rp * 70, 0, Math.PI * 2); g.stroke(); } }
  glow(g, 960, 640, 900, '170,150,255', 0.08 + 0.12 * (lit / (rows * cols)));
  // lawn, trees swaying (light: reacts fast), a path lamp
  const lg = g.createLinearGradient(0, y1, 0, H); lg.addColorStop(0, '#14122c'); lg.addColorStop(1, '#06050d'); g.fillStyle = lg; g.fillRect(0, y1, W, H - y1);
  [[120, 1.3], [1790, 1.4], [420, 0.8], [1500, 0.85]].forEach(([x, s], k) => { const sw = Math.sin(t * 1.6 + k) * 8; g.fillStyle = '#0a0918'; g.fillRect(x - 8 * s, y1 - 120 * s + 160, 16 * s, 130 * s); g.beginPath(); g.arc(x + sw, y1 - 60 * s + 60, 90 * s, 0, Math.PI * 2); g.arc(x + 60 * s + sw * 1.3, y1 - 20 * s + 60, 64 * s, 0, Math.PI * 2); g.arc(x - 60 * s + sw * 0.7, y1 - 10 * s + 60, 70 * s, 0, Math.PI * 2); g.fill(); });
  reflect(g, t, y1 + 30, 160, { alpha: 0.22 });
}

// ---------------------------------------------------------------- the email on a phone
const QUOTE = ['“I was unfaithful', 'to my wife.', 'My actions hurt her', 'and our children.', 'There is no excuse', 'for what I did.”'];
export function phoneEmail(g, t, { p = 1, off = 0 } = {}) {
  g.fillStyle = '#05040f'; g.fillRect(0, 0, W, H);
  const on = 1 - ez(clamp(off));
  glow(g, 960, 540, 900, '150,130,255', 0.2 * on); beam(g, t, 960, -80, Math.PI / 2, { len: 1200, spread: 0.35, color: '185,170,255', alpha: 0.1 * on + 0.03, motes: 50, seed: 15 });
  g.save(); g.translate(960, 548 + Math.sin(t * 0.9) * 5); g.rotate(-0.03 + Math.sin(t * 0.6) * 0.008);
  g.shadowColor = 'rgba(0,0,0,0.7)'; g.shadowBlur = 60; g.fillStyle = '#08070c'; g.beginPath(); g.roundRect(-290, -500, 580, 1000, 62); g.fill(); g.shadowColor = 'transparent';
  g.strokeStyle = 'rgba(255,220,190,0.5)'; g.lineWidth = 3; g.beginPath(); g.roundRect(-290, -500, 580, 1000, 62); g.stroke();
  g.save(); g.beginPath(); g.roundRect(-268, -478, 536, 956, 44); g.clip();
  g.fillStyle = '#f6f2fb'; g.fillRect(-268, -478, 536, 956);
  g.fillStyle = '#4a2a8c'; g.fillRect(-268, -478, 536, 96); text(g, 'Inbox', -236, -416, { font: 'Jakarta', weight: 800, size: 34, color: '#fff' });
  g.fillStyle = '#1d1b29'; g.beginPath(); g.arc(-206, -316, 34, 0, Math.PI * 2); g.fill(); jacketOnly(g, t, -206, -296, 0.1, { lit: 1 });
  text(g, 'Jensen Huang', -156, -322, { font: 'Jakarta', weight: 800, size: 30, color: '#1d1b29' }); text(g, 'to all employees · Sun 8 Nov', -156, -288, { font: 'Inter', weight: 600, size: 20, color: '#6a6478' });
  g.fillStyle = '#ded6ee'; g.fillRect(-236, -252, 472, 2);
  const total = QUOTE.join('').length; let n = Math.floor(clamp(p) * total);
  QUOTE.forEach((ln, i) => { const s = ln.slice(0, Math.max(0, n)); n -= ln.length; if (s) text(g, s, -236, -180 + i * 62 + (i > 1 ? 20 : 0) + (i > 3 ? 20 : 0), { font: SERIF, style: 'italic', weight: 400, size: 46, color: '#1d1b29' }); });
  greek(g, -236, 290, 472, 5, { gap: 30, color: '#d6cfe4', seed: 9 });
  if (off > 0) { g.fillStyle = `rgba(5,4,10,${ez(clamp(off))})`; g.fillRect(-268, -478, 536, 956); }
  g.restore();
  g.restore();
}

// ---------------------------------------------------------------- a door opens on the investigation
export function doorOpen(g, t, a) {
  const wall = g.createLinearGradient(0, 0, W, 0); wall.addColorStop(0, '#0b091a'); wall.addColorStop(1, '#120e24'); g.fillStyle = wall; g.fillRect(0, 0, W, H);
  const fl = g.createLinearGradient(0, 900, 0, H); fl.addColorStop(0, '#1a1530'); fl.addColorStop(1, '#07060f'); g.fillStyle = fl; g.fillRect(0, 900, W, H - 900);
  const k = ez(span(t, a, 1.6)), dx = 740, dw = 440, dy = 170, dh = 730, open = dw * (0.06 + 0.86 * k);
  // the lit room behind
  const rg = g.createLinearGradient(0, dy, 0, dy + dh); rg.addColorStop(0, '#ffe2ae'); rg.addColorStop(1, '#d88f50'); g.fillStyle = rg; g.fillRect(dx + dw - open, dy, open, dh);
  g.save(); g.beginPath(); g.rect(dx + dw - open, dy, open, dh); g.clip(); g.fillStyle = 'rgba(40,20,20,0.9)'; [[dx + 250, 0.9], [dx + 370, 0.82]].forEach(([x, s], i) => { g.save(); g.translate(x, dy + dh + 10); g.scale(s, s); g.beginPath(); g.ellipse(0, -330, 42, 52, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.moveTo(-100, 0); g.lineTo(-108, -200); g.quadraticCurveTo(-104, -258, -36, -264); g.lineTo(36, -264); g.quadraticCurveTo(104, -258, 108, -200); g.lineTo(100, 0); g.closePath(); g.fill(); if (i === 0) { g.fillRect(96, -150, 26, 90); g.fillRect(84, -70, 70, 56); } g.restore(); }); g.restore();
  // the door leaf, hinged left
  const lw = dw - open; const lg = g.createLinearGradient(dx, 0, dx + lw, 0); lg.addColorStop(0, '#2a2244'); lg.addColorStop(1, '#171228'); g.fillStyle = lg; g.fillRect(dx, dy, lw, dh);
  if (lw > 200) { const pa = clamp((lw - 200) / 160); g.fillStyle = `rgba(201,162,74,${pa})`; g.fillRect(dx + lw / 2 - 150, dy + 220, 300, 64); text(g, 'INVESTIGATION', dx + lw / 2, dy + 263, { font: 'Jakarta', weight: 800, size: 28, color: '#2a1c08', align: 'center', spacing: 3, alpha: pa }); }
  g.strokeStyle = '#0a0816'; g.lineWidth = 26; g.strokeRect(dx - 13, dy - 13, dw + 26, dh + 13);
  g.strokeStyle = 'rgba(255,215,160,0.8)'; g.lineWidth = 4; g.beginPath(); g.moveTo(dx + lw, dy); g.lineTo(dx + lw, dy + dh); g.stroke();
  // light spilling out: floor wedge + volumetric beam
  g.save(); g.globalCompositeOperation = 'lighter'; const sp = g.createLinearGradient(0, 900, 0, H); sp.addColorStop(0, `rgba(255,200,130,${0.4 * k + 0.05})`); sp.addColorStop(1, 'rgba(255,200,130,0)'); g.fillStyle = sp; g.beginPath(); g.moveTo(dx + dw - open, 900); g.lineTo(dx + dw, 900); g.lineTo(dx + dw + 300 * k + 60, H); g.lineTo(dx + dw - open - 500 * k - 60, H); g.closePath(); g.fill(); g.restore();
  beam(g, t, dx + dw - open / 2, 520, Math.PI / 2 + 0.5, { len: 900, spread: 0.3 * k + 0.03, color: '255,205,150', alpha: 0.22 * k + 0.04, motes: 60, seed: 17 });
  glow(g, dx + dw - open / 2, 520, 500, '255,200,130', 0.14 * k + 0.04);
}

// ---------------------------------------------------------------- two red flags
export function flags(g, t, a1, a2) {
  g.fillStyle = '#06051a'; g.fillRect(0, 0, W, H);
  const fl = g.createLinearGradient(0, 880, 0, H); fl.addColorStop(0, '#141030'); fl.addColorStop(1, '#06050d'); g.fillStyle = fl; g.fillRect(0, 880, W, 200);
  [[600, a1, 'CUSTOMER'], [1280, a2, 'EMPLOYEE']].forEach(([x, a, lab], k) => {
    beam(g, t, x + 120, -60, Math.PI / 2, { len: 1000, spread: 0.2, color: '255,215,170', alpha: 0.2 * span(t, a - 0.2, 0.5) + 0.04, motes: 30, seed: k + 20 });
    const fp = out3(span(t, a, 1)); g.strokeStyle = '#d8d4e6'; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, 900); g.lineTo(x, 240); g.stroke(); g.fillStyle = GOLD; g.beginPath(); g.arc(x, 232, 14, 0, Math.PI * 2); g.fill();
    if (fp <= 0) return;
    const y = lerp(820, 270, fp); g.save(); g.translate(x + 6, y);
    g.fillStyle = '#e2412e'; g.beginPath(); g.moveTo(0, 0); for (let i = 1; i <= 20; i++) g.lineTo(i * 20, Math.sin(t * 5 - i * 0.45 + k) * 12 * (i / 20)); for (let i = 20; i >= 0; i--) g.lineTo(i * 20, 230 + Math.sin(t * 5 - i * 0.45 + k + 0.6) * 12 * (i / 20)); g.closePath(); g.fill();
    const sh = g.createLinearGradient(0, 0, 400, 0); for (let i = 0; i <= 8; i++) sh.addColorStop(i / 8, `rgba(0,0,0,${0.12 + 0.12 * Math.sin(t * 5 - i * 1.1)})`); g.fillStyle = sh; g.fillRect(0, -14, 400, 260);
    text(g, lab, 200, 136, { font: 'Jakarta', weight: 800, size: 54, color: '#fff', align: 'center', spacing: 4 });
    g.restore(); glow(g, x + 200, y + 110, 380, '255,70,80', 0.22 * fp);
  });
}

// ---------------------------------------------------------------- two chairs: the interim CEO and the first chair of the board
export function twoChairs(g, t, { a1 = 0.2, a2 = 99 } = {}) {
  g.fillStyle = '#05040f'; g.fillRect(0, 0, W, H);
  cityWindow(g, t, [0, 0, W, 640], { moonAt: [0.5, 0.2], rainA: 0.25, seed: 67 });
  const dawn = g.createLinearGradient(0, 300, 0, 640); dawn.addColorStop(0, 'rgba(255,150,90,0)'); dawn.addColorStop(1, 'rgba(255,150,90,0.3)'); g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = dawn; g.fillRect(0, 300, W, 340); g.restore();
  g.fillStyle = 'rgba(5,4,15,0.42)'; g.fillRect(0, 0, W, 640); for (let i = 1; i < 6; i++) { g.fillStyle = '#080714'; g.fillRect(i * 320 - 6, 0, 12, 640); }
  const fl = g.createLinearGradient(0, 640, 0, H); fl.addColorStop(0, '#15102a'); fl.addColorStop(1, '#06050d'); g.fillStyle = fl; g.fillRect(0, 640, W, H - 640);
  const seat = (x, s, a, name, role, col) => {
    const p = Math.min(1, spring(t, a, 1.3, 0.75)); if (p <= 0.01) return;
    beam(g, t, x, -60, Math.PI / 2, { len: 1000, spread: 0.17, color: '255,215,170', alpha: 0.3 * p, motes: 50, seed: x });
    g.save(); g.globalCompositeOperation = 'lighter'; const pg = g.createRadialGradient(x, 930, 10, x, 930, 330); pg.addColorStop(0, `rgba(255,215,170,${0.3 * p})`); pg.addColorStop(1, 'rgba(255,215,170,0)'); g.fillStyle = pg; g.beginPath(); g.ellipse(x, 930, 340, 64, 0, 0, Math.PI * 2); g.fill(); g.restore();
    g.save(); g.globalAlpha = p; g.translate(x, 740 + (1 - p) * 80); g.scale(s, s); g.rotate((1 - p) * -0.5); execChair(g); g.restore();
    const np = ez(span(t, a + 0.5, 0.7)); if (np > 0) { g.save(); g.translate(x + (1 - np) * -500, 960); g.globalAlpha = np; g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 24; g.fillStyle = '#ece5d6'; g.beginPath(); g.moveTo(-250, -62); g.lineTo(250, -62); g.lineTo(272, 58); g.lineTo(-272, 58); g.closePath(); g.fill(); g.shadowColor = 'transparent'; g.fillStyle = col; g.fillRect(-250, -62, 500, 8); text(g, name, 0, -4, { font: 'Jakarta', weight: 800, size: 40, color: '#1d1b29', align: 'center', spacing: 2 }); text(g, role, 0, 36, { font: 'Inter', weight: 600, size: 24, color: '#5a5468', align: 'center' }); g.restore(); }
  };
  seat(600, 1.3, a1, 'COLETTE KRESS', 'Interim CEO · stays finance chief', NV);
  seat(1320, 1.5, a2, 'HARVEY JONES', 'Chair of the board · Nvidia’s first', GOLD);
  rain(g, t, { n: 120, alpha: 0.14, rect: [0, 0, W, 640] });
}

// ---------------------------------------------------------------- the price walks off a cliff, then climbs
const PY = (price) => 400 + ((173.73 - price) / (173.73 - 151)) * 380;
export function cliffChart(g, t, { walk = 1, fall = 0, back = 0 } = {}) {
  sky(g, { top: '#05061a', mid: '#12123a', horizon: '#2a2452', hy: 900 }); stars(g, t, { n: 120, maxY: 380, alpha: 0.5, seed: 31 }); moon(g, 1600, 150, 34);
  clouds(g, t, { y: 190, h: 100, seed: 99, n: 8, scale: 0.65, lx: 1600, ly: 150, speed: 5, alpha: 0.75 });
  const yTop = PY(173.73), yBot = PY(151), yMid = PY(164.06), xc = 880;
  // far ridge
  g.fillStyle = '#12103a'; g.beginPath(); g.moveTo(0, 620); for (let x = 0; x <= W; x += 60) g.lineTo(x, 560 + Math.sin(x * 0.005) * 40 + Math.sin(x * 0.013) * 16); g.lineTo(W, H); g.lineTo(0, H); g.closePath(); g.fill();
  mist(g, t, { y: 700, h: 200, alpha: 0.3 });
  // the plateau, the cliff face, the valley floor rising toward the right
  const land = g.createLinearGradient(0, yTop, 0, H); land.addColorStop(0, '#2a2458'); land.addColorStop(0.4, '#17143a'); land.addColorStop(1, '#07061a');
  g.fillStyle = land; g.beginPath(); g.moveTo(0, yTop); g.lineTo(xc, yTop); g.lineTo(xc + 24, yTop + 60); g.lineTo(xc + 6, yTop + 150); g.lineTo(xc + 44, yBot - 60); g.lineTo(xc + 60, yBot); g.quadraticCurveTo(1300, yBot - 20, W, yMid - 20); g.lineTo(W, H); g.lineTo(0, H); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(215,205,255,0.6)'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, yTop); g.lineTo(xc, yTop); g.stroke();
  g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 3; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(xc - 10 - i * 14, yTop + 30 + i * 46); g.lineTo(xc + 30 - i * 4, yTop + 60 + i * 44); g.stroke(); }
  mist(g, t, { y: yBot - 40, h: 150, alpha: 0.3, seed: 6 });
  // the price line
  const pts = []; const rr = rand(37);
  const wN = Math.floor(60 * clamp(walk)); for (let i = 0; i <= wN; i++) pts.push([120 + (i / 60) * (xc - 120), yTop - 14 - rr() * 10]);
  const f = clamp(fall); if (f > 0) { const n2 = Math.floor(20 * f); for (let i = 1; i <= n2; i++) { const u = i / 20; pts.push([xc + 10 + u * 70, lerp(yTop - 14, yBot - 14, u * u)]); } }
  const bk = clamp(back); if (bk > 0) { const n3 = Math.floor(50 * bk); for (let i = 1; i <= n3; i++) { const u = i / 50; pts.push([xc + 80 + u * 760, lerp(yBot - 14, yMid - 44, out3(u)) - rr() * 12 + Math.sin(u * 20) * 5]); } }
  const draw = (from, to, col, sh) => { if (to <= from) return; g.save(); g.shadowColor = sh; g.shadowBlur = 18; g.strokeStyle = col; g.lineWidth = 8; g.lineJoin = 'round'; g.lineCap = 'round'; g.beginPath(); pts.slice(from, to + 1).forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); g.restore(); };
  draw(0, Math.min(pts.length - 1, wN), '#9be36a', 'rgba(118,185,0,0.9)'); draw(wN, Math.min(pts.length - 1, wN + 20), RED, 'rgba(255,60,80,0.9)'); draw(wN + 20, pts.length - 1, GOLD, 'rgba(255,201,60,0.9)');
  const [hx, hy] = pts[pts.length - 1]; glow(g, hx, hy, 70, bk > 0 ? '255,201,60' : f > 0 ? '255,90,110' : '155,227,106', 0.95); g.fillStyle = '#fff'; g.beginPath(); g.arc(hx, hy, 9, 0, Math.PI * 2); g.fill();
  // rocks break off the edge as it falls
  if (f > 0) { const rk = rand(5); for (let i = 0; i < 12; i++) { const u = clamp(fall * 1.4 - rk() * 0.4); if (u <= 0) continue; g.fillStyle = `rgba(42,36,88,${1 - u})`; g.beginPath(); g.arc(xc + 20 + rk() * 90 * u, yTop + 20 + u * u * 360 + rk() * 60, 6 + rk() * 12, 0, Math.PI * 2); g.fill(); } }
}

// ---------------------------------------------------------------- still the largest individual shareholder
export function stake(g, t, a) {
  g.fillStyle = '#06051a'; g.fillRect(0, 0, W, H);
  const r0 = rand(6); for (let i = 0; i < 140; i++) { g.fillStyle = `rgba(185,162,255,${0.05 + r0() * 0.1})`; g.fillRect(r0() * W, r0() * H, 2, 2); }
  const cx = 700, cy = 540, R = 330, p = ez(span(t, a, 1.4)), frac = 0.036 * p;
  glow(g, cx, cy, 700, '150,130,255', 0.12);
  g.strokeStyle = '#2a2452'; g.lineWidth = 90; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = 'rgba(255,220,180,0.5)'; g.lineWidth = 4; g.beginPath(); g.arc(cx, cy, R + 46, -2.7, -1.3); g.stroke();
  // tick marks so the tiny slice has scale
  for (let i = 0; i < 100; i++) { const an = (i / 100) * Math.PI * 2 - Math.PI / 2; g.strokeStyle = 'rgba(185,162,255,0.25)'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx + Math.cos(an) * (R - 44), cy + Math.sin(an) * (R - 44)); g.lineTo(cx + Math.cos(an) * (R - 30), cy + Math.sin(an) * (R - 30)); g.stroke(); }
  g.save(); g.shadowColor = 'rgba(255,201,60,0.9)'; g.shadowBlur = 30; g.strokeStyle = GOLD; g.lineWidth = 104 + Math.sin(t * 3) * 6; g.beginPath(); g.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.max(0.004, frac * Math.PI * 2)); g.stroke(); g.restore();
  g.fillStyle = '#0c0a16'; g.beginPath(); g.arc(cx, cy, 190, 0, Math.PI * 2); g.fill(); jacketOnly(g, t, cx, cy + 86, 0.56, { lit: 1 });
  text(g, `${(3.6 * p).toFixed(1)}%`, 1380, 520, { font: 'Jakarta', weight: 800, size: 200, color: GOLD, align: 'center', alpha: span(t, a - 0.1, 0.3) });
  text(g, 'of Nvidia · largest individual shareholder', 1380, 600, { font: 'Inter', weight: 600, size: 30, color: LAV, align: 'center', alpha: span(t, a + 0.4, 0.5) });
  beam(g, t, 160, -80, 0.8, { len: 1500, spread: 0.22, color: '255,210,160', alpha: 0.12, motes: 50, seed: 9 });
}

// ---------------------------------------------------------------- an empty stage for earnings day
export function emptyStage(g, t) {
  g.fillStyle = '#05040f'; g.fillRect(0, 0, W, H);
  // curtains
  for (let i = 0; i < 24; i++) { const x = i * 84, sh = 0.5 + 0.5 * Math.sin(i * 1.7 + Math.sin(t * 0.5 + i) * 0.3); g.fillStyle = `rgb(${20 + sh * 22},${12 + sh * 12},${40 + sh * 34})`; g.fillRect(x, 0, 86, 800); }
  const fl = g.createLinearGradient(0, 800, 0, H); fl.addColorStop(0, '#2a1f3a'); fl.addColorStop(1, '#0a0812'); g.fillStyle = fl; g.fillRect(0, 800, W, 280); g.fillStyle = 'rgba(255,220,180,0.25)'; g.fillRect(0, 800, W, 3);
  beam(g, t, 1250, -60, Math.PI / 2 + 0.05, { len: 1050, spread: 0.19, color: '255,225,190', alpha: 0.36, motes: 90, seed: 25 });
  g.save(); g.globalCompositeOperation = 'lighter'; const pg = g.createRadialGradient(1290, 900, 10, 1290, 900, 360); pg.addColorStop(0, 'rgba(255,225,190,0.4)'); pg.addColorStop(1, 'rgba(255,225,190,0)'); g.fillStyle = pg; g.beginPath(); g.ellipse(1290, 900, 380, 70, 0, 0, Math.PI * 2); g.fill(); g.restore();
  // lectern + microphone, nobody behind it
  const lg = g.createLinearGradient(1180, 0, 1400, 0); lg.addColorStop(0, '#3a3156'); lg.addColorStop(1, '#17122a'); g.fillStyle = lg; g.beginPath(); g.moveTo(1190, 560); g.lineTo(1390, 560); g.lineTo(1370, 900); g.lineTo(1210, 900); g.closePath(); g.fill(); g.fillStyle = '#4a4070'; g.beginPath(); g.moveTo(1170, 540); g.lineTo(1410, 540); g.lineTo(1390, 566); g.lineTo(1190, 566); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(255,225,190,0.7)'; g.lineWidth = 3; g.beginPath(); g.moveTo(1190, 560); g.lineTo(1210, 900); g.stroke();
  g.strokeStyle = '#0a0812'; g.lineWidth = 6; g.beginPath(); g.moveTo(1300, 540); g.quadraticCurveTo(1300, 470, 1262, 440); g.stroke(); g.fillStyle = '#0a0812'; g.beginPath(); g.ellipse(1254, 434, 20, 13, -0.6, 0, Math.PI * 2); g.fill();
  g.fillStyle = NV; g.fillRect(1250, 680, 80, 80); g.fillStyle = '#17300c'; g.fillRect(1268, 698, 44, 44);
}
void TEAL; void INK; void H;
