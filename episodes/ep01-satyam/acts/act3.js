// Chapter 3: The escape plan
import {
  C, clamp, lerp, prog, ease, rand, text, piece, tape,
  stage, card, strip, stamp, sticky, note, chapter, bust, building, docStack, pop, fade, hitTime,
} from '../../../pipeline/kit.js';
import { markerCircle, markerLine, arrow, paperFill, tornPath } from '../../../pipeline/collage.js';

export const hits = [
  { scene: 'maytas', cue: 3, at: 1.6 },   // letters land as MAYTAS
  { scene: 'swap', cue: 3, at: 0.5 },     // FILLED
  { scene: 'revolt', cue: 2, at: 3.0 },   // DEAL CANCELLED
  { scene: 'banned', cue: 1, at: 2.6 },   // BANNED
  { scene: 'banned', cue: 3, at: 0.9 },   // door slams
];

/** A dark torn hole in the paper */
function hole(ctx, x, y, w, h, p, seed = 3) {
  if (p <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(p, p);
  tornPath(ctx, -w / 2, -h / 2, w, h, { seed, torn: 'tlbr', jag: 16 });
  ctx.fillStyle = '#05090c';
  ctx.fill();
  ctx.strokeStyle = C.paper;
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.restore();
}

function maytas(ctx, s) {
  const { t } = s;
  const c = [0, 1, 2, 3].map(s.cue);
  const hit = hitTime(hits, s);
  stage(ctx, s, { zoom: [1, 1.05], shakeAt: hit });
  // part 1: the hole and the need for a way out
  const p1 = 1 - prog(t, c[1] - 0.4, c[1]);
  if (p1 > 0) {
    ctx.save();
    ctx.globalAlpha = p1;
    hole(ctx, 960, 560, lerp(200, 760, ease.out(prog(t, 0.2, c[0] + 3))), lerp(140, 480, ease.out(prog(t, 0.2, c[0] + 3))), 1);
    note(ctx, t, 0.8, 'THE HOLE', 960, 580, { size: 80, color: C.red });
    strip(ctx, t, c[0] + 3.5, 'NEEDED: A WAY OUT', 960, 920, { color: C.sticky, ink: C.ink, size: 56, seed: 161 });
    ctx.restore();
  }
  // part 2: SATYAM letters reverse into MAYTAS
  const word = 'SATYAM';
  const flip = ease.inOut(prog(t, c[3] + 0.2, hit));
  const r = rand(17);
  for (let i = 0; i < 6; i++) {
    const p = pop(t, c[1] - 0.2 + i * 0.06, 0.45);
    if (p <= 0) continue;
    const from = i, to = 5 - i;
    const slot = lerp(from, to, flip);
    const arc = Math.sin(flip * Math.PI) * (i < 3 ? -160 : 160);
    piece(ctx, { x: 960 + (slot - 2.5) * 180, y: 420 + arc - (1 - p) * 100, w: 165, h: 205, color: i % 2 ? C.white : C.sticky, rot: (r() - 0.5) * 0.14, seed: 170 + i, alpha: clamp(p * 2) }, (g) => {
      text(g, word[i], 82, 168, { font: 'Playfair Display', weight: 900, size: 170, color: C.ink, align: 'center' });
    });
  }
  card(ctx, t, c[1] + 1.0, { x: 960, y: 800, w: 640, h: 150, color: C.red, rot: 0.02, seed: 180, torn: 'lr' }, (g) => {
    text(g, 'MAYTAS', 320, 108, { font: 'Oswald', weight: 700, size: 100, color: C.white, align: 'center', spacing: 26 });
  });
  note(ctx, t, c[1] + 1.6, 'a company called...', 1430, 700, { size: 48, font: 'Caveat', color: C.white });
  markerCircle(ctx, 960, 610, 640, 330, prog(t, c[2], c[2] + 0.9), { seed: 11 });
  note(ctx, t, hit + 0.4, '= SATYAM, backwards', 960, 1010, { size: 58, color: C.sticky });
}

function deal(ctx, s) {
  const { t } = s;
  const c = [0, 1, 2].map(s.cue);
  stage(ctx, s, { zoom: [1, 1.05] });
  // Satyam
  card(ctx, t, 0.1, { x: 420, y: 520, w: 520, h: 420, color: C.white, rot: -0.03, seed: 191, tapeIt: true }, (g) => {
    g.fillStyle = C.navy;
    g.fillRect(150, 70, 220, 150); g.fillRect(240, 220, 40, 30); g.fillRect(190, 250, 140, 16);
    g.fillStyle = '#5fe08a'; g.fillRect(170, 90, 180, 110);
    text(g, 'SATYAM', 260, 330, { font: 'Oswald', weight: 700, size: 64, color: C.navy, align: 'center', spacing: 3 });
    text(g, 'software', 260, 385, { font: 'Caveat', weight: 700, size: 46, color: C.muted, align: 'center' });
  });
  // Maytas companies
  card(ctx, t, c[0] + 0.3, { x: 1460, y: 500, w: 640, h: 520, color: C.paper, rot: 0.025, seed: 192, tapeIt: true }, (g) => {
    building(g, 150, 300, 110, 220, C.navy, 1);
    building(g, 290, 300, 130, 280, C.teal, 2);
    building(g, 440, 300, 100, 180, C.navy, 3);
    g.fillStyle = '#7a6a4f'; g.fillRect(40, 300, 560, 14);
    text(g, 'MAYTAS PROPERTIES', 320, 380, { font: 'Oswald', weight: 700, size: 46, color: C.navy, align: 'center', spacing: 2 });
    text(g, 'MAYTAS INFRA', 320, 435, { font: 'Oswald', weight: 700, size: 46, color: C.navy, align: 'center', spacing: 2 });
    text(g, 'real estate + infrastructure', 320, 490, { font: 'Caveat', weight: 700, size: 42, color: C.muted, align: 'center' });
  });
  sticky(ctx, t, c[0] + 4.0, 1640, 880, [{ text: "controlled by", size: 34, font: 'Caveat' }, { text: "RAJU'S FAMILY", size: 40, color: C.red }], { w: 340, h: 180, rot: -0.05, seed: 193 });
  // the offer
  strip(ctx, t, c[1] + 0.3, '16 DEC 2008', 420, 150, { color: C.red, size: 54, seed: 194 });
  arrow(ctx, [700, 560], [1120, 560], prog(t, c[1] + 2.0, c[1] + 3.0), { bend: -0.15, width: 9 });
  sticky(ctx, t, c[1] + 3.6, 910, 760, [{ text: 'BUY FOR', size: 36 }, { text: '$1.6 BILLION', size: 52, color: C.red }], { w: 380, h: 200, rot: 0.04, seed: 195 });
  // makes no sense
  for (const [i, x, y] of [[0, 900, 300], [1, 1000, 230], [2, 820, 210]]) {
    text(ctx, '?', x, y, { font: 'Permanent Marker', size: 110, color: C.sticky, alpha: pop(t, c[2] + 2.5 + i * 0.25) });
  }
  note(ctx, t, c[2] + 3.6, 'software → construction?', 960, 1010, { size: 54, color: C.white, font: 'Caveat' });
}

function swap(ctx, s) {
  const { t } = s;
  const c = [0, 1, 2, 3].map(s.cue);
  const hit = hitTime(hits, s);
  stage(ctx, s, { zoom: [1, 1.04], shakeAt: hit });
  note(ctx, t, c[0] + 0.2, 'look at it from the inside', 960, 130, { size: 64, color: C.white, font: 'Caveat' });
  // the hole on the right gets filled by real assets
  const fill = ease.out(prog(t, c[2] + 0.4, c[3]));
  hole(ctx, 1460, 640, 520, 340, 1 - fill * 0.85, 5);
  if (fill < 0.4) note(ctx, t, 0.4, 'THE HOLE', 1460, 660, { size: 64, color: C.red });
  // fake cash slides into the deal
  const move = ease.inOut(prog(t, c[1] + 1.5, c[1] + 4.0));
  ctx.save();
  ctx.translate(lerp(0, 520, move), 0);
  ctx.globalAlpha = 1 - prog(t, c[1] + 3.6, c[1] + 4.2);
  docStack(ctx, 400, 720, 7, prog(t, c[0] + 0.6, c[0] + 1.8), { color: '#7fa877', seed: 5, w: 240, h: 120 });
  strip(ctx, t, c[0] + 1.0, 'FAKE CASH', 400, 500, { color: C.red, size: 50, seed: 201, slide: false });
  ctx.restore();
  card(ctx, t, c[1] + 0.6, { x: 960, y: 440, w: 380, h: 200, color: C.white, rot: 0.02, seed: 202, tapeIt: true }, (g) => {
    text(g, 'THE DEAL', 190, 125, { font: 'Oswald', weight: 700, size: 70, color: C.navy, align: 'center', spacing: 3 });
  });
  // buildings and land land in the hole
  const r = rand(3);
  for (let i = 0; i < 4; i++) {
    const p = pop(t, c[2] + 0.4 + i * 0.35);
    if (p <= 0) continue;
    ctx.save();
    ctx.translate(1300 + i * 105, 760);
    ctx.scale(p, p);
    building(ctx, 0, 0, 90, 140 + r() * 140, i % 2 ? C.teal : C.navy, 30 + i);
    ctx.restore();
  }
  if (fill > 0) {
    ctx.fillStyle = paperFill(ctx, '#7fa877');
    ctx.fillRect(1220, 760, 480 * fill, 26);
  }
  stamp(ctx, t, hit, 'FILLED. FOREVER.', 1460, 360, { size: 70, rot: 0.06 });
}

function revolt(ctx, s) {
  const { t } = s;
  const c = [0, 1, 2].map(s.cue);
  const hit = hitTime(hits, s);
  stage(ctx, s, { zoom: [1, 1.05], shakeAt: hit });
  // investors
  for (let i = 0; i < 7; i++) {
    const p = pop(t, 0.2 + i * 0.08);
    if (p <= 0) continue;
    ctx.save();
    ctx.translate(300 + i * 220, 1010);
    ctx.scale(p, p);
    ctx.globalAlpha = 0.95;
    import_bust(ctx, i);
    ctx.restore();
  }
  const bubbles = [['NO WAY!', 360, 560, c[0] + 0.8], ['OUR MONEY?!', 960, 480, c[1] + 0.4], ['FAMILY BUSINESS?!', 1480, 600, c[1] + 2.4]];
  bubbles.forEach(([str, x, y, at], i) => {
    card(ctx, t, at, { x, y, w: str.length * 34 + 90, h: 140, color: i === 1 ? C.sticky : C.white, rot: (i - 1) * 0.05, seed: 210 + i }, (g) => {
      text(g, str, (str.length * 34 + 90) / 2, 92, { font: 'Permanent Marker', size: 58, color: C.ink, align: 'center' });
    });
  });
  strip(ctx, t, c[0] + 0.1, 'INVESTORS WERE FURIOUS', 960, 140, { color: C.red, size: 52, seed: 214 });
  // crash + cancel
  card(ctx, t, c[2] + 0.2, { x: 1500, y: 300, w: 420, h: 240, color: C.white, rot: 0.03, seed: 215 }, (g) => {
    text(g, 'SHARES', 210, 60, { font: 'Oswald', weight: 700, size: 38, color: C.navy, align: 'center', spacing: 3 });
    markerLine(g, [[40, 110], [160, 105], [220, 120], [300, 200], [380, 215]], prog(t, c[2] + 0.6, c[2] + 1.6), { width: 8 });
  });
  stamp(ctx, t, hit, 'DEAL CANCELLED', 960, 560, { size: 100, rot: -0.08 });
}
function import_bust(ctx, i) {
  bust(ctx, 0, 0, 170, i % 3 === 1 ? C.teal : C.deep);
}

function banned(ctx, s) {
  const { t } = s;
  const c = [0, 1, 2, 3, 4].map(s.cue);
  const ban = hitTime(hits, s, 0), slam = hitTime(hits, s, 1);
  stage(ctx, s, { zoom: [1, 1.04], shakeAt: [ban, slam] });
  note(ctx, t, c[0] + 0.2, 'then the hits kept coming', 960, 120, { size: 60, color: C.white, font: 'Caveat' });
  card(ctx, t, c[1] + 0.3, { x: 560, y: 420, w: 640, h: 300, color: C.white, rot: -0.03, seed: 221, tapeIt: true }, (g) => {
    text(g, 'WORLD BANK', 320, 140, { font: 'Oswald', weight: 700, size: 90, color: C.navy, align: 'center', spacing: 4 });
    text(g, 'contracts', 320, 220, { font: 'Caveat', weight: 700, size: 52, color: C.muted, align: 'center' });
  });
  stamp(ctx, t, ban, 'BANNED', 600, 470, { size: 110, rot: -0.14 });
  // directors leave
  for (let i = 0; i < 4; i++) {
    const at = c[2] + 0.3 + i * 0.25;
    const leave = ease.in(prog(t, c[2] + 1.6 + i * 0.35, c[2] + 2.4 + i * 0.35));
    card(ctx, t, at, { x: 1220 + i * 175, y: 420 + leave * 900, w: 160, h: 220, color: C.paper, rot: (i % 2 ? 0.05 : -0.04) + leave * (i % 2 ? 0.8 : -0.8), seed: 230 + i }, (g) => {
      bust(g, 80, 100, 110, C.navy);
      text(g, 'DIRECTOR', 80, 195, { font: 'Oswald', weight: 700, size: 24, color: C.ink, align: 'center', spacing: 2 });
    });
  }
  note(ctx, t, c[2] + 2.0, 'resigned', 1480, 300, { size: 64 });
  // the door slams
  const close = ease.in(prog(t, slam - 0.45, slam));
  if (close > 0) {
    for (const side of [-1, 1]) {
      const w = 980;
      const x = side < 0 ? lerp(-w / 2 - 40, 960 - w / 2, close) : lerp(1920 + w / 2 + 40, 960 + w / 2, close);
      piece(ctx, { x, y: 540, w, h: 1180, color: C.kraft, seed: side < 0 ? 241 : 242, shadow: 1 }, (g) => {
        g.strokeStyle = 'rgba(80,55,25,0.45)'; g.lineWidth = 8;
        g.strokeRect(80, 120, w - 160, 400); g.strokeRect(80, 620, w - 160, 420);
      });
    }
  }
  note(ctx, t, c[4] + 0.3, 'trapped inside his own lie', 960, 560, { size: 72, color: C.red });
}

export const scenes = { chapter3: chapter(3, 'The Escape Plan'), maytas, deal, swap, revolt, banned };
