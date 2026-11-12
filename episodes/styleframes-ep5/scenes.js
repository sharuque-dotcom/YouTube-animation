import { nightFinish } from '../../pipeline/scenery.js';
import { boardroom, callEnded, redTicker, capitol } from '../ep05-nvidia-part2/sets.js';
export const look = { finish: nightFinish };
export const hits = [];
export const scenes = {
  s1: (g, s) => boardroom(g, s.t + 2), s2: (g, s) => callEnded(g, s.t + 2),
  s3: (g, s) => redTicker(g, s.t + 2), s4: (g, s) => capitol(g, s.t + 2),
};
