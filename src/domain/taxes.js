// src/domain/taxes.js
export function computeTaxes(subtotal, regionArg) {
  let taxRate = 0.10;
  if (regionArg === 'CR') taxRate = 0.13;
  else if (regionArg === 'US-CA') taxRate = 0.0725;
  else if (regionArg === 'US-TX') taxRate = 0.0625;
  return subtotal * taxRate;
}
