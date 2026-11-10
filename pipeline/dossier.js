// "The Case File": Toppled Giants house style.
// A printed investigation file: cream paper, halftone dots, misregistered headlines,
// rubber stamps, a caption bar, case-file HUD, and an evidence board with pinned prints.
// Grammar adapted from the Halftone Dossier and Briefing Board style guides (lemo-opuscar, MIT).

import { W, H, clamp, lerp, rand, text } from './engine.js';
import { ez, span, img } from './motion.js';
import { spring } from './lightui.js';

export const DS = {
  paper: '#f4ecdc', paperDark: '#e9dec8', ink: '#241a3d', purple: '#6b3fd1', yellow: '#ffc93c',
  red: '#e2412e', teal: '#1f9e8f', pink: '#ff7aa8', muted: '#7b7290',
  SERIF: "'Roboto Slab'", FAT: "'Bagel Fat One'", MONO: "'JetBrains Mono'", HAND: "'Permanent Marker'", SANS: 'Inter',
};

// ---------------------------------------------------------------- paper
let paperTex = null;
function paperTexture() {
  if (paperTex) return paperTex;
  const c = new OffscreenCanvas(W, H), g = c.getContext('2d');
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H);
  // low-frequency mottling: a small noise tile scaled up
  const small = new OffscreenCanvas(48, 27), sg = small.getContext('2d'), r = rand(11);
  const id = sg.createImageData(48, 27);
  for (let i = 0; i < id.data.length; i += 4) { const v = 236 + r() * 19; id.data[i] = v; id.data[i + 1] = v - 3; id.data[i + 2] = v - 10; id.data[i + 3] = 255; }
  sg.putImageData(id, 0, 0);
  g.imageSmoothingQuality = 'high'; g.drawImage(small, 0, 0, W, H);
  // fine grain
  const fine = g.getImageData(0, 0, W, H);
  for (let i = 0; i < fine.data.length; i += 4) { const n = (r() - 0.5) * 14; fine.data[i] += n; fine.data[i + 1] += n; fine.data[i + 2] += n - 2; }
  g.putImageData(fine, 0, 0);
  // centre fold + vignette
  const fold = g.createLinearGradient(W / 2 - 40, 0, W / 2 + 40, 0);
  fold.addColorStop(0, 'rgba(0,0,0,0)'); fold.addColorStop(0.5, 'rgba(90,70,40,0.10)'); fold.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = fold; g.fillRect(W / 2 - 40, 0, 80, H);
  const v = g.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 1.05);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(80,60,30,0.28)');
  g.fillStyle = v; g.fillRect(0, 0, W, H);
  paperTex = c;
  return c;
}

/** Fill the page with paper colour (call first) */
export function page(g, color = DS.paper) {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = color; g.fillRect(0, 0, W, H);
  g.restore();
}

/** Final print finish: paper multiplied over everything, plus dust (engine look.paper) */
export function paperFinish(ctx, frame) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'multiply';
  ctx.drawImage(paperTexture(), 0, 0);
  ctx.globalCompositeOperation = 'source-over';
  const r = rand(Math.floor(frame / 2) * 7 + 1);
  for (let i = 0; i < 160; i++) {
    const ink = r() < 0.2;
    ctx.fillStyle = ink ? 'rgba(36,26,61,0.35)' : 'rgba(250,244,230,0.7)';
    ctx.fillRect(r() * W, r() * H, 1 + r() * 2, 1 + r() * 2);
  }
  ctx.restore();
}

// ---------------------------------------------------------------- halftone
/**
 * Halftone dots over a rect. density(x, y) → 0..1 (dot size). Screen angle in degrees.
 */
export function halftone(g, [x0, y0, w, h], density, { step = 22, angle = 15, color = DS.purple, k = 0.68, alpha = 1 } = {}) {
  const a = (angle * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
  const cx = x0 + w / 2, cy = y0 + h / 2, R = Math.hypot(w, h) / 2 + step;
  g.save(); g.globalAlpha *= alpha; g.fillStyle = color;
  g.beginPath(); g.rect(x0, y0, w, h); g.clip();
  g.beginPath();
  for (let u = -R; u <= R; u += step) {
    for (let v = -R; v <= R; v += step) {
      const px = cx + u * ca - v * sa, py = cy + u * sa + v * ca;
      if (px < x0 - step || px > x0 + w + step || py < y0 - step || py > y0 + h + step) continue;
      const d = clamp(density(px, py));
      if (d < 0.03) continue;
      const rr = d * step * k;
      g.moveTo(px + rr, py); g.arc(px, py, rr, 0, Math.PI * 2);
    }
  }
  g.fill();
  g.restore();
}
export const radial = (cx, cy, r, inner = 1) => (x, y) => inner * (1 - Math.hypot(x - cx, y - cy) / r);
export const ramp = (y0, y1, a = 1, b = 0) => (x, y) => lerp(a, b, clamp((y - y0) / (y1 - y0)));

/** A photo printed as halftone: luminance sampled once per key/size, then drawn as dots */
const htCache = new Map();
export function halftonePhoto(g, key, x, y, w, h, { step = 9, color = DS.ink, bg = '#fbf6ea', angle = 45, reveal = 1, zoom = 1, contrast = 1.25 } = {}) {
  const im = img(key);
  const id = `${key}|${w}|${h}|${step}|${zoom}`;
  if (!htCache.has(id) && im) {
    const c = new OffscreenCanvas(Math.ceil(w / step) + 2, Math.ceil(h / step) + 2), cg = c.getContext('2d');
    const s = Math.max(w / im.width, h / im.height) * zoom;
    cg.filter = `grayscale(1) contrast(${contrast})`;
    cg.drawImage(im, (w - im.width * s) / 2 / step, (h - im.height * s) / 2 / step, (im.width * s) / step, (im.height * s) / step);
    htCache.set(id, { data: cg.getImageData(0, 0, c.width, c.height), cw: c.width });
  }
  g.save();
  g.fillStyle = bg; g.fillRect(x, y, w, h);
  const cache = htCache.get(id);
  if (cache) {
    const { data, cw } = cache;
    g.beginPath(); g.rect(x, y, w, h); g.clip();
    g.fillStyle = color;
    g.beginPath();
    const a = (angle * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
    const cx = x + w / 2, cy = y + h / 2, R = Math.hypot(w, h) / 2 + step;
    for (let u = -R; u <= R; u += step) for (let v = -R; v <= R; v += step) {
      const px = cx + u * ca - v * sa, py = cy + u * sa + v * ca;
      if (px < x || px > x + w || py < y || py > y + h) continue;
      if (reveal < 1 && (py - y) / h > reveal) continue;
      const gx = Math.floor((px - x) / step), gy = Math.floor((py - y) / step);
      const lum = data.data[(gy * cw + gx) * 4] / 255;
      const d = 1 - lum;
      if (d < 0.06) continue;
      const rr = Math.sqrt(d) * step * 0.62;
      g.moveTo(px + rr, py); g.arc(px, py, rr, 0, Math.PI * 2);
    }
    g.fill();
  }
  g.restore();
}

// ---------------------------------------------------------------- type
/** Headline: black slab serif, glyphs pop in one by one, with a misregistered purple shadow */
export function headline(g, t, at, str, x, y, { size = 120, color = DS.ink, shadow = DS.purple, align = 'left', stagger = 0.045 } = {}) {
  g.save();
  g.font = `900 ${size}px ${DS.SERIF}`;
  const chars = [...str], ws = chars.map((c) => g.measureText(c).width);
  const total = ws.reduce((a, b) => a + b, 0);
  let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  chars.forEach((c, i) => {
    const p = spring(t, at + i * stagger, { freq: 2.2, damp: 0.55 });
    if (p > 0.01) {
      const dy = (1 - Math.min(1, p)) * -70, sq = 1 + (p - 1) * 0.6;
      g.save(); g.translate(cx + ws[i] / 2, y + dy); g.scale(1 / Math.max(0.6, sq), Math.max(0.6, sq));
      g.globalAlpha = Math.min(1, p * 2);
      g.globalCompositeOperation = 'multiply';
      text(g, c, 8, 8, { font: DS.SERIF, weight: 900, size, color: shadow, align: 'center' });
      g.globalCompositeOperation = 'source-over';
      text(g, c, 0, 0, { font: DS.SERIF, weight: 900, size, color, align: 'center' });
      g.restore();
    }
    cx += ws[i];
  });
  g.restore();
  return total;
}

/** Big chunky numeral/word in the fat display face, halftone-overprinted */
export function fatText(g, t, at, str, x, y, { size = 200, color = DS.yellow, ink = DS.ink, align = 'left' } = {}) {
  const p = spring(t, at, { freq: 1.8, damp: 0.55 });
  if (p <= 0.01) return;
  g.save(); g.translate(x, y); g.scale(lerp(0.6, 1, Math.min(1, p)), lerp(0.6, 1, Math.min(1, p)));
  g.font = `${size}px ${DS.FAT}`;
  const w = g.measureText(str).width, ox = align === 'center' ? -w / 2 : align === 'right' ? -w : 0;
  g.lineJoin = 'round'; g.lineWidth = size * 0.07; g.strokeStyle = ink;
  g.fillStyle = DS.purple; g.fillText(str, ox + 10, 10);
  g.fillStyle = color; g.fillText(str, ox, 0); g.strokeText(str, ox, 0);
  g.restore();
}

/** Caption bar: dark pill with an offset purple shadow; keyword in yellow */
export function captionBar(g, t, at, str, keyword, cx, y, { size = 38 } = {}) {
  const p = spring(t, at, { freq: 1.8, damp: 0.6 });
  if (p <= 0.01) return;
  g.save();
  g.font = `800 ${size}px ${DS.SANS}`;
  const w = g.measureText(str).width + 70, h = size * 1.9;
  g.translate(cx, y); g.scale(Math.min(1.05, p), Math.min(1.05, p));
  g.fillStyle = DS.purple; g.beginPath(); g.roundRect(-w / 2 + 8, -h / 2 + 8, w, h, h / 2); g.fill();
  g.fillStyle = DS.ink; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, h / 2); g.fill();
  let x = -w / 2 + 35;
  const parts = keyword && str.includes(keyword) ? [str.slice(0, str.indexOf(keyword)), keyword, str.slice(str.indexOf(keyword) + keyword.length)] : [str];
  parts.forEach((pt, i) => {
    text(g, pt, x, size * 0.36, { font: DS.SANS, weight: 800, size, color: i === 1 ? DS.yellow : DS.paper });
    g.font = `800 ${size}px ${DS.SANS}`; x += g.measureText(pt).width;
  });
  g.restore();
}

/** Rubber stamp that slams in (≈0.09 s from 2.6×), rough inky edges */
export function stamp(g, t, at, str, x, y, { color = DS.red, size = 90, rot = -0.12 } = {}) {
  const sp = clamp((t - (at - 0.09)) / 0.09);
  if (sp <= 0) return;
  const b = t > at ? Math.exp(-(t - at) * 9) * Math.sin((t - at) * 40) * 0.04 : 0;
  g.save(); g.translate(x, y); g.rotate(rot);
  const sc = lerp(2.6, 1, ez.p3In(sp)) + b;
  g.scale(sc, sc); g.globalAlpha = 0.93 * sp;
  g.font = `900 ${size}px ${DS.SERIF}`;
  const w = g.measureText(str).width + size * 0.9, h = size * 1.5;
  g.strokeStyle = color; g.lineWidth = size * 0.09;
  g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, size * 0.2); g.stroke();
  g.lineWidth = size * 0.03; g.beginPath(); g.roundRect(-w / 2 + size * 0.14, -h / 2 + size * 0.14, w - size * 0.28, h - size * 0.28, size * 0.12); g.stroke();
  text(g, str, 0, size * 0.36, { font: DS.SERIF, weight: 900, size, color, align: 'center', spacing: size * 0.04 });
  // ink grain: knock out paper-coloured specks
  const r = rand(str.length * 13);
  g.fillStyle = DS.paper;
  for (let i = 0; i < 140; i++) g.fillRect(-w / 2 + r() * w, -h / 2 + r() * h, 2 + r() * 4, 1 + r() * 3);
  g.restore();
}

/** Case-file HUD: case number + chapter chip top-left; REC dot + date top-right */
export function hud(g, t, { caseNo = 'CASE TG-002', chapter = '', date = '', dark = false } = {}) {
  const fg = dark ? DS.paper : DS.ink;
  text(g, caseNo, 60, 74, { font: DS.MONO, weight: 800, size: 26, color: fg, spacing: 2 });
  if (chapter) {
    g.font = `800 22px ${DS.MONO}`;
    const w = g.measureText(chapter).width + chapter.length * 1 + 34;
    g.fillStyle = dark ? DS.paper : DS.ink; g.beginPath(); g.roundRect(60, 92, w, 38, 8); g.fill();
    text(g, chapter, 75, 119, { font: DS.MONO, weight: 800, size: 22, color: dark ? DS.ink : DS.yellow, spacing: 1 });
  }
  if (date) {
    g.font = `800 26px ${DS.MONO}`;
    const w = g.measureText(date).width + 70;
    g.strokeStyle = fg; g.lineWidth = 3; g.beginPath(); g.roundRect(W - 60 - w, 44, w, 48, 12); g.stroke();
    if (Math.floor(t * 2) % 2 === 0) { g.fillStyle = DS.red; g.beginPath(); g.arc(W - 60 - w + 26, 68, 9, 0, Math.PI * 2); g.fill(); }
    text(g, date, W - 60 - w + 46, 78, { font: DS.MONO, weight: 800, size: 26, color: fg });
  }
}

/** A folder tab label (exhibit) */
export function tab(g, t, at, label, x, y, { color = DS.yellow } = {}) {
  const p = spring(t, at, { freq: 1.8, damp: 0.65 });
  if (p <= 0.01) return;
  g.save(); g.translate(x, y + (1 - Math.min(1, p)) * 60);
  g.font = `800 30px ${DS.MONO}`;
  const w = g.measureText(label).width + 50;
  g.fillStyle = color; g.strokeStyle = DS.ink; g.lineWidth = 5;
  g.beginPath(); g.moveTo(0, 54); g.lineTo(14, 0); g.lineTo(w - 14, 0); g.lineTo(w, 54); g.closePath(); g.fill(); g.stroke();
  text(g, label, w / 2, 38, { font: DS.MONO, weight: 800, size: 30, color: DS.ink, align: 'center' });
  g.restore();
}

/** Callout: a stat with a leader line from a point */
export function callout(g, t, at, [px, py], [tx, ty], big, small, { color = DS.ink, bigColor = DS.purple, align = 'left' } = {}) {
  const p = ease2(t, at, 0.45);
  if (p <= 0) return;
  g.save();
  g.strokeStyle = color; g.lineWidth = 3;
  g.beginPath(); g.arc(px, py, 9, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.moveTo(px, py); g.lineTo(lerp(px, tx, p), lerp(py, ty, p)); g.stroke();
  g.restore();
  if (p > 0.6) {
    fatText(g, t, at + 0.25, big, tx + (align === 'left' ? 16 : -16), ty + 10, { size: 74, color: bigColor === DS.purple ? DS.yellow : bigColor, align });
    text(g, small, tx + (align === 'left' ? 18 : -18), ty + 56, { font: DS.MONO, weight: 800, size: 24, color, align, alpha: clamp((t - at - 0.4) * 3) });
  }
}
const ease2 = (t, at, d) => ez.expoOut(span(t, at, d));

// ---------------------------------------------------------------- evidence board
/** A whiteboard wall: enamel, ghosts of old marker, a frame and tray */
export function board(g, t) {
  const gr = g.createLinearGradient(0, 0, W, H);
  gr.addColorStop(0, '#fbfaf6'); gr.addColorStop(1, '#efece4');
  g.fillStyle = '#d8d2c6'; g.fillRect(-200, -200, W + 400, H + 400);
  g.fillStyle = gr; g.fillRect(40, 30, W - 80, H - 90);
  const r = rand(3);
  g.strokeStyle = 'rgba(80,80,110,0.05)'; g.lineWidth = 6; g.lineCap = 'round';
  for (let i = 0; i < 18; i++) { g.beginPath(); const x = 80 + r() * (W - 200), y = 80 + r() * (H - 250); g.moveTo(x, y); g.bezierCurveTo(x + 60, y - 30, x + 120, y + 30, x + 180 + r() * 120, y + r() * 40); g.stroke(); }
  const refl = ((t * 0.03) % 1.6) - 0.3;
  const rg = g.createLinearGradient(refl * W, 0, refl * W + 400, H);
  rg.addColorStop(0, 'rgba(255,255,255,0)'); rg.addColorStop(0.5, 'rgba(255,255,255,0.35)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = rg; g.fillRect(40, 30, W - 80, H - 90);
  g.strokeStyle = '#b9b3a7'; g.lineWidth = 16; g.strokeRect(40, 30, W - 80, H - 90);
  g.fillStyle = '#c9c3b7'; g.fillRect(20, H - 64, W - 40, 30);
  [[300, DS.ink], [380, DS.purple], [460, DS.red]].forEach(([x, c]) => { g.fillStyle = c; g.beginPath(); g.roundRect(x, H - 58, 64, 14, 7); g.fill(); });
}

/** A pinned print (halftone photo or a card) landing on the board with a shadow and a magnet */
export function pinned(g, t, at, x, y, w, h, { key = null, rot = 0, magnet = DS.ink, label = '', content = null, halftoneIt = true } = {}) {
  const p = spring(t, at, { freq: 1.6, damp: 0.6 });
  if (p <= 0.01) return;
  const lift = Math.max(0, 1 - p) * 30;
  g.save(); g.translate(x, y - lift); g.rotate(rot); g.scale(lerp(1.15, 1, Math.min(1, p)), lerp(1.15, 1, Math.min(1, p)));
  g.shadowColor = 'rgba(40,30,60,0.28)'; g.shadowBlur = 18 + lift; g.shadowOffsetX = 6 + lift * 0.3; g.shadowOffsetY = 10 + lift * 0.4;
  g.fillStyle = '#fffdf7'; g.fillRect(-w / 2 - 12, -h / 2 - 12, w + 24, h + 24 + (label ? 50 : 0));
  g.shadowColor = 'transparent';
  if (key && halftoneIt) halftonePhoto(g, key, -w / 2, -h / 2, w, h, { step: 7 });
  else if (key) { const im = img(key); if (im) { const s = Math.max(w / im.width, h / im.height); g.save(); g.beginPath(); g.rect(-w / 2, -h / 2, w, h); g.clip(); g.filter = 'saturate(0.7) contrast(1.05)'; g.drawImage(im, -im.width * s / 2, -im.height * s / 2, im.width * s, im.height * s); g.restore(); } }
  if (content) content(g, w, h);
  if (label) text(g, label, 0, h / 2 + 42, { font: DS.MONO, weight: 800, size: 24, color: DS.ink, align: 'center' });
  if (magnet) { g.fillStyle = magnet; g.beginPath(); g.arc(0, -h / 2 - 4, 13, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(255,255,255,0.5)'; g.beginPath(); g.arc(-4, -h / 2 - 8, 4, 0, Math.PI * 2); g.fill(); }
  g.restore();
}

/** A marker line that draws itself, with a wet tip */
export function marker(g, t, at, pts, { color = DS.red, width = 6, dur = 0.7, dash = null } = {}) {
  const p = ez.p2InOut(span(t, at, dur));
  if (p <= 0) return;
  const lens = [0];
  for (let i = 1; i < pts.length; i++) lens.push(lens[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const target = lens[lens.length - 1] * p;
  g.save(); g.strokeStyle = color; g.lineWidth = width; g.lineCap = 'round'; g.lineJoin = 'round'; g.globalAlpha = 0.9;
  if (dash) g.setLineDash(dash);
  g.beginPath(); g.moveTo(...pts[0]);
  let tip = pts[0];
  for (let i = 1; i < pts.length; i++) {
    if (lens[i] <= target) { g.lineTo(...pts[i]); tip = pts[i]; } else { const k = (target - lens[i - 1]) / (lens[i] - lens[i - 1]); tip = [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]; g.lineTo(...tip); break; }
  }
  g.stroke(); g.restore();
}

/** Hand-drawn circle in marker, drawn clockwise */
export function ring(g, t, at, cx, cy, rx, ry, { color = DS.red, width = 6, seed = 2 } = {}) {
  const p = ez.expoOut(span(t, at, 0.5));
  if (p <= 0) return;
  const r = rand(seed), w1 = r() * 0.06, w2 = r() * 0.05;
  g.save(); g.strokeStyle = color; g.lineWidth = width; g.lineCap = 'round'; g.globalAlpha = 0.9;
  g.beginPath();
  const n = Math.floor(90 * p);
  for (let i = 0; i <= n; i++) { const a = -2 + (i / 90) * Math.PI * 2.15, k = 1 + w1 * Math.sin(a * 2) + w2 * Math.cos(a * 3); const x = cx + Math.cos(a) * rx * k, y = cy + Math.sin(a) * ry * k; i ? g.lineTo(x, y) : g.moveTo(x, y); }
  g.stroke(); g.restore();
}

/** Marker lettering, revealed letter by letter with jitter */
export function scrawl(g, t, at, str, x, y, { size = 48, color = DS.ink, cps = 22, align = 'left' } = {}) {
  const n = Math.floor(Math.max(0, t - at) * cps);
  if (n <= 0) return;
  text(g, str.slice(0, n), x, y, { font: DS.HAND, size, color, align });
}
