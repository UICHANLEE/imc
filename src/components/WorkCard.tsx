import type { CSSProperties } from "react";
import type { Card, Project } from "../types";
import { getDateRange, getInitials, getPriorityIcon, getSubtaskProgress } from "../utils";

type WorkCardProps = {
  card: Card;
  project: Project;
  isDragging?: boolean;
  onSelect: (id: string) => void;
  onDragStart?: (card: Card) => void;
  onDragEnd?: () => void;
};

export function WorkCard({ card, project, isDragging, onSelect, onDragStart, onDragEnd }: WorkCardProps) {
  const progress = getSubtaskProgress(card);

  return (
    <article
      className={`card ${isDragging ? "is-dragging" : ""}`}
      data-category={card.category}
      data-priority={card.priority}
      data-issue-type={card.issueType}
      style={{ "--project-color": project.color } as CSSProperties}
      draggable
      aria-label={`${card.id} ${card.title} 카드. 드래그해서 상태나 일정으로 이동`}
      title="드래그해서 이동"
      onClick={() => onSelect(card.id)}
      onDragStart={(event) => {
        event.dataTransfer.setData("text/plain", card.id);
        event.dataTransfer.effectAllowed = "move";
        onDragStart?.(card);
      }}
      onDragEnd={() => onDragEnd?.()}
    >
      <div className="card-topline">
        <span className="issue-key"><i style={{ background: project.color }} />{card.id}</span>
        <span className="issue-type">{card.issueType}</span>
      </div>
      <h3>{card.title}</h3>
      <p className="card-description">{card.description}</p>
      <div className="card-project-row">
        <span className="project-badge" style={{ color: project.color }}>{project.name}</span>
        <span>{getDateRange(card)}</span>
      </div>
      <div className="label-row">
        {card.labels.slice(0, 2).map((label) => <span className="label-chip" key={label}>{label}</span>)}
      </div>
      <div className="progress-row">
        <span>Subtasks</span>
        <strong>{progress}%</strong>
      </div>
      <div className="progress-track">
        <i style={{ width: `${progress}%` }} />
      </div>
      <div className="card-footer">
        <span className="priority-mark"><b>{getPriorityIcon(card.priority)}</b>{card.priority}</span>
        <span className="story-points">{card.storyPoints} SP</span>
        <span className="due-date">{card.endDate.slice(5)}</span>
        <span className="avatar" title={`Assignee: ${card.assignee}`}>{getInitials(card.assignee)}</span>
      </div>
    </article>
  );
}
