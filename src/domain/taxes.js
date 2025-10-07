// Strategy pattern for tax policies by region

export class TaxPolicy {
  // returns the tax rate (e.g., 0.10)
  rate() {
    return 0.10; // default
  }

  compute(subtotal) {
    const r = this.rate();
    return { taxes: subtotal * r, taxRate: r };
  }
}

export class CRPolicy extends TaxPolicy {
  rate() {
    return 0.13;
  }
}

export class USCAPolicy extends TaxPolicy {
  rate() {
    return 0.0725;
  }
}

export class USTXPolicy extends TaxPolicy {
  rate() {
    return 0.0625;
  }
}

export class DefaultPolicy extends TaxPolicy {
  rate() {
    return 0.10;
  }
}

const policyMap = {
  CR: CRPolicy,
  'US-CA': USCAPolicy,
  'US-TX': USTXPolicy,
  OTRA: DefaultPolicy,
};

export function createTaxPolicy(region) {
  const Cls = policyMap[region] || DefaultPolicy;
  return new Cls();
}

export default { TaxPolicy, CRPolicy, USCAPolicy, USTXPolicy, DefaultPolicy, createTaxPolicy };
