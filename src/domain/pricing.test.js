import { describe, it, expect } from 'vitest';
import { computeSubtotal, applyUserDiscounts, applyCoupons, computeTaxes, round2, calcTotalNumber, defaultTaxPolicy } from './pricing.js';

describe('pricing domain', () => {
  const cart = [
    { id: 1, name: 'Mouse', price: 20, qty: 2 }, // 40
    { id: 2, name: 'Teclado', price: 30, qty: 1 }, // 30
  ]; // subtotal 70

  it('computeSubtotal', () => {
    expect(computeSubtotal(cart)).toBe(70);
    expect(computeSubtotal([])).toBe(0);
  });

  it('applyUserDiscounts premium 5%', () => {
    expect(applyUserDiscounts(100, { isPremium: true })).toBe(95);
    expect(applyUserDiscounts(100, { isPremium: false })).toBe(100);
  });

  it('applyCoupons with threshold', () => {
    expect(applyCoupons(49, 'PROMO10')).toBe(49);
    expect(applyCoupons(100, 'PROMO10')).toBe(90);
    expect(applyCoupons(100, 'FIJO20')).toBe(80);
    expect(applyCoupons(100, '')).toBe(100);
  });

  it('computeTaxes with policy map', () => {
    const taxesCR = computeTaxes(100, 'CR', defaultTaxPolicy);
    expect(taxesCR).toBeCloseTo(13, 6);
    const taxesOther = computeTaxes(100, 'MX', defaultTaxPolicy);
    expect(taxesOther).toBeCloseTo(10, 6);
    const taxesTest = computeTaxes(100, 'TEST', defaultTaxPolicy);
    expect(taxesTest).toBe(0);
  });

  it('computeTaxes with function policy', () => {
    const fnPolicy = (amount, region) => amount * (region === 'CR' ? 0.15 : 0.05);
    expect(computeTaxes(100, 'CR', fnPolicy)).toBe(15);
    expect(computeTaxes(100, 'US', fnPolicy)).toBe(5);
  });

  it('round2', () => {
    expect(round2(1.005)).toBe(1.01);
    expect(round2(1.004)).toBe(1);
  });

  it('calcTotalNumber integration', () => {
    const res = calcTotalNumber(cart, { isPremium: true, coupon: 'PROMO10', region: 'CR', taxPolicy: defaultTaxPolicy });
    // subtotal 70 -> premium 5% => 66.5 -> coupon 10% => 59.85 -> taxes 13% => 7.7805 -> total 67.63 (redondeado)
    expect(res.subtotal).toBe(70);
    expect(res.afterUserDiscount).toBeCloseTo(66.5, 6);
    expect(res.afterCoupons).toBeCloseTo(59.85, 6);
    expect(res.taxes).toBeCloseTo(7.7805, 6);
    expect(res.total).toBe(67.63);
  });
});
