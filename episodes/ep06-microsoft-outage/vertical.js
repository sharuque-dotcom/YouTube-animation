// Episode 6 Shorts: native 9:16 (1080x1920). Full-bleed night scenery, set pieces re-framed for vertical,
// big native numbers and word-chunk captions. Zones: header 120-360, picture 380-1360, captions 1400-1580,
// bottom 1640+ kept clear of the YouTube UI (scenery only).
import { W, H, clamp, lerp, rand, text, withSize } from '../../pipeline/engine.js';
import { loadLand } from '../../pipeline/map.js';
import { sky, stars, moon, clouds, skyline, rain, mist, beam, glow, reflect, buf, nightFinish } from '../../pipeline/scenery.js';
import { ez, out3, span, spring, at } from '../../pipeline/scenekit.js';
import { serverHall, beforeBell } from './sets.js';
import { darkMap } from '../ep04-deepfake/night.js';

const INK = '#f3efff', LAV = '#b9a2ff', RED = '#ff5c6e', GOLD = '#ffc93c', GREEN = '#7dffb0';

// ---------------------------------------------------------------- motion
function cam(g, t, { z0 = 1, z1 = 1.06, dur = 8, fx = W / 2, fy = H / 2 } = {}) {
  const z = lerp(z0, z1, ez(clamp(t / dur)));
  const dx = Math.sin(t * 0.7) * 5 + Math.sin(t * 1.9) * 2, dy = Math.cos(t * 0.6) * 4;
  g.translate(fx + dx, fy + dy); g.scale(z, z); g.translate(-fx, -fy);
}
function shots(g, t, cuts, draws, kinds = []) {
  let i = 0; while (i < cuts.length && t >= cuts[i]) i++;
  const since = i ? t - cuts[i - 1] : 99, kind = kinds[i - 1] || 'fade', XF = kind === 'flash' ? 0.35 : 0.5;
  const drawI = (gg, k) => { gg.save(); draws[k](gg, t); gg.restore(); };
  if (since >= XF) { drawI(g, i); return; }
  const p = ez(since / XF);
  const [a, ag] = buf('v6a'); drawI(ag, i - 1);
  const [b, bg] = buf('v6b'); drawI(bg, i);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  if (kind === 'push') { g.drawImage(a, 0, -p * H * 0.25); g.globalAlpha = p; g.drawImage(b, 0, (1 - p) * H * 0.25); }
  else if (kind === 'blur') { g.filter = `blur(${(p * 14).toFixed(1)}px)`; g.drawImage(a, 0, 0); g.filter = `blur(${((1 - p) * 14).toFixed(1)}px)`; g.globalAlpha = p; g.drawImage(b, 0, 0); g.filter = 'none'; }
  else if (kind === 'flash') { g.drawImage(p < 0.5 ? a : b, 0, 0); g.globalAlpha = Math.sin(p * Math.PI) * 0.9; g.fillStyle = '#eaf2ff'; g.fillRect(0, 0, W, H); }
  else { g.drawImage(a, 0, 0); g.globalAlpha = p; g.drawImage(b, 0, 0); }
  g.restore();
}

/** Draw a 16:9 set piece (as designed for the episode) and frame part of it in the vertical canvas.
 *  win = [x, y, w, h] in 1920x1080 design space; dst = [x, y, w, h] on the vertical canvas; edges feathered. */
function embed(g, draw, win, dst, { feather = 140 } = {}) {
  const [c, cg] = buf('v6embed', 1920, 1080);
  withSize(1920, 1080, () => { cg.save(); draw(cg); cg.restore(); });
  const [m, mg] = buf('v6mask', Math.ceil(dst[2]), Math.ceil(dst[3]));
  mg.drawImage(c, win[0], win[1], win[2], win[3], 0, 0, dst[2], dst[3]);
  mg.globalCompositeOperation = 'destination-in';
  const fy = mg.createLinearGradient(0, 0, 0, dst[3]); const f = feather / dst[3];
  fy.addColorStop(0, 'rgba(0,0,0,0)'); fy.addColorStop(f, 'rgba(0,0,0,1)'); fy.addColorStop(1 - f, 'rgba(0,0,0,1)'); fy.addColorStop(1, 'rgba(0,0,0,0)');
  mg.fillStyle = fy; mg.fillRect(0, 0, dst[2], dst[3]);
  g.drawImage(m, dst[0], dst[1]);
}

// ---------------------------------------------------------------- backgrounds and type
function nightV(g, t, { seed = 0, rainA = 0.3, horizon = '#2d2552', moonAt = [820, 330] } = {}) {
  sky(g, { top: '#06061c', mid: '#15133b', horizon, hy: 1750 }); stars(g, t, { n: 120, maxY: 900, alpha: 0.5, seed: seed + 2 });
  if (moonAt) moon(g, moonAt[0], moonAt[1], 34);
  clouds(g, t + seed, { y: 420, h: 110, seed: 700 + seed, n: 6, scale: 0.55, lx: moonAt ? moonAt[0] : 800, ly: moonAt ? moonAt[1] : 300, speed: 6, alpha: 0.75 });
  skyline(g, t, { base: 1780, seed: 950 + seed, depth: 0.25, color: '#1b1840', lit: 0.14, tall: 1.2, fog: 'rgba(80,65,125,0.5)' });
  g.fillStyle = '#0b0a1a'; g.fillRect(0, 1780, W, H - 1780);
  reflect(g, t, 1780, 140, { alpha: 0.25 });
  if (rainA) rain(g, t, { n: 420, alpha: rainA });
}
function panel(g, x, y, w, h, r = 30) { g.save(); g.shadowColor = 'rgba(0,0,0,0.55)'; g.shadowBlur = 40; g.fillStyle = 'rgba(22,16,48,0.9)'; g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); g.restore(); g.strokeStyle = 'rgba(185,162,255,0.38)'; g.lineWidth = 2.5; g.beginPath(); g.roundRect(x, y, w, h, r); g.stroke(); }
function tag(g, t, a, str, y, { size = 34, fill = 'rgba(20,14,44,0.85)', color = INK } = {}) {
  const p = spring(t, a, 1.8, 0.65); if (p <= 0.01) return;
  g.save(); g.font = `700 ${size}px Jakarta`; const w = g.measureText(str).width + 56;
  g.translate(W / 2, y); g.scale(Math.min(1.04, p), Math.min(1.04, p)); g.globalAlpha = Math.min(1, p);
  g.fillStyle = fill; g.beginPath(); g.roundRect(-w / 2, -size * 0.95, w, size * 1.9, size * 0.95); g.fill();
  text(g, str, 0, size * 0.36, { font: 'Jakarta', weight: 700, size, color, align: 'center' }); g.restore();
}
function big(g, t, a, str, y, { size = 150, color = INK } = {}) { const p = spring(t, a, 1.6, 0.6); if (p <= 0.01) return; g.save(); g.translate(W / 2, y); g.scale(Math.min(1, p), Math.min(1, p)); g.globalAlpha = Math.min(1, p); g.shadowColor = color === INK ? 'rgba(0,0,0,0.6)' : color; g.shadowBlur = 30; text(g, str, 0, 0, { font: 'Jakarta', weight: 800, size, color, align: 'center' }); g.restore(); }
function stamp(g, t, a, str, x, y, { color = RED, rot = -0.1, size = 70 } = {}) {
  const sp = clamp((t - (a - 0.09)) / 0.09); if (sp <= 0) return;
  const b = t > a ? Math.exp(-(t - a) * 9) * Math.sin((t - a) * 40) * 0.04 : 0;
  g.save(); g.translate(x, y); g.rotate(rot); const sc = lerp(2.4, 1, sp * sp * sp) + b; g.scale(sc, sc); g.globalAlpha = 0.95 * sp;
  g.font = `800 ${size}px Jakarta`; const w = g.measureText(str).width + size;
  g.strokeStyle = color; g.lineWidth = size * 0.1; g.beginPath(); g.roundRect(-w / 2, -size * 0.75, w, size * 1.5, size * 0.2); g.stroke();
  text(g, str, 0, size * 0.36, { font: 'Jakarta', weight: 800, size, color, align: 'center' }); g.restore();
}
function envelope(g, x, y, s, { a = 1 } = {}) { g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(s, s); g.fillStyle = '#f3efe6'; g.fillRect(-40, -26, 80, 52); g.strokeStyle = '#b8a9d8'; g.lineWidth = 3; g.beginPath(); g.moveTo(-40, -26); g.lineTo(0, 6); g.lineTo(40, -26); g.stroke(); g.restore(); }

/** Header: channel name + the Short's hook, always on screen */
function header(g, t, hook) {
  const hg = g.createLinearGradient(0, 0, 0, 420); hg.addColorStop(0, 'rgba(4,3,16,0.85)'); hg.addColorStop(1, 'rgba(4,3,16,0)'); g.fillStyle = hg; g.fillRect(0, 0, W, 420);
  text(g, 'TOPPLED GIANTS', W / 2, 150, { font: 'Jakarta', weight: 700, size: 30, color: LAV, align: 'center', spacing: 8, alpha: 0.9 });
  const lines = hook.split('\n'), p = out3(span(t, 0, 0.5));
  lines.forEach((l, i) => text(g, l, W / 2, 240 + i * 82 + (1 - p) * 20, { font: 'Jakarta', weight: 800, size: 72, color: i === lines.length - 1 ? GOLD : INK, align: 'center', alpha: p }));
}
/** Big word-chunk captions from the narration, popping in on each chunk */
function captions(g, s) {
  const t = s.t; let line = -1;
  for (let i = 0; s.line(i); i++) if (t >= s.cue(i) && t < s.cueEnd(i) + 0.15) line = i;
  if (line < 0) return;
  const words = s.line(line).split(/\s+/), a = s.cue(line), b = s.cueEnd(line);
  const total = words.reduce((x, w) => x + w.length + 1.5, 0); let acc = 0; const chunks = [];
  for (let i = 0; i < words.length; i += 3) { const gw = words.slice(i, i + 3), n = gw.reduce((x, w) => x + w.length + 1.5, 0); chunks.push([a + (acc / total) * (b - a), gw.join(' ')]); acc += n; }
  let k = 0; while (k + 1 < chunks.length && t >= chunks[k + 1][0]) k++;
  const [c0, str] = chunks[k], p = clamp((t - c0) / 0.12);
  g.save(); g.translate(W / 2, 1500); const sc = lerp(0.86, 1, out3(p)); g.scale(sc, sc);
  g.font = '800 76px Jakarta'; const w = Math.min(980, g.measureText(str).width + 60);
  g.fillStyle = 'rgba(8,6,24,0.72)'; g.beginPath(); g.roundRect(-w / 2, -70, w, 110, 26); g.fill();
  text(g, str, 0, 10, { font: 'Jakarta', weight: 800, size: str.length > 22 ? 62 : 76, color: '#fff', align: 'center' }); g.restore();
}

// ---------------------------------------------------------------- vertical props
function mapV(g, t, a0, dur) {
  const proj = darkMap(g, t, 0, 20, 2.95);
  const r = rand(23);
  const hubs = [[-74, 40.7], [-87.6, 41.9], [-118, 34], [-97.7, 30.3], [-0.1, 51.5], [2.3, 48.9], [13.4, 52.5], [4.9, 52.4], [139.7, 35.7], [77.2, 28.6], [72.8, 19.1], [151.2, -33.9], [103.8, 1.35], [121.5, 25], [-46.6, -23.5], [18.4, -33.9], [55.3, 25.2], [37.6, 55.8], [126.9, 37.5], [-79.4, 43.7]];
  for (let i = 0; i < 140; i++) {
    const h = hubs[i % hubs.length], ll = [h[0] + (r() - 0.5) * 18, h[1] + (r() - 0.5) * 12], s0 = a0 + (i / 140) * dur + r() * 0.3;
    if (t < s0) continue;
    const [x, y] = proj(ll), ph = ((t - s0) * 0.8) % 1;
    glow(g, x, y, 22, '255,70,90', 0.55);
    g.strokeStyle = `rgba(255,90,110,${0.6 * (1 - ph)})`; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 5 + ph * 30, 0, Math.PI * 2); g.stroke();
    g.fillStyle = '#ffc2cb'; g.beginPath(); g.arc(x, y, 3, 0, Math.PI * 2); g.fill();
  }
}
function phone(g, t, { spinUntil, stampAt }) {
  nightV(g, t, { seed: 11, rainA: 0.35 });
  const x = 230, y = 430, w = 620, h = 1000;
  glow(g, W / 2, 900, 600, '120,140,255', 0.18);
  g.save(); g.shadowColor = 'rgba(0,0,0,0.6)'; g.shadowBlur = 60; g.fillStyle = '#0a0812'; g.beginPath(); g.roundRect(x - 22, y - 22, w + 44, h + 44, 70); g.fill(); g.restore();
  g.strokeStyle = 'rgba(200,190,255,0.5)'; g.lineWidth = 3; g.beginPath(); g.roundRect(x - 22, y - 22, w + 44, h + 44, 70); g.stroke();
  g.save(); g.beginPath(); g.roundRect(x, y, w, h, 50); g.clip();
  g.fillStyle = '#f4f2fa'; g.fillRect(x, y, w, h);
  g.fillStyle = '#2b7cd3'; g.fillRect(x, y, w, 150); text(g, 'Outlook', x + 40, y + 105, { font: 'Jakarta', weight: 800, size: 44, color: '#fff' });
  if (t < spinUntil) {
    for (let i = 0; i < 4; i++) { g.fillStyle = '#e2def0'; g.fillRect(x + 40, y + 200 + i * 110, w - 80, 80); }
    g.strokeStyle = '#2b7cd3'; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.arc(x + w / 2, y + 760, 50, t * 6, t * 6 + 4.2); g.stroke(); g.lineCap = 'butt';
    text(g, 'Sending…', x + w / 2, y + 870, { font: 'Inter', weight: 600, size: 32, color: '#6a6680', align: 'center' });
  } else {
    text(g, '⚠', x + w / 2, y + 400, { font: 'Inter', weight: 800, size: 120, color: '#d84a4a', align: 'center' });
    text(g, "Can't connect", x + w / 2, y + 500, { font: 'Jakarta', weight: 800, size: 46, color: '#2a2438', align: 'center' });
    text(g, 'to the server', x + w / 2, y + 556, { font: 'Jakarta', weight: 800, size: 46, color: '#2a2438', align: 'center' });
    // the meeting card slides up
    const p = out3(span(t, spinUntil + 0.2, 0.6)), cy = lerp(y + h + 40, y + 640, p);
    g.save(); g.shadowColor = 'rgba(0,0,0,0.25)'; g.shadowBlur = 24; g.fillStyle = '#fff'; g.beginPath(); g.roundRect(x + 30, cy, w - 60, 300, 24); g.fill(); g.restore();
    g.fillStyle = '#6264a7'; g.fillRect(x + 30, cy, 10, 300);
    text(g, 'Meeting: Q4 planning', x + 70, cy + 70, { font: 'Jakarta', weight: 800, size: 34, color: '#2a2438' });
    text(g, 'Fri 9:00 – 9:30', x + 70, cy + 120, { font: 'Inter', weight: 600, size: 26, color: '#6a6680' });
    ['Book', 'Move', 'Cancel'].forEach((b, i) => { g.fillStyle = '#e8e5f2'; g.beginPath(); g.roundRect(x + 70 + i * 165, cy + 180, 145, 70, 16); g.fill(); text(g, b, x + 142 + i * 165, cy + 226, { font: 'Jakarta', weight: 700, size: 28, color: '#9a96ad', align: 'center' }); });
  }
  g.restore();
  stamp(g, t, stampAt, "COULDN'T SAVE", W / 2, 1180, { size: 66, rot: -0.12 });
}
function countersV(g, t, a) {
  nightV(g, t, { seed: 5, rainA: 0.2 });
  panel(g, 140, 450, 800, 380); panel(g, 140, 900, 800, 440);
  text(g, 'A NORMAL THURSDAY', W / 2, 530, { font: 'Jakarta', weight: 700, size: 32, color: LAV, align: 'center', spacing: 4 });
  text(g, '<15', W / 2, 720, { font: 'Jakarta', weight: 800, size: 170, color: INK, align: 'center' });
  text(g, 'THIS THURSDAY, AT THE PEAK', W / 2, 990, { font: 'Jakarta', weight: 700, size: 32, color: '#ffb3be', align: 'center', spacing: 4 });
  const v = Math.round(19650 * out3(span(t, a, 2)));
  g.save(); g.shadowColor = 'rgba(255,80,100,0.7)'; g.shadowBlur = 30; text(g, v.toLocaleString('en-US'), W / 2, 1200, { font: 'Jakarta', weight: 800, size: 190, color: RED, align: 'center' }); g.restore();
  text(g, 'reports per minute', W / 2, 1290, { font: 'Inter', weight: 600, size: 32, color: '#ffb3be', align: 'center' });
  const r = rand(9); if (t > a) for (let i = 0; i < 60; i++) { const ph = (t * (0.5 + r()) + r()) % 1; g.fillStyle = `rgba(255,92,110,${0.8 * (1 - ph)})`; g.fillRect(160 + r() * 760, 1340 + ph * 300, 6, 6); }
}
function hallV(g, t, { fail, heat = 0 }) {
  g.fillStyle = '#04050f'; g.fillRect(0, 0, W, H);
  embed(g, (cg) => serverHall(cg, t + 1, { fail, beaconAt: 4 }), [960 - 380, 0, 760, 1080], [0, 300, 1080, 1535], { feather: 200 });
  if (heat) { g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 3; i++) { const y = 700 + i * 260, a = heat * (0.16 + 0.07 * Math.sin(t * 3 + i)); const hg = g.createRadialGradient(W / 2, y, 20, W / 2, y, 520); hg.addColorStop(0, `rgba(255,120,40,${a})`); hg.addColorStop(1, 'rgba(255,120,40,0)'); g.fillStyle = hg; g.fillRect(0, 0, W, H); } g.restore();
    for (let i = 0; i < 26; i++) { const r = rand(i + 3); const x = r() * W, ph = (t * 0.6 + r()) % 1; g.strokeStyle = `rgba(255,170,120,${0.2 * Math.sin(ph * Math.PI)})`; g.lineWidth = 2; g.beginPath(); g.moveTo(x, 1300 - ph * 700); g.bezierCurveTo(x + 10, 1250 - ph * 700, x - 10, 1200 - ph * 700, x, 1150 - ph * 700); g.stroke(); } }
}
function rackV(g, t) {
  g.fillStyle = '#05061a'; g.fillRect(0, 0, W, H);
  const cyc = (t * 0.45) % 1, state = cyc < 0.35 ? 'boot' : cyc < 0.6 ? 'ok' : 'down';
  if (state === 'down') glow(g, W / 2, 860, 700, '255,60,80', 0.3); if (state === 'ok') glow(g, W / 2, 860, 700, '80,230,140', 0.2);
  g.fillStyle = '#121735'; g.beginPath(); g.roundRect(240, 420, 600, 900, 20); g.fill(); g.strokeStyle = 'rgba(140,160,255,0.35)'; g.lineWidth = 3; g.stroke();
  for (let r = 0; r < 13; r++) { g.fillStyle = '#1a2148'; g.fillRect(270, 450 + r * 66, 540, 52); for (let c = 0; c < 8; c++) { const on = state === 'ok' ? 1 : state === 'boot' ? (c / 8 < cyc / 0.35 ? 1 : 0) : 0; g.fillStyle = state === 'down' ? 'rgba(255,60,80,0.95)' : on ? 'rgba(80,230,140,0.95)' : 'rgba(60,70,110,0.8)'; g.fillRect(300 + c * 62, 470 + r * 66, 22, 12); } }
  if (cyc > 0.45 && cyc < 0.7) { const wv = (cyc - 0.45) / 0.25; for (let i = 0; i < 50; i++) { const r = rand(i); const y = lerp(-200, 520, wv) - r() * 300, x = 260 + r() * 560; g.fillStyle = 'rgba(120,190,255,0.9)'; g.fillRect(x, y, 4, 30); } }
  const lab = state === 'boot' ? 'restarting…' : state === 'ok' ? 'healthy ✓' : 'unresponsive ✕';
  tag(g, 99, 0, lab, 1360, { size: 46, color: state === 'down' ? RED : state === 'ok' ? GREEN : INK });
  text(g, 'traffic ↓', W / 2, 400, { font: 'Jakarta', weight: 800, size: 40, color: 'rgba(120,190,255,0.85)', align: 'center' });
}
function shieldV(g, t, a) {
  g.fillStyle = '#05061a'; g.fillRect(0, 0, W, H);
  const sw = span(t, a - 0.2, 0.6);
  g.save(); g.globalAlpha = 1 - sw; g.translate(W / 2, 860); g.scale(1.3, 1.3);
  glow(g, 0, 0, 420, '125,255,176', 0.25);
  g.fillStyle = 'rgba(30,60,50,0.9)'; g.strokeStyle = GREEN; g.lineWidth = 12; g.beginPath(); g.moveTo(0, -260); g.quadraticCurveTo(150, -220, 210, -220); g.quadraticCurveTo(220, 110, 0, 280); g.quadraticCurveTo(-220, 110, -210, -220); g.quadraticCurveTo(-150, -220, 0, -260); g.closePath(); g.fill(); g.stroke();
  text(g, 'NO SIGN OF', 0, -20, { font: 'Jakarta', weight: 800, size: 40, color: GREEN, align: 'center' }); text(g, 'CYBERATTACK', 0, 40, { font: 'Jakarta', weight: 800, size: 46, color: GREEN, align: 'center' });
  g.restore();
  if (sw > 0) {
    g.save(); g.globalAlpha = sw;
    text(g, '2024 · CROWDSTRIKE', W / 2, 470, { font: 'Jakarta', weight: 800, size: 46, color: LAV, align: 'center', spacing: 4 });
    for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) { const x = 290 + c * 500, y = 640 + r * 260, p = spring(t, a + (r * 2 + c) * 0.1, 2, 0.6); g.save(); g.translate(x, y); g.scale(Math.min(1, p), Math.min(1, p)); g.fillStyle = '#1f5fd6'; g.fillRect(-210, -110, 420, 220); text(g, ':(', -170, -30, { font: 'Inter', weight: 400, size: 70, color: '#fff' }); g.fillStyle = 'rgba(255,255,255,0.6)'; for (let i = 0; i < 3; i++) g.fillRect(-170, 20 + i * 26, 300 - i * 60, 10); g.restore(); glow(g, x, y, 260, '60,120,255', 0.1); }
    tag(g, t, a + 0.8, 'an update gone wrong', 1380, { size: 40 });
    g.restore();
  }
}
function bellV(g, t) {
  nightV(g, t, { seed: 13, rainA: 0, horizon: '#ffb07a', moonAt: null });
  embed(g, (cg) => beforeBell(cg, t + 2, { clock: 4 + Math.min(5.5, t * 0.9) }), [960 - 600, 0, 1200, 1080], [-60, 360, 1200, 1080], { feather: 120 });
  tag(g, t, 0.5, 'pre-market = trading before 9:30', 1340, { size: 38 });
}
function chartV(g, t, a) {
  nightV(g, t, { seed: 14, rainA: 0 });
  panel(g, 80, 420, 920, 920);
  text(g, 'FRIDAY, BEFORE THE BELL', W / 2, 500, { font: 'Jakarta', weight: 800, size: 32, color: LAV, align: 'center', spacing: 4 });
  const p = clamp((t - a + 0.5) / 3), r = rand(5), noise = Array.from({ length: 101 }, () => (r() - 0.5) * 10);
  const line = (fn, col) => { g.save(); g.shadowColor = col; g.shadowBlur = 14; g.strokeStyle = col; g.lineWidth = 8; g.lineJoin = 'round'; g.beginPath(); for (let i = 0; i <= 100 * p; i++) { const u = i / 100; const x = 140 + u * 800, y = fn(u); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); g.restore(); };
  line((u) => 760 + noise[Math.floor(u * 100)] * 0.6 + Math.sin(u * 9) * 6, '#cfc6ff');
  line((u) => 700 + Math.pow(u, 1.5) * 420 + noise[Math.floor(u * 100)], RED);
  if (p > 0.6) { text(g, 'tech futures ≈ flat', 940, 830, { font: 'Jakarta', weight: 800, size: 34, color: '#cfc6ff', align: 'right' }); text(g, 'MSFT', 800, 1080, { font: 'Jakarta', weight: 800, size: 40, color: RED, align: 'center' }); }
  big(g, t, a + 0.8, '−2.8%', 1240, { size: 120, color: RED });
  tag(g, t, a + 1.2, 'at one point · ~$508', 1380, { size: 40 });
}
function towerV(g, t, a) {
  nightV(g, t, { seed: 16, moonAt: [860, 520] });
  const x0 = 330, x1 = 750, top = 520, base = 1780, floors = 34, fh = (base - top) / floors;
  const dim = Math.round(ez(span(t, a, 1.6)) * 4);
  for (let f = 0; f < floors; f++) { const y = top + f * fh, off = f < dim; g.fillStyle = off ? '#0e0c24' : '#1c1a44'; g.fillRect(x0, y, x1 - x0, fh - 3); if (!off) for (let c = 0; c < 10; c++) if (rand(f * 10 + c)() < 0.7) { g.fillStyle = 'rgba(150,200,255,0.75)'; g.fillRect(x0 + 14 + c * 40, y + 6, 24, fh - 14); } }
  g.fillStyle = 'rgba(200,190,255,0.6)'; g.fillRect(x1 - 2, top, 3, base - top);
  text(g, 'MSFT', W / 2, top - 24, { font: 'Jakarta', weight: 800, size: 50, color: '#4ea3ff', align: 'center' });
  tag(g, t, 0.3, '~$3.8 trillion company', 900, { size: 40 });
  if (dim > 0) { const p = spring(t, a + 0.3, 1.6, 0.6); g.save(); g.translate(W / 2, 1180); g.scale(Math.min(1, p), Math.min(1, p)); panel(g, -380, -110, 760, 220); text(g, '≈ −$100B', 0, 20, { font: 'Jakarta', weight: 800, size: 100, color: RED, align: 'center' }); text(g, 'on paper · our estimate', 0, 80, { font: 'Inter', weight: 600, size: 28, color: LAV, align: 'center' }); g.restore(); }
}
function aiEmailV(g, t, a) {
  g.fillStyle = '#06051a'; g.fillRect(0, 0, W, H);
  const cx = W / 2, cy = 660; for (let i = 0; i < 4; i++) glow(g, cx, cy, 160 + i * 70, i % 2 ? '120,160,255' : '176,76,245', 0.18);
  g.save(); g.translate(cx, cy); g.rotate(t * 0.5); const og = g.createLinearGradient(-120, -120, 120, 120); og.addColorStop(0, '#4ea3ff'); og.addColorStop(0.5, '#b04cf5'); og.addColorStop(1, '#ff7ab8'); g.fillStyle = og; g.beginPath(); for (let k = 0; k < 6; k++) { const ang = (k / 6) * Math.PI * 2; g.ellipse(Math.cos(ang) * 40, Math.sin(ang) * 40, 70, 40, ang, 0, Math.PI * 2); } g.fill(); g.restore();
  text(g, 'AI · CLOUD', cx, cy + 200, { font: 'Jakarta', weight: 800, size: 40, color: INK, align: 'center', spacing: 4 });
  const ey = 1120, ice = span(t, a, 1.2);
  envelope(g, cx, ey, 3);
  if (ice > 0) { g.save(); g.globalAlpha = 0.75 * ice; const ig = g.createLinearGradient(cx - 200, ey - 160, cx + 200, ey + 160); ig.addColorStop(0, 'rgba(200,235,255,0.9)'); ig.addColorStop(1, 'rgba(120,180,240,0.55)'); g.fillStyle = ig; g.beginPath(); g.roundRect(cx - 200, ey - 160, 400, 320, 30); g.fill(); g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 3; g.beginPath(); g.moveTo(cx - 150, ey - 120); g.lineTo(cx - 60, ey - 60); g.lineTo(cx - 100, ey + 20); g.stroke(); g.restore(); }
  text(g, 'ONE EMAIL', cx, ey + 240, { font: 'Jakarta', weight: 800, size: 40, color: '#a8d8ff', align: 'center', spacing: 4 });
  text(g, 'vs', cx, 965, { font: "'Caveat'", weight: 700, size: 70, color: LAV, align: 'center' });
}
function endV(g, s) {
  const t = s.t;
  nightV(g, t + 10, { seed: 20, rainA: 0.3 }); mist(g, t, { y: 1600, h: 220, alpha: 0.2 });
  text(g, 'TOPPLED GIANTS', W / 2, 700, { font: 'Jakarta', weight: 700, size: 36, color: LAV, align: 'center', spacing: 10, alpha: span(t, 0, 0.4) });
  big(g, t, 0.1, 'Full story', 840, { size: 110 }); big(g, t, 0.25, 'on our channel', 960, { size: 80, color: GOLD });
  const p = spring(t, 0.6, 1.6, 0.6); if (p > 0.01) { g.save(); g.translate(W / 2, 1150); g.scale(Math.min(1, p), Math.min(1, p)); g.fillStyle = '#ff2f45'; g.beginPath(); g.roundRect(-220, -60, 440, 120, 60); g.fill(); text(g, 'SUBSCRIBE', 0, 16, { font: 'Jakarta', weight: 800, size: 44, color: '#fff', align: 'center', spacing: 3 }); g.restore(); }
}

// ---------------------------------------------------------------- the three Shorts
function wrap(hook, body) {
  return (g, s) => { body(g, s); header(g, s.t, hook); captions(g, s); };
}
const short1 = wrap("MICROSOFT'S EMAIL\nWENT DARK", (g, s) => {
  const t = s.t, b = (p) => at(s, p);
  shots(g, t, [b('Within about an hour') - 0.25, b("You couldn't send") - 0.25, b('At its worst') - 0.25], [
    (g2, tt) => { cam(g2, tt, { z0: 1.0, z1: 1.18, dur: 9, fy: 900 }); hallV(g2, tt, { fail: 0.05 + 0.45 * span(tt, 2, 7) }); tag(g2, tt, 0.3, 'Thursday · 11:17 a.m. New York', 1360, { size: 36 }); },
    (g2, tt) => { const a0 = b('Within about an hour'); cam(g2, tt - a0, { z0: 1.0, z1: 1.08, dur: 8 }); mapV(g2, tt, a0 + 0.2, 4.5); big(g2, tt, a0 + 0.1, String(Math.round(74 * out3(span(tt, a0 + 0.2, 4.5)))), 560, { size: 170, color: RED }); text(g2, 'COUNTRIES', W / 2, 620, { font: 'Jakarta', weight: 800, size: 34, color: LAV, align: 'center', spacing: 6, alpha: span(tt, a0 + 0.3, 0.3) }); },
    (g2, tt) => { const a0 = b("You couldn't send"); cam(g2, tt - a0, { z0: 1.0, z1: 1.05, dur: 7 }); phone(g2, tt, { spinUntil: b('book') - 0.2, stampAt: b('cancel') + 0.3 }); },
    (g2, tt) => { const a0 = b('At its worst'); cam(g2, tt - a0, { z0: 1.0, z1: 1.04, dur: 8 }); countersV(g2, tt, a0 + 0.3); },
  ], ['blur', 'push', 'flash']);
});
const short2 = wrap('WHY MICROSOFT\nBROKE', (g, s) => {
  const t = s.t, b = (p) => at(s, p);
  shots(g, t, [b('Some servers were failing') - 0.25, b('Microsoft said it saw no sign') - 0.25], [
    (g2, tt) => { cam(g2, tt, { z0: 1.05, z1: 1.2, dur: 12, fy: 900 }); hallV(g2, tt + 4, { fail: 0.55, heat: span(tt, 3, 3) }); tag(g2, tt, 0.3, '“elevated load across multiple regions”', 1360, { size: 32 }); },
    (g2, tt) => { const a0 = b('Some servers were failing'); cam(g2, tt - a0, { z0: 1.0, z1: 1.05, dur: 10 }); rackV(g2, tt - a0); },
    (g2, tt) => { const a0 = b('Microsoft said it saw no sign'); cam(g2, tt - a0, { z0: 1.0, z1: 1.05, dur: 10 }); shieldV(g2, tt, b('2024 CrowdStrike')); },
  ], ['push', 'flash']);
});
const short3 = wrap('MICROSOFT FELL\nBEFORE THE BELL', (g, s) => {
  const t = s.t, b = (p) => at(s, p);
  shots(g, t, [b('On Friday morning') - 0.25, b('For a company') - 0.25, b('Microsoft is selling') - 0.25], [
    (g2, tt) => { cam(g2, tt, { z0: 1.0, z1: 1.08, dur: 9, fy: 900 }); bellV(g2, tt); },
    (g2, tt) => { const a0 = b('On Friday morning'); cam(g2, tt - a0, { z0: 1.0, z1: 1.04, dur: 10 }); chartV(g2, tt, a0 + 0.4); },
    (g2, tt) => { const a0 = b('For a company'); cam(g2, tt - a0, { z0: 1.0, z1: 1.06, dur: 9, fy: 1100 }); towerV(g2, tt, b('100 billion') - 0.3); },
    (g2, tt) => { const a0 = b('Microsoft is selling'); cam(g2, tt - a0, { z0: 1.0, z1: 1.06, dur: 8 }); aiEmailV(g2, tt, b('struggled')); },
  ], ['push', 'blur', 'flash']);
});

export function shortScenes(which) { return { main: { 1: short1, 2: short2, 3: short3 }[which], end: endV }; }
export async function shortPreload() { await loadLand(); }
export const shortLook = { finish: (ctx, frame) => nightFinish(ctx, frame) };
export function shortHits(cuts) {
  return (timeline) => {
    const sc = (id) => timeline.scenes.find((x) => x.id === id), out = [];
    const m = sc('main'); const words = [];
    for (const c of m.cues) { const ws = c.text.split(/\s+/); const tot = ws.reduce((a, w) => a + w.length + 1.5, 0); let acc = 0; for (const w of ws) { words.push([w.toLowerCase().replace(/[^a-z0-9']/g, ''), c.start + (acc / tot) * (c.end - c.start)]); acc += w.length + 1.5; } }
    const find = (p) => { const tk = p.toLowerCase().split(/\s+/).map((w) => w.replace(/[^a-z0-9']/g, '')); for (let i = 0; i < words.length; i++) if (tk.every((x, k) => words[i + k] && words[i + k][0].startsWith(x))) return words[i][1]; return null; };
    out.push({ t: m.start + 0.05, kind: 'hit', vol: 0.5 });
    cuts.forEach((p) => { const w = find(p); if (w != null) out.push({ t: m.start + w - 0.35, kind: 'whoosh', vol: 0.35 }); });
    out.push({ t: sc('end').start + 0.1, kind: 'hit', vol: 0.5 }, { t: sc('end').start + 0.7, kind: 'pop', vol: 0.6 });
    return out;
  };
}
