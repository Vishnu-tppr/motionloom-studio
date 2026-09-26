import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  normalizeProject,
  validateTimeline,
  layerKey,
  RENDER_CONTRACT,
} from '../src/project-contract.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const canonicalRaw = JSON.parse(readFileSync(resolve(root, 'engine/data/project.json'), 'utf8'));
const legacyRaw = JSON.parse(readFileSync(resolve(root, 'engine/project.motion.json'), 'utf8'));

test('canonical project validates with no errors', () => {
  // Arrange
  const project = normalizeProject(canonicalRaw);

  // Act
  const errors = validateTimeline(project).filter((finding) => finding.severity === 'error');

  // Assert
  assert.equal(project.meta.renderContract, RENDER_CONTRACT);
  assert.deepEqual(errors, []);
});

test('legacy preview project normalizes immutably to canonical shape', () => {
  // Arrange
  const before = JSON.stringify(legacyRaw);

  // Act
  const project = normalizeProject(legacyRaw);

  // Assert
  assert.equal(JSON.stringify(legacyRaw), before);
  assert.ok(Array.isArray(project.objects));
  assert.ok(project.meta.seed > 0);
  assert.ok(project.shots[0].start === 0);
});

test('timeline gaps are reported instead of silently accepted', () => {
  // Arrange
  const project = normalizeProject(canonicalRaw);
  const broken = {
    ...project,
    shots: project.shots.map((shot, index) => (index === 1 ? { ...shot, start: shot.start + 0.5 } : shot)),
  };

  // Act
  const codes = validateTimeline(broken).map((finding) => finding.code);

  // Assert
  assert.ok(codes.includes('SHOT_GAP'));
});

test('cache keys change when any pixel-affecting input changes', () => {
  // Arrange
  const base = layerKey(1280, 720, 1847, 'journey-ribbon', 1);

  // Act
  const changedSeed = layerKey(1280, 720, 9999, 'journey-ribbon', 1);
  const changedObject = layerKey(1280, 720, 1847, 'other-token', 1);

  // Assert
  assert.equal(base, layerKey(1280, 720, 1847, 'journey-ribbon', 1));
  assert.notEqual(base, changedSeed);
  assert.notEqual(base, changedObject);
});

test('asRecord rejects untrusted non-object input with unknown narrowing', () => {
  // Arrange
  const shape = normalizeProject(canonicalRaw);

  // Act + Assert
  assert.throws(() => normalizeProject(null), /must be a JSON object/);
  assert.throws(() => normalizeProject([]), /must be a JSON object/);
  assert.ok(shape.token.id.length > 0);
});
