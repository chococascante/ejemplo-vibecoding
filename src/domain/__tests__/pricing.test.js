import { calcTotalNumber, computeSubtotal, applyUserDiscounts } from '../pricing';

describe('pricing domain', () => {
  test('computeSubtotal sums price * qty', () => {
    const cart = [
      { id: 1, price: 10, qty: 2 },
      { id: 2, price: 5, qty: 3 },
    ];
    expect(computeSubtotal(cart)).toBe(10 * 2 + 5 * 3);
  });

  test('applyUserDiscounts applies premium 5%', () => {
    const subtotal = 200;
    const { subtotal: after, appliedPremium } = applyUserDiscounts(subtotal, true);
    expect(appliedPremium).toBe(true);
    expect(after).toBeCloseTo(200 - 200 * 0.05);
  });

  test('calcTotalNumber matches end-to-end scenario (Mouse,Teclado,Monitor,Premium,PROMO10,CR)', () => {
    const cart = [
      { id: 1, name: 'Mouse', price: 20, qty: 1 },
      { id: 2, name: 'Teclado', price: 35, qty: 1 },
      { id: 3, name: 'Monitor', price: 150, qty: 1 },
    ];
    const res = calcTotalNumber(cart, true, 'PROMO10', 'CR');
    expect(res.total).toBeCloseTo(198.06, 2);
  });
});
