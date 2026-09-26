/**
 * Inspectable draw registry for the p5 preview.
 *
 * Tracks the objects drawn in the current frame so the preview can hit-test a
 * click and report bounds. Registration never mutates caller metadata, and each
 * frame starts from an empty list so stale bounds cannot survive a seek.
 *
 * STATUS: not imported by any entry point yet. Kept as the preview-side
 * counterpart to the Canvas Live runtime hit test in `runtime.js`.
 */

/**
 * @typedef {object} InspectableMeta
 * @property {string} id object id
 * @property {{ x: number, y: number, width: number, height: number }} bounds frame-space bounds
 * @property {Record<string, unknown>} [source]
 * @property {Record<string, unknown>} [controls]
 */

/**
 * Per-frame registry of drawn, inspectable objects.
 */
export class SceneRegistry {
  constructor() {
    /** @type {Map<string, InspectableMeta>} */
    this.items = new Map();
    /** @type {InspectableMeta[]} */
    this.frame = [];
  }

  /** Clear the per-frame list before a new draw pass. @returns {void} */
  begin() {
    this.frame = [];
  }

  /**
   * Record one drawn item for this frame.
   * @param {InspectableMeta} item
   * @returns {void}
   */
  register(item) {
    const safe = { ...item, bounds: { ...item.bounds } };
    const nextItems = new Map(this.items);
    nextItems.set(item.id, safe);
    this.items = nextItems;
    this.frame = [...this.frame, safe];
  }

  /**
   * Copy of this frame's items in draw order.
   * @returns {InspectableMeta[]}
   */
  list() {
    return this.frame.map((item) => ({ ...item }));
  }

  /**
   * Topmost item whose bounds contain the point.
   * @param {number} x
   * @param {number} y
   * @returns {InspectableMeta | null}
   */
  hit(x, y) {
    return [...this.frame].reverse().find(({ bounds }) => (
      x >= bounds.x
      && x <= bounds.x + bounds.width
      && y >= bounds.y
      && y <= bounds.y + bounds.height
    )) || null;
  }

  /**
   * Latest registered item with this id.
   * @param {string} id
   * @returns {InspectableMeta | null}
   */
  get(id) {
    return this.items.get(id) || null;
  }
}

/** Shared registry instance for the preview. @type {SceneRegistry} */
export const registry = new SceneRegistry();

/**
 * Register an inspectable draw call without mutating caller metadata.
 * @param {string} id object id
 * @param {Record<string, unknown>} meta source + bounds metadata
 * @param {() => void} draw
 * @returns {void}
 */
export function inspectable(id, meta, draw) {
  registry.register({ id, ...meta });
  draw();
}
