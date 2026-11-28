// toon3d: inked, painted 3D world for bean-style cartoon shorts (our own implementation).
// World = real 3D geometry with painted canvas textures, warm sun key + sky fill, soft shadows,
// and a screen-space INK pass (normal + depth edges) so every object gets a brush outline.
// Characters = unlit 2D cards (pipeline/bean.js) billboarded into the world; they keep their own colours.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { drawBean } from './bean.js';

export { THREE };
export const rnd = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
export const INK = 0x2a1c17;

// ------------------------------------------------------------------ painted textures
/** paint(w,h,fn) -> CanvasTexture (smooth, mipmapped, repeat-wrapped) */
export function paint(w, h, fn, { repeat = [1, 1] } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); fn(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; t.repeat.set(...repeat); t.userData = { canvas: c, g }; return t;
}
/** soft painterly mottling: many low-alpha blobs of the given colours */
export function mottle(g, w, h, cols, n = 400, size = [6, 30], seed = 1, alpha = 0.18) {
  const r = rnd(seed); for (let i = 0; i < n; i++) { g.globalAlpha = alpha * (0.4 + r() * 0.6); g.fillStyle = cols[Math.floor(r() * cols.length)];
    g.beginPath(); g.ellipse(r() * w, r() * h, size[0] + r() * (size[1] - size[0]), (size[0] + r() * (size[1] - size[0])) * (0.4 + r() * 0.6), r() * 3, 0, 7); g.fill(); }
  g.globalAlpha = 1;
}
export const TEX = {};
export function stdTextures() {
  if (TEX.ready) return TEX;
  TEX.laterite = paint(256, 256, (g, w, h) => { g.fillStyle = '#a65a3c'; g.fillRect(0, 0, w, h); mottle(g, w, h, ['#8e4630', '#bb6e4a', '#7a3a28', '#c98060'], 500, [3, 14], 3, 0.3);
    const r = rnd(4); for (let i = 0; i < 260; i++) { g.fillStyle = r() < 0.5 ? '#5e2a1c' : '#d49270'; g.globalAlpha = 0.5; g.beginPath(); g.arc(r() * w, r() * h, 1 + r() * 2.2, 0, 7); g.fill(); } g.globalAlpha = 1;
    g.strokeStyle = '#6a3424'; g.lineWidth = 4; for (let y = 0; y <= h; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); for (let x = (y / 64) % 2 ? 0 : 64; x < w; x += 128) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 64); g.stroke(); } } });
  TEX.lime = paint(256, 256, (g, w, h) => { g.fillStyle = '#f1e8d2'; g.fillRect(0, 0, w, h); mottle(g, w, h, ['#e4d8bc', '#faf4e4', '#d8c8a6'], 260, [10, 50], 5, 0.25);
    const gr = g.createLinearGradient(0, h * 0.7, 0, h); gr.addColorStop(0, 'rgba(150,110,70,0)'); gr.addColorStop(1, 'rgba(150,110,70,.35)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  TEX.limeBlue = paint(256, 256, (g, w, h) => { g.fillStyle = '#a9cfd6'; g.fillRect(0, 0, w, h); mottle(g, w, h, ['#94bcc6', '#bfe0e4', '#86aeb8'], 260, [10, 50], 6, 0.25);
    const gr = g.createLinearGradient(0, h * 0.7, 0, h); gr.addColorStop(0, 'rgba(90,70,50,0)'); gr.addColorStop(1, 'rgba(90,70,50,.35)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  TEX.limeYellow = paint(256, 256, (g, w, h) => { g.fillStyle = '#efcf7c'; g.fillRect(0, 0, w, h); mottle(g, w, h, ['#e2bc62', '#f6dc98', '#d4ac58'], 260, [10, 50], 7, 0.25); });
  TEX.tiles = paint(256, 256, (g, w, h) => { g.fillStyle = '#b4532f'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 32) for (let x = ((y / 32) % 2) * 16; x < w + 32; x += 32) { const gr = g.createLinearGradient(x - 16, 0, x + 16, 0); gr.addColorStop(0, '#8a3a20'); gr.addColorStop(0.45, '#cf6a40'); gr.addColorStop(1, '#93401f'); g.fillStyle = gr; g.fillRect(x - 16, y, 32, 30);
      g.fillStyle = 'rgba(60,20,10,.55)'; g.fillRect(x - 16, y + 28, 32, 4); }
    mottle(g, w, h, ['#5a2a1a', '#e08a5a', '#3a4a2a'], 120, [4, 18], 9, 0.18); });
  TEX.wood = paint(128, 256, (g, w, h) => { g.fillStyle = '#7a4a2a'; g.fillRect(0, 0, w, h); const r = rnd(12);
    for (let x = 0; x < w; x += 2) { g.strokeStyle = r() < 0.5 ? 'rgba(60,30,15,.35)' : 'rgba(170,110,60,.25)'; g.lineWidth = 1 + r() * 2; g.beginPath(); g.moveTo(x, 0); for (let y = 0; y <= h; y += 16) g.lineTo(x + Math.sin(y * 0.05 + x) * 2, y); g.stroke(); }
    g.fillStyle = 'rgba(40,20,10,.6)'; for (let x = 0; x < w; x += 32) g.fillRect(x, 0, 3, h); });
  TEX.woodTeal = paint(128, 256, (g, w, h) => { g.fillStyle = '#2f8a86'; g.fillRect(0, 0, w, h); mottle(g, w, h, ['#24706c', '#46a6a0', '#7a5a3a'], 160, [3, 16], 13, 0.25); g.fillStyle = 'rgba(20,50,50,.6)'; for (let x = 0; x < w; x += 32) g.fillRect(x, 0, 3, h); });
  TEX.woodGreen = paint(128, 256, (g, w, h) => { g.fillStyle = '#4f7a3a'; g.fillRect(0, 0, w, h); mottle(g, w, h, ['#3e642c', '#6a9450', '#7a5a3a'], 160, [3, 16], 14, 0.25); g.fillStyle = 'rgba(20,40,20,.6)'; for (let x = 0; x < w; x += 32) g.fillRect(x, 0, 3, h); });
  TEX.dirt = paint(512, 512, (g, w, h) => { g.fillStyle = '#c48a5a'; g.fillRect(0, 0, w, h); mottle(g, w, h, ['#b07448', '#d6a070', '#a0603c', '#caa078'], 900, [6, 40], 21, 0.22);
    const r = rnd(22); for (let i = 0; i < 900; i++) { g.fillStyle = ['#7a4a2a', '#e8c49a', '#8e6040'][i % 3]; g.globalAlpha = 0.6; g.beginPath(); g.ellipse(r() * w, r() * h, 1 + r() * 3, 1 + r() * 2, r() * 3, 0, 7); g.fill(); } g.globalAlpha = 1;
    // cart ruts
    g.strokeStyle = 'rgba(110,64,36,.45)'; g.lineWidth = 14; for (const x of [150, 360]) { g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + 20, h / 3, x - 20, h * 2 / 3, x, h); g.stroke(); } });
  TEX.grass = paint(256, 256, (g, w, h) => { g.fillStyle = '#6f9a3e'; g.fillRect(0, 0, w, h); mottle(g, w, h, ['#5a8434', '#86b04a', '#4a7030', '#9ab85a'], 600, [4, 22], 31, 0.3); });
  TEX.bark = paint(64, 256, (g, w, h) => { g.fillStyle = '#8a7056'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 12) { g.fillStyle = 'rgba(60,40,28,.55)'; g.fillRect(0, y, w, 3); } mottle(g, w, h, ['#6a5440', '#a48a6a'], 60, [3, 12], 33, 0.3); });
  TEX.sack = paint(64, 64, (g, w, h) => { g.fillStyle = '#d8c08a'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(120,90,50,.4)'; for (let i = 0; i < w; i += 3) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(w, i); g.stroke(); } });
  TEX.ready = true; return TEX;
}
/** a sign board texture with painted lettering; text may be Malayalam (font 'Noto Malayalam') */
export function signTex(lines, { bg = '#1f4f36', fg = '#f4dca0', border = '#d9a521', w = 512, h = 160, font = 'Noto Malayalam', weight = 800, aged = true } = {}) {
  return paint(w, h, (g) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); if (aged) mottle(g, w, h, ['#000', '#fff'], 90, [8, 40], w + h, 0.06);
    g.strokeStyle = border; g.lineWidth = 10; g.strokeRect(10, 10, w - 20, h - 20);
    g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; const n = lines.length;
    lines.forEach((t, i) => { let fs = (h - 40) / n * 0.82; g.font = `${weight} ${fs}px '${font}', 'Oswald', sans-serif`; while (g.measureText(t).width > w - 60 && fs > 8) { fs -= 2; g.font = `${weight} ${fs}px '${font}', 'Oswald', sans-serif`; } g.fillText(t, w / 2, 20 + (h - 40) * (i + 0.5) / n + 2); }); });
}

// ------------------------------------------------------------------ geometry helpers
/** box with world-scaled UVs (tileM metres per texture repeat) */
export function box(w, h, d, tex, { tileM = 2, color = 0xffffff, shadow = true } = {}) {
  const g = new THREE.BoxGeometry(w, h, d); const uv = g.attributes.uv, pos = g.attributes.position, nrm = g.attributes.normal;
  for (let i = 0; i < uv.count; i++) { const nx = Math.abs(nrm.getX(i)), ny = Math.abs(nrm.getY(i)); const px = pos.getX(i) + w / 2, py = pos.getY(i) + h / 2, pz = pos.getZ(i) + d / 2;
    const [u, v] = ny > 0.5 ? [px, pz] : nx > 0.5 ? [pz, py] : [px, py]; uv.setXY(i, u / tileM, v / tileM); }
  const m = new THREE.Mesh(g, mat(tex, color)); m.castShadow = shadow; m.receiveShadow = true; return m;
}
const _mats = new Map();
export function mat(tex, color = 0xffffff) { const k = (tex?.uuid || '') + color; if (!_mats.has(k)) _mats.set(k, new THREE.MeshLambertMaterial({ map: tex || null, color })); return _mats.get(k); }
export function col(color) { return mat(null, color); }
export function mesh(geo, material, { shadow = true } = {}) { const m = new THREE.Mesh(geo, material); m.castShadow = shadow; m.receiveShadow = true; return m; }
/** hip/gable roof over w (x) by d (z) with ridge height h and overhang o */
export function roofGable(w, d, h, tex, o = 0.6) {
  const sh = new THREE.Shape(); sh.moveTo(-d / 2 - o, -0.05); sh.lineTo(d / 2 + o, -0.05); sh.lineTo(0, h); sh.closePath();
  const g = new THREE.ExtrudeGeometry(sh, { depth: w + o * 2, bevelEnabled: false }); g.translate(0, 0, -(w + o * 2) / 2); g.rotateY(Math.PI / 2); g.computeVertexNormals();
  const uv = g.attributes.uv, pos = g.attributes.position, nrm = g.attributes.normal;
  for (let i = 0; i < uv.count; i++) { const nx = Math.abs(nrm.getX(i)); const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i); const [u, v] = nx > 0.5 ? [z, y] : [x, Math.hypot(y, Math.abs(z))]; uv.setXY(i, u / 1.2, v / 1.2); }
  return mesh(g, mat(tex));
}
/** sloped lean-to awning: width w along x, depth d (out along +z), drop */
export function awning(w, d, drop, tex) { const g = new THREE.PlaneGeometry(w, Math.hypot(d, drop)); const m = mesh(g, new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide })); m.rotation.x = -Math.PI / 2 + Math.atan2(drop, d); m.position.set(0, -drop / 2, d / 2);
  const t = tex.clone(); t.repeat.set(w / 1.2, Math.hypot(d, drop) / 1.2); t.needsUpdate = true; m.material.map = t; const grp = new THREE.Group(); grp.add(m);
  const lip = box(w, 0.08, 0.08, null, { color: 0x6a2a18 }); lip.position.set(0, -drop, d); grp.add(lip); return grp; }

// coconut palm: tapered curved trunk + 3D drooping fronds (thin ribbon meshes, double sided)
export function palm(h = 8, lean = 0.15, seed = 1) {
  const T = stdTextures(), r = rnd(seed), g = new THREE.Group();
  const pts = []; for (let i = 0; i <= 8; i++) { const u = i / 8; pts.push(new THREE.Vector3(Math.sin(lean) * h * u * u * 0.9, h * u, 0)); }
  const curve = new THREE.CatmullRomCurve3(pts); const tube = new THREE.TubeGeometry(curve, 16, 0.17, 7, false);
  const trunk = mesh(tube, mat(T.bark)); g.add(trunk);
  const top = curve.getPoint(1); const crown = new THREE.Group(); crown.position.copy(top); g.add(crown);
  const frondMat = new THREE.MeshLambertMaterial({ color: 0x5a8a34, side: THREE.DoubleSide }); const frondMat2 = new THREE.MeshLambertMaterial({ color: 0x467a2c, side: THREE.DoubleSide });
  for (let f = 0; f < 12; f++) {
    const len = 2.6 + r() * 0.9, segs = 10, geo = new THREE.BufferGeometry(), v = [], idx = [];
    for (let i = 0; i <= segs; i++) { const u = i / segs, x = u * len, y = 0.5 * u - 1.6 * u * u, wdt = 0.45 * Math.sin(Math.PI * Math.min(1, u * 1.1)) + 0.04;
      v.push(x, y, -wdt, x, y - 0.12 * u, 0, x, y, wdt); if (i < segs) { const a = i * 3; idx.push(a, a + 3, a + 1, a + 1, a + 3, a + 4, a + 1, a + 4, a + 2, a + 2, a + 4, a + 5); } }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); geo.setIndex(idx); geo.computeVertexNormals();
    const m = mesh(geo, f % 2 ? frondMat : frondMat2); m.rotation.y = (f / 12) * Math.PI * 2 + r() * 0.3; m.rotation.z = 0.25 + r() * 0.35; crown.add(m);
  }
  for (let i = 0; i < 5; i++) { const n = mesh(new THREE.SphereGeometry(0.17, 8, 6), col(i % 2 ? 0x7a9a30 : 0x8a6a2a)); n.position.set(Math.cos(i * 1.3) * 0.22, -0.25, Math.sin(i * 1.3) * 0.22); crown.add(n); }
  g.userData.crown = crown; g.userData.sway = (t) => { crown.rotation.z = Math.sin(t * 0.9 + seed) * 0.05; crown.rotation.x = Math.sin(t * 0.7 + seed * 2) * 0.04; };
  return g;
}
export function banana(seed = 2) { // banana plant: short trunk + big paddle leaves
  const r = rnd(seed), g = new THREE.Group(); const tr = mesh(new THREE.CylinderGeometry(0.12, 0.18, 1.6, 8), col(0x7a8a3a)); tr.position.y = 0.8; g.add(tr);
  const lm = new THREE.MeshLambertMaterial({ color: 0x6aa83e, side: THREE.DoubleSide });
  for (let i = 0; i < 7; i++) { const geo = new THREE.PlaneGeometry(0.55, 1.8, 1, 6); const p = geo.attributes.position; for (let k = 0; k < p.count; k++) { const y = p.getY(k) + 0.9; p.setZ(k, -0.18 * y * y); } geo.translate(0, 0.9, 0); geo.computeVertexNormals();
    const l = mesh(geo, lm); l.position.y = 1.5; l.rotation.y = i * 0.9 + r(); l.rotation.x = 0.5 + r() * 0.5; g.add(l); }
  return g;
}

// ------------------------------------------------------------------ character cards
const PX_PER_UNIT = 2.2, UNIT_M = 1.7 / 430; // bean units -> metres (adult ~1.7 m incl. hair)
/** a billboard card showing a bean character; card.userData.set(opts) redraws */
export function card(who, opts = {}, { scale = 1 } = {}) {
  const cw = 560, ch = 1100, ox = cw / 2, oy = ch - 30;
  const c = document.createElement('canvas'); c.width = cw; c.height = ch; const g = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const wM = (cw / PX_PER_UNIT) * UNIT_M * scale, hM = (ch / PX_PER_UNIT) * UNIT_M * scale, footM = (30 / PX_PER_UNIT) * UNIT_M * scale;
  const geo = new THREE.PlaneGeometry(wM, hM); geo.translate(0, hM / 2 - footM, 0);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex, alphaTest: 0.5, alphaToCoverage: true, side: THREE.DoubleSide, toneMapped: false }));
  m.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.5 });
  m.castShadow = true; m.userData.card = true;
  // soft contact shadow on the ground
  const cs = new THREE.Mesh(new THREE.CircleGeometry(0.28 * scale, 24), new THREE.MeshBasicMaterial({ color: 0x2a1c17, transparent: true, opacity: 0.28, depthWrite: false }));
  cs.rotation.x = -Math.PI / 2; cs.scale.y = 0.55; cs.position.y = 0.015; cs.userData.noInk = true;
  const grp = new THREE.Group(); grp.add(m); grp.add(cs); grp.userData.cardMesh = m;
  grp.userData.set = (o) => { g.clearRect(0, 0, cw, ch); g.save(); g.translate(ox, oy); g.scale(PX_PER_UNIT, PX_PER_UNIT); drawBean(g, who, o); g.restore(); tex.needsUpdate = true; };
  grp.userData.set(opts);
  return grp;
}

// ------------------------------------------------------------------ post: ink + DOF + grade
const InkShader = {
  uniforms: { tColor: { value: null }, tNormal: { value: null }, tDepth: { value: null }, res: { value: new THREE.Vector2() }, near: { value: 0.1 }, far: { value: 300 }, ink: { value: new THREE.Color(INK) }, width: { value: 1.6 }, strength: { value: 0.92 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader: `uniform sampler2D tColor, tNormal, tDepth; uniform vec2 res; uniform float near, far, width, strength; uniform vec3 ink; varying vec2 vUv;
  float lin(float d){ float z=d*2.-1.; return 2.*near*far/(far+near-z*(far-near)); }
  void main(){ vec3 c=texture2D(tColor,vUv).rgb; vec2 px=width/res; float z0=lin(texture2D(tDepth,vUv).x); vec3 n0=texture2D(tNormal,vUv).rgb;
    float e=0.; float sk=0.;
    vec2 offs[8]; offs[0]=vec2(1,0);offs[1]=vec2(-1,0);offs[2]=vec2(0,1);offs[3]=vec2(0,-1);offs[4]=vec2(.7,.7);offs[5]=vec2(-.7,.7);offs[6]=vec2(.7,-.7);offs[7]=vec2(-.7,-.7);
    if (dot(n0,n0) < 0.01) sk=1.;
    for(int i=0;i<8;i++){ vec2 uv=vUv+offs[i]*px; vec3 n=texture2D(tNormal,uv).rgb; if(dot(n,n)<0.01){ continue; } float z=lin(texture2D(tDepth,uv).x);
      float dn=length(n-n0); float dz=(z0-z)/z0; e=max(e, smoothstep(.28,.5,dn)); e=max(e, smoothstep(.035,.08,dz)); }
    if (sk>0.5) e=0.;
    float fade=1.-smoothstep(25.,140.,z0); e*=strength*mix(.35,1.,fade);
    gl_FragColor=vec4(mix(c,ink,e),1.); }`,
};
const DofGrade = {
  uniforms: { tDiffuse: { value: null }, tDepth: { value: null }, res: { value: new THREE.Vector2() }, near: { value: 0.1 }, far: { value: 300 }, focus: { value: 6 }, aperture: { value: 14 }, maxR: { value: 14 }, sat: { value: 1.08 }, contrast: { value: 0.06 }, lift: { value: 0.02 }, warm: { value: 0.02 }, vignette: { value: 0.28 }, haze: { value: new THREE.Color(0xdfe9f2) }, hazeAmt: { value: 0.0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader: `uniform sampler2D tDiffuse, tDepth; uniform vec2 res; uniform float near, far, focus, aperture, maxR, sat, contrast, lift, warm, vignette, hazeAmt; uniform vec3 haze; varying vec2 vUv;
  float lin(float d){ float z=d*2.-1.; return 2.*near*far/(far+near-z*(far-near)); }
  float coc(vec2 uv){ float z=lin(texture2D(tDepth,uv).x); return clamp(aperture*abs(1./focus-1./z)*focus, 0., maxR); }
  void main(){ float r0=coc(vUv); vec3 acc=vec3(0.); float ws=0.; const float GA=2.39996;
    for(int i=0;i<48;i++){ float rr=sqrt((float(i)+.5)/48.); float a=float(i)*GA; vec2 uv=vUv+vec2(cos(a),sin(a))*rr*r0/res; float rs=coc(uv); float w=rs>=rr*r0*.8?1.:.08; acc+=texture2D(tDiffuse,uv).rgb*w; ws+=w; }
    vec3 c = r0<.6 ? texture2D(tDiffuse,vUv).rgb : acc/ws;
    float z=lin(texture2D(tDepth,vUv).x); c=mix(c,haze,hazeAmt*smoothstep(15.,120.,z));
    float l=dot(c,vec3(.299,.587,.114)); c=mix(vec3(l),c,sat); c=(c-.5)*(1.+contrast)+.5+lift; c+=vec3(warm,warm*.4,-warm*.6);
    vec2 d=vUv-.5; d.x*=.6; c*=1.-vignette*smoothstep(.3,.9,length(d)); gl_FragColor=vec4(clamp(c,0.,1.),1.); }`,
};

export function makeInkStage(w, h) {
  const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
  const r = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true }); r.setSize(w, h, false);
  r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap; r.toneMapping = THREE.NoToneMapping; r.outputColorSpace = THREE.SRGBColorSpace;
  const depthTex = new THREE.DepthTexture(w, h); const rt = new THREE.WebGLRenderTarget(w, h, { depthTexture: depthTex, samples: 4, type: THREE.HalfFloatType });
  const nrt = new THREE.WebGLRenderTarget(w, h, { samples: 0 });
  const nMat = new THREE.MeshNormalMaterial(); const blackCache = new Map();
  const composer = new EffectComposer(r, new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType })); composer.setSize(w, h);
  const ink = new ShaderPass(InkShader, 'tIgnored'); ink.uniforms.res.value.set(w, h); composer.addPass(ink);
  const dof = new ShaderPass(DofGrade); dof.uniforms.res.value.set(w, h); composer.addPass(dof);
  const bloom = new UnrealBloomPass(new THREE.Vector2(w, h), 0.18, 0.5, 0.92); composer.addPass(bloom);
  composer.addPass(new OutputPass());
  return {
    renderer: r, canvas, ink, dof, bloom,
    render(scene, camera, { focus = 6, aperture = 12, maxR = 14, inkWidth = 1.6 * (w / 1080) * 1.4, ...grade } = {}) {
      scene.traverse((o) => { if (o.userData.card) { const p = new THREE.Vector3(); o.getWorldPosition(p); o.rotation.y = Math.atan2(camera.position.x - p.x, camera.position.z - p.z) - (o.parent?.rotation.y || 0); } });
      r.setRenderTarget(rt); r.render(scene, camera);
      // normal pass: world -> view normals, cards -> black (ignored by ink), additive sprites hidden
      const swaps = [];
      scene.traverse((o) => { if (!o.isMesh && !o.isSprite && !(o.isPoints && o.userData.noInk)) return; if (o.isSprite || o.isPoints || o.userData.noInk) { swaps.push([o, null, o.visible]); o.visible = false; return; }
        if (o.userData.card) { let b = blackCache.get(o.material.map); if (!b) { b = new THREE.MeshBasicMaterial({ color: 0, map: o.material.map, alphaTest: 0.5, side: THREE.DoubleSide }); blackCache.set(o.material.map, b); } swaps.push([o, o.material]); o.material = b; }
        else { swaps.push([o, o.material]); o.material = nMat; } });
      const bg = scene.background, fog = scene.fog; scene.background = null; scene.fog = null; r.setClearColor(0, 0);
      r.setRenderTarget(nrt); r.clear(); r.render(scene, camera); r.setRenderTarget(null);
      scene.background = bg; scene.fog = fog; swaps.forEach(([o, m, v]) => { if (m) o.material = m; else o.visible = v; });
      const U = ink.uniforms; U.tColor.value = rt.texture; U.tNormal.value = nrt.texture; U.tDepth.value = depthTex; U.near.value = camera.near; U.far.value = camera.far; U.width.value = inkWidth;
      const D = dof.uniforms; D.tDepth.value = depthTex; D.near.value = camera.near; D.far.value = camera.far; D.focus.value = focus; D.aperture.value = aperture; D.maxR.value = maxR * (w / 1080);
      for (const k in grade) if (D[k]) { if (D[k].value?.isColor) D[k].value.set(grade[k]); else D[k].value = grade[k]; }
      composer.render(); return canvas;
    },
  };
}

/** gradient sky with painted cumulus as the scene background */
export function skyTexture({ top = '#5f9fe0', mid = '#9fcaf0', bottom = '#e8f1f4', clouds = 8, seed = 3 } = {}) {
  return paint(512, 1024, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, top); gr.addColorStop(0.55, mid); gr.addColorStop(1, bottom); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const r = rnd(seed); for (let k = 0; k < clouds; k++) { const cx = r() * w, cy = 80 + r() * h * 0.45, s = 40 + r() * 70;
      for (let i = 0; i < 9; i++) { const x = cx + (i - 4) * s * 0.35 + r() * 12, y = cy - Math.sin((i / 8) * Math.PI) * s * 0.4; g.fillStyle = '#c8d6e6'; g.beginPath(); g.ellipse(x, y + 8, s * 0.42, s * 0.3, 0, 0, 7); g.fill(); }
      for (let i = 0; i < 9; i++) { const x = cx + (i - 4) * s * 0.35 + r() * 12, y = cy - Math.sin((i / 8) * Math.PI) * s * 0.4; g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(x, y, s * 0.38, s * 0.27, 0, 0, 7); g.fill(); }
      g.strokeStyle = 'rgba(42,28,23,.0)'; } });
}
