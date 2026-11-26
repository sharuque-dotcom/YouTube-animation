// Vasco da Gama at Calicut, 1498 (kit formula): hook = the Zamorin's men laughing at Gama's gift -> what if the Zamorin
// had sent him back; you-see (pepper worth gold, no sea route), Gama round Africa to Kappad, the gift list, the Mecca-merchant
// jibe, the wedding-biscuit analogy, wait...? (trade allowed anyway, 60x profit in Lisbon), 1502 cannons then Dutch and British,
// the what-if (door shut, foothold delayed), callback (one box of sugar = 400 years), question + follow.
// Sets reused from ml-kunjali: sea (beach + carracks), palace (Zamorin's court), goa (redressed as the Lisbon quay).
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
  const Z = await import('../ml-kunjali/sets.js'), base = await import('../ml-bean/sets.js'), CO = await import('../ml-colachel/sets.js'); DUTCH = (await import('../ml-colachel/ship.js')).dutchShip;
  S = { sea: Z.seaSet(base.beachSet()), goa: Z.goaSet(), palace: Z.dressPalace(CO.fortSet()) };
  // the Kunjali-only set pieces stay out of this story
  [S.sea.chaliyam, S.sea.kottakkal].forEach((o) => { if (o) o.visible = false; });
  buildSea(); buildGoa(); buildPalace();
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
  b.vas = actor(sc, 'vasco', 0.6, 1.2); b.por = actor(sc, 'porter', -0.8, 0.8); b.ps = [actor(sc, 'portSoldier', 1.9, 0.6), actor(sc, 'portSoldier', 3.0, 0.2)];
  b.fish = actor(sc, 'fisher', -2.4, 1.8); b.kan = actor(sc, 'kannan', -3.6, 1.4); b.mee = actor(sc, 'meenu', -1.6, 2.4); b.mer = actor(sc, 'merchant', -4.6, 0.8);
  b.dutch = [0, 1].map((k) => { const s = DUTCH({ life: b.life, seed: k + 20 }); s.scale.setScalar(0.7); s.visible = false; sc.add(s); return s; });
}
function buildGoa() { const g = S.goa, sc = g.scene; g.vas = actor(sc, 'vasco', 0.4, 2.6); g.cap = actor(sc, 'captain', -0.6, 1.8); g.por = actor(sc, 'porter', 1.4, 2.0); g.ps = [actor(sc, 'portSoldier', -3.4, 1.2)];
  g.crowd = ['merchant2', 'clerk', 'chaya'].map((w, i) => actor(sc, w, 4.2 + i * 1.4, 1.0 + (i % 2) * 0.8)); g.scaffold.visible = false; g.saltBox.visible = false;
  sc.children.forEach((o) => { if (Math.abs(o.position.x - 7) < 0.01 && o.position.z > 3 && o.position.z < 3.3) o.visible = false; }); }
function buildPalace() { const p = S.palace, sc = p.scene; p.zam = actor(sc, 'zamorin', 0, -2.8); p.fac = actor(sc, 'factor', -1.2, -1.4); p.wal = actor(sc, 'wali', -2.0, -0.9);
  p.vas = actor(sc, 'vasco', 1.2, -1.2); p.por = actor(sc, 'porter', 2.0, -0.7); p.mer = actor(sc, 'merchant', -1.0, -3.2); p.mer2 = actor(sc, 'merchant2', -2.6, -2.6); p.nair = actor(sc, 'nair', 1.0, -3.4); }

// ------------------------------------------------------------------ per-shot state
let OV = null;
function resetProps() {
  const b = S.sea, g = S.goa, p = S.palace;
  [b.vas, b.por, ...b.ps, b.fish, b.kan, b.mee, b.mer, g.vas, g.cap, g.por, ...g.ps, ...g.crowd, p.zam, p.fac, p.wal, p.vas, p.por, p.mer, p.mer2, p.nair].forEach((x) => { x.c.visible = false; x.c.position.set(...x.base); });
  b.paroes.forEach((x) => { x.visible = false; }); b.dutch.forEach((x) => { x.visible = false; }); b.dhow.visible = false; [...b.boom, ...b.smoke, ...b.splash].forEach((m) => { m.visible = false; });
  b.carracks.forEach((s) => { s.position.x = s.userData.home.x; s.position.z = s.userData.home.z; s.visible = true; });
  OV = {};
}
const fleet = (n, f) => { S.sea.paroes.slice(0, n).forEach((p, i) => { p.visible = true; f(p, i); }); };
function cannons(t, t0, ships = [0, 1]) { const b = S.sea; ships.forEach((si, k) => { const s = b.carracks[si]; for (let j = 0; j < 3; j++) { const m = b.boom[k * 3 + j], sm = b.smoke[k * 3 + j]; const ph = ((t - t0 - k * 0.4 - j * 0.25) % 1.6 + 1.6) % 1.6; if (t < t0) continue;
  m.visible = ph < 0.25; m.position.set(s.position.x + (j - 1) * 5, s.position.y + 2.2, s.position.z + 3.5); m.scale.setScalar(0.4 + ph * 5); sm.visible = true; sm.position.set(s.position.x + (j - 1) * 5 + ph * 1.5, s.position.y + 2.4 + ph * 2, s.position.z + 3.8); sm.scale.setScalar(0.6 + ph * 2.2); sm.material.opacity = 0.8 * (1 - ph / 1.6); } }); }

// ------------------------------------------------------------------ shots
function shots(s) { return tidy(rawShots(s)); }
function rawShots(s) {
  const n = []; for (let i = 0; s.line(i); i++) n.push(s.line(i));
  const id = (start) => n.findIndex((x) => x.startsWith(start));
  const I = { hook: id('ആയിരത്തി'), see: id('നോക്കൂ'), gama: id('പോർച്ചുഗലിൽ'), gift: id('കൊണ്ടുവന്ന'), mock: id('കൊട്ടാരം'), ana: id('കല്യാണത്തിന്'),
    wait: id('കാത്തിരിക്കൂ'), guns: id('നാല് വർഷം'), whatif: id('സാമൂതിരി അന്ന്'), sugar: id('വെറുമൊരു'), ask: id('നിങ്ങളായിരുന്നു') };
  const L = (i) => s.cue(i), w = (i, nd) => wt(s, i, nd);
  const SE = (k) => ({ set: 'sea', ...k }), GO = (k) => ({ set: 'goa', ...k }), PA = (k) => ({ set: 'palace', ...k });
  const b = S?.sea, g = S?.goa, p = S?.palace;
  const push = (p0, l, r0 = 0.03, f = 50, d = [0, 0, -0.6]) => [[0, p0, l, r0, f], [0.35, p0.map((x, q) => x + d[q] * 0.4), l, 0.01, f - 2], [2.2, p0.map((x, q) => x + d[q]), l, -0.02, f - 4]];
  const seaWide = push([0.4, 1.8, 6.5], [0, 2.4, -30], 0.03, 50, [0, 0.1, -1.2]);
  const shoreLow = push([0.2, 1.3, 5.6], [0, 1.6, -4], 0.03, 48, [0, 0, -0.8]);
  const carrackCam = push([4, 2.6, -14], [12, 6, -42], 0.03, 46, [0.6, 0.2, -2]);
  const court = push([0.0, 1.9, 5.2], [0, 1.4, -1.8], 0.03, 58, [0, 0, -0.6]);
  const laughCam = push([-1.4, 1.9, 4.6], [-1.6, 1.6, -1.2], 0.04, 50, [0, 0, -0.5]);
  const giftCam = push([1.5, 1.6, 2.6], [1.6, 1.3, -1.0], 0.03, 50, [0, 0, -0.4]);
  const zamClose = push([0, 2.0, 1.4], [0, 1.8, -2.8], 0.03, 48, [0, 0, -0.4]);
  const quay = push([0.6, 2.0, 8.6], [0.5, 1.6, 2], 0.03, 48, [0, 0, -0.6]);
  const out = [];
  const add = (x) => { if (x.a != null && x.b != null && x.b > x.a) out.push(x); };
  const laughers = (t, k0 = 1) => { pose(p.fac, { expr: 'laugh', R: 'hold', propR: 'palmLeaf', L: 'mouth', hop: hopAt(t, 8, 0.06), lean: Math.sin(t * 9) * 0.07 * k0 }, t); pose(p.wal, { expr: 'laugh', R: 'point', L: 'hip', hop: hopAt(t, 8, 0.06, 1), lean: Math.sin(t * 9 + 1) * 0.07 * k0 }, t); };
  const presenters = (t, ex = 'proud') => { pose(p.vas, { expr: ex, R: 'hold', propR: 'hat', L: 'hip' }, t); pose(p.por, { expr: 'nervous', R: 'hold', propR: 'sugarBox', L: 'hold', propL: 'honeyJar' }, t); };
  const zamSit = (t, o = {}) => pose(p.zam, { expr: 'smug', R: 'hip', L: 'hip', ...o }, t);
  // ---- 1. HOOK: the court laughs at the foreigner's gift -> what if the Zamorin had sent him back?
  if (I.hook >= 0) { const i = I.hook, wOr = w(i, 'ഒരു വിദേശി'), wPo = w(i, 'പൊട്ടിച്ചിരിക്കുന്നു'), wAn = w(i, 'അന്ന്'), wTi = w(i, 'തിരിച്ചയച്ചിരുന്നെങ്കിലോ'), end = L(i + 1);
    add(PA({ a: 0, b: wOr - 0.1, keys: laughCam, act: (t) => { laughers(t); OV.haha = { t0: 0.05 }; OV.cal = { t0: 0.1, top: 'CALICUT', big: '1498' }; } }));
    add(PA({ a: wOr - 0.1, b: wPo - 0.1, keys: giftCam, act: (t) => { presenters(t, 'proud'); OV.gifts = { t0: wOr + 0.2, n: 4, step: 0.35 }; } }));
    add(PA({ a: wPo - 0.1, b: wAn - 0.1, shake: wPo + 0.2, keys: court, act: (t) => { laughers(t); presenters(t, 'shock'); zamSit(t, { expr: 'think', R: 'chin' }); OV.haha = { t0: wPo }; } }));
    add(PA({ a: wAn - 0.1, b: wTi + 0.3, keys: zamClose, act: (t) => { zamSit(t, { expr: 'stern', R: t > wTi - 0.2 ? 'out' : 'chin' }); OV.tag = { t0: wAn, txt: 'സാമൂതിരി', sub: 'THE ZAMORIN OF CALICUT' }; } }));
    add(SE({ a: wTi + 0.3, b: end, flash: wTi + 0.15, keys: seaWide, act: (t) => { b.carracks.forEach((c, k) => { c.position.x = c.userData.home.x + (t - wTi) * (k % 2 ? 1.2 : -1.2); }); OV.big = { t0: wTi + 0.3, txt: '?', sub: 'WHAT IF?' }; } })); }
  // ---- 2. YOU SEE: pepper worth gold in Europe, nobody knows the sea route
  if (I.see >= 0) { const i = I.see, wKu = w(i, 'കുരുമുളകിന്'), wPa = w(i, 'പക്ഷേ'), end = L(i + 1);
    add(GO({ a: L(i), b: wPa - 0.1, keys: quay, act: (t) => { g.crowd.forEach((a, k) => pose(a, { expr: ['shock', 'beam', 'think'][k], R: k ? 'point' : 'mouth', L: 'hang' }, t)); at(g.crowd[0], 0.6, 0, 3.0); at(g.crowd[1], 2.2, 0, 2.6); at(g.crowd[2], -1.0, 0, 2.4); OV.tag = { t0: L(i) + 0.05, txt: 'യൂറോപ്പ്', sub: 'EUROPE, 1490s' }; if (t > wKu - 0.1) OV.tag = null, OV.scale = { t0: wKu }; } }));
    add(SE({ a: wPa - 0.1, b: end, keys: push([0, 3.6, -6], [0, 2, -60], 0.02, 52, [0, 0.4, -2]), act: (t) => { b.carracks.forEach((c) => { c.visible = false; }); OV.route = { t0: wPa }; } })); }
  // ---- 3. VASCO DA GAMA: from Portugal, round Africa, ten months, three ships reach Kappad
  if (I.gama >= 0) { const i = I.gama, wVa = w(i, 'വാസ്കോ'), wAa = w(i, 'ആഫ്രിക്ക'), wMo = w(i, 'മൂന്ന്'), end = L(i + 1);
    add(GO({ a: L(i), b: wAa - 0.1, keys: push([0.6, 1.9, 6.4], [0.2, 1.7, 2.2], 0.03, 46, [0, 0, -0.5]), act: (t) => { pose(g.vas, { expr: 'proud', R: t > wVa ? 'point' : 'hip', L: 'hip' }, t); pose(g.cap, { expr: 'smile', R: 'hold', propR: 'telescope', L: 'hang' }, t); pose(g.por, { expr: 'grin', R: 'wave', L: 'hang' }, t); OV.tag = { t0: wVa, txt: 'വാസ്കോ ഡ ഗാമ', sub: 'LISBON · JULY 1497' }; } }));
    add(SE({ a: wAa - 0.1, b: wMo - 0.1, keys: carrackCam, act: (t) => { b.carracks.forEach((c, k) => { c.position.x = c.userData.home.x - (t - wAa) * 2.2; }); OV.months = { t0: wAa + 0.2 }; } }));
    add(SE({ a: wMo - 0.1, b: end, keys: shoreLow, act: (t) => { b.carracks.forEach((c, k) => { c.position.z = c.userData.home.z + 10; }); pose(b.fish, { expr: 'shock', R: 'point', L: 'hang' }, t); pose(b.kan, { expr: 'shock', R: 'mouth', L: 'hang' }, t); pose(b.mee, { expr: 'beam', R: 'wave', L: 'hang', hop: hopAt(t, 6, 0.05) }, t); at(b.fish, -1.1, 0, 0.6); at(b.kan, 0.1, 0, 0.2); at(b.mee, 1.0, 0, 0.9); OV.tag = { t0: wMo + 0.2, txt: 'കാപ്പാട്', sub: 'MAY 20, 1498 · 3 SHIPS' }; } })); }
  // ---- 4. THE GIFT: some cloth, four hats, a box of sugar, two jars of honey
  if (I.gift >= 0) { const i = I.gift, end = L(i + 1); const ts = ['തുണി', 'തൊപ്പി', 'പഞ്ചസാര', 'തേൻ'].map((x) => w(i, x));
    add(PA({ a: L(i), b: end, keys: giftCam, act: (t) => { presenters(t, t > ts[3] ? 'beam' : 'proud'); OV.gifts = { t0: L(i), at: ts, n: 4 }; } })); }
  // ---- 5. MOCKED: the palace laughs, "the poorest merchant from Mecca gives more"
  if (I.mock >= 0) { const i = I.mock, wMa = w(i, '"മക്കയിലെ'), wIt = w(i, 'ഇതിലും'), end = L(i + 1);
    add(PA({ a: L(i), b: wMa - 0.1, shake: L(i) + 0.3, keys: court, act: (t) => { laughers(t, 1.4); presenters(t, 'nervous'); zamSit(t, { expr: 'smug' }); pose(p.nair, { expr: 'laugh', R: 'holdUp', propR: 'sword', hop: hopAt(t, 8, 0.05, 2) }, t); OV.haha = { t0: L(i) }; } }));
    add(PA({ a: wMa - 0.1, b: end, keys: laughCam, act: (t) => { laughers(t); pose(p.mer, { expr: 'sly', R: 'point', L: 'hip' }, t); pose(p.mer2, { expr: 'smug', R: 'chin', L: 'hang' }, t); at(p.mer, -0.6, 0, -2.4); at(p.mer2, -2.6, 0, -2.4);
      OV.bubble = { t0: wMa, txt: '"മക്കയിലെ പാവം കച്ചവടക്കാരൻ..."', x: 0.5, y: 0.6 }; if (t > wIt - 0.1) OV.bubble = null, OV.badge = { t0: wIt, txt: 'ഇതിലും കൂടുതൽ തരും!', sub: '' }; } })); }
  // ---- 6. ANALOGY: a wedding guest with one packet of biscuits
  if (I.ana >= 0) { const i = I.ana, end = L(i + 1);
    add(PA({ a: L(i), b: end, keys: court, act: (t) => { presenters(t, 'nervous'); OV.dim = 0.5; OV.wed = { t0: L(i) }; } })); }
  // ---- 7. WAIT...: and still the Zamorin allowed trade; pepper home; 60x in Lisbon
  if (I.wait >= 0) { const i = I.wait, wEn = w(i, 'എന്നിട്ടും'), wKa = w(i, 'കച്ചവടം'), wGa = w(i, 'ഗാമ'), wLi = w(i, 'ലിസ്ബണിൽ'), wAr = w(i, 'അറുപത്'), end = L(i + 1);
    add(PA({ a: L(i), b: wGa - 0.1, keys: zamClose, act: (t) => { zamSit(t, { expr: t > wKa - 0.2 ? 'smile' : 'think', R: t > wKa - 0.2 ? 'wave' : 'chin' }); OV.rewind = { t0: L(i) }; if (t > wKa - 0.1) OV.stamp = { t0: wKa, txt: 'കച്ചവടം OK', sub: 'TRADE ALLOWED' }; } }));
    add(SE({ a: wGa - 0.1, b: wLi - 0.1, keys: shoreLow, act: (t) => { at(b.vas, 0.9, 0, 0.4); at(b.por, -0.2, 0, 0.8); at(b.fish, -1.2, 0, 0.2); pose(b.vas, { expr: 'beam', R: 'hold', propR: 'pepperSack', L: 'hip' }, t); pose(b.por, { expr: 'grin', R: 'hold', propR: 'pepperSack', L: 'hold', propL: 'pepperSack', hop: hopAt(t, 6, 0.04) }, t); pose(b.fish, { expr: 'smile', R: 'hold', propR: 'pepperSack', L: 'hang' }, t); OV.tag = { t0: wGa + 0.2, txt: 'കുരുമുളക്', sub: 'PEPPER, AUG 1498' }; } }));
    add(GO({ a: wLi - 0.1, b: end, keys: quay, act: (t) => { pose(g.vas, { expr: 'beam', R: 'up', L: 'hip', hop: hopAt(t, 7, 0.05) }, t); pose(g.cap, { expr: 'laugh', R: 'clap', L: 'clap' }, t); pose(g.por, { expr: 'beam', R: 'hold', propR: 'pepperSack', L: 'hang' }, t); OV.coins = { t0: wLi }; if (t > wAr - 0.1) OV.big = { t0: wAr, txt: '×60', sub: 'ലാഭം!' }; } })); }
  // ---- 8. ESCALATION: four years later, cannons; then the Dutch and the British
  if (I.guns >= 0) { const i = I.guns, wIt = w(i, 'ഇത്തവണ'), wPe = w(i, 'പീരങ്കികൾ'), wPi = w(i, 'പിന്നാലെ'), end = L(i + 1);
    add(SE({ a: L(i), b: wIt - 0.1, keys: seaWide, act: (t) => { b.carracks.forEach((c) => { c.position.z = c.userData.home.z + 8; }); OV.cal = { t0: L(i) + 0.1, top: 'CALICUT', big: '1502' }; } }));
    add(SE({ a: wIt - 0.1, b: wPi - 0.1, war: true, shake: wPe + 0.2, keys: carrackCam, act: (t) => { cannons(t, wPe - 0.1, [0, 1]); if (t > wPe - 0.1) OV.stamp = { t0: wPe, txt: 'പീരങ്കികൾ!', sub: 'NOT GIFTS' }; else OV.gifts = { t0: wIt - 0.4, n: 4, step: 0.05, cross: wIt + 0.2 }; } }));
    add(SE({ a: wPi - 0.1, b: end, keys: push([0, 3, -12], [4, 3, -48], 0.03, 50, [0, 0.2, -1.2]), act: (t) => { b.dutch.forEach((s, k) => { s.visible = true; s.position.set(-10 + k * 22, 0.6, -64 + (t - wPi) * 2); s.rotation.y = Math.PI / 2 + (k ? -0.3 : 0.3); }); OV.flags = { t0: wPi }; } })); }
  // ---- 9. WHAT IF: the Zamorin shuts the door
  if (I.whatif >= 0) { const i = I.whatif, wYu = w(i, 'യൂറോപ്പ്'), wPa = w(i, 'പക്ഷേ'), wNa = w(i, 'നമ്മുടെ'), end = L(i + 1);
    add(PA({ a: L(i), b: wYu - 0.1, flash: L(i), dream: true, keys: court, act: (t) => { zamSit(t, { expr: 'stern', R: 'out', L: 'hip' }); pose(p.vas, { expr: 'shock', R: 'hold', propR: 'hat', L: 'hang' }, t); pose(p.por, { expr: 'sad', R: 'hold', propR: 'sugarBox', L: 'hang' }, t); OV.door = { t0: L(i) + 0.3 }; } }));
    add(SE({ a: wYu - 0.1, b: wNa - 0.1, dream: true, keys: seaWide, act: (t) => { b.carracks.forEach((c, k) => { c.position.z = c.userData.home.z - (t - wYu) * 3; c.position.x = c.userData.home.x + (k - 1) * (t - wYu); }); if (t > wPa - 0.1) OV.cal = { t0: wPa, top: 'FOOTHOLD', big: '⏳' }; } }));
    add(SE({ a: wNa - 0.1, b: end, dream: true, keys: shoreLow, act: (t) => { b.carracks.forEach((c) => { c.visible = false; }); fleet(5, (q, k) => { q.position.set(-9 + k * 4.4, 0.25 + Math.sin(t * 1.4 + k) * 0.06, -20 - (k % 2) * 5 - (t - wNa) * 1.2); q.rotation.y = Math.PI / 2; }); pose(b.fish, { expr: 'beam', R: 'up', L: 'hang', hop: hopAt(t, 6, 0.05) }, t); pose(b.mee, { expr: 'beam', R: 'wave', L: 'hang' }, t); at(b.fish, -0.7, 0, 0.6); at(b.mee, 0.7, 0, 0.9); OV.badge = { t0: wNa + 0.2, txt: 'നമ്മുടെ കടൽ', sub: 'OUR SEA, A WHILE LONGER' }; } })); }
  // ---- 10. CALLBACK: one box of sugar = four hundred years
  if (I.sugar >= 0) { const i = I.sugar, wAt = w(i, 'അതിന്'), end = L(i + 1);
    add(PA({ a: L(i), b: end, keys: giftCam, act: (t) => { pose(p.por, { expr: 'nervous', R: 'hold', propR: 'sugarBox', L: 'hang' }, t); pose(p.vas, { expr: 'sly', R: 'hip', L: 'hip' }, t); OV.sugar = { t0: L(i) }; if (t > wAt - 0.1) OV.big = { t0: wAt, txt: '400', sub: 'വർഷം', count: true }; } })); }
  // ---- 11. QUESTION + FOLLOW
  if (I.ask >= 0) { const i = I.ask, wVa = w(i, 'വാതിൽ'), wKa = w(i, 'കമന്റ്'), wNa = w(i, 'നാളത്തെ');
    add(PA({ a: L(i), b: 1e9, keys: zamClose, act: (t) => { zamSit(t, { expr: t > wVa ? 'think' : 'smile', R: 'chin' }); if (t > wVa - 0.1) OV.doors = { t0: wVa }; if (t > wKa - 0.1) OV.comment = { t0: wKa }; if (t > wNa - 0.1) OV.doors = null, OV.comment = null, OV.follow = { t0: wNa }; } })); }
  return out;
}

const GRADE = { sea: { hazeAmt: 0.2, haze: 0xdfe9f2, sat: 1.12, contrast: 0.06, lift: 0.015, warm: 0.03, vignette: 0.3 }, goa: { hazeAmt: 0.15, haze: 0xe8d8c8, sat: 1.0, contrast: 0.08, lift: 0.015, warm: 0.03, vignette: 0.42 },
  palace: { hazeAmt: 0.1, haze: 0xf0e4c8, sat: 1.1, contrast: 0.06, lift: 0.015, warm: 0.05, vignette: 0.34 }, 
  night: { hazeAmt: 0.15, haze: 0x1a1a30, sat: 1.05, contrast: 0.08, lift: 0.02, warm: -0.01, vignette: 0.45 } };

// ------------------------------------------------------------------ overlays (story-specific motion graphics)
function overlays(g, t, alpha) {
  if (OV.dim) { g.save(); g.globalAlpha = alpha * OV.dim; g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.restore(); }
  if (OV.rewind) rewind(g, t, OV.rewind.t0, alpha);
  if (OV.haha) haha(g, t, OV.haha.t0, alpha);
  if (OV.cal) calendar(g, t, OV.cal, alpha);
  if (OV.gifts) gifts(g, t, OV.gifts, alpha);
  if (OV.scale) pepperScale(g, t, OV.scale.t0, alpha);
  if (OV.route) route(g, t, OV.route.t0, alpha);
  if (OV.months) months(g, t, OV.months.t0, alpha);
  if (OV.wed) wedding(g, t, OV.wed.t0, alpha);
  if (OV.coins) coins(g, t, OV.coins.t0, alpha);
  if (OV.flags) flags(g, t, OV.flags.t0, alpha);
  if (OV.door) door(g, t, OV.door.t0, alpha);
  if (OV.sugar) sugarBox(g, t, OV.sugar.t0, alpha);
  if (OV.doors) doors(g, t, OV.doors.t0, alpha);
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
function haha(g, t, t0, alpha) { const k = t - t0; if (k < 0) return; g.save(); g.globalAlpha = alpha * Math.min(1, k * 4);
  [[0.2, 0.42, -0.2, 0], [0.78, 0.36, 0.2, 0.15], [0.3, 0.62, -0.1, 0.3], [0.72, 0.58, 0.15, 0.45]].forEach(([x, y, r, d]) => { const p = pop(t, t0 + d, 0.2); if (p <= 0) return; g.save(); g.translate(W * x, H * y + Math.sin(t * 12 + d * 9) * 10); g.rotate(r); g.scale(p, p);
    text(g, 'HA HA', 0, 0, { font: "'Oswald'", weight: 700, size: 96, color: '#f6d24a', stroke: '#2a1c17', strokeWidth: 18 }); g.restore(); }); g.restore(); }
// the gift list: cloth, hats, sugar, honey pop in one by one (o.at = word times, or o.step after t0); o.cross strikes them out
function gifts(g, t, o, alpha) { const P = PROPS, items = [['cloth', 'തുണി'], ['hat', '4 തൊപ്പി'], ['sugarBox', 'പഞ്ചസാര'], ['honeyJar', '2 ഭരണി തേൻ']]; const p0 = pop(t, o.t0, 0.25); if (p0 <= 0) return;
  g.save(); g.globalAlpha = alpha * p0; g.translate(W / 2, 1500); card(g, 980, 470, 'rgba(244,236,214,.95)'); text(g, 'സമ്മാനം', 0, -185, { size: 60, color: '#8a1e1e' });
  items.forEach(([k, lbl], j) => { const tj = o.at ? o.at[j] - 0.1 : o.t0 + j * (o.step ?? 0.35); const p = pop(t, tj, 0.25); if (p <= 0) return; const x = -345 + j * 230; g.save(); g.translate(x, 20); g.scale(0.4 + 0.6 * p, 0.4 + 0.6 * p); g.rotate(Math.sin(t * 3 + j) * 0.05);
    propAt(g, P[k], 0, 50, 3.0); text(g, lbl, 0, 130, { size: 40, color: '#2a1c17', maxWidth: 220 }); g.restore(); });
  if (o.cross && t > o.cross) { const x = pop(t, o.cross, 0.25); g.strokeStyle = '#d0281e'; g.lineWidth = 26; g.lineCap = 'round'; g.beginPath(); g.moveTo(-440, -150); g.lineTo(-440 + 880 * x, -150 + 300 * x); g.stroke(); }
  g.restore(); }
function pepperScale(g, t, t0, alpha) { const p = pop(t, t0); if (p <= 0) return; const tilt = Math.sin(clamp((t - t0) * 2.5, 0, Math.PI / 2)) * 0.0 + Math.sin(t * 2) * 0.03; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1300); card(g, 900, 520, 'rgba(244,236,214,.95)');
  g.strokeStyle = '#2a1c17'; g.lineWidth = 10; g.beginPath(); g.moveTo(0, 170); g.lineTo(0, -120); g.stroke(); g.fillStyle = '#b8862a'; g.beginPath(); g.moveTo(-60, 200); g.lineTo(60, 200); g.lineTo(0, 160); g.closePath(); g.fill(); g.stroke();
  g.save(); g.translate(0, -120); g.rotate(tilt); g.beginPath(); g.moveTo(-300, 0); g.lineTo(300, 0); g.stroke();
  for (const s of [-1, 1]) { g.save(); g.translate(s * 300, 0); g.rotate(-tilt); g.beginPath(); g.moveTo(0, 0); g.lineTo(-80, 120); g.moveTo(0, 0); g.lineTo(80, 120); g.lineWidth = 4; g.stroke(); g.fillStyle = '#d8a63a'; g.beginPath(); g.ellipse(0, 125, 110, 24, 0, 0, Math.PI); g.closePath(); g.fill(); g.lineWidth = 8; g.stroke();
    if (s < 0) { g.fillStyle = '#1a120d'; for (let k = 0; k < 9; k++) { g.beginPath(); g.arc(-50 + (k % 5) * 25, 105 - Math.floor(k / 5) * 20, 13, 0, 7); g.fill(); } } else { for (let k = 0; k < 6; k++) { g.fillStyle = '#f6c21a'; g.beginPath(); g.ellipse(-50 + (k % 3) * 50, 105 - Math.floor(k / 3) * 22, 30, 12, 0, 0, 7); g.fill(); g.lineWidth = 4; g.stroke(); } } g.restore(); }
  g.restore(); text(g, 'കുരുമുളക്', -300, 120, { size: 52, color: '#2a1c17' }); text(g, 'പൊന്ന്', 300, 120, { size: 52, color: '#2a1c17' }); text(g, '=', 0, 60, { font: "'Oswald'", weight: 700, size: 110, color: '#c8312c' }); g.restore(); }
function route(g, t, t0, alpha) { const p = pop(t, t0); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1320); card(g, 860, 470, 'rgba(244,236,214,.95)');
  text(g, 'യൂറോപ്പ്', -260, -150, { size: 54, color: '#2a1c17' }); text(g, 'ഇന്ത്യ', 260, 150, { size: 54, color: '#2a1c17' }); g.fillStyle = '#c8312c'; for (const [x, y] of [[-260, -90], [260, 90]]) { g.beginPath(); g.arc(x, y, 18, 0, 7); g.fill(); g.lineWidth = 5; g.strokeStyle = '#2a1c17'; g.stroke(); }
  const u = clamp((t - t0) / 1.2, 0, 1); g.setLineDash([22, 18]); g.lineDashOffset = -t * 60; g.strokeStyle = '#2f5f8a'; g.lineWidth = 10; g.beginPath(); g.moveTo(-260, -90); g.bezierCurveTo(-260 + 200 * u, 200 * u, 60 * u, 200 * u, -260 + 360 * u, -40 + 60 * u); g.stroke(); g.setLineDash([]);
  const q = pop(t, t0 + 0.9, 0.25); if (q > 0) { g.save(); g.translate(60, 10); g.scale(q * 1.2, q * 1.2); text(g, '?', 0, 0, { font: "'Oswald'", weight: 700, size: 220, color: '#c8312c', stroke: '#2a1c17', strokeWidth: 16 }); g.restore(); }
  g.restore(); text(g, 'കടൽവഴി അറിയില്ല!', W / 2, 1620, { size: 66, color: '#fff', stroke: '#2a1c17', strokeWidth: 14, maxWidth: 980 }); }
function months(g, t, t0, alpha) { const p = pop(t, t0); if (p <= 0) return; const n = Math.min(10, 1 + Math.floor((t - t0) * 4.5)); g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1380); g.rotate(-0.04);
  card(g, 520, 440, '#f4f0e6'); g.fillStyle = '#2f5f8a'; g.beginPath(); g.roundRect(-260, -220, 520, 120, [28, 28, 0, 0]); g.fill(); g.stroke(); text(g, 'ആഫ്രിക്ക ചുറ്റി', 0, -160, { size: 58, color: '#fff', maxWidth: 470 });
  text(g, String(n), 0, 30, { font: "'Oswald'", weight: 700, size: 190, color: '#2a1c17' }); text(g, 'മാസം', 0, 160, { size: 56, color: '#8a1e1e' });
  const fl = (t - t0) * 4.5 % 1; if (n < 10) { g.save(); g.translate(0, -100); g.scale(1, 1 - fl); g.fillStyle = 'rgba(244,240,230,.9)'; g.fillRect(-250, 0, 500, 200 * (1 - fl)); g.restore(); } g.restore(); }
function wedding(g, t, t0, alpha) { const p = pop(t, t0); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1160); g.scale(0.85 + 0.15 * p, 0.85 + 0.15 * p);
  card(g, 980, 780, '#f9e6c4'); g.fillStyle = '#c8312c'; g.beginPath(); g.roundRect(-490, -390, 980, 90, [28, 28, 0, 0]); g.fill(); g.stroke(); text(g, 'കല്യാണം 💐', 0, -345, { size: 54, color: '#fff' });
  for (let k = 0; k < 9; k++) { g.fillStyle = k % 2 ? '#f6c21a' : '#f08a2a'; g.beginPath(); g.arc(-440 + k * 110, -290 + Math.sin(k + t * 2) * 6, 22, 0, 7); g.fill(); }
  const k = t - t0, hand = Math.min(1, k * 1.5), stare = k > 1.2;
  const who = [['ammini', -330, { expr: stare ? 'shock' : 'smile', R: 'hang', L: 'hang' }], ['kannan', -90, { expr: stare ? 'shock' : 'beam', R: 'hang', L: 'hang' }], ['guest', 250, { expr: 'grin', R: 'hold', propR: PROPS.biscuit, L: 'wave' }]];
  who.forEach(([wk, x, o]) => { g.save(); g.translate(x + (wk === 'guest' ? (1 - hand) * 120 : 0), 360); g.scale(1.45, 1.45); B.drawBean(g, wk, o); g.restore(); });
  if (stare) { const q = pop(t, t0 + 1.2, 0.2); g.save(); g.globalAlpha *= q; text(g, '😐', -210, -230, { font: 'sans-serif', size: 90 }); g.restore(); }
  g.restore(); text(g, '🍪 x1', W / 2, 1640, { font: "'Oswald'", weight: 700, size: 90, color: '#f6d24a', stroke: '#2a1c17', strokeWidth: 16 }); }
function coins(g, t, t0, alpha) { const k = t - t0; if (k < 0) return; g.save(); g.globalAlpha = alpha * Math.min(1, k * 4); for (let i = 0; i < 18; i++) { const x = W * ((i * 0.137 + 0.05) % 1), y = ((k * 600 + i * 97) % (H * 0.7)) + 200, r = 26 + (i % 3) * 6; g.save(); g.translate(x, y); g.scale(Math.abs(Math.sin(t * 5 + i)), 1);
  g.fillStyle = '#f6c21a'; g.strokeStyle = '#2a1c17'; g.lineWidth = 5; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill(); g.stroke(); g.restore(); } g.restore(); }
function flagCard(g, kind) { g.strokeStyle = '#2a1c17'; g.lineWidth = 7; if (kind === 'pt') { g.fillStyle = '#fbfaf6'; g.fillRect(-110, -70, 220, 140); g.fillStyle = '#c8312c'; g.fillRect(-14, -60, 28, 120); g.fillRect(-90, -14, 180, 28); }
  if (kind === 'nl') { ['#c8312c', '#fbfaf6', '#1f4f8a'].forEach((c, k) => { g.fillStyle = c; g.fillRect(-110, -70 + k * 140 / 3, 220, 140 / 3 + 1); }); }
  if (kind === 'gb') { g.fillStyle = '#1f3f8a'; g.fillRect(-110, -70, 220, 140); g.strokeStyle = '#fbfaf6'; g.lineWidth = 26; g.beginPath(); g.moveTo(-110, -70); g.lineTo(110, 70); g.moveTo(110, -70); g.lineTo(-110, 70); g.moveTo(0, -70); g.lineTo(0, 70); g.moveTo(-110, 0); g.lineTo(110, 0); g.stroke();
    g.strokeStyle = '#c8312c'; g.lineWidth = 14; g.beginPath(); g.moveTo(0, -70); g.lineTo(0, 70); g.moveTo(-110, 0); g.lineTo(110, 0); g.stroke(); g.strokeStyle = '#2a1c17'; g.lineWidth = 7; }
  g.strokeRect(-110, -70, 220, 140); }
function flags(g, t, t0, alpha) { [['pt', 'പോർച്ചുഗീസ്', 0], ['nl', 'ഡച്ച്', 0.45], ['gb', 'ബ്രിട്ടീഷ്', 0.9]].forEach(([k, lbl, d], j) => { const p = pop(t, t0 + d, 0.3); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2 + (j - 1) * 330, 1360 + (1 - p) * 300); g.rotate((j - 1) * 0.06 + Math.sin(t * 3 + j) * 0.03); flagCard(g, k); text(g, lbl, 0, 130, { size: 50, color: '#fff', stroke: '#2a1c17', strokeWidth: 12, maxWidth: 300 }); g.restore(); }); }
function door(g, t, t0, alpha) { const u = ezo(span(t, t0, 0.7)); if (t < t0) return; g.save(); g.globalAlpha = alpha; const half = W / 2 * u; g.fillStyle = '#6a3e22'; g.strokeStyle = '#2a1c17'; g.lineWidth = 12;
  for (const s of [-1, 1]) { const x = s < 0 ? 0 : W - half; g.fillRect(x, 0, half, H); g.strokeRect(x, 0, half, H); g.fillStyle = '#8a5a32'; for (let r = 0; r < 4; r++) g.fillRect(x + 40, 180 + r * 420, Math.max(0, half - 80), 320); g.fillStyle = '#6a3e22';
    g.fillStyle = '#e8b93a'; for (let r = 0; r < 6; r++) for (let c = 0; c < 3; c++) { g.beginPath(); g.arc(x + 60 + c * Math.max(0, half - 120) / 2, 150 + r * 320, 14, 0, 7); g.fill(); } g.fillStyle = '#6a3e22'; }
  if (u >= 1) { const q = pop(t, t0 + 0.7, 0.25); g.save(); g.translate(W / 2, 1000); g.rotate(-0.1); g.scale(q, q); text(g, 'വാതിലടച്ചു!', 0, 0, { size: 110, color: '#f6d24a', stroke: '#2a1c17', strokeWidth: 22 }); g.restore(); } g.restore(); }
function sugarBox(g, t, t0, alpha) { const p = pop(t, t0, 0.4); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1100); const s = 5 + 1.2 * p + Math.sin(t * 2) * 0.1; propAt(g, PROPS.sugarBox, 0, 120, s); g.restore(); }
function doors(g, t, t0, alpha) { [['തുറക്കുമോ?', '#2f8a4a', '🚪'], ['അടയ്ക്കുമോ?', '#c8312c', '❌']].forEach(([lbl, col, ic], j) => { const p = pop(t, t0 + j * 0.5, 0.3); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2 + (j ? 250 : -250), 1340); g.rotate(j ? 0.05 : -0.05); g.scale(0.8 + 0.2 * p, 0.8 + 0.2 * p);
  card(g, 440, 360, '#f4ecd6'); text(g, ic, 0, -60, { font: 'sans-serif', size: 120 }); g.fillStyle = col; g.beginPath(); g.roundRect(-200, 60, 400, 100, 20); g.fill(); g.stroke(); text(g, lbl, 0, 112, { size: 58, color: '#fff', maxWidth: 380 }); g.restore(); }); }
function comment(g, t, t0, alpha) { const p = pop(t, t0, 0.25); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1640 + Math.sin(t * 6) * 6); g.scale(p, p); card(g, 560, 120, '#ffffff', 60); text(g, '💬 കമന്റ് ചെയ്യൂ 👇', 0, 4, { size: 54, color: '#2a1c17', maxWidth: 520 }); g.restore(); }
function follow(g, t, t0, alpha) { const p = pop(t, t0, 0.3); if (p <= 0) return; const k = t - t0, press = k > 1.2 ? 1 : 0, sq = k > 1.2 && k < 1.4 ? 0.92 : 1; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1380); g.scale((0.8 + 0.2 * p) * sq, (0.8 + 0.2 * p) * sq);
  card(g, 900, 380, '#f4ecd6'); text(g, "നാളത്തെ 'എങ്കിലോ?'", 0, -90, { size: 70, color: '#2a1c17', maxWidth: 840 }); g.fillStyle = press ? '#6a6a70' : '#d0281e'; g.beginPath(); g.roundRect(-260, 0, 520, 130, 65); g.fill(); g.stroke();
  text(g, press ? 'FOLLOWING ✓' : 'FOLLOW', 0, 66, { font: "'Oswald'", weight: 700, size: 70, color: '#fff' });
  if (k > 0.6) { const u = ezo(span(t, t0 + 0.6, 0.6)); g.save(); g.translate(lerp(380, 60, u), lerp(260, 90, u)); g.rotate(-0.4); g.fillStyle = '#fff'; g.strokeStyle = '#2a1c17'; g.lineWidth = 6; g.beginPath(); g.moveTo(0, 0); g.lineTo(26, 70); g.lineTo(38, 44); g.lineTo(66, 60); g.lineTo(54, 34); g.lineTo(82, 28); g.closePath(); g.fill(); g.stroke(); g.restore(); }
  g.restore(); }

export const hits = [];
export const extraHits = (timeline) => {
  const m = timeline.scenes.find((x) => x.id === 'main'), out = []; const s = { line: (i) => m.cues[i]?.text, cue: (i) => m.cues[i].start, cueEnd: (i) => m.cues[i].end };
  const sh = shots(s); sh.forEach((x, i) => { if (!i) return; const cut = sh[i - 1].set !== x.set; if (cut || i % 4 === 0) out.push({ t: m.start + x.a - 0.15, kind: 'whoosh', vol: cut ? 0.22 : 0.1 }); });
  const n = []; for (let i = 0; s.line(i); i++) n.push(s.line(i)); const id = (st) => n.findIndex((x) => x.startsWith(st));
  const at2 = (st, nd) => { const i = id(st); return i < 0 ? null : m.start + wt(s, i, nd); }, add = (t, kind, vol) => { if (t != null) out.push({ t, kind, vol }); };
  add(m.start + 0.05, 'boom', 0.3); add(m.start + 0.1, 'chime', 0.3); add(at2('ആയിരത്തി', 'ഒരു വിദേശി'), 'pop', 0.3); add(at2('ആയിരത്തി', 'പൊട്ടിച്ചിരിക്കുന്നു'), 'hit', 0.35); add(at2('ആയിരത്തി', 'തിരിച്ചയച്ചിരുന്നെങ്കിലോ'), 'boom', 0.45);
  add(at2('നോക്കൂ', 'നോക്കൂ'), 'chime', 0.3); add(at2('നോക്കൂ', 'കുരുമുളകിന്'), 'pop', 0.3); add(at2('നോക്കൂ', 'പക്ഷേ'), 'whoosh', 0.3);
  add(at2('പോർച്ചുഗലിൽ', 'വാസ്കോ'), 'chime', 0.35); for (let k = 0; k < 8; k++) add(at2('പോർച്ചുഗലിൽ', 'ആഫ്രിക്ക') + 0.2 + k * 0.22, 'tick', 0.3); add(at2('പോർച്ചുഗലിൽ', 'മൂന്ന്'), 'boom', 0.3);
  ['തുണി', 'തൊപ്പി', 'പഞ്ചസാര', 'തേൻ'].forEach((x) => add(at2('കൊണ്ടുവന്ന', x), 'pop', 0.35));
  add(at2('കൊട്ടാരം', 'ചിരിച്ചു:'), 'hit', 0.35); add(at2('കൊട്ടാരം', 'ഇതിലും'), 'pop', 0.3);
  add(at2('കല്യാണത്തിന്', 'കല്യാണത്തിന്'), 'chime', 0.3); add(at2('കല്യാണത്തിന്', 'ബിസ്കറ്റുമായി'), 'pop', 0.35);
  add(at2('കാത്തിരിക്കൂ', 'കാത്തിരിക്കൂ'), 'whoosh', 0.35); add(at2('കാത്തിരിക്കൂ', 'കച്ചവടം'), 'thud', 0.45); add(at2('കാത്തിരിക്കൂ', 'ലിസ്ബണിൽ'), 'chime', 0.35); add(at2('കാത്തിരിക്കൂ', 'അറുപത്'), 'hit', 0.45);
  add(at2('നാല് വർഷം', 'നാല്'), 'pop', 0.3); for (let k = 0; k < 4; k++) add(at2('നാല് വർഷം', 'പീരങ്കികൾ') + k * 0.4, 'boom', 0.4); [0, 0.45, 0.9].forEach((d) => add(at2('നാല് വർഷം', 'പിന്നാലെ') + d, 'thud', 0.35));
  add(at2('സാമൂതിരി അന്ന്', 'സാമൂതിരി'), 'boom', 0.4); add(at2('സാമൂതിരി അന്ന്', 'സാമൂതിരി') + 1.0, 'thud', 0.55); add(at2('സാമൂതിരി അന്ന്', 'നമ്മുടെ'), 'chime', 0.35);
  add(at2('വെറുമൊരു', 'വെറുമൊരു'), 'whoosh', 0.3); add(at2('വെറുമൊരു', 'നാനൂറ്'), 'hit', 0.45);
  add(at2('നിങ്ങളായിരുന്നു', 'വാതിൽ'), 'pop', 0.3); add(at2('നിങ്ങളായിരുന്നു', 'അടയ്ക്കുമോ?'), 'pop', 0.3); add(at2('നിങ്ങളായിരുന്നു', 'കമന്റ്'), 'chime', 0.3); add(at2('നിങ്ങളായിരുന്നു', 'ഫോളോ'), 'pop', 0.4);
  return out.filter((x) => x.t != null && !Number.isNaN(x.t));
};
void H;
export const shotTimes = (timeline) => { const m = timeline.scenes.find((x) => x.id === 'main'); const s = { line: (i) => m.cues[i]?.text, cue: (i) => m.cues[i].start, cueEnd: (i) => m.cues[i].end }; return shots(s).map((x) => ({ a: m.start + x.a, b: m.start + x.b, set: x.set })); };
