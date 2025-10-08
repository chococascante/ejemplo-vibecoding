/**
 * Lógica de dominio para cálculos de checkout y carrito de compras
 * 
 * Este módulo contiene funciones puras para realizar todos los cálculos
 * relacionados con el checkout, incluyendo subtotales, descuentos, cupones
 * e impuestos. Todas las funciones son puras (sin efectos secundarios)
 * para facilitar testing y mantenimiento.
 * 
 * @module CheckoutDomain
 * @version 1.0.0
 * @author Juan Alberto Quiros Gonzalez
 */

import { roundMoney, isValidMoneyValue } from '../utils/money.js';
import { logFinancialCalculation, logWarn } from '../utils/log.js';
import { defaultTaxPolicy } from './taxPolicies.js';

/**
 * Configuración de cupones disponibles en el sistema
 * @readonly
 */
export const COUPON_CONFIG = {
  PROMO10: {
    type: 'percentage',
    value: 0.10, // 10%
    minAmount: 50,
    description: 'Descuento del 10% con compra mínima de $50'
  },
  FIJO20: {
    type: 'fixed',
    value: 20, // $20
    minAmount: 50,
    description: 'Descuento fijo de $20 con compra mínima de $50'
  }
};

/**
 * Configuración de descuentos para usuarios premium
 * @readonly
 */
export const PREMIUM_CONFIG = {
  discountRate: 0.05, // 5%
  description: 'Descuento Premium del 5%'
};

/**
 * Calcula el subtotal del carrito antes de descuentos e impuestos
 * 
 * Función pura que suma el precio total de todos los productos en el carrito
 * considerando la cantidad de cada producto. Valida que los valores sean
 * números válidos antes de realizar los cálculos.
 * 
 * @param {Array<Object>} cartItems - Array de items del carrito
 * @param {number} cartItems[].price - Precio unitario del producto
 * @param {number} cartItems[].qty - Cantidad del producto en el carrito
 * @returns {number} El subtotal calculado, redondeado a 2 decimales
 * 
 * @example
 * const cart = [
 *   { price: 20, qty: 2 },   // $40
 *   { price: 35, qty: 1 }    // $35
 * ];
 * computeSubtotal(cart); // 75.00
 */
export function computeSubtotal(cartItems) {
  // Validación de entrada
  if (!Array.isArray(cartItems)) {
    logWarn('computeSubtotal: cartItems no es un array válido', { cartItems });
    return 0;
  }

  let subtotal = 0;
  
  for (const item of cartItems) {
    // Validar que price y qty sean números válidos
    const price = Number(item?.price) || 0;
    const qty = Number(item?.qty) || 0;
    
    if (!isValidMoneyValue(price)) {
      logWarn('computeSubtotal: precio inválido detectado', { item, price });
      continue;
    }
    
    if (qty < 0) {
      logWarn('computeSubtotal: cantidad negativa detectada', { item, qty });
      continue;
    }
    
    subtotal += price * qty;
  }
  
  const result = roundMoney(subtotal);
  logFinancialCalculation('Subtotal', { 
    itemCount: cartItems.length, 
    subtotal: result 
  });
  
  return result;
}

/**
 * Aplica descuentos de usuario premium al subtotal
 * 
 * Función pura que calcula el descuento para usuarios premium.
 * Si el usuario es premium, aplica el descuento configurado.
 * 
 * @param {number} subtotal - Subtotal antes del descuento premium
 * @param {boolean} isPremium - Indica si el usuario es premium
 * @returns {Object} Objeto con el nuevo subtotal y detalles del descuento
 * @returns {number} returns.newSubtotal - Subtotal después del descuento
 * @returns {number} returns.discountAmount - Cantidad descontada
 * @returns {boolean} returns.applied - Si se aplicó el descuento
 * 
 * @example
 * applyUserDiscounts(100, true);
 * // { newSubtotal: 95, discountAmount: 5, applied: true }
 * 
 * applyUserDiscounts(100, false);
 * // { newSubtotal: 100, discountAmount: 0, applied: false }
 */
export function applyUserDiscounts(subtotal, isPremium) {
  // Validación de entrada
  if (!isValidMoneyValue(subtotal)) {
    logWarn('applyUserDiscounts: subtotal inválido', { subtotal });
    return { newSubtotal: 0, discountAmount: 0, applied: false };
  }
  
  if (typeof isPremium !== 'boolean') {
    logWarn('applyUserDiscounts: isPremium debe ser booleano', { isPremium });
    isPremium = false;
  }
  
  if (!isPremium) {
    return { 
      newSubtotal: subtotal, 
      discountAmount: 0, 
      applied: false 
    };
  }
  
  const discountAmount = roundMoney(subtotal * PREMIUM_CONFIG.discountRate);
  const newSubtotal = roundMoney(subtotal - discountAmount);
  
  logFinancialCalculation('Premium Discount', {
    originalSubtotal: subtotal,
    discountRate: PREMIUM_CONFIG.discountRate,
    discountAmount,
    newSubtotal
  });
  
  return {
    newSubtotal,
    discountAmount,
    applied: true
  };
}

/**
 * Aplica cupones de descuento al subtotal
 * 
 * Función pura que valida y aplica cupones de descuento según las reglas
 * configuradas. Maneja tanto descuentos porcentuales como fijos.
 * 
 * @param {number} subtotal - Subtotal antes del cupón
 * @param {string} couponCode - Código del cupón a aplicar
 * @returns {Object} Objeto con el nuevo subtotal y detalles del cupón
 * @returns {number} returns.newSubtotal - Subtotal después del cupón
 * @returns {number} returns.discountAmount - Cantidad descontada
 * @returns {boolean} returns.applied - Si se aplicó el cupón
 * @returns {string} returns.reason - Razón por la cual se aplicó o no el cupón
 * 
 * @example
 * applyCoupons(60, 'PROMO10');
 * // { newSubtotal: 54, discountAmount: 6, applied: true, reason: 'Cupón aplicado exitosamente' }
 * 
 * applyCoupons(30, 'PROMO10');
 * // { newSubtotal: 30, discountAmount: 0, applied: false, reason: 'Monto mínimo no alcanzado' }
 */
export function applyCoupons(subtotal, couponCode) {
  // Validación de entrada
  if (!isValidMoneyValue(subtotal)) {
    logWarn('applyCoupons: subtotal inválido', { subtotal });
    return { 
      newSubtotal: 0, 
      discountAmount: 0, 
      applied: false, 
      reason: 'Subtotal inválido' 
    };
  }
  
  // Normalizar código de cupón
  const normalizedCoupon = String(couponCode || '').trim().toUpperCase();
  
  if (!normalizedCoupon) {
    return { 
      newSubtotal: subtotal, 
      discountAmount: 0, 
      applied: false, 
      reason: 'Sin cupón' 
    };
  }
  
  // Verificar si el cupón existe
  const coupon = COUPON_CONFIG[normalizedCoupon];
  if (!coupon) {
    logWarn('applyCoupons: cupón no válido', { couponCode: normalizedCoupon });
    return { 
      newSubtotal: subtotal, 
      discountAmount: 0, 
      applied: false, 
      reason: 'Cupón no válido' 
    };
  }
  
  // Verificar monto mínimo
  if (subtotal < coupon.minAmount) {
    logWarn('applyCoupons: monto mínimo no alcanzado', { 
      subtotal, 
      required: coupon.minAmount,
      coupon: normalizedCoupon 
    });
    return { 
      newSubtotal: subtotal, 
      discountAmount: 0, 
      applied: false, 
      reason: `Monto mínimo no alcanzado ($${coupon.minAmount})` 
    };
  }
  
  let discountAmount = 0;
  let newSubtotal = subtotal;
  
  // Aplicar descuento según el tipo
  if (coupon.type === 'percentage') {
    discountAmount = roundMoney(subtotal * coupon.value);
    newSubtotal = roundMoney(subtotal - discountAmount);
  } else if (coupon.type === 'fixed') {
    discountAmount = Math.min(coupon.value, subtotal); // No puede ser mayor al subtotal
    newSubtotal = roundMoney(subtotal - discountAmount);
  }
  
  logFinancialCalculation('Coupon Applied', {
    couponCode: normalizedCoupon,
    type: coupon.type,
    originalSubtotal: subtotal,
    discountAmount,
    newSubtotal
  });
  
  return {
    newSubtotal,
    discountAmount,
    applied: true,
    reason: 'Cupón aplicado exitosamente'
  };
}

/**
 * Calcula los impuestos usando la política de impuestos inyectada
 * 
 * CAMBIO IMPLEMENTADO: Inyección de dependencias para políticas de impuestos
 * 
 * Justificación del cambio:
 * - FLEXIBILIDAD: Permite diferentes estrategias de cálculo de impuestos
 * - EXTENSIBILIDAD: Fácil adición de nuevas políticas sin modificar código existente
 * - TESTABILIDAD: Permite mockear políticas para pruebas unitarias
 * - SEPARACIÓN DE RESPONSABILIDADES: La lógica de impuestos está en políticas independientes
 * - CUMPLIMIENTO NORMATIVO: Diferentes países/clientes pueden tener reglas tributarias distintas
 * 
 * Ejemplos de uso:
 * - Política regional: Tasas fijas por país (CR: 13%, US-CA: 7.25%)
 * - Política progresiva: Tasas que aumentan con el monto
 * - Política premium: Tasas reducidas para clientes VIP
 * - Política exenta: Sin impuestos para productos específicos
 * 
 * @param {number} subtotal - Subtotal sobre el cual calcular impuestos
 * @param {string} region - Código de región para contexto
 * @param {Object} taxPolicy - Política de impuestos inyectada (implementa calculateTax)
 * @param {Object} additionalContext - Contexto adicional para la política
 * @returns {Object} Objeto con información detallada de los impuestos
 * 
 * @example
 * // Usando política regional por defecto
 * computeTaxes(100, 'CR');
 * 
 * // Usando política progresiva inyectada
 * const progressivePolicy = new ProgressiveTaxPolicy();
 * computeTaxes(100, 'US', progressivePolicy);
 * 
 * // Usando política premium con contexto adicional
 * const premiumPolicy = new PremiumClientTaxPolicy();
 * computeTaxes(100, 'CR', premiumPolicy, { isPremium: true });
 */
export function computeTaxes(subtotal, region, taxPolicy = defaultTaxPolicy, additionalContext = {}) {
  // Validación de entrada
  if (!isValidMoneyValue(subtotal)) {
    logWarn('computeTaxes: subtotal inválido', { subtotal });
    return { 
      taxAmount: 0, 
      taxRate: 0, 
      region: 'ERROR', 
      totalWithTax: 0,
      policyName: taxPolicy?.name || 'Unknown'
    };
  }
  
  // Validación de la política de impuestos
  if (!taxPolicy || typeof taxPolicy.calculateTax !== 'function') {
    logWarn('computeTaxes: política de impuestos inválida, usando política por defecto', { 
      taxPolicy: taxPolicy?.name || 'undefined'
    });
    taxPolicy = defaultTaxPolicy;
  }
  
  // Preparar contexto para la política
  const context = {
    region: String(region || '').trim().toUpperCase(),
    ...additionalContext
  };
  
  try {
    // Delegar el cálculo a la política inyectada
    const result = taxPolicy.calculateTax(subtotal, context);
    
    // Log del cálculo con información de la política utilizada
    logFinancialCalculation('Tax Calculation with Policy', {
      policyName: taxPolicy.name,
      subtotal,
      context,
      result: {
        taxAmount: result.taxAmount,
        taxRate: result.taxRate,
        totalWithTax: result.totalWithTax
      }
    });
    
    return result;
    
  } catch (error) {
    logWarn('computeTaxes: Error en cálculo de impuestos', { 
      error: error.message, 
      policyName: taxPolicy.name,
      subtotal,
      context
    });
    
    // Retorno seguro en caso de error
    return {
      taxAmount: 0,
      taxRate: 0,
      region: 'ERROR',
      totalWithTax: subtotal,
      policyName: taxPolicy.name || 'Unknown',
      error: error.message
    };
  }
}

/**
 * Función orquestadora que coordina todos los cálculos del checkout con DI
 * 
 * CAMBIO IMPLEMENTADO: Soporte para inyección de política de impuestos
 * 
 * Esta función coordina la ejecución de todos los cálculos necesarios
 * para obtener el total final del carrito, aplicando descuentos, cupones
 * e impuestos en el orden correcto. Ahora soporta políticas de impuestos
 * inyectadas para mayor flexibilidad.
 * 
 * Justificación del cambio:
 * - Permite usar diferentes políticas de impuestos según el contexto
 * - Mantiene compatibilidad total con código existente (taxPolicy opcional)
 * - Facilita testing con políticas mock
 * - Soporta contextos adicionales para políticas complejas
 * 
 * @param {Array<Object>} cartItems - Items del carrito
 * @param {boolean} isPremium - Si el usuario es premium
 * @param {string} couponCode - Código del cupón a aplicar
 * @param {string} region - Región para cálculo de impuestos
 * @param {Object} taxPolicy - Política de impuestos inyectada (opcional)
 * @param {Object} taxContext - Contexto adicional para la política de impuestos (opcional)
 * @returns {Object} Objeto con todos los detalles del cálculo
 * 
 * @example
 * // Uso estándar (mantiene compatibilidad)
 * const cart = [{ price: 30, qty: 2 }];
 * const result = calcTotalNumber(cart, true, 'PROMO10', 'CR');
 * 
 * // Uso con política de impuestos inyectada
 * const progressivePolicy = new ProgressiveTaxPolicy();
 * const result = calcTotalNumber(cart, true, 'PROMO10', 'US', progressivePolicy);
 * 
 * // Uso con política premium y contexto
 * const premiumPolicy = new PremiumClientTaxPolicy();
 * const context = { isPremium: true, clientType: 'VIP' };
 * const result = calcTotalNumber(cart, true, '', 'CR', premiumPolicy, context);
 */
export function calcTotalNumber(cartItems, isPremium, couponCode, region, taxPolicy = defaultTaxPolicy, taxContext = {}) {
  try {
    // Paso 1: Calcular subtotal inicial
    const subtotal = computeSubtotal(cartItems);
    
    // Paso 2: Aplicar descuento premium
    const premiumDiscount = applyUserDiscounts(subtotal, isPremium);
    
    // Paso 3: Aplicar cupón sobre el subtotal con descuento premium
    const couponDiscount = applyCoupons(premiumDiscount.newSubtotal, couponCode);
    
    // Paso 4: Calcular impuestos usando la política inyectada
    // Combinar contexto adicional con información del usuario premium
    const combinedTaxContext = {
      isPremium,
      couponCode,
      ...taxContext
    };
    
    const taxes = computeTaxes(couponDiscount.newSubtotal, region, taxPolicy, combinedTaxContext);
    
    // Total final
    const finalTotal = taxes.totalWithTax;
    
    const result = {
      subtotal,
      premiumDiscount,
      couponDiscount,
      taxes,
      finalTotal: roundMoney(finalTotal),
      // Información adicional sobre la política utilizada
      taxPolicyUsed: {
        name: taxPolicy?.name || 'Unknown',
        description: taxPolicy?.description || 'No description'
      }
    };
    
    logFinancialCalculation('Final Total Calculation with Tax Policy', {
      taxPolicy: result.taxPolicyUsed,
      steps: {
        initialSubtotal: subtotal,
        afterPremium: premiumDiscount.newSubtotal,
        afterCoupon: couponDiscount.newSubtotal,
        taxes: taxes.taxAmount,
        finalTotal: result.finalTotal
      },
      context: combinedTaxContext
    });
    
    return result;
    
  } catch (error) {
    logWarn('calcTotalNumber: Error en cálculo', { 
      error: error.message, 
      cartItems, 
      isPremium, 
      couponCode, 
      region,
      taxPolicy: taxPolicy?.name
    });
    
    // Retorno seguro en caso de error
    return {
      subtotal: 0,
      premiumDiscount: { newSubtotal: 0, discountAmount: 0, applied: false },
      couponDiscount: { newSubtotal: 0, discountAmount: 0, applied: false, reason: 'Error en cálculo' },
      taxes: { taxAmount: 0, taxRate: 0, region: 'ERROR', totalWithTax: 0 },
      finalTotal: 0,
      taxPolicyUsed: { name: 'Error', description: 'Error en cálculo' }
    };
  }
}