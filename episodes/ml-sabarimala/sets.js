// Sabarimala sets. OG Engilo look (bean cards, ink lines, still camera with a gentle push); real 3D only for the forest hill.
// The deity is NEVER drawn: the sanctum is shown as a golden glow behind the doors.
// hillSet(renderer): the forest hill with the shrine (Sannidhanam) on its flattened top: sanctum with a gold pyramidal
//   roof, the golden flagstaff, the eighteen golden steps (Pathinettampadi) down the front, Poly Haven CC0 trees, boulders
//   and a sculpted Western Ghats terrain. API: setMode('night'|'day'|'dusk'), setFire(u) (flames, smoke, embers, charring),
//   setBuild(u) (the rebuild rises), setDoors(u) (0 open .. 1 closed), setLamps(u) (lamps across the hill),
//   setCrowd(u) (pilgrims on the slopes), setMakara(u) (the far-hill light), SHRINE (top position).
// pathSet(renderer): the old forest trail from Erumeli: dirt path between real CC0 trees, sun shafts. API: setKite(on).
// mosqueSet(): Erumeli: Vavar's mosque (white walls, green arches and domes), a lamp, a temple flag.
// palaceSet(): Pandalam: the palace gatehouse (tiled padippura), lamps, three ornament chests (Thiruvabharanam).
// forgeSet(): Chengannur: the bronze-casters' workshop: furnace, crucible, the glowing pour, sparks.
import * as K from '../../pipeline/toon3d.js';
import { model, hdri, texMaterial } from '../../pipeline/assets.js';
const THREE = K.THREE;
const glow = (c, o = 1) => new THREE.MeshBasicMaterial({ color: c, transparent: o < 1, opacity: o, depthWrite: o >= 1, toneMapped: false });
const addGlow = (c, o = 0.5) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
const noInk = (m) => { m.userData.noInk = true; m.traverse?.((o) => { o.userData.noInk = true; }); return m; };
function plane(w, h, tex, basic = false) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), basic ? new THREE.MeshBasicMaterial({ map: tex, transparent: true }) : new THREE.MeshLambertMaterial({ map: tex, transparent: true })); m.receiveShadow = true; return m; }
function lights(scene, { key = 0xfff0d0, ki = 1.3, pos = [6, 9, 8], hemi = [0xfff4e0, 0x8a6a4a, 1.05], box = 8, target = [0, 0, -2] } = {}) {
  const sun = new THREE.DirectionalLight(key, ki); sun.position.set(...pos); sun.target.position.set(...target); scene.add(sun, sun.target); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005;
  Object.assign(sun.shadow.camera, { left: -box, right: box, top: box, bottom: -box, near: 1, far: 300 }); const h = new THREE.HemisphereLight(...hemi); scene.add(h); return { sun, hemi: h };
}
const R2 = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
function vnoise(x, y) { const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const a = R2(ix, iy), b = R2(ix + 1, iy), c = R2(ix, iy + 1), d = R2(ix + 1, iy + 1); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }
const fbm = (x, y, o = 5) => { let s = 0, a = 0.5, f = 1; for (let i = 0; i < o; i++) { s += a * vnoise(x * f, y * f); f *= 2.03; a *= 0.5; } return s; };
const GOLD = 0xe8b830, GOLD2 = 0xc8942a;
const nightSky = () => K.paint(512, 1024, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#060a1e'); gr.addColorStop(0.55, '#16204a'); gr.addColorStop(1, '#3a2c4a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  const r = K.rnd(5); for (let i = 0; i < 520; i++) { const y = r() * h * 0.6; g.globalAlpha = 0.3 + r() * 0.7; g.fillStyle = r() < 0.15 ? '#ffe8c0' : '#ffffff'; g.beginPath(); g.arc(r() * w, y, r() < 0.06 ? 1.8 : 0.9, 0, 7); g.fill(); }
  g.globalAlpha = 1; g.fillStyle = '#fff6dc'; g.beginPath(); g.arc(w * 0.78, h * 0.14, 16, 0, 7); g.fill(); g.fillStyle = 'rgba(255,246,220,.12)'; g.beginPath(); g.arc(w * 0.78, h * 0.14, 40, 0, 7); g.fill(); });

// ---------------------------------------------------------------- THE FOREST HILL AND THE SHRINE (3D hero)
// Units ~ metres / 2. The shrine sits on a flattened top at (0, TOP, 0); the steps run down toward +z (the camera side).
const TOP = 22;
function hillHeight(x, z) {
  const r = Math.hypot(x, z * 0.9);
  let h = TOP * Math.exp(-Math.pow(r / 46, 2)) + 6 * Math.exp(-Math.pow(r / 120, 2));
  h += (fbm(x * 0.03 + 3, z * 0.03, 5) - 0.5) * 12 * Math.min(1, r / 25) + (fbm(x * 0.15, z * 0.15, 3) - 0.5) * 1.6 * Math.min(1, r / 10);
  const ridge = Math.hypot(x + 150, z + 260); h += 60 * Math.exp(-Math.pow(ridge / 120, 2));            // Ponnambalamedu, the far hill (left, behind)
  h += 34 * Math.exp(-Math.pow(Math.hypot(x - 170, z + 200) / 110, 2)) + 26 * Math.exp(-Math.pow(Math.hypot(x - 30, z + 330) / 130, 2));
  if (r < 11) { const f = Math.max(0, (r - 7) / 4); h = h * f + (1 - f) * TOP; }                          // the flat temple court
  if (z > 3.6 && Math.abs(x) < 9) { const sy = TOP + 0.6 - Math.max(0, (z - 4.4) / 0.62) * 0.42 - 0.35; h = Math.min(h, sy + Math.max(0, Math.abs(x) - 2.6) * 0.55); }   // the cut for the 18 steps
  return h;
}
export async function hillSet(renderer) {
  const scene = new THREE.Scene(), life = [];
  const [day, dusk, night0] = await Promise.all([hdri(renderer, 'kloppenheim_06_puresky'), hdri(renderer, 'belfast_sunset_puresky'), null]);
  const night = { env: null }; const skyN = nightSky(), skyD = K.skyTexture({ seed: 31, clouds: 7, top: '#3a3a6a', mid: '#d8805a', bottom: '#f6c27a' });
  scene.fog = new THREE.Fog(0xa9c2cc, 120, 700);
  // terrain
  const N = 300, S = 760, geo = new THREE.PlaneGeometry(S, S, N, N); geo.rotateX(-Math.PI / 2); geo.translate(0, 0, -120); const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setY(i, hillHeight(pos.getX(i), pos.getZ(i)));
  geo.computeVertexNormals(); const cols = new Float32Array(pos.count * 3), nrm = geo.attributes.normal;
  for (let i = 0; i < pos.count; i++) { const steep = 1 - nrm.getY(i), g = Math.max(0, Math.min(1, (0.75 - steep) / 0.2)), x = pos.getX(i), z = pos.getZ(i);
    const c = new THREE.Color().setRGB(0.36, 0.34, 0.27).lerp(new THREE.Color(0.15 + fbm(x * 0.05, z * 0.05, 2) * 0.14, 0.38, 0.12), g); if (Math.hypot(x, z) < 11) c.setRGB(0.62, 0.42, 0.3);
    cols[i * 3] = c.r; cols[i * 3 + 1] = c.g; cols[i * 3 + 2] = c.b; }
  geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  const ground = texMaterial('forest_ground_04', { repeat: [80, 80], vertexColors: true, roughness: 1 }); ground.color = new THREE.Color(1.5, 1.5, 1.5);
  scene.add(K.mesh(geo, ground));
  // --- the shrine
  const T = K.stdTextures(); const shrine = new THREE.Group(); shrine.position.set(0, TOP, 0); scene.add(shrine);
  const build = new THREE.Group(); shrine.add(build);
  const stoneM = texMaterial('old_stone_wall', { repeat: [3, 1], roughness: 0.95 }); stoneM.color = new THREE.Color(0.95, 0.9, 0.82);
  const plinth = K.mesh(new THREE.BoxGeometry(14, 1.2, 12), stoneM); plinth.position.set(0, 0.6, -2); build.add(plinth);
  const wallM = K.mat(T.lime, 0xf6eedc); const sanctum = K.mesh(new THREE.BoxGeometry(5.4, 4.2, 5.4), wallM); sanctum.position.set(0, 1.2 + 2.1, -3); build.add(sanctum);
  // the gold-plated pyramidal roof (Kerala style, two tiers) + a golden finial
  const goldM = new THREE.MeshStandardMaterial({ color: GOLD, metalness: 0.85, roughness: 0.28, envMapIntensity: 1.3 });
  const r1 = K.mesh(new THREE.ConeGeometry(5.6, 2.4, 4, 1), goldM); r1.rotation.y = Math.PI / 4; r1.position.set(0, 1.2 + 4.2 + 1.0, -3); build.add(r1);
  const r1b = K.mesh(new THREE.BoxGeometry(3.4, 0.9, 3.4), wallM); r1b.position.set(0, 1.2 + 4.2 + 2.0, -3); build.add(r1b);
  const r2 = K.mesh(new THREE.ConeGeometry(3.4, 1.8, 4, 1), goldM); r2.rotation.y = Math.PI / 4; r2.position.set(0, 1.2 + 4.2 + 3.2, -3); build.add(r2);
  const fin = K.mesh(new THREE.SphereGeometry(0.35, 12, 8), goldM); fin.position.set(0, 1.2 + 4.2 + 4.3, -3); build.add(fin); const fin2 = K.mesh(new THREE.ConeGeometry(0.2, 0.8, 8), goldM); fin2.position.set(0, 1.2 + 4.2 + 4.8, -3); build.add(fin2);
  // the veranda with pillars around the sanctum
  for (const x of [-3.8, -1.3, 1.3, 3.8]) { const p = K.mesh(new THREE.CylinderGeometry(0.16, 0.18, 3.0, 10), K.col(0xd8c8a8)); p.position.set(x, 1.2 + 1.5, 1.0); build.add(p); }
  const ver = K.mesh(new THREE.BoxGeometry(9, 0.25, 3.0), K.mat(T.tiles, 0xffffff)); ver.position.set(0, 1.2 + 3.1, 0.2); ver.rotation.x = -0.18; build.add(ver);
  // doors + the sanctum glow (no deity drawn)
  const doorM = new THREE.MeshStandardMaterial({ color: GOLD2, metalness: 0.7, roughness: 0.35 });
  const doorL = new THREE.Group(), doorR = new THREE.Group(); doorL.position.set(-0.9, 1.2, -0.29); doorR.position.set(0.9, 1.2, -0.29);
  const dl = K.mesh(new THREE.BoxGeometry(0.9, 2.6, 0.1), doorM); dl.position.set(0.45, 1.3, 0); doorL.add(dl); const dr = K.mesh(new THREE.BoxGeometry(0.9, 2.6, 0.1), doorM); dr.position.set(-0.45, 1.3, 0); doorR.add(dr); build.add(doorL, doorR);
  for (const d of [dl, dr]) for (let k = 0; k < 3; k++) for (let j = 0; j < 2; j++) { const s = K.mesh(new THREE.SphereGeometry(0.06, 6, 4), goldM); s.position.set(-0.2 + j * 0.4, -0.8 + k * 0.8, 0.07); d.add(s); }
  const inner = noInk(new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.6), glow(0xffc860))); inner.position.set(0, 1.2 + 1.3, -0.32); build.add(inner);
  const innerL = new THREE.PointLight(0xffc060, 8, 9, 1.6); innerL.position.set(0, 2.6, 0.6); build.add(innerL);
  const setDoors = (u) => { doorL.rotation.y = -(1 - u) * 1.45; doorR.rotation.y = (1 - u) * 1.45; inner.material.color.setHSL(0.11, 1, 0.68 * (1 - u * 0.85)); innerL.intensity = 8 * (1 - u * 0.9); };
  // flagstaff (kodimaram) in gold, in front of the steps' top
  const flag = K.mesh(new THREE.CylinderGeometry(0.16, 0.24, 12, 10), goldM); flag.position.set(-4.6, 1.2 + 6, 3.2); build.add(flag); for (let k = 0; k < 8; k++) { const ring = K.mesh(new THREE.TorusGeometry(0.26, 0.06, 6, 12), goldM); ring.rotation.x = Math.PI / 2; ring.position.set(-4.6, 2 + k * 1.3, 3.2); build.add(ring); }
  // the eighteen golden steps, down the front slope toward +z
  const steps = new THREE.Group(); shrine.add(steps); const stepM = new THREE.MeshStandardMaterial({ color: 0xe0b040, metalness: 0.75, roughness: 0.32, envMapIntensity: 1.2 });
  for (let k = 0; k < 18; k++) { const s = K.mesh(new THREE.BoxGeometry(4.2, 0.42, 0.62), stepM); s.position.set(0, 0.6 - k * 0.42 - 0.21, 4.4 + k * 0.62); steps.add(s);
    const side = K.mesh(new THREE.BoxGeometry(0.4, 0.84, 0.62), stoneM); side.position.set(-2.3, 0.6 - k * 0.42, 4.4 + k * 0.62); steps.add(side); const side2 = side.clone(); side2.position.x = 2.3; steps.add(side2); }
  
  // lamps along the steps
  const stepLamps = []; for (let k = 0; k < 18; k += 3) for (const sx of [-2.3, 2.3]) { const f = noInk(new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), glow(0xffd070))); f.position.set(sx, 0.6 - k * 0.42 + 0.55, 4.4 + k * 0.62); steps.add(f); stepLamps.push(f); }
  // charring for the fire
  const charM = K.col(0x2a2220); const burnable = [sanctum, ver, r1b]; const orig = burnable.map((m) => m.material);
  // --- fire: flame cones (additive), point lights, smoke puffs, embers
  const fire = new THREE.Group(); fire.position.set(0, 1.2, -2); shrine.add(fire); const flames = [];
  const flameTex = K.paint(128, 256, (g, w, h) => { const gr = g.createRadialGradient(64, 190, 6, 64, 170, 120); gr.addColorStop(0, 'rgba(255,250,210,1)'); gr.addColorStop(0.25, 'rgba(255,200,80,.95)'); gr.addColorStop(0.6, 'rgba(255,110,30,.6)'); gr.addColorStop(1, 'rgba(200,40,10,0)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(64, 4); g.bezierCurveTo(120, 110, 124, 200, 64, 252); g.bezierCurveTo(4, 200, 8, 110, 64, 4); g.fill(); });
  for (let k = 0; k < 40; k++) { const big = k < 16, m = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: big ? 0.8 : 0.9, toneMapped: false }));
    m.position.set((R2(k, 1) - 0.5) * 7.5, (big ? 4.2 : 2.2) + R2(k, 2) * 3.5, (R2(k, 3) - 0.5) * 6.5); m.userData.base = m.position.clone(); m.userData.ph = R2(k, 4) * 6; m.userData.sz = big ? [3.2, 6.5] : [1.6, 3.2]; fire.add(m); flames.push(m); }
  const fireL = new THREE.PointLight(0xff7a30, 0, 60, 1.3); fireL.position.set(0, 6, 2); fire.add(fireL); const fireL2 = new THREE.PointLight(0xffa040, 0, 30, 1.5); fireL2.position.set(0, 3, 6); fire.add(fireL2);
  const smokeTex = K.paint(128, 128, (g, w, h) => { const gr = g.createRadialGradient(64, 64, 4, 64, 64, 62); gr.addColorStop(0, 'rgba(60,52,50,.85)'); gr.addColorStop(0.6, 'rgba(50,44,44,.4)'); gr.addColorStop(1, 'rgba(40,36,36,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const smokes = []; for (let k = 0; k < 26; k++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, transparent: true, depthWrite: false, opacity: 0 })); sp.userData.ph = k / 26; sp.userData.x = (R2(k, 7) - 0.5) * 6; fire.add(sp); smokes.push(sp); }
  const EM = 260, emG = new THREE.BufferGeometry(), emP = new Float32Array(EM * 3); emG.setAttribute('position', new THREE.BufferAttribute(emP, 3));
  const embers = new THREE.Points(emG, new THREE.PointsMaterial({ color: 0xffa040, size: 0.18, transparent: true, opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); embers.userData.noInk = true; fire.add(embers);
  let fireU = 0;
  life.push((t) => { if (fireU <= 0) return; flames.forEach((m, k) => { const b = m.userData.base, ph = m.userData.ph; const sz = m.userData.sz; m.scale.set(sz[0] * fireU * (1 + Math.sin(t * 9 + ph) * 0.15), sz[1] * fireU * (1 + Math.sin(t * 7.3 + ph * 2) * 0.3), 1); m.position.set(b.x + Math.sin(t * 3 + ph) * 0.25, b.y * (0.6 + 0.4 * fireU) + Math.sin(t * 5 + ph) * 0.3, b.z); });
    fireL.intensity = fireU * (380 + Math.sin(t * 17) * 70 + Math.sin(t * 11) * 50); fireL2.intensity = fireU * (110 + Math.sin(t * 13) * 25);
    smokes.forEach((sp, k) => { const u = (t * 0.18 + sp.userData.ph) % 1; sp.position.set(sp.userData.x + u * 6, 6 + u * 26, -1 - u * 4); const s = 4 + u * 16; sp.scale.set(s, s, 1); sp.material.opacity = Math.min(1, fireU * 1.2) * Math.sin(u * Math.PI) * 0.75; });
    for (let i = 0; i < EM; i++) { const u = (t * (0.25 + R2(i, 9) * 0.35) + R2(i, 8)) % 1; emP[i * 3] = (R2(i, 5) - 0.5) * 8 + Math.sin(t * 2 + i) * u * 2 + u * 5; emP[i * 3 + 1] = 2 + u * 24 * fireU; emP[i * 3 + 2] = (R2(i, 6) - 0.5) * 6; } emG.attributes.position.needsUpdate = true; });
  const setFire = (u, char = u) => { fireU = u; fire.visible = u > 0.001; burnable.forEach((m, k) => { m.material = char > 0.3 ? charM : orig[k]; }); goldM.color.setHex(char > 0.3 ? 0x5a4a30 : GOLD); goldM.metalness = char > 0.3 ? 0.2 : 0.85; };
  const setBuild = (u) => { build.scale.y = Math.max(0.001, u); build.visible = u > 0.002; };
  // --- forest: real CC0 trees near the shrine, toon instanced trees over the slopes
  const [tree1, tree2, shrub, boulder] = await Promise.all([model('ph:island_tree_01', { height: 11 }), model('ph:island_tree_02', { height: 9 }), model('ph:shrub_01', { height: 1.6 }), model('ph:boulder_01', { height: 2.2 })]);
  for (let k = 0; k < 22; k++) { const a = (k / 22) * Math.PI * 2 + 0.3, rr = 14 + R2(k, 31) * 9, x = Math.cos(a) * rr, z = Math.sin(a) * rr; if (z > -2) continue; const t2 = (k % 2 ? tree1 : tree2).clone(true); t2.position.set(x, hillHeight(x, z) - 0.3, z); t2.rotation.y = k * 1.7; scene.add(t2); }
  for (let k = 0; k < 30; k++) { const x = (R2(k, 41) - 0.5) * 40, z = 8 + R2(k, 42) * 30; if (Math.abs(x) < 4) continue; const c = (k % 3 ? shrub : boulder).clone(true); c.position.set(x, hillHeight(x, z) - 0.1, z); c.rotation.y = k; scene.add(c); }
  const foliage = [0x3a6428, 0x46742e, 0x2c5424, 0x527e36]; const cone = new THREE.ConeGeometry(1.2, 4, 7), ball = new THREE.DodecahedronGeometry(1.4, 1), trunk = new THREE.CylinderGeometry(0.18, 0.26, 2, 5);
  const inst = foliage.map((c, i) => new THREE.InstancedMesh(i % 2 ? cone : ball, K.col(c), 6000)); const tr = new THREE.InstancedMesh(trunk, K.col(0x5a4030), 24000); inst.forEach((m) => { m.count = 0; m.castShadow = true; scene.add(m); }); tr.count = 0; scene.add(tr);
  const dm = new THREE.Object3D(); for (let k = 0; k < 24000; k++) { const x = (R2(k, 11) - 0.5) * 620, z = (R2(k, 12) - 0.5) * 560 - 110; const r = Math.hypot(x, z); if (r < 13) continue; if (Math.abs(x) < 5 && z > 0 && z < 40) continue;
    const y = hillHeight(x, z), far = r > 140 ? 1.9 : 1, s = (0.6 + R2(k, 13) * 0.7) * far, m = inst[k % 4]; if (m.count >= 6000) continue; dm.position.set(x, y + (k % 4 % 2 ? 2.6 : 2.1) * s, z); dm.rotation.set(0, R2(k, 14) * 6, 0); dm.scale.setScalar(s); dm.updateMatrix(); m.setMatrixAt(m.count++, dm.matrix);
    dm.position.set(x, y + 0.9 * s, z); dm.updateMatrix(); tr.setMatrixAt(tr.count++, dm.matrix); }
  // --- lamps across the hill (night finale) and the pilgrim crowd (tiny black figures)
  const LN = 2600, lampI = noInk(new THREE.InstancedMesh(new THREE.SphereGeometry(0.16, 6, 4), glow(0xffc860), LN)); lampI.count = 0; scene.add(lampI);
  const lampPos = []; for (let k = 0; lampPos.length < LN && k < 40000; k++) { const a = R2(k, 51) * Math.PI * 2, rr = 8 + Math.pow(R2(k, 52), 0.7) * 70, x = Math.cos(a) * rr, z = Math.sin(a) * rr * 1.1 + 4; if (z < -30) continue; lampPos.push([x, hillHeight(x, z) + 0.5, z]); }
  const setLamps = (u) => { const n = Math.floor(LN * u); lampI.count = n; for (let i = 0; i < n; i++) { dm.position.set(...lampPos[i]); dm.rotation.set(0, 0, 0); dm.scale.setScalar(1); dm.updateMatrix(); lampI.setMatrixAt(i, dm.matrix); } lampI.instanceMatrix.needsUpdate = true; stepLamps.forEach((f) => { f.visible = u > 0 || mode === 'night'; }); };
  const CN = 1400, bodyI = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.22, 0.6, 3, 6), K.col(0x1a1a1e), CN), headI = new THREE.InstancedMesh(new THREE.SphereGeometry(0.17, 8, 6), K.col(0x8a5a3a), CN), bundleI = new THREE.InstancedMesh(new THREE.SphereGeometry(0.16, 6, 4), K.col(0xd8c08a), CN);
  [bodyI, headI, bundleI].forEach((m) => { m.count = 0; scene.add(m); });
  const crowd = []; for (let k = 0; crowd.length < CN && k < 30000; k++) { const x = (R2(k, 61) - 0.5) * 34, z = 6 + R2(k, 62) * 60; if (Math.abs(x) < 3 && z < 17) continue; const y = hillHeight(x, z); if (Math.abs(y - hillHeight(x + 1, z)) > 1.4) continue; crowd.push([x, y, z]); }
  const setCrowd = (u, t = 0) => { const n = Math.floor(CN * u); [bodyI, headI, bundleI].forEach((m) => { m.count = n; });
    for (let i = 0; i < n; i++) { const [x, y, z] = crowd[i], b = Math.abs(Math.sin(t * 3 + i)) * 0.05; dm.rotation.set(0, 0, 0); dm.scale.setScalar(1); dm.position.set(x, y + 0.52 + b, z); dm.updateMatrix(); bodyI.setMatrixAt(i, dm.matrix);
      dm.position.set(x, y + 1.18 + b, z); dm.updateMatrix(); headI.setMatrixAt(i, dm.matrix); dm.position.set(x, y + 1.42 + b, z); dm.scale.set(1.2, 0.7, 1.2); dm.updateMatrix(); bundleI.setMatrixAt(i, dm.matrix); }
    [bodyI, headI, bundleI].forEach((m) => { m.instanceMatrix.needsUpdate = true; }); };
  // --- the far-hill light (Makaravilakku at Ponnambalamedu): a warm glow + halo on the far ridge
  const mk = new THREE.Group(); const mkPos = new THREE.Vector3(-150, hillHeight(-150, -260) + 3, -260); mk.position.copy(mkPos); scene.add(mk);
  const mkCore = noInk(new THREE.Mesh(new THREE.SphereGeometry(1.6, 12, 8), glow(0xffe0a0))); mk.add(mkCore); const mkHalo = noInk(new THREE.Mesh(new THREE.SphereGeometry(7, 16, 10), addGlow(0xffb050, 0.35))); mk.add(mkHalo);
  const setMakara = (u) => { mk.visible = u > 0; mk.scale.setScalar(Math.max(0.001, u)); };
  // --- light rigs per mode
  const { sun, hemi } = lights(scene, { key: 0xfff1d8, ki: 2.0, pos: [-60, 90, 70], hemi: [0xdfeeff, 0x4a5a3a, 0.4], box: 40, target: [0, TOP, 0] });
  const moon = new THREE.DirectionalLight(0x8aa0e0, 0); moon.position.set(60, 80, -40); scene.add(moon);
  let mode = 'day';
  const setMode = (m) => { mode = m; const env = m === 'night' ? night : m === 'dusk' ? dusk : day;
    scene.background = m === 'night' ? skyN : m === 'dusk' ? skyD : day.background; scene.environment = env.env || null; scene.backgroundRotation = new THREE.Euler(0, m === 'dusk' ? 2.4 : 1.1, 0); scene.environmentRotation = scene.backgroundRotation;
    scene.backgroundIntensity = m === 'day' ? 0.66 : 1; scene.environmentIntensity = m === 'night' ? 0.12 : m === 'dusk' ? 0.35 : 0.5;
    sun.intensity = m === 'night' ? 0.0 : m === 'dusk' ? 1.4 : 2.0; sun.color.set(m === 'dusk' ? 0xffa060 : 0xfff1d8); sun.position.set(m === 'dusk' ? 90 : -60, m === 'dusk' ? 30 : 90, m === 'dusk' ? -40 : 70);
    hemi.intensity = m === 'night' ? 0.16 : m === 'dusk' ? 0.28 : 0.4; hemi.color.set(m === 'night' ? 0x4a5a9a : 0xdfeeff); moon.intensity = m === 'night' ? 0.55 : 0;
    scene.fog.color.set(m === 'night' ? 0x1a2040 : m === 'dusk' ? 0xb88a72 : 0xa9c2cc); scene.fog.near = m === 'night' ? 60 : 120; stepLamps.forEach((f) => { f.visible = m !== 'day'; }); };
  setMode('day'); setFire(0); setBuild(1); setDoors(0); setLamps(0); setCrowd(0); setMakara(0);
  return { scene, life, setMode, setFire, setBuild, setDoors, setLamps, setCrowd, setMakara, hillHeight, TOP, mkPos };
}

// ---------------------------------------------------------------- THE OLD FOREST TRAIL (Erumeli -> Pampa)
export async function pathSet(renderer) {
  const scene = new THREE.Scene(), life = []; const day = await hdri(renderer, 'kloppenheim_06_puresky');
  scene.background = K.skyTexture({ seed: 12, clouds: 5, top: '#5a8ac8', mid: '#a8c8d8', bottom: '#dfe8d8' }); scene.environment = day.env; scene.environmentIntensity = 0.45; scene.fog = new THREE.Fog(0x9ab89a, 18, 90);
  const pathX = (z) => Math.sin(z * 0.08) * 2.2;
  const gh = (x, z) => { const d = Math.abs(x - pathX(z)); return d < 1.4 ? 0 : (d - 1.4) * 0.08 + (fbm(x * 0.2, z * 0.2, 3) - 0.5) * 0.8 * Math.min(1, (d - 1.4) / 2); };
  const geo = new THREE.PlaneGeometry(80, 160, 200, 400); geo.rotateX(-Math.PI / 2); geo.translate(0, 0, -60); const p = geo.attributes.position; const cl = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, gh(x, z)); const d = Math.abs(x - pathX(z)), c = d < 1.3 ? new THREE.Color(0.85, 0.6, 0.42) : new THREE.Color(0.5 + fbm(x * 0.3, z * 0.3, 2) * 0.3, 0.75, 0.4); cl.set([c.r, c.g, c.b], i * 3); }
  geo.computeVertexNormals(); geo.setAttribute('color', new THREE.BufferAttribute(cl, 3));
  const gm = texMaterial('forest_ground_04', { repeat: [30, 60], vertexColors: true, roughness: 1 }); gm.color = new THREE.Color(1.4, 1.4, 1.4); scene.add(K.mesh(geo, gm));
  const [tree1, tree2, shrub, boulder] = await Promise.all([model('ph:island_tree_01', { height: 12 }), model('ph:island_tree_02', { height: 10 }), model('ph:shrub_01', { height: 1.4 }), model('ph:boulder_01', { height: 1.6 })]);
  for (let k = 0; k < 40; k++) { const z = 10 - k * 3.2, s = k % 2 ? 1 : -1, x = pathX(z) + s * (3.2 + R2(k, 3) * 6); const t = (k % 3 ? tree1 : tree2).clone(true); t.position.set(x, gh(x, z) - 0.2, z); t.rotation.y = k * 2.1; t.scale.multiplyScalar(0.8 + R2(k, 4) * 0.5); scene.add(t); }
  for (let k = 0; k < 60; k++) { const z = 12 - k * 2, s = k % 2 ? 1 : -1, x = pathX(z) + s * (1.7 + R2(k, 5) * 3); const c = (k % 4 ? shrub : boulder).clone(true); c.position.set(x, gh(x, z) - 0.05, z); c.rotation.y = k; scene.add(c); }
  // sun shafts through the canopy
  const shafts = []; for (let k = 0; k < 6; k++) { const s = noInk(K.mesh(new THREE.PlaneGeometry(1.4 + R2(k, 9), 18), addGlow(0xfff0c0, 0.08), { shadow: false })); s.position.set(-4 + k * 1.8, 6, -4 - k * 3); s.rotation.set(0, 0.3, 0.45); scene.add(s); shafts.push(s); }
  life.push((t) => shafts.forEach((s, k) => { s.material.opacity = 0.06 + Math.sin(t * 0.8 + k) * 0.025; }));
  // the Garuda kite that circles over the Thiruvabharanam procession
  const kiteTex = K.paint(256, 128, (g) => { g.fillStyle = '#6a3a1e'; g.strokeStyle = '#2a1c17'; g.lineWidth = 6; g.beginPath(); g.moveTo(128, 50); g.quadraticCurveTo(70, 20, 6, 46); g.quadraticCurveTo(60, 56, 112, 70); g.lineTo(128, 96); g.lineTo(144, 70); g.quadraticCurveTo(196, 56, 250, 46); g.quadraticCurveTo(186, 20, 128, 50); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#f6f1e4'; g.beginPath(); g.arc(128, 48, 10, 0, 7); g.fill(); g.stroke(); });
  const kite = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.2), new THREE.MeshBasicMaterial({ map: kiteTex, transparent: true, side: THREE.DoubleSide, depthWrite: false })); kite.userData.noInk = true; scene.add(kite); kite.visible = false;
  life.push((t) => { if (!kite.visible) return; kite.position.set(Math.cos(t * 0.7) * 5, 11 + Math.sin(t * 1.3) * 0.5, -10 + Math.sin(t * 0.7) * 4); kite.lookAt(kite.position.x, kite.position.y - 10, kite.position.z + 4); kite.rotation.z += Math.sin(t * 2) * 0.2; });
  lights(scene, { key: 0xfff0d0, ki: 1.8, pos: [-14, 26, 10], hemi: [0xe8f4ff, 0x3a5a2a, 0.75], box: 18, target: [0, 0, -6] });
  return { scene, life, pathX, gh, setKite: (on) => { kite.visible = on; } };
}

// ---------------------------------------------------------------- ERUMELI: VAVAR'S MOSQUE
export function mosqueSet() {
  const T = K.stdTextures(), scene = new THREE.Scene(), life = []; scene.background = K.skyTexture({ seed: 44, clouds: 6, top: '#4a8ad0', mid: '#a0c8e8', bottom: '#f0ecd8' }); scene.fog = new THREE.Fog(0xe6e0cc, 30, 120);
  const dirt = T.dirt.clone(); dirt.repeat.set(10, 10); dirt.needsUpdate = true; const gnd = K.mesh(new THREE.PlaneGeometry(120, 120), new THREE.MeshLambertMaterial({ map: dirt })); gnd.rotation.x = -Math.PI / 2; scene.add(gnd);
  const white = K.mat(T.lime, 0xffffff), green = K.col(0x2f8a4a), greenD = K.col(0x1f6a36);
  const m = new THREE.Group(); m.position.set(0, 0, -4); scene.add(m);
  const base = K.box(10, 0.5, 6, null, { color: 0xd8d0c0 }); base.position.y = 0.25; m.add(base);
  const hall = K.mesh(new THREE.BoxGeometry(9, 4, 5), white); hall.position.y = 2.5; m.add(hall);
  // arched front: green arches painted on a canvas facing the camera
  const arches = plane(9, 3.4, K.paint(900, 340, (g, w, h) => { g.fillStyle = '#fbf8ef'; g.fillRect(0, 0, w, h); for (let k = 0; k < 5; k++) { const x = 90 + k * 180; g.fillStyle = '#2f8a4a'; g.beginPath(); g.moveTo(x - 62, h); g.lineTo(x - 62, 150); g.quadraticCurveTo(x - 62, 40, x, 30); g.quadraticCurveTo(x + 62, 40, x + 62, 150); g.lineTo(x + 62, h); g.closePath(); g.fill();
    g.fillStyle = '#1a3a26'; g.beginPath(); g.moveTo(x - 44, h); g.lineTo(x - 44, 160); g.quadraticCurveTo(x - 44, 70, x, 62); g.quadraticCurveTo(x + 44, 70, x + 44, 160); g.lineTo(x + 44, h); g.closePath(); g.fill(); } g.fillStyle = '#2f8a4a'; g.fillRect(0, 0, w, 16); }));
  arches.position.set(0, 2.2, -1.49 + 4); m.add(arches); arches.position.z = 2.51;
  const parapet = K.mesh(new THREE.BoxGeometry(9.4, 0.5, 5.4), green); parapet.position.y = 4.7; m.add(parapet);
  for (const [x, r] of [[0, 1.6], [-3, 0.9], [3, 0.9]]) { const dome = K.mesh(new THREE.SphereGeometry(r, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), green); dome.position.set(x, 4.95, 0); m.add(dome); const sp = K.mesh(new THREE.ConeGeometry(0.08, 0.7, 6), K.col(GOLD)); sp.position.set(x, 4.95 + r + 0.3, 0); m.add(sp); }
  for (const x of [-4.8, 4.8]) { const mn = K.mesh(new THREE.CylinderGeometry(0.35, 0.42, 7, 12), white); mn.position.set(x, 3.5, 2.2); m.add(mn); const band = K.mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.3, 12), green); band.position.set(x, 5.4, 2.2); m.add(band); const cap = K.mesh(new THREE.SphereGeometry(0.5, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), greenD); cap.position.set(x, 7, 2.2); m.add(cap); }
  // brass lamp and a flag pole in front (pilgrims' offerings), palms behind
  const lamp = new THREE.Group(); const lb = K.mesh(new THREE.CylinderGeometry(0.35, 0.45, 0.14, 14), K.col(GOLD2)); lamp.add(lb); const ls = K.mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.4, 8), K.col(GOLD2)); ls.position.y = 0.7; lamp.add(ls);
  const flames = []; for (let k = 0; k < 5; k++) { const f = noInk(new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.22, 6), glow(0xffc040))); f.position.set(Math.cos(k * 1.26) * 0.28, 1.5, Math.sin(k * 1.26) * 0.28); lamp.add(f); flames.push(f); }
  const lt = K.mesh(new THREE.CylinderGeometry(0.36, 0.16, 0.12, 14), K.col(GOLD2)); lt.position.y = 1.4; lamp.add(lt); lamp.position.set(2.6, 0, 1.6); scene.add(lamp); life.push((t) => flames.forEach((f, k) => { f.scale.y = 1 + Math.sin(t * 13 + k) * 0.2; }));
  for (let k = 0; k < 7; k++) { const p = K.palm(9 + R2(k, 1) * 4, 0.12 + R2(k, 2) * 0.1, k + 3); p.position.set(-14 + k * 4.6, 0, -12 - R2(k, 3) * 6); scene.add(p); }
  lights(scene, { key: 0xfff0d0, ki: 1.3, pos: [-8, 14, 10], hemi: [0xfff4e0, 0x8a6a4a, 1.0], box: 12, target: [0, 0, -3] });
  return { scene, life };
}

// ---------------------------------------------------------------- PANDALAM: THE PALACE GATEHOUSE AND THE ORNAMENT CHESTS
export function palaceSet() {
  const T = K.stdTextures(), scene = new THREE.Scene(), life = []; scene.background = K.skyTexture({ seed: 61, clouds: 5, top: '#3a3a7a', mid: '#e08a6a', bottom: '#f6d09a' }); scene.fog = new THREE.Fog(0xe8b088, 26, 110);
  const lt = T.laterite.clone(); lt.repeat.set(30, 30); lt.needsUpdate = true; const gnd = K.mesh(new THREE.PlaneGeometry(140, 140), new THREE.MeshLambertMaterial({ map: lt })); gnd.rotation.x = -Math.PI / 2; scene.add(gnd);
  const sand = T.dirt.clone(); sand.repeat.set(2, 8); sand.needsUpdate = true; const yard = K.mesh(new THREE.PlaneGeometry(6, 30), new THREE.MeshLambertMaterial({ map: sand })); yard.rotation.x = -Math.PI / 2; yard.position.set(0, 0.01, 6); scene.add(yard);
  // the padippura (gatehouse): laterite walls, a teak gate, a two-slope tiled roof; long compound walls each side
  const g = new THREE.Group(); g.position.set(0, 0, -5); scene.add(g);
  for (const s of [-1, 1]) { const pier = K.box(2.2, 3.4, 3, T.laterite, { tileM: 1.2 }); pier.position.set(s * 2.6, 1.7, 0); g.add(pier); const wall = K.box(16, 2.4, 0.7, T.laterite, { tileM: 1.4 }); wall.position.set(s * 11.5, 1.2, 0); g.add(wall);
    const cope = K.box(16, 0.25, 0.9, null, { color: 0x5a3a2a }); cope.position.set(s * 11.5, 2.5, 0); g.add(cope); }
  const lintel = K.box(7.4, 0.6, 3.2, T.wood, { tileM: 1 }); lintel.position.set(0, 3.7, 0); g.add(lintel);
  const roof = K.roofGable(7.6, 4.6, 2.2, T.tiles, 0.7); roof.position.set(0, 4.0, 0); roof.rotation.y = Math.PI / 2; g.add(roof);
  const gateL = K.box(1.5, 3.2, 0.14, T.wood, { tileM: 1 }); gateL.position.set(-1.3, 1.6, 0.4); gateL.rotation.y = 1.1; g.add(gateL); const gateR = gateL.clone(); gateR.position.x = 1.3; gateR.rotation.y = -1.1; g.add(gateR);
  const inner = noInk(new THREE.Mesh(new THREE.PlaneGeometry(2.8, 3.1), glow(0xffd890, 1))); inner.position.set(0, 1.6, -0.6); g.add(inner);
  // the palace beyond: a long tiled two-storey block
  const pal = K.box(18, 6, 6, T.lime, { tileM: 3 }); pal.position.set(0, 3, -16); scene.add(pal); const prf = K.roofGable(18, 6, 3, T.tiles, 0.8); prf.position.set(0, 6, -16); scene.add(prf);
  for (let k = 0; k < 7; k++) { const w = noInk(new THREE.Mesh(new THREE.PlaneGeometry(1, 1.4), glow(0xffd070))); w.position.set(-7.5 + k * 2.5, 4, -12.98); scene.add(w); }
  // two tall brass lamps either side of the gate
  const flames = []; for (const s of [-1, 1]) { const lamp = new THREE.Group(); const b = K.mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.2, 14), K.col(GOLD2)); lamp.add(b); const st = K.mesh(new THREE.CylinderGeometry(0.08, 0.12, 2.6, 8), K.col(GOLD2)); st.position.y = 1.3; lamp.add(st);
    for (const [y, r] of [[1.4, 0.5], [2.1, 0.38], [2.7, 0.28]]) { const tray = K.mesh(new THREE.CylinderGeometry(r, r * 0.5, 0.1, 14), K.col(GOLD2)); tray.position.y = y; lamp.add(tray); for (let k = 0; k < 6; k++) { const f = noInk(new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.2, 6), glow(0xffc040))); f.position.set(Math.cos(k * 1.05) * r * 0.9, y + 0.15, Math.sin(k * 1.05) * r * 0.9); lamp.add(f); flames.push(f); } }
    const L = new THREE.PointLight(0xffb060, 6, 8, 1.8); L.position.y = 2.6; lamp.add(L); lamp.position.set(s * 4.4, 0, -2.6); scene.add(lamp); }
  life.push((t) => flames.forEach((f, k) => { f.scale.y = 1 + Math.sin(t * 13 + k) * 0.2; }));
  // the three ornament chests on a low wooden platform under a red canopy (carried later on heads)
  const chests = []; const plat = K.box(5, 0.5, 1.6, T.wood, { tileM: 1 }); plat.position.set(0, 0.25, 0.6); scene.add(plat);
  for (let k = 0; k < 3; k++) { const c = chestMesh(); c.position.set(-1.6 + k * 1.6, 0.5, 0.6); scene.add(c); chests.push(c); }
  const canopy = K.box(5.6, 0.12, 2.2, null, { color: 0xb8282a }); canopy.position.set(0, 2.9, 0.6); scene.add(canopy); for (const x of [-2.6, 2.6]) for (const z of [-0.3, 1.5]) { const p = K.mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.9, 6), K.col(GOLD2)); p.position.set(x, 1.45, z); scene.add(p); }
  lights(scene, { key: 0xffc890, ki: 1.2, pos: [10, 10, 10], hemi: [0xffe8d0, 0x7a5a4a, 1.0], box: 12, target: [0, 0, -2] });
  return { scene, life, chests };
}
export function chestMesh() { const T = K.stdTextures(); const c = new THREE.Group(); const b = K.box(1.1, 0.7, 0.75, T.wood, { tileM: 0.6 }); b.position.y = 0.35; c.add(b);
  const lid = K.mesh(new THREE.CylinderGeometry(0.38, 0.38, 1.1, 12, 1, false, 0, Math.PI), K.mat(T.wood, 0xffffff)); lid.rotation.z = Math.PI / 2; lid.rotation.x = Math.PI / 2; lid.position.y = 0.7; lid.rotation.set(0, 0, Math.PI / 2); lid.rotation.y = Math.PI / 2; c.add(lid);
  const bandM = K.col(GOLD); for (const x of [-0.4, 0, 0.4]) { const bd = K.box(0.07, 0.72, 0.78, null, { color: GOLD }); bd.position.set(x, 0.36, 0); c.add(bd); } const lock = K.mesh(new THREE.BoxGeometry(0.16, 0.16, 0.06), bandM); lock.position.set(0, 0.5, 0.4); c.add(lock); return c; }

// ---------------------------------------------------------------- CHENGANNUR: THE BRONZE-CASTERS' WORKSHOP
export function forgeSet() {
  const T = K.stdTextures(), scene = new THREE.Scene(), life = []; scene.background = new THREE.Color(0x1a100c);
  const floor = K.mesh(new THREE.PlaneGeometry(14, 12), K.col(0x4a3426)); floor.rotation.x = -Math.PI / 2; scene.add(floor);
  const wt = T.wood.clone(); wt.repeat.set(5, 1.2); wt.needsUpdate = true; const wm = new THREE.MeshLambertMaterial({ map: wt, side: THREE.DoubleSide });
  const back = K.mesh(new THREE.PlaneGeometry(14, 6), wm); back.position.set(0, 3, -4); scene.add(back); for (const s of [-1, 1]) { const w = K.mesh(new THREE.PlaneGeometry(12, 6), wm); w.rotation.y = -s * Math.PI / 2; w.position.set(s * 7, 3, 2); scene.add(w); }
  // tools on the wall, finished brass lamps on a shelf (story detail)
  const shelf = K.box(5, 0.12, 0.5, T.wood, { tileM: 1 }); shelf.position.set(-3.6, 2.6, -3.7); scene.add(shelf);
  for (let k = 0; k < 5; k++) { const l = K.mesh(new THREE.CylinderGeometry(0.12, 0.2, 0.6, 10), new THREE.MeshStandardMaterial({ color: GOLD, metalness: 0.8, roughness: 0.3 })); l.position.set(-5.4 + k * 0.9, 2.96, -3.7); scene.add(l); }
  for (let k = 0; k < 4; k++) { const tl = K.box(0.08, 1.2, 0.05, null, { color: 0x3a3a3a }); tl.position.set(2.4 + k * 0.6, 3.6, -3.94); tl.rotation.z = (k - 1.5) * 0.12; scene.add(tl); }
  // the clay furnace with the crucible, the mould on the floor, the glowing pour between them
  const furn = K.mesh(new THREE.CylinderGeometry(0.9, 1.1, 1.2, 16), K.col(0x8a4a2a)); furn.position.set(-1.4, 0.6, -1.4); scene.add(furn);
  const coal = noInk(new THREE.Mesh(new THREE.CircleGeometry(0.85, 20), glow(0xff6a20))); coal.rotation.x = -Math.PI / 2; coal.position.set(-1.4, 1.21, -1.4); scene.add(coal);
  const cruc = new THREE.Group(); const cb = K.mesh(new THREE.CylinderGeometry(0.42, 0.3, 0.7, 14), K.col(0x5a4a40)); cruc.add(cb); const melt = noInk(new THREE.Mesh(new THREE.CircleGeometry(0.38, 16), glow(0xffd040))); melt.rotation.x = -Math.PI / 2; melt.position.y = 0.33; cruc.add(melt);
  cruc.position.set(-1.4, 1.6, -1.4); scene.add(cruc);
  const mould = K.mesh(new THREE.CylinderGeometry(0.55, 0.7, 0.9, 14), K.col(0x9a5a3a)); mould.position.set(1.0, 0.45, -1.0); scene.add(mould); const mouth = noInk(new THREE.Mesh(new THREE.CircleGeometry(0.2, 12), glow(0xffa030))); mouth.rotation.x = -Math.PI / 2; mouth.position.set(1.0, 0.91, -1.0); scene.add(mouth);
  const pour = noInk(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 1, 8), glow(0xffd860))); scene.add(pour); pour.visible = false;
  const heat = new THREE.PointLight(0xff8a30, 14, 10, 1.4); heat.position.set(-1.0, 1.8, -0.6); scene.add(heat);
  const SP = 160, spG = new THREE.BufferGeometry(), spP = new Float32Array(SP * 3); spG.setAttribute('position', new THREE.BufferAttribute(spP, 3)); const sparks = new THREE.Points(spG, new THREE.PointsMaterial({ color: 0xffc050, size: 0.05, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); sparks.userData.noInk = true; scene.add(sparks);
  let pourU = 0;
  life.push((t) => { heat.intensity = 12 + Math.sin(t * 15) * 2 + pourU * 8; coal.material.color.setHSL(0.06, 1, 0.5 + Math.sin(t * 6) * 0.05);
    const tilt = pourU * 1.1; cruc.position.set(lerp(-1.4, 0.35, pourU), 1.6 + pourU * 0.5, lerp(-1.4, -1.0, pourU)); cruc.rotation.z = -tilt;
    pour.visible = pourU > 0.85; if (pour.visible) { const top = new THREE.Vector3(0.75, 1.75, -1.0), bot = new THREE.Vector3(1.0, 0.92, -1.0); pour.position.copy(top).add(bot).multiplyScalar(0.5); pour.scale.y = top.distanceTo(bot); pour.rotation.z = Math.atan2(bot.x - top.x, top.y - bot.y); }
    for (let i = 0; i < SP; i++) { const u = (t * (0.6 + R2(i, 3) * 0.6) + R2(i, 4)) % 1, a = R2(i, 5) * 6.28; spP[i * 3] = (pourU > 0.85 ? 1.0 : -1.4) + Math.cos(a) * u * 1.2; spP[i * 3 + 1] = (pourU > 0.85 ? 0.95 : 1.3) + u * 1.6 - u * u * 1.8; spP[i * 3 + 2] = (pourU > 0.85 ? -1.0 : -1.4) + Math.sin(a) * u * 1.2; } spG.attributes.position.needsUpdate = true; });
  lights(scene, { key: 0xffa060, ki: 0.5, pos: [-4, 8, 6], hemi: [0x8a6a5a, 0x2a1a10, 0.5], box: 8, target: [0, 0, -1] });
  return { scene, life, setPour: (u) => { pourU = u; } };
}
const lerp = (a, b, u) => a + (b - a) * u;

// ---------------------------------------------------------------- 1950: THE INQUIRY ROOM (Travancore-Cochin police)
// A lime-washed office: desk under a hanging bulb, files, the evidence (a kerosene lantern) on the desk, and the inquiry
// board (chalk): the burnt shrine sketch -> "deliberate?" -> a blank silhouette with "?". API: setBoard(u), lantern.
export function inquirySet() {
  const T = K.stdTextures(), scene = new THREE.Scene(), life = []; scene.background = new THREE.Color(0x2a2018);
  const floor = K.mesh(new THREE.PlaneGeometry(14, 10), K.col(0x6a4a3a)); floor.rotation.x = -Math.PI / 2; scene.add(floor);
  const back = K.box(14, 5.5, 0.2, T.limeYellow, { tileM: 3 }); back.position.set(0, 2.75, -5); scene.add(back);
  for (const s of [-1, 1]) { const w = K.box(0.2, 5.5, 10, T.limeYellow, { tileM: 3 }); w.position.set(s * 7, 2.75, 0); scene.add(w); }
  const dado = K.box(14, 1.4, 0.06, null, { color: 0x2f4f5a }); dado.position.set(0, 0.7, -4.88); scene.add(dado);
  const desk = new THREE.Group(); const top = K.box(3.0, 0.1, 1.4, T.wood, { tileM: 1 }); top.position.y = 1.0; desk.add(top); const front = K.box(3.0, 0.95, 0.08, T.wood, { tileM: 1 }); front.position.set(0, 0.5, 0.66); desk.add(front);
  for (let i = 0; i < 6; i++) { const f = K.box(0.5, 0.06, 0.36, null, { color: [0xd8b878, 0xc8a060, 0xe8d0a0][i % 3] }); f.position.set(-0.9, 1.08 + i * 0.065, 0); f.rotation.y = (i % 3 - 1) * 0.08; desk.add(f); }
  // the evidence: a kerosene hurricane lantern
  const lantern = new THREE.Group(); const lb = K.mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.12, 12), K.col(0x8a2a1a)); lantern.add(lb); const glass = noInk(new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 8), new THREE.MeshBasicMaterial({ color: 0xf0e8c8, transparent: true, opacity: 0.5 }))); glass.position.y = 0.2; lantern.add(glass);
  const ltop = K.mesh(new THREE.ConeGeometry(0.15, 0.12, 12), K.col(0x8a2a1a)); ltop.position.y = 0.38; lantern.add(ltop); for (const s of [-1, 1]) { const w = K.mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.42, 4), K.col(0x2a2a2a)); w.position.set(s * 0.17, 0.2, 0); lantern.add(w); }
  const handle = K.mesh(new THREE.TorusGeometry(0.15, 0.012, 4, 16, Math.PI), K.col(0x2a2a2a)); handle.position.y = 0.42; lantern.add(handle); lantern.position.set(0.6, 1.06, 0.1); desk.add(lantern);
  const tagTex = K.signTex(['തെളിവ് #1'], { bg: '#f6f1e4', fg: '#8a1e1e', border: '#8a1e1e', w: 300, h: 110 }); const tag = plane(0.36, 0.13, tagTex); tag.position.set(0.85, 1.07, 0.35); tag.rotation.x = -Math.PI / 2 + 0.2; desk.add(tag);
  desk.position.set(1.6, 0, -1.6); scene.add(desk);
  const bulbW = K.mesh(new THREE.CylinderGeometry(0.01, 0.01, 1.4, 4), K.col(0x1a1a1a)); bulbW.position.set(1.6, 4.8, -1.6); scene.add(bulbW);
  const bulb = noInk(K.mesh(new THREE.SphereGeometry(0.16, 10, 8), glow(0xffe4a0), { shadow: false })); bulb.position.set(1.6, 4.0, -1.6); scene.add(bulb);
  const bl = new THREE.PointLight(0xffc880, 2.5, 8, 1.5); bl.position.copy(bulb.position); scene.add(bl);
  life.push((t) => { const sw = Math.sin(t * 1.3) * 0.08; bulb.position.x = 1.6 + sw; bl.position.x = bulb.position.x; });
  // the inquiry board
  const cv = document.createElement('canvas'); cv.width = 1000; cv.height = 640; const cb = cv.getContext('2d'); const ct = new THREE.CanvasTexture(cv); ct.colorSpace = THREE.SRGBColorSpace;
  const board = plane(4.4, 2.8, ct); board.position.set(-2.4, 2.9, -4.85); scene.add(board); const frame = K.box(4.6, 3.0, 0.05, T.wood, { tileM: 1 }); frame.position.set(-2.4, 2.9, -4.89); scene.add(frame);
  const setBoard = (u) => { const g = cb, w = 1000, h = 640; g.fillStyle = '#1e3a2a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#f4f0e6'; g.fillStyle = '#f4f0e6'; g.lineWidth = 7; g.lineCap = 'round'; g.textAlign = 'center';
    g.font = "800 56px 'Noto Malayalam'"; g.fillText('ശബരിമല · 1950', w / 2, 78);
    if (u > 0.05) { g.beginPath(); g.moveTo(90, 430); g.lineTo(90, 300); g.lineTo(170, 230); g.lineTo(250, 300); g.lineTo(250, 430); g.closePath(); g.stroke(); for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(110 + k * 40, 300); g.quadraticCurveTo(100 + k * 40, 250, 125 + k * 40, 220); g.stroke(); } g.font = "700 40px 'Oswald'"; g.fillText('FIRE', 170, 490); }
    const arrow = (x0, x1, y, k) => { if (k <= 0) return; const x = x0 + (x1 - x0) * k; g.beginPath(); g.moveTo(x0, y); g.lineTo(x, y); g.stroke(); if (k > 0.95) { g.beginPath(); g.moveTo(x1, y); g.lineTo(x1 - 28, y - 18); g.moveTo(x1, y); g.lineTo(x1 - 28, y + 18); g.stroke(); } };
    const k1 = Math.min(1, Math.max(0, (u - 0.15) / 0.3)), k2 = Math.min(1, Math.max(0, (u - 0.55) / 0.3));
    arrow(290, 430, 340, k1); if (k1 >= 1) { g.font = "800 44px 'Noto Malayalam'"; g.fillText('മനഃപൂർവ്വം?', 540, 355); }
    arrow(650, 760, 340, k2); if (k2 >= 1) { g.beginPath(); g.arc(860, 290, 44, 0, 7); g.fill(); g.beginPath(); g.moveTo(790, 440); g.quadraticCurveTo(860, 300, 930, 440); g.fill(); g.fillStyle = '#1e3a2a'; g.font = "700 64px 'Oswald'"; g.fillText('?', 860, 312); g.fillStyle = '#f4f0e6'; }
    if (u > 0.95) { g.strokeStyle = '#e8c83a'; g.lineWidth = 5; g.beginPath(); g.ellipse(860, 360, 110, 140, 0, 0, 7); g.stroke(); }
    ct.needsUpdate = true; };
  setBoard(0);
  const win = noInk(new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.4), glow(0xcfe0ff))); win.position.set(4.6, 3.2, -4.88); scene.add(win);
  lights(scene, { key: 0xfff0d8, ki: 0.9, pos: [5, 8, 6], hemi: [0xf4ecd8, 0x4a3a2a, 0.9], box: 8 });
  return { scene, life, setBoard, lantern };
}
