// src/domain/coupons.js

import { logInfo } from "../utils/log";

const CouponStrategy = {
  PROMO10: (subtotal) => {
    if (subtotal >= 50) {
      logInfo('Cupón PROMO10 -10%');
      return subtotal * 0.90;
    }
    return subtotal;
  },
  FIJO20: (subtotal) => {
    if (subtotal >= 50) {
      logInfo('Cupón FIJO20 -$20');
      return subtotal - 20;
    }
    return subtotal;
  },
  NONE: (subtotal) => subtotal
};

export function applyCoupons(subtotal, couponArg) {
  const strategy = CouponStrategy[couponArg] || CouponStrategy.NONE;
  return strategy(subtotal);
}
