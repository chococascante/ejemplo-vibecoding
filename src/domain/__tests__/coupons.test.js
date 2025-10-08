import { createCouponStrategy, Promo10, Fixed20, BogoHalf } from '../coupons';

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

  test('BOGO_HALF applies half price to second identical item', () => {
    const strat = new BogoHalf();
    // cart with two identical items: price 10 qty 2 -> subtotal before coupon 20
    const cart = [{ id: 1, price: 10, qty: 2 }];
    const { subtotal, applied } = strat.apply(20, cart);
    // discount should be 0.5 * 10 = 5 -> new subtotal 15
    expect(applied).toBe(true);
    expect(subtotal).toBeCloseTo(15);
  });

  test('createCouponStrategy returns BOGO_HALF and applies correctly', () => {
    const strat = createCouponStrategy('BOGO_HALF');
    const cart = [{ id: 1, price: 25, qty: 3 }];
    // subtotal before = 75, pairs = floor(3/2)=1 => discount = 0.5*25=12.5 => new subtotal 62.5
    const { subtotal, applied } = strat.apply(75, cart);
    expect(applied).toBe(true);
    expect(subtotal).toBeCloseTo(62.5);
  });
});
