// Episode 6: The Day Email Stopped. Episode-3 night template with moving cameras and varied transitions.
import { W, H, clamp, lerp, rand, text } from '../../pipeline/engine.js';
import { sceneWords, when } from '../../pipeline/shots.js';
import { lightScene, lightSounds } from '../../pipeline/lightshots.js';
import { loadLand } from '../../pipeline/map.js';
import { sky, stars, moon, clouds, skyline, rain, mist, beam, glow, reflect, buf, nightFinish } from '../../pipeline/scenery.js';
import { ez, out3, span, spring, at, pill } from '../../pipeline/scenekit.js';
import { serverHall, deadInbox, outageMap, beforeBell } from './sets.js';
import { cityWindow } from '../ep04-deepfake/night.js';

const INK = '#f3efff', LAV = '#b9a2ff', RED = '#ff5c6e', GOLD = '#ffc93c', TEAL = '#3ee0b5', BLUE = '#4ea3ff';
const D = { theme: 'dark' };

// ---------------------------------------------------------------- motion helpers
function cam(g, t, { z0 = 1, z1 = 1.08, dur = 8, fx = W / 2, fy = H / 2, drift = 1, pan = [0, 0] } = {}) {
  const k = ez(clamp(t / dur)), z = lerp(z0, z1, k);
  const dx = drift * (Math.sin(t * 0.7) * 6 + Math.sin(t * 1.9) * 2) + pan[0] * k, dy = drift * (Math.cos(t * 0.6) * 4 + Math.sin(t * 2.3) * 1.5) + pan[1] * k;
  g.translate(fx + dx, fy + dy); g.scale(z, z); g.translate(-fx, -fy);
}
function shots(g, t, cuts, draws, kinds = []) {
  let i = 0; while (i < cuts.length && t >= cuts[i]) i++;
  const since = i ? t - cuts[i - 1] : 99, kind = kinds[i - 1] || 'fade', XF = kind === 'flash' ? 0.35 : 0.55;
  const drawI = (gg, k) => { gg.save(); draws[k](gg, t); gg.restore(); };
  if (since >= XF) { drawI(g, i); return; }
  const p = ez(since / XF);
  const [a, ag] = buf('x6a'); drawI(ag, i - 1);
  const [b, bg] = buf('x6b'); drawI(bg, i);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  if (kind === 'push') { g.drawImage(a, -p * W * 0.35, 0); g.globalAlpha = p; g.drawImage(b, (1 - p) * W * 0.35, 0); }
  else if (kind === 'blur') { g.filter = `blur(${(p * 14).toFixed(1)}px)`; g.drawImage(a, 0, 0); g.filter = `blur(${((1 - p) * 14).toFixed(1)}px)`; g.globalAlpha = p; g.drawImage(b, 0, 0); g.filter = 'none'; }
  else if (kind === 'flash') { g.drawImage(p < 0.5 ? a : b, 0, 0); g.globalAlpha = Math.sin(p * Math.PI) * 0.9; g.fillStyle = '#eaf2ff'; g.fillRect(0, 0, W, H); }
  else { g.drawImage(a, 0, 0); g.globalAlpha = p; g.drawImage(b, 0, 0); }
  g.restore();
}
function nightBG(g, t, { seed = 0, horizon = '#2d2552', rainA = 0, moonAt = null } = {}) {
  sky(g, { top: '#06061c', mid: '#15133b', horizon, hy: 980 }); stars(g, t, { n: 80, maxY: 500, alpha: 0.5, seed: seed + 2 });
  if (moonAt) moon(g, moonAt[0], moonAt[1], 38);
  clouds(g, t + seed, { y: 180, h: 110, seed: 900 + seed, n: 8, scale: 0.6, lx: moonAt ? moonAt[0] : 1500, ly: moonAt ? moonAt[1] : 90, speed: 6, alpha: 0.8 });
  skyline(g, t, { base: 1000, seed: 950 + seed, depth: 0.2, color: '#1b1840', lit: 0.12, tall: 0.7, fog: 'rgba(80,65,125,0.5)' });
  if (rainA) rain(g, t, { n: 380, alpha: rainA });
}
function panel(g, x, y, w, h, r = 26) { g.save(); g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 40; g.fillStyle = 'rgba(22,16,48,0.92)'; g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); g.restore(); g.strokeStyle = 'rgba(185,162,255,0.35)'; g.lineWidth = 2; g.beginPath(); g.roundRect(x, y, w, h, r); g.stroke(); }
function counter(g, t, a, dur, to, fmt, x, y, { size = 110, color = INK } = {}) { text(g, fmt(to * out3(span(t, a, dur))), x, y, { font: 'Jakarta', weight: 800, size, color, align: 'center', alpha: span(t, a - 0.1, 0.2) }); }
function stamp(g, t, a, str, x, y, { color = RED, rot = -0.1, size = 64 } = {}) {
  const sp = clamp((t - (a - 0.09)) / 0.09); if (sp <= 0) return;
  const b = t > a ? Math.exp(-(t - a) * 9) * Math.sin((t - a) * 40) * 0.04 : 0;
  g.save(); g.translate(x, y); g.rotate(rot); const sc = lerp(2.4, 1, sp * sp * sp) + b; g.scale(sc, sc); g.globalAlpha = 0.95 * sp;
  g.font = `800 ${size}px Jakarta`; const w = g.measureText(str).width + size;
  g.strokeStyle = color; g.lineWidth = size * 0.1; g.beginPath(); g.roundRect(-w / 2, -size * 0.75, w, size * 1.5, size * 0.2); g.stroke();
  text(g, str, 0, size * 0.36, { font: 'Jakarta', weight: 800, size, color, align: 'center', spacing: size * 0.05 }); g.restore();
}
function envelope(g, x, y, s, { a = 1, col = '#f3efe6' } = {}) { g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(s, s); g.fillStyle = col; g.fillRect(-40, -26, 80, 52); g.strokeStyle = '#b8a9d8'; g.lineWidth = 3; g.beginPath(); g.moveTo(-40, -26); g.lineTo(0, 6); g.lineTo(40, -26); g.stroke(); g.restore(); }
function building(g, cx, base, w, h, { lit = 0.5, seed = 1, color = '#1a1838', label = '' } = {}) {
  g.fillStyle = color; g.fillRect(cx - w / 2, base - h, w, h);
  const r = rand(seed); for (let y = base - h + 20; y < base - 20; y += 34) for (let x = cx - w / 2 + 14; x < cx + w / 2 - 20; x += 30) if (r() < lit) { g.fillStyle = `rgba(255,${200 + r() * 30},${140 + r() * 40},${0.6 + r() * 0.4})`; g.fillRect(x, y, 16, 20); }
  if (label) text(g, label, cx, base - h - 18, { font: 'Jakarta', weight: 800, size: 26, color: INK, align: 'center', spacing: 3 });
}

// ---------------------------------------------------------------- new props
const APPS = [['Outlook', '#2b7cd3', 'O'], ['Teams', '#6264a7', 'T'], ['OneDrive', '#0f78d4', '☁'], ['SharePoint', '#037c7c', 'S'], ['Copilot', '#b04cf5', '✦']];
function appSigns(g, t, offs) {
  nightBG(g, t, { seed: 3, rainA: 0.3 });
  g.fillStyle = '#0c0a1a'; g.fillRect(0, 760, W, 320);
  APPS.forEach(([name, col, ic], k) => {
    const x = 260 + k * 350, y = 470, off = offs[k];
    const fl = off > 0 ? (off < 1 ? (Math.floor(t * 23 + k * 7) % 3 === 0 ? 1 : 0.15) : 0.05) : 1;
    g.save(); g.translate(x, y);
    if (fl > 0.5) glow(g, 0, 0, 260, col.replace('#', '').match(/../g).map((h) => parseInt(h, 16)).join(','), 0.4 * fl);
    g.fillStyle = '#14112a'; g.beginPath(); g.roundRect(-130, -130, 260, 260, 40); g.fill();
    g.strokeStyle = fl > 0.5 ? col : 'rgba(120,110,150,0.4)'; g.lineWidth = 8; g.shadowColor = fl > 0.5 ? col : 'transparent'; g.shadowBlur = 30 * fl; g.beginPath(); g.roundRect(-112, -112, 224, 224, 32); g.stroke(); g.shadowColor = 'transparent';
    text(g, ic, 0, 36, { font: 'Jakarta', weight: 800, size: 110, color: fl > 0.5 ? col : 'rgba(120,110,150,0.5)', align: 'center' });
    text(g, name, 0, 190, { font: 'Jakarta', weight: 800, size: 30, color: fl > 0.5 ? INK : 'rgba(160,150,190,0.6)', align: 'center' });
    g.restore();
  });
  reflect(g, t, 760, 260, { alpha: 0.3 });
}
function spikeChart(g, t, a) {
  g.fillStyle = '#06051a'; g.fillRect(0, 0, W, H);
  panel(g, 160, 120, 1600, 820);
  text(g, 'OUTLOOK · USER REPORTS', 220, 200, { font: 'Jakarta', weight: 800, size: 30, color: LAV, spacing: 3 });
  const pts = [], r = rand(4), p = clamp((t - a + 0.4) / 2.2);
  for (let i = 0; i <= 120; i++) { const u = i / 120; let v = 0.03 + r() * 0.02; if (u > 0.55) v += Math.min(1.25, Math.pow((u - 0.55) / 0.2, 2)) * out3(p); pts.push([220 + u * 1480, 880 - v * 620]); }
  g.save(); g.beginPath(); g.rect(160, 120, 1600, 820); g.clip();
  g.save(); g.shadowColor = 'rgba(255,80,100,0.8)'; g.shadowBlur = 16; g.strokeStyle = RED; g.lineWidth = 6; g.lineJoin = 'round'; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); g.restore();
  g.restore();
  if (p > 0.7) { const [ex] = pts[96]; for (let k = 0; k < 6; k++) { const ph = ((t * 1.5 + k / 6) % 1); g.fillStyle = `rgba(255,92,110,${1 - ph})`; g.beginPath(); g.arc(ex + (k - 3) * 30, 120 - ph * 60, 6, 0, Math.PI * 2); g.fill(); } }
  if (t > a) { panel(g, 1220, 220, 480, 150); counter(g, t, a, 1.6, 140000, (v) => `~${Math.round(v).toLocaleString('en-US')}`, 1460, 320, { size: 76, color: RED }); }
}
function twoCounters(g, t, a) {
  nightBG(g, t, { seed: 5 });
  g.fillStyle = 'rgba(6,5,16,0.4)'; g.fillRect(0, 0, W, H);
  panel(g, 200, 300, 640, 380); panel(g, 1080, 300, 640, 380);
  text(g, 'A NORMAL THURSDAY', 520, 380, { font: 'Jakarta', weight: 700, size: 26, color: LAV, align: 'center', spacing: 3 });
  text(g, 'THIS THURSDAY, AT THE PEAK', 1400, 380, { font: 'Jakarta', weight: 700, size: 26, color: '#ffb3be', align: 'center', spacing: 3 });
  text(g, '<15', 520, 560, { font: 'Jakarta', weight: 800, size: 140, color: INK, align: 'center' });
  counter(g, t, a, 2, 19650, (v) => Math.round(v).toLocaleString('en-US'), 1400, 560, { size: 140, color: RED });
  text(g, 'reports per minute', 520, 630, { font: 'Inter', weight: 600, size: 24, color: LAV, align: 'center' }); text(g, 'reports per minute', 1400, 630, { font: 'Inter', weight: 600, size: 24, color: '#ffb3be', align: 'center' });
  const r = rand(9); for (let i = 0; i < 60; i++) { const ph = ((t * (0.5 + r()) + r()) % 1); if (t < a) continue; g.fillStyle = `rgba(255,92,110,${0.8 * (1 - ph)})`; g.fillRect(1080 + r() * 640, 700 + ph * 300, 6, 6); }
}
function heatHall(g, t) {
  serverHall(g, t + 4, { fail: 0.6, beaconAt: 0 });
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 4; i++) { const x = 300 + i * 440, a = 0.18 + 0.08 * Math.sin(t * 3 + i); const hg = g.createRadialGradient(x, 560, 20, x, 560, 360); hg.addColorStop(0, `rgba(255,120,40,${a})`); hg.addColorStop(1, 'rgba(255,120,40,0)'); g.fillStyle = hg; g.fillRect(0, 0, W, H); }
  g.restore();
  for (let i = 0; i < 30; i++) { const r = rand(i + 3); const x = r() * W, ph = (t * 0.6 + r()) % 1; g.strokeStyle = `rgba(255,170,120,${0.18 * Math.sin(ph * Math.PI)})`; g.lineWidth = 2; g.beginPath(); g.moveTo(x, 800 - ph * 500); g.bezierCurveTo(x + 10, 760 - ph * 500, x - 10, 720 - ph * 500, x, 680 - ph * 500); g.stroke(); }
}
function rebootLoop(g, t) {
  g.fillStyle = '#05061a'; g.fillRect(0, 0, W, H);
  // one big rack face
  g.fillStyle = '#121735'; g.beginPath(); g.roundRect(560, 80, 800, 900, 18); g.fill();
  const cyc = (t * 0.45) % 1, state = cyc < 0.35 ? 'boot' : cyc < 0.6 ? 'ok' : 'down';
  for (let r = 0; r < 14; r++) { g.fillStyle = '#1a2148'; g.fillRect(600, 110 + r * 60, 720, 48); for (let c = 0; c < 10; c++) { const on = state === 'ok' ? 1 : state === 'boot' ? (c / 10 < cyc / 0.35 ? 1 : 0) : 0; g.fillStyle = state === 'down' ? 'rgba(255,60,80,0.95)' : on ? 'rgba(80,230,140,0.95)' : 'rgba(60,70,110,0.8)'; g.fillRect(630 + c * 66, 126 + r * 60, 20, 10); } }
  if (state === 'down') glow(g, 960, 530, 600, '255,60,80', 0.3);
  if (state === 'ok') glow(g, 960, 530, 600, '80,230,140', 0.18);
  // traffic wave rushing in from the left
  if (cyc > 0.45 && cyc < 0.7) { const wv = (cyc - 0.45) / 0.25; for (let i = 0; i < 40; i++) { const r = rand(i); const x = lerp(-100, 600, wv) - r() * 300, y = 120 + r() * 840; g.fillStyle = 'rgba(120,190,255,0.9)'; g.fillRect(x, y, 26, 4); } }
  const lab = state === 'boot' ? 'restarting…' : state === 'ok' ? 'healthy ✓' : 'unresponsive ✕';
  panel(g, 1420, 460, 400, 120); text(g, lab, 1620, 535, { font: 'Jakarta', weight: 800, size: 40, color: state === 'down' ? RED : state === 'ok' ? '#7dffb0' : INK, align: 'center' });
  text(g, 'traffic →', 300, 540, { font: 'Jakarta', weight: 800, size: 44, color: 'rgba(120,190,255,0.8)', align: 'center' });
}
function patchRoute(g, t, a) {
  g.fillStyle = '#05061a'; g.fillRect(0, 0, W, H);
  const nodes = [[300, 300], [300, 780], [960, 540], [1620, 260], [1620, 540], [1620, 820]];
  const rewire = ez(span(t, a + 1, 1.2));
  const links = [[0, 2], [1, 2], [2, 3], [2, 4], [2, 5]];
  links.forEach(([i, j], k) => { const [ax, ay] = nodes[i], [bx, by] = nodes[j], bend = (k % 2 ? 1 : -1) * 120 * (1 - rewire); g.save(); g.shadowColor = rewire > 0.9 ? 'rgba(80,230,140,0.8)' : 'rgba(255,80,100,0.6)'; g.shadowBlur = 14; g.strokeStyle = rewire > 0.9 ? '#7dffb0' : 'rgba(255,92,110,0.7)'; g.lineWidth = 5; g.setLineDash(rewire > 0.9 ? [] : [10, 10]); g.beginPath(); g.moveTo(ax, ay); g.quadraticCurveTo((ax + bx) / 2, (ay + by) / 2 + bend, bx, by); g.stroke(); g.restore();
    const u = (t * 0.6 + k * 0.2) % 1; if (rewire > 0.9) { const x = lerp(ax, bx, u), y = lerp(ay, by, u); g.fillStyle = '#d6ffe6'; g.beginPath(); g.arc(x, y, 6, 0, Math.PI * 2); g.fill(); } });
  nodes.forEach(([x, y], k) => { g.fillStyle = k === 2 ? '#2a2f6a' : '#1a1e44'; g.beginPath(); g.roundRect(x - 90, y - 50, 180, 100, 18); g.fill(); g.strokeStyle = k === 2 ? LAV : 'rgba(185,162,255,0.4)'; g.lineWidth = 3; g.stroke(); text(g, k < 2 ? 'USERS' : k === 2 ? 'SIGN-IN / ROUTING' : 'MAILBOX SERVERS', x, y + 10, { font: 'Jakarta', weight: 800, size: k === 2 ? 20 : 22, color: INK, align: 'center' }); });
  // the patch slides in
  const pp = ez(span(t, a, 1));
  g.save(); g.translate(lerp(960, 960, pp), lerp(-120, 420, pp)); g.fillStyle = '#7dffb0'; g.beginPath(); g.roundRect(-70, -26, 140, 52, 10); g.fill(); text(g, 'PATCH', 0, 10, { font: 'Jakarta', weight: 800, size: 26, color: '#0c2a1a', align: 'center' }); g.restore();
  glow(g, 960, 470, 200, '125,255,176', 0.3 * pp);
}
function bsodBoard(g, t, a) {
  g.fillStyle = '#05061a'; g.fillRect(0, 0, W, H);
  // shield first, then the 2024 departures board of blue screens
  const sw = span(t, a - 0.2, 0.6);
  g.save(); g.globalAlpha = 1 - sw; g.translate(960, 520);
  glow(g, 0, 0, 420, '125,255,176', 0.25);
  g.fillStyle = 'rgba(30,60,50,0.9)'; g.strokeStyle = '#7dffb0'; g.lineWidth = 12; g.beginPath(); g.moveTo(0, -260); g.quadraticCurveTo(150, -220, 210, -220); g.quadraticCurveTo(220, 110, 0, 280); g.quadraticCurveTo(-220, 110, -210, -220); g.quadraticCurveTo(-150, -220, 0, -260); g.closePath(); g.fill(); g.stroke();
  text(g, 'NO SIGN OF', 0, -20, { font: 'Jakarta', weight: 800, size: 40, color: '#7dffb0', align: 'center' }); text(g, 'CYBERATTACK', 0, 40, { font: 'Jakarta', weight: 800, size: 46, color: '#7dffb0', align: 'center' });
  g.restore();
  if (sw > 0) {
    g.save(); g.globalAlpha = sw;
    text(g, '2024 · CROWDSTRIKE', 960, 140, { font: 'Jakarta', weight: 800, size: 40, color: LAV, align: 'center', spacing: 4 });
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { const x = 300 + c * 340, y = 220 + r * 250, p = spring(t, a + (r * 4 + c) * 0.08, 2, 0.6); g.save(); g.translate(x + 150, y + 100); g.scale(Math.min(1, p), Math.min(1, p)); g.fillStyle = '#1f5fd6'; g.fillRect(-150, -100, 300, 200); text(g, ':(', -120, -30, { font: 'Inter', weight: 400, size: 60, color: '#fff' }); g.fillStyle = 'rgba(255,255,255,0.6)'; for (let i = 0; i < 3; i++) g.fillRect(-120, 10 + i * 22, 200 - i * 40, 8); g.restore(); glow(g, x + 150, y + 100, 200, '60,120,255', 0.1); }
    g.restore();
  }
}
function sealedReport(g, t) {
  g.fillStyle = '#0b0918'; g.fillRect(0, 0, W, H);
  const dg = g.createRadialGradient(960, 640, 40, 960, 640, 900); dg.addColorStop(0, '#3a2b3a'); dg.addColorStop(1, '#0e0a14'); g.fillStyle = dg; g.fillRect(0, 0, W, H);
  beam(g, t, 960, -40, Math.PI / 2, { len: 1000, spread: 0.3, color: '255,210,150', alpha: 0.25, motes: 60 });
  g.save(); g.translate(960, 600); g.rotate(-0.03); g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 30; g.fillStyle = '#e8dcc0'; g.fillRect(-380, -220, 760, 440); g.shadowColor = 'transparent';
  g.strokeStyle = '#b8a888'; g.lineWidth = 4; g.beginPath(); g.moveTo(-380, -220); g.lineTo(0, 40); g.lineTo(380, -220); g.stroke();
  g.fillStyle = '#b02a2a'; g.beginPath(); g.arc(0, 40, 60, 0, Math.PI * 2); g.fill(); g.fillStyle = '#d04040'; g.beginPath(); g.arc(-8, 32, 40, 0, Math.PI * 2); g.fill();
  text(g, 'POST-INCIDENT REPORT', 0, 150, { font: 'Jakarta', weight: 800, size: 40, color: '#3a2d22', align: 'center', spacing: 2 });
  text(g, 'coming', 0, 196, { font: "'Caveat'", weight: 700, size: 40, color: '#8a5a2b', align: 'center' });
  g.restore();
}
function tokyo(g, t) {
  nightBG(g, t, { seed: 21, moonAt: [1700, 150], horizon: '#2a2040' });
  building(g, 480, 980, 560, 620, { seed: 3, lit: 0.55, color: '#1c1a3c', label: 'MINISTRY' });
  building(g, 1440, 980, 560, 560, { seed: 4, lit: 0.5, color: '#1a1838', label: 'MINISTRY' });
  for (let i = 0; i < 7; i++) { const u = (i + 0.5) / 7, x = lerp(800, 1120, u), y = 520 + Math.sin(t * 2 + i) * 12 - Math.sin(u * Math.PI) * 80; const fl = Math.floor(t * 4 + i) % 3 === 0; envelope(g, x, y, 0.9, { a: fl ? 0.4 : 0.95 }); if (fl) text(g, '✕', x + 30, y - 24, { font: 'Jakarta', weight: 800, size: 26, color: RED }); }
  g.fillStyle = '#0c0a1a'; g.fillRect(0, 980, W, 100);
  rain(g, t, { n: 300, alpha: 0.25 });
}
function hospitalPolice(g, t, a) {
  nightBG(g, t, { seed: 22, rainA: 0.4 });
  // hospital
  g.fillStyle = '#d9d0ea'; g.fillRect(160, 420, 760, 560); for (let r = 0; r < 6; r++) for (let c = 0; c < 8; c++) { g.fillStyle = rand(r * 9 + c)() < 0.6 ? 'rgba(255,230,180,0.85)' : 'rgba(60,54,100,0.8)'; g.fillRect(190 + c * 90, 450 + r * 80, 56, 50); }
  g.fillStyle = '#1f5fd6'; g.fillRect(420, 360, 240, 70); text(g, 'NHS', 540, 412, { font: 'Jakarta', weight: 800, size: 54, color: '#fff', align: 'center' });
  const sp = spring(t, a, 1.6, 0.6); if (sp > 0.01) { g.save(); g.translate(540, 860); g.scale(Math.min(1, sp), Math.min(1, sp)); g.fillStyle = '#ffd84a'; g.fillRect(-260, -60, 520, 120); text(g, 'Please attend your appointment', 0, 12, { font: 'Jakarta', weight: 800, size: 30, color: '#1d1b29', align: 'center' }); g.restore(); }
  // police station with a ringing phone
  g.fillStyle = '#1c2a5a'; g.fillRect(1100, 520, 640, 460); g.fillStyle = '#2a3a7a'; g.fillRect(1100, 480, 640, 50); text(g, 'POLICE', 1420, 518, { font: 'Jakarta', weight: 800, size: 40, color: '#fff', align: 'center', spacing: 6 });
  glow(g, 1420, 470, 120, '80,140,255', 0.6 + 0.4 * Math.sin(t * 6));
  const ring = Math.sin(t * 50) * (Math.floor(t * 2) % 2 ? 4 : 0);
  g.save(); g.translate(1420 + ring, 760); g.fillStyle = '#0a0812'; g.beginPath(); g.roundRect(-110, -40, 220, 80, 20); g.fill(); g.beginPath(); g.roundRect(-130, -80, 260, 46, 22); g.fill(); g.restore();
  if (Math.floor(t * 2) % 2) for (let i = 0; i < 3; i++) { g.strokeStyle = `rgba(185,162,255,${0.6 - i * 0.18})`; g.lineWidth = 4; g.beginPath(); g.arc(1420, 720, 90 + i * 30, -2.4, -0.7); g.stroke(); }
  g.fillStyle = '#0c0a1a'; g.fillRect(0, 980, W, 100);
}
function portDelay(g, t, a) {
  nightBG(g, t, { seed: 23, moonAt: [300, 160] });
  g.fillStyle = '#0a1028'; g.fillRect(0, 760, W, 320);
  // container ship
  g.save(); g.translate(760 + Math.sin(t * 0.5) * 10, 760 + Math.sin(t * 1.2) * 4);
  g.fillStyle = '#2a2f55'; g.beginPath(); g.moveTo(-600, 0); g.lineTo(600, 0); g.lineTo(520, 90); g.lineTo(-560, 90); g.closePath(); g.fill();
  const cols = ['#c0392b', '#2b7cd3', '#e0a020', '#1f8a5b', '#8a4ab8'];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 16; c++) { g.fillStyle = cols[(r * 3 + c) % 5]; g.fillRect(-540 + c * 64, -40 - r * 40, 60, 36); }
  g.fillStyle = '#e8e3f5'; g.fillRect(440, -170, 90, 170);
  g.restore();
  reflect(g, t, 850, 200, { alpha: 0.35, ripple: 8 });
  envelope(g, 760, 480 + Math.sin(t * 2) * 10, 1.8); g.strokeStyle = GOLD; g.lineWidth = 6; g.beginPath(); g.arc(760, 480, 90, t * 3, t * 3 + 4.5); g.stroke();
  const sp = spring(t, a, 1.6, 0.6); if (sp > 0.01) { g.save(); g.translate(1500, 400); g.rotate(0.04); g.scale(Math.min(1, sp), Math.min(1, sp)); panel(g, -240, -150, 480, 300); text(g, 'RESULTS · H1', 0, -80, { font: 'Jakarta', weight: 800, size: 30, color: LAV, align: 'center', spacing: 3 }); g.fillStyle = 'rgba(185,162,255,0.3)'; for (let i = 0; i < 4; i++) g.fillRect(-180, -40 + i * 40, 360 - i * 60, 14); g.restore(); stamp(g, t, a + 0.5, 'DELAYED', 1500, 420, { size: 60, rot: -0.12 }); }
}
function runwayCities(g, t, a) {
  nightBG(g, t, { seed: 24 });
  g.fillStyle = '#0c0a1c'; g.fillRect(0, 700, W, 380);
  for (let i = 0; i < 14; i++) { const u = i / 13; g.fillStyle = `rgba(255,220,140,${0.4 + 0.6 * Math.abs(Math.sin(t * 3 - i * 0.4))})`; g.beginPath(); g.arc(lerp(860, 120, u), lerp(720, 1060, u), lerp(3, 10, u), 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(lerp(1060, 1800, u), lerp(720, 1060, u), lerp(3, 10, u), 0, Math.PI * 2); g.fill(); }
  g.save(); g.translate(960, 600 - Math.sin(t * 0.5) * 20); g.fillStyle = '#d9d4ea'; g.beginPath(); g.ellipse(0, 0, 200, 26, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.moveTo(-30, 0); g.lineTo(-100, -150); g.lineTo(-60, -150); g.lineTo(60, 0); g.closePath(); g.fill(); g.beginPath(); g.moveTo(-30, 0); g.lineTo(-100, 150); g.lineTo(-60, 150); g.lineTo(60, 0); g.closePath(); g.fill(); g.restore();
  envelope(g, 1200, 380, 1.2, { a: 0.9 }); g.strokeStyle = GOLD; g.lineWidth = 4; g.setLineDash([8, 10]); g.beginPath(); g.moveTo(1240, 380); g.quadraticCurveTo(1500, 250, 1700, 360); g.stroke(); g.setLineDash([]); text(g, 'rerouted', 1480, 270, { font: "'Caveat'", weight: 700, size: 40, color: GOLD, align: 'center' });
  if (t > a) {
    [['Austin', 300], ['Jacksonville', 960], ['Baltimore County', 1620]].forEach(([c, x], k) => { const p = spring(t, a + k * 0.25, 1.8, 0.6); if (p <= 0.01) return; g.save(); g.translate(x, 860); g.scale(Math.min(1, p), Math.min(1, p)); panel(g, -200, -60, 400, 120, 20); text(g, c, 0, -8, { font: 'Jakarta', weight: 800, size: 28, color: INK, align: 'center' }); text(g, 'email down', 0, 30, { font: 'Inter', weight: 600, size: 20, color: '#ffb3be', align: 'center' }); g.restore(); });
    const p9 = spring(t, a + 1.4, 1.8, 0.6); if (p9 > 0.01) { g.save(); g.translate(300, 700); g.scale(Math.min(1, p9), Math.min(1, p9)); g.fillStyle = '#1f8a5b'; g.beginPath(); g.roundRect(-120, -40, 240, 80, 40); g.fill(); text(g, '911 OK ✓', 0, 14, { font: 'Jakarta', weight: 800, size: 34, color: '#fff', align: 'center' }); g.restore(); }
  }
}
function aiLinks(g, t, a) {
  g.fillStyle = '#06051a'; g.fillRect(0, 0, W, H);
  const hub = [960, 760];
  g.fillStyle = '#1a2a5a'; g.beginPath(); g.roundRect(hub[0] - 180, hub[1] - 60, 360, 120, 24); g.fill(); text(g, 'Microsoft 365', hub[0], hub[1] + 12, { font: 'Jakarta', weight: 800, size: 34, color: INK, align: 'center' });
  [['AI assistant A', 520, 300], ['AI assistant B', 1400, 300]].forEach(([lab, x, y], k) => {
    const sn = span(t, a + 0.6 + k * 0.3, 0.4);
    g.save(); g.translate(x, y); g.fillStyle = 'rgba(40,30,90,0.95)'; g.beginPath(); g.roundRect(-220, -80, 440, 160, 40); g.fill(); g.strokeStyle = LAV; g.lineWidth = 3; g.stroke(); for (let i = 0; i < 3; i++) { g.fillStyle = LAV; g.beginPath(); g.arc(-40 + i * 40, 0, 10 + 4 * Math.sin(t * 6 + i), 0, Math.PI * 2); g.fill(); } text(g, lab, 0, -110, { font: 'Jakarta', weight: 700, size: 28, color: LAV, align: 'center' }); g.restore();
    glow(g, x, y, 220, '185,162,255', 0.2);
    g.strokeStyle = sn > 0.5 ? 'rgba(255,92,110,0.9)' : 'rgba(185,162,255,0.8)'; g.lineWidth = 5;
    const mx = (x + hub[0]) / 2, my = (y + hub[1]) / 2;
    g.beginPath(); g.moveTo(x, y + 80); g.lineTo(lerp(x, mx, 1) - (sn > 0 ? 20 * sn : 0) * Math.sign(hub[0] - x), my - 30 * sn); g.stroke();
    g.beginPath(); g.moveTo(mx + (sn > 0 ? 20 * sn : 0) * Math.sign(hub[0] - x), my + 30 * sn); g.lineTo(hub[0], hub[1] - 60); g.stroke();
    if (sn > 0.5) glow(g, mx, my, 60, '255,92,110', 0.6 * (1 - span(t, a + 1.2 + k * 0.3, 0.5)));
  });
  pill(g, t, a + 0.3, 'OpenAI and Anthropic reported connector problems', 1000, D);
}
function asiaDawn(g, t) {
  const proj = outageMap(g, t + 6, { start: 0, dur: 0.1, n: 140 });
  // dawn light sweeping in from the east; Asia-Pacific pings turn green
  const sweep = span(t, 0.3, 2.5);
  g.save(); g.globalCompositeOperation = 'lighter'; const lg = g.createLinearGradient(W, 0, W * (1 - sweep * 0.6), 0); lg.addColorStop(0, 'rgba(255,190,120,0.25)'); lg.addColorStop(1, 'rgba(255,190,120,0)'); g.fillStyle = lg; g.fillRect(0, 0, W, H); g.restore();
  const asia = [[139.7, 35.7], [121.5, 25], [103.8, 1.35], [151.2, -33.9], [126.9, 37.5], [77.2, 28.6], [72.8, 19.1]];
  asia.forEach((ll, k) => { if (sweep < 0.3 + k * 0.08) return; const [x, y] = proj(ll); glow(g, x, y, 60, '80,230,140', 0.7); g.fillStyle = '#c8ffd9'; g.beginPath(); g.arc(x, y, 5, 0, Math.PI * 2); g.fill(); });
  pill(g, t, 0.4, 'recovery starts in Asia-Pacific', 90, D);
}
function retryConveyor(g, t, a) {
  g.fillStyle = '#07061a'; g.fillRect(0, 0, W, H);
  beam(g, t, 960, -40, Math.PI / 2, { len: 1000, spread: 0.35, color: '200,210,255', alpha: 0.15, motes: 40 });
  g.fillStyle = '#2a2448'; g.fillRect(100, 720, 1720, 40); for (let i = 0; i < 30; i++) { g.fillStyle = '#3a3360'; g.beginPath(); g.arc(120 + i * 60 - ((t * 60) % 60), 760, 16, 0, Math.PI * 2); g.fill(); }
  for (let i = 0; i < 14; i++) { const x = ((i * 140 + t * 60) % 1900) - 50; envelope(g, x, 690, 1, { a: 0.95 }); }
  const p = spring(t, a, 1.6, 0.6); if (p > 0.01) { g.save(); g.translate(960, 380); g.scale(Math.min(1, p), Math.min(1, p)); panel(g, -260, -150, 520, 300); text(g, '48 h', 0, 40, { font: 'Jakarta', weight: 800, size: 150, color: GOLD, align: 'center' }); text(g, 'retry window for delayed email', 0, 230, { font: 'Inter', weight: 600, size: 28, color: LAV, align: 'center' }); g.strokeStyle = GOLD; g.lineWidth = 6; g.beginPath(); g.arc(0, -10, 200, -Math.PI / 2, -Math.PI / 2 + (1 - span(t, a, 20)) * Math.PI * 2); g.stroke(); g.restore(); }
}
function stalled(g, t, a) {
  g.fillStyle = '#05061a'; g.fillRect(0, 0, W, H);
  const red = t > a + 0.6 && Math.floor(t * 6) % 5 !== 0;
  for (let i = 0; i < 8; i++) { g.fillStyle = red ? 'rgba(255,60,80,0.95)' : 'rgba(80,230,140,0.95)'; g.fillRect(560 + i * 100, 360, 60, 18); }
  glow(g, 960, 370, 500, red ? '255,60,80' : '80,230,140', 0.25);
  panel(g, 460, 520, 1000, 120); const pr = Math.min(0.7, span(t, 0, 2.2) * 0.7 + (t > a ? 0 : 0)); g.fillStyle = 'rgba(255,255,255,0.08)'; g.beginPath(); g.roundRect(500, 560, 920, 40, 20); g.fill(); g.fillStyle = t > a ? GOLD : '#7dffb0'; g.beginPath(); g.roundRect(500, 560, 920 * pr, 40, 20); g.fill();
  text(g, `${Math.round(pr * 100)}%`, 960, 700, { font: 'Jakarta', weight: 800, size: 64, color: INK, align: 'center' });
  if (t > a) { const p = spring(t, a, 1.8, 0.6); g.save(); g.translate(960, 860); g.scale(Math.min(1, p), Math.min(1, p)); g.fillStyle = '#fff'; g.strokeStyle = '#231a33'; g.lineWidth = 5; g.beginPath(); g.roundRect(-380, -56, 760, 112, 56); g.fill(); g.stroke(); text(g, '“not working as expected”', 0, 16, { font: 'Jakarta', weight: 800, size: 44, color: '#231a33', align: 'center' }); g.restore(); }
  pill(g, t, 0.3, 'no timeline for full recovery', 140, D);
}
function twoLines(g, t, a) {
  g.fillStyle = '#06051a'; g.fillRect(0, 0, W, H); panel(g, 160, 140, 1600, 800);
  text(g, 'FRIDAY PRE-MARKET', 220, 220, { font: 'Jakarta', weight: 800, size: 30, color: LAV, spacing: 3 });
  const p = clamp((t - a + 0.5) / 3);
  const line = (fn, col, lab) => { g.save(); g.shadowColor = col; g.shadowBlur = 12; g.strokeStyle = col; g.lineWidth = 6; g.beginPath(); for (let i = 0; i <= 100 * p; i++) { const u = i / 100; const [x, y] = [220 + u * 1480, fn(u)]; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); g.restore(); const u = p; text(g, lab, 220 + u * 1480 + 20, fn(u) + 10, { font: 'Jakarta', weight: 800, size: 30, color: col }); };
  const r = rand(5); const noise = Array.from({ length: 101 }, () => (r() - 0.5) * 8);
  line((u) => 500 + noise[Math.floor(u * 100)] + Math.sin(u * 9) * 6, '#cfc6ff', 'NASDAQ futures ≈ 0%');
  line((u) => 420 + Math.pow(u, 1.5) * 300 + noise[Math.floor(u * 100)], RED, 'MSFT −2.8%');
  if (t > a + 1) { panel(g, 1300, 760, 420, 130); counter(g, t, a + 1, 1, 508, (v) => `~$${Math.round(v)}`, 1510, 850, { size: 72, color: RED }); }
}
function valueTower(g, t, a) {
  nightBG(g, t, { seed: 26, moonAt: [1600, 150] });
  const x0 = 760, x1 = 1160, top = 120, base = 980, floors = 30, fh = (base - top) / floors;
  const dim = Math.round(ez(span(t, a, 1.6)) * 3);
  for (let f = 0; f < floors; f++) { const y = top + f * fh, off = f < dim; g.fillStyle = off ? '#0e0c24' : '#1c1a44'; g.fillRect(x0, y, x1 - x0, fh - 3); if (!off) for (let c = 0; c < 10; c++) if (rand(f * 10 + c)() < 0.7) { g.fillStyle = 'rgba(150,200,255,0.75)'; g.fillRect(x0 + 12 + c * 38, y + 6, 22, fh - 14); } }
  g.fillStyle = 'rgba(200,190,255,0.6)'; g.fillRect(x1 - 2, top, 3, base - top);
  text(g, 'MSFT', (x0 + x1) / 2, top - 20, { font: 'Jakarta', weight: 800, size: 44, color: BLUE, align: 'center' });
  if (dim > 0) { panel(g, 1240, 160, 560, 170); text(g, '≈ −$100B', 1520, 260, { font: 'Jakarta', weight: 800, size: 80, color: RED, align: 'center' }); text(g, 'on paper · our estimate', 1520, 305, { font: 'Inter', weight: 600, size: 22, color: LAV, align: 'center' }); }
  panel(g, 140, 400, 520, 160); text(g, '~$3.8 trillion', 400, 490, { font: 'Jakarta', weight: 800, size: 54, color: INK, align: 'center' }); text(g, 'company value', 400, 530, { font: 'Inter', weight: 600, size: 22, color: LAV, align: 'center' });
}
function aiVsEmail(g, t, a) {
  g.fillStyle = '#06051a'; g.fillRect(0, 0, W, H);
  // glowing assistant orb
  const cx = 620, cy = 520; for (let i = 0; i < 4; i++) glow(g, cx, cy, 160 + i * 70, i % 2 ? '120,160,255' : '176,76,245', 0.18);
  g.save(); g.translate(cx, cy); g.rotate(t * 0.5); const og = g.createLinearGradient(-120, -120, 120, 120); og.addColorStop(0, '#4ea3ff'); og.addColorStop(0.5, '#b04cf5'); og.addColorStop(1, '#ff7ab8'); g.fillStyle = og; g.beginPath(); for (let k = 0; k < 6; k++) { const ang = (k / 6) * Math.PI * 2; g.ellipse(Math.cos(ang) * 40, Math.sin(ang) * 40, 70, 40, ang, 0, Math.PI * 2); } g.fill(); g.restore();
  text(g, 'AI · CLOUD', cx, cy + 230, { font: 'Jakarta', weight: 800, size: 34, color: INK, align: 'center', spacing: 4 });
  // frozen envelope
  const ex = 1320, ey = 520, ice = span(t, a, 1.2);
  envelope(g, ex, ey, 3);
  if (ice > 0) { g.save(); g.globalAlpha = 0.75 * ice; const ig = g.createLinearGradient(ex - 200, ey - 160, ex + 200, ey + 160); ig.addColorStop(0, 'rgba(200,235,255,0.9)'); ig.addColorStop(1, 'rgba(120,180,240,0.55)'); g.fillStyle = ig; g.beginPath(); g.roundRect(ex - 200, ey - 160, 400, 320, 30); g.fill(); g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 3; g.beginPath(); g.moveTo(ex - 150, ey - 120); g.lineTo(ex - 60, ey - 60); g.lineTo(ex - 100, ey + 20); g.stroke(); g.restore(); }
  text(g, 'ONE EMAIL', ex, ey + 230, { font: 'Jakarta', weight: 800, size: 34, color: '#a8d8ff', align: 'center', spacing: 4 });
}

function recovering(g, t, a0, aTeams, aMail, aStill) {
  nightBG(g, t, { seed: 31, moonAt: [1650, 150], horizon: '#3a2c55' });
  g.save(); g.globalCompositeOperation = 'lighter'; const dg = g.createLinearGradient(0, 1000, 0, 500); dg.addColorStop(0, `rgba(255,170,110,${0.25 * span(t, a0, 3)})`); dg.addColorStop(1, 'rgba(255,170,110,0)'); g.fillStyle = dg; g.fillRect(0, 0, W, H); g.restore();
  const card = (x, name, col, ic, at, state, note) => { const p = spring(t, at, 1.8, 0.6); if (p <= 0.01) return; g.save(); g.translate(x, 500); g.scale(Math.min(1, p), Math.min(1, p));
    const c = state === 'ok' ? '80,230,140' : '255,201,60'; glow(g, 0, 0, 300, c, 0.25);
    panel(g, -250, -230, 500, 460, 36); text(g, ic, 0, -40, { font: 'Jakarta', weight: 800, size: 130, color: col, align: 'center' });
    text(g, name, 0, 60, { font: 'Jakarta', weight: 800, size: 46, color: INK, align: 'center' });
    g.fillStyle = state === 'ok' ? '#1f8a5b' : '#8a6a10'; g.beginPath(); g.roundRect(-190, 100, 380, 76, 38); g.fill();
    const blink = state === 'ok' || Math.floor(t * 2.5) % 3 !== 0;
    text(g, note, 0, 150, { font: 'Jakarta', weight: 800, size: 30, color: '#fff', align: 'center', alpha: blink ? 1 : 0.55 }); g.restore(); };
  card(560, 'Teams', '#8b8df0', 'T', aTeams - 0.2, 'ok', 'restored ✓');
  card(1360, 'Outlook', '#4ea3ff', 'O', aMail - 0.2, 'part', t > aStill ? 'some still affected' : 'recovering…');
  pill(g, t, a0 + 0.3, 'Friday morning · Microsoft update', 90, D);
}
// ---------------------------------------------------------------- scenes
function c_open(g, s) {
  const t = s.t, b = (p) => at(s, p);
  shots(g, t, [b('Within about an hour') - 0.25, b("You couldn't send") - 0.25, b('The next morning') - 0.25], [
    (g2, tt) => { cam(g2, tt, { z0: 1.0, z1: 1.3, dur: 10, fx: 960, fy: 470 }); serverHall(g2, tt + 1, { fail: 0.05 + 0.45 * span(tt, 2, 8), beaconAt: 4 }); pill(g2, tt, 0.4, 'Thursday · 11:17 a.m. ET', 90, D); },
    (g2, tt) => { const a0 = b('Within about an hour'); cam(g2, tt - a0, { z0: 1.0, z1: 1.06, dur: 8 }); outageMap(g2, tt, { start: a0 + 0.2, dur: 5 }); const n = Math.round(74 * out3(span(tt, a0 + 0.2, 5))); panel(g2, 760, 60, 400, 130); text(g2, `${n}`, 960, 150, { font: 'Jakarta', weight: 800, size: 80, color: RED, align: 'center' }); text(g2, 'countries', 960, 180, { font: 'Inter', weight: 600, size: 20, color: LAV, align: 'center' }); },
    (g2, tt) => { const a0 = b("You couldn't send"); cam(g2, tt - a0, { z0: 1.0, z1: 1.12, dur: 6, fx: 900, fy: 500 }); deadInbox(g2, tt, { spinUntil: b('book') , stampAt: b('cancel') + 0.3 }); },
    (g2, tt) => { const a0 = b('The next morning'); cam(g2, tt - a0, { z0: 1.0, z1: 1.08, dur: 8, fx: 960, fy: 500 }); beforeBell(g2, tt + 2, { clock: 7.2 + (tt - a0) * 0.02 }); pill(g2, tt, a0 + 0.6, 'Friday · before the bell', 90, D); },
  ], ['blur', 'push', 'flash']);
}
function inbox(g, s) {
  const t = s.t, b = (p) => at(s, p);
  shots(g, t, [b('On the outage tracker') - 0.25, b('At its worst') - 0.25], [
    (g2, tt) => { cam(g2, tt, { z0: 1.0, z1: 1.06, dur: 8 }); const names = ['Outlook', 'Teams', 'OneDrive', 'SharePoint', 'Copilot']; appSigns(g2, tt, names.map((n) => span(tt, b(n) + 0.3, 0.8))); },
    (g2, tt) => { const a0 = b('On the outage tracker'); cam(g2, tt - a0, { z0: 1.0, z1: 1.05, dur: 7 }); spikeChart(g2, tt, b('140,000')); },
    (g2, tt) => { const a0 = b('At its worst'); cam(g2, tt - a0, { z0: 1.0, z1: 1.05, dur: 8 }); twoCounters(g2, tt, a0 + 0.4); },
  ], ['flash', 'push']);
}
function broke(g, s) {
  const t = s.t, b = (p) => at(s, p);
  shots(g, t, [b('Some servers were failing') - 0.25, b('Engineers patched') - 0.25, b('Microsoft said it saw no sign') - 0.25, b('The real cause') - 0.25], [
    (g2, tt) => { cam(g2, tt, { z0: 1.05, z1: 1.2, dur: 12, fx: 960, fy: 470 }); heatHall(g2, tt); pill(g2, tt, 0.4, '“elevated load across multiple regions”', 90, D); },
    (g2, tt) => { const a0 = b('Some servers were failing'); cam(g2, tt - a0, { z0: 1.0, z1: 1.06, dur: 10 }); rebootLoop(g2, tt - a0); pill(g2, tt, a0 + 0.4, 'failing health checks', 1010, D); },
    (g2, tt) => { const a0 = b('Engineers patched'); cam(g2, tt - a0, { z0: 1.0, z1: 1.05, dur: 6 }); patchRoute(g2, tt, a0 + 0.3); pill(g2, tt, a0 + 0.5, 'a fix to sign-in and routing', 1010, D); },
    (g2, tt) => { const a0 = b('Microsoft said it saw no sign'); cam(g2, tt - a0, { z0: 1.0, z1: 1.06, dur: 10 }); bsodBoard(g2, tt, b('2024 CrowdStrike')); pill(g2, tt, b('2024 CrowdStrike') + 0.4, 'like 2024: an update gone wrong, Australia’s minister said', 1010, { theme: 'dark', size: 26 }); },
    (g2, tt) => { const a0 = b('The real cause'); cam(g2, tt - a0, { z0: 1.0, z1: 1.1, dur: 5, fx: 960, fy: 600 }); sealedReport(g2, tt); },
  ], ['blur', 'push', 'flash', 'fade']);
}
function world(g, s) {
  const t = s.t, b = (p) => at(s, p);
  shots(g, t, [b('In Britain') - 0.25, b('The shipping giant') - 0.25, b('Airlines in India') - 0.25, b('Even AI companies') - 0.25], [
    (g2, tt) => { cam(g2, tt, { z0: 1.0, z1: 1.08, dur: 6 }); tokyo(g2, tt); pill(g2, tt, 0.4, 'Japan · ministries can’t email each other', 90, D); },
    (g2, tt) => { const a0 = b('In Britain'); cam(g2, tt - a0, { z0: 1.0, z1: 1.06, dur: 10 }); hospitalPolice(g2, tt, b('keep their appointments')); pill(g2, tt, a0 + 0.4, 'Britain', 90, D); },
    (g2, tt) => { const a0 = b('The shipping giant'); cam(g2, tt - a0, { z0: 1.0, z1: 1.08, dur: 10 }); portDelay(g2, tt, b('results were delayed')); pill(g2, tt, a0 + 0.4, 'Maersk · Euronext · Richemont · Workhorse', 90, D); },
    (g2, tt) => { const a0 = b('Airlines in India'); cam(g2, tt - a0, { z0: 1.0, z1: 1.06, dur: 12 }); runwayCities(g2, tt, b('In the US')); pill(g2, tt, a0 + 0.4, 'airlines in India reroute customer email', 90, D); },
    (g2, tt) => { const a0 = b('Even AI companies'); cam(g2, tt - a0, { z0: 1.0, z1: 1.05, dur: 6 }); aiLinks(g2, tt, a0); },
  ], ['push', 'blur', 'push', 'flash']);
}
function fix(g, s) {
  const t = s.t, b = (p) => at(s, p);
  shots(g, t, [b('To protect messages') - 0.25, b('But later') - 0.25], [
    (g2, tt) => { cam(g2, tt, { z0: 1.0, z1: 1.08, dur: 8, fx: 1400, fy: 500 }); asiaDawn(g2, tt); },
    (g2, tt) => { const a0 = b('To protect messages'); cam(g2, tt - a0, { z0: 1.0, z1: 1.05, dur: 10 }); retryConveyor(g2, tt, b('48 hours')); },
    (g2, tt) => { const a0 = b('But later'); cam(g2, tt - a0, { z0: 1.0, z1: 1.06, dur: 8 }); stalled(g2, tt - a0, b('not working') - a0); },
  ], ['blur', 'flash']);
}
function bell(g, s) {
  const t = s.t, b = (p) => at(s, p);
  shots(g, t, [b('On Friday morning') - 0.25, b('For a company') - 0.25, b('Microsoft is selling') - 0.25], [
    (g2, tt) => { cam(g2, tt, { z0: 1.0, z1: 1.1, dur: 9, fx: 960, fy: 450 }); beforeBell(g2, tt + 2, { clock: 4 + Math.min(5.5, tt * 0.9) }); pill(g2, tt, 0.4, 'pre-market: trading before the 9:30 bell', 90, D); },
    (g2, tt) => { const a0 = b('On Friday morning'); cam(g2, tt - a0, { z0: 1.0, z1: 1.04, dur: 10 }); twoLines(g2, tt, a0 + 0.4); },
    (g2, tt) => { const a0 = b('For a company'); cam(g2, tt - a0, { z0: 1.0, z1: 1.08, dur: 9, fx: 960, fy: 500 }); valueTower(g2, tt, b('100 billion') - 0.3); },
    (g2, tt) => { const a0 = b('Microsoft is selling'); cam(g2, tt - a0, { z0: 1.0, z1: 1.08, dur: 8 }); aiVsEmail(g2, tt, b('struggled')); },
  ], ['push', 'blur', 'flash']);
}
function outro(g, s) {
  const t = s.t, b = (p) => at(s, p);
  shots(g, t, [b('By Friday morning') - 0.25, b('This story is still') - 0.25], [
    (g2, tt) => { cam(g2, tt, { z0: 1.06, z1: 1.0, dur: 8 }); outageMap(g2, tt + 8, { start: 0, dur: 0.1 }); g2.save(); g2.globalCompositeOperation = 'color'; g2.fillStyle = `rgba(255,190,80,${0.35 * span(tt, 0.5, 4)})`; g2.fillRect(0, 0, W, H); g2.restore(); pill(g2, tt, 0.5, 'governments · hospitals · airlines · markets', 90, D); },
    (g2, tt) => { const a0 = b('By Friday morning'); cam(g2, tt - a0, { z0: 1.0, z1: 1.06, dur: 9 }); recovering(g2, tt, a0, b('Teams was back'), b('encouraging'), b('still having problems')); },
    (g2, tt) => { const a0 = b('This story is still'); nightBG(g2, tt, { seed: 30, rainA: 0.3, moonAt: [1500, 160] }); mist(g2, tt, { y: 900, h: 160, alpha: 0.2 }); text(g2, 'Still developing', W / 2, 520, { font: 'Jakarta', weight: 700, size: 110, color: INK, align: 'center', alpha: span(tt, a0 + 0.2, 0.6) }); pill(g2, tt, a0 + 0.6, 'as of Friday 13 November', 620, D); },
  ], ['push', 'blur']);
}
function chapterCard(num, title) {
  return (g, s) => {
    const t = s.t;
    g.save(); cam(g, t, { z0: 1.0, z1: 1.05, dur: 3 }); nightBG(g, t + 20, { seed: 40 + num, rainA: 0.25 }); g.restore();
    const p = spring(t, 0.1, 1.4, 0.7);
    g.save(); g.translate(W / 2, 470); g.scale(lerp(0.8, 1, Math.min(1, p)), lerp(0.8, 1, Math.min(1, p))); g.globalAlpha = Math.min(1, p);
    text(g, String(num).padStart(2, '0'), 0, 40, { font: 'Jakarta', weight: 800, size: 220, color: 'rgba(185,162,255,0.22)', align: 'center' });
    g.restore();
    pill(g, t, 0.3, `Chapter ${num}`, 560, { size: 28, theme: 'dark' });
    const tp = span(t, 0.5, 0.6);
    text(g, title, W / 2, 700 + (1 - out3(tp)) * 40, { font: 'Jakarta', weight: 700, size: 96, color: INK, align: 'center', alpha: tp });
  };
}

// ---------------------------------------------------------------- assembly
const LIGHT = {
  title: [{ type: 'sting', title: 'Toppled Giants', sub: 'Episode 6 · The Day Email Stopped' }],
  sub: [{ type: 'subscribe', clickWhen: 'tap subscribe', text: 'it really helps the channel' }],
  endcard: [{ type: 'subscribe', clickWhen: 'Subscribe', text: 'see you in the next story' }],
};
const lightScenes = Object.fromEntries(Object.entries(LIGHT).map(([k, v]) => [k, lightScene(v)]));
export const scenes = {
  c_open, ...lightScenes, inbox, broke, world, fix, bell, outro,
  chapter1: chapterCard(1, 'The Day the Inbox Died'), chapter2: chapterCard(2, 'What Broke'), chapter3: chapterCard(3, 'A World Without Email'),
  chapter4: chapterCard(4, 'The Fix That Didn’t Work'), chapter5: chapterCard(5, 'Before the Bell'),
};
let lightRanges = [];
export async function preload() { await loadLand(); try { const tl = await (await fetch('/build/ep06-microsoft-outage/timeline.json')).json(); lightRanges = tl.scenes.filter((x) => LIGHT[x.id]).map((x) => [x.start - 0.3, x.start + x.duration + 0.3]); } catch { /* none */ } }
export const look = { finish: (ctx, frame) => { const T = frame / 30; if (!lightRanges.some(([a, b]) => T >= a && T < b)) nightFinish(ctx, frame); } };
export const hits = [];
export const extraHits = (timeline) => {
  const out = [...lightSounds(timeline, LIGHT)];
  const sc = (id) => timeline.scenes.find((x) => x.id === id);
  const w = (id, p) => { const x = sc(id); return x.start + when(sceneWords(x.cues), p); };
  const S = (t, kind, vol = 0.6) => out.push({ t, kind, vol });
  const cuts = { c_open: ['Within about an hour', "You couldn't send", 'The next morning'], inbox: ['On the outage tracker', 'At its worst'], broke: ['Some servers were failing', 'Engineers patched', 'Microsoft said it saw no sign', 'The real cause'], world: ['In Britain', 'The shipping giant', 'Airlines in India', 'Even AI companies'], fix: ['To protect messages', 'But later'], bell: ['On Friday morning', 'For a company', 'Microsoft is selling'], outro: ['By Friday morning', 'This story is still'] };
  Object.entries(cuts).forEach(([id, ps]) => ps.forEach((p) => S(w(id, p) - 0.35, 'whoosh', 0.35)));
  ['chapter1', 'chapter2', 'chapter3', 'chapter4', 'chapter5'].forEach((c) => S(sc(c).start + 0.15, 'hit', 0.6));
  S(sc('c_open').start + 4.2, 'hit', 0.5); for (let k = 0; k < 8; k++) S(w('c_open', 'Within about an hour') + 0.4 + k * 0.6, 'tick', 0.35);
  S(w('c_open', 'cancel') + 0.3, 'pop', 0.9); S(w('c_open', 'cancel') + 0.3, 'hit', 0.4);
  ['Outlook', 'Teams', 'OneDrive', 'SharePoint', 'Copilot'].forEach((p) => S(w('inbox', p) + 0.3, 'tick', 0.5));
  S(w('inbox', '140,000'), 'hit', 0.6); S(w('inbox', 'At its worst') + 0.4, 'pop', 0.6);
  S(w('broke', 'Engineers patched') + 0.6, 'pop', 0.6); S(w('broke', '2024 CrowdStrike'), 'whoosh', 0.5);
  S(w('world', 'keep their appointments'), 'pop', 0.5); S(w('world', 'results were delayed') + 0.5, 'pop', 0.8);
  S(w('fix', '48 hours'), 'pop', 0.6); S(w('fix', 'not working'), 'hit', 0.6);
  S(w('bell', '100 billion'), 'hit', 0.6); S(w('bell', 'struggled'), 'whoosh', 0.4);
  return out;
};
void TEAL; void cityWindow; void BLUE;
