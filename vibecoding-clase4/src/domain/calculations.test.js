import assert from 'assert';
import { calcTotalNumber } from './calculations.js';
import taxPolicies from './policies/taxPolicy.js';

// Datos de ejemplo: Mouse(20), Teclado(35), Monitor(150) — qty 1 cada uno
const items = [
  { id: 1, name: 'Mouse', price: 20, qty: 1 },
  { id: 2, name: 'Teclado', price: 35, qty: 1 },
  { id: 3, name: 'Monitor', price: 150, qty: 1 },
];

const user = true; // isPremium
const coupon = 'PROMO10';
const policy = taxPolicies.CR;

const result = calcTotalNumber(items, user, coupon, policy);

// Esperado calculado: subtotal raw=205 -> premium -5% => 194.75 -> promo10 => 175.275
// taxes = 175.275 * 0.13 = 22.78575 -> total = 198.06075 -> redondeado 198.06
const expectedTotal = 198.06;

try {
  assert.strictEqual(result.total, expectedTotal, `Total esperado ${expectedTotal}, obtenido ${result.total}`);
  console.log('PASS calcTotalNumber produces expected total:', result.total);
} catch (err) {
  console.error('FAIL', err.message);
  process.exitCode = 1;
}
