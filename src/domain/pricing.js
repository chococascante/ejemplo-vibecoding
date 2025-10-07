// Pure pricing/domain functions

export function computeSubtotal(cart = []) {
  let subtotal = 0;
  for (const item of cart) {
    subtotal += (item.price || 0) * (item.qty || 0);
  }
  return subtotal;
}

export function applyUserDiscounts(subtotal, isPremium) {
  let newSubtotal = subtotal;
  const appliedPremium = !!isPremium && subtotal > 0;
  if (appliedPremium) {
    newSubtotal = newSubtotal - newSubtotal * 0.05;
  }
  return { subtotal: newSubtotal, appliedPremium };
}

import { createCouponStrategy } from './coupons';

export function applyCoupons(subtotal, coupon) {
  let newSubtotal = subtotal;
  let appliedCoupon = null;
  const strategy = createCouponStrategy(coupon);
  if (strategy) {
    const { subtotal: after, applied } = strategy.apply(subtotal);
    newSubtotal = after;
    if (applied) appliedCoupon = coupon;
  }
  return { subtotal: newSubtotal, appliedCoupon };
}

import { createTaxPolicy } from './taxes';

export function computeTaxes(subtotal, region) {
  const policy = createTaxPolicy(region);
  return policy.compute(subtotal);
}

// Orchestrator: returns numeric results and metadata (pure)
export function calcTotalNumber(cart, isPremium, coupon, region) {
  const subtotalBefore = computeSubtotal(cart);
  const { subtotal: afterUser, appliedPremium } = applyUserDiscounts(subtotalBefore, isPremium);
  const { subtotal: afterCoupon, appliedCoupon } = applyCoupons(afterUser, coupon);
  const { taxes, taxRate } = computeTaxes(afterCoupon, region);
  let total = afterCoupon + taxes;
  total = Math.round(total * 100) / 100;

  return {
    subtotalBefore,
    subtotalAfterDiscounts: afterCoupon,
    taxes,
    total,
    appliedPremium,
    appliedCoupon,
    taxRate,
  };
}

export default {
  computeSubtotal,
  applyUserDiscounts,
  applyCoupons,
  computeTaxes,
  calcTotalNumber,
};
