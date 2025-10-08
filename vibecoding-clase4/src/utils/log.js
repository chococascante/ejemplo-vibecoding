export function logInfo(message, ...rest) {
  console.log('[INFO]', message, ...rest);
}

export function logError(error, ...rest) {
  console.error('[ERROR]', error, ...rest);
}

export function logWarn(message, ...rest) {
  console.warn('[WARN]', message, ...rest);
}
