"use client";

import type { PhotoSpot, PhotoTask } from "../../types/travel";
import { InstagramTags } from "./InstagramTags";

type PhotoGuideCardProps = {
  spot: PhotoSpot;
  task?: PhotoTask;
  onToggleDone: (done: boolean) => void;
  onToggleFavorite: () => void;
  onOpenAiRating: () => void;
};

function shotMode(spot: PhotoSpot) {
  const text = `${spot.title} ${spot.place} ${spot.styles.join(" ")}`.toLowerCase();
  if (/star|astro|night|星空|銀河/.test(text)) return { icon: "🌌", label: "星空模式", framing: "三腳架固定，人物放畫面下方 1/3，保留大面積天空。", exposure: "夜景請穩定手機，避免數位變焦。" };
  if (/portrait|人像|人物|couple/.test(text)) return { icon: "👤", label: "人物模式", framing: "人物放左右 1/3，避免關節被畫面邊緣切斷。", exposure: "逆光時先點人物臉部測光，再略降曝光。" };
  return { icon: "🏔️", label: "風景模式", framing: "保留前景、中景、遠景三層，地平線避免放正中央。", exposure: "高反差場景優先保住天空高光。" };
}

export function PhotoGuideCard({ spot, task, onToggleDone, onToggleFavorite, onOpenAiRating }: PhotoGuideCardProps) {
  const mode = shotMode(spot);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${spot.lat},${spot.lng}`;

  return (
    <article className={`photoSpotCard ${task?.done ? "photoDone" : ""}`}>
      <a href={spot.source} target="_blank" rel="noreferrer" className="photoImageWrap">
        <img src={spot.image} alt={`${spot.place} 參考照片`} loading="lazy" />
        <span>查看圖片授權來源</span>
      </a>
      <div className="photoSpotBody">
        <div className="photoTitleRow">
          <div><small>Day {spot.day}｜{spot.place}</small><h3>{spot.title}</h3></div>
          <div className="popularScore"><small>今日推薦</small><strong>{spot.popularity}</strong><span>/100</span></div>
        </div>

        <div className="photoQuickCoach">
          <strong>{mode.icon} 現場怎麼拍｜{mode.label}</strong>
          <div className="photoCoachGrid">
            <span><b>📱 鏡頭</b>{spot.lens}</span>
            <span><b>⏱ 建議時間</b>{spot.duration}</span>
            <span><b>📍 攝影者</b>{spot.photographer}</span>
            <span><b>👤 人物站位</b>{spot.subject}</span>
          </div>
          <p><b>構圖：</b>{mode.framing}</p>
          <p><b>曝光：</b>{mode.exposure}</p>
        </div>

        <div className="styleTags">{spot.styles.map((style) => <span key={style}>🔥 {style}</span>)}</div>
        <div className="poseDiagram"><pre>{spot.diagram}</pre></div>
        <p><b>☀️ 光線：</b>{spot.light}</p><p><b>🧍 姿勢：</b>{spot.pose}</p>

        <details className="photoSteps"><summary>查看完整拍攝步驟</summary><ol>{spot.steps.map((step) => <li key={step}>{step}</li>)}</ol></details>
        <InstagramTags hashtags={spot.hashtags} />

        <div className="photoFieldActions">
          <a href={mapsUrl} target="_blank" rel="noreferrer">📍 導航拍攝點</a>
          <button onClick={onOpenAiRating}>✨ 拍完請 AI 評分</button>
        </div>
        <p className="photoRetakeHint">AI 評分後可依構圖、光線、人物比例與背景問題立即重拍。</p>

        <div className="taskActions">
          <label><input type="checkbox" checked={task?.done || false} onChange={(event) => onToggleDone(event.target.checked)} />📸 已拍完成</label>
          <button className={task?.favorite ? "active" : ""} onClick={onToggleFavorite}>{task?.favorite ? "★ 已收藏" : "☆ 收藏拍法"}</button>
        </div>
      </div>
    </article>
  );
}
