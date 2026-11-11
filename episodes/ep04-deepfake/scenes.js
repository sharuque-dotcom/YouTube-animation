// Episode 4: The $129 Million Deepfake Heist. Light house style, expressive cast, set pieces.
import { W, H, clamp, lerp, rand, text } from '../../pipeline/engine.js';
import { sceneWords, when } from '../../pipeline/shots.js';
import { lightScene, lightSounds } from '../../pipeline/lightshots.js';
import { loadLand } from '../../pipeline/map.js';
import { lightMap, world } from '../../pipeline/lightui.js';
import { glow, beam } from '../../pipeline/scenery.js';
import { toon, parrot } from '../../pipeline/cast.js';
import { ez, out3, span, spring, at, shots, pill, bubble } from '../../pipeline/scenekit.js';
import { office, videocall, dotFace, waveform } from './sets.js';

const PURPLE = '#4a2a8c', INK = '#1d1b29', TEAL = '#3ee0b5', RED = '#e2412e';
// the cast
const EMP = { outfit: '#5b6ea8', hair: '#3b2a1a', skin: '#e8b48f', seed: 23 };                       // the accountant
const CEO = { outfit: '#1d1b2e', hairStyle: 'grey', skin: '#f2c9a5', tie: RED, glasses: true, seed: 31 }; // the boss
const LAW = { outfit: '#2b2440', hair: '#8a5a2b', skin: '#f6d2b5', tie: '#4a2a8c', seed: 41 };             // the "lawyer"

function lightBG(g, T, { a = '#f3edfc', b = '#e8def6' } = {}) {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, a); gr.addColorStop(1, b);
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  world(g, T);
}
function floor(g, y = 900, c = '#ded2f0') { g.fillStyle = c; g.fillRect(0, y, W, H - y); g.fillStyle = 'rgba(74,42,140,0.12)'; g.fillRect(0, y, W, 6); }
function panel(g, x, y, w, h, { fill = '#ffffff', r = 30 } = {}) {
  g.save(); g.shadowColor = 'rgba(40,20,80,0.18)'; g.shadowBlur = 40; g.shadowOffsetY = 16; g.fillStyle = fill; g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); g.restore();
}
function counter(g, t, a, dur, to, fmt, x, y, { size = 120, color = INK } = {}) {
  const v = to * out3(span(t, a, dur));
  text(g, fmt(v), x, y, { font: 'Jakarta', weight: 800, size, color, align: 'center', alpha: span(t, a - 0.1, 0.2) });
}
function ringRings(g, t, a, x, y) { if (t < a) return; for (let i = 0; i < 3; i++) { const ph = ((t - a) * 1.2 + i / 3) % 1; g.strokeStyle = `rgba(74,42,140,${0.5 * (1 - ph)})`; g.lineWidth = 4; g.beginPath(); g.arc(x, y, 40 + ph * 110, -2.5, -0.6); g.stroke(); } }
function phoneCard(g, x, y, s, label, sub, { color = PURPLE, glowOn = true } = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = '#1d1630'; g.beginPath(); g.roundRect(-110, -210, 220, 420, 36); g.fill();
  const sc = g.createLinearGradient(0, -190, 0, 190); sc.addColorStop(0, '#3b2a7a'); sc.addColorStop(1, '#1d1442');
  g.fillStyle = sc; g.beginPath(); g.roundRect(-98, -196, 196, 392, 26); g.fill();
  g.fillStyle = color; g.beginPath(); g.arc(0, -70, 46, 0, Math.PI * 2); g.fill();
  text(g, label, 0, 10, { font: 'Jakarta', weight: 800, size: 30, color: '#fff', align: 'center' });
  text(g, sub, 0, 46, { font: 'Inter', weight: 600, size: 18, color: '#cfc6ff', align: 'center' });
  g.fillStyle = '#1f8a5b'; g.beginPath(); g.arc(-50, 140, 26, 0, Math.PI * 2); g.fill(); g.fillStyle = RED; g.beginPath(); g.arc(50, 140, 26, 0, Math.PI * 2); g.fill();
  g.restore();
  if (glowOn) glow(g, x, y, 260 * s, '185,162,255', 0.2);
}

// ---------------------------------------------------------------- cold open
function c_call(g, s) {
  const t = s.t;
  const right = at(s, 'The voice is'), deal = at(s, 'He needs help');
  shots(g, t, [right - 0.25, deal - 0.25], [
    // the office, the phone rings, the accountant turns
    (g2, tt) => {
      const looked = tt > 1.4;
      office(g2, tt + 2, { ringAt: 0.25 + 2, faceAt: 99, person: (gg, T) => toon(gg, 720, 770, 1.35, T, { ...EMP, seated: true, expr: looked ? 'happy' : 'neutral', look: looked ? 1 : 0, armL: 0.4, armR: looked ? -0.9 : -0.3 }) });
      pill(g2, tt, 0.5, 'the accounting department', 90);
    },
    // close-up: the voice is perfect (accent, pauses, your name)
    (g2, tt) => {
      lightBG(g2, tt);
      floor(g2, 940);
      toon(g2, 560, 1100, 2.6, tt, { ...EMP, expr: 'happy', armR: -2.5, prop: 'phone', look: 1 });
      // the voice on the line: a waveform turning into the boss's dot-face
      const ia = right;
      panel(g2, 1060, 160, 700, 620, { fill: '#1d1442' });
      waveform(g2, tt, 1110, 700, 600, 90, { color: '185,162,255' });
      dotFace(g2, 1410, 420, 0.7, tt, { color: '226,214,255', reveal: ez(span(tt, ia, 1.2)) });
      text(g2, 'CEO', 1410, 220, { font: 'Jakarta', weight: 800, size: 30, color: '#cfc6ff', align: 'center' });
      [['accent', 'accent ✓'], ['pauses', 'pauses ✓'], ['your name', 'your name ✓']].forEach(([ph, lab], k) => pill(g2, tt, at(s, ph), lab, 860, { x: 1180 + k * 230, size: 26, fill: '#e9fff7', color: '#145a46' }));
      bubble(g2, tt, ia + 0.2, 'Hi! It’s me.', 980, 300, 760, 520, { size: 36 });
    },
    // split: the "CEO" asks for a confidential favour, a "lawyer" will call
    (g2, tt) => {
      lightBG(g2, tt, { a: '#efe7fb', b: '#e3d7f5' });
      g2.fillStyle = 'rgba(74,42,140,0.12)'; g2.fillRect(W / 2 - 3, 0, 6, H);
      // left: the CEO in a corner office (with a faint digital shimmer)
      g2.fillStyle = '#ffffff'; g2.fillRect(80, 120, 760, 520); g2.fillStyle = '#cfdcff'; g2.fillRect(100, 140, 720, 300);
      toon(g2, 460, 960, 2.2, tt, { ...CEO, expr: 'talk', talk: 1, armR: -2.4, prop: 'phone', look: 1 });
      for (let i = 0; i < 6; i++) { const y = 300 + ((tt * 140 + i * 90) % 600); g2.fillStyle = 'rgba(62,224,181,0.18)'; g2.fillRect(260, y, 400, 3); }
      // the confidential folder slides over
      const fp = ez(span(tt, at(s, 'confidential') - 0.2, 0.8));
      g2.save(); g2.translate(lerp(-300, 760, fp), 860); g2.rotate(-0.05); g2.fillStyle = '#e8c47f'; g2.fillRect(-160, -70, 320, 140); g2.fillStyle = RED; g2.fillRect(-130, -20, 260, 46); text(g2, 'CONFIDENTIAL', 0, 12, { font: 'Jakarta', weight: 800, size: 28, color: '#fff', align: 'center' }); g2.restore();
      // right: the employee nodding; then a second phone lights up: Lawyer, London
      toon(g2, 1300, 960, 2.0, tt, { ...EMP, expr: 'worried', sweat: 0.6, armR: -2.4, prop: 'phone', look: -1 });
      const lw = at(s, 'a lawyer');
      const lp = spring(tt, lw, 1.6, 0.6);
      if (lp > 0.01) { g2.save(); g2.translate(1700, 420); g2.scale(Math.min(1, lp), Math.min(1, lp)); phoneCard(g2, 0, 0, 0.8, 'Lawyer', 'London'); g2.restore(); ringRings(g2, tt, lw + 0.3, 1700, 300); }
      pill(g2, tt, 0.3, '“I need your help with something confidential”', 90, { size: 28 });
    },
  ]);
}

function c_gone(g, s) {
  const t = s.t;
  const never = at(s, 'The CEO never'), made = at(s, 'the voice was made'), again = at(s, 'And it allegedly');
  shots(g, t, [never - 0.25, made - 0.25, again - 0.25], [
    // the transfer: progress bar fills, coins fly out of the screen
    (g2, tt) => {
      lightBG(g2, tt); floor(g2, 900);
      panel(g2, 520, 150, 880, 560);
      text(g2, 'International wire transfer', 960, 240, { font: 'Jakarta', weight: 800, size: 40, color: INK, align: 'center' });
      const p = out3(span(tt, 0.3, 3));
      g2.fillStyle = '#ece6f8'; g2.beginPath(); g2.roundRect(600, 380, 720, 50, 25); g2.fill();
      g2.fillStyle = PURPLE; g2.beginPath(); g2.roundRect(600, 380, 720 * p, 50, 25); g2.fill();
      counter(g2, tt, 0.3, 3, 4830000, (v) => `$${Math.round(v).toLocaleString('en-US')}`, 960, 560, { size: 84, color: PURPLE });
      if (p > 0.98) { g2.fillStyle = '#1f8a5b'; g2.beginPath(); g2.roundRect(860, 600, 200, 60, 30); g2.fill(); text(g2, 'SENT ✓', 960, 641, { font: 'Jakarta', weight: 800, size: 30, color: '#fff', align: 'center' }); }
      const r = rand(3);
      for (let i = 0; i < 40; i++) { const b = 0.6 + r() * 3, lt = tt - b; if (lt < 0) { r(); continue; } const x = 960 + lt * (300 + r() * 900) * (r() < 0.5 ? -1 : 1), y = 420 - lt * 600 + lt * lt * 300; if (y > H || x < -50 || x > W + 50) continue; g2.fillStyle = '#ffc93c'; g2.beginPath(); g2.arc(x, y, 14, 0, Math.PI * 2); g2.fill(); }
      toon(g2, 260, 1000, 1.7, tt, { ...EMP, expr: 'happy', armL: 0.3, armR: -0.4 });
      pill(g2, tt, 0.4, 'gone in minutes', 960);
    },
    // GAG: the real CEO is on a golf course, no idea
    (g2, tt) => {
      const sky = g2.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#bfe0ff'); sky.addColorStop(1, '#e8f6ff'); g2.fillStyle = sky; g2.fillRect(0, 0, W, H);
      glow(g2, 1600, 160, 400, '255,240,190', 0.8);
      g2.fillStyle = '#9ad08a'; g2.beginPath(); g2.ellipse(500, 860, 1100, 260, 0, Math.PI, Math.PI * 2); g2.fill();
      g2.fillStyle = '#7cc06e'; g2.fillRect(0, 820, W, 260);
      g2.fillStyle = '#b8e3a8'; g2.beginPath(); g2.ellipse(1450, 900, 300, 60, 0, 0, Math.PI * 2); g2.fill();
      g2.strokeStyle = '#ffffff'; g2.lineWidth = 6; g2.beginPath(); g2.moveTo(1500, 900); g2.lineTo(1500, 700); g2.stroke(); g2.fillStyle = RED; g2.beginPath(); g2.moveTo(1500, 700); g2.lineTo(1580, 725); g2.lineTo(1500, 750); g2.closePath(); g2.fill();
      const swing = Math.sin(clamp((tt - 0.3) / 0.8) * Math.PI) * 1.6;
      toon(g2, 700, 980, 2.1, tt, { ...CEO, outfit: '#ffffff', shirt: '#e8e3f5', tie: null, hat: 'cap', legs: '#c9b48f', expr: 'happy', armR: -0.5 - swing, armL: 0.4, prop: 'club' });
      const bp = span(tt, 0.9, 1.4);
      if (bp > 0) { g2.fillStyle = '#fff'; g2.beginPath(); g2.arc(lerp(820, 1480, bp), 900 - Math.sin(bp * Math.PI) * 420, 12, 0, Math.PI * 2); g2.fill(); }
      // his phone in the golf bag: no calls
      g2.fillStyle = '#4a2a8c'; g2.beginPath(); g2.roundRect(1010, 660, 110, 260, 30); g2.fill();
      pill(g2, tt, 0.3, 'meanwhile, the real CEO', 90);
      pill(g2, tt, 1.2, '0 calls made', 1010, { size: 28, fill: '#fff4d6', color: '#8a5a00' });
    },
    // the voice was AI: the dot-face glitches into wireframe and code
    (g2, tt) => {
      g2.fillStyle = '#0d0b22'; g2.fillRect(0, 0, W, H);
      glow(g2, W / 2, 470, 600, '62,224,181', 0.18);
      dotFace(g2, W / 2, 470, 1.15, tt, { color: '62,224,181', glitch: clamp((tt - made - 0.3) / 0.5) });
      const r = rand(5); g2.font = '600 20px "JetBrains Mono"';
      for (let i = 0; i < 40; i++) { const x = r() * W, y = ((tt * (60 + r() * 120)) + r() * H) % H; g2.fillStyle = `rgba(62,224,181,${0.15 + r() * 0.3})`; g2.fillText(r() < 0.5 ? '0101' : 'voice_model', x, y); }
      pill(g2, tt, made + 0.3, 'made with AI, prosecutors say', 960, { theme: 'dark' });
    },
    // again and again: phones ringing all over the world, counter to $129M
    (g2, tt) => {
      g2.fillStyle = '#f3edfc'; g2.fillRect(0, 0, W, H);
      const proj = lightMap(g2, 0, 30, 5.2);
      const r = rand(17);
      for (let i = 0; i < 120; i++) {
        const lon = r() < 0.6 ? -120 + r() * 50 : -10 + r() * 40, lat = r() < 0.6 ? 28 + r() * 20 : 38 + r() * 20;
        const [x, y] = proj([lon, lat]), a0 = again + 0.2 + r() * 5;
        const p = spring(tt, a0, 2, 0.6); if (p <= 0.01) continue;
        const shake = Math.sin(tt * 50 + i) * 2;
        g2.fillStyle = PURPLE; g2.beginPath(); g2.roundRect(x - 8 * p + shake, y - 14 * p, 16 * p, 28 * p, 4); g2.fill();
        if (((tt - a0) % 1.2) < 0.3) { g2.strokeStyle = 'rgba(74,42,140,0.4)'; g2.lineWidth = 2; g2.beginPath(); g2.arc(x, y, 20, 0, Math.PI * 2); g2.stroke(); }
      }
      panel(g2, 560, 70, 800, 170);
      counter(g2, tt, again + 0.4, Math.max(2, at(s, '129 million') - again), 129000000, (v) => `$${Math.round(v).toLocaleString('en-US')}`, 960, 190, { size: 96, color: RED });
      pill(g2, tt, again + 0.5, 'thousands of companies targeted, prosecutors say', 1000);
    },
  ]);
}

// ---------------------------------------------------------------- chapter card (light)
function chapterCard(num, title) {
  return (g, s) => {
    const t = s.t; lightBG(g, s.T);
    const p = spring(t, 0.1, 1.4, 0.7);
    g.save(); g.translate(W / 2, 470); g.scale(lerp(0.8, 1, Math.min(1, p)), lerp(0.8, 1, Math.min(1, p))); g.globalAlpha = Math.min(1, p);
    text(g, String(num).padStart(2, '0'), 0, 40, { font: 'Jakarta', weight: 800, size: 220, color: 'rgba(74,42,140,0.14)', align: 'center' });
    g.restore();
    pill(g, t, 0.3, `Chapter ${num}`, 560, { size: 28, fill: '#efe8fb', color: PURPLE });
    const tp = span(t, 0.5, 0.6);
    text(g, title, W / 2, 700 + (1 - out3(tp)) * 40, { font: 'Jakarta', weight: 700, size: 96, color: INK, align: 'center', alpha: tp });
  };
}

// ---------------------------------------------------------------- chapter 1: a voice you can copy
function voice(g, s) {
  const t = s.t;
  const ai = at(s, 'with AI'), parrotAt = at(s, 'Think of a parrot'), bosses = at(s, 'Bosses are easy');
  shots(g, t, [parrotAt - 0.25, bosses - 0.25], [
    // the impressionist on a tiny stage, then the AI machine prints a voice from a short clip
    (g2, tt) => {
      lightBG(g2, tt); floor(g2, 900);
      const fade = 1 - span(tt, ai, 0.8) * 0.65;
      g2.save(); g2.globalAlpha = fade;
      g2.fillStyle = '#7a2b4a'; g2.fillRect(120, 180, 640, 60); for (let i = 0; i < 8; i++) { g2.fillStyle = i % 2 ? '#8a3456' : '#6a2240'; g2.fillRect(120 + i * 80, 240, 80, 560 - (i === 0 || i === 7 ? 0 : 520)); }
      g2.fillStyle = '#5a3a2a'; g2.fillRect(100, 860, 680, 40);
      beam(g2, tt, 440, 0, Math.PI / 2, { len: 900, spread: 0.18, color: '255,230,180', alpha: 0.3, motes: 20 });
      toon(g2, 440, 870, 1.6, tt, { outfit: '#c98a2a', hair: '#2b2440', skin: '#f2c9a5', seed: 51, expr: 'talk', talk: 1, armR: -2.2, armL: 1.2 });
      g2.strokeStyle = '#3a3156'; g2.lineWidth = 8; g2.beginPath(); g2.moveTo(560, 900); g2.lineTo(560, 700); g2.stroke();
      g2.restore();
      pill(g2, tt, 0.4, 'a skilled impressionist', 980, { x: 440 });
      // the machine
      const mp = spring(tt, ai - 0.2, 1.5, 0.65);
      if (mp > 0.01) {
        g2.save(); g2.translate(1340, 560); g2.scale(Math.min(1, mp), Math.min(1, mp));
        g2.fillStyle = '#ffffff'; g2.strokeStyle = '#231a33'; g2.lineWidth = 6; g2.beginPath(); g2.roundRect(-220, -170, 440, 340, 40); g2.fill(); g2.stroke();
        g2.fillStyle = PURPLE; g2.beginPath(); g2.roundRect(-180, -130, 360, 120, 20); g2.fill();
        text(g2, 'AI VOICE CLONE', 0, -60, { font: 'Jakarta', weight: 800, size: 34, color: '#fff', align: 'center' });
        for (let k = 0; k < 2; k++) { g2.save(); g2.translate(-80 + k * 160, 70); g2.rotate(tt * (k ? -2 : 2)); g2.fillStyle = '#d9d0ea'; for (let j = 0; j < 8; j++) { g2.rotate(Math.PI / 4); g2.fillRect(-10, -50, 20, 22); } g2.beginPath(); g2.arc(0, 0, 36, 0, Math.PI * 2); g2.fill(); g2.restore(); }
        g2.restore();
        // a short audio clip goes in
        const cp = ez(span(tt, ai + 0.2, 1));
        g2.save(); g2.translate(lerp(820, 1120, cp), 400); g2.globalAlpha = 1 - span(tt, ai + 1.1, 0.3);
        g2.fillStyle = '#fff4d6'; g2.beginPath(); g2.roundRect(-110, -36, 220, 72, 36); g2.fill(); text(g2, '▶ 0:10 clip', 0, 12, { font: 'Jakarta', weight: 800, size: 28, color: '#8a5a00', align: 'center' }); g2.restore();
        // a voice ribbon prints out
        const rp = span(tt, ai + 1.3, 1.5);
        if (rp > 0) { g2.save(); g2.beginPath(); g2.rect(1560, 380, 360 * rp, 360); g2.clip(); waveform(g2, tt, 1570, 560, 340, 160, { color: '74,42,140', bars: 30 }); g2.restore(); }
        pill(g2, tt, ai + 0.4, 'a short recording can be enough', 980, { x: 1340 });
      }
    },
    // the parrot: sounds exactly like you, understands nothing
    (g2, tt) => {
      lightBG(g2, tt, { a: '#eaf6ef', b: '#dcefe4' }); floor(g2, 900, '#cfe6d8');
      toon(g2, 620, 1000, 2.1, tt, { ...CEO, expr: 'talk', talk: Math.sin(tt * 1.5) > 0 ? 1 : 0, armR: -1.0, armL: 0.6, look: 1 });
      parrot(g2, 1320, 560, 1.7, tt, { talk: Math.sin(tt * 1.5) <= 0 ? 1 : 0, look: -1 });
      const say = Math.floor(tt / (Math.PI / 1.5)) % 2 === 0;
      bubble(g2, tt, 0.2, 'Wire the money.', 760, 230, 640, 460, { size: 38 });
      if (tt > 1.4) bubble(g2, tt, 1.4, 'Wire the money.', 1380, 200, 1340, 380, { size: 38 });
      void say;
      const q = spring(tt, 2.4, 1.8, 0.55);
      if (q > 0.01) { g2.save(); g2.translate(1560, 360); g2.scale(Math.min(1.05, q), Math.min(1.05, q)); text(g2, '?', 0, 0, { font: 'Jakarta', weight: 800, size: 110, color: PURPLE, align: 'center' }); g2.restore(); }
      pill(g2, tt, 0.6, 'sounds exactly right · understands nothing', 1000);
    },
    // bosses are easy to record: interviews, earnings calls, conference talks fill a jar
    (g2, tt) => {
      lightBG(g2, tt); floor(g2, 900);
      g2.fillStyle = '#2b2440'; g2.beginPath(); g2.roundRect(120, 140, 900, 520, 24); g2.fill();
      g2.fillStyle = '#3b2a7a'; g2.fillRect(144, 164, 852, 472);
      text(g2, 'Q3 EARNINGS CALL', 570, 260, { font: 'Jakarta', weight: 800, size: 48, color: '#fff', align: 'center' });
      g2.strokeStyle = '#b9a2ff'; g2.lineWidth = 6; g2.beginPath(); [[200, 560], [320, 520], [440, 540], [560, 460], [680, 430], [800, 380], [920, 320]].forEach(([a, b], i) => (i ? g2.lineTo(a, b) : g2.moveTo(a, b))); g2.stroke();
      g2.fillStyle = '#5a3a2a'; g2.fillRect(480, 760, 200, 140); g2.fillStyle = '#6b4a36'; g2.fillRect(460, 740, 240, 30);
      toon(g2, 580, 900, 1.6, tt, { ...CEO, expr: 'talk', talk: 1, armR: -1.2, armL: 0.5, seated: false });
      g2.strokeStyle = '#3a3156'; g2.lineWidth = 6; g2.beginPath(); g2.moveTo(640, 740); g2.lineTo(640, 640); g2.stroke(); g2.fillStyle = '#3a3156'; g2.beginPath(); g2.ellipse(640, 630, 12, 18, 0, 0, Math.PI * 2); g2.fill();
      // the jar of voice samples
      const jx = 1500, jy = 640;
      g2.strokeStyle = '#231a33'; g2.lineWidth = 6; g2.fillStyle = 'rgba(255,255,255,0.6)'; g2.beginPath(); g2.roundRect(jx - 170, jy - 220, 340, 420, 50); g2.fill(); g2.stroke();
      g2.fillStyle = '#c9c3d9'; g2.fillRect(jx - 150, jy - 250, 300, 40);
      const fill = span(tt, 0.4, 5);
      g2.save(); g2.beginPath(); g2.roundRect(jx - 165, jy - 215, 330, 410, 46); g2.clip(); g2.fillStyle = 'rgba(185,162,255,0.65)'; g2.fillRect(jx - 170, jy + 200 - 410 * fill, 340, 410 * fill); g2.restore();
      text(g2, 'VOICE SAMPLES', jx, jy + 260, { font: 'Jakarta', weight: 800, size: 30, color: PURPLE, align: 'center' });
      [['interviews', 'interviews'], ['earnings calls', 'earnings calls'], ['conference talks', 'conference talks']].forEach(([ph, lab], k) => {
        const a0 = at(s, ph), fp = ez(span(tt, a0, 1));
        if (fp <= 0) return;
        const x = lerp(820, jx, fp), y = lerp(500, jy - 240, fp) - Math.sin(fp * Math.PI) * 160;
        if (fp < 1) { g2.fillStyle = '#ffffff'; g2.beginPath(); g2.roundRect(x - 90, y - 26, 180, 52, 26); g2.fill(); text(g2, `▶ ${lab}`, x, y + 9, { font: 'Inter', weight: 600, size: 20, color: INK, align: 'center' }); }
      });
      pill(g2, tt, 0.4, 'bosses are easy to record', 90);
    },
  ]);
}

// ---------------------------------------------------------------- assembly
const LIGHT = {
  title: [{ type: 'sting', title: 'Toppled Giants', sub: 'Episode 4 · The $129 Million Deepfake Heist' }],
  sub: [{ type: 'subscribe', clickWhen: 'tap subscribe', text: 'it really helps the channel' }],
  endcard: [{ type: 'subscribe', clickWhen: 'Subscribe', text: 'see you in the next story' }],
};
const lightScenes = Object.fromEntries(Object.entries(LIGHT).map(([k, v]) => [k, lightScene(v)]));
export const scenes = { c_call, c_gone, ...lightScenes, chapter1: chapterCard(1, 'A Voice You Can Copy'), voice };
export async function preload() { await loadLand(); }
export const look = { light: true };
export const hits = [];
export const extraHits = (timeline) => {
  const out = [...lightSounds(timeline, LIGHT)];
  const sc = (id) => timeline.scenes.find((x) => x.id === id);
  const w = (id, p) => { const x = sc(id); return x.start + when(sceneWords(x.cues), p); };
  const S = (t, kind, vol = 0.7) => out.push({ t, kind, vol });
  for (let k = 0; k < 4; k++) S(2.25 - 2 + 0.25 + k * 0.6, 'tick', 0.7);
  ['The voice is', 'He needs help'].forEach((p) => S(w('c_call', p) - 0.4, 'whoosh', 0.35));
  ['accent', 'pauses', 'your name'].forEach((p) => S(w('c_call', p), 'pop', 0.45));
  S(w('c_call', 'confidential'), 'whoosh', 0.4); S(w('c_call', 'a lawyer') + 0.3, 'tick', 0.7); S(w('c_call', 'a lawyer') + 0.9, 'tick', 0.7);
  S(sc('c_gone').start + 3.3, 'pop', 0.8);
  ['The CEO never', 'the voice was made', 'And it allegedly'].forEach((p) => S(w('c_gone', p) - 0.4, 'whoosh', 0.4));
  S(w('c_gone', 'The CEO never') + 0.9, 'pop', 0.4); S(w('c_gone', 'the voice was made') + 0.3, 'hit', 0.6);
  for (let k = 0; k < 8; k++) S(w('c_gone', 'And it allegedly') + 0.4 + k * 0.5, 'tick', 0.3);
  S(w('c_gone', '129 million') + 0.2, 'hit', 0.7);
  S(sc('chapter1').start + 0.15, 'hit', 0.6);
  S(w('voice', 'with AI'), 'whoosh', 0.5); S(w('voice', 'Think of a parrot') - 0.3, 'whoosh', 0.4); S(w('voice', 'Think of a parrot') + 1.4, 'pop', 0.6);
  ['interviews', 'earnings calls', 'conference talks'].forEach((p) => S(w('voice', p), 'pop', 0.5));
  return out;
};
void videocall; void TEAL; void LAW;
