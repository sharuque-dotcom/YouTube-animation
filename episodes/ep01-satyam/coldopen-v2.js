// Cold open, version 2: real photos, kinetic type at speech rhythm, cut on motion.
// Shots change every 2-4 s; one hero per frame; arrivals from oversize or blur; no static holds.

import { W, H, clamp, lerp, rand, text, typed } from '../../pipeline/engine.js';
import { C, backdrop, piece, paperFill, highlight, markerLine } from '../../pipeline/collage.js';
import { view, drawLand } from '../../pipeline/map.js';
import { ez, span, photo, wordTimes, kinetic, crash, impact, flash, whip, counter } from '../../pipeline/motion.js';

export const hits = [
  { scene: 'letter', cue: 3, at: 1.25 },  // NON-EXISTENT
  { scene: 'crash', cue: 0, at: 1.9 },    // the cliff
  { scene: 'crash', cue: 1, at: 0.25 },   // 50,000
  { scene: 'truth', cue: 0, at: 2.75 },   // SATYAM lands
  { scene: 'truth', cue: 2, at: 0.75 },   // TRUTH tears
  { scene: 'title', at: 0.35 },           // title lands
];
const hitAt = (s, n = 0) => {
  const h = hits.filter((x) => x.scene === s.id)[n];
  return (h.cue != null ? s.cue(h.cue) : 0) + (h.at || 0);
};
/** time a given word (by index) of narration line i is spoken */
const wordAt = (s, i, k) => wordTimes(s.line(i), s.cue(i), s.cueEnd(i))[k].at;
const ink = '#f4ecdb';

// ------------------------------------------------------------------ letter
function letterPaper(ctx, s, t) {
  // A typed letter seen through a magnifying camera
  const c = [0, 1, 2, 3].map(s.cue);
  ctx.save();
  ctx.fillStyle = paperFill(ctx, C.white);
  ctx.fillRect(-200, -200, W + 400, H + 400);
  const opener = 'It is with deep regret, and tremendous burden that I am carrying on my conscience, that I would like to bring the following facts to your notice:';
  // irregular typing rhythm across line 2
  const r = rand(4);
  const prog = clamp((t - c[1] + 0.2) / (s.cueEnd(1) - c[1] + 0.6));
  const n = Math.floor(opener.length * prog);
  const shown = opener.slice(0, n + (r() > 0.5 ? 1 : 0));
  ctx.font = "54px 'Special Elite'";
  const lines = [];
  let cur = '';
  for (const w of shown.split(' ')) {
    const tryL = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(tryL).width > 1500 && cur) { lines.push(cur); cur = w; } else cur = tryL;
  }
  if (cur) lines.push(cur);
  text(ctx, 'To the Board of Directors,', 210, 250, { font: 'Special Elite', size: 54, color: C.ink });
  lines.forEach((ln, i) => text(ctx, ln, 210, 380 + i * 86, { font: 'Special Elite', size: 54, color: C.ink }));
  // caret
  if (prog > 0 && prog < 1 && Math.floor(t * 4) % 2 === 0) {
    const last = lines[lines.length - 1] || '';
    ctx.font = "54px 'Special Elite'";
    ctx.fillStyle = C.red;
    ctx.fillRect(210 + ctx.measureText(last).width + 8, 380 + (lines.length - 1) * 86 - 44, 6, 54);
  }
  ctx.restore();
  return 380 + Math.max(0, lines.length - 1) * 86;
}

function letter(ctx, s) {
  const { t } = s;
  const c = [0, 1, 2, 3].map(s.cue);
  const stampAt = hitAt(s);
  backdrop(ctx, C.deep);
  impact(ctx, t, stampAt, 22);

  const wB = 3.2;                      // whip into shot B
  const zoomIn = s.cueEnd(0) - 1.5;    // zoom through into the letter
  const cutE = c[2] - 0.15;            // hard cut (on motion) to the ledger line

  if (t < wB + 0.13) {
    // A: a quiet morning at the first Satyam building
    const w = whip(t, wB, 0.26, -1);
    ctx.save();
    ctx.translate(w.dx, 0);
    photo(ctx, 'first', span(t, 0, 4), { zoom: [1.12, 1.2], pan: [[0.02, 0], [-0.02, 0]], blur: w.blur, darken: 0.35 });
    const ws = wordTimes(s.line(0), c[0], s.cueEnd(0));
    kinetic(ctx, t, [
      { word: 'JANUARY', at: ws[4].at }, { word: '7,', at: ws[5].at }, { word: '2009', at: ws[6].at, color: '#ff7a5c' },
    ], W / 2, H * 0.78, { size: 120, out: wB - 0.1 });
    ctx.restore();
  } else if (t < zoomIn + 0.5) {
    // B: the gleaming tech centre; push in, then zoom through into the letter
    const w = whip(t, wB, 0.26, -1);
    const zp = ez.p3In(span(t, zoomIn, 0.5));
    ctx.save();
    ctx.translate(w.dx, 0);
    ctx.translate(W / 2, H * 0.45);
    ctx.scale(1 + zp * 2.5, 1 + zp * 2.5);
    ctx.translate(-W / 2, -H * 0.45);
    photo(ctx, 'tech', span(t, wB, zoomIn - wB + 0.5), { zoom: [1.05, 1.22], pan: [[-0.03, 0.02], [0.01, 0]], blur: w.blur + zp * 30, darken: 0.3 });
    ctx.restore();
    const ws = wordTimes(s.line(0), c[0], s.cueEnd(0));
    kinetic(ctx, t, [
      { word: 'ONE', at: ws[10].at }, { word: 'OF', at: ws[11].at }, { word: "INDIA'S", at: ws[12].at },
      { word: 'BIGGEST', at: ws[13].at, color: '#ffd23f' }, { word: 'COMPANIES', at: ws[14].at },
    ], W / 2, H * 0.8, { size: 92, out: zoomIn - 0.05 });
  } else if (t < cutE) {
    // C/D: the letter, arriving already moving from below, camera magnified on the typing
    const arrive = ez.expoOut(span(t, zoomIn + 0.35, 0.6));
    const drift = span(t, zoomIn, cutE - zoomIn);
    ctx.save();
    ctx.translate(0, (1 - arrive) * H * 0.9);
    ctx.translate(W / 2, H / 2);
    ctx.rotate(lerp(-0.035, -0.015, drift));
    const z = lerp(1.32, 1.5, drift);
    ctx.scale(z, z);
    ctx.translate(-W / 2 + 180, -H / 2 + lerp(80, 200, ez.p2InOut(drift)));
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    letterPaper(ctx, s, t);
    ctx.restore();
  } else {
    // E/F: the ledger line, magnified; then the stamp
    const p = span(t, cutE, s.d - cutE);
    ctx.save();
    ctx.translate(W / 2, H / 2);
    const z = lerp(1.12, 1.0, ez.expoOut(span(t, cutE, 0.5))) + p * 0.08;
    ctx.scale(z, z);
    ctx.rotate(-0.02);
    ctx.translate(-W / 2, -H / 2);
    ctx.fillStyle = paperFill(ctx, C.white);
    ctx.fillRect(-300, -300, W + 600, H + 600);
    const label = 'Cash and bank balances';
    text(ctx, typed(label, span(t, c[2] - 0.1, 1.0)), 180, 470, { font: 'Special Elite', size: 76, color: C.ink });
    const ws = wordTimes(s.line(2), c[2], s.cueEnd(2));
    // the amount lands as "billions of rupees" is heard
    crash(ctx, t, ws[1].at + 0.1, (g) => {
      text(g, 'Rs. 5,361 crore', 0, 0, { font: 'Special Elite', size: 120, color: C.ink, align: 'center' });
    }, { x: W / 2 + 60, y: 650, from: 1.6 });
    highlight(ctx, 470, 570, 1060, 110, span(t, ws[7].at, 0.35), { alpha: 0.6 });
    // strike + stamp
    const st = span(t, stampAt - 0.3, 0.25);
    if (st > 0) markerLine(ctx, [[460, 620], [460 + 1080 * ez.expoOut(st), 612]], 1, { color: C.red, width: 12 });
    crash(ctx, t, stampAt, (g) => {
      g.rotate(-0.12);
      g.strokeStyle = C.red;
      g.lineWidth = 14;
      g.strokeRect(-470, -100, 940, 200);
      text(g, 'NON-EXISTENT', 0, 52, { font: 'Oswald', weight: 700, size: 150, color: C.red, align: 'center', spacing: 10 });
    }, { x: W / 2 + 40, y: 860, from: 3.4, len: 0.2 });
    ctx.restore();
    flash(ctx, t, stampAt, 0.4);
  }
}

// ------------------------------------------------------------------ crash
function crashScene(ctx, s) {
  const { t } = s;
  const c = [0, 1, 2].map(s.cue);
  const cliff = hitAt(s, 0), fifty = hitAt(s, 1);
  backdrop(ctx, C.deep);
  impact(ctx, t, cliff, 20);
  impact(ctx, t, fifty, 10);
  const cutH = c[1] - 0.2, cutI = c[2] - 0.15;

  if (t < cutH) {
    // G: the camera rides the share price as it falls off a cliff
    const r = rand(11);
    const pts = [];
    for (let i = 0; i <= 120; i++) {
      const k = i / 120;
      let v = 179 + Math.sin(i * 0.5) * 2 + (r() - 0.5) * 3;
      if (k > 0.5) v = lerp(179, 40, ez.expoOut(clamp((k - 0.5) / 0.28))) + (r() - 0.5) * 4;
      pts.push([k * 3600, 860 - v * 3.6]);
    }
    // tip position over time: slow drift, then plunge at the cliff
    const tip = clamp(lerp(0.12, 0.5, span(t, 0, cliff - 0.3)) + 0.5 * ez.expoOut(span(t, cliff - 0.3, 1.6)));
    const n = Math.floor(tip * 120);
    const [tx, ty] = pts[n];
    ctx.save();
    ctx.translate(W * 0.62 - tx, H * 0.5 - lerp(ty, 500, 0.35));
    ctx.strokeStyle = 'rgba(143,179,201,0.12)';
    ctx.lineWidth = 2;
    for (let x = -400; x < 4200; x += 120) { ctx.beginPath(); ctx.moveTo(x, -600); ctx.lineTo(x, 1800); ctx.stroke(); }
    for (let y = -600; y < 1800; y += 120) { ctx.beginPath(); ctx.moveTo(-400, y); ctx.lineTo(4200, y); ctx.stroke(); }
    ctx.lineWidth = 10;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = n > 60 ? C.red : '#e8dfcc';
    ctx.shadowColor = ctx.strokeStyle;
    ctx.shadowBlur = 30;
    ctx.beginPath();
    pts.slice(0, n + 1).forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
    ctx.fillStyle = ctx.strokeStyle;
    ctx.beginPath(); ctx.arc(tx, ty, 14, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    const pct = counter(t, cliff - 0.2, 1.4, 0, -78, ez.expoOut);
    if (t > cliff - 0.2) {
      crash(ctx, t, cliff + 0.05, (g) => {
        text(g, `${Math.round(pct)}%`, 0, 0, { font: 'Oswald', weight: 700, size: 300, color: C.red, align: 'center', shadow: 'rgba(0,0,0,0.6)' });
      }, { x: W * 0.3, y: H * 0.42, from: 2.6 });
      const ws = wordTimes(s.line(0), c[0], s.cueEnd(0));
      kinetic(ctx, t, [{ word: 'IN', at: ws[0].at + 1.2 }, { word: 'ONE', at: ws[0].at + 1.3 }, { word: 'DAY', at: ws[0].at + 1.4 }], W * 0.3, H * 0.42 + 120, { size: 64, out: cutH - 0.1 });
    }
  } else if (t < cutI + 0.5) {
    // H: fifty thousand people, rushing in, then a wave of doubt
    const w = whip(t, cutI, 0.3, 1);
    ctx.save();
    ctx.translate(w.dx, 0);
    photo(ctx, 'tech', span(t, cutH, 5), { zoom: [1.3, 1.4], grade: 'bw', darken: 0.6, blur: 3 + w.blur });
    const r = rand(5);
    const cols = 50, rows = 20;
    for (let i = 0; i < cols * rows; i++) {
      const tx = 160 + (i % cols) * 32.5, ty = 330 + Math.floor(i / cols) * 32;
      const sx = r() * W, sy = r() < 0.5 ? -60 : H + 60;
      const p = ez.expoOut(span(t, cutH + r() * 0.5, 0.7));
      const red = t > c[1] + 1.4 + (i % cols) * 0.03 && r() < 0.45;
      ctx.fillStyle = red ? C.red : 'rgba(244,236,219,0.9)';
      ctx.beginPath();
      ctx.arc(lerp(sx, tx, p), lerp(sy, ty, p), 9, 0, Math.PI * 2);
      ctx.fill();
    }
    crash(ctx, t, fifty, (g) => {
      text(g, '50,000', 0, 0, { font: 'Oswald', weight: 700, size: 230, color: ink, align: 'center', shadow: 'rgba(0,0,0,0.7)', shadowBlur: 40 });
    }, { x: W / 2, y: H * 0.5, from: 3 });
    const ws = wordTimes(s.line(1), c[1], s.cueEnd(1));
    kinetic(ctx, t, [{ word: 'jobs?', at: ws[ws.length - 1].at, color: '#ff7a5c' }], W / 2, H * 0.5 + 130, { size: 90, font: 'Playfair Display', weight: 900, out: cutI });
    ctx.restore();
  } else {
    // I: fly over India at night to the IT hubs, then everything turns to doubt
    const w = whip(t, cutI, 0.3, 1);
    const fly = ez.p2InOut(span(t, cutI, 3.2));
    const scale = Math.exp(lerp(Math.log(6), Math.log(17), fly));
    const proj = view(lerp(60, 78, fly), lerp(25, 19, fly), scale);
    const doubt = span(t, s.cueEnd(2) - 1.8, 0.5);
    ctx.save();
    ctx.translate(w.dx, 0);
    drawLand(ctx, proj, scale, { color: doubt > 0 ? '#3a3330' : '#22343f', sea: '#0b1820' });
    const hubs = [[77.59, 12.97], [78.49, 17.39], [73.86, 18.52], [80.27, 13.08], [72.88, 19.08], [77.03, 28.46]];
    hubs.forEach(([lon, lat], i) => {
      const [x, y] = proj([lon, lat]);
      const on = span(t, cutI + 1.2 + i * 0.18, 0.3);
      if (on <= 0) return;
      const pulse = 1 + 0.25 * Math.sin(t * 5 + i);
      const col = doubt > 0.5 ? '255,90,60' : '255,210,63';
      const g = ctx.createRadialGradient(x, y, 0, x, y, 70 * pulse);
      g.addColorStop(0, `rgba(${col},${0.9 * on})`);
      g.addColorStop(1, `rgba(${col},0)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, 70 * pulse, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(255,248,235,${on})`;
      ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill();
    });
    ctx.restore();
    const ws = wordTimes(s.line(2), c[2], s.cueEnd(2));
    kinetic(ctx, t, [{ word: 'THE', at: ws[5].at }, { word: 'PRIDE', at: ws[6].at, color: '#ffd23f' }, { word: 'OF', at: ws[7].at }, { word: 'THE', at: ws[8].at }, { word: 'NATION', at: ws[9].at }],
      W / 2, H * 0.2, { size: 84, out: s.cueEnd(2) - 2.0 });
    crash(ctx, t, ws[ws.length - 1].at + 0.05, (g) => {
      text(g, 'UNDER SUSPICION', 0, 0, { font: 'Oswald', weight: 700, size: 130, color: C.red, align: 'center', spacing: 8, shadow: 'rgba(0,0,0,0.7)' });
    }, { x: W / 2, y: H * 0.22, from: 2.4 });
  }
}

// ------------------------------------------------------------------ truth
function truth(ctx, s) {
  const { t } = s;
  const c = [0, 1, 2].map(s.cue);
  const land = hitAt(s, 0), tear = hitAt(s, 1);
  backdrop(ctx, C.deep);
  impact(ctx, t, land, 16);
  impact(ctx, t, tear, 12);
  // faint glass building behind everything, slowly turning to red
  photo(ctx, 'tech', span(t, 0, s.d), { zoom: [1.25, 1.4], grade: t > c[2] ? 'red' : 'bw', darken: 0.75, blur: 6, alpha: 0.5 });

  const ws = wordTimes(s.line(0), c[0], s.cueEnd(0));
  kinetic(ctx, t, [{ word: 'the', at: ws[0].at }, { word: 'strangest', at: ws[1].at }, { word: 'part?', at: ws[2].at }],
    W / 2, H / 2, { size: 96, font: 'Playfair Display', weight: 400, out: land - 0.45 });

  // SATYAM crashes in, swaps to सत्यम्, then lifts as TRUTH arrives
  const swap = span(t, c[1] + 0.25, 0.25);
  const lift = ez.expoOut(span(t, c[2] - 0.1, 0.45));
  const y = lerp(H / 2 + 70, H * 0.3, lift);
  if (swap < 1) {
    crash(ctx, t, land, (g) => {
      g.filter = swap > 0 ? `blur(${swap * 12}px)` : 'none';
      g.globalAlpha *= 1 - swap;
      text(g, 'SATYAM', 0, 0, { font: 'Playfair Display', weight: 900, size: 260, color: ink, align: 'center', spacing: 30, shadow: 'rgba(0,0,0,0.6)' });
    }, { x: W / 2, y, from: 3.5, len: 0.3 });
  }
  if (swap > 0) {
    const b = (1 - ez.expoOut(swap)) * 12;
    ctx.save();
    ctx.filter = b > 0.3 ? `blur(${b}px)` : 'none';
    ctx.globalAlpha = swap;
    const sz = lerp(200, 150, lift);
    text(ctx, 'सत्यम्', W / 2, y + 20, { font: 'Noto Serif Devanagari', weight: 700, size: sz, color: '#ffd23f', align: 'center', shadow: 'rgba(0,0,0,0.6)' });
    ctx.restore();
  }
  // TRUTH lands, then tears in two
  if (t > c[2] - 0.2) {
    const tp = span(t, c[2] - 0.1, 0.3);
    const split = ez.expoOut(span(t, tear, 0.6));
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.translate(W / 2 + side * split * 60, H * 0.66 + side * split * 10);
      ctx.rotate(side * split * 0.06);
      const sc = lerp(2.8, 1, ez.expoOut(tp));
      ctx.scale(sc, sc);
      ctx.beginPath();
      const r = rand(5);
      ctx.moveTo(side * 900, -200);
      for (let i = 0; i <= 12; i++) ctx.lineTo((r() - 0.5) * 50, -200 + i * 33);
      ctx.lineTo(side * 900, 200);
      ctx.closePath();
      ctx.clip();
      ctx.globalAlpha = Math.min(1, tp * 3);
      text(ctx, 'TRUTH', 0, 75, { font: 'Oswald', weight: 700, size: 230, color: C.red, align: 'center', spacing: 34, shadow: 'rgba(0,0,0,0.6)' });
      ctx.restore();
    }
  }
}

// ------------------------------------------------------------------ title
function title(ctx, s) {
  const { t, d } = s;
  backdrop(ctx, C.navy);
  const land = hitAt(s);
  impact(ctx, t, land, 14);
  const exit = ez.p3In(span(t, d - 0.45, 0.45));
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.scale(1 + exit * 3, 1 + exit * 3);
  ctx.translate(-W / 2, -H / 2);
  if (exit > 0) ctx.filter = `blur(${exit * 18}px)`;
  const r = rand(21);
  ['PAPER', 'EMPIRES'].forEach((word, row) => {
    [...word].forEach((ch, i) => {
      const at = land - 0.2 + (row * 5 + i) * 0.035;
      const rot = (r() - 0.5) * 0.1;
      crash(ctx, t, at, (g) => {
        piece(g, { x: 0, y: 0, w: 140, h: 180, color: (i + row) % 3 ? C.white : C.paper, rot, seed: 90 + row * 10 + i }, (pg) => {
          text(pg, ch, 70, 150, { font: 'Playfair Display', weight: 900, size: 150, color: C.ink, align: 'center' });
        });
      }, { x: W / 2 + (i - (word.length - 1) / 2) * 152, y: 420 + row * 200, from: 2.2, len: 0.28 });
    });
  });
  kinetic(ctx, t, ['THE', 'COMPANY', 'CALLED', 'TRUTH'].map((w, i) => ({ word: w, at: land + 0.9 + i * 0.1, color: w === 'TRUTH' ? '#ff7a5c' : undefined })),
    W / 2, 860, { size: 52, spacing: 0.12 });
  ctx.restore();
}

export const scenes = { letter, crash: crashScene, truth, title };
