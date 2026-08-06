"use client";

import { useMemo, useState } from "react";
import type { Wine } from "../../types/travel";
import { WineCard } from "./WineCard";

type WineDatabaseProps = {
  wines: Wine[];
  rate: number;
  onAskAi?: (wine: Wine) => void;
};

export function WineDatabase({ wines, rate, onAskAi }: WineDatabaseProps) {
  const [region, setRegion] = useState("全部");
  const [style, setStyle] = useState("全部");
  const [query, setQuery] = useState("");

  const regions = useMemo(() => ["全部", ...Array.from(new Set(wines.map((wine) => wine.region)))], [wines]);
  const styles = useMemo(() => ["全部", ...Array.from(new Set(wines.map((wine) => wine.style)))], [wines]);
  const visible = wines.filter((wine) => {
    const matchesRegion = region === "全部" || wine.region === region;
    const matchesStyle = style === "全部" || wine.style === style;
    const searchable = `${wine.name}${wine.region}${wine.style}${wine.note}${wine.gift}`.toLowerCase();
    return matchesRegion && matchesStyle && searchable.includes(query.toLowerCase());
  });

  return (
    <section className="winePanel">
      <div className="sectionHead">
        <div><h2>🍷 紐西蘭酒款資料庫</h2><p>依產區、酒種、價格與送禮用途篩選。</p></div>
        <div className="wineFilters">
          <label>產區<select value={region} onChange={(event) => setRegion(event.target.value)}>{regions.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>酒種<select value={style} onChange={(event) => setStyle(event.target.value)}>{styles.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>搜尋<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="酒莊、酒種或送禮" /></label>
        </div>
      </div>
      <div className="wineGrid">{visible.map((wine) => <WineCard key={`${wine.name}-${wine.style}`} wine={wine} rate={rate} onAskAi={onAskAi} />)}</div>
      {visible.length === 0 && <div className="emptyPhoto">找不到符合條件的酒款。</div>}
    </section>
  );
}
