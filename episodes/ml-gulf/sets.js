// Gulf boom sets (all our own): the night launch off the Gulf coast, the oil desert of 1973, the Kerala home plot
// (tiled house -> Gulf mansion, the meter wired to the neighbour), the 1990 airlift tarmac, and dressing for the
// reused beach (callback ending) and street (employment-exchange queue).
import * as K from '../../pipeline/toon3d.js';
const THREE = K.THREE;
const glow = (c, o = {}) => new THREE.MeshBasicMaterial({ color: c, ...o });
const noInk = (m) => { m.userData.noInk = true; return m; };
const plane = (w, h, map, o = {}) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map, transparent: !!o.transparent, side: o.side || THREE.FrontSide }));

function animSea(scene, life, { color = 0x1d3a6a, emissive = 0x0a1a3a, ei = 0.6, w = 400, d = 220, z = -60, amp = 1 } = {}) {
  const geo = new THREE.PlaneGeometry(w, d, 140, 80); const sea = K.mesh(geo, new THREE.MeshLambertMaterial({ color, emissive, emissiveIntensity: ei }), { shadow: false }); sea.rotation.x = -Math.PI / 2; sea.position.set(0, 0, z); scene.add(sea);
  const p0 = geo.attributes.position.array.slice(); life.push((t) => { const a = geo.attributes.position; for (let i = 0; i < a.count; i++) { const x = p0[i * 3], y = p0[i * 3 + 1]; a.setZ(i, (Math.sin(x * 0.35 + t * 1.3) * 0.14 + Math.sin(y * 0.5 - t * 1.7) * 0.2 + Math.sin((x + y) * 1.3 + t * 2.4) * 0.05) * amp); } a.needsUpdate = true; geo.computeVertexNormals(); });
  return sea;
}
function nightSky(seed = 5) {
  return K.paint(256, 1024, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#060a1e'); gr.addColorStop(0.55, '#14204a'); gr.addColorStop(0.85, '#2a3466'); gr.addColorStop(1, '#4a4470'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const r = K.rnd(seed); for (let i = 0; i < 260; i++) { const y = r() * h * 0.7; g.globalAlpha = 0.3 + r() * 0.7; g.fillStyle = r() > 0.85 ? '#ffe9b0' : '#ffffff'; g.fillRect(r() * w, y, r() > 0.9 ? 2 : 1, r() > 0.9 ? 2 : 1); } g.globalAlpha = 1; });
}
function lantern(color = 0xffb84a, power = 10, dist = 9) { const g = new THREE.Group(); const b = noInk(K.mesh(new THREE.SphereGeometry(0.12, 10, 8), glow(0xffe0a0), { shadow: false })); g.add(b); const L = new THREE.PointLight(color, power, dist, 1.6); g.add(L); g.userData.light = L; return g; }
// wooden launch: long hull, wheelhouse, a mast with a lantern
export function launchBoat(T) {
  const g = new THREE.Group(); const hull = K.mesh(new THREE.CylinderGeometry(1.4, 1.4, 11, 18, 1, false, Math.PI / 2, Math.PI), new THREE.MeshLambertMaterial({ map: T.wood, color: 0x8a5a34, side: THREE.DoubleSide }));
  hull.rotation.z = Math.PI / 2; hull.scale.set(1, 1, 0.75); hull.position.y = 1.2; g.add(hull);
  const bow = K.mesh(new THREE.ConeGeometry(1.05, 2.6, 14, 1, false, 0, Math.PI), K.mat(T.wood, 0x7a4a2a)); bow.rotation.z = -Math.PI / 2 - 0.35; bow.position.set(6.4, 1.6, 0); g.add(bow);
  const deck = K.box(11, 0.12, 2.0, T.wood, { tileM: 1 }); deck.position.y = 1.2; g.add(deck);
  const stripe = K.box(11.1, 0.18, 2.12, null, { color: 0x2f6a8a }); stripe.position.y = 1.05; g.add(stripe);
  const cab = K.box(2.6, 1.5, 1.7, T.wood, { tileM: 1 }); cab.position.set(-3.2, 2.0, 0); g.add(cab); const cr = K.box(3.0, 0.14, 2.0, null, { color: 0x3a2a20 }); cr.position.set(-3.2, 2.8, 0); g.add(cr);
  const win = noInk(K.mesh(new THREE.PlaneGeometry(1.6, 0.5), glow(0xffcf7a))); win.position.set(-3.2, 2.2, 0.86); g.add(win);
  const mast = K.mesh(new THREE.CylinderGeometry(0.07, 0.09, 6, 8), K.mat(T.wood)); mast.position.set(1.2, 4.2, 0); g.add(mast);
  const lt = lantern(0xffb84a, 30, 16); lt.position.set(1.2, 6.9, 0); g.add(lt); g.userData.lantern = lt;
  for (let i = 0; i < 5; i++) { const bx = K.box(0.6, 0.45, 0.5, null, { color: [0xb8925a, 0x8a6a4a, 0xc8a468][i % 3] }); bx.position.set(3.4 - i * 0.7, 1.5, (i % 2 ? 0.4 : -0.4)); g.add(bx); }
  return g;
}

// ------------------------------------------------------------------ 1. NIGHT LAUNCH off a rocky Gulf coast
export function launchSet() {
  const T = K.stdTextures(), scene = new THREE.Scene(), life = [];
  scene.background = nightSky(7); scene.fog = new THREE.Fog(0x1a2040, 30, 170);
  animSea(scene, life, { z: -40 });
  const moon = noInk(K.mesh(new THREE.CircleGeometry(4, 28), glow(0xfff4d0), { shadow: false })); moon.position.set(-38, 34, -130); scene.add(moon);
  const halo = noInk(K.mesh(new THREE.CircleGeometry(10, 28), glow(0xbfc8ff, { transparent: true, opacity: 0.15, depthWrite: false }), { shadow: false })); halo.position.set(-38, 34, -131); scene.add(halo);
  // moon path on the water
  const path = noInk(K.mesh(new THREE.PlaneGeometry(6, 120), glow(0xfff0c0, { transparent: true, opacity: 0.12, depthWrite: false }), { shadow: false })); path.rotation.x = -Math.PI / 2; path.position.set(-14, 0.3, -60); path.rotation.z = 0.25; scene.add(path);
  // rocky dark hills of the far shore with a few warm lights
  for (let i = 0; i < 7; i++) { const h = K.mesh(new THREE.ConeGeometry(12 + (i % 3) * 5, 8 + (i % 4) * 3, 6), K.col([0x3a3650, 0x433e5a, 0x342f48][i % 3]), { shadow: false }); h.position.set(-70 + i * 24, 2, -125 - (i % 2) * 8); h.rotation.y = i; scene.add(h); }
  const beachS = K.mesh(new THREE.PlaneGeometry(200, 14), K.col(0x8a7a6a), { shadow: false }); beachS.rotation.x = -Math.PI / 2; beachS.position.set(0, 0.45, -82); scene.add(beachS);
  const lights = []; for (let i = 0; i < 14; i++) { const l = noInk(K.mesh(new THREE.SphereGeometry(0.28, 8, 6), glow(i % 3 ? 0xffc66a : 0xfff2c0), { shadow: false })); l.position.set(-40 + i * 6.3 + Math.sin(i * 3) * 2, 1.2 + (i % 3) * 1.4, -84 + Math.cos(i) * 2); scene.add(l); lights.push(l); }
  life.push((t) => lights.forEach((l, i) => l.scale.setScalar(1 + 0.25 * Math.sin(t * 3 + i * 1.7))));
  const boat = launchBoat(T); boat.position.set(4, 0, -14); boat.rotation.y = -0.35; scene.add(boat);
  life.push((t) => { boat.position.y = Math.sin(t * 1.1) * 0.15; boat.rotation.z = Math.sin(t * 0.9) * 0.03; boat.rotation.x = Math.sin(t * 0.7) * 0.02; boat.userData.lantern.userData.light.intensity = 30 * (1 + 0.08 * Math.sin(t * 11)); });
  // splash rings where the boys hit the water
  const rings = []; for (let i = 0; i < 6; i++) { const r = noInk(K.mesh(new THREE.TorusGeometry(0.5, 0.05, 6, 32), glow(0xe8f4ff, { transparent: true, opacity: 0.8 }), { shadow: false })); r.rotation.x = Math.PI / 2; r.visible = false; scene.add(r); rings.push(r); }
  const splash = []; for (let i = 0; i < 30; i++) { const d = noInk(K.mesh(new THREE.SphereGeometry(0.07, 6, 5), glow(0xf0f8ff), { shadow: false })); d.visible = false; d.userData = { a: i * 2.4, v: 2 + (i % 5) * 0.6 }; scene.add(d); splash.push(d); }
  const key = new THREE.DirectionalLight(0xaabcff, 1.9); key.position.set(-20, 30, -40); key.target.position.set(0, 0, -10); scene.add(key, key.target); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20, near: 1, far: 120 });
  scene.add(new THREE.HemisphereLight(0x7a8ad0, 0x202a50, 1.7));
  return { scene, life, boat, rings, splash, setSplash(x, z, t, t0) { const k = t - t0; rings.forEach((r, i) => { const u = (k - i * 0.25) / 1.4; r.visible = u > 0 && u < 1; r.position.set(x, 0.25, z); r.scale.setScalar(0.4 + u * 3); r.material.opacity = 0.8 * (1 - u); });
    splash.forEach((d) => { const u = k; d.visible = u > 0 && u < 0.8; const v = d.userData.v; d.position.set(x + Math.cos(d.userData.a) * u * 1.2, 0.3 + v * u - 4.9 * u * u, z + Math.sin(d.userData.a) * u * 1.2); }); } };
}

// ------------------------------------------------------------------ 2. OIL DESERT, 1973
export function desertSet() {
  const T = K.stdTextures(), scene = new THREE.Scene(), life = [];
  scene.background = K.skyTexture({ seed: 31, clouds: 2, top: '#3f7ad0', mid: '#a8c8e8', bottom: '#f6e2b0' }); scene.fog = new THREE.Fog(0xf0dcb0, 40, 220);
  const sandT = K.paint(512, 512, (g, w, h) => { g.fillStyle = '#e6be78'; g.fillRect(0, 0, w, h); K.mottle(g, w, h, ['#d8a860', '#f2d496', '#c89858'], 500, [8, 50], 33, 0.3); g.strokeStyle = 'rgba(160,110,50,.25)'; g.lineWidth = 3; for (let y = 0; y < h; y += 18) { g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * 0.05 + y) * 5); g.stroke(); } });
  sandT.repeat.set(30, 30);
  const geo = new THREE.PlaneGeometry(400, 400, 100, 100); const pa = geo.attributes.position; for (let i = 0; i < pa.count; i++) { const x = pa.getX(i), y = pa.getY(i); const far = Math.min(1, Math.max(0, (-y - 10) / 40)) + Math.min(1, Math.abs(x) / 60) * 0.5; pa.setZ(i, (Math.sin(x * 0.08) * Math.cos(y * 0.06) * 3 + Math.sin(x * 0.03 + y * 0.05) * 4) * far); }
  geo.computeVertexNormals(); const ground = K.mesh(geo, new THREE.MeshLambertMaterial({ map: sandT })); ground.rotation.x = -Math.PI / 2; scene.add(ground);
  // derricks (lattice towers) + pumpjacks
  const steel = K.col(0x3a3a44);
  function derrick(h = 14) { const g = new THREE.Group(); const legs = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    legs.forEach(([a, b]) => { const l = K.mesh(new THREE.CylinderGeometry(0.08, 0.1, h, 6), steel); l.position.set(a * 0.9, h / 2, b * 0.9); l.rotation.set(-b * 0.08, 0, a * 0.08); g.add(l); });
    for (let y = 1.5; y < h; y += 1.8) { const s = (1 - y / h) * 0.9 + 0.15; for (const [a, b, rz] of [[0, s * 2, 0], [0, -s * 2, 0]]) { const bar = K.box(s * 2, 0.07, 0.07, null, { color: 0x3a3a44 }); bar.position.set(0, y, b / 2); g.add(bar); const bar2 = K.box(0.07, 0.07, s * 2, null, { color: 0x3a3a44 }); bar2.position.set(b / 2, y, 0); g.add(bar2); void a; void rz; } }
    const top = K.box(0.6, 0.6, 0.6, null, { color: 0xc8312c }); top.position.y = h; g.add(top); return g; }
  function pumpjack() { const g = new THREE.Group(); const base = K.box(3, 0.4, 1, null, { color: 0x4a4a52 }); base.position.y = 0.2; g.add(base); const post = K.box(0.3, 2.4, 0.3, null, { color: 0x4a4a52 }); post.position.set(0, 1.4, 0); g.add(post);
    const beam = new THREE.Group(); beam.position.set(0, 2.6, 0); g.add(beam); const bm = K.box(4.2, 0.35, 0.35, null, { color: 0xe8b93a }); beam.add(bm); const head = K.box(0.5, 1.1, 0.4, null, { color: 0xe8b93a }); head.position.set(2.2, -0.3, 0); beam.add(head); const cw = K.box(0.8, 0.8, 0.5, null, { color: 0x2a2a30 }); cw.position.set(-2, -0.5, 0); beam.add(cw);
    g.userData.beam = beam; return g; }
  const derricks = []; [[-9, -18, 15], [7, -26, 17], [-20, -40, 14], [18, -44, 16], [-2, -60, 18], [30, -70, 15], [-34, -66, 16]].forEach(([x, z, h]) => { const d = derrick(h); d.position.set(x, 0, z); d.rotation.y = x * 0.1; scene.add(d); derricks.push(d); });
  const jacks = []; [[3, -8], [-5, -11], [11, -14], [-14, -22]].forEach(([x, z], i) => { const j = pumpjack(); j.position.set(x, 0, z); j.rotation.y = 0.4 + i; scene.add(j); jacks.push(j); });
  life.push((t) => jacks.forEach((j, i) => { j.userData.beam.rotation.z = Math.sin(t * 2 + i * 1.3) * 0.28; }));
  // the gusher on the first derrick: black oil fountain
  const oil = []; for (let i = 0; i < 160; i++) { const d = K.mesh(new THREE.SphereGeometry(0.1 + (i % 4) * 0.05, 8, 6), K.col(0x15100c), { shadow: false }); d.userData = { a: i * 2.39, v: 9 + (i % 7) * 1.3, ph: (i * 0.137) % 1 }; d.visible = false; scene.add(d); oil.push(d); }
  // a tiny boom skyline appearing on the horizon (towers + cranes)
  const city = new THREE.Group(); for (let i = 0; i < 16; i++) { const h = 6 + (i * 7) % 18; const b = K.box(2.4 + (i % 3), h, 2.4, null, { color: [0xd8d2c0, 0xbfd0d8, 0xe8dcc0][i % 3] }); b.position.set(-40 + i * 5.2, h / 2, -110 - (i % 3) * 6); city.add(b);
    for (let k = 1; k < h; k += 2.2) { const wdw = noInk(K.mesh(new THREE.PlaneGeometry(1.6, 0.4), glow(0x6a9ac8))); wdw.position.set(b.position.x, k, b.position.z + 1.21); city.add(wdw); } }
  const cranes = []; for (let i = 0; i < 4; i++) { const c = new THREE.Group(); const m = K.box(0.4, 22, 0.4, null, { color: 0xe8b93a }); m.position.y = 11; c.add(m); const jib = K.box(14, 0.4, 0.4, null, { color: 0xe8b93a }); jib.position.set(4, 22, 0); c.add(jib); c.position.set(-30 + i * 20, 0, -100 - i * 4); city.add(c); cranes.push(c); }
  scene.add(city); life.push((t) => cranes.forEach((c, i) => { c.rotation.y = Math.sin(t * 0.3 + i) * 0.6; }));
  // the hiring sign: "workers wanted"
  const sign = new THREE.Group(); const sp = plane(3.2, 1.2, K.signTex(['പണിക്കാരെ ആവശ്യമുണ്ട്!', 'WORKERS WANTED'], { w: 768, h: 288, bg: '#f4ecd6', fg: '#8a1e1e', border: '#2a1c17', aged: false })); sp.position.y = 2.4; sign.add(sp);
  const back = K.box(3.26, 1.26, 0.06, T.wood, { tileM: 1 }); back.position.set(0, 2.4, -0.05); sign.add(back); for (const x of [-1.4, 1.4]) { const leg = K.box(0.1, 2.4, 0.1, T.wood, { tileM: 1 }); leg.position.set(x, 1.2, -0.08); sign.add(leg); }
  sign.position.set(-1.2, 0, -2.6); sign.rotation.y = 0.25; scene.add(sign);
  const sun = new THREE.DirectionalLight(0xfff0d0, 1.9); sun.position.set(20, 30, 14); sun.target.position.set(0, 0, -6); scene.add(sun, sun.target); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005; Object.assign(sun.shadow.camera, { left: -24, right: 24, top: 24, bottom: -24, near: 1, far: 120 });
  scene.add(new THREE.HemisphereLight(0xcfe6ff, 0xe0b070, 1.0));
  return { scene, life, derricks, jacks, city, sign, setGush(on, t) { const src = derricks[0].position; oil.forEach((d) => { d.visible = on > 0; if (!on) return; const k = ((t * 0.6 + d.userData.ph) % 1) * 2.2; const r = 0.2 + k * 1.1; d.position.set(src.x + Math.cos(d.userData.a) * r, 15 + d.userData.v * k - 4.9 * k * k, src.z + Math.sin(d.userData.a) * r); if (d.position.y < 0) d.visible = false; }); },
    setCity(u) { city.position.y = -30 * (1 - u); } };
}

// ------------------------------------------------------------------ 3. HOME PLOT: tiled house <-> Gulf mansion, the neighbour's meter
function tiledHouse(T) { const g = new THREE.Group(); const plinth = K.box(6, 0.5, 4.5, T.laterite, { tileM: 1.2 }); plinth.position.y = 0.25; g.add(plinth);
  const walls = K.box(5.6, 2.4, 4.0, T.limeYellow || T.lime, { tileM: 2 }); walls.position.y = 1.7; g.add(walls); const roof = K.roofGable(6.6, 5.2, 1.8, T.tiles, 0.6); roof.position.y = 2.9; g.add(roof);
  const door = K.box(0.9, 1.7, 0.08, T.wood, { tileM: 1 }); door.position.set(0, 1.35, 2.03); g.add(door); for (const x of [-1.8, 1.8]) { const w = K.box(0.8, 0.8, 0.08, null, { color: 0x2a3f5a }); w.position.set(x, 1.8, 2.03); g.add(w); }
  for (const x of [-2.6, 2.6]) { const p = K.box(0.2, 2.4, 0.2, T.wood, { tileM: 1 }); p.position.set(x, 1.7, 2.4); g.add(p); } return g; }
function mansion(T) { const g = new THREE.Group(); const cream = 0xf2e6c8, pink = 0xf0b8a8, green = 0x7ac8a8;
  const g1 = K.box(8, 3, 6, null, { color: cream }); g1.position.y = 1.5; g.add(g1); const g2 = K.box(7, 3, 5.4, null, { color: pink }); g2.position.set(0, 4.5, -0.2); g.add(g2);
  const slab = K.box(9, 0.3, 7, null, { color: 0xe8e2d4 }); slab.position.y = 3.05; g.add(slab); const slab2 = K.box(8, 0.3, 6.4, null, { color: 0xe8e2d4 }); slab2.position.y = 6.05; g.add(slab2);
  const rail = K.box(7.6, 0.8, 0.12, null, { color: green }); rail.position.set(0, 3.6, 3.3); g.add(rail); const rail2 = K.box(6.6, 0.8, 0.12, null, { color: green }); rail2.position.set(0, 6.6, 2.9); g.add(rail2);
  const tank = K.mesh(new THREE.CylinderGeometry(0.7, 0.7, 1.4, 16), K.col(0x2a2a30)); tank.position.set(2.4, 7, -1); g.add(tank);
  for (const [x, y] of [[-2.6, 1.6], [2.6, 1.6], [-2, 4.6], [0, 4.6], [2, 4.6]]) { const w = K.box(1.2, 1.3, 0.1, null, { color: 0x3a6a8a }); w.position.set(x, y, y < 3 ? 3.02 : 2.52); g.add(w); w.userData.win = true; }
  const gate = K.box(1.2, 2.2, 0.1, null, { color: 0xd8a63a }); gate.position.set(0, 1.1, 3.02); g.add(gate);
  for (const x of [-3.6, 3.6]) { const col = K.mesh(new THREE.CylinderGeometry(0.22, 0.22, 3, 12), K.col(0xffffff)); col.position.set(x, 1.5, 3.2); g.add(col); }
  const dish = K.mesh(new THREE.SphereGeometry(0.6, 12, 8, 0, Math.PI * 2, 0, 1.0), K.col(0xe8e8ec)); dish.rotation.x = -1.0; dish.position.set(-2.6, 6.6, 0); g.add(dish);
  return g; }
export function homeSet() {
  const T = K.stdTextures(), scene = new THREE.Scene(), life = [];
  const day = K.skyTexture({ seed: 51, clouds: 6 }), dusk = K.skyTexture({ seed: 52, clouds: 4, top: '#2a2a6a', mid: '#c86a5a', bottom: '#f2b070' }), night = nightSky(9);
  scene.background = day; scene.fog = new THREE.Fog(0xd8e6ee, 30, 140);
  const gt = T.grass.clone(); gt.repeat.set(80, 80); gt.needsUpdate = true; const g0 = K.mesh(new THREE.PlaneGeometry(300, 300), new THREE.MeshLambertMaterial({ map: gt })); g0.rotation.x = -Math.PI / 2; scene.add(g0);
  const dt = T.dirt.clone(); dt.repeat.set(10, 1); dt.needsUpdate = true; const road = K.mesh(new THREE.PlaneGeometry(80, 4.4), new THREE.MeshLambertMaterial({ map: dt })); road.rotation.x = -Math.PI / 2; road.position.set(0, 0.01, 4); scene.add(road);
  // our plot (x=0): the tiled house that becomes a mansion
  const old = tiledHouse(T); old.position.set(0, 0, -3); scene.add(old);
  const big = mansion(T); big.position.set(0, 0, -3.4); scene.add(big);
  const wall = K.box(12, 1.1, 0.25, T.laterite, { tileM: 1.2 }); wall.position.set(0, 0.55, 1.6); scene.add(wall); wall.scale.x = 1; const gap = K.box(2, 1.2, 0.3, null, { color: 0x5a8a4a }); gap.visible = false; scene.add(gap);
  // neighbour (x=-11): plain house + the electricity meter on a pole; a wire runs to our house
  const nb = tiledHouse(T); nb.position.set(-12, 0, -3); nb.scale.setScalar(0.9); scene.add(nb);
  const pole = K.mesh(new THREE.CylinderGeometry(0.1, 0.12, 4.2, 8), K.mat(T.wood)); pole.position.set(-6.4, 2.1, 0.8); scene.add(pole);
  const meter = new THREE.Group(); const mb = K.box(0.7, 0.9, 0.3, null, { color: 0xe8e2d4 }); meter.add(mb); const dial = noInk(K.mesh(new THREE.CircleGeometry(0.22, 20), glow(0xf8f4e8))); dial.position.set(0, 0.1, 0.16); meter.add(dial);
  const needle = K.box(0.02, 0.18, 0.02, null, { color: 0xc8312c }); needle.geometry.translate(0, 0.08, 0); needle.position.set(0, 0.1, 0.18); meter.add(needle);
  const lbl = plane(0.6, 0.2, K.signTex(['മീറ്റർ'], { w: 256, h: 84, bg: '#2a1c17', fg: '#f4dca0', border: '#2a1c17', aged: false })); lbl.position.set(0, -0.3, 0.16); meter.add(lbl);
  meter.position.set(-6.4, 2.6, 0.98); scene.add(meter); life.push((t) => { needle.rotation.z = -t * 3; });
  const wire = K.mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-6.4, 3.9, 0.8), new THREE.Vector3(-3.5, 3.4, 0.2), new THREE.Vector3(-0.5, 4.6, -0.6)]), 40, 0.03, 5), K.col(0x2a1c17), { shadow: false }); scene.add(wire);
  const spark = []; for (let i = 0; i < 24; i++) { const s = noInk(K.mesh(new THREE.SphereGeometry(0.05, 6, 4), glow(0xfff2a0), { shadow: false })); s.visible = false; s.userData = { a: i * 2.6, v: 1.5 + (i % 4) * 0.5 }; scene.add(s); spark.push(s); }
  const smoke = []; for (let i = 0; i < 6; i++) { const s = K.mesh(new THREE.SphereGeometry(0.25, 8, 6), new THREE.MeshLambertMaterial({ color: 0x3a3a40, transparent: true, opacity: 0.7 }), { shadow: false }); s.visible = false; scene.add(s); smoke.push(s); }
  // window glows for the dusk "lights on"
  const glows = []; [[-2.6, 1.6, 0.04], [2.6, 1.6, 0.04], [-2, 4.6, -0.46], [0, 4.6, -0.46], [2, 4.6, -0.46]].forEach(([x, y, dz]) => { const m = noInk(K.mesh(new THREE.PlaneGeometry(1.2, 1.3), glow(0xffd27a, { transparent: true, opacity: 0 }))); m.position.set(x, y, -3.4 + 3.08 + dz); scene.add(m); glows.push(m); });
  const porch = new THREE.PointLight(0xffc27a, 0, 12, 1.6); porch.position.set(0, 3, 1); scene.add(porch);
  // the Ambassador-style taxi with a suitcase on the roof
  const taxi = new THREE.Group(); const body = K.box(3.6, 0.9, 1.6, null, { color: 0xf2e8c8 }); body.position.y = 0.75; taxi.add(body); const top = K.box(2.0, 0.7, 1.45, null, { color: 0xf2e8c8 }); top.position.set(-0.2, 1.5, 0); taxi.add(top);
  const tw = noInk(K.mesh(new THREE.PlaneGeometry(1.8, 0.5), glow(0x6a9ac8))); tw.position.set(-0.2, 1.55, 0.73); taxi.add(tw); for (const x of [-1.2, 1.2]) for (const z of [-0.8, 0.8]) { const w = K.mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.25, 14), K.col(0x1a1a1e)); w.rotation.x = Math.PI / 2; w.position.set(x, 0.36, z); taxi.add(w); }
  const lug = K.box(1.2, 0.5, 0.9, null, { color: 0x3a5a8a }); lug.position.set(-0.2, 2.1, 0); taxi.add(lug); const lug2 = K.box(0.8, 0.4, 0.7, null, { color: 0xc8312c }); lug2.position.set(-0.1, 2.55, 0); taxi.add(lug2);
  taxi.position.set(-30, 0, 4.2); scene.add(taxi);
  // gold sparkles + falling drafts for "the money arrives"
  const notes = []; for (let i = 0; i < 26; i++) { const n = K.mesh(new THREE.PlaneGeometry(0.5, 0.25), new THREE.MeshLambertMaterial({ color: i % 2 ? 0x8ac88a : 0xf4ecd6, side: THREE.DoubleSide }), { shadow: false }); n.visible = false; n.userData = { x: (Math.sin(i * 7.1)) * 4, z: Math.cos(i * 3.3) * 2 + 1, ph: (i * 0.31) % 1 }; scene.add(n); notes.push(n); }
  const palms = []; [[-18, -10, 9], [9, -9, 10], [14, -4, 8.5], [-8, -12, 9], [20, -12, 10]].forEach(([x, z, h], i) => { const p = K.palm(h, 0.15 + (i % 3) * 0.06, i + 60); p.position.set(x, 0, z); scene.add(p); palms.push(p); }); life.push((t) => palms.forEach((p) => p.userData.sway(t)));
  const sun = new THREE.DirectionalLight(0xfff0d8, 1.7); sun.position.set(14, 22, 16); sun.target.position.set(-2, 0, -2); scene.add(sun, sun.target); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005; Object.assign(sun.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 1, far: 90 });
  const hemi = new THREE.HemisphereLight(0xcfe2ff, 0xc89a6a, 0.95); scene.add(hemi);
  return { scene, life, old, big, taxi, meter, wire, glows, porch, notes,
    setBuild(u) { // 0 = tiled house, 1 = full mansion (rises out of the ground, old one sinks)
      old.position.y = -4.6 * Math.min(1, u * 1.6); old.visible = u < 0.7; big.visible = u > 0.02; big.scale.set(1, Math.max(0.01, u), 1); },
    setTime(mode) { scene.background = mode === 'dusk' ? dusk : mode === 'night' ? night : day; scene.fog.color.set(mode === 'day' ? 0xd8e6ee : mode === 'dusk' ? 0x6a4a5a : 0x1a2040); sun.intensity = mode === 'day' ? 1.7 : mode === 'dusk' ? 0.7 : 0.25; sun.color.set(mode === 'dusk' ? 0xffa060 : 0xfff0d8); hemi.intensity = mode === 'day' ? 0.95 : mode === 'dusk' ? 0.55 : 0.35; },
    setLights(on) { glows.forEach((m) => { m.material.opacity = on; }); porch.intensity = 14 * on; },
    setSpark(t, t0) { const k = t - t0; spark.forEach((s) => { s.visible = k > 0 && k < 0.9; const v = s.userData.v; s.position.set(-6.4 + Math.cos(s.userData.a) * k * v * 0.6, 3.9 + v * k - 4.9 * k * k, 0.8 + Math.sin(s.userData.a) * k * v * 0.6); });
      smoke.forEach((s, i) => { const u = k - i * 0.15; s.visible = u > 0 && u < 3; s.position.set(-6.4 + Math.sin(i) * 0.2, 3.9 + u * 0.8, 0.8); s.scale.setScalar(0.5 + u * 0.8); s.material.opacity = Math.max(0, 0.7 - u * 0.22); }); },
    setNotes(on, t) { notes.forEach((n) => { n.visible = on; if (!on) return; const d = n.userData, k = (t * 0.35 + d.ph) % 1; n.position.set(d.x + Math.sin(t * 2 + d.ph * 9) * 0.4, 9 - k * 9, d.z); n.rotation.set(t * 2 + d.ph * 5, t * 3 + d.ph, 0); }); } };
}

// ------------------------------------------------------------------ 4. AIRLIFT TARMAC (1990) + arrivals (waiting mothers)
export function airliftSet() {
  const T = K.stdTextures(), scene = new THREE.Scene(), life = [];
  scene.background = K.skyTexture({ seed: 61, clouds: 5, top: '#5a8ad0', mid: '#a8c0d8', bottom: '#e8e4d8' }); scene.fog = new THREE.Fog(0xd8dce4, 40, 220);
  const tar = K.paint(256, 256, (g, w, h) => { g.fillStyle = '#5a5a60'; g.fillRect(0, 0, w, h); K.mottle(g, w, h, ['#4a4a50', '#6a6a70'], 300, [4, 20], 61, 0.3); }); tar.repeat.set(40, 40);
  const ground = K.mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshLambertMaterial({ map: tar })); ground.rotation.x = -Math.PI / 2; scene.add(ground);
  for (let i = 0; i < 20; i++) { const s = K.box(3, 0.02, 0.3, null, { color: 0xf4f0e0 }); s.position.set(-60 + i * 6, 0.02, 14); scene.add(s); }
  // airliner (generic jet, red tail, white body)
  const plane = new THREE.Group(); const fus = K.mesh(new THREE.CylinderGeometry(2.2, 2.2, 34, 24), K.col(0xf6f6f2)); fus.rotation.z = Math.PI / 2; fus.position.y = 4.2; plane.add(fus);
  const nose = K.mesh(new THREE.SphereGeometry(2.2, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2), K.col(0xf6f6f2)); nose.rotation.z = -Math.PI / 2; nose.scale.set(1, 1.6, 1); nose.position.set(17, 4.2, 0); plane.add(nose);
  const tailc = K.mesh(new THREE.ConeGeometry(2.2, 7, 24), K.col(0xf6f6f2)); tailc.rotation.z = Math.PI / 2; tailc.position.set(-20.5, 4.6, 0); plane.add(tailc);
  const fin = K.box(5, 6, 0.3, null, { color: 0xc8312c }); fin.position.set(-20, 9, 0); fin.rotation.z = 0.35; plane.add(fin);
  const wing = K.box(8, 0.4, 30, null, { color: 0xe0e0dc }); wing.position.set(0, 3.2, 0); wing.rotation.y = 0.2; plane.add(wing);
  for (const z of [-6, 6]) { const eng = K.mesh(new THREE.CylinderGeometry(0.9, 0.9, 3.6, 16), K.col(0xd8d8d8)); eng.rotation.z = Math.PI / 2; eng.position.set(1.5, 2.1, z); plane.add(eng); }
  const stripe = K.box(36, 0.5, 4.5, null, { color: 0xc8312c }); stripe.position.set(0, 3.6, 0); stripe.scale.z = 1.0; plane.add(stripe);
  for (let i = 0; i < 18; i++) { const w = K.mesh(new THREE.CircleGeometry(0.25, 10), K.col(0x2a3a4a)); w.position.set(-14 + i * 1.6, 5.1, 2.21); plane.add(w); }
  const nameT = K.signTex(['എയർ ഇന്ത്യ'], { w: 640, h: 140, bg: '#f6f6f2', fg: '#c8312c', border: '#f6f6f2', aged: false }); const nm = plane2(nameT, 7, 1.5); nm.position.set(2, 5.9, 2.0); nm.rotation.y = 0; plane.add(nm);
  const door = K.box(1.2, 2.0, 0.1, null, { color: 0x9a9a9a }); door.position.set(12, 4.6, 2.2); plane.add(door);
  plane.position.set(0, 0, -8); scene.add(plane);
  // stairs truck
  const stairs = new THREE.Group(); for (let i = 0; i < 12; i++) { const st = K.box(1.4, 0.15, 0.4, null, { color: 0xe8e2d4 }); st.position.set(0, 0.3 + i * 0.36, 7.2 - i * 0.4); stairs.add(st); }
  const rail = K.box(0.08, 0.08, 6, null, { color: 0x3a3a44 }); rail.position.set(0.7, 3.2, 4.8); rail.rotation.x = 0.75; stairs.add(rail);
  stairs.position.set(12, 0, -7.4); scene.add(stairs);
  // terminal + arrivals rail
  const term = K.box(60, 8, 8, null, { color: 0xe6ddc8 }); term.position.set(0, 4, -48); scene.add(term); for (let i = 0; i < 12; i++) { const w = noInk(K.mesh(new THREE.PlaneGeometry(3.4, 3), glow(0x8ab0d0))); w.position.set(-27 + i * 5, 4.6, -43.9); scene.add(w); }
  const arr = plane2(K.signTex(['ARRIVALS · ആഗമനം'], { w: 768, h: 140, bg: '#1f3a6a', fg: '#ffffff', border: '#1f3a6a', aged: false }), 12, 2.2); arr.position.set(0, 9.4, -43.9); scene.add(arr);
  const barrier = K.box(14, 1.0, 0.15, null, { color: 0xc8c8cc }); barrier.position.set(-26, 0.5, 6); scene.add(barrier);
  const sun = new THREE.DirectionalLight(0xfff0d8, 1.6); sun.position.set(20, 30, 20); sun.target.position.set(0, 0, -6); scene.add(sun, sun.target); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005; Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 30, bottom: -30, near: 1, far: 140 });
  scene.add(new THREE.HemisphereLight(0xcfe2ff, 0x8a8a80, 0.95));
  return { scene, life, plane, stairs, barrier };
}
function plane2(map, w, h) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map })); return m; }

// ------------------------------------------------------------------ dressing for reused sets
export function dressBeachDusk(b) { // callback ending: dusk on the Kerala shore
  const sc = b.scene; b.ship.visible = false;
  sc.children.forEach((o) => { if (o.isGroup && Math.abs(o.position.x + 1.8) < 0.01 && Math.abs(o.position.z - 0.4) < 0.01) o.visible = false; }); // thorium sign
  let sun = null, hemi = null; sc.traverse((o) => { if (o.isDirectionalLight) sun = o; if (o.isHemisphereLight) hemi = o; });
  sc.background = K.skyTexture({ seed: 71, clouds: 5, top: '#2a2a6a', mid: '#d07a5a', bottom: '#f8c080' }); sc.fog.color.set(0xb07a6a); sun.color.set(0xffa868); sun.intensity = 1.0; sun.position.set(-20, 8, -40); hemi.intensity = 0.7;
  const disc = noInk(K.mesh(new THREE.CircleGeometry(6, 28), glow(0xffd08a), { shadow: false })); disc.position.set(-20, 6, -150); sc.add(disc);
  const T = K.stdTextures(); b.launch = launchBoat(T); b.launch.scale.setScalar(0.8); b.launch.position.set(30, 0, -60); b.launch.rotation.y = Math.PI; sc.add(b.launch);
}
export function dressStreetQueue(s, K2, card) { // employment exchange board + a long queue of graduates
  const sc = s.scene, T = K.stdTextures();
  const brd = new THREE.Group(); const p = plane2(K.signTex(['എംപ്ലോയ്മെന്റ് എക്സ്ചേഞ്ച്', 'EMPLOYMENT EXCHANGE'], { w: 900, h: 260, bg: '#1f3a6a', fg: '#f4ecd6', border: '#f4ecd6', aged: true }), 3.6, 1.04); p.position.y = 3.1; brd.add(p);
  const bk = K.box(3.7, 1.12, 0.06, T.wood, { tileM: 1 }); bk.position.set(0, 3.1, -0.05); brd.add(bk); brd.position.set(-3.4, 0, 2.4); brd.rotation.y = Math.PI / 2 - 0.25; sc.add(brd);
  const q = []; for (let i = 0; i < 36; i++) { const who = ['youth', 'dasan', 'vijayan', 'youth', 'kannan', 'chaya'][i % 6]; const c = card(who, { expr: ['nervous', 'think', 'sad', 'smile'][i % 4] }); c.position.set(-2.2 + (i % 2) * 0.25, 0, 2.0 - i * 1.15); c.visible = false; sc.add(c); q.push(c); }
  s.queue = q; s.exBoard = brd; void K2;
}
