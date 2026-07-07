import type { CSSProperties } from "react";
import type { Card, DocPage, Metrics, Project, View } from "../types";
import { formatFocus, getDateRange, getInitials, getPriorityIcon, getProject, getSubtaskProgress } from "../utils";

type DashboardViewProps = {
  cards: Card[];
  docs: DocPage[];
  projects: Project[];
  metrics: Metrics;
  onViewChange: (view: View) => void;
  onSelectCard: (cardId: string) => void;
  onSelectDoc: (docId: string) => void;
};

export function DashboardView({ cards, docs, projects, metrics, onViewChange, onSelectCard, onSelectDoc }: DashboardViewProps) {
  const activeCards = cards.filter((card) => card.status !== "done");
  const priorityCards = [...activeCards].sort((a, b) => priorityRank(b.priority) - priorityRank(a.priority)).slice(0, 4);
  const scheduledCards = cards.filter((card) => card.day !== null).slice(0, 4);
  const recentDocs = docs.slice(0, 5);
  const totalStoryPoints = cards.reduce((sum, card) => sum + card.storyPoints, 0);

  return (
    <section className="dashboard-view">
      <div className="dashboard-hero">
        <div>
          <p className="eyebrow">Command Center</p>
          <h2>오늘 바로 움직일 작업공간</h2>
          <p>Jira 카드, Confluence 문서, 캘린더 블록, 집중 기록을 한 화면에서 시작합니다.</p>
        </div>
        <div className="dashboard-actions">
          <button onClick={() => onViewChange("jira")}>Jira 카드 만들기</button>
          <button onClick={() => onViewChange("confluence")}>Confluence 문서 열기</button>
          <button onClick={() => onViewChange("planner")}>플래너 보기</button>
        </div>
      </div>

      <div className="dashboard-metrics">
        <Metric label="Open Jira cards" value={String(activeCards.length)} caption={`${totalStoryPoints} story points`} />
        <Metric label="Planned time" value={formatFocus(metrics.plannedMinutes)} caption="calendar blocks" />
        <Metric label="Focus logged" value={formatFocus(metrics.focusMinutes)} caption={`${metrics.pomodoros} sessions`} />
        <Metric label="Docs" value={String(docs.length)} caption="pages + whiteboards" />
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-panel assigned-panel">
          <div className="dashboard-panel-title">
            <div>
              <h3>Assigned Jira work</h3>
              <span>우선순위 높은 카드부터 처리</span>
            </div>
            <button onClick={() => onViewChange("jira")}>Board</button>
          </div>
          <div className="dashboard-card-list">
            {priorityCards.map((card) => {
              const project = getProject(projects, card.projectId);
              return (
                <button
                  className="dashboard-work-card"
                  key={card.id}
                  style={{ "--project-color": project.color } as CSSProperties}
                  onClick={() => {
                    onSelectCard(card.id);
                    onViewChange("jira");
                  }}
                >
                  <span className="issue-key"><i style={{ background: project.color }} />{card.id}</span>
                  <strong>{card.title}</strong>
                  <p>{card.description}</p>
                  <div>
                    <span className="priority-mark"><b>{getPriorityIcon(card.priority)}</b>{card.priority}</span>
                    <span>{getDateRange(card)}</span>
                    <span className="avatar">{getInitials(card.assignee)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="dashboard-panel docs-panel">
          <div className="dashboard-panel-title">
            <div>
              <h3>Recent Confluence</h3>
              <span>연결 문서와 화이트보드</span>
            </div>
            <button onClick={() => onViewChange("confluence")}>Space</button>
          </div>
          <div className="doc-mini-grid">
            {recentDocs.map((doc) => {
              const project = getProject(projects, doc.projectId);
              const linkedCards = cards.filter((card) => doc.cardIds.includes(card.id));
              return (
                <button
                  className="doc-mini-card"
                  key={doc.id}
                  onClick={() => {
                    onSelectDoc(doc.id);
                    onViewChange("confluence");
                  }}
                >
                  <i style={{ background: project.color }} />
                  <strong>{doc.title}</strong>
                  <span>{doc.type === "canvas" ? "Whiteboard" : "Page"} · {linkedCards.length} linked Jira cards</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="dashboard-panel planner-panel">
          <div className="dashboard-panel-title">
            <div>
              <h3>Planner</h3>
              <span>시간으로 예약된 카드</span>
            </div>
            <button onClick={() => onViewChange("planner")}>Calendar</button>
          </div>
          <div className="timeline-stack">
            {scheduledCards.length === 0 ? (
              <p className="empty-note">아직 배치된 카드가 없습니다. Jira 보드에서 자동 배치를 실행하세요.</p>
            ) : scheduledCards.map((card) => (
              <button
                key={card.id}
                className="timeline-mini-item"
                onClick={() => {
                  onSelectCard(card.id);
                  onViewChange("planner");
                }}
              >
                <span>{card.start ?? 0}:00</span>
                <strong>{card.title}</strong>
                <small>{card.minutes}m</small>
              </button>
            ))}
          </div>
        </section>

        <section className="dashboard-panel activity-panel-home">
          <div className="dashboard-panel-title">
            <div>
              <h3>Activity</h3>
              <span>프로젝트 흐름</span>
            </div>
          </div>
          <div className="activity-feed">
            {cards.slice(0, 4).map((card) => (
              <div key={card.id}>
                <span className="avatar">{getInitials(card.assignee)}</span>
                <p><strong>{card.assignee}</strong> updated <button onClick={() => { onSelectCard(card.id); onViewChange("jira"); }}>{card.id}</button></p>
                <small>{card.status} · {getSubtaskProgress(card)}% subtasks</small>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

function Metric({ label, value, caption }: { label: string; value: string; caption: string }) {
  return (
    <div className="dashboard-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{caption}</small>
    </div>
  );
}

function priorityRank(priority: Card["priority"]) {
  if (priority === "Highest") return 4;
  if (priority === "High") return 3;
  if (priority === "Medium") return 2;
  return 1;
}
