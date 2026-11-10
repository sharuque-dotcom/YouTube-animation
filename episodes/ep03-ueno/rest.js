// Episode 3, chapters 1 (end) to 6 + outro. Each scene: cut phrases, one draw per shot, sound cues.
import { W, H, clamp, lerp, rand, text } from '../../pipeline/engine.js';
import { sceneWords, when } from '../../pipeline/shots.js';
import { skyline, rain, mist, glow, beam, clouds, flagCloth } from '../../pipeline/scenery.js';
import { chipIcon } from '../../pipeline/fx.js';
import { ez, out3, span, spring, TEAL, INK, PURPLE, at, shots, caption, nightBG, phone, cardIcon, cross } from './kit.js';
import { tower, march, domino } from './sets.js';

const RED = '#ff4d5e', GOLD = '#ffc93c', CARD = 'rgba(28,22,58,0.92)';

// ---------------------------------------------------------------- props
function stamp(g, t, a, str, x, y, { color = RED, rot = -0.1, size = 64 } = {}) {
  const sp = clamp((t - (a - 0.09)) / 0.09);
  if (sp <= 0) return;
  const b = t > a ? Math.exp(-(t - a) * 9) * Math.sin((t - a) * 40) * 0.04 : 0;
  g.save(); g.translate(x, y); g.rotate(rot); const sc = lerp(2.4, 1, sp * sp * sp) + b; g.scale(sc, sc); g.globalAlpha = 0.95 * sp;
  g.font = `800 ${size}px Jakarta`; const w = g.measureText(str).width + size;
  g.strokeStyle = color; g.lineWidth = size * 0.1; g.beginPath(); g.roundRect(-w / 2, -size * 0.75, w, size * 1.5, size * 0.2); g.stroke();
  text(g, str, 0, size * 0.36, { font: 'Jakarta', weight: 800, size, color, align: 'center', spacing: size * 0.05 });
  g.restore();
}
function panel(g, x, y, w, h, r = 28) {
  g.save(); g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 40; g.shadowOffsetY = 16;
  g.fillStyle = CARD; g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); g.restore();
  g.strokeStyle = 'rgba(185,162,255,0.35)'; g.lineWidth = 2; g.beginPath(); g.roundRect(x, y, w, h, r); g.stroke();
}
/** A classical bank / government building with columns */
function hall(g, cx, base, w, h, label, { color = '#d9d0ea', lit = 0.5, seed = 1 } = {}) {
  g.fillStyle = color; g.fillRect(cx - w / 2, base - h, w, h);
  g.beginPath(); g.moveTo(cx - w / 2 - 20, base - h); g.lineTo(cx, base - h - h * 0.35); g.lineTo(cx + w / 2 + 20, base - h); g.closePath(); g.fill();
  g.fillStyle = 'rgba(40,30,70,0.25)'; const n = Math.max(4, Math.floor(w / 60));
  for (let i = 0; i < n; i++) g.fillRect(cx - w / 2 + 20 + i * ((w - 40) / (n - 1)) - 8, base - h + 20, 16, h - 30);
  const r = rand(seed); for (let i = 0; i < n - 1; i++) if (r() < lit) { g.fillStyle = 'rgba(255,210,150,0.75)'; g.fillRect(cx - w / 2 + 20 + (i + 0.5) * ((w - 40) / (n - 1)) - 10, base - h * 0.55, 20, h * 0.3); }
  g.fillStyle = 'rgba(30,24,60,0.85)'; g.fillRect(cx - w / 2 - 30, base, w + 60, 14);
  if (label) text(g, label, cx, base - h - h * 0.08, { font: 'Jakarta', weight: 800, size: Math.max(16, Math.min(w * 0.065, 40)), color: '#2a2448', align: 'center' });
}
/** The Ueno tower, small, with a teal sign */
function uenoTower(g, cx, base, s = 1, { dark = 0 } = {}) {
  const w = 180 * s, h = 520 * s;
  g.fillStyle = '#1d1a45'; g.fillRect(cx - w / 2, base - h, w, h);
  for (let f = 0; f < 18; f++) for (let c = 0; c < 5; c++) { const on = rand(f * 7 + c)() < 0.7 && f / 18 > dark; g.fillStyle = on ? 'rgba(255,214,150,0.8)' : 'rgba(40,36,80,0.7)'; g.fillRect(cx - w / 2 + 12 * s + c * 32 * s, base - h + 30 * s + f * 27 * s, 22 * s, 14 * s); }
  text(g, 'ueno', cx, base - h - 14 * s, { font: 'Jakarta', weight: 800, size: 56 * s, color: dark > 0.5 ? '#4a5060' : TEAL, align: 'center' });
  if (dark < 0.5) glow(g, cx, base - h - 30 * s, 160 * s, '62,224,181', 0.25);
}
function counter(g, t, a, dur, to, fmt, x, y, { size = 120, color = INK } = {}) {
  const v = to * out3(span(t, a, dur));
  text(g, fmt(v), x, y, { font: 'Jakarta', weight: 800, size, color, align: 'center', alpha: span(t, a - 0.1, 0.2) });
}
/** Semicircle capital gauge 0–20%, with the 12% legal line */
function gauge(g, t, cx, cy, value, { R = 300, flash = 0 } = {}) {
  const ang = (v) => Math.PI + (clamp(v / 20) * Math.PI);
  g.lineCap = 'round';
  g.strokeStyle = 'rgba(185,162,255,0.2)'; g.lineWidth = 46; g.beginPath(); g.arc(cx, cy, R, Math.PI, 0); g.stroke();
  g.strokeStyle = 'rgba(255,77,94,0.55)'; g.beginPath(); g.arc(cx, cy, R, Math.PI, ang(12)); g.stroke();
  g.strokeStyle = 'rgba(62,224,181,0.55)'; g.beginPath(); g.arc(cx, cy, R, ang(12), 0); g.stroke();
  const l = ang(12), fl = flash > 0 ? 0.5 + 0.5 * Math.sin(t * 20) : 1;
  g.strokeStyle = `rgba(255,255,255,${fl})`; g.lineWidth = 6; g.beginPath(); g.moveTo(cx + Math.cos(l) * (R - 50), cy + Math.sin(l) * (R - 50)); g.lineTo(cx + Math.cos(l) * (R + 50), cy + Math.sin(l) * (R + 50)); g.stroke();
  text(g, '12% legal minimum', cx + Math.cos(l) * (R + 70) + 10, cy + Math.sin(l) * (R + 70), { font: 'Inter', weight: 600, size: 24, color: INK, align: 'left' });
  const a = ang(value);
  g.strokeStyle = INK; g.lineWidth = 10; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * (R - 30), cy + Math.sin(a) * (R - 30)); g.stroke();
  g.fillStyle = INK; g.beginPath(); g.arc(cx, cy, 20, 0, Math.PI * 2); g.fill();
  text(g, `${value.toFixed(value < 10 ? 2 : 1)}%`, cx, cy + 110, { font: 'Jakarta', weight: 800, size: 96, color: value < 12 ? RED : TEAL, align: 'center' });
}
function voteBoard(g, t, a, yes, no, title, { x = W / 2, y = 520 } = {}) {
  const p = spring(t, a - 0.2, 1.5, 0.7); if (p <= 0.01) return;
  g.save(); g.translate(x, y); g.scale(Math.min(1, p), Math.min(1, p));
  panel(g, -420, -230, 840, 460);
  text(g, title, 0, -160, { font: 'Jakarta', weight: 700, size: 34, color: PURPLE, align: 'center', spacing: 2 });
  const k = out3(span(t, a, 1.2));
  text(g, String(Math.round(yes * k)), -180, 60, { font: 'Jakarta', weight: 800, size: 170, color: TEAL, align: 'center' });
  text(g, String(no), 180, 60, { font: 'Jakarta', weight: 800, size: 170, color: RED, align: 'center' });
  text(g, 'YES', -180, 140, { font: 'Inter', weight: 700, size: 28, color: INK, align: 'center', spacing: 4 });
  text(g, 'NO', 180, 140, { font: 'Inter', weight: 700, size: 28, color: INK, align: 'center', spacing: 4 });
  for (let i = 0; i < 40; i++) { const on = i / 40 < k; g.fillStyle = on ? TEAL : 'rgba(255,255,255,0.08)'; g.beginPath(); g.arc(-380 + i * 19.5, 190, 7, 0, Math.PI * 2); g.fill(); }
  g.restore();
}
function calendar(g, t, a, dow, day, x, y) {
  const p = spring(t, a, 1.8, 0.6); if (p <= 0.01) return;
  g.save(); g.translate(x, y); g.scale(Math.min(1, p), Math.min(1, p)); g.rotate(-0.04);
  g.fillStyle = '#f7f1e6'; g.beginPath(); g.roundRect(-150, -170, 300, 340, 22); g.fill();
  g.fillStyle = '#d52b1e'; g.beginPath(); g.roundRect(-150, -170, 300, 90, [22, 22, 0, 0]); g.fill();
  text(g, dow, 0, -110, { font: 'Jakarta', weight: 800, size: 40, color: '#fff', align: 'center', spacing: 4 });
  text(g, String(day), 0, 80, { font: 'Jakarta', weight: 800, size: 160, color: '#1d1b29', align: 'center' });
  text(g, 'NOV 2026', 0, 140, { font: 'Inter', weight: 700, size: 24, color: '#6b6880', align: 'center', spacing: 3 });
  g.restore();
}
function silhouette(g, x, y, s, { sash = false, rimCol = 'rgba(255,200,140,0.5)' } = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = '#0c0a18';
  g.beginPath(); g.ellipse(0, -150, 46, 56, 0, 0, Math.PI * 2); g.fill(); g.fillRect(-18, -100, 36, 30);
  g.beginPath(); g.moveTo(-130, 300); g.lineTo(-135, -10); g.quadraticCurveTo(-130, -70, -40, -78); g.lineTo(40, -78); g.quadraticCurveTo(130, -70, 135, -10); g.lineTo(130, 300); g.closePath(); g.fill();
  g.fillStyle = '#f4f1ea'; g.beginPath(); g.moveTo(-22, -78); g.lineTo(0, -20); g.lineTo(22, -78); g.closePath(); g.fill();
  if (sash) { g.save(); g.rotate(-0.75); ['#d52b1e', '#f4f1ea', '#0038a8'].forEach((c, k) => { g.fillStyle = c; g.fillRect(-60, 40 + k * 18, 330, 18); }); g.restore(); }
  g.strokeStyle = rimCol; g.lineWidth = 4; g.beginPath(); g.ellipse(0, -150, 46, 56, 0, -1.4, 0.6); g.stroke(); g.beginPath(); g.moveTo(135, -10); g.lineTo(130, 300); g.stroke();
  g.restore();
}
function cityBG(g, t, { rainA = 0, seed = 7 } = {}) {
  nightBG(g, t);
  clouds(g, t + seed, { y: 200, h: 110, seed: 200 + seed, n: 8, scale: 0.6, lx: 1500, ly: 100, speed: 6, alpha: 0.8 });
  skyline(g, t, { base: 980, seed: 300 + seed, depth: 0.2, color: '#1b1840', lit: 0.12, tall: 0.7, fog: 'rgba(80,65,125,0.5)' });
  if (rainA) rain(g, t, { n: 400, alpha: rainA });
}
function coin(g, x, y, r, rot = 0) { g.save(); g.translate(x, y); g.scale(Math.cos(rot), 1); g.fillStyle = GOLD; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill(); g.fillStyle = '#e0a82a'; g.beginPath(); g.arc(0, 0, r * 0.68, 0, Math.PI * 2); g.fill(); g.restore(); }
function envelope(g, x, y, s, a = 1) { g.save(); g.translate(x, y); g.scale(s, s); g.globalAlpha *= a; g.fillStyle = '#f3efe6'; g.fillRect(-40, -26, 80, 52); g.strokeStyle = '#b8a9d8'; g.lineWidth = 3; g.beginPath(); g.moveTo(-40, -26); g.lineTo(0, 6); g.lineTo(40, -26); g.stroke(); g.restore(); }
function scales(g, x, y, s, tilt) {
  g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = INK; g.lineWidth = 10; g.lineCap = 'round';
  g.beginPath(); g.moveTo(0, -180); g.lineTo(0, 120); g.moveTo(-90, 120); g.lineTo(90, 120); g.stroke();
  g.save(); g.translate(0, -160); g.rotate(tilt); g.beginPath(); g.moveTo(-170, 0); g.lineTo(170, 0); g.stroke();
  [-170, 170].forEach((px) => { g.beginPath(); g.moveTo(px, 0); g.lineTo(px - 50, 110); g.moveTo(px, 0); g.lineTo(px + 50, 110); g.stroke(); g.beginPath(); g.arc(px, 110, 56, 0, Math.PI); g.stroke(); });
  g.restore(); g.restore();
}

// ---------------------------------------------------------------- scene builder
const SC = {};
function scene(id, cuts, draws, sfx = []) { SC[id] = { cuts, draws, sfx }; }
function build(id) {
  const def = SC[id];
  return (g, s) => {
    const b = (p, after = 0) => at(s, p, after);
    const cutT = def.cuts.map((p) => b(p) - 0.25);
    shots(g, s.t, cutT, def.draws.map((d) => (g2, tt) => d(g2, tt, b)));
  };
}

// ---- chapter 1 end: licence, merger, rank, "Dubai of South America"
scene('bigger', ['In 2024', 'At the same time'], [
  (g, t, b) => {
    cityBG(g, t);
    const p = spring(t, 0.05, 1.4, 0.7);
    g.save(); g.translate(W / 2, 520); g.scale(Math.min(1, p), Math.min(1, p)); g.rotate(-0.02);
    g.fillStyle = '#f7f1e6'; g.beginPath(); g.roundRect(-380, -300, 760, 600, 16); g.fill();
    text(g, 'LICENCIA BANCARIA', 0, -200, { font: "'Playfair Display'", weight: 900, size: 56, color: '#1d1b29', align: 'center' });
    text(g, 'Banking licence · 2023', 0, -150, { font: 'Inter', weight: 600, size: 26, color: '#6b6880', align: 'center' });
    g.fillStyle = '#d9d3e8'; for (let i = 0; i < 6; i++) g.fillRect(-300, -80 + i * 42, 600 - (i % 3) * 80, 14);
    text(g, 'ueno', -200, 230, { font: 'Jakarta', weight: 800, size: 56, color: '#1a6b58', align: 'center' });
    g.restore();
    stamp(g, t, b('banking licence') + 0.3, 'APROBADO', 1180, 700, { color: '#1f8a5b', size: 70 });
  },
  (g, t, b) => {
    cityBG(g, t, { seed: 2 });
    const m = ez(span(t, b('bought another bank'), 1.1)), rank = b('sixth-largest');
    g.save(); g.globalAlpha = 1 - span(t, rank - 0.4, 0.4);
    uenoTower(g, lerp(620, 900, m), 900, 0.9);
    hall(g, lerp(1300, 1020, m), 900, 340, 240, 'VISIÓN', { color: '#cfc6e6', seed: 4 });
    if (m > 0.95) glow(g, 960, 700, 500, '62,224,181', 0.3 * (1 - span(t, b('bought another bank') + 1.1, 0.6)));
    g.restore();
    caption(g, t, b('In 2024') + 0.3, '2024 · buys Visión Banco', 110);
    // podium of banks by assets, Ueno climbs to number 6
    const rp = span(t, rank - 0.3, 0.5);
    if (rp > 0) {
      g.save(); g.globalAlpha = rp;
      const climb = out3(span(t, rank, 1.4));
      for (let i = 0; i < 8; i++) {
        const isU = i === 7, pos = isU ? lerp(9.5, 5, climb) : i < 5 ? i : i + 1, y = 220 + pos * 88;
        const w = 900 - (isU ? lerp(9.5, 5, climb) : pos) * 80;
        g.fillStyle = isU ? TEAL : 'rgba(185,162,255,0.35)'; g.beginPath(); g.roundRect(460, y, w, 64, 16); g.fill();
        text(g, `${Math.round(pos) + 1}`, 420, y + 46, { font: 'Jakarta', weight: 800, size: 36, color: INK, align: 'right' });
        if (isU) text(g, 'ueno', 490, y + 46, { font: 'Jakarta', weight: 800, size: 36, color: '#0c2a24' });
      }
      g.restore();
      caption(g, t, rank + 0.4, 'sixth-largest bank in Paraguay', 1010);
    }
  },
  (g, t, b) => {
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#2a1d55'); gr.addColorStop(0.6, '#c06a6a'); gr.addColorStop(1, '#ffc58a');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    glow(g, W / 2, 820, 800, '255,210,140', 0.5);
    skyline(g, t, { base: 900, seed: 77, depth: 0.5, color: '#3a2650', lit: 0.3, tall: 1.4, minW: 60, maxW: 120, fog: 'rgba(255,190,140,0.3)', towers: [{ x: 920, w: 80, h: 620, roof: 0.9 }] });
    for (let i = 0; i < 40; i++) { const r = rand(i + 9); const x = r() * W, y = 150 + r() * 600, ph = (t * (0.6 + r()) + r()) % 1; g.fillStyle = `rgba(255,236,180,${Math.sin(ph * Math.PI) * 0.9})`; g.fillRect(x - 1, y - 8, 2, 16); g.fillRect(x - 8, y - 1, 16, 2); }
    g.fillStyle = '#1d1228'; g.fillRect(0, 900, W, 180);
    const pc = spring(t, 0.1, 1.4, 0.65);
    if (pc > 0.01) {
      g.save(); g.translate(W / 2, 330); g.rotate(-0.03); g.scale(Math.min(1, pc), Math.min(1, pc));
      g.fillStyle = 'rgba(247,241,230,0.95)'; g.beginPath(); g.roundRect(-430, -110, 860, 220, 16); g.fill();
      text(g, '"Dubai of South America"', 0, 20, { font: "'Playfair Display'", weight: 900, size: 64, color: '#1d1b29', align: 'center' });
      g.restore();
    }
    [['LOW TAXES', 'low taxes'], ['STEADY GROWTH', 'steady growth'], ['INVESTMENT GRADE', 'investment-grade']].forEach(([lab, ph], k) => {
      const p = spring(t, b(ph), 1.8, 0.6); if (p <= 0.01) return;
      g.save(); g.translate(560 + k * 400, 620); g.scale(Math.min(1.05, p), Math.min(1.05, p));
      panel(g, -170, -50, 340, 100, 50);
      text(g, '✓', -130, 14, { font: 'Jakarta', weight: 800, size: 36, color: TEAL });
      text(g, lab, 20, 12, { font: 'Jakarta', weight: 700, size: 26, color: INK, align: 'center' });
      g.restore();
    });
  },
], [['banking licence', 0.3, 'pop', 0.9], ['bought another bank', 1.0, 'hit', 0.5], ['sixth-largest', 0.2, 'whoosh', 0.4], ['low taxes', 0, 'pop', 0.5], ['steady growth', 0, 'pop', 0.5], ['investment-grade', 0, 'pop', 0.5]]);

// ---- chapter 2: friends in high places
scene('pena', ['Before and during', 'He also picked'], [
  (g, t, b) => {
    cityBG(g, t, { seed: 3 });
    hall(g, 1400, 880, 520, 260, 'PALACIO', { seed: 8 });
    silhouette(g, 620, 700, 1.25, { sash: true });
    const p = spring(t, 0.15, 1.6, 0.7);
    if (p > 0.01) { g.save(); g.translate(1100, 300); g.scale(Math.min(1, p), Math.min(1, p)); panel(g, -260, -90, 520, 180); text(g, 'Santiago Peña', 0, -10, { font: 'Jakarta', weight: 800, size: 52, color: INK, align: 'center' }); text(g, 'President of Paraguay · elected 2023', 0, 46, { font: 'Inter', weight: 600, size: 24, color: PURPLE, align: 'center' }); g.restore(); }
    const ip = spring(t, b('IMF'), 1.8, 0.6);
    if (ip > 0.01) { g.save(); g.translate(1100, 520); g.scale(Math.min(1, ip), Math.min(1, ip)); g.fillStyle = '#5a3a2a'; g.beginPath(); g.roundRect(-110, -60, 220, 140, 16); g.fill(); g.fillStyle = '#3a2418'; g.fillRect(-40, -90, 80, 34); text(g, 'IMF', 0, 30, { font: 'Jakarta', weight: 800, size: 44, color: GOLD, align: 'center' }); g.restore(); caption(g, t, b('IMF') + 0.3, 'former IMF economist', 690, { x: 1100 }); }
    caption(g, t, 0.4, 'no photo shown · illustration', 1010, { size: 24 });
  },
  (g, t, b) => {
    cityBG(g, t, { seed: 4 });
    uenoTower(g, 1450, 920, 1.1);
    silhouette(g, 480, 760, 1.1);
    const cp = spring(t, b('small stake'), 1.4, 0.7);
    const sold = b('sold it in 2025'), away = ez(span(t, sold + 0.2, 1.2));
    if (cp > 0.01) {
      g.save(); g.translate(lerp(820, 1200, away), lerp(480, 380, away)); g.rotate(-0.05 + away * 0.2); g.scale(Math.min(1, cp), Math.min(1, cp));
      g.fillStyle = '#f7f1e6'; g.beginPath(); g.roundRect(-220, -140, 440, 280, 12); g.fill();
      g.strokeStyle = '#b8932a'; g.lineWidth = 6; g.beginPath(); g.roundRect(-204, -124, 408, 248, 8); g.stroke();
      text(g, 'SHARES · UENO HOLDING', 0, -60, { font: 'Jakarta', weight: 800, size: 26, color: '#1d1b29', align: 'center' });
      text(g, '1.58%', 0, 50, { font: 'Jakarta', weight: 800, size: 96, color: '#1a6b58', align: 'center' });
      g.restore();
    }
    stamp(g, t, sold + 0.6, 'SOLD 2025 (HE SAYS)', 760, 760, { color: GOLD, size: 46, rot: -0.06 });
  },
  (g, t, b) => {
    cityBG(g, t, { seed: 5 });
    uenoTower(g, 420, 920, 0.95);
    hall(g, 1450, 900, 560, 300, 'BANCO CENTRAL', { color: '#e3dcef', seed: 12 });
    // the referee's whistle flies from the bank to the regulator
    const f = ez(span(t, b('run the central bank') - 0.3, 1.4));
    const x = lerp(520, 1400, f), y = lerp(520, 480, f) - Math.sin(f * Math.PI) * 220;
    g.save(); g.translate(x, y); g.rotate(f * 6);
    g.fillStyle = '#d9d6e6'; g.beginPath(); g.roundRect(-50, -24, 80, 48, 22); g.fill(); g.beginPath(); g.arc(34, 0, 26, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#2a2448'; g.beginPath(); g.arc(34, 0, 12, 0, Math.PI * 2); g.fill();
    g.restore();
    caption(g, t, b('He also picked') + 0.3, 'Carlos Carvallo: from Ueno’s predecessor to central bank chief', 110, { size: 28 });
    const qp = spring(t, b('supposed to watch'), 1.8, 0.55);
    if (qp > 0.01) { g.save(); g.translate(960, 800); g.scale(Math.min(1.05, qp), Math.min(1.05, qp)); g.fillStyle = RED; g.beginPath(); g.roundRect(-210, -52, 420, 104, 52); g.fill(); text(g, 'CONFLICT?', 0, 18, { font: 'Jakarta', weight: 800, size: 50, color: '#fff', align: 'center' }); g.restore(); }
  },
], [['IMF', 0, 'pop', 0.5], ['small stake', 0, 'pop', 0.6], ['sold it in 2025', 0.6, 'pop', 0.8], ['run the central bank', -0.3, 'whoosh', 0.5], ['supposed to watch', 0, 'hit', 0.6]]);

scene('money', ["Paraguay's social security institute"], [
  (g, t, b) => {
    cityBG(g, t, { seed: 6 });
    hall(g, 400, 900, 440, 260, 'ESTADO', { color: '#e3dcef', seed: 13 });
    hall(g, 400, 610, 0, 0, '');
    uenoTower(g, 1500, 940, 1.15);
    // envelopes of public money stream across
    const s0 = 0.4, r = rand(21);
    for (let i = 0; i < 60; i++) {
      const born = s0 + r() * 8, ph = clamp((t - born) / 1.6), yo = (r() - 0.5) * 160;
      if (ph <= 0 || ph >= 1) continue;
      const e = ez(ph), x = lerp(560, 1400, e), y = lerp(720 + yo, 600 + yo * 0.5, e) - Math.sin(e * Math.PI) * 200;
      envelope(g, x, y, 0.8, Math.sin(ph * Math.PI));
    }
    const a8 = b('about 850 million');
    panel(g, 700, 140, 520, 200);
    counter(g, t, a8 - 1.2, 1.6, 850, (v) => `$${Math.round(v)}M`, 960, 270, { size: 100 });
    text(g, 'public money at Ueno · Aug 2026', 960, 316, { font: 'Inter', weight: 600, size: 22, color: PURPLE, align: 'center' });
    const ss = b('social security fund');
    if (t > ss - 0.3) { panel(g, 760, 370, 400, 130); counter(g, t, ss - 0.3, 1, 355, (v) => `$${Math.round(v)}M`, 960, 450, { size: 64, color: GOLD }); text(g, 'social security fund', 960, 486, { font: 'Inter', weight: 600, size: 20, color: INK, align: 'center' }); }
  },
  (g, t, b) => {
    cityBG(g, t, { seed: 7 });
    const p = spring(t, 0.05, 1.4, 0.7);
    g.save(); g.translate(W / 2, 520); g.scale(Math.min(1, p), Math.min(1, p));
    g.fillStyle = '#f7f1e6'; g.beginPath(); g.roundRect(-420, -330, 840, 660, 14); g.fill();
    text(g, 'IPS · REGLAMENTO', 0, -250, { font: 'Jakarta', weight: 800, size: 40, color: '#1d1b29', align: 'center' });
    g.fillStyle = '#d9d3e8'; for (let i = 0; i < 8; i++) g.fillRect(-340, -190 + i * 44, 680 - (i % 3) * 120, 14);
    // the limit line: erased and redrawn higher
    const er = span(t, b('loosened') - 0.2, 0.8), up = ez(span(t, b('loosened') + 0.6, 0.8));
    const ly = lerp(170, -40, up);
    g.strokeStyle = RED; g.lineWidth = 8; g.setLineDash([18, 12]);
    g.beginPath(); g.moveTo(-340, 170); g.lineTo(lerp(340, -340, er), 170); g.stroke();
    if (up > 0) { g.beginPath(); g.moveTo(-340, ly); g.lineTo(340, ly); g.stroke(); }
    g.setLineDash([]);
    text(g, 'LIMIT', 360, (up > 0 ? ly : 170) + 10, { font: 'Jakarta', weight: 800, size: 28, color: RED });
    g.restore();
    // eraser
    if (er > 0 && er < 1) { const ex = W / 2 + lerp(340, -340, er), ey = 520 + 170; g.fillStyle = '#ff9fb2'; g.beginPath(); g.roundRect(ex - 40, ey - 70, 80, 60, 8); g.fill(); g.fillStyle = '#5b5ad6'; g.fillRect(ex - 40, ey - 90, 80, 24); }
    caption(g, t, b('loosened') + 0.4, 'the fund relaxed its own rules (2023–24)', 1010);
  },
], [['about 850 million', 0.4, 'pop', 0.8], ['social security fund', 0, 'pop', 0.6], ['loosened', 0, 'whoosh', 0.4]]);

// ---- chapter 3: warnings
scene('warn', ['That summer', 'In October', 'On paper'], [
  (g, t, b) => {
    cityBG(g, t, { seed: 8 });
    panel(g, 260, 160, 900, 760);
    text(g, 'INSPECTION · JUNE 2026', 300, 230, { font: 'Jakarta', weight: 800, size: 30, color: PURPLE, spacing: 2 });
    const rl = b('risky loans');
    for (let i = 0; i < 10; i++) { const y = 300 + i * 58, hot = i % 3 === 1; g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(300, y, 820, 44); text(g, `LOAN ${1040 + i * 7}`, 320, y + 30, { font: 'Inter', weight: 600, size: 22, color: INK }); if (hot && t > rl + i * 0.05) { g.fillStyle = 'rgba(255,77,94,0.3)'; g.fillRect(300, y, 820, 44); } }
    // magnifier sweeping
    const mx = 400 + ((t * 160) % 700), my = 520 + Math.sin(t) * 140;
    g.strokeStyle = INK; g.lineWidth = 12; g.fillStyle = 'rgba(217,204,255,0.12)'; g.beginPath(); g.arc(mx, my, 70, 0, Math.PI * 2); g.fill(); g.stroke(); g.lineWidth = 20; g.lineCap = 'round'; g.beginPath(); g.moveTo(mx + 50, my + 50); g.lineTo(mx + 110, my + 110); g.stroke();
    // links to the owners' flag
    const ow = b('own owners');
    if (t > ow - 0.2) {
      g.save(); g.translate(1550, 380); g.strokeStyle = '#e8e3f5'; g.lineWidth = 6; g.beginPath(); g.moveTo(0, 200); g.lineTo(0, -60); g.stroke(); g.fillStyle = '#7a4ab8'; g.beginPath(); g.moveTo(0, -60); g.lineTo(180, -20); g.lineTo(0, 20); g.closePath(); g.fill(); text(g, 'OWNERS', 80, -12, { font: 'Jakarta', weight: 800, size: 22, color: INK, align: 'center' }); g.restore();
      const k = span(t, ow - 0.2, 0.8); g.strokeStyle = 'rgba(255,77,94,0.8)'; g.lineWidth = 4; g.setLineDash([10, 10]);
      [1, 4, 7].forEach((i) => { const y = 322 + i * 58; g.beginPath(); g.moveTo(1120, y); g.lineTo(lerp(1120, 1550, k), lerp(y, 480, k)); g.stroke(); }); g.setLineDash([]);
    }
    if (t > rl) { panel(g, 1300, 700, 500, 170); counter(g, t, rl, 1.1, 146, (v) => `$${Math.round(v)}M`, 1550, 800, { size: 84, color: RED }); text(g, 'risky related loans', 1550, 845, { font: 'Inter', weight: 600, size: 22, color: INK, align: 'center' }); }
  },
  (g, t, b) => {
    cityBG(g, t, { seed: 9 });
    const p = spring(t, 0.05, 1.6, 0.6);
    g.save(); g.translate(760, 520); g.rotate(-0.04 + (1 - Math.min(1, p)) * 0.6); g.scale(Math.min(1, p), Math.min(1, p));
    g.fillStyle = '#f2eee4'; g.fillRect(-380, -300, 760, 600);
    text(g, 'ABC Color', 0, -220, { font: "'Playfair Display'", weight: 900, size: 64, color: '#1d1b29', align: 'center' });
    g.fillStyle = '#1d1b29'; g.fillRect(-340, -190, 680, 4);
    text(g, 'Questions over Ueno’s numbers', 0, -110, { font: "'Playfair Display'", weight: 700, size: 40, color: '#1d1b29', align: 'center' });
    g.fillStyle = '#cfc9bb'; g.fillRect(-340, -60, 300, 220); for (let i = 0; i < 9; i++) { g.fillStyle = '#c4beb0'; g.fillRect(0, -60 + i * 26, 330, 10); }
    text(g, 'ILLUSTRATION', 330, 280, { font: 'Inter', weight: 600, size: 18, color: '#8a8478', align: 'right', spacing: 3 });
    g.restore();
    const sue = b('threatened to sue'), lp = ez(span(t, sue - 0.2, 0.7));
    if (lp > 0) { g.save(); g.translate(lerp(W + 300, 1360, lp), lerp(200, 480, lp)); g.rotate(lerp(1, 0.08, lp)); g.fillStyle = '#ffffff'; g.fillRect(-200, -130, 400, 260); text(g, 'DEMANDA', 0, -60, { font: 'Jakarta', weight: 800, size: 44, color: RED, align: 'center' }); text(g, 'legal action', 0, -20, { font: 'Inter', weight: 600, size: 22, color: '#6b6880', align: 'center' }); g.fillStyle = '#e6e1f0'; for (let i = 0; i < 4; i++) g.fillRect(-160, 20 + i * 28, 320 - i * 40, 10); g.restore(); }
    caption(g, t, b('asking questions') + 0.2, 'the newspaper ABC Color asks questions', 1010);
  },
  (g, t, b) => {
    cityBG(g, t, { seed: 10 });
    // Senate door; a folder slides under it; camera flashes
    g.fillStyle = '#3a2b5e'; g.fillRect(760, 220, 400, 680); g.fillStyle = '#2a1f45'; g.fillRect(790, 250, 160, 620); g.fillRect(970, 250, 160, 620);
    g.fillStyle = GOLD; g.beginPath(); g.arc(950, 560, 12, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(970, 560, 12, 0, Math.PI * 2); g.fill();
    text(g, 'SENADO', 960, 200, { font: 'Jakarta', weight: 800, size: 44, color: INK, align: 'center', spacing: 8 });
    g.fillStyle = '#120e24'; g.fillRect(0, 900, W, 180);
    const fp = ez(span(t, b('reached the Senate') - 0.6, 1.2));
    g.save(); g.translate(lerp(200, 900, fp), 880); g.fillStyle = '#e8c47f'; g.fillRect(-140, -26, 280, 30); text(g, 'BCP REPORT · LEAKED', 0, -4, { font: 'Jakarta', weight: 800, size: 18, color: '#4a3510', align: 'center' }); g.restore();
    for (let i = 0; i < 6; i++) { const ph = ((t - b('criticised')) * 1.6 + i * 0.37) % 1; if (t > b('criticised') && ph < 0.1) glow(g, 300 + i * 260, 980, 160, '255,255,255', 0.9 * (1 - ph * 10)); }
    const gq = spring(t, b('genuine'), 1.8, 0.6);
    if (gq > 0.01) { g.save(); g.translate(1450, 420); g.scale(Math.min(1.05, gq), Math.min(1.05, gq)); panel(g, -200, -60, 400, 120, 60); text(g, 'genuine?', 0, 16, { font: 'Jakarta', weight: 800, size: 46, color: GOLD, align: 'center' }); g.restore(); caption(g, t, b('genuine') + 0.3, 'Ueno questioned the document', 1010); }
    else caption(g, t, b('criticised') + 0.2, 'Peña criticised the leak', 1010);
  },
  (g, t, b) => {
    cityBG(g, t, { seed: 11 });
    const v = lerp(9, 13.8, out3(span(t, 0.2, 1.4)));
    gauge(g, t, W / 2, 640, v);
    caption(g, t, 0.4, 'what Ueno reported · 30 September 2026', 110);
    const rp = spring(t, b('raise 100 million'), 1.6, 0.6);
    if (rp > 0.01) { g.save(); g.translate(W / 2, 300); g.scale(Math.min(1.05, rp), Math.min(1.05, rp)); g.fillStyle = TEAL; g.beginPath(); g.roundRect(-300, -60, 600, 120, 60); g.fill(); text(g, '+ $100M capital plan', 0, 16, { font: 'Jakarta', weight: 800, size: 46, color: '#0c2a24', align: 'center' }); g.restore(); }
  },
], [['risky loans', 0, 'pop', 0.7], ['That summer', 0, 'whoosh', 0.5], ['threatened to sue', 0, 'hit', 0.6], ['reached the Senate', 0, 'whoosh', 0.4], ['criticised', 0, 'tick', 0.7], ['genuine', 0, 'pop', 0.6], ['raise 100 million', 0, 'pop', 0.7]]);

// ---- chapter 4: the night the app went dark
scene('dark', ['Inspectors said', 'Overnight'], [
  (g, t) => { tower(g, t + 1, { darkAt: 0.4, darkDur: 3.2 }); caption(g, t, 0.6, 'Monday, 2 November · the central bank steps in', 1010); },
  (g, t, b) => {
    cityBG(g, t, { seed: 12 });
    const drop = b('5.56') - 0.2, v = lerp(13.8, 5.56, ez(span(t, drop, 1.2)));
    gauge(g, t, W / 2, 640, v, { flash: t > drop + 1 ? 1 : 0 });
    caption(g, t, 0.3, 'reported', 110);
    if (t > drop + 1) { caption(g, t, drop + 1.1, 'less than half the legal minimum', 1010); stamp(g, t, b('less than half'), 'BELOW MINIMUM', 1500, 300, { size: 44 }); }
  },
  (g, t, b) => {
    cityBG(g, t, { seed: 13 });
    const items = [['Salaries', 'Salaries', 520], ['savings', 'Savings', 960], ['pensions', 'Pensions', 1400]];
    items.forEach(([ph, lab, x], k) => {
      const a0 = k === 0 ? Math.min(b(ph), 0.4 + 0.3 * k) : b(ph), p = spring(t, a0, 1.6, 0.6);
      if (p <= 0.01) return;
      g.save(); g.translate(x, 520); g.scale(Math.min(1, p), Math.min(1, p));
      if (k === 0) { g.fillStyle = '#f3efe6'; g.fillRect(-110, -140, 220, 280); g.fillStyle = '#d9d3e8'; for (let i = 0; i < 6; i++) g.fillRect(-80, -100 + i * 36, 160 - (i % 2) * 50, 12); text(g, '₲', 0, 110, { font: 'Jakarta', weight: 800, size: 44, color: '#1a6b58', align: 'center' }); }
      if (k === 1) { g.fillStyle = '#ff9fb2'; g.beginPath(); g.ellipse(0, 0, 150, 110, 0, 0, Math.PI * 2); g.fill(); g.fillRect(-90, 80, 30, 60); g.fillRect(60, 80, 30, 60); g.fillStyle = '#e27a92'; g.fillRect(-30, -116, 60, 12); g.beginPath(); g.arc(110, -10, 14, 0, Math.PI * 2); g.fill(); }
      if (k === 2) { g.fillStyle = '#c7f0e2'; g.fillRect(-160, -90, 320, 180); text(g, 'PENSIÓN', 0, -20, { font: 'Jakarta', weight: 800, size: 40, color: '#1a6b58', align: 'center' }); text(g, '₲ 3.200.000', 0, 40, { font: 'Jakarta', weight: 700, size: 30, color: '#1d1b29', align: 'center' }); }
      g.restore();
      // ice block freezing over it
      const ice = span(t, a0 + 0.5, 0.9);
      if (ice > 0) { g.save(); g.globalAlpha = 0.75 * ice; const ig = g.createLinearGradient(x - 200, 300, x + 200, 760); ig.addColorStop(0, 'rgba(200,235,255,0.85)'); ig.addColorStop(1, 'rgba(120,180,240,0.55)'); g.fillStyle = ig; g.beginPath(); g.roundRect(x - 200, 760 - 460 * ice, 400, 460 * ice, 20); g.fill(); g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x - 160, 740 - 400 * ice); g.lineTo(x - 60, 700 - 380 * ice); g.lineTo(x - 90, 740 - 300 * ice); g.stroke(); g.restore(); }
      caption(g, t, a0 + 0.3, lab, 860, { x });
    });
    caption(g, t, 0.3, 'millions of accounts frozen', 140);
  },
], [['Three days later', 0.6, 'hit', 0.6], ['5.56', 0, 'whoosh', 0.5], ['less than half', 0, 'pop', 0.9], ['Salaries', 0.5, 'tick', 0.6], ['savings', 0.5, 'tick', 0.6], ['pensions', 0.5, 'tick', 0.6]]);

scene('impact', ['A state guarantee', "Paraguay's currency"], [
  (g, t, b) => {
    cityBG(g, t, { seed: 14 });
    // card terminal with ERROR
    g.save(); g.translate(620, 520); g.rotate(-0.05);
    g.fillStyle = '#2b2440'; g.beginPath(); g.roundRect(-150, -240, 300, 480, 40); g.fill();
    const blink = Math.floor(t * 3) % 2;
    g.fillStyle = blink ? '#3a0f18' : '#5a1624'; g.beginPath(); g.roundRect(-120, -200, 240, 140, 16); g.fill();
    text(g, 'ERROR', 0, -112, { font: 'Jakarta', weight: 800, size: 54, color: RED, align: 'center' });
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) { g.fillStyle = '#4a3f6b'; g.beginPath(); g.roundRect(-100 + c * 70, -20 + r * 56, 56, 42, 10); g.fill(); }
    g.restore();
    cardIcon(g, 620 + Math.sin(t * 2) * 6, 230, 0.9);
    caption(g, t, 0.4, 'payments down', 860, { x: 620 });
    // school lunch tray slides off a table
    const sm = b('school meals'), sl = ez(span(t, sm, 1));
    g.fillStyle = '#5a3a2a'; g.fillRect(1100, 620, 600, 26); g.fillRect(1140, 646, 20, 200); g.fillRect(1640, 646, 20, 200);
    g.save(); g.translate(lerp(1400, 1820, sl), lerp(590, 900, sl * sl)); g.rotate(sl * 1.4);
    g.fillStyle = '#c9c3d9'; g.beginPath(); g.roundRect(-140, -30, 280, 60, 10); g.fill();
    if (sl < 0.4) { g.fillStyle = '#ffd166'; g.beginPath(); g.arc(-60, -30, 30, Math.PI, 0); g.fill(); g.fillStyle = '#7fc8a9'; g.beginPath(); g.arc(40, -30, 26, Math.PI, 0); g.fill(); }
    g.restore();
    if (t > sm) caption(g, t, sm + 0.3, 'school meals suspended', 860, { x: 1400 });
  },
  (g, t, b) => {
    cityBG(g, t, { seed: 15 });
    // two charts: people covered vs money insured
    const a1 = b('97 percent'), a2 = b("Moody's");
    panel(g, 180, 200, 740, 640); panel(g, 1000, 200, 740, 640);
    text(g, 'CUSTOMERS COVERED', 550, 270, { font: 'Jakarta', weight: 700, size: 28, color: PURPLE, align: 'center', spacing: 2 });
    text(g, 'MONEY INSURED (MOODY’S EST.)', 1370, 270, { font: 'Jakarta', weight: 700, size: 28, color: PURPLE, align: 'center', spacing: 2 });
    for (let i = 0; i < 100; i++) { const r = Math.floor(i / 10), c = i % 10, on = i < 97 * out3(span(t, a1, 1.2)); g.fillStyle = on ? TEAL : 'rgba(255,255,255,0.1)'; g.beginPath(); g.arc(310 + c * 48, 340 + r * 40, 14, 0, Math.PI * 2); g.fill(); }
    counter(g, t, a1, 1.2, 97, (v) => `${Math.round(v)}%`, 550, 800, { size: 80, color: TEAL });
    const pk = out3(span(t, a2, 1.2)) * (1 / 3);
    g.fillStyle = 'rgba(255,255,255,0.1)'; g.beginPath(); g.arc(1370, 530, 200, 0, Math.PI * 2); g.fill();
    if (pk > 0) { g.fillStyle = GOLD; g.beginPath(); g.moveTo(1370, 530); g.arc(1370, 530, 200, -Math.PI / 2, -Math.PI / 2 + pk * Math.PI * 2); g.closePath(); g.fill(); }
    if (t > a2) text(g, '≈ 1/3', 1370, 800, { font: 'Jakarta', weight: 800, size: 80, color: GOLD, align: 'center', alpha: span(t, a2, 0.4) });
    caption(g, t, 0.3, 'a state guarantee fund starts paying back', 120);
  },
  (g, t, b) => {
    cityBG(g, t, { seed: 16 });
    const sh = ez(span(t, b('8 percent') - 0.4, 1.4));
    // guaraní note shrinks, dollar grows
    g.save(); g.translate(660, 540); const s1 = lerp(1, 0.84, sh); g.scale(s1, s1);
    g.fillStyle = '#b8d8c8'; g.beginPath(); g.roundRect(-280, -140, 560, 280, 16); g.fill(); g.strokeStyle = '#4a7a64'; g.lineWidth = 6; g.beginPath(); g.roundRect(-262, -122, 524, 244, 10); g.stroke();
    text(g, '₲', -180, 40, { font: 'Jakarta', weight: 800, size: 110, color: '#2a5a44', align: 'center' }); text(g, 'GUARANÍ', 80, 20, { font: 'Jakarta', weight: 800, size: 54, color: '#2a5a44', align: 'center' });
    g.restore();
    g.save(); g.translate(1300, 540); const s2 = lerp(1, 1.08, sh); g.scale(s2, s2);
    g.fillStyle = '#cfe0c3'; g.beginPath(); g.roundRect(-280, -140, 560, 280, 16); g.fill(); g.strokeStyle = '#4f6b3a'; g.lineWidth = 6; g.beginPath(); g.roundRect(-262, -122, 524, 244, 10); g.stroke();
    text(g, '$', -180, 40, { font: 'Jakarta', weight: 800, size: 110, color: '#3f5a2a', align: 'center' }); text(g, 'US DOLLAR', 80, 20, { font: 'Jakarta', weight: 800, size: 54, color: '#3f5a2a', align: 'center' });
    g.restore();
    if (sh > 0.3) { text(g, '−8%', 660, 300, { font: 'Jakarta', weight: 800, size: 110, color: RED, align: 'center', alpha: span(t, b('8 percent'), 0.4) }); }
    caption(g, t, 0.3, 'the guaraní against the dollar', 1010);
  },
], [['school meals', 0, 'whoosh', 0.5], ['97 percent', 0, 'pop', 0.6], ["Moody's", 0, 'pop', 0.6], ['8 percent', 0, 'hit', 0.6]]);

// ---- chapter 5: five days
scene('days1', ['Then the crowds moved', 'Thursday', 'But lawmakers refused'], [
  (g, t, b) => {
    cityBG(g, t, { seed: 17 });
    calendar(g, t, 0.1, 'MONDAY', 3, 330, 420);
    // empty chair spinning in an office
    const rs = b('resigned');
    g.save(); g.translate(900, 560); g.rotate(Math.sin(t * 1.5) * 0.1);
    g.fillStyle = '#2b2440'; g.beginPath(); g.roundRect(-90, -200, 180, 200, 30); g.fill(); g.fillRect(-100, 0, 200, 40); g.fillRect(-10, 40, 20, 100); g.fillRect(-80, 140, 160, 14);
    g.restore();
    if (t > rs) caption(g, t, rs + 0.2, 'central bank chief resigns', 820, { x: 900 });
    // crowd at the closed branch doors
    const cg = b('Crowds gathered');
    g.fillStyle = '#2a2448'; g.fillRect(1250, 380, 520, 500); g.fillStyle = '#16132e'; g.fillRect(1360, 560, 300, 320);
    for (let i = 0; i < 8; i++) { g.fillStyle = 'rgba(80,70,120,0.8)'; g.fillRect(1360 + i * 38, 560, 4, 320); }
    text(g, 'ueno', 1510, 480, { font: 'Jakarta', weight: 800, size: 64, color: '#4a5060', align: 'center' });
    g.fillStyle = '#f3efe6'; g.fillRect(1440, 640, 140, 40); text(g, 'CERRADO', 1510, 670, { font: 'Jakarta', weight: 800, size: 22, color: RED, align: 'center' });
    const r = rand(5); for (let i = 0; i < 14; i++) { const p = spring(t, cg + r() * 1.2, 1.6, 0.7); if (p <= 0.01) { r(); continue; } const x = 1270 + r() * 480, y = 900 + r() * 30; g.fillStyle = '#0c0a18'; g.beginPath(); g.arc(x, y - 110 * p, 18, 0, Math.PI * 2); g.fill(); g.fillRect(x - 26, y - 92 * p, 52, 100 * p); }
    g.fillStyle = '#0a0918'; g.fillRect(0, 940, W, 140);
  },
  (g, t) => { march(g, t + 2); caption(g, t, 0.5, 'protests at Congress · staff burn their company cards', 110, { size: 28 }); },
  (g, t, b) => {
    cityBG(g, t, { seed: 18 });
    calendar(g, t, 0.1, 'THURSDAY', 5, 330, 420);
    const p = spring(t, 0.3, 1.4, 0.7);
    g.save(); g.translate(1100, 540); g.rotate(0.03); g.scale(Math.min(1, p), Math.min(1, p));
    g.fillStyle = '#f7f1e6'; g.fillRect(-340, -380, 680, 760);
    text(g, 'RENUNCIA', 0, -290, { font: "'Playfair Display'", weight: 900, size: 56, color: '#1d1b29', align: 'center' });
    text(g, '"…for the stability of our country…"', 0, -200, { font: "'Playfair Display'", style: 'italic', weight: 400, size: 30, color: '#4a4560', align: 'center' });
    g.fillStyle = '#d9d3e8'; for (let i = 0; i < 7; i++) g.fillRect(-280, -130 + i * 44, 560 - (i % 3) * 90, 12);
    const sg = span(t, b('resign') + 0.3, 1.2); g.strokeStyle = '#1d3b8a'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath();
    for (let i = 0; i <= 60 * sg; i++) { const u = i / 60; const x = -200 + u * 380, y = 260 + Math.sin(u * 18) * 22 * (1 - u * 0.5) - u * 30; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
    g.restore();
    caption(g, t, b('resign') + 0.2, 'Peña offers to resign', 1010);
  },
  (g, t, b) => {
    cityBG(g, t, { seed: 19 });
    const rj = b('refused');
    g.save(); g.translate(560, 520); g.rotate(0.03); g.fillStyle = '#f7f1e6'; g.fillRect(-260, -320, 520, 640); text(g, 'RENUNCIA', 0, -230, { font: "'Playfair Display'", weight: 900, size: 46, color: '#1d1b29', align: 'center' }); g.fillStyle = '#d9d3e8'; for (let i = 0; i < 8; i++) g.fillRect(-200, -160 + i * 44, 400 - (i % 3) * 80, 12); g.restore();
    stamp(g, t, rj + 0.2, 'REJECTED', 560, 520, { size: 72, rot: -0.15 });
    const ls = b('lifetime Senate seat');
    if (t > ls - 0.2 && t < b('78 to 0') - 0.3) { const p = spring(t, ls, 1.6, 0.6); g.save(); g.translate(1350, 420); g.scale(Math.min(1, p), Math.min(1, p)); panel(g, -320, -140, 640, 280); text(g, 'resign → lifetime Senate seat', 0, -40, { font: 'Jakarta', weight: 700, size: 34, color: INK, align: 'center' }); text(g, '→ immunity', 0, 40, { font: 'Jakarta', weight: 800, size: 54, color: GOLD, align: 'center', alpha: span(t, b('immunity'), 0.3) }); g.restore(); }
    if (t > b('78 to 0') - 0.3) voteBoard(g, t, b('78 to 0'), 78, 0, 'LOWER HOUSE · IMPEACH', { x: 1350, y: 520 });
  },
], [['Monday', 0, 'pop', 0.6], ['resigned', 0, 'tick', 0.6], ['Then the crowds moved', 0, 'whoosh', 0.5], ['Thursday', 0, 'pop', 0.6], ['refused', 0.2, 'pop', 0.9], ['refused', 0.2, 'hit', 0.5], ['78 to 0', 0, 'hit', 0.7]]);

scene('days2', ['That night', 'Over the weekend', 'Investigators raided'], [
  (g, t, b) => {
    cityBG(g, t, { seed: 20 });
    calendar(g, t, 0.1, 'FRIDAY', 6, 300, 380);
    voteBoard(g, t, b('44 to 0'), 44, 0, 'SENATE · REMOVE', { x: 1050, y: 380 });
    const sw = b('sworn in'), m = ez(span(t, sw - 0.2, 1.2));
    silhouette(g, 820, 860, 0.62, { sash: m < 0.5 });
    silhouette(g, 1300, 860, 0.62, { sash: m >= 0.5 });
    if (m > 0 && m < 1) { g.save(); g.translate(lerp(820, 1300, m), 800 - Math.sin(m * Math.PI) * 120); g.rotate(-0.75); ['#d52b1e', '#f4f1ea', '#0038a8'].forEach((c, k) => { g.fillStyle = c; g.fillRect(-100, k * 12, 200, 12); }); g.restore(); }
    if (t > sw) caption(g, t, sw + 0.3, 'Pedro Alliana sworn in', 1010);
  },
  (g, t) => {
    nightBG(g, t);
    // residence gate at night, police lights sweeping
    g.fillStyle = '#e3dcef'; g.fillRect(560, 440, 800, 360); g.fillStyle = '#cfc6e6'; g.beginPath(); g.moveTo(520, 440); g.lineTo(960, 300); g.lineTo(1400, 440); g.closePath(); g.fill();
    for (let i = 0; i < 6; i++) { g.fillStyle = rand(i + 40)() < 0.6 ? 'rgba(255,210,150,0.8)' : 'rgba(60,54,100,0.8)'; g.fillRect(620 + i * 125, 520, 60, 90); }
    g.fillStyle = '#0a0918'; g.fillRect(0, 800, W, 280);
    g.strokeStyle = '#1a1630'; g.lineWidth = 10; for (let i = 0; i < 40; i++) { g.beginPath(); g.moveTo(i * 50, 760); g.lineTo(i * 50, 980); g.stroke(); } g.fillStyle = '#1a1630'; g.fillRect(0, 760, W, 14); g.fillRect(0, 900, W, 14);
    const ph = t * 2.4;
    [[200, '255,40,60'], [1720, '60,90,255'], [700, '60,90,255'], [1250, '255,40,60']].forEach(([px, col], k) => { glow(g, px, 1000, 300, col, 0.3 + 0.3 * Math.sin(ph * 3 + k * 1.7)); beam(g, t, px, 1000, -Math.PI / 2 + Math.sin(ph + k * 1.3) * 0.8, { len: 900, spread: 0.08, color: col, alpha: 0.14, motes: 0 }); });
    caption(g, t, 0.4, 'that night · an arrest is ordered', 110);
  },
  (g, t, b) => {
    cityBG(g, t, { seed: 21 });
    // case folders stack up: 2, then 27
    const n = Math.round(lerp(2, 27, out3(span(t, b('27 people') - 0.3, 1.4))));
    for (let i = 0; i < n; i++) { const r = rand(i + 7); const p = spring(t, i < 2 ? 0.1 + i * 0.2 : b('27 people') - 0.3 + (i - 2) * 0.05, 2, 0.65); if (p <= 0.01) continue; g.save(); g.translate(560 + (r() - 0.5) * 30, 900 - i * 24 - (1 - Math.min(1, p)) * 200); g.rotate((r() - 0.5) * 0.12); g.fillStyle = i % 2 ? '#e8c47f' : '#dcb46a'; g.fillRect(-220, -20, 440, 26); g.restore(); }
    text(g, String(n), 1000, 560, { font: 'Jakarta', weight: 800, size: 220, color: INK, align: 'center' });
    text(g, n <= 2 ? 'charged: Peña + ex-central bank chief' : 'people charged', 1000, 640, { font: 'Inter', weight: 600, size: 30, color: PURPLE, align: 'center' });
    caption(g, t, b('breach of trust'), 'breach of trust', 120);
    if (t > b('detained')) { stamp(g, t, b('detained') + 0.2, 'DETAINED', 1500, 760, { size: 56 }); caption(g, t, b('detained') + 0.4, 'bank founder + president', 1010); }
  },
  (g, t, b) => {
    nightBG(g, t);
    // raid: evidence tags on a car, a plane and a yacht
    const items = [['luxury cars', 420], ['private planes', 960], ['yacht', 1500]];
    items.forEach(([ph, x], k) => {
      const a0 = k ? b(ph) : Math.min(b(ph), 0.4), p = spring(t, a0, 1.5, 0.65);
      if (p <= 0.01) return;
      g.save(); g.translate(x, 600); g.scale(Math.min(1, p), Math.min(1, p));
      g.fillStyle = '#d9d0ea';
      if (k === 0) { g.beginPath(); g.roundRect(-220, -40, 440, 90, 30); g.fill(); g.beginPath(); g.moveTo(-120, -40); g.lineTo(-60, -110); g.lineTo(90, -110); g.lineTo(150, -40); g.closePath(); g.fill(); g.fillStyle = '#0a0918'; [-130, 130].forEach((wx) => { g.beginPath(); g.arc(wx, 55, 40, 0, Math.PI * 2); g.fill(); }); }
      if (k === 1) { g.beginPath(); g.ellipse(0, 0, 230, 34, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.moveTo(-30, 0); g.lineTo(-90, -140); g.lineTo(-40, -140); g.lineTo(60, 0); g.closePath(); g.fill(); g.beginPath(); g.moveTo(-170, 0); g.lineTo(-210, -70); g.lineTo(-180, -70); g.lineTo(-130, 0); g.closePath(); g.fill(); }
      if (k === 2) { g.beginPath(); g.moveTo(-240, 0); g.lineTo(240, 0); g.lineTo(190, 70); g.lineTo(-200, 70); g.closePath(); g.fill(); g.fillStyle = '#b8add6'; g.beginPath(); g.roundRect(-140, -70, 230, 70, 14); g.fill(); g.fillRect(-80, -120, 120, 50); }
      g.restore();
      const tg = spring(t, a0 + 0.35, 1.8, 0.55);
      if (tg > 0.01) { g.save(); g.translate(x + 120, 470); g.rotate(0.12); g.scale(Math.min(1.05, tg), Math.min(1.05, tg)); g.fillStyle = GOLD; g.beginPath(); g.roundRect(-110, -34, 220, 68, 10); g.fill(); text(g, 'EVIDENCE', 0, 12, { font: 'Jakarta', weight: 800, size: 30, color: '#1d1b29', align: 'center' }); g.restore(); }
      caption(g, t, a0 + 0.3, ph, 820, { x });
    });
    caption(g, t, 0.4, 'raid on Peña’s country house', 110);
    const ph = t * 2.2; glow(g, 0, 1080, 500, '255,40,60', 0.25 + 0.2 * Math.sin(ph * 3)); glow(g, W, 1080, 500, '60,90,255', 0.25 + 0.2 * Math.sin(ph * 3 + 2));
  },
], [['44 to 0', 0, 'hit', 0.7], ['sworn in', 0, 'whoosh', 0.5], ['That night', 0, 'hit', 0.6], ['27 people', 0, 'pop', 0.7], ['detained', 0.2, 'pop', 0.9], ['luxury cars', 0.35, 'pop', 0.6], ['private planes', 0.35, 'pop', 0.6], ['yacht', 0.35, 'pop', 0.6]]);

// ---- chapter 6: what we know
scene('known', ['Ueno has disputed', 'How much money', 'This has happened before'], [
  (g, t) => { cityBG(g, t, { seed: 22 }); scales(g, W / 2, 560, 1.4, Math.sin(t * 1.2) * 0.12); caption(g, t, 0.3, 'Peña denies wrongdoing', 110); const p = spring(t, 1.4, 1.8, 0.6); if (p > 0.01) { g.save(); g.translate(W / 2, 900); g.scale(Math.min(1.05, p), Math.min(1.05, p)); g.fillStyle = PURPLE; g.beginPath(); g.roundRect(-260, -48, 520, 96, 48); g.fill(); text(g, 'NOT CONVICTED', 0, 16, { font: 'Jakarta', weight: 800, size: 44, color: '#1d1b29', align: 'center' }); g.restore(); } },
  (g, t) => {
    cityBG(g, t, { seed: 23 });
    g.save(); g.translate(W / 2, 520); g.rotate(-0.03); g.fillStyle = '#f2eee4'; g.fillRect(-380, -300, 760, 600); text(g, 'LEAKED REPORT · NEWS', 0, -220, { font: 'Jakarta', weight: 800, size: 40, color: '#1d1b29', align: 'center' }); g.fillStyle = '#d9d3e8'; for (let i = 0; i < 9; i++) g.fillRect(-320, -150 + i * 44, 640 - (i % 3) * 120, 14); g.restore();
    stamp(g, t, 0.6, 'DISPUTED', W / 2, 560, { color: GOLD, size: 84, rot: -0.12 });
    caption(g, t, 0.4, 'Ueno disputes the report', 1010);
  },
  (g, t) => {
    cityBG(g, t, { seed: 24 });
    const r = rand(8);
    for (let i = 0; i < 24; i++) { const ph = ((t * (0.25 + r() * 0.3)) + r()) % 1; text(g, '?', 200 + r() * 1520, 1000 - ph * 900, { font: 'Jakarta', weight: 800, size: 40 + r() * 70, color: `rgba(185,162,255,${Math.sin(ph * Math.PI) * 0.6})`, align: 'center' }); }
    panel(g, 560, 360, 800, 300);
    const v = Math.floor(t * 7.3) % 10;
    text(g, `$${v}?? ,??? ,???`, W / 2, 540, { font: 'Jakarta', weight: 800, size: 96, color: INK, align: 'center' });
    caption(g, t, 0.4, 'how much is missing? still being counted', 1010);
  },
  (g, t, b) => {
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#3a2d22'); gr.addColorStop(1, '#1d1610'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    const k = b('13 banks');
    for (let i = 0; i < 13; i++) {
      const x = 150 + (i % 7) * 270, y = i < 7 ? 470 : 860, closed = t > k + i * 0.12;
      g.fillStyle = '#c9b48f'; g.fillRect(x - 100, y - 220, 200, 220);
      g.beginPath(); g.moveTo(x - 115, y - 220); g.lineTo(x, y - 280); g.lineTo(x + 115, y - 220); g.closePath(); g.fill();
      g.fillStyle = 'rgba(80,60,40,0.4)'; for (let c = 0; c < 4; c++) g.fillRect(x - 80 + c * 50, y - 200, 12, 190);
      const sh = clamp((t - (k + i * 0.12)) / 0.3); g.fillStyle = '#6b5a44'; g.fillRect(x - 100, y - 220, 200, 220 * sh);
      for (let s = 0; s < 220 * sh; s += 14) { g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x - 100, y - 220 + s, 200, 3); }
      if (closed) text(g, 'CERRADO', x, y - 90, { font: 'Jakarta', weight: 800, size: 24, color: '#f2e6c9', align: 'center' });
    }
    caption(g, t, 0.3, '1995–1998: 13 banks and 35 finance companies closed', 1030);
  },
], [['Peña denies', 1.4, 'pop', 0.7], ['Ueno has disputed', 0.6, 'pop', 0.9], ['13 banks', 0, 'tick', 0.6]]);

scene('outro', ['In five days', 'This story is still'], [
  (g, t, b) => {
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#2a1d55'); gr.addColorStop(1, '#173b36'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    const grow = span(t, 0.3, Math.max(1.5, b("most people's pockets") - 0.3));
    const n = Math.floor(1 + grow * 89);
    for (let i = 0; i < n; i++) { const r = rand(i + 3); const x = i === 0 ? W / 2 : 120 + r() * 1680, y = i === 0 ? 540 : 160 + r() * 800, sc = i === 0 ? 1.6 : 0.5 + r() * 0.5; phone(g, x, y, sc, 0, { glowA: 0.4 }); }
    caption(g, t, 0.4, 'five years: from a small office to most people’s pockets', 1010, { size: 28 });
  },
  (g, t, b) => { const a0 = b('In five days') - 0.25; domino(g, t - a0 + 0.4, { fallAt: 0.2, fallDur: 1.8, hitAt: 1.9 }); caption(g, t, a0 + 0.6, 'five days: a president toppled', 1010); },
  (g, t) => { cityBG(g, t, { seed: 25, rainA: 0.3 }); mist(g, t, { y: 900, h: 160, alpha: 0.2 }); text(g, 'Still developing', W / 2, 520, { font: 'Jakarta', weight: 700, size: 110, color: INK, align: 'center', alpha: span(t, 0.2, 0.6) }); caption(g, t, 0.6, 'as of 10 November 2026', 620); },
], [['In five days', 2.0, 'boom', 0.9]]);

// ---------------------------------------------------------------- exports
export const scenes = Object.fromEntries(Object.keys(SC).map((id) => [id, build(id)]));
export function sounds(timeline) {
  const out = [];
  for (const sc of timeline.scenes) {
    const def = SC[sc.id]; if (!def) continue;
    const ws = sceneWords(sc.cues), w = (p) => sc.start + when(ws, p);
    def.cuts.forEach((p) => out.push({ t: w(p) - 0.4, kind: 'whoosh', vol: 0.35 }));
    def.sfx.forEach(([p, off, kind, vol]) => out.push({ t: w(p) + off, kind, vol }));
  }
  return out;
}
void flagCloth; void chipIcon; void cross;
