# Story and motion

A film needs one transformation and one payoff. Summarize setup, change and resolution in three sentences. Select a recurring token—a line, pulse, ribbon, cursor, seed, orbit or character prop—that persists across shots.

Each shot must answer: what should the viewer notice, what changes, why now, and what carries into the next shot? Distinguish match cuts, shared-object transitions, iris/mask reveals, camera dives, occlusion wipes and true shape/path morphs. A crossfade is not a morph.

Motion hierarchy: primary action first, secondary follow-through second, texture last. Give the eye time to identify a subject before changing it. Hold the payoff longer than the setup details.

## Persistent-token planner

Every montage needs at least one persistent visual token whose position, shape, color or movement connects consecutive shots (proven by the proof-of-concept ribbon: steam → river → kite tail). Plan per shot: where the token enters, what state/shape it holds, where it exits — so transitions morph corresponding points (`samplePath` → `morphPath` with equal `N`) instead of cutting between unrelated pictures.

## Motion-causality recipe

Connect anticipation, action, lag and follow-through to one shared driver, not independent wobbles: anticipation slightly before the event, body response at the event (`driver`), appendages/cloth later (`follow`), amplitude damped during settle. Use `causalChain(t, at)` + `travelingWave`/`stagedLag` from `motion.js` (see `references/procedural-art.md`).
