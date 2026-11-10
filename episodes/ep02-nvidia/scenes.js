// Episode 2 (Toppled Giants): every scene is a shot list, drawn in the light style.
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
  await loadImages(Object.fromEntries(photos.map((k) => [k, `${base}${k}.jpg`])));
}
