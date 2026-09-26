# MotionLoom Prompt Optimizer Pipeline

Transform raw, high-level creative briefs into production-grade, mathematically deterministic JavaScript motion graphics and launch film specifications.

## Overview

The MotionLoom Prompt Optimizer acts as an advisory director and technical compiler. It takes informal creative concepts (e.g., *"Make a slick Google AI style product launch video for my developer tool"*) and optimizes them through a 6-phase analysis pipeline before any code is written.

---

## 6-Phase Optimization Pipeline

```text
[Phase 0: Project & Assets Detection]
                 ↓
[Phase 1: Intent & Genre Classification]
                 ↓
[Phase 2: Scope & Duration Assessment]
                 ↓
[Phase 3: Component & Math Profile Matching]
                 ↓
[Phase 4: Context Gap & Sensory Analysis]
                 ↓
[Phase 5: Workflow, Model Tiering & Visual Token Design]
```

---

### Phase 0: Project & Asset Detection
Inspect the current workspace to anchor design reality:
1. **Brand Palette & Typography**: Check existing web assets, CSS tokens, Tailwind configs, or `project.motion.json`.
2. **Product UI Elements**: Inspect existing React components, screenshots, SVG icons, or CLI logs to ensure visual truth.
3. **Renderer Engine Target**: Detect whether the target is `product-launch` (Remotion/HTML5 Canvas), `pure-procedural` (p5.js/p5.brush), or `hybrid`.

---

### Phase 1: Intent & Genre Classification

| Genre | Core Visual Language | Target Math & Physics |
|---|---|---|
| **Big Tech Product Launch** | Dark slate (`#0B0F19`), bento grids, glassmorphism, glowing cursor morphs | Critical damping ($d \ge 1.0$), spring transitions, stagger delays |
| **Character & Story** | Rigged expressive 2D primitives, squash & stretch, dynamic eyes/mouths | Organic lag (`stagedLag`), harmonic head bobs, eye blinks |
| **Generative & Procedural** | Vector flows, stipple grain, halftone risographs, wave equations | Multi-octave Perlin noise, rotary harmonic matrices, polar transforms |
| **Kinetic Explainer** | Punch slam titles, highlighted code diffs, diagram nodes | Velocity ramps, dynamic zoom pivots, causal light pulses |

---

### Phase 2: Scope & Shot Pacing Assessment

Estimate shot count, transition timing, and resolution:

| Film Duration | Shot Count | Average Shot Length | Key Transitions |
|---|---|---|---|
| **5 Seconds (Hero Hook)** | 1–2 shots | 2.5s | Single seamless morph transition |
| **10–15 Seconds (SaaS Ad)** | 4–6 shots | 2.0s – 2.5s | 3 cut wipes, 1 spatial camera zoom, 1 morph |
| **30 Seconds (Explainer)** | 8–12 shots | 2.5s – 3.0s | Multi-track timeline, bento card flips, code diffs |

---

### Phase 3: Component & Engine Primitives Matching

Map visual demands to deterministic engine modules:

- **Typography**: `kineticTitle`, `typewriterText`, `staggeredWords`, `punchSlam`
- **UI & Bento Elements**: `productWindow`, `bentoCard`, `metricPill`, `codeEditorWindow`
- **Physics & Motion**: `springy`, `anticipate`, `bounce`, `shake`, `camera`
- **Morph Tokens**: `morphPath`, `samplePath`, `pathNormals`
- **Natural Media / Shaders**: `grain`, `halftone`, `radialGlow`, `offscreenCache`

---

### Phase 4: Context Gap & Sensory Analysis

Scan for missing directorial specs:
- [ ] **Exact Palette**: Ink (`#0B0F19`), Paper (`#0F172A`), Accents (Cyan, Amber, Violet).
- [ ] **Recurring Visual Token**: What single shape threads across every scene cut? (e.g., amber cursor pill $\to$ search bar $\to$ card outline $\to$ logo).
- [ ] **Sound Design & Audio Markers**: Cues for bass drops, whoosh sweeps, click pops, and punch slams.
- [ ] **Acceptance & Readability**: Main focal point identifiable within 0.25s of every transition.

---

### Phase 5: Workflow, Model Tiering & Prompt Output

1. **Recommended Model Tier**:
   - **Director / Planning**: Claude 3.7 Sonnet / Claude Opus 5.5 (for storyboard, color harmony, and script pacing).
   - **Implementation**: Claude 3.7 Sonnet (for deterministic Canvas math, unit tests, and layout code).
2. **Visual Evidence Plan**:
   - Contact Sheet (`npm run contact`)
   - Transition Strip (`npm run strip`)
   - 60fps MP4 Export (`npm run video`)

---

## Output Template

When executing `/prompt-optimizer` on a motion brief, format the response as:

```markdown
### 1. Director's Diagnosis
- **Genre & Style**: [e.g., Big Tech SaaS AI Launch / Dark Slate Glassmorphism]
- **Core Visual Token**: [e.g., Glowing Neon Amber Pill]
- **Motion Rhythm**: [e.g., Fast punchy spring entrances with critically damped settles]

### 2. Shot-by-Shot Storyboard Specification
| Shot | Timing | Focal Subject | Camera & Motion | Transition | Audio Cue |
|---|---|---|---|---|---|
| 01 | 0.0–2.2s | ... | ... | ... | ... |
| 02 | 2.2–4.5s | ... | ... | ... | ... |

### 3. Optimized Ready-to-Run Prompt
```text
/motionloom [Expanded deterministic specification with exact math, colors, spring constants, and evidence commands]
```
```
