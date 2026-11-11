import { W, H, text } from '../../pipeline/engine.js';
import { toon, parrot } from '../../pipeline/cast.js';
export const look = { light: true };
export const hits = [];
export const scenes = { s1: (g, s) => {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#f3edfc'); gr.addColorStop(1, '#e6dcf3'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const t = s.t + 1;
  const ex = ['neutral', 'happy', 'worried', 'shock', 'smug', 'laugh'];
  const looks = [
    { outfit: '#5b6ea8', hair: '#3b2a1a', skin: '#e8b48f', armR: -0.4, prop: 'phone' },
    { outfit: '#1d1b2e', hairStyle: 'grey', skin: '#f2c9a5', tie: '#e2412e', glasses: true },
    { outfit: '#4a2a8c', hairStyle: 'long', hair: '#2b2440', skin: '#f6d2b5', sweat: 1 },
    { outfit: '#2b4a3a', hair: '#8a5a2b', skin: '#c98a5e' },
    { outfit: '#3a3156', hairStyle: 'bald', skin: '#e0b090', armR: -1.2, prop: 'cash' },
    { outfit: '#ffffff', shirt: '#e8e3f5', hairStyle: 'grey', skin: '#f2c9a5', hat: 'cap', armR: -0.5, prop: 'club', legs: '#c9b48f' },
  ];
  ex.forEach((e, i) => { toon(g, 170 + i * 270, 980, 1.25, t, { expr: e, seed: i + 3, ...looks[i] }); text(g, e, 170 + i * 270, 1050, { font: 'Inter', weight: 600, size: 24, color: '#4a2a8c', align: 'center' }); });
  parrot(g, 1700, 300, 1.1, t, { talk: 1 });
} };
