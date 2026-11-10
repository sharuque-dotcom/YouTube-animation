// Style frames for episode 2 in the Case File house style (drawn with the real toolkit).
import { W, H, clamp, lerp, rand, text } from '../../pipeline/engine.js';
import { loadLand } from '../../pipeline/map.js';
import { loadImages } from '../../pipeline/motion.js';
import { DS, page, paperFinish, halftone, radial, halftonePhoto, headline, fatText, captionBar, stamp, hud, tab, callout, board, pinned, marker, ring, scrawl } from '../../pipeline/dossier.js';
import { isoProj, Iso, plinth, region, labelPin, route, city, dataHall, drawBox, tones } from '../../pipeline/iso.js';
import { chipIcon } from '../../pipeline/fx.js';

export const look = { finish: paperFinish };
export const hits = [];
export async function preload() {
  await loadLand();
  const base = new URL('./photos/', import.meta.url).href;
  await loadImages({ jensen: base + 'jensen.jpg', nvidiahq: base + 'nvidiahq.jpg', singapore: base + 'singapore.jpg', capitol: base + 'capitol.jpg', nvidialogo: base + 'nvidialogo.png' });
}

// ---------------------------------------------------------------- 1. The Case File: Exhibit A
function f1(g, s) {
  const t = s.t;
  page(g);
  halftone(g, [0, 0, W, H], radial(1250, 520, 760, 0.85), { step: 24, angle: 15, color: '#d8ccf5' });
  halftone(g, [0, 0, W, H], (x, y) => 0.5 * clamp((x - 1500) / 420) + 0.5 * clamp((y - 820) / 260), { step: 22, angle: 45, color: '#ffd9e6', alpha: 0.8 });
  hud(g, t, { chapter: 'EXHIBIT A · THE EMAIL', date: '08 NOV 2026' });
  headline(g, t, 0.1, 'The most', 120, 330, { size: 108 });
  headline(g, t, 0.35, 'powerful man', 120, 450, { size: 108 });
  headline(g, t, 0.6, 'in AI', 120, 570, { size: 108, color: DS.purple, shadow: DS.yellow });
  // the subject: a halftone print in a frame
  const p = clamp(t / 0.6);
  g.save(); g.translate(1230, 500); g.rotate(0.025);
  g.fillStyle = DS.ink; g.fillRect(-300 + 10, -340 + 10, 600, 700);
  g.fillStyle = '#fffaf0'; g.fillRect(-300, -340, 600, 700);
  halftonePhoto(g, 'jensen', -270, -310, 540, 560, { step: 8, color: DS.ink, bg: '#fffaf0', reveal: p, zoom: 1.25 });
  g.fillStyle = DS.ink; g.fillRect(-270, 270, 540, 70);
  text(g, 'JENSEN HUANG', 0, 316, { font: DS.MONO, weight: 800, size: 32, color: DS.yellow, align: 'center', spacing: 3 });
  g.restore();
  callout(g, t, 0.9, [940, 640], [560, 760], '$4.5T', 'NVIDIA, LATE 2026', { align: 'right' });
  callout(g, t, 1.2, [1420, 300], [1640, 190], '1993', 'CO-FOUNDED NVIDIA', { align: 'left' });
  stamp(g, t, 1.6, 'ADMITTED', 1500, 880, { size: 84, rot: -0.1 });
  text(g, 'the affair · email to staff', 1500, 990, { font: DS.HAND, size: 34, color: DS.red, align: 'center', alpha: clamp((t - 1.9) * 3) });
  captionBar(g, t, 2.1, 'He admitted an affair. Then the spy reports began.', 'spy reports', 640, 980, { size: 34 });
}

// ---------------------------------------------------------------- 2. The Evidence Board
function silhouette(g, w, h) {
  g.fillStyle = '#e7e1f5'; g.fillRect(-w / 2, -h / 2, w, h);
  g.fillStyle = DS.ink;
  g.beginPath(); g.arc(0, -h * 0.12, w * 0.2, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(0, h * 0.42, w * 0.36, h * 0.3, 0, Math.PI, Math.PI * 2); g.fill();
  text(g, '?', 0, -h * 0.06, { font: DS.FAT, size: 80, color: DS.yellow, align: 'center' });
}
function sourceCard(label, sub) {
  return (g, w, h) => {
    g.fillStyle = '#fffdf7'; g.fillRect(-w / 2, -h / 2, w, h);
    text(g, label, -w / 2 + 24, -h / 2 + 52, { font: DS.MONO, weight: 800, size: 30, color: DS.ink });
    text(g, sub, -w / 2 + 24, -h / 2 + 96, { font: DS.SANS, weight: 600, size: 22, color: DS.muted });
  };
}
function f2(g, s) {
  const t = s.t;
  board(g, s.T);
  pinned(g, t, 0.05, 380, 330, 300, 340, { key: 'jensen', rot: -0.03, label: 'JENSEN HUANG · CEO' });
  pinned(g, t, 0.2, 960, 300, 380, 250, { key: 'singapore', rot: 0.02, label: 'MEGASPEED · SINGAPORE', magnet: DS.red });
  pinned(g, t, 0.35, 960, 730, 250, 280, { rot: -0.02, label: 'ALICE HUANG', content: silhouette, magnet: DS.red });
  pinned(g, t, 0.5, 380, 790, 300, 200, { key: 'nvidiahq', rot: 0.03, label: 'NVIDIA HQ' });
  pinned(g, t, 0.65, 1560, 250, 330, 120, { content: sourceCard('NYT · 29 OCT', 'intelligence watched her'), magnet: DS.purple, rot: 0.02 });
  pinned(g, t, 0.75, 1560, 470, 330, 120, { content: sourceCard('WSJ', 'US · Singapore · Taiwan'), magnet: DS.purple, rot: -0.02 });
  pinned(g, t, 0.85, 1560, 690, 330, 120, { content: sourceCard('FT', 'a romantic relationship'), magnet: DS.purple, rot: 0.015 });
  // links
  marker(g, t, 1.0, [[540, 360], [740, 560], [830, 690]], { color: DS.red, width: 7 });
  scrawl(g, t, 1.5, 'affair: admitted', 560, 610, { size: 34, color: DS.red });
  marker(g, t, 1.3, [[960, 590], [960, 470]], { color: DS.ink, width: 6 });
  scrawl(g, t, 1.7, 'managing director, 2023', 990, 550, { size: 28 });
  marker(g, t, 1.6, [[1150, 300], [1380, 260]], { color: DS.purple, width: 5, dash: [14, 12] });
  marker(g, t, 1.7, [[1090, 740], [1380, 490]], { color: DS.purple, width: 5, dash: [14, 12] });
  marker(g, t, 1.8, [[1090, 780], [1380, 700]], { color: DS.purple, width: 5, dash: [14, 12] });
  ring(g, t, 2.0, 960, 300, 240, 170, { color: DS.red, width: 7 });
  scrawl(g, t, 2.3, '$4.8B of Nvidia chips (NYT)', 820, 120, { size: 32, color: DS.red });
  stamp(g, t, 2.5, 'REPORTED', 1560, 880, { size: 70, rot: 0.08, color: DS.purple });
}

// ---------------------------------------------------------------- 3. The Chip World (isometric)
function f3(g, s) {
  const t = s.t;
  page(g);
  const P = isoProj(720, 215, 50);
  plinth(g, P, 22, 12, { layers: [['#7f6a55', 0.35], ['#5e4b3b', 0.5]] });
  const Wd = 12;
  region(g, P, [[0, 0], [5.4, 0], [5.4, Wd], [0, Wd]], '#cfe3c2');            // United States
  region(g, P, [[5.4, 0], [13, 0], [13, Wd], [5.4, Wd]], '#9cc3e6');          // Pacific
  region(g, P, [[13, 0], [17.4, 0], [17.4, Wd], [13, Wd]], '#d9e8c9');        // Southeast Asia
  region(g, P, [[17.4, 0], [22, 0], [22, Wd], [17.4, Wd]], '#e4ddd0');        // China (no borders: a plain landmass)
  // waves
  g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = 2;
  for (let i = 0; i < 18; i++) { const r = rand(i + 3); const x = 6 + r() * 6.5, y = 0.6 + r() * 10.5, ph = (s.T * 0.5 + r()) % 1; const [a1, b1] = P(x, y, 0.01), [a2, b2] = P(x + 0.5, y, 0.01); g.globalAlpha = Math.sin(ph * Math.PI) * 0.8; g.beginPath(); g.moveTo(a1, b1); g.quadraticCurveTo((a1 + a2) / 2, b1 - 6, a2, b2); g.stroke(); }
  g.globalAlpha = 1;
  const q = new Iso(P);
  city(q, 2.6, 7.5, 7, '#c9c2b5', { seed: 2, spread: 1.8, maxH: 1.6 });
  q.box(1.6, 3.2, 0, 2.2, 2.2, 1.2, '#76b900');                               // the HQ, Nvidia green
  dataHall(q, 13.6, 2.2, 3.2, 1.6, s.T);                                       // Singapore
  dataHall(q, 13.6, 7.6, 3.2, 1.6, s.T, { base: '#a2a9c2' });                  // Malaysia
  city(q, 20, 6, 10, '#d3ccbf', { seed: 5, spread: 1.8, maxH: 2.2 });
  const wall = clamp((t - 1.2) * 1.4);
  q.box(17.4, 0.2, 0, 0.3, Wd - 0.4, 1.1 * wall, '#e2412e');                 // export wall
  // ship sailing along the route
  const sp = clamp(t / 2.2);
  const shipX = lerp(5.8, 12.4, sp), shipY = lerp(5.2, 4.2, sp);
  q.box(shipX, shipY, 0, 1.2, 0.5, 0.25, '#3d4a7a'); q.box(shipX + 0.2, shipY + 0.05, 0.25, 0.7, 0.4, 0.25, '#e2412e');
  q.flush(g);
  // routes
  route(g, P, [[2.8, 4.3], [5.6, 5.2], [12.8, 4.2], [14.6, 3.6]], clamp(t / 2), { color: DS.ink, width: 4 });
  route(g, P, [[14.6, 3.6], [15.2, 8.4]], clamp((t - 1.8) * 2), { color: DS.ink, width: 4 });
  route(g, P, [[15.6, 6.5], [17.0, 6.2], [19.6, 6.0]], clamp((t - 2.3) * 1.5), { color: DS.red, width: 5, dash: [6, 14] });
  // the chip at HQ
  const [hx, hy] = P(2.7, 4.3, 1.9);
  chipIcon(g, hx, hy + Math.sin(s.T * 3) * 6, 60, 0.1);
  // label pins
  labelPin(g, P, [1.6, 5.3, 1.2], 'SANTA CLARA', 'Nvidia', { up: 120, side: -1, p: clamp(t * 2) });
  labelPin(g, P, [15.2, 3.0, 1.0], 'SINGAPORE', '$4.8B*', { up: 200, side: -1, p: clamp((t - 0.8) * 2) });
  labelPin(g, P, [17.5, 1.0, 1.1], 'EXPORT LIMITS', 'since 2022', { up: 150, side: 1, p: clamp((t - 1.6) * 2) });
  labelPin(g, P, [20.2, 6.0, 1.2], 'CHINA', '?', { up: 140, side: 1, p: clamp((t - 2.6) * 2) });
  // legend card
  const lp = clamp((t - 0.4) * 2);
  g.save(); g.globalAlpha = lp;
  g.fillStyle = '#fbf6ea'; g.strokeStyle = DS.ink; g.lineWidth = 3; g.beginPath(); g.roundRect(1330, 820, 530, 200, 18); g.fill(); g.stroke();
  text(g, 'THE CHIP ROUTE', 1365, 880, { font: DS.MONO, weight: 800, size: 34, color: DS.ink, spacing: 3 });
  text(g, 'questioned leg: under investigation', 1365, 930, { font: DS.SANS, weight: 600, size: 24, color: DS.red });
  text(g, '* bought over two years, per The New York Times', 1365, 970, { font: DS.SANS, size: 20, color: DS.muted });
  text(g, 'NOT TO SCALE', 1825, 1002, { font: DS.MONO, weight: 800, size: 16, color: DS.muted, align: 'right' });
  g.restore();
  hud(g, s.T, { chapter: 'EXHIBIT B · THE CHIPS', date: 'SINCE 2022' });
}

export const scenes = { f1, f2, f3 };
