// Documentary ("Netflix") shot types: restraint, atmosphere, shallow focus, elegant type.
// Loaded by an episode's scenes.js together with `export const look = { cinema: true }`.
//
//   still      photo with slow dolly, shallow-focus bands, drifting dust and a light leak
//   macro      lamp-lit document close-up; one row sharp, the rest out of focus
//   screen     a trading screen glowing in a dark room; the line falls at `drop`
//   lights     points of warm light (people, homes); some go dark at `out`
//   statement  one quiet line of serif type
//   reveal     a word revealed with a light sweep; can change into another word
//   titlecard  the series title
// Overlay on any shot: super: { text: 'HYDERABAD, INDIA', sub: '7 January 2009', when }

import { W, H, clamp, lerp, rand, text, typed } from './engine.js';
import { C, paperFill } from './collage.js';
import { view, drawLand } from './map.js';
import { ez, span, photo, img, kinetic } from './motion.js';
import { addShotTypes, landing, when } from './shots.js';

const BAR = Math.round((H - W / 2.39) / 2); // letterbox height
const INK = '#efe7d8';
const SERIF = 'Cormorant Garamond';
// created on first use (this file is also imported by Node, which has no canvas)
let _tmp, _small;
const canvases = () => {
  if (!_tmp) { _tmp = new OffscreenCanvas(W, H); _small = new OffscreenCanvas(W / 2, H / 2); }
  return { tmp: _tmp, small: _small };
};

/** Floating dust caught in light */
function dust(ctx, t, { count = 70, seed = 9, alpha = 0.5, beam = null } = {}) {
  const r = rand(seed);
  ctx.save();
  for (let i = 0; i < count; i++) {
    const x0 = r() * W, y0 = r() * H, sp = 6 + r() * 18, ph = r() * 10, sz = 0.8 + r() * 2.6;
    const x = (x0 + Math.sin(t * 0.3 + ph) * 30 + t * sp * 0.6) % W;
    const y = (y0 - t * sp * 0.4 + H * 10) % H;
    let a = alpha * (0.3 + 0.7 * Math.abs(Math.sin(t * 0.7 + ph)));
    if (beam) a *= clamp(1 - Math.abs(x - beam.x - (y - beam.y) * beam.k) / beam.w);
    ctx.fillStyle = `rgba(255,236,200,${a})`;
    ctx.beginPath(); ctx.arc(x, y, sz, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

/** Slow drifting warm light leak */
function leak(ctx, t, strength = 0.18) {
  const x = W * (0.85 + Math.sin(t * 0.13) * 0.15), y = H * (0.2 + Math.cos(t * 0.11) * 0.1);
  const g = ctx.createRadialGradient(x, y, 0, x, y, W * 0.6);
  g.addColorStop(0, `rgba(255,150,70,${strength})`);
  g.addColorStop(1, 'rgba(255,150,70,0)');
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

/** Blur the top and bottom of what is already drawn (shallow depth of field) */
function focusBands(ctx, amount = 10, keep = [0.38, 0.62]) {
  const { tmp, small } = canvases();
  const s = small.getContext('2d');
  s.filter = `blur(${amount / 2}px)`;
  s.drawImage(ctx.canvas, 0, 0, W / 2, H / 2);
  s.filter = 'none';
  const t = tmp.getContext('2d');
  t.globalCompositeOperation = 'source-over';
  t.clearRect(0, 0, W, H);
  t.drawImage(small, 0, 0, W, H);
  t.globalCompositeOperation = 'destination-in';
  const g = t.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, 'rgba(0,0,0,1)');
  g.addColorStop(keep[0], 'rgba(0,0,0,0)');
  g.addColorStop(keep[1], 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,1)');
  t.fillStyle = g;
  t.fillRect(0, 0, W, H);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(tmp, 0, 0);
  ctx.restore();
}

/** A word that is revealed by a band of light sweeping across it */
function sweepText(ctx, str, x, y, p, { size = 180, font = SERIF, weight = 600, spacing = 0.3, color = INK, alpha = 1 } = {}) {
  if (alpha <= 0) return;
  const { tmp } = canvases();
  const t2 = tmp.getContext('2d');
  t2.globalCompositeOperation = 'source-over';
  t2.clearRect(0, 0, W, H);
  t2.font = `${weight} ${size}px '${font}'`;
  t2.letterSpacing = `${size * spacing}px`;
  t2.textAlign = 'center';
  t2.fillStyle = color;
  t2.fillText(str, x, y);
  // reveal mask: soft edge moving left → right
  t2.globalCompositeOperation = 'destination-in';
  const edge = lerp(-0.2, 1.2, p) * W;
  const m = t2.createLinearGradient(edge - 300, 0, edge + 60, 0);
  m.addColorStop(0, 'rgba(0,0,0,1)');
  m.addColorStop(1, 'rgba(0,0,0,0)');
  t2.fillStyle = m;
  t2.fillRect(0, 0, W, H);
  // the light itself, on top of the letters
  t2.globalCompositeOperation = 'source-atop';
  const s = t2.createLinearGradient(edge - 220, 0, edge + 40, 0);
  s.addColorStop(0, 'rgba(255,240,210,0)');
  s.addColorStop(0.8, 'rgba(255,240,210,0.9)');
  s.addColorStop(1, 'rgba(255,240,210,0)');
  t2.fillStyle = s;
  t2.fillRect(0, 0, W, H);
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.drawImage(tmp, 0, 0);
  ctx.restore();
}

const C2 = {};

C2.still = (ctx, sh, x) => {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
  photo(ctx, sh.img, x.p, { zoom: sh.zoom || [1.08, 1.17], pan: sh.pan || [[0.01, 0.005], [-0.01, -0.005]], grade: sh.grade || 'cold', darken: sh.darken ?? 0.42 });
  if (sh.dof !== false) focusBands(ctx, sh.dof || 12, sh.keep || [0.3, 0.7]);
  if (sh.leak !== false) leak(ctx, x.t, 0.16);
  dust(ctx, x.t, { count: 40, alpha: 0.35, seed: 3 });
  if (sh.line) kinetic(ctx, x.t, landing(x.words, sh.line, x.a, x.b), W / 2, H - BAR - 120, { size: 64, font: SERIF, weight: 500, color: INK, spacing: 0.01, out: x.b - 0.2 });
};

C2.statement = (ctx, sh, x) => {
  ctx.fillStyle = '#050607';
  ctx.fillRect(0, 0, W, H);
  if (sh.img) photo(ctx, sh.img, x.p, { zoom: [1.2, 1.28], grade: 'bw', darken: 0.8, blur: 10, alpha: 0.6 });
  dust(ctx, x.t, { count: 30, alpha: 0.25, seed: 5 });
  const lines = sh.text.split('|');
  lines.forEach((ln, i) => kinetic(ctx, x.t, landing(x.words, ln, x.a, x.b), W / 2, H / 2 + 20 + (i - (lines.length - 1) / 2) * (sh.size || 84) * 1.2,
    { size: sh.size || 84, font: SERIF, weight: 500, color: INK, spacing: 0.01, out: x.b - 0.25, lead: 0.02 }));
};

C2.macro = (ctx, sh, x) => {
  // warm desk, lamp-lit page; the camera slides slowly along the focus row
  ctx.fillStyle = '#0b0806';
  ctx.fillRect(0, 0, W, H);
  const rows = sh.rows;
  const fAt = (sh.focus || []).map((f) => ({ row: f.row, at: f.when != null ? when(x.words, f.when, x.a) : x.a }));
  let focus = fAt.length ? fAt[0].row : 0;
  for (let i = 1; i < fAt.length; i++) focus = lerp(focus, fAt[i].row, ez.p2InOut(span(x.t, fAt[i].at - 0.3, 0.8)));
  const rowH = sh.rowH || 120;
  const camY = focus * rowH;
  ctx.save();
  ctx.translate(W / 2 + lerp(40, -40, x.p), H / 2);
  ctx.rotate(-0.06);
  const z = lerp(1.0, 1.06, x.p);
  ctx.scale(z, z);
  ctx.translate(-W / 2, -camY - 40);
  // page
  ctx.fillStyle = paperFill(ctx, '#e9dfc9');
  ctx.fillRect(-400, -1200, W + 800, 3200);
  // lamp light pool, falling off into darkness
  const lamp = ctx.createRadialGradient(W * 0.5, camY - 40, 40, W * 0.5, camY - 40, W * 0.62);
  lamp.addColorStop(0, 'rgba(255,180,100,0.16)');
  lamp.addColorStop(0.35, 'rgba(20,10,0,0.3)');
  lamp.addColorStop(0.75, 'rgba(0,0,0,0.85)');
  lamp.addColorStop(1, 'rgba(0,0,0,0.97)');
  ctx.fillStyle = lamp;
  ctx.fillRect(-400, camY - 1400, W + 800, 2800);
  rows.forEach((row, i) => {
    const y = i * rowH;
    const blur = Math.min(14, Math.abs(i - focus) * 5.5);
    const at = row.when != null ? when(x.words, row.when, x.a) : x.a - 1;
    const shown = row.typed ? typed(row.text, span(x.t, at, row.typing || 2.2)) : (x.t >= at - 0.2 ? row.text : '');
    if (!shown) return;
    ctx.save();
    ctx.filter = blur > 0.4 ? `blur(${blur}px)` : 'none';
    let vanish = 0;
    if (row.vanish) vanish = span(x.t, when(x.words, row.vanish, x.a), 1.6);
    text(ctx, shown, 260, y, { font: 'Special Elite', size: row.size || 64, color: '#1d1a16', alpha: row.dim ? 0.55 : 1 });
    if (row.amount) {
      // the amount can dissolve away ("didn't exist")
      ctx.filter = blur + vanish * 18 > 0.4 ? `blur(${blur + vanish * 18}px)` : 'none';
      text(ctx, row.amount, W - 200, y, { font: 'Special Elite', size: row.size || 64, color: '#1d1a16', align: 'right', alpha: (1 - ez.p3In(vanish)) * (x.t >= at + (row.amountDelay ?? 0.8) ? 1 : 0) });
    }
    ctx.restore();
    if (row.underline) {
      const u = span(x.t, when(x.words, row.underline, x.a), 0.6);
      if (u > 0) {
        ctx.strokeStyle = 'rgba(170,30,25,0.85)';
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(250, y + 18); ctx.lineTo(250 + (W - 430) * ez.expoOut(u), y + 14); ctx.stroke();
      }
    }
  });
  ctx.restore();
  dust(ctx, x.t, { count: 60, alpha: 0.5, seed: 12, beam: { x: W * 0.35, y: 0, k: 0.5, w: 380 } });
};

C2.screen = (ctx, sh, x) => {
  // a monitor glowing in a dark trading room
  ctx.fillStyle = '#030507';
  ctx.fillRect(0, 0, W, H);
  const dropAt = sh.drop ? when(x.words, sh.drop, x.a) : x.b;
  const crashP = ez.expoOut(span(x.t, dropAt - 0.1, 1.6));
  const flicker = x.t > dropAt && x.t < dropAt + 0.25 ? 0.6 + 0.4 * Math.sin(x.t * 120) : 1;
  ctx.save();
  const z = lerp(1.0, 1.12, ez.p2InOut(x.p));
  ctx.translate(W / 2, H / 2);
  ctx.scale(z, z);
  ctx.transform(1, -0.035, 0.06, 1, 0, 0);
  const sw = 1300, shh = 720;
  // glow spilling into the room
  const glowCol = crashP > 0.1 ? '255,70,50' : '80,200,140';
  const gl = ctx.createRadialGradient(0, 0, 100, 0, 0, 1100);
  gl.addColorStop(0, `rgba(${glowCol},${0.22 * flicker})`);
  gl.addColorStop(1, `rgba(${glowCol},0)`);
  ctx.fillStyle = gl;
  ctx.fillRect(-1600, -1000, 3200, 2000);
  // bezel + screen
  ctx.fillStyle = '#0c0d0f';
  ctx.fillRect(-sw / 2 - 30, -shh / 2 - 30, sw + 60, shh + 60);
  ctx.fillStyle = '#04110b';
  ctx.fillRect(-sw / 2, -shh / 2, sw, shh);
  ctx.globalAlpha = flicker;
  // header
  text(ctx, sh.ticker || 'SATYAM', -sw / 2 + 50, -shh / 2 + 80, { font: 'Inter', weight: 600, size: 44, color: '#9fe8c0', spacing: 6 });
  text(ctx, sh.market || 'NSE', -sw / 2 + 50, -shh / 2 + 130, { font: 'Inter', weight: 300, size: 30, color: '#5f9c80', spacing: 8 });
  const from = sh.from ?? 179, to = sh.to ?? 40;
  const price = lerp(from, to, crashP);
  const col = crashP > 0.05 ? '#ff5544' : '#9fe8c0';
  text(ctx, price.toFixed(2), sw / 2 - 50, -shh / 2 + 95, { font: 'Inter', weight: 300, size: 76, color: col, align: 'right' });
  if (crashP > 0.05) text(ctx, `${(((price - from) / from) * 100).toFixed(1)}%`, sw / 2 - 50, -shh / 2 + 150, { font: 'Inter', weight: 300, size: 40, color: col, align: 'right' });
  // chart
  const r = rand(4);
  const N = 140, cx0 = -sw / 2 + 50, cx1 = sw / 2 - 50, base = shh / 2 - 60, top = -shh / 2 + 200;
  const Y = (v) => lerp(base, top, (v - 20) / 180);
  const pre = 0.62;
  const prog = lerp(0.3, pre, span(x.t, x.a, Math.max(0.5, dropAt - x.a))) + (1 - pre) * crashP;
  ctx.beginPath();
  for (let i = 0; i <= N * prog; i++) {
    const k = i / N;
    let v = from + Math.sin(i * 0.4) * 2 + (r() - 0.5) * 3;
    if (k > pre) v = lerp(from, to, ez.expoOut((k - pre) / (1 - pre))) + (r() - 0.5) * 4;
    const px = lerp(cx0, cx1, k), py = Y(v);
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.strokeStyle = col;
  ctx.lineWidth = 4;
  ctx.shadowColor = col;
  ctx.shadowBlur = 18;
  ctx.stroke();
  ctx.shadowBlur = 0;
  // scanlines
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = '#000';
  for (let yy = -shh / 2; yy < shh / 2; yy += 4) ctx.fillRect(-sw / 2, yy, sw, 2);
  ctx.restore();
  focusBands(ctx, 10, [0.25, 0.75]);
  if (sh.line) kinetic(ctx, x.t, landing(x.words, sh.line, x.a, x.b), W / 2, H - BAR - 70, { size: 54, font: SERIF, weight: 500, color: INK, out: x.b - 0.2 });
};

C2.lights = (ctx, sh, x) => {
  ctx.fillStyle = '#030406';
  ctx.fillRect(0, 0, W, H);
  if (sh.img) photo(ctx, sh.img, x.p, { zoom: [1.3, 1.36], grade: 'bw', darken: 0.85, blur: 8, alpha: 0.5 });
  const r = rand(sh.seed || 6);
  const outAt = sh.out ? when(x.words, sh.out, x.a) : 1e9;
  const n = sh.count || 600;
  for (let i = 0; i < n; i++) {
    const px = W * 0.08 + r() * W * 0.84, py = BAR + 60 + r() * (H - 2 * BAR - 120);
    const on = span(x.t, x.a + r() * 1.6, 0.6);
    const goes = r() < (sh.share ?? 0.4);
    const off = goes ? span(x.t, outAt + r() * 2.2, 0.4) : 0;
    const flick = 0.75 + 0.25 * Math.sin(x.t * (2 + r() * 4) + i);
    const a = on * (1 - off) * flick;
    if (a <= 0.02) continue;
    const s = 1.5 + r() * 2.5;
    const g = ctx.createRadialGradient(px, py, 0, px, py, s * 6);
    g.addColorStop(0, `rgba(255,214,150,${a})`);
    g.addColorStop(1, 'rgba(255,214,150,0)');
    ctx.fillStyle = g;
    ctx.fillRect(px - s * 6, py - s * 6, s * 12, s * 12);
  }
  const at = sh.when ? when(x.words, sh.when, x.a) : x.a + 0.6;
  if (sh.figure) kinetic(ctx, x.t, [{ word: sh.figure, at }], W / 2, H / 2 + 40, { size: 200, font: 'Inter', weight: 200, color: INK, spacing: 0.04 });
  if (sh.caption) kinetic(ctx, x.t, [{ word: sh.caption, at: at + 0.3 }], W / 2, H / 2 + 120, { size: 30, font: 'Inter', weight: 300, color: '#c9bfae', spacing: 0.4 });
};

C2.night = (ctx, sh, x) => {
  const from = sh.from, to = sh.to || from;
  const fly = ez.p2InOut(span(x.t, x.a, sh.flight || Math.min(4, x.b - x.a)));
  const scale = Math.exp(lerp(Math.log(from[2]), Math.log(to[2]), fly));
  const proj = view(lerp(from[0], to[0], fly), lerp(from[1], to[1], fly), scale);
  drawLand(ctx, proj, scale, { color: '#0b0f12', sea: '#030507', stroke: 'rgba(214,170,90,0.35)', shadow: false });
  const doubt = sh.doubt ? span(x.t, when(x.words, sh.doubt, x.a), 0.8) : 0;
  (sh.hubs || []).forEach((h, i) => {
    const [hx, hy] = proj(h);
    const on = span(x.t, (sh.hubsWhen ? when(x.words, sh.hubsWhen, x.a) : x.a + 1) + i * 0.2, 0.6);
    if (on <= 0) return;
    const fl = doubt > 0 ? 0.6 + 0.4 * Math.sin(x.t * 14 + i * 3) : 1;
    const col = doubt > 0.5 ? '255,80,60' : '255,200,120';
    const rad = 90 * (1 + 0.1 * Math.sin(x.t * 2 + i));
    const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, rad);
    g.addColorStop(0, `rgba(${col},${0.85 * on * fl})`);
    g.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(hx, hy, rad, 0, Math.PI * 2); ctx.fill();
  });
  if (sh.line) kinetic(ctx, x.t, landing(x.words, sh.line, x.a, x.b), W / 2, H - BAR - 90, { size: 60, font: SERIF, weight: 500, color: INK, out: x.b - 0.2 });
};

C2.reveal = (ctx, sh, x) => {
  ctx.fillStyle = '#040506';
  ctx.fillRect(0, 0, W, H);
  if (sh.img) photo(ctx, sh.img, x.p, { zoom: [1.25, 1.32], grade: 'bw', darken: 0.85, blur: 12, alpha: 0.55 });
  dust(ctx, x.t, { count: 30, alpha: 0.25, seed: 8 });
  const at = sh.when ? when(x.words, sh.when, x.a) : x.a + 0.2;
  const thenAt = sh.then ? when(x.words, sh.then.when, at) : 1e9;
  const swap = span(x.t, thenAt - 0.2, 0.6);
  const lift = sh.under ? ez.p2InOut(span(x.t, when(x.words, sh.under.when, at) - 0.2, 0.8)) : 0;
  const y = H / 2 + 60 - lift * 90;
  ctx.save();
  if (swap > 0) ctx.filter = `blur(${swap * 14}px)`;
  sweepText(ctx, sh.word, W / 2, y, span(x.t, at - 0.2, 1.6), { size: sh.size || 190, alpha: 1 - swap });
  ctx.restore();
  if (sh.under) {
    const ua = span(x.t, when(x.words, sh.under.when, at), 0.8);
    ctx.save();
    ctx.globalAlpha = ua * (1 - swap);
    if (ua < 1) ctx.filter = `blur(${(1 - ua) * 8}px)`;
    text(ctx, sh.under.text, W / 2, y + 150, { font: sh.under.font || 'Noto Serif Devanagari', weight: 700, size: sh.under.size || 84, color: '#d9b26a', align: 'center' });
    ctx.restore();
  }
  if (swap > 0) {
    ctx.save();
    ctx.globalAlpha = swap;
    if (swap < 1) ctx.filter = `blur(${(1 - swap) * 12}px)`;
    text(ctx, sh.then.word, W / 2, H / 2 + 60, { font: SERIF, style: 'italic', weight: 500, size: sh.then.size || 200, color: sh.then.color || INK, align: 'center' });
    ctx.restore();
  }
};

C2.titlecard = (ctx, sh, x) => {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
  dust(ctx, x.t, { count: 40, alpha: 0.3, seed: 2 });
  const out = span(x.t, x.b - 0.8, 0.8);
  sweepText(ctx, sh.title, W / 2, H / 2 + 30, span(x.t, x.a + 0.1, 1.8), { size: 130, weight: 500, spacing: 0.32, alpha: 1 - out });
  kinetic(ctx, x.t, (sh.sub || '').split(' ').map((w, i) => ({ word: w, at: x.a + 1.6 + i * 0.12 })), W / 2, H / 2 + 130,
    { size: 30, font: 'Inter', weight: 300, color: '#c9bfae', spacing: 0.45, out: x.b - 0.6 });
};

/** Small tracked location/date caption, lower left, with a thin rule */
function superOverlay(ctx, sh, x) {
  if (!sh.super) return;
  const at = sh.super.when ? when(x.words, sh.super.when, x.a) : x.a + 0.5;
  const p = span(x.t, at - 0.3, 0.9);
  const out = span(x.t, x.b - 0.5, 0.35);
  if (p <= 0 || out >= 1) return;
  const y = H - BAR - 105;
  ctx.save();
  ctx.globalAlpha = (1 - out);
  ctx.strokeStyle = 'rgba(239,231,216,0.8)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(170, y - 52); ctx.lineTo(170 + 70 * ez.expoOut(p), y - 52); ctx.stroke();
  ctx.restore();
  kinetic(ctx, x.t, [{ word: sh.super.text, at }], 170, y, { size: 34, font: 'Inter', weight: 300, color: INK, spacing: 0.35, align: 'left', out: x.b - 0.5 });
  if (sh.super.sub) kinetic(ctx, x.t, [{ word: sh.super.sub, at: at + 0.35 }], 170, y + 52, { size: 30, font: SERIF, weight: 500, color: '#c9bfae', align: 'left', out: x.b - 0.5 });
}

addShotTypes(C2, superOverlay);
export const cinemaTypes = Object.keys(C2);
