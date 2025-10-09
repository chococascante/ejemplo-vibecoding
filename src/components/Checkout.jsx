/**
 * Componente Checkout - Proceso de checkout con descuentos e impuestos
 * 
 * Este componente maneja el proceso final de checkout incluyendo selección
 * de opciones de usuario premium, aplicación de cupones, selección de región
 * y visualización del total final. Se conecta directamente con la lógica
 * de dominio para cálculos complejos.
 * 
 * JUSTIFICACIÓN DE LA SEPARACIÓN:
 * - MODULARIDAD: Componente especializado en el proceso de checkout
 * - REUTILIZACIÓN: Puede usarse en diferentes flujos de compra
 * - MANTENIBILIDAD: Cambios en UI de checkout no afectan otros componentes
 * - TESTING: Testing aislado del comportamiento de checkout
 * - CONEXIÓN CON DOMINIO: Interfaz clara con la lógica de negocio
 * 
 * @module Checkout
 * @version 1.0.0
 * @author Juan Alberto Quiros Gonzalez
 */

import { formatCurrency } from '../utils/money.js';
import { logInfo } from '../utils/log.js';
import { COUPON_CONFIG } from '../domain/checkout.js';
import { TaxPolicyFactory } from '../domain/taxPolicies.js';

/**
 * Configuración de regiones disponibles
 */
const AVAILABLE_REGIONS = [
  { code: 'CR', name: 'Costa Rica', taxRate: 13 },
  { code: 'US-CA', name: 'California, USA', taxRate: 7.25 },
  { code: 'US-TX', name: 'Texas, USA', taxRate: 6.25 },
  { code: 'TEST', name: 'TEST (0% impuestos)', taxRate: 0 },
  { code: 'OTRA', name: 'Otras regiones', taxRate: 10 }
];

/**
 * Configuración de políticas de impuestos disponibles
 */
const AVAILABLE_TAX_POLICIES = [
  { type: 'regional', name: 'Regional (Por país)', description: 'Tasas fijas por región' },
  { type: 'test-region', name: 'Test Region Policy', description: 'Política especial para región TEST (0% impuestos)' },
  { type: 'progressive', name: 'Progresiva', description: 'Tasas que aumentan con el monto' },
  { type: 'premium', name: 'Cliente Premium', description: 'Tasas reducidas para VIP' },
  { type: 'no-tax', name: 'Sin impuestos', description: 'Productos exentos' }
];

/**
 * Componente Checkout
 * 
 * Renderiza el formulario de checkout con todas las opciones disponibles
 * y muestra el cálculo detallado del total final.
 * 
 * @param {Object} props - Props del componente
 * @param {boolean} props.isPremium - Estado premium del usuario
 * @param {string} props.coupon - Código de cupón aplicado
 * @param {string} props.region - Región seleccionada
 * @param {string} props.totalDisplay - Total calculado para mostrar
 * @param {Function} props.onPremiumChange - Callback para cambio de premium
 * @param {Function} props.onCouponChange - Callback para cambio de cupón
 * @param {Function} props.onRegionChange - Callback para cambio de región
 * @param {Function} props.onTaxPolicyChange - Callback para cambio de política (opcional)
 * @param {Object} props.calculationDetails - Detalles del cálculo (opcional)
 * @param {boolean} props.showAdvancedOptions - Mostrar opciones avanzadas
 * @param {string} props.className - Clases CSS adicionales
 * @returns {JSX.Element} Componente de checkout renderizado
 * 
 * @example
 * <Checkout 
 *   isPremium={isPremium}
 *   coupon={coupon}
 *   region={region}
 *   totalDisplay={totalDisplay}
 *   onPremiumChange={handlePremium}
 *   onCouponChange={handleCoupon}
 *   onRegionChange={handleRegion}
 *   calculationDetails={lastCalculation}
 * />
 */
export default function Checkout({ 
  isPremium = false,
  coupon = '',
  region = 'CR',
  totalDisplay = '$0.00',
  onPremiumChange,
  onCouponChange,
  onRegionChange,
  onTaxPolicyChange,
  calculationDetails = null,
  showAdvancedOptions = false,
  className = ''
}) {
  /**
   * Maneja el cambio del estado premium
   */
  const handlePremiumChange = (e) => {
    const isChecked = e.target.checked;
    console.log(`[UI] Checkout: Usuario ${isChecked ? 'activó' : 'desactivó'} premium`);
    
    if (onPremiumChange && typeof onPremiumChange === 'function') {
      onPremiumChange(e);
    }
  };

  /**
   * Maneja el cambio de cupón
   */
  const handleCouponChange = (e) => {
    const newCoupon = e.target.value;
    console.log(`[UI] Checkout: Usuario seleccionó cupón: ${newCoupon || '(ninguno)'}`);
    
    if (onCouponChange && typeof onCouponChange === 'function') {
      onCouponChange(e);
    }
  };

  /**
   * Maneja el cambio de región
   */
  const handleRegionChange = (e) => {
    const newRegion = e.target.value;
    const regionInfo = AVAILABLE_REGIONS.find(r => r.code === newRegion);
    console.log(`[UI] Checkout: Usuario seleccionó región: ${regionInfo?.name || newRegion}`);
    
    if (onRegionChange && typeof onRegionChange === 'function') {
      onRegionChange(e);
    }
  };

  /**
   * Maneja el cambio de política de impuestos
   */
  const handleTaxPolicyChange = (e) => {
    const newPolicyType = e.target.value;
    console.log(`[UI] Checkout: Usuario seleccionó política de impuestos: ${newPolicyType}`);
    
    if (onTaxPolicyChange && typeof onTaxPolicyChange === 'function') {
      const policy = TaxPolicyFactory.createPolicy(newPolicyType);
      onTaxPolicyChange(policy, newPolicyType);
    }
  };

  return (
    <section className={`checkout ${className}`}>
      <h2>Checkout</h2>
      
      <div className="checkout-form">
        {/* Opción Usuario Premium */}
        <div className="form-group premium-option" style={{ marginBottom: '16px' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            cursor: 'pointer'
          }}>
            <input 
              type="checkbox" 
              checked={isPremium} 
              onChange={handlePremiumChange}
              style={{ 
                width: '16px', 
                height: '16px',
                cursor: 'pointer'
              }}
            />
            <span style={{ fontWeight: '500' }}>
              Usuario Premium (-5%)
            </span>
            <span style={{ 
              fontSize: '0.8em', 
              color: '#666',
              marginLeft: '4px'
            }}>
              Descuento automático en todos los productos
            </span>
          </label>
        </div>

        {/* Selección de Cupón */}
        <div className="form-group coupon-selection" style={{ marginBottom: '16px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '4px',
            fontWeight: '500'
          }}>
            Cupón de descuento:
          </label>
          <select 
            value={coupon} 
            onChange={handleCouponChange}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            <option value="">(ninguno)</option>
            {Object.entries(COUPON_CONFIG).map(([code, config]) => (
              <option key={code} value={code}>
                {code} - {config.description}
              </option>
            ))}
          </select>
          
          {/* Información del cupón seleccionado */}
          {coupon && COUPON_CONFIG[coupon] && (
            <CouponInfo coupon={COUPON_CONFIG[coupon]} />
          )}
        </div>

        {/* Selección de Región */}
        <div className="form-group region-selection" style={{ marginBottom: '16px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '4px',
            fontWeight: '500'
          }}>
            Región (para cálculo de impuestos):
          </label>
          <select 
            value={region} 
            onChange={handleRegionChange}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            {AVAILABLE_REGIONS.map(regionOption => (
              <option key={regionOption.code} value={regionOption.code}>
                {regionOption.name} ({regionOption.taxRate}% impuestos)
              </option>
            ))}
          </select>
        </div>

        {/* Opciones Avanzadas (Políticas de Impuestos) */}
        {showAdvancedOptions && onTaxPolicyChange && (
          <div className="form-group tax-policy-selection" style={{ marginBottom: '16px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '4px',
              fontWeight: '500'
            }}>
              Política de impuestos:
            </label>
            <select 
              onChange={handleTaxPolicyChange}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              {AVAILABLE_TAX_POLICIES.map(policy => (
                <option key={policy.type} value={policy.type}>
                  {policy.name} - {policy.description}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Resumen de Cálculo */}
        {calculationDetails && (
          <CalculationBreakdown details={calculationDetails} />
        )}

        {/* Total Final */}
        <div className="total-section" style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          border: '2px solid #e0e0e0'
        }}>
          <h3 style={{ 
            margin: '0 0 8px 0',
            fontSize: '1.4em',
            color: '#1976d2',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>Total a pagar:</span>
            <span style={{ 
              color: '#2e7d32',
              fontWeight: 'bold',
              fontSize: '1.2em'
            }}>
              {totalDisplay}
            </span>
          </h3>
          
          {/* Botón de compra */}
          <button 
            className="purchase-button"
            style={{
              width: '100%',
              padding: '12px',
              marginTop: '12px',
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1.1em',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#45a049'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#4caf50'}
            onClick={() => {
              logInfo('Usuario clickeó botón de compra', {
                total: totalDisplay,
                isPremium,
                coupon,
                region
              });
              alert('¡Funcionalidad de compra no implementada en esta demo!');
            }}
          >
            Completar Compra
          </button>
        </div>
      </div>
    </section>
  );
}

/**
 * Componente CouponInfo - Información del cupón seleccionado
 */
function CouponInfo({ coupon }) {
  return (
    <div className="coupon-info" style={{
      marginTop: '8px',
      padding: '8px',
      backgroundColor: '#e3f2fd',
      borderRadius: '4px',
      fontSize: '0.9em',
      color: '#1565c0'
    }}>
      <strong>📋 Información del cupón:</strong>
      <br />
      {coupon.description}
      {coupon.minAmount && (
        <div style={{ fontSize: '0.8em', marginTop: '4px' }}>
          💡 Compra mínima requerida: {formatCurrency(coupon.minAmount)}
        </div>
      )}
    </div>
  );
}

/**
 * Componente CalculationBreakdown - Desglose detallado del cálculo
 */
function CalculationBreakdown({ details }) {
  if (!details) return null;

  return (
    <div className="calculation-breakdown" style={{
      marginTop: '16px',
      padding: '12px',
      backgroundColor: '#f9f9f9',
      borderRadius: '4px',
      border: '1px solid #e0e0e0'
    }}>
      <h4 style={{ 
        margin: '0 0 8px 0',
        fontSize: '1em',
        color: '#333'
      }}>
        📊 Desglose del cálculo:
      </h4>
      
      <div className="breakdown-row" style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        marginBottom: '4px'
      }}>
        <span>Subtotal inicial:</span>
        <span>{formatCurrency(details.subtotal)}</span>
      </div>
      
      {details.premiumDiscount?.applied && (
        <div className="breakdown-row" style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '4px',
          color: '#4caf50'
        }}>
          <span>Descuento Premium (-5%):</span>
          <span>-{formatCurrency(details.premiumDiscount.discountAmount)}</span>
        </div>
      )}
      
      {details.couponDiscount?.applied && (
        <div className="breakdown-row" style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '4px',
          color: '#4caf50'
        }}>
          <span>Descuento cupón:</span>
          <span>-{formatCurrency(details.couponDiscount.discountAmount)}</span>
        </div>
      )}
      
      <div className="breakdown-row" style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        marginBottom: '4px'
      }}>
        <span>Impuestos ({(details.taxes.taxRate * 100).toFixed(2)}%):</span>
        <span>{formatCurrency(details.taxes.taxAmount)}</span>
      </div>
      
      {details.taxPolicyUsed && (
        <div style={{ 
          fontSize: '0.8em', 
          color: '#666',
          marginTop: '8px',
          fontStyle: 'italic'
        }}>
          🏛️ Política aplicada: {details.taxPolicyUsed.name}
        </div>
      )}
    </div>
  );
}

/**
 * Props por defecto para Checkout
 */
Checkout.defaultProps = {
  isPremium: false,
  coupon: '',
  region: 'CR',
  totalDisplay: '$0.00',
  showAdvancedOptions: false,
  className: ''
};

/**
 * Exportaciones adicionales para testing y reutilización
 */
export { CouponInfo, CalculationBreakdown, AVAILABLE_REGIONS, AVAILABLE_TAX_POLICIES };