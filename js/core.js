// Canvas setup, shared constants and small helpers.
const W = 800, H = 450;
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
// Older phones (e.g. iOS before 16) lack roundRect, which almost every drawing uses: add a simple version.
if (!ctx.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    const [tl, tr, br, bl] = Array.isArray(r) ? [r[0], r[1] ?? r[0], r[2] ?? r[0], r[3] ?? r[1] ?? r[0]] : [r, r, r, r];
    this.moveTo(x + tl, y);
    this.arcTo(x + w, y, x + w, y + h, tr); this.arcTo(x + w, y + h, x, y + h, br);
    this.arcTo(x, y + h, x, y, bl); this.arcTo(x, y, x + w, y, tl);
    this.closePath();
  };
}
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
