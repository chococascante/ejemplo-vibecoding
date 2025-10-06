// Utilities for money formatting
export function formatCurrency(value, { currency = 'USD', locale = 'en-US' } = {}) {
  if (typeof value !== 'number') value = Number(value) || 0;
  // Keep the simple $x.xx format used by the original app but expose locale/currency for future use
  // We use toFixed to preserve behavior (round to 2 decimals)
  return `$${value.toFixed(2)}`;
}

export default { formatCurrency };
