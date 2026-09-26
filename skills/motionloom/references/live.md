# MotionLoom Live

Live is a trusted-localhost editing bridge. It combines a Canvas preview, inspectable scene registry, property controls, draggable shot timeline, cues, undo/redo, and a persistent Claude steering queue.

## Session

1. Run `npm run live`.
2. Open `http://127.0.0.1:4173` if it does not open automatically.
3. Select an object in Canvas or the object list.
4. Direct controls write safe values to `engine/project.motion.json`.
5. Natural-language directions produce event files under `.motionloom/live/events/`.
6. Run `npm run live:poll`. Read the returned event, inspect its context, implement the change and run tests.
7. Reply with the exact `live-agent reply` command shown in `_instructions`.

Direct controls are transactional at the project-data level. Structural requests such as “turn this reveal into a ribbon morph” require a source edit in `engine/src/`.

## Safety

The server binds only to `127.0.0.1`, validates WebSocket origins, limits request bodies, restricts static files to the repository, accepts only known patch kinds, blocks prototype keys and never executes browser-provided shell commands. Do not deploy this server publicly.
