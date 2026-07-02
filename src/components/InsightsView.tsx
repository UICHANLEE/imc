import type { Metrics } from "../types";

type InsightsViewProps = {
  metrics: Metrics;
  review: string;
  onReviewChange: (value: string) => void;
};

export function InsightsView({ metrics, review, onReviewChange }: InsightsViewProps) {
  return (
    <section>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Focus Insights</p>
          <h2>집중 통계와 회고</h2>
        </div>
      </div>
      <div className="insights-grid">
        <MetricCard label="완료 카드" value={metrics.done} caption="이번 주 완료된 작업" />
        <MetricCard label="예정 시간" value={`${(metrics.plannedMinutes / 60).toFixed(1)}h`} caption="플래너에 배치된 시간" />
        <MetricCard label="뽀모도로" value={metrics.pomodoros} caption="시작한 집중 세션" />
      </div>
      <div className="review-panel">
        <h3>오늘의 회고</h3>
        <textarea value={review} onChange={(event) => onReviewChange(event.target.value)} placeholder="오늘 계획이 잘 맞았나요? 예상보다 오래 걸린 일과 다음 액션을 적어보세요." />
      </div>
    </section>
  );
}

function MetricCard({ label, value, caption }: { label: string; value: string | number; caption: string }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{caption}</p>
    </article>
  );
}
