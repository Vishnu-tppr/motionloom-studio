# MotionLoom Studio

**Describe the motion. Claude directs it. JavaScript draws it.**

MotionLoom Studio is an open-source Claude Code skill and plugin for creating **deterministic JavaScript motion graphics, character animation, and high-end SaaS/AI product launch videos** inspired by the viral Claude Opus 5.5 animation movement.

Instead of hallucinating video pixels, Claude acts as a creative director and mathematical animator—writing exact, deterministic Canvas/p5.js and Remotion code with spring physics, persistent visual tokens, kinetic typography, and headless 60fps MP4 export.

---

## Key Features

- **6-Phase Prompt Optimizer Pipeline**: Transforms high-level creative briefs into production-ready motion specifications (Intent Detection, Scope Assessment, Component Matching, Context Gap Analysis, and Model Tiering).
- **Three Selectable Renderer Profiles**:
  - `product-launch`: Remotion + React + Canvas/SVG for SaaS demos, bento grids, and UI launches.
  - `pure-procedural`: Pure HTML/Canvas (p5.js/p5.brush) for character acting, loops, and procedural art.
  - `hybrid`: Remotion timeline & audio orchestration paired with procedural Canvas shaders and marks.
- **Strict Deterministic Render Contract**: `renderScene(ctx, t, sceneState, seededRng)` guarantees that random-access frame queries match sequential playback with zero state drift.
- **Offscreen Surface Caching**: Memoizes expensive background textures, vector marks, and stipple shading with cache keys for high-performance rendering.
- **Persistent Visual Tokens**: Equal-point path morphing (`morphPath`) to thread visual motifs (glowing ribbons, energy sparks, cursor pills) seamlessly across cuts.
- **Multi-Variant Taste Loops**: Autonomously produces 3 creative variations (*Restrained*, *Balanced*, *Expressive*) for hero hooks and transitions.
- **Visual Evidence-Based QA**: Automated contact sheets (`--sheet`), cut-boundary frame strips (`--strip`), and determinism verification (`detector.mjs`).
- **Live Studio & WebSocket Steering Bridge**: Interactive browser studio with multi-track timeline scrubbing, real-time parameter tweaking, and Claude live steering.

---

## Quick Start

### 1. Install & Run Locally

```bash
git clone https://github.com/vishnu-tppr/motionloom-studio.git
cd motionloom-studio
npm install
npm run dev
```

Open `http://localhost:4173` to explore the Live Studio.

### 2. Run Headless Video & Evidence Rendering

```bash
# Verify determinism and project contract
npm test

# Generate visual evidence artifacts
npm run contact     # Multi-shot contact sheet (out/contact.png)
npm run strip       # Transition frame strip across cut boundaries (out/strip.png)
npm run still       # Single frame still (out/still.png)

# Render 60fps MP4 video
npm run video       # Exports out/video.mp4
```

---

## Install as Claude Code Plugin

Install directly into Claude Code from the marketplace:

```text
/plugin marketplace add vishnu-tppr/motionloom-studio
/plugin install motionloom-studio@motionloom-marketplace
```

Then prompt Claude in your project:

```text
/motionloom Create a 15-second high-end SaaS product launch video for an AI code review tool. Use dark mode slate, glassmorphism bento cards, a glowing amber cursor morph token, and spring physics. Storyboard first and render contact sheets before exporting MP4.
```

---

## Architecture

```text
.claude-plugin/          Plugin and marketplace manifests
skills/motionloom/       Claude Code skill instructions and references
  references/
    prompt-optimizer.md  6-phase prompt refinement pipeline & template
    renderer-profiles.md Specs for product-launch, pure-procedural & hybrid
    engine-contract.md   Pure render contract & offscreen cache spec
    product-motion.md    SaaS UI, bento grids, and kinetic typography
    character-film.md    Character rig, kinematics, and facial acting
    procedural-art.md    Procedural shapes, loops, and natural media
agents/                  Specialized subagents (director, live-editor, visual-QA)
engine/
  src/
    core.js              Seeded PRNG, noise, and camera coordinate math
    motion.js            Spring physics, organic lag, and causal chains
    procedural.js        Offscreen surface caching and equal-point path morphing
    typography.js        Kinetic type (punch slam, typewriter, stagger)
    product.js           Truthful UI cards, bento grids, and code windows
    character.js         2D rigged character primitives
    timeline.js          Shot timing and transition curves
  tools/
    render.mjs           Headless Puppeteer + FFmpeg renderer
    live-server.mjs      Localhost WebSocket steering server
    detector.mjs         Automated visual determinism & safe-area scanner
```

---

## Automated QA & Determinism Gate

MotionLoom enforces a zero-tolerance policy for visual drift:
1. **Purity Test**: Output at $t = X$ must remain pixel-identical regardless of seek history.
2. **0.25s Fast-Readability Test**: Main subject and typography hierarchy must be clear within 0.25s of any shot transition.
3. **Transition Strip Audit**: Frame-by-frame strips across cut boundaries to verify continuous velocity vectors and eliminate visual pops.

---

## License

MIT © MotionLoom Studio Contributors.
