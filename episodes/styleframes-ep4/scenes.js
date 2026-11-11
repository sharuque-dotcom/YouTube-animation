// Episode 4 style frames (set pieces live in episodes/ep04-deepfake/sets.js).
import { loadLand } from '../../pipeline/map.js';
import { loadImages } from '../../pipeline/motion.js';
import { nightFinish } from '../../pipeline/scenery.js';
import { office, videocall, lawyerDesk, moneyMap } from '../ep04-deepfake/sets.js';

let ranges = [[12, 18]];
export async function preload() { await loadLand(); await loadImages({}); }
// night finish only on the night desk; the light frames get just fine grain
export const look = { finish: (ctx, frame) => { const T = frame / 30; if (ranges.some(([a, b]) => T >= a && T < b)) nightFinish(ctx, frame); } };
export const hits = [];
export const scenes = {
  s1: (g, s) => office(g, s.t + 2, { ringAt: 0, faceAt: 0.2 }),
  s2: (g, s) => videocall(g, s.t + 2, { peelAt: 4.3 }),
  s3: (g, s) => lawyerDesk(g, s.t + 2, { writeAt: 0 }),
  s4: (g, s) => moneyMap(g, s.t + 2, { routesAt: 0 }),
};
