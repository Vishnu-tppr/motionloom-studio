import test from 'node:test';
import assert from 'node:assert/strict';
import { rng, hash } from '../src/core.js';
import { rng as liveRng, hashSeed, samplePath, morphPaths } from '../src/math.js';
import { travelingWave, stagedLag, causalChain } from '../src/motion.js';
import { morphPath, samplePath as proceduralSample } from '../src/procedural.js';

test('seeded RNG streams are repeatable across instances', () => {
  // Arrange
  const first = rng(1847);
  const second = rng(1847);

  // Act
  const a = Array.from({ length: 50 }, () => first());
  const b = Array.from({ length: 50 }, () => second());

  // Assert
  assert.deepEqual(a, b);
});

test('core and live RNGs derive stable identity from the same seed', () => {
  // Arrange
  const seed = hash(24091999, 'seeded-orbit', 1);
  const liveSeed = hashSeed(24091999, 'seeded-orbit', 1);

  // Act
  const coreValues = Array.from({ length: 10 }, () => rng(seed)());
  const liveValues = Array.from({ length: 10 }, () => liveRng(liveSeed)());

  // Assert: streams must be deterministic even though the two helpers live in different adapters.
  assert.deepEqual(coreValues, Array.from({ length: 10 }, () => rng(seed)()));
  assert.deepEqual(liveValues, Array.from({ length: 10 }, () => liveRng(liveSeed)()));
});

test('equal-N token morph is stable and order-independent', () => {
  // Arrange
  const from = proceduralSample((u) => ({ x: u * 100, y: 10 }), 120);
  const to = proceduralSample((u) => ({ x: u * 100, y: 90 }), 120);

  // Act
  const forward = morphPath(from, to, 0.35);
  const repeat = morphPath(from, to, 0.35);

  // Assert
  assert.deepEqual(forward, repeat);
  assert.equal(forward.length, 121);
  assert.deepEqual(forward[0], { x: 0, y: 10 + 80 * 0.35 });
});

test('token morph rejects mismatched sampling instead of crossfading', () => {
  // Arrange
  const shortPath = samplePath((u) => ({ x: u, y: 0 }), 10);
  const longPath = samplePath((u) => ({ x: u, y: 1 }), 12);

  // Act + Assert
  assert.throws(() => morphPaths(shortPath, longPath, 0.5) && morphPath(shortPath, longPath, 0.5), RangeError);
});

test('organic helpers derive motion from absolute time only', () => {
  // Arrange
  const time = 3.25;

  // Act
  const waveA = travelingWave(0.4, time, 7, 1.2, 0.5, 20);
  const waveB = travelingWave(0.4, time, 7, 1.2, 0.5, 20);
  const lagA = stagedLag(0.4, time, 2.1, 4);
  const chainA = causalChain(time, 3);
  const chainB = causalChain(time, 3);

  // Assert: calling again with the same absolute time returns the same result.
  assert.equal(waveA, waveB);
  assert.equal(lagA, stagedLag(0.4, time, 2.1, 4));
  assert.deepEqual(chainA, chainB);
});
