"use client";

import { useMemo, useState } from "react";
import { ShoppingGrid } from "../shopping/ShoppingGrid";
import { ShoppingCartSummary } from "../shopping/ShoppingCartSummary";
import { WineDatabase } from "../wine/WineDatabase";
import { nzProducts } from "../../data/nz/products";
import { nzWines } from "../../data/nz/wines";
import { buildShoppingPrompt } from "../../services/ai/shopping";
import { buildWinePrompt } from "../../services/ai/wine";
import type { CartItem, Product } from "../../types/travel";

type AssistantMode = "shopping" | "wine";

export function ShoppingWinePreview() {
  const [day, setDay] = useState(7);
  const [rate, setRate] = useState(19.5);
  const [budget, setBudget] = useState(30000);
  const [weightLimit, setWeightLimit] = useState(8);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiMode, setAiMode] = useState<AssistantMode>("shopping");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart]);
  const cartWeight = useMemo(() => cart.reduce((sum, item) => sum + item.qty * item.unitWeightKg, 0), [cart]);
  const cartTotalTwd = useMemo(() => Math.round(cart.reduce((sum, item) => sum + item.qty * item.unitPriceNzd, 0) * rate), [cart, rate]);
  const remainingBudget = Math.max(0, budget - cartTotalTwd);
  const remainingWeight = Math.max(0, weightLimit - cartWeight);

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

  function openAssistant(mode: AssistantMode, prompt: string) {
    setAiMode(mode);
    setAiPrompt(prompt);
    setAiAnswer("");
    setAiError("");
  }

  async function askAssistant() {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiAnswer("");
    setAiError("");
    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode: aiMode, prompt: aiPrompt })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "AI 回覆失敗");
      setAiAnswer(data.answer || "AI 沒有回傳內容。");
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "AI 回覆失敗");
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <main className="appShell">
      <section className="hero">
        <div>
          <small>ENGINEERING PREVIEW</small>
          <h1>Shopping + Wine AI Assistant</h1>
          <p>資料、元件、Prompt 與 Gemini 文字分析已完成分層接線。</p>
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

      <ShoppingGrid
        products={nzProducts}
        day={day}
        rate={rate}
        onAddToCart={addToCart}
        onAskAi={(product) => openAssistant("shopping", buildShoppingPrompt({ product, rate, remainingBudgetTwd: remainingBudget, remainingWeightKg: remainingWeight }))}
      />
      <ShoppingCartSummary
        items={cart}
        rate={rate}
        budgetTwd={budget}
        weightLimitKg={weightLimit}
        onRemove={(id) => setCart((items) => items.filter((item) => item.id !== id))}
        onToggleBought={(id) => setCart((items) => items.map((item) => item.id === id ? { ...item, bought: !item.bought } : item))}
      />
      <WineDatabase
        wines={nzWines}
        rate={rate}
        onAskAi={(wine) => openAssistant("wine", buildWinePrompt({ wine, rate, remainingBudgetTwd: remainingBudget, remainingWeightKg: remainingWeight }))}
      />

      {aiPrompt && <section className="answer">
        <strong>{aiMode === "shopping" ? "🛍️ AI 購物顧問" : "🍷 AI 酒類顧問"}</strong>
        <textarea value={aiPrompt} onChange={(event) => setAiPrompt(event.target.value)} rows={10} />
        <div className="twoCol">
          <button className="analyze" onClick={askAssistant} disabled={aiLoading}>{aiLoading ? "Gemini 回覆中…" : "送出給 Gemini"}</button>
          <button onClick={() => { setAiPrompt(""); setAiAnswer(""); setAiError(""); }}>關閉</button>
        </div>
        {aiError && <p>⚠️ {aiError}</p>}
        {aiAnswer && <div><h3>Gemini 建議</h3><p style={{ whiteSpace: "pre-wrap" }}>{aiAnswer}</p></div>}
      </section>}
    </main>
  );
}
