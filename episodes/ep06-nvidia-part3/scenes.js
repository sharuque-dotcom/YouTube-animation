// Episode 6: How Jensen Huang Lost Nvidia in 14 Days. Episode-3 night template with the
// episode-5 motion kit: moving camera in every shot, varied transitions, secondary motion.
import { W, H, text } from '../../pipeline/engine.js';
import { sceneWords, when } from '../../pipeline/shots.js';
import { lightScene, lightSounds } from '../../pipeline/lightshots.js';
import { beam, glow, nightFinish } from '../../pipeline/scenery.js';
import { ez, span, spring, at, pill } from '../../pipeline/scenekit.js';
import { INK, LAV, RED, GOLD, D, cam, shots, nightBG, panel, counter, chapterCard } from './kit.js';
import { dawnFiling, filingPage, emptyChair, calendarRewind, diner, napkin, chipMorph, aiCity, wheel } from './sets.js';
import { jacketOnly } from './jacket.js';
import * as REST from './rest.js';

const EP = 'ep06-nvidia-part3';
/** Draw captions/panels in screen space, outside the shot's camera move */
const ui = (g, fn) => { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); fn(); g.restore(); };

// ---------------------------------------------------------------- cold open
function c_open(g, s) {
  const t = s.t, b = (p) => at(s, p);
  const c1 = b('It says that') - 0.25, c2 = b('No reason') - 0.2, c3 = b('Thirty-three years') - 0.25, c4 = b('Fourteen days') - 0.25;
  shots(g, t, [c1, c2, c3, c4], [
    (g2, tt) => { cam(g2, tt, { z0: 1.0, z1: 1.22, dur: 8.5, fx: 700, fy: 360 }); dawnFiling(g2, tt, { at: b('A short document') + 0.5 }); ui(g2, () => pill(g2, tt, 0.25, 'Thursday 12 November 2026 · before the market opens', 1000, D)); },
    (g2, tt) => { cam(g2, tt - c1, { z0: 1.0, z1: 1.14, dur: 8.5, fx: 900, fy: 600 }); filingPage(g2, tt, { type: c1 + 0.2, hl: b('Effective immediately') }); ui(g2, () => pill(g2, tt, c1 + 0.3, 'paraphrased from Nvidia’s filing', 1010, D)); },
    (g2, tt) => { cam(g2, tt - c2, { z0: 1.5, z1: 1.62, dur: 3, fx: 900, fy: 860, drift: 0.5 }); filingPage(g2, tt, { type: -9, hl: -9, lens: c2 - 0.3 }); const p = spring(tt, c2 + 0.3, 1.8, 0.6); if (p > 0.01) { g2.save(); g2.setTransform(1, 0, 0, 1, 0, 0); g2.translate(1500, 240); g2.scale(Math.min(1.05, p), Math.min(1.05, p)); panel(g2, -260, -80, 520, 160); text(g2, 'REASON GIVEN', 0, -22, { font: 'Jakarta', weight: 700, size: 24, color: LAV, align: 'center', spacing: 4 }); text(g2, 'none', 0, 46, { font: 'Jakarta', weight: 800, size: 64, color: RED, align: 'center' }); g2.restore(); } },
    (g2, tt) => {
      const gone = b('Gone in one');
      cam(g2, tt - c3, { z0: 1.0, z1: 1.16, dur: 7, fx: 960, fy: 620 }); emptyChair(g2, tt, { lift: span(tt, gone - 0.1, 1.6) });
      const p1 = spring(tt, c3 + 0.3, 1.6, 0.65), p2 = spring(tt, b('A company worth') + 0.2, 1.6, 0.65);
      if (p1 > 0.01) { g2.save(); g2.setTransform(1, 0, 0, 1, 0, 0); g2.translate(330, 420); g2.scale(Math.min(1.04, p1), Math.min(1.04, p1)); panel(g2, -230, -130, 460, 260); counter(g2, tt, c3 + 0.3, 1.2, 33, (v) => String(Math.round(v)), 0, 30, { size: 150 }); text(g2, 'years as CEO', 0, 92, { font: 'Inter', weight: 600, size: 30, color: LAV, align: 'center' }); g2.restore(); }
      if (p2 > 0.01) { g2.save(); g2.setTransform(1, 0, 0, 1, 0, 0); g2.translate(1590, 420); g2.scale(Math.min(1.04, p2), Math.min(1.04, p2)); panel(g2, -240, -130, 480, 260); counter(g2, tt, b('A company worth') + 0.2, 1.2, 4, (v) => `$${v.toFixed(v < 4 ? 1 : 0)}T`, 0, 30, { size: 150, color: '#9be36a' }); text(g2, 'around four trillion dollars', 0, 92, { font: 'Inter', weight: 600, size: 28, color: LAV, align: 'center' }); g2.restore(); }
    },
    (g2, tt) => { g2.save(); cam(g2, tt - c4, { z0: 1.06, z1: 1.0, dur: 6 }); nightBG(g2, tt, { seed: 3, rainA: 0.3, moonAt: [1620, 150] }); g2.fillStyle = 'rgba(6,5,16,0.35)'; g2.fillRect(-100, -100, W + 200, H + 200); calendarRewind(g2, tt, c4 + 0.1); g2.restore(); if (tt > b('This is how')) pill(g2, tt, b('This is how'), 'this is how it happened', 1000, D); },
  ], ['blur', 'fade', 'flash', 'push']);
}

// ---------------------------------------------------------------- chapter 1: the builder
function builder(g, s) {
  const t = s.t, b = (p) => at(s, p);
  const c1 = b('One of them') - 0.25, c2 = b('For years') - 0.25, c3 = b('When the AI boom') - 0.25, c4 = b('The company became') - 0.25, c5 = b('And Huang, in his') - 0.25, c6 = b('Dozens of executives') - 0.25;
  const hub = b('Think of a wheel'), brk = b('Until something');
  shots(g, t, [c1, c2, c3, c4, c5, c6], [
    (g2, tt) => { cam(g2, tt, { z0: 1.0, z1: 1.2, dur: 12, fx: 900, fy: 640, pan: [-30, 0] }); diner(g2, tt); ui(g2, () => { pill(g2, tt, 0.25, 'California · 1993', 90, D); if (tt > b('three engineers')) pill(g2, tt, b('three engineers'), 'three engineers, one booth', 1000, D); }); },
    (g2, tt) => { cam(g2, tt - c1, { z0: 1.12, z1: 1.0, dur: 7, fx: 960, fy: 600 }); napkin(g2, tt, { draw0: c1 + 0.1, dur: 3.2 }); const nm = b('His name was'); if (tt > nm) { const p = spring(tt, nm + 0.5, 1.6, 0.65); g2.save(); g2.setTransform(1, 0, 0, 1, 0, 0); g2.translate(1500, 930); g2.scale(Math.min(1.04, p), Math.min(1.04, p)); panel(g2, -300, -70, 600, 140); text(g2, 'Jensen Huang', 0, 0, { font: 'Jakarta', weight: 800, size: 54, color: INK, align: 'center' }); text(g2, 'co-founder · age 30', 0, 42, { font: 'Inter', weight: 600, size: 26, color: LAV, align: 'center' }); g2.restore(); } },
    (g2, tt) => { const k = b('Then researchers'); cam(g2, tt - c2, { z0: 1.0, z1: 1.08, dur: 9, pan: [50, 0] }); chipMorph(g2, tt, k); ui(g2, () => { pill(g2, tt, c2 + 0.3, 'video games', 980, { theme: 'dark', x: 400 }); if (tt > k) pill(g2, tt, k + 0.5, 'artificial intelligence', 980, { theme: 'dark', x: 1500 }); }); },
    (g2, tt) => { cam(g2, tt - c3, { z0: 1.0, z1: 1.1, dur: 7, fx: 960, fy: 600 }); aiCity(g2, tt, { a: c3 + 0.15 }); ui(g2, () => { if (tt > b('needed Nvidia')) pill(g2, tt, b('needed Nvidia'), 'every cable leads to one company', 90, D); }); },
    (g2, tt) => { g2.save(); cam(g2, tt - c4, { z0: 1.1, z1: 1.0, dur: 5, fx: 960, fy: 300 }); aiCity(g2, tt, { a: -9, grow: span(tt, c4 + 0.1, 2.4) }); g2.restore(); pill(g2, tt, c4 + 0.6, 'one of the most valuable companies in history', 1000, D); },
    (g2, tt) => { g2.fillStyle = '#05040f'; g2.fillRect(0, 0, W, H); cam(g2, tt - c5, { z0: 1.0, z1: 1.14, dur: 5, fx: 960, fy: 560 }); beam(g2, tt, 960, -60, Math.PI / 2, { len: 1050, spread: 0.2, color: '255,215,170', alpha: 0.34, motes: 90, seed: 5 }); glow(g2, 960, 960, 420, '255,215,170', 0.25); const p = Math.min(1, spring(tt, c5 + 0.05, 1.4, 0.7)); g2.save(); g2.translate(960, 760 - (1 - p) * 500); g2.rotate(Math.sin((tt - c5) * 1.6) * 0.03 * (1 + (1 - p) * 4)); jacketOnly(g2, tt, 0, 120, 1.9, { lit: 1 }); g2.restore(); ui(g2, () => pill(g2, tt, c5 + 0.5, 'the black leather jacket', 1000, D)); },
    (g2, tt) => {
      const zoom = ez(span(tt, hub - 0.3, 1.2));
      cam(g2, tt - c6, { z0: 1.0 + zoom * 0.18, z1: 1.06 + zoom * 0.22, dur: 14, fx: 960, fy: 540 });
      wheel(g2, tt - c6, { crack: ez(span(tt, brk, 1.6)) });
      ui(g2, () => pill(g2, tt, c6 + 0.5, tt < hub ? 'dozens of executives report to one person' : tt < brk ? 'one hub' : 'until something happens to the hub', 1010, D));
    },
  ], ['push', 'blur', 'flash', 'fade', 'blur', 'push']);
}

// ---------------------------------------------------------------- assembly
const LIGHT = {
  title: [{ type: 'sting', title: 'Toppled Giants', sub: 'How Jensen Huang Lost Nvidia in 14 Days' }],
  sub: [{ type: 'subscribe', clickWhen: 'subscribe', text: 'we follow these collapses as they happen' }],
  endcard: [{ type: 'subscribe', clickWhen: 'Subscribe', text: 'see you in the next story' }],
};
const lightScenes = Object.fromEntries(Object.entries(LIGHT).map(([k, v]) => [k, lightScene(v)]));
export const scenes = {
  c_open, ...lightScenes, builder, ...REST.scenes,
  chapter1: chapterCard(1, 'The Builder'), chapter2: chapterCard(2, 'The Customer'), chapter3: chapterCard(3, 'Day One'),
  chapter4: chapterCard(4, 'The Email'), chapter5: chapterCard(5, 'The Second Report'), chapter6: chapterCard(6, 'Day Fourteen'),
};
let lightRanges = [];
export async function preload() { try { const tl = await (await fetch(`/build/${EP}/timeline.json`)).json(); lightRanges = tl.scenes.filter((x) => LIGHT[x.id]).map((x) => [x.start - 0.3, x.start + x.duration + 0.3]); } catch { /* none */ } }
export const look = { finish: (ctx, frame) => { const T = frame / 30; if (!lightRanges.some(([a, b]) => T >= a && T < b)) nightFinish(ctx, frame); } };
export const hits = [];
export const extraHits = (timeline) => {
  const out = [...lightSounds(timeline, LIGHT)];
  const sc = (id) => timeline.scenes.find((x) => x.id === id);
  const w = (id, p) => { const x = sc(id); return x.start + when(sceneWords(x.cues), p); };
  const S = (t, kind, vol = 0.6) => out.push({ t, kind, vol });
  const cuts = { c_open: ['It says that', 'No reason', 'Thirty-three years', 'Fourteen days'], builder: ['One of them', 'For years', 'When the AI boom', 'The company became', 'And Huang, in his', 'Dozens of executives'], ...REST.cuts };
  Object.entries(cuts).forEach(([id, ps]) => ps.forEach((p) => S(w(id, p) - 0.35, 'whoosh', 0.35)));
  ['chapter1', 'chapter2', 'chapter3', 'chapter4', 'chapter5', 'chapter6'].forEach((c) => S(sc(c).start + 0.15, 'hit', 0.6));
  S(w('c_open', 'A short document') + 0.5, 'pop', 0.7); S(w('c_open', 'Effective immediately'), 'hit', 0.8); S(w('c_open', 'No reason') + 0.3, 'pop', 0.6);
  S(w('c_open', 'Thirty-three years') + 0.3, 'pop', 0.5); S(w('c_open', 'A company worth') + 0.2, 'pop', 0.5); S(w('c_open', 'Gone in one'), 'whoosh', 0.7);
  for (let k = 0; k < 14; k++) S(w('c_open', 'Fourteen days') + 0.3 + k * 0.17, 'tick', 0.4);
  S(w('c_open', 'Fourteen days') + 2.8, 'hit', 0.7);
  S(w('builder', 'His name was') + 0.5, 'pop', 0.6); S(w('builder', 'Then researchers'), 'hit', 0.6); S(w('builder', 'And Huang, in his') + 0.4, 'hit', 0.5); S(w('builder', 'Until something'), 'hit', 0.8);
  for (let k = 0; k < 8; k++) S(w('builder', 'When the AI boom') + 0.15 + k * 0.32, 'tick', 0.35);
  REST.sounds(S, w);
  return out;
};
void GOLD;
