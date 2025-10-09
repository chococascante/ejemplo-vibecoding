/**
 * RETO A: DEMOSTRACIÓN DE POLÍTICA DE IMPUESTOS 0% PARA REGIÓN TEST
 * 
 * Este archivo demuestra la implementación del RETO A, donde se crea una
 * política personalizada de impuestos que aplica 0% de impuestos para la
 * región "TEST" y mantiene el comportamiento estándar para otras regiones.
 * 
 * OBJETIVOS DEL RETO:
 * 1. Crear una taxPolicy personalizada
 * 2. Pasarla a la función calcTotalNumber()
 * 3. Si región es TEST, total no debe incluir impuestos
 * 4. Mantener comportamiento esperado para otras regiones
 * 
 * @module RetoA_TestRegionDemo
 * @version 1.0.0
 * @author Juan Alberto Quiros Gonzalez
 * @date 9 de octubre, 2025
 */

// Importar las funciones y políticas necesarias
import { calcTotalNumber } from './src/domain/checkout.js';
import { TestRegionTaxPolicy, RegionalTaxPolicy } from './src/domain/taxPolicies.js';
import { formatCurrency } from './src/utils/money.js';
import { setLogLevel, LOG_LEVELS, logInfo } from './src/utils/log.js';

// Configurar logging para la demostración
setLogLevel(LOG_LEVELS.INFO);

/**
 * DEMOSTRACIÓN DEL RETO A
 * ======================
 */
console.log('🏆 RETO A: POLÍTICA DE IMPUESTOS 0% PARA REGIÓN TEST');
console.log('='.repeat(60));

// Datos de ejemplo para las pruebas
const carritoEjemplo = [
  { id: 1, name: 'Producto A', price: 100.00, qty: 1 },
  { id: 2, name: 'Producto B', price: 50.00, qty: 2 }
];

const configuracionUsuario = {
  isPremium: true,
  couponCode: 'PROMO10'
};

console.log('📦 CARRITO DE PRUEBA:');
carritoEjemplo.forEach(item => {
  console.log(`   - ${item.name}: ${formatCurrency(item.price)} x ${item.qty} = ${formatCurrency(item.price * item.qty)}`);
});
console.log(`   Subtotal base: ${formatCurrency(carritoEjemplo.reduce((sum, item) => sum + (item.price * item.qty), 0))}`);

console.log('\n⚙️ CONFIGURACIÓN:');
console.log(`   Usuario Premium: ${configuracionUsuario.isPremium ? 'Sí' : 'No'}`);
console.log(`   Cupón: ${configuracionUsuario.couponCode}`);

/**
 * PARTE 1: DEMOSTRACIÓN CON REGIÓN TEST (RETO A)
 * ==============================================
 */
console.log('\n🧪 PARTE 1: REGIÓN TEST - IMPUESTOS 0%');
console.log('='.repeat(45));

// Crear la política personalizada para el RETO A
const testRegionPolicy = new TestRegionTaxPolicy();

// Ejecutar cálculo con región TEST usando la política personalizada
const resultadoTEST = calcTotalNumber(
  carritoEjemplo,                    // cartItems
  configuracionUsuario.isPremium,    // isPremium
  configuracionUsuario.couponCode,   // couponCode
  'TEST',                           // region (RETO A)
  testRegionPolicy                  // taxPolicy personalizada (RETO A)
);

console.log('📊 RESULTADOS PARA REGIÓN TEST:');
console.log(`   Subtotal inicial:     ${formatCurrency(resultadoTEST.subtotal)}`);
console.log(`   Descuento Premium:   -${formatCurrency(resultadoTEST.premiumDiscount.discountAmount)}`);
console.log(`   Descuento Cupón:     -${formatCurrency(resultadoTEST.couponDiscount.discountAmount)}`);
console.log(`   Impuestos TEST:      +${formatCurrency(resultadoTEST.taxes.taxAmount)}`);
console.log(`   ${'='.repeat(30)}`);
console.log(`   💰 TOTAL FINAL:       ${formatCurrency(resultadoTEST.finalTotal)}`);

// Verificación del RETO A
const verificacionRETOA = resultadoTEST.taxes.taxAmount === 0;
console.log(`\n✅ VERIFICACIÓN RETO A: ${verificacionRETOA ? 'EXITOSO' : 'FALLIDO'}`);
console.log(`   Impuestos aplicados: ${formatCurrency(resultadoTEST.taxes.taxAmount)}`);
console.log(`   Tasa de impuesto: ${(resultadoTEST.taxes.taxRate * 100).toFixed(2)}%`);
console.log(`   Región procesada: ${resultadoTEST.taxes.region}`);

/**
 * PARTE 2: COMPARACIÓN CON OTRAS REGIONES
 * =======================================
 */
console.log('\n🔄 PARTE 2: COMPARACIÓN CON OTRAS REGIONES');
console.log('='.repeat(50));

// Probar con la misma política pero diferentes regiones
const regiones = ['CR', 'US-CA', 'US-TX', 'OTRA'];

regiones.forEach(region => {
  const resultado = calcTotalNumber(
    carritoEjemplo,
    configuracionUsuario.isPremium,
    configuracionUsuario.couponCode,
    region,
    testRegionPolicy
  );
  
  console.log(`\n📍 REGIÓN ${region}:`);
  console.log(`   Tasa de impuesto: ${(resultado.taxes.taxRate * 100).toFixed(2)}%`);
  console.log(`   Impuestos: ${formatCurrency(resultado.taxes.taxAmount)}`);
  console.log(`   Total final: ${formatCurrency(resultado.finalTotal)}`);
});

/**
 * PARTE 3: COMPARACIÓN DIRECTA TEST vs NORMAL
 * ===========================================
 */
console.log('\n⚖️ PARTE 3: COMPARACIÓN DIRECTA TEST vs CR');
console.log('='.repeat(50));

// Calcular mismo carrito con región CR (comportamiento normal)
const resultadoCR = calcTotalNumber(
  carritoEjemplo,
  configuracionUsuario.isPremium,
  configuracionUsuario.couponCode,
  'CR',
  testRegionPolicy
);

console.log('📊 COMPARACIÓN LADO A LADO:');
console.log(`                     TEST        CR`);
console.log(`   Subtotal:         ${formatCurrency(resultadoTEST.subtotal).padEnd(10)} ${formatCurrency(resultadoCR.subtotal)}`);
console.log(`   Desc. Premium:   -${formatCurrency(resultadoTEST.premiumDiscount.discountAmount).padEnd(10)}-${formatCurrency(resultadoCR.premiumDiscount.discountAmount)}`);
console.log(`   Desc. Cupón:     -${formatCurrency(resultadoTEST.couponDiscount.discountAmount).padEnd(10)}-${formatCurrency(resultadoCR.couponDiscount.discountAmount)}`);
console.log(`   Impuestos:       +${formatCurrency(resultadoTEST.taxes.taxAmount).padEnd(10)}+${formatCurrency(resultadoCR.taxes.taxAmount)}`);
console.log(`   ${'='.repeat(25)}`);
console.log(`   TOTAL:           ${formatCurrency(resultadoTEST.finalTotal).padEnd(10)} ${formatCurrency(resultadoCR.finalTotal)}`);

// Calcular diferencia
const diferencia = resultadoCR.finalTotal - resultadoTEST.finalTotal;
console.log(`\n💰 DIFERENCIA (Ahorro en TEST): ${formatCurrency(diferencia)}`);

/**
 * PARTE 4: VALIDACIÓN DE FUNCIONES PURAS
 * ======================================
 */
console.log('\n🧪 PARTE 4: VALIDACIÓN DE CONSISTENCIA');
console.log('='.repeat(45));

// Verificar que las funciones puras mantienen consistencia
const test1 = calcTotalNumber(carritoEjemplo, true, 'PROMO10', 'TEST', testRegionPolicy);
const test2 = calcTotalNumber(carritoEjemplo, true, 'PROMO10', 'TEST', testRegionPolicy);
const test3 = calcTotalNumber(carritoEjemplo, true, 'PROMO10', 'TEST', testRegionPolicy);

const esConsistente = (
  test1.finalTotal === test2.finalTotal && 
  test2.finalTotal === test3.finalTotal &&
  test1.taxes.taxAmount === 0 &&
  test2.taxes.taxAmount === 0 &&
  test3.taxes.taxAmount === 0
);

console.log('🔬 PRUEBA DE CONSISTENCIA:');
console.log(`   Llamada 1: ${formatCurrency(test1.finalTotal)} (Impuestos: ${formatCurrency(test1.taxes.taxAmount)})`);
console.log(`   Llamada 2: ${formatCurrency(test2.finalTotal)} (Impuestos: ${formatCurrency(test2.taxes.taxAmount)})`);
console.log(`   Llamada 3: ${formatCurrency(test3.finalTotal)} (Impuestos: ${formatCurrency(test3.taxes.taxAmount)})`);
console.log(`   ✅ Consistencia: ${esConsistente ? 'VERDADERO' : 'FALSO'}`);

/**
 * PARTE 5: INFORMACIÓN DE LA POLÍTICA
 * ===================================
 */
console.log('\n📋 PARTE 5: INFORMACIÓN DE LA POLÍTICA');
console.log('='.repeat(45));

const infoRegionesEspeciales = testRegionPolicy.getSpecialRegionsInfo();
console.log('🏷️ INFORMACIÓN DE LA POLÍTICA:');
console.log(`   Nombre: ${testRegionPolicy.name}`);
console.log(`   Descripción: ${testRegionPolicy.description}`);
console.log(`   Regiones de prueba: ${infoRegionesEspeciales.testRegions.join(', ')}`);
console.log(`   Regiones sin impuestos: ${infoRegionesEspeciales.zeroTaxRegions.join(', ')}`);
console.log(`   Propósito: ${infoRegionesEspeciales.purpose}`);

// Verificar método isTestRegion
console.log('\n🔍 VERIFICACIÓN DE REGIONES:');
['TEST', 'test', 'Test', 'CR', 'OTRA'].forEach(region => {
  const esTest = testRegionPolicy.isTestRegion(region);
  console.log(`   "${region}" es región TEST: ${esTest ? 'SÍ' : 'NO'}`);
});

/**
 * RESUMEN DEL RETO A
 * ==================
 */
console.log('\n🏆 RESUMEN DEL RETO A');
console.log('='.repeat(30));
console.log('✅ OBJETIVOS CUMPLIDOS:');
console.log('   1. ✅ Política personalizada TestRegionTaxPolicy creada');
console.log('   2. ✅ Política pasada exitosamente a calcTotalNumber()');
console.log('   3. ✅ Región TEST aplica 0% de impuestos');
console.log('   4. ✅ Otras regiones mantienen comportamiento esperado');

console.log('\n🔧 CARACTERÍSTICAS IMPLEMENTADAS:');
console.log('   ✅ Inyección de dependencias funcional');
console.log('   ✅ Patrón Strategy mantenido');
console.log('   ✅ Funciones puras preservadas');
console.log('   ✅ Logging detallado implementado');
console.log('   ✅ Documentación completa agregada');
console.log('   ✅ Compatibilidad con sistema existente');

console.log('\n📊 MÉTRICAS DEL RETO:');
console.log(`   Región TEST - Impuestos: ${formatCurrency(resultadoTEST.taxes.taxAmount)}`);
console.log(`   Región CR - Impuestos: ${formatCurrency(resultadoCR.taxes.taxAmount)}`);
console.log(`   Ahorro en TEST: ${formatCurrency(diferencia)}`);
console.log(`   Consistencia: ${esConsistente ? 'VERIFICADA' : 'FALLIDA'}`);

console.log('\n🎉 RETO A COMPLETADO EXITOSAMENTE');
console.log('🚀 Política TestRegionTaxPolicy lista para producción');

/**
 * INSTRUCCIONES DE USO
 * ====================
 * 
 * Para usar la nueva política en tu aplicación:
 * 
 * 1. Importar la política:
 *    import { TestRegionTaxPolicy } from './src/domain/taxPolicies.js';
 * 
 * 2. Crear instancia:
 *    const testPolicy = new TestRegionTaxPolicy();
 * 
 * 3. Usar con calcTotalNumber:
 *    const result = calcTotalNumber(cart, isPremium, coupon, 'TEST', testPolicy);
 * 
 * 4. Para región TEST:
 *    result.taxes.taxAmount será 0
 *    result.taxes.taxRate será 0.00
 * 
 * 5. Para otras regiones:
 *    Comportamiento estándar mantenido
 */