// Chapter 5: The fall, Chapter 6: How did nobody notice?, outro and end card
import {
  C, clamp, lerp, prog, ease, rand, text, piece, tape,
  stage, card, strip, stamp, sticky, note, chapter, bust, building, pop, fade, hitTime,
} from '../../../pipeline/kit.js';
import { markerCircle, markerLine, arrow, person, paperFill } from '../../../pipeline/collage.js';

export const hits = [
  { scene: 'arrest', cue: 0, at: 1.6 },     // ARRESTED
  { scene: 'verdict', cue: 1, at: 3.2 },    // CONVICTED
  { scene: 'verdict', cue: 4, at: 2.0 },    // auditors convicted
  { scene: 'endcard', at: 0.2 },
];

function arrest(ctx, s) {
  const { t } = s;
  const c = [0, 1, 2, 3].map(s.cue);
  const hit = hitTime(hits, s);
  const cam = stage(ctx, s, {
    keys: [{ t: 0, x: 960, y: 540, z: 1 }, { t: c[1] - 0.2, x: 960, y: 540, z: 1 }, { t: c[1] + 0.8, x: 2900, y: 540, z: 1 }, { t: s.d, x: 2900, y: 560, z: 1.04 }],
    shakeAt: hit,
  });
  // left: the arrest
  strip(ctx, t, c[0] + 0.2, '9 JAN 2009', 420, 170, { color: C.red, size: 56, seed: 301 });
  card(ctx, t, 0.1, { x: 960, y: 560, w: 560, h: 660, color: C.white, rot: -0.02, seed: 302, tapeIt: true }, (g) => {
    bust(g, 280, 300, 320, C.navy);
    text(g, 'B. RAMALINGA RAJU', 280, 560, { font: 'Oswald', weight: 700, size: 46, color: C.ink, align: 'center', spacing: 2 });
  });
  stamp(ctx, t, hit, 'ARRESTED', 980, 640, { size: 110, rot: -0.12 });
  // right (x+1940): the government steps in
  const X = 1940;
  strip(ctx, t, c[1] + 0.6, 'THE GOVERNMENT STEPS IN', X + 960, 140, { color: C.sticky, ink: C.ink, size: 54, seed: 303 });
  for (let i = 0; i < 4; i++) {
    const x = X + 420 + i * 360;
    card(ctx, t, c[2] - 0.1 + i * 0.12, { x, y: 420, w: 260, h: 300, color: C.paper, rot: (i % 2 ? 0.04 : -0.03), seed: 310 + i }, (g) => {
      const swapped = t > c[2] + 2.2 + i * 0.2;
      bust(g, 130, 140, 160, swapped ? C.teal : C.navy);
      text(g, swapped ? 'GOVT. APPOINTED' : 'OLD BOARD', 130, 270, { font: 'Oswald', weight: 700, size: 26, color: swapped ? C.teal : C.ink, align: 'center', spacing: 1 });
    });
    if (t > c[2] + 1.2 + i * 0.2 && t < c[2] + 2.2 + i * 0.2) {
      markerLine(ctx, [[x - 110, 300], [x + 110, 540]], prog(t, c[2] + 1.2 + i * 0.2, c[2] + 1.5 + i * 0.2), { width: 9 });
    }
  }
  // employees and clients
  for (let i = 0; i < 40; i++) {
    const p = pop(t, c[3] + 2.5 + i * 0.03, 0.4);
    if (p <= 0) continue;
    ctx.save(); ctx.globalAlpha = clamp(p);
    person(ctx, X + 260 + (i % 20) * 52, 780 + Math.floor(i / 20) * 70, 44, C.cream || C.paper);
    ctx.restore();
  }
  note(ctx, t, c[3] + 3.4, 'save the employees + clients', X + 1560, 860, { size: 52, color: C.sticky, font: 'Caveat' });
}

function mahindra(ctx, s) {
  const { t } = s;
  const c = [0, 1, 2].map(s.cue);
  stage(ctx, s, { zoom: [1, 1.04] });
  strip(ctx, t, c[0] + 0.2, '2009 · TECH MAHINDRA WINS THE BID', 960, 150, { color: C.red, size: 52, seed: 321 });
  const fadeName = 1 - prog(t, c[2] + 0.3, c[2] + 1.6);
  const boxes = [['SATYAM', C.sticky, 0.2, fadeName], ['MAHINDRA SATYAM', C.white, c[1] + 0.8, 1], ['TECH MAHINDRA', C.white, c[1] + 3.6, 1]];
  boxes.forEach(([str, col, at, a], i) => {
    ctx.save();
    ctx.globalAlpha = a;
    card(ctx, t, at, { x: 330 + i * 630, y: 560, w: 520, h: 220, color: col, rot: (i - 1) * 0.03, seed: 322 + i, tapeIt: true }, (g) => {
      text(g, str, 260, 135, { font: 'Oswald', weight: 700, size: str.length > 10 ? 52 : 80, color: C.navy, align: 'center', spacing: 2 });
    });
    ctx.restore();
    if (i > 0) arrow(ctx, [330 + (i - 1) * 630 + 220, 680], [330 + i * 630 - 220, 680], prog(t, at - 0.5, at), { bend: -0.3, color: C.sticky });
  });
  note(ctx, t, c[1] + 4.5, 'merged', 1290, 860, { size: 52, font: 'Caveat', color: C.white });
  note(ctx, t, c[2] + 0.8, 'the name disappeared', 330, 860, { size: 60, color: C.red });
}

function verdict(ctx, s) {
  const { t } = s;
  const c = [0, 1, 2, 3, 4].map(s.cue);
  const h1 = hitTime(hits, s, 0), h2 = hitTime(hits, s, 1);
  const cam = stage(ctx, s, {
    keys: [{ t: 0, x: 960, y: 540, z: 1 }, { t: c[2] - 0.4, x: 960, y: 540, z: 1 }, { t: c[2] + 0.6, x: 960, y: 1700, z: 1 }, { t: s.d, x: 960, y: 1720, z: 1.04 }],
    shakeAt: [h1, h2],
  });
  // years counter
  const yr = Math.round(lerp(2009, 2015, ease.inOut(prog(t, c[0] + 0.3, c[0] + 2.4))));
  card(ctx, t, 0.1, { x: 520, y: 330, w: 480, h: 220, color: C.white, rot: -0.03, seed: 331, tapeIt: true }, (g) => {
    text(g, `${yr}`, 240, 160, { font: 'Oswald', weight: 700, size: 130, color: yr === 2015 ? C.red : C.navy, align: 'center', spacing: 6 });
  });
  note(ctx, t, c[0] + 0.6, 'six years in court', 520, 530, { size: 54, font: 'Caveat', color: C.white });
  card(ctx, t, c[1] + 1.0, { x: 1320, y: 520, w: 820, h: 420, color: C.paper, rot: 0.02, seed: 332 }, (g) => {
    text(g, 'SPECIAL COURT · 2015', 410, 90, { font: 'Oswald', weight: 700, size: 44, color: C.navy, align: 'center', spacing: 3 });
    text(g, 'Raju, his brother', 410, 200, { font: 'Caveat', weight: 700, size: 60, color: C.ink, align: 'center' });
    text(g, '& several others', 410, 270, { font: 'Caveat', weight: 700, size: 60, color: C.ink, align: 'center' });
  });
  stamp(ctx, t, h1, 'CONVICTED · 7 YEARS', 1320, 820, { size: 80, rot: -0.07 });
  // below: the auditors
  const Y = 1160;
  strip(ctx, t, c[2] - 0.2, 'AND THE AUDITORS?', 960, Y + 140, { color: C.sticky, ink: C.ink, size: 60, seed: 333 });
  card(ctx, t, c[3] + 0.2, { x: 760, y: Y + 520, w: 1000, h: 340, color: C.white, rot: -0.015, seed: 334, tapeIt: true }, (g) => {
    text(g, 'PRICEWATERHOUSECOOPERS', 500, 150, { font: 'Oswald', weight: 700, size: 70, color: C.navy, align: 'center', spacing: 2 });
    text(g, "one of the world's biggest audit firms", 500, 240, { font: 'Caveat', weight: 700, size: 52, color: C.muted, align: 'center' });
  });
  stamp(ctx, t, h2, 'CONVICTED IN INDIA', 760, Y + 780, { size: 64, rot: -0.05 });
  sticky(ctx, t, c[4] + 3.6, 1550, Y + 560, [{ text: 'US regulators:', size: 38, font: 'Caveat' }, { text: 'FINED', size: 60, color: C.red }, { text: 'millions of $', size: 40 }], { w: 380, h: 300, rot: 0.06, seed: 335 });
}

function checklist(ctx, s) {
  const { t } = s;
  const c = [0, 1, 2, 3].map(s.cue);
  stage(ctx, s, { zoom: [1, 1.04] });
  strip(ctx, t, c[0] + 0.1, 'HOW DID NOBODY NOTICE?', 960, 160, { color: C.red, size: 64, seed: 341 });
  const items = [
    ['AUDITORS', 'trusted documents', "didn't check with banks"],
    ['THE BOARD', 'approved what', 'the founder wanted'],
    ['EVERYONE', 'was making money', 'nobody asked questions'],
  ];
  items.forEach(([head, a, b], i) => {
    const at = c[i + 1] + 0.2;
    card(ctx, t, at, { x: 400 + i * 560, y: 600, w: 500, h: 520, color: i === 1 ? C.paper : C.white, rot: (i - 1) * 0.03, seed: 350 + i, tapeIt: true }, (g) => {
      text(g, `${i + 1}`, 250, 150, { font: 'Permanent Marker', size: 120, color: C.red, align: 'center' });
      text(g, head, 250, 270, { font: 'Oswald', weight: 700, size: 60, color: C.navy, align: 'center', spacing: 2 });
      text(g, a, 250, 360, { font: 'Caveat', weight: 700, size: 50, color: C.ink, align: 'center' });
      text(g, b, 250, 420, { font: 'Caveat', weight: 700, size: 50, color: C.ink, align: 'center' });
    });
    markerCircle(ctx, 400 + i * 560, 600 - 260 + 110, 85, 85, prog(t, at + 0.5, at + 1.2), { seed: 20 + i });
  });
}

function legacy(ctx, s) {
  const { t } = s;
  const c = [0, 1].map(s.cue);
  stage(ctx, s, { zoom: [1, 1.05] });
  note(ctx, t, c[0] + 0.2, "Satyam's fall changed Indian business", 960, 140, { size: 60, color: C.white, font: 'Caveat' });
  card(ctx, t, c[0] + 0.6, { x: 660, y: 590, w: 820, h: 620, color: C.white, rot: -0.02, seed: 361, tapeIt: true }, (g) => {
    text(g, 'NEW RULES', 410, 110, { font: 'Oswald', weight: 700, size: 70, color: C.navy, align: 'center', spacing: 4 });
    const rows = ['Stricter governance rules', 'Auditors under scrutiny'];
    rows.forEach((r, i) => {
      const at = c[1] + 0.3 + i * 2.2;
      text(g, r, 160, 260 + i * 140, { font: 'Special Elite', size: 40, color: C.ink, alpha: fade(t, at) });
      markerLine(g, [[70, 240 + i * 140], [95, 265 + i * 140], [135, 215 + i * 140]], prog(t, at + 0.3, at + 0.7), { color: C.teal, width: 9 });
    });
  });
  card(ctx, t, c[1] + 4.6, { x: 1440, y: 640, w: 640, h: 300, color: C.sticky, rot: 0.04, seed: 362 }, (g) => {
    text(g, '"SATYAM"', 320, 120, { font: 'Oswald', weight: 700, size: 80, color: C.ink, align: 'center', spacing: 4 });
    text(g, '= shorthand for fraud', 320, 220, { font: 'Permanent Marker', size: 46, color: C.red, align: 'center' });
  });
}

function outro(ctx, s) {
  const { t } = s;
  const c = [0, 1, 2, 3].map(s.cue);
  stage(ctx, s, { bg: C.paper, zoom: [1, 1.08] });
  const show = (i) => fade(t, c[i] - 0.1) * (i < 3 ? 1 - prog(t, c[i + 1] - 0.4, c[i + 1] - 0.05) : 1);
  // 1: TRUTH, torn
  ctx.save(); ctx.globalAlpha = show(0);
  for (const side of [-1, 1]) {
    piece(ctx, { x: 960 + side * 270, y: 540, w: 520, h: 230, color: C.navy, rot: side * 0.06, seed: side < 0 ? 371 : 372, torn: side < 0 ? 'r' : 'l', jag: 18 }, (g) => {
      text(g, 'TRUTH', side < 0 ? 520 : 0, 175, { font: 'Oswald', weight: 700, size: 180, color: C.white, align: 'center', spacing: 26 });
    });
  }
  ctx.restore();
  // 2: the small gap
  ctx.save(); ctx.globalAlpha = show(1);
  ctx.fillStyle = C.navy; ctx.fillRect(760, 760 - 360, 160, 360);
  ctx.fillStyle = C.navy; ctx.fillRect(1000, 760 - 360, 160, 360);
  ctx.fillStyle = C.red; ctx.fillRect(1000, 760 - 400, 160, 40);
  text(ctx, 'REAL', 840, 820, { font: 'Oswald', weight: 700, size: 40, color: C.navy, align: 'center', spacing: 2 });
  text(ctx, 'REPORTED', 1080, 820, { font: 'Oswald', weight: 700, size: 40, color: C.red, align: 'center', spacing: 2 });
  note(ctx, t, c[1] + 1.2, 'a small gap', 1380, 380, { size: 64 });
  ctx.restore();
  // 3: lesson
  ctx.save(); ctx.globalAlpha = show(2);
  card(ctx, t, c[2] + 0.1, { x: 960, y: 540, w: 1300, h: 300, color: C.white, rot: -0.02, seed: 373, tapeIt: true }, (g) => {
    text(g, 'frauds this big', 650, 130, { font: 'Caveat', weight: 700, size: 90, color: C.ink, align: 'center' });
    text(g, 'almost never begin big', 650, 230, { font: 'Permanent Marker', size: 64, color: C.red, align: 'center' });
  });
  ctx.restore();
  // 4: the tiger
  ctx.save(); ctx.globalAlpha = show(3);
  piece(ctx, { x: 960, y: 540, w: 2100, h: 480, color: C.orange, rot: -0.03, seed: 374, torn: 'tb' }, (g) => {
    const r = rand(8);
    g.fillStyle = '#1a1612';
    for (let i = 0; i < 16; i++) {
      const x = (i / 16) * 2100 + r() * 30;
      g.beginPath(); g.moveTo(x, 0); g.quadraticCurveTo(x + 60, 140, x + 10, 260); g.quadraticCurveTo(x, 140, x - 22, 0); g.fill();
    }
  });
  note(ctx, t, c[3] + 2.4, "a tiger you can't get off", 960, 560, { size: 90, color: C.white });
  ctx.restore();
}

function endcard(ctx, s) {
  const { t } = s;
  const c = [0, 1].map(s.cue);
  stage(ctx, s, { zoom: [1, 1.03] });
  strip(ctx, t, 0.2, 'NEXT ON PAPER EMPIRES', 620, 170, { color: C.red, size: 56, seed: 381 });
  card(ctx, t, c[0] + 0.5, { x: 620, y: 560, w: 900, h: 520, color: C.white, rot: -0.02, seed: 382, tapeIt: true }, (g) => {
    // a phone, going from #1 to nothing
    g.fillStyle = C.navy;
    g.beginPath(); g.roundRect(120, 90, 200, 360, 30); g.fill();
    g.fillStyle = '#9fc3a3'; g.fillRect(145, 130, 150, 130);
    for (let i = 0; i < 9; i++) { g.fillStyle = C.paper; g.fillRect(150 + (i % 3) * 50, 290 + Math.floor(i / 3) * 45, 36, 28); }
    text(g, 'From #1', 620, 210, { font: 'Oswald', weight: 700, size: 84, color: C.navy, align: 'center', spacing: 2 });
    text(g, 'to nothing', 620, 310, { font: 'Permanent Marker', size: 70, color: C.red, align: 'center' });
    text(g, 'in six years', 620, 390, { font: 'Caveat', weight: 700, size: 56, color: C.muted, align: 'center' });
  });
  card(ctx, t, c[1], { x: 1460, y: 560, w: 520, h: 160, color: C.red, rot: 0.03, seed: 383, torn: 'lr' }, (g) => {
    text(g, 'SUBSCRIBE', 260, 108, { font: 'Oswald', weight: 700, size: 86, color: C.white, align: 'center', spacing: 6 });
  });
  arrow(ctx, [1480, 820], [1460, 680], prog(t, c[1] + 0.6, c[1] + 1.2), { bend: 0.3, color: C.sticky });
}

export const scenes = {
  chapter5: chapter(5, 'The Fall'), arrest, mahindra, verdict,
  chapter6: chapter(6, 'How Did Nobody Notice?'), checklist, legacy, outro, endcard,
};
