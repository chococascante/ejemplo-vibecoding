/**
 * Sistema de políticas de impuestos con inyección de dependencias
 * 
 * Este módulo implementa el patrón Strategy para el cálculo de impuestos,
 * permitiendo diferentes políticas según país, cliente o contexto de negocio.
 * La inyección de dependencias facilita la extensibilidad y testabilidad.
 * 
 * @module TaxPolicies
 * @version 1.0.0
 * @author Juan Alberto Quiros Gonzalez
 */

import { roundMoney, isValidMoneyValue } from '../utils/money.js';
import { logFinancialCalculation, logWarn } from '../utils/log.js';

/**
 * Interfaz base para políticas de impuestos
 * Todas las políticas deben implementar el método calculateTax
 * 
 * @interface TaxPolicy
 */

/**
 * Política de impuestos estándar por regiones
 * 
 * Implementa el cálculo de impuestos basado en tasas fijas por región geográfica.
 * Esta es la política por defecto que replica el comportamiento original.
 * 
 * Justificación del cambio: Separar la lógica de impuestos en una política
 * independiente permite agregar fácilmente nuevos tipos de cálculo sin
 * modificar el código de dominio principal.
 */
export class RegionalTaxPolicy {
  constructor() {
    this.name = 'Regional Tax Policy';
    this.description = 'Política de impuestos basada en tasas fijas por región';
    
    // Configuración de tasas por región (mantenemos compatibilidad)
    this.taxRates = {
      'CR': 0.13,        // Costa Rica - 13%
      'US-CA': 0.0725,   // California - 7.25%
      'US-TX': 0.0625,   // Texas - 6.25%
      'OTRA': 0.10       // Otras regiones - 10%
    };
  }

  /**
   * Calcula impuestos basado en la región
   * 
   * @param {number} subtotal - Subtotal sobre el cual calcular impuestos
   * @param {Object} context - Contexto de la transacción
   * @param {string} context.region - Código de región
   * @returns {Object} Información detallada del cálculo de impuestos
   */
  calculateTax(subtotal, context = {}) {
    if (!isValidMoneyValue(subtotal)) {
      logWarn('RegionalTaxPolicy: subtotal inválido', { subtotal });
      return this._createErrorResult();
    }

    const region = String(context.region || '').trim().toUpperCase();
    const taxRate = this.taxRates[region] || this.taxRates['OTRA'];
    const effectiveRegion = this.taxRates[region] ? region : 'OTRA';

    if (effectiveRegion === 'OTRA' && region !== 'OTRA') {
      logWarn('RegionalTaxPolicy: región no reconocida, usando tasa por defecto', { 
        requestedRegion: region,
        effectiveRegion,
        taxRate 
      });
    }

    const taxAmount = roundMoney(subtotal * taxRate);
    const totalWithTax = roundMoney(subtotal + taxAmount);

    const result = {
      taxAmount,
      taxRate,
      region: effectiveRegion,
      totalWithTax,
      policyName: this.name,
      details: {
        appliedRate: taxRate,
        calculationMethod: 'fixed_rate_by_region'
      }
    };

    logFinancialCalculation('Regional Tax Calculation', {
      policy: this.name,
      subtotal,
      region: effectiveRegion,
      taxRate,
      taxAmount,
      totalWithTax
    });

    return result;
  }

  _createErrorResult() {
    return {
      taxAmount: 0,
      taxRate: 0,
      region: 'ERROR',
      totalWithTax: 0,
      policyName: this.name,
      details: { error: 'Invalid subtotal' }
    };
  }
}

/**
 * Política de impuestos progresiva
 * 
 * Implementa un sistema de impuestos progresivo donde la tasa aumenta
 * según el monto de la transacción. Útil para países con sistemas tributarios complejos.
 * 
 * Justificación: Algunos países tienen sistemas de impuestos progresivos
 * donde la tasa varía según el monto. Esta política permite implementar
 * esa lógica sin afectar otras partes del sistema.
 */
export class ProgressiveTaxPolicy {
  constructor() {
    this.name = 'Progressive Tax Policy';
    this.description = 'Política de impuestos progresiva basada en tramos';
    
    // Tramos de impuestos progresivos
    this.taxBrackets = [
      { min: 0, max: 50, rate: 0.05 },      // 0-50: 5%
      { min: 50, max: 200, rate: 0.10 },    // 50-200: 10%
      { min: 200, max: 500, rate: 0.15 },   // 200-500: 15%
      { min: 500, max: Infinity, rate: 0.20 } // 500+: 20%
    ];
  }

  /**
   * Calcula impuestos de forma progresiva
   */
  calculateTax(subtotal, context = {}) {
    if (!isValidMoneyValue(subtotal)) {
      logWarn('ProgressiveTaxPolicy: subtotal inválido', { subtotal });
      return this._createErrorResult();
    }

    // Encontrar el tramo correspondiente
    const bracket = this.taxBrackets.find(b => subtotal >= b.min && subtotal < b.max);
    const taxRate = bracket ? bracket.rate : this.taxBrackets[this.taxBrackets.length - 1].rate;
    
    const taxAmount = roundMoney(subtotal * taxRate);
    const totalWithTax = roundMoney(subtotal + taxAmount);

    const result = {
      taxAmount,
      taxRate,
      region: context.region || 'PROGRESSIVE',
      totalWithTax,
      policyName: this.name,
      details: {
        appliedRate: taxRate,
        calculationMethod: 'progressive_brackets',
        bracket: bracket || this.taxBrackets[this.taxBrackets.length - 1]
      }
    };

    logFinancialCalculation('Progressive Tax Calculation', {
      policy: this.name,
      subtotal,
      taxRate,
      bracket: result.details.bracket,
      taxAmount,
      totalWithTax
    });

    return result;
  }

  _createErrorResult() {
    return {
      taxAmount: 0,
      taxRate: 0,
      region: 'ERROR',
      totalWithTax: 0,
      policyName: this.name,
      details: { error: 'Invalid subtotal' }
    };
  }
}

/**
 * Política de impuestos para clientes premium
 * 
 * Implementa tasas de impuestos reducidas para clientes premium o VIP.
 * Demuestra cómo las políticas pueden considerar el contexto del cliente.
 * 
 * Justificación: Los clientes premium podrían tener beneficios tributarios
 * o estar en jurisdicciones con tasas preferenciales. Esta política
 * permite manejar estos casos especiales.
 */
export class PremiumClientTaxPolicy {
  constructor() {
    this.name = 'Premium Client Tax Policy';
    this.description = 'Política de impuestos con tasas reducidas para clientes premium';
    
    this.baseRate = 0.08; // Tasa base reducida para premium
    this.standardRate = 0.13; // Tasa estándar para no-premium
  }

  /**
   * Calcula impuestos considerando el estado premium del cliente
   */
  calculateTax(subtotal, context = {}) {
    if (!isValidMoneyValue(subtotal)) {
      logWarn('PremiumClientTaxPolicy: subtotal inválido', { subtotal });
      return this._createErrorResult();
    }

    const isPremium = Boolean(context.isPremium);
    const taxRate = isPremium ? this.baseRate : this.standardRate;
    const taxAmount = roundMoney(subtotal * taxRate);
    const totalWithTax = roundMoney(subtotal + taxAmount);

    const result = {
      taxAmount,
      taxRate,
      region: context.region || 'PREMIUM_POLICY',
      totalWithTax,
      policyName: this.name,
      details: {
        appliedRate: taxRate,
        calculationMethod: 'premium_client_based',
        isPremium,
        savingsVsStandard: isPremium ? roundMoney(subtotal * (this.standardRate - this.baseRate)) : 0
      }
    };

    logFinancialCalculation('Premium Client Tax Calculation', {
      policy: this.name,
      subtotal,
      isPremium,
      taxRate,
      taxAmount,
      totalWithTax,
      savings: result.details.savingsVsStandard
    });

    return result;
  }

  _createErrorResult() {
    return {
      taxAmount: 0,
      taxRate: 0,
      region: 'ERROR',
      totalWithTax: 0,
      policyName: this.name,
      details: { error: 'Invalid subtotal' }
    };
  }
}

/**
 * Política de impuestos sin gravamen
 * 
 * Implementa una política donde no se aplican impuestos.
 * Útil para productos exentos, zonas francas o promociones especiales.
 * 
 * Justificación: Algunos productos o regiones pueden estar exentos de impuestos.
 * Esta política permite manejar estos casos sin lógica condicional compleja.
 */
export class NoTaxPolicy {
  constructor() {
    this.name = 'No Tax Policy';
    this.description = 'Política sin aplicación de impuestos (exento)';
  }

  /**
   * No aplica impuestos
   */
  calculateTax(subtotal, context = {}) {
    if (!isValidMoneyValue(subtotal)) {
      logWarn('NoTaxPolicy: subtotal inválido', { subtotal });
      return this._createErrorResult();
    }

    const result = {
      taxAmount: 0,
      taxRate: 0,
      region: context.region || 'TAX_EXEMPT',
      totalWithTax: subtotal,
      policyName: this.name,
      details: {
        appliedRate: 0,
        calculationMethod: 'tax_exempt',
        exemptionReason: context.exemptionReason || 'Policy default'
      }
    };

    logFinancialCalculation('No Tax Calculation', {
      policy: this.name,
      subtotal,
      exemptionReason: result.details.exemptionReason
    });

    return result;
  }

  _createErrorResult() {
    return {
      taxAmount: 0,
      taxRate: 0,
      region: 'ERROR',
      totalWithTax: 0,
      policyName: this.name,
      details: { error: 'Invalid subtotal' }
    };
  }
}

/**
 * Factory para crear políticas de impuestos
 * 
 * Facilita la creación e intercambio de políticas según el contexto.
 * Implementa el patrón Factory para la gestión de políticas.
 */
export class TaxPolicyFactory {
  static createPolicy(type, options = {}) {
    switch (type) {
      case 'regional':
        return new RegionalTaxPolicy();
      case 'progressive':
        return new ProgressiveTaxPolicy();
      case 'premium':
        return new PremiumClientTaxPolicy();
      case 'no-tax':
        return new NoTaxPolicy();
      default:
        logWarn('TaxPolicyFactory: tipo de política desconocido, usando regional por defecto', { type });
        return new RegionalTaxPolicy();
    }
  }

  static getAvailablePolicies() {
    return [
      { type: 'regional', name: 'Regional Tax Policy', description: 'Tasas fijas por región' },
      { type: 'progressive', name: 'Progressive Tax Policy', description: 'Impuestos progresivos por tramos' },
      { type: 'premium', name: 'Premium Client Tax Policy', description: 'Tasas reducidas para clientes premium' },
      { type: 'no-tax', name: 'No Tax Policy', description: 'Sin aplicación de impuestos' },
      { type: 'test-region', name: 'Test Region Tax Policy', description: 'Política especial para región TEST (0% impuestos)' }
    ];
  }
}

/**
 * Política de impuestos especial para región TEST
 * 
 * RETO A: Implementación de política personalizada para testing
 * 
 * Esta política está diseñada específicamente para la región "TEST" y aplica
 * 0% de impuestos, facilitando las pruebas y demostraciones del sistema sin
 * la complejidad de cálculos de impuestos.
 * 
 * CARACTERÍSTICAS:
 * - Impuesto 0% para región TEST
 * - Comportamiento regional estándar para otras regiones
 * - Logging especializado para identificar uso en testing
 * - Compatibilidad total con el sistema de inyección de dependencias
 * 
 * CASOS DE USO:
 * - Pruebas automatizadas donde se requiere predictibilidad
 * - Demostraciones del sistema sin complicaciones fiscales
 * - Desarrollo y testing de nuevas funcionalidades
 * - Validación de cálculos base sin variables impositivas
 * 
 * @class TestRegionTaxPolicy
 * @extends {RegionalTaxPolicy}
 * @version 1.0.0
 * @author Juan Alberto Quiros Gonzalez
 * @date 9 de octubre, 2025
 */
export class TestRegionTaxPolicy {
  constructor() {
    this.name = 'Test Region Tax Policy';
    this.description = 'Política especial para región TEST con 0% de impuestos';
    
    // Configuración especial: TEST = 0%, otras regiones mantienen tasas estándar
    this.taxRates = {
      'TEST': 0.00,      // Región TEST - 0% (RETO A)
      'CR': 0.13,        // Costa Rica - 13%
      'US-CA': 0.0725,   // California - 7.25%
      'US-TX': 0.0625,   // Texas - 6.25%
      'OTRA': 0.10       // Otras regiones - 10%
    };
    
    // Metadatos para auditoría y logging
    this.metadata = {
      purpose: 'Testing and Development',
      specialRegions: ['TEST'],
      zeroTaxRegions: ['TEST'],
      implementationDate: '2025-10-09',
      reto: 'RETO_A'
    };
  }

  /**
   * Calcula impuestos con lógica especial para región TEST
   * 
   * IMPLEMENTACIÓN DEL RETO A:
   * - Si región === 'TEST': impuesto = 0%
   * - Para otras regiones: comportamiento estándar
   * 
   * @param {number} subtotal - Subtotal sobre el cual calcular impuestos
   * @param {Object} context - Contexto de la transacción
   * @param {string} context.region - Código de región
   * @param {boolean} context.isTestMode - Indica si está en modo de prueba (opcional)
   * @returns {Object} Información detallada del cálculo de impuestos
   * 
   * @example
   * // Región TEST - 0% impuestos
   * const policy = new TestRegionTaxPolicy();
   * const result = policy.calculateTax(100, { region: 'TEST' });
   * // result.taxAmount === 0, result.totalWithTax === 100
   * 
   * // Región normal - impuestos estándar
   * const result2 = policy.calculateTax(100, { region: 'CR' });
   * // result2.taxAmount === 13, result2.totalWithTax === 113
   */
  calculateTax(subtotal, context = {}) {
    // Validación de entrada
    if (!isValidMoneyValue(subtotal)) {
      logWarn('TestRegionTaxPolicy: subtotal inválido', { subtotal, context });
      return this._createErrorResult();
    }

    const region = String(context.region || '').trim().toUpperCase();
    const isTestMode = context.isTestMode || false;
    
    // LÓGICA PRINCIPAL DEL RETO A: Región TEST = 0% impuestos
    let taxRate, effectiveRegion, calculationMethod;
    
    if (region === 'TEST') {
      // CASO ESPECIAL: Región TEST - 0% impuestos
      taxRate = 0.00;
      effectiveRegion = 'TEST';
      calculationMethod = 'zero_tax_test_region';
      
      logFinancialCalculation('Test Region Tax Calculation - ZERO TAX', {
        policy: this.name,
        subtotal,
        region: effectiveRegion,
        taxRate,
        specialCase: 'RETO_A_IMPLEMENTATION',
        isTestMode
      });
      
    } else {
      // CASO ESTÁNDAR: Otras regiones mantienen comportamiento normal
      taxRate = this.taxRates[region] || this.taxRates['OTRA'];
      effectiveRegion = this.taxRates[region] ? region : 'OTRA';
      calculationMethod = 'standard_regional_rate';
      
      if (effectiveRegion === 'OTRA' && region !== 'OTRA') {
        logWarn('TestRegionTaxPolicy: región no reconocida, usando tasa por defecto', { 
          requestedRegion: region,
          effectiveRegion,
          taxRate 
        });
      }
    }

    // Realizar cálculos
    const taxAmount = roundMoney(subtotal * taxRate);
    const totalWithTax = roundMoney(subtotal + taxAmount);

    // Preparar resultado detallado
    const result = {
      taxAmount,
      taxRate,
      region: effectiveRegion,
      totalWithTax,
      policyName: this.name,
      details: {
        appliedRate: taxRate,
        calculationMethod,
        isZeroTaxRegion: region === 'TEST',
        isTestMode,
        retoImplementation: region === 'TEST' ? 'RETO_A' : null
      }
    };

    // Logging especializado para región TEST
    if (region === 'TEST') {
      logFinancialCalculation('RETO A - Test Region Calculation', {
        policy: this.name,
        subtotal,
        region: effectiveRegion,
        taxRate: 0,
        taxAmount: 0,
        totalWithTax,
        message: 'Impuestos eliminados para región TEST según RETO A'
      });
    } else {
      logFinancialCalculation('Test Region Tax Calculation - Standard', {
        policy: this.name,
        subtotal,
        region: effectiveRegion,
        taxRate,
        taxAmount,
        totalWithTax
      });
    }

    return result;
  }

  /**
   * Crea un resultado de error estándar
   * @private
   * @returns {Object} Resultado de error
   */
  _createErrorResult() {
    return {
      taxAmount: 0,
      taxRate: 0,
      region: 'ERROR',
      totalWithTax: 0,
      policyName: this.name,
      details: {
        error: true,
        calculationMethod: 'error_fallback'
      }
    };
  }

  /**
   * Verifica si una región es considerada región de prueba
   * @param {string} region - Código de región
   * @returns {boolean} true si es región de prueba
   */
  isTestRegion(region) {
    return String(region || '').trim().toUpperCase() === 'TEST';
  }

  /**
   * Obtiene información sobre las regiones especiales soportadas
   * @returns {Object} Información de regiones especiales
   */
  getSpecialRegionsInfo() {
    return {
      testRegions: this.metadata.specialRegions,
      zeroTaxRegions: this.metadata.zeroTaxRegions,
      supportedRegions: Object.keys(this.taxRates),
      purpose: this.metadata.purpose
    };
  }

  /**
   * Método estático para obtener información de políticas disponibles
   * Actualizado para incluir la nueva política TEST
   */
  static getAvailablePolicies() {
    return [
      { type: 'regional', name: 'Regional Tax Policy', description: 'Tasas fijas por región' },
      { type: 'progressive', name: 'Progressive Tax Policy', description: 'Impuestos progresivos por tramos' },
      { type: 'premium', name: 'Premium Client Tax Policy', description: 'Tasas reducidas para clientes premium' },
      { type: 'no-tax', name: 'No Tax Policy', description: 'Sin aplicación de impuestos' },
      { type: 'test-region', name: 'Test Region Tax Policy', description: 'Política especial para región TEST (0% impuestos)' }
    ];
  }
}

// Exportar la política por defecto para compatibilidad
export const defaultTaxPolicy = new RegionalTaxPolicy();