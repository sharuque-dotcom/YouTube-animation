// Episode 6 Short 2: native 9:16. Drawing lives in ../ep06-microsoft-outage/vertical.js
import { shortScenes, shortPreload, shortLook, shortHits } from '../ep06-microsoft-outage/vertical.js';
export const scenes = shortScenes(2);
export const preload = shortPreload;
export const look = shortLook;
export const hits = [];
export const extraHits = shortHits(["Some servers were failing", "Microsoft said it saw no sign"]);
