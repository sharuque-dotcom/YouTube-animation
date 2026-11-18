// Pixel diorama sets for the Travancore Short (270x480 art canvas, see pixel.js). Each returns practical lights.
import { W, H, clamp, lerp, rand } from '../../pipeline/engine.js';
import { landRings } from '../../pipeline/map.js';
import { px, ditherV, villager, palm, S, LW, LH, INK } from './pixel.js';

/** pixel conch emblem, about 22x34 art px, centred at x,y */
export function pxConch(c, x, y, k = 1, col = ['#7a5418', '#c8962e', '#f2cf6a', '#fff3cf']) {
  const rows = [[0, 1], [1, 3], [2, 5], [3, 7], [4, 9], [5, 11], [6, 12], [7, 13], [8, 14], [9, 14], [10, 14], [11, 13], [12, 12], [13, 11], [14, 10], [15, 8], [16, 6], [17, 4], [18, 3], [19, 2], [20, 2], [21, 1]];
  rows.forEach(([r, w]) => { const yy = y + (r - 11) * 1.5 * k; for (let i = -w / 2; i < w / 2; i++) { const shade = i < -w / 4 ? 1 : i > w / 4 ? 0 : 2; const tone = r < 5 && i % 2 ? 3 : shade; px(c, x + i * k, yy, k, 1.5 * k, col[tone]); } });
  for (let r = 6; r < 15; r++) px(c, x + 2 * k, y + (r - 11) * 1.5 * k, 2 * k, 1.5 * k, '#4a2c0a'); // aperture
  for (let r = 1; r < 5; r++) px(c, x - 3 * k, y + (r - 11) * 1.5 * k + 0.5 * k, 6 * k, 0.6 * k, '#7a5418');   // whorls
}
const merc = (la) => Math.log(Math.tan(Math.PI / 4 + (la * Math.PI) / 360)) * 180 / Math.PI;
const TRAV = [[76.18, 9.98], [76.55, 10.05], [77.05, 10.25], [77.25, 9.95], [77.2, 9.55], [77.4, 9.1], [77.25, 8.75], [77.62, 8.2], [77.53, 8.05], [76.6, 8.6], [76.2, 9.4]];

// ---------------------------------------------------------------- 1. the 1947 map on the Dewan's table (top-down)
export function mapArt(c, t, { glow = 1, conchY = 210 } = {}) {
  ditherV(c, 0, 0, LW, LH, ['#2a1610', '#3a2014', '#4a2a18'], { width: 0.45 });                       // teak table
  for (let y = 0; y < LH; y += 7) px(c, 0, y + Math.round(Math.sin(y) * 2), LW, 1, 'rgba(20,10,6,0.35)');
  const x0 = 22, y0 = 44, w = 226, h = 392;
  px(c, x0 + 3, y0 + 4, w, h, 'rgba(10,6,4,0.55)'); ditherV(c, x0, y0, w, h, ['#e8d6a8', '#dcc48e', '#c8aa70'], { width: 0.45 });
  // sea lines
  for (let y = y0 + 6; y < y0 + h - 6; y += 6) for (let x = x0 + 4; x < x0 + 80; x += 7) px(c, x + (y % 12 ? 3 : 0), y, 4, 1, 'rgba(70,90,110,0.35)');
  const P = ([lo, la]) => [LW / 2 + (lo - 76.85) * 140, LH / 2 - (merc(la) - merc(9.05)) * 140];
  c.save(); c.beginPath(); c.rect(x0 + 2, y0 + 2, w - 4, h - 4); c.clip();
  const land = new Path2D(); for (const ring of landRings('50m')) { if (!ring.some((p2) => p2[0] > 72 && p2[0] < 82 && p2[1] > 5 && p2[1] < 14)) continue; ring.forEach((p2, i) => { const [x, y] = P(p2); i ? land.lineTo(x, y) : land.moveTo(x, y); }); land.closePath(); }
  c.fillStyle = '#d8bf86'; c.fill(land); c.strokeStyle = '#4a3418'; c.lineWidth = 1; c.stroke(land);
  const tp = new Path2D(); TRAV.forEach((p2, i) => { const [x, y] = P(p2); i ? tp.lineTo(x, y) : tp.moveTo(x, y); }); tp.closePath();
  c.save(); c.clip(land); c.globalAlpha = glow; c.fillStyle = '#e8b84a'; c.fill(tp); c.globalAlpha = 1;
  if (glow > 0.05) { c.strokeStyle = '#7a4a10'; c.setLineDash([3, 2]); c.lineDashOffset = -Math.floor(t * 8); c.stroke(tp); c.setLineDash([]); } c.restore();
  // hachures for the Ghats
  for (let i = 0; i < 26; i++) { const [x, y] = P([77.1 + Math.sin(i) * 0.1, 8.4 + i * 0.07]); px(c, x, y, 1, 3, '#7a5a30'); px(c, x + 3, y + 1, 1, 3, '#7a5a30'); }
  [[76.95, 8.52], [76.6, 8.89], [76.33, 9.49], [76.52, 9.59]].forEach((p2) => { const [x, y] = P(p2); px(c, x - 1, y - 1, 3, 3, '#8a1d1d'); });
  c.restore();
  // brass paperweight + compass
  px(c, 196, 400, 30, 22, '#8a6a2a'); px(c, 198, 402, 26, 3, '#e8c86a');
  pxConch(c, 135, conchY, 2);
  return [[250 * S, 30 * S, 0.9]];    // the desk lamp off the top-right
}

// ---------------------------------------------------------------- 3. currency, stamp and badge on palace velvet
export function itemsArt(c, t, { a = 0, now = 0 } = {}) {
  ditherV(c, 0, 0, LW, LH, ['#2a0a14', '#3e1020', '#541a2c'], { width: 0.45 });
  for (let x = 0; x < LW; x += 9) for (let y = 0; y < LH; y++) if ((y + x) % 23 < 2) px(c, x + Math.round(Math.sin(y * 0.05) * 3), y, 1, 1, 'rgba(10,2,6,0.5)');
  const dropY = (k) => { const u = now - (a + k * 0.5); if (u < 0) return -200; const f = clamp(u / 0.35); return -120 * (1 - f * f) - (u > 0.35 ? Math.exp(-(u - 0.35) * 10) * Math.abs(Math.sin((u - 0.35) * 18)) * 8 : 0); };
  // coin (stepped spin: 4 frames)
  { const y = 230 + dropY(0), fr = Math.floor(t * 6) % 4, wd = [22, 14, 4, 14][fr]; if (y > -50) { px(c, 52 - 12, 250, 26, 4, 'rgba(10,2,6,0.5)'); for (let j = -11; j <= 11; j++) { const ww = Math.round(Math.sqrt(121 - j * j) * wd / 11); px(c, 52 - ww, y + j, ww * 2, 1, j < -4 ? '#f2eee4' : j > 5 ? '#8a8276' : '#c8c0b2'); } if (fr === 0) pxConch(c, 52, y, 0.5, ['#6a6258', '#9a9284', '#d8d2c6', '#fff']); } }
  // Anchal stamp
  { const y = 200 + dropY(1); if (y > -60) { px(c, 112, 262, 48, 4, 'rgba(10,2,6,0.5)'); px(c, 112, y - 30, 46, 60, '#f2ead8'); for (let i = 0; i < 46; i += 4) { px(c, 112 + i, y - 31, 2, 1, '#541a2c'); px(c, 112 + i, y + 30, 2, 1, '#541a2c'); } px(c, 117, y - 25, 36, 50, '#8a1d2a'); pxConch(c, 135, y - 2, 0.9); px(c, 120, y + 18, 30, 3, '#f6e6c0'); } }
  // army badge (brass star)
  { const y = 240 + dropY(2); if (y > -50) { px(c, 202, 262, 34, 4, 'rgba(10,2,6,0.5)'); for (let j = -16; j <= 16; j++) { const ww = Math.round((16 - Math.abs(j)) * 0.9 + (Math.abs(j) % 4 < 2 ? 6 : 2)); px(c, 220 - ww, y + j, ww * 2, 1, j < -5 ? '#fff0b8' : j > 6 ? '#7a5418' : '#c89a3a'); } pxConch(c, 220, y, 0.45); } }
  // candle on the left
  px(c, 14, 120, 8, 40, '#e8dcc0'); const fl = Math.floor(t * 10) % 2; px(c, 16, 112 - fl, 4, 8, '#ffd27a'); px(c, 17, 114 - fl, 2, 4, '#fff6dc');
  return [[18 * S, 114 * S, 1.0], [135 * S, 120 * S, 0.5]];
}

// ---------------------------------------------------------------- 4. thorium beach at dusk, a sand-gatherer
export function beachArt(c, t) {
  ditherV(c, 0, 0, LW, 200, ['#2a1840', '#5a2a52', '#8a3a52', '#d86a52', '#ffa060'], { width: 0.45 });
  for (let j = 0; j < 14; j++) { const w = Math.round(Math.sqrt(196 - j * j) * 2); px(c, 135 - w / 2, 200 - j, w, 1, j < 4 ? '#ffd6a0' : '#ffe8c0'); }
  ditherV(c, 0, 200, LW, 90, ['#8a4a5a', '#5a3a5a', '#2a2440'], { width: 0.45 });
  for (let j = 0; j < 30; j++) { const y = 202 + j * 3, ww = 6 + j * 2; if ((j + Math.floor(t * 5)) % 3) px(c, 135 - ww / 2 + ((j * 7 + Math.floor(t * 4)) % 5) - 2, y, ww, 1, '#ffc890'); }
  for (let k = 0; k < 3; k++) { const ph = ((t * 0.25 + k / 3) % 1), y = Math.round(lerp(240, 292, ph)); for (let x = 0; x < LW; x += 2) if ((x + Math.floor(t * 3)) % 9) px(c, x, y + Math.round(Math.sin(x * 0.1 + k) * 1), 2, 1, `rgba(255,240,230,${0.7 * Math.sin(ph * Math.PI)})`); }
  ditherV(c, 0, 292, LW, LH - 292, ['#2a1c22', '#1e141a', '#140c12'], { width: 0.45 });
  const r = rand(5); for (let i = 0; i < 260; i++) { const x = r() * LW, y = 296 + r() * 180; if (Math.sin(t * (2 + r() * 4) + i) > 0.85) px(c, x, y, 1, 1, r() < 0.5 ? '#ffd890' : '#ffffff'); }
  palm(c, t, 236, 330, 120, 1); palm(c, t, 22, 316, 96, 2);
  // a woman gathering black sand into a basket (stepped two-frame bend)
  const f = Math.floor(t * 1.5) % 2; px(c, 120, 360, 12, 2, 'rgba(10,6,8,0.6)'); px(c, 121, 346 + f, 6, 14 - f, '#f2eee4'); px(c, 121, 338 + f, 6, 8, '#c03a5a'); px(c, 122, 333 + f * 2, 4, 5, '#8a5a3a'); px(c, 121, 332 + f * 2, 5, 2, INK); px(c, 128, 352, 9, 6, '#a8783a'); px(c, 129, 352, 7, 2, '#2a1c22');
  return [[135 * S, 196 * S, 0.9]];
}

// ---------------------------------------------------------------- 5. the music academy, the night of July 25
export function hallArt(c, t) {
  ditherV(c, 0, 0, LW, 170, ['#0e0e1e', '#16182e', '#1e2038'], { width: 0.45 });
  px(c, 20, 80, 230, 110, '#2a2632'); for (let j = 0; j < 30; j++) px(c, 135 - (115 - j * 3.8), 80 - j, 230 - j * 7.6, 1, j % 3 ? '#3a3442' : '#2a2632');
  for (let i = 0; i < 6; i++) { const x = 34 + i * 40; px(c, x, 96, 8, 92, '#8a7e8e'); px(c, x, 96, 2, 92, '#c8bcc8'); px(c, x + 6, 96, 2, 92, '#5a5060'); }
  for (let i = 0; i < 9; i++) px(c, 32 + i * 24, 90, 12, 3, '#d8c8a0'); // pixel lettering on the frieze
  ditherV(c, 0, 190, LW, LH - 190, ['#2a2430', '#1e1a26', '#16121c'], { width: 0.45 });
  for (let k = 0; k < 4; k++) px(c, 20 - k * 6, 190 + k * 5, 230 + k * 12, 5, k % 2 ? '#3a3440' : '#4a4252');   // steps
  [[60, 120], [210, 120]].forEach(([x, y]) => { px(c, x, y, 4, 6, '#ffe2a8'); px(c, x + 1, y + 6, 2, 12, '#2a2030'); });
  // a 1940s car waiting at the steps
  const cy = 300; px(c, 70, cy, 130, 18, '#14101a'); px(c, 96, cy - 16, 70, 18, '#14101a'); px(c, 100, cy - 13, 26, 10, '#2a3a52'); px(c, 132, cy - 13, 28, 10, '#2a3a52');
  px(c, 96, cy - 17, 70, 1, '#c8a878'); px(c, 70, cy, 130, 1, '#8a7860'); [[88, cy + 14], [180, cy + 14]].forEach(([x, y]) => { px(c, x - 8, y, 16, 10, '#08060a'); px(c, x - 3, y + 3, 6, 4, '#5a5460'); });
  px(c, 196, cy + 4, 4, 4, '#ffe8b0');
  // concert-goers leaving under umbrellas (stepped walk)
  [[40, 230, 0], [230, 236, 1], [150, 226, 2]].forEach(([x, y, k]) => { const xx = x + Math.floor(t * 4 + k) % 2 + Math.floor(t * 3) * (k % 2 ? -1 : 1) % 30; villager(c, t, xx, y, { phase: k, face: k % 2 ? -1 : 1 }); px(c, xx - 6, y - 25, 13, 3, '#14101a'); px(c, xx, y - 23, 1, 4, '#14101a'); });
  return [[62 * S, 122 * S, 0.8], [212 * S, 122 * S, 0.8], [198 * S, (cy + 6) * S, 0.4]];
}

// ---------------------------------------------------------------- 7-9. what-if: a free Travancore's harbour at sunrise
export function pxFlag(c, t, x, y, k = 1) {
  px(c, x, y, 1, 40 * k, '#d8d0c0'); const fr = Math.floor(t * 6) % 2;
  for (let i = 0; i < 26 * k; i++) { const dy = Math.round(Math.sin(i * 0.3 - fr * 1.5) * k); px(c, x + 1 + i, y + dy, 1, 16 * k, i % 7 ? '#c43a40' : '#9a1e2a'); }
  pxConch(c, x + 13 * k, y + 8 * k, 0.33 * k);
}
export function harbourArt(c, t, { grey = 0 } = {}) {
  ditherV(c, 0, 0, LW, 230, grey ? ['#3a3a42', '#4a4a52', '#5a5a62'] : ['#2a3a6a', '#7a6a9a', '#e89a7a', '#ffd8a0'], { width: 0.45 });
  if (!grey) for (let j = 0; j < 12; j++) { const w = Math.round(Math.sqrt(144 - j * j) * 2); px(c, 60 - w / 2, 230 - j, w, 1, '#fff1d0'); }
  const r = rand(12); let x = 70; while (x < LW) { const w = 10 + r() * 16, h = 30 + r() * 100; px(c, x, 230 - h, w - 2, h, grey ? '#4a4a52' : '#8a7ea0'); for (let k = 0; k < h / 6; k++) if (r() < 0.3) px(c, x + 2, 232 - h + k * 6, w - 6, 1, grey ? '#5a5a62' : '#ffe6b8'); x += w; }
  for (const cx of [150, 196]) { px(c, cx, 160, 2, 90, '#3a2a40'); px(c, cx - 50, 160, 70, 2, '#3a2a40'); px(c, cx - 40, 162, 1, 30 + Math.round(Math.sin(t + cx) * 2), '#3a2a40'); }
  ditherV(c, 0, 250, LW, LH - 250, grey ? ['#3a3a44', '#2a2a34'] : ['#d8a08a', '#8a6a8a', '#2a3050'], { width: 0.45 });
  if (!grey) for (let j = 0; j < 40; j++) if ((j + Math.floor(t * 5)) % 3) px(c, 60 - (8 + j) / 2 + ((j * 5 + Math.floor(t * 4)) % 5) - 2, 252 + j * 3, 8 + j, 1, '#ffe2b8');
  // container ship with the conch flag
  const sx = 120 + Math.round(Math.sin(t * 0.2) * 3), sy = 310 + (Math.floor(t * 1.2) % 2);
  px(c, sx - 90, sy, 190, 14, '#1e2236'); px(c, sx - 84, sy + 14, 178, 5, '#14182a');
  const cols = ['#c0392b', '#2b7cd3', '#e0a020', '#1f8a5b', '#8a4ab8']; for (let rr = 0; rr < 3; rr++) for (let k = 0; k < 11; k++) px(c, sx - 84 + k * 14, sy - 8 - rr * 8, 13, 7, cols[(rr * 2 + k) % 5]);
  px(c, sx + 74, sy - 34, 16, 34, '#e8e3f5'); px(c, sx + 76, sy - 30, 12, 2, '#ffd890');
  if (!grey) pxFlag(c, t, sx + 92, sy - 60, 1);
  if (grey) { px(c, 90, 360, 90, 26, '#5a3a2a'); for (let i = 0; i < 8; i++) px(c, 96 + i * 10, 368, 6, 10, '#2a1a10'); }
  return grey ? [[135 * S, 360 * S, 0.3]] : [[60 * S, 226 * S, 1.0], [(sx + 82) * S, (sy - 30) * S, 0.4]];
}
/** split future: a gleaming city-state above, a shuttered port below */
export function futuresArt(c, t) {
  const [hi] = [harbourArt]; c.save(); c.beginPath(); c.rect(0, 0, LW, LH / 2); c.clip(); c.translate(0, -100); hi(c, t); c.restore();
  c.save(); c.beginPath(); c.rect(0, LH / 2, LW, LH / 2); c.clip(); c.translate(0, 120); harbourArt(c, t, { grey: 1 }); c.restore();
  px(c, 0, LH / 2 - 1, LW, 2, '#e8b84a');
  return [[60 * S, 126 * S, 0.8]];
}
/** finale: the palace roof at sunset with the conch flag */
export function finaleArt(c, t) {
  ditherV(c, 0, 0, LW, 300, ['#2a1a40', '#5a3050', '#a85a5a', '#ffb07a'], { width: 0.45 });
  for (let j = 0; j < 30; j++) px(c, 20 + j * 2, 300 - j * 2, 230 - j * 4, 2, j % 3 ? '#a23a24' : '#7a2a1e');
  ditherV(c, 0, 300, LW, LH - 300, ['#6a3a2a', '#4a2a22', '#2a1a18'], { width: 0.45 });
  for (let i = 0; i < 7; i++) px(c, 26 + i * 36, 300, 6, 100, '#d8c8a8');
  pxFlag(c, t, 120, 130, 2.4);
  palm(c, t, 20, 420, 150, 0); palm(c, t, 252, 440, 170, 1.5);
  return [[135 * S, 280 * S, 0.6]];
}
void W; void H;
