---
name: motionloom
description: Create, direct, inspect, and render deterministic JavaScript animation with p5.js/p5.brush. Use for hand-painted character films, procedural art, loops, explainers, launch videos, SaaS product motion graphics, animated diagrams, or any request to turn a creative brief into MP4/WebM/GIF/HTML. Triggers on animation, motion graphics, storyboard, code-drawn film, procedural canvas, product video, or character acting requests.
metadata:
  author: Vishnu
  version: 0.1.0
  license: MIT
---

# MotionLoom

Direct a visual idea into deterministic, code-drawn motion. The engine is p5.js-first and may use p5.brush when natural media improves the concept. Never begin with a giant implementation. First define the point, then prove the look, then build and inspect in small batches.

MotionLoom is a **reusable skill/plugin for generating deterministic JavaScript motion graphics from a brief** — not an animation template. Given a visual/product-animation brief, it teaches Claude how to design, structure, implement, optimize, preview, debug, and export polished motion graphics in JavaScript.

The core end-to-end workflow is: build a static procedural illustration first → convert it into deterministic animation → optimize it via offscreen surface caches → connect multiple scenes through a recurring visual element (morph token) → inspect frames → export the same browser render to MP4.

## Route the request

Read only the relevant workflow reference:

| Request | Read |
|---|---|
| Character story, cartoon, acting | `references/character-film.md` |
| Abstract/generative/procedural artwork | `references/procedural-art.md` |
| SaaS demo, launch film, UI motion, ads | `references/product-motion.md` |
| Any film | `references/story-and-motion.md`, `references/qa.md` |
| Deterministic technique recipes | `references/creative-coding.md` |
| New project or engine changes | `references/engine-contract.md` |

## Intake

Ask only what is missing, in one compact turn: objective/audience, duration, aspect ratio, desired medium/style, audio, supplied product/character assets, and one or two references. Recommend defaults when the user is unsure. Write `BRIEF.md` before implementation.

## Non-negotiable contract

- Every rendered frame is a pure function of project data, timestamp/frame, viewport and seeded inputs.
- Never use `Math.random()` in render paths, wall-clock time, network-fetched runtime assets, or previous-frame state.
- A random-access render at time `t` must match sequential playback at `t`.
- User assets are allowed only when requested; record source, license and hash in `ASSETS.md`.
- Do not imitate a living artist or copy a reference shot-for-shot. Extract high-level properties and create a new composition.
- Prefer one focal idea per shot and one recurring visual token across the film.
- Animation must have causality: anticipation, action, follow-through and settle; avoid unrelated decorative wobble.
- For product work, visual truth beats style. Do not invent product behavior or fake interface states.

## Workflow

1. **Brief:** Write purpose, audience, format, duration, constraints, recurring token and success criteria.
2. **Storyboard:** Produce a shot table with start/end, focal subject, action, camera, transition, audio cue and proof requirement. Get approval before expensive implementation.
3. **Look proof:** Build one representative still and render `out/look.png`. Critique hierarchy, silhouette, color, medium and brand fit in writing.
4. **Engine first:** Confirm timing, seeded RNG, camera, marks, typography, transition and renderer primitives before full scenes.
5. **Build batches:** Implement no more than 4–8 shots before inspection.
6. **Inspect evidence:** Render contact sheets plus frame strips around every difficult transition. Never claim quality from source inspection alone.
7. **Compare:** For each hero hook, signature transition or end card, render 2–3 variants and choose against written criteria.
8. **Profile:** Cache static texture/layers, reduce excessive marks, and inspect render-time outliers.
9. **Gate:** Run `npm test`, determinism checks, transition strips and full-film review.
10. **Deliver:** Export requested formats and include exact commands, dimensions, FPS, duration, asset provenance and known limitations.

## Commands

```bash
npm install
npm run dev
npm run check
npm run contact
npm run strip
npm run still
npm run video
```

Direct render examples:

```bash
node engine/tools/render.mjs --still=4.5 --out=out/look.png
node engine/tools/render.mjs --sheet=0.5,2.5,4.5,6.5,8.5 --cols=3 --out=out/contact.png
node engine/tools/render.mjs --strip=3.7:4.3 --cols=6 --out=out/transition.png
node engine/tools/render.mjs --video --out=out/video.mp4
```

## Definition of done

- Brief and storyboard exist.
- Look proof was inspected.
- No forbidden nondeterminism is found by `npm run check`.
- Unit tests pass.
- Beginning/middle/end and every transition have rendered evidence.
- No blank frames, pops, texture flicker, text collisions, illegible UI or dead air.
- Full video was watched at normal speed at least twice: once without sound and once with sound if audio exists.
- Deliverables are reproducible from documented commands.
