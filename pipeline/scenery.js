// Scenery: painterly night environments drawn in code, to the "lighthouse" detail level.
// Layered depth, rim-lit clouds, depth-scaled rain, volumetric beams, mist, bloom, wet
// reflections, crowds. Every function is a pure function of time t (seconds).

import { W, H, clamp, lerp, rand } from './engine.js';

// ---------------------------------------------------------------- noise
function hash(n) { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); }
export function noise1(x) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u); }
export function fbm(x, oct = 4) { let a = 0.5, s = 0; for (let i = 0; i < oct; i++) { s += a * noise1(x); x *= 2.03; a *= 0.5; } return s; }

const canv = new Map();
/** Reusable offscreen canvas by key */
export function buf(key, w = W, h = H) {
  let c = canv.get(key);
  if (!c || c.width !== w || c.height !== h) { c = new OffscreenCanvas(w, h); canv.set(key, c); }
  const g = c.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none'; g.clearRect(0, 0, w, h);
  return [c, g];
}

// ---------------------------------------------------------------- sky
/** Vertical sky gradient with a warm light-pollution band near the horizon */
export function sky(g, { top = '#070720', mid = '#1b1945', horizon = '#3a2d5c', glow = 'rgba(255,170,110,0.22)', hy = H * 0.72 } = {}) {
  const gr = g.createLinearGradient(0, 0, 0, hy);
  gr.addColorStop(0, top); gr.addColorStop(0.55, mid); gr.addColorStop(1, horizon);
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const lg = g.createLinearGradient(0, hy - 260, 0, hy + 40);
  lg.addColorStop(0, 'rgba(0,0,0,0)'); lg.addColorStop(1, glow);
  g.fillStyle = lg; g.fillRect(0, hy - 260, W, 300);
}
/** Stars, twinkling */
export function stars(g, t, { n = 160, seed = 3, maxY = H * 0.5, alpha = 0.8 } = {}) {
  const r = rand(seed);
  for (let i = 0; i < n; i++) { const x = r() * W, y = r() * maxY, s = r() * 1.6 + 0.3, tw = 0.5 + 0.5 * Math.sin(t * (1 + r() * 2) + r() * 6); g.fillStyle = `rgba(230,225,255,${alpha * tw * (1 - y / maxY)})`; g.fillRect(x, y, s, s); }
}
/** Moon with halo bloom */
export function moon(g, x, y, r = 46, { halo = 0.35 } = {}) {
  for (const [rr, a] of [[r * 9, halo * 0.25], [r * 4, halo * 0.5], [r * 2, halo]]) {
    const hg = g.createRadialGradient(x, y, r * 0.8, x, y, rr);
    hg.addColorStop(0, `rgba(220,215,255,${a})`); hg.addColorStop(1, 'rgba(220,215,255,0)');
    g.fillStyle = hg; g.fillRect(x - rr, y - rr, rr * 2, rr * 2);
  }
  const mg = g.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  mg.addColorStop(0, '#fbf8ff'); mg.addColorStop(1, '#d9d3f2');
  g.fillStyle = mg; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(160,150,200,0.25)';
  [[-0.3, 0.1, 0.22], [0.25, -0.2, 0.15], [0.1, 0.35, 0.12]].forEach(([a, b, c]) => { g.beginPath(); g.arc(x + a * r, y + b * r, c * r, 0, Math.PI * 2); g.fill(); });
}

/**
 * A bank of clouds, rim-lit from a light at (lx, ly). Puffs drift with t.
 * The rim comes from drawing the puffs shifted toward the light in the rim colour,
 * then the body on top; speckle texture is added inside the body.
 */
export function clouds(g, t, { y = 260, h = 200, seed = 1, n = 18, body = '#272457', shade = '#1a1840', rim = 'rgba(200,190,255,0.9)', lx = 400, ly = 150, speed = 6, alpha = 1, scale = 1, speckle = true } = {}) {
  const [c, cg] = buf(`cloud${seed}`);
  const r = rand(seed);
  // each bank is a heap of many small puffs, tallest in the middle, with a flat-ish base
  const banks = [];
  for (let i = 0; i < n; i++) {
    const bw = (180 + r() * 320) * scale, bx = ((r() * (W + 800) + t * speed * (0.6 + r() * 0.4)) % (W + 800)) - 400, by = y + (r() - 0.5) * h * 0.7;
    const puffs = [], m = 10 + Math.floor(r() * 10);
    for (let k = 0; k < m; k++) {
      const u = r(), hump = Math.sin(u * Math.PI);
      const pr = (14 + r() * 26 + hump * 38) * scale;
      puffs.push({ x: bx + (u - 0.5) * bw, y: by - hump * 55 * scale - r() * 20 * scale + pr * 0.35, r: pr });
    }
    banks.push({ puffs, base: by + 22 * scale });
  }
  const dir = (p) => { const dx = lx - p.x, dy = ly - p.y, d = Math.hypot(dx, dy) || 1; return [dx / d, dy / d]; };
  banks.forEach((bk) => {
    cg.save(); cg.beginPath(); cg.rect(-500, -500, W + 1000, bk.base + 500); cg.clip();
    // rim (offset toward the light), then body, then a darker underside
    cg.fillStyle = rim;
    bk.puffs.forEach((p) => { const [ux, uy] = dir(p); cg.beginPath(); cg.arc(p.x + ux * 3.5 * scale, p.y + uy * 3.5 * scale, p.r, 0, Math.PI * 2); cg.fill(); });
    const bg = cg.createLinearGradient(0, bk.base - 130 * scale, 0, bk.base);
    bg.addColorStop(0, body); bg.addColorStop(1, shade);
    cg.fillStyle = bg;
    bk.puffs.forEach((p) => { const [ux, uy] = dir(p); cg.beginPath(); cg.arc(p.x - ux * 1.5, p.y - uy * 1.5, p.r, 0, Math.PI * 2); cg.fill(); });
    cg.fillStyle = 'rgba(10,8,30,0.18)';
    bk.puffs.forEach((p) => { cg.beginPath(); cg.arc(p.x + 6 * scale, p.y + p.r * 0.45, p.r * 0.7, 0, Math.PI * 2); cg.fill(); });
    cg.restore();
  });
  cg.globalCompositeOperation = 'source-atop';
  const lg = cg.createRadialGradient(lx, ly, 50, lx, ly, 1000);
  lg.addColorStop(0, 'rgba(190,180,255,0.28)'); lg.addColorStop(1, 'rgba(190,180,255,0)');
  cg.fillStyle = lg; cg.fillRect(0, 0, W, H);
  if (speckle) {
    const sr = rand(seed * 7 + 1);
    cg.fillStyle = 'rgba(220,210,255,0.16)';
    for (let i = 0; i < 2600; i++) { cg.fillRect(sr() * W, y - h * 1.2 + sr() * h * 2.2, 1.5, 1.5); }
  }
  cg.globalCompositeOperation = 'source-over';
  g.save(); g.globalAlpha *= alpha; g.filter = 'blur(0.8px)'; g.drawImage(c, 0, 0); g.restore();
}

// ---------------------------------------------------------------- city
/** A skyline layer: buildings with lit windows. depth 0 (far) .. 1 (near) */
export function skyline(g, t, { base = H * 0.72, seed = 2, depth = 0.5, color = '#141233', lit = 0.25, tall = 1, minW = 40, maxW = 140, gap = 6, windowColor = [255, 200, 120], fog = 'rgba(60,50,100,0.25)', towers = [] } = {}) {
  const r = rand(seed);
  let x = -20;
  const bs = [];
  while (x < W + 20) {
    const w = minW + r() * (maxW - minW), h = (40 + r() * 160 + (r() < 0.15 ? 180 : 0)) * tall * lerp(0.6, 1.3, depth);
    bs.push({ x, w, h, roof: r() }); x += w + gap * r();
  }
  towers.forEach((tw) => bs.push(tw));
  bs.forEach((b, i) => {
    const top = base - b.h;
    g.fillStyle = color; g.fillRect(b.x, top, b.w, b.h + 400);
    if (b.roof > 0.8) { g.fillRect(b.x + b.w * 0.4, top - 30, 3, 30); if (Math.floor(t * 1.5 + i) % 2) { g.fillStyle = 'rgba(255,60,60,0.9)'; g.beginPath(); g.arc(b.x + b.w * 0.4 + 1.5, top - 32, 3, 0, Math.PI * 2); g.fill(); } }
    // windows
    const wr = rand(seed * 100 + i);
    const cs = lerp(7, 14, depth), rs = lerp(9, 18, depth);
    for (let yy = top + 10; yy < base - 8; yy += rs) for (let xx = b.x + 6; xx < b.x + b.w - 6; xx += cs) {
      const on = wr() < lit;
      if (!on) continue;
      const flick = hash(i * 31 + xx + yy + Math.floor(t * 0.3)) < 0.03 ? 0.3 : 1;
      const [cr, cg2, cb] = windowColor;
      g.fillStyle = `rgba(${cr},${cg2 - wr() * 40},${cb - wr() * 40},${(0.55 + wr() * 0.45) * flick})`;
      g.fillRect(xx, yy, cs * 0.55, rs * 0.5);
    }
  });
  // atmospheric fog over the layer (farther = more)
  const fg = g.createLinearGradient(0, base - 300, 0, base);
  fg.addColorStop(0, 'rgba(0,0,0,0)'); fg.addColorStop(1, fog);
  g.fillStyle = fg; g.fillRect(0, base - 300, W, 300);
}

// ---------------------------------------------------------------- weather
/** Rain: streaks scaled by depth (near = thick, fast, long; far = thin, slow, faint) */
export function rain(g, t, { n = 700, seed = 5, angle = 0.18, color = '200,205,255', alpha = 0.5, rect = [0, 0, W, H] } = {}) {
  const r = rand(seed);
  const [x0, y0, w, h] = rect;
  g.save(); g.beginPath(); g.rect(x0, y0, w, h); g.clip(); g.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const d = Math.pow(r(), 2.2), sp = lerp(700, 2600, d), len = lerp(10, 70, d), wd = lerp(0.6, 2.4, d);
    const px = r() * (w + 300) - 150, ph = r();
    const y = y0 + (((t * sp) / h + ph) % 1) * (h + len) - len, x = x0 + px + (y - y0) * angle;
    g.strokeStyle = `rgba(${color},${alpha * lerp(0.25, 0.9, d)})`; g.lineWidth = wd;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x - angle * len, y - len); g.stroke();
  }
  g.restore();
}
/** Splashes on a ground line */
export function splashes(g, t, { y0 = H * 0.9, y1 = H, n = 60, seed = 9, color = '210,215,255' } = {}) {
  const r = rand(seed);
  for (let i = 0; i < n; i++) {
    const x = r() * W, y = lerp(y0, y1, r()), ph = ((t * (1.5 + r())) + r()) % 1;
    if (ph > 0.35) continue;
    const k = ph / 0.35, s = lerp(0.5, 1.4, (y - y0) / (y1 - y0 || 1));
    g.strokeStyle = `rgba(${color},${0.6 * (1 - k)})`; g.lineWidth = 1.2 * s;
    g.beginPath(); g.ellipse(x, y, 10 * k * s * 2, 3 * k * s, 0, 0, Math.PI * 2); g.stroke();
  }
}
/** Soft drifting mist band */
export function mist(g, t, { y = H * 0.75, h = 160, color = '120,110,170', alpha = 0.25, speed = 10, seed = 4 } = {}) {
  const r = rand(seed);
  g.save(); g.filter = 'blur(30px)';
  for (let i = 0; i < 9; i++) {
    const x = ((r() * W * 1.4 + t * speed * (0.5 + r())) % (W * 1.4)) - W * 0.2, ww = 300 + r() * 500, hh = h * (0.5 + r() * 0.6);
    g.fillStyle = `rgba(${color},${alpha * (0.5 + r() * 0.5)})`; g.beginPath(); g.ellipse(x, y + (r() - 0.5) * h * 0.5, ww, hh / 2, 0, 0, Math.PI * 2); g.fill();
  }
  g.restore();
}

// ---------------------------------------------------------------- light
/** Volumetric cone from (x, y) toward angle a, with soft falloff and dust motes */
export function beam(g, t, x, y, a, { len = 900, spread = 0.07, color = '255,220,160', alpha = 0.35, motes = 40, seed = 6 } = {}) {
  g.save(); g.globalCompositeOperation = 'lighter';
  for (const [k, aa] of [[1, alpha * 0.45], [0.55, alpha * 0.6], [0.25, alpha]]) {
    const s = spread * k;
    const gr = g.createRadialGradient(x, y, 0, x, y, len);
    gr.addColorStop(0, `rgba(${color},${aa})`); gr.addColorStop(1, `rgba(${color},0)`);
    g.fillStyle = gr; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a - s) * len, y + Math.sin(a - s) * len); g.lineTo(x + Math.cos(a + s) * len, y + Math.sin(a + s) * len); g.closePath(); g.fill();
  }
  const r = rand(seed);
  for (let i = 0; i < motes; i++) { const d = r() * len * 0.8, off = (r() - 0.5) * spread * 1.6, drift = Math.sin(t * 0.7 + i) * 6; const px = x + Math.cos(a + off) * d + drift, py = y + Math.sin(a + off) * d; g.fillStyle = `rgba(${color},${0.5 * (1 - d / len)})`; g.fillRect(px, py, 2, 2); }
  g.restore();
}
/** A point glow (lamp, window, fire) */
export function glow(g, x, y, r, color = '255,190,120', a = 0.6) {
  g.save(); g.globalCompositeOperation = 'lighter';
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, `rgba(${color},${a})`); gr.addColorStop(0.4, `rgba(${color},${a * 0.35})`); gr.addColorStop(1, `rgba(${color},0)`);
  g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.restore();
}
/** Reflect the band [y0-h, y0] of the current frame below y0, rippled and darkened (wet ground) */
export function reflect(g, t, y0, h, { alpha = 0.45, blur = 3, ripple = 4 } = {}) {
  const [c, cg] = buf('refl', W, Math.ceil(h));
  cg.drawImage(g.canvas, 0, y0 - h, W, h, 0, 0, W, h);
  g.save(); g.globalAlpha = alpha; g.filter = `blur(${blur}px)`;
  for (let i = 0; i < h; i += 4) { const dx = Math.sin(i * 0.15 + t * 3) * ripple * (i / h); g.drawImage(c, 0, h - i - 4, W, 4, dx, y0 + i, W, 4); }
  g.restore();
}

// ---------------------------------------------------------------- finish
/** Bloom/halation + vignette + fine grain (use as look.finish) */
export function nightFinish(ctx, frame) {
  const [c, cg] = buf('bloom', W / 4, H / 4);
  cg.filter = 'brightness(0.85) contrast(2.4) blur(5px)';
  cg.drawImage(ctx.canvas, 0, 0, W / 4, H / 4);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.32; ctx.drawImage(c, 0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 1.05);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(5,3,20,0.55)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  const r = rand(Math.floor(frame / 2) * 13 + 7);
  ctx.globalAlpha = 0.07;
  for (let i = 0; i < 2600; i++) { ctx.fillStyle = r() < 0.5 ? '#fff' : '#000'; ctx.fillRect(r() * W, r() * H, 1.5, 1.5); }
  ctx.restore();
}

// ---------------------------------------------------------------- people
/** Crowd silhouettes in a band; depth 0 far .. 1 near. Arms/flags/signs sway with inertia */
export function crowd(g, t, { y = H * 0.85, n = 60, depth = 0.5, color = '#0d0b1e', seed = 8, signs = [], flags = 0, rim = 'rgba(255,150,90,0.5)', rimSide = 1 } = {}) {
  const r = rand(seed), s = lerp(0.35, 1.4, depth);
  const people = [];
  for (let i = 0; i < n; i++) people.push({ x: (i / n) * (W + 200) - 100 + (r() - 0.5) * 50, hh: (140 + r() * 60) * s, w: (0.85 + r() * 0.3), arm: r(), ph: r() * 6, sp: 1.5 + r(), hair: r() });
  people.forEach((p, i) => {
    const bob = Math.sin(t * p.sp + p.ph) * 3 * s, top = y - p.hh + bob, x = p.x, sw = 34 * s * p.w;
    g.fillStyle = color;
    // shoulders + torso
    g.beginPath(); g.moveTo(x - sw, y + 30); g.lineTo(x - sw, top + 62 * s); g.quadraticCurveTo(x - sw, top + 44 * s, x - 10 * s, top + 42 * s); g.lineTo(x + 10 * s, top + 42 * s); g.quadraticCurveTo(x + sw, top + 44 * s, x + sw, top + 62 * s); g.lineTo(x + sw, y + 30); g.closePath(); g.fill();
    g.fillRect(x - 6 * s, top + 30 * s, 12 * s, 16 * s);
    g.beginPath(); g.ellipse(x, top + 20 * s, 14 * s, 17 * s, 0, 0, Math.PI * 2); g.fill();
    if (p.hair > 0.6) { g.beginPath(); g.ellipse(x, top + 30 * s, 16 * s, 20 * s, 0, Math.PI * 0.9, Math.PI * 2.1); g.fill(); }
    if (p.hair < 0.15) { g.beginPath(); g.ellipse(x, top + 6 * s, 22 * s, 6 * s, 0, 0, Math.PI * 2); g.fill(); g.fillRect(x - 12 * s, top - 6 * s, 24 * s, 12 * s); }
    if (p.arm < 0.3) { const ang = -1.25 + Math.sin(t * 2.5 + i) * 0.22, ax = x + sw * 0.7, ay = top + 56 * s; const ex = ax + Math.cos(ang) * 45 * s, ey = ay + Math.sin(ang) * 45 * s; g.strokeStyle = color; g.lineWidth = 11 * s; g.lineCap = 'round'; g.beginPath(); g.moveTo(ax, ay); g.lineTo(ex, ey); g.lineTo(ex + Math.cos(ang - 0.4) * 40 * s, ey + Math.sin(ang - 0.4) * 40 * s); g.stroke(); g.beginPath(); g.arc(ex + Math.cos(ang - 0.4) * 44 * s, ey + Math.sin(ang - 0.4) * 44 * s, 8 * s, 0, Math.PI * 2); g.fillStyle = color; g.fill(); }
    if (rim && depth > 0.4) { g.strokeStyle = rim; g.lineWidth = 2.2 * s; g.beginPath(); g.ellipse(x, top + 20 * s, 14 * s, 17 * s, 0, rimSide > 0 ? -1.3 : 1.8, rimSide > 0 ? 1.3 : 4.4); g.stroke(); g.beginPath(); g.moveTo(rimSide > 0 ? x + sw : x - sw, top + 62 * s); g.lineTo(rimSide > 0 ? x + sw : x - sw, top + 140 * s); g.stroke(); }
  });
  signs.forEach((sg, k) => {
    const sx = sg.x, sw = sg.w * s, sh = sg.h * s, sway = Math.sin(t * 1.3 + k * 2) * 0.05, top = y - 260 * s;
    g.save(); g.translate(sx, top); g.rotate(sway);
    g.strokeStyle = '#3a2a1a'; g.lineWidth = 6 * s; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 200 * s); g.stroke();
    g.fillStyle = sg.color || '#f3efe6'; g.fillRect(-sw / 2, -sh, sw, sh);
    g.fillStyle = sg.ink || '#1d1b29'; g.font = `800 ${sg.size * s}px Jakarta`; g.textAlign = 'center';
    (sg.text || '').split('|').forEach((ln, li, arr) => g.fillText(ln, 0, -sh / 2 + (li - (arr.length - 1) / 2) * sg.size * s * 1.05 + sg.size * s * 0.35));
    g.restore();
  });
  for (let k = 0; k < flags; k++) {
    const fx = (k + 0.5) * (W / flags) + Math.sin(k * 7) * 80, top = y - 300 * s;
    flagCloth(g, t, fx, top, 150 * s, 90 * s, k);
    g.strokeStyle = '#2a2018'; g.lineWidth = 5 * s; g.beginPath(); g.moveTo(fx, top - 6); g.lineTo(fx, y - 60 * s); g.stroke();
  }
}
/** Paraguay-style tricolour flag waving (red / white / blue) as cloth strips */
export function flagCloth(g, t, x, y, w, h, seed = 0) {
  const cols = ['#d52b1e', '#f4f1ea', '#0038a8'];
  const strips = 24;
  for (let i = 0; i < strips; i++) {
    const u0 = i / strips, u1 = (i + 1) / strips;
    const wave = (u) => Math.sin(u * 6 - t * 5 + seed) * 10 * u * (h / 90);
    const shade = 0.85 + 0.15 * Math.cos(u0 * 6 - t * 5 + seed);
    cols.forEach((c, k) => {
      g.fillStyle = c; g.globalAlpha = shade;
      g.beginPath();
      g.moveTo(x + u0 * w, y + wave(u0) + (k * h) / 3); g.lineTo(x + u1 * w + 0.5, y + wave(u1) + (k * h) / 3);
      g.lineTo(x + u1 * w + 0.5, y + wave(u1) + ((k + 1) * h) / 3); g.lineTo(x + u0 * w, y + wave(u0) + ((k + 1) * h) / 3); g.closePath(); g.fill();
    });
  }
  g.globalAlpha = 1;
}
/** Fire with flickering tongues, smoke, embers and a glow */
export function fire(g, t, x, y, w, { seed = 3 } = {}) {
  glow(g, x, y - 40, w * 3.5, '255,140,60', 0.55);
  const r = rand(seed);
  // smoke
  g.save(); g.filter = 'blur(14px)';
  for (let i = 0; i < 10; i++) { const ph = ((t * 0.25 + i / 10) % 1), sx = x + Math.sin(ph * 4 + i) * 40 + ph * 120, sy = y - 80 - ph * 600; g.fillStyle = `rgba(40,30,50,${0.5 * (1 - ph)})`; g.beginPath(); g.arc(sx, sy, 40 + ph * 120, 0, Math.PI * 2); g.fill(); }
  g.restore();
  for (let k = 0; k < 3; k++) {
    const cols = ['rgba(255,90,30,0.9)', 'rgba(255,170,60,0.9)', 'rgba(255,240,180,0.95)'];
    g.fillStyle = cols[k];
    for (let i = 0; i < 9; i++) {
      const fx = x + (i / 8 - 0.5) * w * (1 - k * 0.25), fh = (60 + 90 * fbm(i * 3.1 + t * 4 + k)) * (1 - k * 0.3);
      g.beginPath(); g.moveTo(fx - 18, y); g.quadraticCurveTo(fx - 10 + Math.sin(t * 9 + i) * 8, y - fh * 0.6, fx + Math.sin(t * 7 + i * 2) * 10, y - fh); g.quadraticCurveTo(fx + 12, y - fh * 0.5, fx + 18, y); g.closePath(); g.fill();
    }
  }
  for (let i = 0; i < 30; i++) { const ph = ((t * (0.5 + r()) + r()) % 1), ex = x + (r() - 0.5) * w + Math.sin(t * 3 + i) * 20 * ph, ey = y - 40 - ph * 380; g.fillStyle = `rgba(255,${150 + r() * 80},80,${1 - ph})`; g.fillRect(ex, ey, 3, 3); }
}
