// ISRO spy case 1994 (kit formula): hook = handcuffs on the cryogenic scientist -> what if nobody had framed him; you-see (head of the
// cryogenic project, India needs that one engine), the police story (chalkboard, unnamed silhouettes), papers + 'spy' + 50 days, the uncooked
// biryani analogy, wait...? (CBI: all false), the cost (own cryogenic engine only in 2014), Supreme Court 2018 (₹50 lakh, Padma Bhushan),
// the what-if (attributed to him), callback (handcuffs took 24 years), question + follow. Sets: ./sets.js + ml-padmanabha court + ml-lottery tea shop.
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
  K = await import('../../pipeline/toon3d.js'); THREE = K.THREE; B = await import('../../pipeline/bean.js'); PROPS = B.PROPS;
  (await import('./cast.js')).registerCast(B);
  const N = await import('./sets.js'), PD = await import('../ml-padmanabha/sets.js'), LO = await import('../ml-lottery/sets.js');
  S = { lab: N.labSet(), station: N.stationSet(), kitchen: N.kitchenSet(), pad: N.padSet(), court: PD.courtSet(), tea: LO.teaShopSet() };
  buildCast();
  stage = K.makeInkStage(W, H); camera = new THREE.PerspectiveCamera(52, W / H, 0.05, 900);
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
export const scenes = { main, end };


// ------------------------------------------------------------------ cast on the sets
let ALL = [];
function buildCast() { const A = (set, who, x, z, y = 0, s = 1) => { const a = actor(S[set].scene, who, x, z, y, s); ALL.push(a); return a; };
  const l = S.lab; l.nam = A('lab', 'nambi', -0.9, 1.4); l.pol = A('lab', 'police', 0.8, 2.0); l.con = A('lab', 'constable', 1.7, 1.2); l.rep = A('lab', 'reporter', -1.9, 2.4); l.old = A('lab', 'nambiOld', -0.9, 1.4);
  const st = S.station; st.nam = A('station', 'nambi', 4.0, -3.4); st.pol = A('station', 'police', -0.6, -2.2); st.con = A('station', 'constable', 1.4, -1.6); st.cbi = A('station', 'cbi', -2.6, 0.4); st.rep = A('station', 'reporter', -3.6, 1.0);
  const te = S.tea; te.n1 = A('tea', 'neighbour', -1.0, 1.2); te.n2 = A('tea', 'neighbour2', 0.8, 1.4); te.rep = A('tea', 'reporter2', 2.2, 0.8); te.chaya = A('tea', 'chaya', -2.4, 0.6);
  const ki = S.kitchen; ki.cook = A('kitchen', 'cook', 1.0, -1.8); ki.n1 = A('kitchen', 'neighbour', -1.2, -0.6); ki.n2 = A('kitchen', 'neighbour2', -0.3, 0.2); ki.con = A('kitchen', 'constable', -2.0, -1.4);
  const co = S.court; co.j = [A('court', 'judge', 0, -3.2, 0.5), A('court', 'judge', -2.4, -3.2, 0.5), A('court', 'judge', 2.4, -3.2, 0.5)]; co.old = A('court', 'nambiOld', 0.2, 2.2); co.cbi = A('court', 'cbi', -1.6, 0.9);
}
function resetProps() { ALL.forEach((x) => { x.c.visible = false; x.c.position.set(...x.base); });
  S.lab.setFire(0); S.lab.setFrost(1); S.station.setStory(0); S.station.setDays(0); S.pad.setLaunch(0); S.kitchen.setCold(1); OV = {}; }
let OV = null;

// ------------------------------------------------------------------ shots
function shots(s) { return tidy(rawShots(s)); }
function rawShots(s) {
  const n = []; for (let i = 0; s.line(i); i++) n.push(s.line(i));
  const id = (start) => n.findIndex((x) => x.startsWith(start));
  const I = { hook: id('ഇന്ത്യയുടെ'), see: id('നോക്കൂ'), story: id('പോലീസിന്റെ'), papers: id('പത്രങ്ങൾ'), ana: id('പക്ഷേ ആ എഞ്ചിൻ'), wait: id('കാത്തിരിക്കൂ'),
    lost: id('പക്ഷേ നഷ്ടപ്പെട്ട'), court: id('ഒടുവിൽ'), whatif: id('ആ കള്ളക്കേസ്'), cuffs: id('ഒരു കള്ളക്കഥ'), ask: id('വൈകി') };
  const L = (i) => s.cue(i), w = (i, nd) => wt(s, i, nd);
  const LB = (k) => ({ set: 'lab', ...k }), ST = (k) => ({ set: 'station', ...k }), TE = (k) => ({ set: 'tea', ...k }), KI = (k) => ({ set: 'kitchen', ...k }), PD = (k) => ({ set: 'pad', ...k }), CO = (k) => ({ set: 'court', ...k });
  const l = S?.lab, st = S?.station, te = S?.tea, ki = S?.kitchen, co = S?.court, pd = S?.pad;
  const push = (p0, lk, r0 = 0.03, f = 50, d = [0, 0, -0.6]) => [[0, p0, lk, r0, f], [0.35, p0.map((x, q) => x + d[q] * 0.4), lk, 0.01, f - 2], [2.2, p0.map((x, q) => x + d[q]), lk, -0.02, f - 4]];
  const labWide = push([0, 2.3, 8.2], [0, 1.8, -2], 0.03, 52, [0, 0, -0.9]);
  const labNam = push([-0.6, 1.6, 4.8], [-0.9, 1.25, 1.4], 0.03, 50, [0, 0, -0.5]);
  const labEng = push([0.4, 2.2, 3.4], [0, 2.0, -2], 0.03, 50, [0, -0.1, -0.5]);
  const stWide = push([0.4, 2.4, 7.4], [0.2, 2.0, -3], 0.03, 52, [0, 0, -0.8]);
  const stBoard = [[0, [-3.0, 2.8, 2.4], [-3.0, 2.8, -4.9], 0.02, 50], [2.0, [-0.5, 2.8, 2.2], [-0.5, 2.8, -4.9], -0.01, 48]];
  const stCell = push([3.2, 1.9, 2.6], [3.9, 1.6, -3.6], 0.03, 50, [0, 0, -0.5]);
  const stPol = push([-0.2, 2.0, 3.2], [-1.0, 1.7, -1.0], 0.03, 50, [0, 0, -0.5]);
  const teaCam = push([0, 2.0, 7.4], [0, 1.6, -1], 0.03, 50, [0, 0, -0.7]);
  const teaClose = push([-0.6, 1.9, 4.6], [-0.8, 1.7, 1.0], 0.03, 48, [0, 0, -0.5]);
  const kiCam = push([0, 2.3, 6.6], [0, 1.5, -2.5], 0.03, 52, [0, 0, -0.6]);
  const padCam = push([6, 3, 16], [-1, 7, -14], 0.02, 52, [-0.4, 0.2, -1.2]);
  const padLaunch = [[0, [6, 2.5, 20], [0, 6, -10], 0.02, 52], [3.5, [6, 2.5, 20], [0, 20, -10], 0, 56]];
  const coCam = push([0, 2.2, 6.4], [0, 1.9, -3], 0.03, 52, [0, 0, -0.8]);
  const coOld = push([0.1, 1.6, 5.8], [0.2, 1.3, 2.2], 0.03, 48, [0, 0, -0.5]);
  const out = []; const add = (x) => { if (x.a != null && x.b != null && x.b > x.a) out.push(x); };
  const nam94 = (t, o = {}) => pose(l.nam, { expr: 'proud', R: 'point', L: 'hold', propL: 'blueprint', ...o }, t);
  const cops = (t, ex = 'smug') => { pose(l.pol, { expr: ex, R: 'point', L: 'hold', propL: 'lathi' }, t); pose(l.con, { expr: 'stern', R: 'hold', propR: 'lathi', L: 'hip' }, t); };
  // ---- 1. HOOK: handcuffs on India's rocket-engine scientist; treason; 1994 Thiruvananthapuram; what if nobody had framed him?
  if (I.hook >= 0) { const i = I.hook, wKa = w(i, 'കയ്യിൽ'), wKu = w(i, 'കുറ്റം'), wAy = w(i, 'ആയിരത്തി'), wAn = w(i, 'അന്ന്'), wKt = w(i, 'കുടുക്കിയില്ലായിരുന്നെങ്കിലോ'), end = L(i + 1);
    add(LB({ a: 0, b: wKa - 0.15, keys: labWide, act: (t) => { nam94(t, { expr: 'shock', R: 'hold', propR: 'handcuffs', L: 'hold', propL: null }); cops(t); pose(l.rep, { expr: 'grin', R: 'holdUp', propR: 'camera', L: 'hang' }, t); OV.flashes = { t0: 0.05 }; OV.tag = { t0: 0.1, txt: 'റോക്കറ്റ് ശാസ്ത്രജ്ഞൻ', sub: 'ISRO · CRYOGENIC ENGINE' }; } }));
    add(LB({ a: wKa - 0.15, b: wAy - 0.1, shake: wKa + 0.2, keys: labNam, act: (t) => { nam94(t, { expr: 'shock', R: 'hold', propR: 'handcuffs', L: 'hold', propL: null }); OV.cuffs = { t0: wKa }; if (t > wKu - 0.1) OV.cuffs = null, OV.stamp = { t0: wKu, txt: 'രാജ്യദ്രോഹം', sub: 'THE CHARGE' }; } }));
    add(ST({ a: wAy - 0.1, b: wAn - 0.1, keys: stWide, act: (t) => { pose(st.nam, { expr: 'sad', R: 'hang', L: 'hang' }, t); pose(st.pol, { expr: 'smug', R: 'hip', L: 'hold', propL: 'lathi' }, t); pose(st.con, { expr: 'stern', R: 'hold', propR: 'lathi', L: 'hang' }, t); st.setDays(0); OV.cal = { t0: wAy, top: 'THIRUVANANTHAPURAM', big: '1994' }; } }));
    add(ST({ a: wAn - 0.1, b: wKt + 0.25, keys: stCell, act: (t) => { pose(st.nam, { expr: 'sad', R: 'hang', L: 'hang', look: 1 }, t); OV.tag = { t0: wAn, txt: 'നമ്പി നാരായണൻ', sub: 'ISRO SCIENTIST' }; } }));
    add(PD({ a: wKt + 0.25, b: end, flash: wKt + 0.1, night: true, keys: padCam, act: (t) => { OV.big = { t0: wKt + 0.25, txt: '?', sub: 'WHAT IF?' }; } })); }
  // ---- 2. YOU SEE: head of ISRO's cryogenic project; big satellites need that one engine
  if (I.see >= 0) { const i = I.see, wVa = w(i, 'വലിയ'), wAo = w(i, 'ഒരൊറ്റ'), end = L(i + 1);
    add(LB({ a: L(i), b: wVa - 0.1, keys: labWide, act: (t) => { nam94(t); OV.tag = { t0: L(i) + 0.2, txt: 'നമ്പി നാരായണൻ', sub: 'HEAD, CRYOGENIC PROJECT · ISRO' }; } }));
    add(PD({ a: wVa - 0.1, b: wAo - 0.15, night: true, keys: padCam, act: (t) => { OV.sat = { t0: wVa }; } }));
    add(LB({ a: wAo - 0.15, b: end, keys: labEng, act: (t) => { OV.badge = { t0: wAo, txt: 'ആ ഒരൊറ്റ എഞ്ചിൻ', sub: 'CRYOGENIC ENGINE' }; } })); }
  // ---- 3. THE POLICE STORY: chalkboard: ISRO -> two (unnamed) women -> Pakistan
  if (I.story >= 0) { const i = I.story, wRa = w(i, 'രണ്ട്'), wVi = w(i, 'വിറ്റു'), end = L(i + 1);
    add(ST({ a: L(i), b: wRa + 0.6, keys: stPol, act: (t) => { pose(st.pol, { expr: 'sly', R: 'point', L: 'hold', propL: 'lathi' }, t); st.setStory(clamp((t - L(i)) / (end - L(i)), 0, 1)); OV.tag = { t0: L(i) + 0.1, txt: 'പോലീസിന്റെ കഥ', sub: "THE POLICE'S STORY" }; } }));
    add(ST({ a: wRa + 0.6, b: end, keys: stBoard, act: (t) => { st.setStory(clamp((t - L(i)) / (end - L(i) - 0.4), 0, 1)); if (t > wVi - 0.1) OV.badge = { t0: wVi, txt: 'രഹസ്യം വിറ്റു?', sub: 'THE ALLEGATION' }; } })); }
  // ---- 4. MOCKED: papers celebrate, "spy", fifty days in jail
  if (I.papers >= 0) { const i = I.papers, wNa = w(i, 'നാട്ടുകാർ'), wAn = w(i, 'അൻപത്'), end = L(i + 1);
    add(TE({ a: L(i), b: wNa - 0.1, keys: teaCam, act: (t) => { pose(te.n1, { expr: 'shock', R: 'hold', propR: 'newspaper', L: 'hip' }, t); pose(te.n2, { expr: 'sly', R: 'mouth', L: 'hang' }, t); pose(te.rep, { expr: 'grin', R: 'hold', propR: 'newspaper', L: 'hold', propL: 'notepad' }, t); pose(te.chaya, { expr: 'shock', R: 'hold', propR: 'glass', L: 'hang' }, t); OV.papers = { t0: L(i) }; } }));
    add(TE({ a: wNa - 0.1, b: wAn - 0.1, keys: teaClose, act: (t) => { pose(te.n1, { expr: 'angry', R: 'point', L: 'hold', propL: 'newspaper', hop: hopAt(t, 7, 0.04) }, t); pose(te.n2, { expr: 'sly', R: 'mouth', L: 'hang' }, t); OV.bubble = { t0: wNa + 0.1, txt: '"ചാരൻ!"', x: 0.5, y: 0.55 }; } }));
    add(ST({ a: wAn - 0.1, b: end, keys: stCell, act: (t) => { pose(st.nam, { expr: 'sad', R: 'hang', L: 'hang' }, t); st.setDays(50 * clamp((t - wAn) / 1.2, 0, 1)); OV.big = { t0: wAn, txt: '50', sub: 'ദിവസം ജയിലിൽ', count: true }; } })); }
  // ---- 5. ANALOGY: the engine was only just being built = stealing the secret recipe of an uncooked biryani
  if (I.ana >= 0) { const i = I.ana, wIt = w(i, 'ഇതുവരെ'), wMo = w(i, 'മോഷ്ടിച്ചു'), end = L(i + 1);
    add(LB({ a: L(i), b: wIt - 0.1, keys: labEng, act: (t) => { OV.build = { t0: L(i) + 0.2 }; } }));
    add(KI({ a: wIt - 0.1, b: end, keys: kiCam, act: (t) => { const acc = t > wMo - 0.1; pose(ki.cook, { expr: acc ? 'shock' : 'nervous', R: 'hold', propR: 'ladle', L: 'shrug' }, t);
      [ki.n1, ki.n2, ki.con].forEach((a, k) => pose(a, { expr: 'angry', R: acc ? 'point' : 'hip', L: 'hip', hop: acc ? hopAt(t, 7, 0.05, k) : 0 }, t));
      OV.pot = { t0: wIt }; if (acc) OV.bubble = { t0: wMo, txt: '"കള്ളൻ!"', x: 0.32, y: 0.5 }; } })); }
  // ---- 6. WAIT...: within a year and a half the CBI: the whole case is false, no evidence
  if (I.wait >= 0) { const i = I.wait, wSi = w(i, 'സിബിഐ'), wKe = w(i, 'കേസ്'), end = L(i + 1);
    add(ST({ a: L(i), b: wKe - 0.1, keys: stWide, act: (t) => { st.setStory(1); pose(st.cbi, { expr: 'stern', R: 'hold', propR: 'file', L: 'hip' }, t); at(st.cbi, lerp(-1.6, -0.3, ez(clamp((t - L(i)) / 1.2, 0, 1))), 0, 0.6); pose(st.pol, { expr: 'nervous', R: 'hang', L: 'hold', propL: 'lathi' }, t); OV.rewind = { t0: L(i) }; OV.tag = { t0: wSi, txt: 'സിബിഐ', sub: 'CBI · APRIL 1996' }; } }));
    add(ST({ a: wKe - 0.1, b: end, shake: wKe + 0.3, keys: stBoard, act: (t) => { st.setStory(1); OV.stamp = { t0: wKe, txt: 'കേസ് കള്ളം!', sub: 'NO EVIDENCE' }; } })); }
  // ---- 7. THE COST: lost years didn't come back; own cryogenic engine flew only in 2014
  if (I.lost >= 0) { const i = I.lost, wNm = w(i, 'നമ്മുടെ'), wRa = w(i, 'രണ്ടായിരത്തി'), end = L(i + 1);
    add(ST({ a: L(i), b: wNm - 0.1, keys: stCell, act: (t) => { pose(st.nam, { expr: 'sad', R: 'hang', L: 'hang' }, t); st.setDays(50); OV.years = { t0: L(i) + 0.1, t1: wNm + 3.0 }; } }));
    add(PD({ a: wNm - 0.1, b: end, night: true, keys: padLaunch, act: (t) => { pd.setLaunch(clamp((t - wNm) / 4.5, 0, 1), t); if (t > wRa - 0.1) OV.cal = { t0: wRa, top: 'GSLV-D5 · JAN', big: '2014' }; } })); }
  // ---- 8. FINALLY: Supreme Court 2018: arrest unnecessary, ₹50 lakh; then the Padma Bhushan
  if (I.court >= 0) { const i = I.court, wAr = w(i, 'അറസ്റ്റ്'), wAp = w(i, 'അൻപത്'), wPi = w(i, 'പിന്നാലെ'), end = L(i + 1);
    const bench = (t, ex = 'stern') => co.j.forEach((j, k) => pose(j, { expr: ex, R: k ? 'hang' : 'point', L: 'hang' }, t));
    add(CO({ a: L(i), b: wAp - 0.1, keys: coCam, act: (t) => { bench(t); pose(co.old, { expr: 'think', R: 'hang', L: 'hang' }, t); OV.cal = { t0: L(i) + 0.2, top: 'SUPREME COURT', big: '2018' }; if (t > wAr - 0.1) OV.cal = null, OV.stamp = { t0: wAr, txt: 'അറസ്റ്റ് അനാവശ്യം', sub: 'SUPREME COURT, SEP 2018' }; } }));
    add(CO({ a: wAp - 0.1, b: end, keys: coOld, act: (t) => { pose(co.old, { expr: 'proud', R: 'hold', propR: 'cheque', L: t > wPi ? 'hold' : 'hang', propL: t > wPi ? 'medal' : null }, t);
      OV.big = { t0: wAp, txt: '₹50', sub: 'ലക്ഷം നഷ്ടപരിഹാരം' }; if (t > wPi - 0.1) OV.big = null, OV.badge = { t0: wPi, txt: 'പത്മഭൂഷൺ', sub: 'PADMA BHUSHAN · 2019' }; } })); }
  // ---- 9. WHAT IF: no false case -> the engine flies years earlier (his view); no waiting for foreign rockets
  if (I.whatif >= 0) { const i = I.whatif, wAe = w(i, 'എഞ്ചിൻ'), wNb = w(i, 'നമ്പി'), wNm = w(i, 'നമ്മുടെ'), end = L(i + 1);
    add(LB({ a: L(i), b: wAe - 0.1, flash: L(i), dream: true, keys: labNam, act: (t) => { nam94(t, { expr: t > L(i) + 0.8 ? 'beam' : 'shock', R: 'hold', propR: t > L(i) + 0.8 ? null : 'handcuffs', L: 'hang', propL: null }); OV.cuffsGone = { t0: L(i) + 0.3 }; } }));
    add(LB({ a: wAe - 0.1, b: wNm - 0.1, dream: true, keys: labEng, act: (t) => { l.setFire(clamp((t - wAe) / 0.6, 0, 1), t); l.setFrost(0); if (t > wNb - 0.1) OV.quote = { t0: wNb, txt: 'വർഷങ്ങൾ മുൻപേ!', sub: '— NAMBI NARAYANAN' }; } }));
    add(PD({ a: wNm - 0.1, b: end, dream: true, night: true, keys: padLaunch, act: (t) => { pd.setLaunch(clamp((t - wNm) / 3.5, 0, 1), t); OV.badge = { t0: wNm + 0.3, txt: 'സ്വന്തം റോക്കറ്റ്', sub: 'NO WAITING FOR FOREIGN ROCKETS' }; } })); }
  // ---- 10. CALLBACK: one made-up story; the handcuffs took twenty-four years to come off
  if (I.cuffs >= 0) { const i = I.cuffs, wIr = w(i, 'ഇരുപത്തിനാല്'), wVa = w(i, 'വർഷം'), end = L(i + 1);
    add(ST({ a: L(i), b: end, keys: stCell, act: (t) => { pose(st.nam, { expr: 'sad', R: 'hang', L: 'hang' }, t); OV.dim = 0.45; OV.bigCuffs = { t0: L(i) + 0.1, open: wVa + 0.2 }; if (t > wIr - 0.1) OV.big = { t0: wIr, txt: '24', sub: 'വർഷം', count: true }; } })); }
  // ---- 11. QUESTION + FOLLOW
  if (I.ask >= 0) { const i = I.ask, wAt = w(i, 'അതെ'), wKa = w(i, 'കമന്റ്'), wNa = w(i, 'നാളത്തെ');
    add(CO({ a: L(i), b: 1e9, keys: coOld, act: (t) => { pose(co.old, { expr: t > wAt ? 'think' : 'smile', R: 'chin', L: 'hang' }, t); if (t > wAt - 0.1) OV.yesno = { t0: wAt }; if (t > wKa - 0.1) OV.comment = { t0: wKa }; if (t > wNa - 0.1) OV.yesno = null, OV.comment = null, OV.follow = { t0: wNa }; } })); }
  return out;
}

const GRADE = { lab: { hazeAmt: 0.1, haze: 0xe8f0f8, sat: 1.05, contrast: 0.07, lift: 0.015, warm: -0.01, vignette: 0.32 }, station: { hazeAmt: 0.12, haze: 0x5a4a3a, sat: 1.0, contrast: 0.1, lift: 0.01, warm: 0.06, vignette: 0.5 },
  tea: { hazeAmt: 0.15, haze: 0xdfe9f2, sat: 1.1, contrast: 0.06, lift: 0.015, warm: 0.03, vignette: 0.3 }, kitchen: { hazeAmt: 0.1, haze: 0xf0e4c8, sat: 1.1, contrast: 0.06, lift: 0.015, warm: 0.04, vignette: 0.32 },
  court: { hazeAmt: 0.1, haze: 0xf0e4c8, sat: 1.05, contrast: 0.06, lift: 0.015, warm: 0.04, vignette: 0.34 }, pad: { hazeAmt: 0.12, haze: 0x2a3050, sat: 1.08, contrast: 0.08, lift: 0.02, warm: 0.02, vignette: 0.42 },
  night: { hazeAmt: 0.12, haze: 0x2a3050, sat: 1.08, contrast: 0.08, lift: 0.02, warm: 0.02, vignette: 0.42 } };

// ------------------------------------------------------------------ overlays (story-specific motion graphics)
function overlays(g, t, alpha) {
  if (OV.dim) { g.save(); g.globalAlpha = alpha * OV.dim; g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.restore(); }
  if (OV.rewind) rewind(g, t, OV.rewind.t0, alpha);
  if (OV.flashes) flashes(g, t, OV.flashes.t0, alpha);
  if (OV.cuffs) cuffs(g, t, OV.cuffs.t0, alpha);
  if (OV.cuffsGone) cuffsGone(g, t, OV.cuffsGone.t0, alpha);
  if (OV.bigCuffs) bigCuffs(g, t, OV.bigCuffs, alpha);
  if (OV.cal) calendar(g, t, OV.cal, alpha);
  if (OV.sat) satellite(g, t, OV.sat.t0, alpha);
  if (OV.papers) papers(g, t, OV.papers.t0, alpha);
  if (OV.build) building(g, t, OV.build.t0, alpha);
  if (OV.pot) recipe(g, t, OV.pot.t0, alpha);
  if (OV.years) years(g, t, OV.years, alpha);
  if (OV.quote) quote(g, t, OV.quote, alpha);
  if (OV.yesno) yesno(g, t, OV.yesno.t0, alpha);
  if (OV.comment) comment(g, t, OV.comment.t0, alpha);
  if (OV.follow) follow(g, t, OV.follow.t0, alpha);
  if (OV.badge) badge(g, t, OV.badge, alpha);
  if (OV.bubble) bubble(g, t, OV.bubble, alpha);
  if (OV.stamp) stamp(g, t, OV.stamp, alpha);
  if (OV.tag) tag(g, t, OV.tag, alpha);
  if (OV.big) bigNum(g, t, OV.big, alpha);
}
const card = (g, w, h, fill = '#f4ecd6', r = 28) => { g.fillStyle = fill; g.strokeStyle = '#2a1c17'; g.lineWidth = 9; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, r); g.fill(); g.stroke(); };
function calendar(g, t, c, alpha) { const p = ezo(span(t, c.t0, 0.3)); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1400); g.rotate(-0.04); g.scale(0.8 + 0.2 * p, 0.8 + 0.2 * p);
  card(g, 520, 440, '#f4f0e6'); g.fillStyle = '#c8312c'; g.beginPath(); g.roundRect(-260, -220, 520, 120, [28, 28, 0, 0]); g.fill(); g.stroke();
  text(g, c.top, 0, -160, { font: "'Oswald'", weight: 700, size: 72, color: '#fff', maxWidth: 470 }); text(g, c.big, 0, 60, { font: "'Oswald'", weight: 700, size: 190, color: '#2a1c17', maxWidth: 470 }); g.restore(); }
function rewind(g, t, t0, alpha) { const k = t - t0; if (k < 0 || k > 1.1) return; g.save(); g.globalAlpha = alpha * (k < 0.9 ? 1 : 1 - (k - 0.9) / 0.2); g.fillStyle = 'rgba(255,255,255,.16)'; for (let i = 0; i < 14; i++) { const y = ((i * 151 + t * 900) % H); g.fillRect(0, y, W, 6 + (i % 3) * 4); }
  g.fillStyle = '#ffffff'; g.strokeStyle = '#120c0a'; g.lineWidth = 8; g.translate(W - 220, 520); for (const dx of [0, 70]) { g.beginPath(); g.moveTo(dx, -50); g.lineTo(dx - 70, 0); g.lineTo(dx, 50); g.closePath(); g.fill(); g.stroke(); } g.restore(); }
const pop = (t, t0, d = 0.3) => ezo(span(t, t0, d));
function propAt(g, f, x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); f(g); g.restore(); }
function comment(g, t, t0, alpha) { const p = pop(t, t0, 0.25); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1640 + Math.sin(t * 6) * 6); g.scale(p, p); card(g, 560, 120, '#ffffff', 60); text(g, '💬 കമന്റ് ചെയ്യൂ 👇', 0, 4, { size: 54, color: '#2a1c17', maxWidth: 520 }); g.restore(); }
function follow(g, t, t0, alpha) { const p = pop(t, t0, 0.3); if (p <= 0) return; const k = t - t0, press = k > 1.2 ? 1 : 0, sq = k > 1.2 && k < 1.4 ? 0.92 : 1; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1380); g.scale((0.8 + 0.2 * p) * sq, (0.8 + 0.2 * p) * sq);
  card(g, 900, 380, '#f4ecd6'); text(g, "നാളത്തെ 'എങ്കിലോ?'", 0, -90, { size: 70, color: '#2a1c17', maxWidth: 840 }); g.fillStyle = press ? '#6a6a70' : '#d0281e'; g.beginPath(); g.roundRect(-260, 0, 520, 130, 65); g.fill(); g.stroke();
  text(g, press ? 'FOLLOWING ✓' : 'FOLLOW', 0, 66, { font: "'Oswald'", weight: 700, size: 70, color: '#fff' });
  if (k > 0.6) { const u = ezo(span(t, t0 + 0.6, 0.6)); g.save(); g.translate(lerp(380, 60, u), lerp(260, 90, u)); g.rotate(-0.4); g.fillStyle = '#fff'; g.strokeStyle = '#2a1c17'; g.lineWidth = 6; g.beginPath(); g.moveTo(0, 0); g.lineTo(26, 70); g.lineTo(38, 44); g.lineTo(66, 60); g.lineTo(54, 34); g.lineTo(82, 28); g.closePath(); g.fill(); g.stroke(); g.restore(); }
  g.restore(); }
function drawCuffs(g, open = 0, col = '#c8ccd4') { g.lineCap = 'round'; for (const s of [-1, 1]) { g.save(); g.translate(s * 150, 0); g.rotate(s * open * 0.9);
    g.lineWidth = 46; g.strokeStyle = '#2a1c17'; g.beginPath(); g.arc(0, 0, 105, -Math.PI * 0.5 + (s > 0 ? 0 : 0) , Math.PI * 1.5 - open * 1.2); g.stroke(); g.lineWidth = 28; g.strokeStyle = col; g.stroke(); g.restore(); }
  g.lineWidth = 22; g.strokeStyle = '#2a1c17'; g.beginPath(); for (let k = 0; k < 4; k++) { g.moveTo(-50 + k * 33, -10); g.lineTo(-30 + k * 33, 10); } g.stroke(); g.lineWidth = 10; g.strokeStyle = col; g.stroke(); }
function cuffs(g, t, t0, alpha) { const k = t - t0; if (k < 0) return; const u = ezo(clamp(k / 0.25, 0, 1)); g.save(); g.globalAlpha = alpha * Math.min(1, k * 6); g.translate(W / 2, 1380); g.rotate(-0.08); const sc = lerp(2.2, 1, u); g.scale(sc, sc); drawCuffs(g, 1 - u);
  if (k > 0.25 && k < 0.6) { g.strokeStyle = '#f6d24a'; g.lineWidth = 10; for (let a = 0; a < 8; a++) { g.beginPath(); g.moveTo(Math.cos(a) * 240, Math.sin(a) * 160); g.lineTo(Math.cos(a) * 320, Math.sin(a) * 220); g.stroke(); } }
  text(g, 'ക്ലിക്ക്!', 0, 220, { size: 90, color: '#f6d24a', stroke: '#2a1c17', strokeWidth: 18 }); g.restore(); }
function cuffsGone(g, t, t0, alpha) { const k = t - t0; if (k < 0 || k > 1.6) return; g.save(); g.globalAlpha = alpha * (k < 1 ? 1 : 1 - (k - 1) / 0.6); g.translate(W / 2, 1150 - k * 260); g.rotate(k * 0.6); g.scale(1 + k * 0.4, 1 + k * 0.4); drawCuffs(g, Math.min(1, k * 2));
  g.restore(); g.save(); g.globalAlpha = alpha * Math.min(1, k * 3); text(g, 'കേസില്ലെങ്കിൽ?', W / 2, 1500, { size: 96, color: '#f6d24a', stroke: '#2a1c17', strokeWidth: 20 }); g.restore(); }
function bigCuffs(g, t, o, alpha) { const p = pop(t, o.t0, 0.4); if (p <= 0) return; const op = ezo(span(t, o.open, 0.35)); g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 760 + Math.sin(t * 2) * 8); g.scale(1.3 * p, 1.3 * p); drawCuffs(g, op, op > 0.5 ? '#f6d24a' : '#c8ccd4'); g.restore(); }
function flashes(g, t, t0, alpha) { const k = t - t0; if (k < 0) return; [[0.18, 0.3, 0], [0.82, 0.24, 0.5], [0.12, 0.66, 1.0], [0.86, 0.6, 1.4], [0.5, 0.2, 1.9]].forEach(([x, y, d]) => { const q = k - d; if (q < 0 || q > 0.5) return; const a = q < 0.1 ? q / 0.1 : 1 - (q - 0.1) / 0.4;
  g.save(); g.globalAlpha = alpha * a; const rg = g.createRadialGradient(W * x, H * y, 0, W * x, H * y, 260); rg.addColorStop(0, 'rgba(255,255,255,1)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = rg; g.fillRect(0, 0, W, H);
  g.translate(W * x, H * y); g.fillStyle = '#fff'; for (let r = 0; r < 4; r++) { g.rotate(Math.PI / 4); g.fillRect(-120, -6, 240, 12); } g.restore(); }); }
function satellite(g, t, t0, alpha) { const p = pop(t, t0, 0.35); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, lerp(500, 640, p) + Math.sin(t * 2) * 10); g.rotate(Math.sin(t * 1.3) * 0.05); g.scale(0.8 + 0.2 * p, 0.8 + 0.2 * p);
  g.strokeStyle = '#2a1c17'; g.lineWidth = 8; for (const s of [-1, 1]) { g.fillStyle = '#2f5f9a'; g.beginPath(); g.rect(s > 0 ? 110 : -330, -60, 220, 120); g.fill(); g.stroke(); g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 3; for (let x = 0; x < 4; x++) { g.beginPath(); g.moveTo((s > 0 ? 110 : -330) + 55 * x, -60); g.lineTo((s > 0 ? 110 : -330) + 55 * x, 60); g.stroke(); } g.strokeStyle = '#2a1c17'; g.lineWidth = 8; }
  g.fillStyle = '#e8b93a'; g.beginPath(); g.roundRect(-110, -110, 220, 220, 16); g.fill(); g.stroke(); g.beginPath(); g.ellipse(0, -150, 60, 24, 0, 0, 7); g.fillStyle = '#f4f0e6'; g.fill(); g.stroke();
  text(g, 'വലിയ സാറ്റലൈറ്റ്', 0, 200, { size: 76, color: '#fff', stroke: '#2a1c17', strokeWidth: 16, maxWidth: 900 });
  const k = t - t0 - 0.6; if (k > 0) { g.globalAlpha = alpha * Math.min(1, k * 3); text(g, '🇮🇳 ?', 0, 320, { font: 'sans-serif', size: 90 }); } g.restore(); }
function papers(g, t, t0, alpha) { [[0.24, 0.4, -0.3, 0], [0.74, 0.34, 0.25, 0.3], [0.5, 0.62, -0.08, 0.6]].forEach(([x, y, r, d], j) => { const k = t - t0 - d; if (k < 0) return; const u = ezo(clamp(k / 0.5, 0, 1)); g.save(); g.globalAlpha = alpha; g.translate(W * x, H * y); g.rotate(r + (1 - u) * 6); g.scale(u * 1.1, u * 1.1);
  card(g, 520, 380, '#f4ecd6', 6); g.fillStyle = '#2a1c17'; g.fillRect(-240, -170, 480, 16); text(g, ['ചാരൻ!', 'SPY!', 'ISRO ചാരക്കേസ്'][j], 0, -80, { font: j === 1 ? "'Oswald'" : ML, weight: j === 1 ? 700 : 800, size: j === 1 ? 120 : 82, color: '#c8312c', maxWidth: 460 });
  g.strokeStyle = 'rgba(42,28,23,.45)'; g.lineWidth = 6; for (let r2 = 0; r2 < 5; r2++) { g.beginPath(); g.moveTo(-220, 10 + r2 * 32); g.lineTo(r2 % 2 ? 60 : 220, 10 + r2 * 32); g.stroke(); } g.restore(); }); }
function building(g, t, t0, alpha) { const p = pop(t, t0, 0.3); if (p <= 0) return; const u = clamp((t - t0) / 2.6, 0, 1); g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1420); g.scale(0.8 + 0.2 * p, 0.8 + 0.2 * p);
  card(g, 880, 300, '#f4ecd6'); text(g, '1994: എഞ്ചിൻ', 0, -80, { size: 70, color: '#2a1c17', maxWidth: 800 }); g.fillStyle = '#d8d2c4'; g.beginPath(); g.roundRect(-380, 0, 760, 70, 35); g.fill(); g.stroke();
  g.fillStyle = '#e8742a'; g.beginPath(); g.roundRect(-380, 0, Math.max(70, 760 * 0.12 * u), 70, 35); g.fill(); text(g, 'BUILDING...', 120, 36, { font: "'Oswald'", weight: 700, size: 48, color: '#2a1c17' });
  const bl = Math.floor(t * 2) % 2; g.globalAlpha = alpha * p * (bl ? 1 : 0.4); text(g, '🚧', -330, -80, { font: 'sans-serif', size: 70 }); g.restore(); }
function recipe(g, t, t0, alpha) { const p = pop(t, t0, 0.35); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1450); g.rotate(-0.05); g.scale(0.8 + 0.2 * p, 0.8 + 0.2 * p);
  card(g, 860, 280, '#fbf6e6'); text(g, 'ബിരിയാണി രഹസ്യക്കൂട്ട്', 0, -60, { size: 66, color: '#8a1e1e', maxWidth: 800 }); text(g, 'ഇതുവരെ ഉണ്ടാക്കിയിട്ടില്ല! 🍲❌', 0, 50, { size: 54, color: '#2a1c17', maxWidth: 800 }); g.restore(); }
function years(g, t, o, alpha) { const p = pop(t, o.t0, 0.3); if (p <= 0) return; const y = Math.round(lerp(1994, 2014, ezo(clamp((t - o.t0) / (o.t1 - o.t0), 0, 1)))); calendar(g, t, { t0: o.t0, top: 'വർഷങ്ങൾ...', big: String(y) }, alpha); }
function quote(g, t, o, alpha) { const p = pop(t, o.t0, 0.3); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1120); g.rotate(-0.03); g.scale(0.8 + 0.2 * p, 0.8 + 0.2 * p);
  card(g, 900, 300, '#ffffff', 40); text(g, '❝', -380, -90, { font: 'serif', size: 120, color: '#c8312c' }); text(g, o.txt, 0, -30, { size: 84, color: '#2a1c17', maxWidth: 780 }); text(g, o.sub, 0, 80, { font: "'Oswald'", weight: 700, size: 48, color: '#8a1e1e', maxWidth: 800 }); g.restore(); }
function yesno(g, t, t0, alpha) { [['അതെ', '#2f8a4a', '✅'], ['അല്ല', '#c8312c', '❌']].forEach(([lbl, col, ic], j) => { const p = pop(t, t0 + j * 0.5, 0.3); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2 + (j ? 250 : -250), 1340); g.rotate(j ? 0.05 : -0.05); g.scale(0.8 + 0.2 * p, 0.8 + 0.2 * p);
  card(g, 440, 360, '#f4ecd6'); text(g, ic, 0, -60, { font: 'sans-serif', size: 120 }); g.fillStyle = col; g.beginPath(); g.roundRect(-200, 60, 400, 100, 20); g.fill(); g.stroke(); text(g, lbl, 0, 112, { size: 64, color: '#fff', maxWidth: 380 }); g.restore(); }); }

export const hits = [];
export const extraHits = (timeline) => {
  const m = timeline.scenes.find((x) => x.id === 'main'), out = []; const s = { line: (i) => m.cues[i]?.text, cue: (i) => m.cues[i].start, cueEnd: (i) => m.cues[i].end };
  const sh = shots(s); sh.forEach((x, i) => { if (!i) return; const cut = sh[i - 1].set !== x.set; if (cut || i % 4 === 0) out.push({ t: m.start + x.a - 0.15, kind: 'whoosh', vol: cut ? 0.22 : 0.1 }); });
  const n = []; for (let i = 0; s.line(i); i++) n.push(s.line(i)); const id = (st) => n.findIndex((x) => x.startsWith(st));
  const at2 = (st, nd) => { const i = id(st); return i < 0 ? null : m.start + wt(s, i, nd); }, add = (t, kind, vol) => { if (t != null) out.push({ t, kind, vol }); };
  add(m.start + 0.05, 'boom', 0.3); [0.05, 0.55, 1.05, 1.45, 1.95].forEach((d) => add(m.start + d, 'pop', 0.25)); add(at2('ഇന്ത്യയുടെ', 'കയ്യിൽ') + 0.2, 'hit', 0.45); add(at2('ഇന്ത്യയുടെ', 'കുറ്റം'), 'thud', 0.45); add(at2('ഇന്ത്യയുടെ', 'ആയിരത്തി'), 'chime', 0.3); add(at2('ഇന്ത്യയുടെ', 'കുടുക്കിയില്ലായിരുന്നെങ്കിലോ'), 'boom', 0.45);
  add(at2('നോക്കൂ', 'നോക്കൂ'), 'chime', 0.3); add(at2('നോക്കൂ', 'വലിയ'), 'whoosh', 0.3); add(at2('നോക്കൂ', 'ഒരൊറ്റ'), 'pop', 0.35);
  add(at2('പോലീസിന്റെ', 'പോലീസിന്റെ'), 'thud', 0.35); add(at2('പോലീസിന്റെ', 'വിറ്റു'), 'hit', 0.4);
  [0, 0.3, 0.6].forEach((d) => add(at2('പത്രങ്ങൾ', 'പത്രങ്ങൾ') + d, 'whoosh', 0.3)); add(at2('പത്രങ്ങൾ', '"ചാരൻ"'), 'pop', 0.35); for (let k = 0; k < 6; k++) add(at2('പത്രങ്ങൾ', 'അൻപത്') + k * 0.2, 'tick', 0.3);
  add(at2('പക്ഷേ ആ എഞ്ചിൻ', 'ഉണ്ടാക്കിത്തുടങ്ങിയിട്ടേയുള്ളൂ!'), 'pop', 0.3); add(at2('പക്ഷേ ആ എഞ്ചിൻ', 'ഇതുവരെ'), 'chime', 0.3); add(at2('പക്ഷേ ആ എഞ്ചിൻ', 'മോഷ്ടിച്ചു'), 'hit', 0.35);
  add(at2('കാത്തിരിക്കൂ', 'കാത്തിരിക്കൂ...'), 'whoosh', 0.35); add(at2('കാത്തിരിക്കൂ', 'കേസ്') + 0.25, 'thud', 0.5);
  for (let k = 0; k < 8; k++) add(at2('പക്ഷേ നഷ്ടപ്പെട്ട', 'പക്ഷേ') + 0.3 + k * 0.3, 'tick', 0.25); add(at2('പക്ഷേ നഷ്ടപ്പെട്ട', 'നമ്മുടെ') + 1.0, 'boom', 0.45); add(at2('പക്ഷേ നഷ്ടപ്പെട്ട', 'രണ്ടായിരത്തി'), 'chime', 0.3);
  add(at2('ഒടുവിൽ', 'ഒടുവിൽ'), 'chime', 0.3); add(at2('ഒടുവിൽ', 'അറസ്റ്റ്') + 0.25, 'thud', 0.5); add(at2('ഒടുവിൽ', 'അൻപത്'), 'hit', 0.4); add(at2('ഒടുവിൽ', 'പിന്നാലെ'), 'chime', 0.35);
  add(at2('ആ കള്ളക്കേസ്', 'ആ'), 'boom', 0.4); add(at2('ആ കള്ളക്കേസ്', 'എഞ്ചിൻ'), 'boom', 0.35); add(at2('ആ കള്ളക്കേസ്', 'നമ്മുടെ') + 0.3, 'boom', 0.45);
  add(at2('ഒരു കള്ളക്കഥ', 'ഒരു'), 'whoosh', 0.3); add(at2('ഒരു കള്ളക്കഥ', 'ഇരുപത്തിനാല്'), 'hit', 0.45); add(at2('ഒരു കള്ളക്കഥ', 'വർഷം.') + 0.2, 'pop', 0.4);
  add(at2('വൈകി', 'അതെ,'), 'pop', 0.3); add(at2('വൈകി', 'അല്ല?'), 'pop', 0.3); add(at2('വൈകി', 'കമന്റ്'), 'chime', 0.3); add(at2('വൈകി', 'ഫോളോ'), 'pop', 0.4);
  return out.filter((x) => x.t != null && !Number.isNaN(x.t));
};
void H;
export const shotTimes = (timeline) => { const m = timeline.scenes.find((x) => x.id === 'main'); const s = { line: (i) => m.cues[i]?.text, cue: (i) => m.cues[i].start, cueEnd: (i) => m.cues[i].end }; return shots(s).map((x) => ({ a: m.start + x.a, b: m.start + x.b, set: x.set })); };
