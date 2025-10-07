// Strategy pattern for coupons

export class CouponStrategy {
  // returns { subtotal, applied }
  apply(subtotal) {
    return { subtotal, applied: false };
  }
}

export class Promo10 extends CouponStrategy {
  apply(subtotal) {
    if (subtotal >= 50) {
      return { subtotal: subtotal * 0.9, applied: true };
    }
    return { subtotal, applied: false };
  }
}

export class Fixed20 extends CouponStrategy {
  apply(subtotal) {
    if (subtotal >= 50) {
      return { subtotal: subtotal - 20, applied: true };
    }
    return { subtotal, applied: false };
  }
}

export const couponMap = {
  PROMO10: Promo10,
  FIJO20: Fixed20,
};

export function createCouponStrategy(name) {
  const Cls = couponMap[name];
  return Cls ? new Cls() : null;
}

export default { CouponStrategy, Promo10, Fixed20, createCouponStrategy };
