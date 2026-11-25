// A Dutch East India Company (VOC) ship of the 1740s: curved hull, high stern castle, gun ports,
// three masts with bellied square sails, the Dutch tricolour with the VOC mark. Bow points +x. ~32 m long.
import * as K from '../../pipeline/toon3d.js';
const THREE = K.THREE;

export function voFlagTex() { return K.paint(300, 200, (g, w, h) => { g.fillStyle = '#c8312c'; g.fillRect(0, 0, w, h / 3); g.fillStyle = '#fbfaf6'; g.fillRect(0, h / 3, w, h / 3); g.fillStyle = '#1f4f8a'; g.fillRect(0, 2 * h / 3, w, h / 3);
  g.strokeStyle = '#2a1c17'; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8); }); }

export function dutchShip({ life = null, seed = 3 } = {}) {
  const g = new THREE.Group(), T = K.stdTextures();
  // hull: side profile extruded, then pinched at the bow
  const sh = new THREE.Shape(); sh.moveTo(-15, 6.5); sh.lineTo(-15.5, 1.5); sh.quadraticCurveTo(-13, -2.2, 0, -2.4); sh.quadraticCurveTo(13, -2.2, 16, 2.6); sh.lineTo(13, 3.4); sh.lineTo(-9, 3.4); sh.lineTo(-9, 6.5); sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: 8, bevelEnabled: false, curveSegments: 10 }); geo.translate(0, 0, -4);
  const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); const bow = Math.max(0, (x - 6) / 10), keel = Math.max(0, -y / 2.4); p.setZ(i, z * (1 - 0.75 * bow * bow) * (1 - 0.35 * keel)); } geo.computeVertexNormals();
  const hullT = K.paint(256, 128, (c, w, h) => { c.fillStyle = '#6a3e22'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(30,15,5,.45)'; c.lineWidth = 2; for (let y = 4; y < h; y += 8) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); } K.mottle(c, w, h, ['#5a321a', '#7a4a2a'], 80, [4, 20], seed, 0.25); });
  hullT.repeat.set(4, 2); g.add(K.mesh(geo, new THREE.MeshLambertMaterial({ map: hullT })));
  // painted band with gun ports on both sides
  const bandT = K.paint(512, 64, (c, w, h) => { c.fillStyle = '#e8b93a'; c.fillRect(0, 0, w, h); c.fillStyle = '#1f4f8a'; c.fillRect(0, 10, w, h - 20); c.fillStyle = '#1a1210'; for (let x = 20; x < w - 10; x += 42) c.fillRect(x, 20, 20, 24); });
  for (const s of [-1, 1]) { const band = new THREE.Mesh(new THREE.PlaneGeometry(22, 1.3), new THREE.MeshLambertMaterial({ map: bandT })); band.position.set(-2, 1.6, s * 4.02); if (s < 0) band.rotation.y = Math.PI; g.add(band); }
  // stern castle detail: gold windows + lantern
  const stern = K.box(0.2, 2.6, 7, null, { color: 0x1f4f8a }); stern.position.set(-15.1, 4.9, 0); g.add(stern);
  for (let k = 0; k < 4; k++) { const w = K.box(0.25, 0.8, 0.9, null, { color: 0xf2d27a }); w.position.set(-15.15, 4.9, -2.4 + k * 1.6); g.add(w); }
  const lantern = K.mesh(new THREE.SphereGeometry(0.45, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffd060 })); lantern.position.set(-15.2, 7.3, 0); g.add(lantern);
  const deck = K.box(25, 0.2, 7, T.wood, { tileM: 2 }); deck.position.set(1, 3.4, 0); g.add(deck);
  // bowsprit
  const bs = K.mesh(new THREE.CylinderGeometry(0.15, 0.22, 10, 8), K.col(0x4a3020)); bs.rotation.z = -1.15; bs.position.set(19, 5, 0); g.add(bs);
  // masts + sails (bellied planes)
  const sailT = K.paint(128, 128, (c, w, h) => { c.fillStyle = '#f2ead2'; c.fillRect(0, 0, w, h); K.mottle(c, w, h, ['#e0d4b0', '#fbf6e8'], 40, [6, 26], seed + 1, 0.3); c.strokeStyle = 'rgba(120,100,60,.35)'; c.lineWidth = 2; for (let x = 16; x < w; x += 16) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); } });
  const sails = [];
  [[7, 20], [-1, 24], [-9, 17]].forEach(([x, hgt]) => {
    const m = K.mesh(new THREE.CylinderGeometry(0.2, 0.3, hgt, 8), K.col(0x4a3020)); m.position.set(x, 3.4 + hgt / 2, 0); g.add(m);
    [[0.45, 7.5, 5], [0.75, 6, 4]].forEach(([fy, w, h]) => {
      const sg = new THREE.PlaneGeometry(1, 1, 8, 6); const sp = sg.attributes.position; for (let i = 0; i < sp.count; i++) { const u = sp.getX(i), v = sp.getY(i); sp.setZ(i, 0.5 * (1 - 4 * u * u) * (1 - 2 * v * v)); } sg.computeVertexNormals();
      const s = K.mesh(sg, new THREE.MeshLambertMaterial({ map: sailT, side: THREE.DoubleSide }), { shadow: true }); s.scale.set(w, h, 1); s.rotation.y = Math.PI / 2; s.position.set(x + 0.4, 3.4 + hgt * fy, 0); g.add(s); sails.push(s);
      const yard = K.mesh(new THREE.CylinderGeometry(0.1, 0.1, w + 1, 6), K.col(0x4a3020)); yard.rotation.x = Math.PI / 2; yard.position.set(x + 0.2, 3.4 + hgt * fy + h / 2, 0); g.add(yard);
    });
  });
  // rigging lines (bow and stern stays)
  const line = (a, b) => { const d = new THREE.Vector3(...b).sub(new THREE.Vector3(...a)); const c = K.mesh(new THREE.CylinderGeometry(0.04, 0.04, d.length(), 4), K.col(0x2a1c17), { shadow: false }); c.position.set(...a).add(d.clone().multiplyScalar(0.5)); c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); g.add(c); };
  line([7, 23.4, 0], [23, 7.6, 0]); line([-1, 27.4, 0], [7, 23.4, 0]); line([-9, 20.4, 0], [-1, 27.4, 0]); line([-9, 20.4, 0], [-15, 7, 0]);
  for (const s of [-1, 1]) { line([-1, 20, 0], [-1, 3.6, s * 3.9]); line([7, 16, 0], [7, 3.6, s * 3.9]); }
  // flag at the stern
  if (life) { const ft = voFlagTex(); const geoF = new THREE.PlaneGeometry(4, 2.6, 10, 1); geoF.translate(-2, 0, 0); const f = K.mesh(geoF, new THREE.MeshLambertMaterial({ map: ft, side: THREE.DoubleSide }), { shadow: false }); const p0 = geoF.attributes.position.array.slice();
    f.position.set(-15.4, 10, 0); g.add(f); const pole = K.mesh(new THREE.CylinderGeometry(0.08, 0.08, 4, 6), K.col(0x4a3020)); pole.position.set(-15.2, 9.2, 0); g.add(pole);
    life.push((t) => { const a = geoF.attributes.position; for (let i = 0; i < a.count; i++) { const x = -p0[i * 3]; a.setZ(i, Math.sin(x * 1.5 - t * 4) * 0.25 * x / 4); } a.needsUpdate = true; geoF.computeVertexNormals(); });
    life.push((t) => sails.forEach((s, i) => { s.scale.z = 1 + Math.sin(t * 1.3 + i) * 0.15; })); }
  return g;
}
