import { formatMoney } from '../utils/money';

export default function ProductList({ products = [], onAdd }) {
  return (
    <section>
      <h2>Productos</h2>
      {products.map(p => (
        <div key={p.id} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <span>{p.name} — {formatMoney(p.price)}</span>
          <button onClick={() => onAdd(p)}>Agregar</button>
        </div>
      ))}
    </section>
  );
}
