// Chapter 4: The letter
import {
  C, clamp, lerp, prog, ease, rand, text, piece, tape,
  stage, card, strip, stamp, sticky, note, chapter, trophy, pop, fade, hitTime, wrap,
} from '../../../pipeline/kit.js';
import { markerCircle, markerLine, arrow, highlight, paperFill } from '../../../pipeline/collage.js';
import { typed } from '../../../pipeline/engine.js';

export const hits = [
  { scene: 'confession', cue: 1, at: 4.2 }, // CONFESSION
  { scene: 'numbers', cue: 2, at: 1.6 },    // FAKE
  { scene: 'numbers', cue: 3, at: 1.4 },    // INFLATED
  { scene: 'tiger', cue: 2, at: 6.0 },      // DISPUTED
  { scene: 'aftermath', cue: 2, at: 0.3 },  // WITHDRAWN
];

function confession(ctx, s) {
  const { t } = s;
  const c = [0, 1].map(s.cue);
  const hit = hitTime(hits, s);
  stage(ctx, s, { zoom: [1, 1.08], shakeAt: hit });
  strip(ctx, t, c[0] + 0.2, '7 JANUARY 2009', 420, 150, { color: C.red, size: 56, seed: 251 });
  card(ctx, t, 0.2, { x: 760, y: 600, w: 640, h: 820, color: C.white, rot: -0.02, seed: 252, tapeIt: true, from: 'up' }, (g) => {
    text(g, 'To the Board of Directors,', 50, 120, { font: 'Special Elite', size: 30, color: C.ink });
    const r = rand(2);
    for (let i = 0; i < 12; i++) {
      g.fillStyle = 'rgba(31,29,26,0.2)';
      g.fillRect(50, 180 + i * 46, (380 + r() * 160) * prog(t, 0.6 + i * 0.2, 1.0 + i * 0.2), 12);
    }
    text(g, '— B. Ramalinga Raju', 590, 780, { font: 'Special Elite', size: 28, color: C.ink, align: 'right', alpha: fade(t, c[1]) });
  });
  const to = [['THE BOARD', 300], ['STOCK EXCHANGES', 520]];
  to.forEach(([str, y], i) => {
    const at = c[1] + 0.6 + i * 1.2;
    arrow(ctx, [1100, y + 40], [1260, y], prog(t, at, at + 0.5), { bend: 0.2, color: C.sticky });
    card(ctx, t, at + 0.3, { x: 1520, y, w: 460, h: 130, color: C.sticky, rot: (i ? 0.03 : -0.03), seed: 260 + i }, (g) => {
      text(g, str, 230, 85, { font: 'Oswald', weight: 700, size: 50, color: C.ink, align: 'center', spacing: 2 });
    });
  });
  stamp(ctx, t, hit, 'FULL CONFESSION', 1200, 840, { size: 96, rot: -0.07 });
}

function numbers(ctx, s) {
  const { t } = s;
  const c = [0, 1, 2, 3, 4, 5].map(s.cue);
  const fake = hitTime(hits, s, 0), infl = hitTime(hits, s, 1);
  stage(ctx, s, { zoom: [1, 1.03], shakeAt: [fake, infl] });
  // ledger card with the confessed items
  card(ctx, t, 0.1, { x: 640, y: 560, w: 1020, h: 860, color: C.white, rot: -0.01, seed: 271, tapeIt: true }, (g) => {
    text(g, 'WHAT THE LETTER ADMITTED', 510, 100, { font: 'Oswald', weight: 700, size: 52, color: C.navy, align: 'center', spacing: 3 });
    g.strokeStyle = 'rgba(31,29,26,0.25)'; g.lineWidth = 2;
    for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(50, 260 + i * 170); g.lineTo(970, 260 + i * 170); g.stroke(); }
    const rows = [
      ['Cash & bank balances', 'Rs. 5,040 crore', 'overstated', c[0]],
      ['Interest on deposits', '', 'FAKE', c[2]],
      ['Money owed by customers', '', 'INFLATED', c[3]],
      ['Latest quarter profit margin', '24%  →  3%', '', c[4]],
    ];
    rows.forEach(([label, val, tag, at], i) => {
      const y = 220 + i * 170;
      text(g, typed(label, prog(t, at, at + 0.8)), 60, y, { font: 'Special Elite', size: 40, color: C.ink });
      if (val) text(g, val, 960, y + 0, { font: 'Oswald', weight: 700, size: 46, color: C.red, align: 'right', alpha: fade(t, at + 1.0) });
      if (tag === 'overstated') text(g, tag, 62, y + 52, { font: 'Caveat', weight: 700, size: 44, color: C.muted, alpha: fade(t, at + 1.4) });
    });
    highlight(g, 50, 180, 920, 70, prog(t, c[0] + 2.0, c[0] + 2.6));
  });
  sticky(ctx, t, c[1] + 0.3, 1440, 260, [{ text: '≈ $1 BILLION', size: 54, color: C.red }, { text: 'that never existed', size: 38, font: 'Caveat' }], { w: 420, h: 220, rot: 0.05, seed: 272 });
  stamp(ctx, t, fake, 'FAKE', 990, 505, { size: 64, rot: -0.12 });
  stamp(ctx, t, infl, 'INFLATED', 960, 680, { size: 60, rot: 0.08 });
  // claimed vs real margin
  const p4 = ease.out(prog(t, c[4] + 1.0, c[4] + 2.0)), p5 = ease.out(prog(t, c[5] + 0.2, c[5] + 1.0));
  card(ctx, t, c[4] + 0.6, { x: 1480, y: 720, w: 560, h: 540, color: C.paper, rot: 0.02, seed: 273 }, (g) => {
    const base = 440;
    g.fillStyle = C.navy; g.fillRect(100, base - 320 * p4, 140, 320 * p4);
    g.fillStyle = C.red; g.fillRect(320, base - 40 * p5, 140, 40 * p5);
    text(g, '24%', 170, base - 320 * p4 - 20, { font: 'Oswald', weight: 700, size: 54, color: C.navy, align: 'center', alpha: p4 });
    text(g, '3%', 390, base - 40 * p5 - 20, { font: 'Oswald', weight: 700, size: 54, color: C.red, align: 'center', alpha: p5 });
    text(g, 'CLAIMED', 170, base + 55, { font: 'Oswald', weight: 700, size: 34, color: C.navy, align: 'center', spacing: 2 });
    text(g, 'REAL', 390, base + 55, { font: 'Oswald', weight: 700, size: 34, color: C.red, align: 'center', spacing: 2 });
  });
}

/** Orange paper with tiger stripes */
function tigerPaper(g, w, h, seed) {
  const r = rand(seed);
  g.fillStyle = '#1a1612';
  for (let i = 0; i < 16; i++) {
    const x = (i / 16) * w + r() * 30;
    g.beginPath();
    g.moveTo(x, 0);
    g.quadraticCurveTo(x + 40 + r() * 40, h * 0.3, x + 10, h * (0.45 + r() * 0.3));
    g.quadraticCurveTo(x - 10 + r() * 20, h * 0.3, x - 22, 0);
    g.fill();
    g.beginPath();
    g.moveTo(x + 20, h);
    g.quadraticCurveTo(x - 30, h * 0.7, x + 5, h * (0.6 + r() * 0.15));
    g.quadraticCurveTo(x + 10, h * 0.8, x + 46, h);
    g.fill();
  }
}

function tiger(ctx, s) {
  const { t } = s;
  const c = [0, 1, 2].map(s.cue);
  const hit = hitTime(hits, s);
  stage(ctx, s, { bg: C.deep, zoom: [1, 1.08], shakeAt: hit });
  card(ctx, t, c[0] + 0.3, { x: 960, y: 520, w: 2100, h: 520, color: C.orange, rot: -0.03, seed: 281, torn: 'tb', from: 'fade' }, (g) => tigerPaper(g, 2100, 520, 3));
  note(ctx, t, c[0] + 0.3, 'a line that would become famous', 960, 140, { size: 56, color: C.white, font: 'Caveat' });
  const quote = 'It was like riding a tiger, not knowing how to get off without being eaten.';
  card(ctx, t, c[1] - 0.3, { x: 960, y: 520, w: 1240, h: 380, color: C.white, rot: 0.015, seed: 282, tapeIt: true }, (g) => {
    text(g, '“', 70, 150, { font: 'Playfair Display', weight: 900, size: 200, color: C.red });
    const shown = typed(quote, prog(t, c[1], s.cueEnd(1)));
    const lines = wrap(g, quote, 960, "44px 'Special Elite'");
    let used = 0;
    lines.forEach((ln, i) => {
      const part = shown.slice(used, used + ln.length + 1);
      used += ln.length + 1;
      text(g, part, 170, 140 + i * 62, { font: 'Special Elite', size: 44, color: C.ink });
    });
    text(g, '— B. Ramalinga Raju, 2009', 1170, 340, { font: 'Caveat', weight: 700, size: 42, color: C.muted, align: 'right', alpha: fade(t, s.cueEnd(1)) });
  });
  sticky(ctx, t, c[2] + 0.6, 560, 880, [{ text: 'HIS CLAIM:', size: 34 }, { text: 'took nothing', size: 46, font: 'Caveat' }, { text: 'for himself', size: 46, font: 'Caveat' }], { w: 380, h: 260, rot: -0.05, seed: 283 });
  stamp(ctx, t, hit, 'DISPUTED', 1300, 880, { size: 96, rot: -0.1 });
  note(ctx, t, hit + 0.4, 'by investigators', 1300, 1000, { size: 46, font: 'Caveat', color: C.white });
}

function aftermath(ctx, s) {
  const { t } = s;
  const c = [0, 1, 2].map(s.cue);
  const hit = hitTime(hits, s);
  stage(ctx, s, { zoom: [1, 1.05], shakeAt: hit });
  card(ctx, t, 0.1, { x: 560, y: 520, w: 760, h: 520, color: C.white, rot: -0.02, seed: 291, tapeIt: true }, (g) => {
    text(g, '7 JAN 2009', 60, 90, { font: 'Oswald', weight: 700, size: 46, color: C.navy, spacing: 3 });
    markerLine(g, [[60, 170], [200, 160], [300, 175], [360, 180], [430, 330], [500, 420], [700, 430]], prog(t, 0.6, 2.2), { width: 9 });
    text(g, '-78%', 560, 300, { font: 'Permanent Marker', size: 90, color: C.red, align: 'center', alpha: fade(t, 2.0) });
  });
  note(ctx, t, c[0] + 3.4, 'billions gone in hours', 560, 900, { size: 60, color: C.sticky });
  card(ctx, t, c[1] - 0.1, { x: 1420, y: 500, w: 520, h: 640, color: C.white, rot: 0.03, seed: 292, tapeIt: true }, (g) => {
    trophy(g, 260, 280, 200);
    text(g, 'CORPORATE GOVERNANCE', 260, 520, { font: 'Oswald', weight: 700, size: 34, color: C.ink, align: 'center', spacing: 2 });
    text(g, 'AWARD 2008', 260, 570, { font: 'Oswald', weight: 500, size: 34, color: C.muted, align: 'center', spacing: 4 });
  });
  stamp(ctx, t, hit, 'WITHDRAWN', 1420, 560, { size: 100, rot: -0.15 });
}

export const scenes = { chapter4: chapter(4, 'The Letter'), confession, numbers, tiger, aftermath };
