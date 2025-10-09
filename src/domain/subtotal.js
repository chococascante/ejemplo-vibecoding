// src/domain/subtotal.js
export function computeSubTotal(cartArg) {
  let subtotal = 0;
  for (const item of cartArg) {
    subtotal += (item.price || 0) * (item.qty || 0);
  }
  return subtotal;
}
