/**
 * Canvas Live render runtime.
 *
 * Contract: every frame is a pure function of the current project plus the
 * current absolute time. Random access (`setTime`) and sequential playback must
 * produce identical pixels for the same timestamp, so nothing in the draw path
 * may depend on wall-clock time or previous-frame state.
 */
import { clamp } from './math.js';
import { applyCopy, containTransform } from './variants.js';
import {
  LayerCache,
  drawCachedPaper,
  strokePath,
  temporalFingerprint,
  transitioningRibbon,
} from './motion-kit.js';
import { drawScene } from './scenes.js';

/**
 * @typedef {{ id: string, x: number, y: number, width: number, height: number }} Bounds
 * @typedef {{ type: string, [key: string]: unknown }} RuntimeEvent
 * @typedef {(event: RuntimeEvent) => void} RuntimeListener
 */

export class MotionRuntime {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {import('./project-contract.js').MotionloomProject} project
   */
  constructor(canvas, project) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.project = project;
    this.canvas.width = project.meta.width;
    this.canvas.height = project.meta.height;
    this.time = 0;
    this.playing = false;
    this.preview = {};
    this.bounds = [];
    this.listeners = new Set();
    this.last = 0;
    this.cache = new LayerCache();
    this.metrics = { frameMs: 0, cache: null };
    this.reduce = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false;
    /** @type {import('./variants.js').MotionloomVariant | null} */
    this.variant = null;
  }

  /**
   * Switch the delivery frame and locale copy without touching the project.
   * The scene source is shared, so a `9:16` or `nl` preview never forks the
   * animation; it is a transform over the same deterministic draw.
   * @param {import('./variants.js').MotionloomVariant | null} variant
   * @returns {void}
   */
  setVariant(variant) {
    this.variant = variant && variant.id ? variant : null;
    this.resize();
    this.cache = new LayerCache();
    this.draw();
    this.emit('variant', { variant: this.variant });
  }

  /**
   * Current draw size: the variant frame when one is active, else the master.
   * @returns {{ width: number, height: number }}
   */
  get frame() {
    return this.variant
      ? { width: this.variant.width, height: this.variant.height }
      : { width: this.project.meta.width, height: this.project.meta.height };
  }

  /**
   * Letterbox transform from the master frame into the active variant frame.
   * Returns the identity transform when no variant is active.
   * @returns {{ scale: number, offsetX: number, offsetY: number }}
   */
  get transform() {
    if (!this.variant) return { scale: 1, offsetX: 0, offsetY: 0 };
    const contain = containTransform(this.project.meta, this.variant);
    return { scale: contain.scale, offsetX: contain.offsetX, offsetY: contain.offsetY };
  }

  /**
   * Match the backing store to the active frame. Deterministic: the backing
   * store is always exactly the delivery size, never a rounded CSS size.
   * @returns {void}
   */
  resize() {
    const { width, height } = this.frame;
    if (this.canvas.width === width && this.canvas.height === height) return;
    this.canvas.width = width;
    this.canvas.height = height;
  }

  /**
   * Swap in a new project revision and repaint.
   * @param {import('./project-contract.js').MotionloomProject} project
   * @returns {void}
   */
  updateProject(project) {
    this.project = project;
    this.canvas.width = project.meta.width;
    this.canvas.height = project.meta.height;
    this.draw();
  }
  /**
   * Subscribe to runtime events.
   * @param {RuntimeListener} listener
   * @returns {() => boolean} unsubscribe
   */
  on(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * @param {string} type
   * @param {Record<string, unknown>} [data]
   * @returns {void}
   */
  emit(type, data = {}) {
    for (const listener of this.listeners) listener({ type, ...data });
  }

  /** @returns {import('./project-contract.js').MotionloomShot} active shot at the current time */
  get shot() {
    return this.project.shots.find((shot) => this.time >= shot.start && this.time < shot.end)
      || this.project.shots.at(-1);
  }

  /**
   * Effective controls for one object: saved values, unsaved Live preview, and
   * the active locale's copy. Order matters: a Live preview must win over
   * localized copy, because the user is looking at the preview.
   * @param {string} id
   * @returns {Record<string, unknown>}
   */
  controls(id) {
    const object = this.project.objects.find((candidate) => candidate.id === id);
    return applyCopy({ ...object?.controls, ...this.preview[id] }, this.variant, id);
  }

  /**
   * Apply an unsaved preview patch. Preview state never mutates the project.
   * @param {string} id
   * @param {string} path
   * @param {unknown} value
   * @returns {void}
   */
  setPreview(id, path, value) {
    this.preview[id] = { ...(this.preview[id] || {}), [path]: value };
    this.draw();
    this.emit('preview', { id, path, value });
  }

  /**
   * @param {string} id
   * @returns {void}
   */
  clearPreview(id) {
    delete this.preview[id];
    this.draw();
  }

  /** @returns {void} */
  clearAllPreview() {
    this.preview = {};
    this.draw();
  }

  /**
   * Record hit-test bounds for an object drawn this frame.
   * @param {string} id
   * @param {{ x: number, y: number, width: number, height: number }} bounds
   * @returns {void}
   */
  register(id, bounds) {
    this.bounds.push({ id, ...bounds });
  }

  /**
   * Topmost object whose bounds contain the point.
   * @param {number} x
   * @param {number} y
   * @returns {Bounds | undefined}
   */
  hit(x, y) {
    return [...this.bounds].reverse().find((bounds) => (
      x >= bounds.x && x <= bounds.x + bounds.width
      && y >= bounds.y && y <= bounds.y + bounds.height
    ));
  }

  /**
   * Seek to an absolute time. Clamped so the last frame stays inside the range.
   * @param {number} time seconds
   * @returns {void}
   */
  setTime(time) {
    this.time = clamp(Number(time) || 0, 0, this.project.meta.duration - 0.000001);
    this.draw();
    this.emit('frame', { time: this.time, shot: this.shot });
  }
  /**
   * Paint the current frame from scratch: paper layer, scene, persistent token.
   * @returns {void}
   */
  draw() {
    const start = performance.now();
    const ctx = this.ctx;
    const project = this.project;
    const { width, height } = this.frame;
    const { scale, offsetX, offsetY } = this.transform;
    this.bounds = [];
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, width, height);
    // Master-frame scenes draw into a letterboxed viewport so a 9:16 export
    // keeps the composition instead of stretching it.
    ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, project.meta.width, project.meta.height);
    ctx.clip();
    drawCachedPaper(this.cache, ctx, project.meta.width, project.meta.height, project.meta.seed);
    drawScene(this, ctx, this.time);
    const token = transitioningRibbon(project, this.time);
    strokePath(ctx, token.points, {
      color: project.token.color,
      width: project.token.width,
      alpha: 0.96,
    });
    ctx.restore();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.metrics = {
      frameMs: performance.now() - start,
      cache: this.cache.stats(),
      token: { from: token.from, to: token.to, progress: token.progress },
      variant: this.variant ? { id: this.variant.id, scale, offsetX, offsetY } : null,
    };
    this.emit('draw', { metrics: this.metrics });
  }

  /**
   * Start playback. Reduced-motion users keep the current frame but still get
   * time updates, so the scrubber stays truthful without animating.
   * @returns {void}
   */
  play() {
    if (this.playing) return;
    this.playing = true;
    this.last = performance.now();
    const tick = (now) => {
      if (!this.playing) return;
      const delta = Math.min(0.1, (now - this.last) / 1000);
      this.last = now;
      if (!this.reduce) {
        this.time = (this.time + delta) % this.project.meta.duration;
        this.draw();
        this.emit('frame', { time: this.time, shot: this.shot });
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /** @returns {void} */
  pause() {
    this.playing = false;
  }

  /**
   * @param {string} id
   * @param {number} [time]
   * @returns {string} deterministic fingerprint used by Live QA
   */
  fingerprint(id, time = this.time) {
    return temporalFingerprint(this.project, time, id);
  }
}
