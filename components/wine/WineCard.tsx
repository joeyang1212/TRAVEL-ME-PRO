"use client";

import type { Wine } from "../../types/travel";

type WineCardProps = {
  wine: Wine;
  rate: number;
  onAskAi?: (wine: Wine) => void;
};

export function WineCard({ wine, rate, onAskAi }: WineCardProps) {
  const averageNzd = (wine.nzdMin + wine.nzdMax) / 2;
  const estimatedTwd = Math.round(averageNzd * rate);

  return (
    <article className="wineCard">
      <small>{wine.region}｜{wine.style}</small>
      <h3>{wine.name}</h3>
      <p>{wine.note}</p>
      <div className="wineFacts">
        <span><b>價格</b>NZ${wine.nzdMin}–{wine.nzdMax}</span>
        <span><b>約台幣</b>NT${estimatedTwd.toLocaleString()}</span>
        <span><b>送禮</b>{wine.gift}</span>
      </div>
      {onAskAi && <button onClick={() => onAskAi(wine)}>問 AI 搭餐與送禮建議</button>}
    </article>
  );
}
