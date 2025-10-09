import { formatCurrency } from "../utils/money";

/**
 * @typedef {Object} Product
 * @property {number} id
 * @property {string} name
 * @property {number} price
 */

/**
 * Lista de productos.
 * @param {{
 *  products: Product[],
 *  onAdd: (p: Product) => void,
 * }} props
 * @example
 * <ProductList products={[{id:1,name:'Mouse',price:20}]} onAdd={(p)=>console.log(p)} />
 */
export default function ProductList({ products, onAdd }) {
  return (
    <section className="panel">
      <h2>Productos</h2>
      {products.map(p => (
        <div key={p.id} className="row">
          <span>
            {p.name} — <span className="price">{formatCurrency(p.price)}</span>
          </span>
          <span className="spacer" />
          <button className="btn btn-primary" onClick={() => onAdd(p)}>Agregar</button>
        </div>
      ))}
    </section>
  );
}
