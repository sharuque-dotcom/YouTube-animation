// Cold open, version 5: light product-documentary, a new beat every 3-5 s with designed transitions.
import { W, H, clamp, lerp, rand, text } from '../../pipeline/engine.js';
import { ez, span } from '../../pipeline/motion.js';
import { sequence, push } from '../../pipeline/sequence.js';
import {
  UI, spring, ease, easeIn, inOut, world, headline, odometer, typeOn, card, chip, photoIn,
  lightMap, mapPin, timelineBar, cursor, avatar,
} from '../../pipeline/lightui.js';
import { beats } from './coldopen-v4.js';

const IDS = ['letter', 'crash', 'truth', 'title'];
const HYD = [78.49, 17.39];
const HUBS = [['Bengaluru', [77.59, 12.97]], ['Hyderabad', HYD], ['Pune', [73.86, 18.52]], ['Chennai', [80.27, 13.08]], ['Mumbai', [72.88, 19.08]], ['Gurugram', [77.03, 28.46]]];
const EVENTS = [
  { label: '1987 · Founded', at: 0.04, year: 1987 }, { label: '2001 · NYSE', at: 0.3, year: 2001 },
  { label: '2008 · Award', at: 0.56, year: 2008 }, { label: "Dec '08 · Maytas", at: 0.66, year: 2008.9 },
  { label: "Jan '09 · The letter", at: 0.81, year: 2009 }, { label: '2015 · Verdict', at: 0.96, year: 2015 },
];
const QUOTE = 'It is with deep regret, and tremendous burden that I am carrying on my conscience, that I would like to bring the following facts to your notice:';
const TL = { x0: 120, x1: W - 120, y: H / 2 - 20 }; // big centred timeline in beat 1
const scrubPos = (T, b) => lerp(0, 0.81, ez.p2InOut(span(T, b.date - 0.7, 2.6)));
const yearAt = (pos) => {
  if (pos <= EVENTS[0].at) return 1987;
  for (let i = 1; i < EVENTS.length; i++) if (pos <= EVENTS[i].at) return lerp(EVENTS[i - 1].year, EVENTS[i].year, (pos - EVENTS[i - 1].at) / (EVENTS[i].at - EVENTS[i - 1].at));
  return 2015;
};

let B = null;
let draw = null;
export async function preload() {
  const tl = await (await fetch(new URL('../../build/ep01-satyam/timeline.json', import.meta.url))).json();
  B = beats(tl);
  draw = build(B);
}

function build(b) {
  // map camera for the Hyderabad beats (continuous across beats 2-3)
  const hydCam = (T) => {
    const p = ez.p2InOut(span(T, b.fly, 2.3));
    const k = Math.exp(lerp(Math.log(5.6), Math.log(44), p)) * (1 + 0.04 * span(T, b.fly + 2.3, 8));
    return { lon: lerp(52, 77.4, p), lat: lerp(23, 19.4, p), k };
  };
  const indiaCam = (T) => {
    const p = ez.p2InOut(span(T, b.india - 0.4, 2.2));
    return { lon: lerp(78.3, 81.5, p), lat: lerp(19, 21, p), k: Math.exp(lerp(Math.log(40), Math.log(19.5), p)) * (1 + 0.05 * span(T, b.india + 1.8, 6)) };
  };
  const scrubX = lerp(TL.x0 + 50, TL.x1 - 50, 0.81);

  const beatsList = [
    // 1. the date: a big timeline races from 1987 to January 2009
    {
      at: 0,
      draw: (g, x) => {
        push(g, x, { from: 1, to: 1.08, focus: [scrubX, TL.y + 46] });
        lightMap(g, 50, 23, 5.4, { alpha: 0.55 * ease(x.T, 0, 1.5) });
        const pos = scrubPos(x.T, b);
        timelineBar(g, x.T, EVENTS, pos, { y: TL.y, x0: TL.x0, x1: TL.x1, alpha: ease(x.T, 0.2, 0.8), label: pos >= 0.8 ? 'Jan 2009' : String(Math.floor(yearAt(pos))) });
      },
    },
    // 2. fly to Hyderabad; the pin drops
    {
      at: b.fly,
      in: { type: 'iris', focus: [scrubX, TL.y + 46], dur: 0.8 },
      draw: (g, x) => {
        const c = hydCam(x.T);
        const proj = lightMap(g, c.lon, c.lat, c.k);
        const [px, py] = proj(HYD);
        mapPin(g, x.T, b.fly + 1.9, px, py);
        const lab = spring(x.T, b.fly + 2.1, { freq: 1.8, damp: 0.6 });
        chip(g, 'Hyderabad', px - 180, py - 120, { size: 28, weight: 600, scale: lab, alpha: Math.min(1, lab), stroke: null });
      },
    },
    // 3. the chairman's company: a card slides out of the pin
    {
      at: b.card - 0.15,
      in: { type: 'blend', dur: 0.35 },
      draw: (g, x) => {
        const c = hydCam(x.T);
        const proj = lightMap(g, c.lon, c.lat, c.k);
        const [px, py] = proj(HYD);
        mapPin(g, x.T, b.fly + 1.9, px, py);
        const conn = ease(x.T, b.card + 0.15, 0.6);
        g.save(); g.strokeStyle = UI.purple; g.lineWidth = 3; g.setLineDash([1400]); g.lineDashOffset = 1400 * (1 - conn);
        g.beginPath(); g.moveTo(px + 16, py - 8); g.bezierCurveTo(px + 80, py - 140, 980, 520, 1040, 470); g.stroke(); g.restore();
        const ein = spring(x.T, b.card, { freq: 1.3, damp: 0.78 });
        const press = span(x.T, b.letter - 0.2, 0.12) * (1 - span(x.T, b.letter - 0.08, 0.15));
        card(g, 1040 + (1 - ein) * 500, 120, 760, 800, { alpha: Math.min(1, ein * 1.4) }, (cg, cw) => {
          photoIn(cg, 'tech', 0, 0, cw, 340, { zoom: lerp(1.2, 1.0, ease(x.T, b.card, 3)) });
          const st = (k) => ease(x.T, b.card + 0.15 + k * 0.09, 0.6);
          text(cg, '7 January 2009', 44, 400 + (1 - st(0)) * 24, { font: UI.BODY, weight: 600, size: 26, color: UI.purple, alpha: st(0) });
          text(cg, 'A letter from', 44, 462 + (1 - st(1)) * 24, { font: UI.HEAD, weight: 700, size: 52, color: UI.ink, alpha: st(1) });
          text(cg, 'the chairman', 44, 520 + (1 - st(1)) * 24, { font: UI.HEAD, weight: 700, size: 52, color: UI.ink, alpha: st(1) });
          text(cg, "One of India's biggest IT companies", 44, 578 + (1 - st(2)) * 24, { font: UI.BODY, size: 27, color: UI.muted, alpha: st(2) });
          const c1 = spring(x.T, b.card + 0.55, { freq: 2, damp: 0.6 }), c2 = spring(x.T, b.card + 0.7, { freq: 2, damp: 0.6 });
          const w1 = chip(cg, '50,000+ employees', 44, 616, { size: 24, scale: c1, alpha: Math.min(1, c1) });
          chip(cg, 'Listed in New York', 44 + w1 + 14, 616, { size: 24, scale: c2, alpha: Math.min(1, c2) });
          const c3 = spring(x.T, b.card + 0.9, { freq: 2, damp: 0.6 });
          chip(cg, 'Open the letter  →', 44, 700, { size: 26, weight: 600, fill: UI.purple, stroke: null, color: '#fff', scale: c3 * (1 - press * 0.08), alpha: Math.min(1, c3) });
        });
        cursor(g, x.T, [1650, 1000], [1250, 845], b.letter - 1.1, b.letter - 0.2);
      },
    },
    // 4. zoom through the button into the letter; the camera follows the typing
    {
      at: b.letter,
      in: { type: 'zoom', focus: [1250, 845], depth: 6 },
      draw: (g, x) => {
        const lines = typeOn(new OffscreenCanvas(1, 1).getContext('2d'), x.T, b.admit - 0.4, QUOTE, 0, 0, { size: 58, maxW: 1240, cps: 30 });
        const follow = lerp(0, Math.max(0, lines - 2) * 92, ease(x.T, b.admit, 4));
        push(g, x, { from: 1.04, to: 1.12, focus: [W / 2, H / 2] });
        g.translate(0, -follow);
        g.save(); g.translate(W / 2, H / 2); g.rotate(-0.018); g.translate(-W / 2, -H / 2);
        card(g, 250, 90, 1420, 1400, { r: 34 }, (cg, cw) => {
          avatar(cg, 92, 96, 38, '#b9a6f0');
          text(cg, 'B. Ramalinga Raju', 150, 88, { font: UI.BODY, weight: 600, size: 34, color: UI.ink });
          text(cg, 'Chairman · to the Board of Directors', 150, 130, { font: UI.BODY, size: 28, color: UI.muted });
          text(cg, '7 Jan 2009', cw - 60, 88, { font: UI.BODY, size: 28, color: UI.muted, align: 'right' });
          cg.fillStyle = UI.line; cg.fillRect(60, 180, cw - 120, 2);
          const hl = ease(x.T, b.admit + 3.5, 0.7);
          if (hl > 0) { cg.fillStyle = 'rgba(217,204,255,0.6)'; cg.fillRect(54, 300 + 2 * 92 - 52, (cw - 120) * hl, 72); }
          typeOn(cg, x.T, b.admit - 0.4, QUOTE, 64, 300, { size: 58, maxW: 1240, cps: 30, lineH: 1.58, color: '#2b2838' });
        });
        g.restore();
      },
    },
    // 5. the cash: a hero number; on "didn't exist" it crumbles and the truth fills in
    {
      at: b.bill - 0.1,
      in: { type: 'push', dur: 0.6 },
      draw: (g, x) => {
        const punch = ez.expoOut(span(x.T, b.exist, 0.5));
        push(g, x, { from: 1, to: 1.05, focus: [W / 2, H / 2] });
        g.translate(W / 2, H / 2); g.scale(1 + punch * 0.06, 1 + punch * 0.06); g.translate(-W / 2, -H / 2);
        const crumble = span(x.T, b.exist + 0.05, 1.1);
        text(g, 'Cash & bank balances', W / 2, 330, { font: UI.BODY, weight: 600, size: 42, color: UI.muted, align: 'center', alpha: ease(x.T, b.bill, 0.5) * (1 - crumble) });
        if (crumble <= 0) odometer(g, x.T, b.bill + 0.25, '₹5,361 crore', W / 2, 560, { size: 200, align: 'center' });
        else {
          // each character falls away with a spin
          g.font = `700 200px ${UI.HEAD}`;
          const str = '₹5,361 crore', ws = [...str].map((ch) => g.measureText(ch).width);
          let cx = W / 2 - ws.reduce((a, c) => a + c, 0) / 2;
          const r = rand(3);
          [...str].forEach((ch, i) => {
            const d = clamp(crumble * 1.4 - r() * 0.4), drop = d * d * 900, rot = (r() - 0.5) * 1.6 * d;
            g.save(); g.translate(cx + ws[i] / 2, 560 - 70 + drop); g.rotate(rot); g.globalAlpha = 1 - d;
            text(g, ch, 0, 70, { font: UI.HEAD, weight: 700, size: 200, color: d > 0.1 ? UI.red : UI.ink, align: 'center' });
            g.restore();
            cx += ws[i];
          });
        }
        text(g, "in the company's books · September 2008", W / 2, 650, { font: UI.BODY, size: 32, color: UI.faint, align: 'center', alpha: ease(x.T, b.bill + 0.8, 0.5) * (1 - crumble) });
        // the 94% ring + the real number
        const rIn = spring(x.T, b.exist + 0.45, { freq: 1.4, damp: 0.7 });
        if (rIn > 0.01) {
          const rp = ez.expoOut(span(x.T, b.exist + 0.5, 1.3)) * 0.94;
          g.save(); g.translate(640, 560); g.scale(rIn, rIn);
          g.lineCap = 'round'; g.lineWidth = 34;
          g.strokeStyle = UI.soft; g.beginPath(); g.arc(0, 0, 170, 0, Math.PI * 2); g.stroke();
          g.strokeStyle = UI.red; g.beginPath(); g.arc(0, 0, 170, -Math.PI / 2, -Math.PI / 2 + rp * Math.PI * 2); g.stroke();
          text(g, `${Math.round(rp * 100)}%`, 0, 30, { font: UI.HEAD, weight: 700, size: 86, color: UI.ink, align: 'center' });
          g.restore();
          odometer(g, x.T, b.exist + 0.6, '₹5,040 cr', 900, 560, { size: 140, color: UI.red });
          headline(g, x.T, ['never existed'], 905, 660, b.exist + 0.9, 1e9, { size: 64, color: UI.ink, weight: 600 });
        }
      },
    },
    // 6. by evening: the share price falls off a cliff
    {
      at: b.evening - 0.2,
      in: { type: 'wipe', dur: 0.75 },
      draw: (g, x) => {
        const crash = ez.expoOut(span(x.T, b.crash, 1.5));
        const cliffX = 160 + 0.55 * 1600;
        push(g, x, { from: 1, to: 1.14, focus: [cliffX + 200 * crash, 520 + 160 * crash] });
        card(g, 100, 100, W - 200, 880, { r: 36 }, (cg, cw, ch) => {
          text(cg, 'Share price', 60, 92, { font: UI.BODY, weight: 600, size: 32, color: UI.muted });
          text(cg, 'Bombay & National Stock Exchanges · 7 Jan 2009', 60, 136, { font: UI.BODY, size: 24, color: UI.faint });
          const price = lerp(179.1, 39.95, crash);
          text(cg, `₹${price.toFixed(2)}`, cw - 60, 120, { font: UI.HEAD, weight: 700, size: 96, color: crash > 0.03 ? UI.red : UI.ink, align: 'right' });
          const bx = 60, by = 200, bw = cw - 120, bh = 560;
          cg.strokeStyle = UI.line; cg.lineWidth = 2;
          for (let i = 0; i <= 4; i++) { cg.beginPath(); cg.moveTo(bx, by + (bh * i) / 4); cg.lineTo(bx + bw, by + (bh * i) / 4); cg.stroke(); }
          const r = rand(4), N = 160, pre = 0.55;
          const prog = lerp(0.05, pre, ease(x.T, b.evening, 2.6)) + (1 - pre) * crash;
          const pts = [];
          for (let i = 0; i <= N * prog; i++) {
            const k = i / N;
            let v = 179 + Math.sin(i * 0.3) * 3 + (r() - 0.5) * 4;
            if (k > pre) v = lerp(179, 40, ez.expoOut((k - pre) / (1 - pre))) + (r() - 0.5) * 5;
            pts.push([bx + k * bw, by + bh - ((v - 20) / 180) * bh]);
          }
          if (pts.length > 1) {
            const col = crash > 0.03 ? UI.red : UI.purple;
            const grad = cg.createLinearGradient(0, by, 0, by + bh);
            grad.addColorStop(0, crash > 0.03 ? 'rgba(226,65,46,0.2)' : 'rgba(74,42,140,0.16)');
            grad.addColorStop(1, 'rgba(255,255,255,0)');
            cg.beginPath(); pts.forEach(([px, py], i) => (i ? cg.lineTo(px, py) : cg.moveTo(px, py)));
            cg.lineTo(pts[pts.length - 1][0], by + bh); cg.lineTo(bx, by + bh); cg.closePath(); cg.fillStyle = grad; cg.fill();
            cg.beginPath(); pts.forEach(([px, py], i) => (i ? cg.lineTo(px, py) : cg.moveTo(px, py)));
            cg.strokeStyle = col; cg.lineWidth = 8; cg.lineJoin = 'round'; cg.stroke();
            const [lx, ly] = pts[pts.length - 1];
            cg.fillStyle = col; cg.beginPath(); cg.arc(lx, ly, 14, 0, Math.PI * 2); cg.fill();
            cg.fillStyle = `rgba(226,65,46,${0.25 * (1 - ((x.T * 1.5) % 1))})`; cg.beginPath(); cg.arc(lx, ly, 14 + ((x.T * 1.5) % 1) * 40, 0, Math.PI * 2); cg.fill();
          }
          const bg = spring(x.T, b.p80, { freq: 1.6, damp: 0.55 });
          if (bg > 0.01) {
            cg.save(); cg.translate(cw * 0.42, 430); cg.scale(bg, bg); cg.rotate(-0.04);
            cg.fillStyle = UI.red; cg.beginPath(); cg.roundRect(-230, -95, 460, 190, 95); cg.fill();
            text(cg, '−78%', 0, 42, { font: UI.HEAD, weight: 700, size: 120, color: '#fff', align: 'center' });
            cg.restore();
          }
        });
      },
    },
    // 7. pull back from one face to fifty thousand
    {
      at: b.fifty - 0.15,
      in: { type: 'zoomOut', focus: [W / 2, H / 2], to: [1000, 600], depth: 5 },
      draw: (g, x) => {
        push(g, x, { from: 1.35, to: 1.0, focus: [1000, 600] });
        const cols = 34, rows = 14, gap = 52, ox = W / 2 - ((cols - 1) * gap) / 2, oy = 330;
        const fills = ['#c9b8ff', '#ffc9a8', '#b8e0d2', '#f5c6e0', '#ffe2a8'];
        const r = rand(8);
        for (let i = 0; i < cols * rows; i++) {
          const c = i % cols, rr = Math.floor(i / cols);
          const ap = spring(x.T, b.fifty + Math.hypot(c - 17, rr - 7) * 0.035, { freq: 2.2, damp: 0.6 });
          const gone = r() < 0.42;
          const fade = gone ? ease(x.T, b.jobs + c * 0.02 + r() * 0.3, 0.5) : 0;
          avatar(g, ox + c * gap, oy + rr * gap, 21 * Math.max(0, ap), fade > 0.5 ? '#d8d4e2' : fills[i % 5], 1 - fade * 0.5);
        }
        card(g, 150, 70, 720, 220, { alpha: ease(x.T, b.fifty, 0.4) }, (cg) => {
          text(cg, 'Employees', 44, 62, { font: UI.BODY, weight: 600, size: 30, color: UI.muted });
          odometer(cg, x.T, b.fifty + 0.1, '50,000+', 44, 180, { size: 110 });
        });
        const q = spring(x.T, b.jobs + 0.4, { freq: 1.6, damp: 0.6 });
        chip(g, 'Do we still have jobs?', 1240, 150, { size: 34, weight: 600, fill: UI.amber, stroke: null, color: UI.amberInk, scale: q, alpha: Math.min(1, q) });
      },
    },
    // 8. a whole industry: India's IT hubs light up
    {
      at: b.india - 0.4,
      in: { type: 'blend', dur: 0.7 },
      draw: (g, x) => {
        const c = indiaCam(x.T);
        const proj = lightMap(g, c.lon, c.lat, c.k);
        HUBS.forEach(([name, ll], i) => {
          const [hx, hy] = proj(ll);
          const at = b.industry + i * 0.16;
          mapPin(g, x.T, at, hx, hy, { scale: 0.85 });
          const lp = spring(x.T, at + 0.12, { freq: 1.8, damp: 0.65 });
          chip(g, name, hx + 26, hy - 24, { size: 24, weight: 600, scale: lp, alpha: Math.min(1, lp), stroke: null });
        });
        const pr = spring(x.T, b.pride, { freq: 1.6, damp: 0.7 });
        chip(g, '★  The pride of the nation', 1230, 150, { size: 32, weight: 600, scale: pr, alpha: Math.min(1, pr), stroke: null, color: UI.purple });
      },
    },
    // 9. ...under suspicion: the pins turn red, a warning slides in
    {
      at: b.susp - 0.1,
      in: { type: 'cut' },
      draw: (g, x) => {
        const c = indiaCam(x.T);
        push(g, x, { from: 1, to: 1.12, focus: [1000, 600] });
        const proj = lightMap(g, c.lon, c.lat, c.k);
        g.fillStyle = `rgba(255,120,100,${0.1 * ease(x.T, b.susp, 0.6)})`; g.fillRect(-200, -200, W + 400, H + 400);
        HUBS.forEach(([name, ll]) => {
          const [hx, hy] = proj(ll);
          mapPin(g, x.T, b.susp - 3, hx, hy, { scale: 0.85, color: UI.red });
          chip(g, name, hx + 26, hy - 24, { size: 24, weight: 600, stroke: null, fill: UI.redSoft, color: '#a3261a' });
        });
        const su = spring(x.T, b.susp + 0.15, { freq: 1.4, damp: 0.72 });
        card(g, 1180 + (1 - Math.min(1, su)) * 400, 150, 620, 230, { alpha: Math.min(1, su) }, (cg) => {
          text(cg, 'Indian IT · trust', 40, 72, { font: UI.HEAD, weight: 700, size: 40, color: UI.ink });
          chip(cg, 'Needs attention', 40, 104, { size: 25, weight: 600, fill: UI.amber, stroke: null, color: UI.amberInk });
          text(cg, 'Investors ask: who else?', 40, 200, { font: UI.BODY, size: 27, color: UI.muted });
        });
      },
    },
    // 10. the strangest part
    {
      at: b.strange,
      in: { type: 'blend', dur: 0.8 },
      draw: (g, x) => {
        push(g, x, { from: 1, to: 1.1 });
        headline(g, x.T, ['The strangest part?'], W / 2, H / 2 + 40, b.strange + 0.25, 1e9, { size: 120, align: 'center', color: UI.ink });
      },
    },
    // 11. the name crashes in
    {
      at: b.name - 0.25,
      in: { type: 'zoom', dur: 0.55, depth: 3 },
      draw: (g, x) => {
        const s = lerp(2.4, 1, ez.expoOut(span(x.T, b.name - 0.2, 0.55)));
        push(g, x, { from: 1, to: 1.06 });
        g.save(); g.translate(W / 2, H / 2); g.scale(s, s);
        const bl = (s - 1) * 8; if (bl > 0.3) g.filter = `blur(${bl}px)`;
        text(g, 'Satyam', 0, 85, { font: UI.HEAD, weight: 700, size: 260, color: UI.purple, align: 'center', alpha: clamp(ez.expoOut(span(x.T, b.name - 0.2, 0.3))) });
        g.restore();
      },
    },
    // 12. what the name means
    {
      at: b.sanskrit - 0.1,
      in: { type: 'cut' },
      draw: (g, x) => {
        const up = ez.expoOut(span(x.T, b.sanskrit - 0.1, 0.7));
        push(g, x, { from: 1, to: 1.06, focus: [W / 2, 640] });
        text(g, 'Satyam', W / 2, lerp(H / 2 + 85, 330, up), { font: UI.HEAD, weight: 700, size: lerp(260, 170, up), color: UI.purple, align: 'center' });
        const dIn = spring(x.T, b.sanskrit + 0.2, { freq: 1.4, damp: 0.72 });
        card(g, 510, 430 + (1 - Math.min(1, dIn)) * 140, 900, 380, { alpha: Math.min(1, dIn) }, (cg, cw) => {
          text(cg, 'सत्यम्', 54, 116, { font: 'Noto Serif Devanagari', weight: 700, size: 80, color: UI.ink });
          text(cg, 'satyam', 330, 110, { font: UI.BODY, size: 36, color: UI.muted });
          chip(cg, 'Sanskrit · noun', cw - 300, 60, { size: 24, weight: 600, fill: UI.soft, stroke: null, color: UI.purple });
          cg.fillStyle = UI.line; cg.fillRect(54, 170, cw - 108, 2);
          text(cg, '1.', 54, 292, { font: UI.HEAD, weight: 600, size: 52, color: UI.faint });
          headline(cg, x.T, ['truth'], 120, 296, b.truth - 0.05, 1e9, { size: 120, weight: 700 });
          const ul = ease(x.T, b.truth + 0.3, 0.6);
          if (ul > 0) { cg.fillStyle = 'rgba(217,204,255,0.85)'; cg.fillRect(120, 312, 300 * ul, 14); }
        });
      },
    },
    // 13. title, opening out of "truth"
    {
      at: B_TITLE(b),
      in: { type: 'iris', focus: [W / 2 - 80, 690], dur: 0.9 },
      draw: (g, x) => {
        push(g, x, { from: 1.04, to: 1 });
        const out = easeIn(x.T, b.end - 0.45, 0.45);
        g.globalAlpha = 1 - out;
        const word = 'Paper Empires';
        g.font = `700 170px ${UI.HEAD}`;
        g.letterSpacing = '-3px';
        const ws = [...word].map((ch) => g.measureText(ch).width - 3);
        let cx = W / 2 - ws.reduce((a, c) => a + c, 0) / 2;
        [...word].forEach((ch, i) => {
          const p = ez.expoOut(span(x.T, x.a + 0.35 + i * 0.03, 0.6));
          g.save(); g.beginPath(); g.rect(cx - 10, H / 2 - 150, ws[i] + 20, 200); g.clip();
          text(g, ch, cx, H / 2 + 30 + (1 - p) * 180, { font: UI.HEAD, weight: 700, size: 170, color: UI.purple, spacing: -3 });
          g.restore();
          cx += ws[i];
        });
        const ln = ease(x.T, x.a + 0.9, 0.8);
        g.fillStyle = UI.purple; g.fillRect(W / 2 - 300 * ln, H / 2 + 80, 600 * ln, 6);
        const c = spring(x.T, x.a + 1.1, { freq: 1.8, damp: 0.6 });
        g.font = `600 28px ${UI.BODY}`;
        const label = 'Episode 1 · The company called Truth';
        const lw = g.measureText(label).width + 56;
        chip(g, label, W / 2 - lw / 2, H / 2 + 130, { size: 28, weight: 600, scale: c, alpha: Math.min(1, c), stroke: null });
      },
    },
  ];
  return sequence(beatsList, (ctx, T) => world(ctx, T, { tint: ease(T, b.crash, 1) * (1 - ease(T, b.strange, 0.6)) * 0.5 }));
}
const B_TITLE = (b) => b.title - 0.2;

/** Sound design: a whoosh into every transition, pops for arrivals, low hits on reveals */
export function sounds(timeline) {
  const b = beats(timeline);
  const s = [];
  const whoosh = (t, v = 0.45) => s.push({ t, kind: 'whoosh', vol: v });
  const pop = (t, v = 0.8) => s.push({ t, kind: 'pop', vol: v });
  whoosh(b.fly - 0.4); pop(b.fly + 1.95); pop(b.card); s.push({ t: b.letter - 0.2, kind: 'tick' }); whoosh(b.letter - 0.35, 0.55);
  whoosh(b.bill - 0.4); pop(b.bill + 0.3); s.push({ t: b.exist, kind: 'hit', vol: 0.9 }); pop(b.exist + 0.5);
  whoosh(b.evening - 0.55, 0.5); s.push({ t: b.crash + 0.1, kind: 'hit', vol: 0.8 }); pop(b.p80);
  whoosh(b.fifty - 0.5); pop(b.fifty + 0.1); pop(b.jobs + 0.4, 0.6);
  whoosh(b.india - 0.75, 0.35); HUBS.forEach((_, i) => s.push({ t: b.industry + i * 0.16, kind: 'tick', vol: 0.6 })); pop(b.pride);
  s.push({ t: b.susp, kind: 'hit', vol: 0.6 }); pop(b.susp + 0.15);
  whoosh(b.strange - 0.4, 0.3); whoosh(b.name - 0.5, 0.5); s.push({ t: b.name - 0.05, kind: 'hit', vol: 0.5 });
  pop(b.sanskrit + 0.2); s.push({ t: b.truth, kind: 'hit', vol: 0.7 });
  whoosh(B_TITLE(b) - 0.45, 0.5); pop(B_TITLE(b) + 1.1);
  // the scrubber ticking past each event in beat 1
  EVENTS.forEach((ev) => {
    for (let T = b.date - 0.7; T < b.date + 2.2; T += 0.02) if (scrubPos(T, b) >= ev.at) { s.push({ t: T, kind: 'tick', vol: 0.6 }); break; }
  });
  return s;
}

const scene = (ctx, s) => draw(ctx, s.T);
export const scenes = Object.fromEntries(IDS.map((id) => [id, scene]));
