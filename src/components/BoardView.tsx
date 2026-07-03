import { useState, type CSSProperties } from "react";
import { assignees, columns, issueTypes } from "../data";
import type { Card, IssueType, Project, Status } from "../types";
import { getProject } from "../utils";
import { WorkCard } from "./WorkCard";

type BoardViewProps = {
  cards: Card[];
  projects: Project[];
  project: Project;
  totalCards: number;
  search: string;
  issueTypeFilter: "All" | IssueType;
  assigneeFilter: "All" | string;
  onSearchChange: (value: string) => void;
  onIssueTypeFilterChange: (value: "All" | IssueType) => void;
  onAssigneeFilterChange: (value: "All" | string) => void;
  onAutoSchedule: () => void;
  onMoveCard: (cardId: string, status: Status) => void;
  onSelectCard: (id: string) => void;
  draggingCardId?: string | null;
  onCardDragStart?: (card: Card) => void;
  onCardDragEnd?: () => void;
};

export function BoardView({
  cards,
  projects,
  project,
  totalCards,
  search,
  issueTypeFilter,
  assigneeFilter,
  onSearchChange,
  onIssueTypeFilterChange,
  onAssigneeFilterChange,
  onAutoSchedule,
  onMoveCard,
  onSelectCard,
  draggingCardId,
  onCardDragStart,
  onCardDragEnd
}: BoardViewProps) {
  const [mode, setMode] = useState<"board" | "list" | "timeline">("board");
  const visiblePoints = cards.reduce((sum, card) => sum + card.storyPoints, 0);
  const doneCount = cards.filter((card) => card.status === "done").length;

  return (
    <section className="board-panel">
      <div className="project-product-header" style={{ "--project-color": project.color } as CSSProperties}>
        <div>
          <p className="eyebrow">Jira-style project</p>
          <h2>{project.name} work</h2>
          <p className="section-subtitle">{cards.length}/{totalCards} issues · {visiblePoints} story points · {doneCount} done</p>
        </div>
        <div className="project-header-actions">
          <div className="view-switch" aria-label="작업 보기 전환">
            <button className={mode === "board" ? "active" : ""} onClick={() => setMode("board")}>Board</button>
            <button className={mode === "list" ? "active" : ""} onClick={() => setMode("list")}>List</button>
            <button className={mode === "timeline" ? "active" : ""} onClick={() => setMode("timeline")}>Timeline</button>
          </div>
          <button className="ghost-button" onClick={onAutoSchedule}>자동 배치</button>
        </div>
      </div>
      <div className="board-toolbar">
        <input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="이슈 키, 제목, 라벨 검색" aria-label="이슈 검색" />
        <select value={issueTypeFilter} onChange={(event) => onIssueTypeFilterChange(event.target.value as "All" | IssueType)} aria-label="이슈 타입 필터">
          <option>All</option>
          {issueTypes.map((type) => <option key={type}>{type}</option>)}
        </select>
        <select value={assigneeFilter} onChange={(event) => onAssigneeFilterChange(event.target.value)} aria-label="담당자 필터">
          <option>All</option>
          {assignees.map((assignee) => <option key={assignee}>{assignee}</option>)}
        </select>
      </div>
      {mode === "board" && (
        <div className="kanban-board" aria-label="카드 보드">
          {columns.map((column) => {
            const columnCards = cards.filter((card) => card.status === column.key);
            const points = columnCards.reduce((sum, card) => sum + card.storyPoints, 0);
            const isOverLimit = column.wipLimit !== undefined && columnCards.length > column.wipLimit;
            return (
              <section
                className={`kanban-column ${isOverLimit ? "over-limit" : ""}`}
                key={column.key}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                  event.currentTarget.classList.add("drag-over");
                }}
                onDragLeave={(event) => event.currentTarget.classList.remove("drag-over")}
                onDrop={(event) => {
                  event.currentTarget.classList.remove("drag-over");
                  const cardId = event.dataTransfer.getData("text/plain");
                  if (cardId) onMoveCard(cardId, column.key);
                }}
              >
                <div className="column-title">
                  <div>
                    <span>{column.label}</span>
                    <small>{column.description}</small>
                  </div>
                  <div className="column-counts">
                    <span>{columnCards.length}</span>
                    {column.wipLimit && <small>WIP {column.wipLimit}</small>}
                    <small>{points} SP</small>
                  </div>
                </div>
                {columnCards.map((card) => (
                  <WorkCard
                    key={card.id}
                    card={card}
                    project={getProject(projects, card.projectId)}
                    isDragging={draggingCardId === card.id}
                    onSelect={onSelectCard}
                    onDragStart={onCardDragStart}
                    onDragEnd={onCardDragEnd}
                  />
                ))}
              </section>
            );
          })}
        </div>
      )}

      {mode === "list" && (
        <div className="issue-table" role="table" aria-label="이슈 목록">
          <div className="issue-table-row issue-table-head" role="row">
            <span>Key</span>
            <span>Summary</span>
            <span>Status</span>
            <span>Assignee</span>
            <span>Priority</span>
            <span>Due</span>
          </div>
          {cards.map((card) => (
            <button className="issue-table-row" role="row" key={card.id} onClick={() => onSelectCard(card.id)}>
              <span>{card.id}</span>
              <strong>{card.title}</strong>
              <span>{columns.find((column) => column.key === card.status)?.label}</span>
              <span>{card.assignee}</span>
              <span className={`priority-text priority-${card.priority.toLowerCase()}`}>{card.priority}</span>
              <span>{card.endDate}</span>
            </button>
          ))}
        </div>
      )}

      {mode === "timeline" && (
        <div className="timeline-view" aria-label="타임라인">
          {cards.map((card) => (
            <button className="timeline-row" key={card.id} onClick={() => onSelectCard(card.id)}>
              <span>{card.id}</span>
              <strong>{card.title}</strong>
              <i style={{ "--project-color": getProject(projects, card.projectId).color } as CSSProperties}>
                {card.startDate.slice(5)} → {card.endDate.slice(5)}
              </i>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
