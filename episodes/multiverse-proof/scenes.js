// 10-second proof of the multiverse jump-cut style (episode 5).
import { W, H } from '../../pipeline/engine.js';
import { universe, jump } from '../ep05-nvidia-part2/multiverse.js';

const TR = 0.6;
const SCHED = [
  { u: 'office', a: 0, b: 1.0 },
  { u: 'cosmic', a: 1.6, b: 4.0 },
  { u: 'land', a: 4.6, b: 7.0, sub: 'In this universe, the board is still deciding.' },
  { u: 'pink', a: 7.6, b: 10.0 },
];
function frame(g, T) {
  let i = SCHED.findIndex((s, k) => T < (k < SCHED.length - 1 ? SCHED[k + 1].a : 99));
  if (i < 0) i = SCHED.length - 1;
  const s = SCHED[i], lt = T - s.a + 1.2;
  const { eye, ctr } = universe(g, s.u, lt, { subtitle: s.sub });
  if (T > s.b && i < SCHED.length - 1) jump(g, (T - s.b) / TR, T, eye, ctr);
  if (i > 0 && T < s.a + 0.18) { g.fillStyle = `rgba(255,255,255,${1 - (T - s.a) / 0.18})`; g.fillRect(0, 0, W, H); }
}
export const scenes = { proof: (g, s) => frame(g, s.t) };
export const look = { light: true };
export const hits = SCHED.slice(0, 3).flatMap((s) => [{ t: s.b, kind: 'whoosh', vol: 0.7 }, { t: s.b + 0.25, kind: 'pop', vol: 0.8 }, { t: s.b + 0.5, kind: 'hit', vol: 0.7 }]);
