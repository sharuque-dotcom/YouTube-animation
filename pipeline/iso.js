// Isometric diorama: true 30° projection, three tones per face, a floating plinth with strata,
// label pins and routes. Grammar adapted from the Isometric Infographic style guide (lemo-opuscar, MIT).

import { clamp, lerp, rand, text } from './engine.js';

const C30 = Math.cos(Math.PI / 6);
/** World (x right-down, y left-down, z up) → screen, around an origin, scale k */
export function isoProj(ox, oy, k) {
  return (x, y, z = 0) => [ox + (x - y) * C30 * k, oy + ((x + y) * 0.5 - z) * k];
}
function mix(hex, to, a) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(hex), B = p(to);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], a))).join(',')})`;
}
export const tones = (base) => ({ top: mix(base, '#fff8ee', 0.22), left: base, right: mix(base, '#231a2c', 0.24) });

/** A depth-sorted draw queue */
export class Iso {
  constructor(P) { this.P = P; this.items = []; }
  box(x, y, z, w, d, h, base, { alpha = 1 } = {}) {
    this.items.push({ depth: x + w + y + d + z, draw: (g) => drawBox(g, this.P, x, y, z, w, d, h, tones(base), alpha) });
    return this;
  }
  add(depth, fn) { this.items.push({ depth, draw: fn }); return this; }
  flush(g) { this.items.sort((a, b) => a.depth - b.depth).forEach((it) => it.draw(g)); this.items = []; }
}

export function drawBox(g, P, x, y, z, w, d, h, t, alpha = 1) {
  if (h <= 0) return;
  const p = (a, b, c) => P(a, b, c);
  const poly = (pts, fill) => { g.fillStyle = fill; g.beginPath(); pts.forEach(([a, b], i) => (i ? g.lineTo(a, b) : g.moveTo(a, b))); g.closePath(); g.fill(); };
  g.save(); g.globalAlpha *= alpha;
  // right face (+x side): x+w plane
  poly([p(x + w, y, z), p(x + w, y + d, z), p(x + w, y + d, z + h), p(x + w, y, z + h)], t.right);
  // left face (+y side): y+d plane
  poly([p(x, y + d, z), p(x + w, y + d, z), p(x + w, y + d, z + h), p(x, y + d, z + h)], t.left);
  // top
  poly([p(x, y, z + h), p(x + w, y, z + h), p(x + w, y + d, z + h), p(x, y + d, z + h)], t.top);
  g.restore();
}

/** The floating board with a cross-section of strata on its two front faces */
export function plinth(g, P, w, d, { layers = [['#8a6a4a', 0.5], ['#6e5238', 0.6]], shadow = true } = {}) {
  const top = (a, b) => P(a, b, 0);
  if (shadow) {
    const [cx, cy] = P(w / 2, d / 2, -3.2);
    g.save(); g.fillStyle = 'rgba(60,40,80,0.16)'; g.filter = 'blur(26px)';
    g.beginPath(); g.ellipse(cx, cy + 40, (w + d) * 0.45 * (P(1, 0)[0] - P(0, 0)[0]) / C30, (w + d) * 0.16 * (P(1, 0)[0] - P(0, 0)[0]) / C30, 0, 0, Math.PI * 2); g.fill(); g.restore();
  }
  let z = 0;
  layers.forEach(([c, h]) => { drawBox(g, P, 0, 0, z - h, w, d, h, tones(c)); z -= h; });
  void top;
}

/** A flat coloured region on the board top (land, water) given as a polygon of [x, y] */
export function region(g, P, pts, color, z = 0) {
  g.fillStyle = color; g.beginPath(); pts.forEach(([a, b], i) => { const [sx, sy] = P(a, b, z); i ? g.lineTo(sx, sy) : g.moveTo(sx, sy); }); g.closePath(); g.fill();
}

/** Label pin: ring → leader up → rule → title + number */
export function labelPin(g, P, [x, y, z], title, value, { up = 140, side = 1, ink = '#241a3d', p = 1, ground = '#f4ecdc' } = {}) {
  if (p <= 0) return;
  const [sx, sy] = P(x, y, z);
  const ly = sy - up * clamp(p * 1.4);
  g.save(); g.strokeStyle = ink; g.lineWidth = 2.5; g.fillStyle = ground;
  g.beginPath(); g.arc(sx, sy, 8, 0, Math.PI * 2); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(sx, sy - 8); g.lineTo(sx, ly); g.lineTo(sx + side * 50 * clamp(p * 2 - 0.6), ly); g.stroke();
  g.restore();
  const a = clamp(p * 2 - 1);
  if (a <= 0) return;
  const tx = sx + side * 62;
  const halo = (s, yy, size, weight, font, color) => {
    g.save(); g.font = `${weight} ${size}px ${font}`; g.textAlign = side > 0 ? 'left' : 'right';
    g.lineWidth = 8; g.strokeStyle = ground; g.lineJoin = 'round'; g.globalAlpha = a; g.strokeText(s, tx, yy); g.fillStyle = color; g.fillText(s, tx, yy); g.restore();
  };
  halo(title, ly - 10, 30, 800, "'JetBrains Mono'", ink);
  if (value) halo(value, ly + 46, 48, 400, "'Bagel Fat One'", '#6b3fd1');
}

/** Dashed route over the board top through world points, drawn up to p */
export function route(g, P, pts, p, { color = '#241a3d', z = 0.05, dash = [10, 12], width = 4 } = {}) {
  if (p <= 0) return;
  const sp = pts.map(([a, b]) => P(a, b, z));
  const lens = [0];
  for (let i = 1; i < sp.length; i++) lens.push(lens[i - 1] + Math.hypot(sp[i][0] - sp[i - 1][0], sp[i][1] - sp[i - 1][1]));
  const target = lens[lens.length - 1] * clamp(p);
  g.save(); g.strokeStyle = color; g.lineWidth = width; g.setLineDash(dash); g.lineCap = 'round';
  g.beginPath(); g.moveTo(...sp[0]);
  let tip = sp[0];
  for (let i = 1; i < sp.length; i++) {
    if (lens[i] <= target) { g.lineTo(...sp[i]); tip = sp[i]; } else { const k = (target - lens[i - 1]) / (lens[i] - lens[i - 1]); tip = [lerp(sp[i - 1][0], sp[i][0], k), lerp(sp[i - 1][1], sp[i][1], k)]; g.lineTo(...tip); break; }
  }
  g.stroke(); g.restore();
  return tip;
}

/** A little city: a cluster of buildings with varied heights */
export function city(q, x, y, n, base, { seed = 1, spread = 3, maxH = 2.5 } = {}) {
  const r = rand(seed);
  for (let i = 0; i < n; i++) {
    const bx = x + (r() - 0.5) * spread * 2, by = y + (r() - 0.5) * spread * 2, h = 0.4 + r() * maxH, s = 0.45 + r() * 0.4;
    q.box(bx, by, 0, s, s, h, base);
  }
}

/** A data hall: low long block with rows of racks on top and blinking lights */
export function dataHall(q, x, y, w, d, t, { base = '#8f9ab8', light = '#76b900' } = {}) {
  q.box(x, y, 0, w, d, 0.5, base);
  for (let i = 0; i < Math.floor(w / 0.6); i++) {
    q.box(x + 0.15 + i * 0.6, y + 0.2, 0.5, 0.35, d - 0.4, 0.5, '#3a3550');
    q.add(x + 0.15 + i * 0.6 + y + d + 1.2, (g) => {
      if (Math.floor(t * 4 + i) % 3 === 0) { g.fillStyle = light; const [sx, sy] = q.P(x + 0.32 + i * 0.6, y + 0.4, 1.05); g.beginPath(); g.arc(sx, sy, 3.5, 0, Math.PI * 2); g.fill(); }
    });
  }
}
