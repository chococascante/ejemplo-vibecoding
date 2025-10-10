// src/domain/coupons.js

// BOGO_HALF: Por cada 2 items, el segundo está a mitad de precio
function bogoHalf(cart, subtotal) {
  let discount = 0;
  for (const item of cart) {
    if (item.qty >= 2) {
      // Por cada par, uno a mitad de precio
      const pairs = Math.floor(item.qty / 2);
      discount += pairs * (item.price * 0.5);
    }
  }
  return subtotal - discount;
}

const CouponStrategy = {
  PROMO10: (cart, subtotal) => (subtotal >= 50 ? subtotal * 0.90 : subtotal),
  FIJO20: (cart, subtotal) => (subtotal >= 50 ? subtotal - 20 : subtotal),
  BOGO_HALF: bogoHalf,
  NONE: (cart, subtotal) => subtotal
};

// Ahora applyCoupons recibe el carrito además del subtotal y cupón
export function applyCoupons(subtotal, couponArg, cart = []) {
  const strategy = CouponStrategy[couponArg] || CouponStrategy.NONE;
  return strategy(cart, subtotal);
}
