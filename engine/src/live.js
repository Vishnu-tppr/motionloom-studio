/**
 * MotionLoom Live client protocol helpers.
 *
 * This is the browser-side counterpart to `engine/tools/live-server.mjs`. It
 * owns only the transport contract: socket URL derivation, message type
 * guards, and a small client handle. It deliberately contains no DOM lookups,
 * because `engine/src/studio.js` owns the Live UI and its element ids.
 *
 * STATUS: not imported by any page, tool, or test yet. `engine/index.html`
 * boots `./src/studio.js`, which calls the REST endpoints directly. This module
 * exists so a page can adopt the socket transport without re-deriving the
 * protocol, and so the protocol is documented in typed code.
 *
 * Determinism rule: nothing here may read wall-clock time or unseeded
 * randomness in a render path. A reconnect delay is the only timer.
 */
import { asRecord } from './project-contract.js';

/** Live WebSocket endpoint path, enforced same-origin by the server. @type {string} */
export const LIVE_ENDPOINT = '/live';

/** Reconnect delay after an unexpected close, in milliseconds. @type {number} */
export const LIVE_RECONNECT_MS = 1000;

/** Server message type: full project snapshot. @type {string} */
export const PROJECT_UPDATED = 'project.updated';

/** Server message type: a steering event was queued for Claude. @type {string} */
export const EVENT_QUEUED = 'event.queued';

/** Server message type: the request was rejected. @type {string} */
export const LIVE_ERROR = 'error';

/** Client message type: apply a patch to one object or shot. @type {string} */
export const PROJECT_PATCH = 'project.patch';

/** Client message type: queue a steering instruction for Claude. @type {string} */
export const AGENT_STEER = 'agent.steer';

/**
 * Derive the Live socket URL from a location-like object.
 * @param {{ protocol: string, host: string }} location
 * @returns {string}
 */
export function liveSocketUrl(location) {
  const scheme = location.protocol === 'https:' ? 'wss' : 'ws';
  return `${scheme}://${location.host}${LIVE_ENDPOINT}`;
}

/**
 * Narrow an untrusted socket payload to a Live message record.
 * Returns `null` for anything that is not a well-formed typed message, so the
 * caller never has to guess about `JSON.parse` output.
 * @param {string | unknown} raw
 * @returns {Record<string, unknown> | null}
 */
export function parseLiveMessage(raw) {
  if (typeof raw !== 'string') return null;
  let decoded;
  try {
    decoded = JSON.parse(raw);
  } catch {
    return null;
  }
  const record = decoded && typeof decoded === 'object' && !Array.isArray(decoded) ? decoded : null;
  if (!record || typeof record.type !== 'string') return null;
  return record;
}

/**
 * Validate a Live patch before it is sent, mirroring the server-side guard.
 * @param {unknown} patch
 * @returns {{ kind: 'object' | 'shot', id: string, values: Record<string, unknown> }}
 * @throws {TypeError} when the patch shape or a key is unsafe
 */
export function assertPatch(patch) {
  const record = asRecord(patch, 'patch');
  const kind = record.kind;
  if (kind !== 'object' && kind !== 'shot') {
    throw new TypeError('patch.kind must be "object" or "shot"');
  }
  if (typeof record.id !== 'string' || !record.id) {
    throw new TypeError('patch.id must be a non-empty string');
  }
  const values = asRecord(record.values, 'patch.values');
  for (const key of Object.keys(values)) {
    if (['__proto__', 'constructor', 'prototype'].includes(key)) {
      throw new TypeError(`patch.values has an unsafe key: ${key}`);
    }
  }
  return { kind, id: record.id, values };
}

/**
 * @typedef {object} LiveClientHandlers
 * @property {(project: unknown) => void} [onProject] snapshot received
 * @property {(id: string) => void} [onEventQueued] steering event accepted
 * @property {(message: string) => void} [onError] server or transport error
 * @property {(connected: boolean) => void} [onStatus] connection state changes
 * @property {boolean} [reconnect] retry after an unexpected close
 */

/**
 * @typedef {object} LiveClient
 * @property {() => boolean} isConnected
 * @property {(patch: unknown) => boolean} sendPatch
 * @property {(message: string, context?: unknown) => boolean} steer
 * @property {() => void} close
 */

/**
 * Create a Live client for a page that owns its own rendering.
 * @param {LiveClientHandlers} [handlers]
 * @param {{ location?: { protocol: string, host: string } }} [env]
 * @returns {LiveClient}
 */
export function createLiveClient(handlers = {}, env = {}) {
  const target = env.location ?? (typeof globalThis.location === 'undefined' ? null : globalThis.location);
  if (!target) throw new TypeError('createLiveClient needs a location-like object');

  /** @type {WebSocket} */
  const socket = new WebSocket(liveSocketUrl(target));
  let closed = false;

  const send = (message) => {
    if (socket.readyState !== 1) return false;
    socket.send(JSON.stringify(message));
    return true;
  };

  socket.onopen = () => handlers.onStatus?.(true);
  socket.onclose = () => {
    handlers.onStatus?.(false);
    if (closed || !handlers.reconnect) return;
    setTimeout(() => {
      // Reconnect is a transport concern only; it never touches render state.
      globalThis.location?.reload?.();
    }, LIVE_RECONNECT_MS);
  };
  socket.onmessage = (event) => {
    const message = parseLiveMessage(event.data);
    if (!message) return;
    if (message.type === PROJECT_UPDATED) handlers.onProject?.(message.project);
    if (message.type === EVENT_QUEUED) handlers.onEventQueued?.(String(message.id));
    if (message.type === LIVE_ERROR) handlers.onError?.(String(message.message));
  };
  socket.onerror = () => handlers.onError?.('live transport error');

  return {
    isConnected: () => socket.readyState === 1,
    sendPatch: (patch) => send({ type: PROJECT_PATCH, patch: assertPatch(patch) }),
    steer: (message, context) => send({ type: AGENT_STEER, message, context }),
    close: () => {
      closed = true;
      socket.close();
    },
  };
}
