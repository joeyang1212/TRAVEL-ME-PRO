"use client";

import type { CartItem } from "../../types/travel";

type ShoppingCartSummaryProps = {
  items: CartItem[];
  rate: number;
  budgetTwd: number;
  weightLimitKg: number;
  onRemove: (id: string) => void;
  onToggleBought: (id: string) => void;
};

export function ShoppingCartSummary({ items, rate, budgetTwd, weightLimitKg, onRemove, onToggleBought }: ShoppingCartSummaryProps) {
  const totalNzd = items.reduce((sum, item) => sum + item.qty * item.unitPriceNzd, 0);
  const totalTwd = Math.round(totalNzd * rate);
  const totalWeight = items.reduce((sum, item) => sum + item.qty * item.unitWeightKg, 0);

  return (
    <section className="cartSummaryPanel">
      <div className="sectionHead"><div><h2>🧺 購物車總覽</h2><p>同步估算台幣、預算與行李重量。</p></div></div>
      <div className="cartMetrics">
        <article><small>預估金額</small><strong>NT${totalTwd.toLocaleString()}</strong><span>NZ${totalNzd.toFixed(2)}</span></article>
        <article><small>剩餘預算</small><strong>NT${(budgetTwd-totalTwd).toLocaleString()}</strong></article>
        <article><small>預估重量</small><strong>{totalWeight.toFixed(2)} kg</strong><span>剩 {(weightLimitKg-totalWeight).toFixed(2)} kg</span></article>
      </div>
      <div className="cartList">{items.map((item) => <article key={item.id}>
        <label><input type="checkbox" checked={item.bought} onChange={() => onToggleBought(item.id)} />{item.name}</label>
        <span>{item.qty} × NZ${item.unitPriceNzd}</span>
        <button onClick={() => onRemove(item.id)}>移除</button>
      </article>)}</div>
      {items.length === 0 && <p className="emptyText">購物車目前是空的。</p>}
    </section>
  );
}
