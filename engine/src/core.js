/**
 * Deterministic p5 math/texture helpers.
 *
 * Contract: every helper is a pure function of explicit numeric inputs plus,
 * where relevant, a seeded RNG. Render paths must never use unseeded randomness,
 * wall-clock time, network input, or previous-frame state.
 *
 * PoC provenance: seeded LCG + analytic motion from
 * `proof-of-concept/code/jellyfish-animated.html` and
 * `proof-of-concept/code/follow-a-litle-wonder.html`.
 */

/** Default lower clamp bound. @type {number} */
const DEFAULT_MIN = 0;
/** Default upper clamp bound. @type {number} */
const DEFAULT_MAX = 1;

/**
 * Clamp a value into `[min, max]`.
 * @param {number} value
 * @param {number} [min]
 * @param {number} [max]
 * @returns {number}
 */
export const clamp = (value, min = DEFAULT_MIN, max = DEFAULT_MAX) => Math.max(min, Math.min(max, value));

/**
 * Linear interpolation.
 * @param {number} from
 * @param {number} to
 * @param {number} progress
 * @returns {number}
 */
export const lerp = (from, to, progress) => from + (to - from) * progress;

/** Guard against divide-by-zero in time normalization. @type {number} */
const MIN_DURATION = 1e-9;

/**
 * Normalize time into `0..1` across `[start, end]`, clamped.
 * @param {number} time absolute seconds
 * @param {number} start start seconds
 * @param {number} end end seconds
 * @returns {number}
 */
export const norm = (time, start, end) => clamp((time - start) / Math.max(MIN_DURATION, end - start));

/**
 * Cubic ease-out.
 * @param {number} progress
 * @returns {number}
 */
export const ease = (progress) => 1 - Math.pow(1 - clamp(progress), 3);

/**
 * Cubic ease-in-out.
 * @param {number} progress
 * @returns {number}
 */
export const easeInOut = (progress) => {
  const clamped = clamp(progress);
  if (clamped < 0.5) return 4 * clamped * clamped * clamped;
  return 1 - (Math.pow(-2 * clamped + 2, 3) / 2);
};

/**
 * Smoothstep.
 * @param {number} progress
 * @returns {number}
 */
export const smoothstep = (progress) => {
  const clamped = clamp(progress);
  return clamped * clamped * (3 - 2 * clamped);
};

/**
 * Proximity pulse around an event.
 * @param {number} time
 * @param {number} at event seconds
 * @param {number} [width]
 * @returns {number}
 */
export const pulse = (time, at, width = 0.4) => Math.max(0, 1 - Math.abs(time - at) / width);

/**
 * Triangle ping-pong over a 2-second period.
 * @param {number} time
 * @returns {number}
 */
export const pingpong = (time) => 1 - Math.abs((((time % 2) + 2) % 2) - 1);

/**
 * Sinusoidal cycle.
 * @param {number} time
 * @param {number} [speed]
 * @param {number} [phase]
 * @returns {number}
 */
export const wave = (time, speed = 1, phase = 0) => Math.sin((time * speed + phase) * Math.PI * 2);

/**
 * Back-ease overshoot for snappy entrances.
 * @param {number} progress
 * @returns {number}
 */
export const overshoot = (progress) => {
  const clamped = clamp(progress);
  const falloff = Math.pow(clamped - 1, 3);
  const settle = Math.pow(clamped - 1, 2);
  return 1 + (((OVERSHOOT_STRENGTH + 1) * falloff) + (OVERSHOOT_STRENGTH * settle));
};
/** Elastic ease-out period. @type {number} */
const ELASTIC_PERIOD = 0.3;
/** Exponential ease-out decay rate. @type {number} */
const EXPO_DECAY = 10;
/** Back-ease overshoot strength. @type {number} */
const OVERSHOOT_STRENGTH = 1.70158;

/**
 * Exponential ease-out with an exact `1` endpoint.
 * @param {number} progress
 * @returns {number}
 */
export const easeOutExpo = (progress) => (
  progress === 1 ? 1 : 1 - Math.pow(2, -EXPO_DECAY * clamp(progress))
);

/**
 * Quadratic ease-in.
 * @param {number} progress
 * @returns {number}
 */
export const easeInQuad = (progress) => {
  const clamped = clamp(progress);
  return clamped * clamped;
};

/**
 * Quadratic ease-out.
 * @param {number} progress
 * @returns {number}
 */
export const easeOutQuad = (progress) => {
  const clamped = clamp(progress);
  return clamped * (2 - clamped);
};

/**
 * Elastic ease-out with exact `0`/`1` endpoints.
 * @param {number} progress
 * @returns {number}
 */
export const easeOutElastic = (progress) => {
  const clamped = clamp(progress);
  if (clamped === 0 || clamped === 1) return clamped;
  const scale = (2 * Math.PI) / ELASTIC_PERIOD;
  return (Math.pow(2, -EXPO_DECAY * clamped) * Math.sin((clamped - ELASTIC_PERIOD / 4) * scale)) + 1;
};

/**
 * Quadratic Bézier interpolation across three control values.
 * @param {number} start first control value
 * @param {number} control middle control value
 * @param {number} end third control value
 * @param {number} progress
 * @returns {number}
 */
export const bezier2 = (start, control, end, progress) => {
  const clamped = clamp(progress);
  const inverse = 1 - clamped;
  return (inverse * inverse * start) + (2 * inverse * clamped * control) + (clamped * clamped * end);
};

/** FNV-1a offset basis. @type {number} */
const FNV_OFFSET_BASIS = 2166136261;
/** FNV-1a prime. @type {number} */
const FNV_PRIME = 16777619;

/**
 * Seeded RNG stream (repeatable per seed).
 * @param {number} seed
 * @returns {() => number} values in `0..1`
 */
export function rng(seed) {
  let state = (seed >>> 0) || 1;
  return () => {
    state |= 0;
    state = (state + 0x6D2B79F5) | 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Hash identity parts (seed, object id, style version) into one seed.
 * @param {...unknown} values
 * @returns {number} unsigned 32-bit hash
 */
export function hash(...values) {
  let hashValue = FNV_OFFSET_BASIS;
  for (const char of values.join(':')) {
    hashValue ^= char.charCodeAt(0);
    hashValue = Math.imul(hashValue, FNV_PRIME);
  }
  return hashValue >>> 0;
}
/** Default stipple mark count for full-frame grain. @type {number} */
const DEFAULT_GRAIN_AMOUNT = 1400;
/** Default per-mark grain alpha. @type {number} */
const DEFAULT_GRAIN_ALPHA = 14;
/** Default dot pitch for halftone panels. @type {number} */
const DEFAULT_HALFTONE_SPACING = 11;
/** Default halftone dot radius. @type {number} */
const DEFAULT_HALFTONE_RADIUS = 2.2;
/** Default stroke weight for drawn paths. @type {number} */
const DEFAULT_PATH_WEIGHT = 8;
/** Stroke weight used for rounded-panel outlines. @type {number} */
const PANEL_STROKE_WEIGHT = 2;

/**
 * Re-seed p5's own random generators and hand back a matching seeded stream.
 * Call once per identity so cached layers never reseed mid-render.
 * @template T
 * @param {import('./types.js').MotionloomSketch} p
 * @param {number} seed
 * @param {(random: () => number) => T} draw
 * @returns {T} whatever `draw` returns
 */
export function withSeed(p, seed, draw) {
  p.randomSeed(seed);
  p.noiseSeed(seed);
  return draw(rng(seed));
}

/**
 * Read the clock inside one shot.
 * @param {number} time absolute seconds
 * @param {number} start shot start seconds
 * @param {number} end shot end seconds
 * @returns {import('./types.js').LocalTime}
 */
export function localTime(time, start, end) {
  return { t: norm(time, start, end), seconds: time - start, duration: end - start };
}

/**
 * Deterministic camera wrapper. Never reads frame history, so any time can be
 * evaluated in isolation.
 * @param {import('./types.js').MotionloomSketch} p
 * @param {import('./types.js').CameraOptions} [options]
 * @param {() => void} draw
 * @returns {void}
 */
export function camera(p, options, draw) {
  const { x = p.width / 2, y = p.height / 2, zoom = 1, rotation = 0 } = options ?? {};
  p.push();
  p.translate(p.width / 2, p.height / 2);
  p.rotate(rotation);
  p.scale(zoom);
  p.translate(-x, -y);
  draw();
  p.pop();
}

/**
 * Evenly distributed stipple grain across the whole frame.
 * @param {import('./types.js').MotionloomSketch} p
 * @param {number} [amount] mark count
 * @param {number} [seed]
 * @param {number} [alpha]
 * @returns {void}
 */
export function grain(p, amount = DEFAULT_GRAIN_AMOUNT, seed = 1, alpha = DEFAULT_GRAIN_ALPHA) {
  const random = rng(seed);
  p.push();
  p.noStroke();
  for (let index = 0; index < amount; index += 1) {
    p.fill(random() > 0.5 ? 20 : 255, alpha);
    p.circle(random() * p.width, random() * p.height, 0.4 + random() * 1.2);
  }
  p.pop();
}
/**
 * Rotated halftone dot field clipped to the panel's bounding circle.
 * @param {import('./types.js').MotionloomSketch} p
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {string} color
 * @param {number} [spacing] dot pitch
 * @param {number} [radius] dot radius
 * @param {number} [angle] radians
 * @returns {void}
 */
export function halftone(
  p,
  x,
  y,
  w,
  h,
  color,
  spacing = DEFAULT_HALFTONE_SPACING,
  radius = DEFAULT_HALFTONE_RADIUS,
  angle = 0,
) {
  p.push();
  p.translate(x + w / 2, y + h / 2);
  p.rotate(angle);
  p.noStroke();
  p.fill(color);
  const span = Math.hypot(w, h);
  for (let offsetY = -span / 2; offsetY <= span / 2; offsetY += spacing) {
    for (let offsetX = -span / 2; offsetX <= span / 2; offsetX += spacing) {
      p.circle(offsetX, offsetY, radius * 2);
    }
  }
  p.pop();
}

/**
 * Rounded panel with an optional outline.
 * @param {import('./types.js').MotionloomSketch} p
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {number} radius corner radius
 * @param {string} fill
 * @param {string | null} [stroke]
 * @returns {void}
 */
export function roundedPanel(p, x, y, w, h, radius, fill, stroke = null) {
  p.push();
  if (stroke === null) {
    p.noStroke();
  } else {
    p.stroke(stroke);
    p.strokeWeight(PANEL_STROKE_WEIGHT);
  }
  p.fill(fill);
  p.rect(x, y, w, h, radius);
  p.pop();
}

/**
 * Draw a smooth curve through the given points.
 * @param {import('./types.js').MotionloomSketch} p
 * @param {Array<[number, number]>} points
 * @param {string} color
 * @param {number} [weight]
 * @returns {void}
 */
export function drawPath(p, points, color, weight = DEFAULT_PATH_WEIGHT) {
  p.push();
  p.noFill();
  p.stroke(color);
  p.strokeWeight(weight);
  p.strokeCap(p.ROUND);
  p.strokeJoin(p.ROUND);
  p.beginShape();
  for (const [x, y] of points) p.curveVertex(x, y);
  p.endShape();
  p.pop();
}

/**
 * Optional p5.brush enhancement with a deterministic p5 fallback.
 *
 * p5.brush is an enhancement, never a requirement: if it is absent or throws,
 * the plain p5 `fallback` draws the same composition so renders stay repeatable.
 * @template T
 * @param {import('./types.js').MotionloomSketch} p
 * @param {((brush: unknown) => T) | null | undefined} drawBrush
 * @param {(p: import('./types.js').MotionloomSketch) => T} fallback
 * @returns {T}
 */
export function safeBrush(p, drawBrush, fallback) {
  if (typeof drawBrush === 'function' && globalThis.brush) {
    try {
      return drawBrush(globalThis.brush);
    } catch {
      // Deliberate boundary: brush is decorative, so a failure must not break the
      // frame. Fall through to the deterministic p5 path instead.
    }
  }
  return fallback(p);
}
