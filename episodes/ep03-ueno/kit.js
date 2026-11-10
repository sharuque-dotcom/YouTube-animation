// Episode 3 shared helpers: timing, shot mixing, captions, night background, props.
import { W, H, clamp, lerp, rand, text } from '../../pipeline/engine.js';
import { sceneWords, when } from '../../pipeline/shots.js';
import { sky, stars, glow, buf } from '../../pipeline/scenery.js';

export const ez = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
export const out3 = (p) => 1 - Math.pow(1 - p, 3);
export const span = (t, a, d) => clamp((t - a) / d);
export const spring = (t, a, f = 1.6, z = 0.6) => { const x = t - a; if (x <= 0) return 0; const w = 2 * Math.PI * f, wd = w * Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w * x) * (Math.cos(wd * x) + ((z * w) / wd) * Math.sin(wd * x)); };
export const TEAL = '#3ee0b5', INK = '#f3efff', PURPLE = '#b9a2ff';

// ---------------------------------------------------------------- timing + shot mixing
export const cache = new Map();
export function words(s) {
  if (!cache.has(s.id)) { const cues = []; for (let i = 0; s.line(i); i++) cues.push({ start: s.cue(i), end: s.cueEnd(i), text: s.line(i) }); cache.set(s.id, sceneWords(cues)); }
  return cache.get(s.id);
}
export const at = (s, p, after = 0) => when(words(s), p, after);
/** Draw shot i for time t; blend from the previous shot over XF seconds after each cut */
export const XF = 0.45;
export function shots(g, t, cuts, draws) {
  let i = 0; while (i < cuts.length && t >= cuts[i]) i++;
  draws[i](g, t);
  const since = i ? t - cuts[i - 1] : 99;
  if (since < XF) {
    const [c, cg] = buf('xprev');
    draws[i - 1](cg, t);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1 - ez(since / XF); g.drawImage(c, 0, 0); g.restore();
  }
}
export function caption(g, t, a, str, y = 980, { size = 30, x = W / 2 } = {}) {
  const p = spring(t, a, 1.8, 0.65);
  if (p <= 0.01) return;
  g.save(); g.font = `600 ${size}px Inter`;
  const w = g.measureText(str).width + 48;
  g.translate(x, y); g.scale(Math.min(1.05, p), Math.min(1.05, p)); g.globalAlpha = Math.min(1, p);
  g.fillStyle = 'rgba(20,14,44,0.78)'; g.beginPath(); g.roundRect(-w / 2, -28, w, 56, 28); g.fill();
  g.strokeStyle = 'rgba(185,162,255,0.45)'; g.lineWidth = 2; g.stroke();
  text(g, str, 0, size * 0.36, { font: 'Inter', weight: 600, size, color: INK, align: 'center' });
  g.restore();
}
export function nightBG(g, t, { hy = 900, glowCol = 'rgba(255,170,110,0.18)' } = {}) {
  sky(g, { top: '#06061c', mid: '#15133b', horizon: '#2d2552', glow: glowCol, hy });
  stars(g, t, { n: 90, maxY: 500, alpha: 0.5 });
}

// ---------------------------------------------------------------- props
/** A phone face-on; app: 'ueno' (teal, working) → 'down' (grey, no connection) */
export function phone(g, x, y, s, k, { glowA = 1 } = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = '#0a0812'; g.beginPath(); g.roundRect(-46, -90, 92, 180, 16); g.fill();
  const on = 1 - k;
  const sc = g.createLinearGradient(0, -82, 0, 82);
  sc.addColorStop(0, `rgb(${lerp(20, 58, on)},${lerp(22, 70, on)},${lerp(40, 92, on)})`); sc.addColorStop(1, `rgb(${lerp(14, 22, on)},${lerp(14, 40, on)},${lerp(26, 60, on)})`);
  g.fillStyle = sc; g.beginPath(); g.roundRect(-40, -82, 80, 164, 11); g.fill();
  g.fillStyle = on > 0.5 ? TEAL : '#5b5870'; g.beginPath(); g.roundRect(-20, -34, 40, 40, 10); g.fill();
  text(g, on > 0.5 ? 'u' : '!', 0, -6, { font: 'Jakarta', weight: 800, size: 28, color: on > 0.5 ? '#0c2a24' : '#d9d6e6', align: 'center' });
  g.fillStyle = on > 0.5 ? 'rgba(62,224,181,0.5)' : 'rgba(150,145,170,0.35)'; g.fillRect(-26, 22, 52, 5); g.fillRect(-20, 33, 40, 5);
  g.restore();
  if (on > 0.3 && glowA > 0) glow(g, x, y, 70 * s, '62,224,181', 0.18 * on * glowA);
}
export function cardIcon(g, x, y, s, { color = TEAL } = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = color; g.beginPath(); g.roundRect(-60, -38, 120, 76, 10); g.fill();
  g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(-60, -20, 120, 14);
  g.fillStyle = '#ffd166'; g.fillRect(-46, 4, 22, 16);
  text(g, 'ueno', 30, 28, { font: 'Jakarta', weight: 800, size: 18, color: '#0c2a24', align: 'center' });
  g.restore();
}
export function cross(g, x, y, r, p) {
  if (p <= 0) return;
  g.save(); g.strokeStyle = '#ff4d5e'; g.lineWidth = 12; g.lineCap = 'round';
  g.beginPath(); g.moveTo(x - r, y - r); g.lineTo(lerp(x - r, x + r, clamp(p * 2)), lerp(y - r, y + r, clamp(p * 2))); g.stroke();
  if (p > 0.5) { g.beginPath(); g.moveTo(x + r, y - r); g.lineTo(lerp(x + r, x - r, clamp(p * 2 - 1)), lerp(y - r, y + r, clamp(p * 2 - 1))); g.stroke(); }
  g.restore();
}

