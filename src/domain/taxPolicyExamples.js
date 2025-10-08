/**
 * Ejemplos avanzados de uso de políticas de impuestos con inyección de dependencias
 * 
 * Este archivo demuestra cómo usar las diferentes políticas de impuestos
 * implementadas y cómo crear políticas personalizadas para casos específicos.
 * 
 * @module TaxPolicyExamples
 * @version 1.0.0
 * @author Juan Alberto Quiros Gonzalez
 */

import { calcTotalNumber } from './checkout.js';
import { 
  RegionalTaxPolicy, 
  ProgressiveTaxPolicy, 
  PremiumClientTaxPolicy, 
  NoTaxPolicy,
  TaxPolicyFactory 
} from './taxPolicies.js';

/**
 * Ejemplo de política personalizada para empresas B2B
 * 
 * Demuestra cómo crear políticas específicas para casos de negocio particulares.
 * Las empresas B2B pueden tener tratamientos tributarios especiales.
 */
export class B2BTaxPolicy {
  constructor() {
    this.name = 'B2B Tax Policy';
    this.description = 'Política de impuestos para transacciones entre empresas';
    this.exemptThreshold = 1000; // Montos sobre $1000 están exentos
    this.standardRate = 0.05; // Tasa reducida del 5%
  }

  calculateTax(subtotal, context = {}) {
    // Si el cliente es una empresa y el monto supera el umbral, exento
    if (context.isB2B && subtotal >= this.exemptThreshold) {
      return {
        taxAmount: 0,
        taxRate: 0,
        region: context.region || 'B2B',
        totalWithTax: subtotal,
        policyName: this.name,
        details: {
          exemptionReason: `B2B transaction over $${this.exemptThreshold}`,
          calculationMethod: 'b2b_exemption'
        }
      };
    }

    // Si es B2B pero bajo el umbral, aplicar tasa reducida
    if (context.isB2B) {
      const taxAmount = Math.round(subtotal * this.standardRate * 100) / 100;
      return {
        taxAmount,
        taxRate: this.standardRate,
        region: context.region || 'B2B',
        totalWithTax: Math.round((subtotal + taxAmount) * 100) / 100,
        policyName: this.name,
        details: {
          calculationMethod: 'b2b_reduced_rate',
          appliedRate: this.standardRate
        }
      };
    }

    // Si no es B2B, usar tasa estándar del 13%
    const taxAmount = Math.round(subtotal * 0.13 * 100) / 100;
    return {
      taxAmount,
      taxRate: 0.13,
      region: context.region || 'STANDARD',
      totalWithTax: Math.round((subtotal + taxAmount) * 100) / 100,
      policyName: this.name,
      details: {
        calculationMethod: 'standard_rate',
        appliedRate: 0.13
      }
    };
  }
}

/**
 * Demostración de uso de diferentes políticas
 */
export function demonstrateTaxPolicies() {
  const cart = [
    { price: 50, qty: 2 },   // $100
    { price: 75, qty: 1 }    // $75
  ];
  // Total del carrito: $175

  console.log('\n=== DEMOSTRACIÓN DE POLÍTICAS DE IMPUESTOS ===\n');

  // 1. Política regional estándar (comportamiento original)
  console.log('1. POLÍTICA REGIONAL ESTÁNDAR:');
  const regionalResult = calcTotalNumber(cart, false, '', 'CR');
  console.log(`   Subtotal: $${regionalResult.subtotal}`);
  console.log(`   Impuestos (${regionalResult.taxes.taxRate * 100}%): $${regionalResult.taxes.taxAmount}`);
  console.log(`   Total: $${regionalResult.finalTotal}`);
  console.log(`   Política: ${regionalResult.taxPolicyUsed.name}\n`);

  // 2. Política progresiva
  console.log('2. POLÍTICA PROGRESIVA:');
  const progressivePolicy = new ProgressiveTaxPolicy();
  const progressiveResult = calcTotalNumber(cart, false, '', 'PROGRESSIVE', progressivePolicy);
  console.log(`   Subtotal: $${progressiveResult.subtotal}`);
  console.log(`   Impuestos (${progressiveResult.taxes.taxRate * 100}%): $${progressiveResult.taxes.taxAmount}`);
  console.log(`   Total: $${progressiveResult.finalTotal}`);
  console.log(`   Política: ${progressiveResult.taxPolicyUsed.name}`);
  console.log(`   Tramo aplicado: ${JSON.stringify(progressiveResult.taxes.details.bracket)}\n`);

  // 3. Política premium
  console.log('3. POLÍTICA PREMIUM (Cliente VIP):');
  const premiumPolicy = new PremiumClientTaxPolicy();
  const premiumResult = calcTotalNumber(
    cart, true, '', 'PREMIUM', 
    premiumPolicy, 
    { isPremium: true }
  );
  console.log(`   Subtotal: $${premiumResult.subtotal}`);
  console.log(`   Descuento Premium: $${premiumResult.premiumDiscount.discountAmount}`);
  console.log(`   Subtotal después de descuento: $${premiumResult.premiumDiscount.newSubtotal}`);
  console.log(`   Impuestos (${premiumResult.taxes.taxRate * 100}%): $${premiumResult.taxes.taxAmount}`);
  console.log(`   Total: $${premiumResult.finalTotal}`);
  console.log(`   Ahorro vs tasa estándar: $${premiumResult.taxes.details.savingsVsStandard}`);
  console.log(`   Política: ${premiumResult.taxPolicyUsed.name}\n`);

  // 4. Sin impuestos
  console.log('4. POLÍTICA SIN IMPUESTOS:');
  const noTaxPolicy = new NoTaxPolicy();
  const noTaxResult = calcTotalNumber(
    cart, false, '', 'TAX_EXEMPT', 
    noTaxPolicy, 
    { exemptionReason: 'Producto médico esencial' }
  );
  console.log(`   Subtotal: $${noTaxResult.subtotal}`);
  console.log(`   Impuestos: $${noTaxResult.taxes.taxAmount}`);
  console.log(`   Total: $${noTaxResult.finalTotal}`);
  console.log(`   Razón de exención: ${noTaxResult.taxes.details.exemptionReason}`);
  console.log(`   Política: ${noTaxResult.taxPolicyUsed.name}\n`);

  // 5. Política B2B personalizada
  console.log('5. POLÍTICA B2B PERSONALIZADA (Empresa):');
  const b2bPolicy = new B2BTaxPolicy();
  const b2bResult = calcTotalNumber(
    cart, false, '', 'B2B', 
    b2bPolicy, 
    { isB2B: true, companyId: 'COMP123' }
  );
  console.log(`   Subtotal: $${b2bResult.subtotal}`);
  console.log(`   Impuestos (${b2bResult.taxes.taxRate * 100}%): $${b2bResult.taxes.taxAmount}`);
  console.log(`   Total: $${b2bResult.finalTotal}`);
  console.log(`   Política: ${b2bResult.taxPolicyUsed.name}`);
  console.log(`   Método: ${b2bResult.taxes.details.calculationMethod}\n`);

  return {
    regional: regionalResult,
    progressive: progressiveResult,
    premium: premiumResult,
    noTax: noTaxResult,
    b2b: b2bResult
  };
}

/**
 * Ejemplo de selección dinámica de política basada en contexto
 */
export function selectTaxPolicyByContext(context) {
  // Simulación de lógica de negocio para seleccionar política
  if (context.isB2B) {
    return new B2BTaxPolicy();
  }
  
  if (context.isPremium && context.loyaltyLevel === 'PLATINUM') {
    return new PremiumClientTaxPolicy();
  }
  
  if (context.productCategory === 'MEDICAL' || context.productCategory === 'EDUCATIONAL') {
    return new NoTaxPolicy();
  }
  
  if (context.country === 'PROGRESSIVE_TAX_COUNTRY') {
    return new ProgressiveTaxPolicy();
  }
  
  // Por defecto, usar política regional
  return TaxPolicyFactory.createPolicy('regional');
}

/**
 * Ejemplo de comparación de políticas para optimización
 */
export function compareTaxPolicies(cart, userContext) {
  const policies = [
    { name: 'Regional', policy: new RegionalTaxPolicy() },
    { name: 'Progressive', policy: new ProgressiveTaxPolicy() },
    { name: 'Premium', policy: new PremiumClientTaxPolicy() },
    { name: 'B2B', policy: new B2BTaxPolicy() }
  ];

  console.log('\n=== COMPARACIÓN DE POLÍTICAS ===\n');
  
  const results = policies.map(({ name, policy }) => {
    const result = calcTotalNumber(
      cart, 
      userContext.isPremium, 
      userContext.coupon, 
      userContext.region,
      policy,
      userContext
    );
    
    console.log(`${name}: Total final = $${result.finalTotal} (Impuestos: $${result.taxes.taxAmount})`);
    
    return { name, result };
  });

  // Encontrar la política más favorable
  const bestPolicy = results.reduce((best, current) => 
    current.result.finalTotal < best.result.finalTotal ? current : best
  );

  console.log(`\nPolítica más favorable: ${bestPolicy.name} (Ahorro: $${(results[0].result.finalTotal - bestPolicy.result.finalTotal).toFixed(2)})\n`);

  return results;
}

// Exportar ejemplos para uso directo
export const taxPolicyExamples = {
  demonstrate: demonstrateTaxPolicies,
  selectByContext: selectTaxPolicyByContext,
  compare: compareTaxPolicies,
  B2BTaxPolicy
};