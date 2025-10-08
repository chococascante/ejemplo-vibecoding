/**
 * Componente Cart - Gestión del carrito de compras
 * 
 * Este componente maneja la visualización y modificación del carrito de compras.
 * Permite a los usuarios ver los items agregados, modificar cantidades y
 * ver subtotales. Mantiene la separación entre UI y lógica de negocio.
 * 
 * JUSTIFICACIÓN DE LA SEPARACIÓN:
 * - MODULARIDAD: Componente especializado solo en gestión de carrito
 * - REUTILIZACIÓN: Puede usarse en diferentes contextos (modal, sidebar, página)
 * - MANTENIBILIDAD: Cambios en la UI del carrito no afectan otros componentes
 * - TESTING: Testing aislado del comportamiento del carrito
 * - RESPONSABILIDAD ÚNICA: Solo maneja la presentación y interacción del carrito
 * 
 * @module Cart
 * @version 1.0.0
 * @author Juan Alberto Quiros Gonzalez
 */

import { formatCurrency } from '../utils/money.js';
import { logCartOperation } from '../utils/log.js';

/**
 * Componente Cart
 * 
 * Renderiza el carrito de compras con funcionalidades para modificar cantidades
 * y eliminar items. Recibe el estado del carrito y callbacks como props.
 * 
 * @param {Object} props - Props del componente
 * @param {Array<Object>} props.cartItems - Items en el carrito
 * @param {Function} props.onChangeQuantity - Callback para cambiar cantidad
 * @param {Function} props.onRemoveItem - Callback para eliminar item (opcional)
 * @param {boolean} props.showSubtotal - Mostrar subtotal del carrito
 * @param {string} props.className - Clases CSS adicionales
 * @param {boolean} props.editable - Si el carrito es editable
 * @returns {JSX.Element} Componente del carrito renderizado
 * 
 * @example
 * <Cart 
 *   cartItems={cart}
 *   onChangeQuantity={handleQuantityChange}
 *   onRemoveItem={handleRemoveItem}
 *   showSubtotal={true}
 *   editable={true}
 * />
 */
export default function Cart({ 
  cartItems = [], 
  onChangeQuantity, 
  onRemoveItem,
  showSubtotal = true,
  className = '',
  editable = true
}) {
  /**
   * Calcula el subtotal del carrito
   * Función local para cálculos de UI (no lógica de negocio)
   */
  const calculateDisplaySubtotal = () => {
    return cartItems.reduce((sum, item) => {
      return sum + ((item.price || 0) * (item.qty || 0));
    }, 0);
  };

  /**
   * Maneja el cambio de cantidad de un item
   * 
   * @param {number} itemId - ID del item a modificar
   * @param {number} newQuantity - Nueva cantidad
   */
  const handleQuantityChange = (itemId, newQuantity) => {
    if (!onChangeQuantity || typeof onChangeQuantity !== 'function') {
      console.warn('Cart: onChangeQuantity prop no es una función válida');
      return;
    }

    // Validaciones
    const quantity = Math.max(0, parseInt(newQuantity) || 0);
    
    console.log(`[UI] Cart: Usuario cambió cantidad del item ${itemId} a ${quantity}`);
    
    // Llamar al callback del padre
    onChangeQuantity(itemId, quantity);
  };

  /**
   * Maneja la eliminación de un item
   * 
   * @param {Object} item - Item a eliminar
   */
  const handleRemoveItem = (item) => {
    if (!onRemoveItem || typeof onRemoveItem !== 'function') {
      // Si no hay callback de eliminación, poner cantidad en 0
      handleQuantityChange(item.id, 0);
      return;
    }

    console.log(`[UI] Cart: Usuario eliminó item ${item.name}`);
    onRemoveItem(item);
  };

  // Renderizado para carrito vacío
  if (!cartItems || cartItems.length === 0) {
    return (
      <section className={`cart empty ${className}`}>
        <h2>Carrito</h2>
        <div className="empty-cart-message" style={{ 
          padding: '20px', 
          textAlign: 'center', 
          color: '#666',
          fontStyle: 'italic',
          backgroundColor: '#f9f9f9',
          borderRadius: '4px',
          border: '1px dashed #ddd'
        }}>
          <p>Tu carrito está vacío</p>
          <small>Agrega productos para comenzar tu compra</small>
        </div>
      </section>
    );
  }

  return (
    <section className={`cart ${className}`}>
      <h2>Carrito</h2>
      
      <div className="cart-items">
        {cartItems.map(item => (
          <CartItem 
            key={item.id}
            item={item}
            onQuantityChange={(newQty) => handleQuantityChange(item.id, newQty)}
            onRemove={() => handleRemoveItem(item)}
            editable={editable}
          />
        ))}
      </div>

      {/* Subtotal del carrito */}
      {showSubtotal && (
        <CartSummary 
          subtotal={calculateDisplaySubtotal()}
          itemCount={cartItems.reduce((sum, item) => sum + (item.qty || 0), 0)}
        />
      )}
    </section>
  );
}

/**
 * Componente CartItem - Item individual del carrito
 * 
 * Renderiza un item del carrito con controles para modificar cantidad.
 * 
 * @param {Object} props - Props del componente
 * @param {Object} props.item - Item del carrito
 * @param {Function} props.onQuantityChange - Callback para cambiar cantidad
 * @param {Function} props.onRemove - Callback para eliminar item
 * @param {boolean} props.editable - Si el item es editable
 * @returns {JSX.Element} Item del carrito renderizado
 */
function CartItem({ item, onQuantityChange, onRemove, editable = true }) {
  const { id, name, price, qty, category } = item;
  const itemTotal = (price || 0) * (qty || 0);

  return (
    <div 
      className="cart-item"
      data-item-id={id}
      style={{ 
        display: 'flex', 
        gap: 8, 
        alignItems: 'center', 
        marginBottom: 8,
        padding: '12px',
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
        backgroundColor: '#fff'
      }}
    >
      {/* Información del producto */}
      <div className="item-info" style={{ flex: 1 }}>
        <div className="item-name" style={{ fontWeight: '500' }}>
          {name}
        </div>
        {category && (
          <div className="item-category" style={{ 
            fontSize: '0.8em', 
            color: '#888',
            fontStyle: 'italic'
          }}>
            {category}
          </div>
        )}
        <div className="item-unit-price" style={{ 
          fontSize: '0.9em', 
          color: '#666' 
        }}>
          {formatCurrency(price)} c/u
        </div>
      </div>

      {/* Control de cantidad */}
      {editable ? (
        <div className="quantity-controls" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px' 
        }}>
          <button 
            className="qty-decrease"
            onClick={() => onQuantityChange(Math.max(0, qty - 1))}
            disabled={qty <= 0}
            style={{
              padding: '4px 8px',
              backgroundColor: qty > 0 ? '#f44336' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: qty > 0 ? 'pointer' : 'not-allowed',
              fontSize: '0.9em'
            }}
            aria-label={`Disminuir cantidad de ${name}`}
          >
            -
          </button>
          
          <input
            type="number"
            min={0}
            value={qty || 0}
            onChange={(e) => onQuantityChange(e.target.value)}
            className="quantity-input"
            style={{ 
              width: 60, 
              textAlign: 'center',
              padding: '4px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
            aria-label={`Cantidad de ${name}`}
          />
          
          <button 
            className="qty-increase"
            onClick={() => onQuantityChange(qty + 1)}
            style={{
              padding: '4px 8px',
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9em'
            }}
            aria-label={`Aumentar cantidad de ${name}`}
          >
            +
          </button>
        </div>
      ) : (
        <div className="quantity-display" style={{ 
          padding: '8px 12px',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          minWidth: '60px',
          textAlign: 'center'
        }}>
          {qty}
        </div>
      )}

      {/* Precio total del item */}
      <div className="item-total" style={{ 
        fontWeight: 'bold',
        color: '#2e7d32',
        minWidth: '80px',
        textAlign: 'right'
      }}>
        {formatCurrency(itemTotal)}
      </div>

      {/* Botón eliminar */}
      {editable && onRemove && (
        <button 
          className="remove-item"
          onClick={onRemove}
          style={{
            padding: '4px 8px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.8em'
          }}
          aria-label={`Eliminar ${name} del carrito`}
          title="Eliminar item"
        >
          ✕
        </button>
      )}
    </div>
  );
}

/**
 * Componente CartSummary - Resumen del carrito
 * 
 * Muestra información resumida del carrito (subtotal, cantidad de items).
 * 
 * @param {Object} props - Props del componente
 * @param {number} props.subtotal - Subtotal del carrito
 * @param {number} props.itemCount - Cantidad total de items
 * @returns {JSX.Element} Resumen del carrito
 */
function CartSummary({ subtotal, itemCount }) {
  return (
    <div className="cart-summary" style={{
      marginTop: '16px',
      padding: '12px',
      backgroundColor: '#f5f5f5',
      borderRadius: '4px',
      border: '1px solid #e0e0e0'
    }}>
      <div className="summary-row" style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        marginBottom: '4px'
      }}>
        <span>Items en carrito:</span>
        <span style={{ fontWeight: '500' }}>
          {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
        </span>
      </div>
      
      <div className="summary-row" style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        fontSize: '1.1em',
        fontWeight: 'bold',
        color: '#2e7d32',
        borderTop: '1px solid #ddd',
        paddingTop: '8px'
      }}>
        <span>Subtotal:</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>
    </div>
  );
}

/**
 * Props por defecto para Cart
 */
Cart.defaultProps = {
  cartItems: [],
  showSubtotal: true,
  className: '',
  editable: true,
  onChangeQuantity: () => console.warn('Cart: No se proporcionó función onChangeQuantity')
};

/**
 * Exportaciones adicionales para testing y reutilización
 */
export { CartItem, CartSummary };