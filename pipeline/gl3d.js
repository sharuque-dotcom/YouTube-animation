// gl3d: ray-marched 3D scenes rendered with WebGL2 into an OffscreenCanvas, then drawn onto the
// 2D frame. Each "scene" is a fragment shader; shared GLSL helpers live in GLSL_COMMON.
// Uniforms every shader gets: R (render size), T (time), RO / TA (camera), FOC (focal), TURN (subject yaw).

export const RW = 960, RH = 540;
let gl = null, canvas = null, vbo = null;
const progs = new Map();
export let glError = '';

const VS = `#version 300 es
in vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }`;

export const GLSL_COMMON = `#version 300 es
precision highp float;
uniform vec2 R; uniform float T; uniform vec3 RO; uniform vec3 TA; uniform float FOC; uniform float TURN;
out vec4 o;
float hash1(float n){ return fract(sin(n)*43758.5453); }
float hash2(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float noise2(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(hash2(i),hash2(i+vec2(1,0)),f.x), mix(hash2(i+vec2(0,1)),hash2(i+vec2(1,1)),f.x), f.y); }
float fbm2(vec2 p){ float a=.5, s=0.; for(int i=0;i<5;i++){ s+=a*noise2(p); p*=2.03; a*=.5; } return s; }
mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }
float sdBox(vec3 p, vec3 b){ vec3 q=abs(p)-b; return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.); }
float sdRBox(vec3 p, vec3 b, float r){ return sdBox(p,b)-r; }
float sdCap(vec3 p, vec3 a, vec3 b, float r){ vec3 pa=p-a, ba=b-a; float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.); return length(pa-ba*h)-r; }
float sdEll(vec3 p, vec3 r){ float k0=length(p/r); float k1=length(p/(r*r)); return k0*(k0-1.)/k1; }
float sdCyl(vec3 p, float h, float r){ vec2 d=abs(vec2(length(p.xz),p.y))-vec2(r,h); return min(max(d.x,d.y),0.)+length(max(d,0.)); }
float smin(float a, float b, float k){ float h=clamp(.5+.5*(b-a)/k,0.,1.); return mix(b,a,h)-k*h*(1.-h); }
vec2 opU(vec2 a, vec2 b){ return a.x<b.x ? a : b; }
// The subject: a faceless man in a black leather jacket, grey hair. Feet at y=0, facing +z.
// materials: 1 leather jacket, 2 skin, 3 hair, 4 trousers, 5 shirt, 6 shoes
vec2 subject(vec3 p){
  p.xz = rot(TURN)*p.xz;
  float br = sin(T*1.7)*.008;
  float legs = min(sdCap(p, vec3(-.11,.08,0), vec3(-.1,.9,0), .092), sdCap(p, vec3(.11,.08,0), vec3(.1,.9,0), .092));
  float hips = sdEll(p-vec3(0,.92,0), vec3(.2,.12,.12));
  float shoes = min(sdEll(p-vec3(-.11,.05,.05), vec3(.07,.05,.13)), sdEll(p-vec3(.11,.05,.05), vec3(.07,.05,.13)));
  // tapered torso from ellipsoids, rounded shoulders, sleeves bent slightly at the elbow
  float chest = sdEll(p-vec3(0,1.3+br,0), vec3(.25,.27,.15));
  float waist = sdEll(p-vec3(0,1.04,0), vec3(.21,.2,.13));
  float shL = length(p-vec3(-.25,1.49+br,-.01))-.1, shR = length(p-vec3(.25,1.49+br,-.01))-.1;
  float upL = sdCap(p, vec3(-.28,1.47,0), vec3(-.36,1.17,.02), .075), upR = sdCap(p, vec3(.28,1.47,0), vec3(.36,1.17,.02), .075);
  float loL = sdCap(p, vec3(-.36,1.17,.02), vec3(-.36,.93,.1), .068), loR = sdCap(p, vec3(.36,1.17,.02), vec3(.36,.93,.1), .068);
  float collar = sdEll(p-vec3(0,1.53,-.01), vec3(.12,.06,.11));
  float jacket = smin(smin(chest, waist, .12), min(min(shL, shR), collar), .07);
  jacket = smin(jacket, min(min(upL, upR), min(loL, loR)), .035);
  float hands = min(sdEll(p-vec3(-.36,.87,.12), vec3(.045,.06,.04)), sdEll(p-vec3(.36,.87,.12), vec3(.045,.06,.04)));
  float shirt = sdEll(p-vec3(0,1.42,.12), vec3(.05,.1,.03));
  float neck = sdCap(p, vec3(0,1.55,0), vec3(0,1.68,0), .055);
  float head = smin(sdEll(p-vec3(0,1.8,.01), vec3(.118,.15,.13)), sdEll(p-vec3(0,1.72,.06), vec3(.08,.06,.07)), .05);
  float hair = sdEll(p-vec3(0,1.865,-.02), vec3(.132,.1,.14));
  vec2 r = vec2(min(legs, hips), 4.);
  r = opU(r, vec2(shoes, 6.));
  r = opU(r, vec2(jacket, 1.));
  r = opU(r, vec2(min(hands, min(neck, head)), 2.));
  r = opU(r, vec2(hair, 3.));
  r = opU(r, vec2(shirt, 5.));
  return r;
}
vec3 subjectAlbedo(float m){
  if(m<1.5) return vec3(.075,.068,.08);
  if(m<2.5) return vec3(.78,.57,.46);
  if(m<3.5) return vec3(.72,.72,.75);
  if(m<4.5) return vec3(.06,.06,.08);
  if(m<5.5) return vec3(.12,.12,.14);
  return vec3(.02);
}
float subjectSpec(float m){ return m<1.5 ? 1. : (m<3.5 ? .25 : .1); }
vec3 camRay(vec2 frag, out vec3 ro){
  vec2 uv=(frag-.5*R)/R.y; ro=RO;
  vec3 f=normalize(TA-RO), r=normalize(cross(vec3(0,1,0),f)), u=cross(f,r);
  return normalize(f*FOC + uv.x*r + uv.y*u);
}
vec3 aces(vec3 x){ return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.); }
`;

function compile(type, src) {
  const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { glError = gl.getShaderInfoLog(s); console.error(glError); }
  return s;
}
export function glInit() {
  if (gl) return true;
  canvas = new OffscreenCanvas(RW, RH);
  gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false });
  if (!gl) { glError = 'WebGL2 unavailable'; return false; }
  vbo = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  return true;
}
const sources = new Map();
/** Register a fragment shader body (appended to GLSL_COMMON) under a name; compiled lazily in the browser */
export function glScene(name, body) { sources.set(name, body); }
function program(name) {
  if (progs.has(name)) return progs.get(name);
  if (!glInit() || !sources.has(name)) return null;
  const p = gl.createProgram();
  gl.attachShader(p, compile(gl.VERTEX_SHADER, VS)); gl.attachShader(p, compile(gl.FRAGMENT_SHADER, GLSL_COMMON + sources.get(name)));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) glError = gl.getProgramInfoLog(p) || glError;
  progs.set(name, p);
  return p;
}
/** Render a scene; returns the OffscreenCanvas (RW x RH) */
export function glRender(name, u) {
  const p = program(name);
  if (!p) return null;
  gl.viewport(0, 0, RW, RH); gl.useProgram(p);
  const loc = gl.getAttribLocation(p, 'p'); gl.bindBuffer(gl.ARRAY_BUFFER, vbo); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = (n) => gl.getUniformLocation(p, n);
  gl.uniform2f(U('R'), RW, RH); gl.uniform1f(U('T'), u.T); gl.uniform3f(U('RO'), ...u.ro); gl.uniform3f(U('TA'), ...u.ta);
  gl.uniform1f(U('FOC'), u.foc ?? 1.6); gl.uniform1f(U('TURN'), u.turn ?? 0);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  return canvas;
}
/** Project a world point with the same camera as the shader → [x, y, depth] in 1920x1080 frame px */
export function project(P, { ro, ta, foc = 1.6 }, W = 1920, H = 1080) {
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const norm = (a) => { const l = Math.hypot(...a); return a.map((v) => v / l); };
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const f = norm(sub(ta, ro)), r = norm(cross([0, 1, 0], f)), u = cross(f, r);
  const d = sub(P, ro), z = dot(d, f);
  return [W / 2 + (foc * dot(d, r) / z) * H, H / 2 - (foc * dot(d, u) / z) * H, z];
}
