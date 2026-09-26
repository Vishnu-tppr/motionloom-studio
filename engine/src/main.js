import p5 from 'p5';
import { PROJECT } from './config.js';
import { timeline } from './scenes/demo.js';

const params = new URLSearchParams(location.search);
let current = Number(params.get('t') || 0);
let playing = params.get('play') !== '0';
let last = performance.now();
let canvas;

const sketch = p => {
  p.setup = () => {
    canvas = p.createCanvas(PROJECT.width, PROJECT.height);
    canvas.parent('canvas-wrap');
    p.pixelDensity(1); p.frameRate(PROJECT.fps); p.angleMode(p.RADIANS);
    window.__motionloom = { PROJECT, timeline, p, ready: true, setTime: t => { current = Math.max(0, Math.min(PROJECT.duration, Number(t))); playing = false; p.redraw(); }, renderAt: t => { current = Number(t); playing = false; p.redraw(); return true; } };
    document.dispatchEvent(new Event('motionloom-ready'));
  };
  p.draw = () => {
    const now = performance.now();
    if (playing) current = (current + (now - last) / 1000) % PROJECT.duration;
    last = now;
    timeline.render(p, current, PROJECT);
    window.dispatchEvent(new CustomEvent('motionloom-frame', { detail: { time: current } }));
  };
};
new p5(sketch);
