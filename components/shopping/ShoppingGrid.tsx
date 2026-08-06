"use client";

import { useMemo, useState } from "react";
import type { Product } from "../../types/travel";
import { ShoppingCard } from "./ShoppingCard";

type ShoppingGridProps = {
  products: Product[];
  day: number;
  rate: number;
  onAddToCart: (product: Product) => void;
  onAskAi?: (product: Product) => void;
};

export function ShoppingGrid({ products, day, rate, onAddToCart, onAskAi }: ShoppingGridProps) {
  const [category, setCategory] = useState("全部");
  const [query, setQuery] = useState("");

  const categories = useMemo(() => ["全部", ...Array.from(new Set(products.map((product) => product.category)))], [products]);
  const visible = products.filter((product) => {
    const matchesDay = product.days.includes(day);
    const matchesCategory = category === "全部" || product.category === category;
    const searchable = `${product.name}${product.category}${product.note}`.toLowerCase();
    return matchesDay && matchesCategory && searchable.includes(query.toLowerCase());
  });

  return (
    <section className="shoppingPanel">
      <div className="sectionHead">
        <div><h2>🛍️ 今日購物推薦</h2><p>依 Day {day} 行程、價格、台灣價差與重量篩選。</p></div>
        <div className="shoppingFilters">
          <label>分類<select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>搜尋<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="商品名稱或類別" /></label>
        </div>
      </div>
      <div className="productGrid">{visible.map((product) => <ShoppingCard key={product.name} product={product} rate={rate} onAddToCart={onAddToCart} onAskAi={onAskAi} />)}</div>
      {visible.length === 0 && <div className="emptyPhoto">此日沒有符合條件的商品。</div>}
    </section>
  );
}
