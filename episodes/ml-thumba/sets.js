// Thumba 1963 sets.
// thumbaSet(base): ml-bean's beach redressed as Thumba: St Mary Magdalene church right on the shore, the bishop's house,
//   fisher huts, the glowing magnetic-equator line running from the sea through the church, a rail launcher with a
//   Nike-Apache, a bicycle carrying a rocket section, and a dusk mode with the orange sodium cloud.
//   API: setDusk(u), setLaunch(u), setCloud(u), setEquator(u), bike (group), setOffice(u), huts.
// churchSet(): the nave: pews, altar, pulpit, tall windows with light shafts.
//   API: setLab(u) pews -> workbenches with rocket parts; setMuseum(u) -> rockets on plinths, "SPACE MUSEUM" banner.
import * as K from '../../pipeline/toon3d.js';
const THREE = K.THREE;
const glow = (c, o = 1) => new THREE.MeshBasicMaterial({ color: c, transparent: o < 1, opacity: o, depthWrite: o >= 1 });
const noInk = (m) => { m.userData.noInk = true; m.traverse?.((o) => { o.userData.noInk = true; }); return m; };
const label = (lines, o = {}) => K.signTex(lines, { w: 512, h: 200, bg: '#f4ecd6', fg: '#2a1c17', border: '#2a1c17', aged: true, ...o });
function signPlane(w, h, tex, basic = false) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), basic ? new THREE.MeshBasicMaterial({ map: tex, transparent: true }) : new THREE.MeshLambertMaterial({ map: tex, transparent: true })); m.receiveShadow = true; return m; }

// ---------- small builders
export function rocket({ scale = 1 } = {}) { // two-stage Nike-Apache: fat white booster with 4 big fins, slim upper stage, red band, pointed nose. Base at y=0.
  const g = new THREE.Group(), W = K.col(0xf2f2ee), R = K.col(0xc8312c), G = K.col(0x9aa0aa);
  const b1 = K.mesh(new THREE.CylinderGeometry(0.21, 0.21, 3.4, 16), W); b1.position.y = 1.7; g.add(b1);
  for (let k = 0; k < 4; k++) { const f = K.mesh(new THREE.BoxGeometry(0.04, 1.0, 0.55), G); const a = k * Math.PI / 2; f.position.set(Math.cos(a) * 0.42, 0.55, Math.sin(a) * 0.42); f.rotation.y = -a; g.add(f); }
  const it = K.mesh(new THREE.CylinderGeometry(0.13, 0.21, 0.35, 16), G); it.position.y = 3.57; g.add(it);
  const b2 = K.mesh(new THREE.CylinderGeometry(0.13, 0.13, 2.6, 14), W); b2.position.y = 5.05; g.add(b2);
  for (let k = 0; k < 4; k++) { const f = K.mesh(new THREE.BoxGeometry(0.03, 0.5, 0.3), G); const a = k * Math.PI / 2 + Math.PI / 4; f.position.set(Math.cos(a) * 0.26, 4.0, Math.sin(a) * 0.26); f.rotation.y = -a; g.add(f); }
  const band = K.mesh(new THREE.CylinderGeometry(0.135, 0.135, 0.25, 14), R); band.position.y = 5.9; g.add(band);
  const nose = K.mesh(new THREE.ConeGeometry(0.13, 0.9, 14), R); nose.position.y = 6.8; g.add(nose);
  g.scale.setScalar(scale); return g;
}
function bicycle() { // black roadster with a carrier; a rocket section strapped on the carrier. Faces +x.
  const g = new THREE.Group(), blk = K.col(0x1e1a18), M = K.col(0x9aa0aa);
  const wheel = (x) => { const w = K.mesh(new THREE.TorusGeometry(0.34, 0.035, 8, 28), blk); w.position.set(x, 0.36, 0); g.add(w); for (let k = 0; k < 6; k++) { const s = K.mesh(new THREE.BoxGeometry(0.012, 0.66, 0.012), M); s.position.set(x, 0.36, 0); s.rotation.z = k * Math.PI / 6; g.add(s); } return w; };
  g.wheels = [wheel(-0.55), wheel(0.55)];
  const bar = (x1, y1, x2, y2, c = blk, r = 0.025) => { const d = Math.hypot(x2 - x1, y2 - y1); const m = K.mesh(new THREE.CylinderGeometry(r, r, d, 6), c); m.position.set((x1 + x2) / 2, (y1 + y2) / 2, 0); m.rotation.z = Math.atan2(x1 - x2, y2 - y1); g.add(m); };
  bar(-0.55, 0.36, -0.05, 0.36); bar(-0.05, 0.36, -0.15, 0.9); bar(-0.05, 0.36, 0.45, 0.88); bar(-0.15, 0.85, 0.45, 0.88); bar(0.55, 0.36, 0.45, 1.0); bar(-0.55, 0.36, -0.15, 0.85);
  const h = K.mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.55, 6), blk); h.rotation.x = Math.PI / 2; h.position.set(0.45, 1.02, 0); g.add(h);
  const seat = K.mesh(new THREE.BoxGeometry(0.24, 0.06, 0.14), K.col(0x5a3a22)); seat.position.set(-0.17, 0.95, 0); g.add(seat);
  const car = K.mesh(new THREE.BoxGeometry(0.5, 0.03, 0.26), M); car.position.set(-0.55, 0.78, 0); g.add(car); bar(-0.55, 0.36, -0.55, 0.78, M, 0.015);
  const sec = K.mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.3, 14), K.col(0xf2f2ee)); sec.rotation.z = Math.PI / 2; sec.position.set(-0.45, 0.95, 0); g.add(sec);
  const cone = K.mesh(new THREE.ConeGeometry(0.16, 0.5, 14), K.col(0xc8312c)); cone.rotation.z = -Math.PI / 2; cone.position.set(0.45, 0.95, 0); g.add(cone);
  for (const x of [-0.75, -0.3]) { const strap = K.mesh(new THREE.TorusGeometry(0.17, 0.015, 6, 16), K.col(0x8a5a2a)); strap.rotation.y = Math.PI / 2; strap.position.set(x, 0.95, 0); g.add(strap); }
  return g;
}
function hut(T, seed = 1) { const g = new THREE.Group(); const w = K.box(3, 1.8, 2.6, T.laterite, { tileM: 1.4 }); w.position.y = 0.9; g.add(w);
  const thatch = K.roofGable(3.8, 3.4, 1.4, K.paint(128, 128, (c, W, H) => { c.fillStyle = '#b8945a'; c.fillRect(0, 0, W, H); c.strokeStyle = 'rgba(80,50,20,.5)'; c.lineWidth = 2; for (let x = 0; x < W; x += 5) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 3, H); c.stroke(); } }), 0.5); thatch.position.y = 1.8; g.add(thatch);
  const door = K.box(0.7, 1.2, 0.06, null, { color: 0x3a2418 }); door.position.set(0, 0.6, 1.31); g.add(door); return g; }

export function thumbaSet(base) {
  const b = base, sc = b.scene, T = K.stdTextures(); b.ship.visible = false; b.setGlow(0, 0); b.sparks.forEach((s) => { s.visible = false; });
  sc.children.forEach((o) => { if (o.isGroup && Math.abs(o.position.x + 1.8) < 0.01 && Math.abs(o.position.z - 0.4) < 0.01) o.visible = false; }); // thorium joke sign
  // ---- St Mary Magdalene church on the shore (white Latin church: tall gable front, bell gable, pointed windows, cross)
  const ch = new THREE.Group(); ch.position.set(11, 0, -3); ch.rotation.y = -0.35; sc.add(ch); b.church = ch;
  const nave = K.box(6, 5, 12, T.lime, { tileM: 3 }); nave.position.set(0, 2.5, -6); ch.add(nave);
  const roof = K.roofGable(12.0, 6.8, 2.2, T.tiles, 0.4); roof.rotation.y = Math.PI / 2; roof.position.set(0, 5, -6.9); ch.add(roof);
  const front = new THREE.Shape(); front.moveTo(-3.6, 0); front.lineTo(3.6, 0); front.lineTo(3.6, 6); front.lineTo(1.6, 6); front.lineTo(1.6, 8.6); front.lineTo(0.7, 8.6); front.lineTo(0.7, 9.4); front.lineTo(-0.7, 9.4); front.lineTo(-0.7, 8.6); front.lineTo(-1.6, 8.6); front.lineTo(-1.6, 6); front.lineTo(-3.6, 6); front.closePath();
  const fa = K.mesh(new THREE.ExtrudeGeometry(front, { depth: 0.7, bevelEnabled: false }), K.mat(T.lime)); fa.position.set(0, 0, -0.35); ch.add(fa);
  const belAr = K.box(0.9, 1.0, 0.2, null, { color: 0x2a3a5a }); belAr.position.set(0, 7.4, 0.4); ch.add(belAr); const bell = K.mesh(new THREE.SphereGeometry(0.3, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), K.col(0xc8962a)); bell.position.set(0, 7.25, 0.42); bell.rotation.x = Math.PI; ch.add(bell); b.bell = bell;
  const crV = K.box(0.18, 1.4, 0.18, null, { color: 0xf6f2ea }); crV.position.set(0, 10.1, 0); ch.add(crV); const crH = K.box(0.8, 0.18, 0.18, null, { color: 0xf6f2ea }); crH.position.set(0, 10.3, 0); ch.add(crH);
  const pointed = (w, h) => { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h - w / 2); s.quadraticCurveTo(w / 2, h, 0, h + w * 0.2); s.quadraticCurveTo(-w / 2, h, -w / 2, h - w / 2); s.closePath(); return new THREE.ShapeGeometry(s); };
  const dr = K.mesh(pointed(1.6, 2.8), K.col(0x5a3018)); dr.position.set(0, 0, 0.37); ch.add(dr); b.churchDoor = dr;
  for (const x of [-2.2, 2.2]) { const w = K.mesh(pointed(0.8, 1.8), K.col(0x2a5a8a)); w.position.set(x, 2.6, 0.37); ch.add(w); }
  const rose = K.mesh(new THREE.CircleGeometry(0.55, 20), K.col(0x8a2a3a)); rose.position.set(0, 4.8, 0.37); ch.add(rose);
  for (const z of [-2, -5, -8, -11]) for (const s of [-1, 1]) { const w = K.mesh(pointed(0.7, 1.7), K.col(0x2a5a8a)); w.position.set(s * 3.01, 1.6, z); w.rotation.y = s * Math.PI / 2; ch.add(w); }
  const chSign = signPlane(3.4, 0.75, label(['സെന്റ് മേരി മഗ്ദലീൻ പള്ളി'], { w: 700, h: 150, bg: '#f4ecd6' })); chSign.position.set(0, 3.7, 0.38); ch.add(chSign);
  // ---- bishop's house: small white bungalow with a tiled roof and veranda; office sign swaps in
  const bh = new THREE.Group(); bh.position.set(20, 0, 3); bh.rotation.y = -0.6; sc.add(bh); b.bishopHouse = bh;
  const hb = K.box(6, 3.2, 4.4, T.lime, { tileM: 2 }); hb.position.y = 1.6; bh.add(hb); const hr = K.roofGable(6.8, 5.6, 1.6, T.tiles, 0.4); hr.position.y = 3.2; bh.add(hr);
  for (const x of [-2.4, -0.8, 0.8, 2.4]) { const p = K.box(0.2, 2.6, 0.2, null, { color: 0xf6f2ea }); p.position.set(x, 1.3, 2.9); bh.add(p); }
  const ver = K.box(6.2, 0.15, 1.6, T.wood, { tileM: 1 }); ver.position.set(0, 2.65, 2.4); bh.add(ver);
  const hd = K.box(1.0, 2.0, 0.1, null, { color: 0x5a3018 }); hd.position.set(0, 1.0, 2.22); bh.add(hd); b.houseDoor = hd;
  const homeSign = signPlane(2.4, 0.6, label(["ബിഷപ്പ് ഹൗസ്"], { w: 512, h: 128 })); homeSign.position.set(0, 2.35, 3.0); bh.add(homeSign);
  const offSign = signPlane(3.0, 0.75, label(['DESIGN OFFICE', 'ഡിസൈൻ ഓഫീസ്'], { w: 640, h: 160, bg: '#1f3a6a', fg: '#f4ecd6', border: '#f4ecd6', font: 'Oswald', weight: 700 })); offSign.position.set(0, 2.35, 3.02); offSign.visible = false; bh.add(offSign);
  b.setOffice = (u) => { offSign.visible = u > 0.5; homeSign.visible = u <= 0.5; };
  // ---- fisher huts at the back, a few nets
  b.huts = [[-20, 4, 0.3], [-15, 6.5, -0.2], [-25, 7, 0.5], [-9.5, 6, 0.1]].map(([x, z, r], i) => { const h = hut(T, i); h.position.set(x, 0, z); h.rotation.y = r; sc.add(h); return h; });
  // ---- magnetic equator: a glowing gold band running from the sea, under the church, inland (setEquator)
  const eqGeo = new THREE.PlaneGeometry(2.2, 140); const eq = noInk(K.mesh(eqGeo, new THREE.MeshBasicMaterial({ color: 0xffb000, transparent: true, opacity: 0, depthWrite: false }), { shadow: false }));
  eq.rotation.x = -Math.PI / 2; eq.rotation.z = -0.35; eq.position.set(11 + Math.sin(0.35) * 3, 0.06, -3); sc.add(eq);
  const eqDash = []; for (let k = 0; k < 40; k++) { const d = noInk(K.mesh(new THREE.PlaneGeometry(0.8, 2.2), new THREE.MeshBasicMaterial({ color: 0xfff6c0, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }), { shadow: false })); d.rotation.x = -Math.PI / 2; d.rotation.z = -0.35; sc.add(d); eqDash.push(d); }
  const eqDir = new THREE.Vector3(-Math.sin(0.35), 0, -Math.cos(0.35)); // toward the sea along the band
  b.setEquator = (u, t = 0) => { eq.material.opacity = 0.8 * u; eqDash.forEach((d, k) => { const s = ((k * 3.5 - t * 6) % 140 + 140) % 140 - 70; d.position.set(eq.position.x + eqDir.x * s, 0.08, eq.position.z + eqDir.z * s); d.material.opacity = u * (Math.abs(s) < 60 * u + 1 ? 0.9 : 0); }); };
  b.setEquator(0);
  // ---- launch site on the shore: concrete pad, rail launcher, blockhouse, Nike-Apache
  const pad = new THREE.Group(); pad.position.set(-8, 0, -9); sc.add(pad); b.pad = pad;
  const slab = K.box(7, 0.3, 6, null, { color: 0xb8b4ac }); slab.position.y = 0.15; pad.add(slab);
  const rail = K.box(0.3, 9, 0.3, null, { color: 0x6a7078 }); rail.position.set(-0.45, 4.8, 0); rail.rotation.z = 0.08; pad.add(rail);
  for (let k = 0; k < 6; k++) { const brace = K.box(1.2, 0.12, 0.12, null, { color: 0x6a7078 }); brace.position.set(-0.9 + k * 0.08, 1 + k * 1.5, 0); brace.rotation.z = 0.5 * (k % 2 ? 1 : -1); pad.add(brace); }
  const lbase = K.box(1.6, 0.8, 1.6, null, { color: 0x8a9098 }); lbase.position.y = 0.7; pad.add(lbase);
  const bunk = K.box(3, 2, 2.4, T.lime, { tileM: 1 }); bunk.position.set(7.5, 1, 1.5); pad.add(bunk); const slit = K.box(2, 0.3, 0.1, null, { color: 0x1a1a22 }); slit.position.set(7.5, 1.5, 2.72); pad.add(slit);
  b.rocket = rocket({ scale: 1.15 }); b.rocket.position.set(0, 1.1, 0); b.rocket.rotation.z = 0.08; pad.add(b.rocket);
  b.flame = []; for (let k = 0; k < 6; k++) { const f = noInk(K.mesh(new THREE.ConeGeometry(0.3 - k * 0.03, 1.6 + k * 0.5, 10), glow([0xfff2a0, 0xffb040, 0xff7a2a][k % 3], 0.85), { shadow: false })); f.rotation.x = Math.PI; f.visible = false; pad.add(f); b.flame.push(f); }
  b.trail = []; for (let k = 0; k < 40; k++) { const s = K.mesh(new THREE.SphereGeometry(1, 10, 8), new THREE.MeshLambertMaterial({ color: 0xeeeae4, transparent: true, opacity: 0.85 }), { shadow: false }); s.visible = false; pad.add(s); b.trail.push(s); }
  b.setLaunch = (u) => { // u: seconds since ignition (0 = on the rail)
    const lift = u <= 0 ? 0 : 0.6 * u * u * 6; b.rocket.position.set(Math.sin(0.08) * -lift, 1.1 + lift, 0);
    b.flame.forEach((f, k) => { f.visible = u > 0; f.position.set(b.rocket.position.x + Math.sin(0.08) * 0, b.rocket.position.y - 0.6 - k * 0.35, 0); f.scale.setScalar(1 + Math.sin(u * 40 + k) * 0.15); });
    b.trail.forEach((s, k) => { const tk = k * 0.06; s.visible = u > tk; if (!s.visible) return; const ly = 0.6 * tk * tk * 6, age = u - tk; s.position.set(-Math.sin(0.08) * ly + (k % 3 - 1) * 0.2 * age, 1.1 + ly + age * 0.3, (k % 2 - 0.5) * 0.3 * age); s.scale.setScalar(0.25 + age * 0.45 + (k < 4 ? age * 0.5 : 0)); s.material.opacity = 0.85 * Math.max(0, 1 - age / 8); });
  };
  b.setLaunch(0);
  // ---- sodium cloud: glowing orange blobs high over the sea (setCloud)
  b.cloud = []; for (let k = 0; k < 14; k++) { const m = noInk(K.mesh(new THREE.SphereGeometry(1, 16, 12), new THREE.MeshBasicMaterial({ color: k % 3 ? 0xff9a3a : 0xffc060, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }), { shadow: false })); m.userData.o = [(k * 37 % 13) - 6, (k * 23 % 7) - 3, (k * 17 % 9) - 4]; sc.add(m); b.cloud.push(m); }
  b.setCloud = (u, t = 0) => b.cloud.forEach((m, k) => { const o = m.userData.o; m.position.set(-12 + o[0] * (1 + u * 1.5) + Math.sin(t * 0.3 + k) * 0.6, 48 + o[1] * (1 + u), -70 + o[2] * (1 + u)); m.scale.setScalar((4 + (k % 4) * 1.5) * (0.3 + u)); m.material.opacity = 0.32 * Math.min(1, u * 2); });
  b.setCloud(0);
  // ---- the bicycle on the sandy lane
  b.bike = bicycle(); b.bike.position.set(4, 0, 6); b.bike.rotation.y = -0.4; sc.add(b.bike);
  // ---- dusk
  let sun = null, hemi = null; sc.traverse((o) => { if (o.isDirectionalLight) sun = o; if (o.isHemisphereLight) hemi = o; });
  const day = { bg: sc.background, fog: sc.fog.color.clone(), sc: sun.color.clone(), si: sun.intensity, sp: sun.position.clone(), hi: hemi.intensity };
  const duskSky = K.skyTexture({ seed: 71, clouds: 5, top: '#24245a', mid: '#c86a5a', bottom: '#f8b070' });
  const disc = noInk(K.mesh(new THREE.CircleGeometry(5, 28), glow(0xffc070), { shadow: false })); disc.position.set(-30, 4, -160); disc.visible = false; sc.add(disc);
  b.setDusk = (u) => { const d = u > 0.5; sc.background = d ? duskSky : day.bg; sc.fog.color.set(d ? 0x9a6a6a : day.fog); sun.color.set(d ? 0xff9a60 : day.sc); sun.intensity = d ? 0.85 : day.si; if (d) sun.position.set(-20, 6, -40); else sun.position.copy(day.sp); hemi.intensity = d ? 0.6 : day.hi; disc.visible = d; };
  return b;
}

export function churchSet() {
  const T = K.stdTextures(), scene = new THREE.Scene(), life = [];
  scene.background = new THREE.Color(0x3a2a22); scene.fog = new THREE.Fog(0x4a3a2e, 20, 60);
  const tileF = K.paint(256, 256, (g, w, h) => { for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = (x + y) % 2 ? '#c8b89a' : '#8a3a2a'; g.fillRect(x * 32, y * 32, 32, 32); } K.mottle(g, w, h, ['#000', '#fff'], 120, [4, 20], 3, 0.06); }); tileF.repeat.set(6, 12);
  const floor = K.mesh(new THREE.PlaneGeometry(12, 30), new THREE.MeshLambertMaterial({ map: tileF })); floor.rotation.x = -Math.PI / 2; floor.position.z = -10; scene.add(floor);
  for (const s of [-1, 1]) { const w = K.box(0.4, 8, 30, T.lime, { tileM: 3 }); w.position.set(s * 6, 4, -10); scene.add(w); }
  const back = K.box(12, 8, 0.4, T.lime, { tileM: 3 }); back.position.set(0, 4, -25); scene.add(back);
  const front = K.box(12, 8, 0.4, T.lime, { tileM: 3 }); front.position.set(0, 4, 5.2); scene.add(front);
  const ceil = K.mesh(new THREE.PlaneGeometry(12, 30), K.mat(T.wood)); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, 8, -10); scene.add(ceil);
  for (let z = 2; z > -24; z -= 3.2) { const beam = K.box(12, 0.3, 0.3, T.wood, { tileM: 1 }); beam.position.set(0, 7.8, z); scene.add(beam); }
  // tall pointed windows with light shafts
  const shafts = [];
  for (const z of [-2, -8, -14, -20]) for (const s of [-1, 1]) { const win = K.box(0.1, 3, 1.1, null, { color: 0xbfe0f8 }); win.position.set(s * 5.78, 4.6, z); scene.add(win); const top = K.mesh(new THREE.ConeGeometry(0.55, 0.8, 4), K.col(0xbfe0f8)); top.position.set(s * 5.78, 6.5, z); top.rotation.y = Math.PI / 4; scene.add(top);
    if (s < 0) { const sh = noInk(K.mesh(new THREE.PlaneGeometry(1.4, 9), new THREE.MeshBasicMaterial({ color: 0xfff0c0, transparent: true, opacity: 0.16, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }), { shadow: false })); sh.position.set(-3.2, 3.2, z - 0.6); sh.rotation.set(0, Math.PI / 2, 0.6); scene.add(sh); shafts.push(sh); } }
  // altar, crucifix, candles, pulpit
  const alt = new THREE.Group(); alt.position.set(0, 0, -22); scene.add(alt);
  const step = K.box(8, 0.4, 4, T.wood, { tileM: 1 }); step.position.y = 0.2; alt.add(step);
  const table = K.box(3.4, 1.1, 1.2, null, { color: 0xf6f2ea }); table.position.set(0, 0.95, -0.6); alt.add(table); const cloth = K.box(3.5, 0.08, 1.3, null, { color: 0xc8962a }); cloth.position.set(0, 1.52, -0.6); alt.add(cloth);
  const reredos = K.box(5, 5.5, 0.4, null, { color: 0xe8dcc0 }); reredos.position.set(0, 3.4, -2.6); alt.add(reredos); const niche = K.box(2, 3, 0.1, null, { color: 0x2a4a7a }); niche.position.set(0, 4, -2.35); alt.add(niche);
  const cV = K.box(0.18, 2.0, 0.12, null, { color: 0xc8962a }); cV.position.set(0, 4.2, -2.25); alt.add(cV); const cH = K.box(1.0, 0.18, 0.12, null, { color: 0xc8962a }); cH.position.set(0, 4.7, -2.25); alt.add(cH);
  const flames = []; for (const x of [-1.2, -0.6, 0.6, 1.2]) { const c = K.box(0.1, 0.5, 0.1, null, { color: 0xfbf6e6 }); c.position.set(x, 1.8, -0.8); alt.add(c); const f = noInk(K.mesh(new THREE.SphereGeometry(0.07, 8, 6), glow(0xffc040), { shadow: false })); f.position.set(x, 2.12, -0.8); f.scale.y = 1.6; alt.add(f); flames.push(f); }
  life.push((t) => flames.forEach((f, k) => { f.scale.y = 1.6 + Math.sin(t * 12 + k * 2) * 0.3; }));
  const pul = new THREE.Group(); const pb = K.mesh(new THREE.CylinderGeometry(0.8, 0.6, 1.3, 8), K.mat(T.wood)); pb.position.y = 1.65; pul.add(pb); const pst = K.mesh(new THREE.CylinderGeometry(0.2, 0.3, 1.0, 8), K.mat(T.wood)); pst.position.y = 0.5; pul.add(pst);
  pul.position.set(-3.4, 0, -17); scene.add(pul);
  // pews (group) vs lab benches (group) vs museum (group)
  const pews = new THREE.Group(); scene.add(pews);
  for (let r = 0; r < 7; r++) for (const s of [-1, 1]) { const p = new THREE.Group(); const seat = K.box(3.6, 0.12, 0.6, T.wood, { tileM: 1 }); seat.position.y = 0.5; p.add(seat); const bk = K.box(3.6, 0.7, 0.1, T.wood, { tileM: 1 }); bk.position.set(0, 0.85, 0.3); p.add(bk);
    for (const x of [-1.7, 1.7]) { const l = K.box(0.1, 0.5, 0.6, T.wood, { tileM: 1 }); l.position.set(x, 0.25, 0); p.add(l); } p.position.set(s * 2.4, 0, -14 + r * 2.1); pews.add(p); }
  const lab = new THREE.Group(); lab.visible = false; scene.add(lab);
  for (let r = 0; r < 3; r++) for (const s of [-1, 1]) { const bench = K.box(3.4, 0.12, 1.4, T.wood, { tileM: 1 }); bench.position.set(s * 2.4, 0.95, -12 + r * 4); lab.add(bench); for (const x of [-1.5, 1.5]) for (const z of [-0.6, 0.6]) { const l = K.box(0.1, 0.9, 0.1, T.wood, { tileM: 1 }); l.position.set(s * 2.4 + x, 0.45, -12 + r * 4 + z); lab.add(l); }
    const part = r === 1 && s < 0 ? rocket({ scale: 0.45 }) : K.mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.6, 14), K.col(r % 2 ? 0xf2f2ee : 0x9aa0aa)); if (part.isMesh) { part.rotation.z = Math.PI / 2; part.position.set(s * 2.4, 1.2, -12 + r * 4); } else { part.rotation.z = Math.PI / 2; part.position.set(s * 2.4 + 1.5, 1.2, -12 + r * 4); } lab.add(part);
    const lamp = noInk(K.mesh(new THREE.SphereGeometry(0.15, 10, 8), glow(0xfff4c0), { shadow: false })); lamp.position.set(s * 2.4, 2.6, -12 + r * 4); lab.add(lamp); }
  const board = signPlane(4, 2.2, K.paint(800, 440, (g, w, h) => { g.fillStyle = '#1e3a2a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#d8c8a0'; g.lineWidth = 16; g.strokeRect(0, 0, w, h); g.strokeStyle = '#f4f0e6'; g.lineWidth = 5; g.beginPath(); g.moveTo(80, 380); g.quadraticCurveTo(380, -80, 720, 380); g.stroke(); g.font = "700 46px 'Oswald'"; g.fillStyle = '#f4f0e6'; g.fillText('h = 200 km', 300, 120); g.fillText('Na', 380, 70); g.fillText('T-0  18:25', 80, 420); }));
  board.position.set(3.0, 3.2, -19.5); board.rotation.y = -0.5; lab.add(board);
  const labSign = signPlane(4.6, 0.9, label(['LABORATORY', 'ലബോറട്ടറി'], { w: 700, h: 150, bg: '#1f3a6a', fg: '#f4ecd6', border: '#f4ecd6', font: 'Oswald', weight: 700 })); labSign.position.set(0, 6.4, -24.7); lab.add(labSign);
  const museum = new THREE.Group(); museum.visible = false; scene.add(museum);
  [[-3, -14, 1.0], [3, -14, 1.0], [-3, -7, 0.8], [3, -7, 1.2], [0, -21, 0.6]].forEach(([x, z, s], i) => { const pl = K.box(1.4, 0.6, 1.4, null, { color: 0x2a2a34 }); pl.position.set(x, 0.3, z); museum.add(pl); const r = rocket({ scale: s }); r.position.set(x, 0.6, z); r.rotation.y = i; museum.add(r); });
  const banner = signPlane(6, 1.2, label(['SPACE MUSEUM', 'ബഹിരാകാശ മ്യൂസിയം'], { w: 900, h: 180, bg: '#16306a', fg: '#f6d24a', border: '#f6d24a', font: 'Oswald', weight: 700 })); banner.position.set(0, 7.0, -24.7); museum.add(banner);
  const spots = []; for (const x of [-3, 3]) { const sp = noInk(K.mesh(new THREE.ConeGeometry(1.4, 7, 20, 1, true), new THREE.MeshBasicMaterial({ color: 0xbfe0ff, transparent: true, opacity: 0.1, depthWrite: false, blending: THREE.AdditiveBlending }), { shadow: false })); sp.position.set(x, 4.4, -10); museum.add(sp); spots.push(sp); }
  const setLab = (u) => { const on = u > 0.5; lab.visible = on; pews.visible = !on && !museum.visible; alt.visible = !on && !museum.visible; pul.visible = !on && !museum.visible; };
  const setMuseum = (u) => { const on = u > 0.5; museum.visible = on; pews.visible = !on && !lab.visible; alt.visible = !on; pul.visible = !on && !lab.visible; };
  const key = new THREE.DirectionalLight(0xffe8c0, 1.1); key.position.set(-10, 12, -6); key.target.position.set(0, 0, -10); scene.add(key, key.target); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0005; Object.assign(key.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 60 });
  scene.add(new THREE.HemisphereLight(0xfff0dc, 0x8a6a4a, 1.05));
  const warm = new THREE.PointLight(0xffb060, 1.2, 14); warm.position.set(0, 3, -20); scene.add(warm);
  return { scene, life, pews, lab, museum, altar: alt, pulpit: pul, shafts, setLab, setMuseum, key };
}
