// Dominio de precios: funciones puras
/**
 * @typedef {Object} CartItem
 * @property {number} id
 * @property {string} name
 * @property {number} price
 * @property {number} qty
 */

export function computeSubtotal(cart) {
  return (cart || []).reduce((acc, item) => acc + (item.price || 0) * (item.qty || 0), 0);
}

/**
 * Aplica descuentos por tipo de usuario.
 * @param {number} amount Monto base.
 * @param {{ isPremium: boolean }} options Bandera premium.
 * @returns {number} Monto con descuento aplicado (si corresponde).
 * @example
 * applyUserDiscounts(100, { isPremium: true }) // 95
 */
export function applyUserDiscounts(amount, { isPremium }) {
  const base = Number.isFinite(amount) ? amount : 0;
  return isPremium ? base - base * 0.05 : base; // 5% descuento para premium
}

/**
 * Aplica cupones según umbrales y tipo.
 * - PROMO10: 10% si amount >= 50
 * - FIJO20:  descuenta 20 si amount >= 50
 * @param {number} amount Monto base.
 * @param {string} coupon Código de cupón.
 * @returns {number} Monto después de aplicar cupón (si aplica).
 * @example
 * applyCoupons(100, 'PROMO10') // 90
 */
export function applyCoupons(amount, coupon) {
  const base = Number.isFinite(amount) ? amount : 0;
  if (base < 50) return base; // umbral mínimo
  if (coupon === 'PROMO10') return base * 0.90; // -10%
  if (coupon === 'FIJO20') return base - 20;     // -$20
  return base;
}

/**
 * Calcula impuestos en base a una política inyectable.
 * Admite 3 formas de taxPolicy:
 * - función (amount, region) => taxes
 * - objeto con método calc(amount, region)
 * - mapa de tasas { [region]: number, DEFAULT?: number } o { [region]: { rate: number } }
 * @param {number} amount Base imponible.
 * @param {string} region Región geográfica.
 * @param {any} taxPolicy Política de impuestos inyectable.
 * @returns {number} Impuestos calculados.
 * @example
 * computeTaxes(100, 'CR', { CR: 0.13, DEFAULT: 0.1 }) // 13
 */
export function computeTaxes(amount, region, taxPolicy) {
  const base = Number.isFinite(amount) ? amount : 0;
  if (typeof taxPolicy === 'function') return taxPolicy(base, region);
  if (taxPolicy && typeof taxPolicy.calc === 'function') return taxPolicy.calc(base, region);
  if (taxPolicy && typeof taxPolicy === 'object') {
    const entry = taxPolicy[region] ?? taxPolicy.DEFAULT ?? 0.10;
    const rate = typeof entry === 'number' ? entry : (entry && typeof entry.rate === 'number' ? entry.rate : 0.10);
    return base * rate;
  }
  return base * 0.10; // Fallback (10%)
}

/**
 * Redondea a 2 decimales mitigando problemas binarios típicos (e.g., 1.005).
 * @param {number} n Número a redondear.
 * @returns {number} Valor redondeado a 2 decimales.
 * @example
 * round2(1.005) // 1.01
 */
export function round2(n) {
  const num = Number.isFinite(n) ? n : 0;
  // Compensar errores binarios típicos (e.g., 1.005)
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Política por defecto de impuestos por región.
 * @type {{ [region: string]: number } & { DEFAULT: number }}
 */
export const defaultTaxPolicy = {
  CR: 0.13,
  'US-CA': 0.0725,
  'US-TX': 0.0625,
  TEST: 0,
  DEFAULT: 0.10,
};

/**
 * Orquesta el cálculo de totales a partir del carrito y opciones.
 * @param {CartItem[]} cart Carrito.
 * @param {{ isPremium: boolean, coupon: string, region: string, taxPolicy?: any }} options Opciones de cálculo.
 * @returns {{ subtotal:number, afterUserDiscount:number, afterCoupons:number, taxes:number, total:number }}
 * @example
 * const res = calcTotalNumber([{price:20,qty:2}], { isPremium:true, coupon:'PROMO10', region:'CR' });
 * console.log(res.total);
 */
export function calcTotalNumber(cart, { isPremium, coupon, region, taxPolicy = defaultTaxPolicy }) {
  const subtotal = computeSubtotal(cart);
  const afterUserDiscount = applyUserDiscounts(subtotal, { isPremium });
  const afterCoupons = applyCoupons(afterUserDiscount, coupon);
  const taxes = computeTaxes(afterCoupons, region, taxPolicy);
  const total = round2(afterCoupons + taxes);
  return { subtotal, afterUserDiscount, afterCoupons, taxes, total };
}
