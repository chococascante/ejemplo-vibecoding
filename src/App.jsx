import { useEffect, useState } from "react";
import { formatCurrency } from "./utils/money.js";
import { setLogLevel, LOG_LEVELS, logCartOperation, logInfo } from "./utils/log.js";
import { calcTotalNumber } from "./domain/checkout.js";
import { defaultTaxPolicy } from "./domain/taxPolicies.js";

// Importar los nuevos componentes
import ProductList from "./components/ProductList.jsx";
import Cart from "./components/Cart.jsx";
import Checkout from "./components/Checkout.jsx";

// Configurar logging inicial
setLogLevel(LOG_LEVELS.INFO);

// Simula "API"
async function fetchProducts() {
  return [
    { id: 1, name: 'Mouse', price: 20 },
    { id: 2, name: 'Teclado', price: 35 },
    { id: 3, name: 'Monitor', price: 150 },
  ];
}

/**
 * Componente principal App - Orquestador de la aplicación
 * 
 * CAMBIO IMPLEMENTADO: Separación de UI en componentes especializados
 * 
 * App ahora actúa como orquestador que:
 * - Gestiona el estado global de la aplicación
 * - Coordina la comunicación entre componentes
 * - Conecta los componentes UI con la lógica de dominio
 * - Mantiene la compatibilidad funcional completa
 * 
 * JUSTIFICACIÓN DE LA REFACTORIZACIÓN:
 * - MODULARIDAD: Cada componente tiene responsabilidades específicas
 * - MANTENIBILIDAD: Cambios en UI no afectan la lógica de negocio
 * - REUTILIZACIÓN: Componentes pueden usarse en otros contextos
 * - TESTING: Testing independiente de cada componente
 * - ESCALABILIDAD: Fácil agregar nuevas funcionalidades
 * 
 * @component App
 * @version 2.0.0 (Refactorizado con componentes)
 * @author Juan Alberto Quiros Gonzalez
 */
export default function App() {
  // Estados de la aplicación
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]); // cart: Array of {id, name, price, qty}
  const [region, setRegion] = useState('CR');
  const [coupon, setCoupon] = useState('');
  const [isPremium, setIsPremium] = useState(true);
  const [totalDisplay, setTotalDisplay] = useState('$0.00');
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [currentTaxPolicy, setCurrentTaxPolicy] = useState(defaultTaxPolicy);
  const [lastCalculationDetails, setLastCalculationDetails] = useState(null);

  // Cargar productos al montar el componente
  useEffect(() => {
    fetchProducts()
      .then(productData => {
        setProducts(productData);
        setIsLoadingProducts(false);
        logInfo('Productos cargados exitosamente', { count: productData.length });
      })
      .catch(error => {
        console.error('Error cargando productos:', error);
        setIsLoadingProducts(false);
      });
  }, []);

  /**
   * Maneja la adición de productos al carrito
   * Función callback que se pasa a ProductList
   */
  function handleAddToCart(product) {
    const copy = cart.slice();
    const idx = copy.findIndex(i => i.id === product.id);
    
    if (idx >= 0) {
      copy[idx].qty += 1;
    } else {
      copy.push({ ...product, qty: 1 });
    }
    
    setCart(copy);
    
    // Usar el sistema de logging centralizado
    logCartOperation('add', product.name, { 
      productId: product.id, 
      price: product.price,
      newQuantity: idx >= 0 ? copy[idx].qty : 1
    });
    
    // Recalcular totales
    recalc(copy, isPremium, coupon, region, currentTaxPolicy);
  }

  /**
   * Maneja el cambio de cantidad en el carrito
   * Función callback que se pasa a Cart
   */
  function handleChangeQuantity(id, qty) {
    const copy = cart.map(i => i.id === id ? { ...i, qty: Math.max(0, qty) } : i);
    setCart(copy);
    
    // Log del cambio de cantidad
    const item = copy.find(i => i.id === id);
    if (item) {
      logCartOperation('update_quantity', item.name, { 
        productId: id, 
        newQuantity: qty,
        action: qty === 0 ? 'removed' : 'updated'
      });
    }
    
    recalc(copy, isPremium, coupon, region, currentTaxPolicy);
  }

  /**
   * Maneja la eliminación de items del carrito
   * Función callback opcional para Cart
   */
  function handleRemoveItem(item) {
    const copy = cart.filter(i => i.id !== item.id);
    setCart(copy);
    
    logCartOperation('remove', item.name, { 
      productId: item.id,
      removedQuantity: item.qty
    });
    
    recalc(copy, isPremium, coupon, region, currentTaxPolicy);
  }

  /**
   * Función de recálculo mejorada con detalles
   * Ahora guarda los detalles del cálculo para mostrar en UI
   */
  function recalc(cartArg, premiumArg, couponArg, regionArg, taxPolicy = defaultTaxPolicy) {
    // Usar la función orquestadora del dominio
    const calculation = calcTotalNumber(cartArg, premiumArg, couponArg, regionArg, taxPolicy);
    
    // Guardar detalles para mostrar en UI
    setLastCalculationDetails(calculation);
    
    // Actualizar la visualización del total
    setTotalDisplay(formatCurrency(calculation.finalTotal));
    
    // Log detallado de información adicional para mantener compatibilidad
    if (calculation.premiumDiscount.applied) {
      logInfo('Premium -5%');
    }
    
    if (calculation.couponDiscount.applied) {
      if (couponArg === 'PROMO10') {
        logInfo('Cupón PROMO10 -10%');
      } else if (couponArg === 'FIJO20') {
        logInfo('Cupón FIJO20 -$20');
      }
    }
    
    // Log del resumen final
    logInfo(`Subtotal=${formatCurrency(calculation.subtotal)} Taxes=${formatCurrency(calculation.taxes.taxAmount)} Total=${formatCurrency(calculation.finalTotal)}`);
  }

  /**
   * Callbacks para el componente Checkout
   */
  function handlePremium(e) {
    const newIsPremium = e.target.checked;
    setIsPremium(newIsPremium);
    logInfo(`Usuario ${newIsPremium ? 'activó' : 'desactivó'} premium`);
    recalc(cart, newIsPremium, coupon, region, currentTaxPolicy);
  }

  function handleCoupon(e) {
    const newCoupon = e.target.value;
    setCoupon(newCoupon);
    logInfo(`Usuario cambió cupón a: ${newCoupon || '(ninguno)'}`);
    recalc(cart, isPremium, newCoupon, region, currentTaxPolicy);
  }

  function handleRegion(e) {
    const newRegion = e.target.value;
    setRegion(newRegion);
    logInfo(`Usuario cambió región a: ${newRegion}`);
    recalc(cart, isPremium, coupon, newRegion, currentTaxPolicy);
  }

  /**
   * Callback para cambio de política de impuestos (funcionalidad avanzada)
   */
  function handleTaxPolicyChange(newPolicy, policyType) {
    setCurrentTaxPolicy(newPolicy);
    logInfo(`Usuario cambió política de impuestos a: ${policyType}`);
    recalc(cart, isPremium, coupon, region, newPolicy);
  }

  return (
    <div style={{ padding: 16, fontFamily: 'system-ui' }}>
      <h1>Tienda - Arquitectura por Componentes</h1>
      
      <div style={{ display: 'flex', gap: 24 }}>
        {/* Componente ProductList - Lista de productos */}
        <ProductList 
          products={products}
          onAddToCart={handleAddToCart}
          loading={isLoadingProducts}
        />

        {/* Componente Cart - Gestión del carrito */}
        <Cart 
          cartItems={cart}
          onChangeQuantity={handleChangeQuantity}
          onRemoveItem={handleRemoveItem}
          showSubtotal={true}
          editable={true}
        />

        {/* Componente Checkout - Proceso de checkout */}
        <Checkout 
          isPremium={isPremium}
          coupon={coupon}
          region={region}
          totalDisplay={totalDisplay}
          onPremiumChange={handlePremium}
          onCouponChange={handleCoupon}
          onRegionChange={handleRegion}
          onTaxPolicyChange={handleTaxPolicyChange}
          calculationDetails={lastCalculationDetails}
          showAdvancedOptions={false} // Cambiar a true para mostrar opciones avanzadas
        />
      </div>

      {/* Footer informativo */}
      <div style={{ 
        marginTop: '32px', 
        padding: '16px', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '4px',
        fontSize: '0.9em',
        color: '#666'
      }}>
        <strong>🏗️ Arquitectura Refactorizada:</strong>
        <br />
        ✅ <strong>ProductList</strong>: Componente especializado para mostrar productos
        <br />
        ✅ <strong>Cart</strong>: Componente dedicado para gestión del carrito
        <br />
        ✅ <strong>Checkout</strong>: Componente para proceso de compra y cálculos
        <br />
        ✅ <strong>App</strong>: Orquestador que conecta componentes con dominio
        <br />
        <small style={{ fontStyle: 'italic' }}>
          Misma funcionalidad, mejor organización y mantenibilidad
        </small>
      </div>
    </div>
  );
}
