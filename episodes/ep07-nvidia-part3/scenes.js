// Episode 7: The Casanova of Silicon Valley? (Nvidia part 3). Episode-3 night template, episode-5 camera moves and transitions.
import { W, H, clamp, lerp, rand, text } from '../../pipeline/engine.js';
import { sceneWords, when } from '../../pipeline/shots.js';
import { lightScene, lightSounds } from '../../pipeline/lightshots.js';
import { sky, stars, moon, clouds, skyline, rain, mist, beam, glow, buf, nightFinish } from '../../pipeline/scenery.js';
import { ez, out3, span, spring, at, pill } from '../../pipeline/scenekit.js';
import { venice, masks, mask, corridor, emptyStage } from './sets.js';
import { boardroom, jacket, capitol } from '../ep05-nvidia-part2/sets.js';

const INK = '#f3efff', LAV = '#b9a2ff', RED = '#ff5c6e', GOLD = '#ffc93c', GREEN = '#7dffb0';
const D = { theme: 'dark' };

// ---------------------------------------------------------------- motion helpers (as episode 5/6)
function cam(g, t, { z0 = 1, z1 = 1.08, dur = 8, fx = W / 2, fy = H / 2, drift = 1 } = {}) {
  const z = lerp(z0, z1, ez(clamp(t / dur)));
  const dx = drift * (Math.sin(t * 0.7) * 6 + Math.sin(t * 1.9) * 2), dy = drift * (Math.cos(t * 0.6) * 4 + Math.sin(t * 2.3) * 1.5);
  g.translate(fx + dx, fy + dy); g.scale(z, z); g.translate(-fx, -fy);
}
function shots(g, t, cuts, draws, kinds = []) {
  let i = 0; while (i < cuts.length && t >= cuts[i]) i++;
  const since = i ? t - cuts[i - 1] : 99, kind = kinds[i - 1] || 'fade', XF = kind === 'flash' ? 0.35 : 0.55;
  const drawI = (gg, k) => { gg.save(); draws[k](gg, t); gg.restore(); };
  if (since >= XF) { drawI(g, i); return; }
  const p = ez(since / XF);
  const [a, ag] = buf('x7a'); drawI(ag, i - 1);
  const [b, bg] = buf('x7b'); drawI(bg, i);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  if (kind === 'push') { g.drawImage(a, -p * W * 0.35, 0); g.globalAlpha = p; g.drawImage(b, (1 - p) * W * 0.35, 0); }
  else if (kind === 'blur') { g.filter = `blur(${(p * 14).toFixed(1)}px)`; g.drawImage(a, 0, 0); g.filter = `blur(${((1 - p) * 14).toFixed(1)}px)`; g.globalAlpha = p; g.drawImage(b, 0, 0); g.filter = 'none'; }
  else if (kind === 'flash') { g.drawImage(p < 0.5 ? a : b, 0, 0); g.globalAlpha = Math.sin(p * Math.PI) * 0.9; g.fillStyle = '#fff4ea'; g.fillRect(0, 0, W, H); }
  else { g.drawImage(a, 0, 0); g.globalAlpha = p; g.drawImage(b, 0, 0); }
  g.restore();
}
function panel(g, x, y, w, h, r = 26) { g.save(); g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 40; g.fillStyle = 'rgba(22,16,48,0.92)'; g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); g.restore(); g.strokeStyle = 'rgba(185,162,255,0.35)'; g.lineWidth = 2; g.beginPath(); g.roundRect(x, y, w, h, r); g.stroke(); }
function stamp(g, t, a, str, x, y, { color = RED, rot = -0.1, size = 64 } = {}) {
  const sp = clamp((t - (a - 0.09)) / 0.09); if (sp <= 0) return;
  const b = t > a ? Math.exp(-(t - a) * 9) * Math.sin((t - a) * 40) * 0.04 : 0;
  g.save(); g.translate(x, y); g.rotate(rot); const sc = lerp(2.4, 1, sp * sp * sp) + b; g.scale(sc, sc); g.globalAlpha = 0.95 * sp;
  g.font = `800 ${size}px Jakarta`; const w = g.measureText(str).width + size;
  g.strokeStyle = color; g.lineWidth = size * 0.1; g.beginPath(); g.roundRect(-w / 2, -size * 0.75, w, size * 1.5, size * 0.2); g.stroke();
  text(g, str, 0, size * 0.36, { font: 'Jakarta', weight: 800, size, color, align: 'center', spacing: size * 0.05 }); g.restore();
}
function pop(g, t, a, x, y, draw) { const p = spring(t, a, 1.8, 0.6); if (p <= 0.01) return; g.save(); g.translate(x, y); g.scale(Math.min(1, p), Math.min(1, p)); g.globalAlpha = Math.min(1, p); draw(g); g.restore(); }
function nightBG(g, t, { seed = 0, horizon = '#2d2552', rainA = 0, moonAt = null } = {}) {
  sky(g, { top: '#06061c', mid: '#15133b', horizon, hy: 980 }); stars(g, t, { n: 80, maxY: 500, alpha: 0.5, seed: seed + 2 });
  if (moonAt) moon(g, moonAt[0], moonAt[1], 38);
  clouds(g, t + seed, { y: 180, h: 110, seed: 900 + seed, n: 8, scale: 0.6, lx: moonAt ? moonAt[0] : 1500, ly: moonAt ? moonAt[1] : 90, speed: 6, alpha: 0.8 });
  skyline(g, t, { base: 1000, seed: 950 + seed, depth: 0.2, color: '#1b1840', lit: 0.12, tall: 0.7, fog: 'rgba(80,65,125,0.5)' });
  if (rainA) rain(g, t, { n: 380, alpha: rainA });
}
/** a dark wooden desk lit by one candle (warm key from the right, exponential falloff) */
function desk(g, t, { cx = 1380, cy = 560 } = {}) {
  g.fillStyle = '#07050c'; g.fillRect(0, 0, W, H);
  const fl = 0.85 + 0.15 * Math.sin(t * 11) * Math.sin(t * 6.7);
  const dg = g.createLinearGradient(0, 620, 0, H); dg.addColorStop(0, '#2a1a14'); dg.addColorStop(1, '#0d0806'); g.fillStyle = dg; g.fillRect(0, 620, W, H - 620);
  g.save(); g.globalCompositeOperation = 'lighter'; const lg = g.createRadialGradient(cx, cy, 10, cx, cy, 1100); lg.addColorStop(0, `rgba(255,170,90,${0.35 * fl})`); lg.addColorStop(0.3, `rgba(255,140,70,${0.12 * fl})`); lg.addColorStop(1, 'rgba(255,140,70,0)'); g.fillStyle = lg; g.fillRect(0, 0, W, H); g.restore();
  // candle
  g.fillStyle = '#e8dcc0'; g.fillRect(cx - 22, cy, 44, 150); g.fillStyle = '#c8b898'; g.fillRect(cx - 22, cy, 10, 150);
  glow(g, cx, cy - 30, 120, '255,190,110', 0.8 * fl);
  g.fillStyle = `rgba(255,230,170,${fl})`; g.beginPath(); g.ellipse(cx + Math.sin(t * 7) * 2, cy - 26, 9, 24, Math.sin(t * 5) * 0.08, 0, Math.PI * 2); g.fill();
  return fl;
}
function parchment(g, t, a, { lines = 9, quill = true, x = 380, y = 640 } = {}) {
  g.save(); g.translate(x, y); g.rotate(-0.05);
  g.fillStyle = '#e9dcbc'; g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 30; g.fillRect(0, 0, 760, 380); g.shadowColor = 'transparent';
  const p = clamp((t - a) / 6), n = Math.floor(p * lines * 8);
  let qx = 40, qy = 40;
  for (let l = 0; l < lines; l++) for (let k = 0; k < 8; k++) { const i = l * 8 + k; if (i > n) continue; const w = 40 + rand(i)() * 40, xx = 40 + k * 86, yy = 40 + l * 36; g.strokeStyle = 'rgba(60,40,30,0.75)'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(xx, yy); for (let s = 0; s <= 8; s++) g.lineTo(xx + (s / 8) * w, yy + Math.sin(s * 2.1 + i) * 4); g.stroke(); qx = xx + w; qy = yy; }
  if (quill) { g.save(); g.translate(qx, qy); g.rotate(-0.9 + Math.sin(t * 9) * 0.06); g.scale(1.5, 1.5); g.fillStyle = '#f4efe6'; g.beginPath(); g.ellipse(18, -150, 30, 110, 0.06, 0, Math.PI * 2); g.fill(); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(30, -120, 20, -260); g.quadraticCurveTo(-10, -140, 0, 0); g.fill(); g.strokeStyle = '#2a1e18'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 0); g.lineTo(18, -250); g.stroke(); g.restore(); }
  g.restore();
}
function calendar(g, t, a) {
  nightBG(g, t, { seed: 5, rainA: 0.3, moonAt: [1700, 140] });
  const days = [['SUN', 'admits an affair'], ['MON', ''], ['TUE', ''], ['WED', 'resigns']];
  days.forEach(([d, note], k) => pop(g, t, a + k * 0.35, 330 + k * 420, 520, (gg) => {
    panel(gg, -170, -210, 340, 420, 24); gg.fillStyle = '#c0392b'; gg.beginPath(); gg.roundRect(-170, -210, 340, 90, [24, 24, 0, 0]); gg.fill();
    text(gg, d, 0, -148, { font: 'Jakarta', weight: 800, size: 46, color: '#fff', align: 'center', spacing: 6 });
    text(gg, String(8 + k), 0, 60, { font: 'Jakarta', weight: 800, size: 150, color: INK, align: 'center' });
    if (note) text(gg, note, 0, 160, { font: 'Jakarta', weight: 700, size: 28, color: k === 3 ? RED : GOLD, align: 'center' });
  }));
  pop(g, t, a + 1.0, 960, 880, (gg) => { gg.fillStyle = 'rgba(20,14,44,0.85)'; gg.beginPath(); gg.roundRect(-520, -40, 1040, 80, 40); gg.fill(); text(gg, '+ two more relationships reported (Wed · Thu)', 0, 12, { font: 'Jakarta', weight: 700, size: 32, color: '#ffb3be', align: 'center' }); });
}
function jacketSlide(g, t, a) {
  g.fillStyle = '#05040c'; g.fillRect(0, 0, W, H);
  beam(g, t, 960, -80, Math.PI / 2, { len: 1000, spread: 0.12, color: '255,236,210', alpha: 0.38, motes: 60, seed: 4 });
  g.fillStyle = '#120e1e'; g.fillRect(0, 860, W, 220);
  const p = clamp((t - a) / 1.4), fall = p * p;
  // empty chair
  g.fillStyle = '#0d0a18'; g.beginPath(); g.roundRect(890, 470, 140, 260, 30); g.fill(); g.fillRect(880, 720, 160, 30); g.fillRect(900, 750, 10, 110); g.fillRect(1010, 750, 10, 110);
  g.save(); g.translate(960, 700 + fall * 160); g.rotate(fall * 0.5); g.globalAlpha = 1; jacket(g, t, 0, 0, 0.7, { lit: 1 - p * 0.4 }); g.restore();
  pill(g, t, a + 0.6, '33 years · Nvidia co-founder and CEO', 1000, D);
}
function letter(g, t, a) {
  desk(g, t, { cx: 1560, cy: 520 });
  g.save(); g.translate(860, 640); g.rotate(-0.04); g.fillStyle = '#f2ede2'; g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 40; g.fillRect(-460, -300, 920, 560); g.shadowColor = 'transparent';
  text(g, 'To all Nvidia employees', -400, -220, { font: 'Inter', weight: 600, size: 30, color: '#3a3346' });
  g.fillStyle = 'rgba(80,70,100,0.25)'; for (let i = 0; i < 8; i++) g.fillRect(-400, -160 + i * 40, 780 - (i % 3) * 120, 12);
  const q = span(t, a, 0.8);
  g.save(); g.globalAlpha = q; g.fillStyle = 'rgba(255,201,60,0.35)'; g.fillRect(-410, 168, 820, 56); g.restore();
  text(g, '“I have fallen short of that responsibility.”', 0, 208, { font: 'Jakarta', weight: 800, size: 38, color: '#231a33', align: 'center', alpha: 0.4 + 0.6 * q });
  g.restore();
  pill(g, t, 0.4, 'Sunday · letter to staff', 90, D);
}
function lens(g, t, x, y, r = 120) {
  g.save(); g.strokeStyle = 'rgba(220,230,255,0.9)'; g.lineWidth = 10; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke();
  g.fillStyle = 'rgba(160,200,255,0.12)'; g.fill(); g.lineWidth = 18; g.beginPath(); g.moveTo(x + r * 0.7, y + r * 0.7); g.lineTo(x + r * 1.5, y + r * 1.5); g.stroke(); g.restore();
}
function maskLine(g, t, k, str, y = 960, col = INK) { pop(g, t, 0, 480 + k * 480, y, (gg) => text(gg, str, 0, 0, { font: 'Jakarta', weight: 700, size: 26, color: col, align: 'center' })); }
function chip(g, x, y, str) { g.fillStyle = 'rgba(20,14,44,0.9)'; g.beginPath(); g.roundRect(x - 120, y - 30, 240, 60, 30); g.fill(); g.strokeStyle = 'rgba(185,162,255,0.5)'; g.lineWidth = 2; g.stroke(); text(g, str, x, y + 10, { font: 'Jakarta', weight: 700, size: 26, color: LAV, align: 'center' }); }
function filing(g, t, a) {
  g.fillStyle = '#06051a'; g.fillRect(0, 0, W, H); beam(g, t, 960, -40, Math.PI / 2, { len: 1000, spread: 0.3, color: '200,210,255', alpha: 0.14, motes: 40 });
  const p = out3(span(t, a - 0.3, 0.7));
  g.save(); g.translate(960, lerp(1300, 560, p)); g.rotate(-0.02); g.fillStyle = '#f4f2f8'; g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 40; g.fillRect(-420, -440, 840, 880); g.shadowColor = 'transparent';
  text(g, 'UNITED STATES', 0, -370, { font: 'Inter', weight: 600, size: 22, color: '#555', align: 'center', spacing: 4 });
  text(g, 'SECURITIES AND EXCHANGE COMMISSION', 0, -335, { font: 'Inter', weight: 600, size: 22, color: '#555', align: 'center' });
  text(g, 'FORM 8-K', 0, -260, { font: 'Jakarta', weight: 800, size: 64, color: '#1d1b29', align: 'center' });
  text(g, 'NVIDIA CORPORATION', 0, -190, { font: 'Jakarta', weight: 700, size: 30, color: '#1d1b29', align: 'center' });
  g.fillStyle = 'rgba(40,40,60,0.2)'; for (let i = 0; i < 9; i++) g.fillRect(-340, -120 + i * 44, 680 - (i % 4) * 90, 12);
  text(g, '…accepted the resignation… effective immediately.', 0, 330, { font: 'Inter', weight: 600, size: 26, color: '#1d1b29', align: 'center' });
  g.restore();
  stamp(g, t, a + 0.9, 'EFFECTIVE IMMEDIATELY', 960, 760, { size: 54, rot: -0.08 });
}
function headlines(g, t, a) {
  nightBG(g, t, { seed: 9, rainA: 0.3 });
  [['WALL STREET JOURNAL', 'Board preparing to', 'PUSH HIM OUT', -1], ['A CONGRESSMAN', 'calls it', 'A FIRING', 1]].forEach(([src, l1, l2, sd], k) => pop(g, t, a + k * 0.6, 960 + sd * 430, 520, (gg) => {
    gg.rotate(sd * 0.03); gg.fillStyle = '#ece6d6'; gg.shadowColor = 'rgba(0,0,0,0.5)'; gg.shadowBlur = 30; gg.fillRect(-340, -260, 680, 520); gg.shadowColor = 'transparent';
    text(gg, src, 0, -190, { font: "'Playfair Display'", weight: 900, size: 34, color: '#1d1a16', align: 'center' }); gg.fillStyle = '#1d1a16'; gg.fillRect(-300, -170, 600, 3);
    text(gg, l1, 0, -60, { font: "'Playfair Display'", weight: 700, size: 44, color: '#1d1a16', align: 'center' }); text(gg, l2, 0, 30, { font: "'Playfair Display'", weight: 900, size: 64, color: '#8a1d1d', align: 'center' });
    gg.fillStyle = 'rgba(30,26,22,0.25)'; for (let i = 0; i < 4; i++) gg.fillRect(-300, 90 + i * 34, 600 - (i % 2) * 120, 10);
  }));
  pill(g, t, a + 0.3, 'Nvidia’s word: “resignation”', 960, D);
}
function plates(g, t, a) {
  boardroom(g, t, { jacketLit: 0.3 });
  [['INTERIM CEO', 'Colette Kress', 640], ['CHAIR (FIRST EVER)', 'Harvey Jones', 1280]].forEach(([r1, r2, x], k) => pop(g, t, a + k * 0.9, x, 860, (gg) => {
    const pg = gg.createLinearGradient(0, -60, 0, 60); pg.addColorStop(0, '#c9a24a'); pg.addColorStop(1, '#7a5e22'); gg.fillStyle = pg; gg.beginPath(); gg.moveTo(-230, -60); gg.lineTo(230, -60); gg.lineTo(260, 60); gg.lineTo(-260, 60); gg.closePath(); gg.fill();
    text(gg, r1, 0, -14, { font: 'Jakarta', weight: 700, size: 22, color: '#2a1e08', align: 'center', spacing: 3 }); text(gg, r2, 0, 34, { font: 'Jakarta', weight: 800, size: 38, color: '#1d1408', align: 'center' });
  }));
}
function flags(g, t, cues) {
  g.fillStyle = '#06051a'; g.fillRect(0, 0, W, H);
  const items = [['CONFLICT OF INTEREST', 'boss · direct report'], ['SECURITY', 'suspected intelligence recruit'], ['DISCLOSURE', 'shareholder lawsuit (alleged)']];
  items.forEach(([h1, h2], k) => {
    const a = cues[k], on = t >= a - 0.1, x = 380 + k * 580;
    if (on) beam(g, t + k, x, -60, Math.PI / 2, { len: 900, spread: 0.1, color: '255,120,130', alpha: 0.25, motes: 30, seed: 60 + k });
    g.save(); g.globalAlpha = on ? 1 : 0.25; panel(g, x - 250, 480, 500, 400, 28);
    // the icon for each flag
    g.save(); g.translate(x, 600);
    if (k === 0) { g.fillStyle = '#2a2f6a'; g.fillRect(-60, -80, 120, 50); g.fillRect(-60, 30, 120, 50); g.strokeStyle = on ? RED : LAV; g.lineWidth = 6; g.beginPath(); g.moveTo(0, -30); g.lineTo(0, 30); g.stroke(); text(g, 'CEO', 0, -46, { font: 'Jakarta', weight: 800, size: 22, color: INK, align: 'center' }); text(g, 'VP', 0, 64, { font: 'Jakarta', weight: 800, size: 22, color: INK, align: 'center' }); }
    if (k === 1) { g.fillStyle = '#1f6a2a'; g.fillRect(-56, -56, 112, 112); g.fillStyle = '#76b900'; for (let i = -3; i <= 3; i++) { g.fillRect(i * 16 - 3, -74, 6, 18); g.fillRect(i * 16 - 3, 56, 6, 18); } lens(g, t, 20 + Math.sin(t * 1.5) * 20, -10, 60); }
    if (k === 2) { g.save(); g.rotate(-0.5 + (on ? Math.max(0, Math.sin((t - a) * 6)) * 0.4 * Math.exp(-(t - a) * 2) : 0)); g.fillStyle = '#8a6a3a'; g.fillRect(-14, -10, 28, 110); g.fillStyle = '#b08a4a'; g.fillRect(-60, -60, 120, 56); g.restore(); }
    g.restore();
    text(g, h1, x, 790, { font: 'Jakarta', weight: 800, size: 32, color: on ? '#ffb3be' : LAV, align: 'center' }); text(g, h2, x, 836, { font: 'Inter', weight: 600, size: 24, color: LAV, align: 'center' });
    g.restore();
    if (on) { const p = spring(t, a, 2, 0.6); g.save(); g.translate(x + 180, 470); g.scale(Math.min(1, p), Math.min(1, p)); g.strokeStyle = '#ddd'; g.lineWidth = 6; g.beginPath(); g.moveTo(0, 60); g.lineTo(0, -80); g.stroke(); g.fillStyle = RED; g.beginPath(); g.moveTo(0, -80); g.quadraticCurveTo(40 + Math.sin(t * 6 + k) * 6, -70, 80, -60); g.lineTo(0, -30); g.closePath(); g.fill(); g.restore(); }
  });
}
function shield(g, t) {
  g.fillStyle = '#05061a'; g.fillRect(0, 0, W, H);
  g.save(); g.translate(960, 500); const p = spring(t, 0.1, 1.6, 0.6); g.scale(Math.min(1, p), Math.min(1, p));
  glow(g, 0, 0, 380, '125,255,176', 0.22);
  g.fillStyle = 'rgba(30,60,50,0.9)'; g.strokeStyle = GREEN; g.lineWidth = 10; g.beginPath(); g.moveTo(0, -230); g.quadraticCurveTo(130, -195, 185, -195); g.quadraticCurveTo(195, 100, 0, 250); g.quadraticCurveTo(-195, 100, -185, -195); g.quadraticCurveTo(-130, -195, 0, -230); g.closePath(); g.fill(); g.stroke();
  text(g, 'NO REASON', 0, -10, { font: 'Jakarta', weight: 800, size: 40, color: GREEN, align: 'center' }); text(g, 'TO BELIEVE', 0, 40, { font: 'Jakarta', weight: 800, size: 40, color: GREEN, align: 'center' }); text(g, 'secrets were', 0, 88, { font: 'Inter', weight: 600, size: 20, color: GREEN, align: 'center' }); text(g, 'compromised', 0, 114, { font: 'Inter', weight: 600, size: 20, color: GREEN, align: 'center' });
  g.restore();
  pill(g, t, 0.5, 'the board’s statement (Sunday)', 900, D);
}
function candles(g, t, a) {
  g.fillStyle = '#06051a'; g.fillRect(0, 0, W, H); panel(g, 160, 120, 1600, 840);
  text(g, 'NVDA · THURSDAY', 220, 200, { font: 'Jakarta', weight: 800, size: 30, color: LAV, spacing: 3 });
  const y0 = 300, k = 32, pr = (v) => y0 + v * k;
  g.strokeStyle = 'rgba(185,162,255,0.2)'; g.setLineDash([8, 10]); g.beginPath(); g.moveTo(220, y0); g.lineTo(1700, y0); g.stroke(); g.setLineDash([]);
  text(g, 'Wednesday close', 1700, y0 - 14, { font: 'Inter', weight: 600, size: 22, color: LAV, align: 'right' });
  const drop = out3(span(t, a, 0.9)) * 14, rec = out3(span(t, a + 1.6, 3)) * 9.7, v = drop - rec;
  // the day's candle: wick to the low, body to the current price
  const x = 900; g.strokeStyle = RED; g.lineWidth = 6; g.beginPath(); g.moveTo(x, y0); g.lineTo(x, pr(drop)); g.stroke();
  g.save(); g.shadowColor = RED; g.shadowBlur = 20; g.fillStyle = RED; g.fillRect(x - 70, y0, 140, Math.max(4, v * k)); g.restore();
  if (drop > 13.9) text(g, `−14% at the open`, x + 120, pr(drop) + 10, { font: 'Jakarta', weight: 800, size: 40, color: RED });
  if (rec > 9.6) { text(g, `closed −4.3%`, x - 120, pr(v) + 12, { font: 'Jakarta', weight: 800, size: 40, color: '#ffb3be', align: 'right' }); }
}
function invite(g, t, a) {
  capitol(g, t);
  pop(g, t, a, 1380, 640, (gg) => { gg.rotate(-0.06); gg.fillStyle = '#ece6d6'; gg.shadowColor = 'rgba(0,0,0,0.5)'; gg.shadowBlur = 30; gg.fillRect(-260, -160, 520, 320); gg.shadowColor = 'transparent'; gg.strokeStyle = '#b8a888'; gg.lineWidth = 4; gg.beginPath(); gg.moveTo(-260, -160); gg.lineTo(0, 30); gg.lineTo(260, -160); gg.stroke(); text(gg, 'PUBLIC HEARING', 0, 100, { font: 'Jakarta', weight: 800, size: 34, color: '#3a2d22', align: 'center', spacing: 2 }); });
  stamp(g, t, a + 0.8, 'DEC 3', 1500, 760, { size: 60, rot: -0.15 });
  pill(g, t, a + 0.3, 'invited by Sen. Tim Scott · subpoenas warned', 90, D);
}
function musk(g, t, a) {
  g.fillStyle = '#05040c'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 120; i++) { const r = rand(i); g.fillStyle = `rgba(185,162,255,${0.05 + r() * 0.1})`; g.fillRect(r() * W, r() * H, 2, 2); }
  pop(g, t, a, 960, 520, (gg) => { glow(gg, 0, 0, 500, '120,160,255', 0.25); gg.fillStyle = '#2a2f6a'; gg.beginPath(); gg.roundRect(-460, -110, 920, 220, 60); gg.fill(); gg.beginPath(); gg.moveTo(-380, 100); gg.lineTo(-430, 170); gg.lineTo(-320, 100); gg.closePath(); gg.fill(); text(gg, '“That would be an honor.”', 0, 22, { font: 'Jakarta', weight: 800, size: 60, color: INK, align: 'center' }); });
  pill(g, t, a + 0.5, 'Elon Musk, replying to a post urging Nvidia to hire him', 860, D);
}
function canal(g, t, { letterAt = 99, masksAt = 99, ask = 99 } = {}) {
  venice(g, t, { tower: span(t, ask - 0.5, 2) });
  if (t > letterAt) { const p = span(t, letterAt, 1.5); g.save(); g.globalAlpha = p; g.translate(520 + Math.sin(t * 0.5) * 30, 900 + Math.sin(t * 1.2) * 6); g.rotate(-0.1 + Math.sin(t) * 0.03); g.fillStyle = '#e9dcbc'; g.fillRect(-90, -50, 180, 100); g.fillStyle = 'rgba(60,40,30,0.4)'; for (let i = 0; i < 4; i++) g.fillRect(-70, -30 + i * 18, 140 - i * 20, 5); g.restore(); }
  if (t > masksAt) [[1260, 930], [1460, 980], [1660, 920]].forEach(([x, y], k) => { const p = span(t, masksAt + k * 0.4, 1.2); g.save(); g.globalAlpha = p * 0.9; mask(g, t, x + Math.sin(t * 0.4 + k) * 20, y + Math.sin(t * 1.1 + k) * 6, 0.3, { blank: k === 2, lit: 0.6 }); g.restore(); });
}

// ---------------------------------------------------------------- scenes
function c_open(g, s) {
  const t = s.t, b = (p) => at(s, p);
  shots(g, t, [b('writes thousands') - 0.25, b('Three hundred years') - 0.25, b('In four days') - 0.25, b('and lost the company') - 0.25], [
    (g2, tt) => { cam(g2, tt, { z0: 1.0, z1: 1.12, dur: 8, fy: 560 }); venice(g2, tt + 2); pill(g2, tt, 0.4, 'Venice · the 1700s', 90, D); },
    (g2, tt) => { const a0 = b('writes thousands'); cam(g2, tt - a0, { z0: 1.05, z1: 1.15, dur: 6, fx: 700, fy: 760 }); desk(g2, tt); parchment(g2, tt, a0); g2.setTransform(1, 0, 0, 1, 0, 0); pill(g2, tt, a0 + 0.5, 'Casanova’s memoir · ~3,700 pages', 90, D); },
    (g2, tt) => { const a0 = b('Three hundred years'); cam(g2, tt - a0, { z0: 1.0, z1: 1.1, dur: 7, fy: 700 }); venice(g2, tt + 2, { tower: span(tt, a0 + 1, 2.5) }); pill(g2, tt, a0 + 1.5, 'Santa Clara, California', 90, D); },
    (g2, tt) => { const a0 = b('In four days'); cam(g2, tt - a0, { z0: 1.0, z1: 1.05, dur: 8 }); calendar(g2, tt, a0 + 0.2); },
    (g2, tt) => { const a0 = b('and lost the company'); cam(g2, tt - a0, { z0: 1.0, z1: 1.1, dur: 5, fy: 650 }); jacketSlide(g2, tt, a0 + 0.3); },
  ], ['blur', 'blur', 'push', 'flash']);
}
function maskScene(g, s) {
  const t = s.t, b = (p) => at(s, p);
  const c = [b('That same day'), b('On Wednesday, the Times'), b('Sources told the paper'), b('Then, on Thursday'), b('Nvidia declined')];
  shots(g, t, c.map((x) => x - 0.25), [
    (g2, tt) => { cam(g2, tt, { z0: 1.0, z1: 1.1, dur: 10, fy: 700 }); letter(g2, tt, b('I have fallen')); },
    (g2, tt) => { cam(g2, tt - c[0], { z0: 1.05, z1: 1.15, dur: 12, fx: 480, fy: 500 }); masks(g2, tt, { lit: [span(tt, c[0], 0.6), 0.08, 0.08], labels: ['Reported · NYT', '', ''] }); lens(g2, tt, 480 + Math.sin((tt - c[0]) * 0.9) * 90, 440 + Math.cos((tt - c[0]) * 0.7) * 40, 110); pop(g2, tt, b('US intelligence'), 480, 960, (gg) => text(gg, 'US intelligence suspected · per NYT', 0, 0, { font: 'Jakarta', weight: 700, size: 28, color: '#ffb3be', align: 'center' })); pill(g2, tt, b('The two are not'), 'Alice Huang · no relation to Jensen Huang', 90, D); },
    (g2, tt) => { cam(g2, tt - c[1], { z0: 1.05, z1: 1.12, dur: 12, fx: 720, fy: 500 }); masks(g2, tt, { lit: [0.35, span(tt, c[1] + 0.3, 0.6), 0.08], labels: ['Reported · NYT', 'Reported · NYT', ''] }); pop(g2, tt, b('vice president'), 960, 960, (gg) => text(gg, 'Kimberly Powell · VP, health care · reported to him', 0, 0, { font: 'Jakarta', weight: 700, size: 28, color: GOLD, align: 'center' })); },
    (g2, tt) => { cam(g2, tt - c[2], { z0: 1.0, z1: 1.12, dur: 16, fx: 960, fy: 470 }); corridor(g2, tt, { nda: span(tt, b('non-disclosure'), 0.6) }); pill(g2, tt, c[2] + 0.4, 'a hotel during Nvidia’s developer conference · per NYT', 90, D); pill(g2, tt, b('The Times did not'), 'the Times did not see the footage', 1010, D); },
    (g2, tt) => { cam(g2, tt - c[3], { z0: 1.05, z1: 1.15, dur: 10, fx: 1440, fy: 500 }); masks(g2, tt, { lit: [0.3, 0.3, span(tt, c[3] + 0.3, 0.6)] }); pop(g2, tt, b('citing two people'), 1440, 960, (gg) => text(gg, 'Reuters · 2 sources · not named', 0, 0, { font: 'Jakarta', weight: 700, size: 28, color: '#c8d2ff', align: 'center' })); },
    (g2, tt) => { cam(g2, tt - c[4], { z0: 1.12, z1: 1.0, dur: 6 }); masks(g2, tt, { lit: [0.8, 0.8, 0.8] }); [[1440, 'Nvidia: declined'], [960, 'Powell: no response']].forEach(([x, str], k) => pop(g2, tt, (k ? b('Powell did not') : c[4]) + 0.3, x, 960, (gg) => chip(gg, 0, 0, str))); },
  ], ['flash', 'push', 'blur', 'push', 'fade']);
}
function night(g, s) {
  const t = s.t, b = (p) => at(s, p);
  const c = [b('According to a filing'), b('The Wall Street Journal'), b('Chief financial officer')];
  shots(g, t, c.map((x) => x - 0.25), [
    (g2, tt) => { cam(g2, tt, { z0: 1.0, z1: 1.12, dur: 6, fy: 600 }); boardroom(g2, tt, { jacketLit: 1 }); pill(g2, tt, 0.4, 'Wednesday night · Santa Clara', 90, D); },
    (g2, tt) => { cam(g2, tt - c[0], { z0: 1.0, z1: 1.06, dur: 9 }); filing(g2, tt, c[0] + 0.3); },
    (g2, tt) => { cam(g2, tt - c[1], { z0: 1.0, z1: 1.05, dur: 8 }); headlines(g2, tt, c[1] + 0.2); },
    (g2, tt) => { cam(g2, tt - c[2], { z0: 1.0, z1: 1.08, dur: 9, fy: 700 }); plates(g2, tt, c[2] + 0.4); },
  ], ['blur', 'push', 'flash']);
}
function why(g, s) {
  const t = s.t, b = (p) => at(s, p);
  const c = [b('A boss'), b('The board has said')];
  shots(g, t, c.map((x) => x - 0.25), [
    (g2, tt) => { cam(g2, tt, { z0: 1.0, z1: 1.06, dur: 5 }); masks(g2, tt, { lit: [1 - span(tt, 1, 2) * 0.8, 1 - span(tt, 1.2, 2) * 0.8, 1 - span(tt, 1.4, 2) * 0.8] }); pill(g2, tt, 0.4, 'never only about romance', 1010, D); },
    (g2, tt) => { cam(g2, tt - c[0], { z0: 1.0, z1: 1.05, dur: 18 }); flags(g2, tt, [c[0] + 0.3, b('A CEO close'), b('And shareholders')]); },
    (g2, tt) => { cam(g2, tt - c[1], { z0: 1.0, z1: 1.06, dur: 7 }); shield(g2, tt - c[1]); },
  ], ['blur', 'fade']);
}
function fallout(g, s) {
  const t = s.t, b = (p) => at(s, p);
  const c = [b('Senator Tim Scott'), b('Not everyone'), b('And on Tuesday')];
  shots(g, t, c.map((x) => x - 0.25), [
    (g2, tt) => { cam(g2, tt, { z0: 1.0, z1: 1.04, dur: 8 }); candles(g2, tt, b('14 percent') - 0.2); },
    (g2, tt) => { cam(g2, tt - c[0], { z0: 1.0, z1: 1.08, dur: 8, fy: 500 }); invite(g2, tt, c[0] + 0.4); },
    (g2, tt) => { cam(g2, tt - c[1], { z0: 1.0, z1: 1.06, dur: 6 }); musk(g2, tt, c[1] + 0.1); },
    (g2, tt) => { cam(g2, tt - c[2], { z0: 1.0, z1: 1.12, dur: 8, fy: 650 }); emptyStage(g2, tt); },
  ], ['push', 'flash', 'blur']);
}
function outro(g, s) {
  const t = s.t, b = (p) => at(s, p);
  cam(g, t, { z0: 1.12, z1: 1.0, dur: 22, fy: 600 });
  canal(g, t, { letterAt: b('Jensen Huang has') - 0.2, masksAt: b('The other stories'), ask: b('So, Casanova') });
  g.setTransform(1, 0, 0, 1, 0, 0);
  pill(g, t, b('Jensen Huang has') + 0.4, '“I have fallen short”', 90, D);
  const q = span(t, b('So, Casanova') + 0.2, 0.8);
  if (q > 0) { text(g, 'Casanova of Silicon Valley?', W / 2, 330, { font: 'Jakarta', weight: 800, size: 84, color: INK, align: 'center', alpha: q }); }
  pill(g, t, b('The investigation'), 'Still developing · as of 13 November', 420, D);
}
function chapterCard(num, title) {
  return (g, s) => {
    const t = s.t;
    g.save(); cam(g, t, { z0: 1.0, z1: 1.05, dur: 3 }); venice(g, t + 20 + num * 7); g.restore();
    g.fillStyle = 'rgba(5,4,16,0.5)'; g.fillRect(0, 0, W, H);
    const p = spring(t, 0.1, 1.4, 0.7);
    g.save(); g.translate(W / 2, 470); g.scale(lerp(0.8, 1, Math.min(1, p)), lerp(0.8, 1, Math.min(1, p))); g.globalAlpha = Math.min(1, p);
    text(g, String(num).padStart(2, '0'), 0, 40, { font: 'Jakarta', weight: 800, size: 220, color: 'rgba(185,162,255,0.22)', align: 'center' });
    g.restore();
    pill(g, t, 0.3, `Chapter ${num}`, 560, { size: 28, theme: 'dark' });
    const tp = span(t, 0.5, 0.6);
    text(g, title, W / 2, 700 + (1 - out3(tp)) * 40, { font: 'Jakarta', weight: 700, size: 96, color: INK, align: 'center', alpha: tp });
  };
}

// ---------------------------------------------------------------- assembly
const LIGHT = {
  title: [{ type: 'sting', title: 'Toppled Giants', sub: 'Episode 7 · The Casanova of Silicon Valley?' }],
  sub: [{ type: 'subscribe', clickWhen: 'tap subscribe', text: 'it really helps the channel' }],
  endcard: [{ type: 'subscribe', clickWhen: 'Subscribe', text: 'see you in the next story' }],
};
const lightScenes = Object.fromEntries(Object.entries(LIGHT).map(([k, v]) => [k, lightScene(v)]));
export const scenes = {
  c_open, ...lightScenes, masks: maskScene, night, why, fallout, outro,
  chapter1: chapterCard(1, 'Three Masks'), chapter2: chapterCard(2, 'The Night It Ended'), chapter3: chapterCard(3, 'Why It Mattered'), chapter4: chapterCard(4, 'The Fallout'),
};
let lightRanges = [];
export async function preload() { try { const tl = await (await fetch('/build/ep07-nvidia-part3/timeline.json')).json(); lightRanges = tl.scenes.filter((x) => LIGHT[x.id]).map((x) => [x.start - 0.3, x.start + x.duration + 0.3]); } catch { /* none */ } }
export const look = { finish: (ctx, frame) => { const T = frame / 30; if (!lightRanges.some(([a, b]) => T >= a && T < b)) nightFinish(ctx, frame); } };
export const hits = [];
export const extraHits = (timeline) => {
  const out = [...lightSounds(timeline, LIGHT)];
  const sc = (id) => timeline.scenes.find((x) => x.id === id);
  const w = (id, p) => { const x = sc(id); return x.start + when(sceneWords(x.cues), p); };
  const S = (t, kind, vol = 0.6) => out.push({ t, kind, vol });
  const cuts = { c_open: ['writes thousands', 'Three hundred years', 'In four days', 'and lost the company'], masks: ['That same day', 'On Wednesday, the Times', 'Sources told the paper', 'Then, on Thursday', 'Nvidia declined'], night: ['According to a filing', 'The Wall Street Journal', 'Chief financial officer'], why: ['A boss', 'The board has said'], fallout: ['Senator Tim Scott', 'Not everyone', 'And on Tuesday'] };
  Object.entries(cuts).forEach(([id, ps]) => ps.forEach((p) => S(w(id, p) - 0.35, 'whoosh', 0.35)));
  ['chapter1', 'chapter2', 'chapter3', 'chapter4'].forEach((c) => S(sc(c).start + 0.15, 'hit', 0.6));
  S(w('c_open', 'and lost the company') + 0.5, 'hit', 0.5);
  S(w('masks', 'non-disclosure'), 'pop', 0.6); S(w('masks', 'Then, on Thursday') + 0.3, 'hit', 0.5);
  S(w('night', 'According to a filing') + 1.2, 'pop', 0.8);
  S(w('why', 'A CEO close'), 'pop', 0.5); S(w('why', 'And shareholders'), 'pop', 0.5);
  S(w('fallout', '14 percent'), 'hit', 0.6); S(w('fallout', 'Senator Tim Scott') + 1.2, 'pop', 0.7);
  return out;
};
void stars; void mist; void ez;
