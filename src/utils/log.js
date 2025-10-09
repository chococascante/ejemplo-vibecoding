// Logger simple con niveles y destino a consola.
// Permite centralizar el control de verbosidad y sustituir la salida en el futuro.
/**
 * Niveles válidos de logging. Orden: de mayor severidad a mayor verbosidad.
 * - silent: deshabilita toda salida
 * - error: errores
 * - warn: advertencias
 * - info: información
 * - debug: diagnóstico detallado
 * @type {Array<'silent'|'error'|'warn'|'info'|'debug'>}
 */

const levels = ['silent', 'error', 'warn', 'info', 'debug'];
let currentLevel = 'info';

/**
 * Determina si un mensaje debería registrarse según el nivel actual.
 * @param {'error'|'warn'|'info'|'debug'} level Nivel del mensaje.
 * @returns {boolean} true si el mensaje debe imprimirse; false en caso contrario.
 */
function shouldLog(level) {
  const idx = levels.indexOf(level);
  const cur = levels.indexOf(currentLevel);
  if (idx === -1 || cur === -1) return false;
  return idx <= cur && currentLevel !== 'silent';
}

/**
 * Establece el nivel global de logging.
 * @param {'silent'|'error'|'warn'|'info'|'debug'} level Nuevo nivel.
 * @returns {void}
 * @example
 * setLogLevel('warn'); // sólo warn y error se imprimirán
 */
export function setLogLevel(level) {
  if (!levels.includes(level)) {
    console.warn(`[log] Nivel desconocido: ${level}. Usando 'info'.`);
    currentLevel = 'info';
    return;
  }
  currentLevel = level;
}

/**
 * Obtiene el nivel de logging actual.
 * @returns {'silent'|'error'|'warn'|'info'|'debug'} Nivel activo.
 * @example
 * const lvl = getLogLevel();
 */
export function getLogLevel() {
  return currentLevel;
}

/**
 * Función auxiliar para delegar en la consola si se permite según el nivel.
 * @param {'log'|'warn'|'error'|'debug'} method Método de console a usar.
 * @param {'error'|'warn'|'info'|'debug'} level Nivel del mensaje.
 * @param {...any} args Argumentos a imprimir (se pasan a console).
 * @returns {void}
 */
function logWith(method, level, ...args) {
  if (!shouldLog(level)) return;
  // Delegamos en console para no perder tooling; se puede cambiar por un sink externo.
  // eslint-disable-next-line no-console
  console[method](...args);
}

/**
 * Logger listo para usar con métodos tipo console pero respetando el nivel global.
 * @example
 * import { logger, setLogLevel } from './utils/log';
 * setLogLevel('info');
 * logger.info('Hola');
 * logger.warn('Cuidado');
 */
export const logger = {
  error: (...args) => logWith('error', 'error', ...args),
  warn: (...args) => logWith('warn', 'warn', ...args),
  info: (...args) => logWith('log', 'info', ...args),
  debug: (...args) => logWith('debug', 'debug', ...args),
};
