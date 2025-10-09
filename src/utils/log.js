// src/utils/log.js

export let GLOBAL_LOG_LEVEL = 'info';

export function logInfo(...args) {
  if (GLOBAL_LOG_LEVEL === 'info') {
    console.log('[INFO]', ...args);
  }
}
