// src/domain/discounts.js
import { logInfo } from "../utils/log";
export function applyUserDiscounts(subtotal, premiumArg) {
  if (premiumArg) {
    logInfo('Premium -5%');
    return subtotal - subtotal * 0.05;
  }
  return subtotal;
}
