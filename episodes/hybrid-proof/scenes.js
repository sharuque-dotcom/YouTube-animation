// 15-second hybrid: night painterly boardroom (episode-3 template) → 3D multiverse jumps → back.
import { W, H, clamp } from '../../pipeline/engine.js';
import { nightFinish } from '../../pipeline/scenery.js';
import { pill } from '../../pipeline/scenekit.js';
import { boardroom } from '../ep05-nvidia-part2/sets.js';
import { universe, jump, googly } from '../ep05-nvidia-part2/multiverse.js';

const TR = 0.6;
// the googly eye on the leather jacket draped over the head chair in the boardroom
const BOARD_EYE = { x: 990, y: 548, r: 22 };
function board(g, T, lt) {
  const z = 1 + 0.05 * lt;
  g.save(); g.translate(960, 560); g.scale(z, z); g.translate(-960, -560);
  boardroom(g, lt + 2);
  googly(g, BOARD_EYE.x, BOARD_EYE.y, BOARD_EYE.r, T, { seed: 3 });
  g.restore();
  const ex = 960 + (BOARD_EYE.x - 960) * z, ey = 560 + (BOARD_EYE.y - 560) * z;
  return { eye: { x: ex, y: ey }, ctr: [960, 560] };
}
const SCHED = [
  { kind: 'night', a: 0, b: 4.0, cap: 'Santa Clara · Wednesday night' },
  { kind: '3d', u: 'office', a: 4.6, b: 7.0 },
  { kind: '3d', u: 'land', a: 7.6, b: 10.0, sub: 'In one universe, he keeps his job.' },
  { kind: 'night', a: 10.6, b: 99, cap: 'Back in ours: the board is still deciding' },
];
let nightFrame = true;
function frame(g, T) {
  let i = SCHED.findIndex((s, k) => T < (k < SCHED.length - 1 ? SCHED[k + 1].a : 99));
  if (i < 0) i = SCHED.length - 1;
  const s = SCHED[i];
  let ref;
  if (s.kind === 'night') { ref = board(g, T, T - s.a + (i ? 4 : 0)); pill(g, T - s.a, 0.3, s.cap, 90, { theme: 'dark', size: 28 }); nightFrame = true; }
  else { ref = universe(g, s.u, T - s.a + 1.2, { subtitle: s.sub }); nightFrame = false; }
  if (T > s.b && i < SCHED.length - 1) jump(g, (T - s.b) / TR, T, ref.eye, ref.ctr);
  if (i > 0 && T < s.a + 0.18) { g.fillStyle = `rgba(255,255,255,${1 - (T - s.a) / 0.18})`; g.fillRect(0, 0, W, H); }
}
export const scenes = { proof: (g, s) => frame(g, s.t) };
// night finish on the night shots only; the 3D universes keep their own grade
export const look = { finish: (ctx, f) => { const T = f / 30; if (T < 4.0 || T >= 10.6) nightFinish(ctx, f); } };
export const hits = [4.0, 7.0, 10.0].flatMap((b) => [{ t: b, kind: 'whoosh', vol: 0.7 }, { t: b + 0.25, kind: 'pop', vol: 0.8 }, { t: b + 0.5, kind: 'hit', vol: 0.7 }]);
void clamp; void nightFrame;
