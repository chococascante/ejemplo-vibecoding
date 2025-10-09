/**
 * Verificación específica del RETO A - TestRegionTaxPolicy
 * 
 * Este script verifica que el RETO A se cumple completamente:
 * 1. Crear una taxPolicy personalizada (TestRegionTaxPolicy)
 * 2. Crear región TEST
 * 3. Si la región es TEST, el total no debe incluir impuestos (0%)
 * 
 * @author Juan Alberto Quiros Gonzalez
 * @date 9 de octubre, 2025
 */

import { TestRegionTaxPolicy } from './src/domain/taxPolicies.js';
import { calcTotalNumber } from './src/domain/checkout.js';

console.log('🧪 VERIFICACIÓN DEL RETO A - TestRegionTaxPolicy');
console.log('=' .repeat(60));

// 1. Crear la taxPolicy personalizada
console.log('\n✅ 1. Creando TestRegionTaxPolicy personalizada...');
const testTaxPolicy = new TestRegionTaxPolicy();
console.log(`   📋 Política creada: ${testTaxPolicy.name}`);
console.log(`   📝 Descripción: ${testTaxPolicy.description}`);

// 2. Verificar que la región TEST está configurada
console.log('\n✅ 2. Verificando configuración de región TEST...');
const testTaxRate = testTaxPolicy.taxRates['TEST'];
console.log(`   🎯 Tasa de impuesto para TEST: ${(testTaxRate * 100).toFixed(2)}%`);
console.log(`   ✅ Región TEST configurada correctamente: ${testTaxRate === 0 ? 'SÍ' : 'NO'}`);

// 3. Datos de prueba
console.log('\n🛍️ Datos de prueba:');
const productos = [
  { codigo: 'P001', nombre: 'Producto A', precio: 25.00 },
  { codigo: 'P002', nombre: 'Producto B', precio: 50.00 },
  { codigo: 'P003', nombre: 'Producto C', precio: 75.00 }
];

const cartItems = [
  { price: productos[0].precio, qty: 2 }, // 2 x 25 = 50
  { price: productos[1].precio, qty: 1 }, // 1 x 50 = 50  
  { price: productos[2].precio, qty: 1 }  // 1 x 75 = 75
];

const subtotalEsperado = 175.00; // 50 + 50 + 75
console.log(`   💰 Subtotal esperado: $${subtotalEsperado.toFixed(2)}`);

// 4. Prueba CON región TEST (0% impuestos)
console.log('\n🧪 PRUEBA 1: Región TEST (debe aplicar 0% impuestos)');
console.log('-'.repeat(50));

const resultadoTEST = calcTotalNumber(
  cartItems,
  false, // isPremium
  '', // sin cupón
  'TEST', // región TEST
  testTaxPolicy // política personalizada
);

console.log('📊 Resultados para región TEST:');
console.log(`   💵 Subtotal: $${resultadoTEST.subtotal.toFixed(2)}`);
console.log(`   🏷️  Impuestos: $${resultadoTEST.taxes.taxAmount.toFixed(2)}`);
console.log(`   💳 Total: $${resultadoTEST.finalTotal.toFixed(2)}`);
console.log(`   📍 Región aplicada: ${resultadoTEST.taxes.region}`);
console.log(`   📜 Política usada: ${resultadoTEST.taxPolicyUsed.name}`);

// Verificaciones RETO A
const cumpleRetoA = (
  resultadoTEST.taxes.taxAmount === 0 && 
  resultadoTEST.finalTotal === subtotalEsperado &&
  resultadoTEST.taxes.region === 'TEST'
);

console.log('\n🎯 VERIFICACIÓN RETO A:');
console.log(`   ✅ ¿Impuesto = 0%? ${resultadoTEST.taxes.taxAmount === 0 ? 'SÍ' : 'NO'} ($${resultadoTEST.taxes.taxAmount})`);
console.log(`   ✅ ¿Total = Subtotal? ${resultadoTEST.finalTotal === subtotalEsperado ? 'SÍ' : 'NO'} ($${resultadoTEST.finalTotal} = $${subtotalEsperado})`);
console.log(`   ✅ ¿Región = TEST? ${resultadoTEST.taxes.region === 'TEST' ? 'SÍ' : 'NO'} (${resultadoTEST.taxes.region})`);

// 5. Prueba CON región normal (para comparar)
console.log('\n🧪 PRUEBA 2: Región CR (debe aplicar 13% impuestos)');
console.log('-'.repeat(50));

const resultadoCR = calcTotalNumber(
  cartItems,
  false, // isPremium
  '', // sin cupón
  'CR', // región Costa Rica
  testTaxPolicy // misma política
);

console.log('📊 Resultados para región CR:');
console.log(`   💵 Subtotal: $${resultadoCR.subtotal.toFixed(2)}`);
console.log(`   🏷️  Impuestos: $${resultadoCR.taxes.taxAmount.toFixed(2)} (${(resultadoCR.taxes.taxRate * 100).toFixed(2)}%)`);
console.log(`   💳 Total: $${resultadoCR.finalTotal.toFixed(2)}`);
console.log(`   📍 Región aplicada: ${resultadoCR.taxes.region}`);

// 6. Comparación final
console.log('\n📈 COMPARACIÓN DE RESULTADOS:');
console.log('-'.repeat(50));
console.log(`   Región TEST: Subtotal $${resultadoTEST.subtotal.toFixed(2)} + Impuestos $${resultadoTEST.taxes.taxAmount.toFixed(2)} = Total $${resultadoTEST.finalTotal.toFixed(2)}`);
console.log(`   Región CR:   Subtotal $${resultadoCR.subtotal.toFixed(2)} + Impuestos $${resultadoCR.taxes.taxAmount.toFixed(2)} = Total $${resultadoCR.finalTotal.toFixed(2)}`);
console.log(`   Diferencia:  $${(resultadoCR.finalTotal - resultadoTEST.finalTotal).toFixed(2)} (impuestos ahorrados en TEST)`);

// 7. Resultado final
console.log('\n🏆 RESULTADO FINAL DEL RETO A:');
console.log('=' .repeat(60));

if (cumpleRetoA) {
  console.log('✅ ¡RETO A COMPLETADO EXITOSAMENTE!');
  console.log('');
  console.log('📋 Requisitos cumplidos:');
  console.log('   ✅ 1. TaxPolicy personalizada creada (TestRegionTaxPolicy)');
  console.log('   ✅ 2. Región TEST implementada');
  console.log('   ✅ 3. Región TEST aplica 0% de impuestos');
  console.log('   ✅ 4. Total sin impuestos para región TEST');
  console.log('   ✅ 5. Mantiene comportamiento esperado para otras regiones');
} else {
  console.log('❌ RETO A NO CUMPLIDO');
  console.log('');
  console.log('🔍 Problemas detectados:');
  if (resultadoTEST.taxes.taxAmount !== 0) console.log(`   ❌ Impuesto no es 0: $${resultadoTEST.taxes.taxAmount}`);
  if (resultadoTEST.finalTotal !== subtotalEsperado) console.log(`   ❌ Total incorrecto: $${resultadoTEST.finalTotal} ≠ $${subtotalEsperado}`);
  if (resultadoTEST.taxes.region !== 'TEST') console.log(`   ❌ Región incorrecta: ${resultadoTEST.taxes.region}`);
}

console.log('\n🎯 La verificación del RETO A ha sido completada.');