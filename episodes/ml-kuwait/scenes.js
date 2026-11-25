// Kuwait 1990 (Gulf Part 2, kit formula): hook = 1,70,000 trapped, saved not by the army or a film hero but by 'Toyota Sunny';
// you-see (2 Aug 1990, tanks, a country gone overnight), who he was, mockery (vs Saddam?), his own risk (to Baghdad),
// the deal (Vedi, the ambassador, Iraqi bus owners), the convoy (Basra, Baghdad, Amman), the airlift (488 flights),
// the comparison (a whole town on buses), wait...? twist (the film hero is fictional), what-if (stuck; January bombs), callback.
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
  (await import('../ml-travancore-p2/cast.js')).registerCast(B); (await import('../ml-gulf/cast.js')).registerCast(B); (await import('./cast.js')).registerCast(B);
  const G = await import('../ml-gulf/sets.js'), Z = await import('./sets.js'), st = await import('../ml-bean/street.js');
  S = { desert: G.desertSet(), air: G.airliftSet(), launch: G.launchSet(), room: Z.roomSet(), cinema: Z.cinemaSet(), street: st.buildStreet() };
  Z.dressDesertKuwait(S.desert); S.street.cards = st.radioCrowd(S.street.scene);
  buildDesert(); buildRoom(); buildAir(); buildCinema(); buildLaunch(); buildStreet();
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
const PEOPLE = ['worker', 'dasan', 'vijayan', 'youth', 'chaya', 'amma', 'kannan', 'fisher', 'ammini', 'meenu', 'worker', 'manavalan', 'youth', 'chaya', 'worker', 'amma'];

function buildDesert() { const d = S.desert, sc = d.scene;
  d.crowd = []; for (let i = 0; i < 15; i++) d.crowd.push(actor(sc, PEOPLE[i], -2 + (i % 5) * 1.5 + (Math.floor(i / 5) % 2) * 0.7, 2 + Math.floor(i / 5) * 1.2));
  d.camp = []; for (let i = 0; i < 22; i++) d.camp.push(actor(sc, PEOPLE[(i + 3) % PEOPLE.length], -9 + (i % 11) * 2.0 + (i > 10 ? 1 : 0), -1.6 - (i > 10 ? 1.3 : 0)));
  d.saddam = actor(sc, 'saddam', -6.5, -1, 0, 2.6); d.sunny = actor(sc, 'sunny', -4, 3.6); }
function buildRoom() { const r = S.room, sc = r.scene; r.sunny = actor(sc, 'sunny', -0.6, 0); r.vedi = actor(sc, 'vedi', -2, -0.6); r.amb = actor(sc, 'ambassador', 0, -3.5); r.driver = actor(sc, 'driver', 1.2, -0.6);
  r.friends = [actor(sc, 'worker', -3.0, -0.2), actor(sc, 'youth', -3.8, 0.3), actor(sc, 'kannan', 2.4, 0.1)]; }
function buildAir() { const a = S.air, sc = a.scene; a.q = []; for (let i = 0; i < 18; i++) a.q.push(actor(sc, PEOPLE[(i + 5) % PEOPLE.length], 9.6 + (i % 4) * 1.1, 2 + Math.floor(i / 4) * 1.4)); a.sunny = actor(sc, 'sunny', 11.2, 3.2); }
function buildCinema() { const c = S.cinema, sc = c.scene; c.star = actor(sc, 'star', 0, -6.4); c.sunny = actor(sc, 'sunny', -1.6, -6.2); c.vedi = actor(sc, 'vedi', 1.6, -6.2);
  c.spot = K.mesh(new THREE.ConeGeometry(1.6, 9, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff2d0, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }), { shadow: false }); c.spot.userData.noInk = true; c.spot.position.set(0, 4.5, -6.4); sc.add(c.spot);
  c.spotL = new THREE.SpotLight(0xfff0d0, 0, 14, 0.35, 0.5, 1); c.spotL.position.set(0, 9, -6); c.spotL.target.position.set(0, 0, -6.4); sc.add(c.spotL, c.spotL.target); }
function buildLaunch() { const L = S.launch; L.sunny = actor(L.boat, 'sunny', 0.4, 0.3, 1.26); L.mates = [actor(L.boat, 'worker', -0.5, 0.45, 1.26), actor(L.boat, 'youth', 1.5, 0.2, 1.26)]; }
function buildStreet() { const s = S.street; s.crowd = s.cards.map((c) => ({ c, last: '', seed: (Math.abs(c.position.x) * 13.1 + Math.abs(c.position.z) * 7.7) % 9, base: [c.position.x, c.position.y, c.position.z] })); }

// ------------------------------------------------------------------ camera
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

// ------------------------------------------------------------------ per-shot state
let OV = null;
function resetProps() {
  const d = S.desert, r = S.room, a = S.air, c = S.cinema, L = S.launch;
  d.setMode('day'); d.setCity(0); d.setGush(0, 0); d.setFlash(0, false); d.tanks.forEach((x, i) => x.position.set(-30 + i * 6, 0, 4 - (i % 2) * 2.6)); d.buses.forEach((b) => { b.position.x = -200; }); d.car.position.x = -200; d.car.userData.beam.material.opacity = 0;
  d.signs.forEach((g) => { g.position.x = -200; }); d.tents.forEach((x) => { x.visible = false; }); [...d.crowd, ...d.camp, d.saddam, d.sunny].forEach((x) => { x.c.visible = false; x.c.position.set(...x.base); });
  [r.sunny, r.vedi, r.amb, r.driver, ...r.friends].forEach((x) => { x.c.visible = false; x.c.position.set(...x.base); }); r.setMode('showroom');
  [...a.q, a.sunny].forEach((x) => { x.c.visible = false; x.c.position.set(...x.base); });
  [c.star, c.sunny, c.vedi].forEach((x) => { x.c.visible = false; x.c.position.set(...x.base); }); c.spot.material.opacity = 0; c.spotL.intensity = 0;
  [L.sunny, ...L.mates].forEach((x) => { x.c.visible = false; }); L.setSplash(0, 0, 0, 1e9);
  OV = {};
}
const scared = (t, list, mode = 'scared') => list.forEach((a, i) => pose(a, { expr: mode === 'sad' ? ['sad', 'think', 'sad', 'nervous'][i % 4] : ['nervous', 'shock', 'nervous', 'sad', 'think'][i % 5], R: i % 3 === 0 ? 'holdUp' : i % 3 === 1 ? 'hold' : 'cross', propR: i % 3 === 0 ? 'bundle' : i % 3 === 1 ? 'suitcase' : null, L: mode === 'duck' ? 'up' : 'hang', look: (i % 2 ? -0.4 : 0.3), lookY: mode === 'duck' ? -1 : 0, hop: mode === 'duck' ? hopAt(t, 9, 0.04, i) : 0 }, t));
function laughCrowd(t) { const E = ['laugh', 'grin', 'laugh', 'smug', 'laugh', 'beam', 'laugh', 'grin', 'laugh'];
  S.street.crowd.forEach((a, i) => pose(a, { expr: E[i % E.length], L: i % 3 === 0 ? 'point' : 'hip', R: i % 2 ? 'mouth' : 'hip', look: -1, lean: (i % 2 ? 0.08 : -0.06) * Math.sin(t * 9 + i), hop: hopAt(t, 8, 0.06, i * 1.3) }, t)); }
function convoy(t, t0, speed = 7, lead = -6) { S.desert.buses.forEach((b, i) => { b.position.x = lead - i * 8.5 + (t - t0) * speed; b.position.y = 0.04 + Math.abs(Math.sin(t * 9 + i)) * 0.03; }); }
function screen(mode, t, k = 1) { // the cinema screen is a canvas texture we paint per frame
  const C = S.cinema, g = C.cv.getContext('2d'), w = C.cv.width, h = C.cv.height; g.save();
  const fl = 0.92 + Math.sin(t * 47) * 0.04 + Math.sin(t * 13) * 0.04;
  C.beam.visible = mode !== 'dark'; if (mode === 'dark') { g.fillStyle = '#0e0c0e'; g.fillRect(0, 0, w, h); }
  else if (mode === 'leader') { g.fillStyle = '#d8d0c0'; g.fillRect(0, 0, w, h); const n = 3 - Math.floor(k * 3); g.strokeStyle = '#2a2420'; g.lineWidth = 8; g.beginPath(); g.arc(w / 2, h / 2, 200, 0, 7); g.stroke(); g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.stroke();
    g.fillStyle = 'rgba(40,30,30,.35)'; g.beginPath(); g.moveTo(w / 2, h / 2); g.arc(w / 2, h / 2, 260, -Math.PI / 2, -Math.PI / 2 + ((k * 3) % 1) * Math.PI * 2); g.fill(); g.fillStyle = '#2a2420'; g.font = "700 300px 'Oswald'"; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(Math.max(1, n)), w / 2, h / 2 + 10); }
  else if (mode === 'title' || mode === 'hero' || mode === 'true') { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2a1a10'); gr.addColorStop(0.6, '#8a4a20'); gr.addColorStop(1, '#e8a050'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = '#3a2214'; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 32) g.lineTo(x, h * 0.78 + Math.sin(x * 0.012) * 30); g.lineTo(w, h); g.fill();
    g.save(); g.translate(w * 0.7, h * 0.28); g.rotate(-0.12); g.fillStyle = '#e8e4dc'; g.beginPath(); g.ellipse(0, 0, 120, 16, 0, 0, 7); g.fill(); g.fillRect(-30, -60, 18, 120); g.fillRect(-90, -8, 40, 30); g.restore();
    g.textAlign = 'center'; g.textBaseline = 'middle';
    if (mode === 'title') { const p = ezo(k * 2); g.globalAlpha = p; g.font = "700 170px 'Oswald'"; g.fillStyle = '#f6e2b0'; g.fillText('AIRLIFT', w / 2, h * 0.5); g.font = "800 54px 'Noto Malayalam'"; g.fillText('എയർലിഫ്റ്റ് · 2016', w / 2, h * 0.5 + 120); }
    if (false) { g.font = "700 110px 'Oswald'"; g.fillStyle = '#f6e2b0'; g.fillText('RANJIT KATYAL', w / 2, h * 0.42); g.font = "800 52px 'Noto Malayalam'"; g.fillText('സിനിമയിലെ ഹീറോ', w / 2, h * 0.42 + 100); }
    if (false) { g.font = "800 72px 'Noto Malayalam'"; g.fillStyle = '#f6e2b0'; g.fillText('ശരിക്കും: സണ്ണി + വേദി', w / 2, h * 0.42); g.font = "700 50px 'Oswald'"; g.fillText('+ MANY ORDINARY PEOPLE', w / 2, h * 0.42 + 90); } }
  g.globalAlpha = 1; g.fillStyle = `rgba(0,0,0,${1 - fl})`; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,.08)'; for (let i = 0; i < 40; i++) g.fillRect((Math.sin(t * 91 + i * 7) * 0.5 + 0.5) * w, (Math.sin(t * 53 + i * 3) * 0.5 + 0.5) * h, 2, 2);
  g.restore(); C.tex.needsUpdate = true; }

// ------------------------------------------------------------------ shots
function shots(s) { return tidy(rawShots(s)); }
function rawShots(s) {
  const L = (i) => s.cue(i), w = (i, n) => wt(s, i, n);
  const DE = (k) => ({ set: 'desert', ...k }), RO = (k) => ({ set: 'room', ...k }), AI = (k) => ({ set: 'air', ...k }), CI = (k) => ({ set: 'cinema', ...k }), LA = (k) => ({ set: 'launch', ...k }), ST = (k) => ({ set: 'street', ...k });
  const d = S?.desert, r = S?.room, a = S?.air, c = S?.cinema;
  const w0Yu = w(0, 'യുദ്ധത്തിനു'), w0Av = w(0, 'അവരെ'), w0Si = w(0, 'സിനിമാ'), w0To = w(0, 'ടൊയോട്ട');
  const w1Ir = w(1, 'ഇറാഖിന്റെ'), w1Ot = w(1, 'ഒറ്റ'), w1Ba = w(1, 'ബാങ്കില്ല'), w1Sh = w(1, 'ശമ്പളമില്ല'), w1Vi = w(1, 'വിമാനമില്ല');
  const w2Am = w(2, 'അമ്പത്തിയാറിൽ'), w2To = w(2, 'ടൊയോട്ടയുടെ'), w2Va = w(2, 'ഒരു വർഷം');
  const w3Sa = w(3, 'സദ്ദാമിനോട്'), w3Re = w(3, '"റിട്ടയർ');
  const w4Ch = w(4, 'ചുറ്റും'), w4Pa = w(4, 'പക്ഷേ'), w4Sw = w(4, 'സ്വന്തം'), w4Ba = w(4, 'ബാഗ്ദാദിലേക്ക്');
  const w5Ha = w(5, 'ഹർഭജൻ'), w5Ko = w(5, 'കൂട്ടുകാരോടുമൊപ്പം'), w5In = w(5, 'ഇന്ത്യൻ'), w5Ir = w(5, 'ഇറാഖി'), w5De = w(5, 'ഡീൽ');
  const w6Bs = w(6, 'ബസ്ര'), w6Bg = w(6, 'ബാഗ്ദാദ്'), w6Pi = w(6, 'പിന്നെ'), w6Am = w(6, 'അമ്മാൻ'), w6Ay = w(6, 'ആയിരം');
  const w7Re = w(7, 'രണ്ട്'), w7Na = w(7, 'നാനൂറ്റി'), w7Gi = w(7, 'ഗിന്നസ്');
  const w8Ma = w(8, 'മരുഭൂമി'), w8Vi = w(8, 'വിമാനത്തിൽ');
  const w9Ee = w(9, 'ഈ കഥ'), w9Ai = w(9, "'എയർലിഫ്റ്റ്"), w9Ak = w(9, 'അക്ഷയ്'), w9Pa = w(9, 'പക്ഷേ'), w9Su = w(9, 'സണ്ണിയെയും');
  const w10Pa = w(10, 'പണവും'), w10La = w(10, 'ലക്ഷക്കണക്കിനു'), w10Ja = w(10, 'ജനുവരിയിൽ'), w10Bo = w(10, 'ബോംബുകൾ');
  const w11Sh = w(11, 'ശരിക്കും'), w11To = w(11, 'ടൊയോട്ട'), w11Or = w(11, 'ഒരുപാട്');
  const night = (t, list = d.crowd, mode) => { d.setMode('night'); d.setCity(1); scared(t, list, mode); };
  const roomCast = (t, mode) => { pose(r.sunny, { expr: mode === 'keys' ? 'proud' : mode === 'wave' ? 'beam' : 'smile', R: mode === 'keys' ? 'holdUp' : mode === 'wave' ? 'wave' : 'hold', propR: mode === 'keys' ? 'keys' : mode === 'wave' ? null : 'briefcase', L: mode === 'wave' ? 'up' : 'hip', look: 0.3 }, t); };
  const sign = (i, x) => { d.signs[i].position.x = x; };
  return [
    // ---- 1. HOOK: 1,70,000 trapped. not the army. not a film hero. a man from Kumbanad.
    DE({ a: 0, b: w0Yu - 0.1, night: true, keys: [[0, [7, 2.2, 15], [-4, 4, -60], 0.05, 54], [0.35, [6.6, 2.4, 14.4], [-4, 4.2, -60], 0.02, 54], [2.5, [6, 2.8, 13.6], [-4, 4.6, -60], -0.02, 56]],
      act: (t, tt, sh) => { night(t); d.tanks.forEach((x, i) => { x.position.x += (t - sh.a) * 2; }); OV.big = { t0: 0.2, txt: '1,70,000', sub: 'ഇന്ത്യക്കാർ കുടുങ്ങി', count: true }; } }),
    DE({ a: w0Yu - 0.1, b: w0Av - 0.1, night: true, shake: w0Yu + 0.3, keys: [[0, [1.6, 1.6, 9.6], [1.6, 1.5, 3], 0.04, 46], [0.35, [1.5, 1.6, 9.2], [1.6, 1.5, 3], 0.02, 46], [2, [1.4, 1.6, 8.8], [1.6, 1.55, 3], -0.02, 44]],
      act: (t) => { night(t, d.crowd, 'duck'); d.setFlash(t, true); } }),
    DE({ a: w0Av - 0.1, b: w0Si - 0.1, night: true, keys: [[0, [-5.6, 1.5, 7.4], [-12, 1.3, 1.4], 0.04, 46], [0.35, [-5.9, 1.5, 7.0], [-12, 1.3, 1.4], 0.02, 46], [2, [-6.2, 1.5, 6.6], [-12, 1.35, 1.4], -0.02, 44]],
      act: (t) => { night(t); OV.nope = { t0: w(0, 'പട്ടാളമല്ല'), kind: 'army', txt: 'പട്ടാളമല്ല' }; } }),
    CI({ a: w0Si - 0.1, b: w0To - 0.1, keys: [[0, [0, 1.7, -2.4], [0, 1.6, -6.4], 0.04, 48], [0.35, [0, 1.7, -2.7], [0, 1.6, -6.4], 0.02, 46], [2, [0, 1.7, -2.9], [0, 1.65, -6.4], -0.02, 44]],
      act: (t, tt, sh) => { screen('title', t, 1); c.spot.material.opacity = 0.12; c.spotL.intensity = 40; pose(c.star, { expr: 'smug', R: 'holdUp', propR: 'clap', L: 'hip', look: 0 }, t); OV.nope = { t0: w(0, 'ഹീറോയുമല്ല'), kind: 'x', txt: 'സിനിമാ ഹീറോയുമല്ല' }; } }),
    RO({ a: w0To - 0.1, b: L(1), flash: w0To - 0.1, keys: [[0, [-0.4, 1.55, 3.4], [-0.5, 1.5, -1], 0.04, 44], [0.35, [-0.4, 1.58, 3.0], [-0.5, 1.52, -1], 0.01, 42], [2.2, [-0.4, 1.6, 2.8], [-0.5, 1.55, -1], -0.02, 40]],
      act: (t) => { roomCast(t, 'brief'); pose(r.sunny, { expr: 'proud', R: 'hold', propR: 'briefcase', L: 'thumb', look: 0.2 }, t); OV.tag = { t0: w0To + 0.1, txt: "'ടൊയോട്ട സണ്ണി'", sub: 'കുമ്പനാട്' }; } }),
    // ---- 2. YOU SEE: 2 Aug 1990; tanks roll in; a country gone overnight; no bank, no salary, no flights
    DE({ a: L(1), b: w1Ir - 0.1, night: true, keys: [[0, [0, 9, 26], [0, 6, -100], 0.03, 54], [0.4, [0, 8.6, 25], [0, 6, -100], 0.01, 54], [2.4, [0, 8, 24], [0, 6, -100], -0.01, 54]],
      act: (t) => { night(t, []); OV.cal = { t0: w(1, 'തൊണ്ണൂറ്') - 0.1 }; } }),
    DE({ a: w1Ir - 0.1, b: w1Ot - 0.1, night: true, shake: w1Ir + 0.4, keys: [[0, [-6, 0.9, 9.5], [-16, 1.4, 2.6], 0.05, 50], [0.35, [-6.4, 0.95, 9.2], [-14, 1.4, 2.6], 0.02, 50], [2.2, [-7, 1.0, 9.0], [-10, 1.4, 2.6], -0.02, 50]],
      act: (t, tt, sh) => { night(t, []); d.tanks.forEach((x) => { x.position.x += 4 + (t - sh.a) * 4.5; x.position.y = Math.abs(Math.sin(t * 14 + x.position.z)) * 0.03; }); OV.badge = { t0: w1Ir + 0.2, txt: 'ഇറാഖ് → കുവൈറ്റ്', sub: '2 AUG 1990' }; } }),
    DE({ a: w1Ot - 0.1, b: w1Ba - 0.1, night: true, war: true, keys: [[0, [0, 6, 18], [0, 6, -100], 0.03, 56], [0.4, [0, 6.4, 17], [0, 6, -100], 0.01, 54], [2, [0, 6.8, 16], [0, 6, -100], -0.01, 52]],
      act: (t, tt, sh) => { night(t, []); d.setCity(1 - ezo(span(t, w(1, 'ഇല്ലാതായി') - 0.2, 1.0))); d.setFlash(t, true); } }),
    DE({ a: w1Ba - 0.1, b: L(2), night: true, keys: [[0, [1.6, 1.6, 9.2], [1.6, 1.5, 3], -0.03, 46], [0.35, [1.6, 1.6, 8.8], [1.6, 1.5, 3], -0.01, 46], [2.4, [1.6, 1.6, 8.4], [1.6, 1.55, 3], 0.02, 44]],
      act: (t) => { night(t, d.crowd, 'sad'); OV.chips = { items: [['ബാങ്ക്', w1Ba], ['ശമ്പളം', w1Sh], ['വിമാനം', w1Vi]] }; } }),
    // ---- 3. WHO: Mathunny Mathews. 1956 by ship. Toyota manager. Retired a year before.
    RO({ a: L(2), b: w2Am - 0.1, keys: [[0, [0.6, 1.6, 3.2], [-0.6, 1.55, -0.4], 0.04, 42], [0.35, [0.5, 1.6, 2.9], [-0.6, 1.57, -0.4], 0.01, 40], [2, [0.4, 1.6, 2.7], [-0.6, 1.6, -0.4], -0.02, 38]],
      act: (t) => { roomCast(t, 'brief'); OV.tag = { t0: L(2) + 0.1, txt: 'മാത്തുണ്ണി മാത്യൂസ്', sub: '' }; } }),
    LA({ a: w2Am - 0.1, b: w2To - 0.1, keys: [[0, [6.6, 2.5, -9.4], [4.2, 2.3, -13.8], 0.05, 46], [0.35, [6.2, 2.55, -9.8], [4.2, 2.3, -13.8], 0.02, 46], [2, [5.6, 2.7, -10.4], [4.0, 2.3, -13.8], -0.02, 48]],
      act: (t) => { const Ln = S.launch; pose(Ln.sunny, { expr: 'beam', R: 'hold', propR: 'suitcase', L: 'wave', look: 0.4 }, t); Ln.mates.forEach((x, i) => pose(x, { expr: 'smile', R: 'holdUp', propR: 'bundle', L: 'hang', look: -0.3 }, t)); OV.badge = { t0: w2Am, txt: '1956', sub: 'കപ്പലിൽ കുവൈറ്റിലേക്ക്' }; } }),
    RO({ a: w2To - 0.1, b: w2Va - 0.1, keys: [[0, [-2.2, 2.2, 6.2], [1.4, 1.6, -1.6], 0.03, 52], [0.4, [-2.0, 2.3, 5.8], [1.4, 1.6, -1.6], 0.01, 52], [2, [-1.8, 2.4, 5.4], [1.4, 1.7, -1.6], -0.02, 50]],
      act: (t) => { roomCast(t, 'keys'); OV.badge = { t0: w2To, txt: 'ടൊയോട്ട മാനേജർ', sub: 'AL-SAYER · TOYOTA, KUWAIT' }; } }),
    RO({ a: w2Va - 0.1, b: L(3), keys: [[0, [0.4, 1.6, 3.4], [-0.6, 1.5, -0.4], -0.03, 46], [0.35, [0.3, 1.6, 3.1], [-0.6, 1.52, -0.4], -0.01, 44], [2, [0.2, 1.6, 2.9], [-0.6, 1.55, -0.4], 0.02, 42]],
      act: (t) => { roomCast(t, 'wave'); OV.badge = { t0: w(2, 'റിട്ടയർ'), txt: 'റിട്ടയേർഡ് · 1989', sub: '' }; } }),
    // ---- 4. MOCKERY: a retired car manager vs Saddam?
    ST({ a: L(3), b: w3Sa - 0.1, keys: [[0, [1.0, 1.7, 0.9], [-1.8, 1.5, -4], 0.04, 52], [0.35, [0.7, 1.75, 1.3], [-1.8, 1.55, -4], 0.02, 54], [2.1, [0.5, 1.8, 1.6], [-1.8, 1.6, -4], -0.01, 54]],
      act: (t) => { laughCrowd(t); if (t > w3Re) OV.bubble = { t0: w3Re, txt: '"റിട്ടയർ ചെയ്ത കാർ മാനേജർ?"', x: 0.5, y: 0.62 }; } }),
    DE({ a: w3Sa - 0.1, b: L(4), night: true, shake: w3Sa + 0.1, keys: [[0, [-2.2, 0.6, 8.6], [-5.6, 3.0, -1], 0.05, 54], [0.35, [-2.3, 0.6, 8.3], [-5.6, 3.1, -1], 0.02, 52], [2, [-2.4, 0.6, 8.0], [-5.6, 3.2, -1], -0.02, 50]],
      act: (t) => { night(t, []); pose(d.saddam, { expr: 'angry', R: 'point', L: 'hip', look: 1, talk: Math.abs(Math.sin(t * 10)) * 0.5 }, t); pose(d.sunny, { expr: 'nervous', R: 'hold', propR: 'briefcase', L: 'hang', look: -1 }, t); OV.badge = { t0: w3Sa + 0.1, txt: 'സണ്ണി vs സദ്ദാം?', sub: '' }; } }),
    // ---- 5. HIS OWN RISK: phones dead, gunfire, he heads for Baghdad anyway
    RO({ a: L(4), b: w4Ch - 0.1, keys: [[0, [0.6, 1.6, 3.0], [-0.6, 1.55, -0.4], 0.04, 42], [0.35, [0.5, 1.6, 2.7], [-0.6, 1.57, -0.4], 0.01, 40], [2, [0.4, 1.6, 2.5], [-0.6, 1.6, -0.4], -0.02, 38]],
      act: (t) => { r.setMode('night'); pose(r.sunny, { expr: t > w(4, 'കട്ടായി') ? 'shock' : 'think', R: 'holdUp', propR: 'phone', L: 'hang', look: 0.3 }, t); OV.nope = { t0: w(4, 'കട്ടായി'), kind: 'phone', txt: 'ലൈൻ കട്ട്' }; } }),
    DE({ a: w4Ch - 0.1, b: w4Pa - 0.1, night: true, shake: w4Ch + 0.2, keys: [[0, [1.6, 1.4, 10], [0, 3, -60], 0.04, 52], [0.35, [1.6, 1.5, 9.6], [0, 3.2, -60], 0.02, 52], [2, [1.6, 1.6, 9.2], [0, 3.4, -60], -0.02, 52]],
      act: (t) => { night(t, d.crowd, 'duck'); d.setFlash(t * 1.6, true); } }),
    RO({ a: w4Pa - 0.1, b: w4Sw - 0.1, keys: [[0, [-0.5, 1.5, 3.4], [-0.6, 1.55, -0.4], -0.03, 46], [0.35, [-0.5, 1.52, 3.0], [-0.6, 1.57, -0.4], -0.01, 42], [2.4, [-0.5, 1.55, 2.5], [-0.6, 1.6, -0.4], 0.02, 38]],
      act: (t) => { r.setMode('night'); pose(r.sunny, { expr: t > w(4, 'സണ്ണി') ? 'angry' : 'think', R: 'holdUp', propR: 'briefcase', L: t > w(4, 'തയ്യാറായില്ല') ? 'point' : 'chin', look: 0 }, t); } }),
    DE({ a: w4Sw - 0.1, b: w4Ba - 0.1, night: true, keys: [[0, [6, 1.2, 14], [-2, 1.2, 8], 0.03, 50], [0.35, [6, 1.25, 13.6], [-1, 1.2, 8], 0.01, 50], [2, [6, 1.3, 13.2], [2, 1.2, 8], -0.02, 50]],
      act: (t, tt, sh) => { night(t, []); d.setFlash(t, true); d.car.position.x = -10 + (t - sh.a) * 6; d.car.userData.beam.material.opacity = 0.18; } }),
    DE({ a: w4Ba - 0.1, b: L(5), night: true, keys: [[0, [2.4, 1.8, 17], [0, 2.4, 10], 0.03, 50], [0.35, [2.2, 1.85, 16.6], [0, 2.4, 10], 0.01, 50], [2, [2.0, 1.9, 16.2], [0, 2.4, 10], -0.02, 50]],
      act: (t, tt, sh) => { night(t, []); sign(1, 0); d.car.position.x = -9 + (t - sh.a) * 7; d.car.userData.beam.material.opacity = 0.18; } }),
    // ---- 6. THE DEAL: Vedi and friends, the ambassador, Iraqi bus owners
    RO({ a: L(5), b: w5Ko - 0.1, keys: [[0, [-1.0, 1.6, 3.4], [-1.3, 1.5, -0.6], 0.04, 46], [0.35, [-1.0, 1.6, 3.1], [-1.3, 1.52, -0.6], 0.01, 44], [2, [-1.0, 1.6, 2.9], [-1.3, 1.55, -0.6], -0.02, 42]],
      act: (t) => { r.setMode('embassy'); pose(r.sunny, { expr: 'smile', R: 'hold', propR: 'briefcase', L: 'hip', look: -1 }, t); pose(r.vedi, { expr: 'beam', R: 'wave', L: 'hip', look: 1 }, t); OV.tag = { t0: w5Ha, txt: 'ഹർഭജൻ സിംഗ് വേദി', sub: '' }; } }),
    RO({ a: w5Ko - 0.1, b: w5In - 0.1, keys: [[0, [0, 2.2, 6.4], [-1, 1.5, -1], 0.03, 52], [0.4, [0, 2.3, 6.0], [-1, 1.55, -1], 0.01, 52], [2, [0, 2.4, 5.8], [-1, 1.6, -1], -0.02, 50]],
      act: (t) => { r.setMode('embassy'); pose(r.sunny, { expr: 'smile', R: 'hold', propR: 'briefcase', L: 'hip', look: -1 }, t); pose(r.vedi, { expr: 'beam', R: 'thumb', L: 'hip', look: 1 }, t); r.friends.forEach((x, i) => pose(x, { expr: 'beam', R: 'up', L: 'hip', look: i === 2 ? -1 : 1, hop: hopAt(t, 7, 0.06, i) }, t)); } }),
    RO({ a: w5In - 0.1, b: w5Ir - 0.1, keys: [[0, [0.6, 1.9, 2.6], [0, 1.7, -3.5], 0.03, 46], [0.35, [0.5, 1.9, 2.3], [0, 1.7, -3.5], 0.01, 44], [2, [0.4, 1.9, 2.1], [0, 1.72, -3.5], -0.02, 42]],
      act: (t) => { r.setMode('embassy'); pose(r.amb, { expr: 'think', R: 'chin', L: 'hip', look: 0 }, t); pose(r.sunny, { expr: 'smile', R: 'point', L: 'hip', look: 0 }, t); pose(r.vedi, { expr: 'smile', R: 'hold', L: 'hip', look: 1 }, t); OV.tag = { t0: w(5, 'അംബാസഡറെ'), txt: 'ഇന്ത്യൻ അംബാസഡർ', sub: 'ബാഗ്ദാദ്' }; } }),
    RO({ a: w5Ir - 0.1, b: w5De - 0.1, keys: [[0, [0.4, 1.6, 2.6], [0.2, 1.55, -0.6], -0.03, 44], [0.35, [0.3, 1.6, 2.4], [0.2, 1.57, -0.6], -0.01, 42], [2, [0.2, 1.6, 2.2], [0.2, 1.6, -0.6], 0.02, 40]],
      act: (t) => { r.setMode('embassy'); at(r.sunny, -0.5, 0, -0.6); pose(r.sunny, { expr: 'beam', R: 'out', L: 'hip', look: 1 }, t); pose(r.driver, { expr: 'smile', R: 'out', L: 'holdUp', propL: 'keys', look: -1 }, t); OV.tag = { t0: w5Ir, txt: 'ഇറാഖി ബസ്സുടമകൾ', sub: '' }; } }),
    RO({ a: w5De - 0.1, b: L(6), shake: w5De + 0.15, keys: [[0, [0, 1.9, 5.2], [0, 1.5, -1], 0.03, 50], [0.35, [0, 1.95, 4.9], [0, 1.52, -1], 0.01, 50], [2, [0, 2.0, 4.7], [0, 1.55, -1], -0.02, 50]],
      act: (t) => { r.setMode('embassy'); at(r.sunny, -0.5, 0, -0.6); pose(r.sunny, { expr: 'laugh', R: 'out', L: 'up', look: 1 }, t); pose(r.driver, { expr: 'beam', R: 'out', L: 'thumb', look: -1 }, t); pose(r.vedi, { expr: 'beam', R: 'up', L: 'up', look: 1, hop: hopAt(t, 8, 0.06) }, t); pose(r.amb, { expr: 'smile', R: 'thumb', L: 'hip', look: 0 }, t);
        OV.stamp = { t0: w5De + 0.1, txt: 'ഡീൽ ഉറപ്പിച്ചു', sub: 'DEAL DONE' }; } }),
    // ---- 7. THE CONVOY: Basra, Baghdad, the desert, Amman; 1000+ km
    DE({ a: L(6), b: w6Bs - 0.1, keys: [[0, [4, 2.2, 20], [-4, 1.6, 8], 0.03, 50], [0.35, [4, 2.3, 19.6], [-3, 1.6, 8], 0.01, 50], [2, [4, 2.4, 19.2], [0, 1.6, 8], -0.02, 50]],
      act: (t, tt, sh) => { convoy(t, sh.a, 7, -2); pose(d.sunny, { expr: 'beam', R: 'wave', L: 'hip', look: 1 }, t); at(d.sunny, 1.5, 0, 11.6); } }),
    DE({ a: w6Bs - 0.1, b: w6Bg - 0.1, keys: [[0, [0, 2.8, 17.4], [0, 2.7, 10], 0.03, 48], [0.3, [0, 2.8, 17.2], [0, 2.7, 10], 0.01, 48], [1, [0, 2.8, 17], [0, 2.7, 10], 0, 48]],
      act: (t, tt, sh) => { convoy(t, sh.a - 1.2, 9, -6); sign(0, 2 - (t - sh.a) * 3); } }),
    DE({ a: w6Bg - 0.1, b: w6Pi - 0.1, keys: [[0, [0, 2.8, 17.4], [0, 2.7, 10], -0.03, 48], [0.3, [0, 2.8, 17.2], [0, 2.7, 10], -0.01, 48], [1, [0, 2.8, 17], [0, 2.7, 10], 0, 48]],
      act: (t, tt, sh) => { convoy(t, sh.a - 0.6, 9, -6); sign(1, 2 - (t - sh.a) * 3); } }),
    DE({ a: w6Pi - 0.1, b: w6Am - 0.1, keys: [[0, [-30, 22, 46], [0, 0, 8], 0.03, 50], [0.4, [-26, 21, 44], [4, 0, 8], 0.01, 50], [2.2, [-20, 20, 42], [10, 0, 8], -0.01, 50]],
      act: (t, tt, sh) => { convoy(t, sh.a, 7, 4); } }),
    DE({ a: w6Am - 0.1, b: w6Ay - 0.1, keys: [[0, [0, 2.8, 17.4], [0, 2.7, 10], 0.03, 48], [0.3, [0, 2.8, 17.2], [0, 2.7, 10], 0.01, 48], [1, [0, 2.8, 17], [0, 2.7, 10], 0, 48]],
      act: (t, tt, sh) => { convoy(t, sh.a - 0.9, 9, -6); sign(2, 2 - (t - sh.a) * 3); } }),
    DE({ a: w6Ay - 0.1, b: L(7), keys: [[0, [24, 6, 30], [0, 1, 8], 0.03, 52], [0.4, [22, 6.4, 29], [2, 1, 8], 0.01, 52], [2, [20, 7, 28], [4, 1, 8], -0.02, 52]],
      act: (t, tt, sh) => { convoy(t, sh.a, 7, 10); OV.big = { t0: w6Ay, txt: '1000+ km', sub: 'ബസ്ര → ബാഗ്ദാദ് → അമ്മാൻ' }; } }),
    // ---- 8. THE AIRLIFT: Air India waiting; two months; 488 flights; a record
    AI({ a: L(7), b: w7Re - 0.1, keys: [[0, [24, 2.2, 20], [10, 3.4, -4], 0.03, 54], [0.4, [24.5, 2.6, 20.5], [10, 3.6, -4], 0.01, 54], [3, [25, 3.4, 21], [10, 3.8, -4], -0.02, 56]],
      act: (t, tt, sh) => { a.q.forEach((x, i) => { const z = x.base[2] - (t - sh.a) * 1.0; at(x, x.base[0], 0, z); pose(x, { expr: ['beam', 'smile', 'proud'][i % 3], R: 'hold', propR: i % 2 ? 'suitcase' : 'bundle', L: 'hang', walk: (t * 1.4 + i * 0.3) % 1, look: 0 }, t); }); OV.tag = { t0: w(7, 'എയർ'), txt: 'എയർ ഇന്ത്യ ✈', sub: 'അമ്മാൻ' }; } }),
    AI({ a: w7Re - 0.1, b: w7Na - 0.1, keys: [[0, [12.6, 1.8, 10], [12, 3, -4], 0.03, 50], [0.35, [12.6, 1.9, 9.6], [12, 3.2, -4], 0.01, 50], [2, [12.6, 2.0, 9.2], [12, 3.4, -4], -0.02, 50]],
      act: (t, tt, sh) => { a.q.forEach((x, i) => { const k = ((t - sh.a) * 0.4 - (i % 9) * 0.1); const u = clamp(k, 0, 1); x.c.visible = k > 0 && k < 1.1; at(x, 12 + (i % 2) * 0.3, lerp(0, 4.6, Math.max(0, (u - 0.3) / 0.7)), lerp(1.5, -6.8, u)); pose(x, { expr: 'beam', R: 'wave', L: 'hold', propL: 'bundle', walk: (t * 1.4 + i * 0.3) % 1, look: 0 }, t); if (!(k > 0 && k < 1.1)) x.c.visible = false; });
        OV.big = { t0: w7Re, txt: '2 മാസം', sub: '13 AUG – 11 OCT 1990' }; } }),
    AI({ a: w7Na - 0.1, b: w7Gi - 0.1, keys: [[0, [36, 6, 26], [6, 5, -8], 0.03, 54], [0.4, [34, 6.4, 25], [6, 5.2, -8], 0.01, 54], [2, [32, 6.8, 24], [6, 5.4, -8], -0.02, 54]],
      act: (t) => { OV.big = { t0: w7Na, txt: '488', sub: 'ഫ്ലൈറ്റുകൾ', count: true }; OV.planes = { t0: w7Na }; } }),
    AI({ a: w7Gi - 0.1, b: L(8), keys: [[0, [20, 2.2, 18], [10, 4, -4], -0.03, 54], [0.4, [20.5, 2.4, 18.5], [10, 4.2, -4], -0.01, 54], [2, [21, 2.6, 19], [10, 4.4, -4], 0.02, 54]],
      act: (t) => { OV.seal = { t0: w7Gi }; } }),
    // ---- 9. COMPARISON: a whole town on buses, across a desert, onto planes, home
    DE({ a: L(8), b: w8Ma - 0.1, keys: [[0, [4, 2.2, 20], [-2, 1.6, 8], 0.03, 50], [0.35, [4, 2.3, 19.6], [0, 1.6, 8], 0.01, 50], [2, [4, 2.4, 19.2], [2, 1.6, 8], -0.02, 50]],
      act: (t, tt, sh) => { convoy(t, sh.a, 6, -4); OV.town = { t0: L(8) + 0.1 }; } }),
    DE({ a: w8Ma - 0.1, b: w8Vi - 0.1, keys: [[0, [-24, 18, 40], [6, 0, 8], 0.03, 50], [0.4, [-20, 17, 38], [8, 0, 8], 0.01, 50], [2, [-16, 16, 36], [10, 0, 8], -0.01, 50]],
      act: (t, tt, sh) => { convoy(t, sh.a, 7, 6); OV.town = { t0: L(8) + 0.1 }; } }),
    AI({ a: w8Vi - 0.1, b: L(9), keys: [[0, [24, 2.2, 20], [10, 3.4, -4], 0.03, 54], [0.4, [24.5, 2.6, 20.5], [10, 3.6, -4], 0.01, 54], [3, [25, 3.4, 21], [10, 3.8, -4], -0.02, 56]],
      act: (t, tt, sh) => { a.q.forEach((x, i) => { const z = x.base[2] - (t - sh.a + 1) * 1.0; at(x, x.base[0], 0, z); pose(x, { expr: 'beam', R: 'hold', propR: i % 2 ? 'suitcase' : 'bundle', L: 'wave', walk: (t * 1.4 + i * 0.3) % 1, look: 0 }, t); }); OV.town = { t0: L(8) + 0.1 }; } }),
    // ---- 10. WAIT...? The film. Its hero is fictional: Sunny + Vedi.
    CI({ a: L(9), b: w9Ee - 0.1, keys: [[0, [0, 2.6, 5], [0, 3.4, -8], 0.03, 54], [0.4, [0, 2.6, 4.6], [0, 3.4, -8], 0.01, 54], [2, [0, 2.6, 4.2], [0, 3.4, -8], -0.01, 54]],
      act: (t) => { screen('dark', t); } }),
    CI({ a: w9Ee - 0.1, b: w9Ai - 0.1, keys: [[0, [0, 2.6, 4.2], [0, 3.6, -8], -0.03, 52], [0.35, [0, 2.6, 3.8], [0, 3.6, -8], -0.01, 52], [2, [0, 2.6, 3.4], [0, 3.6, -8], 0.01, 50]],
      act: (t, tt, sh) => { screen('leader', t, clamp((t - sh.a) / (w9Ai - sh.a), 0, 0.99)); } }),
    CI({ a: w9Ai - 0.1, b: w9Ak - 0.1, flash: w9Ai - 0.1, keys: [[0, [0, 2.8, 2.6], [0, 4.4, -8.7], 0.03, 52], [0.35, [0, 2.9, 2.2], [0, 4.5, -8.7], 0.01, 50], [2, [0, 3.0, 1.8], [0, 4.6, -8.7], -0.01, 48]],
      act: (t, tt, sh) => { screen('title', t, (t - sh.a)); } }),
    CI({ a: w9Ak - 0.1, b: w9Pa - 0.1, keys: [[0, [0.4, 1.7, -2.2], [0, 1.9, -6.4], 0.04, 50], [0.35, [0.3, 1.7, -2.5], [0, 1.9, -6.4], 0.02, 48], [2, [0.2, 1.7, -2.8], [0, 1.95, -6.4], -0.02, 46]],
      act: (t) => { screen('hero', t); c.spot.material.opacity = 0.14; c.spotL.intensity = 40; pose(c.star, { expr: 'smug', R: 'thumb', L: 'hip', look: 0 }, t); OV.tag = { t0: w(9, 'രഞ്ജിത്'), txt: 'രഞ്ജിത് കത്യാൽ', sub: 'സിനിമയിലെ കഥാപാത്രം' }; } }),
    CI({ a: w9Pa - 0.1, b: w9Su - 0.1, shake: w(9, 'സാങ്കല്പികമാണ്') + 0.15, keys: [[0, [0, 1.7, -2.6], [0, 1.9, -6.4], -0.03, 46], [0.35, [0, 1.7, -2.8], [0, 1.9, -6.4], -0.01, 44], [2, [0, 1.7, -3.0], [0, 1.95, -6.4], 0.02, 42]],
      act: (t) => { screen('hero', t); c.spot.material.opacity = 0.14; c.spotL.intensity = 40; pose(c.star, { expr: t > w(9, 'സാങ്കല്പികമാണ്') ? 'shock' : 'smug', R: 'thumb', L: 'hip', look: 0 }, t); OV.stamp = { t0: w(9, 'സാങ്കല്പികമാണ്'), txt: 'സാങ്കല്പികം', sub: 'FICTIONAL' }; } }),
    CI({ a: w9Su - 0.1, b: L(10), flash: w9Su - 0.1, keys: [[0, [0, 1.8, -1.0], [0, 2.0, -6.4], 0.03, 54], [0.35, [0, 1.8, -1.3], [0, 2.0, -6.4], 0.01, 54], [2, [0, 1.8, -1.5], [0, 2.05, -6.4], -0.02, 52]],
      act: (t, tt, sh) => { screen('true', t); c.spot.material.opacity = 0.14; c.spotL.intensity = 40; const k = ezo(span(t, sh.a, 0.4)); at(c.sunny, lerp(0, -1.0, k), 0, -6.2); at(c.vedi, lerp(0, 1.0, k), 0, -6.2);
        pose(c.sunny, { expr: 'beam', R: 'wave', L: 'hold', propL: 'briefcase', look: 0.3 }, t); pose(c.vedi, { expr: 'beam', R: 'thumb', L: 'hip', look: -0.3 }, t); OV.badge = { t0: w9Su + 0.1, txt: 'സണ്ണി + വേദി', sub: '= രഞ്ജിത് കത്യാൽ' }; } }),
    // ---- 11. WHAT IF the buses never left? Stuck with no money or food; January: the bombs
    DE({ a: L(10), b: w10Pa - 0.1, dream: true, keys: [[0, [6, 2.4, 20], [-2, 1.6, 8], 0.03, 52], [0.4, [6, 2.5, 19.6], [-2, 1.6, 8], 0.01, 52], [2, [6, 2.6, 19.2], [-2, 1.65, 8], -0.01, 52]],
      act: (t) => { d.setMode('dusk'); d.buses.forEach((b, i) => { b.position.x = 4 - i * 7; }); d.crowd.forEach((x, i) => at(x, x.base[0] - 2, 0, x.base[2] + 2)); scared(t, d.crowd, 'sad'); OV.nope = { t0: L(10) + 0.4, kind: 'bus', txt: 'ബസ്സുകൾ പോയില്ലെങ്കിൽ?' }; } }),
    DE({ a: w10Pa - 0.1, b: w10La - 0.1, dream: true, keys: [[0, [1.6, 1.6, 9.2], [1.6, 1.5, 3], 0.03, 46], [0.35, [1.6, 1.6, 8.8], [1.6, 1.5, 3], 0.01, 46], [2, [1.6, 1.6, 8.4], [1.6, 1.55, 3], -0.02, 44]],
      act: (t) => { d.setMode('dusk'); d.tents.forEach((x) => { x.visible = true; }); scared(t, d.crowd, 'sad'); OV.chips = { items: [['പണം', w10Pa], ['ഭക്ഷണം', w(10, 'ഭക്ഷണവുമില്ലാതെ')]] }; } }),
    DE({ a: w10La - 0.1, b: w10Ja - 0.1, dream: true, keys: [[0, [2, 6, 16], [0, 0, -2], 0.03, 54], [0.4, [2, 7, 18], [0, 0, -2], 0.01, 54], [2.6, [2, 9, 21], [0, 0, -3], -0.01, 56]],
      act: (t) => { d.setMode('dusk'); d.tents.forEach((x) => { x.visible = true; }); scared(t, d.crowd, 'sad'); scared(t, d.camp, 'sad'); OV.big = { t0: w10La, txt: 'ലക്ഷക്കണക്കിനു പേർ', sub: 'യുദ്ധഭൂമിയിൽ കുടുങ്ങി' }; } }),
    DE({ a: w10Ja - 0.1, b: L(11), dream: true, shake: w10Bo + 0.1, keys: [[0, [1.6, 1.8, 12], [0, 4, -60], 0.03, 52], [0.35, [1.6, 1.8, 11.6], [0, 4.2, -60], 0.01, 52], [2, [1.6, 1.8, 11.2], [0, 4.4, -60], -0.02, 52]],
      act: (t) => { night(t, d.crowd, 'duck'); d.tents.forEach((x) => { x.visible = true; }); scared(t, d.camp, 'duck'); d.setFlash(t * 1.4, t > w10Bo - 0.2); OV.badge = { t0: w10Ja, txt: 'ജനുവരി 1991', sub: 'GULF WAR BOMBING BEGINS' }; } }),
    // ---- 12. CALLBACK: one hero in the film; in real life, Sunny and a lot of ordinary people
    CI({ a: L(11), b: w11Sh - 0.1, keys: [[0, [0, 2.0, 2], [0, 1.9, -6.4], 0.03, 46], [0.4, [0, 2.0, 1.4], [0, 1.9, -6.4], 0.01, 44], [2, [0, 2.0, 0.8], [0, 1.9, -6.4], -0.01, 42]],
      act: (t, tt, sh) => { screen('dark', t); const f = 1 - span(t, w11Sh - 0.6, 0.5); c.spot.material.opacity = 0.16 * f; c.spotL.intensity = 50 * f; pose(c.star, { expr: 'smug', R: 'thumb', L: 'hip', look: 0 }, t); OV.badge = { t0: w(11, 'ഹീറോ'), txt: 'ഹീറോ: 1', sub: '' }; } }),
    AI({ a: w11Sh - 0.1, b: w11Or - 0.1, keys: [[0, [11.8, 1.7, 9.6], [11.2, 1.6, 3.2], 0.03, 46], [0.35, [11.8, 1.7, 9.2], [11.2, 1.62, 3.2], 0.01, 44], [2, [11.8, 1.7, 8.8], [11.2, 1.65, 3.2], -0.02, 42]],
      act: (t) => { a.q.forEach((x, i) => pose(x, { expr: ['beam', 'smile', 'proud'][i % 3], R: 'hold', propR: i % 2 ? 'suitcase' : 'bundle', L: i % 3 ? 'wave' : 'hang', look: 0, hop: hopAt(t, 6, 0.04, i) }, t)); pose(a.sunny, { expr: 'beam', R: 'wave', L: 'hold', propL: 'briefcase', look: 0 }, t); OV.tag = { t0: w11To, txt: "'ടൊയോട്ട സണ്ണി'", sub: '' }; } }),
    AI({ a: w11Or - 0.1, b: 1e9, keys: [[0, [14, 2.2, 14], [11.2, 1.6, 3.2], 0.02, 50], [0.4, [15, 3.4, 17], [10, 2.4, -2], 0.01, 52], [3.5, [22, 9, 26], [8, 3, -6], -0.01, 54]],
      act: (t) => { a.q.forEach((x, i) => pose(x, { expr: ['beam', 'smile', 'proud'][i % 3], R: 'wave', L: 'up', look: 0, hop: hopAt(t, 6, 0.05, i) }, t)); pose(a.sunny, { expr: 'beam', R: 'wave', L: 'up', look: 0 }, t); OV.big = { t0: w(11, 'സാധാരണക്കാരു'), txt: '1,70,000', sub: 'സാധാരണക്കാർ' }; } }),
  ];
}
function tidy(list) {
  const n = list.length; for (let i = 1; i < n; i++) { const lo = list[i - 1].a + 0.6, hi = i + 1 < n ? list[i + 1].a - 0.6 : 1e9; if (list[i].a < lo) list[i].a = Math.min(lo, Math.max(list[i - 1].a + 0.3, (list[i - 1].a + hi) / 2)); }
  for (let i = 0; i < n; i++) list[i].b = i + 1 < n ? list[i + 1].a : list[i].b;
  const out = []; list.forEach((x) => { const d = x.b - x.a; if (d <= 2.4 || x.b > 1e8) { out.push(x); return; } const k = Math.ceil(d / 2.1), step = d / k;
    for (let j = 0; j < k; j++) { if (!j) { out.push({ ...x, b: x.a + step }); continue; } const side = j % 2 ? 1 : -1, push = 0.2 + 0.08 * j, far = Math.hypot(...x.keys[0][1].map((v, q) => v - x.keys[0][2][q])) > 20 ? 6 : 1;
      const keys = x.keys.map(([t, p, l, r = 0, f = 52]) => [t, p.map((v, q) => v + (l[q] - v) * push + (q === 0 ? side * 0.25 * far : q === 1 ? 0.1 * far : 0)), l, -r + side * 0.03, f - 4]);
      out.push({ ...x, a: x.a + j * step, b: j === k - 1 ? x.b : x.a + (j + 1) * step, keys, flash: null }); } });
  return out;
}

// ------------------------------------------------------------------ rendering
const GRADE = { desert: { hazeAmt: 0.25, haze: 0xf0dcb0, sat: 1.1, contrast: 0.06, lift: 0.015, warm: 0.04, vignette: 0.3 }, night: { hazeAmt: 0.15, haze: 0x1a1a30, sat: 1.05, contrast: 0.08, lift: 0.02, warm: -0.01, vignette: 0.45 },
  air: { hazeAmt: 0.2, haze: 0xdfe4ea, sat: 1.05, contrast: 0.06, lift: 0.015, warm: 0.0, vignette: 0.3 }, room: { hazeAmt: 0.1, haze: 0xf0e4c8, sat: 1.1, contrast: 0.06, lift: 0.015, warm: 0.03, vignette: 0.35 },
  cinema: { hazeAmt: 0.1, haze: 0x120a10, sat: 1.1, contrast: 0.08, lift: 0.03, warm: 0.02, vignette: 0.5 }, launch: { hazeAmt: 0.2, haze: 0x1a2040, sat: 1.05, contrast: 0.08, lift: 0.01, warm: -0.01, vignette: 0.45 },
  street: { hazeAmt: 0.3, haze: 0xdfe9f2, sat: 1.1, contrast: 0.06, lift: 0.015, warm: 0.02, vignette: 0.3 } };
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
function overlays(g, t, alpha) {
  if (OV.badge) badge(g, t, OV.badge, alpha);
  if (OV.bubble) bubble(g, t, OV.bubble, alpha);
  if (OV.stamp) stamp(g, t, OV.stamp, alpha);
  if (OV.tag) tag(g, t, OV.tag, alpha);
  if (OV.big) bigNum(g, t, OV.big, alpha);
  if (OV.nope) nope(g, t, OV.nope, alpha);
  if (OV.cal) calendar(g, t, OV.cal.t0, alpha);
  if (OV.chips) chips(g, t, OV.chips.items, alpha);
  if (OV.planes) planes(g, t, OV.planes.t0, alpha);
  if (OV.seal) seal(g, t, OV.seal.t0, alpha);
  if (OV.town) town(g, t, OV.town.t0, alpha);
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
  let txt = b.txt; if (b.count) { const n = parseInt(b.txt.replace(/,/g, ''), 10), u = ezo(span(t, b.t0, 0.9)), v = Math.round(n * u); txt = n >= 100000 ? v.toLocaleString('en-IN') : String(v); }
  text(g, txt, 0, 0, { font: /^[0-9₹,+ a-zA-Z]+$/.test(b.txt) ? "'Oswald'" : ML, weight: 800, size: /^[0-9₹,+ a-zA-Z]+$/.test(b.txt) ? 190 : 120, color: '#f6d24a', stroke: '#2a1c17', strokeWidth: 24, maxWidth: 1000 });
  text(g, b.sub, 0, 150, { size: 64, color: '#ffffff', stroke: '#2a1c17', strokeWidth: 14, maxWidth: 980 }); g.restore();
}
function icon(g, kind) { // simple drawn icons (no emoji fonts in headless chrome)
  g.lineWidth = 9; g.strokeStyle = '#2a1c17'; g.lineJoin = 'round';
  if (kind === 'army') { g.fillStyle = '#5a6a3a'; g.beginPath(); g.moveTo(-120, 40); g.quadraticCurveTo(-120, -110, 0, -110); g.quadraticCurveTo(120, -110, 120, 40); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#4a5a30'; g.beginPath(); g.roundRect(-150, 30, 300, 36, 14); g.fill(); g.stroke(); g.fillStyle = '#3f4f28'; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(-60 + i * 40, -40 + (i % 2) * 20, 12, 0, 7); g.fill(); } }
  else if (kind === 'phone') { g.fillStyle = '#2a2a30'; g.beginPath(); g.roundRect(-60, -120, 120, 220, 26); g.fill(); g.stroke(); g.fillStyle = '#8ab0d0'; g.fillRect(-42, -96, 84, 140); g.strokeStyle = '#c8312c'; g.beginPath(); g.moveTo(80, -40); g.quadraticCurveTo(140, 0, 110, 60); g.moveTo(130, 70); g.quadraticCurveTo(170, 110, 150, 140); g.stroke(); }
  else if (kind === 'bus') { g.fillStyle = '#e8d8a8'; g.beginPath(); g.roundRect(-150, -80, 300, 140, 20); g.fill(); g.stroke(); g.fillStyle = '#3a5a7a'; for (let i = 0; i < 4; i++) g.fillRect(-130 + i * 66, -60, 52, 44); g.fillStyle = '#1a1a1e'; for (const x of [-90, 90]) { g.beginPath(); g.arc(x, 64, 28, 0, 7); g.fill(); } }
  else { g.fillStyle = '#1a1a1e'; g.beginPath(); g.rect(-110, -70, 220, 150); g.fill(); g.stroke(); g.fillStyle = '#f4f4f0'; for (let i = 0; i < 5; i++) { g.save(); g.translate(-110 + i * 50, -70); g.beginPath(); g.moveTo(0, 0); g.lineTo(30, 0); g.lineTo(10, -40); g.lineTo(-20, -40); g.closePath(); g.fill(); g.restore(); } }
}
function nope(g, t, b, alpha) { // a card with an icon that gets a big red cross
  const p = ezo(span(t, b.t0 - 0.25, 0.3)); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1420); g.scale(0.8 + 0.2 * p, 0.8 + 0.2 * p);
  g.fillStyle = 'rgba(244,236,214,.96)'; g.strokeStyle = '#2a1c17'; g.lineWidth = 9; g.beginPath(); g.roundRect(-380, -250, 760, 480, 34); g.fill(); g.stroke();
  g.save(); g.translate(0, -60); icon(g, b.kind); g.restore(); text(g, b.txt, 0, 150, { size: 76, color: '#2a1c17', maxWidth: 700 });
  const x = ezo(span(t, b.t0 + 0.05, 0.2)); if (x > 0) { g.strokeStyle = '#d0281e'; g.lineWidth = 34; g.lineCap = 'round'; g.beginPath(); g.moveTo(-240, -200); g.lineTo(-240 + 480 * x, -200 + 300 * x); g.stroke(); if (x > 0.5) { const y = (x - 0.5) * 2; g.beginPath(); g.moveTo(240, -200); g.lineTo(240 - 480 * y, -200 + 300 * y); g.stroke(); } }
  g.restore(); }
function calendar(g, t, t0, alpha) { // tear-off calendar: pages flip to 2 AUG 1990
  const p = span(t, t0, 0.6); if (p <= 0) return; g.save(); g.globalAlpha = alpha * Math.min(1, p * 4); g.translate(W / 2, 1380);
  g.fillStyle = '#f4f0e6'; g.strokeStyle = '#2a1c17'; g.lineWidth = 10; g.beginPath(); g.roundRect(-260, -260, 520, 520, 28); g.fill(); g.stroke(); g.fillStyle = '#c8312c'; g.beginPath(); g.roundRect(-260, -260, 520, 130, [28, 28, 0, 0]); g.fill(); g.stroke();
  const flip = Math.min(3, Math.floor(p * 4)), day = ['30', '31', '1', '2'][flip], mon = flip < 2 ? 'JUL' : 'AUG';
  text(g, `${mon} 1990`, 0, -195, { font: "'Oswald'", weight: 700, size: 76, color: '#fff' }); text(g, day, 0, 60, { font: "'Oswald'", weight: 700, size: 280, color: '#2a1c17' });
  if (p < 1) { const k = (p * 4) % 1; g.save(); g.translate(0, -130); g.scale(1, 1 - k); g.fillStyle = '#e8e2d4'; g.fillRect(-250, 0, 500, 380); g.restore(); }
  g.restore(); }
function chips(g, t, items, alpha) { // items that appear and get crossed out, one by one
  items.forEach(([txt, t0], i) => { const p = ezo(span(t, t0, 0.25)); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1180 + i * 230); g.rotate(i % 2 ? 0.03 : -0.03); g.scale(0.8 + 0.2 * p, 0.8 + 0.2 * p);
    g.fillStyle = '#f4ecd6'; g.strokeStyle = '#2a1c17'; g.lineWidth = 9; g.beginPath(); g.roundRect(-330, -85, 660, 170, 26); g.fill(); g.stroke(); text(g, txt, -40, 4, { size: 90, color: '#2a1c17' });
    const x = ezo(span(t, t0 + 0.25, 0.2)); if (x > 0) { g.strokeStyle = '#d0281e'; g.lineWidth = 22; g.lineCap = 'round'; g.beginPath(); g.moveTo(-260, 0); g.lineTo(-260 + 450 * x, 0); g.stroke(); text(g, '✘', 250, 4, { font: "'Oswald'", size: 120, color: '#d0281e' }); }
    g.restore(); }); }
function planes(g, t, t0, alpha) { // a grid of little planes ticking on
  const p = span(t, t0, 1.6); if (p <= 0) return; g.save(); g.globalAlpha = alpha; g.translate(W / 2, 1650); const n = 40, on = Math.floor(p * n);
  for (let i = 0; i < n; i++) { if (i >= on) break; const x = -420 + (i % 10) * 93, y = -90 + Math.floor(i / 10) * 60; g.save(); g.translate(x, y); g.fillStyle = '#ffffff'; g.strokeStyle = '#2a1c17'; g.lineWidth = 4;
    g.beginPath(); g.moveTo(-30, 0); g.lineTo(30, 0); g.lineTo(36, -4); g.lineTo(30, -8); g.lineTo(-24, -8); g.closePath(); g.fill(); g.stroke(); g.beginPath(); g.moveTo(-4, -4); g.lineTo(-14, 16); g.lineTo(2, 16); g.lineTo(10, -4); g.fill(); g.stroke(); g.fillStyle = '#c8312c'; g.fillRect(-30, -18, 8, 12); g.restore(); }
  g.restore(); }
function seal(g, t, t0, alpha) { // gold record seal
  const k = span(t, t0, 0.3); if (k <= 0) return; const sc = lerp(2, 1, ezo(k)); g.save(); g.globalAlpha = alpha * Math.min(1, k * 3); g.translate(W / 2, 1400); g.rotate(Math.sin(t * 2) * 0.04); g.scale(sc, sc);
  g.fillStyle = '#e8b93a'; g.strokeStyle = '#2a1c17'; g.lineWidth = 9; g.beginPath(); for (let i = 0; i < 48; i++) { const a = i / 48 * Math.PI * 2, r = i % 2 ? 250 : 275; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#f6d24a'; g.beginPath(); g.arc(0, 0, 210, 0, 7); g.fill(); g.stroke(); text(g, 'ഗിന്നസ്', 0, -70, { size: 80, color: '#5a3a10' }); text(g, 'റെക്കോർഡ്', 0, 20, { size: 72, color: '#5a3a10' }); text(g, 'LARGEST CIVILIAN AIRLIFT', 0, 110, { font: "'Oswald'", weight: 700, size: 34, color: '#5a3a10' });
  g.restore(); }
function town(g, t, t0, alpha) { // the comparison: a town -> buses -> desert -> plane -> home
  const p = span(t, t0, 0.3); if (p <= 0) return; g.save(); g.globalAlpha = alpha * ezo(p); g.translate(W / 2, 1560);
  g.fillStyle = 'rgba(244,236,214,.95)'; g.strokeStyle = '#2a1c17'; g.lineWidth = 8; g.beginPath(); g.roundRect(-480, -170, 960, 340, 30); g.fill(); g.stroke();
  const T0 = t0, steps = [T0, T0 + 1.2, T0 + 2.4, T0 + 3.3], xs = [-360, -120, 120, 360];
  const draw = [(q) => { for (let i = 0; i < 3; i++) { g.save(); g.translate(-30 + i * 30, -10 - (i % 2) * 14); g.fillStyle = ['#f4ecd6', '#e8d8a8', '#d8c8a0'][i]; g.fillRect(-26, -10, 52, 46); g.strokeRect(-26, -10, 52, 46); g.fillStyle = '#c8312c'; g.beginPath(); g.moveTo(-32, -10); g.lineTo(0, -40); g.lineTo(32, -10); g.closePath(); g.fill(); g.stroke(); g.restore(); } text(g, 'പട്ടണം', 0, 100, { size: 44, color: '#2a1c17' }); },
    (q) => { g.save(); g.scale(0.5, 0.5); icon(g, 'bus'); g.restore(); text(g, 'ബസ്സ്', 0, 100, { size: 44, color: '#2a1c17' }); },
    (q) => { g.fillStyle = '#e6be78'; g.beginPath(); g.moveTo(-70, 40); g.quadraticCurveTo(-30, -40, 10, 20); g.quadraticCurveTo(40, -20, 70, 40); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#f6d24a'; g.beginPath(); g.arc(30, -40, 20, 0, 7); g.fill(); g.stroke(); text(g, 'മരുഭൂമി', 0, 100, { size: 44, color: '#2a1c17' }); },
    (q) => { g.save(); g.scale(2.2, 2.2); g.fillStyle = '#fff'; g.lineWidth = 4; g.beginPath(); g.moveTo(-30, 0); g.lineTo(30, 0); g.lineTo(36, -4); g.lineTo(30, -8); g.lineTo(-24, -8); g.closePath(); g.fill(); g.stroke(); g.beginPath(); g.moveTo(-4, -4); g.lineTo(-14, 16); g.lineTo(2, 16); g.lineTo(10, -4); g.fill(); g.stroke(); g.fillStyle = '#c8312c'; g.fillRect(-30, -18, 8, 12); g.restore(); text(g, 'വീട്ടിലേക്ക്', 0, 100, { size: 44, color: '#2a1c17' }); }];
  steps.forEach((s0, i) => { const q = ezo(span(t, s0, 0.3)); if (q <= 0) return; g.save(); g.translate(xs[i], -20 - Math.sin(Math.min(1, (t - s0) / 0.3) * Math.PI) * 20); g.scale(q, q); draw[i](q); g.restore();
    if (i) { g.save(); g.globalAlpha *= q; g.strokeStyle = '#8a1e1e'; g.lineWidth = 8; g.beginPath(); g.moveTo(xs[i] - 150, -30); g.lineTo(xs[i] - 95, -30); g.lineTo(xs[i] - 110, -45); g.moveTo(xs[i] - 95, -30); g.lineTo(xs[i] - 110, -15); g.stroke(); g.restore(); } });
  g.restore(); }
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
export const hits = [];
export const extraHits = (timeline) => {
  const m = timeline.scenes.find((x) => x.id === 'main'), out = []; const s = { line: (i) => m.cues[i]?.text, cue: (i) => m.cues[i].start, cueEnd: (i) => m.cues[i].end };
  const sh = shots(s); sh.forEach((x, i) => { if (!i) return; const cut = sh[i - 1].set !== x.set; if (cut || i % 4 === 0) out.push({ t: m.start + x.a - 0.15, kind: 'whoosh', vol: cut ? 0.22 : 0.1 }); });
  const at2 = (i, n) => m.start + wt(s, i, n), add = (t, kind, vol) => out.push({ t, kind, vol });
  add(m.start + 0.2, 'boom', 0.35); for (let k = 0; k < 6; k++) add(m.start + 0.25 + k * 0.14, 'tick', 0.2); add(at2(0, 'യുദ്ധത്തിനു') + 0.3, 'boom', 0.3); add(at2(0, 'പട്ടാളമല്ല') + 0.05, 'hit', 0.4); add(at2(0, 'ഹീറോയുമല്ല') + 0.05, 'hit', 0.4); add(at2(0, 'ടൊയോട്ട'), 'chime', 0.4);
  add(at2(1, 'തൊണ്ണൂറ്'), 'tick', 0.3); add(at2(1, 'ഓഗസ്റ്റ്'), 'tick', 0.3); add(at2(1, 'രണ്ട്'), 'pop', 0.4); add(at2(1, 'ഇറാഖിന്റെ') + 0.4, 'boom', 0.45); add(at2(1, 'ഇല്ലാതായി'), 'thud', 0.5);
  for (const n of ['ബാങ്കില്ല', 'ശമ്പളമില്ല', 'വിമാനമില്ല']) { add(at2(1, n), 'pop', 0.35); add(at2(1, n) + 0.25, 'hit', 0.3); }
  add(m.start + s.cue(2) + 0.1, 'pop', 0.35); add(at2(2, 'അമ്പത്തിയാറിൽ'), 'horn', 0.3); add(at2(2, 'ടൊയോട്ടയുടെ'), 'coin', 0.35); add(at2(2, 'റിട്ടയർ'), 'chime', 0.3);
  add(at2(3, 'ചോദിച്ചു'), 'pop', 0.3); add(at2(3, 'സദ്ദാമിനോട്'), 'boom', 0.45);
  add(at2(4, 'കട്ടായി'), 'hit', 0.4); for (let k = 0; k < 5; k++) add(at2(4, 'ചുറ്റും') + 0.2 + k * 0.17, 'thud', 0.25); add(at2(4, 'തയ്യാറായില്ല'), 'hit', 0.35); add(at2(4, 'ബാഗ്ദാദിലേക്ക്'), 'whoosh', 0.3);
  add(at2(5, 'ഹർഭജൻ'), 'pop', 0.35); add(at2(5, 'അംബാസഡറെ'), 'pop', 0.3); add(at2(5, 'ഇറാഖി'), 'coin', 0.3); add(at2(5, 'ഡീൽ') + 0.1, 'boom', 0.45);
  add(at2(6, 'ബസ്സുകൾ'), 'horn', 0.3); for (const n of ['ബസ്ര', 'ബാഗ്ദാദ്', 'അമ്മാൻ']) add(at2(6, n), 'whoosh', 0.3); add(at2(6, 'ആയിരം'), 'pop', 0.4);
  add(at2(7, 'എയർ'), 'chime', 0.3); add(at2(7, 'രണ്ട്'), 'pop', 0.35); add(at2(7, 'നാനൂറ്റി'), 'boom', 0.4); for (let k = 0; k < 8; k++) add(at2(7, 'നാനൂറ്റി') + 0.1 + k * 0.18, 'tick', 0.2); add(at2(7, 'ഗിന്നസ്'), 'chime', 0.45);
  add(m.start + s.cue(8) + 0.1, 'pop', 0.3); add(at2(8, 'ബസ്സിൽ'), 'pop', 0.3); add(at2(8, 'മരുഭൂമി'), 'pop', 0.3); add(at2(8, 'വിമാനത്തിൽ'), 'pop', 0.3);
  add(m.start + s.cue(9), 'hit', 0.35); add(at2(9, 'ഈ കഥ'), 'tick', 0.3); add(at2(9, "'എയർലിഫ്റ്റ്"), 'boom', 0.45); add(at2(9, 'സാങ്കല്പികമാണ്') + 0.1, 'boom', 0.5); add(at2(9, 'സണ്ണിയെയും'), 'chime', 0.4);
  add(m.start + s.cue(10), 'chime', 0.25); add(at2(10, 'പണവും') + 0.25, 'hit', 0.3); add(at2(10, 'ഭക്ഷണവുമില്ലാതെ') + 0.25, 'hit', 0.3); add(at2(10, 'ബോംബുകൾ'), 'boom', 0.5); add(at2(10, 'ബോംബുകൾ') + 0.5, 'thud', 0.4);
  add(m.start + s.cue(11), 'hit', 0.25); add(at2(11, 'ടൊയോട്ട'), 'chime', 0.35); add(at2(11, 'സാധാരണക്കാരു'), 'chime', 0.3);
  return out;
};
void H;
export const shotTimes = (timeline) => { const m = timeline.scenes.find((x) => x.id === 'main'); const s = { line: (i) => m.cues[i]?.text, cue: (i) => m.cues[i].start, cueEnd: (i) => m.cues[i].end }; return shots(s).map((x) => ({ a: m.start + x.a, b: m.start + x.b, set: x.set })); };
