// Episode 6, chapters 2–6 and the outro. (Being built: placeholders until the test clip is approved.)
import { W, H, text } from '../../pipeline/engine.js';
import { INK, cam, nightBG } from './kit.js';

const hold = (label) => (g, s) => { g.save(); cam(g, s.t, { z0: 1, z1: 1.08, dur: 40 }); nightBG(g, s.t, { seed: label.length, rainA: 0.3, moonAt: [1500, 170] }); g.restore(); text(g, label, W / 2, H / 2, { font: 'Jakarta', weight: 800, size: 80, color: INK, align: 'center' }); };

export const scenes = { customer: hold('The Customer'), dayone: hold('Day One'), email: hold('The Email'), second: hold('The Second Report'), exit: hold('Day Fourteen'), outro: hold('What we know') };
export const cuts = {};
export const sounds = () => {};
