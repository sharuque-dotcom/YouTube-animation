// Sabarimala 1950 (kit formula, OG look + 3D forest hill). Hook = the shrine burning at night, 1950, idol broken; what if
// it was a planned attack? You-see (no road, no power, on foot from Erumeli); the DIG's inquiry (arson, never solved);
// wait...? (new panchaloha idol cast at Chengannur, the shrine rises again); twist (the news made it famous); what-if
// (the 18 steps erased); callback (one night's fire -> the whole hill calling 'Saranam'); question + subscribe.
// Ayyappa is never drawn: the sanctum is a glow behind the doors. The arsonist is only a faceless shadow.
const ML = "'Noto Malayalam'";
import { W, H, clamp, lerp } from '../../pipeline/engine.js';
import { ALIGN } from './align.js';
function text(g, str, x, y, o = {}) { g.save(); let sz = o.size || 48; const f = () => `${o.weight || 800} ${sz}px ${o.font || ML}`; g.font = f(); if (o.maxWidth) while (g.measureText(str).width > o.maxWidth && sz > 12) { sz -= 2; g.font = f(); }
  g.textAlign = o.align || 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; if (o.stroke) { g.lineWidth = o.strokeWidth || sz * 0.15; g.strokeStyle = o.stroke; g.strokeText(str, x, y); } g.fillStyle = o.color || '#fff'; g.fillText(str, x, y); g.restore(); }



let K = null, B = null, S = null, stage = null, camera = null, THREE = null, PROPS = null;
const ez = (x) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
const ezo = (x) => 1 - Math.pow(1 - clamp(x, 0, 1), 3);
const span = (t, a, d) => clamp((t - a) / d, 0, 1);

export async function preload() {
  K = await import('../../pipeline/toon3d.js'); THREE = K.THREE; B = await import('../../pipeline/bean.js'); PROPS = B.PROPS; const A = await import('../../pipeline/assets.js');
  (await import('./cast.js')).registerCast(B);
  stage = K.makeInkStage(W, H); camera = new THREE.PerspectiveCamera(52, W / H, 0.05, 1500);
  const E = await import('./sets.js');
  S = { hill: await E.hillSet(stage.renderer), path: await E.pathSet(stage.renderer), inq: E.inquirySet(), forge: E.forgeSet() };
  await A.settle();
  buildCast();
}
// ------------------------------------------------------------------ actors
function actor(scene, who, x, z, y = 0, scale = 1) { const c = K.card(who, {}, { scale }); c.position.set(x, y, z); scene.add(c); return { c, who, last: '', seed: (Math.abs(x) * 13.1 + Math.abs(z) * 7.7) % 9, base: [x, y, z] }; }
function pose(a, o, t) {
  a.c.visible = true; const blinkPh = (t + a.seed) % 3.1, blink = blinkPh < 0.12 ? 1 : 0; const o2 = { ...o, blink: o.blink ?? blink };
  if (typeof o2.propR === 'string') o2.propR = PROPS[o2.propR]; if (typeof o2.propL === 'string') o2.propL = PROPS[o2.propL];
  const key = JSON.stringify({ ...o, blink: o2.blink }); if (key !== a.last) { a.c.userData.set(o2); a.last = key; }
  const m = a.c.userData.cardMesh; m.rotation.z = Math.sin(t * 1.4 + a.seed) * 0.03 + (o.lean || 0); m.position.y = Math.abs(Math.sin(t * 2.8 + a.seed)) * 0.012 + (o.hop || 0);
}
const hopAt = (t, k = 7, amt = 0.08, ph = 0) => Math.max(0, Math.sin(t * k + ph)) * amt;
const at = (a, x, y, z) => a.c.position.set(x, y, z);

// camera
function camAt(keys, tt) {
  let i = 0; while (i < keys.length - 2 && tt > keys[i + 1][0]) i++;
  const [t0, p0, l0, r0 = 0, f0 = 52] = keys[i], [t1, p1, l1, r1 = r0, f1 = f0] = keys[Math.min(i + 1, keys.length - 1)];
  const u = t1 > t0 ? (i === 0 ? ezo((tt - t0) / (t1 - t0)) : ez((tt - t0) / (t1 - t0))) : 1;
  return { p: p0.map((v, k) => lerp(v, p1[k], u)), l: l0.map((v, k) => lerp(v, l1[k], u)), r: lerp(r0, r1, u), f: lerp(f0, f1, u) };
}
function place(c, t, shake = 0, big = 1) {
  const n = (a, b) => Math.sin(t * a + b) * 0.5 + Math.sin(t * a * 2.3 + b * 1.7) * 0.25;
  camera.fov = c.f; camera.updateProjectionMatrix(); camera.position.set(c.p[0] + (n(0.9, 1) * 0.02 + shake * n(40, 2) * 0.06) * big, c.p[1] + (n(0.7, 2) * 0.015 + shake * n(37, 5) * 0.05) * big, c.p[2]);
  camera.up.set(0, 1, 0); camera.lookAt(c.l[0] + n(0.5, 3) * 0.02 * big, c.l[1] + n(0.6, 4) * 0.015 * big, c.l[2]); camera.rotateZ(c.r + n(0.4, 6) * 0.008 + shake * n(45, 1) * 0.02);
}
const shakeAt = (t, t0, d = 0.5) => (t >= t0 && t < t0 + d ? Math.pow(1 - (t - t0) / d, 2) : 0);
const cw = (ch) => (/[0-9]/.test(ch) ? 7 : 1);
function wt(s, i, needle) { const line = s.line(i), a = s.cue(i), b = s.cueEnd(i); const k = Math.max(0, line.indexOf(needle));
  const al = ALIGN[i]; if (al && al.length === line.split(/\s+/).length) { const ws = line.split(/\s+/), wi = line.slice(0, k).split(/\s+/).length - 1, off = k - ws.slice(0, wi).join(' ').length - (wi ? 1 : 0), t0 = al[wi][1], t1 = wi + 1 < al.length ? al[wi + 1][1] : b - a; return a + t0 + (t1 - t0) * Math.max(0, off) / Math.max(1, ws[wi].length); }
  let pre = 0, tot = 0; for (let j = 0; j < line.length; j++) { const c = cw(line[j]); tot += c; if (j < k) pre += c; } return a + (pre / tot) * (b - a); }


function tidy(list) {
  const n = list.length; for (let i = 1; i < n; i++) { const lo = list[i - 1].a + 0.6, hi = i + 1 < n ? list[i + 1].a - 0.6 : 1e9; if (list[i].a < lo) list[i].a = Math.min(lo, Math.max(list[i - 1].a + 0.3, (list[i - 1].a + hi) / 2)); }
  for (let i = 0; i < n; i++) list[i].b = i + 1 < n ? list[i + 1].a : list[i].b;
  const out = []; list.forEach((x) => { const d = x.b - x.a; if (d <= 2.4 || x.b > 1e8) { out.push(x); return; } const k = Math.ceil(d / 2.1), step = d / k;
    for (let j = 0; j < k; j++) { if (!j) { out.push({ ...x, b: x.a + step }); continue; } const side = j % 2 ? 1 : -1, push = 0.2 + 0.08 * j, far = Math.hypot(...x.keys[0][1].map((v, q) => v - x.keys[0][2][q])) > 20 ? 6 : 1;
      const keys = x.keys.map(([t, p, l, r = 0, f = 52]) => [t, p.map((v, q) => v + (l[q] - v) * push + (q === 0 ? side * 0.25 * far : q === 1 ? 0.1 * far : 0)), l, -r + side * 0.03, f - 4]);
      out.push({ ...x, a: x.a + j * step, b: j === k - 1 ? x.b : x.a + (j + 1) * step, keys, flash: null }); } });
  return out;
}


function renderShot(g, sh, t, alpha = 1) {
  const set = S[sh.set]; const tt = t - sh.a; resetProps(); sh.act(t, tt, sh); set.life.forEach((f) => f(t));
  const c = camAt(sh.keys, tt); const dist = Math.hypot(...c.p.map((v, q) => v - c.l[q])); place(c, t, sh.shake != null ? shakeAt(t, sh.shake, 0.5) : 0, dist > 25 ? 5 : 1); camera.updateMatrixWorld();
  const gr = GRADE[sh.grade || sh.set] || GRADE.hill; const cv = stage.render(set.scene, camera, { focus: Math.min(dist, 30), aperture: dist > 25 ? 1.5 : 6, ...gr, sat: sh.war ? 0.6 : gr.sat });
  g.save(); g.globalAlpha = alpha;
  if (sh.dream) { g.filter = 'saturate(0.45) brightness(1.06)'; const N = 48, sh2 = H / N; for (let i = 0; i < N; i++) { const dx = Math.sin(i * 0.35 + t * 3) * 10; g.drawImage(cv, 0, i * sh2 * (cv.height / H), cv.width, sh2 * (cv.height / H) + 1, dx, i * sh2, W, sh2 + 1); } g.filter = 'none';
    const rg = g.createRadialGradient(W / 2, H / 2, W * 0.35, W / 2, H / 2, H * 0.62); rg.addColorStop(0, 'rgba(255,255,255,0)'); rg.addColorStop(1, 'rgba(255,255,255,.75)'); g.fillStyle = rg; g.fillRect(0, 0, W, H);
  } else g.drawImage(cv, 0, 0, W, H);
  if (sh.war) { g.fillStyle = 'rgba(160,40,20,.28)'; g.fillRect(0, 0, W, H); }
  g.restore();
  if (sh.flash != null) { const k = t - sh.flash, a = k < 0 ? 0 : k < 0.27 ? 0 : k < 0.6 ? 1 - (k - 0.27) / 0.33 : 0; const pre = Math.max(0, 1 - Math.abs(k) / 0.27); g.save(); g.globalAlpha = Math.max(a, pre) * 0.9 * alpha; g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); g.restore(); }
  overlays(g, t, alpha);
}

function tag(g, t, b, alpha) { const p = ezo(span(t, b.t0, 0.3)); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1480); g.rotate(-0.05); g.scale(0.8 + 0.2 * p, 0.8 + 0.2 * p);
  g.font = `800 84px ${ML}`; const w = Math.min(980, g.measureText(b.txt).width + 110); g.fillStyle = '#c8312c'; g.strokeStyle = '#2a1c17'; g.lineWidth = 9; g.beginPath(); g.roundRect(-w / 2, -80, w, b.sub ? 220 : 160, 24); g.fill(); g.stroke();
  text(g, b.txt, 0, 0, { size: 84, color: '#fff6d0', maxWidth: w - 60 }); if (b.sub) text(g, b.sub, 0, 92, { size: 56, color: '#f6d24a', maxWidth: w - 60 }); g.restore(); }
function badge(g, t, b, alpha) {
  const p = ezo(span(t, b.t0, 0.27)); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1480); g.rotate(-0.04); g.scale(0.8 + 0.2 * p, 0.8 + 0.2 * p);
  g.font = `800 88px ${ML}`; const w = Math.min(980, g.measureText(b.txt).width + 120);
  g.fillStyle = '#f6d24a'; g.strokeStyle = '#2a1c17'; g.lineWidth = 10; g.beginPath(); g.roundRect(-w / 2, -90, w, b.sub ? 230 : 180, 26); g.fill(); g.stroke();
  text(g, b.txt, 0, 0, { font: /^[0-9 ]+$/.test(b.txt) ? "'Oswald'" : ML, weight: 800, size: 88, color: '#2a1c17', align: 'center', maxWidth: w - 60 }); if (b.sub) text(g, b.sub, 0, 92, { font: /[a-zA-Z0-9]/.test(b.sub) && !/[ഀ-ൿ]/.test(b.sub) ? "'Oswald'" : ML, weight: 700, size: 56, color: '#8a1e1e', align: 'center', maxWidth: w - 60 }); g.restore();
}
function bubble(g, t, b, alpha) {
  const p = ezo(span(t, b.t0, 0.25)); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W * b.x, H * b.y); g.scale(0.7 + 0.3 * p, 0.7 + 0.3 * p);
  g.font = `800 76px ${ML}`; const w = Math.min(980, g.measureText(b.txt).width + 100);
  g.fillStyle = '#ffffff'; g.strokeStyle = '#2a1c17'; g.lineWidth = 9; g.beginPath(); g.roundRect(-w / 2, -80, w, 160, 60); g.moveTo(-40, 78); g.lineTo(-90, 170); g.lineTo(20, 78); g.fill(); g.stroke();
  g.fillStyle = '#ffffff'; g.fillRect(-36, 66, 52, 20); text(g, b.txt, 0, 4, { size: 76, color: '#2a1c17', maxWidth: w - 60 }); g.restore();
}
function stamp(g, t, b, alpha) {
  const k = span(t, b.t0, 0.25); if (k <= 0) return; const sc = lerp(2.2, 1, ezo(k)); g.save(); g.globalAlpha = alpha * Math.min(1, k * 3); g.translate(W / 2, 1420); g.rotate(-0.12); g.scale(sc, sc);
  g.strokeStyle = '#d0281e'; g.lineWidth = 14; g.beginPath(); g.roundRect(-400, -120, 800, 240, 24); g.stroke(); g.lineWidth = 5; g.beginPath(); g.roundRect(-376, -96, 752, 192, 16); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(-370, -90, 740, 180); text(g, b.txt, 0, -18, { size: 92, color: '#d0281e', maxWidth: 720 }); text(g, b.sub, 0, 62, { font: "'Oswald'", weight: 700, size: 54, color: '#d0281e' }); g.restore();
}
function bigNum(g, t, b, alpha) {
  const p = ezo(span(t, b.t0, 0.3)); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1330); g.scale(0.7 + 0.3 * p, 0.7 + 0.3 * p);
  let txt = b.txt; if (b.count) { const n = parseInt(b.txt.replace(/[^0-9]/g, ''), 10), u = ezo(span(t, b.t0, 0.9)), v = Math.round(n * u), pre = b.txt.startsWith('₹') ? '₹' : '', suf = b.txt.endsWith('+') ? '+' : ''; txt = pre + (n >= 1000 ? v.toLocaleString('en-IN') : String(v)) + suf; }
  text(g, txt, 0, 0, { font: /^[0-9₹,+? a-zA-Z]+$/.test(b.txt) ? "'Oswald'" : ML, weight: 800, size: /^[0-9₹,+? a-zA-Z]+$/.test(b.txt) ? 190 : 120, color: '#f6d24a', stroke: '#2a1c17', strokeWidth: 24, maxWidth: 1000 });
  text(g, b.sub, 0, 150, { size: 64, color: '#ffffff', stroke: '#2a1c17', strokeWidth: 14, maxWidth: 980 }); g.restore();
}
// captions: 1-2 words at the very top (owner's call), synced to the take's word times
function captions(g, s) {
  const t = s.t; let li = -1; for (let i = 0; s.line(i); i++) if (t >= s.cue(i) - 0.05 && t < s.cueEnd(i) + 0.15) li = i; if (li < 0) return;
  const words = s.line(li).split(/\s+/), a = s.cue(li), b = s.cueEnd(li), wl = (w) => [...w].reduce((x, ch) => x + cw(ch), 0), tot = words.reduce((x, w) => x + wl(w) + 2, 0); let acc = 0;
  const al = ALIGN[li] && ALIGN[li].length === words.length ? ALIGN[li] : null; const ws = words.map((w, q) => { const t0 = al ? a + al[q][1] : a + (acc / tot) * (b - a); acc += wl(w) + 2; return [w, t0]; });
  const chunks = []; for (let i = 0; i < ws.length;) { const n = ws[i][0].length > 9 || (ws[i + 1] && ws[i + 1][0].length > 9) ? 1 : 2; chunks.push(ws.slice(i, i + n)); i += n; }
  let k = 0; while (k + 1 < chunks.length && t >= chunks[k + 1][0][1]) k++;
  const str = chunks[k].map(([w]) => w).join(' '), p = ezo(span(t, chunks[k][0][1], 0.12)), sc = 0.88 + 0.12 * p;
  g.save(); g.translate(W / 2, 290); g.scale(sc, sc); g.font = `800 92px ${ML}`; const fsz = Math.min(92, 92 * 940 / (g.measureText(str).width + 1)); g.font = `800 ${fsz}px ${ML}`;
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = fsz * 0.22; g.strokeStyle = '#120c0a'; g.strokeText(str, 0, 0); g.fillStyle = '#ffffff'; g.fillText(str, 0, 0); g.restore();
}
let SH = null;
function main(g, s) {
  if (!SH) SH = shots(s);
  const t = s.t; let i = SH.findIndex((x) => t >= x.a && t < x.b); if (i < 0) i = t < SH[0].a ? 0 : SH.length - 1;
  const sh = SH[i], prev = SH[i - 1], XF = 0.3;
  if (prev && prev.set !== sh.set && t < sh.a + XF) { renderShot(g, prev, t); renderShot(g, sh, t, ez((t - sh.a) / XF)); } else renderShot(g, sh, t);
  captions(g, s);
}
function end(g, s) { main(g, s); }
export const scenes = { main, end };
// ------------------------------------------------------------------ cast on the sets
let ALL = [];
function buildCast() { const A = (set, who, x, z, y = 0, s = 1) => { const a = actor(S[set].scene, who, x, z, y, s); ALL.push(a); return a; };
  const hi = S.hill, T = hi.TOP, hh = hi.hillHeight; const stepY = (k) => T + 0.6 - k * 0.42, stepZ = (k) => T && 4.4 + k * 0.62;
  hi.sh = A('hill', 'shadow', 0.9, 23, hh(0.9, 23)); hi.p1 = A('hill', 'swami', -0.8, stepZ(13), stepY(13)); hi.p2 = A('hill', 'swami2', 0.7, stepZ(15), stepY(15)); hi.p3 = A('hill', 'kanni', -0.3, stepZ(17), stepY(17));
  hi.q1 = A('hill', 'swami3', -1.0, 18.6, hh(-1.0, 18.6)); hi.q2 = A('hill', 'swami', 1.1, 18.9, hh(1.1, 18.9));
  const pa = S.path, px = pa.pathX; pa.a = A('path', 'swami', px(-1) - 0.5, -1, 0); pa.b = A('path', 'swami2', px(-2.6) + 0.5, -2.6, 0); pa.c = A('path', 'kanni', px(-3.8) - 0.2, -3.8, 0); pa.d = A('path', 'swami3', px(-5.4) + 0.3, -5.4, 0);
  const iq = S.inq; iq.dig = A('inq', 'dig', -0.3, -1.0); iq.con = A('inq', 'constable', -3.6, -2.2);
  const fo = S.forge; fo.c1 = A('forge', 'caster', -1.5, -2.5); fo.c2 = A('forge', 'caster', 1.7, -2.7);
}
function resetProps() { ALL.forEach((x) => { x.c.visible = false; x.c.position.set(...x.base); });
  const hi = S.hill; hi.setMode('night'); hi.setFire(0, 0); hi.setBuild(1); hi.setDoors(0); hi.setLamps(0); hi.setCrowd(0); hi.setMakara(0); S.path.setKite(false); S.inq.setBoard(0); S.forge.setPour(0); OV = {}; }
let OV = null;

// ------------------------------------------------------------------ shots
function shots(s) { return tidy(rawShots(s)); }
function rawShots(s) {
  const n = []; for (let i = 0; s.line(i); i++) n.push(s.line(i));
  const id = (start) => n.findIndex((x) => x.startsWith(start));
  const I = { hook: id('ആയിരത്തി'), see: id('നോക്കൂ'), inq: id('സർക്കാർ'), wait: id('കാത്തിരിക്കൂ'), twist: id('ട്വിസ്റ്റ്'), wif: id('അന്ന്'), cb: id('ഒരു രാത്രിയിലെ'), ask: id('നിങ്ങൾ') };
  const L = (i) => s.cue(i), w = (i, nd) => wt(s, i, nd);
  const HI = (k) => ({ set: 'hill', ...k }), PA = (k) => ({ set: 'path', ...k }), IQ = (k) => ({ set: 'inq', ...k }), FO = (k) => ({ set: 'forge', ...k });
  const hi = S?.hill, pa = S?.path, iq = S?.inq, fo = S?.forge, T = 22, hh = hi ? hi.hillHeight : () => 0;
  const push = (p0, lk, r0 = 0.03, f = 50, d = [0, 0, -0.6]) => [[0, p0, lk, r0, f], [0.35, p0.map((x, q) => x + d[q] * 0.4), lk, 0.01, f - 2], [2.2, p0.map((x, q) => x + d[q]), lk, -0.02, f - 4]];
  const fireWide = push([8, T + 7, 34], [0, T + 3, 0], 0.02, 50, [-1, -1, -5]);
  const fireClose = push([3, T + 4, 16], [0, T + 4, -2], 0.03, 50, [-0.5, 0, -2.5]);
  const doors = push([0.4, T + 2.4, 8.5], [0, T + 2.4, -1], 0.02, 48, [0, 0, -1.8]);
  const shadowCam = push([1.6, hh(1.6, 26.5) + 2.4, 26.5], [0, T + 3, -2], 0.03, 50, [-0.2, 0, -0.8]);
  const dayWide = push([4, T + 4, 30], [0, T + 2.5, 0], 0.02, 50, [-0.5, -0.5, -4]);
  const stepsCam = push([0, T - 4.5, 28], [0, T - 0.6, 6], 0.02, 50, [0, 0.4, -3]);
  const lampsCam = push([30, T + 30, 110], [-20, T, -40], 0.02, 50, [-3, -2, -12]);
  const paCam = push([0.6, 1.6, 6.5], [0, 1.5, -6], 0.03, 52, [0, 0, -1.2]);
  const paHigh = push([3, 4.5, 8], [-0.5, 1, -8], 0.02, 52, [-0.5, 0, -1]);
  const iqWide = push([0.4, 2.3, 5.6], [-0.8, 1.9, -2.5], 0.03, 52, [0, 0, -0.8]);
  const iqDig = push([0.2, 1.9, 2.4], [-0.2, 1.6, -1.0], 0.03, 50, [0, 0, -0.5]);
  const iqBoard = [[0, [-3.1, 2.9, 3.4], [-3.1, 2.9, -4.85], 0.02, 50], [2.6, [-1.7, 2.9, 3.0], [-1.7, 2.9, -4.85], -0.02, 48]];
  const iqLamp = push([3.3, 2.0, 1.2], [2.0, 1.3, -1.5], 0.03, 50, [-0.2, -0.1, -0.5]);
  const foCam = push([0.2, 2.7, 5.6], [-0.1, 1.0, -1.6], 0.03, 52, [0, -0.2, -0.9]);
  const out = []; const add = (x) => { if (x.a != null && x.b != null && x.b > x.a) out.push(x); };
  const ppl = (a, o, t) => pose(a, { expr: 'neutral', R: 'hang', L: 'hang', ...o }, t);
  const walkers = (t, list) => list.forEach(([a, z0], k) => { const z = z0 + (t * 0.55) % 3; at(a, pa.pathX(z) + (k % 2 ? 0.5 : -0.5), 0, z); ppl(a, { expr: k % 3 ? 'smile' : 'neutral', R: k === 0 ? 'hold' : 'hang', propR: k === 0 ? 'stick' : undefined, L: 'hang', walk: t * 1.6 + k * 0.4 }, t); });
  const pilgrimsOnSteps = (t, up = 0) => { [[hi.p1, 13], [hi.p2, 15], [hi.p3, 17]].forEach(([a, k], j) => { const kk = k - up * 3; at(a, a.base[0], T + 0.6 - kk * 0.42, 4.4 + kk * 0.62); ppl(a, { expr: j === 2 ? 'beam' : 'proud', R: 'clap', L: 'clap', walk: up > 0 ? t * 1.4 + j : 0 }, t); }); };
  // ---- 1. HOOK: 1950. Deep in the forest the shrine burned to ash; the idol found broken. Not an accident... a planned attack?
  if (I.hook >= 0) { const i = I.hook, wKo = w(i, 'കൊടുംകാട്ടിനുള്ളിൽ'), wKa = w(i, 'കത്തിച്ചാമ്പലായി.'), wVi = w(i, 'വിഗ്രഹം'), wAt = w(i, 'അതൊരു'), wAs = w(i, 'ആസൂത്രിതമായ'), end = L(i + 1);
    add(HI({ a: 0, b: wKo - 0.1, keys: fireWide, grade: 'fire', act: (t) => { hi.setFire(1); OV.cal = { t0: 0.05, top: 'ശബരിമല', big: '1950' }; } }));
    add(HI({ a: wKo - 0.1, b: wVi - 0.1, keys: fireClose, grade: 'fire', shake: wKa, act: (t) => { hi.setFire(1); OV.stamp = { t0: wKa, txt: 'കത്തിച്ചാമ്പലായി!', sub: 'SABARIMALA · 1950' }; } }));
    add(HI({ a: wVi - 0.1, b: wAt - 0.1, keys: doors, grade: 'fire', act: (t) => { hi.setFire(0.25, 1); hi.setDoors(0.15); OV.badge = { t0: wVi + 0.2, txt: 'വിഗ്രഹം തകർന്നു', sub: 'THE IDOL, BROKEN' }; OV.dim = 0.25; } }));
    add(HI({ a: wAt - 0.1, b: end, keys: fireWide, grade: 'fire', act: (t) => { hi.setFire(1); OV.shadow = { t0: wAt - 0.1 }; OV.chips = { list: [['അപകടമോ? ❌', wAt + 0.3]] }; if (t > wAs - 0.1) { OV.chips = null; OV.big = { t0: wAs, txt: '?', sub: 'ആസൂത്രിത ആക്രമണം?' }; } } })); }
  // ---- 2. YOU SEE: no road, no electricity; on foot through the forest from Erumeli
  if (I.see >= 0) { const i = I.see, wRo = w(i, 'റോഡില്ല,'), wVa = w(i, 'വൈദ്യുതിയില്ല.'), wEr = w(i, 'എരുമേലി'), end = L(i + 1);
    add(PA({ a: L(i), b: wEr - 0.1, keys: paCam, act: (t) => { walkers(t, [[pa.a, -2], [pa.b, -3.6], [pa.c, -4.8], [pa.d, -6.4]]); OV.chips = { list: [['റോഡില്ല ❌', wRo], ['കറന്റില്ല ❌', wVa]] }; } }));
    add(PA({ a: wEr - 0.1, b: end, keys: paHigh, act: (t) => { pa.setKite(true); walkers(t, [[pa.a, -2], [pa.b, -3.6], [pa.c, -4.8], [pa.d, -6.4]]); OV.route = { t0: wEr }; } })); }
  // ---- 3. INQUIRY: the government was shaken; DIG K. Kesava Menon's inquiry; report: not a forest fire, set deliberately; who, never proven
  if (I.inq >= 0) { const i = I.inq, wDi = w(i, 'ഡിഐജി'), wRe = w(i, 'റിപ്പോർട്ട്:'), wKt = w(i, 'കാട്ടുതീയല്ല,'), wMa = w(i, 'മനഃപൂർവ്വം'), wPa = w(i, 'പക്ഷേ'), end = L(i + 1);
    add(IQ({ a: L(i), b: wDi - 0.1, keys: iqWide, act: (t) => { ppl(iq.dig, { expr: 'shock', R: 'hold', propR: 'report', L: 'hang' }, t); ppl(iq.con, { expr: 'nervous', R: 'hang', L: 'hang' }, t); OV.tag = { t0: L(i) + 0.15, txt: 'സർക്കാർ ഞെട്ടി!', sub: 'TRAVANCORE-COCHIN · 1950' }; } }));
    add(IQ({ a: wDi - 0.1, b: wRe - 0.1, keys: iqDig, act: (t) => { ppl(iq.dig, { expr: 'stern', R: 'hold', propR: 'report', L: 'hip' }, t); OV.tag = { t0: wDi + 0.1, txt: 'കെ. കേശവമേനോൻ', sub: 'DIG · INQUIRY' }; } }));
    add(IQ({ a: wRe - 0.1, b: wPa - 0.1, keys: iqBoard, shake: wMa + 0.2, act: (t) => { iq.setBoard(clamp((t - wRe) / Math.max(0.6, wPa - wRe), 0, 0.6)); OV.chips = { list: [['കാട്ടുതീ ❌', wKt]] }; if (t > wMa - 0.1) { OV.chips = null; OV.stamp = { t0: wMa, txt: 'മനഃപൂർവ്വം!', sub: 'ARSON · NOT A FOREST FIRE' }; } } }));
    add(IQ({ a: wPa - 0.1, b: end, keys: iqLamp, act: (t) => { iq.setBoard(1); OV.badge = { t0: wPa + 0.3, txt: 'ആര്? ഇന്നും അറിയില്ല', sub: 'NO ONE WAS EVER CHARGED' }; } })); }
  // ---- 4. WAIT...: the fire didn't finish Sabarimala; a new panchaloha idol cast at Chengannur; the shrine rose again
  if (I.wait >= 0) { const i = I.wait, wCh = w(i, 'ചെങ്ങന്നൂരിൽ'), wVa = w(i, 'വാർത്തു.'), wKs = w(i, 'ക്ഷേത്രം'), end = L(i + 1);
    add(HI({ a: L(i), b: wCh - 0.1, keys: fireWide, grade: 'ash', act: (t) => { hi.setFire(0.12, 1); OV.wait = { t0: L(i) }; } }));
    add(FO({ a: wCh - 0.1, b: wKs - 0.1, keys: foCam, act: (t) => { fo.setPour(ezo(clamp((t - (wVa - 1.2)) / 1.2, 0, 1))); ppl(fo.c1, { expr: 'proud', R: 'hold', propR: 'tongs', L: 'hip' }, t); ppl(fo.c2, { expr: 'smile', R: 'point', L: 'hang' }, t); OV.tag = { t0: wCh + 0.1, txt: 'ചെങ്ങന്നൂർ', sub: 'പഞ്ചലോഹം · PANCHALOHA' }; } }));
    add(HI({ a: wKs - 0.1, b: end, keys: dayWide, grade: 'hill', shake: wKs + 1.2, act: (t) => { hi.setMode('day'); hi.setBuild(lerp(0.05, 1, ezo(clamp((t - wKs) / 1.3, 0, 1)))); OV.badge = { t0: wKs + 0.9, txt: 'വീണ്ടും ഉയർന്നു!', sub: 'REBUILT' }; } })); }
  // ---- 5. TWIST: historians say the news of it made Sabarimala famous across the land
  if (I.twist >= 0) { const i = I.twist, wVa = w(i, 'വാർത്തകളാണ്'), wNa = w(i, 'നാടെങ്ങും'), wCh = w(i, 'ചരിത്രകാരന്മാർ!'), end = L(i + 1);
    add(HI({ a: L(i), b: wNa - 0.1, flash: L(i), keys: dayWide, grade: 'hill', act: (t) => { hi.setMode('day'); OV.big = { t0: L(i) + 0.1, txt: 'ട്വിസ്റ്റ്!', sub: '' }; if (t > wVa - 0.1) { OV.big = null; OV.papers = { t0: wVa }; } } }));
    add(HI({ a: wNa - 0.1, b: end, keys: stepsCam, grade: 'dusk', act: (t) => { hi.setMode('dusk'); hi.setCrowd(clamp((t - wNa + 0.2) / 2, 0.05, 1), t); OV.papers = { t0: wVa }; if (t > wCh - 0.1) OV.tag = { t0: wCh, txt: 'ചരിത്രകാരന്മാർ', sub: 'HISTORIANS SAY' }; } })); }
  // ---- 6. WHAT IF: if the attackers had won... the 18 steps lakhs climb today would have vanished from history
  if (I.wif >= 0) { const i = I.wif, wIn = w(i, 'ഇന്ന്'), wLa = w(i, 'ലക്ഷങ്ങൾ'), wPa = w(i, 'പതിനെട്ടാം'), wMa = w(i, 'മാഞ്ഞുപോയേനെ!'), end = L(i + 1);
    add(HI({ a: L(i), b: wIn - 0.1, keys: fireWide, grade: 'fire', war: true, act: (t) => { hi.setFire(1); OV.shadow = { t0: L(i) - 0.1 }; OV.big = { t0: L(i) + 0.2, txt: '?', sub: 'അവർ ജയിച്ചിരുന്നെങ്കിൽ?' }; } }));
    add(HI({ a: wIn - 0.1, b: end, keys: stepsCam, grade: 'dusk', act: (t) => { hi.setMode('dusk'); hi.setCrowd(1, t); pilgrimsOnSteps(t, clamp((t - wIn) / 3, 0, 1)); if (t < wPa - 0.1) OV.big = { t0: wLa, txt: 'ലക്ഷങ്ങൾ', sub: 'EVERY SEASON' }; else OV.badge = { t0: wPa, txt: 'പതിനെട്ടാം പടി', sub: '18 STEPS' }; if (t > wMa - 0.15) { OV.badge = null; OV.fade = { t0: wMa - 0.1 }; } } })); }
  // ---- 7. CALLBACK: one night's fire... today the whole hill calls Saranam
  if (I.cb >= 0) { const i = I.cb, wIn = w(i, 'ഇന്ന്'), end = L(i + 1);
    add(HI({ a: L(i), b: wIn - 0.1, keys: fireClose, grade: 'fire', act: (t) => { hi.setFire(1); OV.dim = 0.1; } }));
    add(HI({ a: wIn - 0.1, b: end, keys: lampsCam, grade: 'night', act: (t) => { hi.setLamps(ezo(clamp((t - wIn) / 2.2, 0.02, 1))); hi.setCrowd(1, t); hi.setMakara(1); OV.saranam = { t0: wIn + 0.5 }; } })); }
  // ---- 8. QUESTION + SUBSCRIBE: how many times have you climbed the hill?
  if (I.ask >= 0) { const i = I.ask, wKa = w(i, 'കമന്റ്'), wNa = w(i, 'നാളത്തെ');
    add(HI({ a: L(i), b: wNa - 0.1, keys: stepsCam, grade: 'dusk', act: (t) => { hi.setMode('dusk'); hi.setCrowd(1, t); hi.setMakara(1); pilgrimsOnSteps(t, 0); OV.ask = { t0: L(i) + 0.2 }; if (t > wKa - 0.1) OV.comment = { t0: wKa }; } }));
    add(HI({ a: wNa - 0.1, b: L(i) + 60, keys: lampsCam, grade: 'night', act: (t) => { hi.setLamps(1); hi.setCrowd(1, t); hi.setMakara(1); OV.follow = { t0: wNa }; } })); }
  return out;
}

const GRADE = { hill: { hazeAmt: 0.05, haze: 0xcfdde6, sat: 1.12, contrast: 0.08, lift: 0.01, warm: 0.03, vignette: 0.3 }, fire: { hazeAmt: 0.04, haze: 0x2a1a20, sat: 1.1, contrast: 0.1, lift: 0.0, warm: 0.06, vignette: 0.45 },
  ash: { hazeAmt: 0.06, haze: 0x2a2a34, sat: 0.55, contrast: 0.08, lift: 0.01, warm: -0.02, vignette: 0.45 }, dusk: { hazeAmt: 0.08, haze: 0xd8a080, sat: 1.1, contrast: 0.08, lift: 0.015, warm: 0.06, vignette: 0.35 },
  night: { hazeAmt: 0.05, haze: 0x1a2040, sat: 1.15, contrast: 0.1, lift: 0.02, warm: 0.02, vignette: 0.4 }, path: { hazeAmt: 0.1, haze: 0xb8d0b0, sat: 1.1, contrast: 0.07, lift: 0.015, warm: 0.04, vignette: 0.32 },
  inq: { hazeAmt: 0.06, haze: 0xf0e0c0, sat: 1.04, contrast: 0.08, lift: 0.015, warm: 0.05, vignette: 0.4 }, forge: { hazeAmt: 0.05, haze: 0x3a2010, sat: 1.12, contrast: 0.1, lift: 0.0, warm: 0.08, vignette: 0.45 } };

// ------------------------------------------------------------------ overlays (story-specific motion graphics)
function overlays(g, t, alpha) {
  if (OV.dim) { g.save(); g.globalAlpha = alpha * OV.dim; g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.restore(); }
  if (OV.fade) ashFade(g, t, OV.fade.t0, alpha);
  if (OV.shadow) shadowMan(g, t, OV.shadow.t0, alpha);
  if (OV.wait) waitCard(g, t, OV.wait.t0, alpha);
  if (OV.cal) calendar(g, t, OV.cal, alpha);
  if (OV.chips) chips(g, t, OV.chips.list, alpha, 1450);
  if (OV.route) route(g, t, OV.route.t0, alpha);
  if (OV.papers) papers(g, t, OV.papers.t0, alpha);
  if (OV.saranam) saranam(g, t, OV.saranam.t0, alpha);
  if (OV.ask) ask(g, t, OV.ask.t0, alpha);
  if (OV.comment) comment(g, t, OV.comment.t0, alpha);
  if (OV.follow) follow(g, t, OV.follow.t0, alpha);
  if (OV.badge) badge(g, t, OV.badge, alpha);
  if (OV.bubble) bubble(g, t, OV.bubble, alpha);
  if (OV.stamp) stamp(g, t, OV.stamp, alpha);
  if (OV.tag) tag(g, t, OV.tag, alpha);
  if (OV.big) bigNum(g, t, OV.big, alpha);
}
function ashFade(g, t, t0, alpha) { const u = ezo(span(t, t0, 1.2)); if (u <= 0) return; g.save(); g.globalAlpha = alpha * u; g.globalCompositeOperation = 'saturation'; g.fillStyle = '#808080'; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over';
  g.globalAlpha = alpha * u * 0.55; g.fillStyle = '#1a1614'; g.fillRect(0, 0, W, H); g.globalAlpha = alpha * u; for (let k = 0; k < 90; k++) { const x = (Math.sin(k * 91.7) * 0.5 + 0.5) * W, y = ((Math.sin(k * 37.1) * 0.5 + 0.5) * H - (t - t0) * (60 + k % 7 * 20)) % H; g.fillStyle = 'rgba(200,190,180,.5)'; g.beginPath(); g.arc(x, (y + H) % H, 2 + k % 4, 0, 7); g.fill(); }
  g.globalAlpha = alpha * pop(t, t0 + 0.3, 0.3); text(g, 'മാഞ്ഞുപോയേനെ...', W / 2, 1420, { size: 96, color: '#e8e0d8', stroke: '#120c0a', strokeWidth: 20, maxWidth: 980 }); g.restore(); }
function shadowMan(g, t, t0, alpha) { const p = pop(t, t0, 0.5); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(lerp(-120, 250, p), 1950); g.scale(2.6, 2.6);
  const lg = g.createRadialGradient(150, -420, 5, 150, -420, 140); lg.addColorStop(0, 'rgba(255,200,90,.55)'); lg.addColorStop(1, 'rgba(255,160,60,0)'); g.fillStyle = lg; g.fillRect(0, -560, 300, 300);
  B.drawBean(g, 'shadow', { R: 'holdUp', propR: PROPS.lamp, L: 'hang', walk: (t - t0) * 0.8 }); g.restore(); }
function route(g, t, t0, alpha) { const p = pop(t, t0, 0.3); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1420); g.scale(0.85 + 0.15 * p, 0.85 + 0.15 * p);
  card(g, 940, 330, '#f4ecd6'); const u = ezo(span(t, t0 + 0.3, 2.4)); g.strokeStyle = '#8a5a2a'; g.lineWidth = 10; g.setLineDash([4, 22]); g.lineCap = 'round'; g.beginPath(); g.moveTo(-330, 40); g.bezierCurveTo(-150, -60, 120, 120, 330, 20); g.stroke(); g.setLineDash([]);
  const bx = (k) => { const a = 1 - k; return [a * a * a * -330 + 3 * a * a * k * -150 + 3 * a * k * k * 120 + k * k * k * 330, a * a * a * 40 + 3 * a * a * k * -60 + 3 * a * k * k * 120 + k * k * k * 20]; }; const [x, y] = bx(u);
  text(g, '🚶', x, y - 36, { font: 'sans-serif', size: 70 }); text(g, 'എരുമേലി', -310, -100, { size: 52, color: '#2a1c17' }); text(g, 'ശബരിമല', 300, -100, { size: 52, color: '#8a1e1e' }); text(g, 'കാൽനട മാത്രം', 0, 128, { size: 46, color: '#5a3a1a' }); g.restore(); }
function papers(g, t, t0, alpha) { const heads = ['ശബരിമല തീവെപ്പ്!', 'അന്വേഷണം', 'SABARIMALA'], rot = [-0.12, 0.08, -0.04]; heads.forEach((hd, k) => { const p = pop(t, t0 + k * 0.45, 0.35); if (p <= 0) return; const sc = lerp(2.4, 1, p); g.save(); g.globalAlpha = alpha * Math.min(1, p * 2); g.translate(W / 2 + (k - 1) * 120, 1180 + k * 150); g.rotate(rot[k] + (1 - p) * 2); g.scale(sc * 0.9, sc * 0.9);
  g.fillStyle = '#f2ecdc'; g.strokeStyle = '#2a1c17'; g.lineWidth = 6; g.beginPath(); g.rect(-300, -150, 600, 300); g.fill(); g.stroke(); g.fillStyle = '#2a1c17'; g.fillRect(-280, -136, 560, 8); text(g, hd, 0, -82, { size: /[ഀ-ൿ]/.test(hd) ? 60 : 64, font: /[ഀ-ൿ]/.test(hd) ? ML : "'Oswald'", weight: /[ഀ-ൿ]/.test(hd) ? 800 : 700, color: '#2a1c17', maxWidth: 560 });
  g.fillStyle = 'rgba(42,28,23,.35)'; for (let r = 0; r < 5; r++) { g.fillRect(-280, -20 + r * 30, 250, 12); g.fillRect(20, -20 + r * 30, 260, 12); } g.restore(); }); }
function saranam(g, t, t0, alpha) { const p = pop(t, t0, 0.5); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; const s = 1 + Math.sin(t * 2.2) * 0.02; g.translate(W / 2, 1400); g.scale(s, s); text(g, 'സ്വാമിയേ', 0, -70, { size: 104, color: '#ffd870', stroke: '#2a1c17', strokeWidth: 20 }); text(g, 'ശരണമയ്യപ്പ 🙏', 0, 70, { size: 104, color: '#ffffff', stroke: '#2a1c17', strokeWidth: 20, maxWidth: 1000 }); g.restore(); }
function ask(g, t, t0, alpha) { const pq = pop(t, t0, 0.3); if (pq > 0) { g.save(); g.globalAlpha = alpha * pq; text(g, 'എത്ര തവണ മല കയറി?', W / 2, 1110, { size: 84, color: '#ffffff', stroke: '#2a1c17', strokeWidth: 18, maxWidth: 1000 }); g.restore(); }
  [['0', '🙂'], ['1-4', '🙏'], ['5+', '🔥']].forEach(([lbl, ic], j) => { const p = pop(t, t0 + 0.5 + j * 0.35, 0.3); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2 + (j - 1) * 320, 1350); g.rotate((j - 1) * 0.05); g.scale(0.8 + 0.2 * p, 0.8 + 0.2 * p);
    card(g, 280, 300, '#f4ecd6'); text(g, ic, 0, -50, { font: 'sans-serif', size: 100 }); g.fillStyle = '#c8312c'; g.beginPath(); g.roundRect(-110, 50, 220, 90, 20); g.fill(); g.stroke(); text(g, lbl, 0, 96, { font: "'Oswald'", weight: 700, size: 66, color: '#fff' }); g.restore(); }); }
function waitCard(g, t, t0, alpha) { const k = t - t0; if (k < 0 || k > 1.6) return; const p = pop(t, t0, 0.25); g.save(); g.globalAlpha = alpha * p * (k > 1.3 ? 1 - (k - 1.3) / 0.3 : 1); g.translate(W / 2, 1380); g.scale(0.8 + 0.2 * p, 0.8 + 0.2 * p);
  text(g, 'കാത്തിരിക്കൂ...', 0, 0, { size: 110, color: '#f6d24a', stroke: '#2a1c17', strokeWidth: 22 }); text(g, '✋', 0, -170, { font: 'sans-serif', size: 140 }); g.restore(); }
const card = (g, w, h, fill = '#f4ecd6', r = 28) => { g.fillStyle = fill; g.strokeStyle = '#2a1c17'; g.lineWidth = 9; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, r); g.fill(); g.stroke(); };
const pop = (t, t0, d = 0.3) => ezo(span(t, t0, d));
function calendar(g, t, c, alpha) { const p = pop(t, c.t0); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1400); g.rotate(-0.04); g.scale(0.8 + 0.2 * p, 0.8 + 0.2 * p);
  card(g, 520, 440, '#f4f0e6'); g.fillStyle = '#c8312c'; g.beginPath(); g.roundRect(-260, -220, 520, 120, [28, 28, 0, 0]); g.fill(); g.stroke();
  const ml = /[ഀ-ൿ]/.test(c.top); text(g, c.top, 0, -160, { font: ml ? ML : "'Oswald'", weight: ml ? 800 : 700, size: ml ? 60 : 72, color: '#fff', maxWidth: 470 }); text(g, c.big, 0, 60, { font: "'Oswald'", weight: 700, size: c.big.length > 4 ? 150 : 190, color: '#2a1c17', maxWidth: 470 }); g.restore(); }
function chips(g, t, list, alpha, y, fill = '#c8312c') { const vis = list.filter(([, t0]) => t >= t0 - 0.05); const n = vis.length; if (!n) return; const cols = n > 2 ? 2 : n;
  vis.forEach(([txt, t0], k) => { const p = pop(t, t0, 0.25); const r = Math.floor(k / 2), c = k % 2, cx = cols === 1 ? W / 2 : W / 2 + (c ? 240 : -240); g.save(); g.globalAlpha = alpha * p; g.translate(cx, y + r * 170); g.rotate(c ? 0.04 : -0.04); g.scale(0.7 + 0.3 * p, 0.7 + 0.3 * p);
    g.font = `800 70px ${ML}`; const w = Math.min(460, g.measureText(txt).width + 90); g.fillStyle = fill; g.strokeStyle = '#f6d24a'; g.lineWidth = 8; g.beginPath(); g.roundRect(-w / 2, -64, w, 128, 26); g.fill(); g.stroke(); text(g, txt, 0, 2, { size: 70, color: '#fff6d0', maxWidth: w - 40 }); g.restore(); }); }
function comment(g, t, t0, alpha) { const p = pop(t, t0, 0.25); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1640 + Math.sin(t * 6) * 6); g.scale(p, p); card(g, 560, 120, '#ffffff', 60); text(g, '💬 കമന്റ് ചെയ്യൂ 👇', 0, 4, { size: 54, color: '#2a1c17', maxWidth: 520 }); g.restore(); }
function follow(g, t, t0, alpha) { const p = pop(t, t0, 0.3); if (p <= 0) return; const k = t - t0, press = k > 1.2 ? 1 : 0, sq = k > 1.2 && k < 1.4 ? 0.92 : 1; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1380); g.scale((0.8 + 0.2 * p) * sq, (0.8 + 0.2 * p) * sq);
  card(g, 900, 380, '#f4ecd6'); text(g, "നാളത്തെ 'എങ്കിലോ?'", 0, -90, { size: 70, color: '#2a1c17', maxWidth: 840 }); g.fillStyle = press ? '#6a6a70' : '#d0281e'; g.beginPath(); g.roundRect(-300, 0, 600, 130, 65); g.fill(); g.stroke();
  text(g, press ? 'SUBSCRIBED ✓' : 'SUBSCRIBE', 0, 66, { font: "'Oswald'", weight: 700, size: 70, color: '#fff' });
  if (k > 0.6) { const u = ezo(span(t, t0 + 0.6, 0.6)); g.save(); g.translate(lerp(380, 60, u), lerp(260, 90, u)); g.rotate(-0.4); g.fillStyle = '#fff'; g.strokeStyle = '#2a1c17'; g.lineWidth = 6; g.beginPath(); g.moveTo(0, 0); g.lineTo(26, 70); g.lineTo(38, 44); g.lineTo(66, 60); g.lineTo(54, 34); g.lineTo(82, 28); g.closePath(); g.fill(); g.stroke(); g.restore(); }
  g.restore(); }
export const hits = [];
export const extraHits = (timeline) => {
  const m = timeline.scenes.find((x) => x.id === 'main'), out = []; const s = { line: (i) => m.cues[i]?.text, cue: (i) => m.cues[i].start, cueEnd: (i) => m.cues[i].end };
  const sh = shots(s); sh.forEach((x, i) => { if (!i) return; const cut = sh[i - 1].set !== x.set; if (cut || i % 4 === 0) out.push({ t: m.start + x.a - 0.15, kind: 'whoosh', vol: cut ? 0.22 : 0.1 }); });
  const n = []; for (let i = 0; s.line(i); i++) n.push(s.line(i)); const id = (st) => n.findIndex((x) => x.startsWith(st));
  const at2 = (st, nd) => { const i = id(st); return i < 0 ? null : m.start + wt(s, i, nd); }, add = (t, kind, vol) => { if (t != null) out.push({ t, kind, vol }); };
  add(m.start + 0.1, 'boom', 0.35); add(m.start + 0.15, 'chime', 0.25); add(at2('ആയിരത്തി', 'കത്തിച്ചാമ്പലായി.'), 'thud', 0.55); add(at2('ആയിരത്തി', 'കത്തിച്ചാമ്പലായി.') + 0.05, 'boom', 0.3); add(at2('ആയിരത്തി', 'വിഗ്രഹം') + 0.2, 'pop', 0.3); add(at2('ആയിരത്തി', 'അതൊരു') + 0.3, 'pop', 0.3); add(at2('ആയിരത്തി', 'ആസൂത്രിതമായ'), 'hit', 0.4);
  add(at2('നോക്കൂ', 'റോഡില്ല,'), 'pop', 0.3); add(at2('നോക്കൂ', 'വൈദ്യുതിയില്ല.'), 'pop', 0.3); add(at2('നോക്കൂ', 'എരുമേലി'), 'chime', 0.25);
  add(at2('സർക്കാർ', 'സർക്കാർ'), 'hit', 0.35); add(at2('സർക്കാർ', 'ഡിഐജി'), 'pop', 0.3); add(at2('സർക്കാർ', 'കാട്ടുതീയല്ല,'), 'pop', 0.3); add(at2('സർക്കാർ', 'മനഃപൂർവ്വം'), 'thud', 0.55); add(at2('സർക്കാർ', 'മനഃപൂർവ്വം') + 0.05, 'hit', 0.4); add(at2('സർക്കാർ', 'പക്ഷേ') + 0.3, 'pop', 0.3);
  add(at2('കാത്തിരിക്കൂ', 'കാത്തിരിക്കൂ...'), 'whoosh', 0.35); add(at2('കാത്തിരിക്കൂ', 'ചെങ്ങന്നൂരിൽ'), 'pop', 0.3); add(at2('കാത്തിരിക്കൂ', 'വാർത്തു.'), 'thud', 0.35); add(at2('കാത്തിരിക്കൂ', 'ക്ഷേത്രം') + 1.2, 'boom', 0.35); add(at2('കാത്തിരിക്കൂ', 'ക്ഷേത്രം') + 0.9, 'chime', 0.3);
  add(at2('ട്വിസ്റ്റ്', 'ട്വിസ്റ്റ്:'), 'boom', 0.45); [0, 0.45, 0.9].forEach((d) => add(at2('ട്വിസ്റ്റ്', 'വാർത്തകളാണ്') + d, 'whoosh', 0.2)); add(at2('ട്വിസ്റ്റ്', 'ചരിത്രകാരന്മാർ!'), 'pop', 0.3);
  add(at2('അന്ന്', 'അന്ന്'), 'hit', 0.35); add(at2('അന്ന്', 'ലക്ഷങ്ങൾ'), 'pop', 0.3); add(at2('അന്ന്', 'പതിനെട്ടാം'), 'chime', 0.3); add(at2('അന്ന്', 'മാഞ്ഞുപോയേനെ!'), 'whoosh', 0.35);
  add(at2('ഒരു രാത്രിയിലെ', 'ഒരു'), 'whoosh', 0.3); add(at2('ഒരു രാത്രിയിലെ', 'ഇന്ന്') + 0.5, 'chime', 0.35);
  add(at2('നിങ്ങൾ', 'എത്ര') + 0.3, 'pop', 0.3); add(at2('നിങ്ങൾ', 'കമന്റ്'), 'chime', 0.3); add(at2('നിങ്ങൾ', 'സബ്സ്ക്രൈബ്'), 'pop', 0.4);
  return out.filter((x) => x.t != null && !Number.isNaN(x.t));
};
void H;
export const shotTimes = (timeline) => { const m = timeline.scenes.find((x) => x.id === 'main'); const s = { line: (i) => m.cues[i]?.text, cue: (i) => m.cues[i].start, cueEnd: (i) => m.cues[i].end }; return shots(s).map((x) => ({ a: m.start + x.a, b: m.start + x.b, set: x.set })); };
