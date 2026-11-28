// env-ship: environment look test (28 Nov; v2 uses real CC0 models: Poly Haven Dutch ships + HDRI sky, see content/assets/CREDITS.md). A sunset ocean that reads as a real place: physical sky (three Sky) used as
// image-based light for PBR materials, a Gerstner-wave ocean with fresnel sky reflection, sun glitter and crest foam,
// a VOC ship (from ml-colachel) re-skinned in PBR, rocking on the swell, spray + haze, ACES tone mapping, bloom.
// window.renderAt(t) -> PNG data URL of the frame at time t (1080x1920), camera flying past the ship.
import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { model, hdri, settle } from '../../pipeline/assets.js';

const W = 1080, H = 1920, P = new URLSearchParams(location.search);
const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H; document.body.appendChild(canvas);
const r = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true }); r.setSize(W, H, false);
r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 0.55; r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(58, W / H, 0.3, 6000);

// ---- sky: Poly Haven HDRI (default) as background + image-based light; ?sky=phys keeps the procedural Sky
const SKY = P.get('sky') || 'belfast_sunset_puresky'; let ROT = 0, sun = new THREE.Vector3(), skyTex = null, fogCol = new THREE.Color(0xd99a6a);
if (SKY === 'phys') {
  const elev = Number(P.get('elev') ?? 1.6), azim = 200; const sky = new Sky(); sky.scale.setScalar(5000); const su = sky.material.uniforms;
  su.turbidity.value = 10; su.rayleigh.value = 3.2; su.mieCoefficient.value = 0.006; su.mieDirectionalG.value = 0.86;
  sun.setFromSphericalCoords(1, THREE.MathUtils.degToRad(90 - elev), THREE.MathUtils.degToRad(azim)); su.sunPosition.value.copy(sun); scene.add(sky);
  const pm = new THREE.PMREMGenerator(r); const envScene = new THREE.Scene(); const sky2 = new Sky(); sky2.scale.setScalar(5000); Object.assign(sky2.material.uniforms, THREE.UniformsUtils.clone(su)); sky2.material.uniforms.sunPosition.value.copy(sun); envScene.add(sky2);
  scene.environment = pm.fromScene(envScene).texture;
} else {
  console.log('hdri…'); const h = await hdri(r, SKY); console.log('hdri ok'); scene.background = h.background; scene.environment = h.env; skyTex = h.background; sun.copy(h.sunDir);
  // spin the sky so the sun sits just off the camera's mid-shot view direction (backlit, golden rim on the ship)
  const want = Math.atan2(-0.98, 0.17) + Number(P.get('sunoff') ?? 0.35); ROT = Math.atan2(sun.z, sun.x) - want; if (P.has('rot')) ROT = Number(P.get('rot'));
  scene.backgroundRotation = new THREE.Euler(0, ROT, 0); scene.environmentRotation = scene.backgroundRotation; sun.applyEuler(new THREE.Euler(0, ROT, 0)); fogCol.copy(h.horizon).multiplyScalar(1 / Math.max(h.horizon.r, h.horizon.g, h.horizon.b, 1e-3)).multiplyScalar(0.8);
  r.toneMappingExposure = Number(P.get('exp') ?? 0.75);
}
const key = new THREE.DirectionalLight(0xffb070, 3.2); key.position.copy(sun).multiplyScalar(300); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0004;
Object.assign(key.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 10, far: 800 }); scene.add(key, key.target);
scene.add(new THREE.HemisphereLight(0x8fa6d8, 0x3a2a20, 0.25));
scene.fog = new THREE.FogExp2(fogCol, 0.0007);

// ---- ocean: Gerstner waves, fresnel reflection of a sky gradient, sun glitter, crest foam, depth tint
const WAVES = [[0.9, 0.0, 0.32, 42], [0.7, 0.6, 0.28, 27], [0.4, -0.5, 0.24, 15], [0.2, 1.4, 0.2, 8.5], [0.12, -1.1, 0.16, 4.3], [0.06, 2.2, 0.12, 2.2]];
const wDecl = WAVES.map((w, i) => `vec4(${w.map((x) => x.toFixed(3)).join(',')})`).join(',');
const ocean = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000, 400, 400).rotateX(-Math.PI / 2), new THREE.ShaderMaterial({
  uniforms: { t: { value: 0 }, sunDir: { value: sun.clone() }, camPos: { value: new THREE.Vector3() }, fogC: { value: fogCol }, skyMap: { value: skyTex }, useMap: { value: skyTex ? 1 : 0 }, skyRot: { value: ROT } },
  vertexShader: `uniform float t; varying vec3 vW; varying vec3 vN; varying float vCrest; const vec4 WV[6]=vec4[6](${wDecl});
  void main(){ vec3 p=position; float dd=length(p.xz); float damp=1.-smoothstep(500.,1400.,dd); vec3 n=vec3(0,1,0); float crest=0.;
    for(int i=0;i<6;i++){ vec4 w=WV[i]; vec2 d=normalize(vec2(cos(w.y),sin(w.y))); float k=6.2831/w.w, c=sqrt(9.8/k), f=k*(dot(d,position.xz)-c*t), a=w.x*damp, q=w.z;
      p.x+=q*a*d.x*cos(f); p.z+=q*a*d.y*cos(f); p.y+=a*sin(f); n.x-=d.x*k*a*cos(f); n.z-=d.y*k*a*cos(f); n.y-=q*k*a*sin(f); crest+=a*sin(f); }
    vW=(modelMatrix*vec4(p,1.)).xyz; vN=normalize(n); vCrest=crest; gl_Position=projectionMatrix*viewMatrix*vec4(vW,1.); }`,
  fragmentShader: `uniform vec3 sunDir, camPos, fogC; uniform float t; uniform sampler2D skyMap; uniform float useMap, skyRot; varying vec3 vW; varying vec3 vN; varying float vCrest;
  float h(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
  float nz(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y); }
  void main(){ vec3 V=normalize(camPos-vW); float dist=length(camPos-vW);
    float fall=mix(1.,0.08,smoothstep(15.,350.,dist)); vec2 g=vec2(0.);
    for(int i=0;i<22;i++){ float fi=float(i); float ang=fi*2.399+0.3; vec2 d=vec2(cos(ang),sin(ang)); float L=i<8? 0.14+fi*0.06 : 0.6+(fi-8.)*0.42; float k=6.2831/L; float ph=k*dot(d,vW.xz)-sqrt(9.8*k)*t+fi*1.7; g+=d*cos(ph)*(0.045*L/6.); }
    vec3 N=normalize(vN+vec3(-g.x,0.,-g.y)*fall*2.2);
    vec3 R=reflect(-V,N); R.y=abs(R.y);
    vec3 skyC=mix(vec3(0.85,0.42,0.22), vec3(0.18,0.22,0.36), pow(clamp(R.y,0.,1.),0.45)); skyC+= vec3(1.0,0.55,0.25)*pow(max(dot(R,sunDir),0.),8.)*0.8;
    if(useMap>0.5){ float cr=cos(skyRot), sr=sin(skyRot); vec3 Rr=vec3(cr*R.x-sr*R.z, max(R.y,0.02), sr*R.x+cr*R.z); vec2 uv=vec2(atan(Rr.z,Rr.x)*0.15915+0.5, asin(clamp(Rr.y,-1.,1.))*0.31831+0.5); skyC=min(texture2D(skyMap,uv).rgb, vec3(4.))*0.75; }
    float fres=0.02+0.5*pow(1.-max(dot(N,V),0.),5.);
    vec3 deep=vec3(0.01,0.045,0.065), shallow=vec3(0.03,0.15,0.16); vec3 body=mix(deep, shallow, clamp(vCrest*0.6+0.4,0.,1.)*0.7)*(0.5+0.5*max(dot(N,sunDir),0.));
    vec3 c=mix(body, skyC, fres);
    float glint=pow(max(dot(R,sunDir),0.), 1400.)*25.; c+=vec3(1.,0.8,0.55)*glint;
    float foam=smoothstep(0.75,1.25,vCrest+nz(vW.xz*0.8)*0.5)*(1.-smoothstep(150.,600.,dist)); c=mix(c, vec3(0.9,0.78,0.66)*0.7, foam*0.35);
    float fg=1.-exp(-pow(dist*0.0016,1.4)); c=mix(c,fogC,fg);
    gl_FragColor=vec4(c,1.);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }` }));
scene.add(ocean);
// CPU copy of the same waves so the ship rides them
function waveAt(x, z, t) { let y = 0; for (const [a, dir, , L] of WAVES) { const d = [Math.cos(dir), Math.sin(dir)], k = 6.2831 / L, c = Math.sqrt(9.8 / k); y += a * Math.sin(k * (d[0] * x + d[1] * z - c * t)); } return y; }

// ---- ships: Poly Haven "Smugglers Cove" Dutch ships (CC0, real-world metres, waterline at y=0)
const HERO = P.get('ship') || 'dutch_ship_large_01';
console.log('models…'); const shipRoot = new THREE.Group(); const hero = await model('ph:' + HERO); hero.position.y = Number(P.get('sink') ?? -2.4); hero.rotation.y = Math.PI; shipRoot.add(hero); shipRoot.rotation.y = 0.5; scene.add(shipRoot);
// two more ships in the haze, and the pinnace (ship's boat) closer to camera
const far = await Promise.all([['dutch_ship_large_02', -150, -260, 0.9], ['dutch_ship_medium', 170, -380, 1.3], ['dutch_ship_medium', -330, -520, 0.4]].map(async ([id, x, z, ry]) => {
  const s = await model('ph:' + id, { shadows: false }); s.position.set(x, -2, z); s.userData.y0 = -2; s.rotation.y = ry; scene.add(s); return s; }));
const boat = await model('ph:ship_pinnace', { length: 9, ground: false }); boat.position.set(-34, 0, 22); boat.rotation.y = -0.9; scene.add(boat);
{ const b = new THREE.Box3().setFromObject(boat); boat.userData.y0 = -b.min.y - 0.9; }
// ---- spray / sea mist motes
const N = 1500, pos = new Float32Array(N * 3); let sd = 11; const R = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
for (let i = 0; i < N; i++) { pos[i * 3] = (R() - 0.5) * 120; pos[i * 3 + 1] = R() * 10; pos[i * 3 + 2] = (R() - 0.5) * 120; }
const dotC = document.createElement('canvas'); dotC.width = dotC.height = 64; { const g = dotC.getContext('2d'); const rg = g.createRadialGradient(32, 32, 0, 32, 32, 32); rg.addColorStop(0, 'rgba(255,230,200,1)'); rg.addColorStop(1, 'rgba(255,230,200,0)'); g.fillStyle = rg; g.fillRect(0, 0, 64, 64); }
const mist = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(pos, 3)), new THREE.PointsMaterial({ size: 0.08, map: new THREE.CanvasTexture(dotC), transparent: true, opacity: 0.25, depthWrite: false, blending: THREE.AdditiveBlending }));
scene.add(mist);

// ---- post: bloom, then a grade (vignette, warm lift, grain)
const comp = new EffectComposer(r); comp.addPass(new RenderPass(scene, camera)); comp.addPass(new UnrealBloomPass(new THREE.Vector2(W, H), 0.3, 0.5, Number(P.get('bloomth') ?? 1.6)));
const grade = new ShaderPass({ uniforms: { tDiffuse: { value: null }, t: { value: 0 } }, vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader: `#define WARM ${Number(P.get('warm') ?? 1).toFixed(2)}
  uniform sampler2D tDiffuse; uniform float t; varying vec2 vUv; float h(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
  void main(){ vec3 c=texture2D(tDiffuse,vUv).rgb; float lu=dot(c,vec3(.2126,.7152,.0722)); c=mix(c, c*vec3(0.86,1.0,1.08), (1.-smoothstep(0.,.45,lu))*WARM); c=mix(c, c*vec3(1.16,1.0,0.80), smoothstep(.3,1.,lu)*WARM); c=mix(vec3(lu),c,1.+0.15*WARM); vec2 d=vUv-.5; d.x*=.6; c*=1.-.45*smoothstep(.25,.85,length(d)); c+= (h(vUv*1000.+t)-.5)*0.025; gl_FragColor=vec4(c,1.); }` });
comp.addPass(grade); comp.addPass(new OutputPass());

// ---- camera path: skims the swell, flies along the hull, rises past the sails (never stops)
const ez = (x) => x * x * (3 - 2 * x);
function cam(t) { const u = t / 8; // 8 s move
  const a = THREE.MathUtils.lerp(-0.9, 0.55, ez(Math.min(u, 1)) * 0.7 + u * 0.3), rad = THREE.MathUtils.lerp(30, 44, u), y = THREE.MathUtils.lerp(2.2, 13, ez(Math.min(u, 1)));
  const p = new THREE.Vector3(Math.sin(a) * rad, y, Math.cos(a) * rad); const l = new THREE.Vector3(0, THREE.MathUtils.lerp(6, 11, u), 0);
  p.y = Math.max(p.y, waveAt(p.x, p.z, t) + 1.4); return { p, l }; }
window.renderAt = (t) => {
  ocean.material.uniforms.t.value = t; grade.uniforms.t.value = t;
  const hy = waveAt(0, 0, t), hb = waveAt(16, 0, t) - waveAt(-16, 0, t), hs = waveAt(0, 4, t) - waveAt(0, -4, t);
  shipRoot.position.y = hy * 0.8; shipRoot.rotation.z = hb * 0.03; shipRoot.rotation.x = hs * 0.05; shipRoot.position.x = t * 0.9;
  far.forEach((s, i) => { s.position.y = s.userData.y0 + waveAt(s.position.x, s.position.z, t) * 0.5; s.rotation.z = Math.sin(t * 0.7 + i) * 0.015; });
  boat.position.x = -34 + t * 1.4; boat.position.y = boat.userData.y0 + waveAt(boat.position.x, boat.position.z, t); boat.rotation.z = (waveAt(boat.position.x + 2, boat.position.z, t) - waveAt(boat.position.x - 2, boat.position.z, t)) * 0.12;
  mist.position.x = Math.sin(t * 0.2) * 2; mist.position.z = -t * 1.2;
  const { p, l } = cam(t); camera.position.copy(p); camera.lookAt(l.add(new THREE.Vector3(shipRoot.position.x, 0, 0))); ocean.material.uniforms.camPos.value.copy(camera.position);
  key.target.position.set(shipRoot.position.x, 0, 0); key.position.copy(sun).multiplyScalar(300).add(key.target.position);
  comp.render(); return canvas.toDataURL('image/jpeg', 0.93);
};
console.log('models ok'); await settle(); console.log('settled'); r.compile(scene, camera); await document.fonts?.ready; window.ready = true;
