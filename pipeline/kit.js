// Ready-made building blocks for scenes: stage + camera, chapter cards, cards, stamps,
// sticky notes, label strips, simple icons. Built on engine.js + collage.js.

import { W, H, clamp, lerp, prog, ease, rand, text } from './engine.js';
import { C, backdrop, piece, tape, camera, cameraPath, markerLine, paperFill } from './collage.js';

/** Drop-in animation 0 → 1 with overshoot */
export const pop = (t, at, len = 0.5) => ease.outBack(prog(t, at, at + len));
export const fade = (t, at, len = 0.4) => ease.out(prog(t, at, at + len));

/** Time of the nth sound hit of this scene (from an act's hits list) */
export function hitTime(hits, s, n = 0) {
  const h = hits.filter((x) => x.scene === s.id)[n];
  if (!h) return 1e9;
  return (h.cue != null ? s.cue(h.cue) : 0) + (h.at || 0);
}

/**
 * Backdrop + camera with gentle hand-held drift.
 * `keys`: camera keyframes [{t, x, y, z}] (optional; default is a slow push-in).
 * `shakeAt`: time(s) of impacts that jolt the camera.
 */
export function stage(ctx, s, { bg = C.navy, keys, zoom = [1, 1.05], shakeAt = [] } = {}) {
  const { t } = s;
  backdrop(ctx, bg);
  const cam = keys ? cameraPath(keys, t) : { x: 960, y: 540, z: lerp(zoom[0], zoom[1], ease.inOut(clamp(t / s.d))) };
  const dx = Math.sin(t * 0.37) * 6, dy = Math.cos(t * 0.29) * 5, tilt = Math.sin(t * 0.21) * 0.004;
  for (const at of [].concat(shakeAt)) {
    const k = prog(t, at, at + 0.45);
    if (k > 0 && k < 1) {
      const a = 14 * (1 - k);
      ctx.translate(Math.sin(t * 90) * a, Math.cos(t * 75) * a * 0.6);
    }
  }
  camera(ctx, cam.x + dx, cam.y + dy, cam.z, tilt + (cam.tilt || 0));
  return cam;
}

/** Wrap text into lines that fit width */
export function wrap(ctx, str, width, font) {
  ctx.font = font;
  const words = str.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > width && line) { lines.push(line); line = w; } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

/** Paper card that pops in at `at`, content drawn in local space */
export function card(ctx, t, at, { x, y, w, h, color = C.white, rot = 0, seed = 1, torn = '', tapeIt = false, from = 'pop' }, content) {
  const p = from === 'pop' ? pop(t, at) : fade(t, at, 0.6);
  if (p <= 0) return;
  ctx.save();
  if (from === 'pop') {
    ctx.translate(x, y);
    ctx.scale(p, p);
    ctx.translate(-x, -y);
  }
  const dy = from === 'up' ? (1 - p) * 400 : from === 'down' ? -(1 - p) * 400 : 0;
  piece(ctx, { x, y: y + dy, w, h, color, rot, seed, torn, alpha: clamp(p * 1.5) }, content);
  if (tapeIt) tape(ctx, x, y + dy - h / 2 + 4, Math.min(180, w * 0.4), rot * 2 + 0.05, seed + 3, clamp(p * 1.5));
  ctx.restore();
}

/** Coloured label strip (torn ends) with bold condensed text; slides in from the left */
export function strip(ctx, t, at, str, x, y, { color = C.red, ink = C.white, size = 52, rot = -0.025, seed = 7, slide = true } = {}) {
  const p = ease.out(prog(t, at, at + 0.5));
  if (p <= 0) return;
  ctx.font = `700 ${size}px Oswald`;
  ctx.letterSpacing = `${size * 0.06}px`;
  const w = ctx.measureText(str).width + size * 1.2, h = size * 1.6;
  piece(ctx, { x: slide ? lerp(x - 500, x, p) : x, y, w, h, color, rot, seed, torn: 'lr', alpha: clamp(p * 2) }, (g) => {
    text(g, str, w / 2, h / 2 + size * 0.36, { font: 'Oswald', weight: 700, size, color: ink, align: 'center', spacing: size * 0.06 });
  });
}

/** Rubber stamp that slams down at `at` */
export function stamp(ctx, t, at, str, x, y, { color = C.red, size = 90, rot = -0.12 } = {}) {
  const sp = prog(t, at - 0.12, at);
  if (sp <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  const sc = lerp(2.4, 1, ease.in(sp));
  ctx.scale(sc, sc);
  ctx.globalAlpha *= lerp(0, 0.88, sp);
  ctx.font = `700 ${size}px Oswald`;
  ctx.letterSpacing = `${size * 0.07}px`;
  const w = ctx.measureText(str).width + size * 0.7, h = size * 1.45;
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.09;
  ctx.strokeRect(-w / 2, -h / 2, w, h);
  text(ctx, str, 0, size * 0.34, { font: 'Oswald', weight: 700, size, color, align: 'center', spacing: size * 0.07 });
  ctx.restore();
}

/** Sticky note with handwritten lines: [{text, size?, color?, font?}] */
export function sticky(ctx, t, at, x, y, lines, { w = 340, h = 300, color = C.sticky, rot = 0.05, seed = 12 } = {}) {
  card(ctx, t, at, { x, y, w, h, color, rot, seed }, (g) => {
    const total = lines.reduce((a, l) => a + (l.size || 48) * 1.15, 0);
    let yy = h / 2 - total / 2;
    for (const l of lines) {
      const sz = l.size || 48;
      yy += sz;
      text(g, l.text, w / 2, yy, { font: l.font || 'Permanent Marker', size: sz, color: l.color || C.ink, align: 'center' });
      yy += sz * 0.15;
    }
  });
}

/** Handwritten note that writes on (fades with a small rise) */
export function note(ctx, t, at, str, x, y, { size = 60, color = C.red, font = 'Permanent Marker', align = 'center', rot = 0 } = {}) {
  const p = fade(t, at, 0.5);
  if (p <= 0) return;
  ctx.save();
  ctx.translate(x, y + (1 - p) * 12);
  ctx.rotate(rot);
  text(ctx, str, 0, 0, { font, size, color, align, alpha: p, weight: font === 'Caveat' ? 700 : 400 });
  ctx.restore();
}

/** Chapter title card factory */
export function chapter(num, title) {
  return (ctx, s) => {
    const { t, d } = s;
    stage(ctx, s, { bg: C.deep, zoom: [1, 1.04] });
    const out = prog(t, d - 0.4, d);
    ctx.globalAlpha = 1 - out;
    strip(ctx, t, 0.05, `CHAPTER ${num}`, 960, 430, { color: C.red, size: 46, seed: 30 + num });
    card(ctx, t, 0.3, { x: 960, y: 590, w: Math.max(900, title.length * 46), h: 170, color: C.white, rot: 0.01, seed: 40 + num, tapeIt: true }, (g) => {
      text(g, title, Math.max(900, title.length * 46) / 2, 115, { font: 'Playfair Display', weight: 900, size: 84, color: C.ink, align: 'center' });
    });
    ctx.globalAlpha = 1;
  };
}

// ---------- simple icons ----------
export function bust(ctx, x, y, s, color = C.navy) {
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(x, y - s * 0.32, s * 0.26, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - s * 0.5, y + s * 0.5);
  ctx.quadraticCurveTo(x - s * 0.5, y - s * 0.02, x, y - s * 0.02);
  ctx.quadraticCurveTo(x + s * 0.5, y - s * 0.02, x + s * 0.5, y + s * 0.5);
  ctx.closePath(); ctx.fill();
}

export function trophy(ctx, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s / 100, s / 100);
  ctx.fillStyle = paperFill(ctx, '#d4a63a');
  ctx.strokeStyle = '#7a5a12';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-60, -90); ctx.lineTo(60, -90);
  ctx.bezierCurveTo(60, -10, 30, 10, 12, 18);
  ctx.lineTo(12, 50); ctx.lineTo(40, 58); ctx.lineTo(40, 80); ctx.lineTo(-40, 80); ctx.lineTo(-40, 58); ctx.lineTo(-12, 50); ctx.lineTo(-12, 18);
  ctx.bezierCurveTo(-30, 10, -60, -10, -60, -90);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#d4a63a';
  ctx.beginPath(); ctx.arc(-62, -55, 26, Math.PI * 0.5, Math.PI * 1.5); ctx.stroke();
  ctx.beginPath(); ctx.arc(62, -55, 26, -Math.PI * 0.5, Math.PI * 0.5); ctx.stroke();
  ctx.restore();
}

export function building(ctx, x, y, w, h, color = C.navy, seed = 1) {
  const r = rand(seed);
  ctx.fillStyle = color;
  ctx.fillRect(x - w / 2, y - h, w, h);
  ctx.fillStyle = 'rgba(255,224,102,0.8)';
  for (let yy = y - h + 16; yy < y - 20; yy += 30) {
    for (let xx = x - w / 2 + 12; xx < x + w / 2 - 16; xx += 26) if (r() > 0.35) ctx.fillRect(xx, yy, 12, 16);
  }
}

/** A stack of documents / bills */
export function docStack(ctx, x, y, n, p, { color = C.white, seed = 3, w = 220, h = 130 } = {}) {
  const r = rand(seed);
  for (let i = 0; i < n; i++) {
    const k = ease.out(prog(p * n, i, i + 1));
    if (k <= 0) break;
    piece(ctx, { x: x + (r() - 0.5) * 30, y: y - i * 14 - (1 - k) * 300, w, h, color, rot: (r() - 0.5) * 0.2, seed: seed * 10 + i, alpha: k, shadow: 0.6 }, (g) => {
      g.fillStyle = 'rgba(31,29,26,0.15)';
      for (let l = 0; l < 4; l++) g.fillRect(20, 26 + l * 22, w * (0.5 + r() * 0.3), 8);
    });
  }
}

/** Underline drawn with a marker */
export function underline(ctx, t, at, x1, x2, y, opts = {}) {
  markerLine(ctx, [[x1, y], [x2, y - 4]], ease.out(prog(t, at, at + 0.4)), opts);
}

export { W, H, C, clamp, lerp, prog, ease, rand, text, piece, tape, markerLine };
