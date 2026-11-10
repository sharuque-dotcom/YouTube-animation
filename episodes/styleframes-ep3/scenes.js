// Episode 3 style frames (the set pieces live in episodes/ep03-ueno/sets.js).
import { nightFinish } from '../../pipeline/scenery.js';
import { bedroom, tower, march, domino } from '../ep03-ueno/sets.js';

export const look = { finish: nightFinish };
export const hits = [];
export const scenes = {
  s1: (g, s) => bedroom(g, s.t + 2),
  s2: (g, s) => tower(g, s.t + 1.5),
  s3: (g, s) => march(g, s.t + 2),
  s4: (g, s) => domino(g, s.t + 1.6),
};
