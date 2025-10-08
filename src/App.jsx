import { useEffect, useState } from "react";
import { formatCurrency } from "./utils/money.js";
import { setLogLevel, LOG_LEVELS, logCartOperation, logInfo } from "./utils/log.js";
import { calcTotalNumber } from "./domain/checkout.js";

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

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]); // cart: Array of {id, name, price, qty}
  const [region, setRegion] = useState('CR');
  const [coupon, setCoupon] = useState('');
  const [isPremium, setIsPremium] = useState(true);
  const [totalDisplay, setTotalDisplay] = useState('$0.00');

  useEffect(() => {
    fetchProducts().then(setProducts);
  }, []);

  function addToCart(p) {
    const copy = cart.slice();
    const idx = copy.findIndex(i => i.id === p.id);
    if (idx >= 0) copy[idx].qty += 1;
    else copy.push({ ...p, qty: 1 });
    setCart(copy);
    
    // Usar el sistema de logging centralizado
    logCartOperation('add', p.name, { productId: p.id, price: p.price });
    
    recalc(copy, isPremium, coupon, region);
  }

  function changeQty(id, qty) {
    const copy = cart.map(i => i.id === id ? { ...i, qty: Math.max(0, qty) } : i);
    setCart(copy);
    recalc(copy, isPremium, coupon, region);
  }

  function recalc(cartArg, premiumArg, couponArg, regionArg) {
    // Usar la función orquestadora del dominio
    const calculation = calcTotalNumber(cartArg, premiumArg, couponArg, regionArg);
    
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

  function handlePremium(e) {
    setIsPremium(e.target.checked);
    recalc(cart, e.target.checked, coupon, region);
  }
  function handleCoupon(e) {
    setCoupon(e.target.value);
    recalc(cart, isPremium, e.target.value, region);
  }
  function handleRegion(e) {
    setRegion(e.target.value);
    recalc(cart, isPremium, coupon, e.target.value);
  }

  return (
    <div style={{ padding: 16, fontFamily: 'system-ui' }}>
      <h1>Tienda</h1>

      <div style={{ display: 'flex', gap: 24 }}>
        <section>
          <h2>Productos</h2>
          {products.map(p => (
            <div key={p.id} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <span>{p.name} — {formatCurrency(p.price)}</span>
              <button onClick={() => addToCart(p)}>Agregar</button>
            </div>
          ))}
        </section>

        <section>
          <h2>Carrito</h2>
          {cart.length === 0 && <p>(vacío)</p>}
          {cart.map(item => (
            <div key={item.id} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <span>{item.name}</span>
              <input
                type="number"
                min={0}
                value={item.qty}
                onChange={e => changeQty(item.id, Number(e.target.value))}
                style={{ width: 60 }}
              />
              <span>@ {formatCurrency(item.price)}</span>
            </div>
          ))}
        </section>

        <section>
          <h2>Checkout</h2>
          <label>
            <input type="checkbox" checked={isPremium} onChange={handlePremium} />
            Usuario Premium (5%)
          </label>
          <div style={{ marginTop: 8 }}>
            <label> Cupón: </label>
            <select value={coupon} onChange={handleCoupon}>
              <option value="">(ninguno)</option>
              <option value="PROMO10">PROMO10 (-10% min 50)</option>
              <option value="FIJO20">FIJO20 (-$20 min 50)</option>
            </select>
          </div>
          <div style={{ marginTop: 8 }}>
            <label>Región: </label>
            <select value={region} onChange={handleRegion}>
              <option value="CR">CR (13%)</option>
              <option value="US-CA">US-CA (7.25%)</option>
              <option value="US-TX">US-TX (6.25%)</option>
              <option value="OTRA">OTRA (10%)</option>
            </select>
          </div>

          <h3 style={{ marginTop: 16 }}>Total: {totalDisplay}</h3>
        </section>
      </div>
    </div>
  );
}
