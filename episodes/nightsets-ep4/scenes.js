import { loadLand } from '../../pipeline/map.js';
import { nightFinish } from '../../pipeline/scenery.js';
import { nightOffice, ceoOffice, asleep, darkMap, theater, study, auditorium, parrot, litToon, EMP, CEO } from '../ep04-deepfake/night.js';
export async function preload() { await loadLand(); }
export const look = { finish: nightFinish };
export const hits = [];
export const scenes = {
  a: (g, s) => nightOffice(g, s.t + 2, { ringAt: 0, expr: 'happy', look: 1, armR: -0.9 }),
  b: (g, s) => ceoOffice(g, s.t + 2),
  c: (g, s) => asleep(g, s.t + 2),
  d: (g, s) => darkMap(g, s.t, 0, 30, 5.2),
  e: (g, s) => { theater(g, s.t + 2); litToon(g, 760, 870, 1.6, s.t + 2, { outfit: '#c98a2a', hair: '#2b2440', skin: '#f2c9a5', seed: 51, expr: 'talk', talk: 1, armR: -2.2, armL: 1.2 }, { light: [760, 0], color: '255,230,190', key: 0.15, keyColor: '255,230,190' }); },
  f: (g, s) => { study(g, s.t + 2); litToon(g, 620, 1000, 2.0, s.t + 2, { ...CEO, expr: 'talk', talk: 1, armR: -1, armL: 0.6, look: 1 }, { light: [1440, 300], color: '190,180,255' }); parrot(g, 1300, 600, 1.6, s.t + 2, { talk: 1, look: -1 }); },
  h: (g, s) => auditorium(g, s.t + 2),
};
