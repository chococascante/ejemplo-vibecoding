import { formatCurrency } from "../utils/money";

/**
 * Checkout del pedido.
 * @param {{
 *  isPremium: boolean,
 *  onTogglePremium: (e: React.ChangeEvent<HTMLInputElement>) => void,
 *  coupon: string,
 *  onChangeCoupon: (e: React.ChangeEvent<HTMLSelectElement>) => void,
 *  region: string,
 *  onChangeRegion: (e: React.ChangeEvent<HTMLSelectElement>) => void,
 *  total: number,
 *  taxPolicyKind: 'DEFAULT'|'GLOBAL_8'|'CUSTOM',
 *  onChangeTaxPolicyKind: (e: React.ChangeEvent<HTMLSelectElement>) => void,
 *  taxPolicyJSON: string,
 *  onChangeTaxPolicyJSON: (e: React.ChangeEvent<HTMLTextAreaElement>) => void,
 *  taxPolicyError: string,
 * }} props
 * @example
 * <Checkout isPremium={true} onTogglePremium={()=>{}} coupon="" onChangeCoupon={()=>{}} region="CR" onChangeRegion={()=>{}} total={100} taxPolicyKind="DEFAULT" onChangeTaxPolicyKind={()=>{}} taxPolicyJSON="{}" onChangeTaxPolicyJSON={()=>{}} taxPolicyError="" />
 */
export default function Checkout({
  isPremium,
  onTogglePremium,
  coupon,
  onChangeCoupon,
  region,
  onChangeRegion,
  total,
  taxPolicyKind,
  onChangeTaxPolicyKind,
  taxPolicyJSON,
  onChangeTaxPolicyJSON,
  taxPolicyError,
}) {
  return (
    <section className="panel">
      <h2>Checkout</h2>
      <label className="row" style={{ paddingLeft: 0 }}>
        <input type="checkbox" checked={isPremium} onChange={onTogglePremium} />
        Usuario Premium (5%)
      </label>
      <div className="form-group">
        <label> Cupón </label>
        <select className="input" value={coupon} onChange={onChangeCoupon}>
          <option value="">(ninguno)</option>
          <option value="PROMO10">PROMO10 (-10% min 50)</option>
          <option value="FIJO20">FIJO20 (-$20 min 50)</option>
        </select>
      </div>
      <div className="form-group">
        <label>Región</label>
        <select className="input" value={region} onChange={onChangeRegion}>
          <option value="CR">CR (13%)</option>
          <option value="US-CA">US-CA (7.25%)</option>
          <option value="US-TX">US-TX (6.25%)</option>
          <option value="OTRA">OTRA (10%)</option>
          <option value="TEST">TEST (0%)</option>
        </select>
      </div>

      <div className="form-group">
        <label>Política de impuestos</label>
        <select className="input" value={taxPolicyKind} onChange={onChangeTaxPolicyKind}>
          <option value="DEFAULT">Predeterminada</option>
          <option value="GLOBAL_8">Global 8%</option>
          <option value="CUSTOM">Custom (JSON)</option>
        </select>
      </div>
      {taxPolicyKind === 'CUSTOM' && (
        <div className="form-group">
          <label>JSON política</label>
          <textarea
            className="input"
            value={taxPolicyJSON}
            onChange={onChangeTaxPolicyJSON}
            rows={6}
            style={{ fontFamily: 'monospace' }}
          />
          {taxPolicyError && (
            <div className="error">
              {taxPolicyError}
            </div>
          )}
          <small className="muted">Formato: {`{ "CR": 0.13, "US-CA": 0.0725, "DEFAULT": 0.1 }`}</small>
        </div>
      )}

      <div className="total">
        <strong>Total: {formatCurrency(total)}</strong>
      </div>
    </section>
  );
}
