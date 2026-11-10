// Thumbnail options for episode 2 (rendered as stills, then scaled to 1280x720).
import { W, H, text } from '../../pipeline/engine.js';
import { loadImages, img } from '../../pipeline/motion.js';
import { UI } from '../../pipeline/lightui.js';
import { chipIcon, heart, scanHUD } from '../../pipeline/fx.js';
import { flag } from '../../pipeline/acts.js';

export const look = { light: true };
export const hits = [];
export async function preload() {
  const base = new URL('../ep02-nvidia/photos/', import.meta.url).href;
  await loadImages({ jensen: base + 'jensen.jpg', nvidialogo: base + 'nvidialogo.png' });
}
function bgDark(g) {
  const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#1a1036'); gr.addColorStop(1, '#3a1d6e');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const rg = g.createRadialGradient(1350, 500, 50, 1350, 500, 700); rg.addColorStop(0, 'rgba(226,65,46,0.35)'); rg.addColorStop(1, 'rgba(226,65,46,0)');
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
}
function bgLight(g) {
  const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#efe7ff'); gr.addColorStop(1, '#ffe3d3');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
}
/** Jensen photo card: crop of the source photo, white border, slight tilt */
function jensen(g, x, y, w, h, rot = -0.03, { sx = 140, sy = 10, sw = 760, sh = 843 } = {}) {
  const im = img('jensen');
  g.save(); g.translate(x + w / 2, y + h / 2); g.rotate(rot);
  g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 50; g.shadowOffsetY = 20;
  g.fillStyle = '#fff'; g.beginPath(); g.roundRect(-w / 2 - 14, -h / 2 - 14, w + 28, h + 28, 34); g.fill();
  g.shadowColor = 'transparent';
  g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, 24); g.clip();
  g.filter = 'contrast(1.12) saturate(1.15) brightness(1.03)';
  if (im) { const s = Math.max(w / sw, h / sh); g.drawImage(im, sx, sy, sw, sh, -w / 2 - (sw * s - w) / 2, -h / 2 - (sh * s - h) / 2, sw * s, sh * s); }
  g.restore();
}
function silhouette(g, x, y, w, h) {
  g.save();
  g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 40; g.shadowOffsetY = 16;
  g.fillStyle = '#fff'; g.beginPath(); g.roundRect(x - 12, y - 12, w + 24, h + 24, 28); g.fill();
  g.shadowColor = 'transparent';
  g.fillStyle = '#d9ccff'; g.beginPath(); g.roundRect(x, y, w, h, 20); g.fill();
  g.fillStyle = '#4a2a8c';
  g.beginPath(); g.arc(x + w / 2, y + h * 0.36, w * 0.21, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(x + w / 2, y + h * 1.0, w * 0.4, h * 0.38, 0, Math.PI, Math.PI * 2); g.fill();
  // long hair
  g.beginPath(); g.ellipse(x + w / 2, y + h * 0.42, w * 0.25, h * 0.2, 0, Math.PI, Math.PI * 2); g.fill();
  g.fillRect(x + w / 2 - w * 0.25, y + h * 0.4, w * 0.5, h * 0.18);
  text(g, '?', x + w / 2, y + h * 0.47, { font: UI.HEAD, weight: 700, size: w * 0.32, color: '#ffc93c', align: 'center' });
  g.restore();
}
function big(g, str, x, y, size, color, { align = 'left', stroke = '#1d1b29' } = {}) {
  g.save(); g.font = `800 ${size}px Jakarta`; g.textAlign = align;
  g.lineJoin = 'round'; g.lineWidth = size * 0.14; g.strokeStyle = stroke; g.strokeText(str, x, y);
  g.fillStyle = color; g.fillText(str, x, y); g.restore();
}
function logoChip(g, x, y, w) {
  const im = img('nvidialogo'); if (!im) return;
  const h = (im.height / im.width) * w;
  g.save(); g.fillStyle = '#fff'; g.beginPath(); g.roundRect(x - 22, y - 18, w + 44, h + 36, 20); g.fill();
  g.drawImage(im, x, y, w, h); g.restore();
}

// A: the CEO, a heart, and the woman under surveillance
function A(g) {
  bgDark(g);
  jensen(g, 70, 120, 760, 880, -0.035);
  logoChip(g, 110, 900, 230);
  silhouette(g, 1250, 430, 470, 540);
  scanHUD(g, 3, 0, [1250, 430, 470, 540], { label: 'WATCHED', lensPath: [[1500, 660], [1500, 660]] });
  heart(g, 1040, 640, 190, '#ff4d6d');
  g.strokeStyle = '#ffffff'; g.lineWidth = 10; g.lineCap = 'round';
  g.beginPath(); g.moveTo(1040, 560); g.lineTo(1015, 615); g.lineTo(1060, 640); g.lineTo(1030, 700); g.stroke();
  big(g, 'THE', 1250, 200, 120, '#ffffff', { align: 'center' });
  big(g, 'SPY?', 1600, 200, 170, '#ffc93c', { align: 'center' });
}

// B: $4.8B of chips — where did they go?
function B(g) {
  bgLight(g);
  jensen(g, 60, 150, 640, 820, 0.03);
  for (let i = 0; i < 9; i++) chipIcon(g, 980 + (i % 3) * 120 - (i > 5 ? 0 : 0), 900 - Math.floor(i / 3) * 110 - (i % 3) * 8, 120, (i % 2 ? 0.1 : -0.08));
  big(g, '$4.8B', 1090, 330, 210, '#76b900', { align: 'center' });
  big(g, 'OF CHIPS', 1090, 450, 100, '#ffffff', { align: 'center' });
  // dotted route to China with a question mark
  g.save(); g.setLineDash([6, 22]); g.lineCap = 'round'; g.strokeStyle = '#e2412e'; g.lineWidth = 14;
  g.beginPath(); g.moveTo(1200, 720); g.quadraticCurveTo(1450, 520, 1600, 700); g.stroke(); g.restore();
  g.fillStyle = '#e2412e'; g.beginPath(); g.moveTo(1630, 740); g.lineTo(1560, 720); g.lineTo(1625, 670); g.closePath(); g.fill();
  flag(g, 'CN', 1700, 830, 300);
  big(g, '?', 1700, 690, 260, '#e2412e', { align: 'center' });
}

// C: the confession email and the spy question
function C(g) {
  bgDark(g);
  jensen(g, 1080, 110, 760, 880, 0.035);
  g.save(); g.translate(560, 540); g.rotate(-0.04);
  g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 50; g.shadowOffsetY = 20;
  g.fillStyle = '#fff'; g.beginPath(); g.roundRect(-480, -300, 960, 560, 34); g.fill();
  g.shadowColor = 'transparent';
  g.fillStyle = '#4a2a8c'; g.beginPath(); g.roundRect(-480, -300, 960, 90, [34, 34, 0, 0]); g.fill();
  text(g, 'To: All Nvidia employees', -440, -240, { font: 'Jakarta', weight: 700, size: 38, color: '#fff' });
  g.fillStyle = '#ffe066'; g.fillRect(-450, -140, 900, 120);
  text(g, '"I was unfaithful', -430, -55, { font: 'Jakarta', weight: 800, size: 92, color: '#1d1b29' });
  g.fillStyle = '#ffe066'; g.fillRect(-450, 0, 700, 120);
  text(g, 'to my wife."', -430, 85, { font: 'Jakarta', weight: 800, size: 92, color: '#1d1b29' });
  text(g, '— Jensen Huang, CEO of Nvidia', -430, 200, { font: 'Inter', weight: 600, size: 34, color: '#6b6880' });
  g.restore();
  g.save(); g.translate(560, 930); g.rotate(-0.06);
  g.fillStyle = '#e2412e'; g.beginPath(); g.roundRect(-330, -70, 660, 140, 70); g.fill();
  text(g, '+ AN ALLEGED SPY', 0, 26, { font: 'Jakarta', weight: 800, size: 64, color: '#fff', align: 'center' });
  g.restore();
}
export const scenes = { A, B, C };
