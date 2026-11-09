// Shot library: an episode's visuals written as data instead of drawing code.
//
// Each narration scene gets a list of shots. A shot starts when the narrator says its `at`
// phrase and lasts until the next shot. Text in a shot lands word by word as it is spoken.
//
//   founding: [
//     { type: 'map', to: [78.49, 17.39, 26], pins: [{ at: [78.49, 17.39], label: 'HYDERABAD', when: 'Hyderabad' }] },
//     { at: 'A businessman', type: 'profile', name: 'B. RAMALINGA RAJU', role: 'founder' },
//     { at: 'They call it', type: 'kinetic', text: 'SATYAM *COMPUTER SERVICES', stamp: { text: 'EST. 1987', when: 'Satyam' } },
//   ]
//
// `*WORD` in any text = accent colour. `when` = a phrase from the narration (or seconds into the scene).
// Transitions (`cut` on a shot): 'whip' (default), 'cut', 'zoom', 'flash', 'blur'.
// Impact sounds are added automatically for stamps, hero numbers, letter swaps and tears.

import { W, H, clamp, lerp, rand, text, typed } from './engine.js';
import { C, backdrop, piece, paperFill, highlight, markerLine, markerCircle, arrow, person } from './collage.js';
import { view, drawLand, pin, route } from './map.js';
import { ez, span, photo, img, kinetic, crash, impact, flash } from './motion.js';
import { bust, trophy, building } from './kit.js';

const INK = '#f4ecdb';
const ACCENT = '#ff6a4d';
const GOLD = '#ffd23f';
const TR = 0.3; // transition length (s)

// ---------------------------------------------------------------- timing
const norm = (w) => w.toLowerCase().replace(/[^a-z0-9₹]/g, '');

/** Every spoken word of a scene with its time: [{tok, at}] (from narration cues) */
export function sceneWords(cues) {
  const out = [];
  for (const c of cues) {
    const words = c.text.split(/\s+/).filter(Boolean);
    const total = words.reduce((a, w) => a + w.length + 1.5, 0);
    let acc = 0;
    for (const w of words) {
      out.push({ tok: norm(w), at: c.start + (acc / total) * (c.end - c.start) });
      acc += w.length + 1.5;
    }
  }
  return out;
}

/** Time a phrase starts in the scene (searching from `after`); numbers pass through as seconds */
export function when(words, phrase, after = 0) {
  if (phrase == null) return null;
  if (typeof phrase === 'number') return phrase;
  const toks = phrase.split(/\s+/).map(norm).filter(Boolean);
  for (const from of [after - 0.01, -1]) {
    for (let i = 0; i < words.length; i++) {
      if (words[i].at < from) continue;
      if (toks.every((tk, k) => words[i + k] && words[i + k].tok.startsWith(tk))) return words[i].at;
    }
  }
  throw new Error(`Phrase not found in narration: "${phrase}"`);
}

/** Shot start times for a scene */
function plan(list, words) {
  const starts = [];
  list.forEach((sh, i) => {
    if (i === 0) starts.push(sh.at != null ? when(words, sh.at) : 0);
    else starts.push(Math.max(starts[i - 1] + 0.4, when(words, sh.at, starts[i - 1]) - (sh.lead ?? 0.12)));
  });
  return starts;
}

/** Display words → each lands when it is heard (or 90 ms after the previous one) */
function landing(words, str, from, to) {
  const out = [];
  let cursor = from - 0.3;
  let last = from;
  for (const raw of str.split(/\s+/).filter(Boolean)) {
    const accent = raw.startsWith('*');
    const word = accent ? raw.slice(1) : raw;
    const tk = norm(word);
    const hit = words.find((w) => w.at >= cursor && w.at <= to + 0.2 && tk && (w.tok === tk || (tk.length > 3 && w.tok.startsWith(tk))));
    const at = hit ? hit.at : last + 0.09;
    if (hit) cursor = hit.at + 0.01;
    last = at;
    out.push({ word, at, color: accent ? ACCENT : undefined });
  }
  return out;
}

// ---------------------------------------------------------------- grounds
function ground(ctx, bg, p, opts = {}) {
  if (!bg || bg === 'deep') return backdrop(ctx, C.deep);
  if (bg === 'navy') return backdrop(ctx, C.navy);
  if (bg === 'paper') return backdrop(ctx, C.paper);
  if (Array.isArray(bg) ? !bg.some((k) => img(k)) : !img(bg)) return backdrop(ctx, C.deep);
  backdrop(ctx, C.deep);
  photo(ctx, bg, p, { zoom: [1.25, 1.35], grade: opts.grade || 'bw', darken: 0.7, blur: 7, alpha: 0.55 });
}

// ---------------------------------------------------------------- shot types
const T = {};
const OVERLAYS = [];
/** Add shot types (and optional overlay drawers) from another module, e.g. pipeline/cinema.js */
export function addShotTypes(types, overlay) {
  Object.assign(T, types);
  if (overlay) OVERLAYS.push(overlay);
}
export { landing, ground };

T.photo = (ctx, sh, x) => {
  photo(ctx, sh.img, x.p, { zoom: sh.zoom || [1.06, 1.18], pan: sh.pan || [[0.015, 0], [-0.015, 0]], grade: sh.grade || 'doc', darken: sh.darken ?? 0.35 });
  if (sh.text) {
    const y = sh.pos === 'center' ? H / 2 + 30 : sh.pos === 'top' ? H * 0.2 : H * 0.8;
    kinetic(ctx, x.t, landing(x.words, sh.text, x.a, x.b), W / 2, y, { size: sh.size || 96, out: x.b - 0.12 });
  }
  if (sh.sub) kinetic(ctx, x.t, landing(x.words, sh.sub, x.a, x.b), W / 2, H * 0.8 + 90, { size: 44, font: 'Caveat', weight: 700, color: GOLD, out: x.b - 0.12 });
};

T.kinetic = (ctx, sh, x) => {
  ground(ctx, sh.bg, x.p);
  const lines = sh.text.split('|');
  const size = sh.size || (lines.length > 1 ? 120 : 140);
  lines.forEach((ln, i) => {
    const y = H / 2 + (i - (lines.length - 1) / 2) * size * 1.15 + size * 0.35;
    kinetic(ctx, x.t, landing(x.words, ln, x.a, x.b), W / 2, y, { size, font: sh.font || 'Oswald', weight: sh.weight || 700, out: x.b - 0.12 });
  });
  if (sh.sub) kinetic(ctx, x.t, landing(x.words, sh.sub, x.a, x.b), W / 2, H / 2 + lines.length * size * 0.65 + 90, { size: 56, font: 'Caveat', weight: 700, color: GOLD, out: x.b - 0.12 });
};

T.number = (ctx, sh, x) => {
  ground(ctx, sh.bg || sh.img, x.p);
  const at = sh.when ? when(x.words, sh.when, x.a) : x.a + 0.3;
  const v = lerp(sh.from ?? 0, sh.value, ez.expoOut(span(x.t, at - 0.15, 1.1)));
  const str = `${sh.prefix || ''}${v.toLocaleString('en-IN', { maximumFractionDigits: sh.decimals || 0, minimumFractionDigits: sh.decimals || 0 })}${sh.suffix || ''}`;
  crash(ctx, x.t, at, (g) => text(g, str, 0, 0, { font: 'Oswald', weight: 700, size: sh.size || 280, color: sh.color || INK, align: 'center', shadow: 'rgba(0,0,0,0.6)', shadowBlur: 40 }), { x: W / 2, y: H / 2 + 60, from: 2.8 });
  if (sh.label) kinetic(ctx, x.t, landing(x.words, sh.label, at, x.b), W / 2, H / 2 + 190, { size: 64, out: x.b - 0.12 });
  if (sh.sub) kinetic(ctx, x.t, landing(x.words, sh.sub, at, x.b), W / 2, H / 2 - 220, { size: 52, font: 'Caveat', weight: 700, color: GOLD, out: x.b - 0.12 });
};

T.ride = (ctx, sh, x) => {
  // the camera rides a line chart; `drop` = the phrase where it falls
  backdrop(ctx, C.deep);
  const r = rand(sh.seed || 11);
  const vals = sh.values || [179, 179, 179, 179, 40];
  const pts = [];
  const N = 120;
  for (let i = 0; i <= N; i++) {
    const k = i / N;
    const seg = k * (vals.length - 1), j = Math.min(vals.length - 2, Math.floor(seg));
    const e = sh.drop ? ez.expoOut(seg - j) : seg - j;
    pts.push([k * 3600, 860 - lerp(vals[j], vals[j + 1], e) * (sh.scale || 3.6) + (r() - 0.5) * 8]);
  }
  const dropAt = sh.drop ? when(x.words, sh.drop, x.a) : x.b;
  const before = (vals.length - 2) / (vals.length - 1);
  const tip = clamp(lerp(0.1, before, span(x.t, x.a, dropAt - x.a)) + (1 - before) * ez.expoOut(span(x.t, dropAt - 0.2, 1.4)));
  const n = Math.max(1, Math.floor(tip * N));
  const [tx, ty] = pts[n];
  const fell = n > before * N + 2;
  ctx.save();
  ctx.translate(W * 0.62 - tx, H * 0.5 - lerp(ty, 500, 0.35));
  ctx.strokeStyle = 'rgba(143,179,201,0.12)';
  ctx.lineWidth = 2;
  for (let gx = -400; gx < 4200; gx += 120) { ctx.beginPath(); ctx.moveTo(gx, -900); ctx.lineTo(gx, 2000); ctx.stroke(); }
  for (let gy = -900; gy < 2000; gy += 120) { ctx.beginPath(); ctx.moveTo(-400, gy); ctx.lineTo(4200, gy); ctx.stroke(); }
  ctx.lineWidth = 10;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = fell ? (sh.up ? '#4fd18b' : C.red) : '#e8dfcc';
  ctx.shadowColor = ctx.strokeStyle;
  ctx.shadowBlur = 30;
  ctx.beginPath();
  pts.slice(0, n + 1).forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
  ctx.stroke();
  ctx.fillStyle = ctx.strokeStyle;
  ctx.beginPath(); ctx.arc(tx, ty, 14, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  if (sh.label) kinetic(ctx, x.t, landing(x.words, sh.label, x.a, x.b), W * 0.3, H * 0.25, { size: 60, out: x.b - 0.12 });
  if (sh.big) {
    crash(ctx, x.t, dropAt + 0.1, (g) => text(g, sh.big, 0, 0, { font: 'Oswald', weight: 700, size: 260, color: sh.up ? '#4fd18b' : C.red, align: 'center', shadow: 'rgba(0,0,0,0.6)' }), { x: W * 0.3, y: H * 0.5, from: 2.6 });
  }
};

T.bars = (ctx, sh, x) => {
  // one bar per item, each grows when it is named; the last one is the point
  ground(ctx, sh.bg || 'deep', x.p);
  const n = sh.bars.length, bw = Math.min(220, 1300 / n), gap = bw * 0.45;
  const total = n * bw + (n - 1) * gap, base = H * 0.8, max = sh.max || Math.max(...sh.bars.map((b) => b.value));
  sh.bars.forEach((b, i) => {
    const at = b.when ? when(x.words, b.when, x.a) : x.a + 0.3 + i * 0.25;
    const g = ez.expoOut(span(x.t, at - 0.1, 0.7));
    const h = (b.value / max) * H * 0.5 * g;
    const bx = W / 2 - total / 2 + i * (bw + gap);
    ctx.fillStyle = b.color === 'red' ? C.red : b.color === 'gold' ? GOLD : b.color || '#e8dfcc';
    ctx.fillRect(bx, base - h, bw, h);
    if (b.top) ctx.fillStyle = C.red, ctx.fillRect(bx, base - h - b.top * g * (H * 0.5 / max), bw, b.top * g * (H * 0.5 / max));
    if (g > 0.05) {
      text(ctx, b.label || '', bx + bw / 2, base + 52, { font: 'Oswald', weight: 700, size: 34, color: INK, align: 'center', alpha: g, spacing: 2 });
      if (b.show) text(ctx, b.show, bx + bw / 2, base - h - (b.top ? b.top * (H * 0.5 / max) : 0) - 24, { font: 'Oswald', weight: 700, size: 52, color: INK, align: 'center', alpha: g });
    }
  });
  if (sh.title) kinetic(ctx, x.t, landing(x.words, sh.title, x.a, x.b), W / 2, H * 0.16, { size: 64, out: x.b - 0.12 });
};

T.swarm = (ctx, sh, x) => {
  if (sh.img) photo(ctx, sh.img, x.p, { zoom: [1.3, 1.4], grade: 'bw', darken: 0.6, blur: 3 });
  else backdrop(ctx, C.deep);
  const r = rand(5);
  const cols = 50, rows = 20;
  const redAt = sh.redWhen ? when(x.words, sh.redWhen, x.a) : 1e9;
  for (let i = 0; i < cols * rows; i++) {
    const tx = 160 + (i % cols) * 32.5, ty = 330 + Math.floor(i / cols) * 32;
    const sx = r() * W, sy = r() < 0.5 ? -60 : H + 60;
    const p = ez.expoOut(span(x.t, x.a + r() * 0.5, 0.7));
    const red = x.t > redAt + (i % cols) * 0.02 && r() < (sh.red ?? 0.45);
    ctx.fillStyle = red ? C.red : `rgba(244,236,219,${sh.label ? 0.5 : 0.9})`;
    ctx.beginPath();
    ctx.arc(lerp(sx, tx, p), lerp(sy, ty, p), 9, 0, Math.PI * 2);
    ctx.fill();
  }
  const at = sh.when ? when(x.words, sh.when, x.a) : x.a + 0.4;
  if (sh.label) crash(ctx, x.t, at, (g) => text(g, sh.label, 0, 0, { font: 'Oswald', weight: 700, size: sh.size || 220, color: INK, align: 'center', shadow: 'rgba(0,0,0,0.7)', shadowBlur: 40 }), { x: W / 2, y: H * 0.5, from: 3 });
  if (sh.sub) kinetic(ctx, x.t, landing(x.words, sh.sub, at, x.b), W / 2, H * 0.5 + 130, { size: 80, font: 'Playfair Display', weight: 900, color: ACCENT, out: x.b - 0.1 });
};

T.map = (ctx, sh, x) => {
  const from = sh.from || [40, 25, 5], to = sh.to || from;
  const fly = ez.p2InOut(span(x.t, x.a, sh.flight || Math.min(3.2, x.b - x.a)));
  const scale = Math.exp(lerp(Math.log(from[2]), Math.log(to[2]), fly));
  const proj = view(lerp(from[0], to[0], fly), lerp(from[1], to[1], fly), scale);
  const doubt = sh.doubt ? span(x.t, when(x.words, sh.doubt, x.a), 0.5) : 0;
  if (sh.dark !== false) drawLand(ctx, proj, scale, { color: doubt > 0 ? '#3a3330' : '#22343f', sea: '#0b1820' });
  else drawLand(ctx, proj, scale);
  (sh.routes || []).forEach((rt) => {
    const at = rt.when ? when(x.words, rt.when, x.a) : x.a + 1;
    route(ctx, proj(rt.from), proj(rt.to), span(x.t, at, 1.6), { color: ACCENT, lift: rt.lift ?? 0.25 });
  });
  (sh.hubs || []).forEach((h, i) => {
    const [hx, hy] = proj(h);
    const on = span(x.t, (sh.hubsWhen ? when(x.words, sh.hubsWhen, x.a) : x.a + 1.2) + i * 0.18, 0.3);
    if (on <= 0) return;
    const pulse = 1 + 0.25 * Math.sin(x.t * 5 + i);
    const col = doubt > 0.5 ? '255,90,60' : '255,210,63';
    const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, 70 * pulse);
    g.addColorStop(0, `rgba(${col},${0.9 * on})`);
    g.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(hx, hy, 70 * pulse, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(255,248,235,${on})`;
    ctx.beginPath(); ctx.arc(hx, hy, 7, 0, Math.PI * 2); ctx.fill();
  });
  (sh.pins || []).forEach((pn) => {
    const at = pn.when ? when(x.words, pn.when, x.a) : x.a + 0.8;
    pin(ctx, proj(pn.at), pn.label, span(x.t, at - 0.1, 0.4), { color: pn.color || C.red, side: pn.side || 1 });
  });
  if (sh.text) kinetic(ctx, x.t, landing(x.words, sh.text, x.a, x.b), W / 2, sh.textY || H * 0.2, { size: sh.size || 84, out: x.b - 0.12 });
};

T.profile = (ctx, sh, x) => {
  ground(ctx, sh.bg || sh.img || 'deep', x.p);
  const arrive = ez.expoOut(span(x.t, x.a, 0.5));
  ctx.save();
  ctx.translate(W * 0.33, H * 0.52 + (1 - arrive) * 500);
  ctx.rotate(-0.03 + (1 - arrive) * 0.1);
  piece(ctx, { x: 0, y: 0, w: 520, h: 640, color: C.white, seed: 11 }, (g) => {
    g.fillStyle = paperFill(g, C.paper);
    g.fillRect(30, 30, 460, 470);
    if (sh.icon === 'trophy') trophy(g, 260, 270, 210);
    else if (sh.icon === 'building') { building(g, 180, 470, 120, 330, C.navy, 1); building(g, 330, 470, 140, 260, C.teal, 2); }
    else bust(g, 260, 300, 330, C.navy);
    text(g, sh.caption || '', 260, 580, { font: 'Caveat', weight: 700, size: 48, color: C.muted, align: 'center' });
  });
  ctx.restore();
  const nameLines = (sh.name || '').split('|');
  const nameSize = sh.size || (Math.max(...nameLines.map((l) => l.length)) > 13 ? 70 : 92);
  nameLines.forEach((ln, i) => kinetic(ctx, x.t, landing(x.words, ln, x.a, x.b), W * 0.68, H * 0.42 + i * 110, { size: nameSize, out: x.b - 0.12 }));
  if (sh.role) kinetic(ctx, x.t, landing(x.words, sh.role, x.a, x.b), W * 0.68, H * 0.42 + nameLines.length * 110, { size: 58, font: 'Caveat', weight: 700, color: GOLD, out: x.b - 0.12 });
};

T.doc = (ctx, sh, x) => {
  // a document filling the frame, magnified; lines type in; optional highlighted row
  backdrop(ctx, C.deep);
  const drift = x.p;
  ctx.save();
  ctx.translate(W / 2, H / 2 + (1 - ez.expoOut(span(x.t, x.a, 0.55))) * H);
  ctx.rotate(lerp(-0.03, -0.015, drift));
  const z = lerp(1.06, 1.16, drift);
  ctx.scale(z, z);
  ctx.translate(-W / 2, -H / 2);
  ctx.fillStyle = paperFill(ctx, C.white);
  ctx.fillRect(-300, -300, W + 600, H + 600);
  let y = 230;
  if (sh.heading) { text(ctx, sh.heading, 180, y, { font: 'Oswald', weight: 700, size: 64, color: C.navy, spacing: 3 }); y += 120; }
  (sh.rows || []).forEach((row, i) => {
    const at = row.when ? when(x.words, row.when, x.a) : x.a + 0.4 + i * 0.6;
    text(ctx, typed(row.label, span(x.t, at - 0.1, 0.7)), 180, y, { font: 'Special Elite', size: 62, color: C.ink });
    if (row.value) crash(ctx, x.t, at + 0.6, (g) => text(g, row.value, 0, 0, { font: 'Oswald', weight: 700, size: 70, color: C.red, align: 'right' }), { x: W - 180, y, from: 1.8 });
    if (row.mark) highlight(ctx, 170, y - 58, W - 340, 80, span(x.t, at + 0.9, 0.35), { alpha: 0.55 });
    if (row.tag) {
      const ta = row.tagWhen ? when(x.words, row.tagWhen, at) : at + 1.1;
      crash(ctx, x.t, ta, (g) => {
        g.rotate(-0.1);
        g.strokeStyle = C.red; g.lineWidth = 8;
        g.font = '700 70px Oswald';
        const tw = g.measureText(row.tag).width + 60;
        g.strokeRect(-tw / 2, -55, tw, 100);
        text(g, row.tag, 0, 22, { font: 'Oswald', weight: 700, size: 70, color: C.red, align: 'center', spacing: 4 });
      }, { x: W - 420, y: row.value ? y + 95 : y - 20, from: 3, len: 0.2 });
    }
    y += sh.gap || 150;
  });
  if (sh.typed) {
    ctx.font = "58px 'Special Elite'";
    const prog = span(x.t, x.a + 0.3, (x.b - x.a) * 0.85);
    const shown = sh.typed.slice(0, Math.floor(sh.typed.length * prog));
    const lines = [];
    let cur = '';
    for (const w of shown.split(' ')) {
      const t2 = cur ? `${cur} ${w}` : w;
      if (ctx.measureText(t2).width > 1500 && cur) { lines.push(cur); cur = w; } else cur = t2;
    }
    if (cur) lines.push(cur);
    lines.forEach((ln, i) => text(ctx, ln, 180, y + i * 90, { font: 'Special Elite', size: 58, color: C.ink }));
  }
  ctx.restore();
};

T.quote = (ctx, sh, x) => {
  backdrop(ctx, C.deep);
  if (sh.bg === 'tiger') {
    ctx.save();
    ctx.translate(W / 2 + lerp(60, -60, x.p), H / 2);
    ctx.rotate(-0.04);
    piece(ctx, { x: 0, y: 0, w: 2400, h: 820, color: C.orange, seed: 281, torn: 'tb' }, (g) => {
      const r = rand(3);
      g.fillStyle = '#1a1612';
      for (let i = 0; i < 18; i++) {
        const sx = (i / 18) * 2400 + r() * 30;
        g.beginPath(); g.moveTo(sx, 0); g.quadraticCurveTo(sx + 60, 240, sx + 10, 420 + r() * 200); g.quadraticCurveTo(sx, 240, sx - 26, 0); g.fill();
        g.beginPath(); g.moveTo(sx + 30, 820); g.quadraticCurveTo(sx - 40, 600, sx + 5, 520); g.quadraticCurveTo(sx + 14, 650, sx + 60, 820); g.fill();
      }
    });
    ctx.restore();
  }
  const at = sh.when ? when(x.words, sh.when, x.a) : x.a;
  const end = sh.until ? when(x.words, sh.until, at) : x.b - 0.6;
  const arrive = ez.expoOut(span(x.t, x.a, 0.5));
  ctx.save();
  ctx.translate(W / 2, H / 2 + (1 - arrive) * 300);
  ctx.rotate(0.012);
  piece(ctx, { x: 0, y: 0, w: 1500, h: 520, color: C.white, seed: 282 }, (g) => {
    text(g, '“', 70, 200, { font: 'Playfair Display', weight: 900, size: 240, color: C.red });
    g.font = "62px 'Special Elite'";
    const words = sh.text.split(' ');
    const shown = typed(sh.text, span(x.t, at, end - at));
    const lines = [];
    let cur = '';
    let used = 0;
    for (const w of words) {
      const t2 = cur ? `${cur} ${w}` : w;
      if (g.measureText(t2).width > 1180 && cur) { lines.push(cur); cur = w; } else cur = t2;
    }
    lines.push(cur);
    lines.forEach((ln, i) => {
      const part = shown.slice(used, used + ln.length + 1);
      used += ln.length + 1;
      text(g, part, 210, 170 + i * 86, { font: 'Special Elite', size: 62, color: C.ink });
    });
    if (sh.by) text(g, sh.by, 1420, 470, { font: 'Caveat', weight: 700, size: 52, color: C.muted, align: 'right', alpha: span(x.t, end, 0.4) });
  });
  ctx.restore();
};

T.letters = (ctx, sh, x) => {
  ground(ctx, sh.bg || 'deep', x.p);
  const word = sh.word, n = word.length;
  const at = sh.when ? when(x.words, sh.when, x.a) : x.a + 0.2;
  const flipAt = sh.toWhen ? when(x.words, sh.toWhen, at) : 1e9;
  const flip = ez.p2InOut(span(x.t, flipAt - 0.5, 0.8));
  const r = rand(17);
  for (let i = 0; i < n; i++) {
    const slot = lerp(i, n - 1 - i, sh.reverse ? flip : 0);
    const arc = Math.sin(flip * Math.PI) * (i < n / 2 ? -180 : 180) * (sh.reverse ? 1 : 0);
    const rot = (r() - 0.5) * 0.14;
    crash(ctx, x.t, at + i * 0.05, (g) => {
      piece(g, { x: 0, y: 0, w: 190, h: 240, color: i % 2 ? C.white : C.sticky, rot, seed: 170 + i }, (pg) => {
        text(pg, word[i], 95, 196, { font: 'Playfair Display', weight: 900, size: 200, color: C.ink, align: 'center' });
      });
    }, { x: W / 2 + (slot - (n - 1) / 2) * 210, y: H * 0.45 + arc, from: 2.4, len: 0.28 });
  }
  if (sh.sub) kinetic(ctx, x.t, landing(x.words, sh.sub, x.a, x.b), W / 2, H * 0.82, { size: 80, color: GOLD, out: x.b - 0.12 });
};

T.list = (ctx, sh, x) => {
  // items arrive big in the centre one at a time; earlier ones shrink into a row at the top
  ground(ctx, sh.bg || 'deep', x.p);
  const times = sh.items.map((it, i) => (it.when ? when(x.words, it.when, x.a) : x.a + 0.3 + i * 1.2));
  const cur = times.reduce((k, tm, i) => (x.t >= tm - 0.15 ? i : k), -1);
  const n = sh.items.length;
  sh.items.forEach((it, i) => {
    if (i > cur) return;
    const toRow = i < cur ? ez.expoOut(span(x.t, times[i + 1] - 0.15, 0.5)) : 0;
    const rowX = W / 2 + (i - (n - 1) / 2) * Math.min(420, 1700 / n), rowY = 180;
    const cx = lerp(W / 2, rowX, toRow), cy = lerp(H / 2 + 40, rowY, toRow), sc = lerp(1, 0.38, toRow);
    crash(ctx, x.t, times[i], (g) => {
      g.scale(sc, sc);
      piece(g, { x: 0, y: 0, w: 1000, h: it.sub ? 420 : 300, color: it.color === 'yellow' ? C.sticky : C.white, rot: (i % 2 ? 0.02 : -0.02), seed: 300 + i }, (pg) => {
        if (it.num) text(pg, it.num, 90, 150, { font: 'Permanent Marker', size: 120, color: C.red });
        text(pg, it.text, it.num ? 560 : 500, 180, { font: 'Oswald', weight: 700, size: 104, color: C.navy, align: 'center', spacing: 3 });
        if (it.sub) text(pg, it.sub, 500, 320, { font: 'Caveat', weight: 700, size: 70, color: C.ink, align: 'center' });
      });
      if (it.circle && toRow === 0) markerCircle(g, 0, 0, 560, it.sub ? 260 : 190, span(x.t, times[i] + 0.4, 0.7), { seed: 6, width: 9 });
    }, { x: cx, y: cy, from: 2.2 });
  });
  if (sh.title) kinetic(ctx, x.t, landing(x.words, sh.title, x.a, x.b), W / 2, H * 0.92, { size: 54, color: GOLD, out: x.b - 0.12 });
};

T.flow = (ctx, sh, x) => {
  // A → B → C: the camera pans to each node as it is named; arrows draw between them
  ground(ctx, sh.bg || 'deep', x.p);
  const times = sh.nodes.map((nd, i) => (nd.when ? when(x.words, nd.when, x.a) : x.a + 0.3 + i * 1.5));
  const cur = times.reduce((k, tm, i) => (x.t >= tm - 0.3 ? i : k), 0);
  const gapX = 820;
  const camX = lerp((Math.max(0, cur - 1)) * gapX, cur * gapX, ez.expoOut(span(x.t, times[cur] - 0.3, 0.7)));
  ctx.save();
  ctx.translate(W / 2 - (sh.nodes.length > 1 ? camX - gapX / 2 : 0), 0);
  sh.nodes.forEach((nd, i) => {
    const nx = i * gapX;
    if (i > 0) arrow(ctx, [nx - gapX + 300, H / 2 + 10], [nx - 300, H / 2 + 10], span(x.t, times[i] - 0.3, 0.5), { color: GOLD, width: 10, bend: -0.2 });
    crash(ctx, x.t, times[i], (g) => {
      piece(g, { x: 0, y: 0, w: 560, h: 380, color: nd.color === 'yellow' ? C.sticky : C.white, rot: (i % 2 ? 0.025 : -0.025), seed: 400 + i }, (pg) => {
        if (nd.icon === 'buildings') { building(pg, 170, 250, 90, 170, C.navy, 1); building(pg, 290, 250, 110, 210, C.teal, 2); building(pg, 400, 250, 80, 140, C.navy, 3); }
        else if (nd.icon === 'computer') { pg.fillStyle = C.navy; pg.fillRect(190, 50, 180, 130); pg.fillStyle = '#5fe08a'; pg.fillRect(205, 65, 150, 100); pg.fillStyle = C.navy; pg.fillRect(265, 180, 30, 30); pg.fillRect(220, 205, 120, 14); }
        else if (nd.icon === 'cash') { for (let k = 0; k < 5; k++) { pg.fillStyle = k % 2 ? '#7fa877' : '#6f9e6b'; pg.fillRect(150 + k * 8, 200 - k * 26, 260, 80); } }
        const ty = nd.icon ? 300 : 210;
        text(pg, nd.text, 280, ty, { font: 'Oswald', weight: 700, size: nd.text.length > 14 ? 50 : 72, color: C.navy, align: 'center', spacing: 2 });
        if (nd.sub) text(pg, nd.sub, 280, ty + 60, { font: 'Caveat', weight: 700, size: 46, color: C.muted, align: 'center' });
      });
    }, { x: nx, y: H / 2, from: 2 });
    if (nd.fade) {
      const f = span(x.t, when(x.words, nd.fade, x.a), 1.2);
      if (f > 0) { ctx.fillStyle = `rgba(15,37,51,${f * 0.85})`; ctx.fillRect(nx - 300, H / 2 - 210, 600, 420); }
    }
  });
  ctx.restore();
  if (sh.money) {
    const at = when(x.words, sh.money.when, x.a);
    crash(ctx, x.t, at, (g) => {
      piece(g, { x: 0, y: 0, w: 560, h: 170, color: C.sticky, rot: 0.04, seed: 450 }, (pg) => text(pg, sh.money.text, 280, 115, { font: 'Permanent Marker', size: 74, color: C.red, align: 'center' }));
    }, { x: W / 2, y: H * 0.82, from: 2.4 });
  }
  if (sh.title) kinetic(ctx, x.t, landing(x.words, sh.title, x.a, x.b), W / 2, H * 0.16, { size: 64, out: x.b - 0.12 });
};

T.vs = (ctx, sh, x) => {
  ground(ctx, sh.bg || 'deep', x.p);
  [sh.left, sh.right].forEach((side, i) => {
    const at = side.when ? when(x.words, side.when, x.a) : x.a + 0.3 + i * 1.5;
    const cx = W / 2 + (i ? 1 : -1) * 420;
    crash(ctx, x.t, at, (g) => text(g, side.value, 0, 0, { font: 'Oswald', weight: 700, size: 250, color: side.color === 'red' ? C.red : INK, align: 'center', shadow: 'rgba(0,0,0,0.6)' }), { x: cx, y: H / 2 + 40, from: 2.6 });
    kinetic(ctx, x.t, landing(x.words, side.label, at, x.b), cx, H / 2 + 170, { size: 56, color: GOLD, out: x.b - 0.12 });
  });
  if (sh.title) kinetic(ctx, x.t, landing(x.words, sh.title, x.a, x.b), W / 2, H * 0.2, { size: 64, out: x.b - 0.12 });
};

T.chapter = (ctx, sh, x) => {
  ground(ctx, sh.img || 'deep', x.p, { grade: 'bw' });
  crash(ctx, x.t, x.a + 0.25, (g) => text(g, `${sh.num}`, 0, 0, { font: 'Playfair Display', weight: 900, size: 340, color: ACCENT, align: 'center', shadow: 'rgba(0,0,0,0.6)' }), { x: W / 2, y: H / 2 - 20, from: 3 });
  kinetic(ctx, x.t, sh.title.split(' ').map((w, i) => ({ word: w, at: x.a + 0.65 + i * 0.09 })), W / 2, H / 2 + 150, { size: 84, font: 'Playfair Display', weight: 900 });
};

T.tear = (ctx, sh, x) => {
  ground(ctx, sh.bg || 'deep', x.p, { grade: 'red' });
  const at = sh.when ? when(x.words, sh.when, x.a) : x.a + 0.2;
  const tearAt = sh.tearWhen ? when(x.words, sh.tearWhen, at) : at + 0.8;
  const tp = span(x.t, at - 0.1, 0.3);
  const split = ez.expoOut(span(x.t, tearAt, 0.6));
  if (tp <= 0) return;
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(W / 2 + side * split * 70, H / 2 + side * split * 12);
    ctx.rotate(side * split * 0.06);
    const sc = lerp(2.8, 1, ez.expoOut(tp));
    ctx.scale(sc, sc);
    ctx.beginPath();
    const r = rand(5);
    ctx.moveTo(side * 1000, -220);
    for (let i = 0; i <= 12; i++) ctx.lineTo((r() - 0.5) * 50, -220 + i * 36);
    ctx.lineTo(side * 1000, 220);
    ctx.closePath();
    ctx.clip();
    ctx.globalAlpha = Math.min(1, tp * 3);
    text(ctx, sh.word, 0, 80, { font: 'Oswald', weight: 700, size: 240, color: sh.color === 'ink' ? INK : C.red, align: 'center', spacing: 34, shadow: 'rgba(0,0,0,0.6)' });
    ctx.restore();
  }
  if (sh.sub) kinetic(ctx, x.t, landing(x.words, sh.sub, x.a, x.b), W / 2, H * 0.82, { size: 72, font: 'Caveat', weight: 700, color: GOLD, out: x.b - 0.1 });
};

// ---------------------------------------------------------------- overlays on any shot
function overlays(ctx, sh, x) {
  for (const o of OVERLAYS) o(ctx, sh, x);
  if (sh.note) {
    const at = sh.note.when ? when(x.words, sh.note.when, x.a) : x.a + 0.6;
    kinetic(ctx, x.t, [{ word: sh.note.text, at }], sh.note.x ?? W / 2, sh.note.y ?? H * 0.9, { size: sh.note.size || 64, font: 'Permanent Marker', weight: 400, color: sh.note.color || GOLD, out: x.b - 0.1 });
  }
  if (sh.stamp) {
    const at = when(x.words, sh.stamp.when, x.a) + (sh.stamp.delay || 0);
    crash(ctx, x.t, at, (g) => {
      g.rotate(sh.stamp.rot ?? -0.1);
      const size = sh.stamp.size || 120;
      g.font = `700 ${size}px Oswald`;
      g.letterSpacing = `${size * 0.07}px`;
      const tw = g.measureText(sh.stamp.text).width + size * 0.7;
      g.strokeStyle = C.red; g.lineWidth = size * 0.09;
      g.shadowColor = 'rgba(0,0,0,0.4)'; g.shadowBlur = 20;
      g.strokeRect(-tw / 2, -size * 0.72, tw, size * 1.45);
      text(g, sh.stamp.text, 0, size * 0.34, { font: 'Oswald', weight: 700, size, color: C.red, align: 'center', spacing: size * 0.07 });
    }, { x: sh.stamp.x ?? W / 2, y: sh.stamp.y ?? H * 0.5, from: 3.4, len: 0.2 });
    flash(ctx, x.t, at, 0.3);
  }
}

/** Times of impacts in a shot (for shake and sound) */
function impactsOf(sh, words, a) {
  const out = [];
  const w = (p, after) => when(words, p, after);
  if (sh.stamp) out.push(w(sh.stamp.when, a) + (sh.stamp.delay || 0));
  if (sh.type === 'number') out.push(sh.when ? w(sh.when, a) : a + 0.3);
  if (sh.type === 'ride' && sh.drop) out.push(w(sh.drop, a) + 0.1);
  if (sh.type === 'swarm' && sh.label) out.push(sh.when ? w(sh.when, a) : a + 0.4);
  if (sh.type === 'letters' && sh.toWhen) out.push(w(sh.toWhen, a) + 0.3);
  if (sh.type === 'tear') out.push(sh.tearWhen ? w(sh.tearWhen, a) : (sh.when ? w(sh.when, a) : a + 0.2) + 0.8);
  if (sh.type === 'chapter') out.push(a + 0.25);
  if (sh.boom) out.push(w(sh.boom, a));
  return out;
}

// ---------------------------------------------------------------- scene builder
/** Turn a shot list into a scene drawing function */
export function shotScene(list, { shake = true } = {}) {
  let cache = null;
  return (ctx, s) => {
    const key = `${s.cue(0)}|${s.d}`;
    if (!cache || cache.key !== key) {
      const cues = [];
      for (let i = 0; s.line(i); i++) cues.push({ text: s.line(i), start: s.cue(i), end: s.cueEnd(i) });
      const words = sceneWords(cues);
      const starts = plan(list, words);
      const bounds = starts.map((a, i) => [a, starts[i + 1] ?? s.d]);
      const hits = list.flatMap((sh, i) => impactsOf(sh, words, bounds[i][0]));
      cache = { key, words, bounds, hits };
    }
    const { words, bounds, hits } = cache;
    const t = s.t;
    if (shake) for (const h of hits) impact(ctx, t, h, 16);

    let k = bounds.findIndex(([a, b]) => t < b);
    if (k < 0) k = bounds.length - 1;
    const draw = (i, tt) => {
      const sh = list[i];
      const [a, b] = bounds[i];
      const x = { t: tt, a, b, p: clamp((tt - a) / Math.max(0.1, b - a)), words };
      ctx.save();
      (T[sh.type] || T.kinetic)(ctx, sh, x);
      overlays(ctx, sh, x);
      ctx.restore();
    };
    // transition into shot k (or out of k into k+1)
    const nextStart = bounds[k + 1]?.[0];
    let into = null;
    if (k > 0 && t < bounds[k][0] + TR / 2) into = k;
    else if (nextStart != null && t > nextStart - TR / 2) into = k + 1;
    if (into == null) return draw(k, t);

    const at = bounds[into][0];
    const cut = list[into].cut || (into % 2 ? 'whip' : 'whipR');
    const p = clamp((t - (at - TR / 2)) / TR);
    const showIncoming = p >= 0.5;
    const shot = showIncoming ? into : into - 1;
    ctx.save();
    if (cut === 'whip' || cut === 'whipR') {
      const dir = cut === 'whip' ? -1 : 1;
      const e = showIncoming ? 1 - ez.expoOut((p - 0.5) * 2) : ez.p3In(p * 2);
      ctx.translate((showIncoming ? -dir : dir) * e * W * 0.55, 0);
      ctx.filter = `blur(${e * 36}px)`;
    } else if (cut === 'zoom') {
      const e = showIncoming ? 1 - ez.expoOut((p - 0.5) * 2) : ez.p3In(p * 2);
      const sc = showIncoming ? 1 + e * 0.25 : 1 + e * 2.2;
      ctx.translate(W / 2, H / 2); ctx.scale(sc, sc); ctx.translate(-W / 2, -H / 2);
      ctx.filter = `blur(${e * 24}px)`;
    } else if (cut === 'blur') {
      const e = showIncoming ? 1 - ez.expoOut((p - 0.5) * 2) : ez.p3In(p * 2);
      ctx.filter = `blur(${e * 20}px)`;
    }
    draw(shot, t);
    ctx.restore();
    if (cut === 'flash') flash(ctx, t, at, 0.45);
  };
}

/** Impact sound times for the whole episode (used by render.mjs for the audio mix) */
export function hitsFor(timeline, shotLists) {
  const out = [];
  for (const sc of timeline.scenes) {
    const list = shotLists[sc.id];
    if (!list) continue;
    const words = sceneWords(sc.cues);
    const starts = plan(list, words);
    list.forEach((sh, i) => impactsOf(sh, words, starts[i]).forEach((t) => out.push({ t: sc.start + t })));
  }
  return out;
}

/** Middle time of every shot (for quick visual checks): [{scene, i, type, t}] */
export function shotMidpoints(timeline, shotLists) {
  const out = [];
  for (const sc of timeline.scenes) {
    const list = shotLists[sc.id];
    if (!list) continue;
    const starts = plan(list, sceneWords(sc.cues));
    list.forEach((sh, i) => {
      const b = starts[i + 1] ?? sc.duration;
      out.push({ scene: sc.id, i, type: sh.type, t: +(sc.start + starts[i] + (b - starts[i]) * 0.7).toFixed(2) });
    });
  }
  return out;
}
