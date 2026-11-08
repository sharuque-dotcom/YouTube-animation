// Chapter 1: The perfect success story
import {
  C, W, H, clamp, lerp, prog, ease, rand, text, piece, tape, markerLine,
  stage, card, strip, stamp, sticky, note, chapter, bust, trophy, docStack, underline, pop, fade, hitTime,
} from '../../../pipeline/kit.js';
import { markerCircle, arrow, highlight } from '../../../pipeline/collage.js';
import { view, drawLand, pin, route } from '../../../pipeline/map.js';

export const hits = [
  { scene: 'founding', cue: 2, at: 1.2 },  // SATYAM logo stamp
  { scene: 'growth', cue: 1, at: 1.6 },    // NYSE stamp
  { scene: 'bigfour', cue: 0, at: 0.4 },
];

const HYD = [78.49, 17.39];

function founding(ctx, s) {
  const { t } = s;
  const c = [0, 1, 2].map(s.cue);
  stage(ctx, s, { bg: C.teal, zoom: [1, 1] });
  // fly from world view to India
  const k = ease.inOut(prog(t, 0, c[0] + 2.6));
  const lon = lerp(30, 80, k), lat = lerp(25, 19, k);
  const scale = Math.exp(lerp(Math.log(5), Math.log(26), k));
  const proj = view(lon, lat, scale);
  drawLand(ctx, proj, scale);
  pin(ctx, proj(HYD), 'HYDERABAD', prog(t, c[0] + 0.8, c[0] + 1.3));
  strip(ctx, t, c[0] + 1.5, '1987', 230, 140, { color: C.red, size: 64, seed: 3 });

  // founder card
  card(ctx, t, c[1] + 0.4, { x: 1480, y: 470, w: 520, h: 600, color: C.white, rot: 0.03, seed: 11, tapeIt: true }, (g) => {
    bust(g, 260, 280, 300, C.navy);
    text(g, 'B. RAMALINGA RAJU', 260, 500, { font: 'Oswald', weight: 700, size: 46, color: C.ink, align: 'center', spacing: 2 });
    text(g, 'founder', 260, 560, { font: 'Caveat', weight: 700, size: 48, color: C.muted, align: 'center' });
  });
  sticky(ctx, t, c[1] + 3.5, 1120, 820, [{ text: 'family business:', size: 34, font: 'Caveat' }, { text: 'TEXTILES +', size: 40 }, { text: 'REAL ESTATE', size: 40 }], { w: 330, h: 250, rot: -0.06, seed: 14 });
  sticky(ctx, t, c[1] + 6.5, 1560, 850, [{ text: '+ his brother', size: 44 }], { w: 400, h: 130, rot: 0.04, seed: 15, color: C.white });

  // company name
  const fall = hitTime(hits, s);
  stamp(ctx, t, fall, 'SATYAM COMPUTER SERVICES', 760, 900, { size: 64, rot: -0.04 });
}

function outsourcing(ctx, s) {
  const { t } = s;
  const c = [0, 1, 2].map(s.cue);
  stage(ctx, s, { bg: C.teal, zoom: [1, 1] });
  const k = ease.inOut(prog(t, 0, 2));
  const scale = lerp(6.5, 5.4, k);
  const proj = view(10, 30, scale);
  drawLand(ctx, proj, scale);
  const NY = proj([-74, 40.7]), LDN = proj([-0.1, 51.5]), HY = proj(HYD);
  strip(ctx, t, c[0] + 0.2, 'THE TIMING IS PERFECT', 960, 110, { color: C.sticky, ink: C.ink, size: 50, seed: 19 });
  pin(ctx, NY, 'USA', prog(t, c[1] + 0.2, c[1] + 0.6), { color: C.navy, side: -1 });
  pin(ctx, LDN, 'EUROPE', prog(t, c[1] + 0.5, c[1] + 0.9), { color: C.navy, side: -1 });
  pin(ctx, HY, 'INDIA', prog(t, c[1] + 0.8, c[1] + 1.2));
  route(ctx, NY, HY, prog(t, c[1] + 1.2, c[1] + 3.2), { lift: 0.3 });
  route(ctx, LDN, HY, prog(t, c[1] + 1.6, c[1] + 3.4), { lift: 0.25 });

  // cost comparison
  card(ctx, t, c[2] + 0.2, { x: 620, y: 860, w: 560, h: 220, color: C.white, rot: -0.03, seed: 21 }, (g) => {
    text(g, 'WESTERN ENGINEER', 280, 80, { font: 'Oswald', weight: 700, size: 40, color: C.ink, align: 'center', spacing: 2 });
    text(g, '$ $ $ $ $', 280, 170, { font: 'Permanent Marker', size: 72, color: C.navy, align: 'center' });
  });
  card(ctx, t, c[2] + 0.9, { x: 1300, y: 860, w: 560, h: 220, color: C.sticky, rot: 0.03, seed: 22 }, (g) => {
    text(g, 'INDIAN ENGINEER', 280, 80, { font: 'Oswald', weight: 700, size: 40, color: C.ink, align: 'center', spacing: 2 });
    text(g, '$', 280, 170, { font: 'Permanent Marker', size: 72, color: C.red, align: 'center' });
  });
  note(ctx, t, c[2] + 1.8, 'same code', 960, 730, { size: 52, rot: -0.04 });
}

function y2k(ctx, s) {
  const { t } = s;
  const c = [0, 1, 2].map(s.cue);
  stage(ctx, s, { zoom: [1, 1.08] });
  // old computer screen
  card(ctx, t, 0.1, { x: 700, y: 470, w: 760, h: 520, color: C.paper, rot: -0.02, seed: 31, tapeIt: true }, (g) => {
    g.fillStyle = '#10241c';
    g.fillRect(50, 50, 660, 380);
    const glitch = t > c[0] + 1.2;
    const blink = Math.floor(t * 3) % 2;
    text(g, 'DATE:', 90, 140, { font: 'Special Elite', size: 44, color: '#5fe08a' });
    text(g, glitch ? '01/01/1900' : '12/31/1999', 90, 220, { font: 'Special Elite', size: 84, color: glitch && blink ? C.red : '#5fe08a' });
    if (glitch) text(g, 'ERROR: YEAR = 00', 90, 320, { font: 'Special Elite', size: 46, color: C.red, alpha: blink ? 1 : 0.4 });
  });
  strip(ctx, t, c[0] + 0.5, 'Y2K', 1450, 250, { color: C.red, size: 120, seed: 32 });
  note(ctx, t, c[1] + 0.8, 'fix it before 2000!', 1430, 420, { size: 54, rot: 0.04 });
  // work floods in
  card(ctx, t, c[2] - 0.1, { x: 1430, y: 800, w: 540, h: 170, color: C.white, rot: 0.02, seed: 33 }, (g) => {
    text(g, 'INDIAN IT FIRMS', 270, 110, { font: 'Oswald', weight: 700, size: 60, color: C.navy, align: 'center', spacing: 2 });
  });
  const r = rand(7);
  for (let i = 0; i < 14; i++) {
    const at = c[2] + 0.4 + i * 0.12;
    const p = ease.out(prog(t, at, at + 0.5));
    if (p <= 0) continue;
    const tx = 1180 + r() * 500, ty = 610 - r() * 260;
    piece(ctx, { x: lerp(2200, tx, p), y: lerp(-100, ty, p), w: 170, h: 110, color: i % 3 ? C.white : C.sticky, rot: (r() - 0.5) * 0.5, seed: 40 + i, shadow: 0.7 }, (g) => {
      text(g, 'WORK ORDER', 85, 40, { font: 'Oswald', weight: 700, size: 22, color: C.ink, align: 'center' });
      g.fillStyle = 'rgba(31,29,26,0.18)';
      g.fillRect(20, 58, 130, 7); g.fillRect(20, 76, 100, 7);
    });
  }
}

function growth(ctx, s) {
  const { t } = s;
  const c = [0, 1, 2].map(s.cue);
  const hit = hitTime(hits, s);
  stage(ctx, s, { zoom: [1, 1.04], shakeAt: hit });
  card(ctx, t, 0.05, { x: 640, y: 520, w: 960, h: 700, color: C.white, rot: -0.015, seed: 51, tapeIt: true }, (g) => {
    g.strokeStyle = 'rgba(143,179,201,0.35)';
    g.lineWidth = 1.5;
    for (let x = 0; x < 960; x += 40) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 700); g.stroke(); }
    for (let y = 0; y < 700; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(960, y); g.stroke(); }
    text(g, 'SATYAM', 60, 100, { font: 'Oswald', weight: 700, size: 60, color: C.navy, spacing: 2 });
    text(g, 'growth (illustration)', 62, 145, { font: 'Caveat', weight: 700, size: 40, color: C.muted });
    for (let i = 0; i < 8; i++) {
      const p = ease.out(prog(t, c[0] + 0.2 + i * 0.25, c[0] + 0.7 + i * 0.25));
      const h = (60 + Math.pow(i, 1.8) * 22) * p;
      g.fillStyle = i === 7 ? C.red : C.navy;
      g.fillRect(90 + i * 105, 640 - h, 70, h);
    }
    arrow(g, [120, 560], [860, 190], prog(t, c[0] + 2.0, c[0] + 2.9), { bend: 0.1, color: C.red });
  });
  stamp(ctx, t, hit, 'NYSE · 2001', 1450, 260, { size: 80, rot: 0.08 });
  note(ctx, t, c[1] + 2.0, 'New York Stock Exchange', 1450, 400, { size: 46, font: 'Caveat', color: C.white });
  sticky(ctx, t, c[2] + 0.6, 1300, 650, [{ text: '50,000+', size: 58, color: C.red }, { text: 'employees', size: 40 }], { w: 320, h: 230, rot: -0.05, seed: 52 });
  sticky(ctx, t, c[2] + 2.6, 1640, 640, [{ text: 'offices', size: 44 }, { text: 'worldwide', size: 44 }], { w: 300, h: 210, rot: 0.06, seed: 53 });
  sticky(ctx, t, c[2] + 4.5, 1480, 900, [{ text: 'FORTUNE 500', size: 46, color: C.red }, { text: 'clients', size: 40 }], { w: 360, h: 200, rot: -0.02, seed: 54, color: C.white });
}

function bigfour(ctx, s) {
  const { t } = s;
  const c0 = s.cue(0);
  stage(ctx, s, { zoom: [1, 1.05] });
  strip(ctx, t, c0, 'THE BIG FOUR OF INDIAN IT', 960, 220, { color: C.red, size: 58, seed: 61 });
  const names = ['SATYAM', 'TCS', 'INFOSYS', 'WIPRO'];
  const at = [c0 + 0.4, c0 + 3.6, c0 + 4.4, c0 + 5.2];
  names.forEach((n, i) => {
    card(ctx, t, at[i], { x: 330 + i * 420, y: 600, w: 360, h: 260, color: i === 0 ? C.sticky : C.white, rot: (i % 2 ? 1 : -1) * 0.03, seed: 62 + i }, (g) => {
      text(g, n, 180, 160, { font: 'Oswald', weight: 700, size: 70, color: C.navy, align: 'center', spacing: 2 });
    });
  });
  markerCircle(ctx, 330, 600, 230, 170, prog(t, c0 + 1.2, c0 + 2.2), { seed: 6 });
}

function award(ctx, s) {
  const { t } = s;
  const c = [0, 1, 2, 3].map(s.cue);
  stage(ctx, s, { keys: [{ t: 0, x: 960, y: 540, z: 1 }, { t: c[3], x: 960, y: 540, z: 1 }, { t: c[3] + 1.5, x: 900, y: 520, z: 1.12 }] });
  card(ctx, t, c[0] + 0.2, { x: 760, y: 520, w: 640, h: 760, color: C.white, rot: -0.02, seed: 71, tapeIt: true }, (g) => {
    const glow = g.createRadialGradient(320, 330, 10, 320, 330, 320);
    glow.addColorStop(0, 'rgba(255,210,63,0.35)');
    glow.addColorStop(1, 'rgba(255,210,63,0)');
    g.fillStyle = glow;
    g.fillRect(0, 0, 640, 760);
    trophy(g, 320, 340, 220);
    text(g, 'GOLDEN PEACOCK AWARD', 320, 610, { font: 'Oswald', weight: 700, size: 44, color: C.ink, align: 'center', spacing: 2 });
    text(g, '2008', 320, 670, { font: 'Oswald', weight: 500, size: 40, color: C.muted, align: 'center', spacing: 6 });
  });
  note(ctx, t, c[1] + 0.2, 'Excellence in', 1440, 400, { size: 54, font: 'Caveat', color: C.white });
  strip(ctx, t, c[1] + 0.6, 'CORPORATE GOVERNANCE', 1440, 480, { color: C.sticky, ink: C.ink, size: 46, seed: 72 });
  arrow(ctx, [1300, 640], [1110, 560], prog(t, c[2], c[2] + 0.6), { bend: 0.3 });
  note(ctx, t, c[2] + 0.4, '= for being HONEST', 1460, 700, { size: 60, rot: -0.03 });
  sticky(ctx, t, c[3] + 0.8, 1210, 870, [{ text: 'remember', size: 46 }, { text: 'this!', size: 56, color: C.red }], { w: 280, h: 220, rot: 0.08, seed: 73 });
}

export const scenes = {
  chapter1: chapter(1, 'The Perfect Success Story'),
  founding, outsourcing, y2k, growth, bigfour, award,
};
