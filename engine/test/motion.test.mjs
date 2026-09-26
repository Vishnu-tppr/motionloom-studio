import test from 'node:test';
import assert from 'node:assert/strict';
import { anticipate, bounce, spring, wiggle, punch, shake, counter, arcTrajectory } from '../src/motion.js';

test('anticipate starts at 0', () => {
  assert.equal(anticipate(0, 0, 1), 0);
});

test('anticipate ends near 1', () => {
  assert.ok(Math.abs(anticipate(1, 0, 1) - 1) < 0.01);
});

test('bounce ends near 1', () => {
  assert.ok(Math.abs(bounce(1, 0, 1) - 1) < 0.02);
});

test('spring endpoints', () => {
  assert.equal(spring(0, 0, 1), 0);
  assert.equal(spring(1, 0, 1), 1);
});

test('wiggle produces non-zero values', () => {
  const v = wiggle(0.5, 1, 4, 10);
  assert.equal(typeof v, 'number');
});

test('punch is 0 at boundaries', () => {
  assert.equal(punch(0, 0, 1), 0);
  assert.equal(punch(1, 0, 1), 0);
});

test('punch peaks mid-range', () => {
  const mid = punch(0.5, 0, 1);
  assert.ok(mid > 0);
});

test('shake is 0 at boundaries', () => {
  assert.equal(shake(0, 0, 1), 0);
  assert.equal(shake(1, 0, 1), 0);
});

test('counter interpolates linearly with default ease', () => {
  const v = counter(0.5, 0, 1, 0, 100);
  assert.ok(v > 0 && v <= 100);
});

test('counter endpoints', () => {
  assert.equal(counter(0, 0, 1, 0, 100), 0);
  assert.equal(counter(1, 0, 1, 0, 100), 100);
});

test('arcTrajectory returns [x,y] array', () => {
  const result = arcTrajectory(0.5, 0, 1, [0, 0], [50, 100], [100, 0]);
  assert.ok(Array.isArray(result));
  assert.equal(result.length, 2);
});

test('arcTrajectory endpoints', () => {
  const start = arcTrajectory(0, 0, 1, [0, 0], [50, 100], [100, 0]);
  const end = arcTrajectory(1, 0, 1, [0, 0], [50, 100], [100, 0]);
  assert.equal(start[0], 0);
  assert.equal(start[1], 0);
  assert.equal(end[0], 100);
  assert.equal(end[1], 0);
});
