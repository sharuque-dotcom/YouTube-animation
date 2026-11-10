// "Act it out" shots: story moments played as little animated scenes, in the light purple style.
// Each is a shot type for lightshots.js: (g, sh, x) with x = { T, a, b, p, words, kit }.
// Timing comes from spoken phrases (sh.* fields name the phrase each beat lands on).

import { W, H, clamp, lerp, rand, text } from './engine.js';
import { ez, span, img } from './motion.js';
import { when } from './shots.js';
import { UI, spring, ease, inOut, card, chip, lightMap, mapPin } from './lightui.js';
import { person, chipIcon, heart } from './fx.js';

const NV = '#76b900';
const at = (x, phrase, fb) => (phrase ? when(x.words, phrase, x.a) : fb);
const pop = (T, a, o) => Math.min(1.06, spring(T, a, o || { freq: 1.7, damp: 0.62 }));
function imageIn(g, key, x, y, w, h) {
  const im = img(key);
  if (!im) return;
  const s = Math.min(w / im.width, h / im.height);
  g.drawImage(im, x + (w - im.width * s) / 2, y + (h - im.height * s) / 2, im.width * s, im.height * s);
}
function star(g, cx, cy, r, rot = -Math.PI / 2) {
  g.beginPath();
  for (let i = 0; i < 10; i++) { const a = rot + (i * Math.PI) / 5, rr = i % 2 ? r * 0.42 : r; g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
  g.closePath(); g.fill();
}

// ---------------------------------------------------------------- props
/** Simple national flags, centred, width w (3:2) */
export function flag(g, code, cx, cy, w) {
  const h = w * 0.66, x = cx - w / 2, y = cy - h / 2;
  g.save();
  g.shadowColor = 'rgba(40,20,80,0.25)'; g.shadowBlur = 18; g.shadowOffsetY = 8;
  g.fillStyle = '#fff'; g.beginPath(); g.roundRect(x - 6, y - 6, w + 12, h + 12, 10); g.fill();
  g.shadowColor = 'transparent';
  g.beginPath(); g.roundRect(x, y, w, h, 6); g.clip();
  if (code === 'US') {
    for (let i = 0; i < 13; i++) { g.fillStyle = i % 2 ? '#fff' : '#c8313e'; g.fillRect(x, y + (i * h) / 13, w, h / 13 + 1); }
    g.fillStyle = '#2b3a78'; g.fillRect(x, y, w * 0.42, h * 0.54);
    g.fillStyle = '#fff';
    for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) { g.beginPath(); g.arc(x + w * 0.05 + c * w * 0.08, y + h * 0.08 + r * h * 0.12, w * 0.012, 0, Math.PI * 2); g.fill(); }
  } else if (code === 'CN') {
    g.fillStyle = '#de2910'; g.fillRect(x, y, w, h);
    g.fillStyle = '#ffde00'; star(g, x + w * 0.17, y + h * 0.26, w * 0.09);
    [[0.33, 0.1], [0.4, 0.2], [0.4, 0.34], [0.33, 0.44]].forEach(([a, b]) => star(g, x + w * a, y + h * b, w * 0.03));
  } else if (code === 'SG') {
    g.fillStyle = '#ef3340'; g.fillRect(x, y, w, h / 2);
    g.fillStyle = '#fff'; g.fillRect(x, y + h / 2, w, h / 2);
    g.beginPath(); g.arc(x + w * 0.2, y + h * 0.25, h * 0.15, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#ef3340'; g.beginPath(); g.arc(x + w * 0.24, y + h * 0.25, h * 0.15, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#fff'; for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5; star(g, x + w * 0.33 + Math.cos(a) * h * 0.08, y + h * 0.25 + Math.sin(a) * h * 0.08, h * 0.035); }
  } else if (code === 'TW') {
    g.fillStyle = '#e00'; g.fillRect(x, y, w, h);
    g.fillStyle = '#1a3a9a'; g.fillRect(x, y, w / 2, h / 2);
    g.fillStyle = '#fff'; star(g, x + w / 4, y + h / 4, h * 0.17, 0); g.fillStyle = '#1a3a9a'; g.beginPath(); g.arc(x + w / 4, y + h / 4, h * 0.08, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(x + w / 4, y + h / 4, h * 0.065, 0, Math.PI * 2); g.fill();
  } else if (code === 'ISLAND') {
    g.fillStyle = '#bfe6f5'; g.fillRect(x, y, w, h);
    g.fillStyle = '#f2d59b'; g.beginPath(); g.ellipse(cx, y + h * 0.92, w * 0.42, h * 0.22, 0, Math.PI, Math.PI * 2); g.fill();
    g.strokeStyle = '#8a5a2b'; g.lineWidth = w * 0.03; g.beginPath(); g.moveTo(cx, y + h * 0.75); g.quadraticCurveTo(cx + w * 0.05, y + h * 0.45, cx - w * 0.02, y + h * 0.3); g.stroke();
    g.fillStyle = '#2f9e5b';
    [-1.2, -0.4, 0.4, 1.2].forEach((a) => { g.save(); g.translate(cx - w * 0.02, y + h * 0.3); g.rotate(a); g.beginPath(); g.ellipse(w * 0.11, 0, w * 0.12, h * 0.05, 0, 0, Math.PI * 2); g.fill(); g.restore(); });
  }
  g.restore();
}
function ship(g, x, y, s, flip = 1) {
  g.save(); g.translate(x, y); g.scale(s * flip, s);
  g.fillStyle = UI.purple; g.beginPath(); g.moveTo(-60, 0); g.lineTo(60, 0); g.lineTo(46, 22); g.lineTo(-50, 22); g.closePath(); g.fill();
  ['#ff8a65', '#ffd166', '#7fc8a9', '#b39ddb', '#ff8a65'].forEach((c, i) => { g.fillStyle = c; g.fillRect(-46 + i * 18, -18, 16, 18); });
  g.fillStyle = '#fff'; g.fillRect(36, -30, 16, 30);
  g.restore();
}
function plane(g, x, y, s, rot) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  g.fillStyle = UI.purple;
  g.beginPath(); g.ellipse(0, 0, 46, 9, 0, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.moveTo(-6, 0); g.lineTo(-22, -40); g.lineTo(-10, -40); g.lineTo(18, 0); g.lineTo(-10, 40); g.lineTo(-22, 40); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(-34, 0); g.lineTo(-46, -16); g.lineTo(-38, -16); g.lineTo(-26, 0); g.lineTo(-38, 16); g.lineTo(-46, 16); g.closePath(); g.fill();
  g.fillStyle = '#fff'; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(14 - i * 10, -2, 2.2, 0, Math.PI * 2); g.fill(); }
  g.restore();
}
function paperPlane(g, x, y, s, rot) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(40, 0); g.lineTo(-30, -24); g.lineTo(-14, 0); g.closePath(); g.fill();
  g.fillStyle = '#ddd3f7'; g.beginPath(); g.moveTo(40, 0); g.lineTo(-14, 0); g.lineTo(-30, 20); g.closePath(); g.fill();
  g.fillStyle = '#b9a2ff'; g.beginPath(); g.moveTo(40, 0); g.lineTo(-14, 0); g.lineTo(-20, 8); g.closePath(); g.fill();
  g.restore();
}
/** A white notification card sliding in from the right */
function notif(g, T, a, x, y, title, sub, { icon = 'JH', color = UI.purple } = {}) {
  const p = spring(T, a, { freq: 1.6, damp: 0.7 });
  if (p <= 0.01) return;
  g.save(); g.translate(lerp(W + 200, x, Math.min(1, p)), y);
  card(g, 0, 0, 470, 116, { r: 26 }, (cg) => {
    cg.fillStyle = color; cg.beginPath(); cg.arc(58, 58, 34, 0, Math.PI * 2); cg.fill();
    text(cg, icon, 58, 69, { font: UI.HEAD, weight: 700, size: 28, color: '#fff', align: 'center' });
    text(cg, title, 112, 50, { font: UI.HEAD, weight: 700, size: 26, color: UI.ink });
    text(cg, sub, 112, 86, { font: UI.BODY, weight: 400, size: 22, color: UI.muted });
  });
  const ph = clamp((T - a) / 0.6);
  if (ph < 1) { g.strokeStyle = `rgba(185,162,255,${1 - ph})`; g.lineWidth = 4; g.beginPath(); g.roundRect(-ph * 30, -ph * 30, 470 + ph * 60, 116 + ph * 60, 30); g.stroke(); }
  g.restore();
}

// ---------------------------------------------------------------- shots
const A = {};

/** Dark room: a figure types at a laptop, hits send, the email flies off as a paper plane, notifications ping */
A.sendmail = (g, sh, x) => {
  const T = x.T, send = at(x, sh.send, x.a + 3);
  // window with moonlight
  g.save(); g.globalAlpha = 0.8;
  const wg = g.createLinearGradient(0, 140, 0, 560); wg.addColorStop(0, '#3a3270'); wg.addColorStop(1, '#5b4b9a');
  g.fillStyle = wg; g.beginPath(); g.roundRect(150, 130, 380, 420, 14); g.fill();
  g.fillStyle = '#f3efff'; g.beginPath(); g.arc(430, 230, 44, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#4a3f86'; g.beginPath(); g.arc(452, 218, 40, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#1b1433'; g.lineWidth = 12; g.beginPath(); g.moveTo(340, 130); g.lineTo(340, 550); g.moveTo(150, 340); g.lineTo(530, 340); g.stroke();
  g.restore();
  // screen glow
  const glow = g.createRadialGradient(1060, 600, 40, 1060, 600, 700);
  glow.addColorStop(0, 'rgba(200,185,255,0.45)'); glow.addColorStop(1, 'rgba(200,185,255,0)');
  g.fillStyle = glow; g.fillRect(0, 0, W, H);
  // the figure
  const tap = clamp(1 - Math.abs(T - send) / 0.18);
  const typing = T < send ? Math.sin(T * 22) * 0.07 : 0;
  person(g, 640, 640, 1.5, T, { jacket: '#26222f', shirt: '#4a2a8c', armL: 1.15 + typing, armR: 1.3 - typing - tap * 0.25, seed: 4, glasses: false });
  // desk
  g.fillStyle = '#1a1230'; g.fillRect(0, 790, W, H - 790);
  g.fillStyle = '#2c2350'; g.fillRect(0, 784, W, 12);
  // laptop
  g.save(); g.translate(1070, 600);
  g.fillStyle = '#2b2440'; g.beginPath(); g.moveTo(-250, 190); g.lineTo(250, 190); g.lineTo(290, 214); g.lineTo(-290, 214); g.closePath(); g.fill();
  g.fillStyle = '#3a3156'; g.beginPath(); g.roundRect(-232, -180, 464, 370, 16); g.fill();
  g.fillStyle = '#ffffff'; g.beginPath(); g.roundRect(-214, -162, 428, 334, 8); g.fill();
  g.fillStyle = UI.purple; g.fillRect(-214, -162, 428, 46);
  text(g, 'New message', -194, -131, { font: UI.HEAD, weight: 700, size: 22, color: '#fff' });
  text(g, 'To: All Nvidia employees', -194, -78, { font: UI.BODY, weight: 600, size: 20, color: UI.ink });
  g.fillStyle = UI.line; g.fillRect(-194, -62, 388, 2);
  const typed = clamp((T - x.a) / Math.max(1, send - x.a - 0.3));
  for (let i = 0; i < 5; i++) { const w = [340, 300, 360, 220, 260][i] * clamp(typed * 5 - i); if (w > 0) { g.fillStyle = '#d9d3e8'; g.beginPath(); g.roundRect(-194, -40 + i * 28, w, 12, 6); g.fill(); } }
  const bs = 1 - tap * 0.15;
  g.save(); g.translate(150, 132); g.scale(bs, bs);
  g.fillStyle = T > send ? UI.green : UI.purple; g.beginPath(); g.roundRect(-52, -20, 104, 40, 20); g.fill();
  text(g, T > send ? 'Sent' : 'Send', 0, 8, { font: UI.HEAD, weight: 700, size: 20, color: '#fff', align: 'center' });
  g.restore();
  g.restore();
  // paper plane out of the screen
  const fp = clamp((T - send - 0.2) / 1.6);
  if (fp > 0 && fp < 1) {
    const e = ez.p2InOut(fp);
    const px = lerp(1220, 2150, e), py = 730 - Math.sin(e * Math.PI) * 520 - e * 300;
    g.save(); g.setLineDash([4, 18]); g.lineCap = 'round'; g.strokeStyle = 'rgba(243,239,255,0.6)'; g.lineWidth = 5;
    g.beginPath();
    for (let i = 0; i <= 30; i++) { const ee = ez.p2InOut(fp * (i / 30)); const qx = lerp(1220, 2150, ee), qy = 730 - Math.sin(ee * Math.PI) * 520 - ee * 300; i ? g.lineTo(qx, qy) : g.moveTo(qx, qy); }
    g.stroke(); g.restore();
    paperPlane(g, px, py, 2.2 - e * 0.6, -0.5 + Math.cos(e * Math.PI) * -0.3);
  }
  // inbox pings
  notif(g, T, send + 0.9, 1380, 170, 'Jensen Huang', 'To: all Nvidia employees');
  notif(g, T, send + 1.3, 1380, 310, '1 new message', 'Sunday, 8 November 2026', { icon: '✉', color: UI.red });
  if (sh.text) x.kit.pill(g, sh.text, W / 2, 930, at(x, sh.textWhen, x.a + 0.4), T, { size: 32 });
  if (sh.date) x.kit.pill(g, sh.date, W / 2, 70, at(x, sh.dateWhen, x.a + 0.3), T, { size: 28, fill: UI.soft, color: UI.purple });
};

/** Chips stack into a tower as the number counts up */
A.chipstack = (g, sh, x) => {
  const T = x.T, land = Math.max(at(x, sh.when, x.a + 2), x.a + 1.2) + 0.4;
  const N = sh.count || 22, prog = clamp((T - x.a - 0.15) / (land - x.a - 0.15));
  const cx = 640, base = 900, th = 28;
  // floor shadow
  g.fillStyle = 'rgba(74,42,140,0.12)'; g.beginPath(); g.ellipse(cx, base + 20, 230, 46, 0, 0, Math.PI * 2); g.fill();
  for (let i = 0; i < N; i++) {
    const born = x.a + 0.15 + (i / N) * (land - x.a - 0.15);
    const lt = T - born;
    if (lt < 0) continue;
    const fall = Math.min(1, lt / 0.28), y = base - i * th - (1 - fall) * 500, wob = (rand(i + 3)() - 0.5) * 16;
    g.save(); g.translate(cx + wob, y);
    const w = 190, d = 70;
    g.fillStyle = '#1f1a2e'; g.beginPath(); g.moveTo(-w, 0); g.lineTo(0, d); g.lineTo(0, d + th - 6); g.lineTo(-w, th - 6); g.closePath(); g.fill();
    g.fillStyle = '#2b2440'; g.beginPath(); g.moveTo(w, 0); g.lineTo(0, d); g.lineTo(0, d + th - 6); g.lineTo(w, th - 6); g.closePath(); g.fill();
    g.fillStyle = '#3a3156'; g.beginPath(); g.moveTo(0, -d); g.lineTo(w, 0); g.lineTo(0, d); g.lineTo(-w, 0); g.closePath(); g.fill();
    g.fillStyle = NV; g.beginPath(); g.moveTo(0, -d * 0.55); g.lineTo(w * 0.55, 0); g.lineTo(0, d * 0.55); g.lineTo(-w * 0.55, 0); g.closePath(); g.fill();
    g.fillStyle = '#d4c56a'; for (let k = -4; k <= 4; k++) { g.fillRect(-w + 18 + (k + 4) * 19, th * 0.2 + (k + 4) * 7.6, 6, 10); }
    g.restore();
  }
  const v = (sh.value || 4.8) * ez.expoOut(prog);
  text(g, `$${v.toFixed(1)}`, 1360, 520, { font: UI.HEAD, weight: 700, size: 230, color: UI.purple, align: 'center' });
  text(g, 'billion', 1360, 640, { font: UI.HEAD, weight: 600, size: 90, color: UI.ink, align: 'center', alpha: clamp((T - x.a - 0.3) * 3) });
  if (sh.label) x.kit.pill(g, sh.label, 1360, 700, land - 0.2, T, { size: 32 });
  if (sh.sub) x.kit.pill(g, sh.sub, 1360, 790, land + 0.2, T, { size: 26, fill: UI.soft, color: UI.purple });
};

/** A small plane crosses the Pacific from Taiwan to the US */
A.flight = (g, sh, x) => {
  const T = x.T;
  const k = 9.5 * (1 + 0.03 * x.p);
  const proj = lightMap(g, -178, 32, k, { wrap: true });
  const tw = proj([121 - 360, 23.7]), us = proj([-122, 37.6]);
  const dep = at(x, sh.depart, x.a + 2) - 0.3, arr = dep + 1.9;
  const a1 = Math.min(at(x, sh.from, x.a + 0.3), x.a + 0.35);
  mapPin(g, T, a1, tw[0], tw[1], { scale: 0.9 });
  const lp = spring(T, a1 + 0.15);
  chip(g, sh.fromLabel || 'Taiwan · 1963', tw[0] - 120, tw[1] + 40, { size: 28, weight: 600, scale: lp, alpha: Math.min(1, lp), stroke: null });
  const fp = clamp((T - dep) / (arr - dep));
  const mx = (tw[0] + us[0]) / 2, my = Math.min(tw[1], us[1]) - 260;
  const bez = (t) => [(1 - t) ** 2 * tw[0] + 2 * (1 - t) * t * mx + t * t * us[0], (1 - t) ** 2 * tw[1] + 2 * (1 - t) * t * my + t * t * us[1]];
  if (fp > 0) {
    const e = ez.p2InOut(fp);
    g.save(); g.setLineDash([3, 16]); g.lineCap = 'round'; g.strokeStyle = UI.purple; g.lineWidth = 6; g.beginPath();
    for (let i = 0; i <= 60 * e; i++) { const [px, py] = bez(i / 60); i ? g.lineTo(px, py) : g.moveTo(px, py); }
    g.stroke(); g.restore();
    const [px, py] = bez(e), [qx, qy] = bez(Math.min(1, e + 0.01));
    if (fp < 1) plane(g, px, py, 1.1, Math.atan2(qy - py, qx - px));
  }
  if (fp >= 1 || T > arr) {
    mapPin(g, T, arr, us[0], us[1], { scale: 0.9 });
    const up = spring(T, arr + 0.15);
    chip(g, sh.toLabel || 'United States', us[0] + 30, us[1] - 26, { size: 28, weight: 600, scale: up, alpha: Math.min(1, up), stroke: null });
  }
  if (sh.text) x.kit.pill(g, sh.text, W / 2, 110, x.a + 0.5, T, { size: 32 });
};

/** Game controller dissolves into a neural network that lights up; every AI system wires into Nvidia */
const PAD = (() => {
  const pts = [];
  for (let i = 0; i < 70; i++) { const a = (i / 70) * Math.PI * 2; const rx = 300 + 40 * Math.cos(2 * a), ry = 150 + 50 * Math.max(0, Math.sin(a)); pts.push([Math.cos(a) * rx, Math.sin(a) * ry]); }
  [[-170, -20], [170, -40], [210, 0], [170, 40], [130, 0], [-210, -20], [-130, -20], [-170, -60], [-170, 20]].forEach((p) => pts.push(p));
  return pts;
})();
const NET = (() => {
  const layers = [4, 7, 7, 4], nodes = [];
  layers.forEach((n, li) => { for (let i = 0; i < n; i++) nodes.push({ x: -480 + li * 320, y: (i - (n - 1) / 2) * 110, li }); });
  const edges = [];
  nodes.forEach((a, i) => nodes.forEach((b, j) => { if (b.li === a.li + 1 && (rand(i * 31 + j)() < 0.55)) edges.push([i, j]); }));
  return { nodes, edges };
})();
A.aiboom = (g, sh, x) => {
  const T = x.T, cx = W / 2, cy = 470;
  const dis = at(x, sh.dissolve, x.a + 4), lit = at(x, sh.boom, x.a + 9), hub = at(x, sh.hub, lit + 3);
  const m = ez.p2InOut(clamp((T - dis) / 1.6));
  g.save(); g.translate(cx, cy);
  // the controller (solid) fades as its dots fly to the network
  const pin = pop(T, x.a + 0.1);
  if (m < 1) {
    g.save(); g.globalAlpha = 1 - m; g.scale(pin, pin);
    g.fillStyle = '#2b2440'; g.beginPath(); PAD.slice(0, 70).forEach(([a, b], i) => (i ? g.lineTo(a, b) : g.moveTo(a, b))); g.closePath(); g.fill();
    g.fillStyle = '#3a3156'; g.beginPath(); g.arc(-170, -20, 62, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#ffd166'; g.fillRect(-190, -26, 40, 12); g.fillRect(-176, -40, 12, 40);
    [[170, -40, '#ff6b6b'], [210, 0, '#4dd4ac'], [170, 40, '#6ea8ff'], [130, 0, '#ffd166']].forEach(([a, b, c]) => { g.fillStyle = c; g.beginPath(); g.arc(a, b, 18, 0, Math.PI * 2); g.fill(); });
    // pixels popping (video games look better)
    const r = rand(9);
    for (let i = 0; i < 14; i++) { const ph = ((T - x.a) * 0.9 + r()) % 1; g.fillStyle = ['#ff6b6b', '#ffd166', '#4dd4ac', '#b9a2ff'][i % 4]; g.globalAlpha = (1 - m) * Math.sin(ph * Math.PI); const s = 14 + r() * 14; g.fillRect(-380 + r() * 760, -260 - ph * 160, s, s); }
    g.restore();
  }
  // edges and nodes of the network
  if (m > 0) {
    const glow = clamp((T - lit) / 0.6);
    g.lineWidth = 3;
    NET.edges.forEach(([i, j], k) => {
      const a = NET.nodes[i], b = NET.nodes[j];
      g.strokeStyle = `rgba(74,42,140,${0.18 * m + 0.25 * glow})`;
      g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
      if (glow > 0) { const ph = ((T - lit) * 1.2 + rand(k)()) % 1; g.fillStyle = NV; g.beginPath(); g.arc(lerp(a.x, b.x, ph), lerp(a.y, b.y, ph), 5, 0, Math.PI * 2); g.fill(); }
    });
  }
  NET.nodes.forEach((n, i) => {
    const src = PAD[(i * 5) % PAD.length], d = clamp(m * 1.4 - (i / NET.nodes.length) * 0.4);
    const px = lerp(src[0] * pin, n.x, ez.p2InOut(d)), py = lerp(src[1] * pin, n.y, ez.p2InOut(d));
    if (m <= 0) return;
    const on = clamp((T - lit - n.li * 0.25) / 0.4);
    g.fillStyle = on > 0 ? NV : UI.purple; g.beginPath(); g.arc(px, py, 14 + on * 6, 0, Math.PI * 2); g.fill();
    if (on > 0) { g.fillStyle = `rgba(118,185,0,${0.25 * on})`; g.beginPath(); g.arc(px, py, 34, 0, Math.PI * 2); g.fill(); }
  });
  g.restore();
  // hub: Nvidia under everything
  const hp = pop(T, hub);
  if (hp > 0.01) {
    g.save(); g.translate(cx, 860); g.scale(hp, hp);
    card(g, -190, -60, 380, 120, { r: 30 }, (cg) => imageIn(cg, 'nvidialogo', 40, 24, 300, 72));
    g.restore();
    g.strokeStyle = 'rgba(118,185,0,0.6)'; g.lineWidth = 3; g.setLineDash([6, 10]);
    NET.nodes.filter((n) => n.li === 3).forEach((n) => { g.beginPath(); g.moveTo(cx + n.x, cy + n.y); g.lineTo(cx, 800); g.stroke(); });
    g.setLineDash([]);
  }
  const label = T < dis ? sh.labels[0] : T < lit ? sh.labels[1] : sh.labels[2];
  const la = T < dis ? x.a + 0.4 : T < lit ? dis + 0.3 : lit + 0.2;
  x.kit.pill(g, label, W / 2, 90, la, T, { size: 32 });
};

/** Bar-chart race of company values: Nvidia climbs from the bottom past Apple and the rest */
A.race = (g, sh, x) => {
  const T = x.T, end = Math.max(at(x, sh.when, x.a + 5), x.a + 4.5);
  const years = sh.years, cos = sh.companies;
  const yp = clamp((T - x.a - 0.3) / (end - x.a - 0.3)) * (years.length - 1);
  const i0 = Math.floor(Math.min(yp, years.length - 1.001)), f = ez.p2InOut(yp - i0);
  const vals = cos.map((c) => lerp(c.v[i0], c.v[Math.min(i0 + 1, years.length - 1)], f));
  const rankAt = (k) => { const v = cos.map((c) => c.v[k]); return cos.map((c, i) => v.filter((u) => u > v[i]).length); };
  const r0 = rankAt(i0), r1 = rankAt(Math.min(i0 + 1, years.length - 1));
  const max = Math.max(...vals) * 1.08;
  const x0 = 420, x1 = 1640, y0 = 250, rowH = 132;
  cos.forEach((c, i) => {
    const rk = lerp(r0[i], r1[i], ez.p2InOut(clamp((yp - i0 - 0.2) / 0.6)));
    const y = y0 + rk * rowH, w = (x1 - x0) * (vals[i] / max);
    const ap = pop(T, x.a + 0.1 + i * 0.06);
    g.save(); g.globalAlpha = Math.min(1, ap);
    text(g, c.name, x0 - 30, y + 62, { font: UI.HEAD, weight: 700, size: 40, color: c.hero ? UI.ink : UI.muted, align: 'right' });
    g.fillStyle = c.color; g.beginPath(); g.roundRect(x0, y + 14, Math.max(30, w * Math.min(1, ap)), 84, 22); g.fill();
    if (c.hero) { g.shadowColor = 'rgba(118,185,0,0.5)'; g.shadowBlur = 30; g.fill(); g.shadowColor = 'transparent'; }
    text(g, `$${vals[i].toFixed(1)}T`, x0 + w + 20, y + 70, { font: UI.HEAD, weight: 700, size: 34, color: UI.ink });
    g.restore();
  });
  // year ticker
  const yr = Math.round(lerp(years[i0], years[Math.min(i0 + 1, years.length - 1)], f));
  text(g, String(yr), 1700, 960, { font: UI.HEAD, weight: 700, size: 150, color: 'rgba(74,42,140,0.16)', align: 'right' });
  // crown when Nvidia is first
  const hero = cos.findIndex((c) => c.hero);
  if (T > end) {
    const cp = pop(T, end + 0.1);
    const y = y0 + r1[hero] * rowH;
    g.save(); g.translate(x0 - 230, y + 52); g.scale(cp, cp);
    g.fillStyle = '#ffc93c'; g.beginPath(); g.moveTo(-40, 24); g.lineTo(-48, -22); g.lineTo(-22, 0); g.lineTo(0, -34); g.lineTo(22, 0); g.lineTo(48, -22); g.lineTo(40, 24); g.closePath(); g.fill();
    g.restore();
  }
  x.kit.pill(g, sh.title, W / 2, 110, x.a + 0.3, T, { size: 32 });
  if (sh.note) text(g, sh.note, W / 2, 1040, { font: UI.BODY, weight: 400, size: 22, color: UI.faint, align: 'center', alpha: clamp((T - x.a - 1) * 2) });
};

/** Keynote stage: the leather jacket, a big screen, camera flashes */
A.keynote = (g, sh, x) => {
  const T = x.T;
  g.fillStyle = '#140f26'; g.fillRect(0, 0, W, H);
  // screen
  const sp = pop(T, x.a + 0.1);
  g.save(); g.translate(W / 2, 330); g.scale(sp, sp);
  const sg = g.createLinearGradient(-560, -230, 560, 230); sg.addColorStop(0, '#1e1838'); sg.addColorStop(1, '#2c2350');
  g.fillStyle = sg; g.beginPath(); g.roundRect(-560, -230, 1120, 460, 20); g.fill();
  g.fillStyle = 'rgba(118,185,0,0.15)'; g.beginPath(); g.roundRect(-560, -230, 1120, 460, 20); g.fill();
  const im = img('nvidialogo');
  if (im) { g.save(); g.globalCompositeOperation = 'screen'; g.filter = 'invert(1) hue-rotate(180deg)'; imageIn(g, 'nvidialogo', -330, -110, 660, 220); g.restore(); }
  g.restore();
  // spotlight
  const sl = g.createRadialGradient(W / 2, 760, 20, W / 2, 760, 520);
  sl.addColorStop(0, 'rgba(255,245,220,0.55)'); sl.addColorStop(1, 'rgba(255,245,220,0)');
  g.fillStyle = sl; g.beginPath(); g.moveTo(W / 2 - 90, 0); g.lineTo(W / 2 + 90, 0); g.lineTo(W / 2 + 420, 980); g.lineTo(W / 2 - 420, 980); g.closePath(); g.fill();
  // stage
  g.fillStyle = '#231b3f'; g.fillRect(0, 900, W, 180);
  g.fillStyle = '#3a3156'; g.fillRect(0, 892, W, 10);
  // the figure in the leather jacket, waving
  const jp = spring(T, x.a + 0.3, { freq: 1.3, damp: 0.7 });
  person(g, lerp(W + 200, W / 2, Math.min(1, jp)), 730, 1.35, T, { jacket: '#111014', shirt: '#2b2440', armL: 0.2, armR: -2.4 + Math.sin(T * 4) * 0.25, seed: 7, glasses: false, hair: '#d9d6e0' });
  const jw = at(x, sh.jacket, x.a + 2);
  const shine = clamp(1 - Math.abs(T - jw - 0.4) / 0.5);
  if (shine > 0) { g.fillStyle = `rgba(255,255,255,${0.7 * shine})`; star(g, W / 2 + 50, 720, 22 * shine, 0); star(g, W / 2 - 60, 760, 14 * shine, 0); }
  // crowd + flashes
  const r = rand(4);
  for (let i = 0; i < 26; i++) { const hx = i * 78 + 20, hy = 1000 + (i % 2) * 20; g.fillStyle = '#0b0818'; g.beginPath(); g.arc(hx, hy, 34, 0, Math.PI * 2); g.fill(); g.fillRect(hx - 44, hy + 20, 88, 80); }
  for (let i = 0; i < 6; i++) { const ph = ((T - x.a) * 1.3 + r()) % 1; if (ph < 0.12) { const fx = r() * W; g.fillStyle = `rgba(255,255,255,${1 - ph / 0.12})`; g.beginPath(); g.arc(fx, 980, 30, 0, Math.PI * 2); g.fill(); } else r(); }
  if (sh.chipText) { const cp = spring(T, jw + 0.2); chip(g, sh.chipText, W / 2 + 140, 600, { size: 28, weight: 600, scale: cp, alpha: Math.min(1, cp), stroke: null }); }
  if (sh.text) x.kit.pill(g, sh.text, W / 2, 610 + 380, at(x, sh.textWhen, x.a + 0.6), T, { size: 32, fill: '#fff', color: UI.ink });
};

/** Chess board: the chip lands as the queen between two flags */
A.chess = (g, sh, x) => {
  const T = x.T, drop = at(x, sh.drop, x.a + 1.5);
  const P = (u, v) => { const yy = lerp(330, 900, v), sc = lerp(0.62, 1, v); return [W / 2 + (u - 0.5) * 1100 * sc, yy]; };
  const bp = ease(T, x.a, 0.6);
  g.save(); g.globalAlpha = bp; g.translate(0, (1 - bp) * 80);
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    const a = P(c / 8, r / 8), b = P((c + 1) / 8, r / 8), cc = P((c + 1) / 8, (r + 1) / 8), d = P(c / 8, (r + 1) / 8);
    g.fillStyle = (r + c) % 2 ? '#4a2a8c' : '#efe9fb'; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.lineTo(...cc); g.lineTo(...d); g.closePath(); g.fill();
  }
  g.fillStyle = '#2b2440'; const e1 = P(0, 1), e2 = P(1, 1); g.fillRect(e1[0], e1[1], e2[0] - e1[0], 30);
  // pawns
  const pawn = (u, v, col) => { const [px, py] = P(u, v), s = lerp(0.62, 1, v); g.fillStyle = col; g.beginPath(); g.arc(px, py - 70 * s, 18 * s, 0, Math.PI * 2); g.fill(); g.beginPath(); g.moveTo(px - 14 * s, py - 56 * s); g.lineTo(px + 14 * s, py - 56 * s); g.lineTo(px + 26 * s, py - 6 * s); g.lineTo(px - 26 * s, py - 6 * s); g.closePath(); g.fill(); g.beginPath(); g.ellipse(px, py - 4 * s, 32 * s, 9 * s, 0, 0, Math.PI * 2); g.fill(); };
  for (let c = 0; c < 8; c++) { pawn((c + 0.5) / 8, 1.5 / 8, '#c9b8ff'); pawn((c + 0.5) / 8, 6.5 / 8, '#1d1b29'); }
  g.restore();
  // the chip queen drops onto the centre
  const dp = clamp((T - drop) / 0.35);
  if (T > drop - 0.01) {
    const [qx, qy] = P(0.5, 0.5), y = lerp(-200, qy - 120, ez.p3In(dp));
    g.fillStyle = '#1d1b29'; g.beginPath(); g.moveTo(qx - 50, qy - 10); g.lineTo(qx + 50, qy - 10); g.lineTo(qx + 30, qy - 80); g.lineTo(qx - 30, qy - 80); g.closePath(); g.fill();
    chipIcon(g, qx, y, 130, 0);
    g.fillStyle = '#ffc93c'; g.beginPath(); const cy = y - 80; g.moveTo(qx - 40, cy + 18); g.lineTo(qx - 48, cy - 20); g.lineTo(qx - 20, cy); g.lineTo(qx, cy - 30); g.lineTo(qx + 20, cy); g.lineTo(qx + 48, cy - 20); g.lineTo(qx + 40, cy + 18); g.closePath(); g.fill();
    const ring = clamp((T - drop - 0.35) / 0.8);
    if (ring > 0 && ring < 1) { g.strokeStyle = `rgba(118,185,0,${1 - ring})`; g.lineWidth = 8; g.beginPath(); g.ellipse(qx, qy - 20, 80 + ring * 300, 20 + ring * 80, 0, 0, Math.PI * 2); g.stroke(); }
  }
  const fa = at(x, sh.flagsWhen, x.a + 0.3);
  const f1 = pop(T, fa), f2 = pop(T, fa + 0.15);
  if (f1 > 0.01) { g.save(); g.translate(250, 260); g.scale(f1, f1); flag(g, 'US', 0, 0, 200); g.restore(); }
  if (f2 > 0.01) { g.save(); g.translate(W - 250, 260); g.scale(f2, f2); flag(g, 'CN', 0, 0, 200); g.restore(); }
  if (sh.text) x.kit.pill(g, sh.text, W / 2, 1000, drop + 0.3, T, { size: 34 });
};

/** A stack of coins (China sales) that loses its top as the rules cost billions */
A.drain = (g, sh, x) => {
  const T = x.T, grow = at(x, sh.grow, x.a + 0.5), lose = at(x, sh.lose, x.a + 2.5);
  const cx = 760, base = 880, N = 18;
  const n = Math.round(N * clamp((T - x.a - 0.1) / Math.max(0.6, grow - x.a + 0.6)));
  for (let i = 0; i < n; i++) {
    const leaving = i >= 8 ? clamp((T - lose - (N - i) * 0.07) / 0.9) : 0;
    const y = base - i * 30 + leaving * leaving * 900, xx = cx + leaving * (i % 2 ? 300 : -300) * leaving;
    if (y > H + 60) continue;
    g.save(); g.translate(xx, y); g.rotate(leaving * (i % 2 ? 1.4 : -1.4));
    g.fillStyle = '#c9971c'; g.beginPath(); g.ellipse(0, 10, 150, 38, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#ffc93c'; g.beginPath(); g.ellipse(0, 0, 150, 38, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#e0ac2a'; g.lineWidth = 4; g.beginPath(); g.ellipse(0, 0, 110, 26, 0, 0, Math.PI * 2); g.stroke();
    if (i === n - 1 || leaving > 0) text(g, '$', 0, 12, { font: UI.HEAD, weight: 700, size: 36, color: '#c9971c', align: 'center' });
    g.restore();
  }
  chip(g, sh.stackLabel || 'CHINA SALES', cx - 120, base + 70, { size: 28, weight: 700, scale: pop(T, x.a + 0.2), stroke: null });
  const lp = pop(T, lose + 0.2);
  if (lp > 0.01) {
    g.save(); g.translate(1400, 480); g.scale(lp, lp);
    g.fillStyle = UI.red; g.beginPath(); g.moveTo(-40, -150); g.lineTo(40, -150); g.lineTo(40, 20); g.lineTo(100, 20); g.lineTo(0, 140); g.lineTo(-100, 20); g.lineTo(-40, 20); g.closePath(); g.fill();
    text(g, sh.lossText || '− billions', 0, 260, { font: UI.HEAD, weight: 700, size: 90, color: UI.red, align: 'center' });
    g.restore();
  }
  if (sh.text) x.kit.pill(g, sh.text, W / 2, 110, x.a + 0.3, T, { size: 32 });
};

/** A chip runs into a wall, then a dotted path curls round it with a question mark */
A.maze = (g, sh, x) => {
  const T = x.T;
  const wp = pop(T, x.a + 0.05);
  // brick wall
  g.save(); g.translate(W / 2, 560); g.scale(1, Math.min(1, wp));
  for (let r = 0; r < 12; r++) for (let c = 0; c < 2; c++) { g.fillStyle = (r + c) % 2 ? '#e2412e' : '#c7331f'; g.fillRect(-70 + c * 70 - (r % 2) * 35, -360 + r * 60, 68, 58); }
  g.restore();
  // chip approaches and bounces
  const hit = x.a + 0.9;
  const cx = T < hit ? lerp(250, 760, ez.p2InOut(clamp((T - x.a) / 0.9))) : 760 - Math.sin(clamp((T - hit) / 0.4) * Math.PI) * 60;
  const shake = T > hit && T < hit + 0.3 ? Math.sin(T * 90) * 8 : 0;
  chipIcon(g, cx + shake, 600, 120, 0);
  const pth = clamp((T - hit - 0.5) / 1.4);
  if (pth > 0) {
    g.save(); g.setLineDash([4, 18]); g.lineCap = 'round'; g.strokeStyle = '#f3efff'; g.lineWidth = 7; g.beginPath();
    const P = (t) => [lerp(760, 1200, t), 560 - Math.sin(t * Math.PI) * 560 + t * 40];
    for (let i = 0; i <= 40 * pth; i++) { const [px, py] = P(i / 40); i ? g.lineTo(px, py) : g.moveTo(px, py); }
    g.stroke(); g.restore();
  }
  const qp = pop(T, hit + 1.6);
  if (qp > 0.01) { g.save(); g.translate(1320, 560); g.scale(qp, qp); text(g, '?', 0, 60, { font: UI.HEAD, weight: 700, size: 220, color: '#ffc93c', align: 'center' }); g.restore(); }
  if (sh.text) x.kit.pill(g, sh.text, W / 2, 1000, x.a + 0.3, T, { size: 34 });
};

/** Company hops: China (7Road) → Singapore (Megaspeed) → offshore island company */
A.hops = (g, sh, x) => {
  const T = x.T;
  const st = sh.stops.map((s, i) => ({ ...s, t: i === 0 ? Math.min(at(x, s.when, x.a + 0.3), x.a + 0.35) : at(x, s.when, x.a + 1 + i * 2) }));
  const pos = [[360, 520], [960, 420], [1560, 520]];
  st.forEach((s, i) => {
    const p = pop(T, s.t);
    if (p <= 0.01) return;
    g.save(); g.translate(...pos[i]); g.scale(p, p);
    flag(g, s.flag, 0, 0, 230);
    text(g, s.name, 0, 150, { font: UI.HEAD, weight: 700, size: 40, color: UI.ink, align: 'center' });
    text(g, s.sub, 0, 194, { font: UI.BODY, weight: 600, size: 24, color: UI.muted, align: 'center' });
    g.restore();
    if (i > 0) {
      const [ax, ay] = pos[i - 1], [bx, by] = pos[i];
      const hp = ez.p2InOut(clamp((T - s.t + 0.6) / 0.8));
      g.save(); g.setLineDash([3, 14]); g.lineCap = 'round'; g.strokeStyle = UI.purple; g.lineWidth = 5; g.beginPath();
      for (let k = 0; k <= 30 * hp; k++) { const t = k / 30; const px = lerp(ax + 140, bx - 140, t), py = lerp(ay, by, t) - Math.sin(t * Math.PI) * 180; k ? g.lineTo(px, py) : g.moveTo(px, py); }
      g.stroke(); g.restore();
    }
  });
  // the hopping token (the company)
  let tx = pos[0][0], ty = pos[0][1] - 170;
  for (let i = 1; i < st.length; i++) {
    const hp = clamp((T - st[i].t + 0.6) / 0.8);
    if (hp > 0) { const e = ez.p2InOut(hp); tx = lerp(pos[i - 1][0], pos[i][0], e); ty = lerp(pos[i - 1][1], pos[i][1], e) - 170 - Math.sin(e * Math.PI) * 200; }
  }
  if (T > st[0].t + 0.3) { g.fillStyle = UI.purple; g.beginPath(); g.roundRect(tx - 34, ty - 34, 68, 68, 14); g.fill(); text(g, 'M', tx, ty + 14, { font: UI.HEAD, weight: 700, size: 40, color: '#fff', align: 'center' }); }
  const la = sh.linkWhen ? at(x, sh.linkWhen, x.a + 5) : null;
  if (la != null) chip(g, sh.link, pos[2][0] - 170, pos[2][1] + 230, { size: 26, weight: 700, fill: UI.amber, color: UI.amberInk, stroke: null, scale: pop(T, la) });
  if (sh.text) x.kit.pill(g, sh.text, W / 2, 110, x.a + 0.3, T, { size: 32 });
};

/** An ID badge swings in on a lanyard */
A.badge = (g, sh, x) => {
  const T = x.T, sw = Math.exp(-(T - x.a) * 1.4) * Math.sin((T - x.a) * 5) * 0.35;
  const dp = ease(T, x.a, 0.7);
  g.save(); g.translate(W / 2, -40); g.rotate(sw);
  g.strokeStyle = UI.purple; g.lineWidth = 16; g.beginPath(); g.moveTo(-120, 0); g.lineTo(0, 260 * dp + 120); g.lineTo(120, 0); g.stroke();
  g.translate(0, lerp(-400, 0, dp));
  card(g, -230, 380, 460, 600, { r: 30 }, (cg) => {
    cg.fillStyle = UI.purple; cg.fillRect(0, 0, 460, 110);
    text(cg, sh.org || 'MEGASPEED', 230, 72, { font: UI.HEAD, weight: 700, size: 44, color: '#fff', align: 'center', spacing: 6 });
    cg.fillStyle = '#ece7f8'; cg.beginPath(); cg.roundRect(130, 150, 200, 220, 20); cg.fill();
    cg.fillStyle = '#b9a2ff'; cg.beginPath(); cg.arc(230, 235, 50, 0, Math.PI * 2); cg.fill(); cg.beginPath(); cg.ellipse(230, 370, 85, 70, 0, Math.PI, Math.PI * 2); cg.fill();
    text(cg, sh.name || 'ALICE HUANG', 230, 440, { font: UI.HEAD, weight: 700, size: 36, color: UI.ink, align: 'center' });
    text(cg, sh.role || 'MANAGING DIRECTOR', 230, 490, { font: UI.BODY, weight: 600, size: 26, color: UI.purple, align: 'center', spacing: 2 });
    text(cg, sh.dates || 'MAR – NOV 2023', 230, 540, { font: UI.BODY, weight: 600, size: 24, color: UI.muted, align: 'center' });
  });
  g.fillStyle = '#c9c3d9'; g.beginPath(); g.roundRect(-30, 360, 60, 34, 10); g.fill();
  g.restore();
  if (sh.text) x.kit.pill(g, sh.text, W / 2, 1010, x.a + 0.5, T, { size: 28, fill: UI.soft, color: UI.purple });
};

/** A case folder slides out, a stamp lands */
A.casefolder = (g, sh, x) => {
  const T = x.T, st = at(x, sh.stampWhen, x.a + 1.2);
  const fp = spring(T, x.a + 0.05, { freq: 1.3, damp: 0.75 });
  g.save(); g.translate(lerp(-900, W / 2, Math.min(1, fp)), 520); g.rotate(-0.03);
  g.shadowColor = 'rgba(0,0,0,0.35)'; g.shadowBlur = 40; g.shadowOffsetY = 20;
  g.fillStyle = '#e8c47f'; g.beginPath(); g.moveTo(-520, -300); g.lineTo(-300, -300); g.lineTo(-270, -350); g.lineTo(-60, -350); g.lineTo(-30, -300); g.lineTo(520, -300); g.lineTo(520, 330); g.lineTo(-520, 330); g.closePath(); g.fill();
  g.shadowColor = 'transparent';
  text(g, 'CASE FILE', -165, -312, { font: UI.HEAD, weight: 700, size: 26, color: '#6e5326', align: 'center', spacing: 4 });
  g.fillStyle = '#fffaf0'; g.fillRect(-470, -250, 940, 540);
  // scales of justice (generic)
  g.strokeStyle = UI.ink; g.lineWidth = 8; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-250, -170); g.lineTo(-250, 80); g.moveTo(-360, -130); g.lineTo(-140, -130); g.moveTo(-320, 80); g.lineTo(-180, 80); g.stroke();
  const tilt = Math.sin(T * 1.5) * 0.06;
  [[-360, 1], [-140, -1]].forEach(([px, s]) => { const yy = -60 + s * tilt * 100; g.beginPath(); g.moveTo(px, -130); g.lineTo(px - 40, yy); g.moveTo(px, -130); g.lineTo(px + 40, yy); g.stroke(); g.beginPath(); g.arc(px, yy, 42, 0, Math.PI); g.stroke(); });
  text(g, sh.title || 'CRIMINAL INQUIRY', 170, -60, { font: UI.HEAD, weight: 700, size: 64, color: UI.ink, align: 'center' });
  g.fillStyle = '#e6e1f0'; for (let i = 0; i < 4; i++) g.fillRect(-60, 10 + i * 40, 440 - i * 50, 14);
  g.restore();
  const s = clamp((T - (st - 0.09)) / 0.09);
  if (s > 0) {
    g.save(); g.translate(1240, 760); g.rotate(-0.12); const sc = lerp(2.4, 1, ez.p3In(s)); g.scale(sc, sc); g.globalAlpha = 0.92 * s;
    g.strokeStyle = UI.red; g.lineWidth = 10; g.beginPath(); g.roundRect(-250, -70, 500, 140, 18); g.stroke();
    text(g, sh.stampText || 'REPORTED', 0, 30, { font: UI.HEAD, weight: 700, size: 86, color: UI.red, align: 'center', spacing: 6 });
    g.restore();
  }
  if (sh.text) x.kit.pill(g, sh.text, W / 2, 1010, st + 0.4, T, { size: 28 });
};

/** Inspectors' checklist: a magnifier passes over each row and ticks it */
A.checks = (g, sh, x) => {
  const T = x.T;
  const rows = sh.rows.map((r, i) => ({ ...r, t: i === 0 ? Math.min(at(x, r.when, x.a + 0.3), x.a + 0.4) : at(x, r.when, x.a + 1 + i) }));
  const cp = pop(T, x.a + 0.05);
  g.save(); g.translate(W / 2, 520); g.scale(cp, cp);
  card(g, -560, -330, 1120, 640, { r: 36 }, (cg) => {
    text(cg, sh.title || 'INSPECTIONS', 70, 90, { font: UI.HEAD, weight: 700, size: 40, color: UI.purple, spacing: 3 });
    rows.forEach((r, i) => {
      const y = 190 + i * 120, on = clamp((T - r.t - 0.5) / 0.3);
      cg.fillStyle = UI.soft; cg.beginPath(); cg.roundRect(60, y - 60, 1000, 96, 24); cg.fill();
      text(cg, r.label, 110, y + 6, { font: UI.HEAD, weight: 600, size: 38, color: UI.ink, alpha: clamp((T - r.t) * 4) });
      if (on > 0) { cg.save(); cg.translate(990, y - 12); cg.scale(on, on); cg.fillStyle = UI.green; cg.beginPath(); cg.arc(0, 0, 34, 0, Math.PI * 2); cg.fill(); cg.strokeStyle = '#fff'; cg.lineWidth = 9; cg.lineCap = 'round'; cg.beginPath(); cg.moveTo(-15, 0); cg.lineTo(-4, 12); cg.lineTo(16, -12); cg.stroke(); cg.restore(); }
    });
  });
  // magnifier gliding row to row
  let k = 0; while (k < rows.length - 1 && T > rows[k + 1].t) k++;
  const lx = lerp(-200, 300, clamp((T - rows[k].t) / 0.6)), ly = -330 + 190 + k * 120 - 12;
  g.strokeStyle = UI.purple; g.lineWidth = 12; g.fillStyle = 'rgba(217,204,255,0.3)';
  g.beginPath(); g.arc(lx, ly, 56, 0, Math.PI * 2); g.fill(); g.stroke();
  g.lineWidth = 20; g.lineCap = 'round'; g.beginPath(); g.moveTo(lx + 40, ly + 40); g.lineTo(lx + 90, ly + 90); g.stroke();
  g.restore();
  if (sh.text) x.kit.pill(g, sh.text, W / 2, 970, at(x, sh.textWhen, x.a + 3), T, { size: 30 });
};

/** A newspaper spins in (generic design, labelled as an illustration) */
A.newspaper = (g, sh, x) => {
  const T = x.T, p = ez.expoOut(clamp((T - x.a) / 1.1));
  g.save(); g.translate(W / 2, 500); g.rotate((1 - p) * Math.PI * 4); g.scale(lerp(0.05, 1, p), lerp(0.05, 1, p));
  g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 50; g.shadowOffsetY = 20;
  g.fillStyle = '#f7f3ea'; g.fillRect(-520, -380, 1040, 760);
  g.shadowColor = 'transparent';
  text(g, sh.masthead || 'THE DAILY REPORT', 0, -300, { font: "'Playfair Display'", weight: 900, size: 76, color: '#1d1b29', align: 'center' });
  g.fillStyle = '#1d1b29'; g.fillRect(-480, -270, 960, 4); g.fillRect(-480, -228, 960, 2);
  text(g, sh.date || '', -470, -240, { font: UI.BODY, weight: 600, size: 20, color: '#1d1b29' });
  (sh.headline || []).forEach((ln, i) => text(g, ln, 0, -150 + i * 78, { font: "'Playfair Display'", weight: 700, size: 64, color: '#1d1b29', align: 'center' }));
  const y0 = -150 + (sh.headline || []).length * 78;
  g.fillStyle = '#cfc9bb'; g.fillRect(-470, y0, 420, 300);
  for (let c = 0; c < 2; c++) for (let i = 0; i < 12; i++) { g.fillStyle = '#c4beb0'; g.fillRect(c ? 30 : 30 + 230, y0 + i * 26, i % 5 === 4 ? 120 : 200, 10); }
  g.restore();
  if (p > 0.95) text(g, 'ILLUSTRATION', W / 2 + 500, 900, { font: UI.BODY, weight: 600, size: 22, color: '#cdbdff', align: 'right', spacing: 3 });
  if (sh.text) x.kit.pill(g, sh.text, W / 2, 990, x.a + 0.9, T, { size: 30 });
};

/** Radar sweep with flags around it */
A.radar = (g, sh, x) => {
  const T = x.T, cx = W / 2, cy = 520, R = 330;
  const rp = ease(T, x.a, 0.5);
  g.save(); g.globalAlpha = rp;
  g.fillStyle = 'rgba(31,138,91,0.12)'; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(118,185,0,0.5)'; g.lineWidth = 3;
  for (let i = 1; i <= 3; i++) { g.beginPath(); g.arc(cx, cy, (R * i) / 3, 0, Math.PI * 2); g.stroke(); }
  g.beginPath(); g.moveTo(cx - R, cy); g.lineTo(cx + R, cy); g.moveTo(cx, cy - R); g.lineTo(cx, cy + R); g.stroke();
  const a = (T - x.a) * 2.4;
  for (let i = 0; i < 24; i++) { g.fillStyle = `rgba(118,185,0,${0.3 * (1 - i / 24)})`; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R, a - (i + 1) * 0.04, a - i * 0.04); g.closePath(); g.fill(); }
  const blip = (Math.sin(T * 6) + 1) / 2;
  g.fillStyle = '#ff5c8a'; g.beginPath(); g.arc(cx + 70, cy - 50, 14 + blip * 6, 0, Math.PI * 2); g.fill();
  g.strokeStyle = `rgba(255,92,138,${1 - blip})`; g.lineWidth = 3; g.beginPath(); g.arc(cx + 70, cy - 50, 30 + blip * 30, 0, Math.PI * 2); g.stroke();
  g.restore();
  const spots = [[cx - 600, cy - 120], [cx + 600, cy - 120], [cx, cy + 420]];
  sh.flags.forEach((f, i) => {
    const t = i === 0 ? Math.min(at(x, f.when, x.a + 0.3), x.a + 0.4) : at(x, f.when, x.a + 1 + i);
    const p = pop(T, t);
    if (p <= 0.01) return;
    g.save(); g.translate(...spots[i]); g.scale(p, p);
    flag(g, f.code, 0, i === 2 ? -40 : 0, i === 2 ? 130 : 220);
    text(g, f.label, i === 2 ? 0 : 0, i === 2 ? 70 : 130, { font: UI.HEAD, weight: 700, size: 34, color: '#f3efff', align: 'center' });
    g.restore();
    g.save(); g.setLineDash([4, 12]); g.strokeStyle = 'rgba(243,239,255,0.4)'; g.lineWidth = 3; g.globalAlpha = Math.min(1, p);
    g.beginPath(); g.moveTo(spots[i][0], spots[i][1]); g.lineTo(cx + 70, cy - 50); g.stroke(); g.restore();
  });
  if (sh.text) x.kit.pill(g, sh.text, W / 2, 90, x.a + 0.4, T, { size: 30 });
};

/** A shield with the Nvidia logo deflecting incoming arrows */
A.shield = (g, sh, x) => {
  const T = x.T, cx = 760, cy = 520;
  const sp = pop(T, x.a + 0.05);
  g.save(); g.translate(cx, cy); g.scale(sp, sp);
  g.shadowColor = 'rgba(74,42,140,0.3)'; g.shadowBlur = 40; g.shadowOffsetY = 18;
  g.fillStyle = '#fff'; g.beginPath(); g.moveTo(0, -300); g.quadraticCurveTo(170, -250, 240, -250); g.quadraticCurveTo(250, 120, 0, 320); g.quadraticCurveTo(-250, 120, -240, -250); g.quadraticCurveTo(-170, -250, 0, -300); g.closePath(); g.fill();
  g.shadowColor = 'transparent'; g.strokeStyle = NV; g.lineWidth = 18; g.stroke();
  imageIn(g, 'nvidialogo', -180, -80, 360, 120);
  g.restore();
  // arrows come in from the right and bounce off
  for (let i = 0; i < 5; i++) {
    const t0 = x.a + 0.4 + i * 0.55, lt = T - t0;
    if (lt < 0) continue;
    const yy = cy - 180 + i * 90, hit = 0.35;
    let ax, ay, rot = Math.PI;
    if (lt < hit) { ax = lerp(W + 100, cx + 250, lt / hit); ay = yy; } else { const b = lt - hit; ax = cx + 250 + b * 900; ay = yy - b * 700 + b * b * 1600 * (i % 2 ? 1 : 0.3); rot = Math.PI + 2.4 * b * (i % 2 ? 1 : -1); }
    if (ay > H + 100) continue;
    g.save(); g.translate(ax, ay); g.rotate(rot);
    g.strokeStyle = UI.red; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 0); g.lineTo(-120, 0); g.stroke();
    g.fillStyle = UI.red; g.beginPath(); g.moveTo(14, 0); g.lineTo(-10, -16); g.lineTo(-10, 16); g.closePath(); g.fill();
    g.restore();
    if (lt > hit && lt < hit + 0.25) { const s = (lt - hit) / 0.25; g.fillStyle = `rgba(255,201,60,${1 - s})`; for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; g.beginPath(); g.arc(cx + 250 + Math.cos(a) * 40 * s, yy + Math.sin(a) * 40 * s, 6, 0, Math.PI * 2); g.fill(); } }
  }
  if (sh.label) chip(g, sh.label, 1280, 300, { size: 30, weight: 700, fill: UI.redSoft, color: UI.red, stroke: null, scale: pop(T, x.a + 0.4) });
  if (sh.text) x.kit.pill(g, sh.text, W / 2, 970, at(x, sh.textWhen, x.a + 1.5), T, { size: 30 });
};

/** A committee dais with three chairs; closed doors slide in */
A.hearing = (g, sh, x) => {
  const T = x.T;
  // back wall and seal-free banner
  g.fillStyle = '#efe9fb'; g.fillRect(0, 0, W, 640);
  g.fillStyle = '#e2d9f7'; for (let i = 0; i < 8; i++) g.fillRect(140 + i * 230, 80, 40, 560);
  // chairmen
  const seats = sh.seats.map((s, i) => ({ ...s, t: i === 0 ? at(x, s.when, x.a + 1) : at(x, s.when, x.a + 2 + i) }));
  seats.forEach((s, i) => {
    const sx = 520 + i * 440, p = spring(T, Math.min(s.t, x.a + 0.3 + i * 0.15), { freq: 1.4, damp: 0.7 });
    if (p <= 0.01) return;
    g.save(); g.translate(0, (1 - Math.min(1, p)) * 300);
    person(g, sx, 540, 1.2, T, { jacket: '#2b2440', shirt: '#e8e3f5', armL: 0.3, armR: -0.3, seed: 11 + i, hair: ['#8a8a8a', '#3b2a1a', '#d9d6e0'][i], skin: ['#f3c9a3', '#e8b48f', '#f6d2b5'][i] });
    g.restore();
  });
  // dais
  g.fillStyle = '#4a2a8c'; g.fillRect(200, 640, 1520, 260);
  g.fillStyle = '#5b38a3'; g.fillRect(200, 640, 1520, 26);
  seats.forEach((s, i) => {
    const sx = 520 + i * 440, np = pop(T, s.t);
    if (np <= 0.01) return;
    g.save(); g.translate(sx, 740); g.scale(np, np);
    card(g, -190, -44, 380, 88, { r: 16 }, (cg) => text(cg, s.label, 190, 56, { font: UI.HEAD, weight: 700, size: 30, color: UI.ink, align: 'center' }));
    g.restore();
  });
  g.fillStyle = '#d9ccff'; g.fillRect(0, 900, W, 180);
  // doors closing in from the sides
  const dc = ease(T, at(x, sh.doors, x.a + 1.5), 1);
  [[-1, 0], [1, W]].forEach(([s, edge]) => {
    const w = 200 * dc;
    g.fillStyle = '#6b4a2b'; g.fillRect(s < 0 ? 0 : W - w, 0, w, H);
    g.fillStyle = '#7d5834'; g.fillRect(s < 0 ? 30 : W - w + 30, 60, Math.max(0, w - 60), 400); g.fillRect(s < 0 ? 30 : W - w + 30, 520, Math.max(0, w - 60), 480);
    if (dc > 0.5) { g.fillStyle = '#ffc93c'; g.beginPath(); g.arc(s < 0 ? w - 40 : W - w + 40, 560, 16, 0, Math.PI * 2); g.fill(); }
    void edge;
  });
  if (dc > 0.6) chip(g, 'CLOSED DOORS', 30, 40, { size: 28, weight: 700, fill: UI.amber, color: UI.amberInk, stroke: null, scale: pop(T, at(x, sh.doors, x.a + 1.5) + 0.3) });
  if (sh.text) x.kit.pill(g, sh.text, W / 2, 990, x.a + 0.5, T, { size: 30 });
};

/** Boardroom: silhouettes round a table with a folder; findings pop up */
A.boardroom = (g, sh, x) => {
  const T = x.T;
  g.fillStyle = '#efe9fb'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#e2d9f7'; g.fillRect(0, 0, W, 120);
  for (let i = 0; i < 3; i++) { const lx = 560 + i * 400; g.strokeStyle = '#c9b8ff'; g.lineWidth = 3; g.beginPath(); g.moveTo(lx, 0); g.lineTo(lx, 130); g.stroke(); g.fillStyle = '#ffd166'; g.beginPath(); g.ellipse(lx, 140, 70, 20, 0, 0, Math.PI * 2); g.fill(); const lg = g.createRadialGradient(lx, 150, 10, lx, 150, 400); lg.addColorStop(0, 'rgba(255,209,102,0.25)'); lg.addColorStop(1, 'rgba(255,209,102,0)'); g.fillStyle = lg; g.fillRect(0, 0, W, H); }
  const cols = ['#4a2a8c', '#2b2440', '#1f8a5b', '#6b6880', '#b5482e'];
  for (let i = 0; i < 5; i++) {
    const sx = 460 + i * 250, p = spring(T, x.a + 0.1 + i * 0.08, { freq: 1.4, damp: 0.7 });
    g.save(); g.globalAlpha = Math.min(1, p); g.translate(0, (1 - Math.min(1, p)) * 120);
    person(g, sx, 560, 1.05, T, { jacket: cols[i], shirt: '#fff', armL: 0.5, armR: -0.5, seed: 20 + i, hair: ['#2b2440', '#8a8a8a', '#3b2a1a', '#d9d6e0', '#2b2440'][i] });
    g.restore();
  }
  // table
  g.fillStyle = '#3a3156'; g.beginPath(); g.ellipse(W / 2, 720, 760, 130, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#4a3f6b'; g.beginPath(); g.ellipse(W / 2, 705, 740, 115, 0, 0, Math.PI * 2); g.fill();
  const fp = pop(T, x.a + 0.4);
  g.save(); g.translate(W / 2, 700); g.scale(fp, fp); g.rotate(-0.05);
  g.fillStyle = '#e8c47f'; g.fillRect(-150, -50, 300, 100); g.fillStyle = '#fffaf0'; g.fillRect(-130, -40, 260, 70);
  text(g, 'INVESTIGATION', 0, 8, { font: UI.HEAD, weight: 700, size: 28, color: UI.ink, align: 'center' });
  g.restore();
  sh.rows.forEach((r, i) => {
    const t = at(x, r.when, x.a + 1 + i);
    chip(g, r.label, 160 + i * 560, 900, { size: 32, weight: 700, fill: r.mark ? UI.redSoft : '#fff', color: r.mark ? UI.red : UI.ink, stroke: null, scale: pop(T, t) });
  });
  if (sh.text) x.kit.pill(g, sh.text, W / 2, 1010, x.a + 0.4, T, { size: 28, fill: UI.soft, color: UI.purple });
};

/** A phone stock app ticking red */
A.phone = (g, sh, x) => {
  const T = x.T, drop = at(x, sh.drop, x.a + 1);
  const pp = spring(T, x.a + 0.05, { freq: 1.3, damp: 0.72 });
  g.save(); g.translate(W / 2, lerp(1400, 540, Math.min(1, pp))); g.rotate(-0.04);
  g.shadowColor = 'rgba(40,20,80,0.35)'; g.shadowBlur = 60; g.shadowOffsetY = 30;
  g.fillStyle = '#1d1b29'; g.beginPath(); g.roundRect(-260, -480, 520, 960, 70); g.fill();
  g.shadowColor = 'transparent';
  g.fillStyle = '#fff'; g.beginPath(); g.roundRect(-236, -456, 472, 912, 54); g.fill();
  g.fillStyle = '#1d1b29'; g.beginPath(); g.roundRect(-60, -440, 120, 30, 15); g.fill();
  text(g, sh.ticker || 'NVDA', -190, -330, { font: UI.HEAD, weight: 700, size: 60, color: UI.ink });
  text(g, sh.name || 'NVIDIA Corp', -190, -285, { font: UI.BODY, weight: 400, size: 26, color: UI.muted });
  const dp = ez.expoOut(clamp((T - drop) / 1.4));
  const pct = -(sh.pct || 4) * dp;
  text(g, `${pct.toFixed(1)}%`, -190, -190, { font: UI.HEAD, weight: 700, size: 76, color: dp > 0.02 ? UI.red : UI.ink });
  // chart
  const pts = [], r = rand(3);
  for (let i = 0; i <= 60; i++) { const t = i / 60; let v = 0.35 + (r() - 0.5) * 0.06 + Math.sin(t * 9) * 0.02; if (t > 0.55) v += (t - 0.55) * 1.2 * dp; pts.push([-190 + t * 380, -40 + v * 300]); }
  const shown = Math.floor(lerp(30, 60, clamp((T - x.a) / Math.max(0.5, drop - x.a + 1.2))));
  g.strokeStyle = dp > 0.02 ? UI.red : UI.green; g.lineWidth = 6; g.lineJoin = 'round'; g.beginPath();
  pts.slice(0, shown + 1).forEach(([a, b], i) => (i ? g.lineTo(a, b) : g.moveTo(a, b))); g.stroke();
  const [ex, ey] = pts[shown]; g.fillStyle = g.strokeStyle; g.beginPath(); g.arc(ex, ey, 11, 0, Math.PI * 2); g.fill();
  ['1D', '1W', '1M', '1Y'].forEach((s, i) => chip(g, s, -200 + i * 105, 360, { size: 22, weight: 600, fill: i ? '#f1edf9' : UI.ink, color: i ? UI.ink : '#fff', stroke: null }));
  g.restore();
  // ticking red arrows
  if (dp > 0.02) for (let i = 0; i < 3; i++) { const ph = ((T - drop) * 0.8 + i / 3) % 1; g.fillStyle = `rgba(226,65,46,${0.6 * (1 - ph)})`; const ax = 1420 + i * 90, ay = 360 + ph * 300; g.beginPath(); g.moveTo(ax - 30, ay); g.lineTo(ax + 30, ay); g.lineTo(ax, ay + 40); g.closePath(); g.fill(); }
  if (sh.text) x.kit.pill(g, sh.text, 420, 520, x.a + 0.4, T, { size: 30 });
};

/** A chip outline morphs into a heart */
function chipPath(t) {
  const per = 4 * t, side = Math.floor(per) % 4, f = per - Math.floor(per), s = 200;
  const pts = [[-s, -s], [s, -s], [s, s], [-s, s], [-s, -s]];
  return [lerp(pts[side][0], pts[side + 1][0], f), lerp(pts[side][1], pts[side + 1][1], f)];
}
function heartPath(t) {
  const a = t * Math.PI * 2 + Math.PI;
  return [16 * Math.pow(Math.sin(a), 3) * 15, -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * 15 - 20];
}
A.chipheart = (g, sh, x) => {
  const T = x.T, rival = at(x, sh.rival, x.a + 2), morph = at(x, sh.morph, x.a + 6);
  const m = ez.p2InOut(clamp((T - morph) / 0.9)), beat = m >= 1 ? 1 + Math.max(0, Math.sin((T - morph) * 7)) * 0.06 : 1;
  const ip = pop(T, x.a + 0.1);
  const cx = W / 2, cy = 500;
  // the rival chip (a better chip) slides in, then fades as the heart forms
  const rp = spring(T, rival, { freq: 1.3, damp: 0.7 });
  if (rp > 0.01 && m < 1) {
    g.save(); g.globalAlpha = 1 - m; g.translate(lerp(W + 300, 1520, Math.min(1, rp)), 520);
    chipIcon(g, 0, 0, 300, 0); g.restore();
    chip(g, 'a better chip?', 1390, 760, { size: 28, weight: 600, scale: pop(T, rival + 0.3), alpha: 1 - m, stroke: null });
  }
  g.save(); g.translate(cx - (1 - m) * 240 * Math.min(1, rp), cy); g.scale(ip * beat, ip * beat);
  g.beginPath();
  for (let i = 0; i <= 200; i++) { const t = i / 200, [ax, ay] = chipPath(t), [bx, by] = heartPath(t); const px = lerp(ax, bx, m), py = lerp(ay, by, m); i ? g.lineTo(px, py) : g.moveTo(px, py); }
  g.closePath();
  g.fillStyle = m > 0 ? `rgba(226,65,46,${0.15 + 0.75 * m})` : '#2b2440'; g.fill();
  g.strokeStyle = m > 0.5 ? UI.red : UI.purple; g.lineWidth = 12; g.stroke();
  if (m < 1) {
    g.globalAlpha = 1 - m;
    g.fillStyle = NV; g.beginPath(); g.roundRect(-110, -110, 220, 220, 20); g.fill();
    g.strokeStyle = '#2b2440'; g.lineWidth = 10;
    for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(i * 50, -200); g.lineTo(i * 50, -250); g.moveTo(i * 50, 200); g.lineTo(i * 50, 250); g.moveTo(-200, i * 50); g.lineTo(-250, i * 50); g.moveTo(200, i * 50); g.lineTo(250, i * 50); g.stroke(); }
  }
  g.restore();
  const label = T < morph ? sh.labels[0] : sh.labels[1];
  x.kit.pill(g, label, W / 2, 900, T < morph ? x.a + 0.4 : morph + 0.4, T, { size: 34 });
};

export const ACTS = A;

/** Ships sailing along a map route, with a question mark bubble */
export function routeShip(g, T, at0, bez, { q = true } = {}) {
  if (T < at0) return;
  const ph = ((T - at0) * 0.22) % 1;
  const [px, py] = bez(ph), [qx] = bez(Math.min(1, ph + 0.01));
  ship(g, px, py - 14, 0.9, qx < px ? -1 : 1);
  if (q) { const b = pop(T, at0 + 0.4); g.save(); g.translate(px + 40, py - 90); g.scale(b, b); g.fillStyle = '#fff'; g.beginPath(); g.arc(0, 0, 30, 0, Math.PI * 2); g.fill(); text(g, '?', 0, 14, { font: UI.HEAD, weight: 700, size: 40, color: UI.red, align: 'center' }); g.restore(); }
}
void inOut;
