"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  rate: number;
  onRateChange: (rate: number) => void;
};

const RATE_STORAGE_KEY = "travel-me-nzd-twd-rate";

export function NzdTwdConverter({ rate, onRateChange }: Props) {
  const [nzd, setNzd] = useState(50);
  const [twd, setTwd] = useState(() => Math.round(50 * rate));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(RATE_STORAGE_KEY);
      if (!saved) return;
      const value = Number(saved);
      if (Number.isFinite(value) && value > 0) onRateChange(value);
    } catch {}
  }, [onRateChange]);

  useEffect(() => {
    try { localStorage.setItem(RATE_STORAGE_KEY, String(rate)); } catch {}
  }, [rate]);

  useEffect(() => { setTwd(Math.round(nzd * rate)); }, [rate]);

  const inverse = useMemo(() => rate > 0 ? 1 / rate : 0, [rate]);

  async function refreshRate() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/fx", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "匯率更新失敗");
      onRateChange(Number(data.rate));
      setUpdatedAt(data.updatedAt || new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : "匯率更新失敗");
    } finally {
      setLoading(false);
    }
  }

  function changeNzd(value: number) {
    const safe = Number.isFinite(value) ? value : 0;
    setNzd(safe);
    setTwd(Math.round(safe * rate));
  }

  function changeTwd(value: number) {
    const safe = Number.isFinite(value) ? value : 0;
    setTwd(safe);
    setNzd(rate > 0 ? Number((safe / rate).toFixed(2)) : 0);
  }

  return (
    <section className="toolsPanel currencyPanel">
      <div className="sectionHead">
        <div>
          <h2>💱 紐幣／台幣快速換算</h2>
          <p>商品、酒款與購物車會共用同一個 NZD/TWD 匯率。</p>
        </div>
        <button className="minor" onClick={refreshRate} disabled={loading}>{loading ? "更新中…" : "更新即時匯率"}</button>
      </div>

      <div className="rateHero">1 NZD = NT${rate.toFixed(2)} <small>｜1 TWD ≈ NZ${inverse.toFixed(4)}</small></div>
      {updatedAt && <small className="sourceNote">最近更新：{new Date(updatedAt).toLocaleString("zh-TW")}</small>}
      {error && <p className="currencyError">⚠️ {error}，目前仍使用手動／上次保存匯率。</p>}

      <div className="currencyGrid">
        <label>NZD 紐幣<input type="number" step="0.01" value={nzd} onChange={(e) => changeNzd(Number(e.target.value))} /></label>
        <div className="currencyEquals">⇄</div>
        <label>TWD 台幣<input type="number" step="1" value={twd} onChange={(e) => changeTwd(Number(e.target.value))} /></label>
        <label>自訂匯率<input type="number" step="0.01" min="1" value={rate} onChange={(e) => onRateChange(Number(e.target.value) || 0)} /></label>
      </div>

      <div className="quickRates">
        {[10, 20, 50, 100, 200].map((amount) => <button key={amount} onClick={() => changeNzd(amount)}>NZ${amount}<b>≈ NT${Math.round(amount * rate).toLocaleString()}</b></button>)}
      </div>
    </section>
  );
}
