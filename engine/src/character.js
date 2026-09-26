/**
 * Proportional character drawing for the p5 preview film.
 *
 * `drawSpark` is a pure draw call: the same arguments always produce the same
 * frame, and every pose decision comes from the caller's time-derived values.
 */
import { clamp, wave } from './core.js';

/** Vertical bob amplitude in pixels. @type {number} */
const BOB_AMPLITUDE = 6;
/** Squash and stretch amount per unit of driver. @type {number} */
const SQUASH = 0.08;
/** Limb and body outline weight. @type {number} */
const OUTLINE_WEIGHT = 5;
/** Mouth and limb stroke weight. @type {number} */
const DETAIL_WEIGHT = 4;
/** Maximum horizontal limb swing in pixels. @type {number} */
const LIMB_SWING = 17;
/** Head width in pixels. @type {number} */
const HEAD_WIDTH = 98;
/** Head height in pixels. @type {number} */
const HEAD_HEIGHT = 116;
/** Eye horizontal offset from center. @type {number} */
const EYE_OFFSET = 20;
/** Eye vertical offset from center. @type {number} */
const EYE_Y = -13;
/** Eye width in pixels. @type {number} */
const EYE_WIDTH = 25;
/** Eye height in pixels. @type {number} */
const EYE_HEIGHT = 30;
/** Pupil radius in pixels. @type {number} */
const PUPIL_RADIUS = 8;
/** Pupil horizontal travel per unit of look. @type {number} */
const LOOK_TRAVEL = 5;
/** Left pupil x without look offset. @type {number} */
const PUPIL_LEFT_X = -18;
/** Right pupil x without look offset. @type {number} */
const PUPIL_RIGHT_X = 22;
/** Antenna tip radius in pixels. @type {number} */
const ANTENNA_TIP_RADIUS = 12;
/** Antenna baseline y in pixels. @type {number} */
const ANTENNA_BASE_Y = -61;
/** Antenna tip y in pixels. @type {number} */
const ANTENNA_TIP_Y = -82;
/** Antenna left stroke start x in pixels. @type {number} */
const ANTENNA_LEFT_X = -11;
/** Antenna right stroke end x in pixels. @type {number} */
const ANTENNA_RIGHT_X = 13;
/** Antenna right stroke end y in pixels. @type {number} */
const ANTENNA_RIGHT_END_Y = -64;

/**
 * @typedef {object} SparkOptions
 * @property {string} [mood] `curious`, `happy`, or `worried`
 * @property {number} [phase] walk cycle phase offset
 * @property {number} [walk] walk cycle position
 * @property {number} [look] pupil shift, usually `-1..1`
 * @property {number} [squash] squash and stretch driver
 * @property {number} [blink] blink amount, `0..1`
 * @property {import('./types.js').MotionloomPalette} [palette]
 */

/**
 * Draw the Spark character in a deterministic pose.
 * @param {import('./types.js').MotionloomSketch} p
 * @param {number} x
 * @param {number} y
 * @param {number} scale
 * @param {SparkOptions} [options]
 * @returns {void}
 */
export function drawSpark(p, x, y, scale, options = {}) {
  const mood = options.mood || 'curious';
  const phase = options.phase || 0;
  const walk = options.walk || 0;
  const look = options.look || 0;
  const squash = options.squash || 0;
  const blink = options.blink || 0;
  const pal = options.palette;

  const bob = Math.abs(wave(walk, 1, phase)) * -BOB_AMPLITUDE * scale;
  const swing = wave(walk, 1, phase) * LIMB_SWING;
  const blinkHeight = 1 - clamp(blink);

  p.push();
  p.translate(x, y + bob);
  p.scale(scale * (1 + (squash * SQUASH)), scale * (1 - (squash * SQUASH)));

  p.stroke(pal.ink);
  p.strokeWeight(OUTLINE_WEIGHT);
  p.strokeCap(p.ROUND);
  p.noFill();
  p.line(-25, 50, -42 + swing, 91);
  p.line(24, 50, 41 - swing, 91);
  p.line(-42, 10, -68 - (swing * 0.6), 43);
  p.line(42, 10, 68 + (swing * 0.6), 41);

  p.fill(pal.yellow);
  p.ellipse(0, 0, HEAD_WIDTH, HEAD_HEIGHT);

  p.fill(pal.white);
  p.ellipse(-EYE_OFFSET, EYE_Y, EYE_WIDTH, EYE_HEIGHT * blinkHeight);
  p.ellipse(EYE_OFFSET, EYE_Y, EYE_WIDTH, EYE_HEIGHT * blinkHeight);

  p.fill(pal.ink);
  p.noStroke();
  p.circle(PUPIL_LEFT_X + (look * LOOK_TRAVEL), -12, PUPIL_RADIUS);
  p.circle(PUPIL_RIGHT_X + (look * LOOK_TRAVEL), -12, PUPIL_RADIUS);

  p.noFill();
  p.stroke(pal.ink);
  p.strokeWeight(DETAIL_WEIGHT);
  if (mood === 'happy') {
    p.arc(0, 15, 34, 25, 0, Math.PI);
  } else if (mood === 'worried') {
    p.arc(0, 30, 32, 24, Math.PI, Math.PI * 2);
  } else {
    p.line(-10, 22, 13, 20);
  }

  p.stroke(pal.coral);
  p.line(ANTENNA_LEFT_X, ANTENNA_BASE_Y, 0, ANTENNA_TIP_Y);
  p.line(0, ANTENNA_TIP_Y, ANTENNA_RIGHT_X, ANTENNA_RIGHT_END_Y);
  p.noStroke();
  p.fill(pal.coral);
  p.circle(0, ANTENNA_TIP_Y - 2, ANTENNA_TIP_RADIUS);
  p.pop();
}

