/**
 * Pruebas específicas del RETO A - TestRegionTaxPolicy
 * Verificación rápida y directa
 */

import { TestRegionTaxPolicy } from './src/domain/taxPolicies.js';

console.log('🧪 PRUEBAS RÁPIDAS DEL RETO A');
console.log('=' .repeat(40));

const policy = new TestRegionTaxPolicy();

// Prueba 1: Región TEST debe devolver 0% impuestos
const testResult = policy.calculateTax(100, { region: 'TEST' });
console.log('\n✅ Prueba 1 - Región TEST:');
console.log(`   Subtotal: $100.00`);
console.log(`   Impuesto: $${testResult.taxAmount.toFixed(2)} (${(testResult.taxRate * 100).toFixed(2)}%)`);
console.log(`   Total: $${testResult.totalWithTax.toFixed(2)}`);
console.log(`   Región: ${testResult.region}`);
console.log(`   ✅ ${testResult.taxAmount === 0 ? 'CORRECTO' : 'ERROR'}: Impuesto = 0%`);

// Prueba 2: Región CR debe devolver 13% impuestos  
const crResult = policy.calculateTax(100, { region: 'CR' });
console.log('\n✅ Prueba 2 - Región CR:');
console.log(`   Subtotal: $100.00`);
console.log(`   Impuesto: $${crResult.taxAmount.toFixed(2)} (${(crResult.taxRate * 100).toFixed(2)}%)`);
console.log(`   Total: $${crResult.totalWithTax.toFixed(2)}`);
console.log(`   Región: ${crResult.region}`);
console.log(`   ✅ ${crResult.taxAmount === 13 ? 'CORRECTO' : 'ERROR'}: Impuesto = 13%`);

// Prueba 3: Verificar política se identifica correctamente
console.log('\n✅ Prueba 3 - Identificación de política:');
console.log(`   Nombre: ${policy.name}`);
console.log(`   ✅ ${policy.name.includes('Test Region') ? 'CORRECTO' : 'ERROR'}: Política identificada`);

// Resumen
const todosCorrecto = (
  testResult.taxAmount === 0 && 
  testResult.totalWithTax === 100 &&
  crResult.taxAmount === 13 &&
  policy.name.includes('Test Region')
);

console.log('\n🏆 RESUMEN:');
console.log(`   ${todosCorrecto ? '✅ TODOS LOS TESTS PASARON' : '❌ ALGUNOS TESTS FALLARON'}`);
console.log(`   RETO A: ${todosCorrecto ? 'COMPLETADO' : 'PENDIENTE'}`);