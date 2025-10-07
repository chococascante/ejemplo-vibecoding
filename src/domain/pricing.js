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

export function applyCoupons(subtotal, coupon) {
  let newSubtotal = subtotal;
  let appliedCoupon = null;
  if (coupon === 'PROMO10' && subtotal >= 50) {
    newSubtotal = newSubtotal * 0.90;
    appliedCoupon = 'PROMO10';
  } else if (coupon === 'FIJO20' && subtotal >= 50) {
    newSubtotal = newSubtotal - 20;
    appliedCoupon = 'FIJO20';
  }
  return { subtotal: newSubtotal, appliedCoupon };
}

export function computeTaxes(subtotal, region) {
  let taxRate = 0.10;
  if (region === 'CR') taxRate = 0.13;
  else if (region === 'US-CA') taxRate = 0.0725;
  else if (region === 'US-TX') taxRate = 0.0625;
  const taxes = subtotal * taxRate;
  return { taxes, taxRate };
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
