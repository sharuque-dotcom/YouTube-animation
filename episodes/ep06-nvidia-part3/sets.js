// Episode 6 set pieces (episode-3 night template). Pure functions of time t (seconds).
// Lighting notes: warm key from a practical (lamp, window, sign), cool city fill, rim light on edges.
import { W, H, clamp, lerp, rand, text } from '../../pipeline/engine.js';
import { sky, stars, moon, clouds, skyline, rain, mist, beam, glow, reflect, splashes } from '../../pipeline/scenery.js';
import { ez, out3, span, spring } from '../../pipeline/scenekit.js';
import { cityWindow } from '../ep04-deepfake/night.js';
import { jacketOnly } from './jacket.js';

const INK = '#f3efff', LAV = '#b9a2ff', RED = '#ff5c6e', GOLD = '#ffc93c', TEAL = '#3ee0b5', NV = '#76b900';
const SERIF = "'Playfair Display'";
const greek = (g, x, y, w, n, { gap = 30, h = 9, color = '#cfc8b8', seed = 1 } = {}) => { const r = rand(seed); g.fillStyle = color; for (let i = 0; i < n; i++) g.fillRect(x, y + i * gap, w * (0.62 + r() * 0.38), h); };

// ---------------------------------------------------------------- 1. the filing lands (dawn office)
/** A dark office before dawn; a monitor shows a filings list and a new row drops in at `at` */
export function dawnFiling(g, t, o = {}) {
  const a = o.at ?? 1.2;
  const wall = g.createLinearGradient(0, 0, W, 0); wall.addColorStop(0, '#0b091a'); wall.addColorStop(1, '#161129'); g.fillStyle = wall; g.fillRect(0, 0, W, H);
  // window: the city, with dawn starting at the horizon (warm band = the only warm light in a cool room)
  const win = [1260, 70, 600, 560];
  cityWindow(g, t, win, { moonAt: [0.78, 0.18], rainA: 0.22, seed: 61 });
  g.save(); g.beginPath(); g.rect(...win); g.clip(); g.globalCompositeOperation = 'lighter';
  const dg = g.createLinearGradient(0, win[1] + win[3] * 0.3, 0, win[1] + win[3]); dg.addColorStop(0, 'rgba(255,140,80,0)'); dg.addColorStop(1, `rgba(255,150,90,${0.38 + 0.04 * Math.sin(t * 0.8)})`);
  g.fillStyle = dg; g.fillRect(...win); g.restore();
  g.fillStyle = '#1a1430'; g.fillRect(win[0] - 16, win[1] - 16, win[2] + 32, 16); g.fillRect(win[0] - 16, win[1] + win[3], win[2] + 32, 22); g.fillRect(win[0] - 16, win[1], 16, win[3]); g.fillRect(win[0] + win[2], win[1], 16, win[3]); g.fillRect(win[0] + win[2] / 2 - 6, win[1], 12, win[3]);
  // dawn light falling into the room from the window
  beam(g, t, 1560, 380, 2.5, { len: 1100, spread: 0.3, color: '255,170,120', alpha: 0.1, motes: 40, seed: 3 });
  // desk
  const dk = g.createLinearGradient(0, 760, 0, H); dk.addColorStop(0, '#2c2136'); dk.addColorStop(1, '#0e0a14'); g.fillStyle = dk; g.fillRect(0, 760, W, H - 760);
  g.fillStyle = 'rgba(200,190,255,0.2)'; g.fillRect(0, 760, W, 3);
  // monitor
  const mx = 250, my = 120, mw = 900, mh = 540;
  g.fillStyle = '#07060c'; g.beginPath(); g.roundRect(mx - 18, my - 18, mw + 36, mh + 36, 22); g.fill();
  g.fillRect(mx + mw / 2 - 40, my + mh + 18, 80, 70); g.beginPath(); g.ellipse(mx + mw / 2, my + mh + 96, 190, 20, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(255,170,120,0.55)'; g.lineWidth = 3; g.beginPath(); g.moveTo(mx + mw + 18, my); g.lineTo(mx + mw + 18, my + mh); g.stroke(); // rim from the window
  g.save(); g.beginPath(); g.roundRect(mx, my, mw, mh, 8); g.clip();
  const sg = g.createLinearGradient(0, my, 0, my + mh); sg.addColorStop(0, '#1a1540'); sg.addColorStop(1, '#100c2a'); g.fillStyle = sg; g.fillRect(mx, my, mw, mh);
  g.fillStyle = '#2a2260'; g.fillRect(mx, my, mw, 70);
  text(g, 'EDGAR', mx + 30, my + 46, { font: 'Jakarta', weight: 800, size: 30, color: INK, spacing: 4 });
  text(g, 'Latest company filings', mx + 170, my + 45, { font: 'Inter', weight: 600, size: 22, color: LAV });
  // refresh spinner (motion from frame one)
  g.save(); g.translate(mx + mw - 50, my + 35); g.rotate(t * 5); g.strokeStyle = t > a ? TEAL : LAV; g.lineWidth = 4; g.beginPath(); g.arc(0, 0, 13, 0, Math.PI * 1.4); g.stroke(); g.restore();
  const p = ez(span(t, a, 0.5)), rowH = 62, y0 = my + 92;
  const r = rand(17);
  for (let i = 0; i < 8; i++) {
    const y = y0 + i * rowH + p * rowH;
    g.fillStyle = i % 2 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)'; g.fillRect(mx + 20, y, mw - 40, rowH - 8);
    g.fillStyle = 'rgba(185,162,255,0.35)'; g.beginPath(); g.roundRect(mx + 34, y + 12, 74, 30, 8); g.fill();
    g.fillStyle = 'rgba(220,214,255,0.28)'; g.fillRect(mx + 130, y + 20, 160 + r() * 200, 12); g.fillRect(mx + 520, y + 20, 120 + r() * 120, 12); g.fillRect(mx + mw - 150, y + 20, 100, 12);
  }
  if (t > a) {
    const fl = Math.sin(clamp((t - a) / 0.6) * Math.PI); // 8-frame build, ~10-frame recovery
    const y = y0 - rowH + p * rowH;
    g.fillStyle = `rgba(118,185,0,${0.22 + 0.4 * fl})`; g.fillRect(mx + 20, y, mw - 40, rowH - 8);
    g.strokeStyle = NV; g.lineWidth = 3; g.strokeRect(mx + 20, y, mw - 40, rowH - 8);
    g.fillStyle = NV; g.beginPath(); g.roundRect(mx + 34, y + 12, 74, 30, 8); g.fill();
    text(g, '8-K', mx + 71, y + 35, { font: 'Jakarta', weight: 800, size: 22, color: '#0c1a04', align: 'center' });
    text(g, 'NVIDIA CORP', mx + 130, y + 36, { font: 'Jakarta', weight: 800, size: 26, color: INK });
    text(g, 'Departure of certain officers', mx + 350, y + 35, { font: 'Inter', weight: 600, size: 21, color: '#d8ffb0' });
    text(g, '12 Nov 2026', mx + mw - 40, y + 35, { font: 'Inter', weight: 600, size: 20, color: INK, align: 'right' });
  }
  // cursor
  const cx = lerp(mx + 700, mx + 420, ez(span(t, a + 0.5, 1.2))), cy = lerp(my + 420, y0 + 30, ez(span(t, a + 0.5, 1.2)));
  g.fillStyle = '#fff'; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx, cy + 26); g.lineTo(cx + 7, cy + 20); g.lineTo(cx + 13, cy + 32); g.lineTo(cx + 18, cy + 30); g.lineTo(cx + 12, cy + 18); g.lineTo(cx + 20, cy + 18); g.closePath(); g.fill();
  g.restore();
  glow(g, mx + mw / 2, my + mh / 2, 760, '120,110,255', 0.16); glow(g, mx + mw / 2, 800, 520, '120,110,255', 0.2);
  if (t > a) glow(g, mx + mw / 2, y0, 500, '118,185,0', 0.18 * Math.sin(clamp((t - a) / 0.6) * Math.PI) + 0.05);
  // keyboard, mug with steam
  g.save(); g.translate(700, 870); g.transform(1, 0, -0.3, 0.5, 0, 0); g.fillStyle = '#0c0a14'; g.beginPath(); g.roundRect(-300, -90, 600, 180, 16); g.fill();
  for (let rr = 0; rr < 4; rr++) for (let c = 0; c < 14; c++) { g.fillStyle = `rgba(150,140,255,${0.14 + 0.08 * Math.sin(t * 2 + c + rr)})`; g.fillRect(-280 + c * 40, -72 + rr * 40, 32, 30); } g.restore();
  g.fillStyle = '#d9cfe8'; g.beginPath(); g.roundRect(1240, 770, 84, 92, 12); g.fill(); g.strokeStyle = '#d9cfe8'; g.lineWidth = 10; g.beginPath(); g.arc(1330, 815, 24, -1.3, 1.3); g.stroke();
  g.strokeStyle = 'rgba(255,170,120,0.7)'; g.lineWidth = 3; g.beginPath(); g.moveTo(1322, 776); g.lineTo(1322, 856); g.stroke();
  for (let k = 0; k < 3; k++) { g.strokeStyle = `rgba(230,225,255,${0.16 - k * 0.03})`; g.lineWidth = 5; g.beginPath(); for (let i = 0; i <= 20; i++) { const u = i / 20, x = 1262 + k * 20 + Math.sin(u * 5 + t * 1.5 + k * 2) * 12 * u, y = 770 - u * 150; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
}

// ---------------------------------------------------------------- 2. the page itself
/** The filing under a desk lamp. `type` = when the key sentence types in, `hl` = when it is highlighted, `lens` = when a lens starts searching */
export function filingPage(g, t, o = {}) {
  const ty = o.type ?? 0.3, hl = o.hl ?? 99, lens = o.lens ?? 99;
  const bg = g.createRadialGradient(700, 420, 60, 960, 560, 1200); bg.addColorStop(0, '#4a3540'); bg.addColorStop(1, '#0d0914'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.save(); g.translate(960, 500); g.rotate(-0.025);
  g.shadowColor = 'rgba(0,0,0,0.6)'; g.shadowBlur = 60; g.shadowOffsetY = 24; g.fillStyle = '#f4efe4'; g.fillRect(-560, -430, 1120, 1300); g.shadowColor = 'transparent';
  const pg = g.createLinearGradient(-560, 0, 560, 0); pg.addColorStop(0, 'rgba(255,215,160,0.25)'); pg.addColorStop(1, 'rgba(120,110,200,0.18)'); g.fillStyle = pg; g.fillRect(-560, -430, 1120, 1300);
  text(g, 'UNITED STATES SECURITIES AND EXCHANGE COMMISSION', 0, -370, { font: 'Inter', weight: 600, size: 20, color: '#5a5448', align: 'center', spacing: 3 });
  text(g, 'FORM 8-K', 0, -270, { font: SERIF, weight: 900, size: 96, color: '#1d1b29', align: 'center' });
  text(g, 'CURRENT REPORT', 0, -222, { font: 'Inter', weight: 600, size: 22, color: '#5a5448', align: 'center', spacing: 5 });
  g.fillStyle = '#1d1b29'; g.fillRect(-480, -196, 960, 3);
  text(g, 'NVIDIA CORPORATION', -480, -138, { font: 'Jakarta', weight: 800, size: 40, color: '#1d1b29' });
  text(g, 'Departure of Directors or Certain Officers', -480, -96, { font: 'Inter', weight: 600, size: 24, color: '#4a4438' });
  greek(g, -480, -56, 960, 2, { seed: 2 });
  // the key sentence types in
  const l1 = 'Jensen Huang resigned as President and', l2a = 'Chief Executive Officer, ', l2b = 'effective immediately.';
  const n = Math.floor(span(t, ty, 2.6) * (l1.length + l2a.length + l2b.length));
  g.font = `400 46px ${SERIF}`;
  const w2a = g.measureText(l2a).width, w2b = g.measureText(l2b).width;
  const hp = ez(span(t, hl, 0.5));
  if (hp > 0) { g.fillStyle = 'rgba(255,92,110,0.42)'; g.fillRect(-484 + w2a, 78, (w2b + 12) * hp, 60); }
  text(g, l1.slice(0, n), -480, 60, { font: SERIF, weight: 400, size: 46, color: '#1d1b29' });
  text(g, l2a.slice(0, Math.max(0, n - l1.length)), -480, 122, { font: SERIF, weight: 400, size: 46, color: '#1d1b29' });
  text(g, l2b.slice(0, Math.max(0, n - l1.length - l2a.length)), -480 + w2a, 122, { font: SERIF, weight: hp > 0.5 ? 900 : 400, size: 46, color: hp > 0.5 ? '#a8182c' : '#1d1b29' });
  if (n < l1.length + l2a.length + l2b.length && Math.sin(t * 14) > 0) { const cxp = n <= l1.length ? -480 + g.measureText(l1.slice(0, n)).width : -480 + g.measureText((l2a + l2b).slice(0, n - l1.length)).width; g.fillStyle = '#1d1b29'; g.fillRect(cxp + 4, n <= l1.length ? 22 : 84, 3, 44); }
  if (hp > 0) { g.strokeStyle = '#d5213a'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(-484 + w2a, 146); g.lineTo(-484 + w2a + (w2b + 12) * hp, 146 + Math.sin(hp * 6) * 3); g.stroke(); }
  greek(g, -480, 190, 960, 14, { seed: 3, gap: 34 });
  // a lens searches the rest of the page and finds nothing
  if (t > lens) {
    const u = t - lens, lx = -260 + Math.sin(u * 1.1) * 300 + u * 30, ly = 330 + Math.sin(u * 1.7 + 1) * 110;
    g.save(); g.beginPath(); g.arc(lx, ly, 120, 0, Math.PI * 2); g.clip(); g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(lx - 130, ly - 130, 260, 260); g.translate(lx, ly); g.scale(1.5, 1.5); g.translate(-lx, -ly); greek(g, -480, 190, 960, 14, { seed: 3, gap: 34, color: '#a59d8c' });
    g.restore();
    g.fillStyle = 'rgba(255,60,80,0.55)'; g.fillRect(lx - 118, ly + Math.sin(u * 6) * 90, 236, 3);
    g.strokeStyle = '#1a1626'; g.lineWidth = 16; g.beginPath(); g.arc(lx, ly, 120, 0, Math.PI * 2); g.stroke(); g.strokeStyle = 'rgba(255,220,180,0.7)'; g.lineWidth = 3; g.beginPath(); g.arc(lx, ly, 128, -2.6, -1.2); g.stroke();
    g.strokeStyle = '#1a1626'; g.lineWidth = 30; g.lineCap = 'round'; g.beginPath(); g.moveTo(lx + 92, ly + 92); g.lineTo(lx + 200, ly + 200); g.stroke();
  }
  g.restore();
  // warm key from the lamp (top left), motes in the beam
  beam(g, t, 120, -80, 0.75, { len: 1500, spread: 0.3, color: '255,205,150', alpha: 0.2, motes: 60, seed: 4 });
  glow(g, 1750, 900, 500, '110,100,230', 0.14);
}

// ---------------------------------------------------------------- 3. the empty chair
function execChair(g) {
  const cg = g.createLinearGradient(-130, -330, 130, 40); cg.addColorStop(0, '#2a2433'); cg.addColorStop(0.5, '#15121c'); cg.addColorStop(1, '#08070c');
  g.fillStyle = '#0a0810'; g.fillRect(-10, 60, 20, 80); for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2 + 0.3; g.beginPath(); g.moveTo(0, 140); g.lineTo(Math.cos(a) * 130, 150 + Math.sin(a) * 26); g.lineWidth = 12; g.strokeStyle = '#0a0810'; g.stroke(); }
  g.fillStyle = cg; g.beginPath(); g.roundRect(-118, -310, 236, 350, 44); g.fill();
  g.fillStyle = '#100d16'; g.beginPath(); g.roundRect(-150, 20, 300, 56, 24); g.fill();
  g.beginPath(); g.roundRect(-168, -90, 34, 130, 14); g.fill(); g.beginPath(); g.roundRect(134, -90, 34, 130, 14); g.fill();
  g.strokeStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = 3; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-90, -230 + i * 80); g.lineTo(90, -230 + i * 80); g.stroke(); }
  g.strokeStyle = 'rgba(255,215,170,0.65)'; g.lineWidth = 4; g.beginPath(); g.moveTo(-118, -40); g.lineTo(-118, -270); g.quadraticCurveTo(-116, -308, -76, -310); g.lineTo(60, -310); g.stroke(); g.strokeStyle = 'rgba(130,150,255,0.5)'; g.lineWidth = 3; g.beginPath(); g.moveTo(118, -260); g.lineTo(118, 0); g.stroke(); // warm rim (key side) + cool rim (city side)
}
/** The head chair under a single pendant; the leather jacket lifts away (lift 0..1) */
export function emptyChair(g, t, { lift = 0 } = {}) {
  g.fillStyle = '#05040f'; g.fillRect(0, 0, W, H);
  cityWindow(g, t, [0, 0, W, 640], { moonAt: [0.84, 0.2], rainA: 0.3, seed: 63 });
  g.fillStyle = 'rgba(5,4,15,0.4)'; g.fillRect(0, 0, W, 640);
  for (let i = 1; i < 6; i++) { g.fillStyle = '#080714'; g.fillRect(i * 320 - 6, 0, 12, 640); }
  const fl = g.createLinearGradient(0, 640, 0, H); fl.addColorStop(0, '#15102a'); fl.addColorStop(1, '#06050d'); g.fillStyle = fl; g.fillRect(0, 640, W, H - 640);
  beam(g, t, 960, -60, Math.PI / 2, { len: 1050, spread: 0.2, color: '255,215,170', alpha: 0.34, motes: 90, seed: 5 });
  g.save(); g.globalCompositeOperation = 'lighter'; const pgr = g.createRadialGradient(960, 990, 10, 960, 990, 420); pgr.addColorStop(0, 'rgba(255,215,170,0.34)'); pgr.addColorStop(1, 'rgba(255,215,170,0)'); g.fillStyle = pgr; g.beginPath(); g.ellipse(960, 990, 430, 80, 0, 0, Math.PI * 2); g.fill(); g.restore();
  g.save(); g.translate(960, 800); g.scale(1.55, 1.55); execChair(g); g.restore();
  const k = ez(clamp(lift));
  if (k < 1) { g.save(); g.globalAlpha = 1 - k * k; g.translate(960 + k * 90, 800 - k * 560); g.rotate(k * 0.22 + Math.sin(t * 2.2) * 0.02 * k); jacketOnly(g, t, 0, -10, 1.3 * (1 - k * 0.12), { lit: 1 }); g.restore(); }
  rain(g, t, { n: 140, alpha: 0.16, rect: [0, 0, W, 640] });
}

// ---------------------------------------------------------------- 4. the calendar runs backwards
const DAYS = [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 31, 30, 29];
export function calendarRewind(g, t, a) {
  const f = ez(span(t, a + 0.35, 2.4)) * 14, idx = Math.min(14, Math.floor(f)), fr = f - idx;
  const p = spring(t, a, 1.6, 0.65);
  // torn pages fly off behind
  for (let i = 0; i < idx; i++) { const u = (f - i) / 6; if (u > 1) continue; g.save(); g.translate(700 - u * 760 - Math.sin(i) * 60, 520 - u * 520 + u * u * 300); g.rotate(-u * 3 - i); g.globalAlpha = 1 - u; g.fillStyle = '#efe8da'; g.fillRect(-120, -140, 240, 280); g.fillStyle = '#d52b1e'; g.fillRect(-120, -140, 240, 60); g.restore(); }
  g.save(); g.translate(700, 540); g.scale(Math.min(1.04, p) * 1.25, Math.min(1.04, p) * 1.25); g.rotate(-0.04);
  for (let k = 3; k > 0; k--) { g.fillStyle = `rgba(220,212,196,${0.5})`; g.beginPath(); g.roundRect(-150 + k * 5, -170 + k * 6, 300, 340, 22); g.fill(); }
  g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 40; g.fillStyle = '#f7f1e6'; g.beginPath(); g.roundRect(-150, -170, 300, 340, 22); g.fill(); g.shadowColor = 'transparent';
  g.fillStyle = '#d52b1e'; g.beginPath(); g.roundRect(-150, -170, 300, 90, [22, 22, 0, 0]); g.fill();
  for (const x of [-80, 80]) { g.fillStyle = '#2a2433'; g.beginPath(); g.roundRect(x - 9, -196, 18, 50, 9); g.fill(); }
  text(g, idx <= 11 ? 'NOVEMBER' : 'OCTOBER', 0, -110, { font: 'Jakarta', weight: 800, size: 36, color: '#fff', align: 'center', spacing: 4 });
  g.save(); g.translate(0, 30); g.scale(1, idx < 14 ? 0.35 + 0.65 * Math.abs(Math.cos(fr * Math.PI)) : 1); text(g, String(DAYS[idx]), 0, 62, { font: 'Jakarta', weight: 800, size: 170, color: idx === 14 ? '#a8182c' : '#1d1b29', align: 'center' }); g.restore();
  g.restore();
  // the count
  const cp = spring(t, a + 0.2, 1.6, 0.7);
  if (cp > 0.01) { g.save(); g.translate(1300, 540); g.scale(Math.min(1.04, cp), Math.min(1.04, cp)); text(g, String(idx), 0, 40, { font: 'Jakarta', weight: 800, size: 260, color: idx === 14 ? GOLD : INK, align: 'center' }); text(g, 'DAYS EARLIER', 0, 120, { font: 'Jakarta', weight: 800, size: 44, color: LAV, align: 'center', spacing: 8 }); g.restore(); if (idx === 14) glow(g, 1300, 480, 420, '255,201,60', 0.14); }
}

// ---------------------------------------------------------------- 5. the diner, 1993
export function diner(g, t) {
  sky(g, { top: '#05061a', mid: '#12123a', horizon: '#2b2350', hy: 860 }); stars(g, t, { n: 70, maxY: 380, alpha: 0.4, seed: 9 });
  moon(g, 1640, 150, 34);
  clouds(g, t, { y: 190, h: 120, seed: 71, n: 9, scale: 0.7, lx: 1640, ly: 150, speed: 5, alpha: 0.85 });
  skyline(g, t, { base: 800, seed: 72, depth: 0.15, color: '#191640', lit: 0.08, tall: 0.35, fog: 'rgba(80,65,125,0.5)' });
  // distant hills + a far road with headlights
  g.fillStyle = '#100e2a'; g.beginPath(); g.moveTo(0, 800); for (let x = 0; x <= W; x += 40) g.lineTo(x, 760 - Math.sin(x * 0.004) * 30 - Math.sin(x * 0.011) * 14); g.lineTo(W, 860); g.lineTo(0, 860); g.closePath(); g.fill();
  for (let k = 0; k < 3; k++) { const hx = ((t * (40 + k * 14) + k * 700) % (W + 200)) - 100; glow(g, hx, 812, 26, '255,230,190', 0.7); }
  mist(g, t, { y: 780, h: 110, alpha: 0.2 });
  // neon sign on a pole
  const fk = (Math.sin(t * 23) > 0.955 || Math.sin(t * 7.3) > 0.985) ? 0.5 : 1;
  g.fillStyle = '#17132b'; g.fillRect(232, 330, 18, 540);
  g.fillStyle = '#150f26'; g.beginPath(); g.roundRect(70, 150, 340, 190, 22); g.fill();
  g.save(); g.shadowColor = `rgba(255,70,100,${0.95 * fk})`; g.shadowBlur = 34; g.strokeStyle = `rgba(255,96,120,${fk})`; g.lineWidth = 6; g.beginPath(); g.roundRect(84, 164, 312, 162, 16); g.stroke();
  text(g, 'DINER', 240, 262, { font: 'Jakarta', weight: 800, size: 88, color: `rgba(255,150,165,${fk})`, align: 'center', spacing: 6 }); g.restore();
  g.save(); g.shadowColor = 'rgba(62,224,181,0.9)'; g.shadowBlur = 18; text(g, 'OPEN 24 HOURS', 240, 306, { font: 'Jakarta', weight: 800, size: 24, color: '#9fffe0', align: 'center', spacing: 4 }); g.restore();
  glow(g, 240, 250, 380, '255,80,110', 0.3 * fk);
  // the building
  const bx = 470, bw = 1200, by = 470, gy = 860;
  g.fillStyle = '#221a38'; g.fillRect(bx - 36, by - 44, bw + 72, 58); g.fillStyle = '#2e2446'; g.fillRect(bx - 36, by - 44, bw + 72, 8);
  g.save(); g.shadowColor = 'rgba(255,70,100,0.9)'; g.shadowBlur = 22; g.fillStyle = '#ff6078'; g.fillRect(bx - 36, by + 6, bw + 72, 7); g.restore();
  const wg = g.createLinearGradient(0, by, 0, gy); wg.addColorStop(0, '#2b2142'); wg.addColorStop(1, '#17122a'); g.fillStyle = wg; g.fillRect(bx, by + 14, bw, gy - by - 14);
  g.fillStyle = 'rgba(255,255,255,0.04)'; for (let i = 0; i < 14; i++) g.fillRect(bx, by + 40 + i * 26, bw, 2);
  // rooftop vent with steam
  g.fillStyle = '#1a1430'; g.fillRect(1400, by - 86, 70, 44);
  for (let k = 0; k < 4; k++) { const u = ((t * 0.3 + k / 4) % 1); glow(g, 1435 + Math.sin(u * 5 + k) * 30 + u * 60, by - 90 - u * 170, 40 + u * 70, '190,180,230', 0.16 * (1 - u)); }
  // windows (warm practical light = the key)
  for (let i = 0; i < 4; i++) {
    const wx = bx + 40 + i * 262, wy = by + 78, ww = 232, wh = 196;
    if (i === 3) { // the door
      g.fillStyle = '#120e20'; g.fillRect(wx + 60, wy - 20, 130, gy - wy + 20); const dg2 = g.createLinearGradient(0, wy, 0, gy); dg2.addColorStop(0, '#ffd9a0'); dg2.addColorStop(1, '#d88f50'); g.fillStyle = dg2; g.fillRect(wx + 74, wy - 6, 102, 210); g.fillStyle = '#c9a24a'; g.fillRect(wx + 160, wy + 110, 8, 40);
      glow(g, wx + 125, wy - 50, 70, '255,200,140', 0.8); continue;
    }
    const lg = g.createLinearGradient(0, wy, 0, wy + wh); lg.addColorStop(0, '#ffe2ae'); lg.addColorStop(1, '#e09a55'); g.fillStyle = lg; g.fillRect(wx, wy, ww, wh);
    g.save(); g.beginPath(); g.rect(wx, wy, ww, wh); g.clip();
    // pendant lamp, booth backs
    g.fillStyle = '#3a2418'; g.fillRect(wx + ww / 2 - 2, wy, 4, 34); g.beginPath(); g.moveTo(wx + ww / 2 - 26, wy + 52); g.lineTo(wx + ww / 2 + 26, wy + 52); g.lineTo(wx + ww / 2 + 12, wy + 32); g.lineTo(wx + ww / 2 - 12, wy + 32); g.closePath(); g.fill(); glow(g, wx + ww / 2, wy + 60, 70, '255,245,210', 0.8);
    g.fillStyle = '#8c2b33'; g.beginPath(); g.roundRect(wx - 20, wy + 120, 70, 110, 16); g.fill(); g.beginPath(); g.roundRect(wx + ww - 50, wy + 120, 70, 110, 16); g.fill();
    g.fillStyle = '#5a3a26'; g.fillRect(wx + 40, wy + 150, ww - 80, 10);
    if (i === 1) { // three engineers at the table; the middle one sketches, one gestures
      [[-62, 0], [0, -6], [62, 0]].forEach(([dx, dy], k) => { const hx = wx + ww / 2 + dx, hy = wy + 96 + dy + Math.sin(t * 1.4 + k * 2) * 2; g.fillStyle = 'rgba(26,14,22,0.92)'; g.beginPath(); g.arc(hx, hy, 17, 0, Math.PI * 2); g.fill(); g.beginPath(); g.moveTo(hx - 30, wy + 156); g.quadraticCurveTo(hx - 28, hy + 22, hx, hy + 20); g.quadraticCurveTo(hx + 28, hy + 22, hx + 30, wy + 156); g.closePath(); g.fill(); });
      const ga = Math.sin(t * 3) * 0.5; g.strokeStyle = 'rgba(26,14,22,0.92)'; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(wx + ww / 2 + 84, wy + 134); g.lineTo(wx + ww / 2 + 84 + Math.cos(-1 + ga) * 34, wy + 134 + Math.sin(-1 + ga) * 34); g.stroke();
      g.fillStyle = '#fff'; g.fillRect(wx + ww / 2 - 16, wy + 142, 32, 8);
    } else if (i === 2) { const px = wx - 60 + ((t * 38) % (ww + 120)); g.fillStyle = 'rgba(26,14,22,0.8)'; g.beginPath(); g.arc(px, wy + 70, 15, 0, Math.PI * 2); g.fill(); g.fillRect(px - 16, wy + 86, 32, 110); g.fillRect(px + 10, wy + 100, 34, 6); } // a waiter walks past with a tray
    else { g.fillStyle = '#fff'; g.fillRect(wx + 70, wy + 136, 14, 14); g.fillRect(wx + 140, wy + 138, 10, 12); }
    g.restore();
    g.strokeStyle = '#120e20'; g.lineWidth = 10; g.strokeRect(wx, wy, ww, wh); g.lineWidth = 4; g.beginPath(); g.moveTo(wx + ww / 2, wy); g.lineTo(wx + ww / 2, wy + 26); g.stroke();
    glow(g, wx + ww / 2, wy + wh / 2, 240, '255,190,120', 0.2);
    // light spilling onto the wet ground (exponential falloff)
    g.save(); g.globalCompositeOperation = 'lighter'; const sp = g.createLinearGradient(0, gy, 0, gy + 200); sp.addColorStop(0, 'rgba(255,190,120,0.26)'); sp.addColorStop(1, 'rgba(255,190,120,0)'); g.fillStyle = sp; g.beginPath(); g.moveTo(wx, gy); g.lineTo(wx + ww, gy); g.lineTo(wx + ww + 90, gy + 200); g.lineTo(wx - 90, gy + 200); g.closePath(); g.fill(); g.restore();
  }
  // ground + parking lines
  const gg = g.createLinearGradient(0, gy, 0, H); gg.addColorStop(0, '#1a1530'); gg.addColorStop(1, '#07060f'); g.globalCompositeOperation = 'destination-over'; g.fillStyle = gg; g.fillRect(0, gy, W, H - gy); g.globalCompositeOperation = 'source-over';
  g.strokeStyle = 'rgba(230,225,255,0.14)'; g.lineWidth = 5; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(300 + i * 300, gy + 30); g.lineTo(220 + i * 330, H); g.stroke(); }
  // a parked car, rim-lit by the windows
  g.save(); g.translate(1560, 842);
  g.fillStyle = '#0a0916'; g.beginPath(); g.moveTo(-190, 40); g.lineTo(-190, -10); g.quadraticCurveTo(-170, -34, -110, -38); g.lineTo(-70, -84); g.quadraticCurveTo(-60, -94, -40, -94); g.lineTo(70, -94); g.quadraticCurveTo(92, -92, 104, -76); g.lineTo(134, -36); g.quadraticCurveTo(186, -30, 192, 0); g.lineTo(192, 40); g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,200,140,0.22)'; g.beginPath(); g.moveTo(-58, -80); g.lineTo(10, -80); g.lineTo(10, -40); g.lineTo(-96, -40); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(255,205,150,0.7)'; g.lineWidth = 3; g.beginPath(); g.moveTo(-190, -10); g.quadraticCurveTo(-170, -34, -110, -38); g.lineTo(-70, -84); g.quadraticCurveTo(-60, -94, -40, -94); g.lineTo(40, -94); g.stroke();
  g.fillStyle = '#05040a'; g.beginPath(); g.arc(-110, 42, 34, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(110, 42, 34, 0, Math.PI * 2); g.fill();
  g.restore(); glow(g, 1752, 838, 50, '255,60,70', 0.7);
  reflect(g, t, gy + 14, 200, { alpha: 0.42 });
  rain(g, t, { n: 700, alpha: 0.42 }); splashes(g, t, { y0: gy + 20, y1: H - 10 });
}

// ---------------------------------------------------------------- 6. the napkin sketch
const SK = (() => { const s = []; const L = (a, b, c, d) => s.push([a, b, c, d]);
  L(-130, -110, 130, -110); L(130, -110, 130, 110); L(130, 110, -130, 110); L(-130, 110, -130, -110);
  for (let i = 0; i < 6; i++) { const u = -100 + i * 40; L(u, -110, u, -150); L(u, 110, u, 150); L(-130, u * 0.9, -170, u * 0.9); L(130, u * 0.9, 170, u * 0.9); }
  L(-60, -50, 60, -50); L(60, -50, 60, 50); L(60, 50, -60, 50); L(-60, 50, -60, -50); L(-60, -50, 60, 50); L(60, -50, -60, 50);
  L(190, 0, 270, 0); L(250, -16, 270, 0); L(270, 0, 250, 16);
  return s; })();
const SKLEN = SK.reduce((n, [a, b, c, d]) => n + Math.hypot(c - a, d - b), 0);
export function napkin(g, t, { draw0 = 0.2, dur = 6 } = {}) {
  const bg = g.createRadialGradient(900, 540, 60, 960, 560, 1150); bg.addColorStop(0, '#6a4632'); bg.addColorStop(0.6, '#3a241c'); bg.addColorStop(1, '#120b0e'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  const r = rand(21); g.strokeStyle = 'rgba(20,8,4,0.22)'; g.lineWidth = 2; for (let i = 0; i < 46; i++) { const y = r() * H, x0 = r() * 400 - 200; g.beginPath(); g.moveTo(x0, y); g.bezierCurveTo(x0 + 500, y + (r() - 0.5) * 50, x0 + 1200, y + (r() - 0.5) * 50, x0 + 2200, y + (r() - 0.5) * 30); g.stroke(); }
  // coffee cup + steam
  g.save(); g.translate(360, 300); g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 30; g.shadowOffsetX = 14; g.shadowOffsetY = 18; g.fillStyle = '#e9e2d6'; g.beginPath(); g.arc(0, 0, 150, 0, Math.PI * 2); g.fill(); g.shadowColor = 'transparent';
  g.strokeStyle = '#cfc6b6'; g.lineWidth = 4; g.beginPath(); g.arc(0, 0, 122, 0, Math.PI * 2); g.stroke(); g.fillStyle = '#f7f2e8'; g.beginPath(); g.arc(0, 0, 104, 0, Math.PI * 2); g.fill();
  const cf = g.createRadialGradient(-20, -20, 6, 0, 0, 88); cf.addColorStop(0, '#6a4024'); cf.addColorStop(1, '#2a160c'); g.fillStyle = cf; g.beginPath(); g.arc(0, 0, 88, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(255,225,190,0.5)'; g.lineWidth = 5; g.beginPath(); g.arc(0, 0, 70, -2.5 + Math.sin(t * 0.8) * 0.1, -1.6); g.stroke();
  g.fillStyle = '#f7f2e8'; g.beginPath(); g.roundRect(96, -22, 86, 44, 22); g.fill(); g.restore();
  for (let k = 0; k < 3; k++) { g.strokeStyle = `rgba(255,240,220,${0.14 - k * 0.03})`; g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); for (let i = 0; i <= 20; i++) { const u = i / 20, x = 330 + k * 30 + Math.sin(u * 4 + t * 1.2 + k * 2) * 30 * u, y = 280 - u * 260; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
  // a menu corner, cutlery
  g.save(); g.translate(1680, 170); g.rotate(0.3); g.fillStyle = '#8c2b33'; g.fillRect(-200, -260, 400, 520); g.strokeStyle = '#e8c47f'; g.lineWidth = 4; g.strokeRect(-176, -236, 352, 472); text(g, 'MENU', 0, 30, { font: SERIF, weight: 900, size: 70, color: '#e8c47f', align: 'center', spacing: 8 }); g.restore();
  g.save(); g.translate(1560, 760); g.rotate(-0.5); g.fillStyle = '#c9c6d2'; g.beginPath(); g.roundRect(-12, -220, 24, 440, 12); g.fill(); g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(-4, -200, 4, 400); g.restore();
  // the napkin
  g.save(); g.translate(960, 600); g.rotate(-0.06);
  g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 40; g.shadowOffsetX = 16; g.shadowOffsetY = 22; g.fillStyle = '#f8f4ec'; g.fillRect(-360, -270, 720, 540); g.shadowColor = 'transparent';
  const ng = g.createLinearGradient(-360, -270, 360, 270); ng.addColorStop(0, 'rgba(255,215,160,0.3)'); ng.addColorStop(1, 'rgba(90,70,120,0.2)'); g.fillStyle = ng; g.fillRect(-360, -270, 720, 540);
  g.strokeStyle = 'rgba(160,150,135,0.5)'; g.lineWidth = 2; g.setLineDash([3, 9]); g.strokeRect(-336, -246, 672, 492); g.setLineDash([]); g.strokeStyle = 'rgba(120,110,100,0.18)'; g.beginPath(); g.moveTo(0, -270); g.lineTo(0, 270); g.stroke();
  // the chip is sketched stroke by stroke
  let left = ez(span(t, draw0, dur)) * SKLEN, px = SK[0][0], py = SK[0][1];
  g.strokeStyle = '#1c2a6a'; g.lineWidth = 5; g.lineCap = 'round';
  for (let i = 0; i < SK.length && left > 0; i++) { const [a, b, c, d] = SK[i], len = Math.hypot(c - a, d - b), u = Math.min(1, left / len), wob = Math.sin(i * 7.3) * 2.5; g.beginPath(); g.moveTo(a - 40 + wob, b - wob); px = lerp(a, c, u) - 40; py = lerp(b, d, u); g.lineTo(px + wob * (1 - u), py + wob * u); g.stroke(); left -= len; }
  // the pen follows the line
  g.save(); g.translate(px + Math.sin(t * 30) * 1.5, py); g.rotate(0.75 + Math.sin(t * 3) * 0.05);
  g.shadowColor = 'rgba(0,0,0,0.4)'; g.shadowBlur = 14; g.shadowOffsetX = 10; g.shadowOffsetY = 14;
  g.fillStyle = '#1c2a6a'; g.beginPath(); g.moveTo(0, 0); g.lineTo(-9, -26); g.lineTo(9, -26); g.closePath(); g.fill(); g.fillStyle = '#20264a'; g.beginPath(); g.roundRect(-11, -330, 22, 306, 8); g.fill(); g.fillStyle = '#c9c6d2'; g.fillRect(-11, -60, 22, 10); g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(-6, -320, 4, 250);
  g.restore();
  g.restore();
  // warm lamp key from top-left, cool vignette
  beam(g, t, 160, -100, 0.85, { len: 1500, spread: 0.3, color: '255,210,150', alpha: 0.2, motes: 50, seed: 8 });
}

// ---------------------------------------------------------------- 7. games in, intelligence out
const SHIP = ['...##...', '..####..', '.######.', '##.##.##', '########', '.#.##.#.', '#......#', '.#....#.'];
function chipBody(g, s, t, pulse = 1) {
  g.save(); g.shadowColor = `rgba(118,185,0,${0.8 * pulse})`; g.shadowBlur = 50; const cg = g.createLinearGradient(-s, -s, s, s); cg.addColorStop(0, '#2d4a12'); cg.addColorStop(1, '#0f1c07'); g.fillStyle = cg; g.beginPath(); g.roundRect(-s, -s, s * 2, s * 2, s * 0.14); g.fill(); g.restore();
  g.strokeStyle = NV; g.lineWidth = 4; g.beginPath(); g.roundRect(-s, -s, s * 2, s * 2, s * 0.14); g.stroke();
  for (let i = 0; i < 9; i++) { const u = -s * 0.8 + i * s * 0.2; g.fillStyle = '#b8c4a8'; g.fillRect(u - 5, -s - 26, 10, 22); g.fillRect(u - 5, s + 4, 10, 22); g.fillRect(-s - 26, u - 5, 22, 10); g.fillRect(s + 4, u - 5, 22, 10); }
  const dg = g.createLinearGradient(-s * 0.5, -s * 0.5, s * 0.5, s * 0.5); dg.addColorStop(0, '#9be36a'); dg.addColorStop(1, '#3d7a14'); g.fillStyle = dg; g.fillRect(-s * 0.5, -s * 0.5, s, s);
  g.strokeStyle = 'rgba(10,30,4,0.5)'; g.lineWidth = 2; for (let i = 1; i < 5; i++) { g.beginPath(); g.moveTo(-s * 0.5 + i * s * 0.2, -s * 0.5); g.lineTo(-s * 0.5 + i * s * 0.2, s * 0.5); g.moveTo(-s * 0.5, -s * 0.5 + i * s * 0.2); g.lineTo(s * 0.5, -s * 0.5 + i * s * 0.2); g.stroke(); }
  const sw = ((t * 0.6) % 1.6) - 0.3; g.save(); g.beginPath(); g.rect(-s * 0.5, -s * 0.5, s, s); g.clip(); g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.moveTo(-s * 0.5 + sw * s, -s * 0.5); g.lineTo(-s * 0.5 + sw * s + 30, -s * 0.5); g.lineTo(-s * 0.5 + sw * s - 30, s * 0.5); g.lineTo(-s * 0.5 + sw * s - 60, s * 0.5); g.closePath(); g.fill(); g.restore();
  g.strokeStyle = 'rgba(255,225,190,0.6)'; g.lineWidth = 3; g.beginPath(); g.moveTo(-s, s * 0.5); g.lineTo(-s, -s * 0.86); g.quadraticCurveTo(-s, -s, -s * 0.86, -s); g.lineTo(s * 0.4, -s); g.stroke();
}
export function chipMorph(g, t, k) {
  g.fillStyle = '#06051a'; g.fillRect(0, 0, W, H);
  const r0 = rand(4); for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(185,162,255,${0.06 + r0() * 0.1})`; g.fillRect(r0() * W, r0() * H, 2, 2); }
  glow(g, 960, 540, 620, '118,185,0', 0.12 + 0.03 * Math.sin(t * 3));
  const ai = ez(span(t, k, 1.2));
  // left: a pixel game streams into the chip
  const cols = ['#ff5c6e', '#ffc93c', '#3ee0b5', '#6aa8ff', '#b9a2ff'];
  const r = rand(31);
  for (let i = 0; i < 70; i++) { const sp = 0.16 + r() * 0.14, ph = (t * sp + r()) % 1, sy = (r() - 0.5) * 640, x = lerp(60, 800, ph), y = 540 + sy * Math.pow(1 - ph, 1.6), sz = Math.round(lerp(26, 10, ph) / 2) * 2; g.globalAlpha = Math.min(1, ph * 6) * (1 - ai * 0.45); g.fillStyle = cols[i % 5]; g.fillRect(Math.round(x / 6) * 6, Math.round(y / 6) * 6, sz, sz); }
  g.globalAlpha = 1 - ai * 0.4;
  SHIP.forEach((row, ry) => [...row].forEach((ch, rx) => { if (ch === '#') { g.fillStyle = (rx + ry) % 3 ? '#3ee0b5' : '#b9fff0'; g.fillRect(150 + rx * 18, 250 + ry * 18 + Math.round(Math.sin(t * 2.4) * 3) * 6, 16, 16); } }));
  SHIP.forEach((row, ry) => [...row].forEach((ch, rx) => { if (ch === '#') { g.fillStyle = '#ff5c6e'; g.fillRect(230 + rx * 14, 760 + ry * 14 + Math.round(Math.sin(t * 2 + 2) * 3) * 6, 12, 12); } }));
  g.globalAlpha = 1;
  // right: the neural web lights up
  const layers = [[1230, 4], [1470, 6], [1710, 4]];
  const node = (li, ni) => { const [x, n] = layers[li]; return [x, 540 + (ni - (n - 1) / 2) * (li === 1 ? 118 : 150)]; };
  const base = 0.14, act = (li) => base + (1 - base) * ez(span(t, k + li * 0.3, 0.8));
  for (let li = 0; li < 3; li++) for (let ni = 0; ni < layers[li][1]; ni++) {
    const [x, y] = node(li, ni);
    const srcs = li === 0 ? [[1090, 540]] : Array.from({ length: layers[li - 1][1] }, (_, j) => node(li - 1, j));
    srcs.forEach(([sx, sy], j) => { g.strokeStyle = `rgba(185,162,255,${0.3 * act(li)})`; g.lineWidth = 2; g.beginPath(); g.moveTo(sx, sy); g.lineTo(x, y); g.stroke(); if (t > k + li * 0.3) { const ph = (t * 0.9 + ni * 0.37 + j * 0.21) % 1; glow(g, lerp(sx, x, ph), lerp(sy, y, ph), 12, '62,224,181', 0.9 * act(li)); } });
  }
  for (let li = 0; li < 3; li++) for (let ni = 0; ni < layers[li][1]; ni++) { const [x, y] = node(li, ni), a = act(li), pu = 1 + 0.12 * Math.sin(t * 4 + ni + li * 2) * a; g.fillStyle = `rgba(40,30,90,${0.5 + 0.5 * a})`; g.beginPath(); g.arc(x, y, 26 * pu, 0, Math.PI * 2); g.fill(); g.strokeStyle = `rgba(185,162,255,${a})`; g.lineWidth = 4; g.stroke(); if (a > 0.3) glow(g, x, y, 70, '185,162,255', 0.35 * a); }
  g.save(); g.translate(960, 540); const sc = 1 + 0.03 * Math.sin(t * 3) + 0.12 * Math.sin(clamp((t - k) / 0.6) * Math.PI); g.scale(sc, sc); chipBody(g, 130, t, 0.7 + 0.3 * ai); g.restore();
}

// ---------------------------------------------------------------- 8. every data centre leads to one tower
const DCS = [[700, 150, 120, 0], [1240, 150, 130, 0], [500, 170, 150, 1], [1420, 170, 140, 1], [300, 160, 120, 0], [1620, 160, 125, 0], [110, 190, 160, 1], [1800, 190, 170, 1]];
export function aiCity(g, t, { a = 0.2, grow = 0 } = {}) {
  sky(g, { top: '#05061a', mid: '#12123a', horizon: '#2a2452', hy: 840 }); stars(g, t, { n: 110, maxY: 460, alpha: 0.5, seed: 12 });
  moon(g, 340, 170, 36);
  clouds(g, t, { y: 250, h: 120, seed: 81, n: 10, scale: 0.75, lx: 340, ly: 170, speed: 5, alpha: 0.85 });
  skyline(g, t, { base: 790, seed: 82, depth: 0.15, color: '#191640', lit: 0.1, tall: 0.4, fog: 'rgba(80,65,125,0.5)' });
  mist(g, t, { y: 740, h: 110, alpha: 0.2 });
  const gy = 800;
  const gg = g.createLinearGradient(0, gy, 0, H); gg.addColorStop(0, '#141130'); gg.addColorStop(1, '#06050e'); g.fillStyle = gg; g.fillRect(0, gy, W, H - gy);
  // the tower
  const k = ez(clamp(grow)), top = lerp(330, 90, k), tw = 110;
  glow(g, 960, top + 120, 520 + 200 * k, '118,185,0', 0.2 + 0.1 * k);
  const tg = g.createLinearGradient(960 - tw, 0, 960 + tw, 0); tg.addColorStop(0, '#2d4a12'); tg.addColorStop(0.55, '#1c3209'); tg.addColorStop(1, '#0c1605'); g.fillStyle = tg; g.fillRect(960 - tw, top, tw * 2, gy - top);
  g.fillStyle = '#3d6a14'; g.beginPath(); g.moveTo(960 - tw, top); g.lineTo(960 - tw + 40, top - 36); g.lineTo(960 + tw + 40, top - 36); g.lineTo(960 + tw, top); g.closePath(); g.fill();
  g.fillStyle = '#0a1304'; g.beginPath(); g.moveTo(960 + tw, top); g.lineTo(960 + tw + 40, top - 36); g.lineTo(960 + tw + 40, gy - 30); g.lineTo(960 + tw, gy); g.closePath(); g.fill();
  for (let y = top + 150; y < gy - 20; y += 34) for (let c = 0; c < 6; c++) { const on = rand(Math.floor(y) * 7 + c)() < 0.7; g.fillStyle = on ? `rgba(190,255,130,${0.5 + 0.3 * Math.sin(t * 2 + y + c)})` : 'rgba(118,185,0,0.12)'; g.fillRect(960 - tw + 16 + c * 32, y, 22, 14); }
  g.save(); g.translate(960, top + 78); chipBodySmall(g, 44, t); g.restore();
  g.strokeStyle = '#3d6a14'; g.lineWidth = 6; g.beginPath(); g.moveTo(980, top - 36); g.lineTo(980, top - 130); g.stroke(); glow(g, 980, top - 132, 30, '255,70,80', 0.5 + 0.5 * Math.sin(t * 4));
  g.strokeStyle = 'rgba(210,255,170,0.7)'; g.lineWidth = 3; g.beginPath(); g.moveTo(960 - tw, gy); g.lineTo(960 - tw, top); g.stroke();
  // data centres light up nearest-first; cables carry pulses to the tower
  DCS.forEach(([x, w, h, near], i) => {
    const on = ez(span(t, a + i * 0.32, 0.5)), by = gy + (near ? 70 : 10), s = near ? 1.25 : 1, bw = w * s, bh = h * s;
    // cable
    const ex = 960 + (x < 960 ? -tw + 10 : tw - 10), cxp = (x + ex) / 2, cyp = by + 130 + (near ? 50 : 0);
    const cp = ez(span(t, a + i * 0.32 + 0.2, 0.8));
    if (cp > 0) { g.save(); g.shadowColor = 'rgba(62,224,181,0.8)'; g.shadowBlur = 12; g.strokeStyle = `rgba(62,224,181,${0.55})`; g.lineWidth = near ? 5 : 3; g.beginPath(); for (let j = 0; j <= 30 * cp; j++) { const u = j / 30, qx = (1 - u) * (1 - u) * x + 2 * u * (1 - u) * cxp + u * u * ex, qy = (1 - u) * (1 - u) * by + 2 * u * (1 - u) * cyp + u * u * (gy + 6); j ? g.lineTo(qx, qy) : g.moveTo(qx, qy); } g.stroke(); g.restore();
      if (cp >= 1) for (let m = 0; m < 2; m++) { const u = (t * 0.45 + i * 0.3 + m * 0.5) % 1, qx = (1 - u) * (1 - u) * x + 2 * u * (1 - u) * cxp + u * u * ex, qy = (1 - u) * (1 - u) * by + 2 * u * (1 - u) * cyp + u * u * (gy + 6); glow(g, qx, qy, near ? 20 : 13, '200,255,235', 0.95); } }
    const bg2 = g.createLinearGradient(0, by - bh, 0, by); bg2.addColorStop(0, near ? '#1d1942' : '#17143a'); bg2.addColorStop(1, '#0b0920'); g.fillStyle = bg2; g.fillRect(x - bw / 2, by - bh, bw, bh);
    g.fillStyle = near ? '#2a2558' : '#221e4c'; g.fillRect(x - bw / 2, by - bh, bw, 6);
    const rr = rand(i + 90);
    for (let ry = 0; ry < Math.floor(bh / 22) - 1; ry++) for (let c = 0; c < Math.floor(bw / 18) - 1; c++) { const ph = rr() * 6, col = rr() < 0.5 ? '62,224,181' : '185,162,255'; const al = on * (0.35 + 0.65 * (Math.sin(t * (2 + rr() * 5) + ph) > 0 ? 1 : 0.2)) + (1 - on) * 0.06; g.fillStyle = `rgba(${col},${al})`; g.fillRect(x - bw / 2 + 12 + c * 18, by - bh + 20 + ry * 22, 8, 8); }
    if (on > 0) { glow(g, x, by - bh / 2, bw * 1.1, '120,150,255', 0.16 * on); g.strokeStyle = `rgba(200,190,255,${0.6 * on})`; g.lineWidth = 2; g.beginPath(); g.moveTo(x - bw / 2, by - bh); g.lineTo(x + bw / 2, by - bh); g.stroke(); }
  });
  reflect(g, t, 960, 120, { alpha: 0.25 });
}
function chipBodySmall(g, s, t) { g.save(); g.shadowColor = 'rgba(190,255,130,0.9)'; g.shadowBlur = 24; g.fillStyle = '#9be36a'; g.fillRect(-s, -s, s * 2, s * 2); g.restore(); g.fillStyle = '#17300c'; g.fillRect(-s * 0.55, -s * 0.55, s * 1.1, s * 1.1); for (let i = 0; i < 5; i++) { const u = -s * 0.7 + i * s * 0.35; g.fillStyle = '#d6ffb8'; g.fillRect(u - 3, -s - 12, 6, 10); g.fillRect(u - 3, s + 2, 6, 10); g.fillRect(-s - 12, u - 3, 10, 6); g.fillRect(s + 2, u - 3, 10, 6); } void t; }

// ---------------------------------------------------------------- 9. the wheel with one hub
const CRACK = (() => { const r = rand(77), pts = [[0, 0]]; for (let i = 1; i <= 16; i++) pts.push([i * 26, (r() - 0.5) * 46]); return pts; })();
export function wheel(g, t, { crack = 0, n = 40 } = {}) {
  g.fillStyle = '#06051a'; g.fillRect(0, 0, W, H);
  const r0 = rand(6); for (let i = 0; i < 140; i++) { g.fillStyle = `rgba(185,162,255,${0.05 + r0() * 0.1})`; g.fillRect(r0() * W, r0() * H, 2, 2); }
  const cx = 960 + Math.sin(t * 31) * 4 * crack, cy = 540 + Math.cos(t * 27) * 3 * crack, R = 400;
  glow(g, cx, cy, 760, '150,130,255', 0.12);
  // heavy wheel: slow rotation, a wobble once it is cracked
  const rot = t * 0.22 * (1 - crack * 0.6) + Math.sin(t * 7) * 0.012 * crack;
  g.save(); g.translate(cx, cy);
  g.save(); g.shadowColor = 'rgba(0,0,0,0.6)'; g.shadowBlur = 40; g.strokeStyle = '#2a2452'; g.lineWidth = 30; g.beginPath(); g.arc(0, 0, R, 0, Math.PI * 2); g.stroke(); g.restore();
  g.strokeStyle = '#3a326e'; g.lineWidth = 4; g.beginPath(); g.arc(0, 0, R + 15, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.arc(0, 0, R - 15, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = 'rgba(255,220,180,0.75)'; g.lineWidth = 5; g.beginPath(); g.arc(0, 0, R + 16, -2.7, -1.3); g.stroke(); // warm rim light, top-left
  g.strokeStyle = 'rgba(120,150,255,0.45)'; g.lineWidth = 4; g.beginPath(); g.arc(0, 0, R + 16, 0.3, 1.3); g.stroke();   // cool fill, bottom-right
  for (let k = 0; k < n; k++) {
    const p = Math.min(1, spring(t, 0.05 + k * 0.022, 2, 0.7)); if (p <= 0.01) continue;
    const ang = rot + (k / n) * Math.PI * 2, c = Math.cos(ang), s = Math.sin(ang);
    g.strokeStyle = 'rgba(185,162,255,0.42)'; g.lineWidth = 3; g.beginPath(); g.moveTo(c * 104, s * 104); g.lineTo(c * lerp(104, R - 16, p), s * lerp(104, R - 16, p)); g.stroke();
    const nx = c * R * p, ny = s * R * p;
    g.fillStyle = '#2b2460'; g.beginPath(); g.arc(nx, ny, 19, 0, Math.PI * 2); g.fill(); g.strokeStyle = LAV; g.lineWidth = 2.5; g.stroke();
    g.fillStyle = '#e8e3ff'; g.beginPath(); g.arc(nx, ny - 5, 5.5, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(nx, ny + 12, 9.5, Math.PI, 0); g.fill();
  }
  // the hub: one leather jacket
  const hg = g.createRadialGradient(-30, -30, 10, 0, 0, 110); hg.addColorStop(0, '#3a3350'); hg.addColorStop(1, '#0c0a16'); g.fillStyle = hg; g.beginPath(); g.arc(0, 0, 106, 0, Math.PI * 2); g.fill();
  g.strokeStyle = GOLD; g.lineWidth = 5; g.stroke(); glow(g, 0, 0, 220, '255,201,60', 0.16);
  jacketOnly(g, t, 0, 44, 0.3, { lit: 1 });
  // the crack
  if (crack > 0) {
    const m = Math.max(1, Math.floor(crack * 16));
    g.save(); g.rotate(-0.55); g.shadowColor = 'rgba(255,60,80,0.95)'; g.shadowBlur = 22; g.strokeStyle = RED; g.lineWidth = 7; g.lineJoin = 'round'; g.beginPath(); CRACK.slice(0, m + 1).forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
    g.lineWidth = 3; [4, 8, 12].forEach((j) => { if (j < m) { const [x, y] = CRACK[j]; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 30, y + (j % 8 ? 46 : -46)); g.stroke(); } });
    const [tx, ty] = CRACK[m]; g.restore(); g.save(); g.rotate(-0.55); glow(g, tx, ty, 70, '255,90,110', 0.9); const rs = rand(Math.floor(t * 20)); for (let i = 0; i < 8; i++) { g.fillStyle = `rgba(255,${150 + rs() * 100},120,0.9)`; g.fillRect(tx + (rs() - 0.5) * 90, ty + (rs() - 0.5) * 90, 4, 4); } g.restore();
  }
  g.restore();
  beam(g, t, 160, -80, 0.8, { len: 1500, spread: 0.22, color: '255,210,160', alpha: 0.13, motes: 50, seed: 9 });
}
void out3; void TEAL; void moon;
