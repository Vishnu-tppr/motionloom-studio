/**
 * Canonical Live-runtime math: seeds, easing, paths, morphs.
 *
 * Contract: pure functions of explicit inputs only. Seeded RNG streams must
 * be repeatable; absolute-time inputs must produce identical outputs on
 * repeat calls so random-access renders match sequential playback.
 */

/** Lower clamp bound default. @type {number} */
const DEFAULT_MIN = 0;
/** Upper clamp bound default. @type {number} */
const DEFAULT_MAX = 1;

/** FNV-1a offset basis for seeded identity hashing. @type {number} */
const FNV_OFFSET_BASIS = 2166136261;
/** FNV-1a prime for seeded identity hashing. @type {number} */
const FNV_PRIME = 16777619;
/** Default sampled point count for a normalized path. @type {number} */
const DEFAULT_SAMPLE_COUNT = 120;
/** Elastic ease-out base. @type {number} */
const ELASTIC_BASE = 2;
/** Elastic ease-out decay rate. @type {number} */
const ELASTIC_DECAY = 10;

/**
 * Clamp a value into `[min, max]`.
 * @param {number} value
 * @param {number} [min]
 * @param {number} [max]
 * @returns {number}
 */
export const clamp = (value, min = DEFAULT_MIN, max = DEFAULT_MAX) => Math.max(min, Math.min(max, value));

/**
 * Normalize a value into `0..1` across `[start, end]`.
 * @param {number} value
 * @param {number} start
 * @param {number} end
 * @returns {number}
 */
export const norm = (value, start, end) => (start === end ? 0 : clamp((value - start) / (end - start)));

/**
 * Linear interpolation.
 * @param {number} from
 * @param {number} to
 * @param {number} progress
 * @returns {number}
 */
export const lerp = (from, to, progress) => from + (to - from) * progress;

/**
 * Smoothstep easing.
 * @param {number} progress
 * @returns {number}
 */
export const smooth = (progress) => {
  const clamped = clamp(progress);
  return clamped * clamped * (3 - 2 * clamped);
};

/**
 * Quartic ease-out.
 * @param {number} progress
 * @returns {number}
 */
export const easeOut = (progress) => 1 - Math.pow(1 - clamp(progress), 4);

/**
 * Quartic ease-in-out with symmetric clamping at both edges.
 * @param {number} progress
 * @returns {number}
 */
export const easeInOut = (progress) => {
  const clamped = clamp(progress);
  return clamped < 0.5
    ? 8 * clamped ** 4
    : 1 - (Math.pow(-2 * clamped + 2, 4) / 2);
};

/**
 * Exponential ease-out with exact endpoints.
 * @param {number} progress
 * @returns {number}
 */
export const elasticOut = (progress) => {
  const clamped = clamp(progress);
  if (clamped === 0 || clamped === 1) return clamped;
  return Math.pow(ELASTIC_BASE, -ELASTIC_DECAY * clamped)
    * Math.sin(((clamped * 10 - 0.75) * Math.PI * 2) / 3) + 1;
};

/**
 * Smooth entrance phase over a duration.
 * @param {number} time absolute seconds
 * @param {number} start start seconds
 * @param {number} duration duration seconds
 * @returns {number}
 */
export const phase = (time, start, duration) => smooth(norm(time, start, start + duration));

/**
 * Damped oscillation, silent before `t < 0` for clean entrances.
 * @param {number} time seconds since event
 * @param {number} [frequency]
 * @param {number} [decay]
 * @returns {number}
 */
export const damped = (time, frequency = 3, decay = 4) => (time < 0
  ? 0
  : Math.exp(-decay * time) * Math.sin(time * Math.PI * 2 * frequency));

/**
 * FNV-1a string hash for seeded identity.
 * @param {string} value
 * @returns {number} unsigned 32-bit hash
 */
export function hashString(value) {
  let hashValue = FNV_OFFSET_BASIS;
  for (const char of String(value)) {
    hashValue ^= char.charCodeAt(0);
    hashValue = Math.imul(hashValue, FNV_PRIME);
  }
  return hashValue >>> 0;
}

/**
 * Hash several identity parts (seed, object id, style version) into one seed.
 * @param {...unknown} parts
 * @returns {number}
 */
export function hashSeed(...parts) {
  return hashString(parts.join(':'));
}

/**
 * Seeded mulberry-style RNG stream.
 *
 * NOTE: this is the Live-runtime stream. `core.js` exports a second, separately
 * pinned stream for the p5 preview. Their bit-level sequences differ on purpose
 * (different 32-bit coercion steps), so both are locked by
 * `engine/test/determinism.test.mjs`. Do not merge them without re-baselining
 * every rendered frame.
 * @param {number} [seed]
 * @returns {() => number} function returning `0..1`
 */
export function rng(seed = 1) {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let mixed = state;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Linearly blend two path points.
 * @param {import('./types.js').PathPoint} from
 * @param {import('./types.js').PathPoint} to
 * @param {number} progress
 * @returns {import('./types.js').PathPoint} new point, inputs unmodified
 */
export const mixPoint = (from, to, progress) => ({
  x: lerp(from.x, to.x, progress),
  y: lerp(from.y, to.y, progress),
});

/**
 * Sample a normalized path function `count` times.
 * @param {(progress: number) => import('./types.js').PathPoint} pointFn pure function of `0..1`
 * @param {number} [count]
 * @returns {Array<import('./types.js').PathPoint>}
 */
export function samplePath(pointFn, count = DEFAULT_SAMPLE_COUNT) {
  return Array.from({ length: count }, (_, index) => pointFn(index / (count - 1)));
}

/**
 * Morph corresponding samples of two equal-length paths.
 *
 * NOTE: true-morph path. Use equal-N sampling upstream and prefer the strict
 * `procedural.js` `morphPath`, which throws on a sample-count mismatch instead
 * of silently truncating. This tolerant variant exists for cached ribbon
 * previews where paths are already known to match.
 * @param {Array<import('./types.js').PathPoint>} fromPath
 * @param {Array<import('./types.js').PathPoint>} toPath
 * @param {number} progress
 * @returns {Array<import('./types.js').PathPoint>} new array, inputs unmodified
 */
export function morphPaths(fromPath, toPath, progress) {
  const count = Math.min(fromPath.length, toPath.length);
  return Array.from({ length: count }, (_, index) => mixPoint(fromPath[index], toPath[index], progress));
}

