/**
 * Utilidades para el manejo y formato de valores monetarios
 * 
 * Este módulo centraliza todas las operaciones relacionadas con el formato
 * de moneda y cálculos monetarios para mantener consistencia en toda la aplicación.
 * 
 * @module MoneyUtils
 * @version 1.0.0
 * @author Juan Alberto Quiros Gonzalez
 */

/**
 * Formatea un número como moneda en dólares estadounidenses
 * 
 * Convierte un valor numérico a formato de moneda con el símbolo de dólar
 * y dos decimales. Maneja casos especiales como valores null, undefined
 * o NaN devolviendo un formato seguro.
 * 
 * @param {number} value - El valor numérico a formatear
 * @returns {string} El valor formateado como moneda (ej: "$25.50")
 * 
 * @example
 * formatCurrency(25.5)     // "$25.50"
 * formatCurrency(100)      // "$100.00"
 * formatCurrency(0)        // "$0.00"
 * formatCurrency(null)     // "$0.00"
 * formatCurrency(undefined)// "$0.00"
 * formatCurrency(NaN)      // "$0.00"
 */
export function formatCurrency(value) {
  // Validación de entrada: convertir valores inválidos a 0
  const numericValue = Number(value);
  const safeValue = isNaN(numericValue) ? 0 : numericValue;
  
  return `$${safeValue.toFixed(2)}`;
}

/**
 * Redondea un valor monetario a dos decimales
 * 
 * Utiliza redondeo matemático estándar para evitar problemas de
 * precisión en operaciones de punto flotante comunes en JavaScript.
 * 
 * @param {number} value - El valor a redondear
 * @returns {number} El valor redondeado a dos decimales
 * 
 * @example
 * roundMoney(25.559)  // 25.56
 * roundMoney(25.554)  // 25.55
 * roundMoney(25)      // 25.00
 */
export function roundMoney(value) {
  const numericValue = Number(value);
  const safeValue = isNaN(numericValue) ? 0 : numericValue;
  
  return Math.round(safeValue * 100) / 100;
}

/**
 * Parsea una cadena de texto a un valor monetario válido
 * 
 * Extrae el valor numérico de una cadena que puede contener
 * símbolos de moneda, espacios u otros caracteres no numéricos.
 * 
 * @param {string} currencyString - La cadena con formato de moneda
 * @returns {number} El valor numérico extraído
 * 
 * @example
 * parseCurrency("$25.50")    // 25.50
 * parseCurrency("$ 100.00")  // 100.00
 * parseCurrency("25.99")     // 25.99
 * parseCurrency("invalid")   // 0
 */
export function parseCurrency(currencyString) {
  if (typeof currencyString !== 'string') {
    return 0;
  }
  
  // Remover símbolos de moneda y espacios, mantener solo números y punto decimal
  const numericString = currencyString.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(numericString);
  
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Valida si un valor puede ser usado como cantidad monetaria
 * 
 * Verifica que el valor sea un número válido, finito y no negativo.
 * Útil para validaciones antes de realizar cálculos monetarios.
 * 
 * @param {any} value - El valor a validar
 * @returns {boolean} true si es un valor monetario válido
 * 
 * @example
 * isValidMoneyValue(25.50)    // true
 * isValidMoneyValue(0)        // true
 * isValidMoneyValue(-10)      // false
 * isValidMoneyValue(NaN)      // false
 * isValidMoneyValue("25")     // false (string)
 */
export function isValidMoneyValue(value) {
  return typeof value === 'number' && 
         isFinite(value) && 
         value >= 0;
}

/**
 * Configuración por defecto para operaciones monetarias
 */
export const MONEY_CONFIG = {
  DECIMAL_PLACES: 2,
  CURRENCY_SYMBOL: '$',
  DEFAULT_VALUE: 0
};