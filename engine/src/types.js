/**
 * Shared JSDoc typedefs for the MotionLoom engine.
 *
 * This module has no runtime exports. It exists so every engine file can
 * reference one audited description of the p5 sketch surface and the shared
 * geometry shapes instead of falling back to `any`.
 */

/**
 * Structural subset of the p5 instance API used by MotionLoom drawing helpers.
 * Declared structurally because p5 ships no TypeScript types in this project,
 * and referencing only the members actually used keeps the contract honest.
 * @typedef {object} MotionloomSketch
 * @property {number} width
 * @property {number} height
 * @property {number} CENTER
 * @property {number} BOLD
 * @property {number} NORMAL
 * @property {number} LEFT
 * @property {number} ROUND
 * @property {number} CLOSE
 * @property {CanvasRenderingContext2D} drawingContext
 * @property {() => void} push
 * @property {() => void} pop
 * @property {(color?: unknown) => void} background
 * @property {(color?: unknown, alpha?: number) => void} fill
 * @property {(color?: unknown) => void} stroke
 * @property {() => void} noStroke
 * @property {() => void} noFill
 * @property {(weight: number) => void} strokeWeight
 * @property {(cap: number) => void} strokeCap
 * @property {(join: number) => void} strokeJoin
 * @property {(size: number) => void} textSize
 * @property {(font: string) => void} textFont
 * @property {(style: number) => void} textStyle
 * @property {(horizontal: number, vertical?: number) => void} textAlign
 * @property {(text: string, x: number, y: number) => void} text
 * @property {(text: string) => number} textWidth
 * @property {(x: number, y: number) => void} translate
 * @property {(angle: number) => void} rotate
 * @property {(x: number, y: number) => void} scale
 * @property {(x: number, y: number, width: number, height: number) => void} ellipse
 * @property {(x: number, y: number, diameter: number) => void} circle
 * @property {(x1: number, y1: number, x2: number, y2: number) => void} line
 * @property {(x: number, y: number, width: number, height: number, radius?: number) => void} rect
 * @property {(x: number, y: number, width: number, height: number, start: number, stop: number) => void} arc
 * @property {(x: number, y: number, width: number, height: number, ...extra: number[]) => void} quad
 * @property {() => void} beginShape
 * @property {(mode?: number) => void} endShape
 * @property {(x: number, y: number) => void} vertex
 * @property {(x: number, y: number) => void} curveVertex
 * @property {(seed: number) => void} randomSeed
 * @property {(seed: number) => void} noiseSeed
 * @property {(rate: number) => void} frameRate
 * @property {(mode: number) => void} angleMode
 * @property {(from: number, to: number, amount: number) => number} lerp
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
 * @typedef {object} PathPoint
 * @property {number} x
 * @property {number} y
 */

/**
 * A path point with a unit normal, used for ribbon width extrusion.
 * @typedef {PathPoint & { nx: number, ny: number }} OrientedPoint
 */

/**
 * Field-of-view options for the deterministic p5 camera wrapper.
 * @typedef {object} CameraOptions
 * @property {number} [x]
 * @property {number} [y]
 * @property {number} [zoom]
 * @property {number} [rotation]
 */

/**
 * A localized clock reading for one shot at one absolute time.
 * @typedef {object} LocalTime
 * @property {number} t normalized `0..1` progress through the shot
 * @property {number} seconds seconds elapsed inside the shot
 * @property {number} duration shot length in seconds
 */

export {};
