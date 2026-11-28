// assets.js: load the CC0 asset library in content/assets/ into three.js scenes (browser module).
// Fetch the files first: `python3 pipeline/fetch-assets.py` (Poly Haven) and `node pipeline/fetch-kenney.cjs pirate-kit`.
// Pages must be served from the repo root (the episode shoot scripts do this), so asset URLs start with /content/assets/.
//   const ship = await model('ph:dutch_ship_large_01');          // Poly Haven glTF, real-world metres, PBR textures
//   const boat = await model('kenney:pirate-kit/ship-large', { height: 12 });   // Kenney low-poly GLB
//   const sky  = await hdri(renderer, 'kloppenheim_06_puresky');  // { env, background, sunDir, horizon }
//   const deck = texMaterial('weathered_planks', { repeat: [4, 4] });
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

const BASE = '/content/assets';
const gltf = new GLTFLoader(); const cache = new Map();

export function assetUrl(id) {
  const [src, name] = id.split(':');
  if (src === 'ph') return `${BASE}/polyhaven/models/${name}/${name}.gltf`;
  if (src === 'kenney') { const [kit, m] = name.split('/'); return `${BASE}/kenney/${kit}/glb/${m}.glb`; }
  throw new Error('unknown asset ' + id);
}

// Returns a fresh copy each call (geometry/materials shared). opts: height | length (scale to fit), shadows (default true),
// ground (default true: lowest point at y=0; pass false for models whose waterline/origin already matters).
export async function model(id, opts = {}) {
  const url = assetUrl(id);
  if (!cache.has(url)) cache.set(url, gltf.loadAsync(url));
  const g = await cache.get(url); const root = g.scene.clone(true);
  const shadows = opts.shadows ?? true;
  root.traverse((o) => { if (o.isMesh) { o.castShadow = shadows; o.receiveShadow = shadows;
    const m = o.material; if (m && m.map) { m.map.anisotropy = 8; } if (m && m.alphaMap || (m && m.transparent)) { m.alphaTest = Math.max(m.alphaTest || 0, 0.4); m.transparent = false; } } });
  const box = new THREE.Box3().setFromObject(root), size = box.getSize(new THREE.Vector3());
  let s = 1; if (opts.height) s = opts.height / size.y; else if (opts.length) s = opts.length / Math.max(size.x, size.z);
  root.scale.multiplyScalar(s);
  if (opts.ground ?? (!id.startsWith('ph:dutch') && !id.startsWith('ph:ship'))) root.position.y -= box.min.y * s;
  const wrap = new THREE.Group(); wrap.add(root); wrap.userData.size = size.multiplyScalar(s); wrap.userData.id = id; return wrap;
}

// Equirect HDRI as environment light + background. Also finds the sun (brightest pixel) and the average horizon colour,
// so a DirectionalLight and fog can be matched to the sky.
export async function hdri(renderer, name, res = '2k') {
  const tex = await new RGBELoader().setDataType(THREE.FloatType).loadAsync(`${BASE}/polyhaven/hdris/${name}_${res}.hdr`);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  const { width: w, height: h, data } = tex.image; let best = -1, bi = 0; const hz = [0, 0, 0]; let hn = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4, L = data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722;
    if (L > best) { best = L; bi = y * w + x; }
    if (Math.abs(y - h / 2) < h * 0.03) { hz[0] += data[i]; hz[1] += data[i + 1]; hz[2] += data[i + 2]; hn++; } }
  // three's equirect convention: u = atan(z, x)/2pi + 0.5, v = asin(y)/pi + 0.5, rows stored bottom-up (flipY)
  const u = (bi % w + 0.5) / w, v = 1 - (Math.floor(bi / w) + 0.5) / h; const phi = (u - 0.5) * Math.PI * 2, el = (v - 0.5) * Math.PI;
  const sunDir = new THREE.Vector3(Math.cos(phi) * Math.cos(el), Math.sin(el), Math.sin(phi) * Math.cos(el)).normalize();
  const pm = new THREE.PMREMGenerator(renderer); const env = pm.fromEquirectangular(tex).texture; pm.dispose();
  return { env, background: tex, sunDir, sunLum: best, horizon: new THREE.Color(hz[0] / hn, hz[1] / hn, hz[2] / hn) };
}

// PBR material from a Poly Haven texture set (diff / nor_gl / arm = AO, roughness, metalness).
const tl = new THREE.TextureLoader();
export function texMaterial(name, { res = '1k', repeat = [1, 1], color, ...rest } = {}) {
  const f = (m) => { const t = tl.load(`${BASE}/polyhaven/textures/${name}/${name}_${m}_${res}.jpg`); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); t.anisotropy = 8; return t; };
  const map = f('diff'); map.colorSpace = THREE.SRGBColorSpace; const arm = f('arm');
  return new THREE.MeshStandardMaterial({ map, normalMap: f('nor'), aoMap: arm, roughnessMap: arm, metalnessMap: arm, color, ...rest });
}

// Wait for every texture the loaders started (call before the first renderAt so frame 0 is complete).
export function settle() { return new Promise((res) => { const m = THREE.DefaultLoadingManager; if (!m.isLoading) return res(); const prev = m.onLoad; m.onLoad = () => { prev && prev(); res(); }; setTimeout(res, 20000); }); }
THREE.DefaultLoadingManager.onStart = () => { THREE.DefaultLoadingManager.isLoading = true; };
const _onLoad = THREE.DefaultLoadingManager.onLoad; THREE.DefaultLoadingManager.onLoad = () => { THREE.DefaultLoadingManager.isLoading = false; _onLoad && _onLoad(); };
