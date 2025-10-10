

import { useEffect, useState } from "react";


import formatCurrency from "./utils/money";
import { GLOBAL_LOG_LEVEL, logInfo } from "./utils/log";

import { computeSubTotal } from "./domain/subtotal";
import { applyUserDiscounts } from "./domain/discounts";
import { applyCoupons } from "./domain/coupons";
import { computeTaxes } from "./domain/taxes";
import ProductList from "./ui/ProductList";
import Cart from "./ui/Cart";
import Checkout from "./ui/Checkout";



import { fetchProducts } from "./services/catalog";




export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]); // cart: Array of {id, name, price, qty}
  const [region, setRegion] = useState('CR');
  const [coupon, setCoupon] = useState('');
  const [isPremium, setIsPremium] = useState(true);
  const [totalDisplay, setTotalDisplay] = useState('$0.00');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchProducts()
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Error al cargar productos');
        setLoading(false);
      });
  }, []);

  function addToCart(p) {
    const copy = cart.slice();
    const idx = copy.findIndex(i => i.id === p.id);
    if (idx >= 0) copy[idx].qty += 1;
    else copy.push({ ...p, qty: 1 });
    setCart(copy);
  logInfo('addToCart', p.name);
    recalc(copy, isPremium, coupon, region);
  }

  function changeQty(id, qty) {
    const copy = cart.map(i => i.id === id ? { ...i, qty: Math.max(0, qty) } : i);
    setCart(copy);
    recalc(copy, isPremium, coupon, region);
  }



  function calcTotalNumber(cartArg, premiumArg, couponArg, regionArg) {
    let subtotal = computeSubTotal(cartArg);
    subtotal = applyUserDiscounts(subtotal, premiumArg);
    subtotal = applyCoupons(subtotal, couponArg, cartArg);
    const taxes = computeTaxes(subtotal, regionArg);
    let total = subtotal + taxes;
    total = Math.round(total * 100) / 100;
    return { total, subtotal, taxes };
  }

  function recalc(cartArg, premiumArg, couponArg, regionArg) {
    const { total, subtotal, taxes } = calcTotalNumber(cartArg, premiumArg, couponArg, regionArg);
    setTotalDisplay(formatCurrency(total));
    logInfo(`Subtotal=${formatCurrency(subtotal)} Taxes=${formatCurrency(taxes)} Total=${formatCurrency(total)}`);
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
      {loading ? (
        <p>Cargando...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <div style={{ display: 'flex', gap: 24 }}>
          <ProductList products={products} onAddToCart={addToCart} />
          <Cart cart={cart} onChangeQty={changeQty} />
          <Checkout
            isPremium={isPremium}
            onPremiumChange={handlePremium}
            coupon={coupon}
            onCouponChange={handleCoupon}
            region={region}
            onRegionChange={handleRegion}
            totalDisplay={totalDisplay}
          />
        </div>
      )}
    </div>
  );
}
