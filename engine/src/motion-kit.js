/**
 * Canvas Live deterministic helpers.
 *
 * PoC rules enforced here: cache-once immutable layers, seeded particle
 * identity, equal-N token morphs, and analytic motion from absolute time.
 */
import { clamp, easeOut, hashSeed, morphPaths, rng, samplePath } from './math.js';
import { layerKey } from './project-contract.js';

/**
 * @typedef {{ x: number, y: number }} RibbonPoint
 * @typedef {{ points: RibbonPoint[], from: string, to: string, progress: number }} RibbonTransition
 * @typedef {{ entries: number, hits: number, misses: number }} CacheStats
 */

/** Paper texture speck count. @type {number} */
const PAPER_SPECKS = 7000;
/** Default morph window in seconds when the project does not declare one. @type {number} */
const DEFAULT_MORPH_WINDOW = 0.38;
/** Default ribbon sample count when the project does not declare one. @type {number} */
const DEFAULT_TOKEN_SAMPLES = 120;

/**
 * Immutable render-once layer cache.
 *
 * Every pixel-affecting input belongs in the key so a cached layer can never be
 * reused for a different frame. The `paint` callback must be seeded-only.
 */
export class LayerCache {
  constructor() {
    this.layers = new Map();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Return a cached immutable layer, painting exactly once per key.
   * @param {string} key full key including every pixel-affecting input
   * @param {number} width
   * @param {number} height
   * @param {(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void} paint seeded-only painter
   * @returns {HTMLCanvasElement}
   */
  get(key, width, height, paint) {
    const existing = this.layers.get(key);
    if (existing) {
      this.hits += 1;
      return existing.canvas;
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    paint(canvas.getContext('2d'), canvas);
    this.layers.set(key, { canvas, key });
    this.misses += 1;
    return canvas;
  }

  /**
   * Drop cached layers by key prefix (e.g. when a style version retires).
   * @param {string} [prefix]
   * @returns {void}
   */
  clear(prefix = '') {
    for (const key of this.layers.keys()) {
      if (key.startsWith(prefix)) this.layers.delete(key);
    }
  }

  /** @returns {CacheStats} */
  stats() {
    return { entries: this.layers.size, hits: this.hits, misses: this.misses };
  }
}
/**
 * Named token states. Every state is a normalized path function of `u` in
 * `0..1`, so all states share one resolution and can be morphed point-to-point.
 * @type {Record<string, (u: number) => RibbonPoint>}
 */
export const pathStates = {
  signal: (u) => ({ x: 80 + (1120 * u), y: 380 + (36 * Math.sin(u * Math.PI * 4)) }),
  smile: (u) => ({ x: 270 + (740 * u), y: 330 + (180 * Math.sin(u * Math.PI)) }),
  orbit: (u) => {
    const angle = (u * Math.PI * 2) - (Math.PI / 2);
    const radius = 200;
    return { x: 640 + (Math.cos(angle) * radius), y: 360 + (Math.sin(angle) * radius) };
  },
  trace: (u) => ({ x: 210 + (860 * u), y: 480 - (250 * easeOut(u)) + (45 * Math.sin(u * Math.PI * 3)) }),
  mark: (u) => (u < 0.5
    ? { x: 400 + (480 * u), y: 310 + (260 * u) }
    : { x: 400 + (480 * u), y: 570 - (260 * (u - 0.5)) }),
};

/**
 * Sample one named token state to a fixed point count.
 * @param {string} state
 * @param {number} [count]
 * @returns {RibbonPoint[]}
 */
export function ribbonPath(state, count = DEFAULT_TOKEN_SAMPLES) {
  return samplePath(pathStates[state] ?? pathStates.signal, count);
}

/**
 * @typedef {object} RibbonProject
 * @property {{ id: string, start: number, end: number, tokenState: string }[]} shots
 * @property {{ samples?: number, morphWindow?: number }} token
 */

/**
 * Interpolate the persistent ribbon between adjacent token states.
 *
 * Both states are sampled to the same N, then corresponding points are morphed
 * analytically from absolute time. A crossfade is not a morph.
 * @param {RibbonProject} project
 * @param {number} time absolute seconds
 * @returns {RibbonTransition}
 */
export function transitioningRibbon(project, time) {
  const { shots } = project;
  const foundIndex = shots.findIndex((shot) => time >= shot.start && time < shot.end);
  const shotIndex = foundIndex < 0 ? shots.length - 1 : foundIndex;
  const shot = shots[shotIndex];
  const morphWindow = project.token.morphWindow ?? DEFAULT_MORPH_WINDOW;
  const local = time - shot.start;

  let from = shot.tokenState;
  let to = shot.tokenState;
  let progress = 0;

  if (shotIndex > 0 && local < morphWindow) {
    from = shots[shotIndex - 1].tokenState;
    to = shot.tokenState;
    progress = easeOut(local / morphWindow);
  } else if (shotIndex < shots.length - 1 && shot.end - time < morphWindow) {
    from = shot.tokenState;
    to = shots[shotIndex + 1].tokenState;
    progress = easeOut(1 - ((shot.end - time) / morphWindow));
  }

  const samples = project.token.samples ?? DEFAULT_TOKEN_SAMPLES;
  return {
    points: morphPaths(ribbonPath(from, samples), ribbonPath(to, samples), progress),
    from,
    to,
    progress,
  };
}

/**
 * Stroke a polyline with rounded joins.
 * @param {CanvasRenderingContext2D} ctx
 * @param {RibbonPoint[]} points
 * @param {{ color?: string, width?: number, alpha?: number, dash?: number[] }} [options]
 * @returns {void}
 */
export function strokePath(ctx, points, { color = '#f55372', width = 12, alpha = 1, dash = [] } = {}) {
  if (!points.length) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let index = 1; index < points.length; index += 1) {
    ctx.lineTo(points[index].x, points[index].y);
  }
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.setLineDash(dash);
  ctx.stroke();
  ctx.restore();
}
/** Paper base color. @type {string} */
const PAPER_COLOR = '#f4f0e5';

/**
 * Paint the deterministic paper texture. Cached once and reused.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} width
 * @param {number} height
 * @param {number} [seed]
 * @returns {void}
 */
export function drawPaper(ctx, width, height, seed = 1) {
  const random = rng(seed);
  ctx.fillStyle = PAPER_COLOR;
  ctx.fillRect(0, 0, width, height);
  ctx.save();
  ctx.globalAlpha = 0.07;
  for (let index = 0; index < PAPER_SPECKS; index += 1) {
    const value = random() > 0.5 ? 26 : 255;
    ctx.fillStyle = `rgb(${value},${value},${value})`;
    ctx.fillRect(random() * width, random() * height, 0.7 + (random() * 1.2), 0.7 + (random() * 1.2));
  }
  ctx.restore();
}

/**
 * Draw the paper layer through the cache so texture is painted exactly once.
 * @param {LayerCache} cache
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} width
 * @param {number} height
 * @param {number} seed
 * @returns {void}
 */
export function drawCachedPaper(cache, ctx, width, height, seed) {
  const paper = cache.get(
    layerKey('paper', width, height, seed),
    width,
    height,
    (layer) => drawPaper(layer, width, height, seed),
  );
  ctx.drawImage(paper, 0, 0);
}

/**
 * @typedef {object} HalftoneOptions
 * @property {number} [x]
 * @property {number} [y]
 * @property {number} [width]
 * @property {number} [height]
 * @property {string} [color]
 * @property {number} [spacing]
 * @property {number} [radius]
 * @property {number} [angle]
 * @property {number} [seed]
 * @property {number} [alpha]
 */

/**
 * Paint a seeded halftone dot field that is stable across frames.
 * @param {CanvasRenderingContext2D} ctx
 * @param {HalftoneOptions} [options]
 * @returns {void}
 */
export function halftone(ctx, {
  x = 0,
  y = 0,
  width = 200,
  height = 200,
  color = '#13203f',
  spacing = 9,
  radius = 2,
  angle = 0,
  seed = 1,
  alpha = 0.22,
} = {}) {
  const random = rng(seed);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.globalAlpha *= alpha;
  for (let dotY = -height; dotY < height * 2; dotY += spacing) {
    for (let dotX = -width; dotX < width * 2; dotX += spacing) {
      const edge = Math.max(0, 1 - Math.abs((dotX - (width / 2)) / (width * 0.75)));
      ctx.beginPath();
      ctx.arc(dotX + ((random() - 0.5) * 1.2), dotY + ((random() - 0.5) * 1.2), Math.max(0.2, radius * edge), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}
/**
 * @typedef {object} StableParticle
 * @property {number} id
 * @property {number} x
 * @property {number} y
 * @property {number} size
 * @property {number} phase
 * @property {number} speed
 * @property {number} alpha
 */

/**
 * Build seeded particle identity once so drift never flickers between frames.
 * @param {number} seed
 * @param {string} id namespace for this particle field
 * @param {number} count
 * @param {{ width: number, height: number }} bounds
 * @returns {StableParticle[]}
 */
export function stableParticles(seed, id, count, bounds) {
  const random = rng(hashSeed(seed, id, 'particles'));
  return Array.from({ length: count }, (_, index) => ({
    id: index,
    x: random() * bounds.width,
    y: random() * bounds.height,
    size: 1 + (random() * 4),
    phase: random() * Math.PI * 2,
    speed: 0.25 + (random() * 0.65),
    alpha: 0.18 + (random() * 0.45),
  }));
}

/**
 * @typedef {object} FingerprintProject
 * @property {{ seed: number }} meta
 * @property {{ id: string, controls?: unknown }[]} objects
 */

/**
 * Deterministic fingerprint for one object at one timestamp.
 *
 * Same project + same time + same id must produce identical output.
 * Any difference means TEMPORAL TEXTURE INSTABILITY.
 * @param {FingerprintProject} project
 * @param {number} time
 * @param {string} objectId
 * @returns {string}
 */
export function temporalFingerprint(project, time, objectId) {
  const objects = Array.isArray(project.objects) ? project.objects : [];
  const found = objects.find((object) => object.id === objectId);
  return JSON.stringify({
    seed: project.meta.seed,
    id: objectId,
    time: Number(time.toFixed(6)),
    controls: found?.controls,
  });
}

/**
 * Read the nearest ribbon point for a normalized position along the path.
 * @param {RibbonPoint[]} points
 * @param {number} position normalized `0..1`
 * @returns {RibbonPoint}
 */
export function tokenPoint(points, position) {
  if (!points.length) return { x: 0, y: 0 };
  const index = clamp(Math.floor(position * (points.length - 1)), 0, points.length - 1);
  return points[index];
}
