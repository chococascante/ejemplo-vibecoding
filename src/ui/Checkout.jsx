// src/ui/Checkout.jsx
import React from "react";

export default function Checkout({
  isPremium,
  onPremiumChange,
  coupon,
  onCouponChange,
  region,
  onRegionChange,
  totalDisplay
}) {
  return (
    <section>
      <h2>Checkout</h2>
      <label>
        <input type="checkbox" checked={isPremium} onChange={onPremiumChange} />
        Usuario Premium (5%)
      </label>
      <div style={{ marginTop: 8 }}>
        <label> Cupón: </label>
        <select value={coupon} onChange={onCouponChange}>
          <option value="">(ninguno)</option>
          <option value="PROMO10">PROMO10 (-10% min 50)</option>
          <option value="FIJO20">FIJO20 (-$20 min 50)</option>
          <option value="BOGO_HALF">BOGO_HALF (2x1/2: 2do a mitad de precio)</option>
        </select>
      </div>
      <div style={{ marginTop: 8 }}>
        <label>Región: </label>
        <select value={region} onChange={onRegionChange}>
          <option value="CR">CR (13%)</option>
          <option value="US-CA">US-CA (7.25%)</option>
          <option value="US-TX">US-TX (6.25%)</option>
          <option value="TEST">TEST (0%)</option>
          <option value="OTRA">OTRA (10%)</option>
        </select>
      </div>
      <h3 style={{ marginTop: 16 }}>Total: {totalDisplay}</h3>
    </section>
  );
}
