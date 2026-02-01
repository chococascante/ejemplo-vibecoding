/**
 * Demostración del sistema de inyección de dependencias para políticas de impuestos
 * 
 * Este archivo muestra cómo el nuevo sistema permite flexibilidad en el cálculo
 * de impuestos manteniendo compatibilidad completa con el código existente.
 */

import { calcTotalNumber } from './domain/checkout.js';
import { 
  RegionalTaxPolicy, 
  ProgressiveTaxPolicy, 
  PremiumClientTaxPolicy, 
  NoTaxPolicy,
  TaxPolicyFactory 
} from './domain/taxPolicies.js';
import { taxPolicyExamples } from './domain/taxPolicyExamples.js';

// Ejemplo de carrito de compras
const sampleCart = [
  { id: 1, name: 'Mouse', price: 20, qty: 2 },      // $40
  { id: 2, name: 'Teclado', price: 35, qty: 1 },    // $35
  { id: 3, name: 'Monitor', price: 150, qty: 1 }    // $150
];
// Total del carrito: $225

console.log('🛒 CARRITO DE EJEMPLO:');
sampleCart.forEach(item => {
  console.log(`   ${item.name}: $${item.price} x ${item.qty} = $${item.price * item.qty}`);
});
console.log(`   TOTAL CARRITO: $${sampleCart.reduce((sum, item) => sum + (item.price * item.qty), 0)}\n`);

// 1. USO ESTÁNDAR (Compatibilidad total - sin cambios en código existente)
console.log('1️⃣ USO ESTÁNDAR (Sin cambios en código existente):');
const standardResult = calcTotalNumber(sampleCart, true, 'PROMO10', 'CR');
console.log(`   ✅ Funciona exactamente igual que antes`);
console.log(`   💰 Total final: $${standardResult.finalTotal}`);
console.log(`   🏛️  Política usada: ${standardResult.taxPolicyUsed.name}\n`);

// 2. POLÍTICA PROGRESIVA INYECTADA
console.log('2️⃣ POLÍTICA PROGRESIVA (Inyección de dependencias):');
const progressivePolicy = new ProgressiveTaxPolicy();
const progressiveResult = calcTotalNumber(
  sampleCart, true, 'PROMO10', 'PROGRESSIVE', 
  progressivePolicy  // 👈 Política inyectada
);
console.log(`   📈 Impuestos progresivos aplicados`);
console.log(`   💰 Total final: $${progressiveResult.finalTotal}`);
console.log(`   📊 Tramo aplicado: ${progressiveResult.taxes.details.bracket.min}-${progressiveResult.taxes.details.bracket.max} (${progressiveResult.taxes.details.bracket.rate * 100}%)`);
console.log(`   🏛️  Política usada: ${progressiveResult.taxPolicyUsed.name}\n`);

// 3. POLÍTICA PREMIUM CON CONTEXTO ADICIONAL
console.log('3️⃣ POLÍTICA PREMIUM (Con contexto adicional):');
const premiumPolicy = new PremiumClientTaxPolicy();
const premiumResult = calcTotalNumber(
  sampleCart, true, '', 'PREMIUM',
  premiumPolicy,  // 👈 Política inyectada
  { isPremium: true, loyaltyLevel: 'PLATINUM' }  // 👈 Contexto adicional
);
console.log(`   ⭐ Cliente premium detectado`);
console.log(`   💰 Total final: $${premiumResult.finalTotal}`);
console.log(`   💸 Ahorro en impuestos: $${premiumResult.taxes.details.savingsVsStandard}`);
console.log(`   🏛️  Política usada: ${premiumResult.taxPolicyUsed.name}\n`);

// 4. POLÍTICA SIN IMPUESTOS
console.log('4️⃣ POLÍTICA SIN IMPUESTOS (Productos médicos):');
const noTaxPolicy = new NoTaxPolicy();
const medicalCart = [{ id: 4, name: 'Equipo Médico', price: 500, qty: 1 }];
const noTaxResult = calcTotalNumber(
  medicalCart, false, '', 'MEDICAL',
  noTaxPolicy,  // 👈 Política inyectada
  { exemptionReason: 'Equipo médico esencial' }  // 👈 Contexto adicional
);
console.log(`   🏥 Producto médico exento de impuestos`);
console.log(`   💰 Total final: $${noTaxResult.finalTotal} (sin impuestos)`);
console.log(`   📋 Razón: ${noTaxResult.taxes.details.exemptionReason}`);
console.log(`   🏛️  Política usada: ${noTaxResult.taxPolicyUsed.name}\n`);

// 5. COMPARACIÓN DE POLÍTICAS
console.log('5️⃣ COMPARACIÓN DE POLÍTICAS PARA EL MISMO CARRITO:');
const policies = [
  { name: 'Regional (CR 13%)', policy: new RegionalTaxPolicy(), context: { region: 'CR' } },
  { name: 'Progresiva', policy: new ProgressiveTaxPolicy(), context: {} },
  { name: 'Premium', policy: new PremiumClientTaxPolicy(), context: { isPremium: true } },
  { name: 'Sin impuestos', policy: new NoTaxPolicy(), context: { exemptionReason: 'Promoción especial' } }
];

policies.forEach(({ name, policy, context }) => {
  const result = calcTotalNumber(sampleCart, true, '', 'COMPARISON', policy, context);
  console.log(`   ${name}: $${result.finalTotal} (Impuestos: $${result.taxes.taxAmount})`);
});

// 6. FACTORY PATTERN
console.log('\n6️⃣ USO DEL FACTORY PATTERN:');
const factoryPolicy = TaxPolicyFactory.createPolicy('progressive');
const factoryResult = calcTotalNumber(sampleCart, false, '', 'FACTORY', factoryPolicy);
console.log(`   🏭 Política creada con Factory: ${factoryResult.taxPolicyUsed.name}`);
console.log(`   💰 Total: $${factoryResult.finalTotal}\n`);

// 7. BENEFICIOS DEL NUEVO SISTEMA
console.log('🎯 BENEFICIOS DEL SISTEMA DE INYECCIÓN DE DEPENDENCIAS:\n');
console.log('   ✅ COMPATIBILIDAD: Código existente funciona sin cambios');
console.log('   🔧 FLEXIBILIDAD: Diferentes políticas según el contexto');
console.log('   📈 ESCALABILIDAD: Fácil adición de nuevas políticas');
console.log('   🧪 TESTABILIDAD: Políticas mock para pruebas unitarias');
console.log('   🏛️  CUMPLIMIENTO: Diferentes reglas por país/cliente');
console.log('   🔍 TRANSPARENCIA: Información detallada de la política usada');
console.log('   ⚡ RENDIMIENTO: Sin overhead significativo');

export { sampleCart, policies };