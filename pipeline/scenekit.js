// Scene kit: word timing, shot mixing with crossfades, caption pills (light or dark), easing.
import { W, H, clamp, text } from './engine.js';
import { sceneWords, when } from './shots.js';
import { buf } from './scenery.js';

export const ez = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
export const out3 = (p) => 1 - Math.pow(1 - p, 3);
export const span = (t, a, d) => clamp((t - a) / d);
export const spring = (t, a, f = 1.6, z = 0.6) => { const x = t - a; if (x <= 0) return 0; const w = 2 * Math.PI * f, wd = w * Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w * x) * (Math.cos(wd * x) + ((z * w) / wd) * Math.sin(wd * x)); };

const cache = new Map();
export function words(s) {
  if (!cache.has(s.id)) { const cues = []; for (let i = 0; s.line(i); i++) cues.push({ start: s.cue(i), end: s.cueEnd(i), text: s.line(i) }); cache.set(s.id, sceneWords(cues)); }
  return cache.get(s.id);
}
export const at = (s, p, after = 0) => when(words(s), p, after);
/** Draw shot i for time t; crossfade from the previous shot over xf seconds after each cut */
export function shots(g, t, cuts, draws, xf = 0.4) {
  let i = 0; while (i < cuts.length && t >= cuts[i]) i++;
  draws[i](g, t);
  const since = i ? t - cuts[i - 1] : 99;
  if (since < xf) {
    const [c, cg] = buf('xprev');
    draws[i - 1](cg, t);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1 - ez(since / xf); g.drawImage(c, 0, 0); g.restore();
  }
}
/** Caption pill; theme 'light' (white pill, ink text) or 'dark' */
export function pill(g, t, a, str, y = 980, { size = 30, x = W / 2, theme = 'light', fill, color } = {}) {
  const p = spring(t, a, 1.8, 0.65);
  if (p <= 0.01 || !str) return;
  g.save(); g.font = `600 ${size}px Inter`;
  const w = g.measureText(str).width + 48;
  g.translate(x, y); g.scale(Math.min(1.05, p), Math.min(1.05, p)); g.globalAlpha = Math.min(1, p);
  g.shadowColor = 'rgba(40,20,80,0.18)'; g.shadowBlur = 20; g.shadowOffsetY = 6;
  g.fillStyle = fill || (theme === 'light' ? '#ffffff' : 'rgba(20,14,44,0.82)'); g.beginPath(); g.roundRect(-w / 2, -28, w, 56, 28); g.fill();
  g.shadowColor = 'transparent';
  text(g, str, 0, size * 0.36, { font: 'Inter', weight: 600, size, color: color || (theme === 'light' ? '#1d1b29' : '#f3efff'), align: 'center' });
  g.restore();
}
/** Comic speech bubble with a tail toward (tx, ty) */
export function bubble(g, t, a, str, x, y, tx, ty, { size = 34, maxW = 520 } = {}) {
  const p = spring(t, a, 2, 0.55);
  if (p <= 0.01) return;
  g.save(); g.font = `700 ${size}px Jakarta`;
  const w = Math.min(maxW, g.measureText(str).width + 60), h = size * 2;
  g.translate(x, y); g.scale(Math.min(1.08, p), Math.min(1.08, p));
  g.fillStyle = '#ffffff'; g.strokeStyle = '#231a33'; g.lineWidth = 5; g.lineJoin = 'round';
  g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, h / 2); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(-20, h / 2 - 3); g.lineTo((tx - x) * 0.25, (ty - y) * 0.25 + h / 2); g.lineTo(14, h / 2 - 3); g.fill(); g.stroke();
  g.fillRect(-22, h / 2 - 8, 40, 8);
  text(g, str, 0, size * 0.36, { font: 'Jakarta', weight: 700, size, color: '#231a33', align: 'center' });
  g.restore();
}
export { W, H };
