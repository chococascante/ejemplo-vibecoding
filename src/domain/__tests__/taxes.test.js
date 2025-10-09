import { createTaxPolicy } from '../taxes';

describe('tax policies', () => {
  test('CR policy uses 13%', () => {
    const policy = createTaxPolicy('CR');
    const { taxes, taxRate } = policy.compute(100);
    expect(taxRate).toBeCloseTo(0.13);
    expect(taxes).toBeCloseTo(13);
  });

  test('US-CA uses 7.25%', () => {
    const policy = createTaxPolicy('US-CA');
    const { taxes, taxRate } = policy.compute(200);
    expect(taxRate).toBeCloseTo(0.0725);
    expect(taxes).toBeCloseTo(14.5);
  });

  test('Default uses 10%', () => {
    const policy = createTaxPolicy('UNKNOWN');
    const { taxes, taxRate } = policy.compute(50);
    expect(taxRate).toBeCloseTo(0.10);
    expect(taxes).toBeCloseTo(5);
  });
});
