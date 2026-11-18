// Travancore what-if Short, 3D pixel-diorama version (px3d kit). Shares narration/voice with ml-travancore.
import { W, H, clamp, lerp, text } from '../../pipeline/engine.js';
import { ez, span, spring } from '../../pipeline/scenekit.js';

const ML = "'Noto Malayalam'", GOLD = '#e8c06a', PAPER = '#f6efe0';
let S = null, stage = null, camera = null, THREE = null;
export async function preload() {
  const { loadLand } = await import('../../pipeline/map.js'); await loadLand();
  const kit = await import('../../pipeline/px3d.js'); THREE = kit.THREE;
  const sets = await import('./sets3d.js');
  S = { desk: sets.deskSet(), night: sets.laneSet({ night: true }), items: sets.itemsSet(), beach: sets.beachSet(), hall: sets.hallSet(), harbour: sets.harbourSet(), grey: sets.harbourSet({ grey: true }), finale: sets.finaleSet() };
  stage = kit.makeStage(W, H); camera = new THREE.PerspectiveCamera(58, W / H, 0.05, 600);
}
function shot(g, set, t, tt, camOpts = {}, updOpts = {}, post = {}) {
  set.update(t, updOpts); const fp = set.cam(tt, camera, camOpts); camera.updateMatrixWorld();
  const focus = camera.position.distanceTo(fp), pr = fp.clone().project(camera), band = clamp((pr.y + 1) / 2, 0.2, 0.8);
  const night = set === S.night || set === S.hall; stage.bloom.strength = night ? 0.55 : 0.3; stage.bloom.threshold = night ? 0.85 : 0.92; stage.renderer.toneMappingExposure = night ? 1.35 : 1.05;
  stage.grade.uniforms.vignette.value = night ? 0.6 : 0.35; stage.grade.uniforms.warm.value = 0.12; stage.grade.uniforms.sat.value = night ? 1.05 : 1.12;
  const cv = stage.render(set.scene, camera, { focus, aperture: post.aperture ?? 70, tilt: post.tilt ?? 8, band, half: 0.13, feather: 0.35 });
  g.drawImage(cv, 0, 0, W, H);
}
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
function main(g, s) {
  const t = s.t, L = (i) => s.cue(i), cuts = [1, 2, 3, 4, 5, 6, 7, 8].map(L);
  let i = 0; while (i < cuts.length && t >= cuts[i] - 0.02) i++; const tt = i ? t - cuts[i - 1] : t;
  [
    () => shot(g, S.desk, t, tt, { dur: 6 }, { glow: ez(span(t, 0.3, 1)), conchY: Math.round(lerp(120, 210, ez(span(t, 0.2, 0.5)))) }, { aperture: 40, tilt: 6 }),
    () => { shot(g, S.night, t, tt, { from: [-9, 12, 21], to: [-3.5, 5.8, 11.5], dur: 7 }); plate(g, t, L(1) + 0.2, 'JUNE 1947', '18'); },
    () => shot(g, S.items, t, tt, { dur: 6 }, { a: L(2), now: t }, { aperture: 40, tilt: 5 }),
    () => { shot(g, S.beach, t, tt, { dur: 7 }); const a = ez(span(t, L(3) + 0.8, 0.6)); if (a > 0) { g.save(); g.globalAlpha = a; g.translate(540, 520); g.strokeStyle = 'rgba(200,240,255,0.9)'; g.lineWidth = 4; g.shadowColor = '#bff0ff'; g.shadowBlur = 30; for (let k = 0; k < 3; k++) { g.save(); g.rotate(k * Math.PI / 3 + t * 0.3); g.beginPath(); g.ellipse(0, 0, 150, 52, 0, 0, Math.PI * 2); g.stroke(); g.restore(); } text(g, 'Th', 0, 14, { font: 'Jakarta', weight: 800, size: 42, color: '#e8fbff', align: 'center' }); g.restore(); } },
    () => { const fa = L(4) + (s.cueEnd(4) - L(4)) * 0.75, f = t < fa - 0.27 || t > fa + 0.33 ? 0 : t < fa ? ez((t - fa + 0.27) / 0.27) : 1 - ez((t - fa) / 0.33);
      shot(g, S.hall, t, tt, { dur: 9 }, { flash: f }); plate(g, t, L(4) + 0.2, 'JULY 1947', '25'); },
    () => { shot(g, S.desk, t, tt, { from: [0.1, 3.6, 2.0], to: [0.3, 5.0, 2.8], dur: 4 }, { glow: 1 - ez(span(t, L(5) + 0.6, 1.6)) }, { aperture: 40, tilt: 6 });
      const p = span(t, L(5) + 1.4, 0.5); if (p > 0) { g.fillStyle = `rgba(16,10,22,${0.8 * p})`; g.beginPath(); g.roundRect(W / 2 - 400, 1295, 800, 100, 12); g.fill(); text(g, 'JULY 1947 · JOINS INDIA', W / 2, 1362, { font: "'Cormorant Garamond'", weight: 600, size: 54, color: PAPER, align: 'center', alpha: p, spacing: 6 }); } },
    () => { shot(g, S.harbour, t, tt, { from: [-10, 20, 36], to: [-8, 16, 30], dur: 3 }); const y = Math.round(lerp(1947, 2026, ez(span(t, L(6) + 0.1, 2.2)))); g.save(); g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 20; text(g, String(y), W / 2, 420, { font: "'Cormorant Garamond'", weight: 600, size: 190, color: PAPER, align: 'center' }); g.restore(); },
    () => { shot(g, S.harbour, t, tt, { from: [-8, 16, 30], to: [-1, 10, 19], dur: 9 }); plate(g, t, L(7) + 0.2, 'TRAVANCORE', 'PASSPORT', W / 2, 330); },
    () => { // split futures: sunny city-state above, grey shuttered port below
      g.save(); g.beginPath(); g.rect(0, 0, W, H / 2); g.clip(); g.translate(0, -H / 4); shot(g, S.harbour, t, tt + 9, { from: [-1, 10, 19], to: [0, 10, 18], dur: 6 }); g.restore();
      g.save(); g.beginPath(); g.rect(0, H / 2, W, H / 2); g.clip(); g.translate(0, H / 4); shot(g, S.grey, t, tt, { from: [-1, 10, 19], to: [0, 10, 18], dur: 6 }); g.restore();
      g.fillStyle = GOLD; g.fillRect(0, H / 2 - 3, W, 6);
      [[t > L(8) + 0.1, 'സിംഗപ്പൂർ?', 420, '#7dffb0'], [t > L(8) + 2.3, 'അതോ…?', 1380, '#ffb3be']].forEach(([on, str, y, col]) => { if (on) { g.fillStyle = 'rgba(16,10,22,0.8)'; g.beginPath(); g.roundRect(W / 2 - 230, y - 70, 460, 120, 12); g.fill(); g.strokeStyle = GOLD; g.lineWidth = 3; g.stroke(); text(g, str, W / 2, y + 12, { font: ML, weight: 800, size: 64, color: col, align: 'center' }); } }); },
  ][Math.min(i, 8)]();
  const f = Math.max(0, ...cuts.map((c) => (t < c - 0.27 || t > c + 0.33 ? 0 : t < c ? ez((t - c + 0.27) / 0.27) : 1 - ez((t - c) / 0.33))));
  if (f > 0) { g.fillStyle = `rgba(16,10,22,${0.85 * f})`; g.fillRect(0, 0, W, H); }
  captions(g, s);
}
function end(g, s) {
  const t = s.t; shot(g, S.finale, t, t, { dur: 6 });
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
void H;
