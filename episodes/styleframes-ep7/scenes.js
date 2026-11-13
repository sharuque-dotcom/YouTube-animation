import { nightFinish } from '../../pipeline/scenery.js';
import { venice, masks, corridor, emptyStage } from '../ep07-nvidia-part3/sets.js';
export const look = { finish: nightFinish };
export const hits = [];
export const scenes = {
  s1: (g, s) => venice(g, s.t + 2, { tower: 0.8 }),
  s2: (g, s) => masks(g, s.t + 2, { lit: [0.6, 0.6, 1] }),
  s3: (g, s) => corridor(g, s.t + 2, { nda: 1 }),
  s4: (g, s) => emptyStage(g, s.t + 2),
};
