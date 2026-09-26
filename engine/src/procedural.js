/**
 * Deterministic p5 texture/morph helpers.
 *
 * Static-first rule: expensive unchanging marks render once into a cached
 * layer, then reuse via drawImage. Identity comes from seeded RNG only.
 * Morph rule: sample every state to equal N, then lerp corresponding points.
 */

/**
 * @typedef {object} MotionloomSurface
 * @property {number} width
 * @property {number} height
 */

/**
 * Create a drawing surface (browser canvas, headless stub in Node/tests).
 * @param {number} width
 * @param {number} height
 * @returns {*} canvas element or stub surface
 */
export function surface(width, height) {
  if (typeof document !== 'undefined' && document.createElement) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }
  // Headless/Node fallback so unit tests and tooling can import this module.
  // Mimics just enough of the canvas 2D API for seeded-mark unit tests.
  const noop = () => {};
  return {
    width,
    height,
    __motionloomStub: true,
    getContext: () => ({
      canvas: null,
      fillStyle: '', strokeStyle: '', lineWidth: 1, globalAlpha: 1,
      createPattern: () => ({ __motionloomPattern: true }),
      beginPath: noop, closePath: noop, moveTo: noop, lineTo: noop,
      arc: noop, ellipse: noop, fill: noop, stroke: noop,
      fillRect: noop, save: noop, restore: noop, clip: noop,
    }),
  };
}

/** Immutable cache of rendered static layers. @type {Map<string, *>} */
export const layerCacheStore = new Map();
/** Legacy cache alias (kept for existing imports). @type {Map<string, *>} */
export const __cache = layerCacheStore;

/**
 * Build an immutable layer key from every pixel-affecting input.
 * @param {...unknown} parts
 * @returns {string}
 */
export function cacheKey(...parts) {
  return parts.join(':');
}

/**
 * Render once per key, then return the cached layer.
 * @param {(ctx: *, seed: unknown) => void} drawFn seeded-only painter
 * @param {number} width
 * @param {number} height
 * @param {unknown} seed full seed including object id + style version
 * @returns {*} cached layer
 */
export function cacheLayer(drawFn, width, height, seed) {
  const key = cacheKey(width, height, seed);
  if (layerCacheStore.has(key)) return layerCacheStore.get(key);
  const canvas = surface(width, height);
  const ctx = canvas.getContext('2d');
  drawFn(ctx, seed);
  layerCacheStore.set(key, canvas);
  return canvas;
}

/**
 * Drop cached layers by key prefix (e.g. when a style version retires).
 * @param {string} [prefix]
 * @returns {void}
 */
export function clearCache(prefix = '') {
  for (const key of layerCacheStore.keys()) {
    if (key.startsWith(String(prefix))) layerCacheStore.delete(key);
  }
}

/**
 * Seeded dot tile for texture fills.
 * @param {number} cellSize
 * @param {number} radius
 * @param {string} color
 * @returns {*}
 */
export function dotPattern(cellSize, radius, color) {
  const canvas = surface(cellSize, cellSize);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cellSize / 2, cellSize / 2, radius, 0, Math.PI * 2);
  ctx.fill();
  return ctx.createPattern(canvas, 'repeat');
}

export function linePattern(cellSize, weight, color) {
  const canvas = surface(cellSize, cellSize);
  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = color;
  ctx.lineWidth = weight;
  ctx.beginPath();
  ctx.moveTo(0, cellSize);
  ctx.lineTo(cellSize, 0);
  ctx.stroke();
  return ctx.createPattern(canvas, 'repeat');
}

/**
 * Seeded stipple bound to object space; texture stays attached, never flickers.
 * @param {*} ctx canvas 2D context
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {number} density
 * @param {number} seed from hash(projectSeed, objectId, styleVersion)
 * @param {string} color
 * @returns {void}
 */
export function stipple(ctx, x, y, width, height, density, seed, color) {
  let state = (seed >>> 0) || 1;
  const stream = () => {
    state |= 0;
    state = (state + 0x6D2B79F5) | 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed = ((mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
  const count = Math.floor(width * height * density);
  ctx.fillStyle = color;
  for (let index = 0; index < count; index++) {
    const px = x + (stream() * width);
    const py = y + (stream() * height);
    const pr = 0.5 + (stream() * 1.5);
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * @typedef {{ x: number, y: number }} SampledPoint
 * @typedef {SampledPoint & { nx: number, ny: number }} OrientedPoint
 */

/**
 * Sample a normalized path function `n+1` times (inclusive endpoints).
 * @param {(progress: number) => SampledPoint} pointFn pure function of `0..1`
 * @param {number} sampleCount segments; returns `sampleCount+1` points
 * @returns {SampledPoint[]}
 */
export function samplePath(pointFn, sampleCount) {
  const points = [];
  for (let index = 0; index <= sampleCount; index++) {
    points.push(pointFn(index / sampleCount));
  }
  return points;
}

/**
 * Attach unit normals for ribbon width extrusion.
 * Returns new points; input array unmodified.
 * @param {SampledPoint[]} points
 * @returns {OrientedPoint[]}
 */
export function pathNormals(points) {
  const count = points.length;
  return points.map((point, index) => {
    const prev = points[Math.max(0, index - 1)];
    const next = points[Math.min(count - 1, index + 1)];
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const len = Math.hypot(dx, dy) || 1;
    return {
      ...point,
      nx: -dy / len,
      ny: dx / len,
    };
  });
}

/**
 * True morph: lerp corresponding samples; throws on count mismatch.
 * A crossfade is not a morph.
 * @param {SampledPoint[]} fromPath
 * @param {SampledPoint[]} toPath
 * @param {number} progress `0..1`, clamped
 * @returns {SampledPoint[]} new array
 */
export function morphPath(fromPath, toPath, progress) {
  if (!Array.isArray(fromPath) || !Array.isArray(toPath)) {
    throw new TypeError('morphPath expects two point arrays');
  }
  if (fromPath.length !== toPath.length) {
    throw new RangeError(`morphPath needs matching sample counts, got ${fromPath.length} vs ${toPath.length}`);
  }
  const clamped = Math.max(0, Math.min(1, Number(progress)));
  return fromPath.map((point, index) => ({
    x: point.x + ((toPath[index].x - point.x) * clamped),
    y: point.y + ((toPath[index].y - point.y) * clamped),
  }));
}

/** Default samples per token state. @type {number} */
const DEFAULT_TOKEN_SAMPLES = 200;

export function defineMorphToken(scenesFn) {
  if (typeof scenesFn === 'function') return (u, t, a, b) => scenesFn(u, t, a, b);
  // Config form: { id, states: {name: fn}, correspondence, samples }.
  const { id = 'token', states = {}, samples = DEFAULT_TOKEN_SAMPLES } = scenesFn || {};
  const names = Object.keys(states);
  const sampled = Object.fromEntries(
    names.map(name => [name, samplePath(states[name], samples)])
  );
  const token = (u, t, first = 0, second = 0) => {
    if (names.length < 2) return sampled[names[0]]?.[Math.round(u * samples)] ?? { x: 0, y: 0 };
    const blended = morphPath(sampled[names[0]], sampled[names[1]], first);
    if (names.length <= 2) return blended[Math.round(u * samples)];
    return morphPath(blended, sampled[names[2]], second)[Math.round(u * samples)];
  };
  token.id = id;
  token.states = sampled;
  token.samples = samples;
  return token;
}
