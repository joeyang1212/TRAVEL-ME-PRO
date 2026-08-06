import type { HistoryGuide } from "../../types/travel";
import { HistoryCard } from "./HistoryCard";

type HistoryPreviewProps = {
  day: number;
  query: string;
  guides: HistoryGuide[];
  expandedKey: string | null;
  onDayChange: (day: number) => void;
  onQueryChange: (query: string) => void;
  onToggle: (key: string) => void;
  onAskAi: (guide: HistoryGuide) => void;
};

export function HistoryPreview({
  day,
  query,
  guides,
  expandedKey,
  onDayChange,
  onQueryChange,
  onToggle,
  onAskAi,
}: HistoryPreviewProps) {
  const days = Array.from(new Set(guides.map((guide) => guide.day)));
  const filtered = guides.filter((guide) => {
    const matchesDay = guide.day === day;
    const searchable = `${guide.place}${guide.era}${guide.intro}${guide.formation}`.toLowerCase();
    return matchesDay && searchable.includes(query.toLowerCase());
  });

  return (
    <section className="historyPreviewPanel">
      <div className="sectionHead">
        <div><h2>📚 行前景點預習</h2><p>依行程預先整理，不需拍照，也不消耗 Gemini 額度。</p></div>
        <div className="historyFilters">
          <label>Day<select value={day} onChange={(event) => onDayChange(Number(event.target.value))}>{days.map((item) => <option value={item} key={item}>Day {item}</option>)}</select></label>
          <label>搜尋<input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="景點或關鍵字" /></label>
        </div>
      </div>

      <div className="historyGrid">
        {filtered.map((guide) => {
          const key = `${guide.day}-${guide.place}`;
          return <HistoryCard key={key} guide={guide} expanded={expandedKey === key} onToggle={() => onToggle(key)} onAskAi={() => onAskAi(guide)} />;
        })}
      </div>

      {filtered.length === 0 && <div className="emptyPhoto">此日尚無符合條件的景點介紹。</div>}
    </section>
  );
}
