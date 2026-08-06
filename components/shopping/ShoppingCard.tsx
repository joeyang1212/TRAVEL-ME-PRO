"use client";

import type { Product } from "../../types/travel";

type ShoppingCardProps = {
  product: Product;
  rate: number;
  onAddToCart: (product: Product) => void;
  onAskAi?: (product: Product) => void;
};

export function ShoppingCard({ product, rate, onAddToCart, onAskAi }: ShoppingCardProps) {
  const averageNzd = (product.nzdMin + product.nzdMax) / 2;
  const estimatedTwd = Math.round(averageNzd * rate);
  const saving = product.twdRef - estimatedTwd;

  return (
    <article className="productCard">
      <div className="productCardHead">
        <div>
          <small>{product.category}</small>
          <h3>{product.name}</h3>
        </div>
        <strong>{"★".repeat(product.stars)}{"☆".repeat(Math.max(0, 5 - product.stars))}</strong>
      </div>
      <p>{product.note}</p>
      <div className="productPriceGrid">
        <span><b>紐西蘭</b>NZ${product.nzdMin}–{product.nzdMax}</span>
        <span><b>約台幣</b>NT${estimatedTwd.toLocaleString()}</span>
        <span><b>台灣參考</b>NT${product.twdRef.toLocaleString()}</span>
        <span><b>重量</b>{product.weight} kg</span>
      </div>
      <p className={saving > 0 ? "savingPositive" : "savingNeutral"}>
        {saving > 0 ? `估計可省 NT$${saving.toLocaleString()}` : "價差有限，建議看促銷再買"}
      </p>
      <div className="productActions">
        <button onClick={() => onAddToCart(product)}>加入購物車</button>
        {onAskAi && <button className="secondary" onClick={() => onAskAi(product)}>問 AI 是否值得買</button>}
      </div>
    </article>
  );
}
