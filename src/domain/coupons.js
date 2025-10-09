// src/domain/coupons.js
import { logInfo } from "../utils/log";
export function applyCoupons(subtotal, couponArg) {
  if (couponArg === 'PROMO10' && subtotal >= 50) {
    logInfo('Cupón PROMO10 -10%');
    return subtotal * 0.90;
  } else if (couponArg === 'FIJO20' && subtotal >= 50) {
    logInfo('Cupón FIJO20 -$20');
    return subtotal - 20;
  }
  return subtotal;
}
