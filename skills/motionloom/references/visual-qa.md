# Visual QA

Check first/middle/last frames of every shot and at least 5 frames around each transition. Compare two renders of the same timestamp for byte or pixel equality (`TEMPORAL TEXTURE INSTABILITY` on any diff — see `references/qa.md`). Check first and last frame similarity for loops. Inspect safe areas, text contrast, object clipping, token continuity, texture stability and sudden changes in position, scale, rotation or opacity. Every finding needs a timestamp, object ID, evidence, cause and repair. Run `node engine/tools/detector.mjs` as the static pre-scan.
