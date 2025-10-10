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
      <section className={`product-list-container ${className}`}>
        <header className="product-list-header">
          <h2 className="product-list-title">📦 Productos</h2>
        </header>
        <div className="product-list-loading">
          <div className="product-list-loading-spinner"></div>
          <div>Cargando productos...</div>
          <small>Esto puede tomar unos segundos</small>
        </div>
      </section>
    );
  }

  // RETO C: Renderizado para estado de error
  if (error) {
    return (
      <section className={`product-list-container ${className}`}>
        <header className="product-list-header">
          <h2 className="product-list-title">📦 Productos</h2>
        </header>
        <div className="product-list-error">
          <div className="product-list-error-title">Error cargando productos</div>
          <div className="product-list-error-message">{error}</div>
          {onRetry && (
            <button 
              onClick={onRetry}
              className="product-add-button mt-4"
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
      <section className={`product-list-container ${className}`}>
        <header className="product-list-header">
          <h2 className="product-list-title">📦 Productos</h2>
        </header>
        <div className="product-list-empty">
          <div className="product-list-empty-icon">📦</div>
          <div className="product-list-empty-title">No hay productos disponibles</div>
          <div className="product-list-empty-message">Los productos se cargarán pronto</div>
        </div>
      </section>
    );
  }

  return (
    <section className={`product-list-container ${className}`}>
      <header className="product-list-header">
        <h2 className="product-list-title">📦 Productos</h2>
      </header>
      <div className="product-list-grid">
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
    <article 
      className={`product-item ${!inStock ? 'product-item-out-of-stock' : ''}`}
      data-product-id={id}
    >
      {/* Información del producto */}
      <div className="product-info">
        <h3 className="product-name">{name}</h3>
        {description && (
          <p className="product-description">{description}</p>
        )}
        {category && (
          <span className="product-category">{category}</span>
        )}
      </div>

      {/* Footer con precio y botón */}
      <div className="product-footer">
        <div className="product-price">
          <span>{formatCurrency(price)}</span>
          <span className="product-price-currency">USD</span>
        </div>

        {/* Botón agregar */}
        <button 
          className="product-add-button"
          onClick={onAdd}
          disabled={!inStock}
          aria-label={`Agregar ${name} al carrito`}
        >
          {inStock ? 'Agregar' : 'Agotado'}
        </button>
      </div>
    </article>
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