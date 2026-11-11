// Episode 4, chapter 1 (end) to the outro, night style. Each scene: cut phrases, a draw per shot, sounds.
import { W, H, clamp, lerp, rand, text } from '../../pipeline/engine.js';
import { sceneWords, when } from '../../pipeline/shots.js';
import { sky, stars, clouds, skyline, rain, mist, beam, glow } from '../../pipeline/scenery.js';
import { toon, litToon, lit } from '../../pipeline/cast.js';
import { chipIcon } from '../../pipeline/fx.js';
import { ez, out3, span, spring, at, shots, pill } from '../../pipeline/scenekit.js';
import { dotFace, waveform, lawyerDesk } from './sets.js';
import { cityWindow, darkMap, EMP, CEO } from './night.js';

const RED = '#ff5c6e', GOLD = '#ffc93c', TEAL = '#3ee0b5', INK = '#f3efff', LAV = '#b9a2ff';
const D = { theme: 'dark' };

// ---------------------------------------------------------------- props
function nightBG(g, t, { seed = 0, horizon = '#2d2552', rainA = 0 } = {}) {
  sky(g, { top: '#06061c', mid: '#15133b', horizon, hy: 980 }); stars(g, t, { n: 80, maxY: 500, alpha: 0.5, seed: seed + 2 });
  clouds(g, t + seed, { y: 180, h: 110, seed: 500 + seed, n: 8, scale: 0.6, lx: 1500, ly: 90, speed: 6, alpha: 0.8 });
  skyline(g, t, { base: 1000, seed: 600 + seed, depth: 0.2, color: '#1b1840', lit: 0.12, tall: 0.7, fog: 'rgba(80,65,125,0.5)' });
  if (rainA) rain(g, t, { n: 380, alpha: rainA });
}
function panel(g, x, y, w, h, r = 28) { g.save(); g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 40; g.fillStyle = 'rgba(22,16,48,0.92)'; g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); g.restore(); g.strokeStyle = 'rgba(185,162,255,0.35)'; g.lineWidth = 2; g.beginPath(); g.roundRect(x, y, w, h, r); g.stroke(); }
function counter(g, t, a, dur, to, fmt, x, y, { size = 110, color = INK } = {}) { text(g, fmt(to * out3(span(t, a, dur))), x, y, { font: 'Jakarta', weight: 800, size, color, align: 'center', alpha: span(t, a - 0.1, 0.2) }); }
function stamp(g, t, a, str, x, y, { color = RED, rot = -0.1, size = 64 } = {}) {
  const sp = clamp((t - (a - 0.09)) / 0.09); if (sp <= 0) return;
  const b = t > a ? Math.exp(-(t - a) * 9) * Math.sin((t - a) * 40) * 0.04 : 0;
  g.save(); g.translate(x, y); g.rotate(rot); const sc = lerp(2.4, 1, sp * sp * sp) + b; g.scale(sc, sc); g.globalAlpha = 0.95 * sp;
  g.font = `800 ${size}px Jakarta`; const w = g.measureText(str).width + size;
  g.strokeStyle = color; g.lineWidth = size * 0.1; g.beginPath(); g.roundRect(-w / 2, -size * 0.75, w, size * 1.5, size * 0.2); g.stroke();
  text(g, str, 0, size * 0.36, { font: 'Jakarta', weight: 800, size, color, align: 'center', spacing: size * 0.05 }); g.restore();
}
/** Faceless silhouette for a real (accused) person, with a name card */
function suspect(g, t, a, x, y, s, name, { tag = '', rim = 'rgba(190,180,255,0.6)' } = {}) {
  const p = spring(t, a, 1.5, 0.7); if (p <= 0.01) return;
  g.save(); g.translate(x, y + (1 - Math.min(1, p)) * 80); g.scale(s, s); g.globalAlpha = Math.min(1, p);
  g.fillStyle = '#07060f';
  g.beginPath(); g.ellipse(0, -150, 46, 56, 0, 0, Math.PI * 2); g.fill(); g.fillRect(-18, -100, 36, 30);
  g.beginPath(); g.moveTo(-130, 300); g.lineTo(-135, -10); g.quadraticCurveTo(-130, -70, -40, -78); g.lineTo(40, -78); g.quadraticCurveTo(130, -70, 135, -10); g.lineTo(130, 300); g.closePath(); g.fill();
  g.strokeStyle = rim; g.lineWidth = 4; g.beginPath(); g.ellipse(0, -150, 46, 56, 0, -1.4, 0.6); g.stroke(); g.beginPath(); g.moveTo(135, -10); g.lineTo(130, 300); g.stroke();
  text(g, '?', 0, -130, { font: 'Jakarta', weight: 800, size: 60, color: 'rgba(185,162,255,0.35)', align: 'center' });
  g.restore();
  const cp = spring(t, a + 0.25, 1.8, 0.6); if (cp <= 0.01) return;
  g.save(); g.translate(x, y + 330 * s); g.scale(Math.min(1, cp), Math.min(1, cp));
  g.font = '800 26px Jakarta'; const w = Math.max(g.measureText(name).width, tag ? g.measureText(tag).width * 0.8 : 0) + 40;
  g.fillStyle = 'rgba(22,16,48,0.95)'; g.beginPath(); g.roundRect(-w / 2, -30, w, tag ? 84 : 56, 14); g.fill();
  text(g, name, 0, 7, { font: 'Jakarta', weight: 800, size: 26, color: INK, align: 'center' });
  if (tag) text(g, tag, 0, 42, { font: 'Inter', weight: 600, size: 20, color: GOLD, align: 'center' });
  g.restore();
}
function laptop(g, x, y, w, h, drawScreen) {
  g.fillStyle = '#0a0812'; g.beginPath(); g.roundRect(x, y, w, h, 20); g.fill();
  g.save(); g.beginPath(); g.rect(x + 18, y + 18, w - 36, h - 50); g.clip(); drawScreen(g, x + 18, y + 18, w - 36, h - 50); g.restore();
  g.fillStyle = '#2a2440'; g.beginPath(); g.moveTo(x - 60, y + h); g.lineTo(x + w + 60, y + h); g.lineTo(x + w + 20, y + h + 30); g.lineTo(x - 20, y + h + 30); g.closePath(); g.fill();
  glow(g, x + w / 2, y + h / 2, Math.max(w, h) * 0.7, '150,170,255', 0.2);
}
function tile(g, t, x, y, w, h, who, label, { peel = 0, bg = ['#2a3360', '#1a2040'] } = {}) {
  g.save(); g.beginPath(); g.roundRect(x, y, w, h, 14); g.clip();
  const gb = g.createLinearGradient(x, y, x, y + h); gb.addColorStop(0, bg[0]); gb.addColorStop(1, bg[1]); g.fillStyle = gb; g.fillRect(x, y, w, h);
  toon(g, x + w / 2, y + h * 1.55, h / 260, t, { ...who, expr: who.expr || 'talk', talk: who.talk ?? 1 });
  if (peel > 0) { const e = x + w * (1 - ez(peel)); g.beginPath(); g.rect(e, y, w, h); g.clip(); g.fillStyle = '#060514'; g.fillRect(x, y, w, h); dotFace(g, x + w / 2, y + h * 0.5, h / 560, t, { color: '62,224,181', glitch: 1 }); g.fillStyle = TEAL; g.fillRect(e - 2, y, 4, h); }
  g.restore();
  g.fillStyle = 'rgba(10,8,24,0.7)'; g.beginPath(); g.roundRect(x + 10, y + h - 40, 130, 28, 8); g.fill();
  text(g, label, x + 20, y + h - 20, { font: 'Inter', weight: 600, size: 16, color: '#fff' });
}
function machineDrum(g, t, x, y, s) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = '#d9d0ea'; g.beginPath(); g.roundRect(-200, -240, 400, 480, 30); g.fill();
  g.fillStyle = '#b9add6'; g.fillRect(-200, -240, 400, 70); g.fillStyle = TEAL; g.beginPath(); g.arc(130, -205, 14, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#3a3156'; g.beginPath(); g.arc(0, 40, 150, 0, Math.PI * 2); g.fill();
  g.save(); g.beginPath(); g.arc(0, 40, 130, 0, Math.PI * 2); g.clip(); g.fillStyle = '#1a1438'; g.fillRect(-140, -100, 280, 280);
  for (let i = 0; i < 18; i++) { const a = t * 6 + i * 0.9, rr = 30 + (i % 4) * 22; const cx = Math.cos(a) * rr, cy = 40 + Math.sin(a) * rr + 40; if (i % 3) { g.fillStyle = GOLD; g.beginPath(); g.arc(cx, cy, 14, 0, Math.PI * 2); g.fill(); } else { g.fillStyle = '#8fd19e'; g.save(); g.translate(cx, cy); g.rotate(a); g.fillRect(-20, -10, 40, 20); g.restore(); } }
  g.restore();
  g.strokeStyle = '#a8a0c4'; g.lineWidth = 10; g.beginPath(); g.arc(0, 40, 150, 0, Math.PI * 2); g.stroke();
  g.restore();
}

// ---------------------------------------------------------------- scene builder
const SC = {};
function scene(id, cuts, draws, sfx = []) { SC[id] = { cuts, draws, sfx }; }
function build(id) { const d = SC[id]; return (g, s) => { const b = (p, after = 0) => at(s, p, after); shots(g, s.t, d.cuts.map((p) => b(p) - 0.25), d.draws.map((fn) => (g2, tt) => fn(g2, tt, b))); }; }

// ---- chapter 1 end: it has happened before
scene('before', ['In 2024'], [
  (g, t, b) => {
    nightBG(g, t, { seed: 1, horizon: '#3a2a4a' });
    // a power station on the horizon: cooling towers + pylons with red lights
    g.fillStyle = '#16122e'; [[1300, 300], [1480, 340]].forEach(([x, w]) => { g.beginPath(); g.moveTo(x - w / 2, 980); g.quadraticCurveTo(x - w * 0.25, 760, x - w * 0.32, 620); g.lineTo(x + w * 0.32, 620); g.quadraticCurveTo(x + w * 0.25, 760, x + w / 2, 980); g.closePath(); g.fill(); });
    for (let i = 0; i < 4; i++) { const ph = (t * 0.2 + i / 4) % 1; g.fillStyle = `rgba(160,150,200,${0.18 * (1 - ph)})`; g.beginPath(); g.arc(1300 + ph * 60, 600 - ph * 300, 50 + ph * 90, 0, Math.PI * 2); g.fill(); }
    [1650, 1820].forEach((x) => { g.strokeStyle = '#16122e'; g.lineWidth = 6; g.beginPath(); g.moveTo(x - 40, 980); g.lineTo(x, 600); g.lineTo(x + 40, 980); g.moveTo(x - 50, 680); g.lineTo(x + 50, 680); g.stroke(); if (Math.floor(t * 1.4) % 2) glow(g, x, 596, 30, '255,60,60', 0.9); });
    g.fillStyle = '#0c0a1a'; g.fillRect(0, 980, W, 100);
    calendarCard(g, t, 0.15, '2019', 230, 280);
    litToon(g, 640, 1060, 2.1, t, { ...EMP, outfit: '#2b4a3a', seed: 61, expr: 'worried', sweat: 0.7, armR: -2.4, prop: 'phone', look: 1 }, { light: [1500, 300], color: '190,180,255' });
    waveform(g, t, 860, 420, 380, 90, { color: '185,162,255' });
    const mp = ez(span(t, b('243,000') - 0.2, 1.4));
    if (mp > 0) { g.save(); g.translate(lerp(900, 1700, mp), lerp(700, 200, mp) - Math.sin(mp * Math.PI) * 120); g.rotate(mp * 2); g.fillStyle = '#c9a24a'; g.beginPath(); g.arc(0, 20, 60, 0, Math.PI * 2); g.fill(); g.fillRect(-26, -50, 52, 30); text(g, '$', 0, 40, { font: 'Jakarta', weight: 800, size: 54, color: '#5a3a10', align: 'center' }); g.restore(); }
    if (t > b('243,000') - 0.4) { panel(g, 1100, 760, 600, 160); counter(g, t, b('243,000') - 0.4, 1.2, 243000, (v) => `$${Math.round(v).toLocaleString('en-US')}`, 1400, 870, { size: 84, color: GOLD }); }
    pill(g, t, 0.4, 'a cloned boss, an energy company · 2019', 90, D);
  },
  (g, t, b) => {
    g.fillStyle = '#0b091a'; g.fillRect(0, 0, W, H);
    cityWindow(g, t, [40, 40, 1840, 700], { moonAt: [0.15, 0.2], rainA: 0.25, seed: 14 });
    g.fillStyle = 'rgba(8,6,20,0.35)'; g.fillRect(40, 40, 1840, 700);
    g.fillStyle = '#120e24'; g.fillRect(0, 740, W, 340);
    const ev = b('Every person');
    laptop(g, 420, 220, 1080, 620, (gg, x, y, w, h) => {
      gg.fillStyle = '#0d0b1e'; gg.fillRect(x, y, w, h);
      const tw = (w - 30) / 2, th = (h - 30) / 2;
      const people = [[{ ...CEO, outfit: '#2b2440' }, 'CFO (UK)'], [{ outfit: '#4a2a8c', hairStyle: 'long', hair: '#2b2440', skin: '#f6d2b5', seed: 71 }, 'Colleague'], [{ outfit: '#2b4a3a', hair: '#3b2a1a', skin: '#e8b48f', seed: 72 }, 'Colleague'], [{ outfit: '#5a3a2a', hairStyle: 'bald', skin: '#e0b090', seed: 73 }, 'Colleague']];
      people.forEach(([who, lab], i) => tile(gg, t, x + 10 + (i % 2) * (tw + 10), y + 10 + Math.floor(i / 2) * (th + 10), tw, th, who, lab, { peel: span(t, ev + i * 0.5, 1) }));
    });
    pill(g, t, 0.3, 'Arup · Hong Kong · 2024', 90, D);
    const lost = b('25 million');
    if (t > lost - 0.3) { for (let i = 0; i < 15; i++) { const p = span(t, lost + i * 0.08, 0.9); if (p <= 0 || p >= 1) continue; const x = lerp(960, 1900, p), y = 900 + (i - 7) * 10 - Math.sin(p * Math.PI) * 100; g.fillStyle = GOLD; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 30, y - 10); g.lineTo(x - 30, y + 10); g.closePath(); g.fill(); } panel(g, 660, 900, 600, 140); counter(g, t, lost - 0.3, 1.2, 25, (v) => `$${Math.round(v)} million`, 960, 990, { size: 70, color: GOLD }); }
    else pill(g, t, 0.8, 'everyone on the call was a deepfake', 1000, D);
  },
], [['243,000', 0, 'pop', 0.8], ['Every person', 0, 'whoosh', 0.5], ['25 million', 0, 'hit', 0.6]]);
function calendarCard(g, t, a, yr, x, y) { const p = spring(t, a, 1.8, 0.6); if (p <= 0.01) return; g.save(); g.translate(x, y); g.scale(Math.min(1, p), Math.min(1, p)); g.rotate(-0.05); g.fillStyle = '#f7f1e6'; g.beginPath(); g.roundRect(-120, -120, 240, 240, 18); g.fill(); g.fillStyle = '#d52b1e'; g.beginPath(); g.roundRect(-120, -120, 240, 70, [18, 18, 0, 0]); g.fill(); text(g, 'YEAR', 0, -75, { font: 'Jakarta', weight: 800, size: 26, color: '#fff', align: 'center' }); text(g, yr, 0, 60, { font: 'Jakarta', weight: 800, size: 84, color: '#1d1b29', align: 'center' }); g.restore(); }

// ---- chapter 2: the playbook
scene('play1', ['First, an email', 'Then a call'], [
  (g, t, b) => {
    nightBG(g, t, { seed: 3, rainA: 0.3 });
    // a Manhattan courthouse, lit from below
    g.fillStyle = '#d9d0ea'; g.fillRect(460, 520, 1000, 400); g.beginPath(); g.moveTo(420, 520); g.lineTo(960, 360); g.lineTo(1500, 520); g.closePath(); g.fill();
    for (let i = 0; i < 10; i++) { g.fillStyle = 'rgba(40,30,70,0.3)'; g.fillRect(500 + i * 98, 560, 26, 340); }
    g.fillStyle = 'rgba(60,40,90,0.5)'; g.fillRect(420, 900, 1080, 20);
    text(g, 'UNITED STATES COURTHOUSE', 960, 500, { font: 'Jakarta', weight: 800, size: 30, color: '#3a2d55', align: 'center' });
    beam(g, t, 700, 1080, -1.75, { len: 700, spread: 0.12, color: '255,230,190', alpha: 0.18, motes: 0 }); beam(g, t, 1220, 1080, -1.4, { len: 700, spread: 0.12, color: '255,230,190', alpha: 0.18, motes: 0 });
    g.fillStyle = 'rgba(6,5,16,0.55)'; g.fillRect(0, 0, W, H);
    // sealed envelope opens
    const op = span(t, 0.3, 0.8);
    g.save(); g.translate(960, 260); g.fillStyle = '#f3efe6'; g.fillRect(-160, -90, 320, 180); g.strokeStyle = '#b8a9d8'; g.lineWidth = 4; g.beginPath(); g.moveTo(-160, -90); g.lineTo(0, -90 + 100 * (1 - op)); g.lineTo(160, -90); g.stroke(); if (op < 1) { g.fillStyle = '#c0392b'; g.beginPath(); g.arc(0, 0, 26 * (1 - op), 0, Math.PI * 2); g.fill(); } text(g, 'UNSEALED', 0, 60, { font: 'Jakarta', weight: 800, size: 24, color: '#3a2d55', align: 'center', alpha: op }); g.restore();
    const three = b('three men');
    suspect(g, t, three, 520, 720, 0.75, 'Jacob Soall', { tag: 'age 41' }); suspect(g, t, three + 0.2, 960, 720, 0.75, 'Sharon Hazan', { tag: 'age 54' }); suspect(g, t, three + 0.4, 1400, 720, 0.75, 'Guy Sheetrit', { tag: 'age 42' });
    pill(g, t, b('July 2024'), 'July 2024 → February 2026', 1010, D);
    pill(g, t, 0.4, 'New York · November 2026', 90, D);
  },
  (g, t, b) => {
    g.fillStyle = '#0b091a'; g.fillRect(0, 0, W, H);
    litToon(g, 420, 1120, 2.3, t, { ...EMP, expr: 'worried', look: 1, armR: -0.5, armL: 0.5 }, { light: [1100, 400], color: '160,180,255', key: 0.16, keyColor: '160,180,255' });
    laptop(g, 820, 160, 960, 620, (gg, x, y, w, h) => {
      gg.fillStyle = '#f3f0fa'; gg.fillRect(x, y, w, h); gg.fillStyle = '#4a2a8c'; gg.fillRect(x, y, w, 56); text(gg, 'Inbox', x + 24, y + 38, { font: 'Jakarta', weight: 800, size: 26, color: '#fff' });
      const p = spring(t, 0.3, 1.6, 0.7);
      gg.save(); gg.translate(0, (1 - Math.min(1, p)) * -60); gg.globalAlpha = Math.min(1, p);
      gg.fillStyle = '#ffffff'; gg.fillRect(x + 20, y + 80, w - 40, 150); gg.fillStyle = '#e2412e'; gg.fillRect(x + 20, y + 80, 8, 150);
      text(gg, 'From: CEO', x + 50, y + 125, { font: 'Jakarta', weight: 800, size: 30, color: '#1d1b29' });
      text(gg, '🔒 Confidential: I need your help with a transaction', x + 50, y + 172, { font: 'Inter', weight: 600, size: 24, color: '#4a4560' });
      text(gg, 'Please keep this between us.', x + 50, y + 210, { font: 'Inter', weight: 400, size: 22, color: '#6b6880' });
      gg.restore();
      for (let i = 0; i < 4; i++) { gg.fillStyle = '#e8e3f5'; gg.fillRect(x + 20, y + 250 + i * 70, w - 40, 56); }
    });
    glow(g, 1300, 470, 800, '160,180,255', 0.18);
    stamp(g, t, b('secret transaction') + 0.2, 'SECRET', 1500, 760, { color: RED, size: 54 });
  },
  (g, t, b) => {
    g.fillStyle = '#0b091a'; g.fillRect(0, 0, W, H);
    laptop(g, 380, 120, 1160, 700, (gg, x, y, w, h) => {
      gg.fillStyle = '#0d0b1e'; gg.fillRect(x, y, w, h);
      tile(gg, t, x + 20, y + 20, w - 340, h - 40, { ...CEO }, 'CEO', { bg: ['#2a3360', '#141a36'] });
      tile(gg, t, x + w - 300, y + h - 200, 280, 180, { ...EMP, expr: 'worried', talk: 0 }, 'You');
      for (let i = 0; i < 6; i++) { const yy = y + 40 + ((t * 180 + i * 100) % (h - 80)); gg.fillStyle = 'rgba(62,224,181,0.18)'; gg.fillRect(x + 20, yy, w - 340, 3); }
    });
    if (t > b('made with AI') - 0.2) { const p = spring(t, b('made with AI'), 1.8, 0.6); g.save(); g.translate(1360, 220); g.scale(Math.min(1.05, p), Math.min(1.05, p)); g.fillStyle = TEAL; g.beginPath(); g.roundRect(-120, -36, 240, 72, 36); g.fill(); text(g, 'AI-made', 0, 14, { font: 'Jakarta', weight: 800, size: 34, color: '#0c2a24', align: 'center' }); g.restore(); }
    pill(g, t, 0.3, 'the CEO’s voice, and sometimes his face', 980, D);
  },
], [['three men', 0, 'whoosh', 0.5], ['First, an email', 0.3, 'tick', 0.8], ['secret transaction', 0.2, 'pop', 0.8], ['made with AI', 0, 'pop', 0.6]]);

scene('play2', ['Prosecutors say one', 'The lawyer gave'], [
  (g, t, b) => {
    g.fillStyle = '#0b091a'; g.fillRect(0, 0, W, H); cityWindow(g, t, [0, 0, W, 760], { moonAt: [0.5, 0.2], rainA: 0.2, seed: 21 }); g.fillStyle = 'rgba(8,6,20,0.45)'; g.fillRect(0, 0, W, H);
    const hand = ez(span(t, 0.6, 1.4));
    laptop(g, 200, 250, 680, 440, (gg, x, y, w, h) => tile(gg, t, x, y, w, h, { ...CEO }, 'CEO'));
    laptop(g, 1040, 250, 680, 440, (gg, x, y, w, h) => { tile(gg, t, x, y, w, h, { outfit: '#2b2440', hair: '#8a5a2b', skin: '#f6d2b5', tie: '#4a2a8c', seed: 41, talk: hand > 0.9 ? 1 : 0 }, 'Lawyer · London'); });
    // the baton passes from the CEO to the "lawyer"
    g.save(); g.translate(lerp(560, 1380, hand), 220 - Math.sin(hand * Math.PI) * 120); g.rotate(hand * 6); g.fillStyle = GOLD; g.beginPath(); g.roundRect(-60, -12, 120, 24, 12); g.fill(); g.restore();
    stamp(g, t, b('fake too') + 0.2, 'FAKE', 1380, 470, { size: 90, rot: -0.15 });
    pill(g, t, 0.3, '“a lawyer from a major international law firm”', 90, D);
  },
  (g, t, b) => { lawyerDesk(g, t + 2, { writeAt: 0.4 }); g.fillStyle = 'rgba(6,5,16,0.15)'; g.fillRect(0, 0, W, H); suspect(g, t, 0.3, 300, 560, 0.55, 'Jacob Soall', { tag: 'played British lawyers, prosecutors say' }); pill(g, t, b('Lawyer Call') - 0.6, 'a handwritten script: “Lawyer Call”', 90, D); },
  (g, t, b) => {
    g.fillStyle = '#0b091a'; g.fillRect(0, 0, W, H);
    litToon(g, 400, 1100, 2.2, t, { ...EMP, expr: t > b('sent the money') ? 'worried' : 'neutral', look: 1, armR: -1.2 + (t > b('sent the money') ? Math.sin(Math.min(1, t - b('sent the money')) * Math.PI) * -0.4 : 0) }, { light: [1100, 400], color: '160,180,255', key: 0.16, keyColor: '160,180,255' });
    laptop(g, 820, 160, 960, 620, (gg, x, y, w, h) => {
      gg.fillStyle = '#f3f0fa'; gg.fillRect(x, y, w, h); text(gg, 'Payment details', x + 40, y + 70, { font: 'Jakarta', weight: 800, size: 34, color: '#1d1b29' });
      [['Beneficiary', 'Global Holdings Ltd'], ['IBAN', 'ES91 2100 0418 4502 0005 1332'], ['Amount', '$4,830,000']].forEach(([k, v], i) => { const n = Math.floor(span(t, 0.4 + i * 0.7, 0.9) * v.length); text(gg, k, x + 40, y + 140 + i * 90, { font: 'Inter', weight: 600, size: 20, color: '#6b6880' }); gg.fillStyle = '#ffffff'; gg.fillRect(x + 40, y + 152 + i * 90, w - 80, 46); text(gg, v.slice(0, n), x + 56, y + 184 + i * 90, { font: 'Inter', weight: 600, size: 24, color: '#1d1b29' }); });
      const pr = t > b('sent the money'); gg.fillStyle = pr ? '#1f8a5b' : '#4a2a8c'; gg.beginPath(); gg.roundRect(x + w / 2 - 120, y + h - 120, 240, 72, 36); gg.fill(); text(gg, pr ? 'SENT ✓' : 'SEND', x + w / 2, y + h - 72, { font: 'Jakarta', weight: 800, size: 32, color: '#fff', align: 'center' });
    });
    text(g, 'illustration · example details', 1300, 870, { font: 'Inter', weight: 600, size: 18, color: 'rgba(200,190,255,0.6)', align: 'center' });
  },
], [['Then the CEO handed', 0.6, 'whoosh', 0.4], ['fake too', 0.2, 'pop', 0.9], ['Lawyer Call', 0, 'tick', 0.7], ['sent the money', 0, 'tick', 0.9], ['sent the money', 0.1, 'pop', 0.6]]);

// ---- chapter 3: the victims
scene('victims', ['A hospital system in Missouri', 'A hospital system in California'], [
  (g, t) => {
    nightBG(g, t, { seed: 6 });
    skyline(g, t, { base: 1080, seed: 777, depth: 0.85, color: '#0f0c22', lit: 0.45, minW: 140, maxW: 260, tall: 2.2, windowColor: [255, 210, 160] });
    const r = rand(9);
    for (let i = 0; i < 160; i++) { const x = r() * W, y = 420 + r() * 600, a0 = 0.3 + r() * 5; if (t < a0) continue; const ring = ((t - a0) % 1.6) < 0.5; glow(g, x, y, 22, ring ? '255,100,120' : '185,162,255', ring ? 0.8 : 0.25); }
    pill(g, t, 0.4, 'thousands of companies targeted, prosecutors say', 90, D);
  },
  (g, t, b) => {
    nightBG(g, t, { seed: 7 });
    // hospital (Missouri)
    g.fillStyle = '#d9d0ea'; g.fillRect(200, 460, 600, 520); for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) { g.fillStyle = rand(r * 9 + c)() < 0.6 ? 'rgba(255,214,150,0.85)' : 'rgba(60,54,100,0.8)'; g.fillRect(230 + c * 95, 500 + r * 75, 60, 46); }
    g.fillStyle = RED; g.fillRect(470, 380, 60, 160); g.fillRect(420, 430, 160, 60); glow(g, 500, 460, 200, '255,90,110', 0.5);
    text(g, 'HOSPITAL · MISSOURI', 500, 1030, { font: 'Jakarta', weight: 800, size: 28, color: INK, align: 'center' });
    if (t > 0.4) { panel(g, 280, 220, 440, 130); counter(g, t, 0.5, 1.2, 4.8, (v) => `−$${v.toFixed(1)}M`, 500, 312, { size: 80, color: RED }); }
    // fintech (UK)
    const uk = b('UK');
    g.fillStyle = '#1d1a45'; g.fillRect(1180, 300, 520, 680); for (let f = 0; f < 14; f++) for (let c = 0; c < 6; c++) { g.fillStyle = rand(f * 13 + c)() < 0.7 ? 'rgba(150,200,255,0.75)' : 'rgba(40,36,80,0.7)'; g.fillRect(1210 + c * 80, 330 + f * 44, 56, 28); }
    text(g, 'FINTECH · UK', 1440, 1030, { font: 'Jakarta', weight: 800, size: 28, color: INK, align: 'center' });
    if (t > uk - 0.2) { panel(g, 1220, 140, 440, 130); counter(g, t, uk, 1.2, 11.6, (v) => `−$${v.toFixed(1)}M`, 1440, 232, { size: 80, color: RED }); }
  },
  (g, t, b) => {
    const proj = darkMap(g, t, -96, 38, 26);
    [['California', [-121.5, 38.5], '🏥', 'hospital'], ['Rhode Island', [-71.4, 41.8], '🏦', 'bank'], ['Massachusetts', [-71.1, 42.4], '📈', 'mutual fund'], ['Florida', [-81.5, 28.5], '🐶', 'pet food']].forEach(([ph, ll, , lab], k) => {
      const a0 = b(ph), [x, y] = proj(ll), p = spring(t, a0, 2, 0.55); if (p <= 0.01) return;
      glow(g, x, y, 90 * p, '255,100,120', 0.6);
      g.fillStyle = '#ffd1da'; g.beginPath(); g.arc(x, y, 14 * p, 0, Math.PI * 2); g.fill();
      g.save(); g.translate(x + (k === 2 ? 30 : k === 1 ? 30 : 30), y + (k === 2 ? -70 : k === 1 ? 40 : -30)); g.scale(Math.min(1, p), Math.min(1, p));
      g.font = '800 24px Jakarta'; const w = g.measureText(lab).width + 36; g.fillStyle = 'rgba(22,16,48,0.95)'; g.beginPath(); g.roundRect(0, -22, w, 44, 22); g.fill(); text(g, lab, 18, 9, { font: 'Jakarta', weight: 800, size: 24, color: INK });
      g.restore();
    });
    pill(g, t, 0.4, 'also named in the charges', 90, D);
  },
], [['UK', 0, 'pop', 0.7], ['A hospital system in Missouri', 0.5, 'hit', 0.5], ['California', 0, 'pop', 0.5], ['Rhode Island', 0, 'pop', 0.5], ['Massachusetts', 0, 'pop', 0.5], ['Florida', 0, 'pop', 0.6]]);

// ---- chapter 4: follow the money
scene('money', ['Then, prosecutors say', 'Two of the men'], [
  (g, t, b) => {
    const proj = darkMap(g, t, 30, 32, 4.6);
    const from = [[-74, 40.7], [-0.1, 51.5]];
    const to = [['Spain', [-3.7, 40.4]], ['Greece', [23.7, 37.98]], ['United Arab Emirates', [55.3, 25.2]], ['Singapore', [103.8, 1.35]], ['China', [121.5, 31.2]]];
    from.forEach((ll) => { const [x, y] = proj(ll); glow(g, x, y, 60, '255,100,120', 0.7); });
    to.forEach(([ph, ll], k) => {
      const a0 = b(ph), [bx, by] = proj(ll);
      from.forEach((fl, i) => {
        const [ax, ay] = proj(fl), p = ez(span(t, a0 - 0.2 + i * 0.1, 1.1)); if (p <= 0) return;
        const mx = (ax + bx) / 2, my = Math.min(ay, by) - 140 - k * 10, bz = (u) => [(1 - u) ** 2 * ax + 2 * (1 - u) * u * mx + u * u * bx, (1 - u) ** 2 * ay + 2 * (1 - u) * u * my + u * u * by];
        g.save(); g.shadowColor = 'rgba(255,200,80,0.9)'; g.shadowBlur = 10; g.strokeStyle = 'rgba(255,200,80,0.7)'; g.lineWidth = 2.5; g.beginPath(); for (let s = 0; s <= 40 * p; s++) { const [px, py] = bz(s / 40); s ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); g.restore();
        const u = (t * 0.3 + k * 0.2 + i * 0.1) % 1; if (u < p) { const [px, py] = bz(u); g.fillStyle = GOLD; g.beginPath(); g.arc(px, py, 6, 0, Math.PI * 2); g.fill(); }
      });
      if (t > a0 + 0.6) { glow(g, bx, by, 50, '255,200,80', 0.6); const lab = ph === 'United Arab Emirates' ? 'UAE' : ph; g.font = '800 22px Jakarta'; const w = g.measureText(lab).width + 30; g.fillStyle = 'rgba(22,16,48,0.95)'; g.beginPath(); g.roundRect(bx + 14, by - 40, w, 38, 19); g.fill(); text(g, lab, bx + 29, by - 14, { font: 'Jakarta', weight: 800, size: 22, color: INK }); }
    });
    pill(g, t, 0.3, 'bank accounts around the world', 1010, D);
  },
  (g, t, b) => {
    nightBG(g, t, { seed: 9 });
    const melt = span(t, b('cryptocurrency') - 0.2, 1.4);
    for (let i = 0; i < 12; i++) { const r = rand(i + 4); const x = 300 + (i % 6) * 110, y = 400 + Math.floor(i / 6) * 120; g.save(); g.translate(x, y + melt * 40); g.globalAlpha = 1 - melt; g.fillStyle = '#8fd19e'; g.fillRect(-46, -22, 92, 44); g.fillStyle = '#4f8f62'; g.fillRect(-14, -14, 28, 28); g.restore(); if (melt > 0) { const sp = span(t, b('split') - 0.2, 1.2), w = i % 3; const tx = lerp(x + 600, [1250, 1480, 1710][w], ez(sp)), ty = lerp(y, 780, ez(sp)); g.globalAlpha = melt; g.fillStyle = GOLD; g.beginPath(); g.arc(tx, ty - (1 - melt) * 30, 22, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#e0a82a'; g.lineWidth = 4; g.beginPath(); g.moveTo(tx - 8, ty - 10); g.lineTo(tx + 8, ty - 10); g.moveTo(tx - 8, ty + 10); g.lineTo(tx + 8, ty + 10); g.stroke(); g.globalAlpha = 1; void r; } }
    if (t > b('split') - 0.3) [1250, 1480, 1710].forEach((x, k) => { g.fillStyle = '#3a3156'; g.beginPath(); g.roundRect(x - 90, 780, 180, 120, 18); g.fill(); g.fillStyle = '#4a3f6b'; g.fillRect(x - 90, 780, 180, 30); text(g, `wallet ${k + 1}`, x, 870, { font: 'Inter', weight: 600, size: 20, color: INK, align: 'center' }); });
    pill(g, t, b('cryptocurrency'), 'cash → crypto, to hide where it came from', 90, D);
  },
  (g, t, b) => {
    nightBG(g, t, { seed: 10 });
    g.fillStyle = 'rgba(6,5,16,0.4)'; g.fillRect(0, 0, W, H);
    beam(g, t, 960, -40, Math.PI / 2, { len: 900, spread: 0.22, color: '255,230,190', alpha: 0.22, motes: 40 });
    machineDrum(g, t, 960, 600, 1);
    suspect(g, t, b('Sharon Hazan') - 0.1, 470, 640, 0.7, 'Sharon Hazan', { tag: 'accused of laundering' });
    suspect(g, t, b('Guy Sheetrit') - 0.1, 1450, 640, 0.7, 'Guy Sheetrit', { tag: 'accused of laundering' });
  },
], [['Spain', 0, 'pop', 0.4], ['Greece', 0, 'pop', 0.4], ['United Arab Emirates', 0, 'pop', 0.4], ['Singapore', 0, 'pop', 0.4], ['China', 0, 'pop', 0.5], ['cryptocurrency', 0, 'whoosh', 0.5], ['split', 0, 'pop', 0.6], ['Two of the men', 0.3, 'hit', 0.5]]);

scene('boast', ['The men also allegedly'], [
  (g, t, b) => {
    g.fillStyle = '#06051a'; g.fillRect(0, 0, W, H);
    beam(g, t, 960, -40, Math.PI / 2, { len: 1000, spread: 0.2, color: '255,220,150', alpha: 0.3, motes: 80, seed: 3 });
    g.fillStyle = '#2a2045'; g.fillRect(760, 820, 400, 60); g.fillStyle = '#3a2d55'; g.fillRect(720, 880, 480, 200);
    const sp = Math.cos(t * 1.6);
    g.save(); g.translate(960, 560); g.scale(Math.max(0.15, Math.abs(sp)), 1);
    const gg = g.createLinearGradient(-160, 0, 160, 0); gg.addColorStop(0, '#b8862a'); gg.addColorStop(0.5, '#ffe08a'); gg.addColorStop(1, '#b8862a'); g.fillStyle = gg;
    g.beginPath(); g.moveTo(-150, -200); g.lineTo(150, -200); g.quadraticCurveTo(150, 60, 0, 90); g.quadraticCurveTo(-150, 60, -150, -200); g.fill();
    g.fillRect(-26, 90, 52, 120); g.fillRect(-110, 200, 220, 60);
    g.strokeStyle = '#b8862a'; g.lineWidth = 22; g.beginPath(); g.arc(-150, -110, 70, Math.PI * 0.5, Math.PI * 1.5); g.stroke(); g.beginPath(); g.arc(150, -110, 70, -Math.PI * 0.5, Math.PI * 0.5); g.stroke();
    if (sp > 0) text(g, '#1', 0, -50, { font: 'Jakarta', weight: 800, size: 120, color: '#7a5210', align: 'center' });
    g.restore();
    glow(g, 960, 500, 400, '255,210,120', 0.3);
    const fo = b('400 million');
    if (t > fo - 0.3) { panel(g, 1300, 300, 520, 160); counter(g, t, fo - 0.3, 1.2, 400, (v) => `$${Math.round(v)}M+`, 1560, 410, { size: 90, color: GOLD }); stamp(g, t, fo + 1.1, 'ALLEGED', 1560, 540, { color: LAV, size: 50 }); }
    const nb = b('number one');
    if (t > nb) { g.save(); g.translate(400, 420); const p = spring(t, nb, 1.8, 0.6); g.scale(Math.min(1, p), Math.min(1, p)); panel(g, -300, -80, 600, 160); text(g, '“number one', 0, -10, { font: "'Playfair Display'", style: 'italic', weight: 400, size: 46, color: INK, align: 'center' }); text(g, 'all over the world”', 0, 48, { font: "'Playfair Display'", style: 'italic', weight: 400, size: 46, color: INK, align: 'center' }); g.restore(); }
    pill(g, t, 0.3, 'according to the indictment', 1010, D);
  },
  (g, t, b) => {
    nightBG(g, t, { seed: 12 });
    g.fillStyle = 'rgba(6,5,16,0.4)'; g.fillRect(0, 0, W, H);
    const tags = [['Rocky Balboa', 520], ['Superman Cash', 960], ['Fat Boy', 1400]];
    tags.forEach(([nick, x], k) => {
      suspect(g, t, 0.2 + k * 0.15, x, 640, 0.75, '', {});
      const a0 = b(nick), p = spring(t, a0, 2, 0.5); if (p <= 0.01) return;
      g.save(); g.translate(x, 330); g.rotate((k - 1) * 0.08); g.scale(Math.min(1.05, p), Math.min(1.05, p));
      g.fillStyle = '#ffffff'; g.beginPath(); g.roundRect(-190, -60, 380, 120, 14); g.fill(); g.fillStyle = RED; g.beginPath(); g.roundRect(-190, -60, 380, 40, [14, 14, 0, 0]); g.fill();
      text(g, 'HELLO, MY NAME IS', 0, -32, { font: 'Jakarta', weight: 800, size: 18, color: '#fff', align: 'center' });
      text(g, nick, 0, 40, { font: "'Permanent Marker'", size: 40, color: '#1d1b29', align: 'center' });
      g.restore();
    });
    pill(g, t, 0.3, 'nicknames, according to prosecutors', 1010, D);
  },
], [['400 million', -0.3, 'pop', 0.7], ['number one', 0, 'pop', 0.6], ['Rocky Balboa', 0, 'pop', 0.7], ['Superman Cash', 0, 'pop', 0.7], ['Fat Boy', 0, 'pop', 0.7]]);

// ---- chapter 5: the arrests
scene('arrests', ['They face charges', 'The United States has asked'], [
  (g, t, b) => {
    g.fillStyle = '#07061a'; g.fillRect(0, 0, W, H);
    cityWindow(g, t, [0, 0, 950, 760], { moonAt: [0.3, 0.2], rainA: 0, seed: 31 });
    cityWindow(g, t, [970, 0, 950, 760], { moonAt: [0.7, 0.25], rainA: 0.3, seed: 32 });
    g.fillStyle = '#07061a'; g.fillRect(950, 0, 20, 760); g.fillRect(0, 760, W, 320);
    text(g, 'SPAIN', 475, 820, { font: 'Jakarta', weight: 800, size: 36, color: INK, align: 'center' }); text(g, 'UK', 1445, 820, { font: 'Jakarta', weight: 800, size: 36, color: INK, align: 'center' });
    const ph = t * 2.4;
    [[200, '255,40,60'], [750, '60,90,255'], [1200, '255,40,60'], [1700, '60,90,255']].forEach(([px, col], k) => { glow(g, px, 760, 260, col, 0.3 + 0.25 * Math.sin(ph * 3 + k * 1.7)); beam(g, t, px, 760, -Math.PI / 2 + Math.sin(ph + k * 1.3) * 0.7, { len: 700, spread: 0.08, color: col, alpha: 0.14, motes: 0 }); });
    [['June', 300, 'Soall · June 2026'], ['August', 650, 'Hazan · August'], ['September', 1445, 'Sheetrit · September']].forEach(([w, x, lab]) => { const a0 = b(w); suspect(g, t, a0 - 0.2, x, 520, 0.55, ''); pill(g, t, a0 + 0.1, lab, 920, { x, ...D, size: 26 }); });
  },
  (g, t, b) => {
    nightBG(g, t, { seed: 14 }); g.fillStyle = 'rgba(6,5,16,0.4)'; g.fillRect(0, 0, W, H);
    g.save(); g.translate(720, 540); g.rotate(-0.03); g.fillStyle = '#f7f1e6'; g.fillRect(-380, -420, 760, 840);
    text(g, 'INDICTMENT', 0, -330, { font: "'Playfair Display'", weight: 900, size: 56, color: '#1d1b29', align: 'center' });
    text(g, 'United States v. Soall, Hazan & Sheetrit', 0, -280, { font: 'Inter', weight: 600, size: 22, color: '#6b6880', align: 'center' });
    ['Conspiracy to commit wire fraud', 'Wire fraud', 'Aggravated identity theft (2 counts)', 'Money laundering conspiracy', 'Money laundering (2 counts)'].forEach((c, i) => { const n = Math.floor(span(t, 0.3 + i * 0.5, 0.8) * c.length); text(g, c.slice(0, n), -320, -180 + i * 80, { font: 'Inter', weight: 600, size: 30, color: '#1d1b29' }); });
    g.restore();
    const yr = b('20 years'), st = Math.min(yr - 0.3, b('They face charges') + 0.3), p = out3(span(t, st, Math.max(1.4, yr + 0.6 - st)));
    panel(g, 1200, 380, 600, 300);
    text(g, 'MAXIMUM, MOST SERIOUS COUNTS', 1500, 450, { font: 'Jakarta', weight: 700, size: 22, color: LAV, align: 'center' });
    g.fillStyle = 'rgba(255,255,255,0.1)'; g.beginPath(); g.roundRect(1250, 490, 500, 50, 25); g.fill(); g.fillStyle = RED; g.beginPath(); g.roundRect(1250, 490, 500 * p, 50, 25); g.fill();
    text(g, `${Math.round(20 * p)} YEARS`, 1500, 620, { font: 'Jakarta', weight: 800, size: 72, color: INK, align: 'center' });
  },
  (g, t, b) => {
    const proj = darkMap(g, t, -35, 42, 9);
    const ny = proj([-74, 40.7]);
    glow(g, ny[0], ny[1], 90, '255,100,120', 0.8); g.font = '800 24px Jakarta'; g.fillStyle = 'rgba(22,16,48,0.95)'; g.beginPath(); g.roundRect(ny[0] - 160, ny[1] + 20, 150, 42, 21); g.fill(); text(g, 'New York', ny[0] - 145, ny[1] + 49, { font: 'Jakarta', weight: 800, size: 24, color: INK });
    [[-3.7, 40.4], [-3.7, 40.4], [-0.1, 51.5]].forEach((ll, k) => {
      const [ax, ay] = proj(ll), p = ez(span(t, 0.5 + k * 0.5, 2.6)), mx = (ax + ny[0]) / 2, my = Math.min(ay, ny[1]) - 180 - k * 40;
      const bz = (u) => [(1 - u) ** 2 * ax + 2 * (1 - u) * u * mx + u * u * ny[0], (1 - u) ** 2 * ay + 2 * (1 - u) * u * my + u * u * ny[1]];
      g.save(); g.setLineDash([4, 14]); g.strokeStyle = 'rgba(185,162,255,0.6)'; g.lineWidth = 3; g.beginPath(); for (let s = 0; s <= 40; s++) { const [px, py] = bz(s / 40); s ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); g.restore();
      const [px, py] = bz(p), [qx, qy] = bz(Math.min(1, p + 0.01));
      g.save(); g.translate(px, py); g.rotate(Math.atan2(qy - py, qx - px)); g.fillStyle = '#e8e3f5'; g.beginPath(); g.ellipse(0, 0, 26, 6, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.moveTo(-4, 0); g.lineTo(-14, -22); g.lineTo(-6, -22); g.lineTo(10, 0); g.lineTo(-6, 22); g.lineTo(-14, 22); g.closePath(); g.fill(); g.restore();
    });
    pill(g, t, 0.4, 'extradition requested', 90, D);
    const pi = b('presumed innocent'), p = spring(t, pi, 1.8, 0.6);
    if (p > 0.01) { g.save(); g.translate(W / 2, 960); g.scale(Math.min(1.05, p), Math.min(1.05, p)); g.fillStyle = LAV; g.beginPath(); g.roundRect(-280, -48, 560, 96, 48); g.fill(); text(g, 'PRESUMED INNOCENT', 0, 16, { font: 'Jakarta', weight: 800, size: 42, color: '#1d1b29', align: 'center' }); g.restore(); }
  },
], [['June', 0.1, 'tick', 0.7], ['August', 0.1, 'tick', 0.7], ['September', 0.1, 'tick', 0.7], ['20 years', -0.3, 'hit', 0.6], ['extradited', 0, 'whoosh', 0.5], ['presumed innocent', 0, 'pop', 0.7]]);

// ---- chapter 6: don't be next
scene('defend', ['The defences are simple', 'And be careful'], [
  (g, t) => {
    g.fillStyle = '#06051a'; g.fillRect(0, 0, W, H);
    const r = rand(5);
    for (let i = 0; i < 70; i++) { const ph = ((t * (0.4 + r() * 0.5)) + r()) % 1; const x = W - ph * 1100, y = 200 + r() * 700; if (x < 1020) { for (let k = 0; k < 6; k++) { g.fillStyle = `rgba(62,224,181,${0.6 * (1 - k / 6)})`; g.fillRect(1020 + (r() - 0.5) * 80 + k * 10, y + (r() - 0.5) * 60, 4, 4); } continue; } g.fillStyle = 'rgba(62,224,181,0.8)'; g.fillRect(x, y, 6, 6); g.fillStyle = 'rgba(62,224,181,0.3)'; g.fillRect(x, y, 30, 2); }
    g.save(); g.translate(820, 540);
    glow(g, 0, 0, 420, '185,162,255', 0.35 + 0.1 * Math.sin(t * 6));
    g.fillStyle = 'rgba(40,30,90,0.85)'; g.strokeStyle = '#b9a2ff'; g.lineWidth = 12; g.beginPath(); g.moveTo(0, -300); g.quadraticCurveTo(170, -250, 240, -250); g.quadraticCurveTo(250, 120, 0, 320); g.quadraticCurveTo(-250, 120, -240, -250); g.quadraticCurveTo(-170, -250, 0, -300); g.closePath(); g.fill(); g.stroke();
    text(g, '✓', 0, 60, { font: 'Jakarta', weight: 800, size: 200, color: '#b9a2ff', align: 'center' });
    g.restore();
    pill(g, t, 0.4, 'criminals “weaponize” new technology, the FBI says', 1010, D);
  },
  (g, t, b) => {
    nightBG(g, t, { seed: 16 }); g.fillStyle = 'rgba(6,5,16,0.45)'; g.fillRect(0, 0, W, H);
    [['call back', 'Hang up. Call back', 'on a number you know', '☎'], ['code word', 'Use a', 'code word', '🔑'], ['Never let one person', 'Two people', 'approve big payments', '✌']].forEach(([ph, l1, l2, ic], k) => {
      const a0 = k === 0 ? Math.min(b(ph), b('The defences are simple') + 0.2) : b(ph), p = spring(t, a0, 1.6, 0.6); if (p <= 0.01) return;
      const x = 420 + k * 540;
      g.save(); g.translate(x, 540 + (1 - Math.min(1, p)) * 200); g.rotate((k - 1) * 0.04); g.globalAlpha = Math.min(1, p);
      g.fillStyle = 'rgba(22,16,48,0.95)'; g.strokeStyle = 'rgba(62,224,181,0.7)'; g.lineWidth = 3; g.beginPath(); g.roundRect(-220, -260, 440, 520, 30); g.fill(); g.stroke();
      g.fillStyle = 'rgba(62,224,181,0.15)'; g.beginPath(); g.arc(0, -110, 90, 0, Math.PI * 2); g.fill();
      text(g, ic, 0, -80, { font: 'Jakarta', weight: 800, size: 90, color: TEAL, align: 'center' });
      text(g, l1, 0, 70, { font: 'Jakarta', weight: 800, size: 38, color: INK, align: 'center' }); text(g, l2, 0, 120, { font: 'Inter', weight: 600, size: 28, color: LAV, align: 'center' });
      text(g, `${k + 1}`, -170, -200, { font: 'Jakarta', weight: 800, size: 40, color: TEAL });
      g.restore();
    });
  },
  (g, t, b) => {
    g.fillStyle = '#07061a'; g.fillRect(0, 0, W, H);
    const m = ez(span(t, b('urgent and secret') - 0.2, 1.2)), alarm = t > b('oldest trick') - 0.3;
    // stopwatch (urgent) + SECRET folder slide together
    g.save(); g.translate(lerp(500, 860, m), 540); g.strokeStyle = '#e8e3f5'; g.lineWidth = 14; g.beginPath(); g.arc(0, 0, 150, 0, Math.PI * 2); g.stroke(); g.fillStyle = '#e8e3f5'; g.fillRect(-26, -200, 52, 40); g.lineWidth = 10; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(t * 6 - 1.5) * 110, Math.sin(t * 6 - 1.5) * 110); g.stroke(); text(g, 'URGENT', 0, 230, { font: 'Jakarta', weight: 800, size: 36, color: INK, align: 'center' }); g.restore();
    g.save(); g.translate(lerp(1420, 1060, m), 540); g.rotate(0.05); g.fillStyle = '#e8c47f'; g.fillRect(-170, -120, 340, 240); g.fillStyle = '#c0392b'; g.fillRect(-140, -30, 280, 60); text(g, 'SECRET', 0, 14, { font: 'Jakarta', weight: 800, size: 40, color: '#fff', align: 'center' }); g.restore();
    if (alarm) { const fl = 0.5 + 0.5 * Math.sin(t * 12); glow(g, 960, 300, 900, '255,40,60', 0.45 * fl); g.save(); g.translate(960, 230); g.fillStyle = `rgba(255,60,80,${0.7 + 0.3 * fl})`; g.beginPath(); g.arc(0, 0, 70, Math.PI, 0); g.fill(); g.fillRect(-90, 0, 180, 30); g.restore(); stamp(g, t, b('oldest trick'), 'RED FLAG', 960, 900, { size: 60, rot: -0.05 }); }
    pill(g, t, 0.4, 'urgent + secret = slow down', 90, D);
  },
], [['call back', 0, 'pop', 0.6], ['code word', 0, 'pop', 0.6], ['Never let one person', 0, 'pop', 0.6], ['urgent and secret', 0, 'whoosh', 0.5], ['oldest trick', 0, 'hit', 0.7]]);

// ---- outro: the only thing missing was the real boss
scene('outro', ['The only thing missing'], [
  (g, t) => {
    g.fillStyle = '#0b091a'; g.fillRect(0, 0, W, H);
    laptop(g, 380, 140, 1160, 700, (gg, x, y, w, h) => {
      gg.fillStyle = '#0d0b1e'; gg.fillRect(x, y, w, h);
      const tw = (w - 30) / 2, th = (h - 30) / 2;
      [[{ ...CEO, expr: 'happy', talk: 0 }, 'CEO'], [{ outfit: '#4a2a8c', hairStyle: 'long', hair: '#2b2440', skin: '#f6d2b5', seed: 71, expr: 'happy', talk: 0 }, 'CFO'], [{ outfit: '#2b2440', hair: '#8a5a2b', skin: '#f6d2b5', tie: '#4a2a8c', seed: 41, expr: 'happy', talk: 0 }, 'Legal counsel'], [{ ...EMP, expr: 'happy', talk: 0 }, 'You']].forEach(([who, lab], i) => tile(gg, t, x + 10 + (i % 2) * (tw + 10), y + 10 + Math.floor(i / 2) * (th + 10), tw, th, who, lab));
    });
  },
  (g, t) => {
    g.fillStyle = '#0b091a'; g.fillRect(0, 0, W, H);
    laptop(g, 380, 140, 1160, 700, (gg, x, y, w, h) => {
      gg.fillStyle = '#0d0b1e'; gg.fillRect(x, y, w, h);
      const tw = (w - 30) / 2, th = (h - 30) / 2;
      const gone = span(t, 0.4, 0.6);
      [[{ ...CEO, expr: 'happy', talk: 0 }, 'CEO'], [{ outfit: '#4a2a8c', hairStyle: 'long', hair: '#2b2440', skin: '#f6d2b5', seed: 71, expr: 'happy', talk: 0 }, 'CFO'], [{ outfit: '#2b2440', hair: '#8a5a2b', skin: '#f6d2b5', tie: '#4a2a8c', seed: 41, expr: 'happy', talk: 0 }, 'Legal counsel'], [{ ...EMP, expr: 'shock', talk: 0 }, 'You']].forEach(([who, lab], i) => {
        const tx = x + 10 + (i % 2) * (tw + 10), ty = y + 10 + Math.floor(i / 2) * (th + 10);
        tile(gg, t, tx, ty, tw, th, who, lab);
        if (i < 3 && gone > 0) { gg.fillStyle = `rgba(6,5,16,${0.95 * gone})`; gg.fillRect(tx, ty, tw, th); if (gone > 0.6) text(gg, 'has left the call', tx + tw / 2, ty + th / 2, { font: 'Inter', weight: 600, size: 26, color: '#8a84a8', align: 'center' }); }
      });
    });
  },
], [['The only thing missing', 0.4, 'tick', 0.7]]);

export const scenes = Object.fromEntries(Object.keys(SC).map((id) => [id, build(id)]));
export function sounds(timeline) {
  const out = [];
  for (const sc of timeline.scenes) {
    const d = SC[sc.id]; if (!d) continue;
    const ws = sceneWords(sc.cues), w = (p) => sc.start + when(ws, p);
    d.cuts.forEach((p) => out.push({ t: w(p) - 0.4, kind: 'whoosh', vol: 0.35 }));
    d.sfx.forEach(([p, off, kind, vol]) => out.push({ t: w(p) + off, kind, vol }));
  }
  return out;
}
void mist; void chipIcon; void lit;
