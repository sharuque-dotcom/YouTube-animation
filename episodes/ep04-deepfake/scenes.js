// Episode 4: The $129 Million Deepfake Heist. Light house style, expressive cast, set pieces.
import { W, H, clamp, lerp, rand, text } from '../../pipeline/engine.js';
import { sceneWords, when } from '../../pipeline/shots.js';
import { lightScene, lightSounds } from '../../pipeline/lightshots.js';
import { loadLand } from '../../pipeline/map.js';
import { lightMap, world } from '../../pipeline/lightui.js';
import { glow, beam } from '../../pipeline/scenery.js';
import { toon, parrot } from '../../pipeline/cast.js';
import { ez, out3, span, spring, at, shots, pill, bubble } from '../../pipeline/scenekit.js';
import { dotFace, waveform } from './sets.js';
import * as R from './rest.js';
import { nightOffice, ceoOffice, asleep, darkMap, theater, study, auditorium, EMP as NEMP, CEO as NCEO } from './night.js';
import { litToon, lit } from '../../pipeline/cast.js';
import { nightFinish, sky, stars, clouds, rain } from '../../pipeline/scenery.js';

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

// ---------------------------------------------------------------- cold open (night)
const LAMP = { light: [1500, 520], color: '190,180,255', key: 0.14, keyColor: '255,200,150', shade: 'rgba(10,8,40,0.45)' };
function darkPanel(g, x, y, w, h) { g.save(); g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 40; g.fillStyle = 'rgba(22,16,48,0.92)'; g.beginPath(); g.roundRect(x, y, w, h, 28); g.fill(); g.restore(); g.strokeStyle = 'rgba(185,162,255,0.35)'; g.lineWidth = 2; g.beginPath(); g.roundRect(x, y, w, h, 28); g.stroke(); }
function c_call(g, s) {
  const t = s.t;
  const right = at(s, 'The voice is'), deal = at(s, 'He needs help');
  shots(g, t, [right - 0.25, deal - 0.25], [
    // late night in accounting: the desk phone lights up "CEO calling"
    (g2, tt) => {
      const z = 1 + 0.06 * ez(span(tt, 0, right));
      g2.save(); g2.translate(1260, 800); g2.scale(z, z); g2.translate(-1260, -800);
      const looked = tt > 1.3;
      nightOffice(g2, tt + 2, { ringAt: 2.3, expr: looked ? 'happy' : 'neutral', look: looked ? 1 : 0, armR: looked ? -0.9 : -0.35 });
      g2.restore();
      pill(g2, tt, 0.5, 'the accounting department', 90, { theme: 'dark' });
    },
    // close-up: the voice is perfect
    (g2, tt) => {
      sky(g2, { top: '#070620', mid: '#141238', horizon: '#2a2150', hy: 1000 }); stars(g2, tt, { n: 60, alpha: 0.4 });
      glow(g2, 520, 600, 700, '255,190,130', 0.22);
      litToon(g2, 560, 1120, 2.6, tt, { ...NEMP, expr: 'happy', armR: -2.5, prop: 'phone', look: 1 }, { light: [100, 300], color: '255,200,150', key: 0.16, keyColor: '255,200,150', shade: 'rgba(10,8,40,0.4)' });
      darkPanel(g2, 1060, 150, 700, 640);
      waveform(g2, tt, 1110, 700, 600, 90, { color: '185,162,255' });
      glow(g2, 1410, 420, 360, '185,162,255', 0.25);
      dotFace(g2, 1410, 420, 0.7, tt, { color: '226,214,255', reveal: ez(span(tt, right, 1.2)) });
      text(g2, 'CEO', 1410, 210, { font: 'Jakarta', weight: 800, size: 30, color: '#cfc6ff', align: 'center' });
      [['accent', 'accent ✓'], ['pauses', 'pauses ✓'], ['your name', 'your name ✓']].forEach(([ph, lab], k) => pill(g2, tt, at(s, ph), lab, 870, { x: 1180 + k * 230, size: 26, fill: 'rgba(20,60,50,0.9)', color: '#9fffe0' }));
      bubble(g2, tt, right + 0.2, 'Hi! It’s me.', 980, 300, 760, 520, { size: 36 });
    },
    // the "CEO" in his glass office asks for a confidential favour; a "lawyer" will call
    (g2, tt) => {
      ceoOffice(g2, tt + 2, { x: 520 });
      const fp = ez(span(tt, at(s, 'confidential') - 0.2, 0.8));
      g2.save(); g2.translate(lerp(-300, 900, fp), 900); g2.rotate(-0.05); g2.fillStyle = '#e8c47f'; g2.fillRect(-160, -70, 320, 140); g2.fillStyle = RED; g2.fillRect(-130, -20, 260, 46); text(g2, 'CONFIDENTIAL', 0, 12, { font: 'Jakarta', weight: 800, size: 28, color: '#fff', align: 'center' }); g2.restore();
      glow(g2, lerp(-300, 900, fp), 900, 200, '255,200,120', 0.25 * fp);
      const lw = at(s, 'a lawyer'), lp = spring(tt, lw, 1.6, 0.6);
      if (lp > 0.01) { g2.save(); g2.translate(1500, 470); g2.scale(Math.min(1, lp), Math.min(1, lp)); phoneCard(g2, 0, 0, 0.95, 'Lawyer', 'London'); g2.restore(); ringRings(g2, tt, lw + 0.3, 1500, 300); }
      pill(g2, tt, 0.3, '“I need your help with something confidential”', 90, { size: 28, theme: 'dark' });
    },
  ]);
}

function c_gone(g, s) {
  const t = s.t;
  const never = at(s, 'The CEO never'), made = at(s, 'the voice was made'), again = at(s, 'And it allegedly');
  shots(g, t, [never - 0.25, made - 0.25, again - 0.25], [
    // the transfer on the monitor: progress fills, coins stream out of the screen
    (g2, tt) => {
      nightOffice(g2, tt + 2, { ringAt: 99, expr: tt > 3.3 ? 'happy' : 'neutral', look: -1, armR: -0.6, screen: (gg, x, y, w, h) => {
        gg.fillStyle = '#16122e'; gg.fillRect(x, y, w, h);
        text(gg, 'Wire transfer', x + w / 2, y + 50, { font: 'Jakarta', weight: 800, size: 28, color: '#fff', align: 'center' });
        const p = out3(span(tt, 0.3, 3)); gg.fillStyle = '#2a2450'; gg.fillRect(x + 30, y + 110, w - 60, 26); gg.fillStyle = '#b9a2ff'; gg.fillRect(x + 30, y + 110, (w - 60) * p, 26);
        text(gg, `$${Math.round(4830000 * p).toLocaleString('en-US')}`, x + w / 2, y + 200, { font: 'Jakarta', weight: 800, size: 40, color: p > 0.98 ? '#9fffe0' : '#fff', align: 'center' });
      } });
      const r = rand(3);
      for (let i = 0; i < 30; i++) { const b = 0.8 + r() * 3, lt = tt - b; if (lt < 0) { r(); continue; } const x = 315 + lt * (200 + r() * 700), y = 600 - lt * 500 + lt * lt * 260; if (y > H || x > W) continue; g2.fillStyle = '#ffc93c'; g2.beginPath(); g2.arc(x, y, 12, 0, Math.PI * 2); g2.fill(); glow(g2, x, y, 30, '255,200,80', 0.4); }
      pill(g2, tt, 0.4, 'gone in minutes', 90, { theme: 'dark' });
      if (tt > 3.3) pill(g2, tt, 3.3, 'SENT ✓', 990, { theme: 'dark', fill: 'rgba(20,60,50,0.92)', color: '#9fffe0' });
    },
    // GAG: the real CEO is fast asleep
    (g2, tt) => { asleep(g2, tt + 2); pill(g2, tt, 0.3, 'meanwhile, the real CEO', 90, { theme: 'dark' }); },
    // the voice was AI
    (g2, tt) => {
      g2.fillStyle = '#0d0b22'; g2.fillRect(0, 0, W, H);
      glow(g2, W / 2, 470, 600, '62,224,181', 0.18);
      dotFace(g2, W / 2, 470, 1.15, tt, { color: '62,224,181', glitch: clamp((tt - made - 0.3) / 0.5) });
      const r = rand(5); g2.font = '600 20px "JetBrains Mono"';
      for (let i = 0; i < 40; i++) { const x = r() * W, y = ((tt * (60 + r() * 120)) + r() * H) % H; g2.fillStyle = `rgba(62,224,181,${0.15 + r() * 0.3})`; g2.fillText(r() < 0.5 ? '0101' : 'voice_model', x, y); }
      pill(g2, tt, made + 0.3, 'made with AI, prosecutors say', 960, { theme: 'dark' });
    },
    // again and again: phones light up across a dark world map
    (g2, tt) => {
      const proj = darkMap(g2, tt, 0, 30, 5.2);
      const r = rand(17);
      for (let i = 0; i < 120; i++) {
        const lon = r() < 0.6 ? -120 + r() * 50 : -10 + r() * 40, lat = r() < 0.6 ? 28 + r() * 20 : 38 + r() * 20;
        const [x, y] = proj([lon, lat]), a0 = again + 0.2 + r() * 5, p = spring(tt, a0, 2, 0.6);
        if (p <= 0.01) continue;
        const ringing = ((tt - a0) % 1.2) < 0.4;
        glow(g2, x, y, 30 * p, ringing ? '255,120,140' : '185,162,255', ringing ? 0.8 : 0.4);
        g2.fillStyle = ringing ? '#ffd1da' : '#cfc6ff'; g2.beginPath(); g2.roundRect(x - 6 * p, y - 10 * p, 12 * p, 20 * p, 3); g2.fill();
      }
      darkPanel(g2, 560, 70, 800, 170);
      counter(g2, tt, again + 0.4, Math.max(2, at(s, '129 million') - again), 129000000, (v) => `$${Math.round(v).toLocaleString('en-US')}`, 960, 190, { size: 96, color: '#ff6b7d' });
      pill(g2, tt, again + 0.5, 'thousands of companies targeted, prosecutors say', 1000, { theme: 'dark' });
    },
  ]);
}

// ---------------------------------------------------------------- chapter card (night)
function chapterCard(num, title) {
  return (g, s) => {
    const t = s.t;
    sky(g, { top: '#06061c', mid: '#15133b', horizon: '#2d2552', hy: 900 }); stars(g, t + 20, { n: 90, maxY: 500, alpha: 0.5 });
    clouds(g, t + 20, { y: 240, h: 120, seed: 440 + num, n: 8, scale: 0.7, lx: 1500, ly: 120, speed: 12 });
    rain(g, t, { n: 300, alpha: 0.25 });
    const p = spring(t, 0.1, 1.4, 0.7);
    g.save(); g.translate(W / 2, 470); g.scale(lerp(0.8, 1, Math.min(1, p)), lerp(0.8, 1, Math.min(1, p))); g.globalAlpha = Math.min(1, p);
    text(g, String(num).padStart(2, '0'), 0, 40, { font: 'Jakarta', weight: 800, size: 220, color: 'rgba(185,162,255,0.22)', align: 'center' });
    g.restore();
    pill(g, t, 0.3, `Chapter ${num}`, 560, { size: 28, theme: 'dark' });
    const tp = span(t, 0.5, 0.6);
    text(g, title, W / 2, 700 + (1 - out3(tp)) * 40, { font: 'Jakarta', weight: 700, size: 96, color: '#f3efff', align: 'center', alpha: tp });
  };
}

// ---------------------------------------------------------------- chapter 1 (night)
function voice(g, s) {
  const t = s.t;
  const ai = at(s, 'with AI'), parrotAt = at(s, 'Think of a parrot'), bosses = at(s, 'Bosses are easy');
  shots(g, t, [parrotAt - 0.25, bosses - 0.25], [
    // the impressionist under a spotlight; then the AI machine prints a voice from a short clip
    (g2, tt) => {
      const zoom = 1 + 0.05 * ez(span(tt, 0, parrotAt));
      g2.save(); g2.translate(760, 600); g2.scale(zoom, zoom); g2.translate(-760, -600);
      theater(g2, tt + 2, { x: 600 });
      const fade = 1 - span(tt, ai, 0.8) * 0.7;
      g2.save(); g2.globalAlpha = fade; litToon(g2, 600, 870, 1.6, tt, { outfit: '#c98a2a', hair: '#2b2440', skin: '#f2c9a5', seed: 51, expr: 'talk', talk: 1, armR: -2.2, armL: 1.2 }, { light: [600, 0], color: '255,230,190', key: 0.15, keyColor: '255,230,190' }); g2.restore();
      g2.restore();
      pill(g2, tt, 0.4, 'a skilled impressionist', 90, { theme: 'dark' });
      const mp = spring(tt, ai - 0.2, 1.5, 0.65);
      if (mp > 0.01) {
        g2.save(); g2.translate(1360, 520); g2.scale(Math.min(1, mp), Math.min(1, mp));
        glow(g2, 0, 0, 420, '62,224,181', 0.25);
        g2.fillStyle = '#15122c'; g2.strokeStyle = 'rgba(62,224,181,0.7)'; g2.lineWidth = 4; g2.beginPath(); g2.roundRect(-230, -180, 460, 360, 40); g2.fill(); g2.stroke();
        g2.fillStyle = '#0c2a24'; g2.beginPath(); g2.roundRect(-190, -140, 380, 120, 20); g2.fill();
        text(g2, 'AI VOICE CLONE', 0, -66, { font: 'Jakarta', weight: 800, size: 34, color: '#3ee0b5', align: 'center' });
        for (let k = 0; k < 2; k++) { g2.save(); g2.translate(-80 + k * 160, 80); g2.rotate(tt * (k ? -2 : 2)); g2.fillStyle = '#3a3156'; for (let j = 0; j < 8; j++) { g2.rotate(Math.PI / 4); g2.fillRect(-10, -50, 20, 22); } g2.beginPath(); g2.arc(0, 0, 36, 0, Math.PI * 2); g2.fill(); g2.restore(); }
        g2.restore();
        const cp = ez(span(tt, ai + 0.2, 1));
        g2.save(); g2.translate(lerp(900, 1140, cp), 360); g2.globalAlpha = 1 - span(tt, ai + 1.1, 0.3);
        g2.fillStyle = '#fff4d6'; g2.beginPath(); g2.roundRect(-110, -36, 220, 72, 36); g2.fill(); text(g2, '▶ 0:10 clip', 0, 12, { font: 'Jakarta', weight: 800, size: 28, color: '#8a5a00', align: 'center' }); g2.restore();
        const rp = span(tt, ai + 1.3, 1.5);
        if (rp > 0) { g2.save(); g2.beginPath(); g2.rect(1590, 340, 330 * rp, 360); g2.clip(); waveform(g2, tt, 1600, 520, 310, 160, { color: '62,224,181', bars: 26 }); g2.restore(); }
        pill(g2, tt, ai + 0.4, 'a short recording can be enough', 990, { x: 1360, theme: 'dark' });
      }
    },
    // the parrot in a moonlit study
    (g2, tt) => {
      study(g2, tt + 2);
      const ceoTalks = Math.sin(tt * 1.5) > 0;
      litToon(g2, 620, 1000, 2.1, tt, { ...NCEO, expr: 'talk', talk: ceoTalks ? 1 : 0, armR: -1.0, armL: 0.6, look: 1 }, { light: [1500, 300], color: '190,180,255', key: 0.1, keyColor: '200,190,255' });
      lit(g2, (cg) => parrot(cg, 1320, 560, 1.7, tt, { talk: ceoTalks ? 0 : 1, look: -1 }), { light: [1500, 300], color: '190,180,255', key: 0.12, keyColor: '200,190,255', shade: 'rgba(10,8,40,0.3)' });
      bubble(g2, tt, 0.2, 'Wire the money.', 760, 230, 640, 460, { size: 38 });
      if (tt > 1.4) bubble(g2, tt, 1.4, 'Wire the money.', 1380, 200, 1340, 380, { size: 38 });
      const q = spring(tt, 2.4, 1.8, 0.55);
      if (q > 0.01) { g2.save(); g2.translate(1580, 340); g2.scale(Math.min(1.05, q), Math.min(1.05, q)); text(g2, '?', 0, 0, { font: 'Jakarta', weight: 800, size: 110, color: '#b9a2ff', align: 'center' }); g2.restore(); }
      pill(g2, tt, 0.6, 'sounds exactly right · understands nothing', 1010, { theme: 'dark' });
    },
    // bosses are easy to record: the earnings call feeds a glowing jar of voice samples
    (g2, tt) => {
      auditorium(g2, tt + 2, { x: 560 });
      const jx = 1560, jy = 520;
      glow(g2, jx, jy, 300, '185,162,255', 0.3);
      g2.strokeStyle = 'rgba(220,210,255,0.8)'; g2.lineWidth = 5; g2.fillStyle = 'rgba(40,30,80,0.5)'; g2.beginPath(); g2.roundRect(jx - 150, jy - 190, 300, 380, 46); g2.fill(); g2.stroke();
      g2.fillStyle = '#3a3156'; g2.fillRect(jx - 130, jy - 220, 260, 36);
      const fill = span(tt, 0.4, Math.max(2, at(s, 'conference talks') - 0.2));
      g2.save(); g2.beginPath(); g2.roundRect(jx - 145, jy - 185, 290, 370, 42); g2.clip(); const lg = g2.createLinearGradient(0, jy + 190, 0, jy - 190); lg.addColorStop(0, 'rgba(185,162,255,0.85)'); lg.addColorStop(1, 'rgba(62,224,181,0.7)'); g2.fillStyle = lg; g2.fillRect(jx - 150, jy + 190 - 380 * fill, 300, 380 * fill); g2.restore();
      text(g2, 'VOICE SAMPLES', jx, jy + 250, { font: 'Jakarta', weight: 800, size: 28, color: '#cfc6ff', align: 'center' });
      ['interviews', 'earnings calls', 'conference talks'].forEach((ph) => {
        const fp = ez(span(tt, at(s, ph), 1)); if (fp <= 0 || fp >= 1) return;
        const x = lerp(760, jx, fp), y = lerp(480, jy - 230, fp) - Math.sin(fp * Math.PI) * 160;
        g2.fillStyle = '#ffffff'; g2.beginPath(); g2.roundRect(x - 100, y - 26, 200, 52, 26); g2.fill(); text(g2, `▶ ${ph}`, x, y + 9, { font: 'Inter', weight: 600, size: 20, color: INK, align: 'center' });
      });
      pill(g2, tt, 0.4, 'bosses are easy to record', 1010, { theme: 'dark' });
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
export const scenes = { c_call, c_gone, ...lightScenes, chapter1: chapterCard(1, 'A Voice You Can Copy'), voice, ...R.scenes,
  chapter2: chapterCard(2, 'The Playbook'), chapter3: chapterCard(3, 'The Victims'), chapter4: chapterCard(4, 'Follow the Money'), chapter5: chapterCard(5, 'The Arrests'), chapter6: chapterCard(6, 'Don’t Be Next') };
export async function preload() { await loadLand(); try { const tl = await (await fetch('/build/ep04-deepfake/timeline.json')).json(); lightRanges = tl.scenes.filter((x) => LIGHT[x.id]).map((x) => [x.start - 0.3, x.start + x.duration + 0.3]); } catch { /* none */ } }
let lightRanges = [];
export const look = { finish: (ctx, frame) => { const T = frame / 30; if (!lightRanges.some(([a, b]) => T >= a && T < b)) nightFinish(ctx, frame); } };
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
  ['chapter2', 'chapter3', 'chapter4', 'chapter5', 'chapter6'].forEach((c) => S(sc(c).start + 0.15, 'hit', 0.6));
  out.push(...R.sounds(timeline));
  return out;
};
void TEAL; void LAW;
