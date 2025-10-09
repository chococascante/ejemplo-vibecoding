import { formatCurrency } from "../utils/money";

/**
 * @typedef {Object} CartItem
 * @property {number} id
 * @property {string} name
 * @property {number} price
 * @property {number} qty
 */

/**
 * Carrito de compras.
 * @param {{
 *  cart: CartItem[],
 *  onChangeQty: (id: number, qty: number) => void,
 * }} props
 * @example
 * <Cart cart={[{id:1,name:'Mouse',price:20,qty:2}]} onChangeQty={(id,qty)=>console.log(id,qty)} />
 */
export default function Cart({ cart, onChangeQty }) {
  return (
    <section className="panel">
      <h2>Carrito</h2>
      {cart.length === 0 && <p className="muted">(vacío)</p>}
      {cart.map(item => (
        <div key={item.id} className="row">
          <span>{item.name}</span>
          <input
            className="input qty-input"
            type="number"
            min={0}
            value={item.qty}
            onChange={e => onChangeQty(item.id, Number(e.target.value))}
          />
          <span className="muted">@ {formatCurrency(item.price)}</span>
        </div>
      ))}
    </section>
  );
}
