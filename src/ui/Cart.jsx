// src/ui/Cart.jsx
import React from "react";
import formatCurrency from "../utils/money";

export default function Cart({ cart, onChangeQty }) {
  return (
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
            onChange={e => onChangeQty(item.id, Number(e.target.value))}
            style={{ width: 60 }}
          />
          <span>@ {formatCurrency(item.price)}</span>
        </div>
      ))}
    </section>
  );
}
