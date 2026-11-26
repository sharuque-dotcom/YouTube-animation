// Thumba 1963 (kit formula): hook = a rocket part riding a bicycle into a church -> what if the bishop had said no;
// you-see (the magnetic equator runs through Thumba, a church in the middle), the underdog team, the mockery, Saturday at
// the bishop's house, Sunday mass and the Amen, prayer room -> lab, house -> office, 183 families move, the analogy,
// the launch at 6:25 pm and the orange sodium cloud, the what-if (years of delay, Kalam's story), the museum today
// (Moon and Mars), callback: one Amen was India's first countdown. Cast ./cast.js, sets ./sets.js.
const ML = "'Noto Malayalam'";
import { W, H, clamp, lerp } from '../../pipeline/engine.js';
import { ALIGN } from './align.js';
function text(g, str, x, y, o = {}) { g.save(); let sz = o.size || 48; const f = () => `${o.weight || 800} ${sz}px ${o.font || ML}`; g.font = f(); if (o.maxWidth) while (g.measureText(str).width > o.maxWidth && sz > 12) { sz -= 2; g.font = f(); }
  g.textAlign = o.align || 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; if (o.stroke) { g.lineWidth = o.strokeWidth || sz * 0.15; g.strokeStyle = o.stroke; g.strokeText(str, x, y); } g.fillStyle = o.color || '#fff'; g.fillText(str, x, y); g.restore(); }



let K = null, B = null, S = null, stage = null, camera = null, THREE = null, PROPS = null;
const ez = (x) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
const ezo = (x) => 1 - Math.pow(1 - clamp(x, 0, 1), 3);
const span = (t, a, d) => clamp((t - a) / d, 0, 1);

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
  const set = S[sh.set]; const tt = t - sh.a; set.life.forEach((f) => f(t)); resetProps(); sh.act(t, tt, sh);
  const c = camAt(sh.keys, tt); const dist = Math.hypot(...c.p.map((v, q) => v - c.l[q])); place(c, t, sh.shake != null ? shakeAt(t, sh.shake, 0.5) : 0, dist > 25 ? 5 : 1); camera.updateMatrixWorld();
  const gr = sh.night ? GRADE.night : GRADE[sh.set]; const cv = stage.render(set.scene, camera, { focus: Math.min(dist, 30), aperture: dist > 25 ? 1.5 : 6, ...gr, sat: sh.war ? 0.6 : gr.sat });
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
  text(g, txt, 0, 0, { font: /^[0-9₹,+ a-zA-Z]+$/.test(b.txt) ? "'Oswald'" : ML, weight: 800, size: /^[0-9₹,+ a-zA-Z]+$/.test(b.txt) ? 190 : 120, color: '#f6d24a', stroke: '#2a1c17', strokeWidth: 24, maxWidth: 1000 });
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

export async function preload() {
  K = await import('../../pipeline/toon3d.js'); THREE = K.THREE; B = await import('../../pipeline/bean.js'); PROPS = B.PROPS;
  (await import('./cast.js')).registerCast(B);
  const Z = await import('./sets.js'), base = await import('../ml-bean/sets.js');
  S = { beach: Z.thumbaSet(base.beachSet()), church: Z.churchSet() };
  buildBeach(); buildChurch();
  stage = K.makeInkStage(W, H); camera = new THREE.PerspectiveCamera(52, W / H, 0.05, 900);
}
export const scenes = { main, end };

// ------------------------------------------------------------------ cast on the sets
function buildBeach() { const b = S.beach, sc = b.scene;
  b.kal = actor(sc, 'kalam', 3, 8); b.sar = actor(sc, 'sarabhai', 19.6, 7.4); b.sci = actor(sc, 'scientist', -2, 6); b.bis = actor(sc, 'bishop', 10.2, -0.6);
  b.sco = actor(sc, 'scoffer', 0, 4); b.fis = actor(sc, 'fisher', 2, 4); b.fw = actor(sc, 'fisherwoman', 3.3, 5); b.fb = actor(sc, 'fisherboy', 4.6, 4.4);
  b.extra = ['ammini', 'chaya', 'meenu', 'kannan'].map((w, i) => actor(sc, w, -14 + i * 1.6, 9 + (i % 2)));
}
function buildChurch() { const c = S.church, sc = c.scene;
  c.bis = actor(sc, 'bishop', -3.4, -17, 1.6); c.kal = actor(sc, 'kalam', -1, -10); c.sci = actor(sc, 'scientist', 1.0, -7.6); c.meenu = actor(sc, 'meenu', 0.6, -9); c.sar = actor(sc, 'sarabhai', 1.4, -11);
  const who = ['fisher', 'fisherwoman', 'fisherboy', 'ammini', 'chaya', 'kannan', 'server', 'postman', 'clerk', 'fisher'];
  c.cong = who.map((w, i) => actor(sc, w, (i % 2 ? 2.4 : -2.4) + ((i >> 1) % 3 - 1) * 1.0, -12.4 + Math.floor(i / 2) * 2.1));
}

// ------------------------------------------------------------------ per-shot state
let OV = null;
function resetProps() {
  const b = S.beach, c = S.church;
  [b.kal, b.sar, b.sci, b.bis, b.sco, b.fis, b.fw, b.fb, ...b.extra, c.bis, c.kal, c.sci, c.meenu, c.sar, ...c.cong].forEach((x) => { x.c.visible = false; x.c.position.set(...x.base); });
  b.setDusk(0); b.setLaunch(0); b.setCloud(0); b.setEquator(0); b.setOffice(0); b.bike.visible = true; b.bike.position.set(4, 0, 6); b.bike.rotation.set(0, -0.4, 0); b.bell.rotation.z = 0; b.rocket.visible = true;
  c.setLab(0); c.setMuseum(0); OV = {};
}
const BIKE0 = [1.5, 0, 9.5], BIKE1 = [9.2, 0, 0.8], BROT = Math.atan2(-(BIKE1[2] - BIKE0[2]), BIKE1[0] - BIKE0[0]);
function ride(t, u) { const b = S.beach, p = BIKE0.map((v, q) => lerp(v, BIKE1[q], u)); b.bike.position.set(...p); b.bike.rotation.y = BROT; b.bike.wheels.forEach((w) => { w.rotation.z = -t * 6; });
  const nx = Math.sin(BROT), nz = Math.cos(BROT); at(b.kal, p[0] + nx * 0.75, 0, p[2] + nz * 0.75); pose(b.kal, { expr: 'beam', R: 'hold', L: 'hold', walk: (t * 1.6) % 1 }, t); }
const doorPt = (d) => [11 - 0.34 * d, 0, -3 + 0.94 * d];

// ------------------------------------------------------------------ shots
function shots(s) { return tidy(rawShots(s)); }
function rawShots(s) {
  const n = []; for (let i = 0; s.line(i); i++) n.push(s.line(i));
  const id = (start) => n.findIndex((x) => x.startsWith(start));
  const I = { hook: id('ആയിരത്തി'), see: id('നോക്കൂ'), team: id('വിക്രം'), mock: id('ലോകം'), sat: id('ഒരു ശനിയാഴ്ച'), wait: id('കാത്തിരിക്കൂ'), lab: id('പ്രാർത്ഥനാമുറി'), ana: id('അയൽക്കാരന്റെ'),
    launch: id('നവംബർ'), whatif: id('ബിഷപ്പ് "പറ്റില്ല"'), museum: id('ഇന്ന്'), end: id('ആ ഞായറാഴ്ചത്തെ') };
  const L = (i) => s.cue(i), w = (i, nd) => wt(s, i, nd);
  const BE = (k) => ({ set: 'beach', ...k }), CH = (k) => ({ set: 'church', ...k });
  const b = S?.beach, c = S?.church;
  const push = (p0, l, r0 = 0.03, f = 50, d = [0, 0, -0.6]) => [[0, p0, l, r0, f], [0.35, p0.map((x, q) => x + d[q] * 0.4), l, 0.01, f - 2], [2.2, p0.map((x, q) => x + d[q]), l, -0.02, f - 4]];
  const D = doorPt;
  const laneCam = push([-1.6, 1.5, 12.8], [3.2, 0.9, 7.6], 0.03, 48, [0.8, 0, -0.4]);
  const carrierCam = push([0.2, 1.5, 11.4], [3.0, 0.9, 7.9], 0.03, 42, [0.4, 0, -0.3]);
  const churchWide = push([0, 2.2, 14], [8, 3.2, -2], 0.03, 50, [0.4, 0, -1.2]);
  const doorCam = push([...D(6.2).map((v, q) => v + [0.4, 1.7, 0][q])], [D(0.8)[0], 1.9, D(0.8)[2]], 0.03, 46, [0.2, 0, -0.6]);
  const highWide = push([-4, 24, 30], [9, 0, -6], 0.02, 50, [0.6, -0.8, -1.4]);
  const lineLow = push([4.5, 0.9, 11], [11, 0.8, -6], 0.02, 46, [0.3, 0, -1]);
  const palmCam = push([-1, 1.7, 13], [-1.2, 1.6, 5], 0.03, 46, [0, 0, -0.6]);
  const houseCam = push([16.4, 1.6, 15.2], [20.4, 1.2, 5.2], 0.03, 48, [0.2, 0, -0.6]);
  const bellCam = push([D(9)[0], 2.0, D(9)[2]], [11, 7.2, -3], 0.03, 46, [0, 0.3, -0.6]);
  const naveCam = push([0, 2.6, 2], [0, 2.2, -20], 0.02, 52, [0, 0, -1.2]);
  const pulpitCam = push([-1.6, 2.6, -12.4], [-3.4, 3.0, -17], 0.03, 44, [-0.1, 0, -0.4]);
  const pewCam = push([0, 1.6, -3.4], [0, 1.4, -12], 0.03, 46, [0, 0, -0.5]);
  const labCam = push([0.5, 2.4, 0], [-1, 1.6, -14], 0.02, 50, [0, 0, -1]);
  const hutCam = push([-12, 1.8, 17], [-18, 1.6, 6], 0.03, 48, [0.3, 0, -0.8]);
  const padCam = push([-1.5, 2.4, 3], [-8, 4.5, -9], 0.03, 50, [0.3, 0, -0.6]);
  const launchCam = [[0, [4, 1.8, 10], [-8, 6, -12], 0.02, 50], [1.5, [4, 1.6, 10.4], [-8, 14, -12], 0.0, 54], [4, [4, 1.5, 10.6], [-9, 22, -14], -0.02, 56]];
  const cloudCam = push([0, 1.8, -8], [-12, 36, -70], 0.02, 56, [0, 0, -1]);
  const museumCam = push([0, 2.2, 1], [0, 3, -16], 0.02, 52, [0, 0, -1.2]);
  const out = [];
  const add = (x) => { if (x.a != null && x.b != null && x.b > x.a) out.push(x); };
  const congr = (t, ex = 'think', o = {}) => c.cong.forEach((a, k) => pose(a, { expr: ex, R: 'hang', L: 'hang', ...o, hop: o.hop ? hopAt(t, 8, 0.12, k) : 0 }, t));
  // ---- 1. HOOK
  if (I.hook >= 0) { const i = I.hook, wSy = w(i, 'ഒരു സൈക്കിളിന്റെ'), wPo = w(i, 'പോകുന്നത്'), wBi = w(i, 'ആ ബിഷപ്പ്'), wPa = w(i, '"പറ്റില്ല"'), wQ = w(i, 'പറഞ്ഞിരുന്നെങ്കിലോ'), end = L(i + 1);
    add(BE({ a: 0, b: wSy - 0.1, keys: laneCam, act: (t, tt) => { ride(t, 0.05 + tt * 0.06); OV.cal = { t0: 0.05, top: 'THUMBA', big: '1963' }; } }));
    add(BE({ a: wSy - 0.1, b: wPo - 0.1, keys: carrierCam, act: (t, tt) => { ride(t, 0.18 + tt * 0.02); OV.tag = { t0: wSy + 0.6, txt: 'റോക്കറ്റിന്റെ ഭാഗം!', sub: 'ROCKET PART ON A BICYCLE' }; } }));
    add(BE({ a: wPo - 0.1, b: wBi - 0.1, keys: churchWide, act: (t, tt) => { ride(t, 0.3 + tt * 0.25); OV.tag = { t0: wPo + 0.2, txt: 'പള്ളിയിലേക്ക്?!', sub: 'INTO A CHURCH' }; } }));
    add(BE({ a: wBi - 0.1, b: end, flash: wQ - 0.15, keys: doorCam, act: (t) => { at(b.bis, ...D(1.6)); pose(b.bis, { expr: t > wPa ? 'stern' : 'think', R: t > wPa ? 'out' : 'hold', propR: t > wPa ? null : 'bible', L: 'hip', tilt: t > wPa ? Math.sin(t * 12) * 8 : 0 }, t); ride(t, 0.86);
      if (t > wPa - 0.05 && t < wQ) OV.bubble = { t0: wPa, txt: '"പറ്റില്ല!"', x: 0.5, y: 0.62 }; if (t >= wQ - 0.1) OV.big = { t0: wQ, txt: '?', sub: 'WHAT IF?' }; } })); }
  // ---- 2. YOU SEE: magnetic equator through Thumba, a church in the middle
  if (I.see >= 0) { const i = I.see, wAa = w(i, 'ആ രേഖ'), wNa = w(i, 'നടുക്ക്'), end = L(i + 1);
    add(BE({ a: L(i), b: wAa - 0.1, keys: highWide, act: (t) => { b.setEquator(ezo(span(t, L(i) + 0.2, 1.2)), t); OV.globe = { t0: L(i) }; } }));
    add(BE({ a: wAa - 0.1, b: wNa - 0.1, keys: lineLow, act: (t) => { b.setEquator(1, t); OV.badge = { t0: wAa + 0.1, txt: 'കാന്തിക മധ്യരേഖ', sub: 'MAGNETIC EQUATOR' }; } }));
    add(BE({ a: wNa - 0.1, b: end, shake: wNa + 0.5, keys: churchWide, act: (t) => { b.setEquator(1, t); b.bike.visible = false; OV.stamp = { t0: w(i, 'ഒരു പള്ളി'), txt: 'നടുക്ക് ഒരു പള്ളി!', sub: 'ST MARY MAGDALENE CHURCH' }; } })); }
  // ---- 3. TEAM: Sarabhai and some young men; no lab, no office, no money
  if (I.team >= 0) { const i = I.team, wLa = w(i, 'ലാബില്ല'), end = L(i + 1);
    add(BE({ a: L(i), b: wLa - 0.1, keys: palmCam, act: (t) => { b.bike.visible = false; at(b.sar, -1.9, 0, 5.4); at(b.kal, -0.4, 0, 5.8); at(b.sci, -3.3, 0, 5.8); pose(b.sar, { expr: 'smile', R: 'hold', propR: 'clipboard', L: 'hip' }, t); pose(b.kal, { expr: 'beam', R: 'wave', L: 'hold', propL: 'toolbox' }, t); pose(b.sci, { expr: 'grin', R: 'thumb', L: 'hang' }, t);
      OV.tag = { t0: L(i) + 0.1, txt: 'വിക്രം സാരാഭായി', sub: 'VIKRAM SARABHAI + TEAM' }; } }));
    add(BE({ a: wLa - 0.1, b: end, keys: push([-1.2, 1.6, 9.5], [-1.6, 1.4, 5], 0.03, 44, [0, 0, -0.5]), act: (t) => { b.bike.visible = false; at(b.sar, -1.9, 0, 5.4); at(b.kal, -0.4, 0, 5.8); at(b.sci, -3.3, 0, 5.8); [b.sar, b.kal, b.sci].forEach((a) => pose(a, { expr: 'nervous', R: 'shrug', L: 'shrug' }, t));
      OV.nolist = { t: [wLa, w(i, 'ഓഫീസില്ല'), w(i, 'പണവുമില്ല')] }; } })); }
  // ---- 4. MOCKED
  if (I.mock >= 0) { const i = I.mock, end = L(i + 1);
    add(BE({ a: L(i), b: end, keys: push([0.4, 1.7, 7.4], [0, 1.9, 4], 0.04, 44, [0, 0, -0.4]), act: (t) => { b.bike.visible = false; pose(b.sco, { expr: 'laugh', R: 'hold', propR: 'newspaper', L: 'hip', hop: hopAt(t, 10, 0.05) }, t); OV.bubble = { t0: L(i) + 0.4, txt: '"പട്ടിണിയും റോക്കറ്റും?!"', x: 0.5, y: 0.64 }; } })); }
  // ---- 5. SATURDAY at the bishop's house
  if (I.sat >= 0) { const i = I.sat, wBp = w(i, 'ബിഷപ്പ് പറഞ്ഞു'), end = L(i + 1);
    add(BE({ a: L(i), b: wBp - 0.1, keys: houseCam, act: (t, tt) => { at(b.sar, lerp(22.6, 21.0, ezo(tt / 1.5)), 0, 7.6); at(b.bis, 19.6, 0, 6.6); pose(b.sar, { expr: 'smile', R: 'out', L: 'hip', walk: tt < 1.5 ? (t * 1.6) % 1 : 0 }, t); pose(b.bis, { expr: 'think', R: 'chin', L: 'hold', propL: 'bible' }, t); OV.cal = { t0: L(i) + 0.05, top: 'SATURDAY', big: 'ശനി' }; } }));
    add(BE({ a: wBp - 0.1, b: end, keys: push([18.4, 1.6, 10.8], [20.0, 1.1, 6.6], 0.03, 44, [0, 0, -0.3]), act: (t) => { at(b.sar, 21.0, 0, 7.6); at(b.bis, 19.6, 0, 6.6); pose(b.bis, { expr: 'smile', R: 'point', L: 'hold', propL: 'bible' }, t); pose(b.sar, { expr: 'think', R: 'hang', L: 'hip' }, t); OV.bubble = { t0: wBp + 0.3, txt: '"നാളെ കുർബാനയ്ക്ക് വരൂ"', x: 0.5, y: 0.62 }; } })); }
  // ---- 6. WAIT... SUNDAY MASS: the question and the Amen
  if (I.wait >= 0) { const i = I.wait, wNj = w(i, 'ഞായറാഴ്ച'), wBc = w(i, 'ബിഷപ്പ് ചോദിച്ചു'), wMa = w(i, 'മത്സ്യത്തൊഴിലാളികൾ'), wAm = w(i, '"ആമേൻ!"'), end = L(i + 1);
    add(BE({ a: L(i), b: wNj - 0.1, keys: bellCam, act: (t) => { b.bike.visible = false; b.bell.rotation.z = Math.sin(t * 7) * 0.5; OV.cal = { t0: L(i) + 0.05, top: 'SUNDAY', big: 'ഞായർ' }; } }));
    add(CH({ a: wNj - 0.1, b: wBc - 0.1, keys: naveCam, act: (t) => { congr(t, 'smile'); pose(c.bis, { expr: 'smile', R: 'hold', propR: 'bible', L: 'hang' }, t); } }));
    add(CH({ a: wBc - 0.1, b: wMa - 0.1, keys: pulpitCam, act: (t) => { congr(t, 'think'); pose(c.bis, { expr: 'smile', R: 'out', L: 'hold', propL: 'bible' }, t); OV.bubble = { t0: wBc + 0.5, txt: '"ദൈവത്തിന്റെ വീട് ശാസ്ത്രത്തിന്?"', x: 0.5, y: 0.66 }; } }));
    add(CH({ a: wMa - 0.1, b: wAm - 0.05, keys: pewCam, act: (t) => { congr(t, 'nervous'); OV.tag = { t0: wMa + 0.1, txt: 'മത്സ്യത്തൊഴിലാളികൾ', sub: 'THE FISHERFOLK OF THUMBA' }; } }));
    add(CH({ a: wAm - 0.05, b: end, flash: wAm - 0.1, shake: wAm + 0.1, keys: naveCam, act: (t) => { congr(t, 'beam', { R: 'up', L: 'up', hop: 1 }); pose(c.bis, { expr: 'proud', R: 'up', L: 'up' }, t); OV.big = { t0: wAm, txt: 'ആമേൻ!', sub: 'AMEN' }; } })); }
  // ---- 7. PRAYER ROOM -> LAB, BISHOP'S HOUSE -> OFFICE, 183 FAMILIES MOVE
  if (I.lab >= 0) { const i = I.lab, wLb = w(i, 'ലാബായി'), wBv = w(i, 'ബിഷപ്പിന്റെ'), wOf = w(i, 'ഓഫീസായി'), wNu = w(i, 'നൂറ്റി'), end = L(i + 1);
    add(CH({ a: L(i), b: wBv - 0.1, flash: wLb - 0.2, keys: labCam, act: (t) => { const on = t > wLb - 0.05; c.setLab(on ? 1 : 0); if (on) { pose(c.kal, { expr: 'think', R: 'hold', propR: 'wrench', L: 'hip' }, t); pose(c.sci, { expr: 'smile', R: 'chin', L: 'hang' }, t); OV.badge = { t0: wLb, txt: 'ലാബ്!', sub: 'PRAYER ROOM → LAB' }; } else congr(t, 'smile'); } }));
    add(BE({ a: wBv - 0.1, b: wNu - 0.1, flash: wOf - 0.2, keys: houseCam, act: (t) => { b.bike.visible = false; b.setOffice(t > wOf - 0.05 ? 1 : 0); if (t > wOf) { at(b.kal, 19.0, 0, 7.2); pose(b.kal, { expr: 'beam', R: 'hold', propR: 'clipboard', L: 'hang' }, t); } OV.tag = { t0: wOf, txt: 'ഓഫീസ്!', sub: "BISHOP'S HOUSE → OFFICE" }; } }));
    add(BE({ a: wNu - 0.1, b: end, keys: hutCam, act: (t, tt) => { b.bike.visible = false; const fam = [b.fis, b.fw, b.fb, ...b.extra]; fam.forEach((a, k) => { at(a, -21 + k * 1.2 + tt * 0.9, 0, 9.5 + (k % 2) * 0.8); pose(a, { expr: k % 2 ? 'sad' : 'smile', R: 'hold', propR: k % 3 ? null : 'toolbox', L: 'hang', walk: (t * 1.5 + k * 0.3) % 1 }, t); });
      OV.big = { t0: wNu, txt: '183', count: true, sub: 'കുടുംബങ്ങൾ വീടൊഴിഞ്ഞു' }; } })); }
  // ---- 8. ANALOGY: giving your own house so the neighbour's kid can study
  if (I.ana >= 0) { const i = I.ana, end = L(i + 1);
    add(BE({ a: L(i), b: end, keys: push([-16.4, 1.7, 15.0], [-19.3, 1.0, 7.8], 0.03, 46, [0, 0, -0.4]), act: (t) => { b.bike.visible = false; at(b.fis, -20, 0, 8.4); at(b.fb, -18.6, 0, 8.6); pose(b.fis, { expr: 'proud', R: 'out', propR: 'keys', L: 'hip' }, t); pose(b.fb, { expr: 'beam', R: 'hold', propR: 'bible', L: 'up', hop: hopAt(t, 6, 0.05) }, t); OV.house = { t0: L(i) + 0.2 }; } })); }
  // ---- 9. 21 NOVEMBER, 6:25 PM: LAUNCH + ORANGE CLOUD
  if (I.launch >= 0) { const i = I.launch, wAd = w(i, 'ആദ്യ'), wAk = w(i, 'ആകാശത്ത്'), end = L(i + 1);
    const watchers = (t) => { [b.fis, b.fw, b.fb].forEach((a, k) => { at(a, 2 + k * 1.3, 0, 4 + (k % 2)); pose(a, { expr: t > wAd ? 'shock' : 'think', R: 'point', L: 'mouth' }, t); }); at(b.sar, 5.8, 0, 4.6); pose(b.sar, { expr: t > wAd ? 'beam' : 'nervous', R: t > wAd ? 'up' : 'hold', propR: t > wAd ? null : 'clipboard', L: 'hip' }, t); };
    add(BE({ a: L(i), b: wAd - 0.1, keys: padCam, act: (t) => { b.setDusk(1); b.bike.visible = false; at(b.kal, -4.6, 0, -3.6); pose(b.kal, { expr: 'nervous', R: 'hold', propR: 'clipboard', L: 'hip' }, t); OV.cal = { t0: L(i) + 0.05, top: '21 NOV · 6:25 PM', big: 'T-0' }; } }));
    add(BE({ a: wAd - 0.1, b: wAk - 0.1, shake: wAd + 0.1, keys: launchCam, act: (t) => { b.setDusk(1); b.bike.visible = false; b.setLaunch(Math.max(0, t - wAd + 0.1)); watchers(t); OV.tag = { t0: wAd + 0.2, txt: 'ആദ്യ റോക്കറ്റ്!', sub: 'NIKE-APACHE · 21.11.1963' }; } }));
    add(BE({ a: wAk - 0.1, b: end, keys: cloudCam, act: (t) => { b.setDusk(1); b.bike.visible = false; b.rocket.visible = false; b.setCloud(0.2 + ezo(span(t, wAk - 0.1, 2.5)) * 0.9, t); watchers(t); OV.tag = { t0: wAk + 0.3, txt: 'ഓറഞ്ച് മേഘം!', sub: 'SODIUM VAPOUR CLOUD' }; } })); }
  // ---- 10. WHAT IF the bishop had said no
  if (I.whatif >= 0) { const i = I.whatif, wIn = w(i, 'ഇന്ത്യയുടെ'), wVa = w(i, 'വർഷങ്ങൾ'), wAa = w(i, 'ആ പള്ളിമുറിയിൽ'), wKa = w(i, 'കലാം'), wMa = w(i, 'കഥയും'), end = L(i + 1);
    add(BE({ a: L(i), b: wIn - 0.1, flash: L(i), dream: true, keys: doorCam, act: (t) => { b.bike.visible = false; at(b.bis, ...D(1.6)); pose(b.bis, { expr: 'stern', R: 'out', L: 'hip', tilt: Math.sin(t * 12) * 8 }, t); OV.rewind = { t0: L(i) }; OV.cross = { t0: w(i, '"പറ്റില്ല"') + 0.2 }; } }));
    add(BE({ a: wIn - 0.1, b: wAa - 0.1, dream: true, keys: padCam, act: (t) => { b.bike.visible = false; b.setLaunch(0); OV.pages = { t0: wVa - 0.2 }; OV.tag = { t0: wIn + 0.1, txt: 'വർഷങ്ങൾ വൈകിയേനെ', sub: 'DELAYED BY YEARS' }; } }));
    add(CH({ a: wAa - 0.1, b: wMa - 0.1, dream: true, keys: push([-0.4, 1.9, -6.6], [-1, 1.7, -10], 0.03, 42, [0, 0, -0.4]), act: (t) => { c.setLab(1); pose(c.kal, { expr: 'beam', R: 'hold', propR: 'nosecone', L: 'hold', propL: 'toolbox' }, t); if (t > wKa - 0.1) OV.tag = { t0: wKa, txt: 'കലാം', sub: 'A.P.J. ABDUL KALAM' }; } }));
    add(CH({ a: wMa - 0.1, b: end, dream: true, keys: push([-0.4, 1.9, -6.6], [-1, 1.7, -10], 0.0, 40, [0, 0, -0.2]), act: (t) => { c.setLab(0); c.pews.visible = false; pose(c.kal, { expr: 'sad', R: 'hang', L: 'hang' }, t); OV.q = { t0: wMa + 0.1 }; } })); }
  // ---- 11. TODAY: a space museum; the journey reached the Moon and Mars
  if (I.museum >= 0) { const i = I.museum, wAv = w(i, 'അവിടെ'), end = L(i + 1);
    add(CH({ a: L(i), b: wAv - 0.1, keys: museumCam, act: (t) => { c.setMuseum(1); pose(c.meenu, { expr: 'beam', R: 'point', L: 'hang' }, t); OV.badge = { t0: L(i) + 0.3, txt: 'ബഹിരാകാശ മ്യൂസിയം', sub: 'VSSC SPACE MUSEUM · 1985' }; } }));
    add(CH({ a: wAv - 0.1, b: end, keys: push([0, 1.6, -4], [0, 6, -16], 0.03, 54, [0, 0.4, -1]), act: (t) => { c.setMuseum(1); pose(c.meenu, { expr: 'shock', R: 'up', L: 'up' }, t); OV.space = { t0: wAv, m: w(i, 'ചന്ദ്രനിലും'), r: w(i, 'ചൊവ്വയിലും') }; } })); }
  // ---- 12. CALLBACK: one Amen was India's first countdown
  if (I.end >= 0) { const i = I.end, wAm = w(i, '"ആമേൻ"'), wAt = w(i, 'അതായിരുന്നു'), end = L(i) + 30;
    add(CH({ a: L(i), b: wAt - 0.1, keys: naveCam, act: (t) => { congr(t, t > wAm ? 'beam' : 'think', { R: t > wAm ? 'up' : 'hang', L: t > wAm ? 'up' : 'hang', hop: t > wAm ? 1 : 0 }); pose(c.bis, { expr: 'smile', R: 'up', L: 'hold', propL: 'bible' }, t); OV.rewind = { t0: L(i) }; if (t > wAm) OV.bubble = { t0: wAm, txt: '"ആമേൻ"', x: 0.5, y: 0.6 }; } }));
    add(BE({ a: wAt - 0.1, b: end, keys: launchCam, act: (t) => { b.setDusk(1); b.bike.visible = false; b.setLaunch(Math.max(0, t - w(i, 'കൗണ്ട്ഡൗൺ') - 0.6)); OV.count = { t0: wAt }; } })); }
  return out.sort((x, y) => x.a - y.a);
}

const GRADE = { beach: { hazeAmt: 0.18, haze: 0xdfe9f2, sat: 1.12, contrast: 0.06, lift: 0.015, warm: 0.03, vignette: 0.3 }, church: { hazeAmt: 0.12, haze: 0xd8c0a0, sat: 1.08, contrast: 0.07, lift: 0.015, warm: 0.05, vignette: 0.4 },
  night: { hazeAmt: 0.15, haze: 0x1a1a30, sat: 1.05, contrast: 0.08, lift: 0.02, warm: -0.01, vignette: 0.45 } };

// ------------------------------------------------------------------ overlays (story-specific motion graphics)
function overlays(g, t, alpha) {
  if (OV.rewind) rewind(g, t, OV.rewind.t0, alpha);
  if (OV.globe) globe(g, t, OV.globe.t0, alpha);
  if (OV.cal) calendar(g, t, OV.cal, alpha);
  if (OV.badge) badge(g, t, OV.badge, alpha);
  if (OV.bubble) bubble(g, t, OV.bubble, alpha);
  if (OV.stamp) stamp(g, t, OV.stamp, alpha);
  if (OV.tag) tag(g, t, OV.tag, alpha);
  if (OV.big) bigNum(g, t, OV.big, alpha);
  if (OV.nolist) nolist(g, t, OV.nolist, alpha);
  if (OV.house) house(g, t, OV.house.t0, alpha);
  if (OV.pages) pages(g, t, OV.pages.t0, alpha);
  if (OV.cross) crossOut(g, t, OV.cross.t0, alpha);
  if (OV.q) question(g, t, OV.q.t0, alpha);
  if (OV.space) space(g, t, OV.space, alpha);
  if (OV.count) countdown(g, t, OV.count.t0, alpha);
}

const card = (g, w, h, fill = '#f4ecd6', r = 28) => { g.fillStyle = fill; g.strokeStyle = '#2a1c17'; g.lineWidth = 9; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, r); g.fill(); g.stroke(); };
function calendar(g, t, c, alpha) { const p = ezo(span(t, c.t0, 0.3)); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1400); g.rotate(-0.04); g.scale(0.8 + 0.2 * p, 0.8 + 0.2 * p);
  card(g, 520, 440, '#f4f0e6'); g.fillStyle = '#c8312c'; g.beginPath(); g.roundRect(-260, -220, 520, 120, [28, 28, 0, 0]); g.fill(); g.stroke();
  text(g, c.top, 0, -160, { font: "'Oswald'", weight: 700, size: 72, color: '#fff', maxWidth: 470 }); text(g, c.big, 0, 60, { font: "'Oswald'", weight: 700, size: 190, color: '#2a1c17', maxWidth: 470 }); g.restore(); }
function rewind(g, t, t0, alpha) { const k = t - t0; if (k < 0 || k > 1.1) return; g.save(); g.globalAlpha = alpha * (k < 0.9 ? 1 : 1 - (k - 0.9) / 0.2); g.fillStyle = 'rgba(255,255,255,.16)'; for (let i = 0; i < 14; i++) { const y = ((i * 151 + t * 900) % H); g.fillRect(0, y, W, 6 + (i % 3) * 4); }
  g.fillStyle = '#ffffff'; g.strokeStyle = '#120c0a'; g.lineWidth = 8; g.translate(W - 220, 520); for (const dx of [0, 70]) { g.beginPath(); g.moveTo(dx, -50); g.lineTo(dx - 70, 0); g.lineTo(dx, 50); g.closePath(); g.fill(); g.stroke(); } g.restore(); }
function globe(g, t, t0, alpha) { const k = t - t0; if (k < 0) return; const p = ezo(span(t, t0, 0.35)); g.save(); g.globalAlpha = alpha * p * (k > 2.2 ? Math.max(0, 1 - (k - 2.2) / 0.4) : 1); g.translate(W / 2, 1330); g.scale(0.7 + 0.3 * p, 0.7 + 0.3 * p);
  const R = 250; const gr = g.createRadialGradient(-80, -90, 30, 0, 0, R); gr.addColorStop(0, '#5fb0e8'); gr.addColorStop(1, '#16306a'); g.fillStyle = gr; g.strokeStyle = '#2a1c17'; g.lineWidth = 10; g.beginPath(); g.arc(0, 0, R, 0, 7); g.fill(); g.stroke();
  g.save(); g.beginPath(); g.arc(0, 0, R - 5, 0, 7); g.clip(); g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 3; for (let a = -60; a <= 60; a += 30) { g.beginPath(); g.ellipse(0, Math.sin(a * Math.PI / 180) * R, R * Math.cos(a * Math.PI / 180), 30 * Math.cos(a * Math.PI / 180), 0, 0, 7); g.stroke(); }
  const u = ezo(span(t, t0 + 0.4, 1.0)); g.strokeStyle = '#ffd23a'; g.lineWidth = 14; g.shadowColor = '#ffb000'; g.shadowBlur = 30; g.beginPath(); for (let x = -R; x <= -R + 2 * R * u; x += 6) { const y = Math.sin(x / 70 + 0.8) * 34 + 14; x === -R ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); g.restore();
  const pin = ezo(span(t, t0 + 1.2, 0.3)); if (pin > 0) { g.save(); g.translate(40, Math.sin(40 / 70 + 0.8) * 34 + 14); g.scale(pin, pin); g.fillStyle = '#c8312c'; g.strokeStyle = '#2a1c17'; g.lineWidth = 6; g.beginPath(); g.arc(0, -46, 26, Math.PI, 0); g.lineTo(0, 0); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#fff'; g.beginPath(); g.arc(0, -46, 9, 0, 7); g.fill(); g.restore(); text(g, 'തുമ്പ', 40, -110 + Math.sin(40 / 70 + 0.8) * 34, { size: 56, color: '#fff', stroke: '#2a1c17', strokeWidth: 12 }); }
  text(g, 'MAGNETIC EQUATOR', 0, R + 60, { font: "'Oswald'", weight: 700, size: 54, color: '#ffd23a', stroke: '#2a1c17', strokeWidth: 12 }); g.restore(); }
function nolist(g, t, o, alpha) { const items = ['ലാബില്ല', 'ഓഫീസില്ല', 'പണവുമില്ല'], icons = ['🔬', '🏢', '₹']; g.save(); g.globalAlpha = alpha; g.translate(W / 2, 1330);
  items.forEach((s, k) => { const p = ezo(span(t, o.t[k] - 0.05, 0.25)); if (p <= 0) return; const x = (k - 1) * 330; g.save(); g.translate(x, 0); g.rotate((k - 1) * 0.05); g.scale(0.6 + 0.4 * p, 0.6 + 0.4 * p); card(g, 300, 300, '#f4ecd6'); text(g, icons[k], 0, -40, { size: 110, font: 'sans-serif', weight: 400, color: '#2a1c17' }); text(g, s, 0, 95, { size: 52, color: '#2a1c17', maxWidth: 270 });
    const x2 = ezo(span(t, o.t[k] + 0.25, 0.2)); if (x2 > 0) { g.strokeStyle = '#d0281e'; g.lineWidth = 20; g.lineCap = 'round'; g.beginPath(); g.moveTo(-110, -110); g.lineTo(-110 + 220 * x2, -110 + 220 * x2); g.stroke(); } g.restore(); }); g.restore(); }
function house(g, t, t0, alpha) { const p = ezo(span(t, t0, 0.3)); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1360); g.scale(0.8 + 0.2 * p, 0.8 + 0.2 * p); card(g, 860, 400, 'rgba(244,236,214,.95)');
  g.save(); g.translate(-230, 40); g.fillStyle = '#e8dcc0'; g.strokeStyle = '#2a1c17'; g.lineWidth = 8; g.fillRect(-110, -60, 220, 150); g.strokeRect(-110, -60, 220, 150); g.fillStyle = '#c8562a'; g.beginPath(); g.moveTo(-140, -60); g.lineTo(0, -170); g.lineTo(140, -60); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#5a3018'; g.fillRect(-30, 10, 60, 80); g.strokeRect(-30, 10, 60, 80); g.restore();
  const k = ezo(span(t, t0 + 0.6, 0.8)); g.save(); g.translate(lerp(-80, 120, k), -20 - Math.sin(k * Math.PI) * 60); g.rotate(k * 6); text(g, '🔑', 0, 0, { size: 100, font: 'sans-serif', weight: 400 }); g.restore();
  g.save(); g.translate(250, 30); text(g, '🎒', 0, -30, { size: 130, font: 'sans-serif', weight: 400 }); text(g, '📚', 70, 70, { size: 80, font: 'sans-serif', weight: 400 }); g.restore();
  text(g, 'അയൽക്കാരന്റെ കുട്ടിക്ക്', 0, -150, { size: 50, color: '#8a1e1e', maxWidth: 800 }); g.restore(); }
function pages(g, t, t0, alpha) { const k = t - t0; if (k < 0) return; g.save(); g.globalAlpha = alpha * Math.min(1, k * 4); g.translate(W / 2, 1150);
  const yr = Math.min(1975, 1963 + Math.floor(k * 6)); for (let i = 0; i < 6; i++) { const u = ((k * 1.6 + i / 6) % 1); g.save(); g.translate(-200 + u * 520, -u * 420 + Math.sin(u * 6 + i) * 40); g.rotate(u * 3 + i); g.globalAlpha = (1 - u) * alpha; card(g, 160, 190, '#f4f0e6', 14); text(g, String(yr - 6 + i), 0, 10, { font: "'Oswald'", weight: 700, size: 44, color: '#2a1c17' }); g.restore(); }
  g.save(); g.translate(0, -80); card(g, 420, 240, '#f4f0e6'); text(g, String(yr), 0, 10, { font: "'Oswald'", weight: 700, size: 150, color: '#c8312c' }); g.restore(); g.restore(); }
function crossOut(g, t, t0, alpha) { const p = ezo(span(t, t0, 0.25)); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1300); card(g, 520, 200, '#f4ecd6'); text(g, '"പറ്റില്ല"', 0, 6, { size: 96, color: '#2a1c17' });
  g.strokeStyle = '#d0281e'; g.lineWidth = 22; g.lineCap = 'round'; g.beginPath(); g.moveTo(-200, -60); g.lineTo(-200 + 400 * p, -60 + 120 * p); g.stroke(); g.restore(); }
function question(g, t, t0, alpha) { const p = ezo(span(t, t0, 0.3)); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1250 + Math.sin(t * 3) * 10); text(g, '?', 0, 0, { font: "'Oswald'", weight: 700, size: 320, color: '#f6d24a', stroke: '#2a1c17', strokeWidth: 30 }); text(g, 'മിസൈൽ മാൻ?', 0, 230, { size: 76, color: '#fff', stroke: '#2a1c17', strokeWidth: 16 }); g.restore(); }
function space(g, t, o, alpha) { const p = ezo(span(t, o.t0, 0.3)); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1300);
  const at2 = (k) => { const a = Math.PI * (0.95 - 0.75 * k); return [Math.cos(a) * 380, 160 - Math.sin(a) * 330]; };
  const u = ezo(span(t, o.t0, Math.max(0.6, o.r - o.t0 + 0.4))); g.setLineDash([22, 18]); g.strokeStyle = '#fff'; g.lineWidth = 8; g.beginPath(); for (let k = 0; k <= u; k += 0.02) { const [x, y] = at2(k); k ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); g.setLineDash([]);
  const [rx, ry] = at2(u); text(g, '🚀', rx, ry, { size: 90, font: 'sans-serif', weight: 400 });
  const pl = (x, y, r, c1, c2, lbl, tt) => { const q = ezo(span(t, tt, 0.3)); if (q <= 0) return; g.save(); g.translate(x, y); g.scale(q, q); const gg = g.createRadialGradient(-r / 3, -r / 3, 4, 0, 0, r); gg.addColorStop(0, c1); gg.addColorStop(1, c2); g.fillStyle = gg; g.strokeStyle = '#2a1c17'; g.lineWidth = 8; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill(); g.stroke(); text(g, lbl, 0, r + 60, { size: 60, color: '#fff', stroke: '#2a1c17', strokeWidth: 14 }); g.restore(); };
  pl(-60, -150, 95, '#f4f0e6', '#9a9a9a', 'ചന്ദ്രൻ ✓', o.m); pl(330, -40, 80, '#f0a070', '#a8452e', 'ചൊവ്വ ✓', o.r); g.restore(); }
function countdown(g, t, t0, alpha) { const k = t - t0; if (k < 0) return; const n = Math.max(0, 3 - Math.floor(k / 0.75)); const ph = (k / 0.75) % 1; g.save(); g.globalAlpha = alpha * Math.min(1, k * 4); g.translate(W / 2, 1250); const sc = 1.3 - 0.3 * ezo(ph * 3);
  g.scale(sc, sc); text(g, n > 0 ? String(n) : 'LIFT-OFF!', 0, 0, { font: "'Oswald'", weight: 700, size: n > 0 ? 360 : 170, color: n > 0 ? '#f6d24a' : '#ffffff', stroke: '#2a1c17', strokeWidth: 30 }); g.restore(); }

export const hits = [];
export const extraHits = (timeline) => {
  const m = timeline.scenes.find((x) => x.id === 'main'), out = []; const s = { line: (i) => m.cues[i]?.text, cue: (i) => m.cues[i].start, cueEnd: (i) => m.cues[i].end };
  const sh = shots(s); sh.forEach((x, i) => { if (!i) return; const cut = sh[i - 1].set !== x.set; if (cut || i % 4 === 0) out.push({ t: m.start + x.a - 0.15, kind: 'whoosh', vol: cut ? 0.22 : 0.1 }); });
  const n = []; for (let i = 0; s.line(i); i++) n.push(s.line(i)); const id = (st) => n.findIndex((x) => x.startsWith(st));
  const at2 = (st, nd) => { const i = id(st); return i < 0 ? null : m.start + wt(s, i, nd); }, add = (t, kind, vol) => { if (t != null) out.push({ t, kind, vol }); };
  add(m.start + 0.05, 'chime', 0.3); add(at2('ആയിരത്തി', 'റോക്കറ്റിന്റെ'), 'pop', 0.3); add(at2('ആയിരത്തി', '"പറ്റില്ല"'), 'thud', 0.45); add(at2('ആയിരത്തി', 'പറഞ്ഞിരുന്നെങ്കിലോ'), 'boom', 0.45);
  add(at2('നോക്കൂ', 'ആ രേഖ'), 'chime', 0.35); add(at2('നോക്കൂ', 'ഒരു പള്ളി'), 'hit', 0.4);
  ['ലാബില്ല', 'ഓഫീസില്ല', 'പണവുമില്ല'].forEach((wd) => add(at2('വിക്രം', wd) + 0.25, 'pop', 0.3));
  add(at2('ലോകം', 'ചിരിച്ചു'), 'pop', 0.3); add(at2('ഒരു ശനിയാഴ്ച', 'ഒരു'), 'pop', 0.3);
  for (let k = 0; k < 4; k++) add(at2('കാത്തിരിക്കൂ', 'കാത്തിരിക്കൂ') + k * 0.45, 'chime', 0.25); add(at2('കാത്തിരിക്കൂ', '"ആമേൻ!"'), 'boom', 0.45);
  add(at2('പ്രാർത്ഥനാമുറി', 'ലാബായി'), 'hit', 0.35); add(at2('പ്രാർത്ഥനാമുറി', 'ഓഫീസായി'), 'hit', 0.35); add(at2('പ്രാർത്ഥനാമുറി', 'നൂറ്റി'), 'chime', 0.3);
  add(at2('അയൽക്കാരന്റെ', 'സ്വന്തം'), 'pop', 0.3);
  for (let k = 0; k < 8; k++) add(at2('നവംബർ', 'ആദ്യ') + k * 0.12, 'thud', 0.3); add(at2('നവംബർ', 'ആദ്യ'), 'boom', 0.5); add(at2('നവംബർ', 'ആകാശത്ത്'), 'chime', 0.35);
  add(at2('ബിഷപ്പ് "പറ്റില്ല"', 'ബിഷപ്പ്'), 'whoosh', 0.35); add(at2('ബിഷപ്പ് "പറ്റില്ല"', 'വർഷങ്ങൾ'), 'whoosh', 0.3); add(at2('ബിഷപ്പ് "പറ്റില്ല"', 'കലാം'), 'chime', 0.35);
  add(at2('ഇന്ന്', 'ചന്ദ്രനിലും'), 'pop', 0.35); add(at2('ഇന്ന്', 'ചൊവ്വയിലും'), 'pop', 0.35);
  const ec = at2('ആ ഞായറാഴ്ചത്തെ', 'അതായിരുന്നു'); if (ec != null) for (let k = 0; k < 3; k++) add(ec + k * 0.75, 'tick', 0.45); if (ec != null) add(ec + 2.25, 'boom', 0.5);
  return out.filter((x) => x.t != null && !Number.isNaN(x.t));
};
export const shotTimes = (timeline) => { const m = timeline.scenes.find((x) => x.id === 'main'); const s = { line: (i) => m.cues[i]?.text, cue: (i) => m.cues[i].start, cueEnd: (i) => m.cues[i].end }; return shots(s).map((x) => ({ a: m.start + x.a, b: m.start + x.b, set: x.set })); };
