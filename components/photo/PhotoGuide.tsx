"use client";

import type { PhotoSpot, PhotoTask } from "../../types/travel";
import { PhotoGuideCard } from "./PhotoGuideCard";

type PhotoGuideProps = {
  day: number;
  spots: PhotoSpot[];
  tasks: Record<string, PhotoTask>;
  onDayChange: (day: number) => void;
  onUpdateTask: (spot: PhotoSpot, patch: Partial<PhotoTask>) => void;
  onOpenAiRating: (spot: PhotoSpot) => void;
  showDaySelector?: boolean;
};

function photoKey(spot: PhotoSpot) {
  return `${spot.day}-${spot.place}`;
}

export function PhotoGuide({ day, spots, tasks, onDayChange, onUpdateTask, onOpenAiRating, showDaySelector = true }: PhotoGuideProps) {
  const days = Array.from(new Set(spots.map((spot) => spot.day)));
  const visible = spots.filter((spot) => spot.day === day);
  const completed = visible.filter((spot) => tasks[photoKey(spot)]?.done).length;
  const favorites = visible.filter((spot) => tasks[photoKey(spot)]?.favorite).length;
  const progress = visible.length ? Math.round((completed / visible.length) * 100) : 0;

  return (
    <section className="photoGuidePanel">
      <div className="sectionHead">
        <div><h2>📸 今日攝影助手</h2><p>拍之前看拍法 → 現場照著拍 → 拍完 AI 評分 → 立即重拍改善。</p></div>
        {showDaySelector && <label>顯示 Day<select value={day} onChange={(event) => onDayChange(Number(event.target.value))}>{days.map((item) => <option value={item} key={item}>Day {item}</option>)}</select></label>}
      </div>

      <div className="photoMissionSummary">
        <article><small>📍 今日必拍</small><strong>{visible.length}</strong></article>
        <article><small>✅ 已完成</small><strong>{completed}/{visible.length}</strong></article>
        <article><small>⭐ 已收藏</small><strong>{favorites}</strong></article>
        <article><small>🎯 完成度</small><strong>{progress}%</strong></article>
      </div>

      <div className="photoChecklistBar" aria-label={`今日拍照完成度 ${progress}%`}>
        <div style={{ width: `${progress}%` }} />
      </div>

      {visible.length > 0 && (
        <div className="photoTodayChecklist">
          <strong>今日必拍 Checklist</strong>
          <div>{visible.map((spot) => {
            const key = photoKey(spot);
            const done = tasks[key]?.done || false;
            return <label key={key}><input type="checkbox" checked={done} onChange={(event) => onUpdateTask(spot, { done: event.target.checked })} /><span>{done ? "✓" : "○"} {spot.title}</span></label>;
          })}</div>
        </div>
      )}

      <div className="photoSpotGrid">
        {visible.map((spot) => {
          const key = photoKey(spot);
          const task = tasks[key];
          return <PhotoGuideCard key={key} spot={spot} task={task} onToggleDone={(done) => onUpdateTask(spot, { done })} onToggleFavorite={() => onUpdateTask(spot, { favorite: !task?.favorite })} onOpenAiRating={() => onOpenAiRating(spot)} />;
        })}
      </div>
      {visible.length === 0 && <div className="emptyPhoto">這一天尚未建立專屬拍照攻略。</div>}
    </section>
  );
}
