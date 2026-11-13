// Episode 6, chapters 2–6 and the outro.
import { W, H, clamp, lerp, text } from '../../pipeline/engine.js';
import { glow } from '../../pipeline/scenery.js';
import { ez, out3, span, spring, at, pill } from '../../pipeline/scenekit.js';
import { boardroom, callEnded, capitol } from '../ep05-nvidia-part2/sets.js';
import { INK, LAV, RED, GOLD, D, cam, shots, nightBG, panel, counter, stamp, calendarPage, towerNight, caseBoard, doorstep, orgChart, fiveSources, rulebook, caseFiles } from './kit.js';
import { filingPage, emptyChair, wheel, aiCity } from './sets.js';
import { vault, dam, dock, nameCards, watchers, papers, swarm, campus, phoneEmail, doorOpen, flags, twoChairs, cliffChart, stake, emptyStage } from './sets2.js';

const TEAL = '#3ee0b5';
const ui = (g, fn) => { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); fn(); g.restore(); };
/** A panel that springs in at time a, drawn in screen space */
const card = (g, t, a, x, y, w, h, fn) => { const p = spring(t, a, 1.7, 0.65); if (p <= 0.01) return; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.translate(x, y); g.scale(Math.min(1.04, p), Math.min(1.04, p)); g.globalAlpha = Math.min(1, p * 1.5); panel(g, -w / 2, -h / 2, w, h); fn(); g.restore(); };
const T = (g, s, x, y, size, color = INK, weight = 800, font = 'Jakarta') => text(g, s, x, y, { font, weight, size, color, align: 'center' });

// ---------------------------------------------------------------- chapter 2: the customer
function customer(g, s) {
  const t = s.t, b = (p) => at(s, p);
  const c1 = b('Since 2022') - 0.25, c2 = b('So investigators') - 0.25, c3 = b('One company') - 0.25, c4 = b('For part of') - 0.25, c5 = b('Megaspeed denies') - 0.25;
  shots(g, t, [c1, c2, c3, c4, c5], [
    (g2, tt) => { cam(g2, tt, { z0: 1.0, z1: 1.14, dur: 6, fx: 960, fy: 480 }); vault(g2, tt); ui(g2, () => { pill(g2, tt, 0.25, 'Nvidia’s most advanced AI chips', 90, D); if (tt > b('like weapons')) pill(g2, tt, b('like weapons'), 'treated like weapons', 1000, D); }); },
    (g2, tt) => { cam(g2, tt - c1, { z0: 1.0, z1: 1.08, dur: 8, fx: 960, fy: 640 }); dam(g2, tt, { rise: span(tt, c1 + 0.1, 3.6) }); ui(g2, () => { pill(g2, tt, c1 + 0.3, 'United States', 560, { theme: 'dark', x: 400 }); if (tt > b('to China')) pill(g2, tt, b('to China'), 'China', 560, { theme: 'dark', x: 1500 }); }); },
    (g2, tt) => { cam(g2, tt - c2, { z0: 1.12, z1: 1.22, dur: 8, fx: 960, fy: 900 }); dam(g2, tt, { rise: 1, leak: span(tt, c2 + 0.3, 3.2) }); ui(g2, () => { pill(g2, tt, c2 + 0.4, 'were chips leaking around the wall?', 90, D); if (tt > b('Southeast Asia')) pill(g2, tt, b('Southeast Asia'), 'through Southeast Asia?', 1010, D); }); },
    (g2, tt) => {
      const big = b('4.8 billion');
      cam(g2, tt - c3, { z0: 1.0, z1: 1.1, dur: 14, fx: 1200, fy: 700 }); dock(g2, tt, { n: span(tt, c3 + 0.2, big - c3 + 1.5) });
      ui(g2, () => { if (tt > b('Megaspeed')) pill(g2, tt, b('Megaspeed'), 'Megaspeed · a cloud firm in Singapore', 1010, D); });
      card(g2, tt, big - 0.2, 520, 250, 700, 250, () => { counter(g2, tt, big - 0.1, 1.4, 4.8, (v) => `$${v.toFixed(1)}B`, 0, 30, { size: 130, color: '#9be36a' }); T(g2, 'of Nvidia chips in two years · per The New York Times', 0, 86, 24, LAV, 600, 'Inter'); });
    },
    (g2, tt) => { cam(g2, tt - c4, { z0: 1.0, z1: 1.07, dur: 10 }); nameCards(g2, tt, { a1: c4 + 0.1, a2: b('The two share') - 0.4, hs: b('share a surname') + 0.2, nr: b('not reported') }); },
    (g2, tt) => {
      cam(g2, tt - c5, { z0: 1.06, z1: 1.0, dur: 6, fx: 1200, fy: 700 }); dock(g2, tt, { n: 1, dim: span(tt, c5, 0.5) });
      ui(g2, () => stamp(g2, tt, c5 + 0.5, 'DENIES WRONGDOING', 960, 380, { size: 96, rot: -0.06 }));
      card(g2, tt, b('inspections'), 960, 760, 900, 130, () => { [-360, -300, -240].forEach((x, k) => { const p = ez(span(tt, b('inspections') + 0.2 + k * 0.2, 0.3)); g2.strokeStyle = TEAL; g2.lineWidth = 8; g2.lineCap = 'round'; g2.beginPath(); g2.moveTo(x - 14, 0); g2.lineTo(x - 14 + 12 * Math.min(1, p * 2), 12 * Math.min(1, p * 2)); if (p > 0.5) g2.lineTo(x - 2 + 22 * (p - 0.5) * 2, 12 - 30 * (p - 0.5) * 2); g2.stroke(); }); text(g2, 'Megaspeed: inspections found no violations', -190, 11, { font: 'Inter', weight: 600, size: 30, color: INK }); });
    },
  ], ['flash', 'blur', 'push', 'fade', 'blur']);
}

// ---------------------------------------------------------------- chapter 3: day one
function dayone(g, s) {
  const t = s.t, b = (p) => at(s, p);
  const c1 = b('had been watching') - 0.3, c2 = b('The Financial Times') - 0.25, c3 = b('Nvidia pushes back') - 0.25, c4 = b('But in Washington') - 0.25, c5 = b('For ten days') - 0.25;
  shots(g, t, [c1, c2, c3, c4, c5], [
    (g2, tt) => { cam(g2, tt, { z0: 1.0, z1: 1.12, dur: 6, fx: 940, fy: 780 }); doorstep(g2, tt, 0.45); ui(g2, () => { calendarPage(g2, tt, 0.15, 'OCTOBER', '29', 1620, 240, { s: 0.75 }); pill(g2, tt, 0.9, 'Day 1 · The New York Times', 1010, D); }); },
    (g2, tt) => { cam(g2, tt - c1, { z0: 1.0, z1: 1.1, dur: 8, fx: 960, fy: 400 }); watchers(g2, tt); ui(g2, () => { pill(g2, tt, c1 + 0.3, 'a person close to Huang was being watched, the Times reported', 1010, D); if (tt > b('working for China')) pill(g2, tt, b('working for China'), 'suspected of working for China', 90, { theme: 'dark', color: '#ffb3be' }); }); },
    (g2, tt) => {
      const wj = b('The Wall Street Journal');
      cam(g2, tt - c2, { z0: 1.0, z1: 1.08, dur: 12 });
      papers(g2, tt, [{ at: c2 + 0.1, x: 620, y: 430, rot: -0.07, name: 'FINANCIAL TIMES', hair: true }, { at: wj - 0.1, x: 1290, y: 520, rot: 0.05, name: 'THE WALL STREET JOURNAL', hair: true }]);
      card(g2, tt, b('romantic') - 0.2, 620, 770, 640, 96, () => T(g2, 'reports: the relationship was romantic', 0, 11, 28, '#ffb3be', 600, 'Inter'));
      card(g2, tt, b('three countries') - 0.2, 1290, 860, 720, 96, () => T(g2, 'reports: services in three countries suspected her', 0, 11, 28, '#ffb3be', 600, 'Inter'));
    },
    (g2, tt) => { cam(g2, tt - c3, { z0: 1.1, z1: 1.0, dur: 6 }); swarm(g2, tt, c3 + 0.05); ui(g2, () => { pill(g2, tt, c3 + 0.3, 'Nvidia pushes back', 90, D); if (tt > b('thousands of customers') - 0.3) pill(g2, tt, b('thousands of customers') - 0.3, 'Huang talks to thousands of customers every year, it says', 1010, D); }); },
    (g2, tt) => {
      cam(g2, tt - c4, { z0: 1.0, z1: 1.1, dur: 6, fx: 960, fy: 500, pan: [-20, 0] }); capitol(g2, tt + 2);
      ['Foreign Affairs', 'China Committee', 'Intelligence'].forEach((lab, k) => card(g2, tt, c4 + 0.5 + k * 0.35, 420 + k * 540, 250, 460, 130, () => { g2.fillStyle = GOLD; g2.beginPath(); g2.arc(-170, 0, 36, 0, Math.PI * 2); g2.fill(); g2.strokeStyle = '#8a6a10'; g2.lineWidth = 3; g2.beginPath(); g2.arc(-170, 0, 27, 0, Math.PI * 2); g2.stroke(); text(g2, lab, -116, -2, { font: 'Jakarta', weight: 800, size: 30, color: INK }); text(g2, 'committee chairman', -116, 30, { font: 'Inter', weight: 600, size: 20, color: LAV }); }));
      ui(g2, () => pill(g2, tt, b('closed-door') - 0.2, 'they ask for a closed-door briefing', 1010, D));
    },
    (g2, tt) => {
      g2.save(); cam(g2, tt - c5, { z0: 1.0, z1: 1.08, dur: 5 }); nightBG(g2, tt, { seed: 7, rainA: 0.3, moonAt: [1640, 150] }); g2.fillStyle = 'rgba(6,5,16,0.35)'; g2.fillRect(-100, -100, W + 200, H + 200); g2.restore();
      const n = 1 + Math.min(9, Math.floor(ez(span(tt, c5 + 0.2, 2.6)) * 9.99));
      ui(g2, () => {
        const dts = ['29', '30', '31', '1', '2', '3', '4', '5', '6', '7'];
        calendarPage(g2, tt, c5 + 0.05, n <= 3 ? 'OCTOBER' : 'NOVEMBER', dts[n - 1], 520, 520, { s: 1.25 });
        for (let k = 0; k < n; k++) { const x = 1300 + Math.sin(k * 2.3) * 60, y = 800 - k * 46; g2.save(); g2.translate(x, y); g2.rotate(Math.sin(k * 1.7) * 0.12); g2.shadowColor = 'rgba(0,0,0,0.5)'; g2.shadowBlur = 16; g2.fillStyle = '#ece6d8'; g2.fillRect(-230, -30, 460, 60); g2.shadowColor = 'transparent'; g2.fillStyle = '#1d1b29'; g2.fillRect(-206, -16, 250, 14); g2.fillStyle = '#b8b2a6'; g2.fillRect(-206, 6, 400, 7); g2.restore(); }
        T(g2, `DAY ${n}`, 1300, 250, 120, n >= 10 ? GOLD : INK); pill(g2, tt, c5 + 0.4, 'the story only grows', 1010, D);
      });
    },
  ], ['blur', 'flash', 'push', 'fade', 'blur']);
}

// ---------------------------------------------------------------- chapter 4: the email
function email(g, s) {
  const t = s.t, b = (p) => at(s, p);
  const c1 = b('I was unfaithful') - 0.3, c2 = b('He says he supports') - 0.25, c3 = b('The board says') - 0.25, c4 = b('On Monday') - 0.25, c5 = b('For a moment') - 0.25;
  shots(g, t, [c1, c2, c3, c4, c5], [
    (g2, tt) => { cam(g2, tt, { z0: 1.0, z1: 1.14, dur: 7, fx: 960, fy: 620 }); campus(g2, tt, 0.25); ui(g2, () => { pill(g2, tt, 0.25, 'Sunday 8 November', 90, D); if (tt > b('an email') - 0.3) pill(g2, tt, b('an email') - 0.3, 'an email to every employee, from the founder', 1010, D); }); },
    (g2, tt) => { cam(g2, tt - c1, { z0: 1.0, z1: 1.2, dur: 9, fx: 960, fy: 480 }); phoneEmail(g2, tt, { p: span(tt, c1 + 0.3, 6.6) }); },
    (g2, tt) => { cam(g2, tt - c2, { z0: 1.0, z1: 1.1, dur: 5, fx: 1000, fy: 560 }); doorOpen(g2, tt, c2 + 0.1); ui(g2, () => pill(g2, tt, c2 + 0.5, 'he supports an investigation, and will cooperate fully', 1010, D)); },
    (g2, tt) => {
      const st = b('stay on');
      cam(g2, tt - c3, { z0: 1.0, z1: 1.12, dur: 11, fx: 960, fy: 560 }); boardroom(g2, tt + 2);
      card(g2, tt, c3 + 0.4, 960, 190, 1100, 150, () => { T(g2, 'THE BOARD', 0, -30, 22, LAV, 700); T(g2, '“no reason to believe” secrets were compromised', 0, 26, 38); });
      ui(g2, () => stamp(g2, tt, st, 'CEO CONTINUES', 960, 470, { color: TEAL, rot: -0.05, size: 92 }));
    },
    (g2, tt) => {
      const tr = b('President Trump');
      g2.save(); cam(g2, tt - c4, { z0: 1.0, z1: 1.06, dur: 7 }); nightBG(g2, tt, { seed: 11, rainA: 0.3, moonAt: [1640, 150] }); g2.fillStyle = 'rgba(6,5,16,0.4)'; g2.fillRect(-100, -100, W + 200, H + 200); g2.restore();
      ui(g2, () => {
        panel(g2, 120, 220, 860, 600); text(g2, 'NVDA · Monday', 160, 290, { font: 'Jakarta', weight: 800, size: 34, color: '#9be36a' });
        const dp = ez(span(tt, c4 + 0.5, 1.2)), sh = Math.floor(lerp(8, 60, clamp((tt - c4) / 1.8)));
        g2.save(); g2.shadowColor = 'rgba(255,80,100,0.8)'; g2.shadowBlur = 14; g2.strokeStyle = RED; g2.lineWidth = 6; g2.lineJoin = 'round'; g2.beginPath(); for (let i = 0; i <= sh; i++) { const u = i / 60, x = 170 + u * 760, y = 420 + Math.sin(i * 1.9) * 10 + Math.sin(i * 0.7) * 8 + (u > 0.35 ? Math.min(1, (u - 0.35) / 0.3) * 190 * dp : 0); i ? g2.lineTo(x, y) : g2.moveTo(x, y); } g2.stroke(); g2.restore();
        counter(g2, tt, c4 + 0.6, 1.1, 4, (v) => `−${Math.round(v)}%`, 780, 380, { size: 110, color: RED });
        text(g2, 'about four percent', 780, 424, { font: 'Inter', weight: 600, size: 22, color: LAV, align: 'center' });
      });
      card(g2, tt, tr, 1440, 520, 800, 380, () => { text(g2, '“an honorable', 0, -40, { font: "'Playfair Display'", style: 'italic', weight: 400, size: 84, color: INK, align: 'center' }); text(g2, 'guy”', 0, 52, { font: "'Playfair Display'", style: 'italic', weight: 400, size: 84, color: INK, align: 'center' }); T(g2, 'President Trump, on Huang', 0, 130, 26, LAV, 600, 'Inter'); });
    },
    (g2, tt) => { cam(g2, tt - c5, { z0: 1.2, z1: 1.1, dur: 5 }); wheel(g2, tt + 30, { crack: 0.45 }); ui(g2, () => pill(g2, tt, c5 + 0.3, 'for a moment, it looks like he might survive', 1010, D)); },
  ], ['push', 'blur', 'fade', 'flash', 'blur']);
}

// ---------------------------------------------------------------- chapter 5: the second report
function second(g, s) {
  const t = s.t, b = (p) => at(s, p);
  const c1 = b('Then, on Wednesday') - 0.25, c2 = b('It reports that') - 0.25, c3 = b('The paper cites') - 0.25, c4 = b('When the Times called') - 0.25, c5 = b('One scandal') - 0.25, c6 = b('Almost every') - 0.25, c7 = b('That evening') - 0.25, c8 = b('In Santa Clara') - 0.25;
  shots(g, t, [c1, c2, c3, c4, c5, c6, c7, c8], [
    (g2, tt) => { cam(g2, tt, { z0: 1.02, z1: 1.1, dur: 9 }); caseFiles(g2, tt); ui(g2, () => pill(g2, tt, 0.3, 'Tuesday · an independent investigation begins', 90, D)); },
    (g2, tt) => { cam(g2, tt - c1, { z0: 1.0, z1: 1.1, dur: 4, fx: 940, fy: 800 }); doorstep(g2, tt, c1 + 0.45); ui(g2, () => pill(g2, tt, c1 + 0.3, 'Wednesday · The New York Times, again', 90, D)); },
    (g2, tt) => { cam(g2, tt - c2, { z0: 1.0, z1: 1.06, dur: 9, fx: 600, fy: 420 }); orgChart(g2, tt - c2, b('reported directly') - c2); ui(g2, () => pill(g2, tt, c2 + 0.4, 'reported by The New York Times', 90, D)); },
    (g2, tt) => { cam(g2, tt - c3, { z0: 1.0, z1: 1.08, dur: 6 }); fiveSources(g2, tt, c3 + 0.1); const nc = b('did not comment'); [['Nvidia', 700], ['Powell', 1220]].forEach(([lab, x], k) => card(g2, tt, nc + k * 0.3, x, 270, 360, 80, () => T(g2, `${lab}: no comment`, 0, 10, 26, INK, 600, 'Inter'))); },
    (g2, tt) => { const hu = b('hung up'); cam(g2, tt - c4, { z0: 1.0, z1: 1.14, dur: 7, fx: 800, fy: 820 }); callEnded(g2, tt + 2, { endedAt: hu + 2 }); ui(g2, () => pill(g2, tt, c4 + 0.9, '“I don’t think you should be talking to me directly”', 90, { theme: 'dark', size: 28 })); },
    (g2, tt) => { cam(g2, tt - c5, { z0: 1.0, z1: 1.08, dur: 6 }); flags(g2, tt, c5 + 0.3, b('This one was') + 0.2); },
    (g2, tt) => { cam(g2, tt - c6, { z0: 1.0, z1: 1.1, dur: 6, fx: 900, fy: 600 }); rulebook(g2, tt, c6 + 0.5); },
    (g2, tt) => { cam(g2, tt - c7, { z0: 1.0, z1: 1.16, dur: 6, fx: 960, fy: 360, pan: [0, 40] }); towerNight(g2, tt); ui(g2, () => pill(g2, tt, c7 + 0.5, 'the board is preparing to remove him, the Journal reports', 1010, D)); },
    (g2, tt) => { cam(g2, tt - c8, { z0: 1.0, z1: 1.12, dur: 6, fx: 960, fy: 560 }); boardroom(g2, tt + 2); ui(g2, () => pill(g2, tt, c8 + 0.3, 'Santa Clara · Wednesday night', 90, D)); },
  ], ['flash', 'push', 'blur', 'fade', 'flash', 'blur', 'push', 'blur']);
}

// ---------------------------------------------------------------- chapter 6: day fourteen
function exit(g, s) {
  const t = s.t, b = (p) => at(s, p);
  const c1 = b("Nvidia's finance chief") - 0.25, c2 = b('Wall Street reacts') - 0.25, c3 = b('Then something strange') - 0.25, c4 = b('Because the question') - 0.25;
  const open = b('It opened on Thursday');
  shots(g, t, [c1, c2, c3, c4], [
    (g2, tt) => {
      cam(g2, tt, { z0: 1.06, z1: 1.14, dur: 8, fx: 700, fy: 560 }); filingPage(g2, tt, { type: -9, hl: -9 });
      const ks = [b('as president'), b('as chief executive'), b('from the board')];
      card(g2, tt, 0.2, 1570, 560, 620, 470, () => { T(g2, 'RESIGNED AS', 0, -170, 26, LAV, 700); ['President', 'Chief executive', 'Board member'].forEach((lab, k) => { const y = -80 + k * 100, p = ez(span(tt, ks[k], 0.35)); text(g2, lab, -250, y + 16, { font: 'Jakarta', weight: 800, size: 52, color: p > 0.5 ? 'rgba(243,239,255,0.45)' : INK }); if (p > 0) { g2.strokeStyle = RED; g2.lineWidth = 7; g2.lineCap = 'round'; g2.beginPath(); g2.moveTo(-262, y); g2.lineTo(-262 + 520 * p, y - 6); g2.stroke(); } }); });
      ui(g2, () => pill(g2, tt, 0.3, 'Thursday 12 November · Day 14', 1010, D));
    },
    (g2, tt) => { cam(g2, tt - c1, { z0: 1.0, z1: 1.1, dur: 11, fx: 960, fy: 620 }); twoChairs(g2, tt, { a1: c1 + 0.1, a2: b('And for the first time') + 0.4 }); },
    (g2, tt) => {
      cam(g2, tt - c2, { z0: 1.0, z1: 1.07, dur: 12, fx: 900, fy: 600 }); cliffChart(g2, tt, { walk: span(tt, c2 + 0.05, open - c2 - 0.1), fall: span(tt, open + 0.2, 1.1) });
      card(g2, tt, b('near 174') - 0.2, 420, 250, 520, 150, () => { T(g2, '$173.73', 0, 14, 72, '#9be36a'); T(g2, 'Wednesday close', 0, 52, 24, LAV, 600, 'Inter'); });
      card(g2, tt, b('at 151') - 0.1, 1330, 930, 520, 150, () => { T(g2, '$151.00', 0, 14, 72, RED); T(g2, 'Thursday open', 0, 52, 24, LAV, 600, 'Inter'); });
      card(g2, tt, b('thirteen percent') - 0.2, 1380, 420, 440, 240, () => { T(g2, '−13%', 0, 46, 150, RED); T(g2, 'at the open', 0, 92, 24, LAV, 600, 'Inter'); });
    },
    (g2, tt) => {
      const cb = b('climbs back');
      cam(g2, tt - c3, { z0: 1.07, z1: 1.14, dur: 7, fx: 1300, fy: 640, pan: [-40, 0] }); cliffChart(g2, tt, { walk: 1, fall: 1, back: span(tt, cb - 0.3, 3.2) });
      card(g2, tt, b('by midday'), 1400, 300, 620, 220, () => { T(g2, '−5.6%', 0, 36, 120, GOLD); T(g2, 'by midday, Thursday', 0, 84, 26, LAV, 600, 'Inter'); });
    },
    (g2, tt) => { cam(g2, tt - c4, { z0: 1.0, z1: 1.14, dur: 6, fx: 960, fy: 620 }); emptyChair(g2, tt, { lift: 1 }); ui(g2, () => pill(g2, tt, c4 + 0.6, 'the waiting was over', 1010, D)); },
  ], ['push', 'flash', 'fade', 'blur']);
}

// ---------------------------------------------------------------- outro: what we know
const tag = (g, str, color, y) => { g.save(); g.translate(0, y); g.rotate(-0.05); g.font = '800 30px Jakarta'; const w = g.measureText(str).width + 44; g.strokeStyle = color; g.lineWidth = 5; g.beginPath(); g.roundRect(-w / 2, -28, w, 56, 10); g.stroke(); text(g, str, 0, 11, { font: 'Jakarta', weight: 800, size: 30, color, align: 'center', spacing: 2 }); g.restore(); };
function outro(g, s) {
  const t = s.t, b = (p) => at(s, p);
  const c1 = b('Huang is still') - 0.25, c2 = b('The investigation is still') - 0.25, c3 = b('And on Tuesday') - 0.25, c4 = b('For thirty-three years') - 0.25, c5 = b('In the end') - 0.25;
  const cardText = (l1, l2) => (gg) => { text(gg, l1, 0, -46, { font: 'Jakarta', weight: 800, size: 30, color: '#1d1b29', align: 'center' }); if (l2) text(gg, l2, 0, -10, { font: 'Inter', weight: 600, size: 20, color: '#5a5468', align: 'center' }); };
  shots(g, t, [c1, c2, c3, c4, c5], [
    (g2, tt) => {
      cam(g2, tt, { z0: 1.0, z1: 1.08, dur: 20, fx: 960, fy: 520 });
      const mk = (ph, x, y, rot, l1, l2, tg, col) => ({ at: ph, x, y, w: 420, h: 220, rot, draw: (gg) => { cardText(l1, l2)(gg); tag(gg, tg, col, 56); } });
      caseBoard(g2, tt, [
        mk(b('Huang admitted'), 480, 330, -0.04, 'Admitted being unfaithful', 'his own email, 8 November', 'CONFIRMED', '#1f8a4c'),
        mk(b('He resigned'), 1010, 300, 0.03, 'Resigned', 'Nvidia filing, 12 November', 'CONFIRMED', '#1f8a4c'),
        mk(b('The spying claims'), 1500, 360, -0.03, 'Spying claims', 'unnamed intelligence sources', 'REPORTED', '#c47a10'),
        mk(b('No one has been charged'), 620, 720, 0.03, 'Criminal charges', 'against anyone', 'NONE', '#5a5468'),
        mk(b('And the board has said'), 1280, 740, -0.02, 'Secrets lost?', 'board: “no reason to believe”', 'BOARD SAYS NO', '#5a5468'),
      ]);
      ui(g2, () => pill(g2, tt, 0.3, 'what we actually know', 1030, D));
    },
    (g2, tt) => { cam(g2, tt - c1, { z0: 1.0, z1: 1.07, dur: 6 }); stake(g2, tt, c1 + 0.3); },
    (g2, tt) => { cam(g2, tt - c2, { z0: 1.02, z1: 1.1, dur: 5 }); caseFiles(g2, tt - c2 + 3); ui(g2, () => pill(g2, tt, c2 + 0.3, 'the investigation is still running', 90, D)); },
    (g2, tt) => { cam(g2, tt - c3, { z0: 1.0, z1: 1.1, dur: 6, fx: 1250, fy: 600 }); emptyStage(g2, tt); ui(g2, () => { calendarPage(g2, tt, c3 + 0.1, 'NOVEMBER', '17', 480, 480, { s: 1.2 }); pill(g2, tt, c3 + 0.6, 'earnings day · the first without him', 1010, D); }); },
    (g2, tt) => {
      g2.save(); cam(g2, tt - c4, { z0: 1.0, z1: 1.08, dur: 11, fx: 960, fy: 420 }); aiCity(g2, tt, { a: -9, grow: 1 });
      [['A better chip', -1], ['A trade war', 1], ['A crash', -1]].forEach(([lab, sd], k) => {
        const a = b(lab) - 0.15, u = tt - a; if (u < 0 || u > 3) return;
        const hit = 0.45, x = u < hit ? lerp(960 + sd * -1100, 960 + sd * -150, u / hit) : 960 + sd * -150 + sd * -(u - hit) * 520, y = u < hit ? 380 + k * 90 - Math.sin((u / hit) * Math.PI) * 60 : 380 + k * 90 + (u - hit) * (u - hit) * 420 - (u - hit) * 200;
        g2.save(); g2.translate(x, y); g2.rotate(u < hit ? 0 : (u - hit) * 3 * sd); g2.globalAlpha = clamp(1.6 - u * 0.6); g2.font = '800 40px Jakarta'; const w = g2.measureText(lab).width + 60; g2.fillStyle = '#2a1020'; g2.strokeStyle = RED; g2.lineWidth = 4; g2.beginPath(); g2.roundRect(-w / 2, -38, w, 76, 38); g2.fill(); g2.stroke(); text(g2, lab, 0, 14, { font: 'Jakarta', weight: 800, size: 40, color: '#ffd0d6', align: 'center' }); g2.restore();
        if (u > hit && u < hit + 0.8) { const r = (u - hit) / 0.8; g2.strokeStyle = `rgba(190,255,130,${0.9 * (1 - r)})`; g2.lineWidth = 6; g2.beginPath(); g2.arc(960 + sd * -110, 380 + k * 90, 20 + r * 160, 0, Math.PI * 2); g2.stroke(); glow(g2, 960 + sd * -110, 380 + k * 90, 120, '190,255,130', 0.6 * (1 - r)); }
      });
      g2.restore();
      ui(g2, () => pill(g2, tt, c4 + 0.4, 'what could possibly stop Nvidia?', 1010, D));
    },
    (g2, tt) => { const em = b('It was an email'); cam(g2, tt - c5, { z0: 1.0, z1: 1.3, dur: 9, fx: 960, fy: 480 }); phoneEmail(g2, tt, { p: 1, off: span(tt, em + 1.1, 0.8) }); },
  ], ['blur', 'push', 'fade', 'flash', 'blur']);
}

export const scenes = { customer, dayone, email, second, exit, outro };
export const cuts = {
  customer: ['Since 2022', 'So investigators', 'One company', 'For part of', 'Megaspeed denies'],
  dayone: ['had been watching', 'The Financial Times', 'Nvidia pushes back', 'But in Washington', 'For ten days'],
  email: ['I was unfaithful', 'He says he supports', 'The board says', 'On Monday', 'For a moment'],
  second: ['Then, on Wednesday', 'It reports that', 'The paper cites', 'When the Times called', 'One scandal', 'Almost every', 'That evening', 'In Santa Clara'],
  exit: ["Nvidia's finance chief", 'Wall Street reacts', 'Then something strange', 'Because the question'],
  outro: ['Huang is still', 'The investigation is still', 'And on Tuesday', 'For thirty-three years', 'In the end'],
};
export const sounds = (S, w) => {
  S(w('customer', '4.8 billion'), 'hit', 0.7); S(w('customer', 'not reported'), 'pop', 0.6); S(w('customer', 'Megaspeed denies') + 0.5, 'hit', 0.8);
  S(w('dayone', 'October 29th') + 0.95, 'hit', 0.7); S(w('dayone', 'The Financial Times') + 0.5, 'hit', 0.6); S(w('dayone', 'The Wall Street Journal') + 0.35, 'hit', 0.6);
  for (let k = 0; k < 9; k++) S(w('dayone', 'For ten days') + 0.2 + k * 0.28, 'tick', 0.4);
  S(w('email', 'stay on'), 'hit', 0.8); S(w('email', 'On Monday') + 0.6, 'hit', 0.5); S(w('email', 'President Trump'), 'pop', 0.6);
  S(w('second', 'Then, on Wednesday') + 0.95, 'hit', 0.7); S(w('second', 'reported directly'), 'hit', 0.5); S(w('second', 'hung up'), 'tick', 0.9); S(w('second', 'This one was') + 0.2, 'whoosh', 0.5);
  ['as president', 'as chief executive', 'from the board'].forEach((p) => S(w('exit', p), 'tick', 0.8));
  S(w('exit', "Nvidia's finance chief") + 0.6, 'pop', 0.6); S(w('exit', 'And for the first time') + 0.9, 'pop', 0.6); S(w('exit', 'It opened on Thursday') + 1.2, 'hit', 0.9); S(w('exit', 'by midday'), 'pop', 0.7);
  ['Huang admitted', 'He resigned', 'The spying claims', 'No one has been charged', 'And the board has said'].forEach((p) => S(w('outro', p), 'pop', 0.5));
  ['A better chip', 'A trade war', 'A crash'].forEach((p) => S(w('outro', p) + 0.3, 'hit', 0.6));
  S(w('outro', 'It was an email') + 1.1, 'tick', 0.9);
};
void H; void out3;
