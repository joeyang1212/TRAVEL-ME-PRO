"use client";

import { useMemo, useState } from "react";
import { ShoppingGrid } from "../shopping/ShoppingGrid";
import { ShoppingCartSummary } from "../shopping/ShoppingCartSummary";
import { WineDatabase } from "../wine/WineDatabase";
import type { CartItem, Product, Wine } from "../../types/travel";

const previewProducts: Product[] = [
  { name: "Whittaker's 巧克力", category: "巧克力", nzdMin: 5.5, nzdMax: 8.5, twdRef: 260, weight: 0.25, stars: 5, note: "超市常見，適合大量送禮。", days: [1,2,7,9,10] },
  { name: "麥蘆卡蜂蜜", category: "蜂蜜", nzdMin: 25, nzdMax: 95, twdRef: 2200, weight: 0.5, stars: 5, note: "先看 UMF/MGO 等級與包裝重量。", days: [1,7,9,10] },
  { name: "Icebreaker 美麗諾羊毛", category: "服飾", nzdMin: 70, nzdMax: 220, twdRef: 4800, weight: 0.35, stars: 5, note: "試穿後再買，折扣店價差較明顯。", days: [1,7,9,10] },
  { name: "Cookie Time", category: "餅乾", nzdMin: 4, nzdMax: 12, twdRef: 350, weight: 0.4, stars: 4, note: "Queenstown 專門店適合補貨。", days: [7,9] }
];

const previewWines: Wine[] = [
  { name: "Cloudy Bay Sauvignon Blanc", region: "Marlborough", style: "Sauvignon Blanc", nzdMin: 38, nzdMax: 52, gift: "送禮辨識度高", note: "清爽酸度與熱帶水果風格。" },
  { name: "Felton Road Bannockburn Pinot Noir", region: "Central Otago", style: "Pinot Noir", nzdMin: 65, nzdMax: 95, gift: "適合重要送禮", note: "細緻果香與礦物感，適合牛排與羊排。" },
  { name: "Rippon Mature Vine Pinot Noir", region: "Wānaka", style: "Pinot Noir", nzdMin: 70, nzdMax: 100, gift: "酒莊特色鮮明", note: "Wānaka 代表酒款之一。" },
  { name: "Quartz Reef Méthode Traditionnelle", region: "Central Otago", style: "Sparkling", nzdMin: 35, nzdMax: 55, gift: "聚會與送禮皆適合", note: "傳統法氣泡酒，酸度清爽。" }
];

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
      if (existing) return current.map((item) => item.id === existing.id ? { ...item, qty: item.qty + 1 } : item);
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
        <div><small>ENGINEERING PREVIEW</small><h1>Shopping + Wine 模組接線測試</h1><p>此頁用來驗證獨立元件、購物車狀態與篩選功能，不影響正式首頁。</p></div>
        <div className="summaryCards">
          <article><small>Day</small><strong>{day}</strong></article>
          <article><small>購物車</small><strong>{cartCount}</strong></article>
          <article><small>匯率</small><strong>{rate}</strong></article>
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

      <ShoppingGrid products={previewProducts} day={day} rate={rate} onAddToCart={addToCart} onAskAi={(product) => setAiMessage(`AI 購物顧問：${product.name}`)} />
      <ShoppingCartSummary items={cart} rate={rate} budgetTwd={budget} weightLimitKg={weightLimit} onRemove={(id) => setCart((items) => items.filter((item) => item.id !== id))} onToggleBought={(id) => setCart((items) => items.map((item) => item.id === id ? { ...item, bought: !item.bought } : item))} />
      <WineDatabase wines={previewWines} rate={rate} onAskAi={(wine) => setAiMessage(`AI 酒類顧問：${wine.name}`)} />

      {aiMessage && <section className="answer"><strong>{aiMessage}</strong><p>正式接線時會開啟現有 Gemini 分析視窗。</p><button onClick={() => setAiMessage("")}>關閉</button></section>}
    </main>
  );
}
