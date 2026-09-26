# Procedural art

Choose a mark-making system, not merely a palette: halftone drums, pencil hatching, ink wash, chalk scumble, cut paper, stipple, flat vector or controlled geometric fields. Document edge behavior, layering order, texture scale and compositing.

Seed every distribution. Attach surface marks to object coordinates so they do not sparkle between frames. Separate deliberately moving particles from fixed texture. Prefer repeated structures and controlled variation over millions of undirected marks.

Prove the medium on one still. Test at delivery resolution and normal playback speed; dense dots and high-frequency linework can shimmer after video compression.

## Offscreen layer caching (`procedural.js`)

Static-first: split the frame into static background / object identity / dynamic deformation / foreground grain / typography. Cache any layer whose pixels do not depend on time.

```js
import { surface, cacheLayer, cacheKey, dotPattern, linePattern, stipple } from '../procedural.js';
import { hash } from '../core.js';

// 1. Raw surface
const paper = surface(W, H);

// 2. Immutable cached layer — key must include every input affecting pixels.
// cacheLayer memoizes on `${w}:${h}:${seed}`, so build the seed from all inputs.
const seed = hash(PROJECT.seed, 'backdrop', 1);
const backdrop = cacheLayer((ctx, s) => {
  // gradient wash + 6200 seeded particles + light shafts
  // use only s / seeded rng here, never Math.random() or time
}, W, H, seed);

// explicit composite key for multi-input layers
const key = cacheKey(W, H, PROJECT.seed, objectId, styleVersion);

// per-frame: drawImage(backdrop) then dynamic animals/motes, then grain overlay
```

Rules proven by `proof-of-concept/code/jellyfish-animated.html`:
- Render expensive unchanging marks once (`backdrop`, `lettering`, per-animal `makeBell(id)` sprites) and reuse with `drawImage` every frame.
- Generate each tentacle/particle identity once at init from its own seeded rng so it cannot flicker; animate only position analytically from `renderAt(t)`.
- Keep a final thin grain layer on top to tie the illustration together.
- In p5 scenes, call `cacheLayer` once per seed/style version (module scope or lazy init), never inside the per-frame draw without a key check. Use `clearCache(prefix)` when a style version retires.
- `surface()`/`cacheLayer()` degrade gracefully in Node (stub canvas) so unit tests can import them; patterns return stub objects headlessly and real `CanvasPattern` in browsers.

## Vector texture (`dotPattern`, `linePattern`, `stipple`)

```js
const dots = dotPattern(9, 1.35, ink);      // returns CanvasPattern 'repeat'
const hatch = linePattern(12, 1, ink);

function paint(ctx, path2D, color, texture = 0.2, useHatch = false) {
  ctx.fillStyle = color; ctx.fill(path2D);
  if (texture) { ctx.save(); ctx.clip(path2D); ctx.globalAlpha *= texture;
    ctx.fillStyle = useHatch ? hatch : dots;
    ctx.fillRect(-1500, -1500, 4000, 4000); ctx.restore(); }
}

// Seeded stipple bound to object space — texture stays attached during squash/stretch
stipple(ctx, x, y, w, h, density, hash(PROJECT.seed, objectId, styleVersion), color);
```

Attach grain/spots/hatch to object coordinates (clip then pattern-fill, or scale the already-drawn sprite — see jellyfish `ctx.scale(bellWidth,bellHeight); drawImage(bell)`). Environmental motes may drift but their identity/trajectory stays seeded: `m.x + 11*sin(p)`.

## Morph tokens — interpolate points, not crossfade

A true morph samples every state to the same point count then lerps corresponding samples. Proven by `proof-of-concept/code/follow-a-litle-wonder.html` ribbon (steam → river → kite tail):

```js
import { samplePath, pathNormals, morphPath, defineMorphToken } from '../procedural.js';

// Each state is a pure function u -> {x,y}
const steam = u => ({ x: 540 + 26*Math.sin(u*10 - t*1.8)*Math.sin(Math.PI*u), y: 648 - 455*u });
const river = u => ({ x: 570 + 165*Math.sin(u*6.8+0.7)*(1-u), y: 1160 - 767*u });
const kite  = u => ({ x: mix(355,733,u), y: 1030 - 651*u });

const N = 200;
const A = samplePath(steam, N), B = samplePath(river, N), C = samplePath(kite, N);
const withNormals = pathNormals(A); // adds unit {nx,ny} for ribbon width extrusion
let pts = morphPath(morphPath(A, B, a), C, b); // a,b are eased scene-progress 0..1

const ribbonToken = defineMorphToken((u, t, a, b) => {
  // mix(mix(steam(u,t), river(u,t), a), kite(u,t), b)
});
```

Requirements: same `N` for all states (`morphPath` throws `RangeError` on mismatch and clamps `t` to 0..1), progress values derived analytically from absolute time (`a=ease((t-3)/2.3)`), width/blend as functions of `u` and progress. Build width with normals: `edge = pt ± n*width(u)`.

Config shorthand (same sampling guarantee, pre-samples each state once):

```js
const ribbonToken = defineMorphToken({
  id: 'journey-ribbon',
  states: { steam, river, kiteTail },
  correspondence: 'normalized-length',
  samples: 200
});
const pt = ribbonToken(u, t, a, b); // mix(mix(steam, river, a), kiteTail, b) at u
```

## Organic waves (`motion.js`)

```js
import { travelingWave, stagedLag } from '../motion.js';
const TAU = Math.PI*2, LOOP = 12;
const slow = TAU*t/LOOP + phase;   // loop-closed drift
const beat = TAU*t/3 + phase;      // pulse
const flow = TAU*t/6;              // shared cause

sway = travelingWave(u, t, 7, flowRate, f.phase, 12 + u*37);
// = sin(u*freq + phase - t*speed) * amplitude — ends react later than roots
lag  = stagedLag(u, t, beat, 4);
// = lagFactor*u*sin(beat - u*lagFactor) — kick decays toward root
x = root*bellWidth + sway + u*u*82 + lag;
```

Related movement must share phase/cause (`slow`/`beat`/`flow`), not unrelated sines. Antennae/cloth lag the driver; damp amplitude during settle.

Use `causalChain(t, at, cycle, lag)` for the standard anticipation → action → follow-through split (all from absolute time so scrubbing and export agree):

```js
import { travelingWave, stagedLag, causalChain } from '../motion.js';
const { driver, anticipation, follow } = causalChain(local, eventAt, 1.45, 0.27);
// body: translate(0, -14*anticipation); appendage: rotate(follow*.035); squash: scale(1+.035*driver, 1-.045*driver)
```

