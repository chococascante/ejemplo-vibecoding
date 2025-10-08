export function formatMoney(amount, currency = 'USD') {
  const n = Number(amount) || 0;
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(n);
  } catch (e) {
    // Fallback simple formatting
    return `$${n.toFixed(2)}`;
  }
}
