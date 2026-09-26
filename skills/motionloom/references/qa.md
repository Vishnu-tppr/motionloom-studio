# Visual QA

Inspect renders, not assumptions.

- Contact sheet: first/middle/last frame of every shot.
- Transition strip: every frame around cuts, wipes, morphs, turns and contacts.
- Detail crops: faces, hands, type, UI data and intersections.
- Full-speed review: silent pass for visual rhythm; audio pass for synchronization.
- Temporal stability: render the same timestamp twice and diff pixels — any difference is `TEMPORAL TEXTURE INSTABILITY` (per-frame random or uncached texture). Run `node engine/tools/detector.mjs` for the static source scan and `npm run check` for canonical + legacy project-contract validation.
- Token continuity: follow the recurring token across every transition strip; it must move/morph through motivated positions, never pop, vanish, or crossfade as a fake morph. Every token state must use the same sample count; `morphPath` rejects mismatches.
- Loop check: first and last frames must match for loop projects.

Reject blank frames, one-frame flashes, seeded-texture flicker, tangent collisions, accidental registration drift, unreadable silhouettes, unstable focal points, fake morphs, dead air and excessive simultaneous movement. Keep a QA log with defect, evidence, correction and rerender path.
