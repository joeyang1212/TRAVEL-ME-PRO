"use client";

import { useMemo, useState } from "react";
import { ShoppingGrid } from "../shopping/ShoppingGrid";
import { ShoppingCartSummary } from "../shopping/ShoppingCartSummary";
import { WineDatabase } from "../wine/WineDatabase";
import { nzProducts } from "../../data/nz/products";
import { nzWines } from "../../data/nz/wines";
import type { CartItem, Product } from "../../types/travel";

export function ShoppingWinePreview() {
  const [day, setDay] = useState(7);
  const [rate, setRate] = useState(19.5);
  const [budget, setBudget] = useState(30000);
  const [weightLimit, setWeightLimit] = useState(8);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [aiMessage, setAiMessage] = useState("");

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart]);

  function addToCart(product: Product) {
    setCart((current) => {
      const existing = current.find((item) => item.name === product.name);
      if (existing) {
        return current.map((item) => item.id === existing.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...current, {
        id: crypto.randomUUID(),
        name: product.name,
        category: product.category,
        qty: 1,
        unitPriceNzd: product.nzdMin,
        unitWeightKg: product.weight,
        bought: false
      }];
    });
  }

  return (
    <main className="appShell">
      <section className="hero">
        <div>
          <small>ENGINEERING PREVIEW</small>
          <h1>Shopping + Wine 資料模組測試</h1>
          <p>商品與酒款已改由 data/nz 載入，畫面元件不再內嵌資料。</p>
        </div>
        <div className="summaryCards">
          <article><small>Day</small><strong>{day}</strong></article>
          <article><small>購物車</small><strong>{cartCount}</strong></article>
          <article><small>商品資料</small><strong>{nzProducts.length}</strong></article>
          <article><small>酒款資料</small><strong>{nzWines.length}</strong></article>
        </div>
      </section>

      <section className="toolsPanel">
        <div className="inputGrid">
          <label>Day<input type="number" min="1" max="11" value={day} onChange={(event) => setDay(Number(event.target.value))} /></label>
          <label>NZD/TWD<input type="number" step="0.1" value={rate} onChange={(event) => setRate(Number(event.target.value))} /></label>
          <label>購物預算 TWD<input type="number" value={budget} onChange={(event) => setBudget(Number(event.target.value))} /></label>
          <label>可用行李重量 kg<input type="number" step="0.1" value={weightLimit} onChange={(event) => setWeightLimit(Number(event.target.value))} /></label>
        </div>
      </section>

      <ShoppingGrid products={nzProducts} day={day} rate={rate} onAddToCart={addToCart} onAskAi={(product) => setAiMessage(`AI 購物顧問：${product.name}`)} />
      <ShoppingCartSummary items={cart} rate={rate} budgetTwd={budget} weightLimitKg={weightLimit} onRemove={(id) => setCart((items) => items.filter((item) => item.id !== id))} onToggleBought={(id) => setCart((items) => items.map((item) => item.id === id ? { ...item, bought: !item.bought } : item))} />
      <WineDatabase wines={nzWines} rate={rate} onAskAi={(wine) => setAiMessage(`AI 酒類顧問：${wine.name}`)} />

      {aiMessage && <section className="answer"><strong>{aiMessage}</strong><p>正式接線時會開啟現有 Gemini 分析視窗。</p><button onClick={() => setAiMessage("")}>關閉</button></section>}
    </main>
  );
}
