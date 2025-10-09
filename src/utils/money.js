// Utilidades de dinero/moneda
// Mantiene compatibilidad con el formateo actual: "$x.xx"
// y permite en el futuro cambiar a Intl.NumberFormat sin tocar los llamadores.

/**
 * Formatea un número a moneda con 2 decimales y prefijo "$".
 * No realiza localización; comportamiento simple y determinista.
 * - Si n no es finito, se asume 0.
 * @param {number} n Valor numérico a formatear.
 * @returns {string} Moneda como texto (por ejemplo: "$12.34").
 * @example
 * formatCurrency(12.3) // "$12.30"
 * formatCurrency(NaN) // "$0.00"
 */
export function formatCurrency(n) {
  const num = Number.isFinite(n) ? n : 0;
  return `$${num.toFixed(2)}`;
}

/**
 * Variante basada en Intl.NumberFormat para evoluciones futuras.
 * No usada por defecto para evitar cambios visuales no deseados.
 * @param {number} n Valor numérico a formatear.
 * @param {{ locale?: string, currency?: string }} [options] Configuración de localización.
 * @returns {string} Cadena con formato de moneda localizado.
 * @example
 * formatCurrencyIntl(1200, { locale: 'es-CR', currency: 'CRC' })
 */
export function formatCurrencyIntl(n, { locale = 'es-CR', currency = 'USD' } = {}) {
  const num = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: 2 }).format(num);
}
