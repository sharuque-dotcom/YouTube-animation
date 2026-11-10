// Light-mode renderer for shot lists: the same lists as pipeline/shots.js, drawn in the
// product-documentary style (pastel world, soft cards, springs, rolling numbers) with a
// designed transition into every shot. Captions are small pills, not big headlines.

import { W, H, clamp, lerp, rand, text } from './engine.js';
import { ez, span, img } from './motion.js';
import { sequence, push } from './sequence.js';
import { sceneWords, when, plan, landing } from './shots.js';
import {
  UI, TEMPO, spring, ease, easeIn, inOut, world, headline, odometer, typeOn, card, chip, photoIn,
  lightMap, mapPin, avatar, cursor,
} from './lightui.js';
import { trophy, building } from './kit.js';
import { hearts, chipRain, spy, scanHUD, diner } from './fx.js';
import { ACTS, routeShip } from './acts.js';

/** Words land when spoken, but never later than a quick stagger from the shot start (no waiting) */
const tight = (ws, a, lead = 0.3, gap = 0.11) => ws.map((w, k) => ({ ...w, at: Math.min(w.at, a + lead + k * gap) }));
/** Draw an image to fit inside a box (logos) */
function imageIn(g, key, x, y, w, h) {
  const im = img(key);
  if (!im) return;
  const s = Math.min(w / im.width, h / im.height);
  g.drawImage(im, x + (w - im.width * s) / 2, y + (h - im.height * s) / 2, im.width * s, im.height * s);
}
const clean = (s = '') => s.replace(/\*/g, '').replace(/\|/g, ' ');
const pick = (k) => (Array.isArray(k) ? k.find((x) => img(x)) : k);
const FILLS = ['#c9b8ff', '#ffc9a8', '#b8e0d2', '#f5c6e0', '#ffe2a8'];
// colours for the current shot: light (default) or dark (shot.dark = true, for the darker turns)
const LIGHT_TH = { text: UI.ink, accent: UI.purple, pill: '#fff', pillText: UI.ink, soft: UI.soft, softText: UI.purple };
const DARK_TH = { text: '#f3efff', accent: '#b9a2ff', pill: '#2c2350', pillText: '#f3efff', soft: '#2c2350', softText: '#cdbdff' };
let TH = LIGHT_TH;
function darkGround(g, T) {
  const gr = g.createLinearGradient(0, 0, W, H);
  gr.addColorStop(0, '#120d24'); gr.addColorStop(1, '#22163f');
  g.fillStyle = gr; g.fillRect(-200, -200, W + 400, H + 400);
  [[0.2, 0.25, 600, '120,80,220', 0.35], [0.8, 0.75, 520, '226,65,46', 0.18]].forEach(([bx, by, r, c, a], i) => {
    const x = (bx + Math.sin(T * 0.12 + i) * 0.05) * W, y = (by + Math.cos(T * 0.1 + i) * 0.05) * H;
    const rg = g.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, `rgba(${c},${a})`); rg.addColorStop(1, `rgba(${c},0)`);
    g.fillStyle = rg; g.fillRect(-200, -200, W + 400, H + 400);
  });
}

/** Caption pill centred at (cx, y), popping in at `at` */
function pill(g, str, cx, y, at, T, { size = 30, fill = TH.pill, color = TH.pillText, weight = 600 } = {}) {
  if (fill === UI.soft) { fill = TH.soft; color = TH.softText; }
  const s = spring(T, at, { freq: 1.8, damp: 0.65 });
  if (s <= 0.01 || !str) return;
  g.font = `${weight} ${size}px ${UI.BODY}`;
  const w = g.measureText(str).width + 2 * 22;
  chip(g, str, cx - w / 2, y, { size, weight, fill, color, stroke: null, scale: s, alpha: Math.min(1, s) });
}

/** Lines of words rising out of masks; *word = accent colour */
function statement(g, T, words, lines, cx, cy, { size = 110, color = TH.text } = {}) {
  const lh = size * 1.12;
  let wi = 0;
  lines.forEach((ln, li) => {
    const ws = ln.split(/\s+/).filter(Boolean);
    g.font = `600 ${size}px ${UI.HEAD}`;
    const parts = ws.map((w) => ({ w: w.replace('*', ''), acc: w.startsWith('*') }));
    const widths = parts.map((p) => g.measureText(p.w).width);
    const gap = size * 0.26;
    let x = cx - (widths.reduce((a, b) => a + b, 0) + gap * (parts.length - 1)) / 2;
    const y = cy + (li - (lines.length - 1) / 2) * lh + size * 0.35;
    parts.forEach((p, k) => {
      const at = words[wi++]?.at ?? 0;
      const e = ease(T, at - 0.08, 0.5);
      g.save();
      g.beginPath(); g.rect(x - 8, y - size * 0.95, widths[k] + 16, lh + 10); g.clip();
      text(g, p.w, x, y + (1 - e) * lh, { font: UI.HEAD, weight: 600, size, color: p.acc ? TH.accent : color, spacing: -size * 0.02 });
      g.restore();
      x += widths[k] + gap;
    });
  });
}

function photoBG(g, key, x) {
  const k = pick(key);
  if (!k) return;
  g.save(); g.globalAlpha = 0.22;
  photoIn(g, k, 0, 0, W, H, { zoom: lerp(1.15, 1.25, x.p) });
  g.restore();
  g.fillStyle = 'rgba(248,244,255,0.55)'; g.fillRect(0, 0, W, H);
}

// ---------------------------------------------------------------- shot types
const L = {};

L.photo = (g, sh, x) => {
  const ein = spring(x.T, x.a, { freq: 1.1, damp: 0.8 });
  push(g, x, { from: 1, to: 1.05 });
  const k = pick(sh.img);
  g.save();
  g.translate(W / 2, 470); g.rotate((1 - Math.min(1, ein)) * 0.04); g.scale(lerp(0.9, 1, Math.min(1, ein)), lerp(0.9, 1, Math.min(1, ein))); g.translate(-W / 2, -470);
  card(g, 240, 90, 1440, 770, { r: 40, alpha: Math.min(1, ein * 1.5) }, (cg, cw, ch) => {
    if (k) photoIn(cg, k, 0, 0, cw, ch, { zoom: lerp(1.12, 1.0, ease(x.T, x.a, 4)) });
  });
  if (sh.logo) {
    const lp = spring(x.T, x.a + 0.6, { freq: 1.6, damp: 0.65 });
    if (lp > 0.01) {
      g.save(); g.translate(400, 190); g.scale(lp, lp);
      card(g, -150, -60, 300, 120, { r: 30 }, (cg) => imageIn(cg, sh.logo, 30, 22, 240, 76));
      g.restore();
    }
  }
  g.restore();
  if (sh.text) pill(g, clean(sh.text), W / 2, 900, x.a + 0.5, x.T, { size: 34 });
  if (sh.sub) pill(g, clean(sh.sub), W / 2, 985, x.a + 0.9, x.T, { size: 26, fill: UI.soft, color: UI.purple });
};

L.kinetic = (g, sh, x) => {
  if (sh.bg && !['deep', 'navy', 'paper'].includes(sh.bg)) photoBG(g, sh.bg, x);
  push(g, x, { from: 1, to: 1.06 });
  const lines = sh.text.split('|');
  const words = tight(landing(x.words, sh.text.replace(/\|/g, ' '), x.a, x.b), x.a);
  statement(g, x.T, words, lines, W / 2, H / 2 - (sh.sub ? 40 : 0), { size: Math.min(120, (sh.size || 130) * 0.82) });
  if (sh.sub) pill(g, clean(sh.sub), W / 2, H / 2 + lines.length * 70 + 40, (words[words.length - 1]?.at ?? x.a) + 0.3, x.T, { size: 30, fill: UI.soft, color: UI.purple });
};

L.number = (g, sh, x) => {
  if (sh.bg || sh.img) photoBG(g, sh.bg || sh.img, x);
  push(g, x, { from: 1, to: 1.07 });
  const at = sh.when ? when(x.words, sh.when, x.a) : x.a + 0.3;
  const v = sh.value;
  const num = `${sh.prefix || ''}${v.toLocaleString('en-IN', { maximumFractionDigits: sh.decimals || 0, minimumFractionDigits: sh.decimals || 0 })}${sh.suffix || ''}`;
  if (sh.sub) pill(g, clean(sh.sub), W / 2, 300, at - 0.2, x.T, { size: 30, fill: UI.soft, color: UI.purple });
  const roll = Math.max(0.9, at - x.a + 0.3) / TEMPO;
  odometer(g, x.T, x.a + 0.1, num, W / 2, 600, { size: 230, align: 'center', color: sh.color ? UI.red : TH.text, dur: Math.min(roll, 3) });
  if (sh.label) pill(g, clean(sh.label), W / 2, 680, at + 0.5, x.T, { size: 34 });
};

L.ride = (g, sh, x) => {
  const dropAt = sh.drop ? when(x.words, sh.drop, x.a) : x.b - 0.5;
  const move = ez.expoOut(span(x.T, dropAt, 1.5 * TEMPO));
  const vals = sh.values || [100, 100, 100, 50];
  const up = !!sh.up;
  push(g, x, { from: 1, to: 1.1, focus: [W * 0.62 + 200 * move, H / 2] });
  card(g, 100, 100, W - 200, 860, { r: 36 }, (cg, cw) => {
    text(cg, clean(sh.label || ''), 60, 96, { font: UI.HEAD, weight: 700, size: 40, color: UI.ink });
    text(cg, 'illustrative', 62, 136, { font: UI.BODY, size: 22, color: UI.faint });
    const bx = 60, by = 190, bw = cw - 120, bh = 560;
    cg.strokeStyle = UI.line; cg.lineWidth = 2;
    for (let i = 0; i <= 4; i++) { cg.beginPath(); cg.moveTo(bx, by + (bh * i) / 4); cg.lineTo(bx + bw, by + (bh * i) / 4); cg.stroke(); }
    const max = Math.max(...vals) * 1.1, r = rand(sh.seed || 4), N = 140;
    const pre = (vals.length - 2) / (vals.length - 1);
    const prog = lerp(0.05, pre, ease(x.T, x.a, Math.max(0.6, (dropAt - x.a) / TEMPO))) + (1 - pre) * move;
    const pts = [];
    for (let i = 0; i <= N * prog; i++) {
      const k = i / N, seg = k * (vals.length - 1), j = Math.min(vals.length - 2, Math.floor(seg));
      const v = lerp(vals[j], vals[j + 1], j === vals.length - 2 ? ez.expoOut(seg - j) : seg - j) + (r() - 0.5) * max * 0.025;
      pts.push([bx + k * bw, by + bh - (v / max) * bh]);
    }
    const moved = move > 0.03;
    const col = moved ? (up ? UI.green : UI.red) : UI.purple;
    if (pts.length > 1) {
      const grad = cg.createLinearGradient(0, by, 0, by + bh);
      grad.addColorStop(0, moved ? (up ? 'rgba(31,138,91,0.18)' : 'rgba(226,65,46,0.2)') : 'rgba(74,42,140,0.16)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      cg.beginPath(); pts.forEach(([px, py], i) => (i ? cg.lineTo(px, py) : cg.moveTo(px, py)));
      cg.lineTo(pts[pts.length - 1][0], by + bh); cg.lineTo(bx, by + bh); cg.closePath(); cg.fillStyle = grad; cg.fill();
      cg.beginPath(); pts.forEach(([px, py], i) => (i ? cg.lineTo(px, py) : cg.moveTo(px, py)));
      cg.strokeStyle = col; cg.lineWidth = 8; cg.lineJoin = 'round'; cg.stroke();
      const [lx, ly] = pts[pts.length - 1];
      cg.fillStyle = col; cg.beginPath(); cg.arc(lx, ly, 14, 0, Math.PI * 2); cg.fill();
    }
    if (sh.big) {
      const bg = spring(x.T, dropAt + 0.4, { freq: 1.6, damp: 0.55 });
      if (bg > 0.01) {
        cg.save(); cg.translate(cw * 0.4, 400); cg.scale(bg, bg); cg.rotate(-0.04);
        cg.font = `700 110px ${UI.HEAD}`;
        const bw2 = cg.measureText(sh.big).width + 120;
        cg.fillStyle = up ? UI.green : UI.red; cg.beginPath(); cg.roundRect(-bw2 / 2, -90, bw2, 180, 90); cg.fill();
        text(cg, sh.big, 0, 40, { font: UI.HEAD, weight: 700, size: 110, color: '#fff', align: 'center' });
        cg.restore();
      }
    }
  });
};

L.bars = (g, sh, x) => {
  push(g, x, { from: 1, to: 1.05 });
  card(g, 220, 90, W - 440, 880, { r: 36 }, (cg, cw, ch) => {
    if (sh.title) statement(cg, x.T, tight(landing(x.words, sh.title, x.a, x.b), x.a), [sh.title], cw / 2, 90, { size: 52 });
    const n = sh.bars.length, bw = Math.min(200, 1100 / n), gap = bw * 0.5;
    const total = n * bw + (n - 1) * gap, base = ch - 130, max = sh.max || Math.max(...sh.bars.map((b) => b.value + (b.top || 0)));
    const hmax = ch - 330;
    sh.bars.forEach((b, i) => {
      const at0 = b.when ? when(x.words, b.when, x.a) : x.a + 0.3 + i * 0.25;
      const at = i === 0 ? Math.min(at0, x.a + 0.35) : at0;
      const gr = spring(x.T, at, { freq: 1.2, damp: 0.75 });
      const h = (b.value / max) * hmax * gr, ht = ((b.top || 0) / max) * hmax * gr;
      const bx = cw / 2 - total / 2 + i * (bw + gap);
      cg.fillStyle = b.color === 'gold' ? '#f5b98a' : b.color === 'red' ? UI.red : UI.purple;
      cg.beginPath(); cg.roundRect(bx, base - h, bw, h, [18, 18, 6, 6]); cg.fill();
      if (ht > 0.5) { cg.fillStyle = UI.red; cg.beginPath(); cg.roundRect(bx, base - h - ht, bw, ht + 10, [18, 18, 0, 0]); cg.fill(); }
      text(cg, b.label || '', bx + bw / 2, base + 52, { font: UI.BODY, weight: 600, size: 26, color: UI.muted, align: 'center', alpha: Math.min(1, gr) });
    });
  });
};

L.swarm = (g, sh, x) => {
  push(g, x, { from: 1.3, to: 1.0, focus: [W / 2, 640] });
  const cols = 34, rows = 13, gp = 52, ox = W / 2 - ((cols - 1) * gp) / 2, oy = 360;
  const r = rand(8);
  const redAt = sh.redWhen ? when(x.words, sh.redWhen, x.a) : 1e9;
  for (let i = 0; i < cols * rows; i++) {
    const c = i % cols, rr = Math.floor(i / cols);
    const ap = spring(x.T, x.a + Math.hypot(c - 17, rr - 6) * 0.03, { freq: 2.2, damp: 0.6 });
    const hit = r() < (sh.red ?? 0);
    const f = hit ? ease(x.T, redAt + c * 0.02, 0.5) : 0;
    avatar(g, ox + c * gp, oy + rr * gp, 21 * Math.max(0, ap), f > 0.5 ? '#f4a597' : FILLS[i % 5]);
  }
  const at = Math.min(sh.when ? when(x.words, sh.when, x.a) : x.a + 0.4, x.a + 0.35);
  const lab = clean(sh.label || '');
  const isNum = /\d/.test(lab);
  card(g, 150, 70, isNum ? 720 : 860, 230, { alpha: ease(x.T, x.a, 0.4) }, (cg) => {
    if (isNum) odometer(cg, x.T, at - 0.1, lab, 44, 170, { size: 120 });
    else headline(cg, x.T, [lab], 44, 160, at - 0.1, 1e9, { size: Math.min(110, sh.size ? sh.size * 0.5 : 110), color: sh.red > 0.5 ? UI.red : UI.purple, weight: 700 });
  });
  if (sh.sub) pill(g, clean(sh.sub), 1400, 150, at + 0.4, x.T, { size: 32, fill: UI.amber, color: UI.amberInk });
};

L.map = (g, sh, x) => {
  const from = sh.from || [78, 21, 18], to = sh.to || from;
  const fly = ez.p2InOut(span(x.T, x.a, (sh.flight || Math.min(3.2, x.b - x.a)) * 1.1));
  const k = Math.exp(lerp(Math.log(from[2] * 1.7), Math.log(to[2] * 1.7), fly)) * (1 + 0.04 * x.p);
  const proj = lightMap(g, lerp(from[0], to[0], fly), lerp(from[1], to[1], fly), k);
  const doubt = sh.doubt ? ease(x.T, when(x.words, sh.doubt, x.a), 0.6) : 0;
  (sh.routes || []).forEach((rt) => {
    const at = rt.when ? when(x.words, rt.when, x.a) : x.a + 1;
    const p = inOut(x.T, at, 1.3);
    if (p <= 0) return;
    const [ax, ay] = proj(rt.from), [bx, by] = proj(rt.to);
    const mx = (ax + bx) / 2, my = (ay + by) / 2 - Math.hypot(bx - ax, by - ay) * (rt.lift ?? 0.25);
    g.save(); g.setLineDash([3, 16]); g.lineCap = 'round'; g.strokeStyle = UI.purple; g.lineWidth = 6;
    g.beginPath();
    for (let i = 0; i <= 50 * p; i++) { const t = i / 50; const px = (1 - t) ** 2 * ax + 2 * (1 - t) * t * mx + t * t * bx, py = (1 - t) ** 2 * ay + 2 * (1 - t) * t * my + t * t * by; i ? g.lineTo(px, py) : g.moveTo(px, py); }
    g.stroke(); g.restore();
    if (rt.ship) routeShip(g, x.T, at + 0.6, (t) => [(1 - t) ** 2 * ax + 2 * (1 - t) * t * mx + t * t * bx, (1 - t) ** 2 * ay + 2 * (1 - t) * t * my + t * t * by]);
  });
  const pins = [...(sh.pins || []).map((p) => ({ ...p, ll: p.at })), ...(sh.hubs || []).map((h, i) => ({ ll: h, label: '', when: sh.hubsWhen, i }))];
  pins.forEach((pn, i) => {
    const [px, py] = proj(pn.ll);
    const at0 = (pn.when ? when(x.words, pn.when, x.a) : x.a + 0.8) + (pn.i || 0) * 0.15;
    const at = i === 0 ? Math.min(at0, x.a + 0.5) : at0;
    mapPin(g, x.T, at, px, py, { scale: 0.85, color: doubt > 0.5 ? UI.red : UI.purple });
    if (pn.label) {
      const lp = spring(x.T, at + 0.15, { freq: 1.8, damp: 0.65 });
      g.font = `600 26px ${UI.BODY}`;
      const lw = g.measureText(pn.label).width + 40;
      chip(g, pn.label, pn.side < 0 ? px - 30 - lw : px + 30, py - 26, { size: 26, weight: 600, scale: lp, alpha: Math.min(1, lp), stroke: null });
    }
  });
  if (sh.text) pill(g, clean(sh.text), W / 2, 110, x.a + 0.6, x.T, { size: 32 });
};

L.profile = (g, sh, x) => {
  push(g, x, { from: 1, to: 1.05 });
  const ein = spring(x.T, x.a, { freq: 1.2, damp: 0.75 });
  card(g, 260 - (1 - Math.min(1, ein)) * 200, 170, 560, 700, { alpha: Math.min(1, ein * 1.4) }, (cg, cw, ch) => {
    cg.fillStyle = UI.soft; cg.fillRect(0, 0, cw, 500);
    if (sh.icon === 'trophy') trophy(cg, cw / 2, 260, 230);
    else if (sh.icon === 'building') { building(cg, 200, 470, 130, 330, UI.purple, 1); building(cg, 360, 470, 150, 260, '#7c5cc4', 2); }
    else avatar(cg, cw / 2, 260, 190, '#b9a6f0');
    if (sh.caption) text(cg, sh.caption, cw / 2, 600, { font: UI.BODY, weight: 600, size: 30, color: UI.muted, align: 'center' });
  });
  const lines = (sh.name || '').split('|').map((l) => l.replace(/\*/g, ''));
  headline(g, x.T, lines, 940, 440, x.a + 0.3, 1e9, { size: lines.some((l) => l.length > 14) ? 80 : 100, color: TH.accent });
  if (sh.role) pill(g, clean(sh.role), 940 + 260, 440 + lines.length * 108 - 30, x.a + 0.9, x.T, { size: 28, fill: UI.soft, color: UI.purple });
};

L.doc = (g, sh, x) => {
  push(g, x, { from: 1.03, to: 1.09 });
  g.save(); g.translate(W / 2, H / 2); g.rotate(-0.015); g.translate(-W / 2, -H / 2);
  const ein = spring(x.T, x.a, { freq: 1.1, damp: 0.8 });
  card(g, 230, 90 + (1 - Math.min(1, ein)) * 400, 1460, 1100, { r: 34, alpha: Math.min(1, ein * 1.5) }, (cg, cw) => {
    if (sh.heading) text(cg, clean(sh.heading), 70, 110, { font: UI.HEAD, weight: 700, size: 44, color: UI.purple });
    cg.fillStyle = UI.line; cg.fillRect(70, 150, cw - 140, 2);
    let y = 270;
    (sh.rows || []).forEach((row, i) => {
      const at0 = row.when ? when(x.words, row.when, x.a) : x.a + 0.4 + i * 0.6;
      const at = i === 0 ? Math.min(at0, x.a + 0.35) : at0;
      if (row.mark) { const m = ease(x.T, at + 0.9, 0.6); if (m > 0) { cg.fillStyle = 'rgba(217,204,255,0.6)'; cg.fillRect(60, y - 62, (cw - 120) * m, 86); } }
      text(cg, row.label.slice(0, Math.floor(row.label.length * clamp((x.T - at + 0.1) / (0.6 * TEMPO)))), 70, y, { font: UI.BODY, weight: 600, size: 52, color: UI.ink });
      if (row.value) odometer(cg, x.T, at + 0.5, row.value, cw - 70, y, { size: 60, align: 'right', color: UI.red });
      if (row.tag) pill(cg, row.tag, cw - 260, y + (row.value ? 30 : -50), row.tagWhen ? when(x.words, row.tagWhen, at) : at + 1, x.T, { size: 30, fill: UI.redSoft, color: '#a3261a' });
      y += 170;
    });
    if (sh.typed) typeOn(cg, x.T, x.a + 0.4, sh.typed, 70, y, { size: 50, maxW: cw - 160, cps: 26, lineH: 1.55, color: '#2b2838' });
  });
  g.restore();
};

L.quote = (g, sh, x) => {
  if (sh.bg === 'tiger') {
    g.save(); g.globalAlpha = 0.5;
    for (let i = 0; i < 14; i++) { g.fillStyle = 'rgba(255,170,110,0.35)'; g.save(); g.translate(i * 160 - 100 + x.p * 60, 0); g.rotate(0.25); g.fillRect(0, -200, 50, H + 400); g.restore(); }
    g.restore();
  }
  push(g, x, { from: 1, to: 1.05 });
  const at = Math.min(sh.when ? when(x.words, sh.when, x.a) : x.a, x.a + 0.35);
  const end = sh.until ? when(x.words, sh.until, at) : x.b - 0.6;
  const ein = spring(x.T, x.a, { freq: 1.2, damp: 0.78 });
  card(g, 240, 200 + (1 - Math.min(1, ein)) * 300, 1440, 640, { r: 40, alpha: Math.min(1, ein * 1.4) }, (cg, cw) => {
    text(cg, '“', 60, 230, { font: UI.HEAD, weight: 700, size: 260, color: UI.purple });
    const cps = sh.text.length / Math.max(0.8, end - at);
    typeOn(cg, x.T, at, sh.text, 230, 190, { size: 60, maxW: cw - 320, cps, lineH: 1.45, color: UI.ink, font: UI.HEAD, weight: 600 });
    if (sh.by) text(cg, sh.by, cw - 70, 580, { font: UI.BODY, size: 30, color: UI.muted, align: 'right', alpha: ease(x.T, end, 0.5) });
  });
};

L.letters = (g, sh, x) => {
  push(g, x, { from: 1, to: 1.05 });
  const word = sh.word, n = word.length;
  const at = Math.min(sh.when ? when(x.words, sh.when, x.a) : x.a + 0.2, x.a + 0.3);
  const flipAt = sh.toWhen ? when(x.words, sh.toWhen, at) : 1e9;
  const flip = inOut(x.T, flipAt - 0.4, 0.9);
  for (let i = 0; i < n; i++) {
    const slot = lerp(i, n - 1 - i, sh.reverse ? flip : 0);
    const arc = Math.sin(flip * Math.PI) * (i < n / 2 ? -170 : 170) * (sh.reverse ? 1 : 0);
    const s = spring(x.T, at + i * 0.06, { freq: 1.7, damp: 0.6 });
    if (s <= 0.01) continue;
    g.save(); g.translate(W / 2 + (slot - (n - 1) / 2) * 220, 470 + arc); g.scale(s, s);
    card(g, -95, -120, 190, 240, { r: 30 }, (cg) => text(cg, word[i], 95, 172, { font: UI.HEAD, weight: 700, size: 170, color: i % 2 ? UI.purple : UI.ink, align: 'center' }));
    g.restore();
  }
  if (sh.sub) pill(g, clean(sh.sub), W / 2, 780, sh.toWhen ? flipAt + 0.6 : at + 0.8, x.T, { size: 36, fill: UI.soft, color: UI.purple });
};

L.list = (g, sh, x) => {
  push(g, x, { from: 1, to: 1.04 });
  const times = sh.items.map((it, i) => (it.when ? when(x.words, it.when, x.a) : x.a + 0.3 + i * 1.3)).map((t, i) => (i === 0 ? Math.min(t, x.a + 0.35) : t));
  const cur = times.reduce((k, tm, i) => (x.T >= tm - 0.15 ? i : k), -1);
  const n = sh.items.length;
  sh.items.forEach((it, i) => {
    if (i > cur) return;
    const toRow = i < cur ? inOut(x.T, times[i + 1] - 0.15, 0.6) : 0;
    const rowX = W / 2 + (i - (n - 1) / 2) * Math.min(440, 1700 / n), rowY = 170;
    const cx = lerp(W / 2, rowX, toRow), cy = lerp(H / 2 + 60, rowY, toRow), sc = lerp(1, 0.38, toRow);
    const s = spring(x.T, times[i], { freq: 1.4, damp: 0.7 }) * sc;
    if (s <= 0.01) return;
    const hh = it.sub ? 380 : 270;
    g.save(); g.translate(cx, cy); g.scale(s, s);
    card(g, -520, -hh / 2, 1040, hh, { r: 40, fill: it.color === 'yellow' ? '#fff4d6' : '#fff' }, (cg, cw, ch) => {
      if (it.num) { cg.fillStyle = UI.purple; cg.beginPath(); cg.arc(110, ch / 2, 62, 0, Math.PI * 2); cg.fill(); text(cg, it.num, 110, ch / 2 + 30, { font: UI.HEAD, weight: 700, size: 80, color: '#fff', align: 'center' }); }
      text(cg, it.text, it.num ? 600 : cw / 2, it.sub ? 160 : ch / 2 + 34, { font: UI.HEAD, weight: 700, size: it.text.length > 16 ? 70 : it.text.length > 12 ? 80 : 92, color: UI.ink, align: 'center' });
      if (it.sub) text(cg, it.sub, it.num ? 600 : cw / 2, 280, { font: UI.BODY, size: 46, color: UI.muted, align: 'center' });
    });
    if (it.circle && toRow === 0) {
      const c = ease(x.T, times[i] + 0.4, 0.8);
      g.strokeStyle = UI.purple; g.lineWidth = 8; g.lineCap = 'round';
      g.beginPath(); g.roundRect(-550, -hh / 2 - 30, 1100 * c, hh + 60, 50); g.stroke();
    }
    g.restore();
  });
  if (sh.title) pill(g, clean(sh.title), W / 2, 980, x.a + 0.4, x.T, { size: 30, fill: UI.soft, color: UI.purple });
};

function icon(cg, kind, cx, cy) {
  if (kind === 'buildings') { building(cg, cx - 110, cy + 90, 90, 170, UI.purple, 1); building(cg, cx, cy + 90, 100, 220, '#7c5cc4', 2); building(cg, cx + 110, cy + 90, 80, 140, UI.purple, 3); }
  else if (kind === 'computer') { cg.fillStyle = UI.purple; cg.beginPath(); cg.roundRect(cx - 110, cy - 90, 220, 150, 14); cg.fill(); cg.fillStyle = '#e6dcff'; cg.fillRect(cx - 92, cy - 72, 184, 114); cg.fillStyle = UI.purple; cg.fillRect(cx - 18, cy + 60, 36, 26); cg.fillRect(cx - 70, cy + 84, 140, 14); }
  else if (kind === 'cash') { for (let k = 0; k < 5; k++) { cg.fillStyle = k % 2 ? '#9fd4b4' : '#7fc19c'; cg.beginPath(); cg.roundRect(cx - 120 + k * 8, cy + 40 - k * 26, 240, 80, 10); cg.fill(); } }
}

L.flow = (g, sh, x) => {
  const times = sh.nodes.map((nd, i) => (nd.when ? when(x.words, nd.when, x.a) : x.a + 0.3 + i * 1.5)).map((t, i) => (i === 0 ? Math.min(t, x.a + 0.35) : t));
  const cur = times.reduce((k, tm, i) => (x.T >= tm - 0.4 ? i : k), 0);
  const gapX = 860;
  const camX = lerp(Math.max(0, cur - 1) * gapX, cur * gapX, inOut(x.T, times[cur] - 0.4, 0.8));
  g.save();
  g.translate(W / 2 - (sh.nodes.length > 1 ? camX - gapX / 2 : 0), 0);
  sh.nodes.forEach((nd, i) => {
    const nx = i * gapX;
    if (i > 0) {
      const p = inOut(x.T, times[i] - 0.5, 0.6);
      if (p > 0) { g.save(); g.setLineDash([4, 18]); g.lineCap = 'round'; g.strokeStyle = UI.purple; g.lineWidth = 8; g.beginPath(); g.moveTo(nx - gapX + 330, H / 2); g.lineTo(nx - gapX + 330 + (gapX - 660) * p, H / 2); g.stroke(); g.restore(); }
    }
    const s = spring(x.T, times[i], { freq: 1.5, damp: 0.68 });
    if (s <= 0.01) return;
    g.save(); g.translate(nx, H / 2); g.scale(s, s);
    card(g, -300, -260, 600, 520, { r: 40, fill: nd.color === 'yellow' ? '#fff4d6' : '#fff' }, (cg, cw) => {
      if (nd.img && nd.fit === 'cover') photoIn(cg, nd.img, 0, 0, cw, 300, { zoom: lerp(1.15, 1, ease(x.T, times[i], 3)) });
      else if (nd.img) imageIn(cg, nd.img, 60, 70, cw - 120, 200);
      else if (nd.icon) icon(cg, nd.icon, cw / 2, 170);
      const ty = nd.icon || nd.img ? 380 : 270;
      text(cg, nd.text, cw / 2, ty, { font: UI.HEAD, weight: 700, size: nd.text.length > 14 ? 48 : 66, color: UI.ink, align: 'center' });
      if (nd.sub) text(cg, nd.sub, cw / 2, ty + 58, { font: UI.BODY, size: 34, color: UI.muted, align: 'center' });
    });
    g.restore();
  });
  g.restore();
  if (sh.money) pill(g, sh.money.text, W / 2, 900, when(x.words, sh.money.when, x.a), x.T, { size: 56, fill: UI.purple, color: '#fff', weight: 700 });
  if (sh.title) pill(g, clean(sh.title), W / 2, 110, x.a + 0.4, x.T, { size: 32, fill: UI.soft, color: UI.purple });
};

L.vs = (g, sh, x) => {
  push(g, x, { from: 1, to: 1.05 });
  [sh.left, sh.right].forEach((side, i) => {
    const at0 = side.when ? when(x.words, side.when, x.a) : x.a + 0.3 + i * 1.5;
    const at = i === 0 ? Math.min(at0, x.a + 0.35) : at0;
    const s = spring(x.T, at - 0.1, { freq: 1.4, damp: 0.7 });
    if (s <= 0.01) return;
    const cx = W / 2 + (i ? 1 : -1) * 430;
    g.save(); g.translate(cx, 540); g.scale(s, s);
    card(g, -360, -260, 720, 520, { r: 40 }, (cg, cw) => {
      odometer(cg, x.T, at, side.value, cw / 2, 300, { size: 210, align: 'center', color: side.color === 'red' ? UI.red : UI.ink });
      text(cg, clean(side.label), cw / 2, 420, { font: UI.BODY, weight: 600, size: 40, color: UI.muted, align: 'center' });
    });
    g.restore();
  });
  if (sh.title) pill(g, clean(sh.title), W / 2, 130, x.a + 0.3, x.T, { size: 32, fill: UI.soft, color: UI.purple });
};

L.email = (g, sh, x) => {
  // an inbox-style email card; the body types out between `when` and `until`
  push(g, x, { from: 1, to: 1.06, focus: [W / 2, 520] });
  const at = Math.min(sh.when ? when(x.words, sh.when, x.a) : x.a + 0.4, x.a + 0.8);
  const end = sh.until ? when(x.words, sh.until, at) : x.b - 0.5;
  const ein = spring(x.T, x.a, { freq: 1.1, damp: 0.8 });
  card(g, 300, 120 + (1 - Math.min(1, ein)) * 380, 1320, 860, { r: 36, alpha: Math.min(1, ein * 1.5) }, (cg, cw) => {
    cg.fillStyle = UI.soft; cg.fillRect(0, 0, cw, 96);
    [['#ff6b5f', 40], ['#ffbd2e', 72], ['#28c840', 104]].forEach(([c, xx]) => { cg.fillStyle = c; cg.beginPath(); cg.arc(xx, 48, 11, 0, Math.PI * 2); cg.fill(); });
    text(cg, 'New message', cw / 2, 60, { font: UI.BODY, weight: 600, size: 26, color: UI.muted, align: 'center' });
    const row = (k, label, val, y) => { const p = ease(x.T, x.a + 0.3 + k * 0.12, 0.5); text(cg, label, 60, y, { font: UI.BODY, size: 28, color: UI.faint, alpha: p }); text(cg, val, 170, y, { font: UI.BODY, weight: 600, size: 30, color: UI.ink, alpha: p }); };
    row(0, 'From', sh.from || '', 170); row(1, 'To', sh.to || '', 225); row(2, 'Date', sh.date || '', 280);
    cg.fillStyle = UI.line; cg.fillRect(60, 320, cw - 120, 2);
    text(cg, sh.subject || '', 60, 395, { font: UI.HEAD, weight: 700, size: 44, color: UI.ink, alpha: ease(x.T, x.a + 0.6, 0.5) });
    const cps = sh.body.length / Math.max(1, end - at);
    typeOn(cg, x.T, at, sh.body, 60, 480, { size: 44, maxW: cw - 140, cps, lineH: 1.5, color: '#2b2838' });
  });
};

L.title = (g, sh, x) => {
  push(g, x, { from: 1.05, to: 1 });
  const word = sh.title || 'Toppled Giants';
  g.font = `700 170px ${UI.HEAD}`;
  const ws = [...word].map((ch) => g.measureText(ch).width - 3);
  let cx = W / 2 - ws.reduce((a, c) => a + c, 0) / 2;
  [...word].forEach((ch, i) => {
    const p = ez.expoOut(span(x.T, x.a + 0.3 + i * 0.03, 0.6 * TEMPO));
    g.save(); g.beginPath(); g.rect(cx - 10, H / 2 - 150, ws[i] + 20, 200); g.clip();
    text(g, ch, cx, H / 2 + 30 + (1 - p) * 180, { font: UI.HEAD, weight: 700, size: 170, color: UI.purple, spacing: -3 });
    g.restore();
    cx += ws[i];
  });
  const ln = ease(x.T, x.a + 0.9, 0.8);
  g.fillStyle = UI.purple; g.fillRect(W / 2 - 300 * ln, H / 2 + 80, 600 * ln, 6);
  pill(g, sh.sub || '', W / 2, H / 2 + 130, x.a + 1.1, x.T, { size: 28 });
};

L.export = (g, sh, x) => {
  // a chip travels from the US towards China across the Pacific; a wall slams down and the line snaps
  const k = 4.3 * (1 + 0.05 * x.p);
  const proj = lightMap(g, -172, 30, k, { wrap: true });
  const US = proj(sh.from || [-121.97, 37.37]), CN = proj([(sh.to || [104, 35])[0] - 360, (sh.to || [104, 35])[1]]);
  const cutAt = sh.cut ? when(x.words, sh.cut, x.a) : x.a + 2.2;
  const mid = [(US[0] + CN[0]) / 2, Math.min(US[1], CN[1]) - 300];
  const P = (t) => [(1 - t) ** 2 * US[0] + 2 * (1 - t) * t * mid[0] + t * t * CN[0], (1 - t) ** 2 * US[1] + 2 * (1 - t) * t * mid[1] + t * t * CN[1]];
  const travel = inOut(x.T, x.a + 0.2, Math.max(0.6, (cutAt - x.a - 0.2) / TEMPO));
  const reach = Math.min(travel * 0.5, 0.5);        // the chip stops at the wall (half-way)
  const snap = ease(x.T, cutAt + 0.15, 0.8);
  // the line: drawn up to the chip; after the cut, the far half falls away
  g.save(); g.lineCap = 'round'; g.setLineDash([3, 16]); g.lineWidth = 7;
  g.strokeStyle = UI.purple;
  g.beginPath(); for (let i = 0; i <= 60; i++) { const t = (i / 60) * reach; const [px, py] = P(t); i ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke();
  if (x.T < cutAt + 0.15) {
    const far = Math.max(0, travel - 0.5);
    if (far > 0) { g.beginPath(); for (let i = 0; i <= 40; i++) { const t = 0.5 + (i / 40) * far; const [px, py] = P(t); i ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); }
  } else {
    g.globalAlpha = 1 - snap; g.strokeStyle = UI.red;
    g.beginPath(); for (let i = 0; i <= 40; i++) { const t = 0.5 + (i / 40) * 0.5; const [px, py] = P(t); i ? g.lineTo(px, py + snap * snap * 500) : g.moveTo(px, py + snap * snap * 500); } g.stroke();
  }
  g.restore();
  // the wall
  const [wx, wy] = P(0.5);
  const wl = spring(x.T, cutAt, { freq: 1.6, damp: 0.55 });
  if (wl > 0.01) {
    g.save(); g.translate(wx + 40, wy + 120);
    g.fillStyle = UI.red; g.shadowColor = 'rgba(226,65,46,0.4)'; g.shadowBlur = 30;
    g.beginPath(); g.roundRect(-18, -340 * Math.min(1.1, wl), 36, 340 * Math.min(1.1, wl), 18); g.fill();
    g.restore();
    pill(g, 'EXPORT LIMITS', wx + 40, wy - 280, cutAt + 0.2, x.T, { size: 28, fill: UI.red, color: '#fff', weight: 700 });
  }
  // the chip, bouncing back off the wall
  const bounce = x.T > cutAt ? Math.sin(Math.min(1, (x.T - cutAt) / 0.4) * Math.PI) * 0.04 : 0;
  const [chx, chy] = P(Math.max(0, reach - bounce - 0.02));
  if (travel > 0) {
    g.save(); g.translate(chx, chy); g.rotate(Math.sin(x.T * 3) * 0.05);
    g.fillStyle = '#2b2440'; g.beginPath(); g.roundRect(-42, -42, 84, 84, 12); g.fill();
    g.fillStyle = '#76b900'; g.beginPath(); g.roundRect(-26, -26, 52, 52, 8); g.fill();
    g.strokeStyle = '#2b2440'; g.lineWidth = 5;
    for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(i * 15, -42); g.lineTo(i * 15, -56); g.moveTo(i * 15, 42); g.lineTo(i * 15, 56); g.moveTo(-42, i * 15); g.lineTo(-56, i * 15); g.moveTo(42, i * 15); g.lineTo(56, i * 15); g.stroke(); }
    g.restore();
  }
  mapPin(g, x.T, x.a + 0.1, US[0], US[1], { scale: 0.85 });
  mapPin(g, x.T, x.a + 0.25, CN[0], CN[1], { scale: 0.85, color: UI.red });
  chip(g, 'United States', US[0] + 30, US[1] - 26, { size: 26, weight: 600, stroke: null, alpha: ease(x.T, x.a + 0.3, 0.4) });
  g.font = `600 26px ${UI.BODY}`;
  chip(g, 'China', CN[0] - 30 - g.measureText('China').width - 40, CN[1] - 26, { size: 26, weight: 600, stroke: null, alpha: ease(x.T, x.a + 0.45, 0.4) });
  if (sh.text) pill(g, clean(sh.text), W / 2, 960, x.a + 0.5, x.T, { size: 30 });
};

L.sting = (g, sh, x) => {
  // channel sting: a tower of letter tiles topples, and the tiles land to spell the name
  const word = (sh.title || 'Toppled Giants').toUpperCase();
  const lines = word.split(' ');
  const letters = lines.join('');
  const n = letters.length, s0 = 70;
  const t = x.T - x.a;
  const impact = 1.5;
  const tilt = t < 0.55 ? 0 : Math.min(Math.PI / 2, ((t - 0.55) / (impact - 0.55)) ** 2 * (Math.PI / 2));
  const bx = W * 0.36, by = 1000;            // tower base (pivot at its right edge)
  const targets = [];
  lines.forEach((ln, li) => {
    const size = 150, gap = 14, total = ln.length * size + (ln.length - 1) * gap;
    for (let i = 0; i < ln.length; i++) targets.push([W / 2 - total / 2 + i * (size + gap) + size / 2, 430 + li * 190, size]);
  });
  for (let i = 0; i < n; i++) {
    const drop = spring(x.T, x.a + i * 0.03, { freq: 2.2, damp: 0.7 });
    if (drop <= 0.01) continue;
    // position in the tower (bottom tile = 0), rotated around the pivot
    const lx = -s0 / 2, ly = -(i + 0.5) * s0 - (1 - Math.min(1, drop)) * 400;
    const c = Math.cos(tilt), sn = Math.sin(tilt);
    const tx = bx + s0 / 2 + lx * c - ly * sn, ty = by + lx * sn + ly * c;
    const fly = spring(x.T, x.a + impact + i * 0.035, { freq: 1.3, damp: 0.72 });
    const [gx, gy, gs] = targets[i];
    const px = lerp(tx, gx, Math.min(1, fly)) + (fly > 1 ? (fly - 1) * 0 : 0), py = lerp(ty, gy, fly);
    const size = lerp(s0, gs, Math.min(1, fly));
    const rot = lerp(tilt, 0, Math.min(1, fly)) + (1 - Math.min(1, fly)) * ((i % 3) - 1) * 0.6;
    g.save(); g.translate(px, py); g.rotate(rot);
    card(g, -size / 2, -size / 2, size, size, { r: size * 0.18, lift: 0.8 }, (cg) => text(cg, letters[i], size / 2, size * 0.72, { font: UI.HEAD, weight: 700, size: size * 0.66, color: i % 2 ? UI.purple : UI.ink, align: 'center' }));
    g.restore();
  }
  // dust at the moment of impact
  const d = span(x.T, x.a + impact, 0.9);
  if (d > 0 && d < 1) {
    const r = rand(3);
    for (let k = 0; k < 26; k++) {
      const ang = Math.PI + r() * Math.PI, sp = 120 + r() * 380;
      g.fillStyle = `rgba(150,130,200,${0.35 * (1 - d)})`;
      g.beginPath(); g.arc(bx + 600 + Math.cos(ang) * sp * d, by - 10 + Math.sin(ang) * sp * d * 0.4, 8 + r() * 16, 0, Math.PI * 2); g.fill();
    }
  }
  if (sh.sub) pill(g, sh.sub, W / 2, 760, x.a + impact + 0.9, x.T, { size: 30 });
};

L.subscribe = (g, sh, x) => {
  // the YouTube-style subscribe moment: card, cursor click, button turns to Subscribed, bell rings
  push(g, x, { from: 1, to: 1.04 });
  const ein = spring(x.T, x.a, { freq: 1.3, damp: 0.72 });
  const clickAt = sh.clickWhen ? when(x.words, sh.clickWhen, x.a) : x.a + (sh.clickAt ?? 1.8);
  const done = x.T > clickAt + 0.1;
  const bell = spring(x.T, clickAt + 0.5, { freq: 2, damp: 0.5 });
  g.save(); g.translate(W / 2, 470); g.scale(Math.min(1.05, ein), Math.min(1.05, ein)); g.translate(-W / 2, -470);
  card(g, 360, 300, 1200, 340, { r: 44, alpha: Math.min(1, ein * 1.4) }, (cg, cw) => {
    // channel avatar (TG monogram)
    cg.fillStyle = UI.purple; cg.beginPath(); cg.arc(130, 170, 86, 0, Math.PI * 2); cg.fill();
    text(cg, 'TG', 130, 200, { font: UI.HEAD, weight: 700, size: 76, color: '#fff', align: 'center' });
    text(cg, sh.channel || 'Toppled Giants', 250, 150, { font: UI.HEAD, weight: 700, size: 56, color: UI.ink });
    text(cg, sh.handle || '@ToppledGiants', 252, 205, { font: UI.BODY, size: 30, color: UI.muted });
    // button
    const press = span(x.T, clickAt, 0.1) * (1 - span(x.T, clickAt + 0.1, 0.15));
    const bw = done ? 290 : 300, bxx = cw - bw - 160, byy = 125;
    cg.save(); cg.translate(bxx + bw / 2, byy + 45); cg.scale(1 - press * 0.08, 1 - press * 0.08);
    cg.fillStyle = done ? '#ececf0' : '#ff0033';
    cg.beginPath(); cg.roundRect(-bw / 2, -45, bw, 90, 45); cg.fill();
    text(cg, done ? 'Subscribed' : 'Subscribe', 0, 14, { font: UI.BODY, weight: 600, size: 34, color: done ? UI.ink : '#fff', align: 'center' });
    cg.restore();
    // bell
    if (done) {
      cg.save(); cg.translate(cw - 90, byy + 45); cg.rotate(Math.sin((x.T - clickAt) * 18) * 0.35 * Math.max(0, 1 - (x.T - clickAt - 0.5) / 1.2)); cg.scale(Math.min(1, bell), Math.min(1, bell));
      cg.fillStyle = UI.ink;
      cg.beginPath(); cg.moveTo(-26, 20); cg.quadraticCurveTo(-26, -30, 0, -32); cg.quadraticCurveTo(26, -30, 26, 20); cg.lineTo(32, 26); cg.lineTo(-32, 26); cg.closePath(); cg.fill();
      cg.beginPath(); cg.arc(0, 34, 8, 0, Math.PI * 2); cg.fill();
      cg.restore();
    }
  });
  g.restore();
  cursor(g, x.T, [1500, 980], [1255, 470], x.a + 0.4, clickAt);
  if (sh.text) pill(g, sh.text, W / 2, 720, x.a + 0.5, x.T, { size: 30, fill: UI.soft, color: UI.purple });
};

L.chapter = (g, sh, x) => {
  push(g, x, { from: 1.05, to: 1 });
  const k = pick(sh.img);
  if (k) { g.save(); g.globalAlpha = 0.18; photoIn(g, k, 0, 0, W, H, { zoom: 1.2 }); g.restore(); g.fillStyle = 'rgba(246,242,255,0.6)'; g.fillRect(0, 0, W, H); }
  const s = spring(x.T, x.a + 0.15, { freq: 1.3, damp: 0.6 });
  g.save(); g.translate(W / 2, 400); g.scale(s, s);
  g.fillStyle = UI.purple; g.beginPath(); g.arc(0, 0, 96, 0, Math.PI * 2); g.fill();
  text(g, String(sh.num).padStart(2, '0'), 0, 36, { font: UI.HEAD, weight: 700, size: 100, color: '#fff', align: 'center' });
  g.restore();
  pill(g, `Chapter ${sh.num}`, W / 2, 530, x.a + 0.35, x.T, { size: 28, fill: UI.soft, color: UI.purple });
  headline(g, x.T, [sh.title], W / 2, 720, x.a + 0.5, 1e9, { size: 120, align: 'center', weight: 700 });
};

L.tear = (g, sh, x) => {
  push(g, x, { from: 1, to: 1.06 });
  const at = Math.min(sh.when ? when(x.words, sh.when, x.a) : x.a + 0.2, x.a + 0.3);
  const tearAt = sh.tearWhen ? when(x.words, sh.tearWhen, at) : at + 0.8;
  const tp = ease(x.T, at - 0.1, 0.5);
  const split = ease(x.T, tearAt, 0.8);
  if (tp <= 0) return;
  for (const side of [-1, 1]) {
    g.save();
    g.translate(W / 2 + side * split * 90, H / 2 + side * split * 20);
    g.rotate(side * split * 0.05);
    g.scale(lerp(1.6, 1, tp), lerp(1.6, 1, tp));
    g.beginPath();
    const r = rand(5);
    g.moveTo(side * 1100, -220);
    for (let i = 0; i <= 12; i++) g.lineTo((r() - 0.5) * 60, -220 + i * 36);
    g.lineTo(side * 1100, 220);
    g.closePath(); g.clip();
    g.globalAlpha = Math.min(1, tp * 2) * (1 - split * 0.3);
    text(g, sh.word, 0, 90, { font: UI.HEAD, weight: 700, size: 260, color: sh.color === 'ink' ? UI.ink : UI.purple, align: 'center' });
    g.restore();
  }
  if (sh.sub) pill(g, clean(sh.sub), W / 2, 820, tearAt + 0.4, x.T, { size: 34, fill: UI.soft, color: UI.purple });
};

L.diner = (g, sh, x) => {
  diner(g, x, { year: sh.year || '1993', sketchAt: sh.sketch ? when(x.words, sh.sketch, x.a) : x.a + 2 });
  if (sh.text) pill(g, clean(sh.text), W / 2, 980, x.a + 0.5, x.T, { size: 30 });
};

Object.assign(L, ACTS);

function overlays(g, sh, x) {
  // story effects tied to a spoken word: hearts, raining chips, a spy, a surveillance scan
  const fxAt = (sh.fx || []).map((f) => (f.when != null ? when(x.words, f.when, x.a) : x.a));
  (sh.fx || []).forEach((f, i) => {
    const at = fxAt[i];
    if (f.kind === 'hearts') hearts(g, x.T, at, f.dur ?? 2.4);
    if (f.kind === 'chips') chipRain(g, x.T, at, f.dur ?? 2);
    if (f.kind === 'spy') spy(g, x.T, at, { out: fxAt[i + 1] ?? 1e9 });
  });
  if (sh.scan) {
    const at = sh.scan.when ? when(x.words, sh.scan.when, x.a) : x.a + 0.5;
    scanHUD(g, x.T, at, sh.scan.rect || [260, 170, 560, 700], { lines: sh.scan.lines || [], label: sh.scan.label || 'SURVEILLANCE · REPORTED', readout: sh.scan.readout || [940, 640], lensPath: [[420, 380], [640, 470], [540, 420]] });
  }
  if (sh.stamp) {
    const at = when(x.words, sh.stamp.when, x.a) + (sh.stamp.delay || 0);
    const s = spring(x.T, at, { freq: 1.8, damp: 0.5 });
    if (s > 0.01) {
      const sx = sh.stamp.x ?? W / 2, sy = sh.stamp.y ?? H * 0.5;
      g.save(); g.translate(sx, sy); g.rotate(sh.stamp.rot ?? -0.05); g.scale(s, s);
      const size = Math.min(100, (sh.stamp.size || 120) * 0.75);
      g.font = `700 ${size}px ${UI.HEAD}`;
      const w = g.measureText(sh.stamp.text).width + size * 1.2;
      g.shadowColor = 'rgba(226,65,46,0.35)'; g.shadowBlur = 40; g.shadowOffsetY = 14;
      g.fillStyle = UI.red; g.beginPath(); g.roundRect(-w / 2, -size * 0.85, w, size * 1.7, size * 0.85); g.fill();
      g.shadowColor = 'transparent';
      text(g, sh.stamp.text, 0, size * 0.36, { font: UI.HEAD, weight: 700, size, color: '#fff', align: 'center' });
      g.restore();
    }
  }
  if (sh.note) pill(g, sh.note.text, sh.note.x ?? W / 2, sh.note.y ?? 960, sh.note.when ? when(x.words, sh.note.when, x.a) : x.a + 0.6, x.T, { size: 32, fill: UI.amber, color: UI.amberInk });
}

// ---------------------------------------------------------------- scene builder
const ROTATION = ['blend', 'push', 'zoom', 'wipe', 'zoomOut', 'whip', 'blend', 'zoom'];
function transitionFor(sh, prev, i) {
  if (sh.cut === 'zoom') return { type: 'zoom' };
  if (sh.cut === 'cut') return { type: 'cut' };
  if (sh.type === 'map' && prev?.type === 'map') return { type: 'blend', dur: 0.6 };
  const t = ROTATION[(i * 3 + (sh.type.length || 0)) % ROTATION.length];
  if (t === 'wipe') return { type: 'wipe', color: 'rgba(74,42,140,0.9)' };
  if (t === 'whip') return { type: 'whip', dir: i % 2 ? -1 : 1 };
  return { type: t };
}

let worldT = 0;
/** Turn a shot list into a light-mode scene drawing function */
export function lightScene(list) {
  let cache = null;
  return (ctx, s) => {
    const key = `${s.cue(0)}|${s.d}`;
    if (!cache || cache.key !== key) {
      const cues = [];
      for (let i = 0; s.line(i); i++) cues.push({ text: s.line(i), start: s.cue(i), end: s.cueEnd(i) });
      const words = sceneWords(cues);
      const starts = plan(list, words);
      const beatsList = list.map((sh, i) => ({
        at: starts[i],
        end: s.d,
        in: i ? transitionFor(sh, list[i - 1], i) : null,
        draw: (g, x) => {
          const xx = { ...x, words, kit: { pill, clean } };
          TH = sh.dark ? DARK_TH : LIGHT_TH;
          if (sh.dark) darkGround(g, worldT);
          (L[sh.type] || L.kinetic)(g, sh, xx);
          overlays(g, sh, xx);
          TH = LIGHT_TH;
        },
      }));
      cache = { key, draw: sequence(beatsList, (c) => world(c, worldT)) };
    }
    worldT = s.T;
    cache.draw(ctx, s.t);
  };
}

/** Sound design for light-mode shot lists */
export function lightSounds(timeline, shotLists) {
  const out = [];
  for (const sc of timeline.scenes) {
    const list = shotLists[sc.id];
    if (!list) continue;
    const words = sceneWords(sc.cues);
    const starts = plan(list, words);
    list.forEach((sh, i) => {
      const a = starts[i], T = (t) => out.push(t);
      if (i > 0) out.push({ t: sc.start + a - 0.45, kind: 'whoosh', vol: 0.35 });
      const w = (p, after = a) => when(words, p, after);
      if (sh.type === 'sting') out.push({ t: sc.start + a + 0.3, kind: 'whoosh', vol: 0.4 }, { t: sc.start + a + 1.5, kind: 'hit', vol: 0.8 }, { t: sc.start + a + 2.3, kind: 'pop', vol: 0.6 });
      if (sh.type === 'export') { const c = sh.cut ? w(sh.cut) : a + 2.2; out.push({ t: sc.start + c + 0.05, kind: 'hit', vol: 0.75 }, { t: sc.start + c + 0.2, kind: 'pop', vol: 0.6 }); }
      if (sh.type === 'subscribe') { const c = sh.clickWhen ? w(sh.clickWhen) : a + (sh.clickAt ?? 1.8); out.push({ t: sc.start + c, kind: 'tick', vol: 0.9 }, { t: sc.start + c + 0.5, kind: 'pop', vol: 0.8 }); }
      (sh.fx || []).forEach((f) => { const at = f.when != null ? w(f.when) : a; out.push({ t: sc.start + at, kind: f.kind === 'spy' ? 'whoosh' : 'pop', vol: 0.7 }); if (f.kind === 'chips') for (let k = 1; k < 6; k++) out.push({ t: sc.start + at + 0.45 + k * 0.18, kind: 'tick', vol: 0.5 }); });
      if (sh.scan) { const at = sh.scan.when ? w(sh.scan.when) : a + 0.5; out.push({ t: sc.start + at, kind: 'hit', vol: 0.5 }); (sh.scan.lines || []).forEach((_, k) => out.push({ t: sc.start + at + 0.5 + k * 0.55, kind: 'tick', vol: 0.55 })); }
      if (sh.type === 'diner' && sh.sketch) out.push({ t: sc.start + w(sh.sketch), kind: 'pop', vol: 0.5 });
      const ph = (p, fb) => (p ? w(p) : a + fb);
      if (sh.type === 'sendmail') { const s = ph(sh.send, 3); out.push({ t: sc.start + s, kind: 'tick', vol: 0.9 }, { t: sc.start + s + 0.25, kind: 'whoosh', vol: 0.6 }, { t: sc.start + s + 0.9, kind: 'pop', vol: 0.7 }, { t: sc.start + s + 1.3, kind: 'pop', vol: 0.6 }); }
      if (sh.type === 'chipstack') { const l = ph(sh.when, 2); for (let k = 0; k < 8; k++) out.push({ t: sc.start + a + 0.2 + (k / 8) * (l - a), kind: 'tick', vol: 0.45 }); out.push({ t: sc.start + l + 0.4, kind: 'pop', vol: 0.9 }); }
      if (sh.type === 'flight') { const d = ph(sh.depart, 2); out.push({ t: sc.start + d - 0.3, kind: 'whoosh', vol: 0.6 }, { t: sc.start + d + 1.6, kind: 'pop', vol: 0.6 }); }
      if (sh.type === 'aiboom') { out.push({ t: sc.start + ph(sh.dissolve, 4), kind: 'whoosh', vol: 0.6 }, { t: sc.start + ph(sh.boom, 9), kind: 'hit', vol: 0.6 }, { t: sc.start + ph(sh.hub, 12), kind: 'pop', vol: 0.8 }); }
      if (sh.type === 'race') { const e = Math.max(ph(sh.when, 5), a + 4.5); for (let k = 0; k < 7; k++) out.push({ t: sc.start + a + 0.3 + (k / 7) * (e - a - 0.3), kind: 'tick', vol: 0.4 }); out.push({ t: sc.start + e + 0.1, kind: 'hit', vol: 0.7 }, { t: sc.start + e + 0.15, kind: 'pop', vol: 0.8 }); }
      if (sh.type === 'keynote') out.push({ t: sc.start + a + 0.3, kind: 'whoosh', vol: 0.5 }, { t: sc.start + ph(sh.jacket, 2) + 0.4, kind: 'pop', vol: 0.5 });
      if (sh.type === 'chess') { const d = ph(sh.drop, 1.5); out.push({ t: sc.start + d + 0.35, kind: 'hit', vol: 0.8 }, { t: sc.start + ph(sh.flagsWhen, 0.3), kind: 'pop', vol: 0.5 }); }
      if (sh.type === 'drain') out.push({ t: sc.start + ph(sh.lose, 2.5), kind: 'whoosh', vol: 0.5 }, { t: sc.start + ph(sh.lose, 2.5) + 0.2, kind: 'hit', vol: 0.6 });
      if (sh.type === 'maze') out.push({ t: sc.start + a + 0.9, kind: 'hit', vol: 0.7 }, { t: sc.start + a + 2.5, kind: 'pop', vol: 0.7 });
      if (sh.type === 'hops') sh.stops.forEach((s, k) => out.push({ t: sc.start + (k ? w(s.when) : a + 0.3), kind: 'pop', vol: 0.6 }));
      if (sh.type === 'badge') out.push({ t: sc.start + a + 0.2, kind: 'whoosh', vol: 0.5 });
      if (sh.type === 'casefolder') { const s = ph(sh.stampWhen, 1.2); out.push({ t: sc.start + a + 0.1, kind: 'whoosh', vol: 0.5 }, { t: sc.start + s, kind: 'pop', vol: 0.9 }, { t: sc.start + s, kind: 'hit', vol: 0.5 }); }
      if (sh.type === 'checks') sh.rows.forEach((r, k) => out.push({ t: sc.start + (k ? w(r.when) : a + 0.4) + 0.5, kind: 'tick', vol: 0.7 }));
      if (sh.type === 'newspaper') out.push({ t: sc.start + a + 0.1, kind: 'whoosh', vol: 0.7 }, { t: sc.start + a + 1.1, kind: 'hit', vol: 0.6 });
      if (sh.type === 'radar') sh.flags.forEach((f, k) => out.push({ t: sc.start + (k ? w(f.when) : a + 0.4), kind: 'pop', vol: 0.5 }));
      if (sh.type === 'shield') for (let k = 0; k < 5; k++) out.push({ t: sc.start + a + 0.75 + k * 0.55, kind: 'tick', vol: 0.6 });
      if (sh.type === 'hearing') { out.push({ t: sc.start + ph(sh.doors, 1.5), kind: 'whoosh', vol: 0.5 }); sh.seats.forEach((s) => out.push({ t: sc.start + w(s.when), kind: 'pop', vol: 0.5 })); }
      if (sh.type === 'boardroom') sh.rows.forEach((r) => out.push({ t: sc.start + w(r.when), kind: 'pop', vol: 0.55 }));
      if (sh.type === 'phone') out.push({ t: sc.start + a + 0.1, kind: 'whoosh', vol: 0.5 }, { t: sc.start + ph(sh.drop, 1), kind: 'hit', vol: 0.6 });
      if (sh.type === 'chipheart') out.push({ t: sc.start + ph(sh.rival, 2), kind: 'whoosh', vol: 0.5 }, { t: sc.start + ph(sh.morph, 6) + 0.8, kind: 'pop', vol: 0.8 });
      if (sh.type === 'chapter') out.push({ t: sc.start + a + 0.15, kind: 'hit', vol: 0.6 }, { t: sc.start + a + 0.5, kind: 'pop', vol: 0.6 });
      if (sh.stamp) out.push({ t: sc.start + w(sh.stamp.when) + (sh.stamp.delay || 0), kind: 'pop', vol: 0.9 }, { t: sc.start + w(sh.stamp.when) + (sh.stamp.delay || 0), kind: 'hit', vol: 0.45 });
      if (sh.type === 'number') out.push({ t: sc.start + (sh.when ? w(sh.when) : a + 0.3), kind: 'pop' });
      if (sh.type === 'ride' && sh.drop) out.push({ t: sc.start + w(sh.drop) + 0.1, kind: 'hit', vol: 0.6 });
      if (sh.type === 'letters' && sh.toWhen) out.push({ t: sc.start + w(sh.toWhen) + 0.4, kind: 'pop' });
      if (sh.type === 'tear') out.push({ t: sc.start + (sh.tearWhen ? w(sh.tearWhen) : a + 1), kind: 'hit', vol: 0.5 });
      if (sh.money) out.push({ t: sc.start + w(sh.money.when), kind: 'pop' });
      (sh.items || []).forEach((it, k) => out.push({ t: sc.start + (it.when ? w(it.when) : a + 0.3 + k * 1.3), kind: 'pop', vol: 0.55 }));
      (sh.pins || []).forEach((pn) => out.push({ t: sc.start + (pn.when ? w(pn.when) : a + 0.8), kind: 'tick', vol: 0.6 }));
    });
  }
  return out;
}
