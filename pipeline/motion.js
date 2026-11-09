// Motion toolkit for a faster, more cinematic look. The rules come from the
// HyperFrames and motionmaxxing guides (professional motion measured frame by frame):
//  - arrivals decelerate on a long tail (expo/power4 out); exits accelerate (power3 in), shorter
//  - things arrive from oversize or with blur, never grow from zero, almost never just fade
//  - words land at speech rhythm, 60-120 ms apart, blur 6-8px -> 0 in ~0.15 s
//  - cut on motion; one hero per frame; no frame sits still

import { W, H, clamp, lerp } from './engine.js';

export const ez = {
  expoOut: (p) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p)),
  p4Out: (p) => 1 - Math.pow(1 - p, 4),
  p3In: (p) => p * p * p,
  p2InOut: (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2),
};
export const span = (t, a, d) => clamp((t - a) / d);

// ---------- images ----------
const images = {};
export async function loadImages(map) {
  await Promise.all(Object.entries(map).map(([k, src]) => new Promise((ok, fail) => {
    const im = new Image();
    im.onload = () => { images[k] = im; ok(); };
    im.onerror = () => fail(new Error(`Could not load ${src}`));
    im.src = src;
  })));
}
export const img = (k) => images[k];

/**
 * Full-frame photo with a Ken Burns move and a colour grade.
 * zoom/pan are [from, to] over p (0..1). grade: 'doc' (muted, contrasty), 'cold', 'red', 'bw'.
 */
export function photo(ctx, key, p, { zoom = [1.05, 1.15], pan = [[0, 0], [0, 0]], grade = 'doc', blur = 0, alpha = 1, darken = 0.25 } = {}) {
  const im = images[key];
  if (!im || alpha <= 0) return;
  const z = lerp(zoom[0], zoom[1], p);
  const px = lerp(pan[0][0], pan[1][0], p), py = lerp(pan[0][1], pan[1][1], p);
  const s = Math.max(W / im.width, H / im.height) * z;
  const w = im.width * s, h = im.height * s;
  const filters = {
    doc: 'saturate(0.75) contrast(1.12) brightness(0.92)',
    cold: 'saturate(0.45) contrast(1.15) brightness(0.85) hue-rotate(-8deg)',
    red: 'grayscale(1) contrast(1.25) brightness(0.8)',
    bw: 'grayscale(1) contrast(1.2) brightness(0.9)',
  };
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.filter = `${filters[grade] || ''} ${blur > 0.2 ? `blur(${blur}px)` : ''}`.trim() || 'none';
  ctx.drawImage(im, W / 2 - w / 2 + px * W, H / 2 - h / 2 + py * H, w, h);
  ctx.filter = 'none';
  if (grade === 'red') {
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = '#c8402e';
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
  }
  // documentary darkening toward the bottom so type reads
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, `rgba(8,10,14,${darken * 0.6})`);
  g.addColorStop(1, `rgba(8,10,14,${Math.min(0.9, darken * 2.2)})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// ---------- kinetic type ----------
/**
 * Spread the words of a narration line over its spoken time (by length), so each word can
 * land as it is heard. Returns [{word, at}].
 */
export function wordTimes(text, start, end) {
  const words = text.split(/\s+/).filter(Boolean);
  const total = words.reduce((a, w) => a + w.length + 1.5, 0);
  let acc = 0;
  return words.map((w) => {
    const at = start + (acc / total) * (end - start);
    acc += w.length + 1.5;
    return { word: w, at };
  });
}

/**
 * A line of words that land one by one (blur 8px -> 0, small rise), then hold dead still.
 * words: [{word, at, color?}]. Leaves on `out` (all words blur away together, 0.18 s).
 */
export function kinetic(ctx, t, words, x, y, { size = 86, font = 'Oswald', weight = 700, color = '#f4ecdb', align = 'center', spacing = 0.02, out = 1e9, lead = 0.05, shadow = true } = {}) {
  ctx.save();
  ctx.font = `${weight} ${size}px ${font}`;
  ctx.letterSpacing = `${size * spacing}px`;
  ctx.textBaseline = 'alphabetic';
  const gap = size * 0.28;
  const widths = words.map((w) => ctx.measureText(w.word).width);
  const total = widths.reduce((a, b) => a + b, 0) + gap * (words.length - 1);
  let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  const o = span(t, out, 0.18);
  words.forEach((w, i) => {
    const p = span(t, w.at - lead, 0.16);
    if (p > 0 && o < 1) {
      const e = ez.expoOut(p);
      const b = (1 - e) * 8 + o * 10;
      ctx.globalAlpha = Math.min(1, p * 1.6) * (1 - o);
      ctx.filter = b > 0.3 ? `blur(${b}px)` : 'none';
      if (shadow) { ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 24; }
      ctx.fillStyle = w.color || color;
      ctx.fillText(w.word, cx, y + (1 - e) * size * 0.18);
    }
    cx += widths[i] + gap;
  });
  ctx.restore();
}

/** Big word that crashes in from oversize (3.5x -> 1) with a blur, landing at `at` */
export function crash(ctx, t, at, draw, { from = 3.2, len = 0.32, x = W / 2, y = H / 2 } = {}) {
  const p = span(t, at - len, len);
  if (p <= 0) return;
  const e = ez.expoOut(p);
  ctx.save();
  ctx.translate(x, y);
  const s = lerp(from, 1, e);
  ctx.scale(s, s);
  ctx.globalAlpha *= Math.min(1, p * 3);
  const b = (1 - e) * 14;
  ctx.filter = b > 0.3 ? `blur(${b}px)` : 'none';
  draw(ctx);
  ctx.filter = 'none';
  ctx.restore();
}

/** Camera shake after an impact, decaying over 0.35 s */
export function impact(ctx, t, at, power = 18) {
  const k = span(t, at, 0.35);
  if (k <= 0 || k >= 1) return;
  const a = power * Math.pow(1 - k, 2);
  ctx.translate(Math.sin(t * 97) * a, Math.cos(t * 83) * a * 0.7);
}

/** White flash frame on impact (2-3 frames) */
export function flash(ctx, t, at, strength = 0.35) {
  const k = span(t, at, 0.1);
  if (k <= 0 || k >= 1) return;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = `rgba(255,248,235,${strength * (1 - k)})`;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

/**
 * Whip transition: during [at, at+len] the frame smears sideways.
 * Returns {dx, blur} for the outgoing (p<0.5) or incoming (p>=0.5) shot.
 */
export function whip(t, at, len = 0.26, dir = -1) {
  const p = span(t, at, len);
  if (p <= 0) return { dx: 0, blur: 0, phase: 'before' };
  if (p >= 1) return { dx: 0, blur: 0, phase: 'after' };
  if (p < 0.5) {
    const e = ez.p3In(p * 2);
    return { dx: dir * e * W * 0.6, blur: e * 40, phase: 'out' };
  }
  const e = ez.expoOut((p - 0.5) * 2);
  return { dx: -dir * (1 - e) * W * 0.6, blur: (1 - e) * 40, phase: 'in' };
}

/** Horizontal motion blur by drawing a callback blurred (cheap approximation) */
export function withBlur(ctx, px, fn) {
  ctx.save();
  if (px > 0.3) ctx.filter = `blur(${px}px)`;
  fn(ctx);
  ctx.restore();
}

/** Counter that steps per frame and lands on a value */
export function counter(t, at, len, from, to, ease = ez.expoOut) {
  return lerp(from, to, ease(span(t, at, len)));
}
