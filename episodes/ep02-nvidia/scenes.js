// Episode 2 (Toppled Giants). Case File house style: hand-directed scenes in casefile.js,
// the rest still drawn from the light-style shot lists until they are rebuilt.
import { loadLand } from '../../pipeline/map.js';
import { loadImages } from '../../pipeline/motion.js';
import { lightScene, lightSounds } from '../../pipeline/lightshots.js';
import { paperFinish } from '../../pipeline/dossier.js';
import { shots, photos } from './shots.js';
import { caseScenes, caseSounds } from './casefile.js';

export const look = { finish: paperFinish };
export const hits = [];
export const extraHits = (timeline) => {
  const own = timeline.scenes.filter((s) => caseScenes[s.id]).map((s) => [s.start, s.start + s.duration]);
  const light = lightSounds(timeline, shots).filter((h) => !own.some(([a, b]) => h.t >= a - 0.5 && h.t < b));
  return [...light, ...caseSounds(timeline)];
};
export const scenes = { ...Object.fromEntries(Object.entries(shots).map(([id, list]) => [id, lightScene(list)])), ...caseScenes };
export async function preload() {
  await loadLand();
  const base = new URL('./photos/', import.meta.url).href;
  await loadImages(Object.fromEntries(photos.map((f) => [f.replace(/\.\w+$/, ''), base + (f.includes('.') ? f : `${f}.jpg`)])));
}
