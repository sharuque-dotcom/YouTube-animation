// Multiverse jump-cuts (ray-marched 3D): four universes, a googly-eye sticker on the subject's
// jacket as the link, and the eye-push → smear → RGB split → rainbow ring → white burst transition.
import { W, H, clamp, lerp, rand, text } from '../../pipeline/engine.js';
import { buf } from '../../pipeline/scenery.js';
import { glScene, glRender, project, glError } from '../../pipeline/gl3d.js';

const ez = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
const out3 = (p) => 1 - Math.pow(1 - p, 3);

// ---------------------------------------------------------------- shared shading
const MARCH = `
vec3 calcN(vec3 p){ const vec2 k=vec2(1,-1); float e=.0015; return normalize(k.xyy*map(p+k.xyy*e).x + k.yyx*map(p+k.yyx*e).x + k.yxy*map(p+k.yxy*e).x + k.xxx*map(p+k.xxx*e).x); }
vec2 march(vec3 ro, vec3 rd, float tmax){ float t=.01; float m=-1.; for(int i=0;i<140;i++){ vec2 h=map(ro+rd*t); if(h.x<.0008*t){ m=h.y; break; } t+=h.x*.9; if(t>tmax) break; } return vec2(t,m); }
float shadow(vec3 ro, vec3 rd, float tmax){ float res=1., t=.02; for(int i=0;i<28;i++){ float h=map(ro+rd*t).x; res=min(res, 10.*h/t); t+=clamp(h,.02,.25); if(res<.005||t>tmax) break; } return clamp(res,0.,1.); }
float ao(vec3 p, vec3 n){ float o=0., s=1.; for(int i=1;i<=5;i++){ float h=.03*float(i); o+=(h-map(p+n*h).x)*s; s*=.75; } return clamp(1.-3.*o,0.,1.); }
vec3 lightSubject(vec3 p, vec3 n, vec3 rd, float m, vec3 L, vec3 Lc, vec3 rimDir, vec3 rimC, vec3 amb){
  vec3 alb = subjectAlbedo(m); float sp = subjectSpec(m);
  float dif = max(dot(n,L),0.)*shadow(p+n*.01, L, 8.);
  vec3 h = normalize(L-rd); float spec = pow(max(dot(n,h),0.), m<1.5 ? 70. : 24.)*sp;
  float fres = pow(1.-max(dot(n,-rd),0.), 3.);
  float rim = pow(max(dot(n, rimDir),0.), 2.)*fres*2.5;
  float fill = max(dot(n,-rd),0.);
  vec3 c = alb*(Lc*dif + amb*ao(p,n) + Lc*fill*.45) + Lc*spec*(m<1.5 ? 1.2 : .4) + rimC*rim*(m<1.5 ? 1. : .6);
  return c;
}
`;

// ---------------------------------------------------------------- 1. the office: cold green fluorescents, densely dressed
glScene('office', `
vec2 map(vec3 p){
  vec2 r = subject(p);
  r = opU(r, vec2(p.y, 10.));
  r = opU(r, vec2(3.0-p.y, 11.));
  r = opU(r, vec2(p.z+16., 12.));
  r = opU(r, vec2(6.5-abs(p.x), 12.));
  vec3 q = p; q.z += 2.2;
  vec2 cell = vec2(2.4, 2.3);
  q.xz = mod(q.xz + .5*cell, cell) - .5*cell;
  float back = p.z + 1.3;   // dressing only behind the subject
  float desk = max(min(sdBox(q-vec3(0,.74,0), vec3(.9,.025,.42)), sdBox(vec3(abs(q.x)-.84, q.y-.37, q.z), vec3(.025,.37,.38))), back);
  float mon = max(min(sdBox(q-vec3(-.25,1.04,-.22), vec3(.3,.19,.015)), sdBox(q-vec3(.38,1.0,-.2), vec3(.22,.15,.015))), back);
  float stand = max(sdBox(q-vec3(-.25,.86,-.24), vec3(.025,.1,.025)), back);
  float part = max(sdBox(q-vec3(0,.62,-.5), vec3(1.15,.62,.025)), back);
  float chair = max(min(sdRBox(q-vec3(0,.48,.5), vec3(.22,.04,.22), .03), sdRBox(q-vec3(0,.83,.72), vec3(.21,.28,.03), .03)), back);
  float clutter = max(min(sdBox(q-vec3(.65,.79,.15), vec3(.12,.025,.16)), length(q-vec3(-.7,.82,.1))-.05), back);
  r = opU(r, vec2(desk, 13.)); r = opU(r, vec2(mon, 14.)); r = opU(r, vec2(stand, 13.));
  r = opU(r, vec2(part, 15.)); r = opU(r, vec2(chair, 16.)); r = opU(r, vec2(clutter, 18.));
  vec3 c = p; c.xz = mod(c.xz + vec2(1.2,1.15), vec2(2.4,2.3)) - vec2(1.2,1.15);
  r = opU(r, vec2(sdBox(c-vec3(0,2.985,0), vec3(.62,.012,.16)), 17.));
  return r;
}
${MARCH}
void main(){
  vec3 ro; vec3 rd = camRay(gl_FragCoord.xy, ro);
  vec2 h = march(ro, rd, 40.);
  vec3 p = ro+rd*h.x; vec3 col;
  vec3 L = normalize(vec3(.15,1.,.25)); vec3 Lc = vec3(.62,1.,.72)*1.25;
  if(h.y < 0.) col = vec3(.02,.05,.03);
  else {
    vec3 n = calcN(p);
    if(h.y < 9.) col = lightSubject(p, n, rd, h.y, L, Lc, normalize(vec3(-.6,.4,-.7)), vec3(.5,.9,.6), vec3(.05,.1,.07));
    else {
      vec3 alb = vec3(.3,.36,.32); float em = 0.;
      if(h.y < 10.5){ alb = vec3(.16,.2,.18)*(.75+.5*fbm2(p.xz*3.)); }
      else if(h.y < 11.5){ alb = vec3(.55,.6,.56); }
      else if(h.y < 12.5){ alb = vec3(.42,.5,.45); }
      else if(h.y < 13.5){ alb = vec3(.58,.6,.58); }
      else if(h.y < 14.5){ vec2 cid = floor((p.xz+vec2(1.2,1.15))/vec2(2.4,2.3)); float on = step(.25, hash2(cid)); alb = vec3(.02); em = (n.z>.5 ? 1. : 0.)*on; col = vec3(.35,.6,.75)*em*(.7+.3*step(.5,fract(p.y*28.)))*1.3; }
      else if(h.y < 15.5){ alb = vec3(.26,.32,.36)*(.8+.3*noise2(p.xy*20.)); }
      else if(h.y < 16.5){ alb = vec3(.05,.06,.07); }
      else if(h.y < 17.5){ em = 1.; float fl = hash1(floor(T*12.)+floor(p.x*.4)); col = vec3(.8,1.,.85)*2.2*(fl>.97 ? .4 : 1.); }
      else { alb = vec3(.8,.75,.65); }
      if(em < .5){
        float dif = max(dot(n,L),0.)*(.35+.65*shadow(p+n*.01, L, 3.));
        float panelGlow = .5+.5*smoothstep(2.9, 1.0, p.y);
        col = alb*(Lc*dif*panelGlow + vec3(.08,.14,.1)*ao(p,n));
      }
    }
  }
  col = mix(col, vec3(.05,.1,.07), 1.-exp(-.0025*h.x*h.x));
  col = aces(col*1.15); col = mix(col, col*vec3(.86,1.06,.9), .6); col = pow(col, vec3(.95));
  o = vec4(col,1);
}`);

// ---------------------------------------------------------------- 2. the cosmic universe: gravitational-lens halo
glScene('cosmic', `
#define FLOAT (-.95+sin(T*.8)*.05)
vec2 map(vec3 p){
  vec2 r = subject(p - vec3(0., FLOAT, 0.));
  vec3 cp = p - vec3(cos(T*.9)*.95, .1+FLOAT+.9, sin(T*.9)*.95);
  cp.xz = rot(T*1.3)*cp.xz; cp.xy = rot(.4)*cp.xy;
  r = opU(r, vec2(sdRBox(cp, vec3(.16,.025,.16), .01), 20.));
  return r;
}
${MARCH}
vec3 space(vec3 rd){
  vec3 bh = normalize(vec3(.05,.12,-1.));
  float a = acos(clamp(dot(rd,bh),-1.,1.));
  if(a < .075) return vec3(0.);
  vec3 perp = normalize(rd - bh*dot(rd,bh));
  float na = a + .0045/a;
  vec3 rl = normalize(bh*cos(na) + perp*sin(na));
  vec3 c = vec3(0.);
  vec3 sp = rl*240.; vec3 id = floor(sp); float s = hash2(id.xy+id.z*7.13);
  c += vec3(.8,.85,1.)*step(.993, s)*(.4+.6*hash1(s*91.))*1.6;
  float neb = fbm2(rl.xy*3.+rl.z*1.7);
  c += vec3(.25,.08,.4)*pow(neb,3.)*1.2 + vec3(.05,.1,.3)*pow(fbm2(rl.yz*2.3),3.);
  float ang = atan(dot(perp, vec3(0,1,0)), dot(perp, normalize(cross(bh, vec3(0,1,0)))));
  float disk = exp(-pow((a-.2)/.03,2.))*(1.+.6*sin(ang*3.-T*2.));
  c += vec3(1.,.55,.22)*disk*2.2;
  c += vec3(1.,.9,.8)*exp(-pow((a-.083)/.006,2.))*3.;
  c += vec3(.55,.35,1.)*exp(-a*7.)*.5;
  return c;
}
void main(){
  vec3 ro; vec3 rd = camRay(gl_FragCoord.xy, ro);
  vec2 h = march(ro, rd, 20.);
  vec3 col;
  if(h.y < 0.) col = space(rd);
  else {
    vec3 p = ro+rd*h.x, n = calcN(p);
    if(h.y > 19.5){ col = vec3(.02) + vec3(.3,.8,.1)*pow(1.-abs(n.y),4.)*2. + vec3(.2,.6,.1)*step(.9,abs(n.y))*.6; }
    else col = lightSubject(p, n, rd, h.y, normalize(vec3(.6,.3,.9)), vec3(.45,.5,1.)*.8, normalize(vec3(.05,.12,-1.)), vec3(1.,.6,.3)*1.6, vec3(.08,.05,.15));
  }
  col = aces(col*1.1); col = mix(col, col*vec3(1.05,.92,1.12), .5);
  o = vec4(col,1);
}`);

// ---------------------------------------------------------------- 3. the silent landscape at dusk
glScene('land', `
vec2 map(vec3 p){ return opU(subject(p), vec2(p.y, 10.)); }
${MARCH}
vec3 SUN = normalize(vec3(-.75,.11,-1.));
vec3 skyc(vec3 rd){
  float y = max(rd.y, 0.);
  vec3 c = mix(vec3(1.,.62,.48), vec3(.16,.2,.42), pow(y,.45));
  c += vec3(1.,.7,.4)*pow(max(dot(rd,SUN),0.), 40.)*1.5 + vec3(1.,.5,.3)*pow(max(dot(rd,SUN),0.),4.)*.25;
  float az = atan(rd.x, -rd.z);
  float mtn = .028 + .05*fbm2(vec2(az*2.2, 1.)) + .025*fbm2(vec2(az*7., 3.));
  if(rd.y < mtn) c = mix(vec3(.33,.27,.4), c, .35 + .4*smoothstep(0., mtn, rd.y));
  float far = .012 + .02*fbm2(vec2(az*5.5, 9.));
  if(rd.y < far) c = mix(vec3(.24,.2,.3), c, .25);
  return c;
}
void main(){
  vec3 ro; vec3 rd = camRay(gl_FragCoord.xy, ro);
  vec2 h = march(ro, rd, 120.);
  vec3 col;
  if(h.y < 0.) col = skyc(rd);
  else {
    vec3 p = ro+rd*h.x, n = calcN(p);
    if(h.y < 9.) col = lightSubject(p, n, rd, h.y, SUN, vec3(1.,.72,.55)*1.4, SUN, vec3(1.,.7,.5)*1.2, vec3(.22,.24,.4));
    else {
      float crack = smoothstep(.04, .0, abs(fbm2(p.xz*1.3)-.5))*.25;
      vec3 alb = vec3(.86,.8,.82)*(.9+.1*noise2(p.xz*6.)) - crack;
      float sh = shadow(p+vec3(0,.01,0), SUN, 40.);
      col = alb*(vec3(1.,.7,.55)*max(SUN.y,0.)*3.5*sh + vec3(.3,.32,.5));
    }
    col = mix(col, skyc(rd), 1.-exp(-.0006*h.x*h.x));
  }
  col = aces(col*.95); col = mix(col, vec3(dot(col, vec3(.33))), .25); col = col*.92+.05;
  o = vec4(col,1);
}`);

// ---------------------------------------------------------------- 4. candy-pink product shot, pink & cyan rims
glScene('pink', `
vec2 map(vec3 p){
  vec2 r = subject(p - vec3(0,.22,0));
  r = opU(r, vec2(sdCyl(p-vec3(0,.11,0), .11, .75), 11.));
  r = opU(r, vec2(smin(p.y, p.z+4.5, 1.2), 10.));
  return r;
}
${MARCH}
void main(){
  vec3 ro; vec3 rd = camRay(gl_FragCoord.xy, ro);
  vec2 h = march(ro, rd, 30.);
  vec3 col = vec3(1.,.72,.84);
  if(h.y >= 0.){
    vec3 p = ro+rd*h.x, n = calcN(p);
    vec3 key = normalize(vec3(-.7,.6,.8));
    if(h.y < 9.){
      col = lightSubject(p, n, rd, h.y, key, vec3(1.,.75,.88)*1.5, normalize(vec3(.8,.3,-.7)), vec3(.2,.95,1.)*2.2, vec3(.35,.22,.3));
      float rim2 = pow(max(dot(n, normalize(vec3(-.9,.2,-.5))),0.),2.)*pow(1.-max(dot(n,-rd),0.),3.);
      col += vec3(1.,.3,.7)*rim2*2.;
    } else {
      vec3 alb = h.y < 10.5 ? vec3(1.,.66,.8) : vec3(1.,.55,.74);
      float dif = max(dot(n,key),0.)*(.45+.55*shadow(p+n*.01, key, 6.));
      col = alb*(vec3(1.,.85,.92)*dif*1.1 + vec3(.55,.42,.5)*ao(p,n));
      col += vec3(.1,.5,.6)*pow(max(dot(n, normalize(vec3(.8,.3,-.7))),0.),3.)*.25;
    }
  }
  col = aces(col*1.05); col = mix(col, col*vec3(1.04,.97,1.03), .5);
  o = vec4(col,1);
}`);

// ---------------------------------------------------------------- cameras, subject placement
export const CAMS = {
  office: (t) => ({ ro: [0.35 * Math.sin(t * 0.5), 1.45, 3.9 - t * 0.2], ta: [0, 1.15, 0], foc: 1.6, turn: 0.12, off: [0, 0, 0] }),
  cosmic: (t) => { const a = t * 0.22 - 0.4; return { ro: [Math.sin(a) * 3.8, 0.3, Math.cos(a) * 3.8], ta: [0, -0.05, 0], foc: 1.5, turn: 0.15 + t * 0.12, off: [0, -0.95 + Math.sin(t * 0.8) * 0.05, 0] }; },
  land: (t) => ({ ro: [3.4 - t * 0.12, 1.25, 15.5], ta: [0, 1.05, 0], foc: 1.9, turn: 0.25, off: [0, 0, 0] }),
  pink: (t) => ({ ro: [0, 1.55, 3.0 - t * 0.08], ta: [0, 1.4, 0], foc: 1.7, turn: Math.sin(t * 0.9) * 0.55, off: [0, 0.22, 0] }),
};
const STICKER = [0.12, 1.36, 0.16];
function stickerAt(cam) {
  const c = Math.cos(cam.turn), s = Math.sin(cam.turn), [lx, ly, lz] = STICKER;
  const P = [c * lx - s * lz + cam.off[0], ly + cam.off[1], s * lx + c * lz + cam.off[2]];
  const N = [-s, 0, c];
  const toCam = [cam.ro[0] - P[0], cam.ro[1] - P[1], cam.ro[2] - P[2]], l = Math.hypot(...toCam);
  const facing = (N[0] * toCam[0] + N[2] * toCam[2]) / l;
  const [x, y, z] = project(P, cam);
  return { x, y, r: (0.15 / 2) * cam.foc * H / z, vis: clamp((facing - 0.1) * 4) };
}
function chestAt(cam) { const [x, y] = project([cam.off[0], 1.25 + cam.off[1], cam.off[2]], cam); return [x, y]; }

// ---------------------------------------------------------------- googly eye
export function googly(g, x, y, r, t, { seed = 0, alpha = 1 } = {}) {
  if (alpha <= 0.01 || r < 2) return;
  g.save(); g.globalAlpha *= alpha; g.translate(x, y);
  g.shadowColor = 'rgba(0,0,0,0.35)'; g.shadowBlur = r * 0.3; g.shadowOffsetY = r * 0.08;
  const wg = g.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r); wg.addColorStop(0, '#ffffff'); wg.addColorStop(1, '#dcdce4');
  g.fillStyle = wg; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill();
  g.shadowColor = 'transparent';
  g.strokeStyle = '#1a1a22'; g.lineWidth = Math.max(1.5, r * 0.07); g.stroke();
  // pupil: hangs with gravity, jiggles with inertia
  const pr = r * 0.5, ang = Math.PI / 2 + 0.55 * Math.sin(t * 3.3 + seed) + 0.25 * Math.sin(t * 8.1 + seed * 2), d = (r - pr - r * 0.06) * (0.85 + 0.15 * Math.sin(t * 5 + seed));
  g.fillStyle = '#0d0d12'; g.beginPath(); g.arc(Math.cos(ang) * d, Math.sin(ang) * d, pr, 0, Math.PI * 2); g.fill();
  // clear dome glare
  g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = Math.max(1, r * 0.08); g.lineCap = 'round';
  g.beginPath(); g.arc(0, 0, r * 0.78, Math.PI * 1.1, Math.PI * 1.45); g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.arc(-r * 0.42, -r * 0.42, r * 0.09, 0, Math.PI * 2); g.fill();
  g.restore();
}

// ---------------------------------------------------------------- transition: eye push → smear → RGB split → ring → white
const RING = ['#e5322d', '#f7c928', '#1fa39a', '#2a6fc0', '#e0478f'];
function zoomSmear(g, cx, cy, z, smear) {
  const [c, cg] = buf('mvA'); cg.drawImage(g.canvas, 0, 0);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  const n = smear > 0.02 ? 6 : 1;
  for (let j = n - 1; j >= 0; j--) { const zz = z * (1 - j * smear * 0.07); g.globalAlpha = j ? 0.28 : 1; g.setTransform(zz, 0, 0, zz, cx - cx * zz, cy - cy * zz); g.drawImage(c, 0, 0); }
  g.restore();
}
function rgbSplit(g, s) {
  if (s < 0.6) return;
  const [c, cg] = buf('mvB'); cg.drawImage(g.canvas, 0, 0);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'lighter';
  [['#ff0000', -s, -s * 0.3], ['#00ff00', 0, 0], ['#0000ff', s, s * 0.3]].forEach(([col, dx, dy]) => { const [d, dg] = buf('mvC'); dg.drawImage(c, 0, 0); dg.globalCompositeOperation = 'multiply'; dg.fillStyle = col; dg.fillRect(0, 0, W, H); g.drawImage(d, dx, dy); });
  g.restore();
}
export function ring(g, cx, cy, R, t, { alpha = 1 } = {}) {
  if (R < 4 || alpha <= 0) return;
  const th = R * 0.24, rc = R - th / 2, spin = t * 1.4;
  g.save(); g.globalAlpha *= alpha;
  const gl = g.createRadialGradient(cx, cy, rc - th, cx, cy, R + th * 1.2); gl.addColorStop(0, 'rgba(255,255,255,0)'); gl.addColorStop(0.5, 'rgba(255,220,240,0.35)'); gl.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gl; g.beginPath(); g.arc(cx, cy, R + th * 1.2, 0, Math.PI * 2); g.fill();
  const seg = 10, gap = 0.035;
  for (let i = 0; i < seg; i++) {
    const a0 = spin + (i / seg) * Math.PI * 2 + gap, a1 = spin + ((i + 1) / seg) * Math.PI * 2 - gap;
    g.lineCap = 'butt';
    g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = th + 6; g.beginPath(); g.arc(cx, cy, rc, a0, a1); g.stroke();
    g.strokeStyle = RING[i % 5]; g.lineWidth = th; g.beginPath(); g.arc(cx, cy, rc, a0, a1); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = th * 0.18; g.beginPath(); g.arc(cx, cy, rc + th * 0.28, a0 + 0.02, a1 - 0.02); g.stroke();
  }
  // studs: googly eyes and pink beads around the ring
  for (let i = 0; i < 20; i++) {
    const a = spin + (i / 20) * Math.PI * 2 + 0.16, x = cx + Math.cos(a) * rc, y = cy + Math.sin(a) * rc;
    if (i % 2 === 0) googly(g, x, y, th * 0.3, t, { seed: i });
    else { const br = th * 0.16; const bg = g.createRadialGradient(x - br * 0.35, y - br * 0.35, br * 0.1, x, y, br); bg.addColorStop(0, '#ffd6ea'); bg.addColorStop(1, '#ff5fa8'); g.fillStyle = bg; g.beginPath(); g.arc(x, y, br, 0, Math.PI * 2); g.fill(); }
  }
  g.restore();
}
/** p: 0..1 over the transition. eye: sticker position; ctr: subject centre */
export function jump(g, p, t, eye, ctr) {
  // A: push into the eye (0–0.32), B: pull back while the ring blooms round the subject (0.32–0.82), C: burst to white
  let cx, cy, z, smear, split;
  if (p < 0.32) { const k = ez(p / 0.32); cx = eye.x; cy = eye.y; z = 1 + 6 * k; smear = k; split = 26 * k; }
  else { const k = out3(clamp((p - 0.32) / 0.4)); cx = lerp(eye.x, ctr[0], k); cy = lerp(eye.y, ctr[1], k); z = lerp(7, 1.12, k); smear = 1 - k; split = lerp(26, 4, k); }
  zoomSmear(g, cx, cy, z, smear);
  rgbSplit(g, split);
  if (p >= 0.32) {
    const bloom = clamp((p - 0.34) / 0.38), Rr = 0.4 * H * (bloom < 1 ? out3(bloom) * (1 + 0.08 * Math.sin(bloom * Math.PI)) : 1) + (p > 0.82 ? (p - 0.82) * 6000 : 0);
    ring(g, W / 2 + (ctr[0] - W / 2) * 0.15, H / 2 + (ctr[1] - H / 2) * 0.15, Rr, t);
  }
  if (p > 0.8) { const w = clamp((p - 0.8) / 0.2); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); const wg = g.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * (0.2 + w)); wg.addColorStop(0, `rgba(255,255,255,${w})`); wg.addColorStop(1, `rgba(255,255,255,${w * w})`); g.fillStyle = wg; g.fillRect(0, 0, W, H); g.restore(); }
}

// ---------------------------------------------------------------- a universe frame (3D + sticker + its own 2D dressing)
const LABEL = { office: 'UNIVERSE 01 · THE OFFICE', cosmic: 'UNIVERSE 02 · THE CHIP COSMOS', land: 'UNIVERSE 03 · THE QUIET ONE', pink: 'UNIVERSE 04 · THE PRODUCT SHOT' };
export function universe(g, name, t, { subtitle = '' } = {}) {
  const cam = CAMS[name](t);
  const img = glRender(name, { T: t, ro: cam.ro, ta: cam.ta, foc: cam.foc, turn: cam.turn });
  if (img) g.drawImage(img, 0, 0, W, H);
  else { g.fillStyle = '#300'; g.fillRect(0, 0, W, H); text(g, glError.slice(0, 120), 40, 80, { size: 22, color: '#fff' }); }
  const st = stickerAt(cam);
  googly(g, st.x, st.y, Math.max(6, st.r), t, { seed: 3, alpha: st.vis });
  text(g, LABEL[name], 60, 70, { font: "'JetBrains Mono'", weight: 800, size: 20, color: 'rgba(255,255,255,0.75)', spacing: 3 });
  if (subtitle) { g.save(); g.shadowColor = 'rgba(0,0,0,0.8)'; g.shadowBlur = 8; text(g, subtitle, W / 2, H - 90, { font: 'Inter', weight: 600, size: 40, color: '#ffffff', align: 'center' }); g.restore(); }
  return { eye: st, ctr: chestAt(cam) };
}
void rand; void ez;
