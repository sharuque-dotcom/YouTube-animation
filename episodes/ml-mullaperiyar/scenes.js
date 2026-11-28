// Mullaperiyar (kit formula, OG look + 3D environment): hook = the dam, then the Maharaja's quill over the 1886 lease
// (what if he hadn't signed? 999 years); you-see (Madurai dry, the British plan: block, tunnel, turn east), Pennycuick
// builds it (lime, surkhi, stone -> 1895), wait...? (in Kerala, run by Tamil Nadu), rooftop-tank analogy, twist (Kerala
// itself re-signed in 1970), today (130+ years, Kerala vs Tamil Nadu, Supreme Court 2014), callback (one signature,
// 859 years left), question (new dam: yes / no) + subscribe. Sets: ./sets.js (dam = real 3D, durbar, dry, tank) +
// ml-padmanabha courtSet. The camera stays the OG still-frame-with-a-push; no flying camera.
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
  const E = await import('./sets.js'), P = await import('../ml-padmanabha/sets.js');
  S = { dam: await E.damSet(stage.renderer), durbar: E.durbarSet(), dry: E.dryFieldSet(), tank: E.tankHouseSet(), court: P.courtSet() };
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
const VP = [-14, 4.2, 35.6];   // the viewpoint on the left bank (damSet), actors stand here with the dam behind them
function buildCast() { const A = (set, who, x, z, y = 0, s = 1) => { const a = actor(S[set].scene, who, x, z, y, s); ALL.push(a); return a; };
  const du = S.durbar; du.raja = A('durbar', 'raja', -0.6, -0.2); du.off = A('durbar', 'officer', 1.3, -0.3); du.plan = A('durbar', 'penny', -1.5, 0.2); du.ko = A('durbar', 'kofficial', -0.6, -0.2); du.to = A('durbar', 'tofficial', 1.3, -0.3);
  const dr = S.dry; dr.far = A('dry', 'mfarmer', -0.6, -0.6); dr.wife = A('dry', 'ammini', 1.2, -1.4);
  const da = S.dam; da.penny = A('dam', 'penny', VP[0], VP[2], VP[1]); da.kan = A('dam', 'kannan', VP[0] - 0.9, VP[2] + 0.2, VP[1]); da.far = A('dam', 'mfarmer', VP[0] + 1.1, VP[2] - 0.2, VP[1]);
  const ta = S.tank; ta.nb = A('tank', 'neighbour', 6.9, 1.0); ta.kan = A('tank', 'kannan', -2.6, 0.7, 0.55); ta.amm = A('tank', 'ammini', -1.3, 0.7, 0.55);
  const co = S.court; co.judge = A('court', 'judge', 0, -2.4, 0.9);
}
function resetProps() { ALL.forEach((x) => { x.c.visible = false; x.c.position.set(...x.base); });
  S.durbar.setEra(1886); S.durbar.sign(0); S.durbar.quill.visible = true; S.dam.setBuild(1); S.dam.setFlow(0); S.dam.setAge(0.35); S.dam.setDusk(false); S.dam.setLevel(142); S.tank.setTap(0); S.tank.setDrip(0, 0); OV = {}; }
let OV = null;

// ------------------------------------------------------------------ shots
function shots(s) { return tidy(rawShots(s)); }
function rawShots(s) {
  const n = []; for (let i = 0; s.line(i); i++) n.push(s.line(i));
  const id = (start) => n.findIndex((x) => x.startsWith(start));
  const I = { hook: id('തിരുവിതാംകൂർ'), see: id('നോക്കൂ'), build: id('എഞ്ചിനീയർ'), wait: id('കാത്തിരിക്കൂ'), ana: id('ടെറസിലെ'), twist: id('ട്വിസ്റ്റ്'), today: id('ഇന്ന്'), sig: id('ഒരു ഒപ്പ്'), ask: id('പുതിയ ഡാം') };
  const L = (i) => s.cue(i), w = (i, nd) => wt(s, i, nd);
  const DU = (k) => ({ set: 'durbar', ...k }), DR = (k) => ({ set: 'dry', ...k }), DA = (k) => ({ set: 'dam', ...k }), TA = (k) => ({ set: 'tank', ...k }), CO = (k) => ({ set: 'court', ...k });
  const du = S?.durbar, dr = S?.dry, da = S?.dam, ta = S?.tank, co = S?.court;
  const push = (p0, lk, r0 = 0.03, f = 50, d = [0, 0, -0.6]) => [[0, p0, lk, r0, f], [0.35, p0.map((x, q) => x + d[q] * 0.4), lk, 0.01, f - 2], [2.2, p0.map((x, q) => x + d[q]), lk, -0.02, f - 4]];
  // dam set cameras (the OG camera: still framing, a slow push)
  const daHero = push([-12, 24, 72], [0, 9, -16], 0.02, 50, [1.5, -1.5, -6]);
  const daHeroDusk = push([-8, 20, 66], [0, 9, -16], 0.02, 50, [0.8, -0.8, -4]);
  const daLow = push([-4, 3.5, 52], [0, 9, 0], 0.02, 52, [0, 0.6, -4]);
  const daFace = push([10, 12, 30], [-2, 8, 0], 0.03, 50, [-1, -0.5, -4]);
  const daLake = push([-30, 34, 30], [30, 12, -40], 0.02, 50, [3, -1, -3]);
  const daVP = push([-16.2, VP[1] + 1.75, VP[2] + 5.6], [-12.4, VP[1] + 1.3, VP[2] - 4], 0.03, 50, [0.4, 0, -1.2]);
  const daGorge = push([-6, 30, 80], [0, 4, -10], 0.02, 50, [0.5, -1, -5]);
  // durbar cameras
  const duWide = push([0.3, 2.3, 5.4], [0.3, 2.0, -2], 0.03, 54, [0, 0, -0.8]);
  const duRaja = push([-0.4, 2.0, 3.6], [-0.6, 1.2, -0.2], 0.03, 50, [0, 0, -0.5]);
  const duTable = push([0.2, 2.4, 0.6], [0, 1.1, -1.15], 0.02, 50, [0, -0.2, -0.3]);
  const duPair = push([0.4, 2.1, 4.4], [0.3, 1.2, -0.3], 0.03, 50, [0, 0, -0.6]);
  const drWide = push([0, 1.6, 7.6], [0, 1.9, -4], 0.03, 52, [0, 0, -0.9]);
  const taWide = push([2.2, 4.6, 18], [1.6, 3.6, -1], 0.03, 52, [0, 0, -1.4]);
  const taNb = push([5.6, 2.0, 5.0], [6.6, 1.4, 0.6], 0.03, 50, [0, 0, -0.5]);
  const taLow = [[0, [-1.4, 1.5, 6.8], [-2, 3.6, -1], 0.03, 62], [2.4, [-1.5, 1.4, 6.2], [-2, 3.9, -1], -0.03, 58]];
  const coWide = push([0, 2.4, 6.0], [0, 2.0, -2.4], 0.03, 50, [0, 0, -0.8]);
  const out = []; const add = (x) => { if (x.a != null && x.b != null && x.b > x.a) out.push(x); };
  const ppl = (a, o, t) => pose(a, { expr: 'neutral', R: 'hang', L: 'hang', ...o }, t);
  // ---- 1. HOOK: the dam -> what if the Maharaja hadn't signed? 1886, a lease, 999 years!
  if (I.hook >= 0) { const i = I.hook, wOp = w(i, 'ഒപ്പ്'), wAy = w(i, 'ആയിരത്തി'), wOr = w(i, 'ഒരു'), wTh = w(i, 'തൊള്ളായിരത്തി'), end = L(i + 1);
    add(DA({ a: 0, b: wOp - 0.1, keys: daHero, act: (t) => { OV.tag = { t0: 0.1, txt: 'മുല്ലപ്പെരിയാർ', sub: 'MULLAPERIYAR DAM' }; } }));
    add(DU({ a: wOp - 0.1, b: wAy - 0.1, keys: duTable, act: (t) => { du.sign(clamp((t - wOp) / 1.4, 0, 0.85)); OV.big = { t0: wOp + 0.5, txt: '?', sub: 'ഒപ്പിട്ടില്ലെങ്കിൽ?' }; } }));
    add(DU({ a: wAy - 0.1, b: wOr - 0.1, flash: wAy - 0.1, keys: duPair, act: (t) => { ppl(du.raja, { expr: 'nervous', R: 'hold', propR: 'quill' }, t); ppl(du.off, { expr: 'smug', R: 'point', L: 'hold', propL: 'lease' }, t); OV.cal = { t0: wAy, top: 'TRAVANCORE', big: '1886' }; } }));
    add(DU({ a: wOr - 0.1, b: end, keys: duTable, shake: wTh + 0.1, act: (t) => { du.sign(1); OV.stamp = { t0: wTh, txt: '999 വർഷം!', sub: 'PERIYAR LEASE · 29 OCT 1886' }; } })); }
  // ---- 2. YOU SEE: Madurai's fields drying in the Madras Presidency; the British plan: block the Periyar, tunnel, turn it east
  if (I.see >= 0) { const i = I.see, wBr = w(i, 'ബ്രിട്ടീഷ്'), wPe = w(i, 'പെരിയാറിനെ'), wMa = w(i, 'മല'), wVe = w(i, 'വെള്ളം'), end = L(i + 1);
    add(DR({ a: L(i), b: wBr - 0.1, keys: drWide, act: (t) => { ppl(dr.far, { expr: 'sad', R: 'hold', propR: 'hoe', L: 'hang' }, t); ppl(dr.wife, { expr: 'sad', R: 'hold', propR: 'pot', L: 'hang' }, t); OV.tag = { t0: L(i) + 0.3, txt: 'മധുര', sub: 'MADRAS PRESIDENCY' }; OV.heat = { t0: L(i) }; } }));
    add(DU({ a: wBr - 0.1, b: wPe - 0.1, keys: duPair, act: (t) => { ppl(du.off, { expr: 'smug', R: 'point', L: 'hold', propL: 'plans' }, t); ppl(du.plan, { expr: 'proud', R: 'hold', propR: 'plans', L: 'hip' }, t); OV.badge = { t0: wBr + 0.1, txt: 'ബ്രിട്ടീഷ് പ്ലാൻ', sub: 'THE PERIYAR PROJECT' }; } }));
    add(DA({ a: wPe - 0.1, b: end, keys: daLake, act: (t) => { da.setBuild(t < wVe ? 0.001 : 1); da.setFlow(ezo(clamp((t - wVe) / 1.4, 0, 1))); OV.chips = { list: [['തടഞ്ഞ്', wPe + 0.4], ['മല തുരന്ന്', wMa], ['കിഴക്കോട്ട് →', wVe]] }; } })); }
  // ---- 3. BUILD: engineer Pennycuick; lime, surkhi and stone; 1895, the dam is ready
  if (I.build >= 0) { const i = I.build, wCh = w(i, 'ചുണ്ണാമ്പും'), wAy = w(i, 'ആയിരത്തി'), wRe = w(i, 'റെഡി'), end = L(i + 1);
    add(DA({ a: L(i), b: wCh - 0.1, keys: daVP, act: (t) => { da.setBuild(0.25); ppl(da.penny, { expr: 'proud', R: 'point', L: 'hold', propL: 'plans' }, t); OV.tag = { t0: L(i) + 0.2, txt: 'പെന്നിക്വിക്ക്', sub: 'ENGINEER · MADRAS PWD' }; } }));
    add(DA({ a: wCh - 0.1, b: end, shake: wRe, keys: daFace, act: (t) => { da.setBuild(lerp(0.3, 1, ezo(clamp((t - wCh) / Math.max(0.5, wRe - wCh), 0, 1)))); da.setAge(0); OV.chips = { list: [['ചുണ്ണാമ്പ്', wCh], ['സുർക്കി', w(i, 'സുർക്കിയും')], ['കല്ല്', w(i, 'കല്ലും.')]] }; if (t > wAy - 0.1) { OV.chips = null; OV.cal = { t0: wAy, top: 'READY', big: '1895' }; } } })); }
  // ---- 4. WAIT...: the dam stands in Kerala, but Tamil Nadu runs it and gets the water
  if (I.wait >= 0) { const i = I.wait, wDa = w(i, 'ഡാം'), wPa = w(i, 'പക്ഷേ'), end = L(i + 1);
    add(DA({ a: L(i), b: wPa - 0.1, keys: daHero, act: (t) => { OV.wait = { t0: L(i) }; if (t > wDa - 0.1) OV.badge = { t0: wDa, txt: 'ഡാം: കേരളത്തിൽ', sub: 'IDUKKI · KERALA' }; } }));
    add(DA({ a: wPa - 0.1, b: end, keys: daLake, act: (t) => { da.setFlow(ezo(clamp((t - wPa) / 1.2, 0, 1))); OV.badge = { t0: wPa + 0.2, txt: 'വെള്ളം: തമിഴ്നാടിന്', sub: 'RUN BY TAMIL NADU' }; } })); }
  // ---- 5. ANALOGY: like renting your rooftop tank to the neighbour; the tap is in their hands, we sleep below
  if (I.ana >= 0) { const i = I.ana, wTa = w(i, 'ടാപ്പ്'), wTh = w(i, 'കയ്യിൽ,') + 0.35, end = L(i + 1);
    add(TA({ a: L(i), b: wTa - 0.1, keys: taWide, act: (t) => { ppl(ta.nb, { expr: 'smug', R: 'wave', L: 'hip' }, t); ppl(ta.kan, { expr: 'smile', R: 'point', L: 'hang' }, t); OV.tag = { t0: L(i) + 0.3, txt: 'വാടകയ്ക്ക്', sub: 'THE ROOFTOP TANK' }; } }));
    add(TA({ a: wTa - 0.1, b: wTh - 0.1, keys: taNb, act: (t) => { ta.setTap((t - wTa) * 0.8); ta.setDrip(t, 1); ppl(ta.nb, { expr: 'sly', R: 'up', L: 'hip' }, t); OV.bubble = { t0: wTa + 0.3, x: 0.42, y: 0.3, txt: 'ടാപ്പ് എന്റെ കയ്യിൽ 😎' }; } }));
    add(TA({ a: wTh - 0.1, b: end, keys: taLow, act: (t) => { ta.kan.c.position.set(-2.6, 0.62, 0.7); ta.amm.c.position.set(-1.4, 0.62, 0.7); ppl(ta.kan, { expr: 'neutral', blink: 1, tilt: 0.3 }, t); ppl(ta.amm, { expr: 'neutral', blink: 1, tilt: -0.3 }, t); OV.zzz = { t0: wTh }; OV.badge = { t0: wTh + 0.2, txt: 'താഴെ: നമ്മൾ', sub: 'WE SLEEP BELOW' }; } })); }
  // ---- 6. TWIST: in 1970 Kerala itself renewed and signed the agreement
  if (I.twist >= 0) { const i = I.twist, wAy = w(i, 'ആയിരത്തി'), wKe = w(i, 'കേരളം'), wPu = w(i, 'പുതുക്കി'), end = L(i + 1);
    add(DU({ a: L(i), b: wKe - 0.1, flash: L(i), keys: duWide, act: (t) => { du.setEra(1970); ppl(du.ko, { expr: 'smile', R: 'hold', propR: 'pen', L: 'hang' }, t); ppl(du.to, { expr: 'beam', R: 'hold', propR: 'file', L: 'hang' }, t); OV.big = { t0: L(i) + 0.1, txt: 'ട്വിസ്റ്റ്!', sub: '' }; if (t > wAy - 0.1) { OV.big = null; OV.cal = { t0: wAy, top: 'KERALA', big: '1970' }; } } }));
    add(DU({ a: wKe - 0.1, b: end, keys: duTable, shake: wPu + 0.3, act: (t) => { du.setEra(1970); du.quill.visible = false; du.sign(clamp((t - wKe) / 1.4, 0, 1), 1970); OV.stamp = { t0: wPu, txt: 'കേരളം ഒപ്പിട്ടു!', sub: 'AGREEMENT RENEWED · 1970' }; } })); }
  // ---- 7. TODAY: 130+ years; Kerala: a new dam; Tamil Nadu: the dam is safe; the Supreme Court sided with Tamil Nadu
  if (I.today >= 0) { const i = I.today, wKe = w(i, 'കേരളം:'), wTa = w(i, 'തമിഴ്നാട്:'), wSu = w(i, 'സുപ്രീം'), end = L(i + 1);
    add(DA({ a: L(i), b: wKe - 0.1, keys: daFace, act: (t) => { da.setAge(1); OV.big = { t0: L(i) + 0.2, txt: '130+', sub: 'വയസ്സ്' }; } }));
    add(DA({ a: wKe - 0.1, b: wSu - 0.1, keys: daVP, act: (t) => { da.setAge(1); ppl(da.kan, { expr: 'angry', R: 'hold', propR: 'placardK', L: 'fist', hop: hopAt(t, 6, 0.04) }, t); if (t > wTa - 0.1) ppl(da.far, { expr: 'stern', R: 'hold', propR: 'placardT', L: 'hip' }, t);
      OV.vs = { a: wKe, b: wTa }; } }));
    add(CO({ a: wSu - 0.1, b: end, keys: coWide, shake: wSu + 0.6, act: (t) => { ppl(co.judge, { expr: 'stern', R: 'hold', propR: 'gavel', L: 'hang' }, t); OV.stamp = { t0: wSu + 0.5, txt: '142 അടി ✓', sub: 'SUPREME COURT · 2014' }; } })); }
  // ---- 8. CALLBACK: one signature... 859 years still left on the lease
  if (I.sig >= 0) { const i = I.sig, wAa = w(i, 'ആ'), wEn = w(i, 'എണ്ണൂറ്റി'), end = L(i + 1);
    add(DU({ a: L(i), b: wAa - 0.1, keys: duTable, act: (t) => { du.sign(1); OV.dim = 0.15; } }));
    add(DA({ a: wAa - 0.1, b: end, keys: daHeroDusk, act: (t) => { da.setDusk(true); da.setAge(1); OV.years = { t0: wAa, t1: wEn + 0.8 }; } })); }
  // ---- 9. QUESTION + SUBSCRIBE: new dam, yes or no?
  if (I.ask >= 0) { const i = I.ask, wVe = w(i, 'വേണം,'), wKa = w(i, 'കമന്റ്'), wNa = w(i, 'നാളത്തെ');
    add(DA({ a: L(i), b: wNa - 0.1, keys: daVP, act: (t) => { da.setDusk(true); da.setAge(1); ppl(da.kan, { expr: 'think', R: 'hold', propR: 'placardK', L: 'hang' }, t); ppl(da.far, { expr: 'think', R: 'hold', propR: 'placardT', L: 'hang' }, t); OV.yesno = { t0: wVe }; if (t > wKa - 0.1) OV.comment = { t0: wKa }; } }));
    add(DA({ a: wNa - 0.1, b: L(i) + 60, keys: daHeroDusk, act: (t) => { da.setDusk(true); da.setAge(1); OV.follow = { t0: wNa }; } })); }
  return out;
}

const GRADE = { dam: { hazeAmt: 0.05, haze: 0xcfdde6, sat: 1.12, contrast: 0.08, lift: 0.01, warm: 0.03, vignette: 0.3 }, durbar: { hazeAmt: 0.08, haze: 0xf0d8c0, sat: 1.06, contrast: 0.07, lift: 0.015, warm: 0.05, vignette: 0.38 },
  dry: { hazeAmt: 0.14, haze: 0xf4dcb0, sat: 1.08, contrast: 0.06, lift: 0.02, warm: 0.1, vignette: 0.32 }, tank: { hazeAmt: 0.1, haze: 0x4a5070, sat: 1.05, contrast: 0.08, lift: 0.02, warm: 0.0, vignette: 0.42 },
  court: { hazeAmt: 0.08, haze: 0xf0e0d0, sat: 1.05, contrast: 0.07, lift: 0.015, warm: 0.04, vignette: 0.36 } };

// ------------------------------------------------------------------ overlays (story-specific motion graphics)
function overlays(g, t, alpha) {
  if (OV.dim) { g.save(); g.globalAlpha = alpha * OV.dim; g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.restore(); }
  if (OV.heat) heat(g, t, OV.heat.t0, alpha);
  if (OV.wait) waitCard(g, t, OV.wait.t0, alpha);
  if (OV.cal) calendar(g, t, OV.cal, alpha);
  if (OV.chips) chips(g, t, OV.chips.list, alpha, 1450);
  if (OV.zzz) zzz(g, t, OV.zzz.t0, alpha);
  if (OV.vs) versus(g, t, OV.vs, alpha);
  if (OV.years) years(g, t, OV.years, alpha);
  if (OV.yesno) yesno(g, t, OV.yesno.t0, alpha);
  if (OV.comment) comment(g, t, OV.comment.t0, alpha);
  if (OV.follow) follow(g, t, OV.follow.t0, alpha);
  if (OV.badge) badge(g, t, OV.badge, alpha);
  if (OV.bubble) bubble(g, t, OV.bubble, alpha);
  if (OV.stamp) stamp(g, t, OV.stamp, alpha);
  if (OV.tag) tag(g, t, OV.tag, alpha);
  if (OV.big) bigNum(g, t, OV.big, alpha);
}
function heat(g, t, t0, alpha) { const p = pop(t, t0, 0.6); g.save(); g.globalAlpha = alpha * p * 0.5; for (let k = 0; k < 6; k++) { const y = 900 + k * 90 + Math.sin(t * 3 + k) * 10; g.strokeStyle = 'rgba(255,240,200,.5)'; g.lineWidth = 6; g.beginPath(); for (let x = 0; x <= W; x += 30) { const yy = y + Math.sin(x * 0.02 + t * 6 + k) * 8; x ? g.lineTo(x, yy) : g.moveTo(x, yy); } g.stroke(); }
  g.restore(); }
function waitCard(g, t, t0, alpha) { const k = t - t0; if (k < 0 || k > 1.6) return; const p = pop(t, t0, 0.25); g.save(); g.globalAlpha = alpha * p * (k > 1.3 ? 1 - (k - 1.3) / 0.3 : 1); g.translate(W / 2, 1380); g.scale(0.8 + 0.2 * p, 0.8 + 0.2 * p);
  text(g, 'കാത്തിരിക്കൂ...', 0, 0, { size: 110, color: '#f6d24a', stroke: '#2a1c17', strokeWidth: 22 }); text(g, '✋', 0, -170, { font: 'sans-serif', size: 140 }); g.restore(); }
function zzz(g, t, t0, alpha) { const k = t - t0; if (k < 0) return; g.save(); g.globalAlpha = alpha; for (let j = 0; j < 3; j++) { const ph = ((t * 0.6 + j / 3) % 1); g.globalAlpha = alpha * Math.sin(ph * Math.PI); text(g, 'Z', W * 0.3 + ph * 120 + j * 20, 1150 - ph * 260, { font: "'Oswald'", weight: 700, size: 60 + ph * 50, color: '#ffffff', stroke: '#2a1c17', strokeWidth: 12 }); } g.restore(); }
function versus(g, t, o, alpha) { [['കേരളം', 'പുതിയ ഡാം വേണം', '#c8312c', o.a, -1], ['തമിഴ്നാട്', 'ഡാം സുരക്ഷിതം', '#2f6a9a', o.b, 1]].forEach(([who, what, col, t0, s]) => { const p = pop(t, t0, 0.3); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2 + s * 250, 1420); g.rotate(s * 0.04); g.scale(0.8 + 0.2 * p, 0.8 + 0.2 * p);
  card(g, 470, 320, '#f4ecd6'); g.fillStyle = col; g.beginPath(); g.roundRect(-235, -160, 470, 110, [28, 28, 0, 0]); g.fill(); g.stroke(); text(g, who, 0, -104, { size: 64, color: '#fff', maxWidth: 430 }); text(g, what, 0, 40, { size: 54, color: '#2a1c17', maxWidth: 430 }); g.restore(); });
  if (t > o.b) { const p = pop(t, o.b, 0.3); g.save(); g.globalAlpha = alpha * p; text(g, 'VS', W / 2, 1420, { font: "'Oswald'", weight: 700, size: 96, color: '#f6d24a', stroke: '#2a1c17', strokeWidth: 18 }); g.restore(); } }
function years(g, t, o, alpha) { const y = Math.round(lerp(2026, 2885, ezo(clamp((t - o.t0 - 0.2) / (o.t1 - o.t0), 0, 1)))); calendar(g, t, { t0: o.t0, top: 'പാട്ടം തീരുന്നത്', big: String(y) }, alpha);
  if (t > o.t1) { const p = pop(t, o.t1, 0.3); g.save(); g.globalAlpha = alpha * p; text(g, 'ഇനിയും 859 വർഷം!', W / 2, 1720, { size: 76, color: '#f6d24a', stroke: '#2a1c17', strokeWidth: 18, maxWidth: 1000 }); g.restore(); } }
function yesno(g, t, t0, alpha) { [['വേണം', '#2f8a4a', '✅'], ['വേണ്ട', '#c8312c', '❌']].forEach(([lbl, col, ic], j) => { const p = pop(t, t0 + j * 0.5, 0.3); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2 + (j ? 250 : -250), 1340); g.rotate(j ? 0.05 : -0.05); g.scale(0.8 + 0.2 * p, 0.8 + 0.2 * p);
  card(g, 440, 360, '#f4ecd6'); text(g, ic, 0, -60, { font: 'sans-serif', size: 120 }); g.fillStyle = col; g.beginPath(); g.roundRect(-200, 60, 400, 100, 20); g.fill(); g.stroke(); text(g, lbl, 0, 112, { size: 64, color: '#fff', maxWidth: 380 }); g.restore(); });
  const p = pop(t, t0 - 0.6, 0.3); if (p > 0) { g.save(); g.globalAlpha = alpha * p; text(g, 'പുതിയ ഡാം?', W / 2, 1100, { size: 92, color: '#ffffff', stroke: '#2a1c17', strokeWidth: 20 }); g.restore(); } }

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
  add(m.start + 0.1, 'boom', 0.35); add(at2('തിരുവിതാംകൂർ', 'ഒപ്പ്') + 0.5, 'pop', 0.35); add(at2('തിരുവിതാംകൂർ', 'ആയിരത്തി'), 'chime', 0.3); add(at2('തിരുവിതാംകൂർ', 'തൊള്ളായിരത്തി') + 0.05, 'thud', 0.55); add(at2('തിരുവിതാംകൂർ', 'തൊള്ളായിരത്തി') + 0.08, 'boom', 0.3);
  add(at2('നോക്കൂ', 'നോക്കൂ,'), 'chime', 0.3); add(at2('നോക്കൂ', 'ബ്രിട്ടീഷ്'), 'pop', 0.3); ['പെരിയാറിനെ', 'മല', 'വെള്ളം'].forEach((nd) => add(at2('നോക്കൂ', nd) + 0.2, 'pop', 0.3)); add(at2('നോക്കൂ', 'വെള്ളം'), 'whoosh', 0.35);
  add(at2('എഞ്ചിനീയർ', 'എഞ്ചിനീയർ'), 'pop', 0.3); ['ചുണ്ണാമ്പും', 'സുർക്കിയും', 'കല്ലും.'].forEach((nd) => add(at2('എഞ്ചിനീയർ', nd), 'thud', 0.3)); add(at2('എഞ്ചിനീയർ', 'റെഡി'), 'hit', 0.45); add(at2('എഞ്ചിനീയർ', 'റെഡി') + 0.05, 'boom', 0.3);
  add(at2('കാത്തിരിക്കൂ', 'കാത്തിരിക്കൂ...'), 'whoosh', 0.35); add(at2('കാത്തിരിക്കൂ', 'ഡാം'), 'pop', 0.3); add(at2('കാത്തിരിക്കൂ', 'പക്ഷേ'), 'whoosh', 0.35); add(at2('കാത്തിരിക്കൂ', 'തമിഴ്നാടിന്!'), 'hit', 0.4);
  add(at2('ടെറസിലെ', 'ടെറസിലെ'), 'pop', 0.3); add(at2('ടെറസിലെ', 'ടാപ്പ്'), 'pop', 0.3); for (let k = 0; k < 4; k++) add(at2('ടെറസിലെ', 'ടാപ്പ്') + 0.4 + k * 0.6, 'chime', 0.12); add(at2('ടെറസിലെ', 'താഴെ'), 'thud', 0.35);
  add(at2('ട്വിസ്റ്റ്', 'ട്വിസ്റ്റ്:'), 'boom', 0.45); add(at2('ട്വിസ്റ്റ്', 'ആയിരത്തി'), 'chime', 0.3); add(at2('ട്വിസ്റ്റ്', 'പുതുക്കി'), 'thud', 0.55); add(at2('ട്വിസ്റ്റ്', 'പുതുക്കി') + 0.05, 'hit', 0.4);
  add(at2('ഇന്ന്', 'ഇന്ന്'), 'pop', 0.3); add(at2('ഇന്ന്', 'കേരളം:'), 'pop', 0.35); add(at2('ഇന്ന്', 'തമിഴ്നാട്:'), 'pop', 0.35); add(at2('ഇന്ന്', 'സുപ്രീം') + 0.5, 'thud', 0.6); add(at2('ഇന്ന്', 'സുപ്രീം') + 0.55, 'hit', 0.4);
  add(at2('ഒരു ഒപ്പ്', 'ഒരു'), 'whoosh', 0.3); add(at2('ഒരു ഒപ്പ്', 'ആ'), 'chime', 0.3); add(at2('ഒരു ഒപ്പ്', 'എണ്ണൂറ്റി') + 0.8, 'boom', 0.35);
  add(at2('പുതിയ ഡാം', 'വേണം,'), 'pop', 0.3); add(at2('പുതിയ ഡാം', 'വേണ്ട?'), 'pop', 0.3); add(at2('പുതിയ ഡാം', 'കമന്റ്'), 'chime', 0.3); add(at2('പുതിയ ഡാം', 'സബ്സ്ക്രൈബ്'), 'pop', 0.4);
  return out.filter((x) => x.t != null && !Number.isNaN(x.t));
};
void H;
export const shotTimes = (timeline) => { const m = timeline.scenes.find((x) => x.id === 'main'); const s = { line: (i) => m.cues[i]?.text, cue: (i) => m.cues[i].start, cueEnd: (i) => m.cues[i].end }; return shots(s).map((x) => ({ a: m.start + x.a, b: m.start + x.b, set: x.set })); };
