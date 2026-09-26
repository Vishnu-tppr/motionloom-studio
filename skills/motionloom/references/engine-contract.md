# Engine Contract & Deterministic Render Spec

Canonical source of truth is `engine/data/project.json` with `renderContract: "motionloom/1"`. Use `engine/src/project-contract.js` to normalize and validate it:

```js
import { normalizeProject, validateTimeline } from '../src/project-contract.js';
const project = normalizeProject(JSON.parse(rawJson));
const errors = validateTimeline(project).filter((f) => f.severity === 'error');
```

---

## 1. Pure Render Contract

Every scene and layer renderer MUST adhere to the pure mathematical signature:

```javascript
renderScene(ctx, t, sceneState, seededRng)
```

### Parameters:
- `ctx`: Canvas 2D or p5 instance context.
- `t`: Normalized absolute timeline timestamp in seconds ($0.0 \le t \le \text{duration}$).
- `sceneState`: Immutable configuration object for the scene (dimensions, palette, focal subject, layout config).
- `seededRng`: PRNG instance initialized with stable seed (e.g. `createRng(seed)` from `core.js`).

### Non-Negotiable Determinism Invariants:
1. **Mathematical Purity**: $f(t) \to \text{frame}$. Output must be strictly deterministic across random-access seeking and sequential rendering.
2. **Forbidden APIs**: Never invoke `Math.random()`, `Date.now()`, `performance.now()`, DOM mutations, or asynchronous network requests in render loops.
3. **No Accumulator Drift**: Never store mutable frame-to-frame delta state (e.g. `particle.x += speed * dt`). Calculate position explicitly as a function of $t$: `particle.x = initialX + speed * t`.

---

## 2. Offscreen Surface Caching

Heavy procedural layers (stipple shading, dot grids, vector textures, grain) must be memoized using offscreen canvases:

```javascript
import { surface, cacheLayer, cacheKey } from '../src/procedural.js';

// Cache key must include all static inputs affecting pixels
const key = cacheKey('bento_grid', { width: 1280, height: 720, dotSize: 2, seed: 0x4f2a });

const bgGraphics = cacheLayer(key, () => {
  const g = surface(1280, 720);
  // Perform expensive drawing once...
  return g;
});

// Fast blit in render loop:
ctx.image(bgGraphics, 0, 0);
```

---

## 3. Core Engine Modules

- `core.js`: Seeded RNG (`createRng`), camera coordinate transforms (`worldToScreen`, `applyCamera`), noise generators (`seededNoise`).
- `motion.js`: Springs (`spring`), organic lag (`travelingWave`, `stagedLag`), causal action chains (`causalChain`).
- `procedural.js`: Offscreen surface memoization (`surface`, `cacheLayer`), halftone/stipple shaders, equal-point shape morphing (`samplePath`, `morphPath`, `defineMorphToken`).
- `timeline.js`: Shot management, easing interpolation, cut-boundary transitions.
- `typography.js`: Kinetic type animations (`punchSlam`, `typewriterText`, `wordStagger`, `statCallout`).
- `character.js`: Reusable 2D character rig, limb kinematics, facial expression interpolators.
- `product.js`: Truthful SaaS UI windows, bento grids, code snippet cards, interactive cursors.
- `scenes/*.js`: Composable project-level shot definitions.
- `tools/render.mjs`: Headless Puppeteer + FFmpeg renderer for stills, contact sheets, frame strips, and 60fps MP4 video.
