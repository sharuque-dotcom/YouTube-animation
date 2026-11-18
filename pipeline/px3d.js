// px3d: our 2.5D pixel-art diorama kit on three.js (reimplemented from the published style guide, own code).
// Pixel textures at 24 px per metre (NearestFilter), billboard pixel sprites that receive light, practical
// point lights with glow halos, per-set fog, high 3/4 camera on monotone paths, bloom + DOF/tilt-shift + grade.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export { THREE };
export const PPM = 24; // texels per metre
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => v / 16);
export const rnd = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };

// ---------------------------------------------------------------- pixel canvases
export class PX {
  constructor(w, h) { this.w = w; this.h = h; this.c = new OffscreenCanvas(w, h); this.g = this.c.getContext('2d'); }
  rect(x, y, w, h, col) { this.g.fillStyle = col; this.g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); return this; }
  dot(x, y, col) { return this.rect(x, y, 1, 1, col); }
  /** fill with a ramp chosen by a value field v(x,y) in 0..1, Bayer-dithered with a narrow band */
  ramp(ramp, v, band = 0.45, x0 = 0, y0 = 0, w = this.w, h = this.h) {
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) { const b = (BAYER[(y % 4) * 4 + (x % 4)] - 0.5) * band; const k = Math.max(0, Math.min(ramp.length - 1, Math.round(v(x, y) * (ramp.length - 1) + b))); this.g.fillStyle = ramp[k]; this.g.fillRect(x, y, 1, 1); }
    return this;
  }
  /** 1px "selout": outline opaque pixels with a dark tint of the neighbour */
  outline(ink = '#1a1016') {
    const d = this.g.getImageData(0, 0, this.w, this.h), a = (x, y) => (x < 0 || y < 0 || x >= this.w || y >= this.h ? 0 : d.data[(y * this.w + x) * 4 + 3]);
    const pts = []; for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) if (!a(x, y) && (a(x + 1, y) || a(x - 1, y) || a(x, y + 1) || a(x, y - 1))) pts.push([x, y]);
    pts.forEach(([x, y]) => this.dot(x, y, ink)); return this;
  }
  tex({ repeat = [1, 1] } = {}) { const t = new THREE.CanvasTexture(this.c); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); return t; }
}

// ---------------------------------------------------------------- geometry helpers
/** a box whose faces carry pixel textures at a constant 24 px/m (texture tiles of tileM metres) */
export function pxBox(w, h, d, tex, { tileM = 2, emissive = null, emissiveMap = null, emissiveIntensity = 2.2, color = 0xffffff } = {}) {
  const g = new THREE.BoxGeometry(w, h, d); const uv = g.attributes.uv, pos = g.attributes.position, nrm = g.attributes.normal;
  for (let i = 0; i < uv.count; i++) { const nx = Math.abs(nrm.getX(i)), ny = Math.abs(nrm.getY(i)); const px = pos.getX(i) + w / 2, py = pos.getY(i) + h / 2, pz = pos.getZ(i) + d / 2;
    const [u, v] = ny > 0.5 ? [px, pz] : nx > 0.5 ? [pz, py] : [px, py]; uv.setXY(i, u / tileM, v / tileM); }
  const m = new THREE.MeshLambertMaterial({ map: tex, color, emissive: emissive ?? 0x000000, emissiveMap, emissiveIntensity });
  const mesh = new THREE.Mesh(g, m); mesh.castShadow = true; mesh.receiveShadow = true; return mesh;
}
/** a solid gable roof (extruded triangle) spanning w (x) by d (z), ridge height h, with tiles at constant texel density */
export function roof(w, d, h, tex, tileM = 2) {
  const sh = new THREE.Shape(); sh.moveTo(-d / 2 - 0.4, 0); sh.lineTo(d / 2 + 0.4, 0); sh.lineTo(0, h); sh.closePath();
  const g = new THREE.ExtrudeGeometry(sh, { depth: w + 0.4, bevelEnabled: false }); g.translate(0, 0, -(w + 0.4) / 2); g.rotateY(Math.PI / 2); g.computeVertexNormals();
  const uv = g.attributes.uv, pos = g.attributes.position, nrm = g.attributes.normal;
  for (let i = 0; i < uv.count; i++) { const nx = Math.abs(nrm.getX(i)); const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const [u, v] = nx > 0.5 ? [z, y] : [x, Math.hypot(y, Math.abs(z))]; uv.setXY(i, u / tileM, v / tileM); }
  const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ map: tex })); m.castShadow = true; m.receiveShadow = true; return m;
}
/** a y-axis billboard carrying a pixel sprite canvas; lit by the scene (so it needs a front fill) */
export function sprite(px, heightM, { emissive = 0, alphaTest = 0.5 } = {}) {
  const tex = px.tex(); const w = heightM * px.w / px.h;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, heightM), new THREE.MeshLambertMaterial({ map: tex, alphaTest, side: THREE.DoubleSide, emissive: 0xffffff, emissiveMap: emissive ? tex : null, emissiveIntensity: emissive }));
  m.geometry.translate(0, heightM / 2, 0); m.castShadow = true; m.userData.billboard = true; m.userData.tex = tex; m.userData.px = px; return m;
}
/** additive halo so bloom has something to catch */
export function halo(color = 0xffb060, size = 1.2) {
  const c = new OffscreenCanvas(64, 64), g = c.getContext('2d'); const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); s.scale.set(size, size, 1); return s;
}
export const flick = (t, seed = 0) => 1 + 0.08 * Math.sin(t * 7.3 + seed) + 0.07 * Math.sin(t * 13.1 + seed * 2) + 0.05 * Math.sin(t * 23.7 + seed * 3);
/** monotone cubic track over keys [[t, value-or-array], ...] (Fritsch-Carlson, no overshoot) */
export function track(keys, t) {
  if (t <= keys[0][0]) return keys[0][1]; if (t >= keys[keys.length - 1][0]) return keys[keys.length - 1][1];
  const dim = Array.isArray(keys[0][1]) ? keys[0][1].length : 0, get = (k, d) => (dim ? keys[k][1][d] : keys[k][1]);
  let i = 0; while (keys[i + 1][0] < t) i++;
  const out = []; for (let d = 0; d < Math.max(1, dim); d++) {
    const xs = keys.map((k) => k[0]), ys = keys.map((_, k) => get(k, d)), n = xs.length, del = [], m = [];
    for (let k = 0; k < n - 1; k++) del.push((ys[k + 1] - ys[k]) / (xs[k + 1] - xs[k]));
    for (let k = 0; k < n; k++) m.push(k === 0 ? del[0] : k === n - 1 ? del[n - 2] : del[k - 1] * del[k] <= 0 ? 0 : (del[k - 1] + del[k]) / 2);
    for (let k = 0; k < n - 1; k++) if (del[k] === 0) { m[k] = m[k + 1] = 0; } else { const a = m[k] / del[k], b = m[k + 1] / del[k], s = a * a + b * b; if (s > 9) { const tau = 3 / Math.sqrt(s); m[k] = tau * a * del[k]; m[k + 1] = tau * b * del[k]; } }
    const h = xs[i + 1] - xs[i], u = (t - xs[i]) / h, h00 = 2 * u ** 3 - 3 * u ** 2 + 1, h10 = u ** 3 - 2 * u ** 2 + u, h01 = -2 * u ** 3 + 3 * u ** 2, h11 = u ** 3 - u ** 2;
    out.push(h00 * ys[i] + h10 * h * m[i] + h01 * ys[i + 1] + h11 * h * m[i + 1]);
  }
  return dim ? out : out[0];
}

// ---------------------------------------------------------------- post: depth DOF with tilt-shift, grade
const DofShader = {
  uniforms: { tColor: { value: null }, tDepth: { value: null }, res: { value: new THREE.Vector2() }, near: { value: 0.3 }, far: { value: 400 }, focus: { value: 10 }, aperture: { value: 300 }, maxCoc: { value: 24 }, tilt: { value: 17 }, band: { value: 0.5 }, halfw: { value: 0.075 }, feather: { value: 0.3 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader: `uniform sampler2D tColor; uniform sampler2D tDepth; uniform vec2 res; uniform float near, far, focus, aperture, maxCoc, tilt, band, halfw, feather; varying vec2 vUv;
  float lin(float d){ float z=d*2.-1.; return 2.*near*far/(far+near-z*(far-near)); }
  float coc(vec2 uv){ float z=lin(texture2D(tDepth,uv).x); float c=aperture*(1./focus-1./z); float dy=abs(uv.y-band)-halfw; float tc=tilt*clamp(dy/feather,0.,1.)*sign(band-uv.y); return clamp(c+tc,-maxCoc,maxCoc); }
  void main(){ float c0=coc(vUv); vec3 acc=vec3(0.); float wsum=0.; const float GA=2.39996;
    for(int i=0;i<96;i++){ float r=sqrt(float(i)/96.); float a=float(i)*GA; vec2 o=vec2(cos(a),sin(a))*r*abs(c0)/res; vec2 uv=vUv+o; float cs=coc(uv);
      float w = (cs < c0 - 0.5 && c0 > 0.) ? 0.15 : 1.;   // far samples must not bleed over a sharper foreground
      if (abs(cs) < r*abs(c0) && cs > 0.) w *= 0.3; acc+=texture2D(tColor,uv).rgb*w; wsum+=w; }
    gl_FragColor=vec4(acc/max(wsum,1e-3),1.); }`,
};
const GradeShader = {
  uniforms: { tDiffuse: { value: null }, vignette: { value: 0.62 }, warm: { value: 0.1 }, contrast: { value: 0.2 }, sat: { value: 1.05 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float vignette, warm, contrast, sat; varying vec2 vUv;
  void main(){ vec3 c=texture2D(tDiffuse,vUv).rgb; float l=dot(c,vec3(.299,.587,.114)); c=mix(vec3(l),c,sat); c=(c-.5)*(1.+contrast)+.5; c+=vec3(warm*.06,warm*.02,-warm*.05);
    vec2 d=vUv-.5; d.x*=.75; float v=1.-vignette*smoothstep(.25,.85,length(d)); c*=v; c=max(c,vec3(.03,.02,.03)); gl_FragColor=vec4(c,1.); }`,
};
/** renderer + composer for a w x h output; returns { render(scene, camera, opts) -> canvas } */
export function makeStage(w, h, { ss = 1 } = {}) {
  const canvas = new OffscreenCanvas(w * ss, h * ss);
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: true });
  r.setSize(w * ss, h * ss, false); r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.35; r.outputColorSpace = THREE.SRGBColorSpace;
  const depthTex = new THREE.DepthTexture(w * ss, h * ss); const rt = new THREE.WebGLRenderTarget(w * ss, h * ss, { depthTexture: depthTex, samples: 4, type: THREE.HalfFloatType });
  const composer = new EffectComposer(r); composer.setSize(w * ss, h * ss);
  const dof = new ShaderPass(DofShader, 'tIgnored'); dof.uniforms.res.value.set(w * ss, h * ss); composer.addPass(dof);
  const bloom = new UnrealBloomPass(new THREE.Vector2(w * ss, h * ss), 0.55, 0.75, 0.85); composer.addPass(bloom);
  const grade = new ShaderPass(GradeShader); composer.addPass(grade); composer.addPass(new OutputPass());
  return {
    renderer: r, canvas, bloom, grade,
    render(scene, camera, { focus = 10, aperture = 300, tilt = 17, band = 0.5, half = 0.075, feather = 0.3, maxCoc = 24 } = {}) {
      scene.traverse((o) => { if (o.userData.billboard) { o.rotation.y = Math.atan2(camera.position.x - o.position.x - (o.parent?.position.x || 0), camera.position.z - o.position.z - (o.parent?.position.z || 0)); } });
      // 1) scene -> rt (color + depth)  2) DOF/tilt from rt -> composer input  3) bloom, grade, tone map
      r.setRenderTarget(rt); r.render(scene, camera); r.setRenderTarget(null);
      const U = dof.uniforms; U.tDepth.value = depthTex; U.near.value = camera.near; U.far.value = camera.far; U.focus.value = focus; U.aperture.value = aperture; U.tilt.value = tilt; U.band.value = band; U.halfw.value = half; U.feather.value = feather; U.maxCoc.value = maxCoc * ss;
      U.tColor.value = rt.texture; composer.render();
      return canvas;
    },
  };
}
