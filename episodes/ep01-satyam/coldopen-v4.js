// Cold open, version 4: light product-documentary style (map + timeline), rich motion.
// One continuous piece across the letter / crash / truth / title narration scenes.
// Every beat is tied to a word in the narration (see beats()).

import { W, H, clamp, lerp, rand, text } from '../../pipeline/engine.js';
import { ez, span } from '../../pipeline/motion.js';
import { sceneWords, when } from '../../pipeline/shots.js';
import {
  UI, spring, ease, easeIn, inOut, world, headline, odometer, typeOn, card, chip, photoIn,
  lightMap, mapPin, timelineBar, cursor, avatar,
} from '../../pipeline/lightui.js';

const IDS = ['letter', 'crash', 'truth', 'title'];
const HYD = [78.49, 17.39];
const HUBS = [['Bengaluru', [77.59, 12.97]], ['Hyderabad', HYD], ['Pune', [73.86, 18.52]], ['Chennai', [80.27, 13.08]], ['Mumbai', [72.88, 19.08]], ['Gurugram', [77.03, 28.46]]];
const EVENTS = [
  { label: '1987 · Founded', at: 0.04, year: 1987 }, { label: '2001 · NYSE', at: 0.3, year: 2001 },
  { label: '2008 · Award', at: 0.56, year: 2008 }, { label: "Dec '08 · Maytas", at: 0.66, year: 2008.9 },
  { label: "Jan '09 · The letter", at: 0.81, year: 2009 }, { label: '2015 · Verdict', at: 0.96, year: 2015 },
];
const QUOTE = 'It is with deep regret, and tremendous burden that I am carrying on my conscience, that I would like to bring the following facts to your notice:';

/** Times (seconds in the episode) of every beat, from the narration */
export function beats(timeline) {
  const words = [];
  for (const sc of timeline.scenes.filter((s) => IDS.includes(s.id))) {
    for (const w of sceneWords(sc.cues)) words.push({ tok: w.tok, at: sc.start + w.at });
  }
  const at = (p, after = 0) => when(words, p, after);
  const b = {};
  b.date = at('January');
  b.fly = at('the chairman') - 0.5;
  b.card = at('biggest');
  b.letter = at('wrote');
  b.admit = at('admitted');
  b.bill = at('billions');
  b.exist = at('exist');
  b.evening = at('evening');
  b.crash = at('crashed');
  b.p80 = at('80');
  b.fifty = at('Fifty');
  b.jobs = at('jobs');
  b.india = at('entire') - 0.5;
  b.industry = at('industry');
  b.pride = at('pride');
  b.susp = at('suspicion');
  b.strange = at('strangest') - 0.35;
  b.name = at('Satyam', b.strange);
  b.sanskrit = at('Sanskrit');
  b.truth = at('Truth', b.sanskrit + 0.3);
  const title = timeline.scenes.find((s) => s.id === 'title');
  b.title = title.start;
  b.end = title.start + title.duration;
  return b;
}

// scrubber position over time (0..1), and the year it shows
const scrub = (T, b) => lerp(0.0, 0.81, ez.p2InOut(span(T, b.date - 0.7, 2.8)));
function yearAt(pos) {
  if (pos <= EVENTS[0].at) return 1987;
  for (let i = 1; i < EVENTS.length; i++) {
    if (pos <= EVENTS[i].at) return lerp(EVENTS[i - 1].year, EVENTS[i].year, (pos - EVENTS[i - 1].at) / (EVENTS[i].at - EVENTS[i - 1].at));
  }
  return 2015;
}

/** Sound design: soft UI pops, ticks, whooshes and two low hits */
export function sounds(timeline) {
  const b = beats(timeline);
  const s = [
    { t: b.fly + 0.1, kind: 'whoosh', vol: 0.5 }, { t: b.fly + 2.0, kind: 'pop' }, { t: b.card, kind: 'pop' },
    { t: b.letter - 0.15, kind: 'tick', vol: 0.7 }, { t: b.letter, kind: 'whoosh', vol: 0.35 }, { t: b.bill + 0.35, kind: 'pop' },
    { t: b.exist, kind: 'hit', vol: 0.9 }, { t: b.exist + 0.1, kind: 'pop', vol: 0.6 },
    { t: b.evening - 0.25, kind: 'whoosh', vol: 0.4 }, { t: b.evening + 0.1, kind: 'pop' }, { t: b.crash + 0.1, kind: 'hit', vol: 0.8 },
    { t: b.p80, kind: 'pop' }, { t: b.fifty - 0.2, kind: 'whoosh', vol: 0.35 }, { t: b.fifty, kind: 'pop' },
    { t: b.india, kind: 'whoosh', vol: 0.5 }, { t: b.susp, kind: 'hit', vol: 0.6 },
    { t: b.name, kind: 'pop' }, { t: b.sanskrit + 0.2, kind: 'pop' }, { t: b.truth, kind: 'hit', vol: 0.7 },
    { t: b.title + 0.3, kind: 'whoosh', vol: 0.4 }, { t: b.title + 0.9, kind: 'pop' },
  ];
  HUBS.forEach((_, i) => s.push({ t: b.industry + i * 0.16, kind: 'tick', vol: 0.6 }));
  // a tick each time the scrubber passes an event
  EVENTS.forEach((ev) => {
    for (let T = b.date - 0.7; T < b.date + 2.2; T += 0.02) if (scrub(T, b) >= ev.at) { s.push({ t: T, kind: 'tick', vol: 0.6 }); break; }
  });
  return s;
}

let B = null; // beats, filled by preload
export async function preload() {
  const tl = await (await fetch(new URL('../../build/ep01-satyam/timeline.json', import.meta.url))).json();
  B = beats(tl);
}

/** Map camera: lon, lat, zoom over time */
function camera(T, b) {
  const keys = [
    { t: 0, lon: 48, lat: 24, k: 5.2 },
    { t: b.fly, lon: 50, lat: 23, k: 5.6 },
    { t: b.fly + 2.4, lon: 77.6, lat: 19.4, k: 46 },
    { t: b.india, lon: 77.4, lat: 19.2, k: 50 },
    { t: b.india + 2.0, lon: 81.5, lat: 21, k: 20 },
    { t: b.strange, lon: 81.8, lat: 21, k: 19 },
  ];
  let i = keys.findIndex((k) => k.t > T);
  if (i === -1) return keys[keys.length - 1];
  if (i === 0) return keys[0];
  const a = keys[i - 1], c = keys[i];
  const p = ez.p2InOut((T - a.t) / (c.t - a.t));
  return { lon: lerp(a.lon, c.lon, p), lat: lerp(a.lat, c.lat, p), k: Math.exp(lerp(Math.log(a.k), Math.log(c.k), p)) };
}

function draw(ctx, T) {
  const b = B;
  const red = ease(T, b.crash, 1.2) * (1 - ease(T, b.strange, 0.8));
  world(ctx, T, { tint: red * 0.6 });

  // ---------------- map
  const mapA = ease(T, 0, 1.6) * (1 - ease(T, b.strange, 0.6));
  const cam = camera(T, b);
  const proj = lightMap(ctx, cam.lon, cam.lat, cam.k, { alpha: mapA });
  // veil while the documents are in focus
  const veil = ease(T, b.letter, 0.6) * (1 - ease(T, b.india, 0.8));
  if (veil > 0) { ctx.fillStyle = `rgba(246,242,255,${veil * 0.6})`; ctx.fillRect(0, 0, W, H); }

  // Hyderabad pin + connector to the event card
  const [px, py] = proj(HYD);
  if (T < b.india + 0.3 && mapA > 0) mapPin(ctx, T, b.fly + 1.9, px, py, { scale: 1 - veil * 0.4 });
  if (T > b.fly + 2.1 && T < b.letter + 0.4) {
    const lab = spring(T, b.fly + 2.1, { freq: 1.8, damp: 0.6 });
    chip(ctx, 'Hyderabad', px - 170, py - 112, { size: 26, weight: 600, scale: lab, alpha: Math.min(1, lab) * (1 - ease(T, b.letter, 0.3)), stroke: null });
  }
  const conn = ease(T, b.card + 0.2, 0.7) * (1 - ease(T, b.letter, 0.25));
  if (conn > 0) {
    ctx.save();
    ctx.strokeStyle = UI.purple; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.setLineDash([1200]); ctx.lineDashOffset = 1200 * (1 - conn);
    ctx.beginPath(); ctx.moveTo(px + 16, py - 8); ctx.bezierCurveTo(px + 90, py - 120, 1040, 470, 1130, 440); ctx.stroke();
    ctx.restore();
  }

  // IT hubs (industry beat)
  if (T > b.industry - 0.2 && T < b.strange + 0.7) {
    const sus = ease(T, b.susp, 0.6);
    HUBS.forEach(([name, ll], i) => {
      const [hx, hy] = proj(ll);
      const at = b.industry + i * 0.16;
      mapPin(ctx, T, at, hx, hy, { scale: 0.75 * (1 - ease(T, b.strange, 0.5)), color: sus > 0.5 ? UI.red : UI.purple, pulse: sus > 0.5 });
      const lp = spring(T, at + 0.12, { freq: 1.8, damp: 0.65 });
      chip(ctx, name, hx + 24, hy - 22, { size: 20, weight: 600, scale: lp, alpha: Math.min(1, lp) * (1 - ease(T, b.strange, 0.4)), stroke: null, color: sus > 0.5 ? '#a3261a' : UI.ink, fill: sus > 0.5 ? UI.redSoft : '#fff' });
    });
  }

  // ---------------- timeline
  const tlA = ease(T, 0.4, 0.9) * (1 - ease(T, b.strange, 0.5));
  const pos = scrub(T, b);
  const yr = yearAt(pos);
  timelineBar(ctx, T, EVENTS, pos, { alpha: tlA, label: pos >= 0.8 ? 'Jan 2009' : String(Math.floor(yr)) });

  // ---------------- headlines (left)
  const HL = [
    [['7 January,', '2009'], b.date - 0.1, b.fly + 0.5],
    [['Hyderabad,', 'India'], b.fly + 0.7, b.letter - 0.25],
    [['A letter to', 'the board'], b.letter, b.bill - 0.25],
    [['The cash', 'in the bank'], b.bill, b.exist - 0.3],
    [["That wasn't", 'there'], b.exist - 0.05, b.evening - 0.3, UI.red],
    [['By evening'], b.evening, b.fifty - 0.3],
    [['50,000', 'people'], b.fifty, b.india - 0.1],
    [['A whole', 'industry'], b.india + 0.2, b.susp - 0.3],
    [['Under', 'suspicion'], b.susp, b.strange - 0.05, UI.red],
  ];
  for (const [lines, a, o, col] of HL) headline(ctx, T, lines, 150, 290, a, o, { size: 104, color: col || UI.purple });

  // ---------------- right-hand cards
  // 1. event card → morphs into the letter
  const evIn = spring(T, b.card - 0.1, { freq: 1.3, damp: 0.78 });
  const morph = spring(T, b.letter, { freq: 1.2, damp: 0.85 });
  const docOut = easeIn(T, b.evening - 0.3, 0.45);
  if (evIn > 0.01 && docOut < 1) {
    const r0 = { x: 1130 + (1 - evIn) * 420, y: 170, w: 620, h: 620 }, r1 = { x: 1010, y: 150, w: 780, h: 690 };
    const x = lerp(r0.x, r1.x, morph) + docOut * 900, y = lerp(r0.y, r1.y, morph), w = lerp(r0.w, r1.w, morph), h = lerp(r0.h, r1.h, morph);
    card(ctx, x, y, w, h, { alpha: Math.min(1, evIn * 1.5) }, (g, cw, ch) => {
      const evA = 1 - ease(T, b.letter, 0.25);
      if (evA > 0) {
        g.globalAlpha = evA;
        photoIn(g, 'tech', 0, 0, cw, 270, { zoom: lerp(1.15, 1.0, ease(T, b.card, 2.5)) });
        const st = (k) => ease(T, b.card + 0.12 + k * 0.08, 0.6);
        text(g, '7 January 2009', 36, 320 + (1 - st(0)) * 20, { font: UI.BODY, weight: 600, size: 22, color: UI.purple, alpha: st(0) });
        text(g, 'Satyam Computer', 36, 372 + (1 - st(1)) * 20, { font: UI.HEAD, weight: 700, size: 40, color: UI.ink, alpha: st(1) });
        text(g, 'Services', 36, 418 + (1 - st(1)) * 20, { font: UI.HEAD, weight: 700, size: 40, color: UI.ink, alpha: st(1) });
        text(g, "One of India's biggest IT companies", 36, 466 + (1 - st(2)) * 20, { font: UI.BODY, size: 23, color: UI.muted, alpha: st(2) });
        const c1 = spring(T, b.card + 0.55, { freq: 2, damp: 0.6 }), c2 = spring(T, b.card + 0.7, { freq: 2, damp: 0.6 });
        const w1 = chip(g, '50,000+ employees', 36, 506, { size: 21, scale: c1, alpha: Math.min(1, c1) });
        chip(g, 'NYSE listed', 36 + w1 + 12, 506, { size: 21, scale: c2, alpha: Math.min(1, c2) });
        const c3 = spring(T, b.card + 0.9, { freq: 2, damp: 0.6 });
        chip(g, 'Read the letter  →', 36, 562, { size: 21, weight: 600, fill: UI.purple, stroke: null, color: '#fff', scale: c3 * (1 - span(T, b.letter - 0.15, 0.12) * 0.08), alpha: Math.min(1, c3) });
        g.globalAlpha = 1;
      }
      const dA = ease(T, b.letter + 0.25, 0.5);
      if (dA > 0) {
        g.globalAlpha = dA;
        avatar(g, 60, 62, 26, '#b9a6f0');
        text(g, 'B. Ramalinga Raju', 102, 56, { font: UI.BODY, weight: 600, size: 24, color: UI.ink });
        text(g, 'to Board of Directors, Satyam', 102, 88, { font: UI.BODY, size: 20, color: UI.muted });
        text(g, '7 Jan 2009', cw - 36, 56, { font: UI.BODY, size: 20, color: UI.muted, align: 'right' });
        g.fillStyle = UI.line; g.fillRect(36, 120, cw - 72, 2);
        const scroll = inOut(T, b.bill - 0.2, 0.8) * 120;
        g.save();
        g.beginPath(); g.rect(0, 124, cw, 2000); g.clip();
        g.translate(0, -scroll);
        typeOn(g, T, b.admit - 0.5, QUOTE, 40, 190, { size: 31, maxW: cw - 90, cps: 30, lineH: 1.55, color: '#2b2838' });
        // highlight sweep on the last line
        const hl = ease(T, b.admit + 3.8, 0.6);
        if (hl > 0) { g.fillStyle = 'rgba(217,204,255,0.55)'; g.fillRect(36, 190 + 3 * 48 - 34, (cw - 80) * hl, 46); typeOn(g, T, b.admit - 0.5, QUOTE, 40, 190, { size: 31, maxW: cw - 90, cps: 30, lineH: 1.55, color: '#2b2838' }); }
        g.restore();
        g.globalAlpha = 1;
      }
    });
  }
  cursor(ctx, T, [1500, 980], [1250, 755], b.letter - 1.0, b.letter - 0.15, { alpha: 1 - ease(T, b.letter + 0.1, 0.3) });

  // 2. stat card: the cash
  const sIn = spring(T, b.bill + 0.3, { freq: 1.6, damp: 0.7 });
  if (sIn > 0.01 && docOut < 1) {
    const lift = ease(T, b.exist, 0.6);
    card(ctx, 1060 + docOut * 900, lerp(560, 470, lift), 680, 230, { scale: lerp(0.85, 1, Math.min(1, sIn)), alpha: Math.min(1, sIn * 1.4), lift: 1.4 }, (g, cw) => {
      text(g, 'Cash & bank balances', 36, 58, { font: UI.BODY, weight: 600, size: 23, color: UI.muted });
      const tw = odometer(g, T, b.bill + 0.45, '₹5,361 cr', 36, 160, { size: 92 });
      text(g, 'in the books · Sept 2008', 38, 205, { font: UI.BODY, size: 20, color: UI.faint });
      const st = ease(T, b.exist + 0.25, 0.5);
      if (st > 0) { g.strokeStyle = UI.red; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(30, 128); g.lineTo(30 + (tw + 16) * st, 122); g.stroke(); }
      const tg = spring(T, b.exist + 0.35, { freq: 2, damp: 0.6 });
      chip(g, 'Never existed', cw - 230, 30, { size: 20, weight: 600, fill: UI.redSoft, stroke: null, color: '#a3261a', scale: tg, alpha: Math.min(1, tg) });
    });
  }
  // 3. ring: 94%
  const rIn = spring(T, b.exist + 0.15, { freq: 1.5, damp: 0.72 });
  if (rIn > 0.01 && docOut < 1) {
    card(ctx, 1060 + docOut * 900, 730, 680, 200, { scale: lerp(0.85, 1, Math.min(1, rIn)), alpha: Math.min(1, rIn * 1.4), lift: 1.4 }, (g) => {
      const rp = ez.expoOut(span(T, b.exist + 0.3, 1.4)) * 0.94;
      g.lineCap = 'round'; g.lineWidth = 18;
      g.strokeStyle = UI.soft; g.beginPath(); g.arc(110, 100, 60, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = UI.red; g.beginPath(); g.arc(110, 100, 60, -Math.PI / 2, -Math.PI / 2 + rp * Math.PI * 2); g.stroke();
      text(g, `${Math.round(rp * 100)}%`, 110, 112, { font: UI.HEAD, weight: 700, size: 34, color: UI.ink, align: 'center' });
      odometer(g, T, b.exist + 0.35, '₹5,040 cr', 210, 105, { size: 64, color: UI.red });
      text(g, 'of it never existed', 212, 150, { font: UI.BODY, size: 22, color: UI.muted });
    });
  }

  // 4. share price chart
  const cIn = spring(T, b.evening, { freq: 1.3, damp: 0.78 });
  const cOut = easeIn(T, b.fifty - 0.35, 0.45);
  if (cIn > 0.01 && cOut < 1) {
    card(ctx, 1010 + cOut * 900, 150 + (1 - cIn) * 500, 780, 690, { alpha: Math.min(1, cIn * 1.5) }, (g, cw, ch) => {
      const crash = ez.expoOut(span(T, b.crash, 1.6));
      const price = lerp(179.1, 39.95, crash);
      text(g, 'SATYAM', 40, 66, { font: UI.HEAD, weight: 700, size: 34, color: UI.ink, spacing: 2 });
      text(g, 'NSE · 7 Jan 2009', 40, 100, { font: UI.BODY, size: 20, color: UI.muted });
      text(g, `₹${price.toFixed(2)}`, cw - 40, 74, { font: UI.HEAD, weight: 700, size: 52, color: crash > 0.05 ? UI.red : UI.ink, align: 'right' });
      const bx = 40, by = 160, bw = cw - 80, bh = 420;
      g.strokeStyle = UI.line; g.lineWidth = 2;
      for (let i = 0; i <= 3; i++) { g.beginPath(); g.moveTo(bx, by + (bh * i) / 3); g.lineTo(bx + bw, by + (bh * i) / 3); g.stroke(); }
      const r = rand(4), N = 120, pre = 0.55;
      const prog = lerp(0, pre, ease(T, b.evening + 0.2, 2.2)) + (1 - pre) * crash;
      const pts = [];
      for (let i = 0; i <= N * prog; i++) {
        const k = i / N;
        let v = 179 + Math.sin(i * 0.35) * 3 + (r() - 0.5) * 4;
        if (k > pre) v = lerp(179, 40, ez.expoOut((k - pre) / (1 - pre))) + (r() - 0.5) * 5;
        pts.push([bx + k * bw, by + bh - ((v - 20) / 180) * bh]);
      }
      if (pts.length > 1) {
        const col = crash > 0.05 ? UI.red : UI.purple;
        const grad = g.createLinearGradient(0, by, 0, by + bh);
        grad.addColorStop(0, crash > 0.05 ? 'rgba(226,65,46,0.18)' : 'rgba(74,42,140,0.16)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        g.lineTo(pts[pts.length - 1][0], by + bh); g.lineTo(bx, by + bh); g.closePath();
        g.fillStyle = grad; g.fill();
        g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        g.strokeStyle = col; g.lineWidth = 6; g.lineJoin = 'round'; g.stroke();
        const [lx, ly] = pts[pts.length - 1];
        g.fillStyle = col; g.beginPath(); g.arc(lx, ly, 10, 0, Math.PI * 2); g.fill();
      }
      text(g, 'Open', bx, by + bh + 46, { font: UI.BODY, size: 20, color: UI.faint });
      text(g, 'Close', bx + bw, by + bh + 46, { font: UI.BODY, size: 20, color: UI.faint, align: 'right' });
      const bg = spring(T, b.p80, { freq: 1.8, damp: 0.55 });
      if (bg > 0.01) {
        g.save(); g.translate(cw - 200, 300); g.scale(bg, bg);
        g.fillStyle = UI.red; g.beginPath(); g.roundRect(-150, -60, 300, 120, 60); g.fill();
        text(g, '−78%', 0, 26, { font: UI.HEAD, weight: 700, size: 72, color: '#fff', align: 'center' });
        g.restore();
      }
    });
  }

  // 5. people
  const pIn = spring(T, b.fifty, { freq: 1.3, damp: 0.78 });
  const pOut = easeIn(T, b.india - 0.1, 0.45);
  if (pIn > 0.01 && pOut < 1) {
    card(ctx, 1010 + pOut * 900, 150 + (1 - pIn) * 500, 780, 690, { alpha: Math.min(1, pIn * 1.5) }, (g, cw) => {
      text(g, 'Employees', 40, 66, { font: UI.BODY, weight: 600, size: 24, color: UI.muted });
      odometer(g, T, b.fifty + 0.1, '50,000+', 40, 160, { size: 92, color: UI.ink });
      const r = rand(8), cols = 14, rows = 6, gap = 50;
      const fills = ['#c9b8ff', '#ffc9a8', '#b8e0d2', '#f5c6e0', '#ffe2a8'];
      for (let i = 0; i < cols * rows; i++) {
        const cx = 60 + (i % cols) * gap, cy = 250 + Math.floor(i / cols) * gap;
        const ap = spring(T, b.fifty + 0.25 + (i % cols) * 0.025 + Math.floor(i / cols) * 0.04, { freq: 2.2, damp: 0.6 });
        const gone = r() < 0.42;
        const fade = gone ? ease(T, b.jobs + r() * 1.2, 0.5) : 0;
        avatar(g, cx, cy, 20 * Math.max(0, ap), fade > 0.5 ? '#d5d1de' : fills[i % 5], 1 - fade * 0.55);
      }
      const q = spring(T, b.jobs + 0.6, { freq: 1.8, damp: 0.6 });
      chip(g, 'Still have a job?', cw - 300, 40, { size: 21, weight: 600, fill: UI.amber, stroke: null, color: UI.amberInk, scale: q, alpha: Math.min(1, q) });
    });
  }

  // 6. pride / suspicion cards on the map
  const prIn = spring(T, b.pride, { freq: 1.6, damp: 0.7 }) * (1 - ease(T, b.strange, 0.4));
  if (prIn > 0.01) chip(ctx, "The pride of the nation", 1240, 190, { size: 26, weight: 600, scale: prIn, alpha: Math.min(1, prIn), stroke: null });
  const suIn = spring(T, b.susp, { freq: 1.4, damp: 0.75 }) * (1 - ease(T, b.strange, 0.4));
  if (suIn > 0.01) {
    card(ctx, 1240 + (1 - Math.min(1, suIn)) * 300, 280, 560, 190, { alpha: Math.min(1, suIn) }, (g) => {
      text(g, 'Indian IT · trust', 34, 62, { font: UI.HEAD, weight: 700, size: 32, color: UI.ink });
      chip(g, 'Needs attention', 34, 92, { size: 21, weight: 600, fill: UI.amber, stroke: null, color: UI.amberInk });
      text(g, 'Investors ask: who else?', 34, 172, { font: UI.BODY, size: 22, color: UI.muted });
    });
  }

  // ---------------- truth
  headline(ctx, T, ['The strangest part?'], W / 2, H / 2 + 30, b.strange + 0.2, b.name - 0.3, { size: 92, align: 'center', color: UI.ink });
  const up = inOut(T, b.sanskrit - 0.1, 0.8);
  headline(ctx, T, ['Satyam'], W / 2, lerp(H / 2 + 80, 360, up), b.name - 0.15, b.title - 0.35, { size: 230, align: 'center' });
  const dIn = spring(T, b.sanskrit + 0.15, { freq: 1.4, damp: 0.75 });
  const dOut = easeIn(T, b.title - 0.4, 0.4);
  if (dIn > 0.01 && dOut < 1) {
    card(ctx, 560, 470 + (1 - Math.min(1, dIn)) * 120 - dOut * 60, 800, 320, { alpha: Math.min(1, dIn) * (1 - dOut) }, (g, cw) => {
      text(g, 'सत्यम्', 44, 96, { font: 'Noto Serif Devanagari', weight: 700, size: 64, color: UI.ink });
      text(g, 'satyam', 270, 92, { font: UI.BODY, size: 30, color: UI.muted });
      chip(g, 'Sanskrit · noun', cw - 250, 50, { size: 20, weight: 600, fill: UI.soft, stroke: null, color: UI.purple });
      g.fillStyle = UI.line; g.fillRect(44, 140, cw - 88, 2);
      text(g, '1.', 44, 236, { font: UI.HEAD, weight: 600, size: 40, color: UI.faint });
      headline(g, T, ['truth'], 100, 240, b.truth - 0.05, 1e9, { size: 88, color: UI.purple, weight: 700 });
      const ul = ease(T, b.truth + 0.3, 0.6);
      if (ul > 0) { g.fillStyle = 'rgba(217,204,255,0.8)'; g.fillRect(100, 252, 230 * ul, 10); }
    });
  }

  // ---------------- title
  if (T > b.title - 0.1) {
    const out = easeIn(T, b.end - 0.5, 0.5);
    ctx.save();
    ctx.globalAlpha = 1 - out;
    headline(ctx, T, ['Paper Empires'], W / 2, H / 2 + 20, b.title + 0.3, 1e9, { size: 170, align: 'center', weight: 700 });
    const ln = ease(T, b.title + 0.7, 0.8);
    ctx.fillStyle = UI.purple;
    ctx.fillRect(W / 2 - 260 * ln, H / 2 + 70, 520 * ln, 6);
    const c = spring(T, b.title + 0.9, { freq: 1.8, damp: 0.6 });
    ctx.font = `600 26px ${UI.BODY}`;
    const label = 'Episode 1 · The company called Truth';
    const lw = ctx.measureText(label).width + 52;
    chip(ctx, label, W / 2 - lw / 2, H / 2 + 120, { size: 26, weight: 600, scale: c, alpha: Math.min(1, c), stroke: null });
    ctx.restore();
  }
}

const scene = (ctx, s) => draw(ctx, s.T);
export const scenes = Object.fromEntries(IDS.map((id) => [id, scene]));
