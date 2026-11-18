import { loadLand } from '../../pipeline/map.js';
import { nightFinish } from '../../pipeline/scenery.js';
import { oldMap, conch, radioRoom, thoriumBeach, harbour } from '../ml-travancore/sets.js';
export async function preload() { await loadLand(); }
export const look = { finish: nightFinish };
export const hits = [];
export const scenes = {
  s1: (g, s) => { oldMap(g, s.t + 2, { glowP: 1 }); conch(g, 540, 640, 1.1); },
  s2: (g, s) => radioRoom(g, s.t + 2),
  s3: (g, s) => thoriumBeach(g, s.t + 2),
  s4: (g, s) => harbour(g, s.t + 2),
};
