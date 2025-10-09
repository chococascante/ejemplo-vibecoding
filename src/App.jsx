import { useEffect, useMemo, useState } from "react";
import { formatCurrency } from "./utils/money";
import { logger, setLogLevel } from "./utils/log";
import { calcTotalNumber, defaultTaxPolicy } from "./domain/pricing";
import ProductList from "./components/ProductList";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";

/**
 * @typedef {Object} Product
 * @property {number} id Identificador del producto.
 * @property {string} name Nombre del producto.
 * @property {number} price Precio unitario en USD.
 */

/**
 * @typedef {Object} CartItem
 * @property {number} id Identificador del producto.
 * @property {string} name Nombre del producto.
 * @property {number} price Precio unitario en USD.
 * @property {number} qty Cantidad en el carrito.
 */

// Simula "API"
/**
 * Recupera el catálogo de productos (simulado).
 * @returns {Promise<Product[]>} Promesa que resuelve con la lista de productos.
 * @example
 * const productos = await fetchProducts();
 * console.log(productos[0].name);
 */
async function fetchProducts() {
  return [
    { id: 1, name: 'Mouse', price: 20 },
    { id: 2, name: 'Teclado', price: 35 },
    { id: 3, name: 'Monitor', price: 150 },
  ];
}

// Funciones puras movidas a domain/pricing

// Configura el nivel de logging una sola vez.
setLogLevel('info');

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]); // cart: Array of {id, name, price, qty}
  const [region, setRegion] = useState('CR');
  const [coupon, setCoupon] = useState('');
  const [isPremium, setIsPremium] = useState(true);
  const [taxPolicyKind, setTaxPolicyKind] = useState('DEFAULT'); // DEFAULT | GLOBAL_8 | CUSTOM
  const [taxPolicyJSON, setTaxPolicyJSON] = useState(JSON.stringify(defaultTaxPolicy, null, 2));
  const [taxPolicyError, setTaxPolicyError] = useState('');

  useEffect(() => {
    fetchProducts().then(setProducts);
  }, []);

  /**
   * Resuelve la política de impuestos activa en base al selector de UI.
   * Si el modo es CUSTOM, intenta parsear el JSON y valida que sea un objeto.
   * @returns {{taxPolicy: any, policyError: string}}
   */
  const { taxPolicy, policyError } = useMemo(() => {
    // Resolver taxPolicy y validar JSON si aplica
    if (taxPolicyKind === 'GLOBAL_8') {
      return { taxPolicy: { DEFAULT: 0.08 }, policyError: '' };
    }
    if (taxPolicyKind === 'CUSTOM') {
      try {
        const obj = JSON.parse(taxPolicyJSON);
        if (obj && typeof obj === 'object') return { taxPolicy: obj, policyError: '' };
        return { taxPolicy: defaultTaxPolicy, policyError: 'El JSON debe ser un objeto con tasas por región.' };
      } catch (e) {
        logger.warn('[WARN] JSON de taxPolicy inválido, usando DEFAULT');
        return { taxPolicy: defaultTaxPolicy, policyError: 'JSON inválido. Usando política por defecto.' };
      }
    }
    return { taxPolicy: defaultTaxPolicy, policyError: '' };
  }, [taxPolicyKind, taxPolicyJSON]);

  useEffect(() => {
    setTaxPolicyError(policyError);
  }, [policyError]);

  // Derivar totales reactivamente según estado y política
  /**
   * Calcula los totales (subtotal, descuentos, impuestos y total final) de forma pura.
   * @returns {{subtotal:number, afterUserDiscount:number, afterCoupons:number, taxes:number, total:number}}
   * @example
   * // Muestra el total formateado
   * formatCurrency(totals.total)
   */
  const totals = useMemo(() => {
    return calcTotalNumber(cart, { isPremium, coupon, region, taxPolicy });
  }, [cart, isPremium, coupon, region, taxPolicy]);

  // Logging del breakdown cuando cambian los totales
  useEffect(() => {
    if (!totals) return;
    if (isPremium) {
      logger.info('[INFO] Premium -5%');
    }
    if (coupon === 'PROMO10' && totals.afterUserDiscount >= 50) {
      logger.info('[INFO] Cupón PROMO10 -10%');
    } else if (coupon === 'FIJO20' && totals.afterUserDiscount >= 50) {
      logger.info('[INFO] Cupón FIJO20 -$20');
    }
    logger.info(`[INFO] Subtotal=${formatCurrency(totals.afterCoupons)} Taxes=${formatCurrency(totals.taxes)} Total=${formatCurrency(totals.total)}`);
  }, [totals, isPremium, coupon]);

  /**
   * Agrega un producto al carrito o incrementa su cantidad.
   * @param {Product} p Producto a agregar.
   * @returns {void}
   * @example
   * addToCart({ id: 1, name: 'Mouse', price: 20 })
   */
  function addToCart(p) {
    setCart(prev => {
      const idx = prev.findIndex(i => i.id === p.id);
      if (idx >= 0) {
        const next = prev.slice();
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [...prev, { ...p, qty: 1 }];
    });
    logger.info('[INFO] addToCart', p.name);
  }

  /**
   * Cambia la cantidad de un ítem del carrito y elimina si la cantidad es 0.
   * @param {number} id ID del producto en el carrito.
   * @param {number} qty Nueva cantidad (>= 0).
   * @returns {void}
   * @example
   * changeQty(2, 3) // pone el producto 2 con qty 3
   */
  function changeQty(id, qty) {
    setCart(prev => prev
      .map(i => i.id === id ? { ...i, qty: Math.max(0, qty) } : i)
      .filter(i => i.qty > 0)
    );
  }


  /**
   * Handler para alternar el modo premium (5% descuento).
   * @param {React.ChangeEvent<HTMLInputElement>} e Evento del checkbox.
   */
  function handlePremium(e) {
    setIsPremium(e.target.checked);
  }
  /**
   * Handler para cambiar el cupón aplicado.
   * @param {React.ChangeEvent<HTMLSelectElement>} e Evento del select de cupones.
   */
  function handleCoupon(e) {
    setCoupon(e.target.value);
  }
  /**
   * Handler para cambiar la región que determina la tasa de impuestos.
   * @param {React.ChangeEvent<HTMLSelectElement>} e Evento del select de región.
   */
  function handleRegion(e) {
    setRegion(e.target.value);
  }

  /**
   * Handler para cambiar el tipo de política de impuestos (DEFAULT | GLOBAL_8 | CUSTOM).
   * @param {React.ChangeEvent<HTMLSelectElement>} e Evento del select de política.
   */
  function handleTaxPolicyKind(e) {
    const kind = e.target.value;
    setTaxPolicyKind(kind);
  }

  /**
   * Handler para actualizar el JSON de la política de impuestos personalizada.
   * @param {React.ChangeEvent<HTMLTextAreaElement>} e Evento del textarea.
   */
  function handleTaxPolicyJSON(e) {
    setTaxPolicyJSON(e.target.value);
  }

  return (
    <div className="app">
      <div className="header-bar">
        <h1>Tienda</h1>
        <small className="muted">Demo de precios con políticas de impuestos</small>
      </div>
      <div className="layout">
        <ProductList products={products} onAdd={addToCart} />
        <Cart cart={cart} onChangeQty={changeQty} />
        <Checkout
          isPremium={isPremium}
          onTogglePremium={handlePremium}
          coupon={coupon}
          onChangeCoupon={handleCoupon}
          region={region}
          onChangeRegion={handleRegion}
          total={totals.total}
          taxPolicyKind={taxPolicyKind}
          onChangeTaxPolicyKind={handleTaxPolicyKind}
          taxPolicyJSON={taxPolicyJSON}
          onChangeTaxPolicyJSON={handleTaxPolicyJSON}
          taxPolicyError={taxPolicyError}
        />
      </div>
    </div>
  );
}
