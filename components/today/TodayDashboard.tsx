import type { ItineraryStop } from "../../types/travel";

type TodayDashboardProps = {
  day: number;
  trip: ItineraryStop;
  weatherLabel: string;
  humidity?: number;
  meetingTime?: string;
  meetingName?: string;
  photoTotal: number;
  photoDone: number;
  recommendationCount: number;
  cartTotalTwd: number;
  remainingBudget: number;
  projectedBudget: number;
  aiUsage: number;
  aiLimit: number;
  onDayChange: (day: number) => void;
  itinerary: ItineraryStop[];
};

export function TodayDashboard({
  day,
  trip,
  weatherLabel,
  humidity,
  meetingTime,
  meetingName,
  photoTotal,
  photoDone,
  recommendationCount,
  cartTotalTwd,
  remainingBudget,
  projectedBudget,
  aiUsage,
  aiLimit,
  onDayChange,
  itinerary,
}: TodayDashboardProps) {
  const warning = aiUsage >= Math.ceil(aiLimit * 0.8);

  return (
    <section className="todayPanel">
      <div className="sectionHead">
        <div>
          <span className="todayBadge">TODAY</span>
          <h2>Day {day}｜{trip.city}</h2>
          <p>{trip.title}</p>
        </div>
        <label>
          切換行程
          <select value={day} onChange={(event) => onDayChange(Number(event.target.value))}>
            {itinerary.map((_, index) => (
              <option value={index + 1} key={index + 1}>Day {index + 1}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="todayGrid">
        <article><small>🌦️ 天氣</small><strong>{weatherLabel}</strong><span>{humidity === undefined ? "" : `濕度 ${humidity}%`}</span></article>
        <article><small>🚌 集合</small><strong>{meetingTime || "尚未設定"}</strong><span>{meetingName || "集合點"}</span></article>
        <article><small>📸 今日必拍</small><strong>{photoTotal} 個</strong><span>已完成 {photoDone}</span></article>
        <article><small>🛍️ 今日推薦</small><strong>{recommendationCount} 項</strong><span>購物車約 NT${cartTotalTwd.toLocaleString()}</span></article>
        <article><small>💰 剩餘預算</small><strong>NT${remainingBudget.toLocaleString()}</strong><span>預估購物後 NT${projectedBudget.toLocaleString()}</span></article>
        <article className={warning ? "usageWarn" : ""}><small>🤖 今日 AI 使用</small><strong>{aiUsage}/{aiLimit}</strong><span>{aiUsage >= aiLimit ? "今日額度已用完" : warning ? "接近建議上限" : "可正常使用"}</span></article>
      </div>
    </section>
  );
}
