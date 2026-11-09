// Light-mode product-documentary kit: pastel world, soft cards, springs, masked type,
// rolling numbers, pins, timeline, light map. Everything is a pure function of time.

import { W, H, clamp, lerp, rand, text } from './engine.js';
import { view, landRings } from './map.js';
import { ez, span, img } from './motion.js';

export const UI = {
  purple: '#4a2a8c', ink: '#1d1b29', muted: '#6b6880', faint: '#9893ad', card: '#ffffff', soft: '#f1edf9',
  line: '#e6e1f0', amber: '#fde7b8', amberInk: '#8a5a00', red: '#e2412e', redSoft: '#fde2dc', green: '#1f8a5b',
  lav: '#d9ccff', peach: '#ffd9c4', HEAD: 'Jakarta', BODY: 'Inter',
};

// ---------- motion ----------
/** Global tempo: >1 slows every spring, ease and number roll (1.35 = 35% slower) */
export const TEMPO = 1.35;
/** Spring from 0 to 1 starting at `at` (damping 0.7 reads premium; lower = more bounce) */
export function spring(t, at, { freq = 1.5, damp = 0.72 } = {}) {
  const x = t - at;
  if (x <= 0) return 0;
  const w = (2 * Math.PI * freq) / TEMPO, wd = w * Math.sqrt(1 - damp * damp);
  return 1 - Math.exp(-damp * w * x) * (Math.cos(wd * x) + ((damp * w) / wd) * Math.sin(wd * x));
}
export const ease = (t, at, d = 0.6) => ez.expoOut(span(t, at, d * TEMPO));
export const easeIn = (t, at, d = 0.4) => ez.p3In(span(t, at, d * TEMPO));
export const inOut = (t, at, d = 1) => ez.p2InOut(span(t, at, d * TEMPO));

// ---------- world ----------
/** Pastel gradient with slowly drifting colour blobs */
export function world(ctx, T, { tint = 0 } = {}) {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#f4efff');
  g.addColorStop(1, tint > 0 ? lerpColor('#fdf5ef', '#ffe6e0', tint) : '#fdf5ef');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const blobs = [
    [0.12, 0.2, 520, '217,204,255', 0.13, 0.7], [0.55, 0.9, 480, '255,217,196', 0.09, 0.6],
    [0.95, 0.35, 460, '228,217,255', 0.11, 0.65], [0.4, 0.05, 380, '255,226,214', 0.15, 0.5],
  ];
  blobs.forEach(([bx, by, r, col, sp, a], i) => {
    const x = (bx + Math.sin(T * sp + i * 2) * 0.06) * W, y = (by + Math.cos(T * sp * 0.8 + i) * 0.07) * H;
    const rg = ctx.createRadialGradient(x, y, 0, x, y, r * 1.6);
    rg.addColorStop(0, `rgba(${col},${a})`);
    rg.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, W, H);
  });
}
function lerpColor(a, b, p) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(lerp(v, pb[i], p))).join(',')})`;
}

// ---------- type ----------
/**
 * Headline lines that rise out of a mask (and leave upward through it).
 * lines: string[]; inAt/outAt in seconds.
 */
export function headline(ctx, t, lines, x, y, inAt, outAt = 1e9, { size = 96, color = UI.purple, weight = 600, font = UI.HEAD, align = 'left', lineH = 1.08 } = {}) {
  const lh = size * lineH;
  lines.forEach((ln, i) => {
    const pin = ease(t, inAt + i * 0.07, 0.7), pout = easeIn(t, outAt + i * 0.05, 0.38);
    if (pin <= 0 || pout >= 1) return;
    const ly = y + i * lh;
    ctx.save();
    ctx.beginPath();
    ctx.rect(align === 'center' ? x - W : x - 20, ly - size * 0.95, W * 2, lh + size * 0.12);
    ctx.clip();
    const dy = (1 - pin) * lh - pout * lh;
    text(ctx, ln, x, ly + dy, { font, weight, size, color, align, spacing: -size * 0.02 });
    ctx.restore();
  });
}

/** Rolling-digit number (odometer). str like '₹5,361 cr'. Digits roll up into place, staggered. */
export function odometer(ctx, t, at, str, x, y, { size = 72, color = UI.ink, weight = 700, font = UI.HEAD, align = 'left', from = null, dur = 1.1 } = {}) {
  ctx.save();
  ctx.font = `${weight} ${size}px ${font}`;
  const widths = [...str].map((ch) => ctx.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0);
  let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  const lh = size * 1.18;
  ctx.beginPath();
  ctx.rect(cx - 10, y - size * 0.98, total + 20, lh);
  ctx.clip();
  ctx.fillStyle = color;
  ctx.textBaseline = 'alphabetic';
  let di = 0;
  [...str].forEach((ch, i) => {
    const isD = /\d/.test(ch);
    const p = ez.expoOut(span(t, at + di * 0.08 * (dur / 1.1), dur * TEMPO));
    if (isD) {
      const target = +ch + 10 * (2 + (di % 2));
      const start = from != null ? +String(from).padStart(str.length, '0')[i] || 0 : 0;
      const pos = lerp(start, target, p);
      for (let k = Math.floor(pos) - 1; k <= Math.floor(pos) + 1; k++) {
        const dy = (pos - k) * lh;
        ctx.fillText(String(((k % 10) + 10) % 10), cx, y + dy);
      }
      di++;
    } else {
      ctx.globalAlpha = clamp(p * 2);
      ctx.fillText(ch, cx, y + (1 - p) * lh * 0.5);
      ctx.globalAlpha = 1;
    }
    cx += widths[i];
  });
  ctx.restore();
  return total;
}

/** Text typed on with a caret */
export function typeOn(ctx, t, at, str, x, y, { size = 30, color = UI.ink, font = UI.BODY, weight = 400, cps = 34, maxW = 700, lineH = 1.5 } = {}) {
  const n = Math.floor(Math.max(0, t - at) * cps);
  const shown = str.slice(0, n);
  ctx.font = `${weight} ${size}px ${font}`;
  const lines = [];
  let cur = '';
  for (const w of shown.split(' ')) {
    const tl = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(tl).width > maxW && cur) { lines.push(cur); cur = w; } else cur = tl;
  }
  lines.push(cur);
  lines.forEach((ln, i) => text(ctx, ln, x, y + i * size * lineH, { font, weight, size, color }));
  if (n > 0 && n < str.length && Math.floor(t * 2.5) % 2 === 0) {
    const last = lines[lines.length - 1];
    ctx.fillStyle = UI.purple;
    ctx.fillRect(x + ctx.measureText(last).width + 4, y + (lines.length - 1) * size * lineH - size * 0.85, 3, size);
  }
  return lines.length;
}

// ---------- surfaces ----------
/** Soft white card with a layered shadow; content(ctx) is drawn clipped inside, in card space */
export function card(ctx, x, y, w, h, { r = 28, fill = UI.card, alpha = 1, scale = 1, lift = 1 } = {}, content) {
  if (alpha <= 0.01 || w < 2 || h < 2) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x + w / 2, y + h / 2);
  ctx.scale(scale, scale);
  ctx.translate(-w / 2, -h / 2);
  ctx.shadowColor = `rgba(60,40,120,${0.12 * lift})`;
  ctx.shadowBlur = 60 * lift;
  ctx.shadowOffsetY = 22 * lift;
  ctx.fillStyle = fill;
  ctx.beginPath(); ctx.roundRect(0, 0, w, h, r); ctx.fill();
  ctx.shadowColor = 'transparent';
  if (content) {
    ctx.beginPath(); ctx.roundRect(0, 0, w, h, r); ctx.clip();
    content(ctx, w, h);
  }
  ctx.restore();
}

/** Pill chip; returns its width */
export function chip(ctx, str, x, y, { size = 22, fill = '#fff', stroke = '#d9d3e8', color = UI.ink, weight = 500, alpha = 1, scale = 1, pad = 20 } = {}) {
  if (alpha <= 0.01) return 0;
  ctx.save();
  ctx.font = `${weight} ${size}px ${UI.BODY}`;
  const w = ctx.measureText(str).width + pad * 2, h = size * 2;
  ctx.globalAlpha *= alpha;
  ctx.translate(x + w / 2, y + h / 2);
  ctx.scale(scale, scale);
  ctx.translate(-w / 2, -h / 2);
  ctx.fillStyle = fill;
  ctx.beginPath(); ctx.roundRect(0, 0, w, h, h / 2); ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); }
  text(ctx, str, pad, h / 2 + size * 0.36, { font: UI.BODY, weight, size, color });
  ctx.restore();
  return w;
}

/** Cover-fit an image into a rect */
export function photoIn(ctx, key, x, y, w, h, { zoom = 1 } = {}) {
  const im = img(key);
  if (!im) { ctx.fillStyle = UI.soft; ctx.fillRect(x, y, w, h); return; }
  const s = Math.max(w / im.width, h / im.height) * zoom;
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.drawImage(im, x + w / 2 - (im.width * s) / 2, y + h / 2 - (im.height * s) / 2, im.width * s, im.height * s);
  ctx.restore();
}

// ---------- map ----------
/** Light map: white land with a soft edge, no country borders. Returns the projection. */
export function lightMap(ctx, lon, lat, k, { alpha = 1 } = {}) {
  const proj = view(lon, lat, k);
  if (alpha <= 0.01) return proj;
  const rings = landRings(k > 14 ? '50m' : '110m');
  const path = new Path2D();
  for (const ring of rings) {
    const [ax, ay] = proj(ring[0]);
    if ((ax < -4000 || ax > 6000 || ay < -4000 || ay > 5000) && ring.length < 300) continue;
    if (ring.every((p) => p[1] < -58)) continue;
    let prev = null;
    for (const pt of ring) {
      const [x, y] = proj([pt[0], Math.max(-80, pt[1])]);
      if (!prev || Math.abs(pt[0] - prev[0]) > 180) path.moveTo(x, y); else path.lineTo(x, y);
      prev = pt;
    }
    path.closePath();
  }
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.save(); ctx.translate(0, 12); ctx.fillStyle = 'rgba(80,60,140,0.07)'; ctx.fill(path); ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.fill(path);
  ctx.strokeStyle = '#d6cfe8';
  ctx.lineWidth = 2;
  ctx.stroke(path);
  ctx.restore();
  return proj;
}

/** Map pin that drops in with a spring and pulses */
export function mapPin(ctx, t, at, x, y, { color = UI.purple, pulse = true, scale = 1 } = {}) {
  const s = spring(t, at, { freq: 2, damp: 0.5 }) * scale;
  if (s <= 0.01) return;
  if (pulse) {
    for (let i = 0; i < 2; i++) {
      const ph = ((t - at) * 0.7 + i * 0.5) % 1;
      ctx.fillStyle = `rgba(74,42,140,${0.22 * (1 - ph)})`;
      ctx.beginPath(); ctx.arc(x, y, 20 + ph * 90 * scale, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = 'rgba(74,42,140,0.16)';
  ctx.beginPath(); ctx.arc(0, 0, 36, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(0, 0, 5.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ---------- timeline ----------
/** Bottom timeline card with events; `pos` 0..1 is the scrubber; `label` shows above the scrubber */
export function timelineBar(ctx, t, events, pos, { y = H - 200, alpha = 1, label = '', x0 = 150, x1 = W - 150, onAt = 0 } = {}) {
  if (alpha <= 0.01) return;
  const slide = (1 - alpha) * 120;
  ctx.save();
  ctx.translate(0, slide);
  ctx.globalAlpha *= alpha;
  card(ctx, x0, y, x1 - x0, 120, { r: 30 });
  const tx0 = x0 + 50, tx1 = x1 - 50, ty = y + 46;
  ctx.fillStyle = '#ece8f5';
  ctx.beginPath(); ctx.roundRect(tx0, ty - 4, tx1 - tx0, 8, 4); ctx.fill();
  ctx.fillStyle = UI.purple;
  ctx.beginPath(); ctx.roundRect(tx0, ty - 4, (tx1 - tx0) * pos, 8, 4); ctx.fill();
  events.forEach((ev) => {
    const ex = lerp(tx0, tx1, ev.at);
    const done = pos >= ev.at - 0.002;
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = done ? UI.purple : '#c9bfe6';
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(ex, ty, 13, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    text(ctx, ev.label, ex, ty + 58, { font: UI.BODY, weight: 600, size: 19, color: done ? UI.ink : UI.faint, align: 'center' });
  });
  // scrubber
  const sx = lerp(tx0, tx1, pos);
  ctx.fillStyle = UI.purple;
  ctx.shadowColor = 'rgba(74,42,140,0.4)'; ctx.shadowBlur = 16;
  ctx.beginPath(); ctx.arc(sx, ty, 20, 0, Math.PI * 2); ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.arc(sx, ty, 14, 0, Math.PI * 2); ctx.stroke();
  if (label) {
    ctx.font = `700 26px ${UI.HEAD}`;
    const lw = ctx.measureText(label).width + 36;
    ctx.fillStyle = UI.purple;
    ctx.beginPath(); ctx.roundRect(sx - lw / 2, ty - 92, lw, 50, 25); ctx.fill();
    ctx.beginPath(); ctx.moveTo(sx - 9, ty - 43); ctx.lineTo(sx + 9, ty - 43); ctx.lineTo(sx, ty - 32); ctx.fill();
    text(ctx, label, sx, ty - 58, { font: UI.HEAD, weight: 700, size: 26, color: '#fff', align: 'center' });
  }
  ctx.restore();
}

// ---------- interaction ----------
/** A cursor that glides to (x, y), presses at `at` with a ripple */
export function cursor(ctx, t, from, to, moveAt, pressAt, { alpha = 1 } = {}) {
  const m = ez.p2InOut(span(t, moveAt, pressAt - moveAt - 0.1));
  if (t < moveAt || alpha <= 0.01) return;
  const x = lerp(from[0], to[0], m), y = lerp(from[1], to[1], m);
  const press = span(t, pressAt, 0.12) * (1 - span(t, pressAt + 0.12, 0.15));
  const rip = span(t, pressAt, 0.6);
  ctx.save();
  ctx.globalAlpha *= alpha;
  if (rip > 0 && rip < 1) {
    ctx.strokeStyle = `rgba(74,42,140,${0.5 * (1 - rip)})`;
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(x, y, 20 + rip * 60, 0, Math.PI * 2); ctx.stroke();
  }
  const s = 1 - press * 0.25;
  ctx.fillStyle = 'rgba(29,27,41,0.85)';
  ctx.shadowColor = 'rgba(0,0,0,0.25)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 4;
  ctx.beginPath(); ctx.arc(x, y, 22 * s, 0, Math.PI * 2); ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(x, y, 22 * s, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}

/** Simple person avatar (for crowds) */
export function avatar(ctx, x, y, r, fill, alpha = 1) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = fill;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.beginPath(); ctx.arc(x, y - r * 0.18, r * 0.34, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x, y + r * 0.85, r * 0.62, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
