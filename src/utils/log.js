/**
 * Sistema centralizado de logging para la aplicación
 * 
 * Este módulo proporciona una interfaz unificada para el manejo de logs
 * en toda la aplicación, permitiendo control granular de niveles de logging
 * y formateo consistente de mensajes.
 * 
 * @module LogUtils
 * @version 1.0.0
 * @author Juan Alberto Quiros Gonzalez
 */

/**
 * Niveles de logging disponibles en orden de prioridad
 * @readonly
 * @enum {string}
 */
export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn', 
  INFO: 'info',
  DEBUG: 'debug'
};

/**
 * Configuración global del sistema de logging
 */
let globalLogConfig = {
  level: LOG_LEVELS.INFO,
  enabled: true,
  prefix: '[APP]',
  timestamp: true
};

/**
 * Establece el nivel global de logging
 * 
 * Controla qué mensajes se mostrarán en la consola. Solo se mostrarán
 * mensajes del nivel especificado y superiores en jerarquía.
 * 
 * @param {string} level - Nivel de logging (error, warn, info, debug)
 * 
 * @example
 * setLogLevel(LOG_LEVELS.ERROR)  // Solo errores
 * setLogLevel(LOG_LEVELS.INFO)   // Info, warn y error
 * setLogLevel(LOG_LEVELS.DEBUG)  // Todos los mensajes
 */
export function setLogLevel(level) {
  if (Object.values(LOG_LEVELS).includes(level)) {
    globalLogConfig.level = level;
  } else {
    console.warn(`[LOG] Nivel inválido: ${level}. Usando nivel por defecto: ${LOG_LEVELS.INFO}`);
  }
}

/**
 * Obtiene el nivel actual de logging
 * 
 * @returns {string} El nivel actual de logging
 */
export function getLogLevel() {
  return globalLogConfig.level;
}

/**
 * Habilita o deshabilita el sistema de logging
 * 
 * @param {boolean} enabled - true para habilitar, false para deshabilitar
 */
export function setLoggingEnabled(enabled) {
  globalLogConfig.enabled = Boolean(enabled);
}

/**
 * Configura el prefijo para todos los mensajes de log
 * 
 * @param {string} prefix - Prefijo a usar en los mensajes
 */
export function setLogPrefix(prefix) {
  globalLogConfig.prefix = String(prefix);
}

/**
 * Configura si se debe incluir timestamp en los logs
 * 
 * @param {boolean} includeTimestamp - true para incluir timestamp
 */
export function setTimestamp(includeTimestamp) {
  globalLogConfig.timestamp = Boolean(includeTimestamp);
}

/**
 * Determina si un nivel de log debe ser mostrado
 * 
 * @private
 * @param {string} level - Nivel del mensaje
 * @returns {boolean} true si el mensaje debe ser mostrado
 */
function shouldLog(level) {
  if (!globalLogConfig.enabled) return false;
  
  const levels = Object.values(LOG_LEVELS);
  const currentLevelIndex = levels.indexOf(globalLogConfig.level);
  const messageLevelIndex = levels.indexOf(level);
  
  return messageLevelIndex <= currentLevelIndex;
}

/**
 * Formatea un mensaje de log con prefijo y timestamp opcional
 * 
 * @private
 * @param {string} level - Nivel del log
 * @param {string} message - Mensaje principal
 * @param {...any} args - Argumentos adicionales
 * @returns {Array} Array con el mensaje formateado y argumentos
 */
function formatMessage(level, message, ...args) {
  let formattedMessage = '';
  
  if (globalLogConfig.timestamp) {
    const timestamp = new Date().toISOString();
    formattedMessage += `[${timestamp}] `;
  }
  
  formattedMessage += `${globalLogConfig.prefix} [${level.toUpperCase()}] ${message}`;
  
  return [formattedMessage, ...args];
}

/**
 * Registra un mensaje de error
 * 
 * Los errores siempre se muestran independientemente del nivel de logging,
 * a menos que el logging esté completamente deshabilitado.
 * 
 * @param {string} message - Mensaje de error
 * @param {...any} args - Argumentos adicionales para el log
 * 
 * @example
 * logError('Error al procesar pago', { userId: 123, amount: 25.50 })
 * logError('Falló la conexión a la API')
 */
export function logError(message, ...args) {
  if (globalLogConfig.enabled) {
    console.error(...formatMessage(LOG_LEVELS.ERROR, message, ...args));
  }
}

/**
 * Registra un mensaje de advertencia
 * 
 * @param {string} message - Mensaje de advertencia
 * @param {...any} args - Argumentos adicionales para el log
 * 
 * @example
 * logWarn('Cupón próximo a expirar', { coupon: 'PROMO10', daysLeft: 2 })
 */
export function logWarn(message, ...args) {
  if (shouldLog(LOG_LEVELS.WARN)) {
    console.warn(...formatMessage(LOG_LEVELS.WARN, message, ...args));
  }
}

/**
 * Registra un mensaje informativo
 * 
 * @param {string} message - Mensaje informativo
 * @param {...any} args - Argumentos adicionales para el log
 * 
 * @example
 * logInfo('Producto agregado al carrito', { productName: 'Mouse', quantity: 1 })
 * logInfo('Descuento Premium aplicado', { discount: '5%' })
 */
export function logInfo(message, ...args) {
  if (shouldLog(LOG_LEVELS.INFO)) {
    console.log(...formatMessage(LOG_LEVELS.INFO, message, ...args));
  }
}

/**
 * Registra un mensaje de debug
 * 
 * @param {string} message - Mensaje de debug
 * @param {...any} args - Argumentos adicionales para el log
 * 
 * @example
 * logDebug('Estado del carrito actualizado', { cart: [...] })
 * logDebug('Cálculo de impuestos', { region: 'CR', rate: 0.13 })
 */
export function logDebug(message, ...args) {
  if (shouldLog(LOG_LEVELS.DEBUG)) {
    console.log(...formatMessage(LOG_LEVELS.DEBUG, message, ...args));
  }
}

/**
 * Registra información de operaciones de carrito de compras
 * 
 * Función especializada para logging de operaciones específicas del carrito.
 * 
 * @param {string} operation - Tipo de operación (add, remove, update, etc.)
 * @param {string} productName - Nombre del producto
 * @param {Object} details - Detalles adicionales de la operación
 * 
 * @example
 * logCartOperation('add', 'Mouse Inalámbrico', { quantity: 1, price: 25.50 })
 * logCartOperation('update', 'Teclado', { oldQty: 1, newQty: 2 })
 */
export function logCartOperation(operation, productName, details = {}) {
  logInfo(`Carrito - ${operation}: ${productName}`, details);
}

/**
 * Registra información de cálculos financieros
 * 
 * Función especializada para logging de operaciones financieras y cálculos.
 * 
 * @param {string} calculation - Tipo de cálculo
 * @param {Object} values - Valores involucrados en el cálculo
 * 
 * @example
 * logFinancialCalculation('Premium Discount', { original: 100, discount: 5, final: 95 })
 * logFinancialCalculation('Tax Calculation', { subtotal: 95, rate: 0.13, taxes: 12.35 })
 */
export function logFinancialCalculation(calculation, values = {}) {
  logInfo(`Cálculo - ${calculation}`, values);
}

/**
 * Agrupa logs relacionados para mejor organización
 * 
 * @param {string} groupName - Nombre del grupo
 * @param {Function} callback - Función que contiene los logs a agrupar
 * 
 * @example
 * logGroup('Proceso de Checkout', () => {
 *   logInfo('Iniciando cálculos');
 *   logInfo('Aplicando descuentos');
 *   logInfo('Calculando impuestos');
 * });
 */
export function logGroup(groupName, callback) {
  if (globalLogConfig.enabled && shouldLog(LOG_LEVELS.INFO)) {
    console.group(`${globalLogConfig.prefix} ${groupName}`);
    try {
      callback();
    } finally {
      console.groupEnd();
    }
  } else if (typeof callback === 'function') {
    // Ejecutar callback sin agrupación si logging está deshabilitado
    callback();
  }
}

/**
 * Exporta la configuración actual para inspección
 * 
 * @returns {Object} Copia de la configuración actual
 */
export function getLogConfig() {
  return { ...globalLogConfig };
}