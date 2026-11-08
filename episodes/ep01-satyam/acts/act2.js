// Chapter 2: The small lie
import {
  C, clamp, lerp, prog, ease, rand, text, piece,
  stage, card, strip, stamp, sticky, note, chapter, docStack, pop, fade, hitTime,
} from '../../../pipeline/kit.js';
import { markerCircle, markerLine, arrow } from '../../../pipeline/collage.js';

export const hits = [
  { scene: 'paper', cue: 3, at: 3.5 },     // FORGED stamp
  { scene: 'mountain', cue: 1, at: 0.6 },  // the mountain turns to paper
];

function grid(g, w, h) {
  g.strokeStyle = 'rgba(143,179,201,0.35)';
  g.lineWidth = 1.5;
  for (let x = 0; x < w; x += 40) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (let y = 0; y < h; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
}

/** Vertical bracket drawn in marker between two y values */
function bracket(ctx, x, y1, y2, p, color = C.red) {
  markerLine(ctx, [[x, y1], [x + 24, y1], [x + 24, y2], [x, y2]], p, { color, width: 6 });
}

function gap(ctx, s) {
  const { t } = s;
  const c = [0, 1, 2, 3].map(s.cue);
  stage(ctx, s, { zoom: [1, 1.06] });
  strip(ctx, t, c[0] + 0.1, 'WHAT NOBODY OUTSIDE KNEW', 640, 130, { color: C.red, size: 50, seed: 81 });
  const W2 = 900, H2 = 700;
  card(ctx, t, c[1] - 0.2, { x: 660, y: 580, w: W2, h: H2, color: C.white, rot: -0.012, seed: 82, tapeIt: true }, (g) => {
    grid(g, W2, H2);
    text(g, 'PROFIT', 60, 90, { font: 'Oswald', weight: 700, size: 52, color: C.navy, spacing: 2 });
    const base = 620;
    // expected (dashed outline)
    const pe = ease.out(prog(t, c[1] + 0.6, c[1] + 1.3));
    g.setLineDash([14, 10]);
    g.strokeStyle = C.muted;
    g.lineWidth = 4;
    g.strokeRect(160, base - 420 * pe, 220, 420 * pe);
    g.setLineDash([]);
    text(g, 'EXPECTED', 270, base + 50, { font: 'Oswald', weight: 700, size: 34, color: C.muted, align: 'center', spacing: 2 });
    // real
    const pr = ease.out(prog(t, c[1] + 1.6, c[1] + 2.4));
    g.fillStyle = C.navy;
    g.fillRect(520, base - 370 * pr, 220, 370 * pr);
    text(g, 'REAL', 630, base + 50, { font: 'Oswald', weight: 700, size: 34, color: C.navy, align: 'center', spacing: 2 });
    // adjusted on paper: red patch fills the gap
    const pa = ease.out(prog(t, c[2] + 1.6, c[2] + 2.3));
    g.fillStyle = C.red;
    g.fillRect(520, base - 370 - 50 * pa, 220, 50 * pa);
    if (pr > 0.9) {
      g.setLineDash([10, 8]);
      g.strokeStyle = C.muted;
      g.lineWidth = 2;
      g.beginPath(); g.moveTo(380, base - 420); g.lineTo(760, base - 420); g.stroke();
      g.setLineDash([]);
    }
    bracket(g, 760, base - 420, base - 370, prog(t, c[2] + 0.1, c[2] + 0.6));
  });
  note(ctx, t, c[2] + 0.5, 'the gap', 1290, 400, { size: 60 });
  note(ctx, t, c[2] + 1.0, '(small)', 1290, 460, { size: 46, font: 'Caveat', color: C.white });
  sticky(ctx, t, c[2] + 2.4, 1450, 640, [{ text: 'a few numbers', size: 40 }, { text: 'ADJUSTED', size: 52, color: C.red }], { w: 360, h: 220, rot: 0.05, seed: 83 });
  card(ctx, t, c[3] + 1.5, { x: 1450, y: 900, w: 560, h: 170, color: C.paper, rot: -0.03, seed: 84 }, (g) => {
    text(g, 'next year will be better...', 280, 75, { font: 'Caveat', weight: 700, size: 50, color: C.ink, align: 'center' });
    text(g, '...right?', 280, 135, { font: 'Caveat', weight: 700, size: 50, color: C.red, align: 'center', alpha: fade(t, c[3] + 4) });
  });
}

function grows(ctx, s) {
  const { t } = s;
  const c = [0, 1, 2].map(s.cue);
  stage(ctx, s, { zoom: [1, 1.05] });
  note(ctx, t, c[0] + 0.2, 'but it never closed.', 960, 140, { size: 72, color: C.white, font: 'Caveat' });
  const W2 = 1500, H2 = 760;
  card(ctx, t, 0.05, { x: 960, y: 600, w: W2, h: H2, color: C.white, rot: 0.01, seed: 91, tapeIt: true }, (g) => {
    grid(g, W2, H2);
    const base = 660;
    for (let i = 0; i < 6; i++) {
      const at = c[1] + i * 0.75;
      const p = ease.out(prog(t, at, at + 0.6));
      if (p <= 0) continue;
      const real = 120 + i * 18, rep = 160 + i * 75;
      const x = 120 + i * 225;
      g.fillStyle = C.navy;
      g.fillRect(x, base - real * p, 150, real * p);
      g.fillStyle = C.red;
      g.fillRect(x, base - rep * p, 150, (rep - real) * p);
      text(g, `YEAR ${i + 1}`, x + 75, base + 50, { font: 'Oswald', weight: 700, size: 30, color: C.muted, align: 'center', spacing: 2 });
    }
    // legend
    g.fillStyle = C.navy; g.fillRect(80, 70, 34, 34);
    text(g, 'REAL', 128, 100, { font: 'Oswald', weight: 700, size: 32, color: C.navy });
    g.fillStyle = C.red; g.fillRect(260, 70, 34, 34);
    text(g, 'MADE UP', 308, 100, { font: 'Oswald', weight: 700, size: 32, color: C.red });
  });
  // the hole grows
  const hx = 960 - 750 + 120 + 5 * 225 + 150 + 30;
  markerLine(ctx, [[hx, 600 - 380 + 660 - 535], [hx + 30, 600 - 380 + 660 - 535], [hx + 30, 600 - 380 + 660 - 210], [hx, 600 - 380 + 660 - 210]], prog(t, c[2], c[2] + 0.6), { width: 7 });
  note(ctx, t, c[2] + 0.4, 'a bigger lie', hx - 40, 300, { size: 54, rot: -0.04 });
}

function paper(ctx, s) {
  const { t } = s;
  const c = [0, 1, 2, 3].map(s.cue);
  const hit = hitTime(hits, s);
  stage(ctx, s, { zoom: [1, 1.06], shakeAt: hit });
  // where is the money?
  const qOut = 1 - prog(t, c[1] - 0.3, c[1]);
  ctx.save();
  ctx.globalAlpha = qOut;
  card(ctx, t, c[0] + 1.0, { x: 960, y: 480, w: 1000, h: 220, color: C.white, rot: -0.02, seed: 101, tapeIt: true }, (g) => {
    text(g, 'WHERE IS THE MONEY?', 500, 140, { font: 'Oswald', weight: 700, size: 92, color: C.navy, align: 'center', spacing: 3 });
  });
  note(ctx, t, c[0] + 3.0, 'claimed profit = cash somewhere', 960, 720, { size: 52, color: C.sticky, font: 'Caveat' });
  ctx.restore();

  // documents appear
  const docs = [['CASH BALANCE', 'Rs. ##,###,###', -0.05], ['FIXED DEPOSIT', 'Rs. ##,###,###', 0.04], ['INTEREST EARNED', 'Rs. #,###,###', -0.02]];
  docs.forEach(([title, amt, rot], i) => {
    const at = c[2] + i * 1.1;
    card(ctx, t, at, { x: 420 + i * 540, y: 400, w: 460, h: 300, color: i === 1 ? C.paper : C.white, rot, seed: 110 + i }, (g) => {
      text(g, title, 230, 80, { font: 'Oswald', weight: 700, size: 42, color: C.navy, align: 'center', spacing: 2 });
      g.fillStyle = 'rgba(31,29,26,0.15)';
      for (let l = 0; l < 3; l++) g.fillRect(50, 120 + l * 26, 360 - l * 60, 10);
      text(g, amt, 230, 250, { font: 'Special Elite', size: 36, color: C.ink, align: 'center' });
    });
  });
  if (t > c[1] - 0.2) note(ctx, t, c[1], 'the money appeared... on paper', 960, 140, { size: 60, color: C.white, font: 'Caveat' });

  // invoices rain down
  const r = rand(4);
  for (let i = 0; i < 40; i++) {
    const at = c[3] + 0.3 + i * 0.09;
    const p = ease.out(prog(t, at, at + 0.6));
    if (p <= 0) continue;
    const tx = 120 + r() * 1680, ty = 680 + r() * 340, rot = (r() - 0.5) * 0.7;
    piece(ctx, { x: tx, y: lerp(-150, ty, p), w: 170, h: 120, color: C.white, rot, seed: 130 + i, shadow: 0.6 }, (g) => {
      text(g, 'INVOICE', 85, 38, { font: 'Oswald', weight: 700, size: 24, color: C.ink, align: 'center', spacing: 2 });
      g.fillStyle = 'rgba(31,29,26,0.18)';
      g.fillRect(20, 56, 130, 7); g.fillRect(20, 74, 90, 7); g.fillRect(20, 92, 110, 7);
    });
  }
  strip(ctx, t, c[3] + 1.4, 'THOUSANDS OF FAKE INVOICES', 960, 620, { color: C.red, size: 58, seed: 102, slide: false });
  stamp(ctx, t, hit, 'FORGED', 960, 400, { size: 110, rot: -0.1 });
}

function mountain(ctx, s) {
  const { t } = s;
  const c = [0, 1].map(s.cue);
  const hit = hitTime(hits, s);
  stage(ctx, s, { zoom: [1, 1.08], shakeAt: hit });
  strip(ctx, t, c[0] + 0.2, 'ON PAPER: A MOUNTAIN OF CASH', 960, 130, { color: C.sticky, ink: C.ink, size: 54, seed: 141 });
  // pile of banknotes stacked into a mountain shape
  const r = rand(9);
  const turn = prog(t, hit - 0.1, hit + 0.8);
  const N = 70;
  for (let i = 0; i < N; i++) {
    const row = Math.min(6, Math.floor(Math.sqrt(i * 0.62)));
    const at = c[0] + 0.3 + i * 0.03;
    const p = ease.out(prog(t, at, at + 0.4));
    if (p <= 0) continue;
    const spread = 1000 - row * 140;
    const x = 960 + (r() - 0.5) * spread, y = 990 - row * 72 + r() * 24;
    const rot = (r() - 0.5) * 0.5;
    const isPaper = r() < turn;
    piece(ctx, { x, y: lerp(y - 300, y, p), w: 190, h: 90, color: isPaper ? C.white : '#7fa877', rot, seed: 150 + i, shadow: 0.5, alpha: p }, (g) => {
      if (!isPaper) {
        g.strokeStyle = 'rgba(30,60,30,0.6)'; g.lineWidth = 3; g.strokeRect(8, 8, 174, 74);
        text(g, '₹', 95, 64, { font: 'Inter', weight: 800, size: 46, color: 'rgba(30,60,30,0.7)', align: 'center' });
      } else {
        g.fillStyle = 'rgba(31,29,26,0.15)'; g.fillRect(16, 26, 140, 7); g.fillRect(16, 46, 100, 7);
      }
    });
  }
  note(ctx, t, c[1] + 1.2, 'in reality... just paper', 960, 320, { size: 72, color: C.red });
}

export const scenes = { chapter2: chapter(2, 'The Small Lie'), gap, grows, paper, mountain };
