import { roundedPanel, lerp, ease, norm, clamp } from './core.js';

/** Sidebar fill inside the product window chrome. */
const SIDEBAR_FILL = '#e9e4dc';
/** Muted sidebar row fill. */
const SIDEBAR_ROW_FILL = '#c9c4bc';
/** Content panel fill. */
const CONTENT_FILL = '#f1eee8';
/** Muted metric label color. */
const MUTED_LABEL = '#888';
/** Tint fills for the three feature cards, left to right. */
const CARD_TINTS = Object.freeze(['#dff5f7', '#fff1ce', '#ffe0e5']);

/** Chrome bar height in pixels. @type {number} */
const CHROME_HEIGHT = 54;
/** Traffic-light dot diameter in pixels. @type {number} */
const TRAFFIC_DOT_DIAMETER = 11;
/** Sidebar row pitch in pixels. @type {number} */
const ROW_PITCH = 52;
/** Sidebar row count. @type {number} */
const ROW_COUNT = 4;
/** Sidebar row height in pixels. @type {number} */
const ROW_HEIGHT = 13;
/** Feature card count. @type {number} */
const CARD_COUNT = 3;
/** Cursor arrow vertex pairs. @type {number[][]} */
const CURSOR_VERTICES = Object.freeze([
  [0, 0], [0, 18], [4.5, 13.5], [8, 18], [10, 16], [6.5, 11.5], [12, 11.5],
]);

/**
 * Product window with chrome, sidebar rows, loading bars, and feature cards.
 * @param {import('./types.js').MotionloomSketch} p
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {import('./types.js').MotionloomPalette} pal
 * @param {number} [progress] `0..1` bar fill progress
 * @returns {void}
 */
export function productWindow(p, x, y, w, h, pal, progress = 1) {
  p.push();
  p.translate(x, y);
  p.drawingContext.globalAlpha = progress;

  roundedPanel(p, 0, 0, w, h, 22, pal.white, pal.ink);
  p.noStroke();
  p.fill(pal.ink);
  p.rect(0, 0, w, CHROME_HEIGHT, 22, 22, 0, 0);
  p.fill(pal.coral);
  p.circle(26, 27, TRAFFIC_DOT_DIAMETER);
  p.fill(pal.yellow);
  p.circle(47, 27, TRAFFIC_DOT_DIAMETER);
  p.fill(pal.green);
  p.circle(68, 27, TRAFFIC_DOT_DIAMETER);

  p.fill(SIDEBAR_FILL);
  p.rect(24, 78, w * 0.22, h - 102, 14);
  for (let index = 0; index < ROW_COUNT; index += 1) {
    p.fill(index === 1 ? pal.violet : SIDEBAR_ROW_FILL);
    p.rect(42, 105 + (index * ROW_PITCH), w * 0.15, ROW_HEIGHT, 7);
  }

  p.fill(CONTENT_FILL);
  p.rect(w * 0.28, 78, w * 0.68, h * 0.32, 14);
  p.fill(pal.cyan);
  p.rect(w * 0.31, 104, w * 0.28 * progress, 20, 10);
  p.fill(pal.yellow);
  p.rect(w * 0.31, 141, w * 0.49 * progress, 20, 10);
  p.fill(pal.coral);
  p.rect(w * 0.31, 178, w * 0.39 * progress, 20, 10);

  for (let index = 0; index < CARD_COUNT; index += 1) {
    roundedPanel(
      p,
      w * (0.28 + (index * 0.23)),
      h * 0.51,
      w * 0.2,
      h * 0.35,
      14,
      CARD_TINTS[index],
    );
    p.fill(pal.ink);
    p.circle(w * (0.38 + (index * 0.23)), h * 0.65, 24 + (index * 8));
  }

  p.pop();
}

/**
 * Count up to a metric, then settle and label it.
 * @param {import('./types.js').MotionloomSketch} p
 * @param {number} x
 * @param {number} y
 * @param {string} label
 * @param {number} value
 * @param {string} [unit]
 * @param {string} [color]
 * @param {number} [progress]
 * @returns {void}
 */
export function metricCounter(p, x, y, label, value, unit = '', color = '#14213d', progress = 1) {
  const alpha = ease(clamp(progress * 1.5));
  const displayValue = Math.round(value * ease(clamp(progress)));

  p.push();
  p.drawingContext.globalAlpha = alpha;
  p.textAlign(p.CENTER);
  p.noStroke();
  p.fill(color);
  p.textStyle(p.BOLD);
  p.textSize(64);
  p.text(`${displayValue}${unit}`, x, y);
  p.textStyle(p.NORMAL);
  p.textSize(18);
  p.fill(MUTED_LABEL);
  p.text(label, x, y + 28);
  p.pop();
}

/**
 * Bar chart whose bars grow from the baseline.
 * @param {import('./types.js').MotionloomSketch} p
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {number[]} data
 * @param {string[]} colors
 * @param {number} [progress]
 * @returns {void}
 */
export function barChart(p, x, y, w, h, data, colors, progress = 1) {
  const count = data.length;
  const barWidth = (w - ((count - 1) * 10)) / count;
  const maxValue = Math.max(...data, 1);
  const grow = ease(clamp(progress));

  p.push();
  p.noStroke();
  for (let index = 0; index < count; index += 1) {
    const barHeight = (data[index] / maxValue) * h * grow;
    p.fill(colors[index % colors.length]);
    p.rect(x + (index * (barWidth + 10)), y + h - barHeight, barWidth, barHeight, 6, 6, 0, 0);
  }
  p.pop();
}

/**
 * Line chart whose stroke reveals left to right.
 * @param {import('./types.js').MotionloomSketch} p
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {number[]} data
 * @param {string} [color]
 * @param {number} [weight]
 * @param {number} [progress]
 * @returns {void}
 */
export function lineChart(p, x, y, w, h, data, color = '#18b7c9', weight = 3, progress = 1) {
  if (data.length < 2) return;

  const maxValue = Math.max(...data, 1);
  const total = data.length - 1;
  const drawn = Math.max(1, Math.round(total * ease(clamp(progress))));

  p.push();
  p.noFill();
  p.stroke(color);
  p.strokeWeight(weight);
  p.strokeCap(p.ROUND);
  p.strokeJoin(p.ROUND);
  p.beginShape();
  for (let index = 0; index <= drawn; index += 1) {
    p.vertex(
      x + ((index / total) * w),
      y + h - ((data[index] / maxValue) * h),
    );
  }
  p.endShape();
  p.pop();
}

/**
 * Cursor arrow drawn as a closed polygon.
 * @param {import('./types.js').MotionloomSketch} p
 * @param {number} x
 * @param {number} y
 * @param {number} [alpha]
 * @returns {void}
 */
export function cursor(p, x, y, alpha = 1) {
  p.push();
  p.drawingContext.globalAlpha = alpha;
  p.fill(255);
  p.stroke(0);
  p.strokeWeight(1.5);
  p.beginShape();
  for (const [offsetX, offsetY] of CURSOR_VERTICES) {
    p.vertex(x + offsetX, y + offsetY);
  }
  p.endShape(p.CLOSE);
  p.pop();
}

/**
 * Expanding click ripple that fades as it grows.
 * @param {import('./types.js').MotionloomSketch} p
 * @param {number} cx
 * @param {number} cy
 * @param {number} t absolute time in seconds
 * @param {number} at time the ripple starts
 * @param {string} [color]
 * @returns {void}
 */
export function cursorRipple(p, cx, cy, t, at, color = '#ff5d73') {
  const progress = norm(t, at, at + 0.6);
  if (progress <= 0 || progress >= 1) return;

  const radius = progress * 44;
  const alpha = (1 - progress) * 0.6;

  p.push();
  p.noFill();
  p.stroke(color);
  p.strokeWeight(2);
  p.drawingContext.globalAlpha = alpha;
  p.circle(cx, cy, radius * 2);
  p.pop();
}

/**
 * Notification toast that slides in and fades out near the end of progress.
 * @param {import('./types.js').MotionloomSketch} p
 * @param {number} x
 * @param {number} y
 * @param {string} text
 * @param {string} [icon]
 * @param {string} [color]
 * @param {string} [bg]
 * @param {number} [progress]
 * @returns {void}
 */
export function notificationToast(p, x, y, text, icon = '●', color = '#14213d', bg = '#fffdf7', progress = 1) {
  const slide = ease(clamp(progress * 2));
  const alpha = progress > 0.8 ? ease(clamp((1 - progress) * 5)) : 1;
  const tx = x + lerp(40, 0, slide);

  p.push();
  p.drawingContext.globalAlpha = alpha;
  roundedPanel(p, tx, y, 280, 52, 14, bg, color);
  p.noStroke();
  p.fill(color);
  p.textSize(18);
  p.textAlign(p.LEFT);
  p.textStyle(p.BOLD);
  p.text(icon, tx + 16, y + 32);
  p.textStyle(p.NORMAL);
  p.textSize(14);
  p.text(text, tx + 40, y + 32);
  p.pop();
}

/**
 * Code editor panel that reveals one line at a time.
 * @param {import('./types.js').MotionloomSketch} p
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {Array<[string, string]>} lines `[color, code]` pairs
 * @param {number} [progress]
 * @param {import('./types.js').MotionloomPalette} [pal]
 * @returns {void}
 */
export function codeEditor(p, x, y, w, h, lines, progress = 1, pal) {
  const background = pal?.ink ?? '#1e2030';

  p.push();
  roundedPanel(p, x, y, w, h, 14, background, null);
  p.noStroke();
  p.textFont('monospace');
  p.textSize(13);
  p.textAlign(p.LEFT);

  const visible = Math.ceil(lines.length * ease(clamp(progress)));
  for (let index = 0; index < visible; index += 1) {
    const [color, code] = lines[index];
    p.fill(color);
    p.text(code, x + 16, y + 28 + (index * 22));
  }
  p.pop();
}
