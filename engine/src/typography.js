import { stagger, enter } from './motion.js';
import { norm, clamp, ease, lerp } from './core.js';

/** Primary display color. @type {string} */
const INK_COLOR = '#14213d';
/** Secondary subline color. @type {string} */
const SUB_COLOR = '#6857d9';
/** Display font stack. @type {string} */
const FONT_FAMILY = 'Arial, sans-serif';

/** Default word entrance duration in seconds. @type {number} */
const WORD_ENTER_DURATION = 0.4;
/** Default per-word stagger in seconds. @type {number} */
const WORD_STAGGER_STEP = 0.12;
/** Default per-character stagger in seconds. @type {number} */
const CHARACTER_STAGGER_STEP = 0.025;
/** Default per-character entrance duration in seconds. @type {number} */
const CHARACTER_ENTER_DURATION = 0.42;
/** Punch entrance duration in seconds. @type {number} */
const PUNCH_DURATION = 0.4;
/** Punch entry scale before settling to 1. @type {number} */
const PUNCH_START_SCALE = 3;
/** Label lead-in shared by callouts in seconds. @type {number} */
const CALLOUT_LABEL_DELAY = 0.25;

/**
 * Draw a stacked end-card lockup, fading sublines in after the headline.
 * @param {import('./types.js').MotionloomSketch} p
 * @param {string[]} lines headline first, then sublines
 * @param {number} x
 * @param {number} y baseline of the first line
 * @param {number} t absolute time in seconds
 * @param {number} start time the lockup begins
 * @param {{ gap?: number, size?: number, subSize?: number, color?: string, subColor?: string }} [options]
 * @returns {void}
 */
export function endCardLockup(p, lines, x, y, t, start, options = {}) {
  const lineGap = options.gap ?? 0.14;
  const size = options.size ?? 54;
  const subSize = options.subSize ?? 26;
  const color = options.color ?? INK_COLOR;
  const subColor = options.subColor ?? SUB_COLOR;

  lines.forEach((line, index) => {
    const isSubline = index > 0;
    wordStagger(p, line, x, y + (index * (size + 14)), t, start + (index * lineGap), {
      size: isSubline ? subSize : size,
      color: isSubline ? subColor : color,
    });
  });
}

/**
 * Big number that punches in, followed by a smaller label.
 * @param {import('./types.js').MotionloomSketch} p
 * @param {string} value
 * @param {string} label
 * @param {number} x
 * @param {number} y
 * @param {number} t absolute time in seconds
 * @param {number} start time the callout begins
 * @param {{ labelSize?: number, labelColor?: string, labelOffset?: number }} [options]
 * @returns {void}
 */
export function statCallout(p, value, label, x, y, t, start, options = {}) {
  punchSlam(p, value, x, y, t, start, options);

  const labelProgress = enter(t, start + CALLOUT_LABEL_DELAY, PUNCH_DURATION);
  if (labelProgress <= 0) return;

  p.push();
  p.textAlign(p.CENTER, p.CENTER);
  p.textStyle(p.NORMAL);
  p.textFont(FONT_FAMILY);
  p.textSize(options.labelSize ?? 20);
  p.fill(options.labelColor ?? INK_COLOR);
  p.noStroke();
  p.drawingContext.globalAlpha = labelProgress;
  p.text(label, x, y + (options.labelOffset ?? 56));
  p.pop();
}

/**
 * Title whose characters rise and un-rotate into place one at a time.
 * @param {import('./types.js').MotionloomSketch} p
 * @param {string} text
 * @param {number} x
 * @param {number} y
 * @param {number} t absolute time in seconds
 * @param {number} start time the title begins
 * @param {{ size?: number, color?: string, align?: number }} [options]
 * @returns {void}
 */
export function kineticTitle(p, text, x, y, t, start, options = {}) {
  const size = options.size ?? 72;
  const color = options.color ?? INK_COLOR;
  const align = options.align ?? p.CENTER;

  p.push();
  p.textAlign(align, p.CENTER);
  p.textStyle(p.BOLD);
  p.textFont(FONT_FAMILY);
  p.textSize(size);
  p.fill(color);
  p.noStroke();

  const characters = [...text];
  const centered = align === p.CENTER;
  let cursor = centered ? x - (p.textWidth(text) / 2) : x;

  for (let index = 0; index < characters.length; index += 1) {
    const character = characters[index];
    const width = p.textWidth(character);
    const progress = stagger(t, start, index, CHARACTER_STAGGER_STEP, CHARACTER_ENTER_DURATION);
    p.push();
    p.translate(cursor + (width / 2), y + ((1 - progress) * 50));
    p.rotate((1 - progress) * -0.08);
    p.drawingContext.globalAlpha = progress;
    p.text(character, 0, 0);
    p.pop();
    cursor += width;
  }

  p.pop();
}

/**
 * Character-by-character reveal with a deterministic blinking cursor.
 * @param {import('./types.js').MotionloomSketch} p
 * @param {string} text
 * @param {number} x
 * @param {number} y
 * @param {number} t absolute time in seconds
 * @param {number} start time typing begins
 * @param {number} [cps] characters per second
 * @param {{ size?: number, color?: string, align?: number }} [options]
 * @returns {void}
 */
export function typewriterText(p, text, x, y, t, start, cps = 20, options = {}) {
  const size = options.size ?? 32;
  const color = options.color ?? INK_COLOR;
  const align = options.align ?? p.LEFT;
  const elapsed = Math.max(0, t - start);
  const revealCount = Math.min(text.length, Math.floor(elapsed * cps));
  const revealed = text.slice(0, revealCount);
  const cursorVisible = ((elapsed * 2) % 1) < 0.5;

  p.push();
  p.textAlign(align, p.CENTER);
  p.textFont('monospace');
  p.textSize(size);
  p.fill(color);
  p.noStroke();
  p.text(revealed + (cursorVisible ? '█' : ''), x, y);
  p.pop();
}

/**
 * Reveal words one by one with a staggered rise.
 * @param {import('./types.js').MotionloomSketch} p
 * @param {string} text
 * @param {number} x
 * @param {number} y
 * @param {number} t absolute time in seconds
 * @param {number} start time the first word begins
 * @param {{ size?: number, color?: string, align?: number, gap?: number }} [options]
 * @returns {void}
 */
export function wordStagger(p, text, x, y, t, start, options = {}) {
  const size = options.size ?? 48;
  const color = options.color ?? INK_COLOR;
  const align = options.align ?? p.CENTER;
  const words = text.split(' ');
  const step = options.gap ?? WORD_STAGGER_STEP;

  p.push();
  p.textAlign(align, p.CENTER);
  p.textStyle(p.BOLD);
  p.textFont(FONT_FAMILY);
  p.textSize(size);
  p.fill(color);
  p.noStroke();

  const wordWidths = words.map((word) => p.textWidth(`${word} `));
  const totalWidth = wordWidths.reduce((sum, width) => sum + width, 0);
  const centered = align === p.CENTER;
  let cursor = centered ? x - (totalWidth / 2) : x;

  for (let index = 0; index < words.length; index += 1) {
    const progress = stagger(t, start, index, step, WORD_ENTER_DURATION);
    p.push();
    p.translate(cursor + (wordWidths[index] / 2), y + ((1 - progress) * 30));
    p.drawingContext.globalAlpha = progress;
    p.text(words[index], 0, 0);
    p.pop();
    cursor += wordWidths[index];
  }

  p.pop();
}

/**
 * Slam text in from large and transparent, optionally holding then exiting.
 * @param {import('./types.js').MotionloomSketch} p
 * @param {string} text
 * @param {number} x
 * @param {number} y
 * @param {number} t absolute time in seconds
 * @param {number} at time the punch begins
 * @param {{ size?: number, color?: string, align?: number, hold?: number }} [options]
 * @returns {void}
 */
export function punchSlam(p, text, x, y, t, at, options = {}) {
  const size = options.size ?? 84;
  const color = options.color ?? INK_COLOR;
  const align = options.align ?? p.CENTER;
  const hold = options.hold ?? 0;

  const entry = norm(t, at, at + PUNCH_DURATION);
  if (entry <= 0) return;

  const exit = hold > 0
    ? 1 - norm(t, at + PUNCH_DURATION + hold, at + (PUNCH_DURATION * 2) + hold)
    : 1;
  const scale = lerp(PUNCH_START_SCALE, 1, ease(entry));
  const alpha = clamp(entry * 4);

  p.push();
  p.textAlign(align, p.CENTER);
  p.textStyle(p.BOLD);
  p.textFont(FONT_FAMILY);
  p.textSize(size);
  p.fill(color);
  p.noStroke();
  p.translate(x, y);
  p.scale(scale);
  p.drawingContext.globalAlpha = clamp(alpha) * exit;
  p.text(text, 0, 0);
  p.pop();
}
