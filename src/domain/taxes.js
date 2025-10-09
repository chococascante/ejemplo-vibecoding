// src/domain/taxes.js

const TaxStrategy = {
  'CR': (subtotal) => subtotal * 0.13,
  'US-CA': (subtotal) => subtotal * 0.0725,
  'US-TX': (subtotal) => subtotal * 0.0625,
  'DEFAULT': (subtotal) => subtotal * 0.10
};

export function computeTaxes(subtotal, regionArg) {
  const strategy = TaxStrategy[regionArg] || TaxStrategy['DEFAULT'];
  return strategy(subtotal);
}
