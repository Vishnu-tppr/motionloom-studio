import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { normalizeProject } from '../src/project-contract.js';
import {
  cueAnchorLabel,
  formatSeconds,
  normalizeCues,
  normalizeWords,
  resolveCue,
  resolveCues,
  validateCues,
  waveformPeaks,
} from '../src/cue-model.js';
import {
  applyCopy,
  buildVariants,
  containTransform,
  findVariant,
  parseAspect,
  safeArea,
} from '../src/variants.js';

const projectPath = fileURLToPath(new URL('../data/project.json', import.meta.url));
const project = normalizeProject(JSON.parse(await readFile(projectPath, 'utf8')));

const shots = [
  { id: 'a', start: 0, end: 2 },
  { id: 'b', start: 2, end: 4 },
];
const words = [
  { id: 'w1', text: 'one', start: 0.5, end: 0.8 },
  { id: 'w2', text: 'line', start: 1.0, end: 1.4 },
];

test('cues resolve from an absolute time', () => {
  assert.equal(resolveCue({ id: 'c', kind: 'absolute', time: 1.25 }, { shots, words }), 1.25);
});

test('cues resolve from a shot anchor plus offset', () => {
  assert.equal(resolveCue({ id: 'c', kind: 'shot', anchor: 'b', offset: 0.5 }, { shots, words }), 2.5);
  assert.equal(resolveCue({ id: 'c', kind: 'shot', anchor: 'b', offset: -0.5 }, { shots, words }), 1.5);
});

test('cues resolve from a word anchor plus offset', () => {
  assert.equal(resolveCue({ id: 'c', kind: 'word', anchor: 'w2', offset: 0.1 }, { shots, words }), 1.1);
});

test('a missing anchor resolves to null instead of zero', () => {
  assert.equal(resolveCue({ id: 'c', kind: 'word', anchor: 'nope', offset: 0.1 }, { shots, words }), null);
  assert.equal(resolveCue({ id: 'c', kind: 'shot', anchor: 'nope', offset: 0 }, { shots, words }), null);
});

test('a relative cue with no anchor falls back to absolute', () => {
  const cue = normalizeCues([{ id: 'c', kind: 'word', offset: 2 }])[0];
  assert.equal(cue.kind, 'absolute');
  assert.equal(cue.time, 0);
});

test('normalization never mutates its input and sorts by start time', () => {
  const input = [{ id: 'w9', text: 'late', start: 3, end: 3.2 }, { id: 'w1', text: 'early', start: 1, end: 1.2 }];
  const snapshot = JSON.stringify(input);
  const out = normalizeWords(input);
  assert.equal(JSON.stringify(input), snapshot);
  assert.deepEqual(out.map((word) => word.id), ['w1', 'w9']);
});

test('a word end never precedes its start', () => {
  assert.equal(normalizeWords([{ id: 'w', start: 2, end: 1 }])[0].end, 2);
});

test('resolveCues sorts by time then id', () => {
  const resolved = resolveCues([
    { id: 'b', kind: 'absolute', time: 2, offset: 0 },
    { id: 'a', kind: 'absolute', time: 1, offset: 0 },
    { id: 'a2', kind: 'absolute', time: 1, offset: 0 },
  ], { shots, words });
  assert.deepEqual(resolved.map((cue) => cue.id), ['a', 'a2', 'b']);
});

test('cue labels prefer the user label, then the anchor', () => {
  assert.equal(cueAnchorLabel({ id: 'c', label: 'hero', kind: 'absolute', offset: 0 }), 'hero');
  assert.equal(cueAnchorLabel({ id: 'c', kind: 'word', anchor: 'w1', offset: 0 }, words), 'one');
  assert.equal(cueAnchorLabel({ id: 'c', kind: 'word', anchor: 'zz', offset: 0 }, words), 'unknown word');
});

test('unresolved seconds format as an em dash', () => {
  assert.equal(formatSeconds(null), '—');
  assert.equal(formatSeconds(1.5), '1.500');
});

test('waveform peaks are deterministic and bounded', () => {
  const a = waveformPeaks({ seed: 7, duration: 10, samples: 32 });
  const b = waveformPeaks({ seed: 7, duration: 10, samples: 32 });
  assert.deepEqual(a, b);
  assert.equal(a.length, 32);
  assert.ok(a.every((peak) => peak > 0 && peak <= 1));
});

test('validateCues flags a broken anchor', () => {
  const findings = validateCues(
    { cues: [{ id: 'c', kind: 'word', anchor: 'missing', offset: 0 }] },
    { shots, words, duration: 4 },
  );
  assert.equal(findings[0].code, 'UNRESOLVED_CUE');
  assert.equal(findings[0].severity, 'error');
});

test('validateCues flags a cue past the project duration', () => {
  const findings = validateCues(
    { cues: [{ id: 'c', kind: 'absolute', time: 9, offset: 0 }] },
    { shots, words, duration: 4 },
  );
  assert.equal(findings[0].code, 'CUE_AFTER_END');
});

test('validateCues flags duplicate cue ids', () => {
  const findings = validateCues(
    { cues: [
      { id: 'c', kind: 'absolute', time: 1, offset: 0 },
      { id: 'c', kind: 'absolute', time: 2, offset: 0 },
    ] },
    { shots, words, duration: 4 },
  );
  assert.ok(findings.some((finding) => finding.code === 'DUPLICATE_CUE'));
});

test('validateCues flags an overlapping transcript', () => {
  const findings = validateCues(
    { transcript: [{ id: 'a', start: 0, end: 2 }, { id: 'b', start: 1, end: 3 }] },
    { shots, words, duration: 4 },
  );
  assert.ok(findings.some((finding) => finding.code === 'TRANSCRIPT_OVERLAP'));
});

test('the canonical project has no cue errors', () => {
  const findings = validateCues(project.audio, { shots: project.shots, duration: project.meta.duration });
  assert.deepEqual(findings.filter((finding) => finding.severity === 'error'), []);
});

test('parseAspect reads ratios and rejects garbage', () => {
  assert.deepEqual(parseAspect('16:9'), { width: 16, height: 9 });
  assert.deepEqual(parseAspect('4 x 5'), { width: 4, height: 5 });
  assert.equal(parseAspect('wide'), null);
  assert.equal(parseAspect('16:0'), null);
});

test('aspect variants are derived from the master frame', () => {
  const variants = buildVariants(project);
  assert.deepEqual(pick(variants, '16:9'), [1280, 720]);
  assert.deepEqual(pick(variants, '9:16'), [720, 1280]);
  assert.deepEqual(pick(variants, '1:1'), [720, 720]);
});

/**
 * @param {import('../src/variants.js').MotionloomVariant[]} variants
 * @param {string} id
 * @returns {[number, number]}
 */
function pick(variants, id) {
  const variant = findVariant(variants, id);
  return [variant.width, variant.height];
}

test('locale variants come from the project, not from a fork', () => {
  const dutch = findVariant(buildVariants(project), 'nl');
  assert.equal(dutch.locale, 'nl');
  assert.deepEqual([dutch.width, dutch.height], [1280, 720]);
});

test('containTransform letterboxes instead of stretching', () => {
  const transform = containTransform(project.meta, findVariant(buildVariants(project), '9:16'));
  assert.equal(transform.scale, 720 / 1280);
  assert.equal(transform.width, 720);
  assert.equal(transform.height, 405);
  assert.equal(transform.offsetX, 0);
  assert.equal(transform.offsetY, (1280 - 405) / 2);
});

test('safe areas shrink more on a tighter frame', () => {
  const variants = buildVariants(project);
  assert.ok(safeArea(findVariant(variants, '9:16')).inset > safeArea(findVariant(variants, '16:9')).inset);
});

test('locale copy is scoped per object and never invents a control', () => {
  const dutch = findVariant(buildVariants(project), 'nl');
  const controls = { text: 'IDEA → MOTION', x: 640 };
  assert.equal(applyCopy(controls, dutch, 'hero-title').text, 'IDEE → BEWEGING');
  assert.equal(applyCopy(controls, dutch, 'final-message').text, 'BRIEF IN. BEWEGING UIT.');
  assert.equal(applyCopy(controls, dutch, 'spark').text, 'IDEA → MOTION');
  assert.equal(applyCopy({ x: 1 }, dutch, 'hero-title').x, 1);
  assert.deepEqual(applyCopy(controls, undefined, 'hero-title'), controls);
});

test('applyCopy does not mutate the source controls', () => {
  const controls = { text: 'a' };
  applyCopy(controls, findVariant(buildVariants(project), 'nl'), 'hero-title');
  assert.equal(controls.text, 'a');
});

test('waveform peaks differ between seeds', () => {
  assert.notDeepEqual(
    waveformPeaks({ seed: 1, duration: 10, samples: 16 }),
    waveformPeaks({ seed: 2, duration: 10, samples: 16 }),
  );
});
