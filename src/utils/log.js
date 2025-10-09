// Simple centralized logger
const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
let currentLevel = 'info';

export function setLevel(lvl) {
  if (lvl && LEVELS[lvl] !== undefined) currentLevel = lvl;
}

export function info(...args) {
  if (LEVELS[currentLevel] >= LEVELS.info) console.log(...args);
}

export function warn(...args) {
  if (LEVELS[currentLevel] >= LEVELS.warn) console.warn(...args);
}

export function error(...args) {
  if (LEVELS[currentLevel] >= LEVELS.error) console.error(...args);
}

export default { setLevel, info, warn, error };
