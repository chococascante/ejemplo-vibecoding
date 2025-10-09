// Políticas de impuestos reutilizables
export const taxPolicies = {
  CR: { id: 'CR', rate: 0.13 },
  MX: { id: 'MX', rate: 0.16 },
  US: { id: 'US', rate: 0.08 },
  DEFAULT: { id: 'DEFAULT', rate: 0.10 },
};

// Política TEST: 0% impuestos
taxPolicies.TEST = { id: 'TEST', rate: 0 };

export default taxPolicies;
