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

export function PhotoGuideCard({ spot, task, onToggleDone, onToggleFavorite, onOpenAiRating }: PhotoGuideCardProps) {
  return (
    <article className={`photoSpotCard ${task?.done ? "photoDone" : ""}`}>
      <a href={spot.source} target="_blank" rel="noreferrer" className="photoImageWrap">
        <img src={spot.image} alt={`${spot.place} 參考照片`} loading="lazy" />
        <span>查看圖片授權來源</span>
      </a>
      <div className="photoSpotBody">
        <div className="photoTitleRow">
          <div><small>Day {spot.day}｜{spot.place}</small><h3>{spot.title}</h3></div>
          <div className="popularScore"><small>熱門拍法</small><strong>{spot.popularity}</strong><span>/100</span></div>
        </div>
        <div className="styleTags">{spot.styles.map((style) => <span key={style}>🔥 {style}</span>)}</div>
        <div className="photoFacts">
          <span><b>📱 鏡頭</b>{spot.lens}</span><span><b>⏱ 建議</b>{spot.duration}</span>
          <span><b>📍 攝影者</b>{spot.photographer}</span><span><b>👤 人物</b>{spot.subject}</span>
        </div>
        <div className="poseDiagram"><pre>{spot.diagram}</pre></div>
        <p><b>光線：</b>{spot.light}</p><p><b>姿勢：</b>{spot.pose}</p>
        <ol>{spot.steps.map((step) => <li key={step}>{step}</li>)}</ol>
        <InstagramTags hashtags={spot.hashtags} />
        <div className="taskActions">
          <label><input type="checkbox" checked={task?.done || false} onChange={(event) => onToggleDone(event.target.checked)} />已拍完成</label>
          <button className={task?.favorite ? "active" : ""} onClick={onToggleFavorite}>{task?.favorite ? "★ 已收藏" : "☆ 收藏拍法"}</button>
        </div>
        <div className="photoActions">
          <a href={`https://www.google.com/maps/search/?api=1&query=${spot.lat},${spot.lng}`} target="_blank" rel="noreferrer">導航拍攝點</a>
          <button onClick={onOpenAiRating}>拍完請 AI 評分</button>
        </div>
      </div>
    </article>
  );
}
