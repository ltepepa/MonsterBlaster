// Canvas setup, shared constants and small helpers.
const W = 800, H = 450;
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = W * dpr; canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resize(); addEventListener('resize', resize);

const LANES = [190, 295, 400];
const KID_X = 92;
const $ = id => document.getElementById(id);
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

let best = 0;
try { best = +localStorage.getItem('mb-best') || 0; } catch (e) {}
