// What if Travancore became its own country? Malayalam Short, native 9:16.
// Beats follow the narration lines; every cut lands on a line start (first element <= 0.35 s).
import { W, H, clamp, lerp, rand, text } from '../../pipeline/engine.js';
import { loadLand } from '../../pipeline/map.js';
import { glow, beam, rain, buf, nightFinish, sky, clouds, mist } from '../../pipeline/scenery.js';
import { ez, out3, span, spring } from '../../pipeline/scenekit.js';
import { oldMap, conch, radioRoom, thoriumBeach, harbour, palm } from './sets.js';

const GOLD = '#e8b84a', RED = '#ff4a5a', ML = "'Noto Malayalam'";
export async function preload() { await loadLand(); }

// ---------------------------------------------------------------- helpers
function cam(g, t, { z0 = 1, z1 = 1.08, dur = 6, fx = W / 2, fy = H / 2 } = {}) {
  const z = lerp(z0, z1, ez(clamp(t / dur))); g.translate(fx + Math.sin(t * 0.7) * 4, fy + Math.cos(t * 0.6) * 3); g.scale(z, z); g.translate(-fx, -fy);
}
const pulse = (t, a, up = 0.27, down = 0.33) => (t < a - up || t > a + down ? 0 : t < a ? ez((t - (a - up)) / up) : 1 - ez((t - a) / down));
function slam(g, t, a, x, y, draw, { from = 2, rot = 0 } = {}) {
  if (t < a - 0.12) return; const p = clamp((t - (a - 0.12)) / 0.12), sc = lerp(from, 1, p * p * p);
  const wob = t > a ? Math.exp(-(t - a) * 8) * Math.sin((t - a) * 34) * 0.05 : 0;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(sc + wob, sc + wob); g.globalAlpha = Math.min(1, p * 1.5); draw(g); g.restore();
}
/** an object dropping onto a surface with weight: falls, lands, settles with a small bounce and a contact shadow */
function drop(g, t, a, x, y, draw, { from = 500 } = {}) {
  if (t < a) return; const u = t - a, fall = clamp(u / 0.35), yy = y - from * (1 - fall * fall) - (u > 0.35 ? Math.exp(-(u - 0.35) * 10) * Math.abs(Math.sin((u - 0.35) * 18)) * 30 : 0);
  g.save(); g.globalAlpha = 0.5 * fall; g.fillStyle = 'rgba(0,0,0,0.6)'; g.beginPath(); g.ellipse(x, y + 120, 130 * (0.5 + fall * 0.5), 26, 0, 0, Math.PI * 2); g.fill(); g.restore();
  g.save(); g.translate(x, yy); draw(g); g.restore();
}
function dateTile(g, t, a, top, big, x = W / 2, y = 330) {
  slam(g, t, a, x, y, (gg) => { gg.shadowColor = 'rgba(0,0,0,0.6)'; gg.shadowBlur = 30; gg.fillStyle = '#efe4c8'; gg.beginPath(); gg.roundRect(-170, -120, 340, 240, 18); gg.fill(); gg.shadowColor = 'transparent';
    gg.fillStyle = '#8a1d1d'; gg.beginPath(); gg.roundRect(-170, -120, 340, 70, [18, 18, 0, 0]); gg.fill();
    text(gg, top, 0, -72, { font: "'Cormorant Garamond'", weight: 600, size: 40, color: '#fff3d8', align: 'center', spacing: 6 });
    text(gg, big, 0, 80, { font: "'Cormorant Garamond'", weight: 600, size: 120, color: '#2a1a08', align: 'center' }); });
}
function coin(g, t) {
  const sq = Math.cos(t * 1.5); g.save(); g.scale(Math.max(0.15, Math.abs(sq)), 1);
  const cg = g.createRadialGradient(-30, -30, 10, 0, 0, 120); cg.addColorStop(0, '#f6f2ea'); cg.addColorStop(0.6, '#b8b0a4'); cg.addColorStop(1, '#6a6258'); g.fillStyle = cg; g.beginPath(); g.arc(0, 0, 110, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#4a443c'; g.lineWidth = 6; g.beginPath(); g.arc(0, 0, 96, 0, Math.PI * 2); g.stroke(); if (sq > 0) conch(g, 0, 0, 0.42, { glowA: 0, color: '#d8d2c8' }); else text(g, '1 RUPEE', 0, 12, { font: "'Cormorant Garamond'", weight: 600, size: 34, color: '#3a342c', align: 'center' });
  g.restore();
}
function stamp(g) {
  g.fillStyle = '#f2ead8'; g.beginPath(); for (let i = 0; i <= 40; i++) { const u = i / 40; const side = Math.floor(u * 4), f = (u * 4) % 1, w = 150, h = 190; const pts = [[-w + 2 * w * f, -h], [w, -h + 2 * h * f], [w - 2 * w * f, h], [-w, h - 2 * h * f]][side % 4]; g.lineTo(pts[0] + Math.sin(i * 7) * 5, pts[1] + Math.cos(i * 7) * 5); } g.closePath(); g.fill();
  g.fillStyle = '#8a1d2a'; g.fillRect(-120, -160, 240, 320); conch(g, 0, -20, 0.5, { glowA: 0, color: '#f0d8a0' });
  text(g, 'ANCHAL', 0, 120, { font: "'Cormorant Garamond'", weight: 600, size: 38, color: '#f6e6c0', align: 'center', spacing: 6 });
  text(g, 'TRAVANCORE', 0, -125, { font: "'Cormorant Garamond'", weight: 600, size: 26, color: '#f6e6c0', align: 'center', spacing: 4 });
}
function badge(g) {
  const bg2 = g.createLinearGradient(-100, -120, 100, 120); bg2.addColorStop(0, '#fff0b8'); bg2.addColorStop(0.5, '#c89a3a'); bg2.addColorStop(1, '#6a4a14'); g.fillStyle = bg2;
  g.beginPath(); for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, r = i % 2 ? 90 : 130; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill(); g.strokeStyle = '#4a3410'; g.lineWidth = 4; g.stroke();
  conch(g, 0, 0, 0.36, { glowA: 0, color: '#f8e0a0' });
}
function velvet(g, t) {
  const vg = g.createRadialGradient(W / 2, 900, 50, W / 2, 900, 1100); vg.addColorStop(0, '#4a1424'); vg.addColorStop(1, '#12040a'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 30; i++) { g.strokeStyle = `rgba(0,0,0,${0.08 + (i % 3) * 0.04})`; g.lineWidth = 30; g.beginPath(); g.moveTo(i * 40 - 200, 0); g.bezierCurveTo(i * 40, 600, i * 40 - 120, 1200, i * 40 + 80, H); g.stroke(); }
  beam(g, t, W / 2, -60, Math.PI / 2, { len: 1500, spread: 0.2, color: '255,220,170', alpha: 0.25, motes: 40 });
}
function concertNight(g, t, a) {
  // the music hall after the concert: lamp-lit portico in the rain, a 1940s car, a flash of steel in the dark
  sky(g, { top: '#04050c', mid: '#0c0e1c', horizon: '#1c1a2a', hy: 900 }); clouds(g, t, { y: 260, h: 110, seed: 61, n: 7, scale: 0.6, lx: 540, ly: 700, speed: 4, alpha: 0.6 });
  g.fillStyle = '#1a1620'; g.fillRect(60, 520, 960, 700); for (let i = 0; i < 6; i++) { const x = 120 + i * 168; const cg = g.createLinearGradient(x - 26, 0, x + 26, 0); cg.addColorStop(0, '#3a3240'); cg.addColorStop(0.5, '#8a7e8e'); cg.addColorStop(1, '#2a2430'); g.fillStyle = cg; g.fillRect(x - 26, 600, 52, 560); }
  g.fillStyle = '#2a2430'; g.beginPath(); g.moveTo(40, 600); g.lineTo(540, 420); g.lineTo(1040, 600); g.closePath(); g.fill();
  text(g, 'MUSIC ACADEMY', 540, 560, { font: "'Cormorant Garamond'", weight: 600, size: 44, color: '#d8c8a0', align: 'center', spacing: 8 });
  [250, 830].forEach((x) => { glow(g, x, 720, 260, '255,190,110', 0.5); g.fillStyle = '#ffe2a8'; g.beginPath(); g.arc(x, 720, 14, 0, Math.PI * 2); g.fill(); });
  g.fillStyle = '#0e0c12'; g.fillRect(0, 1160, W, H - 1160);
  for (let k = 0; k < 18; k++) { g.fillStyle = `rgba(255,190,110,${0.15 - k * 0.007})`; g.fillRect(200 + Math.sin(t * 2 + k) * 8, 1180 + k * 20, 100, 5); g.fillRect(780 + Math.sin(t * 2.3 + k) * 8, 1180 + k * 20, 100, 5); }
  // 1940s car, open door, chrome rim-lit
  g.save(); g.translate(600, 1380); g.fillStyle = '#08070b'; g.beginPath(); g.moveTo(-380, 60); g.quadraticCurveTo(-390, -40, -300, -60); g.quadraticCurveTo(-200, -170, -60, -170); g.quadraticCurveTo(80, -170, 160, -80); g.quadraticCurveTo(360, -70, 390, 20); g.lineTo(390, 60); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(255,200,140,0.55)'; g.lineWidth = 3; g.beginPath(); g.moveTo(-300, -60); g.quadraticCurveTo(-200, -170, -60, -170); g.quadraticCurveTo(80, -170, 160, -80); g.stroke();
  g.fillStyle = '#050407'; [-230, 250].forEach((x) => { g.beginPath(); g.arc(x, 60, 66, 0, Math.PI * 2); g.fill(); });
  g.save(); g.translate(-40, -150); g.rotate(-0.5); g.fillStyle = '#0b0a0e'; g.fillRect(0, 0, 160, 190); g.strokeStyle = 'rgba(255,200,140,0.4)'; g.strokeRect(0, 0, 160, 190); g.restore(); g.restore();
  // the flash of steel: builds over ~8 frames, decays over ~10 (no gore, no figures)
  const f = pulse(t, a); if (f > 0) { g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = `rgba(230,240,255,${f})`; g.lineWidth = 6; g.shadowColor = '#cfe0ff'; g.shadowBlur = 40; g.beginPath(); g.moveTo(420, 1120); g.lineTo(700, 980); g.stroke(); g.restore(); glow(g, 560, 1050, 500, '200,220,255', 0.5 * f); }
  rain(g, t, { n: 600, alpha: 0.4 });
}
function futures(g, t, a) {
  // split screen: top a gleaming city-state, bottom a shuttered port; the seam glows
  const sp = ez(span(t, a - 0.2, 0.7));
  g.save(); g.beginPath(); g.rect(0, 0, W, H / 2); g.clip(); g.translate(0, -360 * (1 - sp) * 0); harbour(g, t); g.restore();
  g.save(); g.beginPath(); g.rect(0, H / 2, W, H / 2); g.clip(); g.translate(0, 300);
  sky(g, { top: '#2a2a32', mid: '#4a4a52', horizon: '#6a6a70', hy: 980 }); rain(g, t, { n: 400, alpha: 0.35 });
  g.fillStyle = '#2a2a30'; for (let i = 0; i < 7; i++) { g.fillRect(i * 160, 760 - (i % 3) * 60, 140, 400); g.fillStyle = '#3a3a40'; for (let k = 0; k < 6; k++) g.fillRect(i * 160 + 10, 780 - (i % 3) * 60 + k * 50, 120, 8); g.fillStyle = '#2a2a30'; }
  g.fillStyle = '#1a1a20'; g.fillRect(0, 1160, W, 400); g.fillStyle = 'rgba(160,80,40,0.6)'; g.fillRect(380, 1040, 260, 120); text(g, 'CLOSED', 510, 1118, { font: 'Jakarta', weight: 800, size: 46, color: '#2a1a10', align: 'center' });
  g.restore();
  g.fillStyle = GOLD; g.fillRect(0, H / 2 - 3, W, 6); glow(g, W / 2, H / 2, 600, '232,184,74', 0.3);
  slam(g, t, a, W / 2, 300, (gg) => tag(gg, 'സിംഗപ്പൂർ?', 64, '#0a2a1a', '#7dffb0'));
  slam(g, t, a + 2.2, W / 2, H / 2 + 300, (gg) => tag(gg, 'അതോ…?', 64, '#2a0a0a', '#ffb3be'));
}
function tag(g, str, size, fill, color) { g.font = `800 ${size}px ${ML}`; const w = g.measureText(str).width + 80; g.fillStyle = fill; g.globalAlpha *= 0.9; g.beginPath(); g.roundRect(-w / 2, -size, w, size * 1.9, size); g.fill(); g.globalAlpha = 1; text(g, str, 0, size * 0.32, { font: ML, weight: 800, size, color, align: 'center' }); }
function yearCounter(g, t, a) { const y = Math.round(lerp(1947, 2026, ez(span(t, a, 2.2)))); g.save(); g.shadowColor = 'rgba(232,184,74,0.8)'; g.shadowBlur = 40; text(g, String(y), W / 2, 420, { font: "'Cormorant Garamond'", weight: 600, size: 200, color: '#fff0c8', align: 'center' }); g.restore(); }

// ---------------------------------------------------------------- captions: big Malayalam word chunks
function captions(g, s) {
  const t = s.t; let li = -1; for (let i = 0; s.line(i); i++) if (t >= s.cue(i) - 0.05 && t < s.cueEnd(i) + 0.1) li = i; if (li < 0) return;
  const words = s.line(li).split(/\s+/), a = s.cue(li), b = s.cueEnd(li), tot = words.reduce((x, w) => x + w.length + 1.5, 0); let acc = 0; const ws = words.map((w) => { const t0 = a + (acc / tot) * (b - a); acc += w.length + 1.5; return [w, t0]; });
  const chunks = []; for (let i = 0; i < ws.length; i += 2) chunks.push(ws.slice(i, i + 2)); let k = 0; while (k + 1 < chunks.length && t >= chunks[k + 1][0][1]) k++;
  const str = chunks[k].map(([w]) => w).join(' '), p = clamp((t - chunks[k][0][1]) / 0.12);
  g.save(); g.translate(W / 2, 1560); g.scale(lerp(0.85, 1, out3(p)), lerp(0.85, 1, out3(p))); g.font = `800 72px ${ML}`; const sz = Math.min(72, 72 * 960 / (g.measureText(str).width + 1));
  g.font = `800 ${sz}px ${ML}`; g.lineJoin = 'round'; g.strokeStyle = 'rgba(0,0,0,0.8)'; g.lineWidth = sz * 0.16; g.textAlign = 'center'; g.strokeText(str, 0, 0);
  text(g, str, 0, 0, { font: ML, weight: 800, size: sz, color: '#fff6dc', align: 'center' }); g.restore();
}

// ---------------------------------------------------------------- beats
function main(g, s) {
  const t = s.t, L = (i) => s.cue(i);
  const cuts = [1, 2, 3, 4, 5, 6, 7, 8].map(L); let i = 0; while (i < cuts.length && t >= cuts[i] - 0.02) i++;
  const since = i ? t - cuts[i - 1] : t, punch = 1 + 0.07 * Math.exp(-since * 8);
  g.save(); g.translate(W / 2, H / 2); g.scale(punch, punch); g.translate(-W / 2, -H / 2);
  [
    () => { cam(g, t, { z0: 1.15, z1: 1.0, dur: 5, fy: 900 }); oldMap(g, t, { glowP: ez(span(t, 0.2, 1)) }); slam(g, t, 0.25, 540, 760, (gg) => conch(gg, 0, 0, 1.2), { from: 2.6 }); },
    () => { cam(g, t - L(1), { z0: 1.0, z1: 1.12, dur: 6, fy: 1000 }); radioRoom(g, t, { on: ez(span(t, L(1) + 0.3, 0.5)) }); dateTile(g, t, L(1) + 0.15, 'JUNE', '18', 820, 300); },
    () => { velvet(g, t); drop(g, t, L(2) + 0.0, 250, 900, (gg) => coin(gg, t)); drop(g, t, L(2) + 0.5, 560, 820, (gg) => stamp(gg)); drop(g, t, L(2) + 1.0, 860, 920, (gg) => badge(gg));
      [[250, 'നാണയം'], [560, 'സ്റ്റാമ്പ്'], [860, 'സൈന്യം']].forEach(([x, w], k) => { const p = span(t, L(2) + 0.4 + k * 0.5, 0.3); if (p > 0) text(g, w, x, 1180, { font: ML, weight: 800, size: 46, color: GOLD, align: 'center', alpha: p }); }); },
    () => { cam(g, t - L(3), { z0: 1.0, z1: 1.1, dur: 6, fy: 1300 }); thoriumBeach(g, t, { atom: ez(span(t, L(3) + 0.8, 0.6)) }); },
    () => { cam(g, t - L(4), { z0: 1.0, z1: 1.1, dur: 8, fy: 1100 }); concertNight(g, t, L(4) + (s.cueEnd(4) - L(4)) * 0.75); dateTile(g, t, L(4) + 0.15, 'JULY', '25', 540, 260); },
    () => { cam(g, t - L(5), { z0: 1.0, z1: 1.06, dur: 4, fy: 900 }); oldMap(g, t, { glowP: 1 - ez(span(t, L(5) + 0.6, 1.6)) }); const p = span(t, L(5) + 1.4, 0.5); if (p > 0) text(g, 'JULY 1947 · JOINS INDIA', W / 2, 1360, { font: "'Cormorant Garamond'", weight: 600, size: 56, color: '#3a2408', align: 'center', alpha: p, spacing: 4 }); },
    () => { cam(g, t - L(6), { z0: 1.2, z1: 1.0, dur: 3, fy: 900 }); harbour(g, t); g.fillStyle = `rgba(10,8,20,${0.5 * (1 - span(t, L(6), 2.4))})`; g.fillRect(0, 0, W, H); yearCounter(g, t, L(6) + 0.1); },
    () => { cam(g, t - L(7), { z0: 1.0, z1: 1.1, dur: 8, fy: 1000 }); harbour(g, t); slam(g, t, L(7) + 0.1, 540, 1150, (gg) => { gg.rotate(-0.08); gg.strokeStyle = '#8a1d2a'; gg.lineWidth = 10; gg.beginPath(); gg.arc(0, 0, 150, 0, Math.PI * 2); gg.stroke(); conch(gg, 0, -10, 0.4, { glowA: 0, color: '#c03040' }); text(gg, 'ENTRY · 2026', 0, 110, { font: "'Cormorant Garamond'", weight: 600, size: 30, color: '#8a1d2a', align: 'center' }); }, { from: 2.4 }); },
    () => { futures(g, t, L(8) + 0.1); },
  ][Math.min(i, 8)]();
  g.restore();
  const f = Math.max(...cuts.map((c) => pulse(t, c))); if (f > 0) { g.fillStyle = `rgba(255,248,230,${0.28 * f})`; g.fillRect(0, 0, W, H); }
  captions(g, s);
}
function end(g, s) {
  const t = s.t; cam(g, t, { z0: 1.1, z1: 1.0, dur: 5 });
  sky(g, { top: '#2a1a40', mid: '#8a4a5a', horizon: '#ffb07a', hy: 1400 }); glow(g, W / 2, 1300, 900, '255,180,110', 0.5);
  palm(g, t, 120, 1700, 1.0, { h: 760, lean: 60 }); palm(g, t, 980, 1750, 1.2, { h: 800, lean: -80, ph: 1 });
  // the conch flag, big, rippling
  g.save(); g.translate(260, 520); g.fillStyle = '#d8d0c0'; g.fillRect(-5, -40, 10, 700); g.beginPath(); for (let i = 0; i <= 24; i++) { const u = i / 24; g.lineTo(u * 560, Math.sin(t * 3 - u * 5) * 26 * u); } for (let i = 24; i >= 0; i--) { const u = i / 24; g.lineTo(u * 560, 340 + Math.sin(t * 3 - u * 5) * 26 * u); } g.closePath();
  const fg = g.createLinearGradient(0, 0, 560, 0); fg.addColorStop(0, '#8a1a26'); fg.addColorStop(1, '#c43a40'); g.fillStyle = fg; g.fill(); conch(g, 280, 170 + Math.sin(t * 3 - 2.5) * 13, 0.75, { glowA: 0.2 }); g.restore();
  g.setTransform(1, 0, 0, 1, 0, 0);
  slam(g, t, 0.2, W / 2, 1180, (gg) => tag(gg, 'ഭാഗം 2', 80, 'rgba(20,10,30,0.85)', '#ffd27a'));
  const tap = 1.2, pr = t > tap + 0.4 && t < tap + 0.6 ? 0.92 : 1;
  slam(g, t, tap, W / 2, 1360, (gg) => { gg.scale(pr, pr); gg.fillStyle = t > tap + 0.55 ? '#3a3350' : '#ff2f45'; gg.beginPath(); gg.roundRect(-240, -64, 480, 128, 64); gg.fill(); text(gg, t > tap + 0.55 ? 'FOLLOWING ✓' : 'FOLLOW', 0, 18, { font: 'Jakarta', weight: 800, size: 52, color: '#fff', align: 'center' }); });
  captions(g, s);
}

export const scenes = { main, end };
export const look = { finish: (ctx, frame) => nightFinish(ctx, frame) };
export const hits = [];
export const extraHits = (timeline) => {
  const m = timeline.scenes.find((x) => x.id === 'main'), e = timeline.scenes.find((x) => x.id === 'end'), out = [];
  m.cues.forEach((c, i) => { if (i) out.push({ t: m.start + c.start - 0.25, kind: 'whoosh', vol: 0.35 }); });
  out.push({ t: m.start + 0.25, kind: 'hit', vol: 0.7 });
  [0, 0.5, 1.0].forEach((d) => out.push({ t: m.start + m.cues[2].start + d + 0.35, kind: 'pop', vol: 0.6 }));
  out.push({ t: m.start + m.cues[4].start + (m.cues[4].end - m.cues[4].start) * 0.75, kind: 'hit', vol: 0.8 });
  out.push({ t: m.start + m.cues[7].start + 0.1, kind: 'hit', vol: 0.6 }, { t: e.start + 1.6, kind: 'pop', vol: 0.6 });
  return out;
};
void mist; void buf; void rand;
