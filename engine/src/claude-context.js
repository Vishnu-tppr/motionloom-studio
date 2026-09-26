/**
 * MotionLoom Live → Claude context bridge.
 *
 * When a user steers an animation conversationally, Claude needs structure, not
 * a screenshot. This module builds the exact payload the editor sends: the
 * selection, its editable schema, the relevant source, the storyboard, the
 * motion rules, the recent accepted changes, and the instruction.
 *
 * Contract: pure. The same selection and instruction always serialize to the
 * same bytes, so a steering event can be replayed and diffed.
 */
import { resolveCues, normalizeWords } from './cue-model.js';
import { buildVariants, safeArea } from './variants.js';

/** Instruction used when the user hits "Ask Claude" with an empty prompt. @type {string} */
export const DEFAULT_INSTRUCTION = 'Make this motion slower, more confident, and keep the texture stable.';

/** How many accepted changes travel with a steering request. @type {number} */
export const CONTEXT_HISTORY_LIMIT = 8;

/** Keys that must never leave the project in a steering payload. @type {readonly string[]} */
const REDACTED_KEYS = Object.freeze(['token', 'apiKey', 'api_key', 'secret', 'password', 'env']);

/**
 * @param {unknown} value
 * @returns {boolean}
 */
function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Strip anything that looks like a credential from a nested structure.
 * @template T
 * @param {T} value
 * @returns {T}
 */
export function redact(value) {
  if (Array.isArray(value)) return /** @type {any} */ (value.map(redact));
  if (!isRecord(value)) return value;
  /** @type {Record<string, unknown>} */
  const out = {};
  for (const [key, entry] of Object.entries(value)) {
    if (REDACTED_KEYS.includes(key)) continue;
    out[key] = redact(entry);
  }
  return /** @type {T} */ (/** @type {unknown} */ (out));
}


/**
 * Describe the active object with everything an edit needs.
 * @param {import('./project-contract.js').MotionloomProject} project
 * @param {import('./project-contract.js').MotionloomObject} [object]
 * @param {Record<string, unknown>} [preview] unsaved Live preview values
 * @returns {{ id: string, type: string, name: string, shot: string | null, source: { file: string | null, symbol: string | null }, currentValues: Record<string, unknown>, previewValues: Record<string, unknown>, editableSchema: Record<string, unknown> } | null}
 */
export function describeSelection(project, object, preview = {}) {
  if (!object) return null;
  const shot = (project.shots ?? []).find((candidate) => candidate.id === object.shotId) ?? null;
  return {
    id: object.id,
    type: object.type ?? 'unknown',
    name: object.name ?? object.id,
    shot: shot?.id ?? null,
    source: { file: object.source?.file ?? null, symbol: object.source?.symbol ?? null },
    currentValues: { ...(object.controls ?? {}) },
    previewValues: { ...preview },
    editableSchema: { ...(object.schema ?? {}) },
  };
}

/**
 * The cues near the playhead, so a timing instruction can be grounded in the
 * audio the user is actually looking at.
 * @param {import('./project-contract.js').MotionloomProject} project
 * @param {number} time
 * @param {number} [window] half-width of the window in seconds
 * @returns {Array<{ id: string, label: string, time: number, delta: number, kind: string }>}
 */
export function nearbyCues(project, time, window = 1.5) {
  const words = normalizeWords(isRecord(project.audio) ? project.audio.transcript : null);
  const cues = resolveCues(isRecord(project.audio) ? project.audio.cues : null, {
    shots: project.shots,
    words,
  });
  return cues
    .filter((cue) => cue.time !== null && Math.abs(cue.time - time) <= window)
    .map((cue) => ({
      id: cue.id,
      label: cue.label ?? cue.id,
      time: /** @type {number} */ (cue.time),
      delta: Number((/** @type {number} */ (cue.time) - time).toFixed(3)),
      kind: cue.kind ?? 'absolute',
    }));
}

/**
 * Build the structured steering payload the editor sends to Claude Code.
 * @param {object} input
 * @param {import('./project-contract.js').MotionloomProject} input.project
 * @param {number} input.time current playhead position in seconds
 * @param {string} [input.instruction] the user's natural-language direction
 * @param {import('./project-contract.js').MotionloomObject} [input.object] selected object
 * @param {Record<string, unknown>} [input.preview] unsaved Live preview values
 * @param {Array<Record<string, unknown>>} [input.history] recent accepted transactions
 * @param {string} [input.variantId] active delivery variant
 * @param {string[]} [input.frameRange] affected frame range for QA
 * @returns {Record<string, unknown>} the wire payload
 */
export function buildSteerContext({
  project,
  time,
  instruction = DEFAULT_INSTRUCTION,
  object = null,
  preview = {},
  history = [],
  variantId,
  frameRange,
}) {
  const shot = (project.shots ?? []).find((candidate) => time >= candidate.start && time < candidate.end)
    ?? (project.shots ?? [])[project.shots?.length - 1]
    ?? null;
  const variants = buildVariants(project);
  const variant = variants.find((candidate) => candidate.id === variantId) ?? variants[0] ?? null;
  return redact({
    contract: 'motionloom/steer/1',
    instruction: String(instruction || DEFAULT_INSTRUCTION),
    playhead: {
      time: Number(Number(time).toFixed(3)),
      frame: Math.round(Number(time) * project.meta.fps),
      shot: shot ? { id: shot.id, name: shot.name, start: shot.start, end: shot.end } : null,
    },
    selection: describeSelection(project, object, preview),
    timeline: {
      duration: project.meta.duration,
      fps: project.meta.fps,
      shots: (project.shots ?? []).map((entry) => ({ id: entry.id, name: entry.name, start: entry.start, end: entry.end })),
      nearbyCues: nearbyCues(project, time),
    },
    variant: variant ? { id: variant.id, width: variant.width, height: variant.height, safeArea: safeArea(variant) } : null,
    source: {
      root: 'engine/src/scenes.js',
      contract: project.meta.renderContract,
      token: project.token?.id ?? null,
    },
    motionRules: {
      principle: project.story?.motionPrinciple ?? null,
      determinism: 'Every frame is a pure function of absolute time. No Math.random, no wall clock, no frame accumulation.',
      acceptance: 'Propose a patch, render affected frames, then require explicit user acceptance before writing source.',
    },
    recentChanges: history.slice(-CONTEXT_HISTORY_LIMIT),
    ...(frameRange ? { frameRange } : {}),
  });
}
