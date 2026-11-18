import { pixelStreet } from '../ml-travancore/pixel.js';
export const hits = [];
export const scenes = { s1: (g, s) => pixelStreet(g, s.t + 2) };
