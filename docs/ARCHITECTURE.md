# MotionLoom architecture

The Claude Code skill carries motion-design knowledge. The browser runtime provides deterministic random-access rendering. MotionLoom Live exposes an inspectable scene graph and transactional controls. The local server validates writes and stores accepted history. Renderer adapters can later provide p5.js, SVG, Motion Canvas and Remotion implementations without changing the production workflow.

`project.json` is the editable source of truth for declared controls. Structural scene changes remain source-code edits reviewed by Claude and verified through rendered evidence.
