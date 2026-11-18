// Travancore what-if Short, pixel diorama version (shares narration and voice with ml-travancore).
import { W, H, clamp, lerp, text } from '../../pipeline/engine.js';
import { loadLand } from '../../pipeline/map.js';
import { glow } from '../../pipeline/scenery.js';
import { ez, out3, span, spring } from '../../pipeline/scenekit.js';
import { compose, pixelStreet } from '../ml-travancore/pixel.js';
import { mapArt, itemsArt, beachArt, hallArt, harbourArt, futuresArt, finaleArt } from '../ml-travancore/pixelsets.js';

const ML = "'Noto Malayalam'", GOLD = '#e8c06a', PAPER = '#f6efe0';
export async function preload() { await loadLand(); }

// UI per the guide: one metal (gold) + paper white over a dark translucent plate
function plate(g, t, a, top, big, x = W / 2, y = 300) {
  const p = spring(t, a, 1.8, 0.7); if (p <= 0.01) return;
  g.save(); g.translate(x, y); g.scale(Math.min(1, p), Math.min(1, p)); g.globalAlpha = Math.min(1, p);
  g.fillStyle = 'rgba(16,10,22,0.78)'; g.beginPath(); g.roundRect(-200, -110, 400, 220, 10); g.fill();
  g.strokeStyle = GOLD; g.lineWidth = 3; g.strokeRect(-188, -98, 376, 196); [[-188, -98], [188, -98], [188, 98], [-188, 98]].forEach(([cx, cy]) => { g.fillStyle = GOLD; g.fillRect(cx - 6, cy - 6, 12, 12); });
  const lat = /^[\x00-\x7F]*$/.test(top); text(g, top, 0, -48, { font: lat ? "'Cormorant Garamond'" : ML, weight: 600, size: 36, color: GOLD, align: 'center', spacing: lat ? 10 : 0 });
  g.font = "600 110px 'Cormorant Garamond'"; const bs = Math.min(110, 110 * 330 / g.measureText(big).width); text(g, big, 0, 30 + bs * 0.3, { font: "'Cormorant Garamond'", weight: 600, size: bs, color: PAPER, align: 'center' });
  g.restore();
}
function captions(g, s) {
  const t = s.t; let li = -1; for (let i = 0; s.line(i); i++) if (t >= s.cue(i) - 0.35 && t < s.cueEnd(i) + 0.1) li = i; if (li < 0) return;
  const words = s.line(li).split(/\s+/), a = s.cue(li), b = s.cueEnd(li), tot = words.reduce((x, w) => x + w.length + 1.5, 0); let acc = 0; const ws = words.map((w) => { const t0 = a + (acc / tot) * (b - a); acc += w.length + 1.5; return [w, t0]; });
  const chunks = []; for (let i = 0; i < ws.length; i += 3) chunks.push(ws.slice(i, i + 3)); let k = 0; while (k + 1 < chunks.length && t >= chunks[k + 1][0][1]) k++;
  const str = chunks[k].map(([w]) => w).join(' ');
  const bg = g.createLinearGradient(0, 1420, 0, 1700); bg.addColorStop(0, 'rgba(16,10,22,0)'); bg.addColorStop(0.4, 'rgba(16,10,22,0.7)'); bg.addColorStop(1, 'rgba(16,10,22,0)'); g.fillStyle = bg; g.fillRect(0, 1420, W, 280);
  g.save(); g.font = `600 64px ${ML}`; const sz = Math.min(64, 64 * 960 / (g.measureText(str).width + 1));
  text(g, str, W / 2, 1575, { font: ML, weight: 600, size: sz, color: PAPER, align: 'center' }); g.restore();
}
/** smooth camera move expressed as compose() params: a slow push from z0 to z1 toward a focus point */
const push = (tt, z0, z1, dur, focus, to = [W / 2, H / 2]) => ({ camZ: lerp(z0, z1, ez(clamp(tt / dur))), focus, to });

function main(g, s) {
  const t = s.t, L = (i) => s.cue(i), cuts = [1, 2, 3, 4, 5, 6, 7, 8].map(L);
  let i = 0; while (i < cuts.length && t >= cuts[i] - 0.02) i++; const tt = i ? t - cuts[i - 1] : t;
  [
    () => { compose(g, t, (c, ti) => mapArt(c, ti, { glow: ez(span(t, 0.3, 1)), conchY: Math.round(lerp(120, 210, out3(span(t, 0.2, 0.5)))) }), { ...push(tt, 1.35, 1.0, 5, [W / 2, 900]), band: [0.2, 0.8], rainA: 0, fogA: 0.15, blur: 8 }); },
    () => { pixelStreet(g, t, push(tt, 2.4, 2.0, 6, [500, 1150], [540, 980])); plate(g, t, L(1) + 0.2, 'JUNE 1947', '18', W / 2, 300); },
    () => { compose(g, t, (c, ti) => itemsArt(c, ti, { a: L(2), now: t }), { ...push(tt, 1.2, 1.1, 6, [540, 930]), band: [0.3, 0.7], rainA: 0, fog: '90,40,70', fogA: 0.2 }); },
    () => { compose(g, t, beachArt, { ...push(tt, 1.25, 1.5, 6, [520, 1300]), band: [0.45, 0.8], rainA: 0, fog: '255,170,140', fogA: 0.2, warm: '255,180,120' }); const a = ez(span(t, L(3) + 0.8, 0.6)); if (a > 0) { g.save(); g.globalAlpha = a; g.translate(540, 520); glow(g, 0, 0, 240, '140,220,255', 0.45); g.strokeStyle = 'rgba(180,235,255,0.9)'; g.lineWidth = 4; for (let k = 0; k < 3; k++) { g.save(); g.rotate(k * Math.PI / 3 + t * 0.3); g.beginPath(); g.ellipse(0, 0, 150, 52, 0, 0, Math.PI * 2); g.stroke(); g.restore(); } text(g, 'Th', 0, 14, { font: 'Jakarta', weight: 800, size: 42, color: '#d8f6ff', align: 'center' }); g.restore(); } },
    () => { compose(g, t, hallArt, { ...push(tt, 1.3, 1.6, 8, [540, 1050]), band: [0.42, 0.7], fog: '110,110,170', fogA: 0.5 }); plate(g, t, L(4) + 0.2, 'JULY 1947', '25', W / 2, 300);
      const fa = L(4) + (s.cueEnd(4) - L(4)) * 0.75, f = t < fa - 0.27 || t > fa + 0.33 ? 0 : t < fa ? ez((t - fa + 0.27) / 0.27) : 1 - ez((t - fa) / 0.33); if (f > 0) { g.fillStyle = `rgba(230,240,255,${0.45 * f})`; g.fillRect(0, 0, W, H); } },
    () => { compose(g, t, (c, ti) => mapArt(c, ti, { glow: 1 - ez(span(t, L(5) + 0.6, 1.6)) }), { ...push(tt, 1.0, 1.15, 5, [W / 2, 1000]), band: [0.2, 0.8], rainA: 0, fogA: 0.15, blur: 8 }); const p = span(t, L(5) + 1.4, 0.5); if (p > 0) { g.fillStyle = `rgba(16,10,22,${0.8 * p})`; g.beginPath(); g.roundRect(W / 2 - 400, 1295, 800, 100, 12); g.fill(); } if (p > 0) text(g, 'JULY 1947 · JOINS INDIA', W / 2, 1362, { font: "'Cormorant Garamond'", weight: 600, size: 54, color: PAPER, align: 'center', alpha: p, spacing: 6 }); },
    () => { compose(g, t, harbourArt, { ...push(tt, 1.3, 1.05, 3, [480, 1150]), band: [0.35, 0.75], rainA: 0, fog: '255,200,170', fogA: 0.25, warm: '255,210,160' }); const y = Math.round(lerp(1947, 2026, ez(span(t, L(6) + 0.1, 2.2)))); text(g, String(y), W / 2, 420, { font: "'Cormorant Garamond'", weight: 600, size: 190, color: PAPER, align: 'center' }); },
    () => { compose(g, t, harbourArt, { ...push(tt, 1.05, 1.3, 8, [500, 1230]), band: [0.4, 0.75], rainA: 0, fog: '255,200,170', fogA: 0.25, warm: '255,210,160' }); plate(g, t, L(7) + 0.2, 'TRAVANCORE', 'PASSPORT', W / 2, 330); },
    () => { compose(g, t, futuresArt, { ...push(tt, 1.0, 1.05, 6, [W / 2, H / 2]), band: [0.1, 0.9], rainA: 0.5, fogA: 0.2, blur: 4 }); [[t > L(8) + 0.1, 'സിംഗപ്പൂർ?', 420, '#7dffb0'], [t > L(8) + 2.3, 'അതോ…?', 1380, '#ffb3be']].forEach(([on, str, y, col]) => { if (on) { g.fillStyle = 'rgba(16,10,22,0.8)'; g.beginPath(); g.roundRect(W / 2 - 230, y - 70, 460, 120, 12); g.fill(); g.strokeStyle = GOLD; g.lineWidth = 3; g.stroke(); text(g, str, W / 2, y + 12, { font: ML, weight: 800, size: 64, color: col, align: 'center' }); } }); },
  ][Math.min(i, 8)]();
  // short fade through dark at each cut (about 8 frames down, 10 up)
  const f = Math.max(0, ...cuts.map((c) => (t < c - 0.27 || t > c + 0.33 ? 0 : t < c ? ez((t - c + 0.27) / 0.27) : 1 - ez((t - c) / 0.33))));
  if (f > 0) { g.fillStyle = `rgba(16,10,22,${0.85 * f})`; g.fillRect(0, 0, W, H); }
  captions(g, s);
}
function end(g, s) {
  const t = s.t; compose(g, t, finaleArt, { ...push(t, 1.4, 1.1, 5, [540, 900]), band: [0.2, 0.6], rainA: 0, fog: '255,180,140', fogA: 0.2, warm: '255,200,140' });
  plate(g, t, 0.2, 'ഭാഗം', '2', W / 2, 1180);
  const tap = 1.2, pr = t > tap + 0.4 && t < tap + 0.6 ? 0.92 : 1, p = spring(t, tap, 1.8, 0.6);
  if (p > 0.01) { g.save(); g.translate(W / 2, 1380); g.scale(Math.min(1, p) * pr, Math.min(1, p) * pr); g.fillStyle = t > tap + 0.55 ? '#3a3350' : '#ff2f45'; g.beginPath(); g.roundRect(-240, -64, 480, 128, 64); g.fill(); text(g, t > tap + 0.55 ? 'FOLLOWING ✓' : 'FOLLOW', 0, 18, { font: 'Jakarta', weight: 800, size: 52, color: '#fff', align: 'center' }); g.restore(); }
  captions(g, s);
}
export const scenes = { main, end };
export const hits = [];
export const extraHits = (timeline) => {
  const m = timeline.scenes.find((x) => x.id === 'main'), e = timeline.scenes.find((x) => x.id === 'end'), out = [];
  m.cues.forEach((c, i) => { if (i) out.push({ t: m.start + c.start - 0.25, kind: 'whoosh', vol: 0.25 }); });
  [0, 0.5, 1.0].forEach((d) => out.push({ t: m.start + m.cues[2].start + d + 0.35, kind: 'pop', vol: 0.5 }));
  out.push({ t: m.start + m.cues[4].start + (m.cues[4].end - m.cues[4].start) * 0.75, kind: 'hit', vol: 0.7 }, { t: e.start + 1.6, kind: 'pop', vol: 0.6 });
  return out;
};
void out3;
