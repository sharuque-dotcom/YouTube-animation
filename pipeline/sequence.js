// Beat sequencer with designed transitions (light-mode productions).
//
//   const draw = sequence([
//     { at: 0,      draw: dateBeat },
//     { at: b.fly,  draw: mapBeat,   in: { type: 'iris', focus: [960, 700] } },
//     { at: b.card, draw: cardBeat,  in: { type: 'zoom', focus: [1400, 450] } },
//   ], background);
//
// Each beat draws onto its own transparent layer; during a transition two layers are composited.
// Beat draw(ctx, x): x = { T, a, b, t (seconds into beat), p (0..1 through beat) }.
// Transition types: blend, zoom (into focus), zoomOut, iris (circle from focus), whip (dir), wipe, push (up), cut.

import { W, H, clamp, lerp } from './engine.js';
import { ez } from './motion.js';

let layers = null;
const getLayers = () => (layers ||= [new OffscreenCanvas(W, H), new OffscreenCanvas(W, H), new OffscreenCanvas(W, H)]);

function drawBeat(beat, T, i, beats, layer) {
  const g = layer.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1;
  g.filter = 'none';
  g.clearRect(0, 0, W, H);
  const a = beat.at, b = beats[i + 1]?.at ?? beat.end ?? a + 5;
  g.save();
  beat.draw(g, { T, a, b, t: T - a, p: clamp((T - a) / (b - a)) });
  g.restore();
  return layer;
}

/** Draw a layer with scale around a focus point, blur and alpha */
function put(ctx, layer, { scale = 1, focus = [W / 2, H / 2], blur = 0, alpha = 1, dx = 0, dy = 0 } = {}) {
  if (alpha <= 0.002) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  if (blur > 0.3) ctx.filter = `blur(${blur}px)`;
  ctx.translate(focus[0] + dx, focus[1] + dy);
  ctx.scale(scale, scale);
  ctx.translate(-focus[0], -focus[1]);
  ctx.drawImage(layer, 0, 0);
  ctx.restore();
}

export function sequence(beats, background) {
  return (ctx, T) => {
    const [L0, L1, L2] = getLayers();
    if (background) background(ctx, T);
    let k = beats.findIndex((bt, i) => T < (beats[i + 1]?.at ?? Infinity));
    if (k < 0) k = beats.length - 1;
    // are we inside the transition into beat k, or into beat k+1?
    const trans = (j) => {
      const tr = beats[j]?.in;
      if (!tr || tr.type === 'cut' || j === 0) return null;
      const d = tr.dur ?? 0.7;
      const start = beats[j].at - d * (tr.lead ?? 0.5);
      return T >= start && T < start + d ? { j, tr, p: (T - start) / d } : null;
    };
    const tw = trans(k) || trans(k + 1);
    if (!tw) {
      ctx.drawImage(drawBeat(beats[k], T, k, beats, L0), 0, 0);
      return;
    }
    const { j, tr, p } = tw;
    const out = drawBeat(beats[j - 1], T, j - 1, beats, L0);
    const inn = drawBeat(beats[j], T, j, beats, L1);
    const f = tr.focus || [W / 2, H / 2];
    const eo = ez.p3In(clamp(p * 1.25)), ei = ez.expoOut(clamp((p - 0.2) / 0.8));
    switch (tr.type) {
      case 'zoom': // dive into the focus point; the next beat settles from slightly large
        put(ctx, out, { scale: lerp(1, tr.depth ?? 5, eo), focus: f, blur: eo * 22, alpha: 1 - clamp((p - 0.45) / 0.3) });
        put(ctx, inn, { scale: lerp(1.35, 1, ei), blur: (1 - ei) * 16, alpha: clamp((p - 0.3) / 0.35) });
        break;
      case 'zoomOut': // pull back: the old beat shrinks away, the new one arrives from very large
        put(ctx, out, { scale: lerp(1, 0.75, eo), focus: f, blur: eo * 14, alpha: 1 - clamp((p - 0.2) / 0.5) });
        put(ctx, inn, { scale: lerp(tr.depth ?? 4, 1, ei), focus: tr.to || f, blur: (1 - ei) * 18, alpha: clamp((p - 0.15) / 0.35) });
        break;
      case 'iris': { // a coloured circle grows from the focus, then opens onto the next beat
        put(ctx, out, { scale: lerp(1, 1.08, eo), focus: f });
        const diag = Math.hypot(W, H);
        const r1 = ez.p3In(clamp(p / 0.55)) * diag, r2 = ez.expoOut(clamp((p - 0.35) / 0.65)) * diag;
        ctx.save();
        ctx.fillStyle = tr.color || '#4a2a8c';
        ctx.beginPath(); ctx.arc(f[0], f[1], r1, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(f[0], f[1], r2, 0, Math.PI * 2); ctx.clip();
        put(ctx, inn, { scale: lerp(1.15, 1, ei), focus: f });
        ctx.restore();
        break;
      }
      case 'whip': { // fast smear sideways (dir -1 = left)
        const dir = tr.dir ?? -1;
        if (p < 0.5) put(ctx, out, { dx: dir * ez.p3In(p * 2) * W * 0.7, blur: ez.p3In(p * 2) * 40 });
        else put(ctx, inn, { dx: -dir * (1 - ez.expoOut((p - 0.5) * 2)) * W * 0.7, blur: (1 - ez.expoOut((p - 0.5) * 2)) * 40 });
        break;
      }
      case 'push': { // the new beat pushes the old one up and out
        const e = ez.p2InOut(p);
        put(ctx, out, { dy: -e * H, blur: Math.sin(e * Math.PI) * 10 });
        put(ctx, inn, { dy: (1 - e) * H, blur: Math.sin(e * Math.PI) * 10 });
        break;
      }
      case 'wipe': { // soft diagonal wipe with a coloured leading edge
        ctx.drawImage(out, 0, 0);
        const g = L2.getContext('2d');
        g.globalCompositeOperation = 'source-over';
        g.clearRect(0, 0, W, H);
        g.drawImage(inn, 0, 0);
        g.globalCompositeOperation = 'destination-in';
        const e = ez.p2InOut(p), edge = lerp(-0.3, 1.3, e) * (W + H);
        const grad = g.createLinearGradient(0, 0, W, H);
        const pos = clamp(edge / (W + H));
        grad.addColorStop(0, 'rgba(0,0,0,1)');
        grad.addColorStop(clamp(pos - 0.06), 'rgba(0,0,0,1)');
        grad.addColorStop(clamp(pos + 0.02), 'rgba(0,0,0,0)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = grad;
        g.fillRect(0, 0, W, H);
        ctx.drawImage(L2, 0, 0);
        // leading edge glow
        ctx.save();
        ctx.globalAlpha = Math.sin(p * Math.PI) * 0.5;
        const eg = ctx.createLinearGradient(0, 0, W, H);
        eg.addColorStop(clamp(pos - 0.05), 'rgba(0,0,0,0)');
        eg.addColorStop(clamp(pos - 0.01), tr.color || 'rgba(226,65,46,0.9)');
        eg.addColorStop(clamp(pos + 0.02), 'rgba(0,0,0,0)');
        ctx.fillStyle = eg;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
        break;
      }
      default: { // blend: dissolve with soft blur and a breath of scale
        put(ctx, out, { scale: lerp(1, 1.05, p), blur: p * 10, alpha: 1 - ez.p2InOut(p) });
        put(ctx, inn, { scale: lerp(0.97, 1, ei), blur: (1 - p) * 10, alpha: ez.p2InOut(p) });
      }
    }
  };
}

/** Every beat keeps moving: a slow push (and drift) applied to the beat's context */
export function push(ctx, x, { from = 1, to = 1.07, focus = [W / 2, H / 2], drift = [0, 0] } = {}) {
  const e = ez.p2InOut(x.p);
  const s = lerp(from, to, e);
  ctx.translate(focus[0] + drift[0] * e, focus[1] + drift[1] * e);
  ctx.scale(s, s);
  ctx.translate(-focus[0], -focus[1]);
}
