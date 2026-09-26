/**
 * MotionLoom canonical project contract.
 *
 * Two runtimes exist (p5 preview + Canvas Live) but they must agree on one
 * validated project model. Canonical source of truth:
 * `engine/data/project.json` with `renderContract: "motionloom/1"`.
 *
 * Legacy shape (`engine/project.motion.json` with `canvas` + objects-as-map)
 * is accepted by tooling but normalized immutably to the canonical shape.
 *
 * PoC provenance: `proof-of-concept/code/jellyfish-animated.html`
 * (cache-once static layers, seeded identity, analytic renderAt) and
 * `proof-of-concept/code/follow-a-litle-wonder.html`
 * (persistent morph token sampled to equal N, absolute-time progress).
 */
import { normalizeCues, normalizeWords } from './cue-model.js';

/** Canonical project file consumed by Live UI + server. */
export const CANONICAL_PROJECT_PATH = 'engine/data/project.json';
/** Legacy preview project file; accepted, then normalized. */
export const LEGACY_PROJECT_PATH = 'engine/project.motion.json';
/** Render contract version all adapters must honor. */
export const RENDER_CONTRACT = 'motionloom/1';

/**
 * @typedef {object} MotionloomMeta
 * @property {string} title
 * @property {number} width
 * @property {number} height
 * @property {number} fps
 * @property {number} duration
 * @property {number} seed
 * @property {boolean} [loop]
 * @property {string} [renderContract]
 * @property {string} [version]
 */

/**
 * @typedef {object} MotionloomShot
 * @property {string} id
 * @property {string} [name]
 * @property {number} start
 * @property {number} end
 * @property {string} [color]
 * @property {string} [tokenState]
 */

/**
 * @typedef {object} MotionloomObject
 * @property {string} id
 * @property {string} [name]
 * @property {string} [type]
 * @property {string} [shotId]
 * @property {{ file?: string, symbol?: string }} [source]
 * @property {Record<string, unknown>} [controls]
 * @property {Record<string, unknown>} [schema]
 */

/**
 * @typedef {object} MotionloomToken
 * @property {string} [id]
 * @property {string} [color]
 * @property {number} [width]
 * @property {number} [samples]
 * @property {number} [morphWindow]
 * @property {string[]} [states]
 */

/**
 * @typedef {object} MotionloomAudio
 * @property {string} [src]
 * @property {string} [notes]
 * @property {import('./cue-model.js').MotionloomWord[]} [transcript]
 * @property {import('./cue-model.js').MotionloomCue[]} [cues]
 */

/**
 * @typedef {object} MotionloomProject
 * @property {MotionloomMeta} meta
 * @property {MotionloomShot[]} shots
 * @property {MotionloomObject[]} objects
 * @property {MotionloomToken} [token]
 * @property {Record<string, string>} [brand]
 * @property {Record<string, string>} [palette]
 * @property {unknown} [story]
 * @property {MotionloomAudio} [audio]
 * @property {unknown} [production]
 * @property {import('./variants.js').MotionloomVariant[]} [variants]
 * @property {string[]} [locales]
 */

/**
 * Narrow unknown external input (file JSON, WebSocket payload, CLI arg).
 * @param {unknown} value
 * @param {string} label
 * @returns {Record<string, unknown>}
 */
export function asRecord(value, label = 'project') {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return /** @type {Record<string, unknown>} */ (value);
  }
  throw new Error(`${label} must be a JSON object`);
}

/**
 * Normalize legacy (`canvas`, objects-as-map) or canonical
 * (`meta`, objects-as-array) data into the canonical shape.
 * Never mutates the input; returns a new object.
 * @param {unknown} input
 * @returns {MotionloomProject}
 */
export function normalizeProject(input) {
  const raw = asRecord(input);
  const metaSource = asRecord(raw.meta ?? raw.canvas ?? {}, 'project.meta');
  const shotsSource = Array.isArray(raw.shots) ? raw.shots : [];
  const objectsSource = raw.objects;
  const objectsArray = Array.isArray(objectsSource)
    ? objectsSource
    : Object.entries(asRecord(objectsSource ?? {}, 'project.objects')).map(([id, item]) => ({
        id,
        ...(asRecord(item, `project.objects.${id}`)),
      }));
  const tokenSource = asRecord(raw.token ?? {}, 'project.token');
  const story = asRecord(raw.story ?? {}, 'project.story');
  const audioSource = asRecord(raw.audio ?? {}, 'project.audio');

  const meta = {
    title: String(metaSource.title ?? 'Untitled'),
    width: Number(metaSource.width ?? 1280),
    height: Number(metaSource.height ?? 720),
    fps: Number(metaSource.fps ?? 30),
    duration: Number(metaSource.duration ?? 10),
    seed: Number(metaSource.seed ?? 1),
    loop: Boolean(metaSource.loop ?? false),
    renderContract: String(metaSource.renderContract ?? RENDER_CONTRACT),
    version: String(metaSource.version ?? '0.1.0'),
  };
  const shots = shotsSource.map((shot, index) => {
    const item = asRecord(shot, `project.shots[${index}]`);
    return {
      id: String(item.id ?? `shot-${index}`),
      name: String(item.name ?? item.label ?? `Shot ${index + 1}`),
      start: Number(item.start ?? 0),
      end: Number(item.end ?? meta.duration),
      color: item.color === undefined ? undefined : String(item.color),
      tokenState: item.tokenState === undefined ? undefined : String(item.tokenState),
    };
  });
  const objects = objectsArray.map((entry, index) => {
    const item = asRecord(entry, `project.objects[${index}]`);
    return {
      id: String(item.id ?? `object-${index}`),
      name: String(item.name ?? item.label ?? `Object ${index + 1}`),
      type: String(item.type ?? 'generic'),
      shotId: String(item.shotId ?? item.shot ?? shots[0]?.id ?? 'hook'),
      source: item.source && typeof item.source === 'object' ? item.source : undefined,
      controls: item.controls && typeof item.controls === 'object' ? item.controls : {},
      schema: item.schema && typeof item.schema === 'object' ? item.schema : {},
    };
  });

  return {
    meta,
    brand: raw.brand,
    palette: raw.palette,
    shots,
    objects,
    token: {
      id: String(tokenSource.id ?? story.token ?? 'journey-ribbon'),
      color: tokenSource.color === undefined ? undefined : String(tokenSource.color),
      width: tokenSource.width === undefined ? undefined : Number(tokenSource.width),
      samples: tokenSource.samples === undefined ? undefined : Number(tokenSource.samples),
      morphWindow: tokenSource.morphWindow === undefined ? undefined : Number(tokenSource.morphWindow),
      states: Array.isArray(tokenSource.states) ? tokenSource.states.map(String) : undefined,
    },
    story: raw.story,
    audio: {
      src: audioSource.src,
      notes: audioSource.notes,
      transcript: normalizeWords(audioSource.transcript),
      cues: normalizeCues(audioSource.cues),
    },
    production: raw.production,
    variants: Array.isArray(raw.variants) ? raw.variants : [],
    locales: Array.isArray(raw.locales) ? raw.locales.map(String) : [],
  };
}

/**
 * Validate timeline continuity + determinism preconditions.
 * Pure/immutable: returns findings, never throws for content issues.
 * @param {MotionloomProject} project
 * @returns {{ code: string, message: string, severity: 'error' | 'warning' }[]}
 */
export function validateTimeline(project) {
  const findings = [];
  if (!Number.isFinite(project.meta.seed)) {
    findings.push({ code: 'NO_SEED', severity: 'error', message: 'Project seed must be finite' });
  }
  if (project.meta.renderContract !== RENDER_CONTRACT) {
    findings.push({ code: 'CONTRACT_MISMATCH', severity: 'error', message: `Expected ${RENDER_CONTRACT}` });
  }
  if (!project.shots.length) {
    findings.push({ code: 'NO_SHOTS', severity: 'error', message: 'At least one shot required' });
    return findings;
  }
  const ordered = [...project.shots].sort((a, b) => a.start - b.start);
  if (Math.abs(ordered[0].start) > 0.0001) {
    findings.push({ code: 'START_GAP', severity: 'error', message: 'Timeline must start at 0' });
  }
  for (let i = 1; i < ordered.length; i++) {
    const gap = ordered[i].start - ordered[i - 1].end;
    if (Math.abs(gap) > 0.0001) {
      findings.push({
        code: gap > 0 ? 'SHOT_GAP' : 'SHOT_OVERLAP',
        severity: 'error',
        message: `Timeline discontinuity before ${ordered[i].id}`,
      });
    }
  }
  const last = ordered[ordered.length - 1];
  if (Math.abs(last.end - project.meta.duration) > 0.0001) {
    findings.push({ code: 'DURATION_MISMATCH', severity: 'error', message: 'Last shot must end at duration' });
  }
  for (const object of project.objects) {
    if (!object.id || !object.source?.file) {
      findings.push({ code: 'SOURCE_MAP', severity: 'error', message: `${object.id} lacks source mapping` });
    }
    if (!object.schema || Object.keys(object.schema).length === 0) {
      findings.push({ code: 'NO_SCHEMA', severity: 'error', message: `${object.id} lacks schema` });
    }
  }
  if (!project.token?.id) {
    findings.push({ code: 'NO_TOKEN', severity: 'warning', message: 'No persistent token declared' });
  }
  return findings;
}

/**
 * Immutable cache key including every pixel-affecting input.
 * @param {unknown} width
 * @param {unknown} height
 * @param {unknown} seed
 * @param {...unknown} rest
 * @returns {string}
 */
export function layerKey(width, height, seed, ...rest) {
  return [width, height, seed, ...rest].map(String).join(':');
}

