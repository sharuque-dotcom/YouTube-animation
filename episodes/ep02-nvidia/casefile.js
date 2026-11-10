// Episode 2 in the Case File house style: hand-directed scenes (paper, halftone, stamps, scan).
// Each scene's beats are tied to spoken words via `beats(id, w)`; the same beats drive the sounds.
import { W, H, clamp, lerp, rand, text } from '../../pipeline/engine.js';
import { img, ez, span } from '../../pipeline/motion.js';
import { spring } from '../../pipeline/lightui.js';
import { sceneWords, when } from '../../pipeline/shots.js';
import { DS, page, halftone, radial, halftonePhoto, headline, fatText, captionBar, stamp, hud, tab, marker, ring, scrawl } from '../../pipeline/dossier.js';
import { hearts, spy, chipRain, chipIcon, heart, scanHUD } from '../../pipeline/fx.js';

// ---------------------------------------------------------------- timing
const cache = new Map();
function wordsOf(s) {
  if (!cache.has(s.id)) {
    const cues = [];
    for (let i = 0; s.line(i); i++) cues.push({ start: s.cue(i), end: s.cueEnd(i), text: s.line(i) });
    cache.set(s.id, sceneWords(cues));
  }
  return cache.get(s.id);
}
const wf = (words) => (p, after = 0) => when(words, p, after);

/** Named beat times (seconds into the scene) for each scene */
const BEATS = {
  c_email: (w) => ({
    date: Math.max(0.1, w('Sunday') - 0.1), man: w('the most important'), email: w('sent an email'),
    cutB: w('I was unfaithful') - 0.35, s1: w('I was unfaithful'), s2: w('My actions'), s3: w('There is no excuse'), admit: w('what I did') + 0.45,
    cutC: w('The man was') - 0.25, name: w('Jensen'), founder: w('founder'), nv: w('Nvidia'),
  }),
  c_twist: (w) => ({
    notJust: 0.15, affair: w('affair'),
    cutB: w('The woman') - 0.3, watched: w('watched'), intel: w('American intelligence'), china: w('working for China'),
    cutC: w('And her company') - 0.3, billions: w('billions'), chips: w("Nvidia's chips"),
  }),
  c_q: (w) => ({ love: w('love story'), spy: w('spy story'), chips: w('chips on Earth'), all: w('Maybe all three') }),
  chapter1: () => ({}),
};
function beats(s) {
  const k = `b|${s.id}`;
  if (!cache.has(k)) cache.set(k, BEATS[s.id](wf(wordsOf(s))));
  return cache.get(k);
}

// ---------------------------------------------------------------- shared moves
/** The house transition: a diagonal sweep of halftone dots that covers, then uncovers */
function dotWipe(g, t, at, { color = DS.purple, len = 0.28 } = {}) {
  const d = t - at;
  if (Math.abs(d) >= len) return;
  const p = d < 0 ? 1 + d / len : 1 - d / len;
  halftone(g, [0, 0, W, H], (x, y) => 1.6 * (p * 2.2 - ((x + y) / (W + H)) * 1.2), { step: 48, angle: 45, color, k: 0.82 });
}
/** Slow push-in around a point while a shot holds */
function push(g, t, { k = 0.012, cx = W / 2, cy = H / 2 } = {}) {
  const s = 1 + k * t;
  g.translate(cx, cy); g.scale(s, s); g.translate(-cx, -cy);
}
/** Pick the shot for time t from cut times; returns [index, local time] */
function shotAt(t, cuts) {
  let i = 0;
  while (i < cuts.length && t >= cuts[i]) i++;
  return [i, t - (i ? cuts[i - 1] : 0)];
}
function sheet(g, x, y, w, h, { fill = '#fffcf3', rot = 0, shadow = 18 } = {}) {
  g.save(); g.translate(x + w / 2, y + h / 2); g.rotate(rot);
  g.shadowColor = 'rgba(40,30,60,0.25)'; g.shadowBlur = shadow; g.shadowOffsetX = 8; g.shadowOffsetY = 12;
  g.fillStyle = fill; g.fillRect(-w / 2, -h / 2, w, h);
  g.restore();
}
function folder(g, x, y, w, h, { color = '#e8c47f', tabLabel = '' } = {}) {
  g.save();
  g.shadowColor = 'rgba(40,30,60,0.25)'; g.shadowBlur = 24; g.shadowOffsetY = 14;
  g.fillStyle = color; g.beginPath();
  g.moveTo(x, y + 40); g.lineTo(x + 40, y + 40); g.lineTo(x + 70, y); g.lineTo(x + 380, y); g.lineTo(x + 410, y + 40); g.lineTo(x + w, y + 40);
  g.lineTo(x + w, y + h); g.lineTo(x, y + h); g.closePath(); g.fill();
  g.shadowColor = 'transparent';
  g.strokeStyle = 'rgba(90,60,20,0.35)'; g.lineWidth = 3; g.stroke();
  if (tabLabel) text(g, tabLabel, x + 225, y + 30, { font: DS.MONO, weight: 800, size: 22, color: DS.ink, align: 'center', spacing: 2 });
  g.restore();
}
function silhouette(g, x, y, w, h) {
  g.save();
  g.fillStyle = '#e7e1f5'; g.fillRect(x, y, w, h);
  halftone(g, [x, y, w, h], radial(x + w / 2, y + h * 0.4, w * 0.9, 0.5), { step: 16, color: '#cbbff0' });
  g.fillStyle = DS.ink;
  g.beginPath(); g.arc(x + w / 2, y + h * 0.38, w * 0.2, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(x + w / 2, y + h * 0.98, w * 0.38, h * 0.36, 0, Math.PI, Math.PI * 2); g.fill();
  text(g, '?', x + w / 2, y + h * 0.44, { font: DS.FAT, size: 90, color: DS.yellow, align: 'center' });
  g.restore();
}
const pop = (t, at, o) => Math.min(1.08, spring(t, at, o || { freq: 1.8, damp: 0.6 }));

// ---------------------------------------------------------------- cold open: the email
function c_email(g, s) {
  const t = s.t, b = beats(s);
  const [i, lt] = shotAt(t, [b.cutB, b.cutC]);
  page(g);
  g.save();
  if (i === 0) emailDesk(g, t, b);
  else if (i === 1) emailLetter(g, t, lt, b);
  else emailMan(g, t, lt, b);
  g.restore();
  hud(g, t, { chapter: i < 2 ? 'EXHIBIT A · THE EMAIL' : 'EXHIBIT A · THE SENDER', date: '08 NOV 2026' });
  dotWipe(g, t, b.cutB); dotWipe(g, t, b.cutC, { color: DS.ink });
}
function emailDesk(g, t, b) {
  push(g, t, { k: 0.01 });
  halftone(g, [0, 0, W, H], radial(1350, 560, 900, 0.75), { step: 26, angle: 15, color: '#ddd2f6' });
  // calendar page
  const cp = pop(t, b.date);
  if (cp > 0.01) {
    g.save(); g.translate(420, 560); g.rotate(-0.05 * cp); g.scale(cp, cp);
    sheet(g, -210, -250, 420, 500, { fill: '#fffcf3' });
    g.fillStyle = DS.red; g.fillRect(-210, -250, 420, 120);
    text(g, 'NOVEMBER', 0, -168, { font: DS.MONO, weight: 800, size: 44, color: '#fffcf3', align: 'center', spacing: 6 });
    text(g, '8', 0, 140, { font: DS.FAT, size: 300, color: DS.ink, align: 'center' });
    text(g, 'SUNDAY · 2026', 0, 210, { font: DS.MONO, weight: 800, size: 32, color: DS.muted, align: 'center', spacing: 4 });
    g.restore();
    ring(g, t, b.date + 0.7, 420, 600, 150, 150, { color: DS.red, width: 8, seed: 5 });
  }
  headline(g, t, b.man, 'The most', 800, 380, { size: 104 });
  headline(g, t, b.man + 0.3, 'important man', 800, 500, { size: 104 });
  headline(g, t, b.man + 0.65, 'in AI', 800, 620, { size: 104, color: DS.purple, shadow: DS.yellow });
  // an envelope slides in and lands on the desk
  const ep = spring(t, b.email, { freq: 1.4, damp: 0.7 });
  if (ep > 0.01) {
    g.save(); g.translate(lerp(W + 300, 1340, Math.min(1, ep)), 830); g.rotate(lerp(0.4, 0.05, Math.min(1, ep)));
    sheet(g, -260, -150, 520, 300, { fill: '#fbf3df' });
    g.strokeStyle = 'rgba(36,26,61,0.35)'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(-260, -150); g.lineTo(0, 30); g.lineTo(260, -150); g.stroke();
    text(g, 'TO: ALL NVIDIA EMPLOYEES', 0, 110, { font: DS.MONO, weight: 800, size: 26, color: DS.ink, align: 'center', spacing: 2 });
    g.restore();
    const np = pop(t, b.email + 0.45);
    if (np > 0.01) {
      g.save(); g.translate(1560, 690); g.scale(np, np);
      g.fillStyle = DS.red; g.beginPath(); g.arc(0, 0, 40, 0, Math.PI * 2); g.fill();
      text(g, '1', 0, 16, { font: DS.FAT, size: 48, color: '#fff', align: 'center' });
      g.restore();
    }
  }
}
const LETTER = [
  { str: 'I was unfaithful to my wife.', key: 's1', mark: true },
  { str: 'My actions hurt her and', key: 's2' },
  { str: 'our children.', key: 's2', cont: true },
  { str: 'There is no excuse', key: 's3', mark: true },
  { str: 'for what I did.', key: 's3', cont: true, mark: true },
];
const CPS = 17;
function emailLetter(g, t, lt, b) {
  halftone(g, [0, 0, W, H], (x, y) => 0.45 * clamp((x - 1450) / 470) + 0.45 * clamp((y - 700) / 380), { step: 22, angle: 45, color: '#ffd9e6' });
  push(g, lt, { k: 0.008, cx: 960, cy: 600 });
  g.save(); g.translate(960, 570); g.rotate(-0.012); g.translate(-960, -570);
  sheet(g, 380, 110, 1160, 920);
  // memo header
  const rows = [['FROM', 'Jensen Huang'], ['TO', 'Nvidia employees'], ['DATE', 'Sunday, 8 November 2026']];
  rows.forEach(([k, v], r) => {
    const a = clamp((lt - 0.05 - r * 0.12) * 5);
    text(g, k, 470, 210 + r * 52, { font: DS.MONO, weight: 800, size: 26, color: DS.muted, alpha: a, spacing: 2 });
    text(g, v, 620, 210 + r * 52, { font: DS.SANS, weight: 600, size: 30, color: DS.ink, alpha: a });
  });
  g.fillStyle = DS.ink; g.fillRect(470, 340, 980 * clamp(lt * 3), 4);
  // body: typed as it is read
  let prevEnd = 0;
  LETTER.forEach((ln, k) => {
    const start = ln.cont ? prevEnd : b[ln.key];
    const n = Math.floor(Math.max(0, t - start) * CPS);
    prevEnd = start + ln.str.length / CPS;
    if (n <= 0) return;
    const y = 470 + k * 96;
    g.font = `400 58px 'Special Elite'`;
    const full = g.measureText(ln.str).width;
    if (ln.mark) {
      const hp = ez.p2InOut(span(t, prevEnd + 0.1, 0.45));
      if (hp > 0) { g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = DS.yellow; g.fillRect(462, y - 46, (full + 16) * hp, 62); g.restore(); }
    }
    text(g, ln.str.slice(0, n), 470, y, { font: "'Special Elite'", size: 58, color: DS.ink });
  });
  text(g, 'RECREATION · WORDS AS REPORTED', 1450, 990, { font: DS.MONO, weight: 800, size: 20, color: DS.muted, align: 'right', spacing: 2, alpha: clamp(lt * 3) });
  g.restore();
  stamp(g, t, b.admit, 'ADMITTED', 1420, 860, { size: 80, rot: -0.12 });
}
function emailMan(g, t, lt, b) {
  halftone(g, [0, 0, W, H], radial(1280, 520, 760, 0.85), { step: 24, angle: 15, color: '#d8ccf5' });
  push(g, lt, { k: 0.01, cx: 1200, cy: 520 });
  // the print
  const p = clamp(lt / 0.7);
  g.save(); g.translate(1280, 520); g.rotate(0.025);
  g.fillStyle = DS.ink; g.fillRect(-300 + 12, -360 + 12, 600, 730);
  g.fillStyle = '#fffaf0'; g.fillRect(-300, -360, 600, 730);
  halftonePhoto(g, 'jensen', -270, -330, 540, 590, { step: 8, color: DS.ink, bg: '#fffaf0', reveal: ez.p2InOut(p), zoom: 1.25 });
  g.fillStyle = DS.ink; g.fillRect(-270, 270, 540, 70);
  text(g, 'EXHIBIT A-2', 0, 317, { font: DS.MONO, weight: 800, size: 30, color: DS.yellow, align: 'center', spacing: 4 });
  g.restore();
  headline(g, t, b.name - 0.15, 'Jensen', 130, 400, { size: 130 });
  headline(g, t, b.name + 0.15, 'Huang', 130, 545, { size: 130, color: DS.purple, shadow: DS.yellow });
  tab(g, t, b.founder, 'FOUNDER & CEO', 130, 610);
  const lp = pop(t, b.nv);
  const logo = img('nvidialogo');
  if (lp > 0.01 && logo) {
    const h = 110, w = (logo.width / logo.height) * h;
    g.save(); g.translate(130 + w / 2, 760 + h / 2); g.scale(lp, lp);
    sheet(g, -w / 2 - 24, -h / 2 - 20, w + 48, h + 40, { fill: '#ffffff', shadow: 10 });
    g.drawImage(logo, -w / 2, -h / 2, w, h);
    g.restore();
  }
  marker(g, t, b.nv + 0.3, [[140, 935], [700, 925]], { color: DS.red, width: 7 });
}

// ---------------------------------------------------------------- the twist: watched
function c_twist(g, s) {
  const t = s.t, b = beats(s);
  const [i, lt] = shotAt(t, [b.cutB, b.cutC]);
  page(g);
  g.save();
  if (i === 0) twistNotJust(g, t, b);
  else if (i === 1) twistSubject(g, t, lt, b);
  else twistChips(g, t, lt, b);
  g.restore();
  hud(g, t, { chapter: i === 1 ? 'EXHIBIT B · THE SUBJECT' : i === 2 ? 'EXHIBIT C · THE CHIPS' : 'EXHIBIT A · THE EMAIL', date: i ? 'PER REPORTS' : '08 NOV 2026' });
  dotWipe(g, t, b.cutB, { color: DS.ink }); dotWipe(g, t, b.cutC);
}
function twistNotJust(g, t, b) {
  halftone(g, [0, 0, W, H], radial(960, 560, 900, 0.7), { step: 26, color: '#ffe3a3' });
  push(g, t, { k: 0.02 });
  headline(g, t, b.notJust, 'Not just', 960, 420, { size: 130, align: 'center' });
  fatText(g, t, b.affair - 0.25, 'an affair.', 960, 660, { size: 210, align: 'center', color: '#ff8fb1' });
  scrawl(g, t, b.affair + 0.5, 'it goes deeper...', 1180, 820, { size: 50, color: DS.red });
  marker(g, t, b.affair + 0.4, [[640, 720], [1290, 708]], { color: DS.red, width: 9 });
}
function twistSubject(g, t, lt, b) {
  const fp = spring(lt, 0.05, { freq: 1.3, damp: 0.75 });
  g.save(); g.translate(0, (1 - Math.min(1, fp)) * 900);
  folder(g, 200, 150, 1520, 800, { tabLabel: 'CLASSIFIED?' });
  sheet(g, 260, 230, 640, 660, { rot: -0.015 });
  silhouette(g, 380, 280, 400, 460);
  text(g, 'SUBJECT: ALICE HUANG', 580, 800, { font: DS.MONO, weight: 800, size: 30, color: DS.ink, align: 'center', spacing: 2 });
  text(g, 'no photo shown', 580, 845, { font: DS.HAND, size: 30, color: DS.muted, align: 'center' });
  sheet(g, 960, 230, 700, 660, { rot: 0.01, fill: '#fbf3df' });
  text(g, 'FILE NOTES', 1010, 300, { font: DS.MONO, weight: 800, size: 26, color: DS.muted, spacing: 4 });
  g.fillStyle = 'rgba(36,26,61,0.12)';
  for (let k = 0; k < 9; k++) g.fillRect(1010, 600 + k * 30, 560 - (k % 3) * 90, 6);
  g.restore();
  // the surveillance terminal, typed when "watched" is said
  const tp = pop(t, b.watched - 0.1);
  if (tp > 0.01) {
    g.save(); g.translate(1310, 420); g.scale(tp, tp);
    g.fillStyle = DS.ink; g.beginPath(); g.roundRect(-330, -150, 660, 300, 18); g.fill();
    g.restore();
  }
  scanHUD(g, t, b.watched, [380, 280, 400, 460], {
    lines: ['SUBJECT · ALICE HUANG', 'WATCHED BY · US INTELLIGENCE', 'SUSPICION · WORKING FOR CHINA', '* ACCORDING TO REPORTS'],
    readout: [1010, 345], label: 'SURVEILLANCE',
  });
  stamp(g, t, b.china + 0.5, 'REPORTED', 1320, 720, { size: 76, rot: 0.08, color: DS.purple });
  captionBar(g, t, b.intel - 0.2, 'Watched by US intelligence, according to reports', 'US intelligence', 960, 1010, { size: 34 });
}
function twistChips(g, t, lt, b) {
  halftone(g, [0, 0, W, H], radial(960, 520, 820, 1), { step: 30, color: '#ffe08a' });
  chipRain(g, t, b.chips, 2.2, { count: 22 });
  const land = Math.max(b.billions, b.cutC + 0.9);
  const v = 4.8 * ez.expoOut(span(t, b.cutC + 0.1, land - b.cutC));
  fatText(g, t, b.cutC + 0.05, `$${v.toFixed(1)}B`, 960, 600, { size: 300, align: 'center' });
  const a = clamp((t - b.cutC - 0.4) * 3);
  text(g, 'OF NVIDIA CHIPS', 960, 720, { font: DS.MONO, weight: 800, size: 56, color: DS.ink, align: 'center', spacing: 8, alpha: a });
  text(g, 'bought by her former company · per The New York Times', 960, 790, { font: DS.SANS, weight: 600, size: 30, color: DS.muted, align: 'center', alpha: a });
  ring(g, t, b.billions + 0.4, 960, 500, 420, 170, { color: DS.red, width: 8, seed: 9 });
}

// ---------------------------------------------------------------- the question: which story?
function c_q(g, s) {
  const t = s.t, b = beats(s);
  page(g);
  halftone(g, [0, 0, W, H], (x, y) => 0.5 * clamp((y - 700) / 380), { step: 24, angle: 45, color: '#d8ccf5' });
  const cards = [
    { at: b.love, label: 'A LOVE STORY?', color: '#ffc6d6', icon: (gg) => heart(gg, 0, 20, 190, '#e2412e') },
    { at: b.spy, label: 'A SPY STORY?', color: '#d8ccf5', icon: (gg) => magnifier(gg) },
    { at: b.chips, label: 'A CHIP STORY?', color: '#ffe08a', icon: (gg) => chipIcon(gg, 0, 0, 170, 0.08) },
  ];
  cards.forEach((c, k) => {
    const p = spring(t, c.at, { freq: 1.6, damp: 0.6 });
    if (p <= 0.01) return;
    const x = 680 + k * 450, y = 430;
    g.save(); g.translate(x, y + (1 - Math.min(1, p)) * 300); g.rotate((k - 1) * 0.035);
    g.globalAlpha = clamp(p * 2);
    folder(g, -200, -250, 400, 520, { color: c.color });
    c.icon && (g.save(), g.translate(0, -20), c.icon(g), g.restore());
    text(g, c.label, 0, 200, { font: DS.SERIF, weight: 900, size: 40, color: DS.ink, align: 'center' });
    g.restore();
  });
  hearts(g, t, b.love, 1.6, { count: 34 });
  spy(g, t, b.spy, { x: 150, y: 1010, out: b.chips });
  g.save(); g.translate(0, 60); chipRain(g, t, b.chips, 1.6, { count: 14, seed: 3 }); g.restore();
  cards.forEach((c, k) => ring(g, t, b.all + 0.15 + k * 0.18, 680 + k * 450, 450, 245, 315, { color: DS.red, width: 8, seed: k + 2 }));
  stamp(g, t, b.all + 0.8, 'CASE OPEN', 1130, 845, { size: 80, rot: -0.06 });
  hud(g, t, { chapter: 'THE QUESTION', date: 'CASE TG-002' });
}
function magnifier(g) {
  g.save(); g.strokeStyle = DS.ink; g.lineWidth = 18; g.fillStyle = 'rgba(255,255,255,0.6)';
  g.beginPath(); g.arc(-20, -20, 70, 0, Math.PI * 2); g.fill(); g.stroke();
  g.lineWidth = 30; g.lineCap = 'round'; g.beginPath(); g.moveTo(32, 32); g.lineTo(95, 95); g.stroke();
  g.restore();
}

// ---------------------------------------------------------------- chapter card
function chapter1(g, s) {
  const t = s.t;
  page(g);
  halftone(g, [0, 0, W, H], (x, y) => 0.7 * clamp((x - 900) / 1000) + 0.2, { step: 24, angle: 15, color: '#d8ccf5' });
  push(g, t, { k: 0.015 });
  tab(g, t, 0.05, 'EXHIBIT 1', 130, 300);
  headline(g, t, 0.15, 'The Man Who', 130, 490, { size: 130 });
  headline(g, t, 0.45, 'Powers AI', 130, 640, { size: 130, color: DS.purple, shadow: DS.yellow });
  marker(g, t, 1.0, [[140, 690], [820, 676]], { color: DS.red, width: 8 });
  const p = spring(t, 0.1, { freq: 1.4, damp: 0.7 });
  g.save(); g.translate(lerp(W + 400, 1430, Math.min(1, p)), 540); g.rotate(0.035);
  g.fillStyle = DS.ink; g.fillRect(-270 + 12, -330 + 12, 540, 660);
  g.fillStyle = '#fffaf0'; g.fillRect(-270, -330, 540, 660);
  halftonePhoto(g, 'jensen', -240, -300, 480, 540, { step: 8, color: DS.purple, bg: '#fffaf0', zoom: 1.2 });
  text(g, 'CHAPTER 1', 0, 300, { font: DS.MONO, weight: 800, size: 30, color: DS.ink, align: 'center', spacing: 6 });
  g.restore();
  hud(g, t, { chapter: 'CHAPTER 1', date: '1963 →' });
}

export const caseScenes = { c_email, c_twist, c_q, chapter1 };

/** Sound effects for the Case File scenes */
export function caseSounds(timeline) {
  const out = [];
  for (const sc of timeline.scenes) {
    if (!BEATS[sc.id]) continue;
    const b = BEATS[sc.id](wf(sceneWords(sc.cues)));
    const S = (t, kind, vol = 0.7) => out.push({ t: sc.start + t, kind, vol });
    if (b.cutB) { S(b.cutB - 0.2, 'whoosh', 0.4); }
    if (b.cutC) { S(b.cutC - 0.2, 'whoosh', 0.4); }
    if (sc.id === 'c_email') {
      S(b.date + 0.05, 'pop', 0.6); S(b.email + 0.1, 'whoosh', 0.35); S(b.email + 0.45, 'tick', 0.8);
      ['s1', 's2', 's3'].forEach((k) => S(b[k], 'tick', 0.4));
      S(b.admit, 'pop', 0.9); S(b.admit, 'hit', 0.5); S(b.name, 'hit', 0.45); S(b.nv, 'pop', 0.55);
    }
    if (sc.id === 'c_twist') {
      S(b.affair - 0.2, 'hit', 0.55);
      S(b.watched, 'hit', 0.5); for (let k = 0; k < 4; k++) S(b.watched + 0.5 + k * 0.55, 'tick', 0.55);
      S(b.china + 0.5, 'pop', 0.9); S(b.billions, 'pop', 0.8);
      for (let k = 0; k < 6; k++) S(b.chips + 0.45 + k * 0.17, 'tick', 0.45);
    }
    if (sc.id === 'c_q') {
      S(b.love, 'pop', 0.6); S(b.spy, 'whoosh', 0.6); S(b.chips, 'pop', 0.6);
      for (let k = 0; k < 5; k++) S(b.chips + 0.45 + k * 0.18, 'tick', 0.45);
      S(b.all + 0.8, 'pop', 0.9); S(b.all + 0.8, 'hit', 0.5);
    }
    if (sc.id === 'chapter1') { S(0.15, 'hit', 0.6); S(0.5, 'pop', 0.6); }
  }
  return out;
}
