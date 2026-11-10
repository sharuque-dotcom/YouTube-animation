// Episode 2 (Toppled Giants): every scene is a shot list, drawn in the light purple style
// with story effects (scan lens, hearts, spy, chips, characters). casefile.js holds an
// alternative Case File take of the opening, kept for reference (not used).
import { loadLand } from '../../pipeline/map.js';
import { loadImages } from '../../pipeline/motion.js';
import { lightScene, lightSounds } from '../../pipeline/lightshots.js';
import { shots, photos } from './shots.js';

export const look = { light: true };
export const hits = [];
export const extraHits = (timeline) => lightSounds(timeline, shots);
export const scenes = Object.fromEntries(Object.entries(shots).map(([id, list]) => [id, lightScene(list)]));
export async function preload() {
  await loadLand();
  const base = new URL('./photos/', import.meta.url).href;
  await loadImages(Object.fromEntries(photos.map((f) => [f.replace(/\.\w+$/, ''), base + (f.includes('.') ? f : `${f}.jpg`)])));
}
