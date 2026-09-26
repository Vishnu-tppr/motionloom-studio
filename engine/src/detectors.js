/**
 * MotionLoom Live deterministic detectors.
 *
 * These rules run without a model. Claude handles subjective direction
 * ("make this feel more premium"); this module handles measurable defects, so
 * the same broken project always produces the same finding list.
 *
 * Every detector is a pure function of the project plus an optional sample
 * provider. Nothing here reads the wall clock or unseeded randomness.
 */
import { normalizeCues, normalizeWords, resolveCue, validateCues } from './cue-model.js';
import { buildVariants, safeArea } from './variants.js';

/**
 * @typedef {object} DetectorFinding
 * @property {'error' | 'warning' | 'info'} severity
 * @property {string} code
 * @property {string} message
 * @property {string} [frame] shot id or object id the finding belongs to
 */

/** Timeline continuity tolerance in seconds. @type {number} */
const EPSILON = 0.0001;

/** Default minimum rendered type height in pixels at the master frame. @type {number} */
const MIN_TYPE_HEIGHT = 18;

/** Default peak number of objects allowed to move at the same instant. @type {number} */
const MAX_CONCURRENT_MOTION = 4;

/**
 * True only for a plain object, so an absent or malformed audio payload can be
 * narrowed without throwing.
 * @param {unknown} value
 * @returns {boolean}
 */
function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Timeline continuity: start at zero, no gaps, no overlaps, ends on duration.
 * @param {import('./project-contract.js').MotionloomProject} project
 * @returns {DetectorFinding[]}
 */
export function detectTimeline(project) {
  /** @type {DetectorFinding[]} */
  const findings = [];
  const shots = [...(project.shots ?? [])].sort((a, b) => a.start - b.start);
  if (!shots.length) {
    return [{ severity: 'error', code: 'NO_SHOTS', message: 'Project has no shots' }];
  }
  if (Math.abs(shots[0].start) > EPSILON) {
    findings.push({ severity: 'error', code: 'START_GAP', message: 'Timeline must start at 0', frame: shots[0].id });
  }
  for (let i = 1; i < shots.length; i++) {
    const gap = shots[i].start - shots[i - 1].end;
    if (Math.abs(gap) > EPSILON) {
      findings.push({
        severity: 'error',
        code: gap > 0 ? 'SHOT_GAP' : 'SHOT_OVERLAP',
        message: gap > 0
          ? `${gap.toFixed(3)}s gap before ${shots[i].id}`
          : `${Math.abs(gap).toFixed(3)}s overlap before ${shots[i].id}`,
        frame: shots[i].id,
      });
    }
  }
  const last = shots[shots.length - 1];
  if (Math.abs(last.end - project.meta.duration) > EPSILON) {
    findings.push({
      severity: 'error',
      code: 'DURATION_MISMATCH',
      message: `Last shot ends at ${last.end}s but the project duration is ${project.meta.duration}s`,
      frame: last.id,
    });
  }
  for (const shot of shots) {
    if (!(shot.end > shot.start)) {
      findings.push({ severity: 'error', code: 'EMPTY_SHOT', message: `${shot.id} has no duration`, frame: shot.id });
    }
  }
  return findings;
}

/**
 * Source mapping and editable schema: every object must be addressable by
 * Claude, otherwise a steering instruction can never become a patch.
 * @param {import('./project-contract.js').MotionloomProject} project
 * @returns {DetectorFinding[]}
 */
export function detectObjects(project) {
  /** @type {DetectorFinding[]} */
  const findings = [];
  const seen = new Set();
  for (const object of project.objects ?? []) {
    if (!object.id) {
      findings.push({ severity: 'error', code: 'MISSING_OBJECT_ID', message: 'An object has no id' });
      continue;
    }
    if (seen.has(object.id)) {
      findings.push({ severity: 'error', code: 'DUPLICATE_OBJECT_ID', message: `${object.id} is declared twice`, frame: object.id });
    }
    seen.add(object.id);
    if (!object.source?.file) {
      findings.push({ severity: 'error', code: 'SOURCE_MAP', message: `${object.id} lacks source mapping`, frame: object.id });
    }
    if (!object.schema || !Object.keys(object.schema).length) {
      findings.push({ severity: 'error', code: 'NO_SCHEMA', message: `${object.id} has no editable controls`, frame: object.id });
    }
    if (object.shotId && !(project.shots ?? []).some((shot) => shot.id === object.shotId)) {
      findings.push({ severity: 'error', code: 'ORPHAN_OBJECT', message: `${object.id} references unknown shot ${object.shotId}`, frame: object.id });
    }
    for (const [key, schema] of Object.entries(object.schema ?? {})) {
      const error = checkControlValue(object, key, schema, object.controls?.[key]);
      if (error) findings.push(error);
    }
  }
  return findings;
}

/**
 * One control value against its declared schema.
 * @param {import('./project-contract.js').MotionloomObject} object
 * @param {string} key
 * @param {unknown} schema
 * @param {unknown} value
 * @returns {DetectorFinding | null}
 */
function checkControlValue(object, key, schema, value) {
  if (value === undefined) {
    return { severity: 'info', code: 'UNSET_CONTROL', message: `${object.id}.${key} has no value`, frame: object.id };
  }
  if (schema === 'text' && typeof value !== 'string') {
    return { severity: 'error', code: 'CONTROL_TYPE', message: `${object.id}.${key} must be text`, frame: object.id };
  }
  if (schema === 'color' && !(typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value))) {
    return { severity: 'error', code: 'CONTROL_COLOR', message: `${object.id}.${key} must be a hex color`, frame: object.id };
  }
  if (Array.isArray(schema) && typeof schema[0] === 'string') {
    if (typeof value !== 'string' || !schema.includes(value)) {
      return { severity: 'error', code: 'CONTROL_OPTION', message: `${object.id}.${key} is not an allowed option`, frame: object.id };
    }
  }
  if (Array.isArray(schema) && typeof schema[0] === 'number') {
    const [min, max] = schema;
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return { severity: 'error', code: 'CONTROL_TYPE', message: `${object.id}.${key} must be a number`, frame: object.id };
    }
    if (value < min || value > max) {
      return { severity: 'error', code: 'CONTROL_RANGE', message: `${object.id}.${key}=${value} is outside [${min}, ${max}]`, frame: object.id };
    }
  }
  return null;
}

/**
 * Cues and transcript, delegated to the cue model so the timeline and the QA
 * tab can never disagree about a timestamp.
 * @param {import('./project-contract.js').MotionloomProject} project
 * @returns {DetectorFinding[]}
 */
export function detectCues(project) {
  return /** @type {DetectorFinding[]} */ (validateCues(project.audio, {
    shots: project.shots,
    words: normalizeWords(isRecord(project.audio) ? project.audio.transcript : null),
    duration: project.meta.duration,
  }));
}

/**
 * Every delivery variant must be a real frame, and a loop must be declared as
 * one. A non-looping project that expects a seamless cut is a manual edit that
 * no model would reliably catch.
 * @param {import('./project-contract.js').MotionloomProject} project
 * @returns {DetectorFinding[]}
 */
export function detectVariants(project) {
  /** @type {DetectorFinding[]} */
  const findings = [];
  for (const variant of buildVariants(project)) {
    if (!(variant.width > 0) || !(variant.height > 0)) {
      findings.push({ severity: 'error', code: 'BAD_VARIANT', message: `Variant ${variant.id} has no usable size`, frame: variant.id });
    }
  }
  if (project.meta.loop && project.meta.duration <= 1) {
    findings.push({ severity: 'warning', code: 'SHORT_LOOP', message: 'A loop shorter than one second cannot settle' });
  }
  return findings;
}

/**
 * Composition checks against a variant's safe area: text and objects must stay
 * inside the frame every platform will crop.
 * @param {import('./project-contract.js').MotionloomProject} project
 * @param {string} [variantId]
 * @returns {DetectorFinding[]}
 */
export function detectSafeArea(project, variantId) {
  /** @type {DetectorFinding[]} */
  const findings = [];
  const variants = buildVariants(project);
  const variant = variants.find((candidate) => candidate.id === variantId) ?? variants[0];
  if (!variant) return findings;
  const area = safeArea(variant);
  const scaleX = variant.width / (project.meta.width || variant.width);
  const scaleY = variant.height / (project.meta.height || variant.height);

  for (const object of project.objects ?? []) {
    const x = Number(object.controls?.x);
    const y = Number(object.controls?.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    const point = { x: x * scaleX, y: y * scaleY };
    if (point.x < area.x || point.x > area.x + area.width
      || point.y < area.y || point.y > area.y + area.height) {
      findings.push({
        severity: 'warning',
        code: 'OUTSIDE_SAFE_AREA',
        message: `${object.name || object.id} sits outside the ${variant.id} safe area`,
        frame: object.id,
      });
    }
  }
  return findings;
}

/**
 * @typedef {object} FrameSample
 * @property {number} time seconds
 * @property {number} [ink] non-background coverage in `0..1`
 * @property {string} [fingerprint] pixel fingerprint for that frame
 * @property {Array<{ id: string, x: number, y: number, scale: number }>} [objects]
 */

/**
 * Render-level defects detected from sampled frames.
 *
 * `samples` must come from the deterministic renderer, so these findings are
 * reproducible: a blank frame on a seek is a blank frame on the export.
 * @param {FrameSample[]} samples
 * @param {{ minInk?: number }} [options]
 * @returns {DetectorFinding[]}
 */
export function detectFrames(samples, options = {}) {
  /** @type {DetectorFinding[]} */
  const findings = [];
  if (!Array.isArray(samples) || !samples.length) return findings;
  const minInk = Number.isFinite(options.minInk) ? Number(options.minInk) : 0.012;

  for (const sample of samples) {
    if (Number.isFinite(sample.ink) && sample.ink < minInk) {
      findings.push({
        severity: 'error',
        code: 'BLANK_FRAME',
        message: `Frame at ${sample.time.toFixed(2)}s is effectively empty`,
      });
    }
  }

  for (let i = 1; i < samples.length; i++) {
    const previous = samples[i - 1];
    const current = samples[i];
    if (!previous.fingerprint || !current.fingerprint) continue;
    if (previous.fingerprint === current.fingerprint) {
      findings.push({
        severity: 'warning',
        code: 'STATIC_FRAMES',
        message: `Identical frames at ${previous.time.toFixed(2)}s and ${current.time.toFixed(2)}s`,
      });
      break;
    }
  }

  for (let i = 1; i < samples.length; i++) {
    const previous = samples[i - 1];
    const current = samples[i];
    if (previous.ink !== undefined && current.ink !== undefined
      && previous.ink >= minInk && current.ink >= minInk
      && Math.abs(current.ink - previous.ink) > 0.45) {
      findings.push({
        severity: 'warning',
        code: 'ONE_FRAME_FLASH',
        message: `Coverage jumps between ${previous.time.toFixed(2)}s and ${current.time.toFixed(2)}s`,
      });
      break;
    }
  }

  const atTime = (time) => (samples.find((sample) => Math.abs(sample.time - time) < 1e-6)?.objects) ?? [];
  for (const time of [...new Set(samples.map((sample) => sample.time))]) {
    const moving = atTime(time).filter((entry) => Number.isFinite(entry.scale) && entry.scale > 0);
    if (moving.length > MAX_CONCURRENT_MOTION) {
      findings.push({
        severity: 'warning',
        code: 'CONCURRENT_MOTION',
        message: `${moving.length} objects animate at ${time.toFixed(2)}s; more than ${MAX_CONCURRENT_MOTION} reads as noise`,
      });
      break;
    }
  }

  for (const sample of samples) {
    const byId = new Map();
    for (const entry of sample.objects ?? []) {
      const previous = byId.get(entry.id);
      if (previous) {
        const jump = Math.hypot(entry.x - previous.x, entry.y - previous.y);
        if (jump > 320) {
          findings.push({
            severity: 'warning',
            code: 'POSITION_JUMP',
            message: `${entry.id} moves ${jump.toFixed(0)}px between sampled frames`,
            frame: entry.id,
          });
        }
      }
      byId.set(entry.id, entry);
    }
    if ((sample.objects ?? []).some((entry) => Number.isFinite(entry.scale) && entry.scale <= 0)) {
      findings.push({
        severity: 'error',
        code: 'ZERO_SCALE',
        message: 'An object is scaled to zero at render time',
      });
    }
  }

  return findings;
}

/**
 * Run every model-free detector and summarize the result.
 * Findings are sorted by severity so the QA tab always leads with real errors.
 * @param {import('./project-contract.js').MotionloomProject} project
 * @param {{ variantId?: string, samples?: FrameSample[], minInk?: number }} [options]
 * @returns {{ ok: boolean, counts: { error: number, warning: number, info: number }, findings: DetectorFinding[] }}
 */
export function runDetectors(project, options = {}) {
  /** @type {DetectorFinding[]} */
  const findings = [
    ...detectTimeline(project),
    ...detectObjects(project),
    ...detectCues(project),
    ...detectVariants(project),
    ...detectSafeArea(project, options.variantId),
    ...detectLegibility(project),
    ...detectFrames(options.samples ?? [], { minInk: options.minInk }),
  ];
  const rank = { error: 0, warning: 1, info: 2 };
  findings.sort((a, b) => rank[a.severity] - rank[b.severity] || a.code.localeCompare(b.code));
  return {
    ok: !findings.some((finding) => finding.severity === 'error'),
    counts: {
      error: findings.filter((finding) => finding.severity === 'error').length,
      warning: findings.filter((finding) => finding.severity === 'warning').length,
      info: findings.filter((finding) => finding.severity === 'info').length,
    },
    findings,
  };
}

/**
 * Resolved cue lookup shared by the studio and the renderer, so a cue dragged
 * in the inspector and a cue drawn on the canvas are the same number.
 * @param {import('./project-contract.js').MotionloomProject} project
 * @returns {Array<{ id: string, label: string, kind: string, anchor?: string, offset: number, time: number | null }>}
 */
export function cueTimeline(project) {
  const words = normalizeWords(isRecord(project.audio) ? project.audio.transcript : null);
  const cues = normalizeCues(isRecord(project.audio) ? project.audio.cues : null);
  return resolveCues(cues, { shots: project.shots, words }).map((cue) => ({
    id: cue.id,
    label: cue.label ?? cue.id,
    kind: cue.kind ?? 'absolute',
    anchor: cue.anchor,
    offset: cue.offset ?? 0,
    time: cue.time,
  }));
}

/**
 * Resolve one cue against the project.
 * @param {import('./project-contract.js').MotionloomProject} project
 * @param {string} cueId
 * @returns {number | null}
 */
export function cueTimeAt(project, cueId) {
  const cue = normalizeCues(isRecord(project.audio) ? project.audio.cues : null).find((entry) => entry.id === cueId);
  if (!cue) return null;
  return resolveCue(cue, {
    shots: project.shots,
    words: normalizeWords(isRecord(project.audio) ? project.audio.transcript : null),
  });
}

/**
 * Text objects must stay large enough to read at delivery resolution.
 * @param {import('./project-contract.js').MotionloomProject} project
 * @param {number} [minHeight]
 * @returns {DetectorFinding[]}
 */
export function detectLegibility(project, minHeight = MIN_TYPE_HEIGHT) {
  /** @type {DetectorFinding[]} */
  const findings = [];
  for (const object of project.objects ?? []) {
    if (object.type !== 'text') continue;
    const scale = Number(object.controls?.scale ?? 1);
    const entrance = Number(object.controls?.entrance ?? 1);
    const smallest = Math.min(scale, entrance) * 40;
    if (Number.isFinite(smallest) && smallest < minHeight) {
      findings.push({
        severity: 'warning',
        code: 'TYPE_TOO_SMALL',
        message: `${object.name || object.id} can render at ~${smallest.toFixed(0)}px, below the ${minHeight}px readability floor`,
        frame: object.id,
      });
    }
  }
  return findings;
}

