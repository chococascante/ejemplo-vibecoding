import { createCouponStrategy, Promo10, Fixed20 } from '../coupons';

describe('coupons strategies', () => {
  test('Promo10 applies 10% when >=50', () => {
    const strat = new Promo10();
    const { subtotal, applied } = strat.apply(100);
    expect(applied).toBe(true);
    expect(subtotal).toBeCloseTo(90);
  });

  test('Promo10 does not apply when <50', () => {
    const strat = createCouponStrategy('PROMO10');
    const { subtotal, applied } = strat.apply(40);
    expect(applied).toBe(false);
    expect(subtotal).toBe(40);
  });

  test('Fixed20 applies -20 when >=50', () => {
    const strat = new Fixed20();
    const { subtotal, applied } = strat.apply(60);
    expect(applied).toBe(true);
    expect(subtotal).toBe(40);
  });
});
