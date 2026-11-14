import { nightFinish } from '../../pipeline/scenery.js';
import { loadPhotos, diner, keynote, tabloid, filmGrade } from '../short-cinderella/sets.js';
export async function preload() { await loadPhotos(); }
export const look = { finish: nightFinish };
export const hits = [];
export const scenes = {
  s1: (g, s) => { diner(g, s.t + 2); filmGrade(g, s.t + 2); },
  s2: (g, s) => keynote(g, s.t + 2),
  s3: (g, s) => tabloid(g, s.t + 2.1),
};
