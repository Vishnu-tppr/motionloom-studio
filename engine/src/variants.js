/**
 * MotionLoom Live format and locale variants.
 *
 * A project declares one master frame. A *variant* is a delivery target: a
 * different aspect ratio, a different locale, or both. Variants never fork the
 * animation project; they are a deterministic transform applied on top of the
 * master frame, so `16:9` and `9:16` always read from the same scene source.
 *
 * Contract: pure functions of their arguments. No DOM, no wall clock.
 */

/**
 * @typedef {object} MotionloomVariant
 * @property {string} id
 * @property {string} [label]
 * @property {number} width
 * @property {number} height
 * @property {string} [locale]
 * @property {Record<string, string>} [copy] control key overrides for this locale
 */

/** Aspect presets offered by the studio toolbar. @type {readonly string[]} */
export const ASPECT_IDS = Object.freeze(['16:9', '9:16', '1:1', '4:5']);

/** Master frame used when a project does not declare its own. @type {{ width: number, height: number }} */
export const DEFAULT_FRAME = Object.freeze({ width: 1280, height: 720 });

/** Safe-area inset as a fraction of the frame width, per aspect. @type {Record<string, number>} */
const SAFE_INSET = Object.freeze({ '16:9': 0.05, '9:16': 0.08, '1:1': 0.07, '4:5': 0.08 });

/**
 * Parse an aspect id such as `16:9` into a numeric ratio.
 * @param {string} id
 * @returns {{ width: number, height: number } | null} null when unparseable
 */
export function parseAspect(id) {
  if (typeof id !== 'string') return null;
  const match = /^\s*(\d+(?:\.\d+)?)\s*[:x/]\s*(\d+(?:\.\d+)?)\s*$/i.exec(id);
  if (!match) return null;
  const width = Number(match[1]);
  const height = Number(match[2]);
  if (!(width > 0) || !(height > 0)) return null;
  return { width, height };
}

/**
 * @param {unknown} value
 * @returns {boolean}
 */
function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}


/**
 * Build the delivery variants a project supports.
 * Aspect variants are always derived from the master frame; only locale copy
 * has to be declared in the project, because only the author knows the words.
 * @param {import('./project-contract.js').MotionloomProject} project
 * @returns {MotionloomVariant[]}
 */
export function buildVariants(project) {
  const master = project?.meta ?? DEFAULT_FRAME;
  const width = Number(master.width) || DEFAULT_FRAME.width;
  const height = Number(master.height) || DEFAULT_FRAME.height;
  const shortSide = Math.min(width, height);
  const declared = Array.isArray(project?.variants) ? project.variants : [];
  const locales = Array.isArray(project?.locales) ? project.locales : [];
  /** @type {MotionloomVariant[]} */
  const variants = [];
  for (const id of ASPECT_IDS) {
    const parsed = parseAspect(id);
    if (!parsed) continue;
    const ratio = parsed.width / parsed.height;
    let variantWidth, variantHeight;
    if (ratio >= 1) {
      variantWidth = Math.round(shortSide * ratio);
      variantHeight = Math.round(shortSide);
    } else {
      variantWidth = Math.round(shortSide);
      variantHeight = Math.round(shortSide / ratio);
    }
    variants.push({
      id,
      label: id,
      width: variantWidth,
      height: variantHeight,
    });
  }
  for (const raw of declared) {
    if (!isRecord(raw)) continue;
    const id = typeof raw.id === 'string' ? raw.id : '';
    if (!id || variants.some((variant) => variant.id === id)) continue;
    const parsed = parseAspect(id) ?? parseAspect(typeof raw.aspect === 'string' ? raw.aspect : '');
    const variantWidth = Number.isFinite(raw.width)
      ? Number(raw.width)
      : parsed ? Math.round((height * parsed.width) / parsed.height) : width;
    const variantHeight = Number.isFinite(raw.height) ? Number(raw.height) : height;
    /** @type {MotionloomVariant} */
    const variant = {
      id,
      label: typeof raw.label === 'string' ? raw.label : id,
      width: Math.max(1, Math.round(variantWidth)),
      height: Math.max(1, Math.round(variantHeight)),
    };
    if (typeof raw.locale === 'string' && raw.locale) variant.locale = raw.locale;
    if (isRecord(raw.copy)) {
      /** @type {Record<string, string>} */
      const copy = {};
      for (const [key, value] of Object.entries(raw.copy)) {
        if (typeof value === 'string') copy[key] = value;
      }
      if (Object.keys(copy).length) variant.copy = copy;
    }
    variants.push(variant);
  }
  for (const locale of locales) {
    if (typeof locale !== 'string' || !locale) continue;
    if (variants.some((variant) => variant.id === locale)) continue;
    variants.push({
      id: locale,
      label: locale.toUpperCase(),
      width,
      height,
      locale,
    });
  }
  return variants;
}


/**
 * Safe area rectangle for a variant, in variant pixels.
 * Detectors use this to flag text a platform UI would crop.
 * @param {MotionloomVariant} variant
 * @returns {{ x: number, y: number, width: number, height: number, inset: number }}
 */
export function safeArea(variant) {
  const inset = SAFE_INSET[variant.id] ?? 0.06;
  const horizontal = Math.round(variant.width * inset);
  const vertical = Math.round(horizontal * (variant.height / variant.width));
  return {
    x: horizontal,
    y: vertical,
    width: Math.max(0, variant.width - horizontal * 2),
    height: Math.max(0, variant.height - vertical * 2),
    inset,
  };
}

/**
 * Deterministic "contain" transform from a master frame into a variant frame.
 * The scene is letterboxed, never stretched, so a 9:16 export keeps the master's
 * composition instead of squashing it.
 * @param {{ width: number, height: number }} master
 * @param {MotionloomVariant} variant
 * @returns {{ scale: number, offsetX: number, offsetY: number, width: number, height: number }}
 */
export function containTransform(master, variant) {
  const sourceWidth = Number(master?.width) || DEFAULT_FRAME.width;
  const sourceHeight = Number(master?.height) || DEFAULT_FRAME.height;
  const scale = Math.min(variant.width / sourceWidth, variant.height / sourceHeight);
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  return {
    scale,
    width,
    height,
    offsetX: (variant.width - width) / 2,
    offsetY: (variant.height - height) / 2,
  };
}

/**
 * Apply a variant's locale copy to one object's control map, without mutating
 * the input. Copy keys are scoped paths, so two text objects can be localized
 * independently:
 *   `"<objectId>.<key>"` matches one object, `"*.<key>"` matches every object.
 * Unknown keys are ignored, so copy can never invent an undeclared control.
 * @param {Record<string, unknown>} controls
 * @param {MotionloomVariant} [variant]
 * @param {string} [scope] object id the controls belong to
 * @returns {Record<string, unknown>}
 */
export function applyCopy(controls, variant, scope = '*') {
  const copy = variant?.copy;
  if (!copy) return { ...controls };
  /** @type {Record<string, unknown>} */
  const next = { ...controls };
  for (const [key, value] of Object.entries(controls)) {
    const scoped = copy[`${scope}.${key}`] ?? copy[`*.${key}`];
    if (typeof scoped === 'string') next[key] = scoped;
  }
  return next;
}

/**
 * Summary the studio header shows for the active variant.
 * @param {MotionloomVariant} variant
 * @returns {string}
 */
export function describeVariant(variant) {
  return `${variant.width}×${variant.height}${variant.locale ? ` · ${variant.locale.toUpperCase()}` : ''}`;
}

/**
 * Look up one variant by id.
 * @param {MotionloomVariant[]} variants
 * @param {string} id
 * @returns {MotionloomVariant | undefined}
 */
export function findVariant(variants, id) {
  if (!Array.isArray(variants)) return undefined;
  return variants.find((variant) => variant.id === id);
}
