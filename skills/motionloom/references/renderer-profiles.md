# Renderer Profiles

Choose a renderer profile based on the project's needs. Each profile trades off
determinism, visual fidelity, and development velocity.

## Product-Launch (Remotion/React)

- **Best for**: SaaS demos, launch films, ads, UI motion requiring pixel-perfect
  replication of supplied assets or complex compositing.
- **How it works**: Uses Remotion (or plain React) to render HTML/CSS/JS into
  video frames. The engine drives time and supplies deterministic data via
  props; Remotion handles the render loop and encoding.
- **Determinism**: Fully deterministic if the React tree is pure and driven by
  time and seeded inputs. Avoid useEffect, fetch, or Date.now() in render paths.
- **Pros**: Leverages web ecosystem, easy to iterate with hot reload, ideal for
  text, logos, and supplied screenshots.
- **Cons**: Heavier weight, longer render times, requires Node.js and Chrome.
- **Entry point**: `engine/src/renderer/product-launch.js`
- **Example command**: 
  ```bash
  node engine/tools/render.mjs --video --profile=product-launch --out=out/video.mp4
  ```

## Pure-Procedural (Self-contained HTML/Canvas)

- **Best for**: Abstract art, loops, generative films, character animation where
  every pixel is computed and no external assets are needed.
- **How it works**: Plain p5.js (with optional p5.brush) on a canvas. The entire
  frame is a pure function of time, seed, and project data. No DOM beyond the
  canvas.
- **Determinism**: Guaranteed if using seeded RNG and avoiding wall-clock time,
  network, or previous-frame state.
- **Pros**: Fastest render, easiest to inspect and debug, works headlessly.
- **Cons**: Limited to what can be drawn procedurally; complex UI replication
  requires significant code.
- **Entry point**: `engine/src/renderer/pure-procedural.js`
- **Example command**:
  ```bash
  node engine/tools/render.mjs --video --profile=pure-procedural --out=out/video.mp4
  ```

## Hybrid (Remotion + Procedural Canvas/SVG)

- **Best for**: Projects needing both supplied assets (logos, screenshots) and
  procedural elements (backgrounds, effects, character animation).
- **How it works**: Remotion renders the HTML/CSS layer, while a procedural
  canvas (or SVG) layer is composited on top or underneath via
  `react-p5-wrapper` or direct canvas drawing in a Remotion component.
- **Determinism**: Deterministic if both layers are pure functions of time and
  seed. The composition must not introduce race conditions.
- **Pros**: Best of both worlds—asset fidelity and procedural flexibility.
- **Cons**: More complex setup; requires careful layer synchronization.
- **Entry point**: `engine/src/renderer/hybrid.js`
- **Example command**:
  ```bash
  node engine/tools/render.mjs --video --profile=hybrid --out=out/video.mp4
  ```

## Switching Profiles

Set the profile via the `--profile` flag in the render tool, or default to
`pure-procedural` when omitted. The profile is also recorded in
`project.json` under `rendererProfile` for team consistency.

## Determinism Verification

Regardless of profile, run `npm run check` to validate the project contract
and `npm test` for unit tests. Use the determinism scanner
(`node engine/tools/detector.mjs`) to detect frame-to-frame texture
instability.

## Performance Notes

- **Product-launch**: Measure first paint and CPU/GPU usage; consider
  simplifying CSS animations and using `will-change`.
- **Pure-procedural**: Cache expensive layers via `surface()` and `cacheLayer()`
  in `procedural.js`; reduce mark density for complex paths.
- **Hybrid**: Profile both layers; the procedural layer often benefits from
  offscreen caching, while the HTML layer benefits from CSS compositor
  properties (transform, opacity).

## Choosing a Profile

1. **Start pure-procedural** if the concept can be drawn with code.
2. **Switch to hybrid** if you need to composite supplied assets with
   procedural effects.
3. **Use product-launch** only when pixel-perfect replication of a complex
   UI or design system is required and the timeline justifies the render cost.