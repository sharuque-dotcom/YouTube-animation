import { loadLand } from '../../pipeline/map.js';
import { nightFinish } from '../../pipeline/scenery.js';
import { serverHall, deadInbox, outageMap, beforeBell } from '../ep06-microsoft-outage/sets.js';
export async function preload() { await loadLand(); }
export const look = { finish: nightFinish };
export const hits = [];
export const scenes = {
  s1: (g, s) => serverHall(g, s.t + 2, { fail: 0.35, beaconAt: 0 }),
  s2: (g, s) => deadInbox(g, s.t + 2, { stampAt: 0, spinUntil: 0 }),
  s3: (g, s) => outageMap(g, s.t + 4, { start: 0, dur: 3 }),
  s4: (g, s) => beforeBell(g, s.t + 2, { clock: 7.5 }),
};
