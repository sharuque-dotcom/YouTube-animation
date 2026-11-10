// Animation engine: draws any moment of an episode onto a 1920x1080 canvas.
// Every frame is a pure function of time, so rendering is exact and repeatable.

export const W = 1920;
export const H = 1080;
const CROSSFADE = 0.5; // seconds of overlap between scenes

export const palette = {
  bg: '#0b0b0d',
  paper: '#e8dfcc',
  ink: '#1d1a16',
  cream: '#efe6d2',
  red: '#d23a2c',
  gold: '#c9a24a',
  dim: '#6b6458',
};

// ---------- math helpers ----------
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, p) => a + (b - a) * p;
/** 0..1 progress of t between a and b */
export const prog = (t, a, b) => clamp((t - a) / (b - a));
export const ease = {
  out: (p) => 1 - Math.pow(1 - p, 3),
  in: (p) => p * p * p,
  inOut: (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
  outBack: (p) => 1 + 2.7 * Math.pow(p - 1, 3) + 1.7 * Math.pow(p - 1, 2),
  outExpo: (p) => (p === 1 ? 1 : 1 - Math.pow(2, -10 * p)),
};
/** Seeded random generator, so "random" details look the same every render */
export function rand(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- drawing helpers ----------
export function text(ctx, str, x, y, o = {}) {
  ctx.save();
  ctx.font = `${o.style || ''} ${o.weight || 400} ${o.size || 48}px ${o.font || 'Inter'}`;
  ctx.fillStyle = o.color || palette.cream;
  ctx.globalAlpha *= o.alpha ?? 1;
  ctx.textAlign = o.align || 'left';
  ctx.textBaseline = o.baseline || 'alphabetic';
  if (o.spacing) ctx.letterSpacing = `${o.spacing}px`;
  if (o.shadow) {
    ctx.shadowColor = o.shadow;
    ctx.shadowBlur = o.shadowBlur ?? 30;
  }
  ctx.fillText(str, x, y);
  ctx.restore();
}

/** Characters of str revealed at progress p (typewriter effect) */
export const typed = (str, p) => str.slice(0, Math.floor(str.length * clamp(p)));

let grainTile;
function grain(ctx, frame, amount = 0.03) {
  if (!grainTile) {
    grainTile = new OffscreenCanvas(256, 256);
    const g = grainTile.getContext('2d');
    const img = g.createImageData(256, 256);
    const r = rand(7);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = r() * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  }
  const r = rand(Math.floor(frame / 2) * 31 + 1); // new grain every 2nd frame keeps files small
  ctx.save();
  ctx.globalAlpha = amount;
  ctx.fillStyle = ctx.createPattern(grainTile, 'repeat');
  ctx.translate(-r() * 256, -r() * 256);
  ctx.fillRect(0, 0, W + 256, H + 256);
  ctx.restore();
}

function vignette(ctx) {
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.95);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.6)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

// ---------- timeline playback ----------
export class Player {
  constructor(canvas, timeline, scenes, look) {
    this.ctx = canvas.getContext('2d');
    this.look = look || null; // e.g. { cinema: true } for the documentary finish
    this.post = new OffscreenCanvas(W, H);
    this.glow = new OffscreenCanvas(W / 4, H / 4);
    this.timeline = timeline;
    this.scenes = scenes;
    this.layers = [new OffscreenCanvas(W, H), new OffscreenCanvas(W, H)];
    const missing = timeline.scenes.filter((s) => !scenes[s.id]).map((s) => s.id);
    if (missing.length) console.warn(`No drawing yet for scenes: ${missing.join(', ')}`);
  }

  drawScene(target, sc, t, frame) {
    const ctx = target.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, W, H);
    const s = {
      id: sc.id,
      start: sc.start, // scene start in the episode, for things that continue across scenes
      T: sc.start + t, // episode time (not clamped), for continuous pieces spanning scenes
      t: Math.max(0, t),
      d: sc.duration,
      frame,
      // when narration line i starts / ends (seconds into this scene)
      cue: (i) => sc.cues[i]?.start ?? 0,
      cueEnd: (i) => sc.cues[i]?.end ?? sc.duration,
      line: (i) => sc.cues[i]?.text ?? '',
    };
    ctx.save();
    if (this.scenes[sc.id]) this.scenes[sc.id](ctx, s);
    else text(ctx, `[ ${sc.id} ]`, W / 2, H / 2, { size: 60, align: 'center', color: palette.dim });
    ctx.restore();
  }

  render(time, frame) {
    const { ctx, timeline } = this;
    const list = timeline.scenes;
    let i = list.findIndex((s) => time < s.start + s.duration);
    if (i < 0) i = list.length - 1;
    const sc = list[i];
    const next = list[i + 1];
    const prev = list[i - 1];

    ctx.globalAlpha = 1;
    this.drawScene(this.layers[0], sc, time - sc.start, frame);
    ctx.drawImage(this.layers[0], 0, 0);

    // Crossfade around scene boundaries
    const toEnd = sc.start + sc.duration - time;
    const fromStart = time - sc.start;
    let other, alpha;
    if (next && toEnd < CROSSFADE / 2) {
      other = next;
      alpha = 0.5 - toEnd / CROSSFADE;
    } else if (prev && fromStart < CROSSFADE / 2) {
      other = prev;
      alpha = 0.5 - fromStart / CROSSFADE;
    }
    if (other) {
      this.drawScene(this.layers[1], other, time - other.start, frame);
      ctx.globalAlpha = ease.inOut(clamp(alpha));
      ctx.drawImage(this.layers[1], 0, 0);
      ctx.globalAlpha = 1;
    }

    if (this.look?.finish) this.look.finish(ctx, frame); // an episode's own print/paper finish
    else if (this.look?.cinema) this.cinema(frame);
    else if (this.look?.light) grain(ctx, frame, 0.018); // light mode: no dark vignette, barely-there grain
    else {
      vignette(ctx);
      grain(ctx, frame);
    }
  }

  /** Documentary finish: grade, halation, vignette, gate weave, fine grain, 2.39:1 bars */
  cinema(frame) {
    const { ctx, post, glow } = this;
    const L = this.look;
    const p = post.getContext('2d');
    p.filter = `contrast(${L.contrast ?? 1.14}) saturate(${L.saturate ?? 0.78}) brightness(${L.brightness ?? 0.94})`;
    p.drawImage(ctx.canvas, 0, 0);
    p.filter = 'none';
    // split tone: teal shadows, warm highlights
    p.globalCompositeOperation = 'soft-light';
    const tone = p.createLinearGradient(0, 0, W, H);
    tone.addColorStop(0, 'rgba(20,70,90,0.55)');
    tone.addColorStop(1, 'rgba(30,80,95,0.45)');
    p.fillStyle = tone;
    p.fillRect(0, 0, W, H);
    p.globalCompositeOperation = 'overlay';
    p.fillStyle = 'rgba(255,170,90,0.07)';
    p.fillRect(0, 0, W, H);
    // halation: bright areas bleed a soft warm glow
    const gl = glow.getContext('2d');
    gl.filter = 'brightness(0.9) contrast(2.2) blur(6px)';
    gl.drawImage(post, 0, 0, W / 4, H / 4);
    gl.filter = 'none';
    p.globalCompositeOperation = 'screen';
    p.globalAlpha = 0.22;
    p.drawImage(glow, 0, 0, W, H);
    p.globalAlpha = 1;
    p.globalCompositeOperation = 'source-over';
    // gate weave: the frame drifts a fraction of a pixel, like film in a projector
    const r = rand(frame * 7 + 3);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    ctx.drawImage(post, (r() - 0.5) * 1.2, (r() - 0.5) * 1.2);
    // heavy vignette
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 1.0);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.75)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    grain(ctx, frame * 2, 0.055);
    // 2.39:1 letterbox
    const bar = Math.round((H - W / 2.39) / 2);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, bar);
    ctx.fillRect(0, H - bar, W, bar);
  }
}
