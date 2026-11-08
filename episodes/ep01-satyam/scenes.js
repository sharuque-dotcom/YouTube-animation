// Visuals for Episode 1. Each scene is draw(ctx, s):
//   s.t        seconds into the scene
//   s.d        scene length
//   s.cue(i)   when narration line i starts (0-based); s.cueEnd(i) when it ends
// Timing comes from the narration, so re-recording the voice keeps everything in sync.

import { W, H, palette as P, clamp, lerp, prog, ease, rand, text, typed } from '../../pipeline/engine.js';

// Impact sounds, placed relative to narration lines (mixed in by render.mjs)
export const hits = [
  { scene: 'letter', cue: 3, at: 1.25 }, // NON-EXISTENT stamp
  { scene: 'crash', cue: 0, at: 1.6 },   // price collapses
  { scene: 'truth', cue: 2, at: 0.9 },   // TRUTH cracks
  { scene: 'title', at: 0.15 },          // title card
];
const hitAt = (scene, s) => {
  const h = hits.find((x) => x.scene === scene);
  return (h.cue != null ? s.cue(h.cue) : 0) + (h.at || 0);
};
const shake = (ctx, t, at, power = 14) => {
  const k = prog(t, at, at + 0.45);
  if (k <= 0 || k >= 1) return;
  const a = power * (1 - k);
  ctx.translate(Math.sin(t * 90) * a, Math.cos(t * 75) * a * 0.6);
};

// ---------------------------------------------------------------- letter
function letter(ctx, s) {
  const { t } = s;
  const c = [0, 1, 2, 3].map(s.cue);
  const stampAt = hitAt('letter', s);

  // Desk lit by a lamp
  const lamp = ctx.createRadialGradient(W * 0.3, H * 0.15, 50, W * 0.4, H * 0.4, W * 0.75);
  lamp.addColorStop(0, '#3a2c1c');
  lamp.addColorStop(1, '#0a0806');
  ctx.fillStyle = lamp;
  ctx.fillRect(0, 0, W, H);

  // Camera: slow push in, then move toward the highlighted line
  const focus = ease.inOut(prog(t, c[2] - 0.3, c[2] + 1.6));
  const zoom = lerp(1, 1.12, prog(t, 0, c[2])) * lerp(1, 1.45, focus);
  shake(ctx, t, stampAt);
  ctx.translate(W / 2, H / 2);
  ctx.scale(zoom, zoom);
  ctx.translate(-W / 2, lerp(-H / 2, -H / 2 - 330, focus));

  // Paper slides up into frame
  const slide = ease.out(prog(t, 0, 1.4));
  ctx.translate(W / 2, H / 2 + lerp(700, 40, slide));
  ctx.rotate(-0.025);
  const pw = 860, ph = 1120, x0 = -pw / 2, y0 = -ph / 2;
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 60;
  ctx.shadowOffsetY = 20;
  ctx.fillStyle = P.paper;
  ctx.fillRect(x0, y0, pw, ph);
  ctx.shadowColor = 'transparent';

  const tf = { font: 'Special Elite', color: P.ink };
  text(ctx, typed('7 January 2009', prog(t, c[0] + 1.4, c[0] + 2.6)), x0 + pw - 70, y0 + 110,
    { ...tf, size: 30, align: 'right' });
  text(ctx, typed('To the Board of Directors,', prog(t, c[0] + 3.2, c[0] + 4.6)), x0 + 70, y0 + 200,
    { ...tf, size: 30 });

  // Body text shown as faint lines that appear as if being typed
  const r = rand(3);
  for (let i = 0; i < 9; i++) {
    const w = i === 8 ? 300 : 560 + r() * 160;
    const p = prog(t, c[0] + 4.6 + i * 0.55, c[0] + 5.1 + i * 0.55);
    ctx.fillStyle = 'rgba(29,26,22,0.22)';
    ctx.fillRect(x0 + 70, y0 + 260 + i * 46, w * p, 14);
  }

  // The line that matters
  const ly = y0 + 760;
  const line = 'Cash and bank balances ..... Rs. 5,361 crore';
  text(ctx, typed(line, prog(t, c[2], c[2] + 1.6)), x0 + 70, ly, { ...tf, size: 32 });
  const mark = ease.out(prog(t, c[2] + 1.8, c[2] + 2.5));
  ctx.fillStyle = 'rgba(240,200,40,0.45)';
  ctx.fillRect(x0 + 60, ly - 34, 740 * mark, 46);

  // Strike-through and stamp on "didn't exist"
  const strike = ease.out(prog(t, stampAt - 0.35, stampAt - 0.05));
  if (strike > 0) {
    ctx.strokeStyle = P.red;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x0 + 60, ly - 12);
    ctx.lineTo(x0 + 60 + 740 * strike, ly - 16);
    ctx.stroke();
  }

  const sp = prog(t, stampAt - 0.12, stampAt);
  if (sp > 0) {
    ctx.save();
    ctx.translate(x0 + pw / 2 + 20, ly + 130);
    ctx.rotate(-0.16);
    const sc = lerp(2.4, 1, ease.in(sp));
    ctx.scale(sc, sc);
    ctx.globalAlpha = lerp(0, 0.9, sp);
    ctx.strokeStyle = P.red;
    ctx.lineWidth = 8;
    ctx.strokeRect(-330, -70, 660, 140);
    text(ctx, 'NON-EXISTENT', 0, 26, { font: 'Inter', weight: 800, size: 82, color: P.red, align: 'center', spacing: 4 });
    ctx.restore();
    text(ctx, 'Rs. 5,040 crore of it', x0 + pw / 2 + 20, ly + 250,
      { font: 'Special Elite', size: 30, color: P.red, align: 'center', alpha: prog(t, stampAt + 0.6, stampAt + 1.2) });
  }
}

// ---------------------------------------------------------------- crash
function crash(ctx, s) {
  const { t } = s;
  const c = [0, 1, 2].map(s.cue);
  const fall = hitAt('crash', s);

  // Trading-screen grid
  ctx.fillStyle = '#07090b';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(120,160,170,0.07)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  shake(ctx, t, fall, 18);
  const phase2 = ease.inOut(prog(t, c[1] - 0.4, c[1] + 0.4)); // chart steps back for employees
  const chartAlpha = lerp(1, 0.18, phase2);

  // Header
  ctx.globalAlpha = chartAlpha;
  text(ctx, 'SATYAM COMPUTER SERVICES', 120, 130, { font: 'Inter', weight: 600, size: 30, color: '#9fb3b8', spacing: 3 });
  text(ctx, 'MUMBAI  ·  7 JAN 2009', 120, 172, { font: 'Inter', size: 24, color: '#5d7177', spacing: 3 });

  // Price chart: steady, then a cliff
  const r = rand(11);
  const pts = [];
  const N = 90;
  for (let i = 0; i <= N; i++) {
    const x = i / N;
    let v = 179 + Math.sin(i * 0.6) * 1.8 + (r() - 0.5) * 2.5;
    if (x > 0.55) v = lerp(179, 40, ease.out(clamp((x - 0.55) / 0.3))) + (r() - 0.5) * 3;
    pts.push([x, v]);
  }
  const reveal = lerp(0.55, 1, ease.out(prog(t, fall - 0.2, fall + 1.4)));
  const shown = prog(t, 0.2, 1.2) * 0.55 + (t > fall - 0.2 ? reveal - 0.55 : 0);
  const cx = 120, cy = 260, cw = 1680, ch = 620;
  const X = (x) => cx + x * cw;
  const Y = (v) => cy + ch - ((v - 20) / 180) * ch;
  ctx.beginPath();
  let last = pts[0];
  for (const p of pts) {
    if (p[0] > shown) break;
    ctx[p === pts[0] ? 'moveTo' : 'lineTo'](X(p[0]), Y(p[1]));
    last = p;
  }
  const red = last[0] > 0.56;
  ctx.strokeStyle = red ? P.red : '#4fd18b';
  ctx.lineWidth = 5;
  ctx.shadowColor = ctx.strokeStyle;
  ctx.shadowBlur = 20;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Price readout
  const price = last[1];
  text(ctx, `Rs. ${price.toFixed(2)}`, W - 120, 150, { font: 'Inter', weight: 800, size: 72, align: 'right', color: red ? P.red : '#e8f0f0' });
  const pct = ((price - 179) / 179) * 100;
  if (red) text(ctx, `${pct.toFixed(1)}%`, W - 120, 210, { font: 'Inter', weight: 600, size: 40, align: 'right', color: P.red });
  ctx.globalAlpha = 1;

  // 50,000 employees: 1,000 dots, each one is 50 people
  if (phase2 > 0) {
    const cols = 50, rows = 20, gap = 26;
    const gx = W / 2 - (cols * gap) / 2 + gap / 2, gy = 300;
    const rr = rand(5);
    for (let i = 0; i < cols * rows; i++) {
      const delay = rr() * 0.8;
      const a = ease.out(prog(t, c[1] - 0.2 + delay, c[1] + 0.3 + delay));
      const doubt = prog(t, c[1] + 1.2 + rr() * 1.8, c[1] + 1.6 + rr() * 1.8);
      ctx.globalAlpha = a * lerp(1, 0.35, doubt * (1 - phase2 * 0) * (i % 3 === 0 ? 1 : 0.4));
      ctx.fillStyle = doubt > 0.5 && i % 3 === 0 ? P.red : P.cream;
      ctx.beginPath();
      ctx.arc(gx + (i % cols) * gap, gy + Math.floor(i / cols) * gap, 7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    const lab = prog(t, c[1] + 0.3, c[1] + 0.9);
    text(ctx, '50,000+ EMPLOYEES', W / 2, 220, { font: 'Inter', weight: 800, size: 64, align: 'center', spacing: 6, alpha: lab * (1 - prog(t, c[2] - 0.3, c[2])) });
    text(ctx, 'each dot = 50 people', W / 2, 860, { font: 'Inter', size: 26, align: 'center', color: P.dim, alpha: lab * (1 - prog(t, c[2] - 0.3, c[2])) });
  }

  // Whole industry under suspicion
  const p3 = prog(t, c[2] - 0.2, c[2] + 0.6);
  if (p3 > 0) {
    ctx.fillStyle = `rgba(7,9,11,${0.85 * p3})`;
    ctx.fillRect(0, 0, W, H);
    text(ctx, "INDIA'S IT INDUSTRY", W / 2, H / 2 - 20, { font: 'Playfair Display', weight: 900, size: 110, align: 'center', alpha: ease.out(p3) });
    const q = ease.outBack(prog(t, s.cueEnd(2) - 1.2, s.cueEnd(2) - 0.8));
    if (q > 0) {
      ctx.save();
      ctx.translate(W / 2, H / 2 + 130);
      ctx.scale(q, q);
      text(ctx, 'WHO ELSE?', 0, 0, { font: 'Inter', weight: 800, size: 64, align: 'center', color: P.red, spacing: 10 });
      ctx.restore();
    }
  }
}

// ---------------------------------------------------------------- truth
function truth(ctx, s) {
  const { t } = s;
  const c = [0, 1, 2].map(s.cue);
  const crackAt = hitAt('truth', s);
  shake(ctx, t, crackAt, 10);

  // Lead-in question while the line starts
  const q = prog(t, c[0] + 0.1, c[0] + 0.7) * (1 - prog(t, s.cueEnd(0) - 1.0, s.cueEnd(0) - 0.6));
  text(ctx, 'The strangest part?', W / 2, H / 2, { font: 'Playfair Display', style: 'italic', weight: 400, size: 64, align: 'center', color: P.gold, alpha: q });

  // SATYAM drops in letter by letter as the name is spoken
  const word = 'SATYAM';
  const nameAt = s.cueEnd(0) - 0.75;
  const lift = ease.inOut(prog(t, c[1] - 0.2, c[1] + 0.8));
  const y = lerp(H / 2 + 40, H / 2 - 120, lift);
  ctx.font = '900 190px "Playfair Display"';
  ctx.letterSpacing = '18px';
  const total = ctx.measureText(word).width;
  let x = W / 2 - total / 2;
  for (let i = 0; i < word.length; i++) {
    const ch = word[i];
    ctx.letterSpacing = '18px';
    ctx.font = '900 190px "Playfair Display"';
    const w = ctx.measureText(ch).width;
    const p = ease.out(prog(t, nameAt + i * 0.07, nameAt + i * 0.07 + 0.45));
    text(ctx, ch, x, y - lerp(60, 0, p), { font: 'Playfair Display', weight: 900, size: 190, alpha: p, spacing: 18 });
    x += w;
  }

  // Sanskrit
  const dev = ease.out(prog(t, c[1] + 0.3, c[1] + 1.2));
  text(ctx, 'सत्यम्', W / 2, y - 230, { font: 'Noto Serif Devanagari', weight: 700, size: 92, align: 'center', color: P.gold, alpha: dev });
  text(ctx, 'SANSKRIT', W / 2, y + 70, { font: 'Inter', weight: 600, size: 26, align: 'center', color: P.dim, spacing: 12, alpha: dev * (1 - prog(t, c[2] - 0.2, c[2] + 0.2)) });

  // TRUTH, then it cracks
  const tp = ease.out(prog(t, c[2], c[2] + 0.5));
  if (tp > 0) {
    const ty = H / 2 + 230;
    const split = ease.outExpo(prog(t, crackAt, crackAt + 0.5)) * 14;
    const crack = [[W / 2 + 30, ty - 150], [W / 2 - 15, ty - 90], [W / 2 + 25, ty - 40], [W / 2 - 20, ty + 10], [W / 2 + 10, ty + 60]];
    const half = (side) => {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(side < 0 ? 0 : W, ty - 150);
      crack.forEach(([px, py]) => ctx.lineTo(px, py));
      ctx.lineTo(side < 0 ? 0 : W, ty + 60);
      ctx.closePath();
      ctx.clip();
      ctx.translate(side * split, side * split * 0.3);
      ctx.rotate(side * split * 0.0012);
      text(ctx, 'TRUTH', W / 2, ty, { font: 'Playfair Display', weight: 900, size: 170, align: 'center', color: P.red, alpha: tp, spacing: 22, shadow: 'rgba(210,58,44,0.5)' });
      ctx.restore();
    };
    half(-1);
    half(1);
  }
}

// ---------------------------------------------------------------- title
function title(ctx, s) {
  const { t, d } = s;
  ctx.fillStyle = '#0d0c0a';
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, 900);
  glow.addColorStop(0, 'rgba(201,162,74,0.16)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Each letter is a paper cut-out that falls and settles
  const words = ['PAPER', 'EMPIRES'];
  const r = rand(21);
  const out = prog(t, d - 0.6, d);
  words.forEach((word, row) => {
    ctx.font = '900 150px "Playfair Display"';
    ctx.letterSpacing = '0px';
    const widths = [...word].map((ch) => ctx.measureText(ch).width + 26);
    let x = W / 2 - widths.reduce((a, b) => a + b, 0) / 2;
    [...word].forEach((ch, i) => {
      const delay = 0.1 + (row * 5 + i) * 0.05;
      const p = ease.outBack(prog(t, delay, delay + 0.55));
      const rot = (r() - 0.5) * 0.12;
      const cx = x + widths[i] / 2, cy = H / 2 - 40 + row * 170;
      ctx.save();
      ctx.translate(cx, cy - lerp(-220, 0, p) * (1 - p));
      ctx.rotate(rot * (1 - p * 0.6));
      ctx.globalAlpha = clamp(p * 2) * (1 - out);
      ctx.fillStyle = P.paper;
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 8;
      ctx.fillRect(-widths[i] / 2 + 4, -128, widths[i] - 8, 156);
      ctx.restore();
      ctx.save();
      ctx.translate(cx, cy - lerp(-220, 0, p) * (1 - p));
      ctx.rotate(rot * (1 - p * 0.6));
      text(ctx, ch, 0, 0, { font: 'Playfair Display', weight: 900, size: 150, align: 'center', color: P.ink, alpha: clamp(p * 2) * (1 - out) });
      ctx.restore();
      x += widths[i];
    });
  });

  const sub = 'EPISODE 01  ·  THE COMPANY CALLED TRUTH';
  text(ctx, typed(sub, prog(t, 1.3, 2.6)), W / 2, H / 2 + 250, { font: 'Inter', weight: 600, size: 32, align: 'center', color: P.gold, spacing: 8, alpha: 1 - out });
}

export const scenes = { letter, crash, truth, title };
