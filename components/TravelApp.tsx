"use client";

import { useEffect, useMemo, useState } from "react";

type Mode = "shopping" | "wine" | "translate" | "guide" | "receipt";
type Favorite = { id: string; title: string; note: string; createdAt: string };

const modes: Record<Mode, { icon: string; title: string; subtitle: string; placeholder: string }> = {
  shopping: { icon: "🛍️", title: "AI 購物顧問", subtitle: "價格、CP 值、預算與重量", placeholder: "例如：售價 NZ$169，台灣買得到嗎？值得買嗎？" },
  wine: { icon: "🍷", title: "AI 酒類顧問", subtitle: "酒款、搭餐與帶回建議", placeholder: "例如：這瓶酒適合送禮嗎？建議帶幾瓶？" },
  translate: { icon: "🌐", title: "AI 翻譯", subtitle: "菜單、標籤、成分與警告", placeholder: "例如：請完整翻譯並整理過敏原與注意事項。" },
  guide: { icon: "🏞️", title: "AI 景點介紹", subtitle: "歷史、拍照與停留建議", placeholder: "例如：最佳拍照位置與建議停留時間？" },
  receipt: { icon: "🧾", title: "AI 收據辨識", subtitle: "金額、品項、幣別與分類", placeholder: "例如：請整理品項與總金額，並換算成台幣。" }
};

const itinerary = [
  "台北 → 奧克蘭", "奧克蘭 → 基督城 → 凱庫拉", "賞鯨 → 漢默溫泉",
  "Monteith 酒廠 → 千層岩", "樹冠步道 → 霍基蒂卡 → 福克斯冰河",
  "馬瑟森湖 → 瓦納卡", "Cromwell → Kinross → 箭鎮 → 皇后鎮",
  "米佛峽灣飛行 → 普卡基湖 → 蒂卡波", "庫克山 → 好牧羊人教堂 → 基督城",
  "羊駝牧場 → 阿卡羅阿 → 奧克蘭", "返回台灣"
];

export default function TravelApp() {
  const [mode, setMode] = useState<Mode>("shopping");
  const [open, setOpen] = useState(false);
  const [image, setImage] = useState("");
  const [question, setQuestion] = useState("");
  const [budget, setBudget] = useState(30000);
  const [spent, setSpent] = useState(0);
  const [weightLimit, setWeightLimit] = useState(23);
  const [weightUsed, setWeightUsed] = useState(18);
  const [rate, setRate] = useState(19.5);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [day, setDay] = useState(7);
  const [weather, setWeather] = useState("尚未取得");
  const [location, setLocation] = useState("");
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const active = useMemo(() => modes[mode], [mode]);
  const remainingBudget = Math.max(0, budget - spent);
  const remainingWeight = Math.max(0, weightLimit - weightUsed);

  useEffect(() => {
    const read = (key: string, fallback: number) => Number(localStorage.getItem(key) ?? fallback);
    setBudget(read("tm-budget", 30000));
    setSpent(read("tm-spent", 0));
    setWeightLimit(read("tm-weight-limit", 23));
    setWeightUsed(read("tm-weight-used", 18));
    setRate(read("tm-rate", 19.5));
    setDay(read("tm-day", 7));
    try { setFavorites(JSON.parse(localStorage.getItem("tm-favorites") || "[]")); } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("tm-budget", String(budget));
    localStorage.setItem("tm-spent", String(spent));
    localStorage.setItem("tm-weight-limit", String(weightLimit));
    localStorage.setItem("tm-weight-used", String(weightUsed));
    localStorage.setItem("tm-rate", String(rate));
    localStorage.setItem("tm-day", String(day));
    localStorage.setItem("tm-favorites", JSON.stringify(favorites));
  }, [budget, spent, weightLimit, weightUsed, rate, day, favorites]);

  async function compress(file: File) {
    const bitmap = await createImageBitmap(file);
    const maxSide = 1600;
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.82);
  }

  async function selectPhoto(file?: File) {
    if (!file) return;
    setImage(await compress(file));
    setAnswer("");
  }

  async function analyze() {
    if (!image) return setAnswer("請先拍照或選擇圖片。");
    setLoading(true);
    setAnswer("正在分析圖片…");
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          mode, imageDataUrl: image, question,
          remainingBudget, remainingWeight, exchangeRate: rate,
          tripContext: `紐西蘭南島 Day ${day}：${itinerary[day - 1]}；目前位置：${location || "未提供"}`
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "AI 分析失敗");
      setAnswer(data.answer);
    } catch (error) {
      setAnswer(`⚠️ ${error instanceof Error ? error.message : "AI 分析失敗"}`);
    } finally {
      setLoading(false);
    }
  }

  function locate() {
    if (!navigator.geolocation) return setLocation("此裝置不支援定位");
    navigator.geolocation.getCurrentPosition(async (p) => {
      const lat = p.coords.latitude.toFixed(5);
      const lng = p.coords.longitude.toFixed(5);
      setLocation(`${lat}, ${lng}`);
      try {
        const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`);
        const d = await r.json();
        setWeather(`${d.current.temperature_2m}°C｜風速 ${d.current.wind_speed_10m} km/h`);
      } catch { setWeather("已定位，但天氣取得失敗"); }
    }, () => setLocation("無法取得位置，請檢查瀏覽器權限"));
  }

  function saveFavorite() {
    if (!answer) return;
    const title = `${active.title}｜Day ${day}`;
    setFavorites((old) => [{ id: crypto.randomUUID(), title, note: answer.slice(0, 500), createdAt: new Date().toLocaleString("zh-TW") }, ...old]);
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div><strong>🌏 Travel ME v6</strong><small>AI 旅行助手</small></div>
        <a href="/login">Google 登入</a>
      </header>

      <section className="hero">
        <span>NEW ZEALAND 2026</span>
        <h1>拍照後，AI 直接回答</h1>
        <p>購物、酒類、翻譯、景點與收據，一個 App 完成。</p>
      </section>

      <section className="modeGrid">
        {(Object.keys(modes) as Mode[]).map((key) => (
          <button key={key} className="modeCard" onClick={() => { setMode(key); setOpen(true); setAnswer(""); }}>
            <b>{modes[key].icon}</b><strong>{modes[key].title}</strong><small>{modes[key].subtitle}</small>
          </button>
        ))}
      </section>

      <section className="dashboard">
        <article>
          <label>目前 Day
            <select value={day} onChange={(e) => setDay(Number(e.target.value))}>
              {itinerary.map((_, i) => <option value={i + 1} key={i}>Day {i + 1}</option>)}
            </select>
          </label>
          <strong>{itinerary[day - 1]}</strong>
        </article>
        <article><small>剩餘預算</small><strong>NT$ {remainingBudget.toLocaleString()}</strong></article>
        <article><small>剩餘行李</small><strong>{remainingWeight.toFixed(1)} kg</strong></article>
        <article><small>目前天氣</small><strong>{weather}</strong><button className="minor" onClick={locate}>GPS 定位</button></article>
      </section>

      <section className="toolsPanel">
        <h2>旅行管理</h2>
        <div className="inputGrid">
          <label>總預算 TWD<input type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} /></label>
          <label>已花費 TWD<input type="number" value={spent} onChange={(e) => setSpent(Number(e.target.value))} /></label>
          <label>行李上限 kg<input type="number" step="0.1" value={weightLimit} onChange={(e) => setWeightLimit(Number(e.target.value))} /></label>
          <label>目前重量 kg<input type="number" step="0.1" value={weightUsed} onChange={(e) => setWeightUsed(Number(e.target.value))} /></label>
          <label>NZD/TWD 匯率<input type="number" step="0.01" value={rate} onChange={(e) => setRate(Number(e.target.value))} /></label>
          <label>位置<input value={location} readOnly placeholder="按 GPS 定位" /></label>
        </div>
      </section>

      <section className="favorites">
        <div className="sectionHead"><h2>收藏紀錄</h2><span>{favorites.length} 筆</span></div>
        {favorites.length === 0 ? <p>AI 分析後可加入收藏。</p> :
          favorites.map((f) => <article key={f.id}><div><strong>{f.title}</strong><small>{f.createdAt}</small><p>{f.note}</p></div><button onClick={() => setFavorites(favorites.filter(x => x.id !== f.id))}>刪除</button></article>)}
      </section>

      {open && <div className="backdrop">
        <section className="modal">
          <div className="modalHead"><div><small>{active.subtitle}</small><h2>{active.icon} {active.title}</h2></div><button onClick={() => setOpen(false)}>✕</button></div>
          <label className="camera">
            {image ? <img src={image} alt="待分析圖片" /> : <div><b>📷</b><span>拍照或選擇圖片</span></div>}
            <input type="file" accept="image/*" capture="environment" onChange={(e) => selectPhoto(e.target.files?.[0])} />
          </label>
          <label>補充問題或現場價格<textarea value={question} placeholder={active.placeholder} onChange={(e) => setQuestion(e.target.value)} /></label>
          <div className="twoCol">
            <label>剩餘預算<input value={remainingBudget} readOnly /></label>
            <label>剩餘重量<input value={remainingWeight.toFixed(1)} readOnly /></label>
          </div>
          <button className="analyze" onClick={analyze} disabled={loading}>{loading ? "AI 分析中…" : "直接由 AI 分析"}</button>
          {answer && <div className="answer">{answer}</div>}
          {answer && !answer.startsWith("⚠️") && <button className="save" onClick={saveFavorite}>加入收藏</button>}
          <p className="privacy">圖片會傳送至伺服器進行 AI 分析；API Key 不會出現在手機中。</p>
        </section>
      </div>}
    </main>
  );
}
