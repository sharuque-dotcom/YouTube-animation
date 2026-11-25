// Trivandrum bazaar street, 18 June 1947, morning. Villagers crowd the radio shop for the Dewan's announcement.
import { THREE, rnd, paint, mottle, stdTextures, signTex, box, mat, col, mesh, roofGable, awning, palm, banana, card, skyTexture } from '../../pipeline/toon3d.js';
import { CAST, drawBean } from '../../pipeline/bean.js';

const P = (x, y, z) => new THREE.Vector3(x, y, z);

function shopHouse(T, { w = 4.4, d = 4, h1 = 3.1, h2 = 2.5, wall = T.lime, trim = T.woodTeal, sign = null, goods = 'jars', seed = 1, posterTex = null }) {
  const g = new THREE.Group(), r = rnd(seed), V = 1.5; // verandah depth
  const plinth = box(w + 0.2, 0.32, d + V, T.laterite, { tileM: 1.4 }); plinth.position.set(0, 0.16, V / 2); g.add(plinth);
  const step = box(w * 0.5, 0.16, 0.4, T.laterite, { tileM: 1.4 }); step.position.set(0, 0.08, d / 2 + V + 0.18); g.add(step);
  // ground floor: side + back walls, open front
  for (const s of [-1, 1]) { const sw = box(0.25, h1, d, wall); sw.position.set(s * (w / 2 - 0.12), 0.32 + h1 / 2, 0); g.add(sw); }
  const back = box(w, h1, 0.2, wall); back.position.set(0, 0.32 + h1 / 2, -d / 2 + 0.1); g.add(back);
  const inner = box(w - 0.5, h1, 0.05, null, { color: 0x6a4a36 }); inner.position.set(0, 0.32 + h1 / 2, -d / 2 + 0.24); g.add(inner);
  // shelves with goods on the back wall
  for (let k = 0; k < 3; k++) { const sh = box(w - 0.7, 0.06, 0.4, T.wood, { tileM: 1 }); sh.position.set(0, 1.1 + k * 0.62, -d / 2 + 0.45); g.add(sh);
    for (let i = 0; i < 9; i++) { const c = [0xc8402a, 0x2f6fb0, 0xe2b13c, 0x4f8a3a, 0xf0e6d0, 0x8a4aa0][Math.floor(r() * 6)];
      const it = goods === 'cloth' ? box(0.34, 0.28, 0.3, null, { color: c }) : mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.3, 10), col(c));
      it.position.set(-w / 2 + 0.6 + i * (w - 1.2) / 8, 1.28 + k * 0.62, -d / 2 + 0.45); g.add(it); } }
  // posts + verandah lean-to tiled awning
  for (const s of [-1, 1]) { const p = box(0.2, h1 - 0.15, 0.2, T.wood, { tileM: 1 }); p.position.set(s * (w / 2 - 0.15), 0.32 + (h1 - 0.15) / 2, d / 2 + V - 0.2); g.add(p);
    const brk = box(0.12, 0.5, 0.12, T.wood, { tileM: 1 }); brk.position.set(s * (w / 2 - 0.15), 0.32 + h1 - 0.4, d / 2 + V - 0.45); brk.rotation.x = -0.6; g.add(brk); }
  const beam = box(w, 0.2, 0.2, T.wood, { tileM: 1 }); beam.position.set(0, 0.32 + h1 - 0.1, d / 2 + V - 0.2); g.add(beam);
  const aw = awning(w + 0.5, V + 0.5, 0.75, T.tiles); aw.position.set(0, 0.32 + h1 + 0.65, d / 2 - 0.15); g.add(aw);
  // upper floor with balcony + shuttered windows
  const up = box(w, h2, d - 0.3, wall); up.position.set(0, 0.32 + h1 + h2 / 2, -0.15); g.add(up);
  const slab = box(w + 0.3, 0.18, d + 0.2, T.wood, { tileM: 1 }); slab.position.set(0, 0.32 + h1 + 0.02, 0); g.add(slab);
  for (const s of [-1, 1]) { const y0 = 0.32 + h1 + 1.2, x0 = s * w * 0.24;
    const hole = box(0.78, 1.1, 0.05, null, { color: 0x2a1c17 }); hole.position.set(x0, y0, d / 2 - 0.28); g.add(hole);
    for (const t of [-1, 1]) { const sh = box(0.38, 1.1, 0.05, trim, { tileM: 1 }); sh.position.set(x0 + t * 0.6, y0, d / 2 - 0.1); sh.rotation.y = t * 0.5; g.add(sh); }
    for (let b = 0; b < 4; b++) { const bar = box(0.04, 1.1, 0.04, T.wood, { tileM: 1 }); bar.position.set(x0 - 0.3 + b * 0.2, y0, d / 2 - 0.24); g.add(bar); }
    const sill = box(0.95, 0.08, 0.16, T.wood, { tileM: 1 }); sill.position.set(x0, y0 - 0.6, d / 2 - 0.2); g.add(sill); }
  // wooden balcony railing on the awning edge line
  const rl = box(w - 0.2, 0.07, 0.07, T.wood, { tileM: 1 }); rl.position.set(0, 0.32 + h1 + 0.9, d / 2 - 0.05); g.add(rl);
  for (let b = 0; b < Math.floor(w / 0.22); b++) { const bal = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 6), mat(T.wood)); bal.position.set(-w / 2 + 0.2 + b * 0.22, 0.32 + h1 + 0.5, d / 2 - 0.05); g.add(bal); }
  // main tiled roof (gable, ridge along the frontage)
  const rf = roofGable(w, d - 0.3, 1.5, T.tiles, 0.7); rf.position.set(0, 0.32 + h1 + h2, -0.15); g.add(rf);
  const ridge = box(w + 1.4, 0.12, 0.14, null, { color: 0x6a2a18 }); ridge.position.set(0, 0.32 + h1 + h2 + 1.5, -0.15); g.add(ridge);
  // fascia sign board
  if (sign) { const sb = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.8, w * 0.8 * sign.image.height / sign.image.width), new THREE.MeshLambertMaterial({ map: sign })); sb.position.set(0, 0.32 + h1 + 0.4, d / 2 + V + 0.36); sb.rotation.x = -0.12; g.add(sb);
    const sbBack = box(w * 0.82, w * 0.82 * sign.image.height / sign.image.width, 0.06, T.wood, { tileM: 1 }); sbBack.position.copy(sb.position); sbBack.position.z -= 0.04; sbBack.rotation.x = -0.12; g.add(sbBack); }
  // clutter on the verandah
  for (let i = 0; i < 3; i++) { const sk = mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.55, 10), mat(T.sack)); sk.position.set(-w / 2 + 0.45 + i * 0.5, 0.32 + 0.27, d / 2 + V - 0.45 + (i % 2) * 0.15); g.add(sk);
    const top = mesh(new THREE.SphereGeometry(0.22, 10, 6, 0, 7, 0, 1.2), col([0xd8a640, 0xe8d8b0, 0x8a4a2a][i])); top.position.set(sk.position.x, 0.32 + 0.55, sk.position.z); g.add(top); }
  const basket = mesh(new THREE.CylinderGeometry(0.32, 0.22, 0.28, 12), col(0xb88a4a)); basket.position.set(w / 2 - 0.5, 0.32 + 0.14, d / 2 + V - 0.4); g.add(basket);
  for (let i = 0; i < 7; i++) { const fr = mesh(new THREE.SphereGeometry(0.09, 8, 6), col(i % 2 ? 0xe8a030 : 0xd04a24)); fr.position.set(basket.position.x + Math.cos(i) * 0.15, 0.5, basket.position.z + Math.sin(i) * 0.15); g.add(fr); }
  // hanging banana bunch
  const bb = new THREE.Group(); for (let i = 0; i < 14; i++) { const b = mesh(new THREE.CapsuleGeometry(0.035, 0.16, 3, 6), col(i % 3 ? 0xf0c83a : 0xc8b030)); b.position.set(Math.cos(i * 1.7) * 0.09, -i * 0.035, Math.sin(i * 1.7) * 0.09); b.rotation.z = 0.5; bb.add(b); }
  bb.position.set(w / 2 - 0.55, 0.32 + h1 - 0.55, d / 2 + V - 0.35); g.add(bb); g.userData.bananas = bb;
  if (posterTex) { const pm = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.25), new THREE.MeshLambertMaterial({ map: posterTex })); pm.position.set(-w / 2 + 0.01, 1.55, 0.6); pm.rotation.y = -Math.PI / 2; g.add(pm); g.userData.poster = pm; }
  return g;
}

function chicken(seed) { const g = new THREE.Group(), r = rnd(seed); const c = r() < 0.5 ? 0xf6f0e4 : 0xb8642a;
  const b = mesh(new THREE.SphereGeometry(0.16, 12, 8), col(c)); b.scale.set(1.25, 1, 0.9); b.position.y = 0.26; g.add(b);
  const h = mesh(new THREE.SphereGeometry(0.08, 10, 8), col(c)); h.position.set(0.17, 0.42, 0); g.add(h);
  const cm = mesh(new THREE.BoxGeometry(0.08, 0.06, 0.02), col(0xd8302a)); cm.position.set(0.17, 0.5, 0); g.add(cm);
  const bk = mesh(new THREE.ConeGeometry(0.025, 0.07, 6), col(0xe8a020)); bk.rotation.z = -Math.PI / 2; bk.position.set(0.27, 0.42, 0); g.add(bk);
  const tl = mesh(new THREE.ConeGeometry(0.08, 0.18, 6), col(c === 0xf6f0e4 ? 0x3a3a3a : 0x2a5a3a)); tl.rotation.z = 1.1; tl.scale.set(0.7, 0.8, 0.5); tl.position.set(-0.2, 0.34, 0); g.add(tl);
  for (const s of [-1, 1]) { const l = mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.14, 4), col(0xe8a020)); l.position.set(0, 0.07, s * 0.05); g.add(l); }
  g.userData.head = h; return g; }

function cart(T) { const g = new THREE.Group(); const bed = box(1.4, 0.12, 2.2, T.wood, { tileM: 1 }); bed.position.y = 0.75; g.add(bed);
  const hood = mesh(new THREE.CylinderGeometry(0.75, 0.75, 1.7, 14, 1, true, -Math.PI / 2, Math.PI), new THREE.MeshLambertMaterial({ map: T.sack, side: THREE.DoubleSide })); hood.rotation.x = Math.PI / 2; hood.rotation.y = Math.PI / 2; hood.position.set(0, 0.8, -0.2); g.add(hood);
  for (const s of [-1, 1]) { const wh = mesh(new THREE.TorusGeometry(0.55, 0.06, 6, 20), mat(T.wood)); wh.rotation.y = Math.PI / 2; wh.position.set(s * 0.78, 0.6, 0); g.add(wh);
    for (let k = 0; k < 6; k++) { const sp = box(0.04, 1.05, 0.04, T.wood, { tileM: 1 }); sp.position.copy(wh.position); sp.rotation.x = (k / 6) * Math.PI; g.add(sp); } }
  const yoke = box(0.08, 0.08, 1.8, T.wood, { tileM: 1 }); yoke.position.set(0, 0.7, 1.9); g.add(yoke);
  for (let i = 0; i < 3; i++) { const s = mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.5, 10), mat(T.sack)); s.position.set(-0.35 + i * 0.35, 1.05, 0.6); g.add(s); }
  return g; }

function bicycle() { const g = new THREE.Group(), m = col(0x2a1c17);
  for (const z of [-0.52, 0.52]) { const w = mesh(new THREE.TorusGeometry(0.33, 0.025, 6, 24), m); w.position.set(0, 0.34, z); w.rotation.y = Math.PI / 2; g.add(w); }
  const fr = [[0, 0.34, -0.52, 0, 0.8, 0.1], [0, 0.34, 0.52, 0, 0.8, 0.1], [0, 0.34, -0.52, 0, 0.9, -0.3], [0, 0.8, 0.1, 0, 0.9, -0.3], [0, 0.34, 0.52, 0, 1.0, 0.45]];
  fr.forEach(([x1, y1, z1, x2, y2, z2]) => { const a = P(x1, y1, z1), b = P(x2, y2, z2), l = a.distanceTo(b); const c = mesh(new THREE.CylinderGeometry(0.02, 0.02, l, 5), col(0x1f5f8a)); c.position.copy(a.clone().add(b).multiplyScalar(0.5)); c.lookAt(b); c.rotateX(Math.PI / 2); g.add(c); });
  const hb = box(0.5, 0.03, 0.03, null, { color: 0x2a1c17 }); hb.position.set(0, 1.02, 0.45); g.add(hb); const seat = box(0.12, 0.05, 0.22, null, { color: 0x5a2a1a }); seat.position.set(0, 0.93, -0.32); g.add(seat);
  return g; }

function gopuram(T) { // temple tower at the end of the street (lime-washed stepped tiers)
  const g = new THREE.Group(); const base = box(14, 6, 6, T.lime, { tileM: 3 }); base.position.y = 3; g.add(base);
  for (let i = 0; i < 7; i++) { const w = 12 - i * 1.35, d = 5 - i * 0.45; const t = box(w, 2.3, d, null, { color: [0xf0e2c0, 0xe8cf9a, 0xf2e6cc][i % 3] }); t.position.y = 6 + i * 2.3 + 1.15; g.add(t);
    const ledge = box(w + 0.5, 0.25, d + 0.4, null, { color: 0xd8c8a0 }); ledge.position.y = 6 + i * 2.3; g.add(ledge);
    for (let k = 0; k < 5; k++) { const n = box(0.6, 1.3, 0.2, null, { color: [0xc0563a, 0x3a7a9a, 0x6a9a4a, 0xd8a030][(k + i) % 4] }); n.position.set(-w / 2 + w * (k + 0.5) / 5, 6 + i * 2.3 + 1.2, d / 2 + 0.05); g.add(n); } }
  const top = roofGable(3, 2.2, 1.6, T.limeYellow, 0.2); top.position.y = 6 + 7 * 2.3; g.add(top);
  for (let k = 0; k < 5; k++) { const k2 = mesh(new THREE.ConeGeometry(0.22, 0.9, 8), col(0xe8b93a)); k2.position.set(-1.4 + k * 0.7, 6 + 7 * 2.3 + 1.9, 0); g.add(k2); }
  const door = box(3, 4.5, 0.1, null, { color: 0x3a2018 }); door.position.set(0, 2.25, 3.02); g.add(door);
  return g; }

function bunting(a, b, n, seed) { const g = new THREE.Group(), r = rnd(seed); const cols = [0xc8312c, 0xf4efe4, 0xe2b13c];
  const pts = []; for (let i = 0; i <= n; i++) { const u = i / n; const p = a.clone().lerp(b, u); p.y -= Math.sin(u * Math.PI) * 0.9; pts.push(p); }
  const line = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.015, 4), col(0x2a1c17)); g.add(line);
  const flags = [];
  for (let i = 1; i < n; i++) { const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute([-0.18, 0, 0, 0.18, 0, 0, 0, -0.42, 0], 3)); geo.computeVertexNormals();
    const f = mesh(geo, new THREE.MeshLambertMaterial({ color: cols[i % 3], side: THREE.DoubleSide }), { shadow: false }); f.position.copy(pts[i]); f.lookAt(pts[i].clone().add(new THREE.Vector3(0, 0, 1))); f.userData.ph = r() * 6; g.add(f); flags.push(f); }
  g.userData.flags = flags; return g; }

function poster() { // the Dewan's announcement poster: a joke + a fact on the wall
  return paint(360, 500, (g, w, h) => { g.fillStyle = '#efe2bf'; g.fillRect(0, 0, w, h); mottle(g, w, h, ['#c8a870', '#fff6dc'], 120, [8, 40], 77, 0.25);
    g.strokeStyle = '#8a2a1e'; g.lineWidth = 10; g.strokeRect(12, 12, w - 24, h - 24);
    g.fillStyle = '#8a2a1e'; g.font = "800 46px 'Noto Malayalam'"; g.textAlign = 'center'; g.font = "800 40px 'Noto Malayalam'"; g.fillText('സ്വതന്ത്ര', w / 2, 76); g.font = "800 34px 'Noto Malayalam'"; g.fillText('തിരുവിതാംകൂർ', w / 2, 126);
    g.save(); g.translate(w / 2, 450); g.scale(0.58, 0.58); drawBean(g, 'dewan', { expr: 'smug', L: 'hip', R: 'wave' }); g.restore();
    g.fillStyle = '#2a1c17'; g.font = "800 30px 'Oswald'"; g.fillText('18 · VI · 1947', w / 2, h - 28); });
}

export function buildStreet() {
  const T = stdTextures(); const scene = new THREE.Scene(); const life = [];
  scene.background = skyTexture({ seed: 11, clouds: 7 });
  scene.fog = new THREE.Fog(0xd8e6ee, 30, 140);
  // ground: dirt street + grass verges
  const g0 = mesh(new THREE.PlaneGeometry(400, 400), mat(T.grass)); g0.rotation.x = -Math.PI / 2; const gt = T.grass.clone(); gt.repeat.set(120, 120); gt.needsUpdate = true; g0.material = new THREE.MeshLambertMaterial({ map: gt }); scene.add(g0);
  const st = T.dirt.clone(); st.repeat.set(1.6, 16); st.needsUpdate = true; const street = mesh(new THREE.PlaneGeometry(7.4, 90), new THREE.MeshLambertMaterial({ map: st })); street.rotation.x = -Math.PI / 2; street.position.set(0, 0.01, -30); scene.add(street);
  // gutters (laterite edge stones)
  for (const s of [-1, 1]) { const gu = box(0.3, 0.12, 90, T.laterite, { tileM: 1.2 }); gu.position.set(s * 3.55, 0.06, -30); scene.add(gu); }
  // shop rows
  const sg = (a, b, o) => signTex(a ? [a, b] : [b], o);
  const left = [
    { w: 4.2, wall: T.limeBlue, trim: T.woodGreen, sign: sg('', 'തുണിക്കട', { bg: '#7a2a1e' }), goods: 'cloth' },
    { w: 4.6, wall: T.lime, trim: T.woodTeal, sign: sg('റേഡിയോ ഹൗസ്', 'RADIO HOUSE', { bg: '#1f4f36' }), goods: 'jars' },
    { w: 4.8, wall: T.limeYellow, trim: T.woodTeal, sign: sg('അഞ്ചൽ ഓഫീസ്', 'TRAVANCORE ANCHAL', { bg: '#8a1e1e' }), goods: 'jars' },
    { w: 4.4, wall: T.lime, trim: T.woodGreen, sign: null, goods: 'cloth' },
    { w: 4.6, wall: T.limeBlue, trim: T.woodTeal, sign: null, goods: 'jars' },
    { w: 4.4, wall: T.limeYellow, trim: T.woodGreen, sign: null, goods: 'jars' },
  ];
  const right = [
    { w: 4.4, wall: T.limeYellow, trim: T.woodGreen, sign: sg('', 'ചായക്കട', { bg: '#2a3f7a' }), goods: 'jars' },
    { w: 4.6, wall: T.lime, trim: T.woodTeal, sign: sg('', 'പലചരക്ക്', { bg: '#1f4f36' }), goods: 'jars' },
    { w: 4.2, wall: T.limeBlue, trim: T.woodGreen, sign: null, goods: 'cloth' },
    { w: 4.8, wall: T.lime, trim: T.woodTeal, sign: null, goods: 'jars' },
    { w: 4.4, wall: T.limeYellow, trim: T.woodGreen, sign: null, goods: 'cloth' },
    { w: 4.6, wall: T.limeBlue, trim: T.woodTeal, sign: null, goods: 'jars' },
  ];
  const d = 4, V = 1.5, edge = 3.75; let z = 3.2; const posterTex = poster();
  const shops = { left: [], right: [] };
  left.forEach((s, i) => { const h = shopHouse(T, { ...s, d, seed: 10 + i, posterTex: s.poster ? posterTex : null }); h.rotation.y = Math.PI / 2; h.position.set(-edge - (d / 2 + V), 0, z - s.w / 2); scene.add(h); shops.left.push(h); z -= s.w + 0.25; });
  z = 6.4; right.forEach((s, i) => { const h = shopHouse(T, { ...s, d, seed: 30 + i }); h.rotation.y = -Math.PI / 2; h.position.set(edge + (d / 2 + V), 0, z - s.w / 2); scene.add(h); shops.right.push(h); z -= s.w + 0.25; });
  // the radio on the radio-house counter + 3D sound rings
  const rs = shops.left[1]; const counter = box(2.8, 0.95, 0.5, T.wood, { tileM: 1 }); counter.position.set(0, 0.32 + 0.47, d / 2 + 0.35); rs.add(counter);
  const radio = new THREE.Group(); const rb = box(0.7, 0.5, 0.36, T.wood, { tileM: 0.5 }); radio.add(rb);
  const top = mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.7, 16, 1, false, 0, Math.PI), mat(T.wood)); top.rotation.z = Math.PI / 2; top.position.y = 0.25; radio.add(top);
  const grille = mesh(new THREE.CircleGeometry(0.15, 24), col(0xd8c08a)); grille.position.set(-0.12, 0.02, 0.185); radio.add(grille);
  for (const x of [0.17, 0.27]) { const k = mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.04, 12), col(0xe8d8b0)); k.rotation.x = Math.PI / 2; k.position.set(x, -0.08, 0.2); radio.add(k); }
  const dial = mesh(new THREE.PlaneGeometry(0.18, 0.08), new THREE.MeshBasicMaterial({ color: 0xffd890 })); dial.position.set(0.22, 0.08, 0.185); radio.add(dial);
  radio.scale.setScalar(1.7); radio.position.set(0.3, 0.32 + 0.95 + 0.43, d / 2 + 0.35); rs.add(radio);
  { const lamp = new THREE.PointLight(0xffc27a, 6, 6, 1.6); lamp.position.set(0, 2.6, 0.6); rs.add(lamp); const bulb = mesh(new THREE.SphereGeometry(0.1, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffe0a0 }), { shadow: false }); bulb.position.copy(lamp.position); rs.add(bulb); const wire = mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.8, 4), col(0x2a1c17)); wire.position.set(0, 3.0, 0.6); rs.add(wire); }
  const rings = []; for (let i = 0; i < 3; i++) { const ring = mesh(new THREE.TorusGeometry(0.32, 0.018, 6, 40), col(0xfff6d8), { shadow: false }); ring.position.set(radio.position.x - 0.2, radio.position.y + 0.03, radio.position.z + 0.2); rs.add(ring); rings.push(ring); }
  life.push((t) => { radio.scale.setScalar(1 + 0.03 * Math.max(0, Math.sin(t * 18))); rings.forEach((rg, i) => { const u = ((t * 0.8 + i / 3) % 1); rg.scale.setScalar(0.5 + u * 1.3); rg.material.opacity = 1; rg.position.z = radio.position.z + 0.25 + u * 0.35; rg.visible = u < 0.92; }); });
  { const nb = new THREE.Group(); const board = box(1.1, 1.45, 0.08, T.wood, { tileM: 1 }); board.position.y = 1.55; nb.add(board);
    const pm = new THREE.Mesh(new THREE.PlaneGeometry(0.92, 1.28), new THREE.MeshLambertMaterial({ map: posterTex })); pm.position.set(0, 1.55, 0.05); nb.add(pm);
    for (const x of [-0.45, 0.45]) { const leg = box(0.08, 1.6, 0.08, T.wood, { tileM: 1 }); leg.position.set(x, 0.8, -0.02); nb.add(leg); }
    const cap = roofGable(1.3, 0.35, 0.22, T.tiles, 0.05); cap.position.y = 2.3; nb.add(cap);
    nb.position.set(-3.3, 0, -7.0); nb.rotation.y = 0.9; scene.add(nb); }
  { // inner side wall of the radio house: ticking wall clock, 1947 calendar, framed conch emblem
    const wx = -4.6 / 2 + 0.26; const clk = new THREE.Group(); const face = mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.06, 28), col(0xf6efdc)); face.rotation.z = Math.PI / 2; clk.add(face);
    const rim = mesh(new THREE.TorusGeometry(0.28, 0.035, 6, 28), mat(T.wood)); rim.rotation.y = Math.PI / 2; clk.add(rim);
    const hand = box(0.02, 0.22, 0.02, null, { color: 0x2a1c17 }); hand.geometry.translate(0, 0.1, 0); hand.position.x = 0.05; clk.add(hand); const hand2 = box(0.02, 0.15, 0.02, null, { color: 0x2a1c17 }); hand2.geometry.translate(0, 0.07, 0); hand2.position.x = 0.05; hand2.rotation.x = 2; clk.add(hand2);
    const pend = box(0.16, 0.5, 0.04, T.wood, { tileM: 1 }); pend.position.y = -0.5; clk.add(pend);
    clk.position.set(wx, 2.5, 0.2); rs.add(clk); life.push((t) => { hand.rotation.x = -t * 0.8; });
    const cal = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.7), new THREE.MeshLambertMaterial({ map: paint(200, 280, (g, w, h) => { g.fillStyle = '#f4ead0'; g.fillRect(0, 0, w, h); g.fillStyle = '#b8302a'; g.fillRect(0, 0, w, 70); g.fillStyle = '#fff'; g.font = "800 44px 'Oswald'"; g.textAlign = 'center'; g.fillText('1947', w / 2, 54); g.fillStyle = '#2a1c17'; g.font = "800 36px 'Noto Malayalam'"; g.fillText('ജൂൺ', w / 2, 118); g.font = "700 22px 'Oswald'"; for (let i = 0; i < 30; i++) { g.fillStyle = i === 17 ? '#b8302a' : '#2a1c17'; g.fillText(String(i + 1), 24 + (i % 6) * 30, 160 + Math.floor(i / 6) * 24); } g.strokeStyle = '#b8302a'; g.lineWidth = 4; g.beginPath(); g.arc(24 + 5 * 30, 160 + 2 * 24 - 8, 15, 0, 7); g.stroke(); }) }));
    cal.position.set(wx + 0.01, 1.75, -0.9); cal.rotation.y = Math.PI / 2; rs.add(cal); }
  // telegraph poles + wires on the right verge, crows on the wire
  const poleTops = []; for (let i = 0; i < 6; i++) { const zz = 2 - i * 9; const p = mesh(new THREE.CylinderGeometry(0.08, 0.11, 8, 8), mat(T.wood)); p.position.set(3.3, 4, zz); scene.add(p);
    const arm = box(1.4, 0.1, 0.1, T.wood, { tileM: 1 }); arm.position.set(3.3, 7.6, zz); scene.add(arm); poleTops.push(zz); }
  for (const x of [2.75, 3.85]) { const pts = []; poleTops.forEach((zz, i) => { pts.push(P(x, 7.72, zz)); if (i < poleTops.length - 1) pts.push(P(x, 7.2, zz - 4.5)); });
    scene.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 120, 0.012, 4), col(0x2a1c17), { shadow: false })); }
  for (let i = 0; i < 4; i++) { const cr = new THREE.Group(); const b = mesh(new THREE.SphereGeometry(0.13, 10, 8), col(0x2a2a30)); b.scale.set(1.4, 1, 0.9); cr.add(b);
    const hd = mesh(new THREE.SphereGeometry(0.08, 8, 6), col(0x3a3a44)); hd.position.set(0.14, 0.1, 0); cr.add(hd); const bk = mesh(new THREE.ConeGeometry(0.03, 0.1, 5), col(0x1a1a1a)); bk.rotation.z = -Math.PI / 2; bk.position.set(0.24, 0.1, 0); cr.add(bk);
    cr.position.set(2.75 + (i % 2) * 1.1, 7.5, -2.2 - i * 1.4); cr.rotation.y = i * 1.3; scene.add(cr); life.push((t) => { hd.rotation.z = Math.sin(t * 3 + i * 2) * 0.3; cr.rotation.y = i * 1.3 + Math.sin(t * 0.7 + i) * 0.4; }); }
  // bunting across the street
  for (const zz of [-2.5, -11, -20]) { const bu = bunting(P(-4, 6.4, zz), P(4, 6.4, zz + 0.6), 16, zz * -7); scene.add(bu); life.push((t) => bu.userData.flags.forEach((f) => { f.rotation.x = Math.sin(t * 2.2 + f.userData.ph) * 0.35; })); }
  // palms + banana plants behind and between the rows
  const palms = [];
  [[-12, -3, 9], [-11, -14, 10], [-13, -26, 9], [12, -1, 9.5], [11.5, -12, 8.5], [12.5, -25, 10], [-9, 9, 8], [9, 10, 9], [-6, -48, 9], [6, -46, 10], [-14, -40, 9], [14, -38, 9]].forEach(([x, zz, h], i) => { const p = palm(h, 0.12 + (i % 3) * 0.08, i + 1); p.position.set(x, 0, zz); p.rotation.y = i * 1.7; scene.add(p); palms.push(p); });
  life.push((t) => palms.forEach((p) => p.userData.sway(t)));
  [[-8.6, 6], [8.4, 3], [-8.8, -16]].forEach(([x, zz], i) => { const b = banana(i + 4); b.position.set(x, 0, zz); scene.add(b); });
  // end of the street: the temple gopuram in the haze, hills beyond
  const gp = gopuram(T); gp.position.set(0, 0, -62); scene.add(gp);
  for (let i = 0; i < 6; i++) { const hl = mesh(new THREE.SphereGeometry(18 + i * 3, 16, 10), col(i % 2 ? 0x7aa06a : 0x6a9470), { shadow: false }); hl.scale.y = 0.35; hl.position.set(-60 + i * 24, -2, -110 - (i % 3) * 10); scene.add(hl); }
  // street life: chickens, cart, bicycle, a cow-free cart for now
  for (let i = 0; i < 5; i++) { const ch = chicken(i + 3); ch.position.set(-0.6 + (i % 3) * 0.6, 0, -3.0 - i * 0.55); ch.rotation.y = i * 1.9; ch.scale.setScalar(0.8); scene.add(ch); life.push((t) => { ch.userData.head.position.y = 0.42 - Math.max(0, Math.sin(t * 4 + i * 2)) * 0.14; }); }
  { const fg = new THREE.Group(); const matt = mesh(new THREE.PlaneGeometry(1.6, 1.1), col(0xc8a058)); matt.rotation.x = -Math.PI / 2; matt.position.y = 0.02; fg.add(matt);
    const cols = [0xd04a24, 0x6aa83e, 0xe8a030, 0x8a3a8a];
    for (let k = 0; k < 4; k++) { const bs = mesh(new THREE.CylinderGeometry(0.3, 0.22, 0.26, 14), col(0xa87a3a)); bs.position.set(-0.45 + (k % 2) * 0.8, 0.13, -0.25 + Math.floor(k / 2) * 0.5); fg.add(bs);
      for (let j = 0; j < 9; j++) { const fr = mesh(new THREE.SphereGeometry(0.075, 8, 6), col(cols[k])); fr.position.set(bs.position.x + Math.cos(j * 2.1) * 0.16 * (j % 3) / 2, 0.3 + (j % 3) * 0.04, bs.position.z + Math.sin(j * 2.1) * 0.16 * (j % 3) / 2); fg.add(fr); } }
    if (0) { const umb = mesh(new THREE.ConeGeometry(1.2, 0.5, 12, 1, true), new THREE.MeshLambertMaterial({ color: 0x2a3a7a, side: THREE.DoubleSide })); umb.position.set(0.2, 2.1, 0); fg.add(umb);
    const pole = mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.1, 6), col(0x2a1c17)); pole.position.set(0.2, 1.05, 0); fg.add(pole); }
    fg.position.set(1.0, 0, -1.2); fg.rotation.y = 0.6; fg.scale.setScalar(0.8); scene.add(fg); }
  const ct = cart(T); ct.position.set(1.6, 0, -13); ct.rotation.y = 0.15; scene.add(ct);
  const bk = bicycle(); bk.position.set(-3.2, 0, 4.4); bk.rotation.y = 0.2; bk.rotation.z = 0.12; scene.add(bk);
  // lighting: warm morning sun (key) from the right/front, blue sky fill, warm bounce
  const sun = new THREE.DirectionalLight(0xfff0d8, 1.7); sun.position.set(14, 20, 12); sun.target.position.set(-2, 0, -4); scene.add(sun, sun.target);
  sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; Object.assign(sun.shadow.camera, { left: -20, right: 20, top: 24, bottom: -24, near: 1, far: 80 }); sun.shadow.radius = 3;
  scene.add(new THREE.HemisphereLight(0xcfe2ff, 0xc89a6a, 0.95));
  return { scene, life, shops, radio };
}

// cast for the radio scene
export function radioCrowd(scene) {
  const extra = (base, o) => ({ ...CAST[base], ...o });
  const people = [
    ['kannan', { expr: 'grin', L: { a: 'point', b: 'up', t: 0.3 }, R: 'hip', look: -1, lookY: -0.6 }, [-2.55, -2.4]],
    ['ammini', { expr: 'smug', L: 'cross', R: 'chin', look: -0.6 }, [-3.15, -1.45]],
    ['fisher', { expr: 'shock', R: 'hold', look: -1 }, [-3.3, -5.95]],
    ['chaya', { expr: 'beam', R: 'holdUp', look: -1 }, [-1.45, -5.05]],
    ['meenu', { expr: 'beam', R: 'up', look: -1 }, [-2.15, -1.25]],
    ['postman', { expr: 'think', R: 'chin', look: -1 }, [-0.85, -6.6]],
    [extra('kannan', { name: 'X1', shirt: '#e6dcc4', shirtDark: '#c8b896', hair: CAST.chaya.hair, stache: false }), { expr: 'shock', L: 'mouth', look: -1 }, [-2.65, -6.65]],
    [extra('ammini', { name: 'X2', shirt: '#3d6fb0', shirtDark: '#2a5490', hair: CAST.meenu.hair, glasses: false, wrinkles: false, neriyathu: false }), { expr: 'smile', L: 'hold', look: -1 }, [-1.95, -6.15]],
    [extra('fisher', { name: 'X3', mundu: '#7a3a8a' }), { expr: 'laugh', R: 'wave', look: -1 }, [-1.2, -3.0]],
  ];
  const cards = people.map(([who, o, [x, zz]]) => { const c = card(who, o); c.position.set(x, 0, zz); scene.add(c); c.userData.base = o; return c; });
  return cards;
}
