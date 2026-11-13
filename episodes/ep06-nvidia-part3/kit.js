// Episode 6 kit: motion helpers and night set pieces carried over from the episode-5 toolkit
// (camera, varied transitions, panels, stamps, case board, doorstep, org chart, etc).
import { W, H, clamp, lerp, rand, text } from '../../pipeline/engine.js';
import { sky, stars, moon, clouds, skyline, rain, mist, beam, glow, reflect, buf } from '../../pipeline/scenery.js';
import { ez, out3, span, spring, pill } from '../../pipeline/scenekit.js';
import { boardroom } from '../ep05-nvidia-part2/sets.js';
export const INK = '#f3efff', LAV = '#b9a2ff', RED = '#ff5c6e', GOLD = '#ffc93c', TEAL = '#3ee0b5', NV = '#76b900';
export const D = { theme: 'dark' };

// ---------------------------------------------------------------- motion helpers
/** Camera: slow push toward a focus point, plus a subtle handheld drift */
export function cam(g, t, { z0 = 1, z1 = 1.08, dur = 8, fx = W / 2, fy = H / 2, drift = 1, pan = [0, 0] } = {}) {
  const k = ez(clamp(t / dur)), z = lerp(z0, z1, k);
  const dx = drift * (Math.sin(t * 0.7) * 6 + Math.sin(t * 1.9) * 2) + pan[0] * k, dy = drift * (Math.cos(t * 0.6) * 4 + Math.sin(t * 2.3) * 1.5) + pan[1] * k;
  g.translate(fx + dx, fy + dy); g.scale(z, z); g.translate(-fx, -fy);
}
/** Shots with varied transitions. kinds[i] is the transition INTO shot i+1 */
export function shots(g, t, cuts, draws, kinds = []) {
  let i = 0; while (i < cuts.length && t >= cuts[i]) i++;
  const since = i ? t - cuts[i - 1] : 99, kind = kinds[i - 1] || 'fade', XF = kind === 'flash' ? 0.35 : 0.55;
  const drawI = (gg, k) => { gg.save(); draws[k](gg, t); gg.restore(); };
  if (since >= XF) { drawI(g, i); return; }
  const p = ez(since / XF);
  const [a, ag] = buf('x5a'); drawI(ag, i - 1);
  const [b, bg] = buf('x5b'); drawI(bg, i);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  if (kind === 'push') { g.drawImage(a, -p * W * 0.35, 0); g.globalAlpha = p; g.drawImage(b, (1 - p) * W * 0.35, 0); }
  else if (kind === 'blur') { g.filter = `blur(${(p * 14).toFixed(1)}px)`; g.drawImage(a, 0, 0); g.filter = `blur(${((1 - p) * 14).toFixed(1)}px)`; g.globalAlpha = p; g.drawImage(b, 0, 0); g.filter = 'none'; }
  else if (kind === 'flash') { g.drawImage(p < 0.5 ? a : b, 0, 0); g.globalAlpha = Math.sin(p * Math.PI) * 0.9; g.fillStyle = '#fff6e8'; g.fillRect(0, 0, W, H); }
  else { g.drawImage(a, 0, 0); g.globalAlpha = p; g.drawImage(b, 0, 0); }
  g.restore();
}
export function nightBG(g, t, { seed = 0, horizon = '#2d2552', rainA = 0, moonAt = null } = {}) {
  sky(g, { top: '#06061c', mid: '#15133b', horizon, hy: 980 }); stars(g, t, { n: 80, maxY: 500, alpha: 0.5, seed: seed + 2 });
  if (moonAt) moon(g, moonAt[0], moonAt[1], 38);
  clouds(g, t + seed, { y: 180, h: 110, seed: 700 + seed, n: 8, scale: 0.6, lx: moonAt ? moonAt[0] : 1500, ly: moonAt ? moonAt[1] : 90, speed: 6, alpha: 0.8 });
  skyline(g, t, { base: 1000, seed: 800 + seed, depth: 0.2, color: '#1b1840', lit: 0.12, tall: 0.7, fog: 'rgba(80,65,125,0.5)' });
  if (rainA) rain(g, t, { n: 380, alpha: rainA });
}
export function panel(g, x, y, w, h, r = 26) { g.save(); g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 40; g.fillStyle = 'rgba(22,16,48,0.92)'; g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); g.restore(); g.strokeStyle = 'rgba(185,162,255,0.35)'; g.lineWidth = 2; g.beginPath(); g.roundRect(x, y, w, h, r); g.stroke(); }
export function counter(g, t, a, dur, to, fmt, x, y, { size = 110, color = INK } = {}) { text(g, fmt(to * out3(span(t, a, dur))), x, y, { font: 'Jakarta', weight: 800, size, color, align: 'center', alpha: span(t, a - 0.1, 0.2) }); }
export function stamp(g, t, a, str, x, y, { color = RED, rot = -0.1, size = 64 } = {}) {
  const sp = clamp((t - (a - 0.09)) / 0.09); if (sp <= 0) return;
  const b = t > a ? Math.exp(-(t - a) * 9) * Math.sin((t - a) * 40) * 0.04 : 0;
  g.save(); g.translate(x, y); g.rotate(rot); const sc = lerp(2.4, 1, sp * sp * sp) + b; g.scale(sc, sc); g.globalAlpha = 0.95 * sp;
  g.font = `800 ${size}px Jakarta`; const w = g.measureText(str).width + size;
  g.strokeStyle = color; g.lineWidth = size * 0.1; g.beginPath(); g.roundRect(-w / 2, -size * 0.75, w, size * 1.5, size * 0.2); g.stroke();
  text(g, str, 0, size * 0.36, { font: 'Jakarta', weight: 800, size, color, align: 'center', spacing: size * 0.05 }); g.restore();
}
/** Standing faceless silhouette, rim-lit */
export function standing(g, x, y, s, { rim = 'rgba(255,210,160,0.6)', side = 1, a = 1, jacketed = false } = {}) {
  if (a <= 0.01) return;
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(s, s);
  g.fillStyle = jacketed ? '#0b0a10' : '#07060f';
  g.beginPath(); g.ellipse(0, -330, 42, 52, 0, 0, Math.PI * 2); g.fill(); g.fillRect(-16, -285, 32, 26);
  g.beginPath(); g.moveTo(-105, -40); g.lineTo(-112, -200); g.quadraticCurveTo(-108, -258, -36, -264); g.lineTo(36, -264); g.quadraticCurveTo(108, -258, 112, -200); g.lineTo(105, -40); g.closePath(); g.fill();
  g.fillRect(-70, -50, 58, 52); g.fillRect(12, -50, 58, 52);
  g.strokeStyle = rim; g.lineWidth = 3.5; g.beginPath(); g.ellipse(0, -330, 42, 52, 0, side > 0 ? -1.4 : 1.8, side > 0 ? 0.7 : 3.9); g.stroke();
  g.beginPath(); if (side > 0) { g.moveTo(36, -264); g.quadraticCurveTo(108, -258, 112, -200); g.lineTo(105, -40); } else { g.moveTo(-36, -264); g.quadraticCurveTo(-108, -258, -112, -200); g.lineTo(-105, -40); } g.stroke();
  g.restore();
}
export function calendarPage(g, t, a, top, big, x, y, { s = 1 } = {}) {
  const p = spring(t, a, 1.8, 0.6); if (p <= 0.01) return;
  g.save(); g.translate(x, y); g.scale(Math.min(1, p) * s, Math.min(1, p) * s); g.rotate(-0.04);
  g.fillStyle = '#f7f1e6'; g.beginPath(); g.roundRect(-150, -170, 300, 340, 22); g.fill();
  g.fillStyle = '#d52b1e'; g.beginPath(); g.roundRect(-150, -170, 300, 90, [22, 22, 0, 0]); g.fill();
  text(g, top, 0, -110, { font: 'Jakarta', weight: 800, size: 38, color: '#fff', align: 'center', spacing: 4 });
  text(g, big, 0, 90, { font: 'Jakarta', weight: 800, size: 170, color: '#1d1b29', align: 'center' });
  g.restore();
}

// ---------------------------------------------------------------- set pieces new to this episode
/** The HQ tower at night in the rain, one floor still lit (with silhouettes inside) */
export function towerNight(g, t) {
  nightBG(g, t, { seed: 1, moonAt: [1550, 170], horizon: '#2a2150' });
  skyline(g, t, { base: 1040, seed: 811, depth: 0.55, color: '#110e26', lit: 0.18, minW: 120, maxW: 240, tall: 1.2, fog: 'rgba(60,50,100,0.35)' });
  const x0 = 640, x1 = 1280, top = 90, base = 1080, floors = 26, fh = (base - top) / floors;
  const fg = g.createLinearGradient(x0, 0, x1, 0); fg.addColorStop(0, '#1a1840'); fg.addColorStop(1, '#0f0d2a'); g.fillStyle = fg; g.fillRect(x0, top, x1 - x0, base - top);
  const litF = 7;
  for (let f = 0; f < floors; f++) {
    const y = top + f * fh;
    if (f === litF) {
      const lg = g.createLinearGradient(0, y, 0, y + fh); lg.addColorStop(0, '#ffd9a0'); lg.addColorStop(1, '#e09a5a'); g.fillStyle = lg; g.fillRect(x0 + 10, y + 4, x1 - x0 - 20, fh - 8);
      for (let k = 0; k < 9; k++) { const sx = x0 + 70 + k * 62 + Math.sin(t * 0.6 + k) * 3; g.fillStyle = 'rgba(30,18,20,0.85)'; g.beginPath(); g.arc(sx, y + fh * 0.45, 7, 0, Math.PI * 2); g.fill(); g.fillRect(sx - 10, y + fh * 0.55, 20, fh * 0.4); }
      glow(g, (x0 + x1) / 2, y + fh / 2, 520, '255,200,130', 0.35 + 0.05 * Math.sin(t * 3));
    } else for (let c = 0; c < 16; c++) { g.fillStyle = 'rgba(40,36,80,0.65)'; g.fillRect(x0 + 14 + c * 39, y + 5, 30, fh - 10); }
  }
  g.fillStyle = 'rgba(210,200,255,0.55)'; g.fillRect(x1 - 2, top, 3, base - top);
  mist(g, t, { y: 980, h: 160, alpha: 0.25 });
  rain(g, t, { n: 700, alpha: 0.4 });
}
/** Cork case board under a lamp, items pinned in turn, red string drawing between them */
export function caseBoard(g, t, items) {
  g.fillStyle = '#0c0a18'; g.fillRect(0, 0, W, H);
  const bx = 160, by = 110, bw = 1600, bh = 820;
  const cg = g.createLinearGradient(bx, by, bx + bw, by + bh); cg.addColorStop(0, '#5a4030'); cg.addColorStop(1, '#3a281e'); g.fillStyle = cg; g.fillRect(bx, by, bw, bh);
  const r = rand(7); for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '255,220,180' : '20,10,5'},0.08)`; g.fillRect(bx + r() * bw, by + r() * bh, 3, 3); }
  g.strokeStyle = '#2a1c14'; g.lineWidth = 16; g.strokeRect(bx, by, bw, bh);
  beam(g, t, 960, -60, Math.PI / 2, { len: 1000, spread: 0.5, color: '255,210,150', alpha: 0.2, motes: 50 });
  // pinned items + string
  const placed = items.filter((it) => t > it.at);
  g.save(); g.strokeStyle = '#d03030'; g.lineWidth = 3; g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 4;
  for (let k = 1; k < placed.length; k++) { const a = placed[k - 1], b = placed[k], p = ez(span(t, b.at + 0.2, 0.7)); g.beginPath(); g.moveTo(a.x, a.y - a.h / 2 + 10); g.quadraticCurveTo((a.x + b.x) / 2, Math.max(a.y, b.y) - 40, lerp(a.x, b.x, p), lerp(a.y - a.h / 2 + 10, b.y - b.h / 2 + 10, p)); g.stroke(); }
  g.restore();
  items.forEach((it) => {
    const p = spring(t, it.at, 1.6, 0.6); if (p <= 0.01) return;
    g.save(); g.translate(it.x, it.y - (1 - Math.min(1, p)) * 60); g.rotate(it.rot || 0); g.scale(lerp(1.2, 1, Math.min(1, p)), lerp(1.2, 1, Math.min(1, p)));
    g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 20; g.shadowOffsetY = 10; g.fillStyle = '#f3efe6'; g.fillRect(-it.w / 2, -it.h / 2, it.w, it.h); g.shadowColor = 'transparent';
    it.draw(g, it.w, it.h, t);
    g.fillStyle = '#d03030'; g.beginPath(); g.arc(0, -it.h / 2 + 10, 9, 0, Math.PI * 2); g.fill();
    g.restore();
  });
  glow(g, 960, 300, 900, '255,200,140', 0.12);
}
/** A newspaper slaps onto a wet doorstep under a porch light */
export function doorstep(g, t, a) {
  g.fillStyle = '#0a0816'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#2a1e30'; g.fillRect(560, 60, 800, 700); g.fillStyle = '#3a2840'; g.fillRect(620, 120, 680, 640);
  g.fillStyle = '#1a1220'; g.fillRect(860, 220, 200, 540); g.fillStyle = '#c9a24a'; g.beginPath(); g.arc(1030, 500, 10, 0, Math.PI * 2); g.fill();
  glow(g, 960, 120, 260, '255,200,130', 0.8); g.fillStyle = '#ffe0a8'; g.beginPath(); g.arc(960, 120, 18, 0, Math.PI * 2); g.fill();
  beam(g, t, 960, 130, Math.PI / 2, { len: 900, spread: 0.45, color: '255,205,150', alpha: 0.22, motes: 60 });
  g.fillStyle = '#3a3040'; g.fillRect(420, 760, 1080, 50); g.fillStyle = '#2e2636'; g.fillRect(360, 810, 1200, 60); g.fillStyle = '#211b2a'; g.fillRect(300, 870, 1320, 210);
  // the newspaper lands, bounces, slides
  const fp = clamp((t - a) / 0.5), land = t > a + 0.5;
  let nx = lerp(-200, 940, ez(fp)), ny = lerp(300, 790, fp * fp), rot = lerp(-2, 0.08, fp);
  if (land) { const b = t - a - 0.5; ny = 790 - Math.abs(Math.sin(b * 12)) * 30 * Math.exp(-b * 6); nx += Math.min(1, b * 3) * 30; }
  g.save(); g.translate(nx, ny); g.rotate(rot); g.fillStyle = '#e8e2d6'; g.fillRect(-170, -40, 340, 80); g.fillStyle = '#1d1b29'; g.fillRect(-150, -26, 200, 14); g.fillStyle = '#b8b2a6'; for (let i = 0; i < 3; i++) g.fillRect(-150, -2 + i * 12, 300 - i * 40, 6); g.restore();
  if (land) { const b = t - a - 0.5; for (let i = 0; i < 14; i++) { const ang = (i / 14) * Math.PI * 2, d = b * 260; if (b < 0.6) { g.fillStyle = `rgba(200,210,255,${0.7 * (1 - b / 0.6)})`; g.fillRect(940 + Math.cos(ang) * d, 820 + Math.sin(ang) * d * 0.3 - b * 80, 4, 4); } } }
  reflect(g, t, 870, 200, { alpha: 0.35 });
  rain(g, t, { n: 600, alpha: 0.45 });
}
/** Org chart glowing in the dark; the CEO → VP line turns red */
export function orgChart(g, t, a) {
  g.fillStyle = '#07061a'; g.fillRect(0, 0, W, H);
  const r = rand(4); for (let i = 0; i < 120; i++) { g.fillStyle = `rgba(185,162,255,${0.08 + r() * 0.12})`; g.fillRect(r() * W, r() * H, 2, 2); }
  const box = (x, y, w, lab, sub, hot, p) => { if (p <= 0.01) return; g.save(); g.translate(x, y); g.scale(Math.min(1, p), Math.min(1, p)); g.shadowColor = hot ? 'rgba(255,90,110,0.8)' : 'rgba(150,130,255,0.5)'; g.shadowBlur = 30; g.fillStyle = hot ? 'rgba(80,20,40,0.95)' : 'rgba(30,24,64,0.95)'; g.beginPath(); g.roundRect(-w / 2, -50, w, 100, 18); g.fill(); g.shadowColor = 'transparent'; g.strokeStyle = hot ? RED : 'rgba(185,162,255,0.6)'; g.lineWidth = 3; g.stroke(); text(g, lab, 0, -2, { font: 'Jakarta', weight: 800, size: 30, color: INK, align: 'center' }); text(g, sub, 0, 32, { font: 'Inter', weight: 600, size: 20, color: hot ? '#ffb3be' : LAV, align: 'center' }); g.restore(); };
  box(960, 200, 360, 'CEO', 'Jensen Huang', false, spring(t, 0.15, 1.6, 0.65));
  const vps = ['VP · Healthcare', 'EVP · Finance', 'SVP · Engineering', 'VP · Sales', 'SVP · Research'];
  vps.forEach((v, k) => {
    const x = 240 + k * 360, y = 520, p = spring(t, 0.4 + k * 0.1, 1.6, 0.65);
    const hot = k === 0 && t > a;
    g.strokeStyle = hot ? RED : 'rgba(185,162,255,0.35)'; g.lineWidth = hot ? 6 : 3;
    if (hot) { g.save(); g.shadowColor = 'rgba(255,90,110,0.9)'; g.shadowBlur = 18; }
    const lp = hot ? ez(span(t, a, 0.8)) : Math.min(1, p);
    g.beginPath(); g.moveTo(960, 250); g.lineTo(960, 360); g.lineTo(lerp(960, x, lp), 360); if (lp > 0.99) g.lineTo(x, 470); g.stroke();
    if (hot) g.restore();
    box(x, y, 300, k === 0 ? 'Kimberly Powell' : v.split(' · ')[1], k === 0 ? 'senior executive · health care' : v.split(' · ')[0], hot, p);
  });
  if (t > a + 0.8) { const pp = spring(t, a + 0.8, 1.8, 0.6); g.save(); g.translate(240, 700); g.scale(Math.min(1, pp), Math.min(1, pp)); panel(g, -230, -36, 460, 72, 36); text(g, 'reported directly to him', 0, 10, { font: 'Inter', weight: 600, size: 26, color: '#ffb3be', align: 'center' }); g.restore(); }
}
/** Five silhouettes step into pools of light */
export function fiveSources(g, t, a) {
  g.fillStyle = '#05040f'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#0c0a1c'; g.fillRect(0, 880, W, 200);
  for (let k = 0; k < 5; k++) {
    const x = 300 + k * 330, on = span(t, a + k * 0.35, 0.5);
    beam(g, t, x, -40, Math.PI / 2, { len: 1000, spread: 0.13, color: '255,225,190', alpha: 0.28 * on, motes: 20, seed: k });
    g.save(); g.globalCompositeOperation = 'lighter'; const pg = g.createRadialGradient(x, 900, 5, x, 900, 180); pg.addColorStop(0, `rgba(255,225,190,${0.4 * on})`); pg.addColorStop(1, 'rgba(255,225,190,0)'); g.fillStyle = pg; g.beginPath(); g.ellipse(x, 900, 190, 40, 0, 0, Math.PI * 2); g.fill(); g.restore();
    standing(g, x + (1 - on) * 60, 900, 0.85, { a: on, side: k < 2 ? 1 : -1 });
  }
  text(g, '5 former employees', W / 2, 140, { font: 'Jakarta', weight: 800, size: 54, color: INK, align: 'center', alpha: span(t, a + 1.8, 0.5) });
}
/** The company rulebook under a lamp; the conflict-of-interest page lights up, a red flag rises */
export function rulebook(g, t, a) {
  g.fillStyle = '#0b0918'; g.fillRect(0, 0, W, H);
  const dg = g.createRadialGradient(900, 700, 50, 900, 700, 900); dg.addColorStop(0, '#4a3240'); dg.addColorStop(1, '#120c18'); g.fillStyle = dg; g.fillRect(0, 380, W, 700);
  beam(g, t, 620, -40, 1.2, { len: 1100, spread: 0.3, color: '255,210,150', alpha: 0.22, motes: 50 });
  g.save(); g.translate(900, 680); g.transform(1, 0, -0.25, 0.6, 0, 0);
  g.fillStyle = '#e8e0d0'; g.fillRect(-520, -340, 500, 680); g.fillRect(20, -340, 500, 680); g.fillStyle = '#c9c0ac'; g.fillRect(-20, -340, 40, 680);
  g.fillStyle = '#bdb4a2'; for (let i = 0; i < 14; i++) { g.fillRect(-480, -290 + i * 44, 420 - (i % 3) * 60, 12); }
  const hp = ez(span(t, a, 0.8));
  text(g, 'CONFLICTS OF', 270, -250, { font: "'Playfair Display'", weight: 900, size: 46, color: '#1d1b29', align: 'center' }); text(g, 'INTEREST', 270, -196, { font: "'Playfair Display'", weight: 900, size: 46, color: '#1d1b29', align: 'center' });
  g.fillStyle = 'rgba(255,201,60,0.6)'; g.fillRect(60, -120, 420 * hp, 90);
  g.fillStyle = '#bdb4a2'; for (let i = 0; i < 9; i++) g.fillRect(60, -110 + i * 44 + (i > 1 ? 60 : 0), 400 - (i % 3) * 60, 12);
  text(g, 'Relationships with a direct report', 70, -60, { font: 'Inter', weight: 600, size: 26, color: '#1d1b29' });
  g.restore();
  const fp = out3(span(t, a + 0.8, 1));
  if (fp > 0) { g.save(); g.translate(1540, 900); g.strokeStyle = '#ddd'; g.lineWidth = 8; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -460 * fp); g.stroke(); g.translate(0, -460 * fp); const w = Math.sin(t * 6) * 10; g.fillStyle = '#e2412e'; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(110, -20 + w, 220, 10 + w); g.lineTo(220, 130 + w); g.quadraticCurveTo(110, 100 + w, 0, 120); g.closePath(); g.fill(); glow(g, 100, 60, 240, '255,80,90', 0.3); g.restore(); }
}
/** Overhead: eleven seats around the table, ten turn "independent", the vote meter */
export function seatMap(g, t, b) {
  g.fillStyle = '#06051a'; g.fillRect(0, 0, W, H);
  glow(g, 960, 520, 700, '255,200,140', 0.15);
  g.fillStyle = '#2a1f30'; g.beginPath(); g.ellipse(960, 520, 520, 220, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(255,210,170,0.3)'; g.lineWidth = 3; g.stroke();
  const ind = b('independent');
  for (let k = 0; k < 11; k++) {
    const ang = (k / 11) * Math.PI * 2 - Math.PI / 2, x = 960 + Math.cos(ang) * 640, y = 520 + Math.sin(ang) * 300, p = spring(t, 0.1 + k * 0.06, 2, 0.6);
    const ceo = k === 0, on = !ceo && t > ind + k * 0.08;
    g.save(); g.translate(x, y); g.scale(Math.min(1, p), Math.min(1, p));
    g.fillStyle = ceo ? '#3a2d55' : on ? 'rgba(62,224,181,0.9)' : '#2a2448'; g.beginPath(); g.arc(0, 0, 44, 0, Math.PI * 2); g.fill();
    if (on || ceo) glow(g, 0, 0, 90, ceo ? '185,162,255' : '62,224,181', 0.35);
    text(g, ceo ? 'CEO' : String(k), 0, 10, { font: 'Jakarta', weight: 800, size: ceo ? 24 : 28, color: ceo ? INK : on ? '#0c2a24' : LAV, align: 'center' });
    g.restore();
  }
  if (t > ind + 1) pill(g, t, ind + 1, '10 independent directors', 960, { theme: 'dark', x: 960 });
  const mj = b('majority');
  if (t > mj) { panel(g, 760, 440, 400, 160); text(g, 'TO REMOVE HIM', 960, 492, { font: 'Jakarta', weight: 700, size: 22, color: LAV, align: 'center', spacing: 3 }); text(g, '6 of 11', 960, 570, { font: 'Jakarta', weight: 800, size: 64, color: INK, align: 'center' }); }
}
/** Case files slide onto the table; a magnifier sweeps across them */
export function caseFiles(g, t) {
  g.fillStyle = '#0b0918'; g.fillRect(0, 0, W, H);
  const dg = g.createRadialGradient(960, 620, 40, 960, 620, 900); dg.addColorStop(0, '#3a2b3a'); dg.addColorStop(1, '#100b16'); g.fillStyle = dg; g.fillRect(0, 0, W, H);
  beam(g, t, 960, -40, Math.PI / 2, { len: 1000, spread: 0.35, color: '255,210,150', alpha: 0.22, motes: 50 });
  [['WACHTELL LIPTON', 0.2, -0.1], ['FORMER FEDERAL PROSECUTOR', 0.9, 0.06], ['INVESTIGATION · NVIDIA BOARD', 1.6, -0.03]].forEach(([lab, a0, r], k) => {
    const p = ez(span(t, a0, 0.7)); if (p <= 0) return;
    g.save(); g.translate(lerp(-400, 600 + k * 340, p), 560 + k * 40); g.rotate(r);
    g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 24; g.fillStyle = '#e8c47f'; g.fillRect(-230, -150, 460, 300); g.shadowColor = 'transparent';
    g.fillStyle = '#f7f1e6'; g.fillRect(-200, -120, 400, 240); text(g, lab, 0, -60, { font: 'Jakarta', weight: 800, size: 24, color: '#1d1b29', align: 'center' });
    g.fillStyle = '#d9d0c0'; for (let i = 0; i < 5; i++) g.fillRect(-170, -20 + i * 28, 340 - (i % 2) * 80, 9);
    g.restore();
  });
  const mx = 500 + ((t * 220) % 1100), my = 600 + Math.sin(t * 1.3) * 80;
  g.strokeStyle = '#e8e3f5'; g.lineWidth = 12; g.fillStyle = 'rgba(217,204,255,0.12)'; g.beginPath(); g.arc(mx, my, 80, 0, Math.PI * 2); g.fill(); g.stroke(); g.lineWidth = 22; g.lineCap = 'round'; g.beginPath(); g.moveTo(mx + 56, my + 56); g.lineTo(mx + 120, my + 120); g.stroke();
}
/** Empty name plates slide along the boardroom table: who's next? */
export function namePlates(g, t, b) {
  boardroom(g, t + 2, { jacketLit: 1 });
  g.fillStyle = 'rgba(6,5,16,0.45)'; g.fillRect(0, 0, W, H);
  const kr = b('Colette Kress') ?? 1e9;
  for (let k = 0; k < 3; k++) {
    const p = ez(span(t, 0.2 + k * 0.4, 0.9)); if (p <= 0) continue;
    const x = lerp(-300, 560 + k * 400, p), y = 860;
    const flip = k === 1 && t > kr ? clamp((t - kr) / 0.4) : 0;
    g.save(); g.translate(x, y); g.scale(1, Math.abs(Math.cos(flip * Math.PI)) || 0.02);
    g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 20; g.fillStyle = '#e9e2d2'; g.beginPath(); g.moveTo(-170, -60); g.lineTo(170, -60); g.lineTo(190, 50); g.lineTo(-190, 50); g.closePath(); g.fill(); g.shadowColor = 'transparent';
    text(g, flip > 0.5 ? 'INTERIM?' : '?', 0, 14, { font: 'Jakarta', weight: 800, size: flip > 0.5 ? 46 : 64, color: flip > 0.5 ? '#b5482e' : '#3a3156', align: 'center' });
    g.restore();
  }
}
/** A share chart falls off a cliff */
export function chartCliff(g, t, b) {
  g.fillStyle = '#06051a'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 6; i++) { g.strokeStyle = 'rgba(185,162,255,0.08)'; g.lineWidth = 2; g.beginPath(); g.moveTo(120, 220 + i * 120); g.lineTo(1800, 220 + i * 120); g.stroke(); }
  const week = b('seven percent'), after = b('after-hours');
  const pts = []; const r = rand(3);
  for (let i = 0; i <= 120; i++) { const u = i / 120; let v = 0.25 + (r() - 0.5) * 0.03; if (u > 0.3) v += (u - 0.3) * 0.25 * clamp((t - week + 0.5) / 1.5); if (u > 0.82) v += (u - 0.82) * 1.6 * clamp((t - after + 0.3) / 1.2); pts.push([140 + u * 1640, 200 + v * 900]); }
  const shown = Math.floor(lerp(40, 120, clamp(t / Math.max(2, after - 0.2 + 1.2))));
  g.save(); g.shadowColor = 'rgba(255,80,100,0.8)'; g.shadowBlur = 16; g.strokeStyle = RED; g.lineWidth = 7; g.lineJoin = 'round'; g.beginPath(); pts.slice(0, shown + 1).forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); g.restore();
  const [ex, ey] = pts[shown]; glow(g, ex, ey, 80, '255,80,100', 0.8);
  if (t > week) { panel(g, 220, 120, 360, 120); counter(g, t, week, 1, 7, (v) => `−${v.toFixed(0)}%`, 400, 200, { size: 64, color: RED }); text(g, 'the week', 400, 236, { font: 'Inter', weight: 600, size: 20, color: LAV, align: 'center' }); }
  if (t > after) { panel(g, 1340, 640, 400, 130); counter(g, t, after, 1, 8.4, (v) => `−${v.toFixed(1)}%`, 1540, 722, { size: 64, color: RED }); text(g, 'after hours, Wednesday', 1540, 756, { font: 'Inter', weight: 600, size: 20, color: LAV, align: 'center' }); }
  text(g, 'NVDA', 160, 110, { font: 'Jakarta', weight: 800, size: 40, color: NV });
}
/** Banknotes blowing away into the rain over the city; −$600 billion */
export function cashStorm(g, t, a) {
  nightBG(g, t, { seed: 6, rainA: 0.35, horizon: '#2a2048' });
  const r = rand(11);
  for (let i = 0; i < 120; i++) { const born = r() * 6, ph = ((t - born) * (0.15 + r() * 0.15) + r()) % 1; const x = -100 + ph * (W + 200) + Math.sin(t * 2 + i) * 30, y = 200 + r() * 700 + Math.sin(t * 1.5 + i) * 60 - ph * 200; const s = 0.6 + r() * 0.8; g.save(); g.translate(x, y); g.rotate(t * (r() - 0.5) * 4 + i); g.scale(s, s * Math.abs(Math.cos(t * 3 + i))); g.fillStyle = '#9ad1a8'; g.fillRect(-26, -13, 52, 26); g.fillStyle = '#4f8f62'; g.fillRect(-8, -8, 16, 16); g.restore(); }
  panel(g, 560, 380, 800, 220);
  counter(g, t, a, 2, 600, (v) => `−$${Math.round(v)} billion`, 960, 520, { size: 92, color: RED });
  text(g, 'since the investigation began, if the drop holds', 960, 570, { font: 'Inter', weight: 600, size: 22, color: LAV, align: 'center', alpha: span(t, a + 1.5, 0.5) });
}
/** House and Senate seat maps flipping colour */
export function hemicycles(g, t, a) {
  nightBG(g, t, { seed: 9 });
  g.fillStyle = 'rgba(6,5,16,0.4)'; g.fillRect(0, 0, W, H);
  [[560, 'HOUSE', 18, 0], [1360, 'SENATE', 10, 0.6]].forEach(([cx, lab, rows, d0]) => {
    let n = 0;
    for (let r = 0; r < 6; r++) { const R = 120 + r * 40, cnt = 10 + r * 4; for (let k = 0; k < cnt; k++) { const ang = Math.PI + (k / (cnt - 1)) * Math.PI, x = cx + Math.cos(ang) * R, y = 700 + Math.sin(ang) * R; const flip = t > a + d0 + (k / cnt) * 0.9 && (n % 9 < 5); g.fillStyle = flip ? '#3a7bff' : (n % 9 < 5 ? '#e2412e' : '#3a7bff'); g.beginPath(); g.arc(x, y, 11, 0, Math.PI * 2); g.fill(); n++; } }
    text(g, lab, cx, 770, { font: 'Jakarta', weight: 800, size: 34, color: INK, align: 'center', spacing: 4 });
    if (t > a + d0 + 1) text(g, 'DEMOCRATS', cx, 830, { font: 'Jakarta', weight: 800, size: 26, color: '#7aa8ff', align: 'center', alpha: span(t, a + d0 + 1, 0.4) });
  });
  pill(g, t, a + 0.3, 'after the midterms: both houses flip', 120, D);
}
/** Treasury vs Commerce: two buildings with crackling energy between them */
export function twoBuildings(g, t) {
  nightBG(g, t, { seed: 10, moonAt: [960, 160] });
  const bld = (cx, lab) => { g.fillStyle = '#c6bfdd'; g.fillRect(cx - 280, 560, 560, 360); g.beginPath(); g.moveTo(cx - 300, 560); g.lineTo(cx, 470); g.lineTo(cx + 300, 560); g.closePath(); g.fill(); for (let i = 0; i < 9; i++) { g.fillStyle = 'rgba(70,60,110,0.35)'; g.fillRect(cx - 250 + i * 62, 590, 16, 320); } for (let i = 0; i < 8; i++) if (rand(cx + i)() < 0.6) { g.fillStyle = 'rgba(255,214,150,0.8)'; g.fillRect(cx - 226 + i * 62, 700, 22, 60); } text(g, lab, cx, 545, { font: 'Jakarta', weight: 800, size: 30, color: '#2a2448', align: 'center', spacing: 3 }); };
  bld(420, 'TREASURY'); bld(1500, 'COMMERCE');
  g.fillStyle = '#0c0a1a'; g.fillRect(0, 920, W, 160);
  // crackling arcs
  const r = rand(Math.floor(t * 14));
  for (let k = 0; k < 3; k++) { g.save(); g.shadowColor = 'rgba(255,200,80,0.9)'; g.shadowBlur = 16; g.strokeStyle = k ? 'rgba(255,220,140,0.6)' : '#fff2c8'; g.lineWidth = k ? 2 : 4; g.beginPath(); g.moveTo(700, 700); for (let i = 1; i <= 12; i++) { const u = i / 12; g.lineTo(lerp(700, 1220, u), 700 + (i < 12 ? (r() - 0.5) * 160 * Math.sin(u * Math.PI) : 0)); } g.stroke(); g.restore(); }
  glow(g, 960, 700, 300, '255,210,120', 0.3 + 0.2 * Math.sin(t * 20));
  pill(g, t, 0.6, 'over Megaspeed, according to reports', 1010, D);
}
/** A phone line to the White House: "no idea" */
export function whiteHouse(g, t, a) {
  nightBG(g, t, { seed: 12, moonAt: [1600, 160] });
  const cx = 1300; g.fillStyle = '#d9d4ea'; g.fillRect(cx - 360, 600, 720, 300); g.fillRect(cx - 140, 520, 280, 90); g.beginPath(); g.moveTo(cx - 160, 520); g.lineTo(cx, 450); g.lineTo(cx + 160, 520); g.closePath(); g.fill();
  for (let i = 0; i < 8; i++) { g.fillStyle = 'rgba(80,70,120,0.35)'; g.fillRect(cx - 120 + i * 34, 540, 12, 360); }
  for (let i = 0; i < 10; i++) if (rand(i + 70)() < 0.6) { g.fillStyle = 'rgba(255,214,150,0.8)'; g.fillRect(cx - 330 + i * 70, 700, 26, 70); }
  glow(g, cx, 700, 600, '220,215,255', 0.15);
  g.fillStyle = '#0c0a1a'; g.fillRect(0, 900, W, 180);
  // phone → line → bubble
  g.save(); g.translate(380, 640); g.rotate(-0.2); g.fillStyle = '#0a0812'; g.beginPath(); g.roundRect(-70, -140, 140, 280, 24); g.fill(); g.fillStyle = '#3b2a7a'; g.beginPath(); g.roundRect(-60, -128, 120, 256, 18); g.fill(); g.restore(); glow(g, 380, 640, 160, '150,130,255', 0.35);
  const lp = ez(span(t, 0.3, 1.2));
  g.save(); g.setLineDash([6, 14]); g.strokeStyle = 'rgba(185,162,255,0.8)'; g.lineWidth = 4; g.beginPath(); for (let i = 0; i <= 40 * lp; i++) { const u = i / 40; const x = lerp(460, cx - 200, u), y = 600 - Math.sin(u * Math.PI) * 220; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); g.restore();
  const bp = spring(t, a, 1.8, 0.55); if (bp > 0.01) { g.save(); g.translate(cx - 60, 330); g.scale(Math.min(1.05, bp), Math.min(1.05, bp)); g.fillStyle = '#fff'; g.strokeStyle = '#231a33'; g.lineWidth = 5; g.beginPath(); g.roundRect(-210, -60, 420, 120, 60); g.fill(); g.stroke(); text(g, '“no idea”', 0, 18, { font: 'Jakarta', weight: 800, size: 52, color: '#231a33', align: 'center' }); g.restore(); }
  pill(g, t, 0.5, 'Huang told him he didn’t know, Trump said', 1010, D);
}
export function chapterCard(num, title) {
  return (g, s) => {
    const t = s.t;
    g.save(); cam(g, t, { z0: 1.0, z1: 1.05, dur: 3 });
    nightBG(g, t + 20, { seed: 20 + num, rainA: 0.25 });
    g.restore();
    const p = spring(t, 0.1, 1.4, 0.7);
    g.save(); g.translate(W / 2, 470); g.scale(lerp(0.8, 1, Math.min(1, p)), lerp(0.8, 1, Math.min(1, p))); g.globalAlpha = Math.min(1, p);
    text(g, String(num).padStart(2, '0'), 0, 40, { font: 'Jakarta', weight: 800, size: 220, color: 'rgba(185,162,255,0.22)', align: 'center' });
    g.restore();
    pill(g, t, 0.3, `Chapter ${num}`, 560, { size: 28, theme: 'dark' });
    const tp = span(t, 0.5, 0.6);
    text(g, title, W / 2, 700 + (1 - out3(tp)) * 40, { font: 'Jakarta', weight: 700, size: 96, color: INK, align: 'center', alpha: tp });
  };
}
