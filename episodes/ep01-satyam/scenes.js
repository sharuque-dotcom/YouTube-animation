// Visuals for Episode 1, in a paper-collage documentary style.
// Each scene is draw(ctx, s):
//   s.t        seconds into the scene
//   s.d        scene length
//   s.cue(i)   when narration line i starts (0-based); s.cueEnd(i) when it ends
// Timing comes from the narration, so re-recording the voice keeps everything in sync.

import { W, H, clamp, lerp, prog, ease, rand, text, typed } from '../../pipeline/engine.js';
import * as act1 from './acts/act1.js';
import * as act2 from './acts/act2.js';
import * as act3 from './acts/act3.js';
import * as act4 from './acts/act4.js';
import * as act5 from './acts/act5.js';
import { loadLand } from '../../pipeline/map.js';
import { loadImages } from '../../pipeline/motion.js';
import * as v2 from './coldopen-v2.js';
import * as v3 from './coldopen-v3.js';
import '../../pipeline/cinema.js';
import { shots, photos } from './shots.js';
import { shotScene, hitsFor } from '../../pipeline/shots.js';
import {
  C, backdrop, piece, tape, markerCircle, markerLine, arrow, highlight, camera, cameraPath, person, paperFill,
} from '../../pipeline/collage.js';

// Impact sounds, placed relative to narration lines (mixed in by render.mjs)
const coldHits = [
  { scene: 'letter', cue: 3, at: 1.25 }, // NON-EXISTENT stamp
  { scene: 'crash', cue: 0, at: 1.6 },   // price collapses
  { scene: 'truth', cue: 2, at: 0.7 },   // TRUTH tears
  { scene: 'title', at: 0.15 },          // title card
];
const hitAt = (scene, s) => {
  const h = coldHits.find((x) => x.scene === scene);
  return (h.cue != null ? s.cue(h.cue) : 0) + (h.at || 0);
};
const shake = (ctx, t, at, power = 14) => {
  const k = prog(t, at, at + 0.45);
  if (k <= 0 || k >= 1) return;
  const a = power * (1 - k);
  ctx.translate(Math.sin(t * 90) * a, Math.cos(t * 75) * a * 0.6);
};
/** Gentle hand-held drift so frames never feel frozen */
const drift = (t) => ({ dx: Math.sin(t * 0.37) * 6, dy: Math.cos(t * 0.29) * 5, tilt: Math.sin(t * 0.21) * 0.004 });
/** Drop-in animation: 0 → 1 with a little overshoot */
const pop = (t, at, len = 0.5) => ease.outBack(prog(t, at, at + len));

// ---------------------------------------------------------------- letter
function letter(ctx, s) {
  const { t } = s;
  const c = [0, 1, 2, 3].map(s.cue);
  const stampAt = hitAt('letter', s);
  backdrop(ctx, C.navy);

  const cam = cameraPath([
    { t: 0, x: 960, y: 560, z: 0.88 },
    { t: c[2] - 0.2, x: 960, y: 600, z: 0.92 },
    { t: c[2] + 1.6, x: 1000, y: 800, z: 1.22 },
    { t: stampAt + 0.4, x: 1080, y: 860, z: 1.1 },
    { t: s.d, x: 1100, y: 860, z: 1.16 },
  ], t);
  const d = drift(t);
  shake(ctx, t, stampAt);
  camera(ctx, cam.x + d.dx, cam.y + d.dy, cam.z, d.tilt);

  // The letter slides up and gets taped down
  const slide = ease.out(prog(t, 0, 1.3));
  const lx = 960, ly = lerp(1500, 600, slide);
  const pw = 820, ph = 1060;
  piece(ctx, { x: lx, y: ly, w: pw, h: ph, color: C.white, rot: -0.02, seed: 9, lift: 1 - slide }, (g) => {
    const tf = { font: 'Special Elite', color: C.ink };
    text(g, typed('7 January 2009', prog(t, c[0] + 1.4, c[0] + 2.6)), pw - 70, 110, { ...tf, size: 30, align: 'right' });
    text(g, typed('To the Board of Directors,', prog(t, c[0] + 3.2, c[0] + 4.6)), 70, 200, { ...tf, size: 30 });
    const r = rand(3);
    for (let i = 0; i < 9; i++) {
      const w = i === 8 ? 300 : 540 + r() * 140;
      const p = prog(t, c[0] + 4.6 + i * 0.55, c[0] + 5.1 + i * 0.55);
      g.fillStyle = 'rgba(31,29,26,0.2)';
      g.fillRect(70, 260 + i * 46, w * p, 13);
    }
    const line = 'Cash and bank balances ..... Rs. 5,361 crore';
    text(g, typed(line, prog(t, c[2], c[2] + 1.6)), 70, 700, { ...tf, size: 32 });
    highlight(g, 60, 668, 700, 44, prog(t, c[2] + 1.8, c[2] + 2.4));
    markerCircle(g, 410, 690, 390, 62, prog(t, c[3], c[3] + 0.9), { seed: 8 });
  });
  // Location tag
  const tag = ease.out(prog(t, c[0] + 0.6, c[0] + 1.2));
  piece(ctx, { x: lerp(-200, 520, tag), y: 95, w: 560, h: 84, color: C.red, rot: -0.035, seed: 4, torn: 'lr' }, (g) => {
    text(g, 'HYDERABAD  ·  7 JAN 2009', 280, 57, { font: 'Oswald', weight: 700, size: 42, color: C.white, align: 'center', spacing: 3 });
  });

  tape(ctx, lx - 330, ly - 520, 170, -0.5, 1, slide);
  tape(ctx, lx + 330, ly - 535, 170, 0.45, 2, slide);

  // Stamp
  const sp = prog(t, stampAt - 0.12, stampAt);
  if (sp > 0) {
    ctx.save();
    ctx.translate(900, 960);
    ctx.rotate(-0.14);
    const sc = lerp(2.4, 1, ease.in(sp));
    ctx.scale(sc, sc);
    ctx.globalAlpha = lerp(0, 0.88, sp);
    ctx.strokeStyle = C.red;
    ctx.lineWidth = 9;
    ctx.strokeRect(-300, -66, 600, 132);
    text(ctx, 'NON-EXISTENT', 0, 32, { font: 'Oswald', weight: 700, size: 96, color: C.red, align: 'center', spacing: 6 });
    ctx.restore();
  }

  // Sticky note with the real number
  const note = pop(t, stampAt + 0.5, 0.45);
  if (note > 0) {
    ctx.save();
    ctx.translate(1560, 900);
    ctx.scale(note, note);
    piece(ctx, { x: 0, y: 0, w: 360, h: 330, color: C.sticky, rot: 0.06, seed: 12 }, (g) => {
      text(g, 'Rs. 5,040 crore', 180, 105, { font: 'Permanent Marker', size: 44, color: C.ink, align: 'center' });
      text(g, '≈ $1 BILLION', 180, 185, { font: 'Permanent Marker', size: 52, color: C.red, align: 'center' });
      text(g, '...not there', 180, 265, { font: 'Caveat', weight: 700, size: 52, color: C.ink, align: 'center' });
    });
    ctx.restore();
  }
  arrow(ctx, [1390, 810], [1180, 760], prog(t, stampAt + 1.0, stampAt + 1.6), { bend: -0.3 });
}

// ---------------------------------------------------------------- crash
function crash(ctx, s) {
  const { t } = s;
  const c = [0, 1, 2].map(s.cue);
  const fall = hitAt('crash', s);
  backdrop(ctx, C.navy);

  // One big board; the camera travels between three areas
  const A = { x: 960, y: 540 }, B = { x: 2900, y: 540 }, Cc = { x: 1930, y: 1900 };
  const cam = cameraPath([
    { t: 0, ...A, z: 0.92 },
    { t: fall + 2.2, ...A, z: 1.0 },
    { t: c[1] - 0.5, ...A, z: 1.0 },
    { t: c[1] + 0.1, x: (A.x + B.x) / 2, y: 540, z: 0.62 },
    { t: c[1] + 0.7, ...B, z: 0.98 },
    { t: c[2] - 0.5, ...B, z: 1.0 },
    { t: c[2] + 0.1, x: (B.x + Cc.x) / 2, y: 1220, z: 0.6 },
    { t: c[2] + 0.7, ...Cc, z: 0.98 },
    { t: s.d, ...Cc, z: 1.05 },
  ], t);
  const d = drift(t);
  shake(ctx, t, fall, 16);
  camera(ctx, cam.x + d.dx, cam.y + d.dy, cam.z, d.tilt);

  // --- A: share price chart on graph paper
  const cw = 1500, ch = 860;
  const plot = { x0: 130, x1: 1420, y0: 210, y1: 770 };
  const Y = (v) => plot.y1 - (v / 200) * (plot.y1 - plot.y0);
  const X = (k) => lerp(plot.x0, plot.x1, k);
  const r = rand(11);
  const pts = [];
  for (let i = 0; i <= 90; i++) {
    const k = i / 90;
    let v = 179 + Math.sin(i * 0.6) * 1.8 + (r() - 0.5) * 2.5;
    if (k > 0.55) v = lerp(179, 40, ease.out(clamp((k - 0.55) / 0.3))) + (r() - 0.5) * 3;
    pts.push([X(k), Y(v), v]);
  }
  const split = 50; // index where the fall starts
  piece(ctx, { x: A.x, y: A.y, w: cw, h: ch, color: C.white, rot: 0.012, seed: 21 }, (g) => {
    g.strokeStyle = 'rgba(143,179,201,0.35)';
    g.lineWidth = 1.5;
    for (let x = 0; x < cw; x += 40) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, ch); g.stroke(); }
    for (let y = 0; y < ch; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(cw, y); g.stroke(); }
    text(g, 'SATYAM SHARE PRICE', 70, 105, { font: 'Oswald', weight: 700, size: 60, color: C.navy, spacing: 2 });
    text(g, '7 January 2009 (illustrative)', 72, 150, { font: 'Caveat', weight: 700, size: 40, color: C.muted });
    for (const v of [50, 100, 150, 200]) {
      text(g, `${v}`, plot.x0 - 20, Y(v) + 10, { font: 'Oswald', weight: 500, size: 28, color: C.muted, align: 'right' });
    }
    text(g, 'MORNING', plot.x0, plot.y1 + 50, { font: 'Oswald', weight: 500, size: 28, color: C.muted, spacing: 3 });
    text(g, 'EVENING', plot.x1, plot.y1 + 50, { font: 'Oswald', weight: 500, size: 28, color: C.muted, align: 'right', spacing: 3 });

    // local coords: chart points were built in local space
    const before = pts.slice(0, split + 1).map(([x, y]) => [x, y]);
    const after = pts.slice(split).map(([x, y]) => [x, y]);
    markerLine(g, before, prog(t, 0.3, 1.6), { color: C.navy, width: 8 });
    markerLine(g, after, ease.out(prog(t, fall - 0.2, fall + 1.2)), { color: C.red, width: 9 });

    // annotations
    const ann = prog(t, fall + 1.4, fall + 2.1);
    markerCircle(g, pts[84][0], pts[84][1], 110, 55, ann, { seed: 4 });
    arrow(g, [760, 540], [1130, 680], prog(t, fall + 1.8, fall + 2.4), { bend: 0.25 });
    text(g, '-78% IN ONE DAY', 470, 530, { font: 'Permanent Marker', size: 62, color: C.red, align: 'center', alpha: prog(t, fall + 2.0, fall + 2.4) });
  });
  // price tags
  const tag1 = pop(t, 1.0);
  if (tag1 > 0) {
    ctx.save(); ctx.translate(A.x - cw / 2 + pts[0][0] + 160, A.y - ch / 2 + pts[0][1] + 80); ctx.scale(tag1, tag1);
    piece(ctx, { x: 0, y: 0, w: 190, h: 76, color: C.sticky, rot: -0.06, seed: 31 }, (g) => text(g, 'Rs. 179', 95, 54, { font: 'Permanent Marker', size: 40, color: C.ink, align: 'center' }));
    ctx.restore();
  }
  const tag2 = pop(t, fall + 1.2);
  if (tag2 > 0) {
    ctx.save(); ctx.translate(A.x - cw / 2 + pts[90][0] - 150, A.y - ch / 2 + pts[90][1] - 110); ctx.scale(tag2, tag2);
    piece(ctx, { x: 0, y: 0, w: 190, h: 76, color: C.red, rot: 0.05, seed: 32 }, (g) => text(g, 'Rs. 40', 95, 54, { font: 'Permanent Marker', size: 40, color: C.white, align: 'center' }));
    ctx.restore();
  }
  tape(ctx, A.x - cw / 2 + 60, A.y - ch / 2 + 20, 160, -0.6, 5);
  tape(ctx, A.x + cw / 2 - 60, A.y - ch / 2 + 30, 160, 0.55, 6);

  // --- B: the employees
  piece(ctx, { x: B.x, y: B.y + 40, w: 1500, h: 800, color: C.paper, rot: -0.01, seed: 41 }, (g) => {
    const cols = 25, rows = 8, gx = 120, gy = 190, sx = 52, sy = 70;
    const rr = rand(5);
    for (let i = 0; i < cols * rows; i++) {
      const col = i % cols, row = Math.floor(i / cols);
      const a = ease.out(prog(t, c[1] + 0.3 + col * 0.03 + row * 0.02, c[1] + 0.6 + col * 0.03 + row * 0.02));
      const worry = rr() < 0.35 && t > c[1] + 1.6 + rr() * 1.5;
      g.globalAlpha = a;
      person(g, gx + col * sx + 20, gy + row * sy + 30, 40, worry ? C.red : C.navy);
    }
    g.globalAlpha = 1;
    text(g, 'each figure = 250 people', 750, 770, { font: 'Caveat', weight: 700, size: 46, color: C.muted, align: 'center', alpha: prog(t, c[1] + 1.2, c[1] + 1.6) });
  });
  piece(ctx, { x: B.x - 300, y: B.y - 380, w: 720, h: 110, color: C.red, rot: -0.03, seed: 42, torn: 'lr' }, (g) => {
    text(g, '50,000+ EMPLOYEES', 360, 78, { font: 'Oswald', weight: 700, size: 66, color: C.white, align: 'center', spacing: 4 });
  });
  for (const [i, x, y] of [[0, 2380, 330], [1, 2700, 470], [2, 3050, 300], [3, 3350, 520]]) {
    text(ctx, '?', x, y, { font: 'Permanent Marker', size: 90, color: C.red, alpha: pop(t, c[1] + 2.4 + i * 0.25) });
  }

  // --- C: the whole industry
  piece(ctx, { x: Cc.x, y: Cc.y - 60, w: 1180, h: 260, color: C.white, rot: 0.015, seed: 51 }, (g) => {
    text(g, "INDIA'S IT INDUSTRY", 590, 170, { font: 'Oswald', weight: 700, size: 120, color: C.navy, align: 'center', spacing: 2 });
  });
  tape(ctx, Cc.x, Cc.y - 200, 200, 0.04, 7);
  const labels = [['INVESTORS', C.sticky, -520, 0.07], ['CLIENTS', C.orange, 0, -0.05], ['AUDITORS', C.sticky, 520, 0.04]];
  labels.forEach(([word, col, dx, rot], i) => {
    const p = pop(t, c[2] + 1.6 + i * 0.5);
    if (p <= 0) return;
    ctx.save(); ctx.translate(Cc.x + dx, Cc.y + 230); ctx.scale(p, p);
    piece(ctx, { x: 0, y: 0, w: 330, h: 120, color: col, rot, seed: 60 + i }, (g) => {
      text(g, `${word} ?`, 165, 80, { font: 'Permanent Marker', size: 46, color: C.ink, align: 'center' });
    });
    ctx.restore();
  });
  const we = prog(t, s.cueEnd(2) - 1.4, s.cueEnd(2) - 0.6);
  text(ctx, 'WHO ELSE?', Cc.x + 380, Cc.y - 250, { font: 'Permanent Marker', size: 88, color: C.red, align: 'center', alpha: ease.out(we) });
  markerLine(ctx, [[Cc.x + 170, Cc.y - 225], [Cc.x + 600, Cc.y - 232]], prog(t, s.cueEnd(2) - 0.8, s.cueEnd(2) - 0.3), { width: 8 });
}

// ---------------------------------------------------------------- truth
function truth(ctx, s) {
  const { t } = s;
  const c = [0, 1, 2].map(s.cue);
  const tearAt = hitAt('truth', s);
  backdrop(ctx, C.paper);
  const d = drift(t);
  const z = lerp(0.96, 1.04, t / s.d);
  shake(ctx, t, tearAt, 10);
  camera(ctx, 960 + d.dx, 540 + d.dy, z, d.tilt);

  // Handwritten lead-in
  const q = prog(t, c[0] + 0.1, c[0] + 0.6) * (1 - prog(t, s.cueEnd(0) - 1.1, s.cueEnd(0) - 0.7));
  text(ctx, 'the strangest part?', 960, 560, { font: 'Caveat', weight: 700, size: 110, color: C.ink, align: 'center', alpha: q });

  // SATYAM as cut-out letters
  const nameAt = s.cueEnd(0) - 0.8;
  const lift = ease.inOut(prog(t, c[1] - 0.1, c[1] + 0.7));
  const y = lerp(560, 400, lift);
  const r = rand(17);
  'SATYAM'.split('').forEach((ch, i) => {
    const p = pop(t, nameAt + i * 0.08, 0.45);
    const rot = (r() - 0.5) * 0.14;
    if (p <= 0) return;
    piece(ctx, { x: 960 + (i - 2.5) * 175, y: y - (1 - p) * 120, w: 160, h: 200, color: i % 2 ? C.white : C.sticky, rot, seed: 70 + i, alpha: clamp(p * 2) }, (g) => {
      text(g, ch, 80, 165, { font: 'Playfair Display', weight: 900, size: 170, color: C.ink, align: 'center' });
    });
  });

  // Sanskrit strip
  const dev = ease.out(prog(t, c[1] + 0.2, c[1] + 0.8));
  piece(ctx, { x: lerp(1500, 960, dev), y: 160, w: 420, h: 130, color: C.red, rot: 0.03, seed: 81, torn: 'lr', alpha: dev }, (g) => {
    text(g, 'सत्यम्', 210, 98, { font: 'Noto Serif Devanagari', weight: 700, size: 76, color: C.white, align: 'center' });
  });
  tape(ctx, 960 - 200, 110, 110, -0.4, 9, dev);
  text(ctx, 'Sanskrit for...', 1200, 190, { font: 'Caveat', weight: 700, size: 56, color: C.muted, alpha: prog(t, c[1] + 0.6, c[1] + 1.0) });

  // TRUTH strip that tears in half
  const tp = ease.out(prog(t, c[2] - 0.05, c[2] + 0.35));
  if (tp > 0) {
    const sw = 1000, sh = 250, cx = 960, cy = 760;
    const tear = ease.outExpo(prog(t, tearAt, tearAt + 0.6));
    const jag = rand(5);
    const edge = [];
    for (let i = 0; i <= 14; i++) edge.push([sw / 2 + (jag() - 0.5) * 40 + (i % 2 ? 12 : -12), (sh * i) / 14]);
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.globalAlpha = tp;
      ctx.translate(cx + side * tear * 70, cy + side * tear * 14);
      ctx.rotate(-0.02 + side * tear * 0.07);
      ctx.translate(-sw / 2, -sh / 2);
      ctx.beginPath();
      ctx.moveTo(side < 0 ? 0 : sw, 0);
      edge.forEach(([x, yy]) => ctx.lineTo(x, yy));
      ctx.lineTo(side < 0 ? 0 : sw, sh);
      ctx.closePath();
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 16;
      ctx.shadowOffsetY = 8;
      ctx.fillStyle = paperFill(ctx, C.navy);
      ctx.fill();
      ctx.restore();
      ctx.clip();
      text(ctx, 'TRUTH', sw / 2, 200, { font: 'Oswald', weight: 700, size: 190, color: C.white, align: 'center', spacing: 26 });
      ctx.restore();
    }
  }
}

// ---------------------------------------------------------------- title
function title(ctx, s) {
  const { t, d } = s;
  backdrop(ctx, C.navy);
  const dr = drift(t);
  camera(ctx, 960 + dr.dx, 540 + dr.dy, lerp(1, 1.06, t / d), dr.tilt);
  const out = prog(t, d - 0.6, d);
  ctx.globalAlpha = 1 - out;

  const r = rand(21);
  ['PAPER', 'EMPIRES'].forEach((word, row) => {
    const n = word.length;
    [...word].forEach((ch, i) => {
      const delay = 0.1 + (row * 5 + i) * 0.05;
      const p = pop(t, delay, 0.5);
      if (p <= 0) return;
      const rot = (r() - 0.5) * 0.12;
      piece(ctx, { x: 960 + (i - (n - 1) / 2) * 150, y: 430 + row * 200 - (1 - p) * 200, w: 140, h: 180, color: (i + row) % 3 ? C.white : C.paper, rot, seed: 90 + row * 10 + i, alpha: clamp(p * 2) }, (g) => {
        text(g, ch, 70, 150, { font: 'Playfair Display', weight: 900, size: 150, color: C.ink, align: 'center' });
      });
    });
  });
  tape(ctx, 960 - 420, 330, 150, -0.3, 11, prog(t, 1.0, 1.3));
  tape(ctx, 960 + 560, 720, 150, 0.4, 12, prog(t, 1.1, 1.4));

  const sub = prog(t, 1.2, 1.7);
  piece(ctx, { x: 960, y: lerp(1100, 890, ease.out(sub)), w: 900, h: 90, color: C.red, rot: -0.015, seed: 99, torn: 'lr' }, (g) => {
    text(g, 'EPISODE 01  ·  THE COMPANY CALLED TRUTH', 450, 62, { font: 'Oswald', weight: 700, size: 40, color: C.white, align: 'center', spacing: 4 });
  });
}

const acts = [act1, act2, act3, act4, act5];
// Cold open: v2 (photos + kinetic type) by default; set COLD_OPEN = 'v1' for the original collage version
const COLD_OPEN = 'v3';
const v3scenes = Object.fromEntries(Object.entries(v3.shots).map(([id, list]) => [id, shotScene(list, { shake: false })]));
const cold = COLD_OPEN === 'v3' ? { hits: [], scenes: v3scenes } : COLD_OPEN === 'v2' ? v2 : { hits: coldHits, scenes: { letter, crash, truth, title } };
// Documentary finish (grade, glow, grain, 2.39:1 bars) on every frame
export const look = { cinema: true };
// Everything after the cold open: shot lists (shots.js) by default; set SHOTS = false for the collage version (acts/)
const SHOTS = true;
const shotScenes = Object.fromEntries(Object.entries(shots).map(([id, list]) => [id, shotScene(list)]));
export const hits = [...cold.hits, ...(SHOTS ? [] : acts.flatMap((a) => a.hits))];
export const extraHits = (timeline) => [...(SHOTS ? hitsFor(timeline, shots) : []), ...(COLD_OPEN === 'v3' ? hitsFor(timeline, v3.shots) : [])];
export const scenes = Object.assign({}, ...acts.map((a) => a.scenes), SHOTS ? shotScenes : {}, cold.scenes);
export async function preload() {
  await loadLand();
  const base = new URL('./photos/', import.meta.url).href;
  const files = { first: 'first-building.jpg', tech: 'tech-center.jpg', campus: 'campus.jpg' };
  await loadImages(Object.fromEntries(photos.map((k) => [k, base + (files[k] || `${k}.jpg`)])));
}
