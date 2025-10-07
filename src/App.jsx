import { useEffect, useState } from "react";
import { formatCurrency } from './utils/money';
import { info as logInfo, setLevel as setLogLevel } from './utils/log';
import { calcTotalNumber } from './domain/pricing';

// Simula "API"
async function fetchProducts() {
  return [
    { id: 1, name: 'Mouse', price: 20 },
    { id: 2, name: 'Teclado', price: 35 },
    { id: 3, name: 'Monitor', price: 150 },
  ];
}

// formatCurrency moved to src/utils/money.js

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
    logInfo('[INFO] addToCart', p.name);
    recalc(copy, isPremium, coupon, region);
  }

  function changeQty(id, qty) {
    const copy = cart.map(i => i.id === id ? { ...i, qty: Math.max(0, qty) } : i);
    setCart(copy);
    recalc(copy, isPremium, coupon, region);
  }

  function recalc(cartArg, premiumArg, couponArg, regionArg) {
    const result = calcTotalNumber(cartArg, premiumArg, couponArg, regionArg);

    if (result.appliedPremium) logInfo('[INFO] Premium -5%');
    if (result.appliedCoupon === 'PROMO10') logInfo('[INFO] Cupón PROMO10 -10%');
    else if (result.appliedCoupon === 'FIJO20') logInfo('[INFO] Cupón FIJO20 -$20');

    setTotalDisplay(formatCurrency(result.total));
    logInfo(`[INFO] Subtotal=${formatCurrency(result.subtotalAfterDiscounts)} Taxes=${formatCurrency(result.taxes)} Total=${formatCurrency(result.total)}`);
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
