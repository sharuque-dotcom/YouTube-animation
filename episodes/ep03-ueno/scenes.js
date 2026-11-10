// Episode 3: The Bank That Toppled a President. Night set pieces (sets.js) + act-it-out shots.
import { W, H, clamp, lerp, rand, text } from '../../pipeline/engine.js';
import { sceneWords, when } from '../../pipeline/shots.js';
import { lightScene, lightSounds } from '../../pipeline/lightshots.js';
import { sky, stars, clouds, skyline, rain, mist, glow, beam, nightFinish, buf, flagCloth } from '../../pipeline/scenery.js';
import { person } from '../../pipeline/fx.js';
import { bedroom, tower, march, domino } from './sets.js';

import { ez, out3, span, spring, TEAL, INK, PURPLE, words, at, shots, caption, nightBG, phone, cardIcon, cross } from './kit.js';
import * as R from './rest.js';

// ---------------------------------------------------------------- cold open
function c_night(g, s) {
  const t = s.t;
  const posted = at(s, 'posted'), sunrise = at(s, 'By sunrise'), three = at(s, 'Three million');
  const stopped = at(s, 'stopped working'), pay = at(s, 'could not pay'), cash = at(s, 'withdraw cash'), cards = at(s, 'use their cards');
  shots(g, t, [sunrise - 0.25, three - 0.25], [
    // 1. 3:24 a.m. in Asunción: camera drifts toward the phone as the message lands
    (g2, tt) => {
      const z = 1 + 0.12 * ez(span(tt, 0, sunrise));
      g2.save(); g2.translate(1640, 640); g2.scale(z, z); g2.translate(-1640, -640);
      bedroom(g2, tt + 2, { notifAt: posted + 0.4 });
      g2.restore();
      caption(g2, tt, posted + 0.9, 'Banco Central del Paraguay · 3:24 a.m., 2 November 2026', 110, { size: 28 });
    },
    // 2. dawn: a wall of phones flicks from working to dead, in a wave
    (g2, tt) => {
      const gr = g2.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#2a1d55'); gr.addColorStop(0.6, '#8a4a78'); gr.addColorStop(1, '#ffb07a');
      g2.fillStyle = gr; g2.fillRect(0, 0, W, H);
      glow(g2, W / 2, H + 100, 900, '255,190,130', 0.45);
      const wave = span(tt, stopped - 0.6, 2.4);
      const cols = 15, rows = 6;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const depth = r / (rows - 1), sc = lerp(0.55, 1.15, depth), x = W / 2 + (c - (cols - 1) / 2) * lerp(105, 160, depth) + (r % 2) * 30, y = lerp(260, 900, depth);
        const d = (c / cols) * 0.7 + rand(r * 40 + c)() * 0.3, k = clamp((wave - d) * 6);
        const pop = spring(tt, sunrise + (r * cols + c) * 0.008, 2, 0.7);
        if (pop > 0.01) phone(g2, x, y + (1 - Math.min(1, pop)) * 60, sc * Math.min(1, pop), k);
      }
      caption(g2, tt, sunrise + 0.3, 'the most popular banking app in the country', 90);
      if (wave > 0.4) caption(g2, tt, stopped + 0.6, 'sin conexión · no connection', 1010, { size: 28 });
    },
    // 3. three million customers, six in ten adults: the crowd greys out; pay / cash / cards crossed
    (g2, tt) => {
      nightBG(g2, tt);
      const cols = 20, rows = 5, grey = span(tt, three + 1.5, 1.6);
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const i = r * cols + c, x = 210 + c * 79, y = 250 + r * 104, p = spring(tt, three - 0.2 + i * 0.006, 2, 0.7);
        if (p <= 0.01) continue;
        const affected = (c % 10) < 6 && grey > (c % 10) / 10;
        g2.save(); g2.translate(x, y + (1 - Math.min(1, p)) * 40); g2.globalAlpha = Math.min(1, p);
        g2.fillStyle = affected ? '#5b5870' : PURPLE;
        g2.beginPath(); g2.arc(0, -22, 14, 0, Math.PI * 2); g2.fill();
        g2.beginPath(); g2.roundRect(-20, -4, 40, 44, [16, 16, 4, 4]); g2.fill();
        g2.restore();
      }
      const n = Math.round(3000000 * out3(span(tt, three, 1.4)));
      text(g2, n.toLocaleString('en-US'), W / 2, 150, { font: 'Jakarta', weight: 700, size: 92, color: INK, align: 'center' });
      text(g2, 'customers', W / 2, 205, { font: 'Inter', weight: 600, size: 30, color: PURPLE, align: 'center', alpha: span(tt, three + 0.4, 0.5) });
      if (grey > 0.5) caption(g2, tt, three + 2.6, '6 in 10 adults in Paraguay', 800, { size: 30 });
      // pay / cash / cards
      [[pay, 'PAY', 620], [cash, 'CASH', 960], [cards, 'CARDS', 1300]].forEach(([a0, lab, x], k) => {
        const p = spring(tt, a0, 1.8, 0.6);
        if (p <= 0.01) return;
        g2.save(); g2.translate(x, 930); g2.scale(Math.min(1.05, p), Math.min(1.05, p));
        g2.fillStyle = 'rgba(30,24,60,0.9)'; g2.beginPath(); g2.roundRect(-120, -60, 240, 120, 24); g2.fill();
        if (k === 0) { g2.fillStyle = '#d9d6e6'; g2.beginPath(); g2.roundRect(-36, -40, 72, 60, 8); g2.fill(); g2.fillStyle = '#2a2448'; g2.fillRect(-26, -30, 52, 14); }
        if (k === 1) { g2.fillStyle = '#7fc8a9'; g2.fillRect(-46, -30, 92, 46); text(g2, '₲', 0, 4, { font: 'Jakarta', weight: 800, size: 30, color: '#1d3b30', align: 'center' }); }
        if (k === 2) cardIcon(g2, 0, -8, 0.62);
        text(g2, lab, 0, 46, { font: 'Jakarta', weight: 700, size: 22, color: INK, align: 'center' });
        g2.restore();
        cross(g2, x, 920, 50, span(tt, a0 + 0.35, 0.35));
      });
    },
  ]);
}

function c_fall(g, s) {
  const t = s.t;
  const outAt = at(s, 'out of office'), arrest = at(s, 'under arrest'), how = at(s, 'How does');
  shots(g, t, [how - 0.2], [
    // the president: sash slides off, handcuffs close, police lights
    (g2, tt) => {
      nightBG(g2, tt, { glowCol: 'rgba(255,120,90,0.15)' });
      skyline(g2, tt, { base: 900, seed: 91, depth: 0.2, color: '#1f1c44', lit: 0.15, tall: 0.8, fog: 'rgba(80,65,125,0.5)' });
      // palace silhouette behind
      g2.fillStyle = '#2a2550'; g2.fillRect(560, 560, 800, 340); g2.fillRect(890, 400, 140, 170);
      g2.beginPath(); g2.moveTo(870, 400); g2.lineTo(960, 330); g2.lineTo(1050, 400); g2.closePath(); g2.fill();
      for (let i = 0; i < 14; i++) { g2.fillStyle = rand(i + 3)() < 0.5 ? 'rgba(255,210,150,0.6)' : 'rgba(60,54,100,0.8)'; g2.fillRect(590 + i * 55, 640, 24, 50); g2.fillRect(590 + i * 55, 740, 24, 50); }
      g2.fillStyle = '#0a0918'; g2.fillRect(0, 900, W, 180);
      // the figure (dark suit, presidential sash)
      const cx = W / 2, cy = 760;
      // faceless silhouette, rim-lit from the palace windows
      g2.save(); g2.translate(cx, cy);
      g2.fillStyle = '#0c0a18';
      g2.beginPath(); g2.ellipse(0, -150, 46, 56, 0, 0, Math.PI * 2); g2.fill();
      g2.fillRect(-18, -100, 36, 30);
      g2.beginPath(); g2.moveTo(-130, 300); g2.lineTo(-135, -10); g2.quadraticCurveTo(-130, -70, -40, -78); g2.lineTo(40, -78); g2.quadraticCurveTo(130, -70, 135, -10); g2.lineTo(130, 300); g2.closePath(); g2.fill();
      g2.fillStyle = '#f4f1ea'; g2.beginPath(); g2.moveTo(-22, -78); g2.lineTo(0, -20); g2.lineTo(22, -78); g2.closePath(); g2.fill();
      g2.strokeStyle = 'rgba(255,200,140,0.55)'; g2.lineWidth = 4;
      g2.beginPath(); g2.ellipse(0, -150, 46, 56, 0, -1.4, 0.6); g2.stroke();
      g2.beginPath(); g2.moveTo(135, -10); g2.lineTo(130, 300); g2.stroke();
      g2.restore();
      const off = ez(span(tt, outAt, 1.1));
      g2.save(); g2.translate(cx + off * 120, cy - 10 + off * 260); g2.rotate(-0.75 + off * 1.2);
      ['#d52b1e', '#f4f1ea', '#0038a8'].forEach((c, k) => { g2.fillStyle = c; g2.fillRect(-160, -27 + k * 18, 320, 18); });
      g2.restore();
      // handcuffs click shut
      const hc = spring(tt, arrest, 2.2, 0.5);
      if (hc > 0.01) {
        g2.save(); g2.translate(cx, cy + 250); g2.scale(Math.min(1.1, hc), Math.min(1.1, hc));
        g2.strokeStyle = '#c9c6d6'; g2.lineWidth = 12;
        const close = clamp((tt - arrest) / 0.25);
        [-70, 70].forEach((dx, k) => { g2.beginPath(); g2.arc(dx, 0, 44, k ? -0.3 : Math.PI - 0.3 - 0, (k ? -0.3 : Math.PI - 0.3) + lerp(4.5, 6.1, close)); g2.stroke(); });
        g2.lineWidth = 6; for (let i = -2; i <= 2; i++) { g2.beginPath(); g2.ellipse(i * 12, 0, 8, 5, 0, 0, Math.PI * 2); g2.stroke(); }
        g2.restore();
        const ph = tt * 2.4;
        [[260, '255,40,60'], [1660, '60,90,255']].forEach(([px, col], k) => { glow(g2, px, 880, 260, col, 0.35 + 0.3 * Math.sin(ph * 3 + k * Math.PI)); beam(g2, tt, px, 880, -Math.PI / 2 + Math.sin(ph + k * Math.PI) * 0.8, { len: 800, spread: 0.1, color: col, alpha: 0.16, motes: 0 }); });
      }
      caption(g2, tt, 0.3, 'five days later', 110);
      if (tt > arrest) caption(g2, tt, arrest + 0.2, 'out of office · under arrest', 1010);
    },
    // the domino: the bank topples the palace
    (g2, tt) => {
      const a0 = how - 0.2;
      domino(g2, tt - a0, { fallAt: 0.2, fallDur: 2.2, hitAt: 2.1 });
      caption(g2, tt, how + 0.3, 'How does one bank bring down a president?', 1000, { size: 34 });
    },
  ]);
}

// ---------------------------------------------------------------- chapter card (night style)
function chapterCard(num, title) {
  return (g, s) => {
    const t = s.t;
    nightBG(g, t + 20);
    clouds(g, t + 20, { y: 240, h: 120, seed: 140 + num, n: 8, scale: 0.7, lx: 1500, ly: 120, speed: 12 });
    rain(g, t, { n: 300, alpha: 0.25 });
    const p = spring(t, 0.1, 1.4, 0.7);
    g.save(); g.translate(W / 2, 470); g.scale(lerp(0.8, 1, Math.min(1, p)), lerp(0.8, 1, Math.min(1, p))); g.globalAlpha = Math.min(1, p);
    text(g, String(num).padStart(2, '0'), 0, 40, { font: 'Jakarta', weight: 800, size: 220, color: 'rgba(185,162,255,0.22)', align: 'center' });
    g.restore();
    caption(g, t, 0.3, `Chapter ${num}`, 560, { size: 28 });
    const tp = span(t, 0.5, 0.6);
    text(g, title, W / 2, 700 + (1 - out3(tp)) * 40, { font: 'Jakarta', weight: 700, size: 96, color: INK, align: 'center', alpha: tp });
  };
}

// ---------------------------------------------------------------- chapter 1: rise
function storefront(g, t, sign, { shift = 0, lit = 1 } = {}) {
  // a small 1970s finance office on a quiet street at dusk
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#2b2152'); gr.addColorStop(1, '#6b4a7a');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  skyline(g, t, { base: 860, seed: 120, depth: 0.25, color: '#3a2d5e', lit: 0.12, tall: 0.6, fog: 'rgba(255,170,130,0.18)' });
  g.fillStyle = '#2a2140'; g.fillRect(0, 860, W, 220);
  g.fillStyle = '#3a2f55'; g.fillRect(0, 860, W, 18);
  // building
  const bx = 640 + shift, bw = 640;
  g.fillStyle = '#e9d8c4'; g.fillRect(bx, 380, bw, 480);
  g.fillStyle = '#d4bfa8'; g.fillRect(bx, 380, bw, 26);
  for (let i = 0; i < 4; i++) { g.fillStyle = 'rgba(80,60,90,0.8)'; g.fillRect(bx + 40 + i * 150, 440, 100, 110); g.fillStyle = `rgba(255,214,150,${0.5 * lit})`; g.fillRect(bx + 46 + i * 150, 446, 88, 98); }
  // shop window + door
  g.fillStyle = `rgba(255,214,150,${0.75 * lit})`; g.fillRect(bx + 60, 620, 360, 200); g.fillStyle = '#3a2d55'; g.fillRect(bx + 450, 620, 130, 240);
  g.fillStyle = 'rgba(60,40,70,0.6)'; g.fillRect(bx + 236, 620, 8, 200);
  // awning
  for (let i = 0; i < 10; i++) { g.fillStyle = i % 2 ? '#f3efe6' : '#7a4ab8'; g.beginPath(); g.moveTo(bx + 40 + i * 56, 580); g.lineTo(bx + 96 + i * 56, 580); g.lineTo(bx + 100 + i * 56, 610); g.lineTo(bx + 36 + i * 56, 610); g.closePath(); g.fill(); }
  // sign
  g.fillStyle = '#1d1630'; g.fillRect(bx + 80, 560 - 40, 480, 52);
  text(g, sign, bx + 320, 557, { font: sign === 'ueno' ? 'Jakarta' : "'Playfair Display'", weight: sign === 'ueno' ? 800 : 700, size: sign === 'ueno' ? 44 : 30, color: sign === 'ueno' ? TEAL : '#f3d9a8', align: 'center' });
  glow(g, bx + 240, 720, 380, '255,200,140', 0.25 * lit);
}
function walker(g, t, a, y, dir, s, seed) {
  const x = dir > 0 ? -150 + ((t - a) * 160 * s) : W + 150 - ((t - a) * 160 * s);
  const step = Math.sin((t - a) * 9) * 0.35;
  person(g, x, y, s, t, { jacket: ['#2b2440', '#4a2a8c', '#1f3b4a'][seed % 3], shirt: '#e8e3f5', armL: step, armR: -step, seed });
}
function rise(g, s) {
  const t = s.t;
  const decades = at(s, 'for decades'), y2021 = at(s, 'In 2021'), renamed = at(s, 'renamed'), app = at(s, 'into an app');
  const cash = at(s, 'cashback'), credit = at(s, 'credit cards'), shirt = at(s, 'national football');
  shots(g, t, [y2021 - 0.25, cash - 0.25], [
    // 1976: the small office nobody noticed; years roll by as people walk past
    (g2, tt) => {
      storefront(g2, tt, 'El Comercio · 1976');
      walker(g2, tt, 0.4, 820, 1, 0.95, 2); walker(g2, tt, 1.6, 840, -1, 1.05, 5); walker(g2, tt, 3.2, 830, 1, 1, 8); walker(g2, tt, 4.6, 845, -1, 0.9, 11);
      const yr = Math.round(lerp(1976, 2020, ez(span(tt, decades, y2021 - decades - 0.4))));
      g2.save(); g2.translate(300, 260);
      g2.fillStyle = '#f7f1e6'; g2.beginPath(); g2.roundRect(-120, -110, 240, 220, 18); g2.fill();
      g2.fillStyle = '#d52b1e'; g2.beginPath(); g2.roundRect(-120, -110, 240, 60, [18, 18, 0, 0]); g2.fill();
      text(g2, 'AÑO', 0, -68, { font: 'Jakarta', weight: 700, size: 26, color: '#fff', align: 'center' });
      text(g2, String(tt < 0.3 ? 1976 : (tt < decades ? 1976 : yr)), 0, 50, { font: 'Jakarta', weight: 800, size: 84, color: '#1d1b29', align: 'center' });
      g2.restore();
      caption(g2, tt, 0.4, 'a small finance company · 1976', 1010);
    },
    // 2021: new owners, new name, and the shop folds into a phone
    (g2, tt) => {
      const fold = ez(span(tt, app - 0.2, 1.3));
      g2.save();
      if (fold > 0) { const sc = lerp(1, 0.18, fold); g2.translate(W / 2, 540); g2.scale(sc, sc); g2.translate(-W / 2, -540); }
      storefront(g2, tt, tt > renamed + 0.3 ? 'ueno' : 'El Comercio · 1976', { lit: 1 });
      g2.restore();
      // family flag planted
      const fp = spring(tt, y2021 + 0.3, 1.5, 0.6);
      if (fp > 0.01 && fold < 0.6) {
        g2.save(); g2.translate(1500, 380); g2.scale(Math.min(1, fp), Math.min(1, fp)); g2.globalAlpha = 1 - fold;
        g2.strokeStyle = '#e8e3f5'; g2.lineWidth = 6; g2.beginPath(); g2.moveTo(0, 0); g2.lineTo(0, -260); g2.stroke();
        g2.fillStyle = '#7a4ab8'; g2.beginPath(); g2.moveTo(0, -260); g2.lineTo(190, -220); g2.lineTo(0, -180); g2.closePath(); g2.fill();
        text(g2, 'GRUPO VÁZQUEZ', 80, -212, { font: 'Jakarta', weight: 800, size: 20, color: INK, align: 'center' });
        g2.restore();
      }
      if (tt > renamed + 0.25 && tt < renamed + 0.7) glow(g2, 960, 540, 500, '62,224,181', 0.5 * (1 - (tt - renamed - 0.25) / 0.45));
      if (fold > 0) {
        g2.save(); g2.globalAlpha = fold;
        g2.translate(W / 2, 540); const k = lerp(0.4, 1, fold); g2.scale(k, k);
        g2.fillStyle = '#0a0812'; g2.beginPath(); g2.roundRect(-190, -380, 380, 760, 54); g2.fill();
        const sc2 = g2.createLinearGradient(0, -360, 0, 360); sc2.addColorStop(0, '#173b36'); sc2.addColorStop(1, '#0e2422');
        g2.fillStyle = sc2; g2.beginPath(); g2.roundRect(-170, -360, 340, 720, 40); g2.fill();
        text(g2, 'ueno', 0, -200, { font: 'Jakarta', weight: 800, size: 96, color: TEAL, align: 'center' });
        text(g2, 'Saldo disponible', 0, -100, { font: 'Inter', weight: 600, size: 22, color: '#9fd9c9', align: 'center' });
        text(g2, '₲ 2.450.000', 0, -50, { font: 'Jakarta', weight: 700, size: 46, color: '#fff', align: 'center' });
        ['Pagar', 'Transferir', 'Tarjetas'].forEach((l, i) => { g2.fillStyle = 'rgba(62,224,181,0.18)'; g2.beginPath(); g2.roundRect(-140, 30 + i * 100, 280, 76, 20); g2.fill(); text(g2, l, 0, 78 + i * 100, { font: 'Inter', weight: 600, size: 26, color: '#e6fff8', align: 'center' }); });
        g2.restore();
        glow(g2, W / 2, 540, 700, '62,224,181', 0.25 * fold);
      }
      caption(g2, tt, y2021 + 0.4, tt > app ? 'the bank becomes an app' : 'new owners · new name', 1010);
    },
    // perks: groceries cashback, first credit cards, the football shirt
    (g2, tt) => {
      const gr = g2.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#173b36'); gr.addColorStop(1, '#2a1d55');
      g2.fillStyle = gr; g2.fillRect(0, 0, W, H);
      glow(g2, 400, 500, 600, '62,224,181', 0.25);
      // cart raining coins
      const cp = spring(tt, cash - 0.1, 1.5, 0.6);
      if (cp > 0.01) {
        g2.save(); g2.translate(420, 560); g2.scale(Math.min(1, cp), Math.min(1, cp));
        g2.strokeStyle = INK; g2.lineWidth = 12; g2.lineJoin = 'round';
        g2.beginPath(); g2.moveTo(-180, -120); g2.lineTo(-130, -120); g2.lineTo(-80, 80); g2.lineTo(150, 80); g2.lineTo(180, -60); g2.lineTo(-110, -60); g2.stroke();
        g2.fillStyle = INK; [-50, 120].forEach((wx) => { g2.beginPath(); g2.arc(wx, 120, 22, 0, Math.PI * 2); g2.fill(); });
        ['#ff8a65', '#7fc8a9', '#ffd166', '#b39ddb'].forEach((c, i) => { g2.fillStyle = c; g2.beginPath(); g2.roundRect(-70 + i * 52, -110, 44, 60, 8); g2.fill(); });
        g2.restore();
        const r = rand(5);
        for (let i = 0; i < 26; i++) { const born = cash + 0.3 + r() * 1.6, lt = tt - born; if (lt < 0) { r(); r(); continue; } const x = 420 + (r() - 0.5) * 360, y = 560 - lt * 500 + lt * lt * 300, rot = lt * 6; if (y > H) continue; g2.save(); g2.translate(x, y); g2.scale(Math.cos(rot), 1); g2.fillStyle = '#ffc93c'; g2.beginPath(); g2.arc(0, 0, 22, 0, Math.PI * 2); g2.fill(); g2.fillStyle = '#e0a82a'; g2.beginPath(); g2.arc(0, 0, 15, 0, Math.PI * 2); g2.fill(); g2.restore(); }
        caption(g2, tt, cash + 0.3, 'cashback on groceries', 820, { size: 28, x: 420 });
      }
      // a first credit card into an open hand
      const kp = spring(tt, credit, 1.4, 0.65);
      if (kp > 0.01) {
        g2.save(); g2.translate(960, 560);
        g2.fillStyle = '#e8b48f'; g2.beginPath(); g2.ellipse(0, 90, 110, 46, 0, 0, Math.PI * 2); g2.fill();
        for (let i = 0; i < 4; i++) { g2.beginPath(); g2.roundRect(-80 + i * 42, 30, 34, 70, 16); g2.fill(); }
        g2.restore();
        cardIcon(g2, 960, lerp(200, 520, Math.min(1, kp)), 1.4);
        caption(g2, tt, credit + 0.4, 'first credit cards', 820, { size: 28, x: 960 });
      }
      // the football shirt spinning with the logo
      const sp = spring(tt, shirt - 0.1, 1.4, 0.6);
      if (sp > 0.01) {
        const spin = Math.cos(Math.min(1, (tt - shirt) / 1.2) * Math.PI * 2);
        g2.save(); g2.translate(1500, 540); g2.scale(Math.min(1, sp) * Math.max(0.08, Math.abs(spin)), Math.min(1, sp));
        const strip = ['#d52b1e', '#f4f1ea'];
        g2.beginPath(); g2.moveTo(-90, -170); g2.lineTo(-170, -110); g2.lineTo(-130, -40); g2.lineTo(-100, -60); g2.lineTo(-100, 170); g2.lineTo(100, 170); g2.lineTo(100, -60); g2.lineTo(130, -40); g2.lineTo(170, -110); g2.lineTo(90, -170); g2.quadraticCurveTo(0, -120, -90, -170); g2.closePath();
        g2.save(); g2.clip(); for (let i = -4; i < 5; i++) { g2.fillStyle = strip[(i + 10) % 2]; g2.fillRect(i * 40 - 20, -180, 40, 360); } g2.restore();
        if (spin > 0) { g2.fillStyle = '#0e2422'; g2.beginPath(); g2.roundRect(-70, -20, 140, 50, 12); g2.fill(); text(g2, 'ueno', 0, 16, { font: 'Jakarta', weight: 800, size: 34, color: TEAL, align: 'center' }); }
        g2.restore();
        caption(g2, tt, shirt + 0.4, "national team shirts", 820, { size: 28, x: 1500 });
      }
    },
  ]);
}

// ---------------------------------------------------------------- assembly
const LIGHT = {
  title: [{ type: 'sting', title: 'Toppled Giants', sub: 'Episode 3 · The Bank That Toppled a President' }],
  sub: [{ type: 'subscribe', clickWhen: 'tap subscribe', text: 'it really helps the channel' }],
  endcard: [{ type: 'subscribe', clickWhen: 'Subscribe', text: 'see you in the next story' }],
};
const lightScenes = Object.fromEntries(Object.entries(LIGHT).map(([k, v]) => [k, lightScene(v)]));
export const scenes = { c_night, c_fall, ...lightScenes, chapter1: chapterCard(1, 'The Bank in Everyone’s Pocket'), rise, ...R.scenes,
  chapter2: chapterCard(2, 'Friends in High Places'), chapter3: chapterCard(3, 'The Warnings'), chapter4: chapterCard(4, 'The Night the App Went Dark'), chapter5: chapterCard(5, 'Five Days'), chapter6: chapterCard(6, 'What We Know') };

let lightRanges = [];
export async function preload() {
  try { const tl = await (await fetch('/build/ep03-ueno/timeline.json')).json(); lightRanges = tl.scenes.filter((s) => LIGHT[s.id]).map((s) => [s.start - 0.3, s.start + s.duration + 0.3]); } catch { /* no timeline */ }
}
/** Night finish (bloom, vignette, grain) everywhere except the light title sting */
export const look = { finish: (ctx, frame) => { const T = frame / 30; if (!lightRanges.some(([a, b]) => T >= a && T < b)) nightFinish(ctx, frame); } };
export const hits = [];
export const extraHits = (timeline) => {
  const out = [...lightSounds(timeline, LIGHT)];
  const sc = (id) => timeline.scenes.find((s) => s.id === id);
  const w = (id, p) => { const s = sc(id); return s.start + when(sceneWords(s.cues), p); };
  const S = (t, kind, vol = 0.7) => out.push({ t, kind, vol });
  S(w('c_night', 'posted') + 0.4, 'tick', 0.9); S(w('c_night', 'posted') + 0.45, 'pop', 0.6);
  S(w('c_night', 'By sunrise') - 0.3, 'whoosh', 0.4);
  for (let k = 0; k < 6; k++) S(w('c_night', 'stopped working') - 0.4 + k * 0.3, 'tick', 0.35);
  S(w('c_night', 'Three million') - 0.3, 'whoosh', 0.4);
  ['could not pay', 'withdraw cash', 'use their cards'].forEach((p) => S(w('c_night', p) + 0.4, 'hit', 0.45));
  S(w('c_fall', 'out of office'), 'whoosh', 0.5); S(w('c_fall', 'under arrest'), 'tick', 0.9); S(w('c_fall', 'under arrest') + 0.05, 'hit', 0.6);
  S(w('c_fall', 'How does') - 0.1, 'whoosh', 0.6); S(w('c_fall', 'How does') + 1.8, 'boom', 0.9);
  S(sc('chapter1').start + 0.15, 'hit', 0.6);
  S(w('rise', 'renamed') + 0.3, 'pop', 0.7); S(w('rise', 'into an app') - 0.1, 'whoosh', 0.5);
  S(w('rise', 'cashback'), 'pop', 0.6); for (let k = 0; k < 5; k++) S(w('rise', 'cashback') + 0.4 + k * 0.2, 'tick', 0.35);
  S(w('rise', 'credit cards'), 'whoosh', 0.4); S(w('rise', 'national football'), 'pop', 0.6);
  out.push(...R.sounds(timeline));
  return out;
};
void stars; void mist; void flagCloth; void tower; void march;
