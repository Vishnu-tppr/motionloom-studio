import test from 'node:test';
import assert from 'node:assert/strict';
import {
  surface,
  cacheLayer,
  clearCache,
  cacheKey,
  samplePath,
  pathNormals,
  morphPath,
  defineMorphToken
} from '../src/procedural.js';
import { travelingWave, stagedLag, causalChain } from '../src/motion.js';



test('samplePath returns correct count and endpoints', () => {
  const lineFn = u => ({ x: u * 10, y: u * 20 });
  const points = samplePath(lineFn, 2);
  assert.equal(points.length, 3); // 0, 0.5, 1.0 (n+1 points)
  assert.deepEqual(points[0], { x: 0, y: 0 });
  assert.deepEqual(points[1], { x: 5, y: 10 });
  assert.deepEqual(points[2], { x: 10, y: 20 });
});

test('pathNormals calculates unit normals correctly', () => {
  // A vertical line from (0,0) to (0,10)
  const points = [{ x: 0, y: 0 }, { x: 0, y: 5 }, { x: 0, y: 10 }];
  const processed = pathNormals(points);

  // Normal should be (-1, 0) pointing left
  assert.equal(processed[0].nx, -1);
  assert.equal(processed[0].ny, 0);
  assert.equal(processed[1].nx, -1);
  assert.equal(processed[1].ny, 0);
  assert.equal(processed[2].nx, -1);
  assert.equal(processed[2].ny, 0);
});

test('morphPath lerps between paths exactly', () => {
  const pathA = [{ x: 0, y: 0 }, { x: 10, y: 10 }];
  const pathB = [{ x: 5, y: 5 }, { x: 20, y: 0 }];

  const mid = morphPath(pathA, pathB, 0.5);
  assert.deepEqual(mid[0], { x: 2.5, y: 2.5 });
  assert.deepEqual(mid[1], { x: 15, y: 5 });

  const start = morphPath(pathA, pathB, 0);
  assert.deepEqual(start, pathA);

  const end = morphPath(pathA, pathB, 1);
  assert.deepEqual(end, pathB);
});

test('defineMorphToken returns stable function', () => {
  const token = defineMorphToken((u, t, a, b) => ({
    x: u + t,
    y: a + b
  }));

  const result = token(0.5, 1, 0, 0);
  assert.deepEqual(result, { x: 1.5, y: 0 });
});

test('travelingWave returns periodic bounded values', () => {
  const w1 = travelingWave(0.5, 1, Math.PI, 1, 0, 10);
  assert.ok(isFinite(w1));
  assert.ok(w1 <= 10 && w1 >= -10);
});

test('stagedLag is 0 at root u=0', () => {
  const lagAtRoot = stagedLag(0, 1, 0, 12);
  assert.equal(lagAtRoot, 0);
});

test('surface works headlessly and cacheLayer memoizes by key', () => {
  clearCache();
  let paints = 0;
  const a = cacheLayer(() => { paints++; }, 64, 64, 7);
  const b = cacheLayer(() => { paints++; }, 64, 64, 7);
  assert.equal(paints, 1);
  assert.equal(a, b);
  assert.equal(cacheKey(64, 64, 7), '64:64:7');
  assert.ok(surface(8, 8));
});

test('morphPath rejects mismatched sample counts', () => {
  assert.throws(() => morphPath([{ x: 0, y: 0 }], [{ x: 0, y: 0 }, { x: 1, y: 1 }], 0.5), RangeError);
});

test('defineMorphToken accepts config form with named states', () => {
  const token = defineMorphToken({
    id: 'journey-ribbon',
    states: {
      steam: u => ({ x: u, y: 0 }),
      river: u => ({ x: u, y: 10 }),
      kiteTail: u => ({ x: u, y: 20 })
    },
    correspondence: 'normalized-length',
    samples: 10
  });
  assert.equal(token.id, 'journey-ribbon');
  assert.deepEqual(token(0.5, 0, 0, 0), { x: 0.5, y: 0 });
  assert.deepEqual(token(0.5, 0, 1, 1), { x: 0.5, y: 20 });
});

test('causalChain derives anticipation/action/follow from absolute time', () => {
  const c = causalChain(1, 1);
  assert.equal(typeof c.driver, 'number');
  assert.equal(typeof c.anticipation, 'number');
  assert.equal(typeof c.follow, 'number');
  assert.deepEqual(causalChain(2, 1), causalChain(2, 1));
});
