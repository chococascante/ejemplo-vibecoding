// Lógica de negocio pura para cálculos de carrito
export function computeSubtotal(items = []) {
  return items.reduce((sum, it) => {
    const price = Number(it.price) || 0;
    const qty = Number(it.qty) || 0;
    return sum + price * qty;
  }, 0);
}

// user puede ser un booleano (isPremium) o un objeto { isPremium: true }
export function applyUserDiscounts(subtotal, user) {
  const isPremium = (typeof user === 'object' && user !== null) ? !!user.isPremium : !!user;
  if (isPremium) {
    return subtotal - subtotal * 0.05; // -5%
  }
  return subtotal;
}

export function applyCoupons(amount, coupon) {
  if (!coupon) return amount;
  if (coupon === 'PROMO10' && amount >= 50) {
    return amount * 0.90; // -10%
  }
  if (coupon === 'FIJO20' && amount >= 50) {
    return amount - 20; // -20 fixed
  }
  return amount;
}

export function computeTaxes(amount, taxRate) {
  const rate = Number(taxRate) || 0;
  return amount * rate;
}

// Orquestador: devuelve un objeto con desglose y total.
// Nota: devolvemos más información (subtotal después de descuentos, impuestos, total y flags)
// para que la capa de presentación pueda mostrar/loggear sin duplicar lógica.
export function calcTotalNumber(items, user, coupon, taxPolicy) {
  const rawSubtotal = computeSubtotal(items);
  const afterUser = applyUserDiscounts(rawSubtotal, user);
  const afterCoupon = applyCoupons(afterUser, coupon);
  const taxes = computeTaxes(afterCoupon, taxPolicy?.rate ?? 0);
  const total = Math.round((afterCoupon + taxes) * 100) / 100;

  const userDiscountApplied = afterUser !== rawSubtotal;
  const couponApplied = (afterCoupon !== afterUser) ? coupon : null;

  return {
    subtotal: afterCoupon,
    taxes,
    total,
    userDiscountApplied,
    couponApplied,
    rawSubtotal,
    afterUser,
    taxPolicyId: taxPolicy?.id ?? null,
  };
}
