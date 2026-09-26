/**
 * Canvas Live scene painters.
 *
 * Every painter is a pure function of the absolute `time` argument plus cached,
 * seeded layers. Nothing integrates per-frame state, and text alignment is set
 * explicitly before each fill, so scrubbing to any timestamp matches playback.
 */
import { clamp, damped, elasticOut, phase, rng } from './math.js';
import { halftone, stableParticles } from './motion-kit.js';

/** Full turn in radians. @type {number} */
const TAU = Math.PI * 2;
/** Ink color for outlines, labels, and body copy. @type {string} */
const INK = '#13203f';
/** Accent color for the persistent token, callouts, and antenna. @type {string} */
const CORAL = '#f55372';
/** Warm paper color for knockout text on dark shapes. @type {string} */
const PAPER = '#f4f0e5';
/** Character outline weight in pixels. @type {number} */
const OUTLINE_WEIGHT = 8;
/** Default entrance duration in seconds when controls omit one. @type {number} */
const DEFAULT_ENTRANCE = 0.7;
/** Eye x offsets inside the character layer. @type {number[]} */
const EYE_OFFSETS = [-25, 25];
/** Eye vertical offset inside the character layer. @type {number} */
const EYE_Y = -10;
/** Eye radius in pixels. @type {number} */
const EYE_RADIUS = 15;
/** Pupil radius in pixels. @type {number} */
const PUPIL_RADIUS = 5;
/** Head radius in pixels. @type {number} */
const HEAD_RADIUS = 68;
/** Cached character layer width in pixels. @type {number} */
const CHARACTER_LAYER_WIDTH = 260;
/** Cached character layer height in pixels. @type {number} */
const CHARACTER_LAYER_HEIGHT = 320;
/** Character anchor inside its cached layer. @type {{ x: number, y: number }} */
const CHARACTER_ORIGIN = Object.freeze({ x: 130, y: 140 });
/** Character image offset inside the object transform. @type {{ x: number, y: number }} */
const CHARACTER_IMAGE_OFFSET = Object.freeze({ x: -130, y: -140 });
/** Hook pulse center. @type {{ x: number, y: number }} */
const HOOK_PULSE_CENTER = Object.freeze({ x: 640, y: 365 });
/** Hook pulse base radius in pixels. @type {number} */
const HOOK_PULSE_RADIUS = 115;
/** Hook pulse radius breathing amplitude in pixels. @type {number} */
const HOOK_PULSE_DRIFT = 15;
/** Hook pulse base alpha. @type {number} */
const HOOK_PULSE_ALPHA = 0.13;
/** Hook pulse alpha breathing amplitude. @type {number} */
const HOOK_PULSE_ALPHA_DRIFT = 0.08;
/** Hook title horizontal breathing amplitude. @type {number} */
const HOOK_TITLE_BREATH = 0.008;
/** Breathing frequency shared by the hook pulse and title. @type {number} */
const HOOK_BREATH_RATE = 2;

/**
 * Apply one object's control transform, draw it, then register its hit bounds.
 * @param {import('./runtime.js').MotionRuntime} rt
 * @param {string} id
 * @param {number} local seconds since the shot started
 * @param {(ctx: CanvasRenderingContext2D, controls: Record<string, unknown>, entrance: number) => void} draw
 * @param {(controls: Record<string, unknown>, entrance: number) => { x: number, y: number, width: number, height: number }} bounds
 * @returns {void}
 */
function withObjectTransform(rt, id, local, draw, bounds) {
  const ctx = rt.ctx;
  const controls = rt.controls(id);
  const entrance = phase(local, 0, controls.entrance || DEFAULT_ENTRANCE);
  ctx.save();
  ctx.globalAlpha *= controls.opacity * entrance;
  ctx.translate(controls.x, controls.y);
  ctx.rotate((controls.rotation * Math.PI) / 180);
  const scale = controls.scale * elasticOut(entrance);
  ctx.scale(scale, scale);
  draw(ctx, controls, entrance);
  ctx.restore();
  rt.register(id, bounds(controls, entrance));
}

/**
 * Draw centered display type.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text
 * @param {number} size
 * @param {string} [color]
 * @returns {void}
 */
function title(ctx, text, size, color = INK) {
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `800 ${size}px "Arial",sans-serif`;
  ctx.fillText(text, 0, 0);
}

/**
 * Draw a caption line below the title baseline.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text
 * @param {number} [offset]
 * @returns {void}
 */
function caption(ctx, text, offset = 64) {
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.font = '22px "Arial",sans-serif';
  ctx.fillText(text, 0, offset);
}
/**
 * Shot 1: hero title over a breathing coral pulse.
 * @param {import('./runtime.js').MotionRuntime} rt
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} time
 * @returns {void}
 */
export function drawHook(rt, ctx, time) {
  const breath = Math.sin(time * HOOK_BREATH_RATE);

  withObjectTransform(rt, 'hero-title', time, (layer, controls) => {
    layer.save();
    layer.scale(1 + (breath * HOOK_TITLE_BREATH), 1);
    title(layer, controls.text, 70, controls.color);
    caption(layer, 'one visual token • endless transformations', 80);
    layer.restore();
  }, (controls) => ({
    x: controls.x - (360 * controls.scale),
    y: controls.y - (72 * controls.scale),
    width: 720 * controls.scale,
    height: 170 * controls.scale,
  }));

  ctx.save();
  ctx.fillStyle = CORAL;
  ctx.globalAlpha = HOOK_PULSE_ALPHA + (HOOK_PULSE_ALPHA_DRIFT * breath);
  ctx.beginPath();
  ctx.arc(
    HOOK_PULSE_CENTER.x,
    HOOK_PULSE_CENTER.y,
    HOOK_PULSE_RADIUS + (HOOK_PULSE_DRIFT * breath),
    0,
    TAU,
  );
  ctx.fill();
  ctx.restore();
}
/** Focused-mouth half width inside the character layer. @type {number} */
const FOCUSED_MOUTH_HALF_WIDTH = 22;
/** Focused-mouth y inside the character layer. @type {number} */
const FOCUSED_MOUTH_Y = 24;
/** Smile arc center y inside the character layer. @type {number} */
const SMILE_CENTER_Y = 12;
/** Smile arc radius inside the character layer. @type {number} */
const SMILE_RADIUS = 30;
/** Smile arc start angle. @type {number} */
const SMILE_START = 0.2;
/** Smile arc end angle. @type {number} */
const SMILE_END = Math.PI - 0.2;
/**
 * Limb strokes as `[fromX, fromY, toX, toY]` inside the character layer.
 * @type {number[][]}
 */
const CHARACTER_LIMBS = Object.freeze([
  [-53, 48, -96, 112],
  [53, 48, 96, 112],
  [-28, 65, -54, 145],
  [28, 65, 54, 145],
]);
/** Antenna stem center inside the character layer. @type {number} */
const ANTENNA_STEM_Y = -86;
/** Antenna stem radius inside the character layer. @type {number} */
const ANTENNA_STEM_RADIUS = 11;

/** Character bounce cycle length in seconds. @type {number} */
const CHARACTER_CYCLE = 1.45;
/** Anticipation lead offset in seconds. @type {number} */
const ANTICIPATION_LEAD = 0.15;
/** Rotation lag offset in seconds. @type {number} */
const LAG_LEAD = 0.27;
/** Settle start offset inside the bounce cycle. @type {number} */
const SETTLE_OFFSET = 0.55;
/** Settle oscillation frequency. @type {number} */
const SETTLE_FREQUENCY = 3.4;
/** Settle oscillation decay. @type {number} */
const SETTLE_DECAY = 4.6;
/** Vertical anticipation amplitude in pixels. @type {number} */
const ANTICIPATION_LIFT = 14;
/** Vertical settle amplitude in pixels. @type {number} */
const SETTLE_LIFT = 8;
/** Rotation contribution from lag. @type {number} */
const LAG_ROTATION = 0.035;
/** Rotation contribution from settle. @type {number} */
const SETTLE_ROTATION = 0.025;
/** Horizontal squash from the beat driver. @type {number} */
const DRIVER_SCALE = 0.035;
/** Vertical squash from the beat driver. @type {number} */
const DRIVER_SQUASH = 0.045;

/**
 * Head, eyes, and mouth for the cached character layer.
 * Caller must have set fill/stroke style and line width.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} mood
 * @returns {void}
 */
function drawHead(ctx, mood) {
  ctx.beginPath();
  ctx.arc(0, 0, HEAD_RADIUS, 0, TAU);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = 'white';
  for (const eyeX of EYE_OFFSETS) {
    ctx.beginPath();
    ctx.arc(eyeX, EYE_Y, EYE_RADIUS, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }

  ctx.fillStyle = INK;
  for (const eyeX of EYE_OFFSETS) {
    ctx.beginPath();
    ctx.arc(eyeX, EYE_Y, PUPIL_RADIUS, 0, TAU);
    ctx.fill();
  }

  ctx.beginPath();
  if (mood === 'focused') {
    ctx.moveTo(-FOCUSED_MOUTH_HALF_WIDTH, FOCUSED_MOUTH_Y);
    ctx.lineTo(FOCUSED_MOUTH_HALF_WIDTH, FOCUSED_MOUTH_Y);
  } else {
    ctx.arc(0, SMILE_CENTER_Y, SMILE_RADIUS, SMILE_START, SMILE_END);
  }
  ctx.stroke();
}

/**
 * Arms and legs for the cached character layer.
 * @param {CanvasRenderingContext2D} ctx
 * @returns {void}
 */
function drawLimbs(ctx) {
  ctx.beginPath();
  for (const [fromX, fromY, toX, toY] of CHARACTER_LIMBS) {
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
  }
  ctx.stroke();
}

/**
 * Coral antenna that marks the character as a broadcast source.
 * @param {CanvasRenderingContext2D} ctx
 * @returns {void}
 */
function drawAntenna(ctx) {
  ctx.fillStyle = CORAL;
  ctx.beginPath();
  ctx.arc(0, ANTENNA_STEM_Y, ANTENNA_STEM_RADIUS, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0, -75);
  ctx.lineTo(-15, -52);
  ctx.lineTo(15, -52);
  ctx.closePath();
  ctx.fill();
}

/**
 * Cached character body. Identity inputs are part of the cache key so a
 * recolored or remooded character can never reuse a stale layer.
 * @param {import('./runtime.js').MotionRuntime} rt
 * @param {Record<string, unknown>} controls
 * @returns {HTMLCanvasElement}
 */
function characterLayer(rt, controls) {
  const key = `character:${controls.bodyColor}:${controls.mood}`;
  return rt.cache.get(key, CHARACTER_LAYER_WIDTH, CHARACTER_LAYER_HEIGHT, (layer) => {
    layer.translate(CHARACTER_ORIGIN.x, CHARACTER_ORIGIN.y);
    layer.fillStyle = controls.bodyColor;
    layer.strokeStyle = INK;
    layer.lineWidth = OUTLINE_WEIGHT;
    drawHead(layer, controls.mood);
    drawLimbs(layer);
    drawAntenna(layer);
  });
}

/**
 * Shot 2: character beat with anticipation, lag, follow-through, and settle.
 * @param {import('./runtime.js').MotionRuntime} rt
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} time
 * @returns {void}
 */
export function drawCharacter(rt, ctx, time) {
  const local = time - 2;

  withObjectTransform(rt, 'spark', local, (layer, controls) => {
    const driver = Math.sin((local * TAU) / CHARACTER_CYCLE);
    const anticipation = Math.max(0, Math.sin(((local - ANTICIPATION_LEAD) * TAU) / CHARACTER_CYCLE));
    const lag = Math.sin(((local - LAG_LEAD) * TAU) / CHARACTER_CYCLE);
    const settle = damped((local % CHARACTER_CYCLE) - SETTLE_OFFSET, SETTLE_FREQUENCY, SETTLE_DECAY);

    layer.translate(0, (-ANTICIPATION_LIFT * anticipation) + (settle * SETTLE_LIFT));
    layer.rotate((lag * LAG_ROTATION) + (settle * SETTLE_ROTATION));
    layer.scale(1 + (DRIVER_SCALE * driver), 1 - (DRIVER_SQUASH * driver));
    layer.drawImage(
      characterLayer(rt, controls),
      CHARACTER_IMAGE_OFFSET.x,
      CHARACTER_IMAGE_OFFSET.y,
    );

    // Reset to canvas space before drawing the side labels.
    layer.setTransform(1, 0, 0, 1, 0, 0);
    layer.textAlign = 'left';
    layer.fillStyle = INK;
    layer.font = '800 48px "Arial",sans-serif';
    layer.fillText('CHARACTER', 790, 278);
    layer.font = '22px "Arial",sans-serif';
    layer.fillText('cause → lag → follow-through → settle', 735, 330);
  }, (controls) => ({
    x: controls.x - (125 * controls.scale),
    y: controls.y - (160 * controls.scale),
    width: 250 * controls.scale,
    height: 310 * controls.scale,
  }));
}
/** Procedural cached layer size. @type {number} */
const ORBIT_LAYER_SIZE = 520;
/** Procedural layer center. @type {number} */
const ORBIT_CENTER = 260;
/** Innermost seeded dot radius. @type {number} */
const ORBIT_INNER_RADIUS = 70;
/** Seeded dot radius spread. @type {number} */
const ORBIT_RADIUS_SPREAD = 165;
/** Minimum seeded dot size. @type {number} */
const ORBIT_MIN_SIZE = 2;
/** Seeded dot size spread. @type {number} */
const ORBIT_SIZE_SPREAD = 7;
/** Angular jitter applied per seeded dot. @type {number} */
const ORBIT_ANGLE_JITTER = 0.08;
/** Base alpha for seeded dots. @type {number} */
const ORBIT_BASE_ALPHA = 0.28;
/** Alpha spread for seeded dots. @type {number} */
const ORBIT_ALPHA_SPREAD = 0.55;
/** Halftone patch corner inside the procedural layer. @type {number} */
const ORBIT_HALFTONE_CORNER = -210;
/** Halftone patch size inside the procedural layer. @type {number} */
const ORBIT_HALFTONE_SIZE = 420;
/** Halftone dot spacing. @type {number} */
const ORBIT_HALFTONE_SPACING = 14;
/** Halftone dot radius. @type {number} */
const ORBIT_HALFTONE_RADIUS = 2.2;
/** Halftone overlay alpha. @type {number} */
const ORBIT_HALFTONE_ALPHA = 0.1;
/** Core circle base radius. @type {number} */
const CORE_RADIUS = 52;
/** Core circle breathing amplitude. @type {number} */
const CORE_BREATH = 7;
/** Core circle breathing rate. @type {number} */
const CORE_BREATH_RATE = 2.2;
/** Ambient particle count. @type {number} */
const AMBIENT_PARTICLES = 26;
/** Canvas height used when wrapping rising particles. @type {number} */
const AMBIENT_WRAP_HEIGHT = 720;
/** Particle rise speed multiplier. @type {number} */
const AMBIENT_RISE_RATE = 32;

/**
 * Cached seeded-dot field plus halftone texture.
 *
 * The RNG consumes values in a fixed order so the same seed always produces the
 * same dot field. Density, color, and seed are part of the cache key.
 * @param {import('./runtime.js').MotionRuntime} rt
 * @param {Record<string, unknown>} controls
 * @returns {HTMLCanvasElement}
 */
function orbitLayer(rt, controls) {
  const { seed } = rt.project.meta;
  const key = `orbit:${controls.density}:${controls.dotColor}:${seed}`;
  return rt.cache.get(key, ORBIT_LAYER_SIZE, ORBIT_LAYER_SIZE, (layer) => {
    const random = rng(seed + controls.density);
    layer.translate(ORBIT_CENTER, ORBIT_CENTER);
    for (let index = 0; index < controls.density; index += 1) {
      const angle = ((index / controls.density) * TAU) + (random() * ORBIT_ANGLE_JITTER);
      const radius = ORBIT_INNER_RADIUS + (random() * ORBIT_RADIUS_SPREAD);
      const size = ORBIT_MIN_SIZE + (random() * ORBIT_SIZE_SPREAD);
      layer.fillStyle = index % 4 ? controls.dotColor : CORAL;
      layer.globalAlpha = ORBIT_BASE_ALPHA + (random() * ORBIT_ALPHA_SPREAD);
      layer.beginPath();
      layer.arc(Math.cos(angle) * radius, Math.sin(angle) * radius, size, 0, TAU);
      layer.fill();
    }
    halftone(layer, {
      x: ORBIT_HALFTONE_CORNER,
      y: ORBIT_HALFTONE_CORNER,
      width: ORBIT_HALFTONE_SIZE,
      height: ORBIT_HALFTONE_SIZE,
      color: INK,
      spacing: ORBIT_HALFTONE_SPACING,
      radius: ORBIT_HALFTONE_RADIUS,
      seed,
      alpha: ORBIT_HALFTONE_ALPHA,
    });
  });
}

/**
 * Shot 3: rotating seeded dot field plus stable drifting motes.
 * @param {import('./runtime.js').MotionRuntime} rt
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} time
 * @returns {void}
 */
export function drawProcedural(rt, ctx, time) {
  const local = time - 4;

  withObjectTransform(rt, 'seeded-orbit', local, (layer, controls) => {
    layer.rotate(local * 0.18 * controls.speed);
    layer.drawImage(orbitLayer(rt, controls), -ORBIT_CENTER, -ORBIT_CENTER);
    layer.rotate(-local * 0.18 * controls.speed);
    layer.fillStyle = INK;
    layer.beginPath();
    layer.arc(0, 0, CORE_RADIUS + (CORE_BREATH * Math.sin(local * CORE_BREATH_RATE)), 0, TAU);
    layer.fill();
    layer.fillStyle = PAPER;
    layer.textAlign = 'center';
    layer.font = '800 17px "Arial",sans-serif';
    layer.fillText('SEEDED', 0, -3);
    layer.fillText('DETAIL', 0, 20);
  }, (controls) => ({
    x: controls.x - (265 * controls.scale),
    y: controls.y - (265 * controls.scale),
    width: 530 * controls.scale,
    height: 530 * controls.scale,
  }));

  const particles = stableParticles(rt.project.meta.seed, 'ambient', AMBIENT_PARTICLES, {
    width: 1280,
    height: 720,
  });
  ctx.fillStyle = INK;
  for (const particle of particles) {
    ctx.globalAlpha = particle.alpha;
    ctx.beginPath();
    ctx.arc(
      particle.x,
      (particle.y + (local * particle.speed * AMBIENT_RISE_RATE)) % AMBIENT_WRAP_HEIGHT,
      particle.size,
      0,
      TAU,
    );
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = INK;
  ctx.font = '800 40px "Arial",sans-serif';
  ctx.fillText('TEXTURE THAT DOES NOT FLICKER', 70, 645);
}
/** Product card cached layer width. @type {number} */
const PRODUCT_LAYER_WIDTH = 740;
/** Product card cached layer height. @type {number} */
const PRODUCT_LAYER_HEIGHT = 410;
/** Product card inner padding. @type {number} */
const PRODUCT_PADDING = 6;
/** Product card corner radius. @type {number} */
const PRODUCT_RADIUS = 20;
/** Product card title bar height. @type {number} */
const PRODUCT_BAR_HEIGHT = 62;
/** Product card outline weight. @type {number} */
const PRODUCT_OUTLINE_WEIGHT = 5;
/** Sidebar width inside the product card. @type {number} */
const PRODUCT_SIDEBAR_WIDTH = 186;
/** Sidebar height inside the product card. @type {number} */
const PRODUCT_SIDEBAR_HEIGHT = 278;
/** Sidebar top inside the product card. @type {number} */
const PRODUCT_SIDEBAR_TOP = 94;
/** Highlight band inside the product card. @type {number} */
const PRODUCT_BAND = Object.freeze({ x: 246, y: 95, width: 456, height: 54 });
/** Product table row height. @type {number} */
const PRODUCT_ROW_HEIGHT = 49;
/** Product table row top. @type {number} */
const PRODUCT_ROWS_TOP = 172;
/** Product table row width. @type {number} */
const PRODUCT_ROW_WIDTH = 456;
/** Product table row thickness. @type {number} */
const PRODUCT_ROW_THICKNESS = 33;
/** Cached product layer draw offset in scene space. @type {{ x: number, y: number }} */
const PRODUCT_IMAGE_OFFSET = Object.freeze({ x: -370, y: -205 });
/** Product settle start offset in seconds. @type {number} */
const PRODUCT_SETTLE_OFFSET = 0.6;
/** Product settle oscillation frequency. @type {number} */
const PRODUCT_SETTLE_FREQUENCY = 3;
/** Product settle oscillation decay. @type {number} */
const PRODUCT_SETTLE_DECAY = 5;
/** Product settle scale amplitude. @type {number} */
const PRODUCT_SETTLE_SCALE = 0.04;
/** Product scan line travel in pixels. @type {number} */
const PRODUCT_SCAN_TRAVEL = 450;
/** Product scan duration in seconds. @type {number} */
const PRODUCT_SCAN_DURATION = 1.4;
/** Product scan track x start inside the card. @type {number} */
const PRODUCT_SCAN_X = -205;
/** Product scan track y inside the card. @type {number} */
const PRODUCT_SCAN_Y = -5;
/** Product scan line weight. @type {number} */
const PRODUCT_SCAN_WEIGHT = 7;
/** Product scan head radius. @type {number} */
const PRODUCT_SCAN_HEAD = 10;

/**
 * Cached product dashboard card.
 *
 * Accent color and title are part of the cache key so a Live edit repaints the
 * layer instead of reusing stale pixels.
 * @param {import('./runtime.js').MotionRuntime} rt
 * @param {Record<string, unknown>} controls
 * @returns {HTMLCanvasElement}
 */
function productLayer(rt, controls) {
  const key = `product:${controls.accent}:${controls.title}`;
  return rt.cache.get(key, PRODUCT_LAYER_WIDTH, PRODUCT_LAYER_HEIGHT, (layer) => {
    layer.fillStyle = '#fff';
    layer.strokeStyle = INK;
    layer.lineWidth = PRODUCT_OUTLINE_WEIGHT;
    layer.beginPath();
    layer.roundRect(
      PRODUCT_PADDING,
      PRODUCT_PADDING,
      PRODUCT_LAYER_WIDTH - (PRODUCT_PADDING * 2),
      PRODUCT_LAYER_HEIGHT - (PRODUCT_PADDING * 2),
      PRODUCT_RADIUS,
    );
    layer.fill();
    layer.stroke();

    layer.fillStyle = INK;
    layer.fillRect(PRODUCT_PADDING, PRODUCT_PADDING, PRODUCT_LAYER_WIDTH - (PRODUCT_PADDING * 2), PRODUCT_BAR_HEIGHT);
    layer.fillStyle = 'white';
    layer.font = '700 20px "Arial",sans-serif';
    layer.textAlign = 'left';
    layer.fillText(controls.title, 28, 44);

    layer.fillStyle = '#edf0f5';
    layer.fillRect(28, PRODUCT_SIDEBAR_TOP, PRODUCT_SIDEBAR_WIDTH, PRODUCT_SIDEBAR_HEIGHT);
    layer.fillStyle = controls.accent;
    layer.fillRect(PRODUCT_BAND.x, PRODUCT_BAND.y, PRODUCT_BAND.width, PRODUCT_BAND.height);

    for (let index = 0; index < 4; index += 1) {
      layer.fillStyle = index === 2 ? '#ffd8df' : '#e7e9f1';
      layer.fillRect(PRODUCT_BAND.x, PRODUCT_ROWS_TOP + (index * PRODUCT_ROW_HEIGHT), PRODUCT_ROW_WIDTH, PRODUCT_ROW_THICKNESS);
    }

    layer.fillStyle = INK;
    for (let index = 0; index < 5; index += 1) {
      layer.fillRect(50, 112 + (index * PRODUCT_ROW_HEIGHT), 125 - ((index % 2) * 26), 12);
    }

    halftone(layer, {
      x: 540,
      y: 95,
      width: 160,
      height: 54,
      color: '#fff',
      spacing: 8,
      radius: 1.3,
      seed: 77,
      alpha: 0.26,
    });
  });
}

/**
 * Shot 4: product dashboard with a settling entrance and a sweeping scan line.
 * @param {import('./runtime.js').MotionRuntime} rt
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} time
 * @returns {void}
 */
export function drawProduct(rt, ctx, time) {
  const local = time - 6;

  withObjectTransform(rt, 'dashboard', local, (layer, controls) => {
    const settle = 1 + (damped(local - PRODUCT_SETTLE_OFFSET, PRODUCT_SETTLE_FREQUENCY, PRODUCT_SETTLE_DECAY) * PRODUCT_SETTLE_SCALE);
    layer.scale(settle, settle);
    layer.drawImage(productLayer(rt, controls), PRODUCT_IMAGE_OFFSET.x, PRODUCT_IMAGE_OFFSET.y);

    const scan = clamp(local / PRODUCT_SCAN_DURATION) * PRODUCT_SCAN_TRAVEL;
    layer.strokeStyle = CORAL;
    layer.lineWidth = PRODUCT_SCAN_WEIGHT;
    layer.lineCap = 'round';
    layer.beginPath();
    layer.moveTo(PRODUCT_SCAN_X, PRODUCT_SCAN_Y);
    layer.lineTo(PRODUCT_SCAN_X + scan, PRODUCT_SCAN_Y);
    layer.stroke();
    layer.fillStyle = CORAL;
    layer.beginPath();
    layer.arc(PRODUCT_SCAN_X + scan, PRODUCT_SCAN_Y, PRODUCT_SCAN_HEAD, 0, TAU);
    layer.fill();
  }, (controls) => ({
    x: controls.x - (375 * controls.scale),
    y: controls.y - (210 * controls.scale),
    width: 750 * controls.scale,
    height: 420 * controls.scale,
  }));
}
/** Payoff marker center y. @type {number} */
const PAYOFF_MARKER_Y = -120;
/** Payoff marker base radius. @type {number} */
const PAYOFF_MARKER_RADIUS = 18;
/** Payoff marker breathing amplitude. @type {number} */
const PAYOFF_MARKER_BREATH = 8;
/** Payoff marker breathing rate. @type {number} */
const PAYOFF_MARKER_RATE = 3;
/** Payoff frame inset from the canvas edge. @type {number} */
const PAYOFF_FRAME_INSET = 45;
/** Payoff frame width. @type {number} */
const PAYOFF_FRAME_WIDTH = 1190;
/** Payoff frame height. @type {number} */
const PAYOFF_FRAME_HEIGHT = 630;
/** Payoff frame stroke weight. @type {number} */
const PAYOFF_FRAME_WEIGHT = 3;

/**
 * Shot 5: payoff title inside a full-frame border.
 * @param {import('./runtime.js').MotionRuntime} rt
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} time
 * @returns {void}
 */
export function drawPayoff(rt, ctx, time) {
  const local = time - 8;

  withObjectTransform(rt, 'final-message', local, (layer, controls) => {
    title(layer, controls.text, 60, controls.color);
    caption(layer, 'deterministic JavaScript motion design', 66);
    layer.fillStyle = CORAL;
    layer.beginPath();
    layer.arc(
      0,
      PAYOFF_MARKER_Y,
      PAYOFF_MARKER_RADIUS + (PAYOFF_MARKER_BREATH * Math.sin(local * PAYOFF_MARKER_RATE)),
      0,
      TAU,
    );
    layer.fill();
  }, (controls) => ({
    x: controls.x - (410 * controls.scale),
    y: controls.y - (180 * controls.scale),
    width: 820 * controls.scale,
    height: 280 * controls.scale,
  }));

  ctx.strokeStyle = INK;
  ctx.lineWidth = PAYOFF_FRAME_WEIGHT;
  ctx.strokeRect(PAYOFF_FRAME_INSET, PAYOFF_FRAME_INSET, PAYOFF_FRAME_WIDTH, PAYOFF_FRAME_HEIGHT);
}

/**
 * Shot painters keyed by shot id. Lookup keeps dispatch data-driven; unknown ids
 * fall through to the payoff so a project is never blank.
 * @type {Record<string, (rt: import('./runtime.js').MotionRuntime, ctx: CanvasRenderingContext2D, time: number) => void>}
 */
const SCENE_PAINTERS = {
  hook: drawHook,
  character: drawCharacter,
  procedural: drawProcedural,
  product: drawProduct,
};

/**
 * Paint the shot that owns `time`.
 * @param {import('./runtime.js').MotionRuntime} rt
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} time
 * @returns {void}
 */
export function drawScene(rt, ctx, time) {
  const painter = SCENE_PAINTERS[rt.shot.id] ?? drawPayoff;
  painter(rt, ctx, time);
}
