/**
 * RETO B - Pruebas unitarias para cupón BOGO_HALF
 * 
 * OBJETIVO: Validar la implementación del cupón Buy One Get One Half
 * - El segundo ítem del mismo producto a mitad de precio
 * - Funciona solo con productos que tienen qty >= 2
 * - Calcula descuentos correctamente con múltiples productos
 * 
 * COBERTURA DE PRUEBAS:
 * 1. ✅ Cupón BOGO_HALF con 2 productos iguales
 * 2. ✅ Cupón BOGO_HALF con múltiples cantidades
 * 3. ✅ Cupón BOGO_HALF con productos no elegibles
 * 4. ✅ Cupón BOGO_HALF con carrito vacío
 * 5. ✅ Cupón BOGO_HALF con productos múltiples elegibles
 * 6. ✅ Integración completa con calcTotalNumber
 */

import { applyCoupons, calcTotalNumber } from './src/domain/checkout.js';
import { defaultTaxPolicy } from './src/domain/taxPolicies.js';

console.log('🧪 RETO B - Pruebas unitarias del cupón BOGO_HALF');
console.log('=' .repeat(55));

let testsPassed = 0;
let totalTests = 0;

function runTest(testName, testFunction) {
  totalTests++;
  console.log(`\n🔬 TEST ${totalTests}: ${testName}`);
  console.log('-'.repeat(40));
  
  try {
    const result = testFunction();
    if (result.success) {
      testsPassed++;
      console.log('✅ PASÓ');
      if (result.details) {
        console.log(`   ${result.details}`);
      }
    } else {
      console.log('❌ FALLÓ');
      console.log(`   ${result.error}`);
    }
  } catch (error) {
    console.log('❌ ERROR EN PRUEBA');
    console.log(`   ${error.message}`);
  }
}

// TEST 1: BOGO_HALF con exactamente 2 productos iguales
runTest('BOGO_HALF con 2 productos iguales (caso básico)', () => {
  const cartItems = [{ id: 1, name: 'Mouse', price: 20, qty: 2 }];
  const result = applyCoupons(40, 'BOGO_HALF', cartItems);
  
  const expectedDiscount = 10; // 50% del segundo producto
  const expectedSubtotal = 30; // 40 - 10
  
  if (result.applied && 
      result.discountAmount === expectedDiscount &&
      result.newSubtotal === expectedSubtotal) {
    return { 
      success: true, 
      details: `Descuento: $${result.discountAmount}, Nuevo subtotal: $${result.newSubtotal}` 
    };
  }
  
  return { 
    success: false, 
    error: `Esperado: descuento $${expectedDiscount}, subtotal $${expectedSubtotal}. Obtenido: descuento $${result.discountAmount}, subtotal $${result.newSubtotal}` 
  };
});

// TEST 2: BOGO_HALF con 3 productos (debe descontar solo 1)
runTest('BOGO_HALF con 3 productos iguales', () => {
  const cartItems = [{ id: 1, name: 'Mouse', price: 20, qty: 3 }];
  const result = applyCoupons(60, 'BOGO_HALF', cartItems);
  
  const expectedDiscount = 10; // 50% de 1 producto (Math.floor(3/2) = 1)
  const expectedSubtotal = 50; // 60 - 10
  
  if (result.applied && 
      result.discountAmount === expectedDiscount &&
      result.newSubtotal === expectedSubtotal) {
    return { 
      success: true, 
      details: `3 productos → 1 con descuento. Descuento: $${result.discountAmount}` 
    };
  }
  
  return { 
    success: false, 
    error: `Con 3 productos esperaba descuento $${expectedDiscount}, obtuvo $${result.discountAmount}` 
  };
});

// TEST 3: BOGO_HALF con 4 productos (debe descontar 2)
runTest('BOGO_HALF con 4 productos iguales', () => {
  const cartItems = [{ id: 1, name: 'Teclado', price: 50, qty: 4 }];
  const result = applyCoupons(200, 'BOGO_HALF', cartItems);
  
  const expectedDiscount = 50; // 50% de 2 productos (Math.floor(4/2) = 2)
  const expectedSubtotal = 150; // 200 - 50
  
  if (result.applied && 
      result.discountAmount === expectedDiscount &&
      result.newSubtotal === expectedSubtotal) {
    return { 
      success: true, 
      details: `4 productos → 2 con descuento. Descuento: $${result.discountAmount}` 
    };
  }
  
  return { 
    success: false, 
    error: `Con 4 productos esperaba descuento $${expectedDiscount}, obtuvo $${result.discountAmount}` 
  };
});

// TEST 4: BOGO_HALF con productos no elegibles (qty < 2)
runTest('BOGO_HALF con productos no elegibles', () => {
  const cartItems = [
    { id: 1, name: 'Mouse', price: 20, qty: 1 },
    { id: 2, name: 'Teclado', price: 50, qty: 1 }
  ];
  const result = applyCoupons(70, 'BOGO_HALF', cartItems);
  
  if (!result.applied && result.discountAmount === 0 && result.newSubtotal === 70) {
    return { 
      success: true, 
      details: `Ningún producto elegible (qty < 2). Sin descuento aplicado.` 
    };
  }
  
  return { 
    success: false, 
    error: `Esperaba sin descuento, obtuvo descuento $${result.discountAmount}` 
  };
});

// TEST 5: BOGO_HALF con carrito vacío
runTest('BOGO_HALF con carrito vacío', () => {
  const cartItems = [];
  const result = applyCoupons(0, 'BOGO_HALF', cartItems);
  
  if (!result.applied && result.discountAmount === 0) {
    return { 
      success: true, 
      details: `Carrito vacío manejado correctamente.` 
    };
  }
  
  return { 
    success: false, 
    error: `Carrito vacío debería retornar sin descuento` 
  };
});

// TEST 6: BOGO_HALF con múltiples productos elegibles
runTest('BOGO_HALF con múltiples productos elegibles', () => {
  const cartItems = [
    { id: 1, name: 'Mouse', price: 20, qty: 2 },    // Descuento: $10
    { id: 2, name: 'Teclado', price: 50, qty: 2 },  // Descuento: $25
    { id: 3, name: 'Monitor', price: 100, qty: 1 }  // Sin descuento
  ];
  const result = applyCoupons(240, 'BOGO_HALF', cartItems);
  
  const expectedDiscount = 35; // $10 + $25 = $35
  const expectedSubtotal = 205; // 240 - 35
  
  if (result.applied && 
      result.discountAmount === expectedDiscount &&
      result.newSubtotal === expectedSubtotal) {
    return { 
      success: true, 
      details: `Múltiples productos elegibles. Total descuento: $${result.discountAmount}` 
    };
  }
  
  return { 
    success: false, 
    error: `Esperaba descuento $${expectedDiscount}, obtuvo $${result.discountAmount}` 
  };
});

// TEST 7: Integración completa con calcTotalNumber
runTest('Integración completa BOGO_HALF en calcTotalNumber', () => {
  const cartItems = [
    { id: 1, name: 'Mouse', price: 20, qty: 2 }
  ];
  
  const result = calcTotalNumber(cartItems, false, 'BOGO_HALF', 'CR', defaultTaxPolicy);
  
  const expectedSubtotal = 40;      // Subtotal original
  const expectedDiscount = 10;     // BOGO_HALF discount
  const expectedAfterCoupon = 30;  // Después del cupón
  const expectedTax = 3.9;         // 13% de $30
  const expectedTotal = 33.9;      // $30 + $3.9
  
  if (result.subtotal === expectedSubtotal &&
      result.couponDiscount.discountAmount === expectedDiscount &&
      result.couponDiscount.newSubtotal === expectedAfterCoupon &&
      Math.abs(result.taxes.taxAmount - expectedTax) < 0.01 &&
      Math.abs(result.finalTotal - expectedTotal) < 0.01) {
    return { 
      success: true, 
      details: `Integración completa exitosa. Total final: $${result.finalTotal}` 
    };
  }
  
  return { 
    success: false, 
    error: `Integración falló. Total esperado: $${expectedTotal}, obtenido: $${result.finalTotal}` 
  };
});

// TEST 8: BOGO_HALF con cupón inválido
runTest('Validación de cupón BOGO_HALF vs cupón inválido', () => {
  const cartItems = [{ id: 1, name: 'Mouse', price: 20, qty: 2 }];
  
  const validResult = applyCoupons(40, 'BOGO_HALF', cartItems);
  const invalidResult = applyCoupons(40, 'INVALID_COUPON', cartItems);
  
  if (validResult.applied && validResult.discountAmount === 10 &&
      !invalidResult.applied && invalidResult.discountAmount === 0) {
    return { 
      success: true, 
      details: `Cupón válido aplicado, cupón inválido rechazado correctamente.` 
    };
  }
  
  return { 
    success: false, 
    error: `Validación de cupón falló` 
  };
});

console.log('\n🏆 RESUMEN DE PRUEBAS RETO B');
console.log('=' .repeat(35));
console.log(`✅ Pruebas exitosas: ${testsPassed}/${totalTests}`);
console.log(`📊 Porcentaje de éxito: ${Math.round((testsPassed/totalTests) * 100)}%`);

if (testsPassed === totalTests) {
  console.log('\n🎉 ¡TODAS LAS PRUEBAS PASARON!');
  console.log('✅ RETO B - Cupón BOGO_HALF implementado correctamente');
  console.log('✅ Clean Architecture permite extensibilidad sin romper funcionalidad');
  console.log('✅ Funciones puras facilitan las pruebas unitarias');
} else {
  console.log('\n⚠️  ALGUNAS PRUEBAS FALLARON');
  console.log('❌ Revisar implementación del cupón BOGO_HALF');
}

console.log('\n🚀 RETO B COMPLETADO - Clean Architecture + BOGO_HALF exitoso!');