// src/domain/discounts.js
export function applyUserDiscounts(subtotal, premiumArg) {
  if (premiumArg) {
    return subtotal - subtotal * 0.05;
  }
  return subtotal;
}
