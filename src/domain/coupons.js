// Strategy pattern for coupons

export class CouponStrategy {
  // returns { subtotal, applied }
  apply(subtotal) {
    return { subtotal, applied: false };
  }
}

export class Promo10 extends CouponStrategy {
  apply(subtotal/*, cart */) {
    if (subtotal >= 50) {
      return { subtotal: subtotal * 0.9, applied: true };
    }
    return { subtotal, applied: false };
  }
}

export class Fixed20 extends CouponStrategy {
  apply(subtotal/*, cart */) {
    if (subtotal >= 50) {
      return { subtotal: subtotal - 20, applied: true };
    }
    return { subtotal, applied: false };
  }
}

export class BogoHalf extends CouponStrategy {
  // apply(subtotal, cart): for each product in cart, for every pair of identical items,
  // the second item is half price. We compute discount based on item unit prices.
  apply(subtotal, cart = []) {
    if (!Array.isArray(cart) || cart.length === 0) return { subtotal, applied: false };

    // compute discount: for each item, for floor(qty/2) items, discount = 0.5 * price
    let discount = 0;
    for (const item of cart) {
      const pairs = Math.floor((item.qty || 0) / 2);
      if (pairs > 0) {
        discount += pairs * (item.price || 0) * 0.5;
      }
    }

    if (discount > 0) {
      return { subtotal: subtotal - discount, applied: true };
    }
    return { subtotal, applied: false };
  }
}

export const couponMap = {
  PROMO10: Promo10,
  FIJO20: Fixed20,
  BOGO_HALF: BogoHalf,
};

export function createCouponStrategy(name) {
  const Cls = couponMap[name];
  return Cls ? new Cls() : null;
}

export default { CouponStrategy, Promo10, Fixed20, createCouponStrategy };
