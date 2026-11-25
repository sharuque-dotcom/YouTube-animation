// Colachel 1741 sets: the beach (reused) dressed for 1741 with VOC ships, landing boats, cannons, palm-trunk
// fake cannons, the Dutch powder store and fishermen's vallams; plus a laterite fort/palace set (Padmanabhapuram-
// style courtyard with a throne, Udayagiri walls that rise, the chapel with De Lannoy's tomb).
import * as K from '../../pipeline/toon3d.js';
import { dutchShip } from './ship.js';
const THREE = K.THREE;
const glow = (c) => new THREE.MeshBasicMaterial({ color: c });

function cannon(dark = 0x2a2a30) { const g = new THREE.Group(); const barrel = K.mesh(new THREE.CylinderGeometry(0.12, 0.17, 1.5, 12), K.col(dark)); barrel.rotation.z = Math.PI / 2 - 0.2; barrel.position.set(0.15, 0.55, 0); g.add(barrel);
  const car = K.box(1.0, 0.3, 0.5, null, { color: 0x6a3e22 }); car.position.set(0, 0.3, 0); g.add(car); for (const x of [-0.35, 0.35]) for (const z of [-0.28, 0.28]) { const w = K.mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.08, 12), K.col(0x4a3020)); w.rotation.x = Math.PI / 2; w.position.set(x, 0.18, z); g.add(w); } return g; }
function palmCannon() { // a palm trunk on a bullock cart, painted black to look like a gun
  const g = new THREE.Group(); const T = K.stdTextures(); const tr = K.mesh(new THREE.CylinderGeometry(0.16, 0.22, 2.0, 10), K.mat(T.bark, 0x5a4a3a)); tr.rotation.z = Math.PI / 2 - 0.25; tr.position.set(0.2, 0.75, 0); g.add(tr);
  const mouth = K.mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.05, 12), K.col(0x1a1210)); mouth.rotation.z = Math.PI / 2 - 0.25; mouth.position.set(1.17, 1.0, 0); g.add(mouth);
  const cart = K.box(1.4, 0.15, 0.7, T.wood, { tileM: 1 }); cart.position.set(0, 0.45, 0); g.add(cart);
  for (const z of [-0.4, 0.4]) { const w = K.mesh(new THREE.TorusGeometry(0.3, 0.06, 6, 14), K.col(0x5a3a20)); w.position.set(0, 0.32, z); g.add(w); }
  return g; }
function vallam(color) { const g = new THREE.Group(); const hull = K.mesh(new THREE.CylinderGeometry(0.45, 0.45, 4, 12, 1, false, Math.PI / 2, Math.PI), new THREE.MeshLambertMaterial({ color, side: THREE.DoubleSide })); hull.rotation.z = Math.PI / 2; hull.position.y = 0.45; g.add(hull);
  for (const s of [-1, 1]) { const tip = K.mesh(new THREE.ConeGeometry(0.28, 0.8, 8), K.col(color)); tip.rotation.z = -s * Math.PI / 2 - s * 0.5; tip.position.set(s * 2.15, 0.6, 0); g.add(tip); } return g; }

export function dressBeach(b) {
  const sc = b.scene; b.ship.visible = false;
  // hide the thorium joke sign (that's 1947)
  sc.children.forEach((o) => { if (o.isGroup && Math.abs(o.position.x + 1.8) < 0.01 && Math.abs(o.position.z - 0.4) < 0.01) o.visible = false; });
  b.sun = null; b.hemi = null; sc.traverse((o) => { if (o.isDirectionalLight) b.sun = o; if (o.isHemisphereLight) b.hemi = o; }); b.dayBg = sc.background; b.dayFog = sc.fog.color.clone();
  b.nightBg = K.paint(64, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0c1230'); gr.addColorStop(0.6, '#1f2a5a'); gr.addColorStop(1, '#3a3a6a'); g.fillStyle = gr; g.fillRect(0, 0, w, h); const r = K.rnd(4); g.fillStyle = '#fff'; for (let i = 0; i < 90; i++) g.fillRect(r() * w, r() * h * 0.55, 1, 1); });
  b.moon = K.mesh(new THREE.CircleGeometry(3, 24), glow(0xfff4d0), { shadow: false }); b.moon.userData.noInk = true; b.moon.position.set(-30, 40, -120); sc.add(b.moon); b.moon.visible = false;
  b.ships = [[8, -34, 0.6], [-16, -44, 0.4], [26, -52, 0.8]].map(([x, z, r], i) => { const s = dutchShip({ life: b.life, seed: i + 3 }); s.position.set(x, 0.6, z); s.rotation.y = -Math.PI / 2 + r; s.scale.setScalar(0.8); sc.add(s); return s; });
  b.fleet = []; for (let i = 0; i < 9; i++) { const s = dutchShip({ seed: i + 9 }); s.scale.setScalar(0.5); s.position.set(-60 + i * 16, 0.4, -70 - (i % 3) * 14); s.rotation.y = -Math.PI / 2 + 1.2; s.visible = false; sc.add(s); b.fleet.push(s); }
  // landing boats + Dutch cannons on the sand
  b.rowboats = [0, 1].map((k) => { const v = vallam(0x6a3e22); v.position.set(-1.5 + k * 3.4, 0, -9 - k); v.rotation.y = 0.3 - k * 0.5; sc.add(v); return v; });
  b.cannons = [-2.4, -0.6, 1.2].map((x, k) => { const c = cannon(); c.position.set(x, 0, -6.8 - k * 0.4); c.rotation.y = Math.PI / 2 + 0.1 * k; sc.add(c); return c; });
  // the palm-trunk "cannons" lined up on our side
  b.fakes = [-3.2, -1.6, 0, 1.6, 3.2].map((x) => { const c = palmCannon(); c.position.set(x, 0, 3.6); c.rotation.y = Math.PI / 2; sc.add(c); return c; });
  // Dutch powder store: a hut of barrels behind their line
  b.store = new THREE.Group(); const hut = K.box(2.4, 1.6, 1.8, K.stdTextures().wood, { tileM: 1 }); hut.position.y = 0.8; b.store.add(hut); for (let k = 0; k < 5; k++) { const br = K.mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.6, 12), K.col(0x7a4a2a)); br.position.set(-0.9 + k * 0.45, 0.3, 1.1); b.store.add(br); }
  const flagT = K.signTex(['VOC'], { w: 256, h: 120, bg: '#c8312c', fg: '#fbfaf6', border: '#1f4f8a', font: 'Oswald', weight: 700, aged: false }); const fl = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.56), new THREE.MeshLambertMaterial({ map: flagT, side: THREE.DoubleSide })); fl.position.set(0, 2.2, 0.92); b.store.add(fl);
  b.store.position.set(4.5, 0, -8.5); sc.add(b.store);
  b.boom = []; for (let k = 0; k < 14; k++) { const m = K.mesh(new THREE.SphereGeometry(1, 14, 10), glow([0xffd060, 0xff8a2a, 0xffb040][k % 3]), { shadow: false }); m.userData.noInk = true; m.userData.d = [Math.sin(k * 2.3) * 1.6, 0.6 + (k % 4) * 0.7, Math.cos(k * 1.7) * 1.2]; m.visible = false; sc.add(m); b.boom.push(m); }
  b.smoke = []; for (let k = 0; k < 10; k++) { const m = K.mesh(new THREE.SphereGeometry(1, 12, 8), new THREE.MeshLambertMaterial({ color: 0x4a4a50, transparent: true, opacity: 0.8 }), { shadow: false }); m.visible = false; sc.add(m); b.smoke.push(m); }
  b.ball = K.mesh(new THREE.SphereGeometry(0.16, 12, 10), K.col(0x1a1a1e)); b.ball.visible = false; sc.add(b.ball);
  // night blockade: fishermen's vallams circling the ships
  b.night = []; for (let k = 0; k < 8; k++) { const v = vallam([0x3f8aaa, 0xe8763a, 0x4aaa6a][k % 3]); v.scale.setScalar(1.5); v.visible = false; sc.add(v); b.night.push(v); }
  b.torches = b.night.map(() => { const t = K.mesh(new THREE.SphereGeometry(0.55, 10, 8), glow(0xffb040), { shadow: false }); t.userData.noInk = true; t.visible = false; sc.add(t); return t; });
  // white flag of surrender
  b.white = new THREE.Group(); const pole = K.mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.6, 6), K.col(0x6a4a2a)); pole.position.y = 1.3; b.white.add(pole); const wf = K.mesh(new THREE.PlaneGeometry(0.9, 0.6), new THREE.MeshLambertMaterial({ color: 0xfbfaf6, side: THREE.DoubleSide }), { shadow: false }); wf.position.set(0.45, 2.3, 0); b.white.add(wf); b.whiteF = wf; b.white.position.set(0.3, 0, -6.2); sc.add(b.white);
  b.setNight = (n) => { sc.background = n ? b.nightBg : b.dayBg; sc.fog.color.set(n ? 0x1a2040 : b.dayFog); b.sun.intensity = n ? 1.1 : 1.6; b.sun.color.set(n ? 0x8aa8ff : 0xfff0d0); b.hemi.intensity = n ? 1.1 : 1.0; b.moon.visible = !!n; };
}

export function fortSet() {
  const T = K.stdTextures(), scene = new THREE.Scene(), life = [];
  scene.background = K.skyTexture({ seed: 44, clouds: 6, top: '#4f95e0', mid: '#94c8f0', bottom: '#f2ecd8' }); scene.fog = new THREE.Fog(0xe6eef0, 40, 160);
  const g0 = K.mesh(new THREE.PlaneGeometry(300, 300), K.mat(T.grass)); const gt = T.grass.clone(); gt.repeat.set(80, 80); gt.needsUpdate = true; g0.material = new THREE.MeshLambertMaterial({ map: gt }); g0.rotation.x = -Math.PI / 2; scene.add(g0);
  const yard = K.mesh(new THREE.PlaneGeometry(14, 12), new THREE.MeshLambertMaterial({ map: (() => { const t = T.dirt.clone(); t.repeat.set(3, 3); t.needsUpdate = true; return t; })() })); yard.rotation.x = -Math.PI / 2; yard.position.set(0, 0.01, -1); scene.add(yard);
  // palace hall at the back: laterite plinth, carved wooden pillars, sloping tiled roof
  const plinth = K.box(9, 0.6, 3.6, T.laterite, { tileM: 1.2 }); plinth.position.set(0, 0.3, -5.6); scene.add(plinth);
  for (const i of [0, 1, 4, 5]) { const p = K.box(0.28, 3, 0.28, T.wood, { tileM: 1 }); p.position.set(-3.8 + i * 1.52, 2.1, -4.0); scene.add(p); }
  const wallB = K.box(9, 3.2, 0.3, T.lime, { tileM: 2 }); wallB.position.set(0, 2.2, -7.3); scene.add(wallB);
  const roof = K.roofGable(9.4, 4.2, 1.6, T.tiles, 0.6); roof.position.set(0, 3.6, -5.6); scene.add(roof);
  // throne
  const throne = new THREE.Group(); const seat = K.box(1.2, 0.5, 0.9, null, { color: 0xc8312c }); seat.position.y = 0.85; throne.add(seat); const back = K.box(1.3, 1.8, 0.2, null, { color: 0xe8b93a }); back.position.set(0, 1.6, -0.45); throne.add(back);
  const umb = K.mesh(new THREE.ConeGeometry(1.0, 0.5, 16), K.col(0xf6f0e2)); umb.position.set(0, 3.2, -0.2); throne.add(umb); const st = K.mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.2, 6), K.col(0xe8b93a)); st.position.set(0, 2.6, -0.2); throne.add(st);
  throne.position.set(0, 0.6, -5.4); scene.add(throne);
  // Udayagiri walls (rise in the montage) + bastion
  const walls = new THREE.Group(); [[-9, 0, 0.2], [9, 0, -0.2], [0, 6, 0]].forEach(([x, z, r], i) => { const w = K.box(i === 2 ? 18 : 12, 3.4, 1.2, T.laterite, { tileM: 1.2 }); w.position.set(x, 1.7, z - 2); w.rotation.y = i === 2 ? 0 : Math.PI / 2 + r; walls.add(w);
    for (let k = -5; k <= 5; k++) { const m = K.box(0.6, 0.5, 1.2, T.laterite, { tileM: 1.2 }); m.position.set(i === 2 ? x + k * 1.6 : x, 3.65, i === 2 ? z - 2 : z - 2 + k * 1.1); walls.add(m); } });
  const bast = K.mesh(new THREE.CylinderGeometry(1.8, 2.1, 4.2, 14), K.mat(T.laterite)); bast.position.set(-9, 2.1, 4); walls.add(bast);
  walls.position.set(0, 0, 4); scene.add(walls);
  // chapel with De Lannoy's tomb (Udayagiri)
  const chapel = new THREE.Group(); const cw = K.box(4, 3, 4, T.lime, { tileM: 2 }); cw.position.y = 1.5; chapel.add(cw); const croof = K.roofGable(4.4, 4.4, 1.4, T.tiles, 0.3); croof.position.y = 3; chapel.add(croof);
  const cross = new THREE.Group(); const c1 = K.box(0.12, 0.9, 0.12, null, { color: 0xf2eee4 }); cross.add(c1); const c2 = K.box(0.5, 0.12, 0.12, null, { color: 0xf2eee4 }); c2.position.y = 0.15; cross.add(c2); cross.position.set(0, 4.9, 2.1); chapel.add(cross);
  const door = K.box(1.2, 2.0, 0.1, null, { color: 0x1a1210 }); door.position.set(0, 1.0, 2.02); chapel.add(door);
  chapel.position.set(14, 0, -2); chapel.rotation.y = -0.4; scene.add(chapel);
  const tombT = K.paint(512, 256, (g, w, h) => { g.fillStyle = '#d8d0bc'; g.fillRect(0, 0, w, h); K.mottle(g, w, h, ['#c8c0aa', '#e8e2d0'], 90, [8, 30], 7, 0.3); g.fillStyle = '#3a2a20'; g.textAlign = 'center'; g.font = "700 52px 'Oswald'"; g.fillText('E. DE LANNOY', w / 2, 92); g.font = "700 40px 'Oswald'"; g.fillText('1715 – 1777', w / 2, 152); g.font = "800 34px 'Noto Malayalam'"; g.fillText('വലിയ കപ്പിത്താൻ', w / 2, 210); g.strokeStyle = '#3a2a20'; g.lineWidth = 8; g.strokeRect(6, 6, w - 12, h - 12); });
  const tomb = K.mesh(new THREE.BoxGeometry(1.6, 0.3, 0.8), [K.col(0xc8c0aa), K.col(0xc8c0aa), new THREE.MeshLambertMaterial({ map: tombT }), K.col(0xc8c0aa), K.col(0xc8c0aa), K.col(0xc8c0aa)]); tomb.position.set(12.6, 0.15, 1.4); tomb.rotation.y = -0.4; scene.add(tomb);
  const candle = K.mesh(new THREE.SphereGeometry(0.07, 8, 6), glow(0xffd070), { shadow: false }); candle.userData.noInk = true; candle.scale.setScalar(0.6); candle.position.set(13.55, 0.42, 1.25); scene.add(candle); const cst = K.box(0.06, 0.15, 0.06, null, { color: 0xf2eee4 }); cst.position.set(13.55, 0.34, 1.25); scene.add(cst);
  const palms = []; [[-6, -12, 9], [6, -13, 10], [16, -8, 8], [20, 6, 9], [-14, 10, 9]].forEach(([x, z, h], i) => { const p = K.palm(h, 0.2, i + 20); p.position.set(x, 0, z); scene.add(p); palms.push(p); }); life.push((t) => palms.forEach((p) => p.userData.sway(t)));
  const sun = new THREE.DirectionalLight(0xfff0d0, 1.6); sun.position.set(-10, 18, 14); sun.target.position.set(0, 0, -2); scene.add(sun, sun.target); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005; Object.assign(sun.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20, near: 1, far: 60 });
  const hemi = new THREE.HemisphereLight(0xcfe6ff, 0xd8b078, 1.0); scene.add(hemi);
  const dayBg = scene.background, duskBg = K.skyTexture({ seed: 45, clouds: 4, top: '#3a3a7a', mid: '#c86a5a', bottom: '#f2b070' });
  return { scene, life, throne, walls, chapel, tomb, setDusk(d) { scene.background = d ? duskBg : dayBg; sun.color.set(d ? 0xffa060 : 0xfff0d0); sun.intensity = d ? 0.9 : 1.6; hemi.intensity = d ? 0.6 : 1.0; } };
}
