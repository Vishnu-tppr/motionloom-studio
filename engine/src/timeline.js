/**
 * Shot/transition timeline.
 *
 * Contract: render is a pure function of absolute time. Shots draw the full
 * frame for their window; transitions overlay by normalized progress.
 * Never accumulate state between frames.
 */
import { clamp, easeInOut, localTime } from './core.js';

/**
 * @typedef {object} TimelineShot
 * @property {string} id
 * @property {number} start
 * @property {number} end
 * @property {(sketch: *, time: number, local: *, env: *) => void} draw
 */
/**
 * @typedef {object} TimelineTransition
 * @property {number} start
 * @property {number} end
 * @property {(sketch: *, progress: number, time: number, env: *) => void} draw
 */

/**
 * Define an ordered, immutable shot timeline with optional transitions.
 * @param {TimelineShot[]} shots
 * @param {TimelineTransition[]} [transitions]
 * @returns {{ shots: TimelineShot[], transitions: TimelineTransition[], duration: number }}
 */
export function defineTimeline(shots, transitions = []) {
  const ordered = [...shots].sort((a, b) => a.start - b.start);
  const transitionList = [...transitions];
  return {
    shots: ordered,
    transitions: transitionList,
    duration: Math.max(...ordered.map(s => s.end)),
    render(p, t, env) {
      const active = ordered.filter(s => t >= s.start && t < s.end + 1 / env.fps);
      if (!active.length) return;
      for (const shot of active) {
        p.push();
        const lt = localTime(t, shot.start, shot.end);
        shot.draw(p, t, lt, env);
        p.pop();
      }
      for (const tr of transitionList) {
        if (t >= tr.start && t <= tr.end) {
          p.push();
          tr.draw(p, clamp((t - tr.start) / (tr.end - tr.start)), t, env);
          p.pop();
        }
      }
    },
    markers() { return ordered.flatMap(s => [s.start, (s.start + s.end) / 2, s.end - .001]); }
  };
}

export function irisTransition(color, cx, cy, maxRadius = 1600) {
  return (p, k) => {
    const r = maxRadius * easeInOut(k);
    p.push(); p.noFill(); p.stroke(color); p.strokeWeight(maxRadius * 2); p.circle(cx, cy, r * 2 + maxRadius * 2); p.pop();
  };
}

export function brushWipe(colorA, colorB) {
  return (p, k) => {
    const x = p.lerp(-p.width * .4, p.width * 1.4, easeInOut(k));
    p.push(); p.noStroke();
    p.fill(colorA); p.quad(x - 300, -100, x + 80, -100, x - 120, p.height + 100, x - 480, p.height + 100);
    p.fill(colorB); p.quad(x - 120, -100, x + 220, -100, x + 20, p.height + 100, x - 300, p.height + 100);
    p.pop();
  };
}
