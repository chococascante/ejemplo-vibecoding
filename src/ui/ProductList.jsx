// src/ui/ProductList.jsx
import React from "react";
import formatCurrency from "../utils/money";

export default function ProductList({ products, onAddToCart }) {
  return (
    <section>
      <h2>Productos</h2>
      {products.map(p => (
        <div key={p.id} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <span>{p.name} — {formatCurrency(p.price)}</span>
          <button onClick={() => onAddToCart(p)}>Agregar</button>
        </div>
      ))}
    </section>
  );
}
