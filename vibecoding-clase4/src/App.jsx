import { useEffect, useState } from "react";
import { formatMoney } from './utils/money';
import { logInfo, logError, logWarn } from './utils/log';
import { calcTotalNumber } from './domain/calculations';
import taxPolicies from './domain/policies/taxPolicy';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import Checkout from './components/Checkout';

let GLOBAL_LOG_LEVEL = 'info';

// Simula "API"
async function fetchProducts() {
  return [
    { id: 1, name: 'Mouse', price: 20 },
    { id: 2, name: 'Teclado', price: 35 },
    { id: 3, name: 'Monitor', price: 150 },
  ];
}

// ahora usamos formatMoney desde src/utils/money.js

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]); // [{id,name,price,qty}]
  const [region, setRegion] = useState('CR');
  const [coupon, setCoupon] = useState('');
  const [isPremium, setIsPremium] = useState(true);
  const [totalDisplay, setTotalDisplay] = useState(formatMoney(0));

  useEffect(() => {
    fetchProducts().then(setProducts);
  }, []);

  function addToCart(p) {
    const copy = cart.slice();
    const idx = copy.findIndex(i => i.id === p.id);
    if (idx >= 0) copy[idx].qty += 1;
    else copy.push({ ...p, qty: 1 });
    setCart(copy);
    if (GLOBAL_LOG_LEVEL === 'info') logInfo('addToCart', p.name);
    recalc(copy, isPremium, coupon, region);
  }

  function changeQty(id, qty) {
    const copy = cart.map(i => i.id === id ? { ...i, qty: Math.max(0, qty) } : i);
    setCart(copy);
    recalc(copy, isPremium, coupon, region);
  }

  function recalc(cartArg, premiumArg, couponArg, regionArg) {
  // mapear region a taxPolicy
  let policy = taxPolicies.DEFAULT;
  if (regionArg === 'CR') policy = taxPolicies.CR;
  else if (regionArg === 'US-CA' || regionArg === 'US-TX' || regionArg === 'US') policy = taxPolicies.US;
  else if (regionArg === 'MX') policy = taxPolicies.MX;

  const result = calcTotalNumber(cartArg, premiumArg, couponArg, policy);

    // mantener logs en la capa de presentación
    if (result.userDiscountApplied) logInfo('Premium -5%');
    if (result.couponApplied === 'PROMO10') logInfo('Cupón PROMO10 -10%');
    else if (result.couponApplied === 'FIJO20') logInfo('Cupón FIJO20 -$20');

    setTotalDisplay(formatMoney(result.total));
    logInfo(`Subtotal=${formatMoney(result.subtotal)} Taxes=${formatMoney(result.taxes)} Total=${formatMoney(result.total)}`);
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
      <h1>Tienda (versión mala, lista para refactor)</h1>

      <div style={{ display: 'flex', gap: 24 }}>
        <ProductList products={products} onAdd={addToCart} />

        <Cart items={cart} onChangeQty={changeQty} />

        <Checkout
          isPremium={isPremium}
          onTogglePremium={handlePremium}
          coupon={coupon}
          onChangeCoupon={handleCoupon}
          region={region}
          onChangeRegion={handleRegion}
          totalDisplay={totalDisplay}
          onConfirm={() => logInfo('Compra confirmada')}
        />
      </div>
    </div>
  );
}
