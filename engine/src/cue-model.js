/**
 * MotionLoom Live cue timing model.
 *
 * A cue is a semantic marker on the timeline. Its absolute time is never stored
 * twice: a cue declares an *anchor* (a shot, a transcript word, or nothing at
 * all) plus an *offset* in seconds. `resolveCue` is the single place that turns
 * a declaration into a concrete timestamp, so the timeline, the inspector, and
 * Claude all agree on one number.
 *
 * Contract: every function is pure and depends only on its arguments. No wall
 * clock, no unseeded randomness, no I/O.
 */

/**
 * @typedef {object} MotionloomCue
 * @property {string} id
 * @property {string} [label]
 * @property {'absolute' | 'shot' | 'word'} [kind]
 * @property {string} [anchor] shot id or word id this cue hangs off
 * @property {number} [offset] seconds added to the anchor, may be negative
 * @property {number} [time] absolute seconds, only for `kind: 'absolute'`
 */

/**
 * @typedef {object} MotionloomWord
 * @property {string} id
 * @property {string} [text]
 * @property {number} start seconds
 * @property {number} end seconds
 */

/** Cue anchor kinds accepted by the model. @type {readonly string[]} */
export const CUE_KINDS = Object.freeze(['absolute', 'shot', 'word']);

/** Epsilon used for timeline comparisons in seconds. @type {number} */
const EPSILON = 0.0001;

/** Fallback text for a word id that is not in the transcript. @type {string} */
const MISSING_WORD_LABEL = 'unknown word';

/**
 * Type guard for a plain JSON object.
 * @param {unknown} value
 * @returns {boolean}
 */
function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Normalize an untrusted cue record into the canonical declaration shape.
 * An unknown anchor kind falls back to `absolute` so a bad project still renders.
 * @param {unknown} input
 * @param {string} [fallbackId] used when the record has no usable id
 * @returns {MotionloomCue}
 */
export function normalizeCue(input, fallbackId = 'cue') {
  const record = isRecord(input) ? input : {};
  const kind = /** @type {MotionloomCue['kind']} */ (
    CUE_KINDS.includes(/** @type {string} */ (record.kind)) ? record.kind : 'absolute'
  );
  const offset = Number.isFinite(record.offset) ? Number(record.offset) : 0;
  /** @type {MotionloomCue} */
  const cue = {
    id: typeof record.id === 'string' && record.id ? record.id : fallbackId,
    label: typeof record.label === 'string' && record.label ? record.label : undefined,
    kind,
    offset: Math.round(offset * 1e6) / 1e6,
  };
  if (kind === 'absolute') {
    cue.time = Number.isFinite(record.time) ? Number(record.time) : 0;
  } else if (typeof record.anchor === 'string' && record.anchor) {
    cue.anchor = record.anchor;
  } else {
    // A relative cue with no anchor is meaningless; pin it to absolute.
    cue.kind = 'absolute';
    cue.time = Number.isFinite(record.time) ? Number(record.time) : 0;
  }
  return cue;
}

/**
 * Normalize an untrusted transcript word. `end` never precedes `start`.
 * @param {unknown} input
 * @param {string} [fallbackId]
 * @returns {MotionloomWord}
 */
export function normalizeWord(input, fallbackId = 'word') {
  const record = isRecord(input) ? input : {};
  const start = Number.isFinite(record.start) ? Number(record.start) : 0;
  const end = Number.isFinite(record.end) ? Number(record.end) : start;
  return {
    id: typeof record.id === 'string' && record.id ? record.id : fallbackId,
    text: typeof record.text === 'string' ? record.text : '',
    start: Math.round(start * 1e6) / 1e6,
    end: Math.round(Math.max(start, end) * 1e6) / 1e6,
  };
}

/**
 * Normalize a full cue list. Never mutates the input.
 * @param {unknown} input
 * @returns {MotionloomCue[]}
 */
export function normalizeCues(input) {
  if (!Array.isArray(input)) return [];
  return input.map((cue, index) => normalizeCue(cue, `cue-${index + 1}`));
}

/**
 * Normalize a transcript list, sorted by start time then id. Never mutates.
 * @param {unknown} input
 * @returns {MotionloomWord[]}
 */
export function normalizeWords(input) {
  if (!Array.isArray(input)) return [];
  return input
    .map((word, index) => normalizeWord(word, `word-${index + 1}`))
    .sort((a, b) => a.start - b.start || a.id.localeCompare(b.id));
}

/**
 * Start time of a shot, or `null` when the id is unknown.
 * @param {unknown} shots
 * @param {string} id
 * @returns {number | null}
 */
export function shotStart(shots, id) {
  if (!Array.isArray(shots)) return null;
  const shot = shots.find((candidate) => candidate && candidate.id === id);
  return shot && Number.isFinite(shot.start) ? Number(shot.start) : null;
}

/**
 * Find a transcript word by id.
 * @param {MotionloomWord[]} words
 * @param {string} id
 * @returns {MotionloomWord | undefined}
 */
export function findWord(words, id) {
  if (!Array.isArray(words)) return undefined;
  return words.find((word) => word.id === id);
}

/**
 * Turn a cue declaration into an absolute timestamp.
 * A missing anchor resolves to `null` so callers report a broken cue instead of
 * silently animating it at zero.
 * @param {MotionloomCue} cue
 * @param {{ shots?: unknown[], words?: MotionloomWord[] }} [context]
 * @returns {number | null}
 */
export function resolveCue(cue, context = {}) {
  const shots = Array.isArray(context.shots) ? context.shots : [];
  const words = Array.isArray(context.words) ? context.words : [];
  if (cue.kind === 'absolute') {
    return Number.isFinite(cue.time) ? Number(cue.time) : null;
  }
  const anchor = cue.anchor;
  if (!anchor) return null;
  const base = cue.kind === 'shot'
    ? shotStart(shots, anchor)
    : findWord(words, anchor)?.start;
  if (base === null || base === undefined || !Number.isFinite(base)) return null;
  return Math.round((base + cue.offset) * 1e6) / 1e6;
}

/**
 * Every cue with its resolved time, sorted by time then id.
 * @param {MotionloomCue[]} cues
 * @param {{ shots?: unknown[], words?: MotionloomWord[] }} [context]
 * @returns {Array<MotionloomCue & { time: number | null }>}
 */
export function resolveCues(cues, context = {}) {
  return [...cues]
    .map((cue) => ({ ...cue, time: resolveCue(cue, context) }))
    .sort((a, b) => (a.time ?? Infinity) - (b.time ?? Infinity)
      || String(a.id).localeCompare(String(b.id)));
}

/**
 * Human label for a cue, preferring the user's own label then the anchor name.
 * @param {MotionloomCue} cue
 * @param {MotionloomWord[]} [words]
 * @returns {string}
 */
export function cueAnchorLabel(cue, words = []) {
  if (cue.label) return cue.label;
  if (cue.kind === 'word') {
    const word = findWord(words, cue.anchor ?? '');
    return word ? word.text || String(word.id) : MISSING_WORD_LABEL;
  }
  if (cue.kind === 'shot') return String(cue.anchor ?? 'unknown shot');
  return String(cue.id);
}

/**
 * Format seconds for the inspector, or an em dash when unresolved.
 * @param {number | null} value
 * @param {number} [decimals]
 * @returns {string}
 */
export function formatSeconds(value, decimals = 3) {
  if (value === null || !Number.isFinite(value)) return '—';
  return value.toFixed(decimals);
}

/**
 * Deterministic waveform peaks in `0..1`, sampled from the project seed.
 * Replaying the same project always yields the same envelope, so the waveform
 * never flickers between frames or between sessions.
 * @param {{ seed?: number, duration: number, samples?: number }} options
 * @returns {number[]}
 */
export function waveformPeaks({ seed = 1, duration, samples = 160 }) {
  const count = Math.max(1, Math.floor(samples));
  const total = Number.isFinite(duration) && duration > 0 ? duration : 1;
  let state = (Math.floor(seed) >>> 0) || 1;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const peaks = [];
  for (let i = 0; i < count; i++) {
    const position = (i / count) * total;
    // A slow envelope plus per-sample noise: speech-like, but repeatable.
    const envelope = 0.55 + 0.45 * Math.sin(position * 1.9);
    const noise = next();
    peaks.push(Math.min(1, Math.max(0.04, envelope * (0.45 + 0.75 * noise))));
  }
  return peaks;
}

/**
 * @typedef {{ severity: 'error' | 'warning', code: string, message: string, cueId?: string }} CueFinding
 */

/**
 * Deterministic defect checks for the cue track. These run without a model, so
 * a broken cue is reported identically on every machine.
 * @param {unknown} audio
 * @param {{ shots?: unknown[], words?: MotionloomWord[], duration?: number }} [context]
 * @returns {CueFinding[]}
 */
export function validateCues(audio, context = {}) {
  /** @type {CueFinding[]} */
  const findings = [];
  const record = isRecord(audio) ? audio : {};
  const cues = normalizeCues(record.cues);
  const words = normalizeWords(record.transcript);
  const shots = Array.isArray(context.shots) ? context.shots : [];
  const duration = Number.isFinite(context.duration) ? Number(context.duration) : null;

  /** @type {Set<string>} */
  const seen = new Set();
  for (const cue of cues) {
    if (seen.has(cue.id)) {
      findings.push({
        severity: 'error',
        code: 'DUPLICATE_CUE',
        message: `Cue id ${cue.id} is used twice`,
        cueId: cue.id,
      });
    }
    seen.add(cue.id);

    const time = resolveCue(cue, { shots, words });
    if (time === null) {
      findings.push({
        severity: 'error',
        code: 'UNRESOLVED_CUE',
        message: `${cue.id} anchors to missing ${cue.kind} "${cue.anchor ?? ''}"`,
        cueId: cue.id,
      });
      continue;
    }
    if (time < -EPSILON) {
      findings.push({
        severity: 'error',
        code: 'CUE_BEFORE_START',
        message: `${cue.id} resolves to ${time}s, before the timeline starts`,
        cueId: cue.id,
      });
    }
    if (duration !== null && time > duration + EPSILON) {
      findings.push({
        severity: 'error',
        code: 'CUE_AFTER_END',
        message: `${cue.id} resolves past the project duration`,
        cueId: cue.id,
      });
    }
    if (cue.kind === 'word') {
      const word = findWord(words, cue.anchor ?? '');
      if (word && cue.offset > word.end - word.start + EPSILON) {
        findings.push({
          severity: 'warning',
          code: 'CUE_AFTER_WORD',
          message: `${cue.id} lands more than one word length after "${word.text || word.id}"`,
          cueId: cue.id,
        });
      }
    }
  }

  const times = resolveCues(cues, { shots, words })
    .map((cue) => cue.time)
    .filter((time) => time !== null)
    .sort((a, b) => a - b);
  for (let i = 1; i < times.length; i++) {
    if (Math.abs(times[i] - times[i - 1]) < EPSILON) {
      findings.push({ severity: 'warning', code: 'STACKED_CUES', message: `Two cues share ${times[i]}s` });
      break;
    }
  }

  for (let i = 1; i < words.length; i++) {
    if (words[i].start < words[i - 1].end - EPSILON) {
      findings.push({
        severity: 'warning',
        code: 'TRANSCRIPT_OVERLAP',
        message: `"${words[i - 1].text || words[i - 1].id}" and "${words[i].text || words[i].id}" overlap`,
      });
    }
  }

  if (duration !== null && words.length && words[words.length - 1].end > duration + EPSILON) {
    findings.push({
      severity: 'error',
      code: 'TRANSCRIPT_OVERRUN',
      message: 'Transcript runs past the project duration',
    });
  }

  return findings;
}
