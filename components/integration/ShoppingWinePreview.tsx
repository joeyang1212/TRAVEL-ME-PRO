"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { TodayDashboard } from "../today/TodayDashboard";
import { WeatherForecast } from "../weather/WeatherForecast";
import { DayRouteMap } from "../map/DayRouteMap";
import { NzdTwdConverter } from "../currency/NzdTwdConverter";
import { PhotoGuide } from "../photo/PhotoGuide";
import { HistoryPreview } from "../history/HistoryPreview";
import { ShoppingGrid } from "../shopping/ShoppingGrid";
import { ShoppingCartSummary } from "../shopping/ShoppingCartSummary";
import { WineDatabase } from "../wine/WineDatabase";
import { useWeatherForecast } from "../../hooks/useWeatherForecast";
import { nzItinerary } from "../../data/nz/itinerary";
import { nzRouteStops } from "../../data/nz/routeStops";
import { nzProducts } from "../../data/nz/products";
import { nzWines } from "../../data/nz/wines";
import { nzPhotoSpots } from "../../data/nz/photoSpots";
import { nzHistoryGuides } from "../../data/nz/historyGuides";
import { buildShoppingPrompt } from "../../services/ai/shopping";
import { buildWinePrompt } from "../../services/ai/wine";
import type { CartItem, HistoryGuide, PhotoSpot, PhotoTask, Product } from "../../types/travel";

type AssistantMode = "shopping" | "wine" | "guide";

type Scene = { label: string; image: string };

const AI_DAILY_LIMIT = 30;
const AI_USAGE_STORAGE_KEY = "travel-me-ultimate-ai-usage";

const SCENES: Scene[] = [
  { label: "Queenstown", image: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=2200&q=88" },
  { label: "Tekapo 星空", image: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=2200&q=88" },
  { label: "Aoraki / Mt. Cook", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2200&q=88" },
  { label: "Milford Sound", image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2200&q=88" },
  { label: "Wanaka 孤獨樹", image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2200&q=88" },
];

const DAY_SCENE_INDEX = [0, 0, 1, 2, 4, 3, 0, 1, 2, 4, 3];

type DailyAiUsage = { date: string; count: number };

function todayKey() { return new Date().toISOString().slice(0, 10); }
function photoKey(spot: PhotoSpot) { return `${spot.day}-${spot.place}`; }
function assistantTitle(mode: AssistantMode) {
  if (mode === "shopping") return "🛍️ AI 購物顧問";
  if (mode === "wine") return "🍷 AI 酒類顧問";
  return "📚 AI 景點導覽";
}

export function ShoppingWinePreview() {
  const [day, setDay] = useState(7);
  const [rate, setRate] = useState(19.5);
  const [budget, setBudget] = useState(30000);
  const [weightLimit, setWeightLimit] = useState(8);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [photoTasks, setPhotoTasks] = useState<Record<string, PhotoTask>>({});
  const [historyQuery, setHistoryQuery] = useState("");
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);
  const [featureNotice, setFeatureNotice] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiMode, setAiMode] = useState<AssistantMode>("shopping");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiUsage, setAiUsage] = useState<DailyAiUsage>({ date: todayKey(), count: 0 });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(AI_USAGE_STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as DailyAiUsage;
      setAiUsage(parsed.date === todayKey() ? parsed : { date: todayKey(), count: 0 });
    } catch { setAiUsage({ date: todayKey(), count: 0 }); }
  }, []);

  useEffect(() => { localStorage.setItem(AI_USAGE_STORAGE_KEY, JSON.stringify(aiUsage)); }, [aiUsage]);

  const trip = nzItinerary[day - 1] ?? nzItinerary[0];
  const scene = SCENES[DAY_SCENE_INDEX[day - 1] ?? 0];
  const shellStyle = { "--travel-bg": `url("${scene.image}")` } as CSSProperties;
  const weather = useWeatherForecast(trip);
  const currentWeather = weather.hours[0];
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart]);
  const cartWeight = useMemo(() => cart.reduce((sum, item) => sum + item.qty * item.unitWeightKg, 0), [cart]);
  const cartTotalTwd = useMemo(() => Math.round(cart.reduce((sum, item) => sum + item.qty * item.unitPriceNzd, 0) * rate), [cart, rate]);
  const remainingBudget = Math.max(0, budget - cartTotalTwd);
  const remainingWeight = Math.max(0, weightLimit - cartWeight);
  const recommendationCount = nzProducts.filter((product) => product.days.includes(day)).length;
  const dayPhotoSpots = nzPhotoSpots.filter((spot) => spot.day === day);
  const photoDone = dayPhotoSpots.filter((spot) => photoTasks[photoKey(spot)]?.done).length;

  function addToCart(product: Product) {
    setCart((current) => {
      const existing = current.find((item) => item.name === product.name);
      if (existing) return current.map((item) => item.id === existing.id ? { ...item, qty: item.qty + 1 } : item);
      return [...current, { id: crypto.randomUUID(), name: product.name, category: product.category, qty: 1, unitPriceNzd: product.nzdMin, unitWeightKg: product.weight, bought: false }];
    });
  }

  function updatePhotoTask(spot: PhotoSpot, patch: Partial<PhotoTask>) {
    const key = photoKey(spot);
    setPhotoTasks((current) => ({ ...current, [key]: { ...(current[key] ?? { key, done: false, favorite: false }), ...patch } }));
  }

  function openPhotoRating(spot: PhotoSpot) {
    setFeatureNotice(`📸 ${spot.place} 已選取。圖片上傳與 Gemini 照片評分將在下一階段接入 Ultimate。`);
  }

  function openHistoryAi(guide: HistoryGuide) {
    const prompt = [
      `請依下列已知資料，用繁體中文深入介紹紐西蘭景點「${guide.place}」。`,
      `時代／背景：${guide.era}`,
      `簡介：${guide.intro}`,
      `形成原因：${guide.formation}`,
      `歷史脈絡：${guide.history.join("；")}`,
      `現場觀察重點：${guide.lookFor.join("；")}`,
      `快速重點：${guide.quickFacts.join("；")}`,
      "請整理為：一句摘要、歷史背景、形成與文化意義、現場最值得注意的三件事、建議停留與拍照提醒。不要虛構即時資訊或未提供的細節。",
    ].join("\n");
    openAssistant("guide", prompt);
  }

  function openAssistant(mode: AssistantMode, prompt: string) {
    setAiMode(mode); setAiPrompt(prompt); setAiAnswer(""); setAiError("");
  }

  async function askAssistant() {
    if (!aiPrompt.trim()) return;
    const currentUsage = aiUsage.date === todayKey() ? aiUsage : { date: todayKey(), count: 0 };
    if (currentUsage.count >= AI_DAILY_LIMIT) {
      setAiError(`今日 AI 建議上限已達 ${AI_DAILY_LIMIT} 次，請明天再試。`);
      return;
    }
    setAiLoading(true); setAiAnswer(""); setAiError("");
    try {
      const response = await fetch("/api/assistant", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ mode: aiMode, prompt: aiPrompt }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "AI 回覆失敗");
      setAiAnswer(data.answer || "AI 沒有回傳內容。");
      setAiUsage({ date: todayKey(), count: currentUsage.count + 1 });
    } catch (error) { setAiError(error instanceof Error ? error.message : "AI 回覆失敗"); }
    finally { setAiLoading(false); }
  }

  return (
    <main className="appShell googleTravelShell" style={shellStyle}>
      <section className="hero googleTravelHero">
        <div className="googleHeroCopy">
          <small>NEW ZEALAND · DAY {day} / {nzItinerary.length}</small>
          <h1>{trip.city}</h1>
          <p>{scene.label} · Travel ME 智慧旅行中心</p>
          <div className="heroWeatherLine">
            <strong>{currentWeather ? `${currentWeather.temperature}°C` : weather.loading ? "更新中" : "--°C"}</strong>
            {currentWeather?.humidity != null && <span>濕度 {currentWeather.humidity}%</span>}
          </div>
        </div>
        <div className="summaryCards googleSummaryCards">
          <article><small>📅 行程進度</small><strong>{day} / {nzItinerary.length}</strong></article>
          <article><small>📍 所在城市</small><strong>{trip.city}</strong></article>
          <article><small>🛍️ 購物車</small><strong>{cartCount} 件</strong></article>
          <article><small>📸 今日必拍</small><strong>{dayPhotoSpots.length} 個</strong></article>
        </div>
      </section>

      <TodayDashboard day={day} trip={trip} weatherLabel={currentWeather ? `${currentWeather.temperature}°C` : weather.loading ? "更新中" : "尚未取得"} humidity={currentWeather?.humidity} photoTotal={dayPhotoSpots.length} photoDone={photoDone} recommendationCount={recommendationCount} cartTotalTwd={cartTotalTwd} remainingBudget={budget} projectedBudget={remainingBudget} aiUsage={aiUsage.date === todayKey() ? aiUsage.count : 0} aiLimit={AI_DAILY_LIMIT} onDayChange={setDay} itinerary={nzItinerary} />
      <WeatherForecast city={trip.city} hours={weather.hours} days={weather.days} loading={weather.loading} error={weather.error} updatedAt={weather.updatedAt} onRefresh={weather.refresh} />
      <DayRouteMap day={day} stops={nzRouteStops} />

      {featureNotice && <section className="answer"><strong>功能接線狀態</strong><p>{featureNotice}</p><button onClick={() => setFeatureNotice("")}>關閉</button></section>}

      <PhotoGuide day={day} spots={nzPhotoSpots} tasks={photoTasks} onDayChange={setDay} onUpdateTask={updatePhotoTask} onOpenAiRating={openPhotoRating} showDaySelector={false} />
      <HistoryPreview day={day} query={historyQuery} guides={nzHistoryGuides} expandedKey={expandedHistory} onDayChange={setDay} onQueryChange={setHistoryQuery} onToggle={(key) => setExpandedHistory((current) => current === key ? null : key)} onAskAi={openHistoryAi} showDaySelector={false} />

      <NzdTwdConverter rate={rate} onRateChange={setRate} />
      <section className="toolsPanel"><div className="inputGrid"><label>購物預算 TWD<input type="number" value={budget} onChange={(event) => setBudget(Number(event.target.value))} /></label><label>可用行李重量 kg<input type="number" step="0.1" value={weightLimit} onChange={(event) => setWeightLimit(Number(event.target.value))} /></label></div></section>

      <ShoppingGrid products={nzProducts} day={day} rate={rate} onAddToCart={addToCart} onAskAi={(product) => openAssistant("shopping", buildShoppingPrompt({ product, rate, remainingBudgetTwd: remainingBudget, remainingWeightKg: remainingWeight }))} />
      <ShoppingCartSummary items={cart} rate={rate} budgetTwd={budget} weightLimitKg={weightLimit} onRemove={(id) => setCart((items) => items.filter((item) => item.id !== id))} onToggleBought={(id) => setCart((items) => items.map((item) => item.id === id ? { ...item, bought: !item.bought } : item))} />
      <WineDatabase wines={nzWines} rate={rate} onAskAi={(wine) => openAssistant("wine", buildWinePrompt({ wine, rate, remainingBudgetTwd: remainingBudget, remainingWeightKg: remainingWeight }))} />

      {aiPrompt && <section className="answer"><strong>{assistantTitle(aiMode)}</strong><textarea value={aiPrompt} onChange={(event) => setAiPrompt(event.target.value)} rows={10} /><div className="twoCol"><button className="analyze" onClick={askAssistant} disabled={aiLoading || aiUsage.count >= AI_DAILY_LIMIT}>{aiLoading ? "Gemini 回覆中…" : `送出給 Gemini（${aiUsage.count}/${AI_DAILY_LIMIT}）`}</button><button onClick={() => { setAiPrompt(""); setAiAnswer(""); setAiError(""); }}>關閉</button></div>{aiError && <p>⚠️ {aiError}</p>}{aiAnswer && <div><h3>Gemini 建議</h3><p style={{ whiteSpace: "pre-wrap" }}>{aiAnswer}</p></div>}</section>}
    </main>
  );
}
