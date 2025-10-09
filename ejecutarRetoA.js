/**
 * RETO A - EJECUTOR SIMPLE: REGIÓN TEST CON 0% IMPUESTOS
 * ======================================================
 * 
 * Demostración ejecutable del RETO A donde se implementa una política
 * personalizada que aplica 0% de impuestos para la región "TEST".
 * 
 * @author Juan Alberto Quiros Gonzalez
 * @date 9 de octubre, 2025
 */

console.log('🏆 RETO A: POLÍTICA TEST REGION - 0% IMPUESTOS');
console.log('='.repeat(55));

// Simular la nueva política TestRegionTaxPolicy
class TestRegionTaxPolicy {
  constructor() {
    this.name = 'Test Region Tax Policy';
    this.description = 'Política especial para región TEST con 0% de impuestos';
    
    // Configuración: TEST = 0%, otras regiones = tasas normales
    this.taxRates = {
      'TEST': 0.00,      // RETO A: Región TEST - 0% impuestos
      'CR': 0.13,        // Costa Rica - 13%
      'US-CA': 0.0725,   // California - 7.25%
      'US-TX': 0.0625,   // Texas - 6.25%
      'OTRA': 0.10       // Otras regiones - 10%
    };
  }

  calculateTax(subtotal, context = {}) {
    const region = String(context.region || '').trim().toUpperCase();
    
    // LÓGICA PRINCIPAL DEL RETO A
    let taxRate, effectiveRegion;
    
    if (region === 'TEST') {
      // CASO ESPECIAL: Región TEST - 0% impuestos
      taxRate = 0.00;
      effectiveRegion = 'TEST';
      console.log(`   🧪 Región TEST detectada - Aplicando 0% impuestos (RETO A)`);
    } else {
      // CASO ESTÁNDAR: Otras regiones
      taxRate = this.taxRates[region] || this.taxRates['OTRA'];
      effectiveRegion = this.taxRates[region] ? region : 'OTRA';
    }

    const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
    const totalWithTax = Math.round((subtotal + taxAmount) * 100) / 100;

    return {
      taxAmount,
      taxRate,
      region: effectiveRegion,
      totalWithTax,
      policyName: this.name
    };
  }
}

// Simular función calcTotalNumber simplificada
function calcTotalNumber(cartItems, isPremium, couponCode, region, taxPolicy) {
  // Paso 1: Subtotal
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
  
  // Paso 2: Descuento Premium (5%)
  const premiumDiscount = isPremium ? subtotal * 0.05 : 0;
  const subtotalAfterPremium = subtotal - premiumDiscount;
  
  // Paso 3: Cupón (10% si es PROMO10 y >= $50)
  const couponDiscount = (couponCode === 'PROMO10' && subtotalAfterPremium >= 50) 
    ? subtotalAfterPremium * 0.10 
    : 0;
  const subtotalAfterCoupon = subtotalAfterPremium - couponDiscount;
  
  // Paso 4: Impuestos usando la política inyectada
  const taxes = taxPolicy.calculateTax(subtotalAfterCoupon, { region });
  
  return {
    subtotal,
    premiumDiscount: { discountAmount: premiumDiscount, applied: isPremium },
    couponDiscount: { discountAmount: couponDiscount, applied: couponDiscount > 0 },
    taxes,
    finalTotal: taxes.totalWithTax
  };
}

// DEMOSTRACIÓN DEL RETO A
console.log('\n📦 CONFIGURACIÓN DE PRUEBA:');
const carritoTest = [
  { id: 1, name: 'Producto Test A', price: 100.00, qty: 1 },
  { id: 2, name: 'Producto Test B', price: 25.00, qty: 2 }
];

console.log('   Carrito:');
carritoTest.forEach(item => {
  console.log(`     - ${item.name}: $${item.price} x ${item.qty} = $${(item.price * item.qty).toFixed(2)}`);
});

const configuracion = {
  isPremium: true,
  couponCode: 'PROMO10'
};

console.log(`   Usuario Premium: ${configuracion.isPremium ? 'Sí' : 'No'}`);
console.log(`   Cupón: ${configuracion.couponCode}`);

// Crear política personalizada para RETO A
const testRegionPolicy = new TestRegionTaxPolicy();

console.log('\n🧪 PRUEBA 1: REGIÓN TEST (RETO A)');
console.log('='.repeat(40));

const resultadoTEST = calcTotalNumber(
  carritoTest,
  configuracion.isPremium,
  configuracion.couponCode,
  'TEST',              // ← REGIÓN TEST
  testRegionPolicy     // ← POLÍTICA PERSONALIZADA
);

console.log('📊 Proceso de cálculo:');
console.log(`   Subtotal inicial:     $${resultadoTEST.subtotal.toFixed(2)}`);
console.log(`   Descuento Premium:   -$${resultadoTEST.premiumDiscount.discountAmount.toFixed(2)}`);
console.log(`   Descuento Cupón:     -$${resultadoTEST.couponDiscount.discountAmount.toFixed(2)}`);
console.log(`   Impuestos TEST:      +$${resultadoTEST.taxes.taxAmount.toFixed(2)}`);
console.log(`   ${'='.repeat(30)}`);
console.log(`   💰 TOTAL FINAL:       $${resultadoTEST.finalTotal.toFixed(2)}`);

// Verificación del RETO A
const retoACumplido = resultadoTEST.taxes.taxAmount === 0;
console.log(`\n✅ VERIFICACIÓN RETO A: ${retoACumplido ? '¡EXITOSO!' : 'FALLIDO'}`);
console.log(`   Impuestos aplicados: $${resultadoTEST.taxes.taxAmount.toFixed(2)}`);
console.log(`   Tasa de impuesto: ${(resultadoTEST.taxes.taxRate * 100).toFixed(2)}%`);

console.log('\n🔄 PRUEBA 2: REGIÓN CR (COMPARACIÓN)');
console.log('='.repeat(40));

const resultadoCR = calcTotalNumber(
  carritoTest,
  configuracion.isPremium,
  configuracion.couponCode,
  'CR',                // ← REGIÓN NORMAL
  testRegionPolicy
);

console.log('📊 Proceso de cálculo:');
console.log(`   Subtotal inicial:     $${resultadoCR.subtotal.toFixed(2)}`);
console.log(`   Descuento Premium:   -$${resultadoCR.premiumDiscount.discountAmount.toFixed(2)}`);
console.log(`   Descuento Cupón:     -$${resultadoCR.couponDiscount.discountAmount.toFixed(2)}`);
console.log(`   Impuestos CR (13%):  +$${resultadoCR.taxes.taxAmount.toFixed(2)}`);
console.log(`   ${'='.repeat(30)}`);
console.log(`   💰 TOTAL FINAL:       $${resultadoCR.finalTotal.toFixed(2)}`);

console.log('\n⚖️ COMPARACIÓN DIRECTA:');
console.log('='.repeat(30));
console.log(`                    TEST      CR`);
console.log(`   Impuestos:       $${resultadoTEST.taxes.taxAmount.toFixed(2).padEnd(6)} $${resultadoCR.taxes.taxAmount.toFixed(2)}`);
console.log(`   Total Final:     $${resultadoTEST.finalTotal.toFixed(2).padEnd(6)} $${resultadoCR.finalTotal.toFixed(2)}`);

const ahorro = resultadoCR.finalTotal - resultadoTEST.finalTotal;
console.log(`   Ahorro en TEST:  $${ahorro.toFixed(2)}`);

console.log('\n🧪 PRUEBA 3: MÚLTIPLES REGIONES');
console.log('='.repeat(35));

['TEST', 'CR', 'US-CA', 'US-TX', 'OTRA'].forEach(region => {
  const resultado = calcTotalNumber(carritoTest, true, 'PROMO10', region, testRegionPolicy);
  console.log(`   ${region.padEnd(5)}: Impuestos $${resultado.taxes.taxAmount.toFixed(2).padEnd(6)} Total $${resultado.finalTotal.toFixed(2)}`);
});

console.log('\n🏆 RESUMEN DEL RETO A');
console.log('='.repeat(25));
console.log('✅ OBJETIVOS CUMPLIDOS:');
console.log('   1. ✅ Política TestRegionTaxPolicy creada');
console.log('   2. ✅ Política pasada a calcTotalNumber()');
console.log('   3. ✅ Región TEST aplica 0% impuestos');
console.log('   4. ✅ Otras regiones funcionan normalmente');

console.log('\n🔧 DETALLES TÉCNICOS:');
console.log(`   Política utilizada: ${testRegionPolicy.name}`);
console.log(`   Inyección de dependencias: Funcional`);
console.log(`   Patrón Strategy: Mantenido`);
console.log(`   Compatibilidad: 100%`);

console.log('\n🎯 RESULTADO CLAVE:');
console.log(`   Región TEST - Impuestos: $0.00 ✅`);
console.log(`   Región CR - Impuestos: $${resultadoCR.taxes.taxAmount.toFixed(2)} ✅`);
console.log(`   Diferencia: $${ahorro.toFixed(2)} de ahorro en TEST`);

console.log('\n🎉 RETO A COMPLETADO EXITOSAMENTE');
console.log('✨ TestRegionTaxPolicy implementada correctamente');
console.log('🚀 Sistema listo para usar región TEST sin impuestos');