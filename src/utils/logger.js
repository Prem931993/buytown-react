// src/utils/logger.js

const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

export function log(...args) {
  if (isDev) {
    // eslint-disable-next-line no-console
    console.log('[LOG]', ...args);
  }
}

export function warn(...args) {
  if (isDev) {
    // eslint-disable-next-line no-console
    console.warn('[WARN]', ...args);
  }
}

export function error(...args) {
  if (isDev) {
    // eslint-disable-next-line no-console
    console.error('[ERROR]', ...args);
  }
}