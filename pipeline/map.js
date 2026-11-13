// Paper-style world map: land cut from paper on a textured sea, with pins and route arcs.
// Coastlines only: no country borders are drawn (data: Natural Earth via world-atlas, public domain).

import { W, H, clamp, ease, text } from './engine.js';
import { C, paperFill, markerLine } from './collage.js';

let land = null;
export const landRings = (res) => (land ? land[res] : []);
export async function loadLand() {
  if (!land) land = await (await fetch('/pipeline/data/land.json')).json();
}

const merc = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)) * (180 / Math.PI);

/**
 * A map view centred on (lon, lat). `scale` = pixels per degree of longitude.
 * Returns project([lon, lat]) -> [x, y] in screen space (centre of frame = 960, 540).
 */
export function view(lon, lat, scale) {
  const my = merc(lat);
  return ([x, y]) => [W / 2 + (x - lon) * scale, H / 2 - (merc(y) - my) * scale];
}

/** Draw land masses for a view */
export function drawLand(ctx, project, scale, { color = C.paper, sea = C.teal, stroke = 'rgba(31,29,26,0.35)', shadow = true } = {}) {
  ctx.save();
  ctx.setTransform(ctx.getTransform());
  ctx.fillStyle = paperFill(ctx, sea);
  ctx.fillRect(-4000, -4000, 12000, 12000);
  const rings = land[scale > 14 ? '50m' : '110m'];
  const path = new Path2D();
  for (const ring of rings) {
    // skip rings far outside the frame
    const [ax, ay] = project(ring[0]);
    if ((ax < -3000 || ax > 5000 || ay < -3000 || ay > 4000) && ring.length < 400) continue;
    if (ring.every((pt) => pt[1] < -58)) continue; // Antarctica distorts badly in Mercator
    let prev = null;
    ring.forEach((pt) => {
      const [x, y] = project([pt[0], Math.max(-80, pt[1])]);
      // a jump across the date line would draw a stripe across the whole map
      if (!prev || Math.abs(pt[0] - prev[0]) > 180) path.moveTo(x, y);
      else path.lineTo(x, y);
      prev = pt;
    });
    path.closePath();
  }
  // soft paper shadow (an offset dark copy is much faster than shadowBlur)
  if (shadow) {
    ctx.save();
    ctx.translate(5, 8);
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.fill(path);
    ctx.restore();
  }
  ctx.fillStyle = paperFill(ctx, color);
  ctx.fill(path);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.5;
  ctx.stroke(path);
  ctx.restore();
}

/** Map pin with a label on a paper tag */
export function pin(ctx, [x, y], label, p, { color = C.red, side = 1 } = {}) {
  if (p <= 0) return;
  const k = ease.outBack(clamp(p));
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(4, 4, 10, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-22, -30, -20, -56, 0, -58);
  ctx.bezierCurveTo(20, -56, 22, -30, 0, 0);
  ctx.fill();
  ctx.fillStyle = C.white;
  ctx.beginPath(); ctx.arc(0, -38, 8, 0, Math.PI * 2); ctx.fill();
  if (label) {
    ctx.font = '700 34px Oswald';
    ctx.letterSpacing = '3px';
    const w = ctx.measureText(label).width + 36;
    const lx = side > 0 ? 26 : -26 - w;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(lx + 4, -70 + 5, w, 52);
    ctx.fillStyle = paperFill(ctx, C.white);
    ctx.fillRect(lx, -70, w, 52);
    text(ctx, label, lx + 18, -32, { font: 'Oswald', weight: 700, size: 34, color: C.ink, spacing: 3 });
  }
  ctx.restore();
}

/** Dashed flight-style arc between two screen points */
export function route(ctx, a, b, p, { color = C.red, width = 6, lift = 0.25 } = {}) {
  if (p <= 0) return;
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 - Math.hypot(b[0] - a[0], b[1] - a[1]) * lift;
  const pts = [];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    pts.push([(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * mx + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * my + t * t * b[1]]);
  }
  ctx.save();
  ctx.setLineDash([18, 14]);
  markerLine(ctx, pts, ease.inOut(clamp(p)), { color, width });
  ctx.restore();
  const end = pts[Math.floor(clamp(p) * 60)];
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(end[0], end[1], width * 1.4, 0, Math.PI * 2); ctx.fill();
}
