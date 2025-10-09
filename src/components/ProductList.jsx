/**
 * Componente ProductList - Lista de productos disponibles
 * 
 * Este componente se encarga de mostrar la lista de productos disponibles
 * y permite a los usuarios agregar items al carrito. Implementa la separación
 * de responsabilidades manteniendo la UI separada de la lógica de negocio.
 * 
 * JUSTIFICACIÓN DE LA SEPARACIÓN:
 * - MODULARIDAD: Componente especializado solo en mostrar productos
 * - REUTILIZACIÓN: Puede reutilizarse en otros contextos (catálogo, búsqueda)
 * - MANTENIBILIDAD: Cambios en la UI de productos no afectan otros componentes
 * - TESTING: Fácil testing aislado del componente de productos
 * - RESPONSABILIDAD ÚNICA: Solo se encarga de la presentación de productos
 * 
 * @module ProductList
 * @version 1.0.0
 * @author Juan Alberto Quiros Gonzalez
 */

import { formatCurrency } from '../utils/money.js';
import { logCartOperation } from '../utils/log.js';

/**
 * Componente ProductList
 * 
 * RETO C ACTUALIZADO: Manejo de estados de carga y error del servicio de catálogo
 * 
 * Renderiza una lista de productos con botones para agregar al carrito.
 * Recibe productos y función de callback como props para mantener
 * la separación entre UI y lógica de estado.
 * 
 * @param {Object} props - Props del componente
 * @param {Array<Object>} props.products - Lista de productos disponibles
 * @param {Function} props.onAddToCart - Callback para agregar producto al carrito
 * @param {boolean} props.loading - Indica si los productos están cargando
 * @param {string} props.error - Mensaje de error si hubo problema cargando
 * @param {Function} props.onRetry - Callback para reintentar carga
 * @param {string} props.className - Clases CSS adicionales (opcional)
 * @returns {JSX.Element} Componente renderizado
 * 
 * @example
 * <ProductList 
 *   products={products}
 *   onAddToCart={handleAddToCart}
 *   loading={isLoading}
 *   error={errorMessage}
 *   onRetry={retryFunction}
 * />
 */
export default function ProductList({ 
  products = [], 
  onAddToCart, 
  loading = false, 
  error = null,
  onRetry,
  className = '' 
}) {
  /**
   * Maneja el click en el botón "Agregar"
   * 
   * @param {Object} product - Producto a agregar
   */
  const handleAddClick = (product) => {
    if (!onAddToCart || typeof onAddToCart !== 'function') {
      console.warn('ProductList: onAddToCart prop no es una función válida');
      return;
    }

    // Validar producto antes de agregarlo
    if (!product || !product.id || !product.name || typeof product.price !== 'number') {
      console.warn('ProductList: Producto inválido', product);
      return;
    }

    // Log de la acción de UI (separado de la lógica de negocio)
    console.log(`[UI] ProductList: Usuario clickeó agregar producto ${product.name}`);
    
    // Llamar al callback del padre
    onAddToCart(product);
  };

  // RETO C: Renderizado condicional para estado de carga
  if (loading) {
    return (
      <section className={`product-list loading ${className}`}>
        <h2>Productos</h2>
        <div className="loading-message" style={{ 
          padding: '20px', 
          textAlign: 'center', 
          color: '#1976d2',
          fontStyle: 'italic',
          backgroundColor: '#f3f8ff',
          borderRadius: '4px',
          border: '1px solid #e3f2fd'
        }}>
          <div style={{ fontSize: '1.2em', marginBottom: '8px' }}>🔄</div>
          <div>Cargando productos...</div>
          <div style={{ fontSize: '0.9em', marginTop: '4px', color: '#666' }}>
            Esto puede tomar unos segundos
          </div>
        </div>
      </section>
    );
  }

  // RETO C: Renderizado para estado de error
  if (error) {
    return (
      <section className={`product-list error ${className}`}>
        <h2>Productos</h2>
        <div className="error-message" style={{ 
          padding: '20px', 
          textAlign: 'center', 
          color: '#d32f2f',
          backgroundColor: '#ffebee',
          borderRadius: '4px',
          border: '1px solid #f44336'
        }}>
          <div style={{ fontSize: '1.2em', marginBottom: '8px' }}>❌</div>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
            Error cargando productos
          </div>
          <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '12px' }}>
            {error}
          </div>
          {onRetry && (
            <button 
              onClick={onRetry}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9em'
              }}
            >
              🔄 Reintentar
            </button>
          )}
        </div>
      </section>
    );
  }

  // Renderizado para lista vacía
  if (!products || products.length === 0) {
    return (
      <section className={`product-list empty ${className}`}>
        <h2>Productos</h2>
        <div className="empty-message" style={{ 
          padding: '20px', 
          textAlign: 'center', 
          color: '#666',
          fontStyle: 'italic' 
        }}>
          No hay productos disponibles
        </div>
      </section>
    );
  }

  return (
    <section className={`product-list ${className}`}>
      <h2>Productos</h2>
      <div className="products-grid">
        {products.map(product => (
          <ProductItem 
            key={product.id}
            product={product}
            onAdd={() => handleAddClick(product)}
          />
        ))}
      </div>
    </section>
  );
}

/**
 * Componente ProductItem - Item individual de producto
 * 
 * Componente hijo que renderiza un producto individual.
 * Separado para facilitar la customización y reutilización.
 * 
 * @param {Object} props - Props del componente
 * @param {Object} props.product - Datos del producto
 * @param {Function} props.onAdd - Callback para agregar al carrito
 * @returns {JSX.Element} Item de producto renderizado
 */
function ProductItem({ product, onAdd }) {
  const { id, name, price, description, category, inStock = true } = product;

  return (
    <div 
      className={`product-item ${!inStock ? 'out-of-stock' : ''}`}
      data-product-id={id}
      style={{ 
        display: 'flex', 
        gap: 8, 
        alignItems: 'center', 
        marginBottom: 8,
        padding: '8px',
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
        backgroundColor: inStock ? '#fff' : '#f5f5f5'
      }}
    >
      {/* Información del producto */}
      <div className="product-info" style={{ flex: 1 }}>
        <span className="product-name" style={{ fontWeight: '500' }}>
          {name}
        </span>
        {description && (
          <span className="product-description" style={{ 
            fontSize: '0.9em', 
            color: '#666',
            marginLeft: '8px'
          }}>
            ({description})
          </span>
        )}
        {category && (
          <span className="product-category" style={{ 
            fontSize: '0.8em', 
            color: '#888',
            marginLeft: '8px',
            fontStyle: 'italic'
          }}>
            [{category}]
          </span>
        )}
      </div>

      {/* Precio */}
      <span className="product-price" style={{ 
        fontWeight: 'bold',
        color: '#2e7d32',
        minWidth: '80px',
        textAlign: 'right'
      }}>
        {formatCurrency(price)}
      </span>

      {/* Botón agregar */}
      <button 
        className="add-to-cart-btn"
        onClick={onAdd}
        disabled={!inStock}
        style={{
          padding: '6px 12px',
          backgroundColor: inStock ? '#1976d2' : '#ccc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: inStock ? 'pointer' : 'not-allowed',
          fontSize: '0.9em',
          minWidth: '80px'
        }}
        aria-label={`Agregar ${name} al carrito`}
      >
        {inStock ? 'Agregar' : 'Agotado'}
      </button>
    </div>
  );
}

/**
 * Props por defecto para ProductList
 */
ProductList.defaultProps = {
  products: [],
  loading: false,
  className: '',
  onAddToCart: () => console.warn('ProductList: No se proporcionó función onAddToCart')
};

/**
 * Exportaciones adicionales para testing y reutilización
 */
export { ProductItem };