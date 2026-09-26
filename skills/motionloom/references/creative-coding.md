# Deterministic creative coding

Proven end-to-end by `proof-of-concept/code/jellyfish-animated.html` and
`proof-of-concept/code/follow-a-litle-wonder.html`: static illustration
first, then analytic `renderAt(t)`, cached static layers, seeded identity,
shared causal motion signals, equal-N token morphs, scrub/replay controls,
and the same browser code exported offline.

## Static-first method

Prove the composition as a still. Split it into static background, object identity, dynamic deformation, foreground treatment and typography. Cache layers whose pixels do not depend on time.

Use `procedural.js` for this split (see `references/procedural-art.md` for full recipes):

```js
import { surface, cacheLayer } from '../procedural.js';
import { hash } from '../core.js';
const key = hash(PROJECT.seed, objectId, styleVersion);
const layer = cacheLayer((ctx, seed) => { /* seeded marks only */ }, W, H, key);
// per-frame: drawImage(layer) + analytic deformation + grain overlay
```

Cache key must include every input affecting pixels (seed, object id, style version, dimensions, palette). Regenerate only when the key changes — never per frame, never with time or `Math.random()` inside.

## Stable texture

A procedural object's grain, spots, hatch placement and silhouette noise derive from `hash(projectSeed, objectId, styleVersion)`, not time. Environmental particles may move, but their identity and trajectory remain seeded.

```js
import { dotPattern, linePattern, stipple } from '../procedural.js';
stipple(ctx, x, y, w, h, density, hash(PROJECT.seed, objectId, styleVersion), color);
```

Texture stays attached to object coordinates: clip-then-pattern-fill, or scale the cached sprite (`scale(w,h); drawImage(sprite)`). Motes drift analytically: `x + 11*sin(TAU*t/LOOP + p)`.

## Motion causality

Start with a driver signal. Derive anticipation slightly before it, body response at the event, appendage/cloth response later, then damp the amplitude during settling. Related movement should share phase and cause rather than use unrelated sine waves.

```js
import { travelingWave, stagedLag, causalChain } from '../motion.js';
const slow = TAU*t/LOOP + phase, beat = TAU*t/3 + phase, flow = TAU*t/6;
const sway = travelingWave(u, t, freq, speed, phase, 12 + u*37); // ends lag roots
const lag = stagedLag(u, t, beat, lagFactor);                    // kick decays to root
const { driver, anticipation, follow } = causalChain(t, eventAt); // anticipation/action/follow split
```

`t` in `stagedLag(u, t, beat, lagFactor)` is the absolute clock (reserved for future damping); the oscillation phase comes from `beat`, which the caller derives from `t`. Keep one shared `slow`/`beat`/`flow` per creature/object.

## Persistent token

Choose a recognizable color, stroke, shape or object. Define a normalized path for every state, sample each to the same point count, then interpolate corresponding samples. The token should enter and leave shots in spatially motivated positions.

```js
import { samplePath, pathNormals, morphPath, defineMorphToken } from '../procedural.js';
const A = samplePath(stateA, N), B = samplePath(stateB, N); // same N!
const pts = morphPath(A, B, easedProgress);                 // easedProgress = f(absolute t)
const ribbon = defineMorphToken((u, t, a, b) => mix(mix(A(u,t), B(u,t), a), C(u,t), b));
```

A crossfade is not a morph. Width/extrusion uses `pathNormals` (`edge = pt ± n*width(u)`). Progress (`a`, `b`) must be analytic functions of absolute time.

## Random-access rendering

`renderAt(t)` must work in any order. Never integrate velocity from the previous rendered frame. Derive position and deformation analytically from absolute time.
