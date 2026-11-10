// Thumbnail options for episode 3 (stills, scaled to 1280x720).
import { W, H, text } from '../../pipeline/engine.js';
import { nightFinish, glow, beam } from '../../pipeline/scenery.js';
import { domino, tower } from '../ep03-ueno/sets.js';
import { phone } from '../ep03-ueno/kit.js';

export const look = { finish: nightFinish };
export const hits = [];
function big(g, str, x, y, size, color, { align = 'left', stroke = '#0b0820', rot = 0 } = {}) {
  g.save(); g.translate(x, y); g.rotate(rot); g.font = `800 ${size}px Jakarta`; g.textAlign = align;
  g.lineJoin = 'round'; g.lineWidth = size * 0.16; g.strokeStyle = stroke; g.strokeText(str, 0, 0);
  g.fillStyle = color; g.fillText(str, 0, 0); g.restore();
}
function pill(g, str, x, y, size, bg, fg) {
  g.save(); g.font = `800 ${size}px Jakarta`; const w = g.measureText(str).width + size;
  g.fillStyle = bg; g.beginPath(); g.roundRect(x, y - size * 0.95, w, size * 1.35, size * 0.3); g.fill();
  text(g, str, x + size / 2, y, { font: 'Jakarta', weight: 800, size, color: fg }); g.restore();
}
function silhouette(g, x, y, s) {
  g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#0c0a18';
  g.beginPath(); g.ellipse(0, -150, 46, 56, 0, 0, Math.PI * 2); g.fill(); g.fillRect(-18, -100, 36, 30);
  g.beginPath(); g.moveTo(-130, 300); g.lineTo(-135, -10); g.quadraticCurveTo(-130, -70, -40, -78); g.lineTo(40, -78); g.quadraticCurveTo(130, -70, 135, -10); g.lineTo(130, 300); g.closePath(); g.fill();
  g.fillStyle = '#f4f1ea'; g.beginPath(); g.moveTo(-22, -78); g.lineTo(0, -20); g.lineTo(22, -78); g.closePath(); g.fill();
  g.save(); g.rotate(-0.75); ['#d52b1e', '#f4f1ea', '#0038a8'].forEach((c, k) => { g.fillStyle = c; g.fillRect(-60, 40 + k * 18, 330, 18); }); g.restore();
  g.strokeStyle = 'rgba(255,200,140,0.8)'; g.lineWidth = 5; g.beginPath(); g.ellipse(0, -150, 46, 56, 0, -1.4, 0.6); g.stroke(); g.beginPath(); g.moveTo(135, -10); g.lineTo(130, 300); g.stroke();
  g.restore();
}
// A: the domino — the bank falls on the palace
function A(g) {
  domino(g, 5.4, { fallAt: 1, fallDur: 4.6, hitAt: 9 });
  big(g, 'BANK', 70, 230, 190, '#3ee0b5');
  big(g, 'vs', 110, 380, 120, '#ffffff');
  big(g, 'PRESIDENT', 70, 560, 170, '#ffc93c');
  pill(g, 'ONLY 5 DAYS', 80, 690, 64, '#ff4d5e', '#ffffff');
}
// B: the tower goes dark — 3 million locked out
function B(g) {
  tower(g, 6, { darkAt: 0, darkDur: 9 });
  g.fillStyle = 'rgba(8,6,24,0.35)'; g.fillRect(0, 0, W, H);
  big(g, '3 MILLION', 960, 300, 200, '#ffffff', { align: 'center' });
  big(g, 'LOCKED OUT', 960, 500, 170, '#ff4d5e', { align: 'center' });
  phone(g, 1650, 760, 2.2, 1);
  phone(g, 270, 780, 2.0, 1);
}
// C: the president, arrested
function C(g) {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#0a081e'); gr.addColorStop(1, '#2a1d4a'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  glow(g, 300, 1000, 700, '255,40,60', 0.55); glow(g, 1620, 1000, 700, '60,90,255', 0.55);
  beam(g, 0, 300, 1000, -1.2, { len: 1100, spread: 0.12, color: '255,40,60', alpha: 0.25, motes: 0 });
  beam(g, 0, 1620, 1000, -1.9, { len: 1100, spread: 0.12, color: '60,90,255', alpha: 0.25, motes: 0 });
  silhouette(g, 1380, 760, 1.9);
  // handcuffs
  g.save(); g.translate(1380, 1010); g.strokeStyle = '#dcd8e8'; g.lineWidth = 16; [-80, 80].forEach((dx) => { g.beginPath(); g.arc(dx, 0, 52, 0, Math.PI * 2); g.stroke(); }); g.lineWidth = 8; for (let i = -2; i <= 2; i++) { g.beginPath(); g.ellipse(i * 14, 0, 9, 6, 0, 0, Math.PI * 2); g.stroke(); } g.restore();
  big(g, 'A BANK FELL.', 80, 300, 140, '#3ee0b5');
  big(g, 'THEN THE', 80, 520, 110, '#ffffff');
  big(g, 'PRESIDENT', 80, 670, 150, '#ffffff');
  big(g, 'WAS ARRESTED', 80, 830, 130, '#ff4d5e');
}
export const scenes = { A, B, C };
