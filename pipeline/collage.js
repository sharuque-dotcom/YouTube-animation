// Paper-collage toolkit: textured paper, torn edges, tape, marker scribbles, sticky notes.
// Gives the hand-made documentary look (warm paper, bold colour, red marker annotations).

import { W, H, clamp, lerp, ease, rand } from './engine.js';

export const C = {
  navy: '#163447',
  deep: '#0f2533',
  teal: '#2a7f86',
  paper: '#efe4cc',
  white: '#f7f1e3',
  kraft: '#c9a878',
  ink: '#1f1d1a',
  red: '#e2412e',
  orange: '#f08a24',
  yellow: '#ffd23f',
  sticky: '#ffe066',
  grid: '#8fb3c9',
  muted: '#7d8a90',
};

// ---------- paper texture ----------
const textures = new Map();
function texture(color) {
  if (textures.has(color)) return textures.get(color);
  const S = 1024;
  const cv = new OffscreenCanvas(S, S);
  const g = cv.getContext('2d');
  const r = rand(color.length * 97 + parseInt(color.slice(1), 16) % 1000);
  g.fillStyle = color;
  g.fillRect(0, 0, S, S);
  // soft blotches
  for (let i = 0; i < 140; i++) {
    const x = r() * S, y = r() * S, rad = 40 + r() * 160;
    const gr = g.createRadialGradient(x, y, 0, x, y, rad);
    const dark = r() < 0.55;
    gr.addColorStop(0, dark ? 'rgba(60,40,20,0.022)' : 'rgba(255,255,255,0.025)');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr;
    g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  // fibres
  g.lineWidth = 1;
  for (let i = 0; i < 900; i++) {
    const x = r() * S, y = r() * S, a = r() * Math.PI, l = 4 + r() * 16;
    g.strokeStyle = r() < 0.5 ? 'rgba(80,60,40,0.08)' : 'rgba(255,255,255,0.08)';
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
    g.stroke();
  }
  // fine speckle
  const img = g.getImageData(0, 0, S, S);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (r() - 0.5) * 14;
    img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n;
  }
  g.putImageData(img, 0, 0);
  textures.set(color, cv);
  return cv;
}
const patterns = new WeakMap();
export function paperFill(ctx, color) {
  let m = patterns.get(ctx);
  if (!m) patterns.set(ctx, (m = new Map()));
  if (!m.has(color)) m.set(color, ctx.createPattern(texture(color), 'repeat'));
  return m.get(color);
}

/** Fill the whole frame with textured paper (ignores current transform) */
export function backdrop(ctx, color) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = paperFill(ctx, color);
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// ---------- shapes ----------
/** Rectangle path whose chosen edges are torn (jagged); others are clean cuts */
export function tornPath(ctx, x, y, w, h, { seed = 1, torn = '', jag = 7 } = {}) {
  const r = rand(seed);
  const edge = (x1, y1, x2, y2, rough) => {
    const len = Math.hypot(x2 - x1, y2 - y1);
    const n = Math.max(1, Math.round(len / (rough ? 12 : 60)));
    const nx = -(y2 - y1) / len, ny = (x2 - x1) / len;
    for (let i = 1; i <= n; i++) {
      const k = i / n;
      const j = i === n ? 0 : (r() - 0.5) * (rough ? jag * 2 : 1.2);
      ctx.lineTo(lerp(x1, x2, k) + nx * j, lerp(y1, y2, k) + ny * j);
    }
  };
  ctx.beginPath();
  ctx.moveTo(x, y);
  edge(x, y, x + w, y, torn.includes('t'));
  edge(x + w, y, x + w, y + h, torn.includes('r'));
  edge(x + w, y + h, x, y + h, torn.includes('b'));
  edge(x, y + h, x, y, torn.includes('l'));
  ctx.closePath();
}

/**
 * A piece of paper. Draws centred on (x, y) with rotation `rot`, then calls
 * `content(ctx)` in the piece's local space (origin at its top-left).
 */
export function piece(ctx, { x, y, w, h, color = C.paper, rot = 0, seed = 1, torn = '', jag, alpha = 1, shadow = 1, lift = 0 }, content) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.translate(-w / 2, -h / 2);
  tornPath(ctx, 0, 0, w, h, { seed, torn, jag });
  ctx.save();
  ctx.shadowColor = `rgba(0,0,0,${0.35 * shadow})`;
  ctx.shadowBlur = 14 + lift * 30;
  ctx.shadowOffsetX = 3 + lift * 8;
  ctx.shadowOffsetY = 6 + lift * 18;
  ctx.fillStyle = paperFill(ctx, color);
  ctx.fill();
  ctx.restore();
  if (content) {
    ctx.save();
    ctx.clip();
    content(ctx);
    ctx.restore();
  }
  ctx.restore();
}

/** A strip of masking tape */
export function tape(ctx, x, y, w = 140, rot = 0, seed = 1, alpha = 1) {
  if (alpha <= 0) return;
  const h = 42;
  const r = rand(seed);
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.beginPath();
  ctx.moveTo(-w / 2, -h / 2);
  ctx.lineTo(w / 2, -h / 2);
  for (let i = 1; i <= 6; i++) ctx.lineTo(w / 2 + (i % 2 ? 5 : -2) + r() * 3, -h / 2 + (h * i) / 6);
  ctx.lineTo(-w / 2, h / 2);
  for (let i = 5; i >= 0; i--) ctx.lineTo(-w / 2 + (i % 2 ? -5 : 2) - r() * 3, -h / 2 + (h * i) / 6);
  ctx.closePath();
  ctx.fillStyle = 'rgba(236,224,190,0.78)';
  ctx.shadowColor = 'rgba(0,0,0,0.18)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;
  ctx.fill();
  ctx.restore();
}

// ---------- marker & highlighter ----------
function strokeStyle(ctx, color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
}

/** Wobbly hand-drawn ellipse, drawn on as p goes 0 → 1 */
export function markerCircle(ctx, cx, cy, rx, ry, p, { color = C.red, width = 7, seed = 3 } = {}) {
  if (p <= 0) return;
  const r = rand(seed);
  const turns = 1.12, steps = 120, start = -2.2 + r() * 0.5;
  const wob = [r(), r(), r()].map((v) => v * 0.06);
  ctx.save();
  strokeStyle(ctx, color, width);
  ctx.globalAlpha *= 0.92;
  ctx.beginPath();
  const n = Math.floor(steps * ease.out(p));
  for (let i = 0; i <= n; i++) {
    const a = start + (i / steps) * turns * Math.PI * 2;
    const k = 1 + wob[0] * Math.sin(a * 2) + wob[1] * Math.cos(a * 3) + (i / steps) * 0.06;
    const px = cx + Math.cos(a) * rx * k, py = cy + Math.sin(a) * ry * k;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.stroke();
  ctx.restore();
}

/** Hand-drawn polyline revealed by p */
export function markerLine(ctx, pts, p, { color = C.red, width = 7 } = {}) {
  if (p <= 0) return;
  const lens = [0];
  for (let i = 1; i < pts.length; i++) lens.push(lens[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const target = lens[lens.length - 1] * clamp(p);
  ctx.save();
  strokeStyle(ctx, color, width);
  ctx.beginPath();
  ctx.moveTo(...pts[0]);
  for (let i = 1; i < pts.length; i++) {
    if (lens[i] <= target) ctx.lineTo(...pts[i]);
    else {
      const k = (target - lens[i - 1]) / (lens[i] - lens[i - 1]);
      ctx.lineTo(lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k));
      break;
    }
  }
  ctx.stroke();
  ctx.restore();
}

/** Curved marker arrow from a to b */
export function arrow(ctx, a, b, p, { color = C.red, width = 7, bend = 0.25 } = {}) {
  if (p <= 0) return;
  const mx = (a[0] + b[0]) / 2 - (b[1] - a[1]) * bend, my = (a[1] + b[1]) / 2 + (b[0] - a[0]) * bend;
  const pts = [];
  for (let i = 0; i <= 30; i++) {
    const t = i / 30;
    pts.push([(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * mx + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * my + t * t * b[1]]);
  }
  markerLine(ctx, pts, ease.out(clamp(p * 1.25)), { color, width });
  const hp = clamp((p - 0.75) * 4);
  if (hp > 0) {
    const ang = Math.atan2(b[1] - pts[28][1], b[0] - pts[28][0]);
    const L = 30 * hp;
    markerLine(ctx, [[b[0] - Math.cos(ang - 0.5) * L, b[1] - Math.sin(ang - 0.5) * L], b, [b[0] - Math.cos(ang + 0.5) * L, b[1] - Math.sin(ang + 0.5) * L]], 1, { color, width });
  }
}

/** Rough highlighter swipe */
export function highlight(ctx, x, y, w, h, p, { color = C.yellow, alpha = 0.55, seed = 5 } = {}) {
  if (p <= 0) return;
  const r = rand(seed);
  const ww = w * ease.out(p);
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y + r() * 4);
  ctx.lineTo(x + ww, y + r() * 4 - 2);
  ctx.lineTo(x + ww + 4, y + h - r() * 4);
  ctx.lineTo(x - 2, y + h + r() * 3);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// ---------- camera ----------
/** Look at world point (x, y) with zoom and slight tilt; everything after is in world space */
export function camera(ctx, x, y, zoom = 1, tilt = 0) {
  ctx.translate(W / 2, H / 2);
  ctx.rotate(tilt);
  ctx.scale(zoom, zoom);
  ctx.translate(-x, -y);
}

/** Interpolate between camera keyframes [{t, x, y, z, tilt}] */
export function cameraPath(keys, t) {
  let i = keys.findIndex((k) => k.t > t);
  if (i === -1) return keys[keys.length - 1];
  if (i === 0) return keys[0];
  const a = keys[i - 1], b = keys[i];
  const p = ease.inOut(clamp((t - a.t) / (b.t - a.t)));
  return { x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p), z: lerp(a.z, b.z, p), tilt: lerp(a.tilt || 0, b.tilt || 0, p) };
}

/** Simple person icon (for crowds) */
export function person(ctx, x, y, s, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y - s * 0.55, s * 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - s * 0.42, y + s * 0.5);
  ctx.quadraticCurveTo(x - s * 0.42, y - s * 0.2, x, y - s * 0.2);
  ctx.quadraticCurveTo(x + s * 0.42, y - s * 0.2, x + s * 0.42, y + s * 0.5);
  ctx.closePath();
  ctx.fill();
}
