import { clamp, ease, lerp, norm, wave, bezier2 } from './core.js';

/**
 * Deterministic p5 motion primitives.
 *
 * Every export is a pure function of absolute time plus explicit parameters.
 * Never integrate velocity from the previous frame; derive position and
 * deformation analytically so `renderAt(t)` matches sequential playback.
 */

/** Default entrance duration. @type {number} */
const DEFAULT_ENTER = 0.6;
/** Default exit duration. @type {number} */
const DEFAULT_EXIT = 0.5;

/**
 * Eased entrance progress.
 * @param {number} time absolute seconds
 * @param {number} start start seconds
 * @param {number} [duration]
 * @returns {number} `0..1`
 */
export function enter(time, start, duration = DEFAULT_ENTER) {
  return ease(norm(time, start, start + duration));
}

/**
 * Eased exit hold (`1` visible → `0` gone).
 * @param {number} time absolute seconds
 * @param {number} end end seconds
 * @param {number} [duration]
 * @returns {number} `0..1`
 */
export function exit(time, end, duration = DEFAULT_EXIT) {
  return 1 - ease(norm(time, end - duration, end));
}

/**
 * Staggered entrance for indexed items.
 * @param {number} time
 * @param {number} start
 * @param {number} index
 * @param {number} [gap]
 * @param {number} [duration]
 * @returns {number}
 */
export function stagger(time, start, index, gap = 0.08, duration = 0.5) {
  return enter(time, start + (index * gap), duration);
}

/**
 * Snappy scale-in with overshoot, clamped to `0..1`.
 * @param {number} time
 * @param {number} start
 * @param {number} [duration]
 * @returns {number}
 */
export function springy(time, start, duration = 0.8) {
  const progress = norm(time, start, start + duration);
  return clamp(1 - (Math.exp(-6 * progress) * Math.cos(11 * progress)));
}

/**
 * Gentle analytic float.
 * @param {number} time
 * @param {number} [amount]
 * @param {number} [speed]
 * @param {number} [phase]
 * @returns {number}
 */
export function float(time, amount = 12, speed = 0.16, phase = 0) {
  return wave(time, speed, phase) * amount;
}

/**
 * Delayed copy of a driver signal for follow-through.
 * @param {number} value driver value
 * @param {number} delay
 * @param {number} [amplitude]
 * @returns {number}
 */
export function follow(value, delay, amplitude = 1) {
  return wave(value - delay, 1) * amplitude;
}

/**
 * Eased travel between two scalars.
 * @param {number} time
 * @param {number} start
 * @param {number} end
 * @param {number} from
 * @param {number} to
 * @returns {number}
 */
export function travel(time, start, end, from, to) {
  return lerp(from, to, ease(norm(time, start, end)));
}

/** Back-ease overshoot strength for anticipation. @type {number} */
const OVERSHOOT_STRENGTH = 1.70158;
/** Bounce curve segment length. @type {number} */
const BOUNCE_SEGMENT = 2.75;
/** Bounce curve amplitude. @type {number} */
const BOUNCE_AMPLITUDE = 7.5625;

/**
 * Anticipation: pull back before the move, then overshoot into place.
 * @param {number} time absolute seconds
 * @param {number} start start seconds
 * @param {number} [duration]
 * @returns {number} signed offset, `0` at the edges
 */
export function anticipate(time, start, duration = 0.6) {
  const progress = norm(time, start, start + duration);
  return ((OVERSHOOT_STRENGTH + 1) * progress ** 3) - (OVERSHOOT_STRENGTH * progress ** 2);
}

/**
 * Standard four-segment bounce ease-out.
 * @param {number} time absolute seconds
 * @param {number} start start seconds
 * @param {number} [duration]
 * @returns {number} `0..1`
 */
export function bounce(time, start, duration = 0.8) {
  const progress = norm(time, start, start + duration);
  if (progress < 1 / BOUNCE_SEGMENT) return BOUNCE_AMPLITUDE * progress * progress;
  if (progress < 2 / BOUNCE_SEGMENT) {
    const settled = progress - (1.5 / BOUNCE_SEGMENT);
    return (BOUNCE_AMPLITUDE * settled * settled) + 0.75;
  }
  if (progress < 2.5 / BOUNCE_SEGMENT) {
    const settled = progress - (2.25 / BOUNCE_SEGMENT);
    return (BOUNCE_AMPLITUDE * settled * settled) + 0.9375;
  }
  const settled = progress - (2.625 / BOUNCE_SEGMENT);
  return (BOUNCE_AMPLITUDE * settled * settled) + 0.984375;
}

/**
 * Damped spring settle with exact `0`/`1` endpoints.
 * @param {number} time absolute seconds
 * @param {number} start start seconds
 * @param {number} [duration]
 * @param {number} [damping]
 * @param {number} [frequency]
 * @returns {number} `0..1`
 */
export function spring(time, start, duration = 0.8, damping = 6, frequency = 12) {
  const progress = norm(time, start, start + duration);
  if (progress === 0 || progress === 1) return progress;
  return 1 - (Math.exp(-damping * progress) * Math.cos(frequency * progress));
}

/**
 * Layered wave jitter for secondary texture. Never accumulates frame state.
 * @param {number} time absolute seconds
 * @param {number} [seed]
 * @param {number} [frequency]
 * @param {number} [amplitude]
 * @returns {number} centered jitter around `0`
 */
export function wiggle(time, seed = 1, frequency = 4, amplitude = 10) {
  return (wave(time, frequency, seed) + (wave(time, frequency * 1.3, seed + 1) * 0.5)) * amplitude;
}

/**
 * Single impact pulse that is `0` at both edges.
 * @param {number} time absolute seconds
 * @param {number} at impact seconds
 * @param {number} [duration]
 * @param {number} [intensity]
 * @returns {number} `0..intensity`
 */
export function punch(time, at, duration = 0.3, intensity = 1) {
  const progress = norm(time, at, at + duration);
  if (progress === 0 || progress === 1) return 0;
  return Math.sin(progress * Math.PI) * intensity;
}

/**
 * Decaying shake after an impact, silent at both edges.
 * @param {number} time absolute seconds
 * @param {number} at impact seconds
 * @param {number} [duration]
 * @param {number} [magnitude]
 * @param {number} [frequency]
 * @returns {number} signed offset
 */
export function shake(time, at, duration = 0.4, magnitude = 10, frequency = 25) {
  const progress = norm(time, at, at + duration);
  if (progress === 0 || progress === 1) return 0;
  return Math.sin(progress * frequency * Math.PI) * magnitude * (1 - progress);
}

/**
 * Count a numeric readout between two values.
 * @param {number} time absolute seconds
 * @param {number} start start seconds
 * @param {number} end end seconds
 * @param {number} [from]
 * @param {number} [to]
 * @param {(progress: number) => number} [easeFn]
 * @returns {number}
 */
export function counter(time, start, end, from = 0, to = 100, easeFn = ease) {
  return lerp(from, to, easeFn(norm(time, start, end)));
}

/**
 * Quadratic Bézier trajectory that applies the ease before interpolating.
 * @param {number} time absolute seconds
 * @param {number} start start seconds
 * @param {number} end end seconds
 * @param {[number, number]} startPoint
 * @param {[number, number]} controlPoint
 * @param {[number, number]} endPoint
 * @param {(progress: number) => number} [easeFn]
 * @returns {[number, number]} `[x, y]`
 */
export function arcTrajectory(time, start, end, startPoint, controlPoint, endPoint, easeFn = ease) {
  const progress = easeFn(norm(time, start, end));
  return [
    bezier2(startPoint[0], controlPoint[0], endPoint[0], progress),
    bezier2(startPoint[1], controlPoint[1], endPoint[1], progress),
  ];
}

/**
 * Traveling wave along a normalized length `u`. Phase depends only on absolute
 * time, so any frame can be evaluated in isolation.
 * @param {number} u normalized length `0..1`
 * @param {number} time absolute seconds
 * @param {number} frequency wave count along `u`
 * @param {number} speed radians per second
 * @param {number} phase phase offset
 * @param {number} amplitude
 * @returns {number} signed displacement
 */
export function travelingWave(u, time, frequency, speed, phase, amplitude) {
  return Math.sin(u * frequency + phase - time * speed) * amplitude;
}

/**
 * Lagged appendage response driven by a shared beat signal.
 * @param {number} u normalized length `0..1`
 * @param {number} time absolute seconds
 * @param {number} beat shared driver in radians
 * @param {number} lagFactor larger values lag further behind the driver
 * @returns {number} signed displacement
 */
export function stagedLag(u, time, beat, lagFactor) {
  // The absolute clock is kept in the signature for call-site parity; the phase
  // is fully described by `beat`, so no frame-to-frame integration is needed.
  void time;
  return lagFactor * u * Math.sin(beat - u * lagFactor);
}

/** Seconds for one full causal cycle. @type {number} */
const CAUSAL_CYCLE = 1.45;
/** Seconds an appendage trails the body driver. @type {number} */
const CAUSAL_LAG = 0.27;
/** Seconds the anticipation dip leads the event. @type {number} */
const CAUSAL_ANTICIPATION_LEAD = 0.15;

/**
 * Causal signal set for one event.
 * @typedef {object} CausalSignals
 * @property {number} driver body value at the event
 * @property {number} anticipation dip shortly before the event
 * @property {number} follow appendage value lagging the driver
 */

/**
 * Motion causality: anticipation before the event, body response at the event,
 * appendage lag afterwards. All phases derive from absolute time so
 * random-access renders match sequential playback.
 * @param {number} time absolute seconds
 * @param {number} at event seconds
 * @param {number} [cycle]
 * @param {number} [lag]
 * @returns {CausalSignals}
 */
export function causalChain(time, at, cycle = CAUSAL_CYCLE, lag = CAUSAL_LAG) {
  const radiansPerSecond = (Math.PI * 2) / cycle;
  return {
    driver: Math.sin((time - at) * radiansPerSecond),
    anticipation: Math.max(0, Math.sin((time - at - CAUSAL_ANTICIPATION_LEAD) * radiansPerSecond)),
    follow: Math.sin((time - at - lag) * radiansPerSecond),
  };
}

