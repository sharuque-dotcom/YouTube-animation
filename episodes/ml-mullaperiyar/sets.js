// Mullaperiyar sets. The OG look (bean cards, ink lines, still camera with a gentle push) with real 3D where it helps:
// damSet(renderer) is the hero: a sculpted Western Ghats gorge (Poly Haven forest-floor + rock textures, CC0), the
// masonry gravity dam in old stone (Poly Haven old_stone_wall), a rippling reservoir with the drowned tree stumps of
// Periyar lake, real CC0 trees (Poly Haven island_tree / shrub / boulder), a photographic HDRI sky and light.
//   API: setBuild(u) (0 = bare gorge, 1 = finished dam + full lake), setDusk(on), setFlow(u) (water arrow over the
//   ridge to the east), setAge(u) (moss and streaks on the face), setLevel(ft) (lake level 136..142 on the gauge).
// durbarSet(): a Travancore palace hall (teak pillars, laterite floor, brass lamp), a table with the lease scroll and a
//   quill. API: setEra(1886 | 1970) (1970: a plain office desk, a file, a ceiling fan, a Kerala Government board).
// dryFieldSet(): Madurai plains in drought: cracked earth, dead stubble, a dry well, blazing sun, far blue hills.
// tankHouseSet(): the analogy: a tiled house whose rooftop tank is piped over the wall to the neighbour, who holds
//   the tap; the family sleeps on a mat on the verandah below. API: setTap(u), setDrip(t).
import * as K from '../../pipeline/toon3d.js';
import { model, hdri, texMaterial } from '../../pipeline/assets.js';
import { conch } from '../ml-travancore/sets.js';
const THREE = K.THREE;
const glow = (c, o = 1) => new THREE.MeshBasicMaterial({ color: c, transparent: o < 1, opacity: o, depthWrite: o >= 1 });
const noInk = (m) => { m.userData.noInk = true; m.traverse?.((o) => { o.userData.noInk = true; }); return m; };
function plane(w, h, tex, basic = false) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), basic ? new THREE.MeshBasicMaterial({ map: tex, transparent: true }) : new THREE.MeshLambertMaterial({ map: tex, transparent: true })); m.receiveShadow = true; return m; }
const canvasTex = (w, h) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; return { cv, tex, g: cv.getContext('2d') }; };
function lights(scene, { key = 0xfff0d0, ki = 1.3, pos = [6, 9, 8], hemi = [0xfff4e0, 0x8a6a4a, 1.05], box = 8, target = [0, 0, -2] } = {}) {
  const sun = new THREE.DirectionalLight(key, ki); sun.position.set(...pos); sun.target.position.set(...target); scene.add(sun, sun.target); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005;
  Object.assign(sun.shadow.camera, { left: -box, right: box, top: box, bottom: -box, near: 1, far: 200 }); const h = new THREE.HemisphereLight(...hemi); scene.add(h); return { sun, hemi: h };
}
// value noise for terrain
const R2 = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
function vnoise(x, y) { const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const a = R2(ix, iy), b = R2(ix + 1, iy), c = R2(ix, iy + 1), d = R2(ix + 1, iy + 1); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }
const fbm = (x, y, o = 5) => { let s = 0, a = 0.5, f = 1; for (let i = 0; i < o; i++) { s += a * vnoise(x * f, y * f); f *= 2.03; a *= 0.5; } return s; };

// ---------------------------------------------------------------- THE DAM IN ITS GORGE (3D hero)
// Units ~ metres / 4. River runs along z (upstream = -z, the lake; downstream = +z, the camera side). Dam crest along x
// at z = 0: 72 long, 14 high (the real one is ~366 m by ~54 m), stepped downstream face, a parapet on the crest.
const DAM_H = 14, DAM_L = 50, LAKE_Y = 12.0;
// valley half-width: a narrow gorge at the dam (z=0), wider downstream, a broad basin upstream (the lake)
const halfW = (z) => (z >= 0 ? 4 + Math.min(z, 80) * 0.14 : 4 + Math.min(-z, 36) * 0.75);
function gorgeHeight(x, z) {
  const xm = x + Math.sin(z * 0.03) * (z < 0 ? 10 : 3);                    // a gentle meander
  const d = Math.max(0, Math.abs(xm) - halfW(z));
  let h = d * 0.95 + Math.pow(d, 1.25) * 0.08 + Math.max(0, d - 45) * (0.5 + fbm(x * 0.01, z * 0.01, 3) * 0.9);                              // valley walls steepening into ridges
  h += (fbm(x * 0.025 + 7, z * 0.025, 5) - 0.5) * 22 * Math.min(1, d / 18) + (fbm(x * 0.12, z * 0.12, 3) - 0.5) * 2.4;
  if (z < -2) h -= 9 * (1 - Math.min(1, d / 30));                          // the drowned basin floor sits under the lake
  const lg = Math.hypot(x + 17, z - 36); if (lg < 10) { const f = Math.min(1, Math.max(0, (lg - 5) / 5)); h = h * f + (1 - f) * 4.2; }   // a flat viewpoint on the left bank
  return Math.abs(xm) < 3 && z > -2 ? -0.9 : h;                             // river bed below the dam
}
export async function damSet(renderer) {
  const scene = new THREE.Scene(), life = [];
  const [day, dusk] = await Promise.all([hdri(renderer, 'kloppenheim_06_puresky'), hdri(renderer, 'belfast_sunset_puresky')]);
  scene.background = day.background; scene.environment = day.env; scene.backgroundIntensity = 0.62; scene.environmentIntensity = 0.5;
  scene.backgroundRotation = new THREE.Euler(0, 1.2, 0); scene.environmentRotation = scene.backgroundRotation;
  scene.fog = new THREE.Fog(0xa9c2cc, 160, 900);
  const duskSky = K.skyTexture({ seed: 21, clouds: 7, top: '#3a3a6a', mid: '#d87a5a', bottom: '#f6c27a' });
  // terrain: a 520 x 520 sculpted mesh, forest floor up the slopes, bare rock on steep faces (by slope, via vertex colour mix)
  const N = 340, S = 900, geo = new THREE.PlaneGeometry(S, S, N, N); geo.rotateX(-Math.PI / 2); geo.translate(0, 0, -90); const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), z = pos.getZ(i); pos.setY(i, gorgeHeight(x, z)); }
  geo.computeVertexNormals(); const cols = new Float32Array(pos.count * 3); const nrm = geo.attributes.normal;
  for (let i = 0; i < pos.count; i++) { const steep = 1 - nrm.getY(i), y = pos.getY(i); const g = Math.max(0, Math.min(1, (0.8 - steep) / 0.2));
    const c = new THREE.Color().setRGB(0.34, 0.36, 0.28).lerp(new THREE.Color(0.16 + fbm(pos.getX(i) * 0.05, pos.getZ(i) * 0.05, 2) * 0.14, 0.4, 0.12), g); if (y < LAKE_Y + 0.6 && y > LAKE_Y - 3) c.lerp(new THREE.Color(0.55, 0.45, 0.32), 0.5);
    cols[i * 3] = c.r; cols[i * 3 + 1] = c.g; cols[i * 3 + 2] = c.b; }
  geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  const ground = texMaterial('forest_ground_04', { repeat: [90, 90], vertexColors: true, roughness: 1 }); ground.color = new THREE.Color(1.5, 1.5, 1.5);
  const terrain = K.mesh(geo, ground); scene.add(terrain);
  // the dam: a gravity section (crest 3.6, base 13) extruded across the gorge, stepped downstream face, parapet + spillway
  const stone = texMaterial('old_stone_wall', { repeat: [1, 1], roughness: 0.95 }); stone.color = new THREE.Color(0.95, 0.9, 0.8);
  const sh = new THREE.Shape(); sh.moveTo(-1.8, DAM_H); sh.lineTo(1.8, DAM_H);
  for (let k = 0; k < 7; k++) { const y = DAM_H - (k + 1) * DAM_H / 7, x = 1.8 + (k + 1) * (11.2 / 7); sh.lineTo(x - 11.2 / 7 * 0.25, DAM_H - k * DAM_H / 7 - DAM_H / 7 * 0.15); sh.lineTo(x, y); }
  sh.lineTo(-2.6, 0); sh.lineTo(-1.8, DAM_H);
  const dg = new THREE.ExtrudeGeometry(sh, { depth: DAM_L, bevelEnabled: false }); dg.translate(0, 0, -DAM_L / 2); dg.rotateY(-Math.PI / 2);
  // box-project UVs so the masonry tiles evenly on every face
  { const p = dg.attributes.position, n = dg.attributes.normal, uv = dg.attributes.uv; for (let i = 0; i < p.count; i++) { const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i));
    const [u, v] = ay > ax && ay > az ? [p.getX(i), p.getZ(i)] : ax > az ? [p.getZ(i), p.getY(i)] : [p.getX(i), p.getY(i)]; uv.setXY(i, u / 3, v / 3); } }
  const damBody = new THREE.Group(); const dam = K.mesh(dg, stone); damBody.add(dam);
  const parapetM = texMaterial('old_stone_wall', { repeat: [20, 0.3], roughness: 0.95 }); parapetM.color = new THREE.Color(0.92, 0.88, 0.8);
  for (const z of [-1.6, 1.6]) { const pp = K.mesh(new THREE.BoxGeometry(DAM_L, 0.7, 0.35), parapetM); pp.position.set(0, DAM_H + 0.35, z); damBody.add(pp); }
  for (let k = -5; k <= 5; k++) { const lamp = K.mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.4, 6), K.col(0x2a2a30)); lamp.position.set(k * 6.4, DAM_H + 1.1, 1.6); damBody.add(lamp); }
  // the stepped face gets a moss/streak overlay that grows with age
  const ageTex = K.paint(512, 256, (g, w, h) => { g.clearRect(0, 0, w, h); for (let i = 0; i < 260; i++) { const x = Math.random() * w, y = Math.random() * h * 0.7, l = 30 + Math.random() * 120; const gr = g.createLinearGradient(x, y, x, y + l); gr.addColorStop(0, 'rgba(40,50,30,.0)'); gr.addColorStop(0.2, `rgba(${40 + Math.random() * 30},${55 + Math.random() * 30},30,.45)`); gr.addColorStop(1, 'rgba(40,50,30,0)'); g.fillStyle = gr; g.fillRect(x, y, 2 + Math.random() * 5, l); }
    for (let i = 0; i < 90; i++) { g.fillStyle = `rgba(${60 + Math.random() * 40},${90 + Math.random() * 40},40,.35)`; g.beginPath(); g.ellipse(Math.random() * w, h * 0.55 + Math.random() * h * 0.45, 10 + Math.random() * 40, 4 + Math.random() * 10, 0, 0, 7); g.fill(); } });
  const ageM = new THREE.MeshLambertMaterial({ map: ageTex, transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  const face = noInk(new THREE.Mesh(new THREE.PlaneGeometry(DAM_L, Math.hypot(DAM_H, 11.2)), ageM)); face.position.set(0, DAM_H / 2, 1.8 + 5.6 + 0.15); face.rotation.x = -Math.atan2(11.2, DAM_H) + Math.PI / 2 - Math.PI / 2; face.rotation.x = -(Math.PI / 2 - Math.atan2(DAM_H, 11.2)); damBody.add(face);
  damBody.position.y = 0; scene.add(damBody);
  // scaffolding + a construction crane for the build time-lapse
  const scaff = new THREE.Group(); const wood = K.col(0x8a6a42); for (let x = -30; x <= 30; x += 5) for (const z of [3, 9]) { const p = K.mesh(new THREE.CylinderGeometry(0.1, 0.1, 16, 5), wood); p.position.set(x, 8, z); scaff.add(p); }
  for (let y = 2; y < 16; y += 3.5) for (const z of [3, 9]) { const b = K.mesh(new THREE.BoxGeometry(62, 0.15, 0.15), wood); b.position.set(0, y, z); scaff.add(b); } scene.add(scaff);
  // water: reservoir + the river below, PBR with a rolling ripple normal map that reflects the sky
  const rip = K.paint(512, 512, (g, w, h) => { const id = g.createImageData(w, h); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const e = 0.6, hx = fbm((x + e) / 40, y / 40, 4) - fbm((x - e) / 40, y / 40, 4), hy = fbm(x / 40, (y + e) / 40, 4) - fbm(x / 40, (y - e) / 40, 4); const i = (y * w + x) * 4;
    id.data[i] = 128 + hx * 900; id.data[i + 1] = 128 + hy * 900; id.data[i + 2] = 255; id.data[i + 3] = 255; } g.putImageData(id, 0, 0); });
  rip.colorSpace = THREE.NoColorSpace; rip.wrapS = rip.wrapT = THREE.RepeatWrapping; rip.repeat.set(30, 30);
  const waterM = new THREE.MeshStandardMaterial({ color: 0x1f4a50, roughness: 0.08, metalness: 0.0, normalMap: rip, normalScale: new THREE.Vector2(0.35, 0.35), envMapIntensity: 1.4 });
  const lake = noInk(new THREE.Mesh(new THREE.PlaneGeometry(420, 300), waterM)); lake.rotation.x = -Math.PI / 2; lake.position.set(0, LAKE_Y, -150 - 1.8); scene.add(lake);
  const riverM = waterM.clone(); riverM.color = new THREE.Color(0x2a5a58); const river = noInk(new THREE.Mesh(new THREE.PlaneGeometry(520, 250), riverM)); river.rotation.x = -Math.PI / 2; river.position.set(0, -0.3, 125 + 9); scene.add(river);
  life.push((t) => { rip.offset.set(t * 0.012, t * 0.007); });
  // drowned tree stumps in the lake (the famous dead trees of Periyar lake)
  const stumpM = K.col(0x6a5a4a); for (let k = 0; k < 40; k++) { const x = (R2(k, 1) - 0.5) * 120, z = -18 - R2(k, 2) * 110; if (gorgeHeight(x, z) > LAKE_Y - 0.5) continue; const hgt = 2 + R2(k, 3) * 4;
    const st = K.mesh(new THREE.CylinderGeometry(0.12, 0.25, hgt, 6), stumpM); st.position.set(x, LAKE_Y + hgt / 2 - 1.2, z); st.rotation.z = (R2(k, 4) - 0.5) * 0.3; scene.add(st);
    if (R2(k, 5) > 0.5) { const br = K.mesh(new THREE.CylinderGeometry(0.05, 0.08, 1.6, 5), stumpM); br.position.set(x + 0.4, LAKE_Y + hgt - 1.4, z); br.rotation.z = -0.9; scene.add(br); } }
  // forest: real CC0 trees near camera, cheap toon trees across the slopes, shrubs and boulders
  const [tree1, tree2, shrub, boulder] = await Promise.all([model('ph:island_tree_01', { height: 9 }), model('ph:island_tree_02', { height: 8 }), model('ph:shrub_01', { height: 1.6 }), model('ph:boulder_01', { height: 2.2 })]);
  const foliage = [0x3f6a2a, 0x4a7a30, 0x2f5a26, 0x56843a]; const cone = new THREE.ConeGeometry(1.1, 3.6, 7), ball = new THREE.DodecahedronGeometry(1.3, 1), trunk = new THREE.CylinderGeometry(0.18, 0.25, 2, 5);
  const inst = foliage.map((c, i) => new THREE.InstancedMesh(i % 2 ? cone : ball, K.col(c), 5000)); const tr = new THREE.InstancedMesh(trunk, K.col(0x5a4030), 20000); inst.forEach((m) => { m.count = 0; m.castShadow = true; scene.add(m); }); tr.count = 0; scene.add(tr);
  const dm = new THREE.Object3D(); for (let k = 0; k < 20000; k++) { const x = (R2(k, 11) - 0.5) * 640, z = (R2(k, 12) - 0.5) * 560 - 120; const y = gorgeHeight(x, z); if (y < LAKE_Y + 0.8 && z < -2) continue; if (Math.abs(x) < DAM_L / 2 + 2 && Math.abs(z) < 14) continue; if (z > -2 && y < 1.2) continue; if (Math.abs(x + 17) < 9 && z > 26 && z < 60) continue;
    const far = Math.hypot(x, z + 40) > 150 ? 1.8 : 1, s = (0.55 + R2(k, 13) * 0.7) * far, m = inst[k % 4]; dm.position.set(x, y + (k % 4 % 2 ? 2.4 : 2.0) * s, z); dm.rotation.set(0, R2(k, 14) * 6, 0); dm.scale.setScalar(s); dm.updateMatrix(); m.setMatrixAt(m.count++, dm.matrix);
    dm.position.set(x, y + 0.9 * s, z); dm.updateMatrix(); tr.setMatrixAt(tr.count++, dm.matrix); }
  for (let k = 0; k < 18; k++) { const x = 12 + R2(k, 21) * 14, z = 16 + R2(k, 22) * 30; const y = gorgeHeight(x, z); if (y < 0) continue; const c = boulder.clone(true); c.position.set(x, y - 0.1, z); c.rotation.y = k; c.scale.multiplyScalar(0.8 + R2(k, 23) * 0.8); scene.add(c); }
  // the viewpoint ledge the cast stands on (downstream, left bank), a stone railing, a sign post
  // the flow arrow: a glowing ribbon from the lake over the eastern ridge (setFlow), 3D but unlit so it reads like a graphic
  const fp = [[6, -30], [30, -45], [55, -50], [80, -48], [105, -40], [135, -28]].map(([x, z], i) => new THREE.Vector3(x, Math.max(LAKE_Y + 1.5, gorgeHeight(x, z) + 5) + (i ? 2 : 0), z)); const curve = new THREE.CatmullRomCurve3(fp);
  const flowGeo = new THREE.TubeGeometry(curve, 120, 1.3, 10); const flowM = new THREE.MeshBasicMaterial({ color: 0x5fd0ff, transparent: true, opacity: 0.9 }); const flow = noInk(new THREE.Mesh(flowGeo, flowM)); flow.geometry.setDrawRange(0, 0); scene.add(flow);
  const head = noInk(new THREE.Mesh(new THREE.ConeGeometry(3.2, 7, 12), flowM)); scene.add(head);
  const setFlow = (u) => { const n = flowGeo.index.count; flow.geometry.setDrawRange(0, Math.floor(n * Math.min(1, u)) - (Math.floor(n * Math.min(1, u)) % 3)); head.visible = u > 0.03; const p = curve.getPointAt(Math.min(0.999, Math.max(0.001, u))), d = curve.getTangentAt(Math.min(0.999, Math.max(0.001, u)));
    head.position.copy(p); head.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d); };
  setFlow(0);
  const { sun, hemi } = lights(scene, { key: 0xfff1d8, ki: 2.2, pos: [-60, 90, 70], hemi: [0xdfeeff, 0x4a5a3a, 0.35], box: 60, target: [0, 0, 0] }); sun.shadow.camera.far = 300; sun.shadow.camera.updateProjectionMatrix();
  // gauge post on the dam crest (lake level), drawn on a canvas board facing downstream
  const gb = canvasTex(256, 512); const gauge = plane(2.2, 4.4, gb.tex); gauge.position.set(-22, DAM_H + 2.6, 2.0); scene.add(gauge);
  const setLevel = (ft) => { const g = gb.g; g.fillStyle = '#f4f0e6'; g.fillRect(0, 0, 256, 512); g.strokeStyle = '#2a1c17'; g.lineWidth = 10; g.strokeRect(5, 5, 246, 502);
    for (let f = 130; f <= 146; f++) { const y = 470 - (f - 130) * 26; g.fillStyle = '#2a1c17'; g.fillRect(150, y, f % 2 ? 30 : 60, 5); if (f % 2 === 0) { g.font = "700 34px 'Oswald'"; g.textAlign = 'right'; g.fillText(String(f), 140, y + 12); } }
    const y = 470 - (ft - 130) * 26; g.fillStyle = 'rgba(40,140,200,.55)'; g.fillRect(150, y, 90, 470 - y + 30); g.fillStyle = '#c8312c'; g.fillRect(140, y - 4, 110, 8); gb.tex.needsUpdate = true; };
  setLevel(136);
  const setBuild = (u) => { const b = Math.max(0.001, Math.min(1, u)); damBody.scale.y = b; scaff.visible = u > 0.02 && u < 0.98; lake.position.y = -2 + (LAKE_Y + 2) * Math.max(0, (u - 0.6) / 0.4); lake.visible = u > 0.6; gauge.visible = u > 0.99; };
  const setAge = (u) => { ageM.opacity = 0.85 * u; stone.color.setRGB(0.95 - 0.15 * u, 0.9 - 0.14 * u, 0.8 - 0.12 * u); };
  const setDusk = (on) => { const h = on ? dusk : day; scene.background = on ? duskSky : h.background; scene.environment = h.env; scene.backgroundRotation = new THREE.Euler(0, on ? 2.6 : 1.2, 0); scene.environmentRotation = scene.backgroundRotation;
    sun.color.set(on ? 0xffa060 : 0xfff1d8); sun.intensity = on ? 1.5 : 2.2; sun.position.set(on ? 90 : -60, on ? 30 : 90, on ? -60 : 70); hemi.intensity = on ? 0.25 : 0.35; scene.fog.color.set(on ? 0xb88a72 : 0xa9c2cc); scene.backgroundIntensity = on ? 0.3 : 0.62; waterM.envMapIntensity = on ? 0.18 : 1.4; waterM.color.set(on ? 0x3a3a4a : 0x1f4a50); waterM.roughness = on ? 0.4 : 0.08; riverM.roughness = waterM.roughness; riverM.envMapIntensity = waterM.envMapIntensity; scene.environmentIntensity = on ? 0.35 : 0.5; };
  setBuild(1); setAge(0);
  return { scene, life, setBuild, setFlow, setAge, setDusk, setLevel, gorgeHeight, DAM_H, LAKE_Y };
}

// ---------------------------------------------------------------- TRAVANCORE DURBAR HALL (1886) / KERALA OFFICE (1970)
export function durbarSet() {
  const T = K.stdTextures(), life = [], scene = new THREE.Scene(); scene.background = new THREE.Color(0x3a2418);
  const floor = K.box(16, 0.1, 14, T.wood, { tileM: 1.0 }); floor.position.y = -0.05; scene.add(floor);
  const back = K.box(16, 7, 0.3, T.lime, { tileM: 3 }); back.position.set(0, 3.5, -6); scene.add(back);
  const dado = K.box(16, 1.6, 0.06, T.wood, { tileM: 1.5 }); dado.position.set(0, 0.8, -5.82); scene.add(dado);
  for (const s of [-1, 1]) { const sw = K.box(0.3, 7, 14, T.lime, { tileM: 3 }); sw.position.set(s * 8, 3.5, 0); scene.add(sw); }
  const ceil = K.box(16, 0.2, 14, T.wood, { tileM: 1 }); ceil.position.y = 7; scene.add(ceil);
  for (let x = -7; x <= 7; x += 1.4) { const bm = K.box(0.25, 0.3, 14, T.wood, { tileM: 1 }); bm.position.set(x, 6.8, 0); scene.add(bm); }
  // carved teak pillars with brass caps
  const pillars = []; for (const x of [-5, -2.4, 2.4, 5]) for (const z of [-4.2, 1.2]) { const p = K.mesh(new THREE.CylinderGeometry(0.28, 0.34, 6.8, 12), K.mat(T.wood, 0xb07a4a)); p.position.set(x, 3.4, z); scene.add(p); const cap = K.mesh(new THREE.CylinderGeometry(0.42, 0.3, 0.3, 12), K.col(0xd9a521)); cap.position.set(x, 6.6, z); scene.add(cap); pillars.push(p); }
  // the royal emblem (conch) on a red drape behind
  const drape = plane(5.2, 4.4, K.paint(512, 440, (g, w, h) => { g.fillStyle = '#7a1418'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 36) { const gr = g.createLinearGradient(x, 0, x + 36, 0); gr.addColorStop(0, 'rgba(0,0,0,.35)'); gr.addColorStop(0.5, 'rgba(255,120,120,.15)'); gr.addColorStop(1, 'rgba(0,0,0,.35)'); g.fillStyle = gr; g.fillRect(x, 0, 36, h); }
    g.fillStyle = '#d9a521'; g.fillRect(0, h - 22, w, 22); conch(g, w / 2, h * 0.45, 0.85, { glowA: 0 }); }));
  drape.position.set(0, 3.6, -5.8); scene.add(drape);
  // brass lamp (nilavilakku) with flames
  const lamp = new THREE.Group(); const lb = K.mesh(new THREE.CylinderGeometry(0.4, 0.5, 0.15, 16), K.col(0xd9a521)); lamp.add(lb); const ls = K.mesh(new THREE.CylinderGeometry(0.06, 0.09, 1.6, 8), K.col(0xd9a521)); ls.position.y = 0.8; lamp.add(ls);
  const lt = K.mesh(new THREE.CylinderGeometry(0.42, 0.18, 0.14, 16), K.col(0xd9a521)); lt.position.y = 1.6; lamp.add(lt); const flames = []; for (let k = 0; k < 5; k++) { const f = noInk(new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.22, 6), glow(0xffc040))); f.position.set(Math.cos(k * 1.26) * 0.34, 1.78, Math.sin(k * 1.26) * 0.34); lamp.add(f); flames.push(f); }
  const lampL = new THREE.PointLight(0xffb060, 3, 7, 1.8); lampL.position.y = 2; lamp.add(lampL); lamp.position.set(3.6, 0, -2.4); scene.add(lamp);
  life.push((t) => flames.forEach((f, k) => { f.scale.y = 1 + Math.sin(t * 13 + k) * 0.18; }));
  // the table: carved rosewood, the lease scroll + an inkpot and quill
  const table = K.box(3.4, 0.12, 1.5, T.wood, { tileM: 1 }); table.position.set(0, 1.05, -1.2); scene.add(table);
  for (const x of [-1.5, 1.5]) for (const z of [-1.8, -0.6]) { const l = K.box(0.14, 1.0, 0.14, T.wood, { tileM: 1 }); l.position.set(x, 0.5, z); scene.add(l); }
  const lease = canvasTex(700, 460); const scroll = plane(1.5, 0.98, lease.tex); scroll.rotation.x = -Math.PI / 2 + 0.06; scroll.position.set(0, 1.12, -1.15); scene.add(scroll);
  for (const s of [-1, 1]) { const rod = K.mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.1, 10), K.col(0xb08a4a)); rod.rotation.x = Math.PI / 2; rod.position.set(s * 0.8, 1.15, -1.15); rod.rotation.z = 0; scroll.parent.add(rod); rod.rotation.set(Math.PI / 2, 0, 0); rod.position.set(s * 0.8, 1.16, -1.15); }
  const ink = K.mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.16, 10), K.col(0x1a1a2a)); ink.position.set(1.15, 1.19, -1.4); scene.add(ink);
  const quill = new THREE.Group(); const qv = K.mesh(new THREE.ConeGeometry(0.07, 0.75, 6), K.col(0xf6f1e4)); qv.position.y = 0.37; quill.add(qv); quill.position.set(1.15, 1.25, -1.4); quill.rotation.z = -0.4; scene.add(quill);
  const drawLease = (era, signed = 0) => { const g = lease.g; g.fillStyle = era === 1970 ? '#f6f3ea' : '#f2e2b8'; g.fillRect(0, 0, 700, 460); g.strokeStyle = '#8a6a3a'; g.lineWidth = 10; g.strokeRect(14, 14, 672, 432);
    g.fillStyle = '#5a3a1a'; g.textAlign = 'center'; g.font = "700 46px 'Oswald'"; g.fillText(era === 1970 ? 'AGREEMENT · 1970' : 'PERIYAR LEASE · 1886', 350, 80);
    g.font = "700 150px 'Oswald'"; g.fillStyle = '#8a1e1e'; g.fillText(era === 1970 ? '999' : '999', 350, 240); g.font = "700 40px 'Oswald'"; g.fillStyle = '#5a3a1a'; g.fillText('YEARS', 350, 290);
    g.strokeStyle = 'rgba(90,58,26,.45)'; g.lineWidth = 5; for (let r = 0; r < 2; r++) { g.beginPath(); g.moveTo(80, 330 + r * 30); g.lineTo(620, 330 + r * 30); g.stroke(); }
    if (signed > 0) { g.strokeStyle = '#1a1a4a'; g.lineWidth = 6; g.beginPath(); for (let k = 0; k <= 40 * signed; k++) { const x = 380 + k * 6, y = 410 + Math.sin(k * 0.9) * 14 - k * 0.4; k ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
    g.fillStyle = '#c8312c'; g.beginPath(); g.arc(130, 405, 30, 0, 7); g.fill(); lease.tex.needsUpdate = true; };
  // 1970 dressing: a ceiling fan, a file stack, a government board, a phone
  const office = new THREE.Group(); const fanG = new THREE.Group(); const rod = K.mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 6), K.col(0x2a2a2a)); rod.position.y = 0.4; fanG.add(rod); const bl = new THREE.Group(); fanG.add(bl);
  for (let k = 0; k < 3; k++) { const b = K.box(1.0, 0.02, 0.18, null, { color: 0x6a5a4a }); b.position.x = 0.55; const p = new THREE.Group(); p.rotation.y = k * Math.PI * 2 / 3; p.add(b); bl.add(p); } fanG.position.set(0, 5.6, -1); office.add(fanG); life.push((t) => { bl.rotation.y = t * 5; });
  const files = K.box(0.7, 0.35, 0.5, null, { color: 0xc8a86a }); files.position.set(-1.1, 1.29, -1.4); office.add(files); const phone = K.box(0.4, 0.18, 0.3, null, { color: 0x1a1a1a }); phone.position.set(1.2, 1.2, -1.6); office.add(phone);
  const board = plane(4.4, 0.9, K.signTex(['കേരള സർക്കാർ · 1970'], { bg: '#1f3f5a', fg: '#f4f0e6', border: '#d9a521', w: 900, h: 190 })); board.position.set(0, 6.2, -5.8); office.add(board); scene.add(office);
  const royalBits = [drape, lamp, quill];
  const setEra = (era) => { office.visible = era === 1970; royalBits.forEach((o) => { o.visible = era !== 1970; }); drawLease(era); back.material = era === 1970 ? K.mat(T.limeBlue) : K.mat(T.lime); };
  setEra(1886);
  lights(scene, { key: 0xfff0d8, ki: 1.2, pos: [-6, 9, 6], hemi: [0xf4f4ff, 0x5a4a3a, 1.05], box: 9 });
  // window light shaft from the left
  const shaft = noInk(K.mesh(new THREE.PlaneGeometry(1.8, 10), new THREE.MeshBasicMaterial({ color: 0xfff0c0, transparent: true, opacity: 0.1, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }), { shadow: false })); shaft.position.set(-4.5, 3, -1); shaft.rotation.set(0, Math.PI / 2, 0.9); scene.add(shaft);
  return { scene, life, setEra, sign: (u, era = 1886) => drawLease(era, u), quill, table };
}

// ---------------------------------------------------------------- MADURAI PLAINS IN DROUGHT
export function dryFieldSet() {
  const life = [], scene = new THREE.Scene(); scene.background = K.skyTexture({ seed: 9, clouds: 2, top: '#6a9ad0', mid: '#e8d8b0', bottom: '#f6e0b0' }); scene.fog = new THREE.Fog(0xf0dcb4, 30, 140);
  const crack = K.paint(512, 512, (g, w, h) => { g.fillStyle = '#c89a62'; g.fillRect(0, 0, w, h); K.mottle(g, w, h, ['#b8885a', '#d8aa70', '#a87a4a'], 500, [8, 40], 4, 0.25); g.strokeStyle = '#6a4424'; g.lineCap = 'round';
    const r = K.rnd(17); for (let k = 0; k < 140; k++) { let x = r() * w, y = r() * h; g.lineWidth = 1 + r() * 1.6; g.globalAlpha = 0.7; g.beginPath(); g.moveTo(x, y); for (let s = 0; s < 5; s++) { x += (r() - 0.5) * 40; y += (r() - 0.5) * 40; g.lineTo(x, y); } g.stroke(); } }, { repeat: [24, 24] });
  const gm = K.mesh(new THREE.PlaneGeometry(220, 220), new THREE.MeshLambertMaterial({ map: crack })); gm.rotation.x = -Math.PI / 2; scene.add(gm);
  // dead stubble rows
  const tuft = new THREE.ConeGeometry(0.025, 0.16, 3); tuft.translate(0, 0.08, 0); const st = new THREE.InstancedMesh(tuft, K.col(0x9a7a4a), 1600); const dm = new THREE.Object3D(); let n = 0;
  for (let z = -30; z < 2; z += 1.2) for (let x = -16; x < 16; x += 0.9) { if (n >= 1600) break; dm.position.set(x + Math.sin(n) * 0.1, 0, z); dm.rotation.set(Math.sin(n * 3) * 0.4, 0, Math.cos(n * 2) * 0.4); dm.updateMatrix(); st.setMatrixAt(n++, dm.matrix); } st.count = n; scene.add(st);
  // a stone well, empty, a bucket on a rope; a lone dry tree; far blue hills (the Ghats, where the water is)
  const well = K.mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.9, 18, 1, true), K.mat(K.stdTextures().laterite)); well.position.set(3.2, 0.45, -3); scene.add(well); const wellIn = K.mesh(new THREE.CircleGeometry(0.95, 18), K.col(0x1a120d)); wellIn.rotation.x = -Math.PI / 2; wellIn.position.set(3.2, 0.2, -3); scene.add(wellIn);
  for (const s of [-1, 1]) { const p = K.mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.8, 6), K.col(0x6a4a2a)); p.position.set(3.2 + s * 0.9, 1.1, -3); scene.add(p); } const bar = K.mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.9, 6), K.col(0x6a4a2a)); bar.rotation.z = Math.PI / 2; bar.position.set(3.2, 1.95, -3); scene.add(bar);
  const tree = new THREE.Group(); const tk = K.mesh(new THREE.CylinderGeometry(0.15, 0.3, 3.2, 7), K.col(0x5a3e28)); tk.position.y = 1.6; tree.add(tk); for (let k = 0; k < 5; k++) { const b = K.mesh(new THREE.CylinderGeometry(0.04, 0.09, 1.6, 5), K.col(0x5a3e28)); b.position.set(Math.cos(k * 1.3) * 0.5, 2.9 + k * 0.1, Math.sin(k * 1.3) * 0.5); b.rotation.set(Math.sin(k) * 0.9, 0, Math.cos(k * 1.3) * 0.9); tree.add(b); }
  tree.position.set(-5, 0, -8); scene.add(tree);
  for (let k = 0; k < 9; k++) { const hl = K.mesh(new THREE.SphereGeometry(16 + (k % 3) * 6, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshLambertMaterial({ color: 0x8aa2c0 }), { shadow: false }); hl.scale.y = 0.45 + (k % 4) * 0.12; hl.position.set(-80 + k * 20, 0, -100 - (k % 2) * 12); scene.add(hl); }
  // heat shimmer sun
  const sunD = noInk(new THREE.Mesh(new THREE.CircleGeometry(6, 32), glow(0xfff2c0))); sunD.position.set(18, 30, -100); scene.add(sunD);
  lights(scene, { key: 0xffe0a0, ki: 1.7, pos: [8, 14, -4], hemi: [0xfff0d0, 0x8a5a3a, 1.0], box: 14 });
  return { scene, life };
}

// ---------------------------------------------------------------- THE ROOFTOP TANK ANALOGY
export function tankHouseSet() {
  const T = K.stdTextures(), life = [], scene = new THREE.Scene(); scene.background = K.skyTexture({ seed: 31, clouds: 5, top: '#2a3a6a', mid: '#5a6a9a', bottom: '#d8a880' }); scene.fog = new THREE.Fog(0x6a6a8a, 30, 120);
  const gr = K.mesh(new THREE.PlaneGeometry(200, 200), K.mat(T.grass)); gr.rotation.x = -Math.PI / 2; scene.add(gr);
  const yard = K.box(10, 0.08, 8, T.dirt, { tileM: 3 }); yard.position.set(-1, 0.04, 0); scene.add(yard);
  // our tiled house, open verandah facing camera
  const house = new THREE.Group(); const plinth = K.box(7, 0.5, 5, T.laterite, { tileM: 1.2 }); plinth.position.y = 0.25; house.add(plinth);
  const walls = K.box(6.4, 2.6, 3.0, T.limeYellow, { tileM: 2 }); walls.position.set(0, 1.8, -0.9); house.add(walls); const roof = K.roofGable(7.6, 5.8, 1.8, T.tiles, 0.6); roof.position.y = 3.1; house.add(roof);
  for (const x of [-3, -1, 1, 3]) { const p = K.box(0.2, 2.6, 0.2, T.wood, { tileM: 1 }); p.position.set(x, 1.8, 2.2); house.add(p); }
  const door = K.box(0.9, 1.8, 0.08, T.wood, { tileM: 1 }); door.position.set(0, 1.4, 0.62); house.add(door); house.position.set(-2, 0, -1); scene.add(house);
  // a sleeping mat on the verandah
  const mat = K.box(2.6, 0.04, 1.3, null, { color: 0xc8a86a }); mat.position.set(-2, 0.53, 0.6); scene.add(mat); const pillow = K.box(0.5, 0.12, 1.1, null, { color: 0xf0e8d8 }); pillow.position.set(-3.1, 0.6, 0.6); scene.add(pillow);
  // the big tank on a steel stand on top, fat and heavy over the sleepers
  const stand = new THREE.Group(); for (const x of [-0.9, 0.9]) for (const z of [-0.9, 0.9]) { const l = K.mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.6, 6), K.col(0x4a4a50)); l.position.set(x, 0.8, z); stand.add(l); }
  const tank = K.mesh(new THREE.CylinderGeometry(1.4, 1.4, 2.2, 20), K.col(0x3a3a46)); tank.position.y = 2.7; stand.add(tank); const lid = K.mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.2, 14), K.col(0x3a3a40)); lid.position.y = 3.9; stand.add(lid);
  const band = K.mesh(new THREE.CylinderGeometry(1.42, 1.42, 0.12, 20), K.col(0x5a5a62)); band.position.y = 2.2; stand.add(band); stand.position.set(-2, 4.1, -1); scene.add(stand);
  // the pipe runs over the boundary wall to the neighbour's side, ending in a big tap wheel
  const wall = K.box(0.4, 1.8, 10, T.laterite, { tileM: 1.2 }); wall.position.set(4.2, 0.9, -1); scene.add(wall);
  const pipeC = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.6, 6.4, -1), new THREE.Vector3(2, 6.4, -1), new THREE.Vector3(4.2, 5.6, -1), new THREE.Vector3(5.6, 3.4, -0.4), new THREE.Vector3(6.2, 1.5, 0.2)]);
  const pipe = K.mesh(new THREE.TubeGeometry(pipeC, 40, 0.12, 8), K.col(0x8a8a92)); scene.add(pipe);
  const wheel = new THREE.Group(); const ring = K.mesh(new THREE.TorusGeometry(0.4, 0.06, 6, 16), K.col(0xc8312c)); wheel.add(ring); for (let k = 0; k < 3; k++) { const s = K.box(0.8, 0.06, 0.06, null, { color: 0xc8312c }); s.rotation.z = k * Math.PI / 3; wheel.add(s); }
  wheel.position.set(6.2, 1.7, 0.6); scene.add(wheel); const spout = K.mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.5, 8), K.col(0x8a8a92)); spout.position.set(6.2, 1.25, 0.4); scene.add(spout);
  const drops = []; for (let k = 0; k < 6; k++) { const d = noInk(new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 4), glow(0x7ad0ff))); scene.add(d); drops.push(d); }
  const setDrip = (t, on = 1) => drops.forEach((d, k) => { const u = ((t * 1.4 + k / 6) % 1); d.visible = on > 0; d.position.set(6.2, 1.0 - u * 1.0, 0.4); });
  const setTap = (u) => { wheel.rotation.z = -u * 4; };
  // the neighbour's yard: a green field and a little house across the wall
  const nh = new THREE.Group(); const nw = K.box(4, 2.2, 3, T.limeBlue, { tileM: 2 }); nw.position.y = 1.1; nh.add(nw); const nr = K.roofGable(4.8, 3.8, 1.4, T.tiles, 0.5); nr.position.y = 2.2; nh.add(nr); nh.position.set(10, 0, -5); scene.add(nh);
  // a crescent moon
  const moon = noInk(new THREE.Mesh(new THREE.CircleGeometry(1.6, 24), glow(0xfff6d8))); moon.position.set(-14, 22, -50); scene.add(moon);
  lights(scene, { key: 0xb8c8ff, ki: 0.9, pos: [-6, 12, 8], hemi: [0x8a9ad8, 0x3a2a3a, 0.75], box: 12 });
  const porch = new THREE.PointLight(0xffc070, 4, 8, 1.6); porch.position.set(-2, 2.6, 1.4); scene.add(porch);
  return { scene, life, setTap, setDrip, tank: stand };
}
