import type { HistoryGuide } from "../../types/travel";

type HistoryCardProps = {
  guide: HistoryGuide;
  expanded: boolean;
  onToggle: () => void;
  onAskAi: () => void;
};

export function HistoryCard({ guide, expanded, onToggle, onAskAi }: HistoryCardProps) {
  return (
    <article className="historyCard">
      <div className="historyCardHead">
        <div><small>Day {guide.day}｜{guide.era}</small><h3>{guide.place}</h3></div>
        <button onClick={onToggle}>{expanded ? "收合" : "開始預習"}</button>
      </div>
      <p className="historyIntro">{guide.intro}</p>
      <div className="formationBox"><b>🌋 這個景點怎麼形成？</b><p>{guide.formation}</p></div>

      {expanded && (
        <>
          <div className="historyDetail">
            <section><h4>歷史脈絡</h4><ol>{guide.history.map((item) => <li key={item}>{item}</li>)}</ol></section>
            <section><h4>到現場要看什麼</h4><ul>{guide.lookFor.map((item) => <li key={item}>{item}</li>)}</ul></section>
            <section><h4>三個快速重點</h4><ul>{guide.quickFacts.map((item) => <li key={item}>{item}</li>)}</ul></section>
          </div>
          <button className="historyAiButton" onClick={onAskAi}>再問 Gemini 深入介紹</button>
        </>
      )}
    </article>
  );
}
