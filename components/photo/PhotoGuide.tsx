import type { PhotoSpot, PhotoTask } from "../../types/travel";
import { PhotoGuideCard } from "./PhotoGuideCard";

type PhotoGuideProps = {
  day: number;
  spots: PhotoSpot[];
  tasks: Record<string, PhotoTask>;
  onDayChange: (day: number) => void;
  onUpdateTask: (spot: PhotoSpot, patch: Partial<PhotoTask>) => void;
  onOpenAiRating: (spot: PhotoSpot) => void;
};

function photoKey(spot: PhotoSpot) {
  return `${spot.day}-${spot.place}`;
}

export function PhotoGuide({ day, spots, tasks, onDayChange, onUpdateTask, onOpenAiRating }: PhotoGuideProps) {
  const days = Array.from(new Set(spots.map((spot) => spot.day));
  const visible = spots.filter((spot) => spot.day === day);
  const completed = visible.filter((spot) => tasks[photoKey(spot)]?.done).length;
  const favorites = visible.filter((spot) => tasks[photoKey(spot)]?.favorite).length;

  return (
    <section className="photoGuidePanel">
      <div className="sectionHead">
        <div><h2>📸 Photo Guide Pro</h2><p>熱門拍法、Instagram 靈感、站位與拍照任務。</p></div>
        <label>顯示 Day<select value={day} onChange={(event) => onDayChange(Number(event.target.value))}>{days.map((item) => <option value={item} key={item}>Day {item}</option>)}</select></label>
      </div>

      <div className="photoMissionSummary">
        <article><small>今日拍照點</small><strong>{visible.length}</strong></article>
        <article><small>已完成</small><strong>{completed}</strong></article>
        <article><small>已收藏</small><strong>{favorites}</strong></article>
      </div>

      <div className="photoSpotGrid">
        {visible.map((spot) => {
          const key = photoKey(spot);
          const task = tasks[key];
          return (
            <PhotoGuideCard
              key={key}
              spot={spot}
              task={task}
              onToggleDone={(done) => onUpdateTask(spot, { done })}
              onToggleFavorite={() => onUpdateTask(spot, { favorite: !task?.favorite })}
              onOpenAiRating={() => onOpenAiRating(spot)}
            />
          );
        })}
      </div>

      {visible.length === 0 && <div className="emptyPhoto">這一天尚未建立專屬拍照攻略。</div>}
    </section>
  );
}
