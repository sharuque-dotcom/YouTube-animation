// Travancore Part 2 ("Travancore today"): kit formula. Hook (Gulf flips), you-see (thorium sand), mockery joke
// (iPhone for chakrams), twist (Vizhinjam + shipping lane), analogy (a highway through your yard), 1/10/100,
// wait...? (dream), reveal (the port is real), the flag, callback ending (the world comes here).
// New cast in ./cast.js, new Vizhinjam set in ./port.js; street + beach sets reused from episodes/ml-bean.
const ML = "'Noto Malayalam'";
import { W, H, clamp, lerp } from '../../pipeline/engine.js';
// overlay text: centred on y, optional ink stroke, shrinks to maxWidth
function text(g, str, x, y, o = {}) { g.save(); let sz = o.size || 48; const f = () => `${o.weight || 800} ${sz}px ${o.font || ML}`; g.font = f(); if (o.maxWidth) while (g.measureText(str).width > o.maxWidth && sz > 12) { sz -= 2; g.font = f(); }
  g.textAlign = o.align || 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; if (o.stroke) { g.lineWidth = o.strokeWidth || sz * 0.15; g.strokeStyle = o.stroke; g.strokeText(str, x, y); } g.fillStyle = o.color || '#fff'; g.fillText(str, x, y); g.restore(); }
import { ALIGN } from './align.js';

let K = null, B = null, S = null, stage = null, camera = null, THREE = null, PROPS = null, P = null;
const ez = (x) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
const ezo = (x) => 1 - Math.pow(1 - clamp(x, 0, 1), 3);
const span = (t, a, d) => clamp((t - a) / d, 0, 1);

export async function preload() {
  K = await import('../../pipeline/toon3d.js'); THREE = K.THREE; B = await import('../../pipeline/bean.js'); PROPS = B.PROPS;
  (await import('./cast.js')).registerCast(B); P = await import('./port.js');
  const st = await import('../ml-bean/street.js'), sets = await import('../ml-bean/sets.js');
  S = { street: st.buildStreet(), beach: sets.beachSet(), port: P.portSet() };
  S.street.cards = st.radioCrowd(S.street.scene);
  buildStreet2(); buildBeach2(); buildPort2();
  stage = K.makeInkStage(W, H); camera = new THREE.PerspectiveCamera(52, W / H, 0.05, 900);
}

// ------------------------------------------------------------------ actors
function actor(scene, who, x, z, y = 0, scale = 1) { const c = K.card(who, {}, { scale }); c.position.set(x, y, z); scene.add(c); return { c, who, last: '', seed: (Math.abs(x) * 13.1 + Math.abs(z) * 7.7) % 9, base: [x, y, z] }; }
function pose(a, o, t) {
  const blinkPh = (t + a.seed) % 3.1, blink = blinkPh < 0.12 ? 1 : 0; const o2 = { ...o, blink: o.blink ?? blink };
  if (typeof o2.propR === 'string') o2.propR = PROPS[o2.propR]; if (typeof o2.propL === 'string') o2.propL = PROPS[o2.propL];
  const key = JSON.stringify({ ...o, blink: o2.blink }); if (key !== a.last) { a.c.userData.set(o2); a.last = key; }
  const m = a.c.userData.cardMesh; m.rotation.z = Math.sin(t * 1.4 + a.seed) * 0.03 + (o.lean || 0); m.position.y = Math.abs(Math.sin(t * 2.8 + a.seed)) * 0.012 + (o.hop || 0);
}
const hopAt = (t, k = 7, amt = 0.08, ph = 0) => Math.max(0, Math.sin(t * k + ph)) * amt;
function coinMat() { const tx = K.paint(256, 256, (g, w, h) => { g.fillStyle = '#e8b93a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#a8761a'; g.lineWidth = 14; g.beginPath(); g.arc(w / 2, h / 2, 100, 0, 7); g.stroke(); g.fillStyle = '#a8761a'; g.beginPath(); g.ellipse(w / 2, h / 2, 34, 50, 0.3, 0, 7); g.fill(); g.font = "800 34px 'Noto Malayalam'"; g.textAlign = 'center'; g.fillText('ചക്രം', w / 2, h - 46); });
  return [new THREE.MeshLambertMaterial({ color: 0xc8962a }), new THREE.MeshLambertMaterial({ map: tx }), new THREE.MeshLambertMaterial({ map: tx })]; }

function buildStreet2() {
  const s = S.street, sc = s.scene, T = K.stdTextures();
  s.crowd = s.cards.map((c) => ({ c, last: '', seed: (Math.abs(c.position.x) * 13.1 + Math.abs(c.position.z) * 7.7) % 9, base: [c.position.x, c.position.y, c.position.z] }));
  s.host = actor(sc, 'kannan', 1.7, -3.2);
  s.leaver = actor(sc, 'chaya', 1.0, -4.6);
  s.trio = [actor(sc, 'khalid', -0.5, -15), actor(sc, 'salem', 0.4, -15.8), actor(sc, 'rashid', 1.2, -15.3)];
  s.soldiers = []; for (let i = 0; i < 8; i++) s.soldiers.push(actor(sc, 'soldier', (i % 2 ? 0.55 : -0.55), -13.5 - Math.floor(i / 2) * 1.4));
  // the signpost that flips from GULF to here
  const face = (lines, bg) => K.signTex(lines, { w: 640, h: 200, bg, fg: '#f4efe4', border: '#f4efe4', aged: false });
  s.sign = new THREE.Group(); const pole = K.box(0.12, 2.6, 0.12, T.wood, { tileM: 1 }); pole.position.y = 1.3; s.sign.add(pole);
  s.arrow = new THREE.Group(); s.arrow.position.y = 2.25; s.sign.add(s.arrow);
  const sh = new THREE.Shape(); sh.moveTo(-0.85, -0.25); sh.lineTo(0.6, -0.25); sh.lineTo(0.9, 0); sh.lineTo(0.6, 0.25); sh.lineTo(-0.85, 0.25); sh.closePath();
  const ag = new THREE.ExtrudeGeometry(sh, { depth: 0.06, bevelEnabled: false }); ag.translate(0, 0, -0.03);
  s.arrow.add(K.mesh(ag, K.col(0x1f6a3a)));
  const fA = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.44), new THREE.MeshLambertMaterial({ map: face(['ഗൾഫ് →'], '#1f6a3a') })); fA.position.set(-0.08, 0, 0.032); s.arrow.add(fA);
  const fB = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.44), new THREE.MeshLambertMaterial({ map: face(['← തിരുവിതാംകൂർ'], '#8a1e1e') })); fB.position.set(-0.08, 0, -0.032); fB.rotation.y = Math.PI; s.arrow.add(fB);
  s.sign.position.set(2.3, 0, -6.2); s.sign.rotation.y = -0.35; sc.add(s.sign);
  // jobs board with a queue
  s.jobs = new THREE.Group(); const brd = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.0), new THREE.MeshLambertMaterial({ map: K.signTex(['ജോലി ഒഴിവുണ്ട്!', 'JOBS · TRAVANCORE'], { w: 512, h: 320, bg: '#f4ecd6', fg: '#8a1e1e', border: '#2a1c17' }) })); brd.position.y = 1.7; s.jobs.add(brd);
  const bk = K.box(1.66, 1.06, 0.05, T.wood, { tileM: 1 }); bk.position.set(0, 1.7, -0.04); s.jobs.add(bk); for (const x of [-0.7, 0.7]) { const l = K.box(0.08, 1.3, 0.08, T.wood, { tileM: 1 }); l.position.set(x, 0.65, -0.06); s.jobs.add(l); }
  s.jobs.position.set(2.6, 0, -10); s.jobs.rotation.y = -0.5; sc.add(s.jobs);
  // phone shop at the old anchal table
  const tbl = K.box(1.2, 0.85, 0.6, T.wood, { tileM: 1 }); tbl.position.set(-3.1, 0.42, -10.6); tbl.rotation.y = Math.PI / 2; sc.add(tbl);
  const shopT = K.signTex(['മമ്മൂക്ക മൊബൈൽസ്'], { w: 640, h: 140, bg: '#2f6a3a', fg: '#f4dca0', aged: false });
  const shopSign = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.4), new THREE.MeshLambertMaterial({ map: shopT })); shopSign.position.set(-3.2, 2.35, -10.6); shopSign.rotation.y = Math.PI / 2 - 0.3; sc.add(shopSign);
  s.shop = actor(sc, 'shopkeeper', -2.95, -11.25); s.buyer = actor(sc, 'rashid', -1.8, -9.3); s.sackGuy = actor(sc, 'kannan', -1.3, -9.2);
  // coins: the big flipping chakram, the 28-coin stack, the pour from the sack
  const cm = coinMat(); s.coinM = cm;
  s.coin = K.mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.04, 32), cm); s.coin.visible = false; sc.add(s.coin);
  s.stack = []; for (let i = 0; i < 28; i++) { const c = K.mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.022, 20), cm, { shadow: false }); c.position.set(-2.95 + (i % 2) * 0.004, 0.86 + i * 0.023, -10.25); c.visible = false; sc.add(c); s.stack.push(c); }
  s.rupee = K.mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.02, 24), K.col(0xd8d8dc)); s.rupee.position.set(-3.0, 0.86, -10.75); s.rupee.visible = false; sc.add(s.rupee);
  s.pour = []; { const r = K.rnd(5); for (let i = 0; i < 40; i++) { const c = K.mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.018, 16), cm, { shadow: false }); c.userData = { dx: (r() - 0.5) * 0.5, dz: (r() - 0.5) * 0.35, d: r() * 0.5, sp: r() * 9 }; c.visible = false; sc.add(c); s.pour.push(c); } }
  s.phone = K.mesh(new THREE.BoxGeometry(0.1, 0.19, 0.012), [K.col(0x1d1d22), K.col(0x1d1d22), K.col(0x1d1d22), K.col(0x1d1d22), new THREE.MeshBasicMaterial({ color: 0x5ab0e8 }), K.col(0x1d1d22)]); s.phone.visible = false; sc.add(s.phone);
}
function buildBeach2() {
  const b = S.beach, sc = b.scene; b.ship.visible = false;
  b.ammini = actor(sc, 'ammini', -0.2, 0.9); b.fisher = actor(sc, 'fisher', 0.9, 0.2); b.kid = actor(sc, 'meenu', -1.0, 1.6); b.kannan = actor(sc, 'kannan', 0.3, 2.6);
  // a parade of giant container ships close offshore: the "highway through your front yard"
  b.parade = [0, 1, 2].map((k) => { const s = P.containerShip({ L: 120, B: 18, seed: 11 + k, name: ['കൊച്ചി', 'ദുബായ്', 'സിംഗപ്പൂർ'][k] }); s.scale.setScalar(0.55); s.position.set(-200, 0.1, -42 - k * 9); sc.add(s); return s; });
  const T = K.stdTextures(); b.nh = new THREE.Group(); const p = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.8), new THREE.MeshLambertMaterial({ map: K.signTex(['ദേശീയപാത →'], { w: 512, h: 240, bg: '#1f6a3a', fg: '#ffffff', border: '#ffffff', aged: false }) })); p.position.y = 2.0; b.nh.add(p);
  for (const x of [-0.7, 0.7]) { const l = K.box(0.07, 2.4, 0.07, null, { color: 0x9a9aa0 }); l.position.set(x, 1.2, -0.04); b.nh.add(l); }
  b.nh.position.set(1.9, 0, -0.6); b.nh.rotation.y = -0.25; sc.add(b.nh);
}
function buildPort2() {
  const p = S.port, sc = p.scene;
  p.crew = { porter: actor(sc, 'porter', 15.6, 4.2), latha: actor(sc, 'porter2', 19.2, 5.2), captain: actor(sc, 'captain', 21.0, 4.0), sailor: actor(sc, 'sailor', 17.4, 6.2), kannan: actor(sc, 'kannan', 13.6, 5.0), ammini: actor(sc, 'ammini', 12.4, 6.0), kid: actor(sc, 'meenu', 11.6, 4.8) };
  p.trio = [actor(sc, 'khalid', 23.2, 6.0), actor(sc, 'salem', 24.2, 6.8), actor(sc, 'rashid', 25.0, 5.6)];
  p.flags.conch.grp.position.set(10.4, 0, 7.6); p.flags.india.grp.position.set(12.6, 0, 7.6);
}

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
let OV = null; // 2D overlay requests for the current frame
function resetProps() {
  const st = S.street, b = S.beach, p = S.port;
  st.arrow.rotation.y = 0; st.coin.visible = false; st.stack.forEach((c) => { c.visible = false; }); st.rupee.visible = false; st.pour.forEach((c) => { c.visible = false; }); st.phone.visible = false;
  st.trio.forEach((a) => { a.c.position.set(...a.base); }); st.soldiers.forEach((a) => { a.c.position.z = a.base[2]; }); st.sackGuy.c.position.set(...st.sackGuy.base);
  b.parade.forEach((s) => { s.position.x = -200; }); b.kannan.c.visible = false;
  p.setLane(0, 0); p.dash.visible = false; p.ship.position.x = 0; p.flags.india.f.position.y = 5.9; p.flags.conch.f.position.y = 5.9;
  OV = {};
}
function idleStreet(t, mode = 'calm') {
  const s = S.street; const E = mode === 'laugh' ? ['laugh', 'grin', 'laugh', 'smug', 'laugh', 'beam', 'laugh', 'grin', 'laugh'] : mode === 'cheer' ? ['beam', 'proud', 'laugh', 'beam', 'beam', 'grin', 'shock', 'beam', 'laugh'] : ['smile', 'smug', 'grin', 'smile', 'beam', 'think', 'smile', 'smile', 'grin'];
  s.crowd.forEach((a, i) => { const laugh = mode === 'laugh', ch = mode === 'cheer'; pose(a, { expr: E[i], L: laugh ? (i % 3 === 0 ? 'point' : 'hip') : ch ? (i % 2 ? 'up' : 'wave') : 'hang', R: laugh ? (i % 2 ? 'mouth' : 'hip') : ch ? 'up' : (i === 4 ? 'holdUp' : 'hang'), propR: i === 4 ? 'flag' : null, look: -1, lean: laugh ? (i % 2 ? 0.08 : -0.06) * Math.sin(t * 9 + i) : 0, hop: laugh || ch ? hopAt(t, 8, 0.06, i * 1.3) : 0 }, t); });
}
function walkTrio(t, t0, z0, z1, d, expr = 'grin') { S.street.trio.forEach((a, i) => { const u = span(t, t0, d); a.c.position.set(a.base[0], 0, lerp(z0 - i * 0.6, z1 - i * 0.6, u)); pose(a, { expr: i === 1 ? 'beam' : expr, R: 'hold', propR: 'suitcase', L: i === 0 ? 'wave' : 'hang', walk: u < 1 ? (t * 1.5 + i * 0.33) % 1 : 0, look: 0.3 }, t); }); }
function march(t, a0) { S.street.soldiers.forEach((a, i) => { a.c.position.z = a.base[2] + (t - a0) * 1.3; pose(a, { expr: i % 3 ? 'stern' : 'proud', L: 'march', R: 'rifle', propR: 'rifle', walk: ((t * 1.3) + (i % 2) * 0.5) % 1 }, t); }); }
function beach(t, mode) {
  const b = S.beach, glow = mode === 'glow' || mode === 'wave';
  pose(b.ammini, { expr: mode === 'tea' ? 'smug' : glow ? (mode === 'wave' ? 'proud' : 'beam') : 'smile', R: mode === 'tea' ? 'holdUp' : glow ? 'holdUp' : 'hip', propR: mode === 'tea' ? 'glass' : glow ? 'sand' : null, L: mode === 'wave' ? 'wave' : 'hip', look: mode === 'tea' ? -1 : 0.3 }, t);
  pose(b.fisher, { expr: mode === 'tea' ? 'shock' : glow ? 'shock' : 'think', L: glow || mode === 'tea' ? 'mouth' : 'hang', R: glow ? 'up' : mode === 'tea' ? 'point' : 'chin', look: -0.8 }, t);
  pose(b.kid, { expr: glow || mode === 'tea' ? 'beam' : 'smile', R: mode === 'tea' ? 'wave' : 'point', L: 'hang', look: mode === 'tea' ? -1 : 1, hop: glow || mode === 'tea' ? hopAt(t, 7, 0.1) : 0 }, t);
}
function crew(t, mode, t0 = 0) {
  const c = S.port.crew, cheer = mode === 'cheer', flag = mode === 'flag';
  pose(c.porter, { expr: cheer ? 'laugh' : 'grin', R: cheer ? 'up' : 'wave', propR: 'wand', L: cheer ? 'up' : 'hip', look: -0.5, hop: cheer ? hopAt(t, 8, 0.08) : 0 }, t);
  pose(c.latha, { expr: cheer ? 'beam' : 'proud', R: cheer ? 'up' : 'thumb', L: 'hip', look: -1, hop: cheer ? hopAt(t, 8, 0.08, 1) : 0 }, t);
  pose(c.captain, { expr: flag ? 'proud' : 'smile', R: cheer ? 'wave' : flag ? 'fist' : 'wave', L: 'hip', look: -1 }, t);
  pose(c.sailor, { expr: cheer ? 'laugh' : 'beam', R: 'holdUp', propR: 'clipboard', L: cheer ? 'up' : 'hang', look: -1, hop: cheer ? hopAt(t, 8, 0.08, 2) : 0 }, t);
  pose(c.kannan, { expr: cheer ? 'laugh' : flag ? 'proud' : 'beam', R: 'up', L: cheer ? 'up' : 'hip', look: 1, hop: cheer ? hopAt(t, 8, 0.08, 3) : 0 }, t);
  pose(c.ammini, { expr: flag ? 'proud' : 'smile', R: cheer ? 'wave' : 'chin', L: 'hip', look: 1, lookY: flag ? -1 : 0 }, t);
  pose(c.kid, { expr: 'beam', R: 'up', L: cheer ? 'up' : 'hang', look: 1, hop: hopAt(t, 7, 0.1) }, t);
  S.port.trio.forEach((a, i) => pose(a, { expr: mode === 'shrug' ? ['think', 'smug', 'grin'][i] : cheer ? 'beam' : 'shock', L: mode === 'shrug' ? 'shrug' : cheer ? 'wave' : 'mouth', R: mode === 'shrug' ? 'shrug' : 'hold', propR: mode === 'shrug' ? null : 'suitcase', look: -1, hop: cheer ? hopAt(t, 8, 0.06, i) : 0 }, t));
  // cranes keep working
  S.port.cranes.forEach((cr, i) => { const ph = (t * 0.12 + i * 0.27) % 1, u = ph < 0.5 ? ez(ph * 2) : ez(2 - ph * 2), drop = 10 + Math.sin(ph * Math.PI * 2) * 6; cr.userData.set(0.15 + u * 0.7, drop, ph < 0.5); });
}
function coinPour(t, t0) { const s = S.street; s.pour.forEach((c) => { const d = c.userData, k = t - t0 - d.d; c.visible = k > 0; if (!c.visible) return; const y = Math.max(0.87, 1.7 - k * k * 4.9 * 1.4); c.position.set(-2.75 + d.dx * Math.min(1, k * 2), y, -10.35 + d.dz * Math.min(1, k * 2)); c.rotation.set(y > 0.88 ? t * 10 + d.sp : 0, d.sp, 0); }); }

// ------------------------------------------------------------------ shots
function shots(s) { return tidy(rawShots(s)); }
function rawShots(s) {
  const L = (i) => s.cue(i), w = (i, n) => wt(s, i, n);
  const STR = (k) => ({ set: 'street', ...k }), BCH = (k) => ({ set: 'beach', ...k }), PRT = (k) => ({ set: 'port', ...k });
  const w0Mal = w(0, 'മലയാളികൾ'), w0Not = w(0, 'ഗൾഫിലേക്കല്ല'), w0Gul = w(0, 'ഗൾഫുകാർ'), w0Job = w(0, 'ജോലി');
  const w1Kar = w(1, 'കറുത്ത'), w1Tho = w(1, 'തോറിയം');
  const w2Nan = w(2, 'നാണയം'), w2Ann = w(2, 'അന്നത്തെ'), w2Iru = w(2, 'ഇരുപത്തിയെട്ട്');
  const w3Q = w(3, '"ചക്രം'), w3Pat = w(3, 'പറ്റും...'), w3Sack = w(3, 'ചാക്ക്');
  const w4Ayu = w(4, 'ആയുധം'), w4Viz = w(4, 'വിഴിഞ്ഞമാണ്'), w4Lok = w(4, 'ലോകത്തിലെ'), w4Ten = w(4, 'പത്ത്'), w4Hou = w(4, 'വീടിന്റെ'), w4NH = w(4, 'ദേശീയപാത');
  const w5Ten = w(5, 'പത്ത്.'), w5Hun = w(5, 'നൂറ്');
  const w6Dr = w(6, 'സ്വപ്നമാണോ');
  const w7Viz = w(7, 'വിഴിഞ്ഞം'), w7Yat = w(7, 'യാഥാർത്ഥ്യമാണ്'), w7Big = w(7, 'ചരക്കുകപ്പലുകൾ'), w7Anc = w(7, 'നങ്കൂരമിട്ടു');
  const w8Ind = w(8, 'ഇന്ത്യയുടെ'), w8Sea = w(8, 'കടലിലേക്കിറങ്ങുന്നു');
  const w9Pak = w(9, 'പക്ഷേ,'), w9Lok = w(9, 'ലോകം');
  return [
    // ---- 1. HOOK (frame 0 mid-action): the street celebrates a kingdom that never joined; the GULF sign flips; the Gulf comes HERE
    STR({ a: 0, b: w0Mal - 0.1, keys: [[0, [2.6, 1.2, 1.6], [0.2, 2.0, -6], 0.05, 50], [0.35, [2.0, 1.4, 0.6], [0.4, 2.0, -6], 0.02, 52], [3, [1.4, 1.6, -0.2], [0.6, 2.0, -6], -0.02, 54]],
      act: (t, tt, sh) => { idleStreet(t, 'cheer'); march(t, sh.a - 1.2); pose(S.street.host, { expr: 'proud', L: 'hip', R: 'up', look: -0.6 }, t); pose(S.street.leaver, { expr: 'smile', R: 'hold', propR: 'suitcase', look: 1 }, t); } }),
    STR({ a: w0Mal - 0.1, b: w0Gul - 0.1, keys: [[0, [0.4, 1.45, -2.2], [2.1, 1.95, -6.1], 0.04, 46], [0.35, [0.7, 1.55, -2.7], [2.1, 2.05, -6.1], 0.02, 46], [2.2, [0.9, 1.6, -3.1], [2.1, 2.1, -6.1], -0.02, 46]],
      act: (t, tt, sh) => { const s0 = S.street, u = ezo(span(t, w0Not + 0.25, 0.45)); s0.arrow.rotation.y = u * Math.PI; pose(s0.leaver, { expr: u > 0.5 ? 'shock' : 'smile', R: 'hold', propR: 'suitcase', L: u > 0.5 ? 'mouth' : 'point', look: 1, hop: u > 0.5 && u < 0.95 ? 0.1 : 0, walk: u < 0.1 ? (t * 1.4) % 1 : 0 }, t); s0.leaver.c.position.z = s0.leaver.base[2] - 0.6 * span(t, sh.a, 1.2); pose(s0.host, { expr: u > 0.5 ? 'smug' : 'think', L: 'chin', R: 'hip', look: 1 }, t); idleStreet(t); } }),
    STR({ a: w0Gul - 0.1, b: w0Job - 0.1, keys: [[0, [0.3, 0.8, -4.6], [0.3, 1.5, -13], 0.03, 50], [0.35, [0.35, 0.95, -5.2], [0.3, 1.55, -13], 0.01, 50], [2, [0.4, 1.05, -5.6], [0.3, 1.6, -13], -0.02, 52]],
      act: (t, tt, sh) => { walkTrio(t, sh.a - 0.3, -12.6, -9.0, 2.4); idleStreet(t, 'cheer'); } }),
    STR({ a: w0Job - 0.1, b: L(1), keys: [[0, [0.2, 1.5, -6.0], [2.4, 1.45, -9.6], -0.04, 48], [0.35, [0.5, 1.55, -6.4], [2.4, 1.5, -9.6], -0.01, 48], [2, [0.7, 1.6, -6.8], [2.4, 1.55, -9.7], 0.02, 48]],
      act: (t, tt, sh) => { const s0 = S.street; s0.trio.forEach((a, i) => { a.c.position.set(1.5 + i * 0.25, 0, -9.0 - i * 0.65); pose(a, { expr: ['beam', 'proud', 'grin'][i], R: 'hold', propR: 'suitcase', L: i === 0 ? 'point' : 'wave', look: 1, hop: hopAt(t, 7, 0.05, i) }, t); }); } }),
    // ---- 2. YOU SEE: the black sand, one of the world's biggest thorium reserves
    BCH({ a: L(1), b: w1Kar - 0.15, keys: [[0, [1.6, 1.0, 4.8], [-0.2, 1.0, 0.6], -0.04, 50], [0.35, [1.2, 1.15, 4.2], [-0.2, 1.05, 0.6], -0.02, 50], [2, [0.9, 1.25, 3.9], [-0.2, 1.1, 0.6], 0.02, 50]],
      act: (t) => { beach(t, 'calm'); S.beach.setGlow(0.1, t); } }),
    BCH({ a: w1Kar - 0.15, b: w1Tho - 0.15, keys: [[0, [0.9, 1.0, 3.3], [-0.2, 0.75, 0.6], 0.03, 46], [0.35, [0.8, 1.05, 3.0], [-0.2, 0.8, 0.6], 0.02, 46], [2, [0.7, 1.1, 2.8], [-0.2, 0.85, 0.6], -0.01, 46]],
      act: (t, tt, sh) => { beach(t, 'glow'); S.beach.setGlow(0.3 + 0.4 * span(t, sh.a, 1.2), t); } }),
    BCH({ a: w1Tho - 0.15, b: L(2), keys: [[0, [0.4, 0.8, 2.8], [-0.2, 0.8, 0.6], 0.03, 48], [0.35, [1.0, 1.3, 3.8], [-0.3, 1.0, 0.5], 0.02, 52], [2.4, [1.6, 2.4, 6.0], [-0.3, 1.2, 0.0], -0.02, 54]],
      act: (t, tt, sh) => { beach(t, 'wave'); S.beach.setGlow(1 + 0.3 * Math.max(0, 1 - Math.abs(t - w1Tho - 0.3) * 2), t); OV.badge = { t0: w1Tho, txt: 'തോറിയം ☢', sub: 'THORIUM' }; } }),
    // ---- 3. own army, own coin; 28 chakram = 1 rupee
    STR({ a: L(2), b: w2Nan - 0.1, keys: [[0, [0.9, 0.9, -6.0], [0, 1.5, -14], 0.0, 52], [0.35, [0.6, 0.95, -7.0], [0, 1.55, -14], 0.02, 52], [2.4, [0.5, 1.0, -7.6], [0, 1.6, -14], -0.02, 52]],
      act: (t, tt, sh) => { march(t, sh.a); idleStreet(t, 'cheer'); } }),
    STR({ a: w2Nan - 0.1, b: w2Ann - 0.1, keys: [[0, [1.4, 1.5, -3.2], [-1.45, 1.7, -5.0], 0.02, 52], [0.35, [1.0, 1.55, -3.6], [-1.45, 2.2, -5.0], 0.01, 52], [2, [0.9, 1.6, -3.8], [-1.45, 2.0, -5.0], -0.02, 52]],
      act: (t, tt, sh) => { idleStreet(t); const s0 = S.street, u = span(t, sh.a + 0.1, 1.2); s0.coin.visible = true; s0.coin.position.set(-0.55, 1.6 + Math.sin(u * Math.PI) * 0.9, -4.5); s0.coin.rotation.set(t * 14, 0, 0.3); } }),
    STR({ a: w2Ann - 0.1, b: L(3), keys: [[0, [-1.6, 1.35, -8.9], [-2.95, 1.0, -10.4], 0.04, 42], [0.35, [-1.9, 1.3, -9.2], [-2.95, 1.0, -10.4], 0.02, 42], [2.5, [-2.0, 1.4, -9.4], [-2.95, 1.1, -10.4], -0.02, 44]],
      act: (t, tt, sh) => { const s0 = S.street, n = Math.round(28 * ez(span(t, w2Ann + 0.2, w2Iru + 0.5 - w2Ann - 0.2))); s0.stack.forEach((c, i) => { c.visible = i < n; }); s0.rupee.visible = true;
        pose(s0.shop, { expr: t > w2Iru + 0.3 ? 'smug' : 'think', L: 'hip', R: 'point', look: 0.3 }, t); pose(s0.buyer, { expr: t > w2Iru ? 'shock' : 'think', L: t > w2Iru ? 'mouth' : 'chin', R: 'hang', look: -1 }, t); pose(s0.sackGuy, { expr: 'nervous', look: -1 }, t);
        OV.counter = { n, t0: w2Ann + 0.2 }; if (t > w2Iru + 0.4) OV.badge = { t0: w2Iru + 0.4, txt: '28 ചക്രം = ₹1', sub: '' }; } }),
    // ---- 4. MOCKERY + JOKE: an iPhone for chakrams? sure... with a whole sack
    STR({ a: L(3), b: w3Q - 0.05, keys: [[0, [1.0, 1.7, 0.9], [-1.8, 1.5, -4], 0.04, 52], [0.35, [0.7, 1.75, 1.3], [-1.8, 1.55, -4], 0.02, 54], [2.1, [0.5, 1.8, 1.6], [-1.8, 1.6, -4], -0.01, 54]],
      act: (t) => idleStreet(t, 'laugh') }),
    STR({ a: w3Q - 0.05, b: w3Pat - 0.1, keys: [[0, [0.6, 1.7, -8.4], [-2.9, 1.45, -11.0], 0.04, 46], [0.35, [0.4, 1.7, -8.6], [-2.9, 1.5, -11.0], 0.02, 46], [2.2, [0.25, 1.7, -8.7], [-2.9, 1.55, -11.0], -0.02, 46]],
      act: (t) => { const s0 = S.street; pose(s0.shop, { expr: 'smug', R: 'holdUp', propR: 'phone', L: 'hip', look: 0.5 }, t); pose(s0.buyer, { expr: 'laugh', L: 'point', R: 'mouth', look: -1, lean: Math.sin(t * 9) * 0.05 }, t); s0.sackGuy.c.visible = false; } }),
    STR({ a: w3Pat - 0.1, b: L(4), shake: w3Sack + 0.35, keys: [[0, [0.4, 1.7, -6.8], [-2.4, 1.2, -10.2], -0.04, 48], [0.35, [0.2, 1.7, -7.1], [-2.4, 1.2, -10.3], -0.02, 48], [2.6, [0.0, 1.75, -7.3], [-2.5, 1.25, -10.3], 0.02, 48]],
      act: (t, tt, sh) => { const s0 = S.street, arr = ezo(span(t, sh.a, 0.7)), dumped = t > w3Sack + 0.3; s0.sackGuy.c.visible = true; s0.sackGuy.c.position.set(lerp(-0.7, -2.15, arr), 0, lerp(-8.9, -9.85, arr));
        pose(s0.sackGuy, { expr: dumped ? 'proud' : 'smug', R: dumped ? 'up' : 'hold', propR: dumped ? null : 'sack', L: 'hip', walk: arr < 1 ? (t * 1.6) % 1 : 0, look: -1 }, t); coinPour(t, w3Sack + 0.3);
        pose(s0.shop, { expr: dumped ? 'shock' : 'smug', R: 'holdUp', propR: 'phone', L: dumped ? 'mouth' : 'hip', hop: dumped && t < w3Sack + 0.6 ? 0.1 : 0, look: 0.5 }, t); pose(s0.buyer, { expr: dumped ? 'shock' : 'grin', L: 'mouth', R: dumped ? 'up' : 'point', look: -1 }, t); } }),
    // ---- 5. TWIST: the real secret weapon is Vizhinjam, 10 nautical miles from the busiest shipping lane
    STR({ a: L(4), b: w4Ayu + 0.2, keys: [[0, [1.9, 1.75, -1.0], [1.7, 1.55, -3.2], 0.05, 40], [0.35, [1.85, 1.72, -1.4], [1.7, 1.55, -3.2], 0.02, 40], [2, [1.8, 1.72, -1.6], [1.7, 1.55, -3.2], -0.02, 38]],
      act: (t) => { const s0 = S.street; pose(s0.host, { expr: 'sly', L: 'mouth', R: 'hip', look: 0.2, lookY: 0.5 }, t); idleStreet(t); } }),
    STR({ a: w4Ayu + 0.2, b: w4Viz - 0.2, keys: [[0, [1.6, 1.6, -0.6], [1.7, 1.5, -3.2], -0.04, 46], [0.35, [1.4, 1.6, -0.9], [1.7, 1.5, -3.2], -0.02, 46], [2, [1.3, 1.6, -1.0], [1.7, 1.5, -3.2], 0.02, 46]],
      act: (t) => { const s0 = S.street; pose(s0.host, { expr: 'smug', L: 'shrug', R: 'shrug', look: 0.2 }, t); idleStreet(t); } }),
    PRT({ a: w4Viz - 0.2, b: w4Lok - 0.1, shake: w4Viz + 0.1, keys: [[0, [70, 14, 40], [10, 10, -12], 0.06, 56], [0.4, [55, 26, 52], [6, 8, -14], 0.03, 54], [3, [48, 34, 62], [4, 6, -16], -0.02, 54]],
      act: (t) => { crew(t, 'cheer'); S.port.setLane(12, t); } }),
    PRT({ a: w4Lok - 0.1, b: w4Ten - 0.2, keys: [[0, [40, 45, 40], [0, 0, -150], 0.03, 50], [0.4, [36, 50, 34], [4, 0, -160], 0.02, 50], [3, [30, 56, 26], [6, 0, -170], -0.02, 50]],
      act: (t) => { crew(t, 'idle'); S.port.setLane(30, t); } }),
    PRT({ a: w4Ten - 0.2, b: w4Hou - 0.1, keys: [[0, [24, 70, 30], [10, 0, -80], -0.03, 52], [0.4, [22, 80, 24], [10, 0, -90], -0.01, 52], [3, [20, 90, 18], [10, 0, -100], 0.02, 52]],
      act: (t, tt, sh) => { crew(t, 'idle'); S.port.setLane(30, t); S.port.dash.visible = true; S.port.dash.scale.set(1, ezo(span(t, sh.a, 0.8)), 1); S.port.dash.position.z = -20 - 75 * ezo(span(t, sh.a, 0.8)); OV.badge = { t0: w4Ten, txt: '10 നോട്ടിക്കൽ മൈൽ', sub: '≈ 18 KM' }; } }),
    // ---- 6. ANALOGY: a national highway through your front yard
    BCH({ a: w4Hou - 0.1, b: L(5), keys: [[0, [-2.6, 1.3, 5.6], [0.4, 2.4, -20], 0.04, 54], [0.4, [-2.2, 1.35, 5.0], [0.6, 2.6, -20], 0.02, 56], [3, [-1.6, 1.4, 4.4], [0.8, 2.8, -20], -0.02, 58]],
      act: (t, tt, sh) => { beach(t, 'tea'); S.beach.setGlow(0.2, t); S.beach.parade.forEach((s, k) => { s.position.x = -70 + (t - sh.a) * 16 - k * 48 + 30; }); } }),
    // ---- 7. first one ship, then ten, then a hundred
    PRT({ a: L(5), b: w5Ten - 0.05, keys: [[0, [30, 60, 20], [10, 0, -170], 0.02, 46], [0.4, [30, 64, 16], [10, 0, -170], 0.01, 46], [2, [30, 66, 14], [10, 0, -170], -0.01, 46]],
      act: (t) => { crew(t, 'idle'); S.port.setLane(1, t); OV.count = { txt: '1', t0: L(5) + 0.15 }; } }),
    PRT({ a: w5Ten - 0.05, b: w5Hun - 0.05, keys: [[0, [36, 75, 30], [6, 0, -180], -0.02, 50], [0.4, [38, 80, 34], [6, 0, -180], -0.01, 50], [2, [40, 84, 38], [6, 0, -180], 0.01, 50]],
      act: (t) => { crew(t, 'idle'); S.port.setLane(10, t); OV.count = { txt: '10', t0: w5Ten }; } }),
    PRT({ a: w5Hun - 0.05, b: L(6), shake: w5Hun + 0.1, keys: [[0, [44, 95, 50], [0, 0, -190], 0.03, 54], [0.4, [48, 110, 60], [0, 0, -200], 0.02, 56], [2, [52, 125, 70], [0, 0, -210], -0.01, 58]],
      act: (t) => { crew(t, 'idle'); S.port.setLane(100, t); OV.count = { txt: '100', t0: w5Hun }; } }),
    // ---- 8. WAIT...? is it all just a dream?
    BCH({ a: L(6), b: w6Dr - 0.15, dream: true, keys: [[0, [0.9, 1.75, 5.0], [0.3, 1.55, 2.6], -0.03, 42], [0.4, [0.8, 1.72, 4.3], [0.3, 1.55, 2.6], -0.01, 40], [2.5, [0.75, 1.7, 4.1], [0.3, 1.55, 2.6], 0.02, 38]],
      act: (t) => { const b = S.beach; b.kannan.c.visible = true; pose(b.kannan, { expr: 'think', L: 'chin', R: 'hip', look: 0.4, lookY: -1 }, t); beach(t, 'calm'); b.setGlow(0.2, t); } }),
    BCH({ a: w6Dr - 0.15, b: L(7), dream: true, keys: [[0, [0.55, 1.65, 3.7], [0.3, 1.6, 2.6], 0.03, 38], [0.35, [0.5, 1.65, 3.6], [0.3, 1.6, 2.6], 0.01, 36], [2, [0.48, 1.64, 3.5], [0.3, 1.6, 2.6], -0.01, 34]],
      act: (t) => { const b = S.beach; b.kannan.c.visible = true; pose(b.kannan, { expr: 'nervous', L: 'mouth', R: 'chin', look: 0, blink: (t * 3) % 1 > 0.7 ? 1 : 0 }, t); beach(t, 'calm'); b.setGlow(0.2, t); } }),
    // ---- 9. NO. The port is real. The world's biggest container ships already berth here.
    PRT({ a: L(7), b: w7Yat - 0.1, flash: L(7), keys: [[0, [19.5, 2.3, 16], [17.5, 2.6, -4], 0.04, 58], [0.35, [19.3, 2.2, 15.2], [17.5, 2.8, -4], 0.02, 58], [2, [19.2, 2.2, 14.8], [17.5, 3.0, -4], -0.02, 58]],
      act: (t) => { crew(t, 'cheer'); OV.plate = { t0: w7Viz + 0.1 }; } }),
    PRT({ a: w7Yat - 0.1, b: w7Big - 0.1, keys: [[0, [-8, 3, 20], [-28, 18, -6], 0.04, 52], [0.35, [-9, 3.2, 18], [-30, 20, -8], 0.02, 52], [2.4, [-10, 3.4, 17], [-30, 21, -10], -0.02, 52]],
      act: (t) => { crew(t, 'idle'); OV.plate = { t0: w7Viz + 0.1 }; } }),
    PRT({ a: w7Big - 0.1, b: w7Anc + 0.3, keys: [[0, [80, 1.0, 10], [20, 8, -14], 0.05, 56], [0.4, [74, 1.4, 12], [16, 9, -14], 0.02, 56], [3, [70, 2.0, 14], [12, 10, -14], -0.02, 58]],
      act: (t, tt, sh) => { crew(t, 'idle'); const u = ezo(span(t, sh.a - 0.6, w7Anc + 0.3 - sh.a + 0.6)); S.port.ship.position.x = 40 * (1 - u); S.port.ship.userData.foam.material.opacity = 0.5 * (1 - u); S.port.setLane(12, t); } }),
    PRT({ a: w7Anc + 0.3, b: L(8), shake: w7Anc + 0.35, keys: [[0, [21.5, 1.8, 9], [21, 1.6, 4], -0.03, 46], [0.35, [21.4, 1.75, 8.4], [21, 1.6, 4], -0.01, 46], [2, [21.3, 1.75, 8.1], [21, 1.65, 4], 0.02, 46]],
      act: (t) => { crew(t, 'cheer'); } }),
    // ---- 10. the old dream sails on under India's flag
    PRT({ a: L(8), b: w8Ind - 0.1, keys: [[0, [11.6, 1.2, 12], [11.4, 5.2, 7.6], 0.03, 50], [0.35, [11.7, 1.3, 11.4], [11.4, 5.4, 7.6], 0.01, 50], [2, [11.8, 1.4, 11], [11.4, 5.6, 7.6], -0.02, 50]],
      act: (t) => { crew(t, 'flag'); S.port.flags.india.f.position.y = 1.0; } }),
    PRT({ a: w8Ind - 0.1, b: w8Sea - 0.1, keys: [[0, [13.6, 1.3, 12.4], [12.4, 4.8, 7.6], -0.03, 50], [0.35, [13.4, 1.35, 11.8], [12.4, 5.0, 7.6], -0.01, 50], [2, [13.2, 1.4, 11.4], [12.4, 5.3, 7.6], 0.02, 50]],
      act: (t, tt, sh) => { crew(t, 'flag'); S.port.flags.india.f.position.y = lerp(1.0, 5.9, ezo(span(t, sh.a, 1.4))); } }),
    PRT({ a: w8Sea - 0.1, b: L(9), keys: [[0, [-80, 9, -34], [-58, 10.5, -13], 0.04, 46], [0.4, [-82, 10, -37], [-58, 10.5, -13], 0.02, 48], [2.4, [-86, 12, -42], [-58, 10, -13], -0.02, 52]],
      act: (t) => { crew(t, 'flag'); S.port.setLane(20, t); } }),
    // ---- 11. CALLBACK ending: will the Gulf come? who knows... but the world already has
    PRT({ a: L(9), b: w9Pak - 0.1, keys: [[0, [26, 1.7, 13], [24, 1.6, 6], 0.03, 48], [0.35, [25.6, 1.7, 12.2], [24, 1.6, 6], 0.01, 48], [2, [25.3, 1.7, 11.8], [24, 1.65, 6], -0.02, 48]],
      act: (t) => { crew(t, 'shrug'); } }),
    PRT({ a: w9Pak - 0.1, b: w9Lok - 0.1, keys: [[0, [13.9, 1.85, 8.2], [13.6, 1.6, 5], -0.03, 42], [0.35, [13.8, 1.82, 7.8], [13.6, 1.6, 5], -0.01, 42], [2, [13.8, 1.8, 7.6], [13.6, 1.62, 5], 0.02, 40]],
      act: (t) => { crew(t, 'shrug'); pose(S.port.crew.kannan, { expr: 'sly', R: 'thumb', L: 'hip', look: 0 }, t); } }),
    PRT({ a: w9Lok - 0.1, b: 1e9, keys: [[0, [18, 2.0, 14], [18, 3, -10], 0.03, 56], [0.4, [18, 6, 21], [14, 2, -40], 0.02, 56], [3.5, [30, 60, 60], [0, 0, -150], -0.02, 54]],
      act: (t) => { crew(t, 'cheer'); S.port.setLane(100, t); } }),
  ];
}
// keep cuts on the word but never shorter than 0.6 s; split anything over 2.3 s into a fresh composition
function tidy(list) {
  const n = list.length; for (let i = 1; i < n; i++) { const lo = list[i - 1].a + 0.6, hi = i + 1 < n ? list[i + 1].a - 0.6 : 1e9; if (list[i].a < lo) list[i].a = Math.min(lo, Math.max(list[i - 1].a + 0.3, (list[i - 1].a + hi) / 2)); }
  for (let i = 0; i < n; i++) list[i].b = i + 1 < n ? list[i + 1].a : list[i].b;
  const out = []; list.forEach((x) => { const d = x.b - x.a; if (d <= 2.3 || x.b > 1e8) { out.push(x); return; } const k = Math.ceil(d / 2.0), step = d / k;
    for (let j = 0; j < k; j++) { if (!j) { out.push({ ...x, b: x.a + step }); continue; } const side = j % 2 ? 1 : -1, push = 0.22 + 0.08 * j, big = x.set === 'port' && Math.hypot(...x.keys[0][1].map((v, q) => v - x.keys[0][2][q])) > 20 ? 8 : 1;
      const keys = x.keys.map(([t, p, l, r = 0, f = 52]) => [t, p.map((v, q) => v + (l[q] - v) * push + (q === 0 ? side * 0.25 * big : q === 1 ? 0.12 * big : 0)), l, -r + side * 0.03, f - 4]);
      out.push({ ...x, a: x.a + j * step, b: j === k - 1 ? x.b : x.a + (j + 1) * step, keys, flash: null }); } });
  return out;
}

// ------------------------------------------------------------------ rendering
function renderShot(g, sh, t, alpha = 1) {
  const set = S[sh.set]; const tt = t - sh.a; set.life.forEach((f) => f(t)); resetProps(); sh.act(t, tt, sh);
  const c = camAt(sh.keys, tt); const dist = Math.hypot(...c.p.map((v, q) => v - c.l[q])); place(c, t, sh.shake != null ? shakeAt(t, sh.shake, 0.5) : 0, dist > 25 ? 6 : 1); camera.updateMatrixWorld();
  const focus = dist, port = sh.set === 'port';
  const cv = stage.render(set.scene, camera, { focus, aperture: dist > 25 ? 1.5 : 6, hazeAmt: port ? 0.12 : 0.3, haze: 0xdfe9f2, sat: 1.1, contrast: 0.06, lift: 0.015, warm: 0.02, vignette: 0.3 });
  g.save(); g.globalAlpha = alpha;
  if (sh.dream) { // dream: soft wavy, desaturated, misty edges
    g.filter = 'saturate(0.45) brightness(1.06)'; const N = 48, sh2 = H / N; for (let i = 0; i < N; i++) { const dx = Math.sin(i * 0.35 + t * 3) * 10; g.drawImage(cv, 0, i * sh2 * (cv.height / H), cv.width, sh2 * (cv.height / H) + 1, dx, i * sh2, W, sh2 + 1); } g.filter = 'none';
    const rg = g.createRadialGradient(W / 2, H / 2, W * 0.35, W / 2, H / 2, H * 0.62); rg.addColorStop(0, 'rgba(255,255,255,0)'); rg.addColorStop(1, 'rgba(255,255,255,.85)'); g.fillStyle = rg; g.fillRect(0, 0, W, H);
  } else g.drawImage(cv, 0, 0, W, H);
  g.restore();
  if (sh.flash != null) { const k = t - sh.flash, a = k < 0 ? 0 : k < 0.27 ? 0 : k < 0.6 ? 1 - (k - 0.27) / 0.33 : 0; const pre = Math.max(0, 1 - Math.abs(k) / 0.27); g.save(); g.globalAlpha = Math.max(a, pre) * 0.9 * alpha; g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); g.restore(); }
  overlays(g, t, alpha);
}
function overlays(g, t, alpha) {
  if (OV.badge) badge(g, t, OV.badge, alpha);
  if (OV.counter && OV.counter.n > 0) { g.save(); g.globalAlpha = alpha; if (!OV.badge) text(g, `${OV.counter.n}`, W / 2, 1180, { font: "'Oswald'", weight: 700, size: 220, color: '#f6d24a', align: 'center', stroke: '#2a1c17', strokeWidth: 26 }); g.restore(); }
  if (OV.count) { const p = ezo(span(t, OV.count.t0, 0.25)); g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1180); g.scale(0.7 + 0.3 * p, 0.7 + 0.3 * p); text(g, OV.count.txt, 0, 0, { font: "'Oswald'", weight: 700, size: 380, color: '#ffffff', align: 'center', stroke: '#2a1c17', strokeWidth: 34 });
    text(g, OV.count.txt === '1' ? 'കപ്പൽ' : 'കപ്പലുകൾ', 0, 250, { font: ML, weight: 800, size: 96, color: '#f6d24a', align: 'center', stroke: '#2a1c17', strokeWidth: 18 }); g.restore(); }
  if (OV.plate) nameplate(g, t, OV.plate.t0, alpha);
}
function badge(g, t, b, alpha) {
  const p = ezo(span(t, b.t0, 0.27)); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1480); g.rotate(-0.04); g.scale(0.8 + 0.2 * p, 0.8 + 0.2 * p);
  g.font = `800 88px ${ML}`; const w = Math.min(980, g.measureText(b.txt).width + 120);
  g.fillStyle = '#f6d24a'; g.strokeStyle = '#2a1c17'; g.lineWidth = 10; g.beginPath(); g.roundRect(-w / 2, -90, w, b.sub ? 230 : 180, 26); g.fill(); g.stroke();
  text(g, b.txt, 0, 0, { font: ML, weight: 800, size: 88, color: '#2a1c17', align: 'center', maxWidth: w - 60 }); if (b.sub) text(g, b.sub, 0, 92, { font: "'Oswald'", weight: 700, size: 58, color: '#8a1e1e', align: 'center' }); g.restore();
}
function nameplate(g, t, a0, alpha) {
  const p = ezo(span(t, a0, 0.35)); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 640 - (1 - p) * 40);
  g.fillStyle = '#f4ecd6'; g.strokeStyle = '#2a1c17'; g.lineWidth = 7; g.beginPath(); g.roundRect(-440, -78, 880, 156, 18); g.fill(); g.stroke();
  g.fillStyle = '#1f3a6a'; g.fillRect(-440, -78, 880, 14);
  text(g, 'ഇന്ന്, യഥാർത്ഥത്തിൽ', 0, -16, { font: ML, weight: 800, size: 40, color: '#1f3a6a', align: 'center' }); text(g, 'വിഴിഞ്ഞം തുറമുഖം ✔', 0, 50, { font: ML, weight: 800, size: 60, color: '#2a1c17', align: 'center' }); g.restore();
}
// captions: 1-2 words at the very top (owner's call)
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
  if (prev && prev.set !== sh.set && t < sh.a + XF) { renderShot(g, prev, t); renderShot(g, sh, t, ez((t - sh.a) / XF)); }
  else renderShot(g, sh, t);
  captions(g, s);
}
function end(g, s) { main(g, s); }
export const scenes = { main, end };
export const hits = [];
export const extraHits = (timeline) => {
  const m = timeline.scenes.find((x) => x.id === 'main'), out = []; const s = { line: (i) => m.cues[i]?.text, cue: (i) => m.cues[i].start, cueEnd: (i) => m.cues[i].end };
  const sh = shots(s); sh.forEach((x, i) => { if (!i) return; const cut = sh[i - 1].set !== x.set; if (cut || i % 4 === 0) out.push({ t: m.start + x.a - 0.15, kind: 'whoosh', vol: cut ? 0.22 : 0.1 }); });
  const at = (i, n) => m.start + wt(s, i, n), add = (t, kind, vol) => out.push({ t, kind, vol });
  add(m.start + 0.05, 'chime', 0.3); for (let k = 0; k < 3; k++) add(m.start + 0.3 + k * 0.38, 'thud', 0.2); add(at(0, 'ഗൾഫിലേക്കല്ല') + 0.3, 'whoosh', 0.35); add(at(0, 'ഗൾഫിലേക്കല്ല') + 0.7, 'thud', 0.4); add(at(0, 'ഗൾഫുകാർ'), 'pop', 0.35); add(at(0, 'ജോലി'), 'chime', 0.35);
  add(at(1, 'നോക്കൂ'), 'pop', 0.3); add(at(1, 'കറുത്ത'), 'tick', 0.35); add(at(1, 'തോറിയം'), 'chime', 0.45); add(at(1, 'തോറിയം') + 0.05, 'pop', 0.35);
  for (let k = 0; k < 3; k++) add(at(2, 'പട്ടാളം') + k * 0.38, 'thud', 0.25); add(at(2, 'നാണയം') + 0.1, 'coin', 0.45); for (let k = 0; k < 7; k++) add(at(2, 'അന്നത്തെ') + 0.25 + k * 0.28, 'coin', 0.15); add(at(2, 'ഇരുപത്തിയെട്ട്') + 0.4, 'pop', 0.45);
  add(at(3, 'ചിരിക്കും'), 'pop', 0.3); add(at(3, 'ഐഫോൺ'), 'tick', 0.4); add(at(3, 'പറ്റും...'), 'hit', 0.3); add(at(3, 'ചാക്ക്') + 0.35, 'boom', 0.35); for (let k = 0; k < 6; k++) add(at(3, 'ചാക്ക്') + 0.4 + k * 0.12, 'coin', 0.2);
  add(at(4, 'രഹസ്യ'), 'tick', 0.3); add(at(4, 'അതൊന്നുമല്ല'), 'pop', 0.25); add(at(4, 'വിഴിഞ്ഞമാണ്'), 'boom', 0.55); add(at(4, 'വിഴിഞ്ഞമാണ്') + 0.3, 'horn', 0.45); add(at(4, 'കപ്പൽപ്പാതയിൽ'), 'chime', 0.3); add(at(4, 'പത്ത്'), 'pop', 0.4); add(at(4, 'ദേശീയപാത'), 'horn', 0.35);
  add(m.start + s.cue(5) + 0.9, 'pop', 0.35); add(at(5, 'പത്ത്.'), 'pop', 0.4); add(at(5, 'നൂറ്'), 'boom', 0.45); add(at(5, 'നൂറ്') + 0.1, 'horn', 0.3);
  add(m.start + s.cue(6), 'hit', 0.35); add(at(6, 'സ്വപ്നമാണോ'), 'chime', 0.2);
  add(m.start + s.cue(7), 'boom', 0.5); add(at(7, 'വിഴിഞ്ഞം') + 0.1, 'pop', 0.4); add(at(7, 'ചരക്കുകപ്പലുകൾ'), 'horn', 0.55); add(at(7, 'നങ്കൂരമിട്ടു') + 0.35, 'thud', 0.5);
  add(m.start + s.cue(8) + 0.1, 'chime', 0.3); add(at(8, 'ഇന്ത്യയുടെ'), 'whoosh', 0.2); add(at(8, 'കടലിലേക്കിറങ്ങുന്നു'), 'horn', 0.4);
  add(at(9, 'എന്നറിയില്ല'), 'pop', 0.25); add(at(9, 'ലോകം'), 'chime', 0.45); add(at(9, 'വന്നുതുടങ്ങി'), 'horn', 0.4);
  return out;
};
void H;
export const shotTimes = (timeline) => { const m = timeline.scenes.find((x) => x.id === 'main'); const s = { line: (i) => m.cues[i]?.text, cue: (i) => m.cues[i].start, cueEnd: (i) => m.cues[i].end }; return shots(s).map((x) => ({ a: m.start + x.a, b: m.start + x.b, set: x.set })); };
