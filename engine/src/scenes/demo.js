import { PROJECT } from '../config.js';
import { defineTimeline, brushWipe } from '../timeline.js';
import { camera, drawPath, easeInOut, grain, halftone, lerp, norm, rng, wave } from '../core.js';
import { drawSpark } from '../character.js';
import { kineticTitle } from '../typography.js';
import { productWindow } from '../product.js';
import { enter, float, springy } from '../motion.js';

const pal = PROJECT.palette;
function paper(p, color = pal.paper) { p.background(color); grain(p, 900, PROJECT.seed, 12); }
function ribbonPoints(t, mode = 0) {
  const pts = [];
  for (let i = 0; i <= 30; i++) { const x = -100 + i * 50; const y = mode === 0 ? 370 + Math.sin(i * .45 + t * 4) * 55 : 370 + Math.sin(i * .25 + t * 2) * (45 + i * 1.4); pts.push([x, y]); }
  return pts;
}

function opening(p, t) {
  paper(p); halftone(p, 0, 0, p.width, p.height, 'rgba(24,183,201,.14)', 16, 2.2, .2);
  kineticTitle(p, 'MOTIONLOOM', p.width / 2, 260, t, .05, { size: 104, color: pal.ink });
  kineticTitle(p, 'ideas, drawn in code', p.width / 2, 350, t, .55, { size: 34, color: pal.violet });
  drawPath(p, ribbonPoints(t), pal.coral, 18);
}
function characterShot(p, t) {
  paper(p, '#dff5f7');
  camera(p, { x: 640, y: 360, zoom: 1 + norm(t, 2, 4) * .08 }, () => {
    const x = lerp(250, 690, easeInOut(norm(t, 2, 3.35)));
    drawSpark(p, x, 430 + float(t, 5, .4), 1.15, { mood: t > 3.2 ? 'happy' : 'curious', walk: t * 2.3, look: .4, palette: pal, blink: Math.max(0, wave(t, 1.7) - .92) * 12 });
    p.fill(pal.ink); p.noStroke(); p.textFont('Arial'); p.textStyle(p.BOLD); p.textSize(56); p.textAlign(p.CENTER); p.text('CHARACTER', 920, 255); p.textSize(25); p.textStyle(p.NORMAL); p.text('acting • follow-through • appeal', 920, 307);
  });
  drawPath(p, ribbonPoints(t, 1), pal.coral, 14);
}
function proceduralShot(p, t) {
  paper(p, '#fff1ce'); const r = rng(PROJECT.seed + 77);
  p.push(); p.translate(640, 365); p.rotate(t * .08);
  for (let i = 0; i < 42; i++) { const a = i / 42 * Math.PI * 2 + t * .13; const rr = 65 + i * 5.3; p.noFill(); p.stroke([pal.coral, pal.cyan, pal.violet][i % 3]); p.strokeWeight(2 + (i % 4)); p.arc(0, 0, rr * 2, rr * 2, a, a + 1.3 + r() * .4); }
  p.pop();
  p.fill(pal.ink); p.noStroke(); p.textAlign(p.CENTER); p.textFont('Arial'); p.textStyle(p.BOLD); p.textSize(66); p.text('PROCEDURAL ART', 640, 365);
  p.textStyle(p.NORMAL); p.textSize(25); p.text('seeded • repeatable • resolution independent', 640, 420);
}
function productShot(p, t) {
  paper(p, '#eee9ff'); const k = springy(t, 6, .9);
  p.push(); p.translate(640, 390); p.scale(.7 + k * .3); p.translate(-640, -390); productWindow(p, 240, 155, 800, 460, pal, enter(t, 6, .7)); p.pop();
  kineticTitle(p, 'PRODUCT MOTION', 640, 90, t, 6.15, { size: 54, color: pal.ink });
  const dotX = lerp(510, 835, easeInOut(norm(t, 6.8, 7.7))); p.fill(pal.coral); p.stroke(pal.white); p.strokeWeight(3); p.circle(dotX, 360, 25);
}
function finale(p, t) {
  paper(p, pal.ink); p.noStroke();
  for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2 + t * .2; const rr = 120 + 160 * norm(t, 8, 10); p.fill([pal.coral, pal.cyan, pal.yellow][i % 3]); p.circle(640 + Math.cos(a) * rr, 360 + Math.sin(a) * rr, 12 + (i % 4) * 4); }
  kineticTitle(p, 'DESCRIBE IT.', 640, 285, t, 8.05, { size: 72, color: pal.white });
  kineticTitle(p, 'CLAUDE DIRECTS. CODE DRAWS.', 640, 380, t, 8.5, { size: 34, color: pal.yellow });
  kineticTitle(p, 'npm run video', 640, 465, t, 9.05, { size: 27, color: pal.cyan });
}

const shots = [
  { id: 'open', start: 0, end: 2, draw: (p, t) => opening(p, t) },
  { id: 'character', start: 2, end: 4, draw: (p, t) => characterShot(p, t) },
  { id: 'procedural', start: 4, end: 6, draw: (p, t) => proceduralShot(p, t) },
  { id: 'product', start: 6, end: 8, draw: (p, t) => productShot(p, t) },
  { id: 'finale', start: 8, end: 10, draw: (p, t) => finale(p, t) }
];
const wipe = brushWipe(pal.coral, pal.yellow);
const transitions = [2, 4, 6, 8].map((at, i) => ({ id: `wipe-${i}`, start: at - .22, end: at + .18, draw: (p, k) => wipe(p, k) }));
export const timeline = defineTimeline(shots, transitions);
