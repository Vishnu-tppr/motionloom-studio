/**
 * Frozen preview configuration for the p5 demo film.
 *
 * Canonical Live project data lives in `engine/data/project.json`. This module
 * is the p5 preview's immutable snapshot so frame 0 is never blank and every
 * render reads the same width/height/fps/duration/seed values.
 */

/**
 * @typedef {object} MotionloomPalette
 * @property {string} ink
 * @property {string} paper
 * @property {string} coral
 * @property {string} cyan
 * @property {string} yellow
 * @property {string} violet
 * @property {string} white
 * @property {string} green
 */

/**
 * @typedef {object} MotionloomPreviewConfig
 * @property {string} title
 * @property {number} width
 * @property {number} height
 * @property {number} fps
 * @property {number} duration total seconds
 * @property {number} seed deterministic identity seed
 * @property {string} background
 * @property {MotionloomPalette} palette
 */

/** @type {MotionloomPreviewConfig} */
export const PROJECT = Object.freeze({
  title: 'Signal to Story',
  width: 1280,
  height: 720,
  fps: 30,
  duration: 10,
  seed: 24091999,
  background: '#f4efe4',
  palette: Object.freeze({
    ink: '#14213d',
    paper: '#f4efe4',
    coral: '#ff5d73',
    cyan: '#18b7c9',
    yellow: '#ffc857',
    violet: '#6857d9',
    white: '#fffdf7',
    green: '#40b881',
  }),
});
