// Kunjali Marakkar (kit formula): hook = Goa 1600, a Malayali admiral beheaded, the head salted and sent to Kannur, and
// the one who handed him over was his own king -> what if the Zamorin hadn't betrayed him; you-see (Portuguese cannon
// ships, the cartaz pass), the Zamorin's answer (the Kunjali Marakkars, small boats, big nerve), mockery, Chaliyam 1571,
// the bees-vs-elephant analogy, wait...? (two lords of one sea), the betrayal (alliance, promise, handover), the what-if
// (together: a Malayali navy waiting for the Dutch and British), INS Kunjali, callback (the head high on a prow).
// The execution is never shown: drum, flash to dim, then the salt box. Cast ./cast.js, ships ./ship.js, sets ./sets.js.
const ML = "'Noto Malayalam'";
import { W, H, clamp, lerp } from '../../pipeline/engine.js';
import { ALIGN } from './align.js';
function text(g, str, x, y, o = {}) { g.save(); let sz = o.size || 48; const f = () => `${o.weight || 800} ${sz}px ${o.font || ML}`; g.font = f(); if (o.maxWidth) while (g.measureText(str).width > o.maxWidth && sz > 12) { sz -= 2; g.font = f(); }
  g.textAlign = o.align || 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; if (o.stroke) { g.lineWidth = o.strokeWidth || sz * 0.15; g.strokeStyle = o.stroke; g.strokeText(str, x, y); } g.fillStyle = o.color || '#fff'; g.fillText(str, x, y); g.restore(); }



let K = null, B = null, S = null, stage = null, camera = null, THREE = null, PROPS = null;
const ez = (x) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
const ezo = (x) => 1 - Math.pow(1 - clamp(x, 0, 1), 3);
const span = (t, a, d) => clamp((t - a) / d, 0, 1);

let DUTCH = null;
export async function preload() {
  K = await import('../../pipeline/toon3d.js'); THREE = K.THREE; B = await import('../../pipeline/bean.js'); PROPS = B.PROPS;
  (await import('../ml-colachel/cast.js')).registerCast(B); (await import('./cast.js')).registerCast(B);
  const Z = await import('./sets.js'), base = await import('../ml-bean/sets.js'), CO = await import('../ml-colachel/sets.js'); DUTCH = (await import('../ml-colachel/ship.js')).dutchShip;
  S = { sea: Z.seaSet(base.beachSet()), goa: Z.goaSet(), palace: Z.dressPalace(CO.fortSet()), navy: Z.navySet() };
  buildSea(); buildGoa(); buildPalace(); buildNavy();
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
function buildSea() { const b = S.sea, sc = b.scene;
  b.kun = actor(sc, 'kunjali', 0.2, 1.2); b.kun3 = actor(sc, 'kunjali3', 10.5, -0.5); b.kch = actor(sc, 'kunjaliChained', -10.6, 1.6); b.zam = actor(sc, 'zamorin', -1.2, 1.4);
  b.s1 = actor(sc, 'sailor', -1.3, 0.4); b.s2 = actor(sc, 'sailor2', 1.5, 0.5); b.nairs = [actor(sc, 'nair', 9.2, 0.3), actor(sc, 'nair', 11.8, 0.6)];
  b.cap = actor(sc, 'captain', 14.2, -1.4); b.ps = [actor(sc, 'portSoldier', 15.6, -1.8), actor(sc, 'portSoldier', 12.9, -1.0)]; b.guards = [actor(sc, 'portSoldier', -11.0, 1.2), actor(sc, 'portSoldier', -8.2, 1.2)];
  b.dutch = [0, 1].map((k) => { const s = DUTCH({ life: b.life, seed: k + 20 }); s.scale.setScalar(0.7); s.visible = false; sc.add(s); return s; });
}
function buildGoa() { const g = S.goa, sc = g.scene; g.vic = actor(sc, 'viceroy', -4.4, -4.6); g.ps = [actor(sc, 'portSoldier', -2.0, -5.6), actor(sc, 'portSoldier', 2.0, -5.6), actor(sc, 'portSoldier', 3.2, 5.6)]; g.kch = actor(sc, 'kunjaliChained', 0, -4.2);
  g.crowd = ['kannan', 'ammini', 'fisher', 'clerk', 'chaya', 'meenu'].map((w, i) => actor(sc, w, -5 + i * 2, 1.5 + (i % 2) * 0.8)); }
function buildPalace() { const p = S.palace, sc = p.scene; p.zam = actor(sc, 'zamorin', -0.6, -2.2); p.vic = actor(sc, 'viceroy', 0.7, -2.0); p.nair = actor(sc, 'nair', -2.4, -3.2); p.nair2 = actor(sc, 'nair', 2.4, -3.2); }
function buildNavy() { const n = S.navy, sc = n.scene; n.sail = actor(sc, 'navy', 1.6, -2.2); n.sail2 = actor(sc, 'navy', -1.6, -2.2); }

// ------------------------------------------------------------------ per-shot state
let OV = null;
function resetProps() {
  const b = S.sea, g = S.goa, p = S.palace, n = S.navy;
  [b.kun, b.kun3, b.kch, b.zam, b.s1, b.s2, ...b.nairs, b.cap, ...b.ps, ...b.guards, g.vic, ...g.ps, g.kch, ...g.crowd, p.zam, p.vic, p.nair, p.nair2, n.sail, n.sail2].forEach((x) => { x.c.visible = false; x.c.position.set(...x.base); });
  b.paroes.forEach((x) => { x.visible = false; }); b.dutch.forEach((x) => { x.visible = false; }); b.dhow.visible = false; b.setRuin(0); [...b.boom, ...b.smoke, ...b.splash].forEach((m) => { m.visible = false; });
  b.carracks.forEach((s) => { s.position.x = s.userData.home.x; s.position.z = s.userData.home.z; });
  OV = {};
}
const fleet = (n, f) => { S.sea.paroes.slice(0, n).forEach((p, i) => { p.visible = true; f(p, i); }); };
function cannons(t, t0, ships = [0, 1]) { const b = S.sea; ships.forEach((si, k) => { const s = b.carracks[si]; for (let j = 0; j < 3; j++) { const m = b.boom[k * 3 + j], sm = b.smoke[k * 3 + j]; const ph = ((t - t0 - k * 0.4 - j * 0.25) % 1.6 + 1.6) % 1.6; if (t < t0) continue;
  m.visible = ph < 0.25; m.position.set(s.position.x + (j - 1) * 5, s.position.y + 2.2, s.position.z + 3.5); m.scale.setScalar(0.4 + ph * 5); sm.visible = true; sm.position.set(s.position.x + (j - 1) * 5 + ph * 1.5, s.position.y + 2.4 + ph * 2, s.position.z + 3.8); sm.scale.setScalar(0.6 + ph * 2.2); sm.material.opacity = 0.8 * (1 - ph / 1.6); } }); }
function splashAt(t, t0, x, z) { S.sea.splash.forEach((m, k) => { const u = t - t0 - k * 0.05; if (u < 0 || u > 1.2) return; m.visible = true; const a = k * 0.63; m.position.set(x + Math.cos(a) * u * 2, 0.4 + Math.sin(u * 2.6) * 3 * (0.6 + (k % 3) * 0.2), z + Math.sin(a) * u * 2); m.scale.setScalar(0.5 * (1.2 - u)); }); }

// ------------------------------------------------------------------ shots
function shots(s) { return tidy(rawShots(s)); }
function rawShots(s) {
  const n = []; for (let i = 0; s.line(i); i++) n.push(s.line(i));
  const id = (start) => n.findIndex((x) => x.startsWith(start));
  const I = { hook: id('ആയിരത്തി അറുനൂറ്'), see: id('നോക്കൂ'), reply: id('സാമൂതിരിയുടെ മറുപടി'), mock: id('പറങ്കികൾ ചിരിച്ചു'), chal: id('ആയിരത്തി അഞ്ഞൂറ്റി'), ana: id('ഒരു കൂട്ടം'),
    wait: id('കാത്തിരിക്കൂ'), betray: id('സാമൂതിരി ശത്രുവുമായി'), whatif: id('ആ ചതി'), navy: id('ഇന്ന് ഇന്ത്യൻ'), end: id('ഗോവയിൽ') };
  const L = (i) => s.cue(i), w = (i, nd) => wt(s, i, nd);
  const SE = (k) => ({ set: 'sea', ...k }), GO = (k) => ({ set: 'goa', ...k }), PA = (k) => ({ set: 'palace', ...k }), NA = (k) => ({ set: 'navy', ...k });
  const b = S?.sea, g = S?.goa, p = S?.palace, nv = S?.navy;
  const push = (p0, l, r0 = 0.03, f = 50, d = [0, 0, -0.6]) => [[0, p0, l, r0, f], [0.35, p0.map((x, q) => x + d[q] * 0.4), l, 0.01, f - 2], [2.2, p0.map((x, q) => x + d[q]), l, -0.02, f - 4]];
  const seaWide = push([0.4, 1.8, 6.5], [0, 2.4, -30], 0.03, 50, [0, 0.1, -1.2]);
  const shoreLow = push([0.2, 1.3, 5.2], [0, 1.9, -4], 0.03, 48, [0, 0, -0.8]);
  const carrackCam = push([4, 2.6, -14], [12, 6, -42], 0.03, 46, [0.6, 0.2, -2]);
  const dhowCam = push([-2, 2.6, -10], [4, 2, -36], 0.02, 46, [0.5, 0, -1.5]);
  const chalCam = push([8, 3, 6], [16, 2, -6], 0.03, 50, [0.4, 0, -1]);
  const ruinCam = push([7, 2.6, 6.5], [15, 1.6, -6], 0.03, 50, [0.4, 0, -0.9]);
  const kottCam = push([-4, 2.2, 8], [-14, 2.6, -8], 0.03, 50, [-0.4, 0, -0.8]);
  const goaWide = push([2, 3.4, 9], [0, 4.5, -14], 0.03, 50, [0, 0, -1.2]);
  const goaMid = push([0.6, 1.9, 0.6], [0, 1.8, -5], 0.03, 46, [0, 0, -0.6]);
  const boxCam = push([2.6, 1.7, 9.2], [4.6, 0.8, 4.6], 0.03, 46, [0.3, 0, -0.6]);
  const court = push([0.2, 1.8, 3.2], [0, 1.7, -4], 0.03, 50, [0, 0, -0.5]);
  const zamClose = push([-0.3, 2.0, 1.9], [-0.6, 1.7, -2.2], 0.03, 46, [0, 0, -0.4]);
  const gate = push([1.2, 2.4, 14], [0, 5, -6], 0.02, 52, [0, 0, -0.8]);
  const out = [];
  const add = (x) => { if (x.a != null && x.b != null && x.b > x.a) out.push(x); };
  const kunProud = (t, o = {}) => pose(b.kun, { expr: 'proud', R: 'holdUp', propR: 'scimitar', L: 'point', ...o }, t);
  const crew = (t, ex = 'grin') => { pose(b.s1, { expr: ex, R: 'fist', L: 'hang', hop: hopAt(t, 7, 0.04) }, t); pose(b.s2, { expr: 'beam', R: 'up', L: 'hang', hop: hopAt(t, 7, 0.04, 1) }, t); };
  const rowOut = (t, t0, n = 5) => fleet(n, (q, i) => { const u = Math.max(0, t - t0); q.position.set(-9 + i * 4.4 + Math.sin(i) * 0.5, 0.25 + Math.sin(t * 1.4 + i) * 0.06, -22 - (i % 2) * 5 - u * 1.4); q.rotation.y = Math.PI / 2 + 0.1 * Math.sin(i); q.rotation.z = Math.sin(t * 1.2 + i) * 0.03; });
  // ---- 1. HOOK: Goa 1600, the head, the salt, the king who handed him over, what if
  if (I.hook >= 0) { const i = I.hook, wOru = w(i, 'ഒരു മലയാളി'), wTh = w(i, 'തല'), wUp = w(i, 'ഉപ്പിലിട്ട്'), wOt = w(i, 'ഒറ്റിക്കൊടുത്തത്'), wSw = w(i, 'സ്വന്തം'), wSa = w(i, 'സാമൂതിരി'), end = L(i + 1);
    add(GO({ a: 0, b: wOru - 0.1, keys: goaWide, act: (t) => { pose(g.vic, { expr: 'sly', R: 'hold', propR: 'treaty', L: 'hip' }, t); g.ps.slice(0, 2).forEach((a) => pose(a, { expr: 'stern', R: 'rifle', propR: 'musket' }, t)); g.crowd.forEach((a, k) => pose(a, { expr: ['shock', 'sad', 'nervous'][k % 3], R: k % 2 ? 'mouth' : 'hang', L: 'hang', look: 0 }, t)); OV.cal = { t0: 0.05, top: 'GOA', big: '1600' }; } }));
    add(GO({ a: wOru - 0.1, b: wTh - 0.1, keys: goaMid, act: (t) => { pose(g.kch, { expr: 'stern', R: 'hang', L: 'hang' }, t); g.ps.slice(0, 2).forEach((a) => pose(a, { expr: 'stern', R: 'rifle', propR: 'musket' }, t)); OV.tag = { t0: wOru, txt: 'ഒരു മലയാളി അഡ്മിറൽ', sub: 'KUNJALI MARAKKAR IV' }; } }));
    add(GO({ a: wTh - 0.1, b: wUp - 0.1, flash: wTh + 0.2, keys: push([0.4, 2.6, 5], [0, 2.4, -7], 0.04, 44, [0, 0, -0.3]), act: (t) => { pose(g.vic, { expr: 'stern', R: 'point', L: 'hip' }, t); at(g.vic, -3.2, 0, -5.4); g.crowd.forEach((a, k) => pose(a, { expr: 'shock', R: 'mouth', L: 'mouth' }, t)); OV.dim = t > wTh + 0.25 ? 0.55 : 0; OV.drum = { t0: wTh - 0.1 }; } }));
    add(GO({ a: wUp - 0.1, b: wOt - 0.1, keys: boxCam, act: (t) => { pose(g.ps[2], { expr: 'smug', R: 'point', L: 'hip' }, t); OV.tag = { t0: wUp + 0.1, txt: 'ഉപ്പിലിട്ട്', sub: '→ കണ്ണൂർ' }; } }));
    add(PA({ a: wOt - 0.1, b: wSa - 0.1, keys: court, act: (t) => { const u = ezo(span(t, wOt, 0.8)); pose(p.zam, { expr: t > wSw ? 'sly' : 'smug', R: 'out', L: 'hip', lean: u * 0.1 }, t); pose(p.vic, { expr: 'smug', R: 'out', L: 'hold', propL: 'treaty' }, t); pose(p.nair, { expr: 'stern', R: 'holdUp', propR: 'sword' }, t);
      OV.bubble = { t0: wOt + 0.1, txt: 'ശത്രുവല്ല...', x: 0.5, y: 0.6 }; if (t > wSw - 0.1) OV.bubble = null, OV.stamp = { t0: wSw, txt: 'സ്വന്തം രാജാവ്!', sub: 'THE ZAMORIN' }; } }));
    add(SE({ a: wSa - 0.1, b: end, flash: w(i, 'ചതിച്ചില്ലായിരുന്നെങ്കിലോ') - 0.15, keys: shoreLow, act: (t) => { kunProud(t); crew(t); rowOut(t, wSa, 4); OV.big = { t0: w(i, 'ചതിച്ചില്ലായിരുന്നെങ്കിലോ'), txt: '?', sub: 'WHAT IF?' }; } })); }
  // ---- 2. YOU SEE: 16th century, cannon ships, no pass = sunk
  if (I.see >= 0) { const i = I.see, wPo = w(i, 'പോർച്ചുഗീസ്'), wAv = w(i, 'അവരുടെ'), wMu = w(i, 'മുങ്ങും'), end = L(i + 1);
    add(SE({ a: L(i), b: wPo - 0.1, keys: seaWide, act: (t) => { OV.cal = { t0: L(i) + 0.1, top: 'CENTURY', big: '1500s' }; } }));
    add(SE({ a: wPo - 0.1, b: wAv - 0.1, shake: wPo + 0.6, keys: carrackCam, act: (t) => { cannons(t, wPo + 0.2, [0, 1]); OV.badge = { t0: wPo + 0.2, txt: 'പീരങ്കിക്കപ്പലുകൾ', sub: 'PORTUGUESE CARRACKS' }; } }));
    add(SE({ a: wAv - 0.1, b: end, keys: dhowCam, act: (t) => { b.dhow.visible = true; b.dhow.position.set(2, 0.2, -30); b.carracks[0].position.set(14, b.carracks[0].position.y, -40); b.setSink(ezo(span(t, wMu - 0.3, 1.3))); b.dhow.position.x = 2; b.dhow.position.z = -30; cannons(t, wMu - 0.6, [0]); splashAt(t, wMu - 0.2, 2, -30); OV.pass = { t0: wAv + 0.1 }; } })); }
  // ---- 3. THE ZAMORIN'S ANSWER: the Kunjali Marakkars, small boats, big nerve
  if (I.reply >= 0) { const i = I.reply, wKu = w(i, 'കുഞ്ഞാലി'), wCh = w(i, 'ചെറിയ'), wVa = w(i, 'വലിയ'), end = L(i + 1);
    add(PA({ a: L(i), b: wKu - 0.1, keys: zamClose, act: (t) => { pose(p.zam, { expr: 'stern', R: 'point', L: 'hip' }, t); pose(p.nair, { expr: 'stern', R: 'holdUp', propR: 'sword' }, t); OV.tag = { t0: L(i) + 0.1, txt: 'സാമൂതിരി', sub: 'THE ZAMORIN OF CALICUT' }; } }));
    add(SE({ a: wKu - 0.1, b: wCh - 0.1, keys: shoreLow, act: (t) => { kunProud(t); crew(t, 'beam'); rowOut(t, wKu, 5); OV.tag = { t0: wKu, txt: 'കുഞ്ഞാലി മരക്കാർമാർ', sub: "THE ZAMORIN'S ADMIRALS" }; } }));
    add(SE({ a: wCh - 0.1, b: end, keys: push([-3, 1.4, -14], [6, 3, -40], 0.03, 50, [0.4, 0.1, -1.4]), act: (t) => { rowOut(t, wCh - 2, 6); OV.size = { t0: wCh, big: t > wVa - 0.1 }; } })); }
  // ---- 4. MOCKERY: the Portuguese laugh at the canoes
  if (I.mock >= 0) { const i = I.mock, wEe = w(i, '"ഈ'), end = L(i + 1);
    add(SE({ a: L(i), b: end, keys: push([12.4, 1.6, 3.2], [14.6, 1.7, -2], 0.04, 46, [0, 0, -0.5]), act: (t) => { pose(b.cap, { expr: 'laugh', R: 'holdUp', propR: 'telescope', L: 'hip', hop: hopAt(t, 8, 0.06) }, t); b.ps.forEach((a, k) => pose(a, { expr: 'laugh', R: 'mouth', L: k ? 'point' : 'hip', hop: hopAt(t, 8, 0.05, k + 1), lean: Math.sin(t * 9 + k) * 0.06 }, t)); if (t > wEe - 0.1) OV.bubble = { t0: wEe, txt: '"തോണി vs പീരങ്കി?"', x: 0.5, y: 0.62 }; } })); }
  // ---- 5. CHALIYAM 1571: not one stone left
  if (I.chal >= 0) { const i = I.chal, wSa = w(i, 'സാമൂതിരിയുടെ'), wCa = w(i, 'ചാലിയം'), wOr = w(i, 'ഒരു കല്ലുപോലും'), end = L(i + 1);
    add(SE({ a: L(i), b: wSa - 0.1, keys: chalCam, act: (t) => { pose(b.cap, { expr: 'smug', R: 'hip', L: 'hip' }, t); OV.cal = { t0: L(i) + 0.05, top: 'CHALIYAM', big: '1571' }; } }));
    add(SE({ a: wSa - 0.1, b: wCa - 0.1, war: false, keys: push([7.4, 1.5, 4.6], [10.4, 1.6, -0.4], 0.04, 44, [0.2, 0, -0.4]), act: (t) => { pose(b.kun3, { expr: 'angry', R: 'holdUp', propR: 'scimitar', L: 'fist', hop: hopAt(t, 6, 0.05) }, t); b.nairs.forEach((a, k) => pose(a, { expr: 'angry', R: 'holdUp', propR: 'sword', L: 'hold', propL: 'shield', hop: hopAt(t, 6, 0.05, k + 1) }, t)); OV.tag = { t0: wSa, txt: 'സാമൂതിരിയുടെ പട + കുഞ്ഞാലി III', sub: '' }; } }));
    add(SE({ a: wCa - 0.1, b: end, shake: wCa + 0.3, keys: ruinCam, act: (t) => { b.setRuin(ezo(span(t, wCa, 2.0))); pose(b.kun3, { expr: 'proud', R: 'holdUp', propR: 'scimitar', L: 'fist' }, t); b.nairs.forEach((a, k) => pose(a, { expr: 'laugh', R: 'up', L: 'hold', propL: 'shield', hop: hopAt(t, 7, 0.06, k) }, t)); if (t > wOr - 0.1) OV.badge = { t0: wOr, txt: 'ഒരു കല്ലുപോലും ബാക്കിയില്ല!', sub: '' }; } })); }
  // ---- 6. ANALOGY: bees chasing an elephant
  if (I.ana >= 0) { const i = I.ana, end = L(i + 1);
    add(SE({ a: L(i), b: end, keys: push([2, 4, -16], [10, 3, -40], 0.03, 50, [0.4, 0.2, -1.0]), act: (t) => { const c0 = b.carracks[0]; c0.position.x = c0.userData.home.x + (t - L(i)) * 1.2; fleet(7, (q, k) => { const a = t * 0.7 + k * 0.9; q.position.set(c0.position.x + Math.cos(a) * (12 + (k % 2) * 3), 0.25, c0.position.z + Math.sin(a) * 7 + 6); q.rotation.y = -a; }); OV.bees = { t0: L(i) }; } })); }
  // ---- 7. WAIT...: two lords on one sea
  if (I.wait >= 0) { const i = I.wait, wKu = w(i, 'കുഞ്ഞാലി'), wSa = w(i, 'സാമൂതിരിയുടെ'), wOr = w(i, 'ഒരു കടലിൽ'), end = L(i + 1);
    add(SE({ a: L(i), b: wKu - 0.1, keys: seaWide, act: (t) => { OV.rewind = { t0: L(i) }; rowOut(t, L(i) - 3, 4); } }));
    add(SE({ a: wKu - 0.1, b: wSa - 0.1, keys: push([-7.6, 1.7, 5.6], [-9.8, 1.7, 1.0], 0.03, 46, [-0.2, 0, -0.6]), act: (t) => { at(b.kun, -9.6, 0, 1.4); pose(b.kun, { expr: 'smug', R: 'hip', L: 'hold', propL: 'telescope', lean: -0.05 }, t); OV.crown = { t0: wKu + 0.3, txt: 'ഇന്ത്യൻ കടലുകളുടെ അധിപൻ', side: 0 }; } }));
    add(PA({ a: wSa - 0.1, b: wOr - 0.1, keys: zamClose, act: (t) => { pose(p.zam, { expr: 'stern', R: 'hip', L: 'hip' }, t); OV.crown = { t0: wSa + 0.3, txt: 'കടലിന്റെ അധിപൻ', side: 0 }; } }));
    add(SE({ a: wOr - 0.1, b: end, shake: wOr + 0.5, keys: seaWide, act: (t) => { OV.clash = { t0: wOr }; } })); }
  // ---- 8. BETRAYAL: the Zamorin joins the Portuguese; the promise; the handover
  if (I.betray >= 0) { const i = I.betray, wJe = w(i, 'ജീവൻ'), wKe = w(i, 'കീഴടങ്ങി'), wSa = w(i, 'സാമൂതിരി അദ്ദേഹത്തെ'), end = L(i + 1);
    add(PA({ a: L(i), b: wJe - 0.1, keys: court, act: (t) => { pose(p.zam, { expr: 'sly', R: 'out', L: 'hip' }, t); pose(p.vic, { expr: 'smug', R: 'out', L: 'hold', propL: 'treaty' }, t); at(p.zam, -0.3, 0, -2.2); at(p.vic, 0.4, 0, -2.0); OV.tag = { t0: L(i) + 0.2, txt: 'സാമൂതിരി + പോർച്ചുഗീസ്', sub: '1599–1600' }; } }));
    add(SE({ a: wJe - 0.1, b: wSa - 0.1, keys: push([-6.2, 1.8, 7.4], [-9.0, 1.6, 1.6], 0.03, 48, [-0.2, 0, -0.6]), act: (t) => { const u = ezo(span(t, wJe, 2.5)); at(b.kun, -10.6 + u * 1.5, 0, 0.6 + u * 1.2); pose(b.kun, { expr: 'sad', R: 'hang', L: 'hang' }, t); at(b.zam, -7.2, 0, 2.6); pose(b.zam, { expr: 'smile', R: 'out', L: 'hip' }, t); OV.bubble = { t0: wJe + 0.1, txt: '"ജീവൻ തരാം"', x: 0.62, y: 0.6 }; if (t > wKe - 0.1) OV.cal = { t0: wKe, top: 'MARCH 16', big: '1600' }; } }));
    add(SE({ a: wSa - 0.1, b: end, keys: push([-6.6, 1.7, 7.2], [-9.6, 1.6, 1.2], 0.04, 44, [0, 0, -0.5]), act: (t) => { at(b.kch, -9.6, 0, 1.6); pose(b.kch, { expr: 'sad', R: 'hang', L: 'hang' }, t); b.guards.forEach((a, k) => pose(a, { expr: 'smug', R: 'rifle', propR: 'musket' }, t)); at(b.zam, -6.4, 0, 2.8); pose(b.zam, { expr: 'sly', R: 'out', L: 'hip', lean: 0.1 }, t); if (t > w(i, 'കൈമാറി') - 0.1) OV.stamp = { t0: w(i, 'കൈമാറി'), txt: 'കൈമാറി', sub: 'HANDED OVER' }; } })); }
  // ---- 9. WHAT IF: together, a Malayali navy waiting for the Dutch and the British
  if (I.whatif >= 0) { const i = I.whatif, wSa = w(i, 'സാമൂതിരിയുടെ'), wDu = w(i, 'ഡച്ചുകാരും'), wKa = w(i, 'കടലിൽ'), end = L(i + 1);
    add(SE({ a: L(i), b: wSa - 0.1, flash: L(i), dream: true, keys: seaWide, act: (t) => { OV.big = { t0: L(i) + 0.2, txt: '?', sub: 'ചതി നടന്നില്ലെങ്കിൽ' }; rowOut(t, L(i) - 2, 4); } }));
    add(SE({ a: wSa - 0.1, b: wDu - 0.1, dream: true, keys: shoreLow, act: (t) => { at(b.zam, -0.9, 0, 1.3); at(b.kun, 0.8, 0, 1.2); pose(b.zam, { expr: 'proud', R: 'clap', L: 'hip' }, t); pose(b.kun, { expr: 'proud', R: 'holdUp', propR: 'scimitar', L: 'clap' }, t); rowOut(t, wSa - 3, 6); OV.badge = { t0: wSa + 0.2, txt: 'ഒന്നിച്ച്!', sub: 'ZAMORIN + KUNJALI' }; } }));
    add(SE({ a: wDu - 0.1, b: end, dream: true, shake: wKa + 0.4, keys: push([0, 3, -12], [4, 3, -48], 0.03, 50, [0, 0.2, -1.2]), act: (t) => { b.dutch.forEach((s, k) => { s.visible = true; s.position.set(-10 + k * 22, 0.6, -64 + (t - wDu) * 2); s.rotation.y = Math.PI / 2 + (k ? -0.3 : 0.3); }); b.carracks.forEach((s) => { s.position.z = s.userData.home.z - 30; }); fleet(8, (q, k) => { q.position.set(-18 + k * 5, 0.25 + Math.sin(t * 1.3 + k) * 0.06, -30 - (k % 2) * 3); q.rotation.y = Math.PI / 2; }); OV.badge = { t0: wKa, txt: 'മലയാളി നാവികപ്പട', sub: 'A MALAYALI NAVY' }; } })); }
  // ---- 10. INS KUNJALI
  if (I.navy >= 0) { const i = I.navy, wAi = w(i, 'ഐ.എൻ.എസ്'), end = L(i + 1);
    add(NA({ a: L(i), b: end, keys: gate, act: (t) => { pose(nv.sail, { expr: 'proud', R: t > wAi ? 'wave' : 'hang', L: 'hang' }, t); pose(nv.sail2, { expr: 'smile', R: 'hang', L: 'hang' }, t); if (t > wAi - 0.1) OV.tag = { t0: wAi, txt: 'ഐ.എൻ.എസ് കുഞ്ഞാലി', sub: 'INDIAN NAVY · 1954' }; } })); }
  // ---- 11. CALLBACK: the head, not in a salt box, high on a warship's prow
  if (I.end >= 0) { const i = I.end, wUp = w(i, 'ഉപ്പുപെട്ടിയിലല്ല'), wOr = w(i, 'ഒരു പടക്കപ്പലിന്റെ');
    add(GO({ a: L(i), b: wUp + 0.5, keys: boxCam, act: (t) => { OV.rewind = { t0: L(i) }; if (t > wUp) OV.cross = { t0: wUp }; } }));
    add(SE({ a: wUp + 0.5, b: 1e9, flash: wUp + 0.5, keys: [[0, [-1.6, 1.0, -16.5], [0.8, 1.5, -24], 0.02, 44], [0.4, [-1.5, 1.05, -17], [0.8, 1.6, -24], 0, 44], [5, [-1.2, 1.3, -18.6], [0.8, 1.8, -24], -0.01, 46]], act: (t) => { const q = b.paroes[0]; q.visible = true; q.position.set(-2, 0.25 + Math.sin(t * 1.2) * 0.06, -24); q.rotation.y = 0.0; at(b.kun, 1.0, 0.5 + Math.sin(t * 1.2) * 0.06, -24); pose(b.kun, { expr: 'proud', R: 'holdUp', propR: 'scimitar', L: 'hip' }, t); fleet(5, (r, k) => { if (!k) return; r.position.set(-12 + k * 4, 0.25, -34 - k); r.rotation.y = 0.2; }); } })); }
  return out;
}

const GRADE = { sea: { hazeAmt: 0.2, haze: 0xdfe9f2, sat: 1.12, contrast: 0.06, lift: 0.015, warm: 0.03, vignette: 0.3 }, goa: { hazeAmt: 0.15, haze: 0xe8d8c8, sat: 1.0, contrast: 0.08, lift: 0.015, warm: 0.03, vignette: 0.42 },
  palace: { hazeAmt: 0.1, haze: 0xf0e4c8, sat: 1.1, contrast: 0.06, lift: 0.015, warm: 0.05, vignette: 0.34 }, navy: { hazeAmt: 0.15, haze: 0xe6eef4, sat: 1.1, contrast: 0.05, lift: 0.015, warm: 0.02, vignette: 0.28 },
  night: { hazeAmt: 0.15, haze: 0x1a1a30, sat: 1.05, contrast: 0.08, lift: 0.02, warm: -0.01, vignette: 0.45 } };

// ------------------------------------------------------------------ overlays (story-specific motion graphics)
function overlays(g, t, alpha) {
  if (OV.dim) { g.save(); g.globalAlpha = alpha * OV.dim; g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.restore(); }
  if (OV.rewind) rewind(g, t, OV.rewind.t0, alpha);
  if (OV.drum) drum(g, t, OV.drum.t0, alpha);
  if (OV.bees) bees(g, t, OV.bees.t0, alpha);
  if (OV.cal) calendar(g, t, OV.cal, alpha);
  if (OV.badge) badge(g, t, OV.badge, alpha);
  if (OV.bubble) bubble(g, t, OV.bubble, alpha);
  if (OV.stamp) stamp(g, t, OV.stamp, alpha);
  if (OV.tag) tag(g, t, OV.tag, alpha);
  if (OV.big) bigNum(g, t, OV.big, alpha);
  if (OV.pass) passCard(g, t, OV.pass.t0, alpha);
  if (OV.size) sizes(g, t, OV.size, alpha);
  if (OV.crown) crown(g, t, OV.crown, alpha);
  if (OV.clash) clash(g, t, OV.clash.t0, alpha);
  if (OV.shake) handshake(g, t, OV.shake.t0, alpha);
  if (OV.cross) crossSalt(g, t, OV.cross.t0, alpha);
}
const card = (g, w, h, fill = '#f4ecd6', r = 28) => { g.fillStyle = fill; g.strokeStyle = '#2a1c17'; g.lineWidth = 9; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, r); g.fill(); g.stroke(); };
function calendar(g, t, c, alpha) { const p = ezo(span(t, c.t0, 0.3)); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1400); g.rotate(-0.04); g.scale(0.8 + 0.2 * p, 0.8 + 0.2 * p);
  card(g, 520, 440, '#f4f0e6'); g.fillStyle = '#c8312c'; g.beginPath(); g.roundRect(-260, -220, 520, 120, [28, 28, 0, 0]); g.fill(); g.stroke();
  text(g, c.top, 0, -160, { font: "'Oswald'", weight: 700, size: 72, color: '#fff', maxWidth: 470 }); text(g, c.big, 0, 60, { font: "'Oswald'", weight: 700, size: 190, color: '#2a1c17', maxWidth: 470 }); g.restore(); }
function rewind(g, t, t0, alpha) { const k = t - t0; if (k < 0 || k > 1.1) return; g.save(); g.globalAlpha = alpha * (k < 0.9 ? 1 : 1 - (k - 0.9) / 0.2); g.fillStyle = 'rgba(255,255,255,.16)'; for (let i = 0; i < 14; i++) { const y = ((i * 151 + t * 900) % H); g.fillRect(0, y, W, 6 + (i % 3) * 4); }
  g.fillStyle = '#ffffff'; g.strokeStyle = '#120c0a'; g.lineWidth = 8; g.translate(W - 220, 520); for (const dx of [0, 70]) { g.beginPath(); g.moveTo(dx, -50); g.lineTo(dx - 70, 0); g.lineTo(dx, 50); g.closePath(); g.fill(); g.stroke(); } g.restore(); }
function drum(g, t, t0, alpha) { const k = t - t0; if (k < 0) return; g.save(); g.globalAlpha = alpha * Math.min(1, k * 4); g.translate(W / 2, 1420); const beat = Math.abs(Math.sin(k * 9)); g.scale(1 + beat * 0.06, 1 + beat * 0.06);
  g.fillStyle = '#a8452e'; g.strokeStyle = '#2a1c17'; g.lineWidth = 9; g.beginPath(); g.ellipse(0, 40, 170, 50, 0, 0, Math.PI); g.lineTo(-170, -40); g.ellipse(0, -40, 170, 50, 0, Math.PI, 0, true); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#f2e6c8'; g.beginPath(); g.ellipse(0, -40, 170, 50, 0, 0, 7); g.fill(); g.stroke();
  for (const s of [-1, 1]) { g.save(); g.translate(s * 90, -110 - beat * 30); g.rotate(s * 0.5); g.fillStyle = '#6a3e22'; g.fillRect(-8, -90, 16, 110); g.restore(); } g.restore(); }
function passCard(g, t, t0, alpha) { const p = ezo(span(t, t0, 0.3)); if (p <= 0) return; const x = ezo(span(t, t0 + 0.6, 0.25)); g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1400); g.rotate(-0.05); g.scale(0.8 + 0.2 * p, 0.8 + 0.2 * p);
  card(g, 620, 330, '#f2e6c8', 16); text(g, 'CARTAZ', 0, -90, { font: "'Oswald'", weight: 700, size: 80, color: '#8a1e2a' }); text(g, 'പോർച്ചുഗീസ് പാസ്', 0, 10, { size: 62, color: '#2a1c17' }); text(g, 'ഇല്ലെങ്കിൽ → മുക്കും', 0, 100, { size: 56, color: '#2a1c17' });
  if (x > 0) { g.strokeStyle = '#d0281e'; g.lineWidth = 26; g.lineCap = 'round'; g.beginPath(); g.moveTo(-260, -130); g.lineTo(-260 + 520 * x, -130 + 260 * x); g.stroke(); } g.restore(); }
function sizes(g, t, b, alpha) { const p = ezo(span(t, b.t0, 0.3)); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1400);
  g.save(); g.translate(-230, 0); g.rotate(-0.05); card(g, 380, 220, '#f4ecd6'); text(g, 'ചെറിയ', 0, -40, { size: 70, color: '#2a1c17' }); text(g, 'വഞ്ചി ⛵', 0, 50, { size: 60, color: '#2a1c17', font: ML }); g.restore();
  if (b.big) { const k = ezo(span(t, b.t0 + 0.6, 0.3)); g.save(); g.translate(230, 0); g.rotate(0.05); g.scale(0.7 + 0.5 * k, 0.7 + 0.5 * k); card(g, 380, 220, '#f6d24a'); text(g, 'വലിയ', 0, -40, { size: 76, color: '#c8312c' }); text(g, 'ധൈര്യം!', 0, 50, { size: 76, color: '#2a1c17' }); g.restore(); } g.restore(); }
function bees(g, t, t0, alpha) { const k = t - t0; if (k < 0) return; g.save(); g.globalAlpha = alpha * Math.min(1, k * 3);
  g.save(); g.translate(W / 2, 1330); card(g, 860, 360, 'rgba(244,236,214,.94)'); // elephant (simple ink silhouette) running right, bees swarming
  const ex = -120 + Math.sin(t * 3) * 10; g.save(); g.translate(ex + 120, 30); g.fillStyle = '#8a8c96'; g.strokeStyle = '#2a1c17'; g.lineWidth = 7; g.beginPath(); g.ellipse(0, 0, 130, 85, 0, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.ellipse(120, -40, 60, 55, 0, 0, 7); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(170, -20); g.quadraticCurveTo(220, 40, 190, 90); g.lineWidth = 22; g.stroke(); g.strokeStyle = '#8a8c96'; g.lineWidth = 12; g.stroke(); g.fillStyle = '#2a1c17'; g.beginPath(); g.arc(130, -55, 7, 0, 7); g.fill();
  g.fillStyle = '#fff'; g.beginPath(); g.ellipse(128, -88, 18, 10, 0, 0, 7); g.fill(); for (const lx of [-80, -30, 30, 80]) { g.fillStyle = '#8a8c96'; g.strokeStyle = '#2a1c17'; g.lineWidth = 6; g.fillRect(lx - 16, 60, 32, 60 + Math.sin(t * 14 + lx) * 8); g.strokeRect(lx - 16, 60, 32, 60 + Math.sin(t * 14 + lx) * 8); } g.restore();
  for (let i = 0; i < 12; i++) { const a = t * 6 + i * 0.52, r = 120 + (i % 3) * 40, x = -180 + Math.cos(a) * r * 0.9 + (i % 4) * 30, y = Math.sin(a * 1.3) * r * 0.6; g.save(); g.translate(x, y); g.fillStyle = '#f6c21a'; g.strokeStyle = '#2a1c17'; g.lineWidth = 4; g.beginPath(); g.ellipse(0, 0, 20, 14, 0, 0, 7); g.fill(); g.stroke();
    g.fillStyle = '#2a1c17'; g.fillRect(-6, -13, 5, 26); g.fillRect(5, -13, 5, 26); g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.ellipse(-2, -18 - Math.abs(Math.sin(t * 40 + i)) * 4, 9, 6, 0.4, 0, 7); g.fill(); g.restore(); }
  g.restore(); text(g, 'തേനീച്ച vs ആന', W / 2, 1585, { size: 70, color: '#fff', stroke: '#2a1c17', strokeWidth: 14 }); g.restore(); }
function crownIcon(g, s, col = '#e8b93a') { g.save(); g.scale(s, s); g.fillStyle = col; g.strokeStyle = '#2a1c17'; g.lineWidth = 8; g.beginPath(); g.moveTo(-90, 50); g.lineTo(-100, -40); g.lineTo(-50, 0); g.lineTo(0, -70); g.lineTo(50, 0); g.lineTo(100, -40); g.lineTo(90, 50); g.closePath(); g.fill(); g.stroke();
  for (const x of [-50, 0, 50]) { g.fillStyle = '#c8312c'; g.beginPath(); g.arc(x, 25, 11, 0, 7); g.fill(); g.stroke(); } g.restore(); }
function crown(g, t, c, alpha) { const p = ezo(span(t, c.t0, 0.3)); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1380 + (1 - p) * -200); crownIcon(g, 1.1); g.translate(0, 150); g.font = `800 64px ${ML}`; card(g, Math.min(980, g.measureText(c.txt).width + 90), 130, '#f6d24a', 24); text(g, c.txt, 0, 4, { size: 64, color: '#2a1c17', maxWidth: 900 }); g.restore(); }
function clash(g, t, t0, alpha) { const k = t - t0; if (k < 0) return; const u = ezo(clamp(k / 0.6, 0, 1)); g.save(); g.globalAlpha = alpha * Math.min(1, k * 4); g.translate(W / 2, 1150);
  for (const s of [-1, 1]) { g.save(); g.translate(s * lerp(340, 110, u), Math.sin(t * 20) * (u >= 1 ? 6 : 0)); g.rotate(s * 0.25); crownIcon(g, 1, s < 0 ? '#e8b93a' : '#f0d070'); g.restore(); }
  if (u >= 1) { g.fillStyle = '#fff'; g.strokeStyle = '#2a1c17'; g.lineWidth = 6; g.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, r = i % 2 ? 40 : 90 + Math.sin(t * 30) * 10; g.lineTo(Math.cos(a) * r, Math.sin(a) * r - 20); } g.closePath(); g.fill(); g.stroke(); }
  text(g, 'ഒരു കടൽ, രണ്ട് അധിപന്മാർ!', 0, 260, { size: 72, color: '#f6d24a', stroke: '#2a1c17', strokeWidth: 16, maxWidth: 980 }); g.restore(); }
function handshake(g, t, t0, alpha) { const p = ezo(span(t, t0, 0.3)); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1180); const k = Math.sin(t * 10) * 8;
  for (const s of [-1, 1]) { g.save(); g.translate(s * lerp(260, 60, p), k * s); g.fillStyle = s < 0 ? '#c08458' : '#f2cca8'; g.strokeStyle = '#2a1c17'; g.lineWidth = 8; g.beginPath(); g.roundRect(-90 * (s < 0 ? 1 : 0) - (s > 0 ? 0 : 0), -40, 90, 80, 30); g.fill(); g.stroke();
    g.fillStyle = s < 0 ? '#c8312c' : '#1a1a22'; g.fillRect(s < 0 ? -200 : 90, -46, 110, 92); g.strokeRect(s < 0 ? -200 : 90, -46, 110, 92); g.restore(); } g.restore(); }
function crossSalt(g, t, t0, alpha) { const p = ezo(span(t, t0, 0.25)); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1180); g.strokeStyle = '#d0281e'; g.lineWidth = 34; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-200 * p, -200 * p); g.lineTo(200 * p, 200 * p); g.moveTo(200 * p, -200 * p); g.lineTo(-200 * p, 200 * p); g.stroke(); g.restore(); }

export const hits = [];
export const extraHits = (timeline) => {
  const m = timeline.scenes.find((x) => x.id === 'main'), out = []; const s = { line: (i) => m.cues[i]?.text, cue: (i) => m.cues[i].start, cueEnd: (i) => m.cues[i].end };
  const sh = shots(s); sh.forEach((x, i) => { if (!i) return; const cut = sh[i - 1].set !== x.set; if (cut || i % 4 === 0) out.push({ t: m.start + x.a - 0.15, kind: 'whoosh', vol: cut ? 0.22 : 0.1 }); });
  const n = []; for (let i = 0; s.line(i); i++) n.push(s.line(i)); const id = (st) => n.findIndex((x) => x.startsWith(st));
  const at2 = (st, nd) => { const i = id(st); return i < 0 ? null : m.start + wt(s, i, nd); }, add = (t, kind, vol) => { if (t != null) out.push({ t, kind, vol }); };
  const H1 = 'ആയിരത്തി അറുനൂറ്'; add(m.start + 0.05, 'boom', 0.3); add(m.start + 0.1, 'chime', 0.3); for (let k = 0; k < 6; k++) add(at2(H1, 'തല') - 0.1 + k * 0.11, 'tick', 0.35); add(at2(H1, 'തല') + 0.2, 'thud', 0.55); add(at2(H1, 'ഉപ്പിലിട്ട്'), 'pop', 0.3); add(at2(H1, 'സ്വന്തം'), 'thud', 0.5); add(at2(H1, 'ചതിച്ചില്ലായിരുന്നെങ്കിലോ'), 'boom', 0.45);
  add(at2('നോക്കൂ', 'നോക്കൂ'), 'chime', 0.3); for (let k = 0; k < 4; k++) add(at2('നോക്കൂ', 'പോർച്ചുഗീസ്') + 0.2 + k * 0.4, 'boom', 0.35); add(at2('നോക്കൂ', 'മുങ്ങും'), 'boom', 0.4); add(at2('നോക്കൂ', 'അവരുടെ') + 0.7, 'hit', 0.35);
  add(at2('സാമൂതിരിയുടെ മറുപടി', 'കുഞ്ഞാലി'), 'whoosh', 0.3); add(at2('സാമൂതിരിയുടെ മറുപടി', 'വലിയ'), 'pop', 0.35);
  add(at2('പറങ്കികൾ', 'ചിരിച്ചു:'), 'pop', 0.3); add(at2('പറങ്കികൾ', '"ഈ'), 'pop', 0.3);
  add(at2('ആയിരത്തി അഞ്ഞൂറ്റി', 'ആയിരത്തി'), 'pop', 0.35); for (let k = 0; k < 6; k++) add(at2('ആയിരത്തി അഞ്ഞൂറ്റി', 'ചാലിയം') + 0.3 + k * 0.25, 'thud', 0.4); add(at2('ആയിരത്തി അഞ്ഞൂറ്റി', 'ഒരു കല്ലുപോലും'), 'boom', 0.4);
  add(at2('ഒരു കൂട്ടം', 'തേനീച്ചകൾ'), 'whoosh', 0.3);
  add(at2('കാത്തിരിക്കൂ', 'കാത്തിരിക്കൂ'), 'whoosh', 0.35); add(at2('കാത്തിരിക്കൂ', 'കുഞ്ഞാലി') + 0.3, 'chime', 0.35); add(at2('കാത്തിരിക്കൂ', 'സാമൂതിരിയുടെ') + 0.3, 'chime', 0.35); add(at2('കാത്തിരിക്കൂ', 'ഒരു കടലിൽ') + 0.6, 'hit', 0.5);
  add(at2('സാമൂതിരി ശത്രുവുമായി', 'കൈകോർത്തു'), 'thud', 0.4); add(at2('സാമൂതിരി ശത്രുവുമായി', 'കീഴടങ്ങി'), 'pop', 0.3); add(at2('സാമൂതിരി ശത്രുവുമായി', 'കൈമാറി'), 'thud', 0.55);
  add(at2('ആ ചതി', 'ആ'), 'boom', 0.45); add(at2('ആ ചതി', 'ഒന്നിച്ച്'), 'chime', 0.35); add(at2('ആ ചതി', 'കടലിൽ') + 0.4, 'boom', 0.4);
  add(at2('ഇന്ന് ഇന്ത്യൻ', 'ഐ.എൻ.എസ്'), 'chime', 0.4);
  add(at2('ഗോവയിൽ', 'ഗോവയിൽ'), 'whoosh', 0.3); add(at2('ഗോവയിൽ', 'ഉപ്പുപെട്ടിയിലല്ല'), 'hit', 0.35); add(at2('ഗോവയിൽ', 'പടക്കപ്പലിന്റെ'), 'chime', 0.35);
  return out.filter((x) => x.t != null && !Number.isNaN(x.t));
};
void H;
export const shotTimes = (timeline) => { const m = timeline.scenes.find((x) => x.id === 'main'); const s = { line: (i) => m.cues[i]?.text, cue: (i) => m.cues[i].start, cueEnd: (i) => m.cues[i].end }; return shots(s).map((x) => ({ a: m.start + x.a, b: m.start + x.b, set: x.set })); };
