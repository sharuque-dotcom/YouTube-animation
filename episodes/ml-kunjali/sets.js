// Kunjali Marakkar sets.
// seaSet: the Malabar coast (ml-bean beach as the base) with Portuguese carracks offshore, a fleet of Marakkar paroes,
//   a merchant dhow that can sink (no pass), the Portuguese fort at Chaliyam that crumbles stone by stone, and
//   Kunjali's laterite fort at Kottakkal on the river mouth.
// goaSet: Goa, 1600: a whitewashed church square with a wooden scaffold (only ever shown in silhouette / cut away),
//   a pillory column, crowd space and the quay where the salt box is loaded.
// palace: ml-colachel's palace courtyard redressed as the Zamorin's court (chapel/tomb/walls hidden).
// navySet: a modern Indian Navy gate, "INS KUNJALI", with a grey warship on the water.
import * as K from '../../pipeline/toon3d.js';
import { carrack, paroe } from './ship.js';
const THREE = K.THREE;
const glow = (c) => new THREE.MeshBasicMaterial({ color: c });
const label = (lines, o = {}) => K.signTex(lines, { w: 512, h: 200, bg: '#f4ecd6', fg: '#2a1c17', border: '#2a1c17', aged: true, ...o });
function signPlane(w, h, tex, basic = false) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), basic ? new THREE.MeshBasicMaterial({ map: tex, transparent: true }) : new THREE.MeshLambertMaterial({ map: tex, transparent: true })); m.receiveShadow = true; return m; }
function flag(life, tex, w = 1.6, h = 1.0, pole = 4) { const g = new THREE.Group(); const p = K.mesh(new THREE.CylinderGeometry(0.05, 0.06, pole, 6), K.col(0x4a3020)); p.position.y = pole / 2; g.add(p);
  const geo = new THREE.PlaneGeometry(w, h, 10, 1); geo.translate(w / 2, 0, 0); const f = K.mesh(geo, new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide }), { shadow: false }); f.position.y = pole - h / 2; g.add(f);
  const p0 = geo.attributes.position.array.slice(); life.push((t) => { const a = geo.attributes.position; for (let i = 0; i < a.count; i++) { const x = p0[i * 3]; a.setZ(i, Math.sin(x * 3 - t * 5) * 0.09 * x); } a.needsUpdate = true; }); return g; }
export const portFlagTex = () => K.paint(160, 100, (g, w, h) => { g.fillStyle = '#fbfaf6'; g.fillRect(0, 0, w, h); g.fillStyle = '#c8312c'; g.fillRect(w / 2 - 9, 10, 18, h - 20); g.fillRect(20, h / 2 - 9, w - 40, 18); g.strokeStyle = '#2a1c17'; g.lineWidth = 5; g.strokeRect(2, 2, w - 4, h - 4); });
const redFlagTex = () => K.paint(160, 100, (g, w, h) => { g.fillStyle = '#c8312c'; g.fillRect(0, 0, w, h); g.strokeStyle = '#e8b93a'; g.lineWidth = 8; g.strokeRect(12, 12, w - 24, h - 24); g.strokeStyle = '#2a1c17'; g.lineWidth = 5; g.strokeRect(2, 2, w - 4, h - 4); });

function dhow(color = 0x7a4a2a) { const g = new THREE.Group(); const h = K.mesh(new THREE.CylinderGeometry(0.9, 0.9, 7, 14, 1, false, Math.PI / 2, Math.PI), new THREE.MeshLambertMaterial({ color, side: THREE.DoubleSide })); h.rotation.z = Math.PI / 2; h.position.y = 0.9; g.add(h);
  const m = K.mesh(new THREE.CylinderGeometry(0.08, 0.1, 5, 6), K.col(0x4a3020)); m.position.set(0.4, 3.4, 0); g.add(m); const sh = new THREE.Shape(); sh.moveTo(-3, 1); sh.lineTo(3, 5.6); sh.lineTo(1.2, 0.8); sh.closePath();
  const s = K.mesh(new THREE.ShapeGeometry(sh), new THREE.MeshLambertMaterial({ color: 0xe8dcc0, side: THREE.DoubleSide })); s.position.set(0.4, 0.8, 0.05); g.add(s);
  for (let k = 0; k < 3; k++) { const sack = K.mesh(new THREE.SphereGeometry(0.4, 8, 6), K.mat(K.stdTextures().sack)); sack.scale.y = 0.7; sack.position.set(-2 + k * 0.9, 1.2, 0); g.add(sack); } return g; }

export function seaSet(base) {
  const b = base, sc = b.scene, T = K.stdTextures(); b.ship.visible = false; b.setGlow(0, 0); b.sparks.forEach((s) => { s.visible = false; });
  sc.children.forEach((o) => { if (o.isGroup && Math.abs(o.position.x + 1.8) < 0.01 && Math.abs(o.position.z - 0.4) < 0.01) o.visible = false; }); // the 1947 joke sign
  sc.traverse((o) => { if (!o.isMesh) return; if (o.material?.wireframe) o.visible = false; if (o.geometry?.type === 'CylinderGeometry' && o.position.x > 8.5 && o.position.x < 14.5 && o.position.z < -1.5 && o.position.z > -3.6) o.visible = false; }); // the fishing net
  // Portuguese carracks offshore
  b.carracks = [[10, -40, 0.5], [-14, -52, 0.3], [30, -60, 0.9]].map(([x, z, r], i) => { const s = carrack({ life: b.life, seed: i + 3 }); s.position.set(x, 0.6, z); s.rotation.y = -Math.PI / 2 + r; s.scale.setScalar(0.8); sc.add(s); s.userData.home = s.position.clone(); return s; });
  b.life.push((t) => b.carracks.forEach((s, i) => { s.position.y = 0.6 + Math.sin(t * 0.8 + i) * 0.15; s.rotation.z = Math.sin(t * 0.6 + i * 2) * 0.02; }));
  // Marakkar paroe fleet (hidden until needed; placed per shot)
  b.paroes = []; for (let i = 0; i < 8; i++) { const p = paroe({ life: b.life, seed: i, sail: i % 3 === 0 ? '#f2e6c8' : i % 3 === 1 ? '#e8d4a8' : '#f6ecd4', hull: [0x5a3a20, 0x6a4424, 0x4a2e1a][i % 3] }); p.scale.setScalar(0.6); p.visible = false; sc.add(p); b.paroes.push(p); }
  // merchant dhow without a pass, sinks via setSink(u)
  b.dhow = dhow(); b.dhow.position.set(-4, 0.2, -26); b.dhow.rotation.y = 0.4; b.dhow.visible = false; sc.add(b.dhow);
  b.setSink = (u) => { b.dhow.visible = u < 0.999; b.dhow.position.y = 0.2 - u * 3.2; b.dhow.rotation.z = u * 0.6; b.dhow.rotation.x = u * 0.25; };
  b.splash = []; for (let k = 0; k < 10; k++) { const m = K.mesh(new THREE.SphereGeometry(1, 10, 8), new THREE.MeshLambertMaterial({ color: 0xf2f8ff, transparent: true, opacity: 0.9 }), { shadow: false }); m.visible = false; sc.add(m); b.splash.push(m); }
  b.boom = []; for (let k = 0; k < 12; k++) { const m = K.mesh(new THREE.SphereGeometry(1, 14, 10), glow([0xffd060, 0xff8a2a, 0xffb040][k % 3]), { shadow: false }); m.userData.noInk = true; m.visible = false; sc.add(m); b.boom.push(m); }
  b.smoke = []; for (let k = 0; k < 12; k++) { const m = K.mesh(new THREE.SphereGeometry(1, 12, 8), new THREE.MeshLambertMaterial({ color: 0x5a5a60, transparent: true, opacity: 0.8 }), { shadow: false }); m.visible = false; sc.add(m); b.smoke.push(m); }
  // Chaliyam: the Portuguese fort (whitewashed walls, round bastions, cross flag); setRuin(u) drops it stone by stone
  const ch = new THREE.Group(); ch.position.set(16, 0, -6); ch.rotation.y = -0.5; sc.add(ch); b.chaliyam = ch; b.stones = [];
  const wallW = 9, rows = 5, cols = 9; for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) for (const z of [-2.5, 2.5]) { const s = K.box(wallW / cols - 0.04, 0.58, 0.8, T.lime, { tileM: 1 }); s.position.set(-wallW / 2 + (c + 0.5) * wallW / cols, 0.3 + r * 0.6, z); ch.add(s); s.userData = { home: s.position.clone(), r, c, z, d: (Math.sin(r * 7.1 + c * 3.3 + z) + 1) / 2 }; b.stones.push(s); }
  for (const x of [-5, 5]) for (const z of [-2.5, 2.5]) { const tw = K.mesh(new THREE.CylinderGeometry(1, 1.15, 3.6, 14), K.mat(T.lime)); tw.position.set(x, 1.8, z); ch.add(tw); tw.userData = { home: tw.position.clone(), r: 6, d: (x + z + 10) / 20 }; b.stones.push(tw);
    const cap = K.mesh(new THREE.ConeGeometry(1.2, 1, 14), K.col(0xa8452e)); cap.position.set(x, 4.1, z); ch.add(cap); cap.userData = { home: cap.position.clone(), r: 7, d: (x - z + 10) / 20 }; b.stones.push(cap); }
  const pf = flag(b.life, portFlagTex(), 1.8, 1.1, 3.2); pf.position.set(0, 3, 0); ch.add(pf); pf.userData = { home: pf.position.clone(), r: 8, d: 0.5 }; b.stones.push(pf);
  const chSign = signPlane(3.4, 1.1, label(['ചാലിയം കോട്ട'], { bg: '#fbfaf6' })); chSign.position.set(0, 1.6, 2.95); ch.add(chSign); chSign.userData = { home: chSign.position.clone(), r: 2, d: 0.4 }; b.stones.push(chSign);
  b.rubble = []; for (let k = 0; k < 30; k++) { const s = K.box(0.4 + (k % 3) * 0.2, 0.25, 0.4, T.lime, { tileM: 1 }); s.position.set(((k * 37) % 100) / 100 * 10 - 5, 0.12, ((k * 53) % 100) / 100 * 6 - 3); s.rotation.y = k; s.visible = false; ch.add(s); b.rubble.push(s); }
  b.setRuin = (u) => { b.stones.forEach((s) => { const d = s.userData; const k = THREE.MathUtils.clamp((u - d.d * 0.5 - (7 - Math.min(d.r, 7)) * 0.02) / 0.35, 0, 1); s.visible = k < 0.98; s.position.y = d.home.y * (1 - k * k) - k * 0.4; s.rotation.z = k * (d.d - 0.5) * 2; s.position.x = d.home.x + k * (d.d - 0.5) * 3; }); b.rubble.forEach((r, i) => { r.visible = u > 0.3 + (i % 10) * 0.03; }); };
  // Kottakkal: Kunjali's laterite fort at the river mouth, red Marakkar flag
  const kt = new THREE.Group(); kt.position.set(-16, 0, -5); kt.rotation.y = 0.5; sc.add(kt); b.kottakkal = kt;
  [[0, -3, 10, 0], [0, 3, 10, 0], [-5, 0, 6, 1], [5, 0, 6, 1]].forEach(([x, z, w, r]) => { const wl = K.box(w, 2.6, 0.9, T.laterite, { tileM: 1.2 }); wl.position.set(x, 1.3, z); if (r) wl.rotation.y = Math.PI / 2; kt.add(wl);
    for (let k = 0; k < w / 1.2; k++) { const m = K.box(0.5, 0.45, 0.9, T.laterite, { tileM: 1.2 }); m.position.set(r ? x : x - w / 2 + 0.6 + k * 1.2, 2.8, r ? z - w / 2 + 0.6 + k * 1.2 : z); if (r) m.rotation.y = Math.PI / 2; kt.add(m); } });
  for (const [x, z] of [[-5, -3], [5, -3], [-5, 3], [5, 3]]) { const tw = K.mesh(new THREE.CylinderGeometry(1.1, 1.3, 3.6, 12), K.mat(T.laterite)); tw.position.set(x, 1.8, z); kt.add(tw); }
  const kf = flag(b.life, redFlagTex(), 1.8, 1.1, 3.4); kf.position.set(5, 3.6, 3); kt.add(kf);
  const ktSign = signPlane(3.4, 1.1, label(['കോട്ടക്കൽ'], { bg: '#f4e2c0' })); ktSign.position.set(0, 1.5, 3.47); kt.add(ktSign);
  return b;
}

export function goaSet() {
  const T = K.stdTextures(), scene = new THREE.Scene(), life = [];
  scene.background = K.skyTexture({ seed: 61, clouds: 7, top: '#6a7a9a', mid: '#c8a088', bottom: '#f2d0a0' }); scene.fog = new THREE.Fog(0xd8c0a8, 30, 140);
  const cob = K.paint(256, 256, (g, w, h) => { g.fillStyle = '#a8988a'; g.fillRect(0, 0, w, h); const r = K.rnd(8); for (let y = 0; y < h; y += 18) for (let x = (y / 18) % 2 ? 0 : 12; x < w; x += 24) { g.fillStyle = ['#b8a898', '#9a8a7c', '#c4b4a2'][Math.floor(r() * 3)]; g.beginPath(); g.ellipse(x, y, 10, 7, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(42,28,23,.35)'; g.lineWidth = 2; g.stroke(); } }); cob.repeat.set(14, 14);
  const ground = K.mesh(new THREE.PlaneGeometry(140, 140), new THREE.MeshLambertMaterial({ map: cob })); ground.rotation.x = -Math.PI / 2; scene.add(ground);
  // church facade (generic Goan baroque: white, stepped gable, round window, bell arch)
  const ch = new THREE.Group(); const body = K.box(12, 9, 3, T.lime, { tileM: 3 }); body.position.y = 4.5; ch.add(body);
  const gable = K.box(7, 3, 3, T.lime, { tileM: 3 }); gable.position.y = 10.5; ch.add(gable); const top = K.box(3, 2, 3, T.lime, { tileM: 3 }); top.position.y = 13; ch.add(top);
  const cr1 = K.box(0.25, 1.6, 0.25, null, { color: 0xf6f2ea }); cr1.position.set(0, 14.8, 0); ch.add(cr1); const cr2 = K.box(0.9, 0.25, 0.25, null, { color: 0xf6f2ea }); cr2.position.set(0, 15.1, 0); ch.add(cr2);
  const rose = K.mesh(new THREE.CircleGeometry(0.9, 20), K.col(0x2a3a5a)); rose.position.set(0, 10.4, 1.52); ch.add(rose);
  const door = K.box(2.4, 4, 0.2, null, { color: 0x4a2a18 }); door.position.set(0, 2, 1.55); ch.add(door); for (const x of [-4, 4]) { const w = K.box(1.2, 2.2, 0.2, null, { color: 0x2a3a5a }); w.position.set(x, 5.6, 1.55); ch.add(w); const p = K.box(0.6, 9, 0.6, T.lime, { tileM: 1 }); p.position.set(x * 1.4, 4.5, 1.6); ch.add(p); }
  for (const x of [-7.4, 7.4]) { const tw = K.box(3, 13, 3, T.lime, { tileM: 3 }); tw.position.set(x, 6.5, 0); ch.add(tw); const bell = K.box(1.4, 1.8, 0.2, null, { color: 0x2a3a5a }); bell.position.set(x, 11, 1.52); ch.add(bell); const dome = K.mesh(new THREE.SphereGeometry(1.4, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), K.mat(T.lime)); dome.position.set(x, 13, 0); ch.add(dome); }
  ch.position.set(0, 0, -16); scene.add(ch);
  // side houses with tiled roofs
  [[-14, -10, 0.5], [14, -10, -0.5], [-18, 0, 1.2], [18, 0, -1.2]].forEach(([x, z, r], i) => { const h = K.box(6, 4.5, 5, [T.limeYellow, T.limeBlue, T.lime, T.limeYellow][i], { tileM: 2 }); h.position.set(x, 2.25, z); h.rotation.y = r; scene.add(h); const rf = K.roofGable(6.6, 5.6, 1.6, T.tiles, 0.4); rf.position.set(x, 4.5, z); rf.rotation.y = r; scene.add(rf); });
  // scaffold: a wooden platform with steps (the blow is never shown; we cut away to shadow)
  const sca = new THREE.Group(); const deck = K.box(4.4, 0.3, 3.4, T.wood, { tileM: 1 }); deck.position.y = 1.8; sca.add(deck); for (const x of [-2, 2]) for (const z of [-1.5, 1.5]) { const l = K.box(0.25, 1.8, 0.25, T.wood, { tileM: 1 }); l.position.set(x, 0.9, z); sca.add(l); }
  for (let k = 0; k < 4; k++) { const st = K.box(1.4, 0.2, 0.5, T.wood, { tileM: 1 }); st.position.set(2.9, 0.3 + k * 0.42, 1 - k * 0.0); st.position.x = 2.9 + (3 - k) * 0.0; st.position.z = 1.9 + (3 - k) * 0.45; sca.add(st); }
  const drum = K.mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.7, 14), K.col(0xa8452e)); drum.position.set(-3.6, 0.35, 1.4); sca.add(drum);
  sca.position.set(0, 0, -7); scene.add(sca);
  // pillory column (pelourinho)
  const pil = K.mesh(new THREE.CylinderGeometry(0.28, 0.34, 5, 10), K.mat(T.lime)); pil.position.set(-6, 2.5, -8); scene.add(pil); const ball = K.mesh(new THREE.SphereGeometry(0.45, 12, 10), K.mat(T.lime)); ball.position.set(-6, 5.2, -8); scene.add(ball);
  const pf = flag(life, portFlagTex(), 1.8, 1.1, 6); pf.position.set(7, 0, -9); scene.add(pf);
  // quay at the front-right with a boat and the salt box
  const sea = K.mesh(new THREE.PlaneGeometry(60, 40), new THREE.MeshLambertMaterial({ color: 0x3a7a9a, emissive: 0x16405a, emissiveIntensity: 0.4 }), { shadow: false }); sea.rotation.x = -Math.PI / 2; sea.position.set(34, 0.02, 6); scene.add(sea);
  const boat = new THREE.Group(); const bh = K.mesh(new THREE.CylinderGeometry(0.7, 0.7, 5, 14, 1, false, Math.PI / 2, Math.PI), new THREE.MeshLambertMaterial({ color: 0x5a3a20, side: THREE.DoubleSide })); bh.rotation.z = Math.PI / 2; bh.position.y = 0.6; boat.add(bh); boat.position.set(8, 0, 6); boat.rotation.y = 0.2; scene.add(boat);
  const box = new THREE.Group(); const bx = K.box(1.3, 0.9, 0.9, T.wood, { tileM: 1 }); bx.position.y = 0.45; box.add(bx); for (const y of [0.15, 0.75]) { const band = K.box(1.34, 0.1, 0.94, null, { color: 0x3a3a40 }); band.position.y = y; box.add(band); }
  const lbl = signPlane(1.0, 0.42, label(['ഉപ്പ്'], { w: 256, h: 110 })); lbl.position.set(0, 0.48, 0.47); box.add(lbl); const lock = K.box(0.16, 0.2, 0.06, null, { color: 0xc8962a }); lock.position.set(0, 0.8, 0.47); box.add(lock);
  box.position.set(4.5, 0, 5); scene.add(box);
  const kannurSign = signPlane(2.6, 0.9, label(['കണ്ണൂരിലേക്ക്'], { bg: '#f4ecd6' })); kannurSign.position.set(7, 2.2, 3.2); kannurSign.rotation.y = -0.3; scene.add(kannurSign); const post = K.box(0.12, 2, 0.12, T.wood, { tileM: 1 }); post.position.set(7, 1, 3.15); scene.add(post);
  const palms = []; [[-24, -18, 9], [22, -20, 10], [26, -4, 9]].forEach(([x, z, h], i) => { const p = K.palm(h, 0.2, i + 60); p.position.set(x, 0, z); scene.add(p); palms.push(p); }); life.push((t) => palms.forEach((p) => p.userData.sway(t)));
  const sun = new THREE.DirectionalLight(0xfff2e0, 1.5); sun.position.set(14, 16, 12); sun.target.position.set(0, 0, -6); scene.add(sun, sun.target); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005; Object.assign(sun.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 1, far: 80 });
  scene.add(new THREE.HemisphereLight(0xd8e0f0, 0xb89878, 0.95));
  return { scene, life, church: ch, scaffold: sca, saltBox: box, boat, sun };
}

export function dressPalace(f) { // ml-colachel fortSet -> Zamorin's court: hide the 1741 chapel, tomb and Udayagiri walls
  [f.chapel, f.tomb, f.walls].forEach((o) => { if (o) o.visible = false; });
  f.scene.traverse((o) => { if (o.isMesh && o.geometry?.type === 'SphereGeometry' && o.position.y < 0.5 && o.position.x > 12) o.visible = false; if (o.isMesh && o.position.x > 13 && o.position.x < 14 && o.position.y < 0.4) o.visible = false; });
  return f;
}

export function navySet() {
  const T = K.stdTextures(), scene = new THREE.Scene(), life = [];
  scene.background = K.skyTexture({ seed: 77, clouds: 5, top: '#3f8ae0', mid: '#94c8f0', bottom: '#eef4f6' }); scene.fog = new THREE.Fog(0xe6eef4, 50, 220);
  const con = K.paint(256, 256, (g, w, h) => { g.fillStyle = '#c8c4bc'; g.fillRect(0, 0, w, h); K.mottle(g, w, h, ['#b8b4ac', '#d8d4cc'], 200, [6, 30], 4, 0.25); g.strokeStyle = 'rgba(0,0,0,.15)'; g.lineWidth = 2; for (let y = 0; y < h; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } }); con.repeat.set(10, 10);
  const ground = K.mesh(new THREE.PlaneGeometry(120, 60), new THREE.MeshLambertMaterial({ map: con })); ground.rotation.x = -Math.PI / 2; ground.position.z = 10; scene.add(ground);
  const sea = K.mesh(new THREE.PlaneGeometry(400, 200), new THREE.MeshLambertMaterial({ color: 0x2f7ab0, emissive: 0x16405a, emissiveIntensity: 0.4 }), { shadow: false }); sea.rotation.x = -Math.PI / 2; sea.position.set(0, -0.2, -120); scene.add(sea);
  // gate: two white pillars, navy-blue arch board with the name
  const gate = new THREE.Group(); for (const x of [-4, 4]) { const p = K.box(1.2, 6, 1.2, null, { color: 0xf2f2ee }); p.position.set(x, 3, 0); gate.add(p); const capb = K.box(1.5, 0.4, 1.5, null, { color: 0x1a2a5a }); capb.position.set(x, 6.2, 0); gate.add(capb); }
  const boardT = K.signTex(['INS KUNJALI'], { w: 1100, h: 280, bg: '#1a2a5a', fg: '#f6efe0', border: '#e8b93a', font: 'Oswald', weight: 700, aged: false });
  const board = K.mesh(new THREE.BoxGeometry(11, 2.8, 0.4), [K.col(0x1a2a5a), K.col(0x1a2a5a), K.col(0x1a2a5a), K.col(0x1a2a5a), new THREE.MeshLambertMaterial({ map: boardT }), K.col(0x1a2a5a)]); board.position.set(0, 7.4, 0); gate.add(board);
  const bar = K.box(7, 0.25, 0.25, null, { color: 0xc8312c }); bar.position.set(0, 1.1, 0.4); gate.add(bar);
  gate.position.set(0, 0, -4); scene.add(gate);
  const tri = K.paint(180, 120, (g, w, h) => { g.fillStyle = '#ff9933'; g.fillRect(0, 0, w, h / 3); g.fillStyle = '#fbfaf6'; g.fillRect(0, h / 3, w, h / 3); g.fillStyle = '#138808'; g.fillRect(0, 2 * h / 3, w, h / 3); g.strokeStyle = '#000080'; g.lineWidth = 3; g.beginPath(); g.arc(w / 2, h / 2, 15, 0, 7); g.stroke(); for (let k = 0; k < 24; k++) { const a = k * Math.PI / 12; g.beginPath(); g.moveTo(w / 2, h / 2); g.lineTo(w / 2 + Math.cos(a) * 15, h / 2 + Math.sin(a) * 15); g.lineWidth = 1; g.stroke(); } });
  const fl = flag(life, tri, 2.4, 1.6, 9); fl.position.set(7.5, 0, -6); scene.add(fl);
  // grey warship silhouette on the water
  const ws = new THREE.Group(); const hull = K.box(30, 3, 4, null, { color: 0x7a8088 }); hull.position.y = 1.5; ws.add(hull); const sup = K.box(10, 4, 3, null, { color: 0x8a9098 }); sup.position.set(-2, 5, 0); ws.add(sup); const mast = K.box(0.4, 6, 0.4, null, { color: 0x6a7078 }); mast.position.set(-2, 10, 0); ws.add(mast);
  const gun = K.box(3, 0.6, 0.6, null, { color: 0x6a7078 }); gun.position.set(10, 3.6, 0); ws.add(gun); ws.position.set(-10, 0, -60); ws.rotation.y = 0.15; scene.add(ws); life.push((t) => { ws.position.y = Math.sin(t * 0.7) * 0.15; });
  const palms = []; [[-14, -10, 9], [14, -12, 10], [-18, 2, 8]].forEach(([x, z, h], i) => { const p = K.palm(h, 0.2, i + 80); p.position.set(x, 0, z); scene.add(p); palms.push(p); }); life.push((t) => palms.forEach((p) => p.userData.sway(t)));
  const sun = new THREE.DirectionalLight(0xfff0d0, 1.6); sun.position.set(-12, 20, 16); sun.target.position.set(0, 0, -4); scene.add(sun, sun.target); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005; Object.assign(sun.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20, near: 1, far: 80 });
  scene.add(new THREE.HemisphereLight(0xcfe6ff, 0xc8c0b0, 1.0));
  return { scene, life, gate, warship: ws };
}
