import type { ReactNode } from "react";
import { assignees, columns, issueTypes, priorities } from "../data";
import type { Card, DocPage, IssueType, Priority, Project, Status, TimerState } from "../types";
import { formatSchedule, formatTimer, getInitials, getPriorityIcon, getProject, getSubtaskProgress } from "../utils";

type CardDetailProps = {
  card: Card;
  doc?: DocPage;
  docs: DocPage[];
  projects: Project[];
  timer: TimerState;
  onStart: (card: Card) => void;
  onReset: (card: Card) => void;
  onUpdate: (cardId: string, patch: Partial<Card>) => void;
  onToggleSubtask: (cardId: string, subtaskId: string) => void;
  onOpenDoc: (docId: string) => void;
};

export function CardDetail({ card, doc, docs, projects, timer, onStart, onReset, onUpdate, onToggleSubtask, onOpenDoc }: CardDetailProps) {
  const remaining = timer.cardId === card.id && timer.remaining > 0 ? timer.remaining : card.minutes * 60;
  const subtaskProgress = getSubtaskProgress(card);
  const project = getProject(projects, card.projectId);

  return (
    <section className="detail-panel">
      <div className="detail-header">
        <div>
          <p className="issue-key"><i style={{ background: project.color }} />{card.id} · {card.issueType}</p>
          <h2>{card.title}</h2>
          <p>{card.description}</p>
          <div className="detail-priority" data-priority={card.priority}>
            <b>{getPriorityIcon(card.priority)}</b>
            {card.priority} priority
          </div>
        </div>
        <div className="issue-actions">
          <button>Watch</button>
          <button>Share</button>
          <button>•••</button>
          <span className="avatar large" title={`Assignee: ${card.assignee}`}>{getInitials(card.assignee)}</span>
        </div>
      </div>

      <div className="detail-body">
        <section className="jira-description-block">
          <div className="panel-title">
            <h3>Description</h3>
            <button className="text-button">Edit</button>
          </div>
          <p>{card.description}</p>
        </section>

        <section className="field-grid">
          <Field label="Title">
            <input value={card.title} onChange={(event) => onUpdate(card.id, { title: event.target.value })} />
          </Field>
          <Field label="Project">
            <select value={card.projectId} onChange={(event) => onUpdate(card.id, { projectId: event.target.value })}>
              {projects.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select value={card.status} onChange={(event) => onUpdate(card.id, { status: event.target.value as Status })}>
              {columns.map((column) => <option value={column.key} key={column.key}>{column.label}</option>)}
            </select>
          </Field>
          <Field label="Issue type">
            <select value={card.issueType} onChange={(event) => onUpdate(card.id, { issueType: event.target.value as IssueType })}>
              {issueTypes.map((type) => <option key={type}>{type}</option>)}
            </select>
          </Field>
          <Field label="Priority">
            <select value={card.priority} onChange={(event) => onUpdate(card.id, { priority: event.target.value as Priority })}>
              {priorities.map((priority) => <option key={priority}>{priority}</option>)}
            </select>
          </Field>
          <Field label="Assignee">
            <select value={card.assignee} onChange={(event) => onUpdate(card.id, { assignee: event.target.value })}>
              {assignees.map((assignee) => <option key={assignee}>{assignee}</option>)}
            </select>
          </Field>
          <Field label="Start date">
            <input type="date" value={card.startDate} onChange={(event) => onUpdate(card.id, { startDate: event.target.value })} />
          </Field>
          <Field label="End date">
            <input type="date" value={card.endDate} onChange={(event) => onUpdate(card.id, { endDate: event.target.value, dueDate: event.target.value })} />
          </Field>
          <Field label="Story points">
            <input type="number" min="1" max="21" value={card.storyPoints} onChange={(event) => onUpdate(card.id, { storyPoints: Number(event.target.value) })} />
          </Field>
          <Field label="Confluence page">
            <select value={card.documentId} onChange={(event) => onUpdate(card.id, { documentId: event.target.value })}>
              {docs.map((item) => <option value={item.id} key={item.id}>{item.title}</option>)}
            </select>
          </Field>
          <Field label="Labels">
            <input value={card.labels.join(", ")} onChange={(event) => onUpdate(card.id, { labels: event.target.value.split(",").map((label) => label.trim()).filter(Boolean) })} />
          </Field>
          <Field label="Component">
            <input value={card.component} onChange={(event) => onUpdate(card.id, { component: event.target.value })} />
          </Field>
        </section>

        <section className="doc-preview">
          <div className="panel-title">
            <h3>연결된 Confluence 페이지</h3>
            <button className="text-button" onClick={() => doc && onOpenDoc(doc.id)} disabled={!doc}>{doc?.title ?? "새 페이지 필요"} 열기</button>
          </div>
          <p>{card.page}</p>
          <div className="label-row">
            {card.labels.map((label) => <span className="label-chip" key={label}>{label}</span>)}
          </div>
        </section>

        <section className="subtask-panel">
          <div className="panel-title">
            <h3>Subtasks</h3>
            <span>{subtaskProgress}% complete</span>
          </div>
          <div className="progress-track">
            <i style={{ width: `${subtaskProgress}%` }} />
          </div>
          <div className="subtask-list">
            {card.subtasks.map((subtask) => (
              <label className="subtask-item" key={subtask.id}>
                <input type="checkbox" checked={subtask.done} onChange={() => onToggleSubtask(card.id, subtask.id)} />
                <span>{subtask.title}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="timer-box">
          <div className="panel-title">
            <h3>뽀모도로 타이머</h3>
            <span>{card.minutes}분 집중 블록</span>
          </div>
          <div className="timer-display">{formatTimer(remaining)}</div>
          <div className="timer-actions">
            <button onClick={() => onStart(card)}>시작</button>
            <button className="secondary" onClick={() => onReset(card)}>초기화</button>
          </div>
        </section>

        <section className="schedule-box">
          <h3>일정 배치</h3>
          <p>{formatSchedule(card)}</p>
          <div className="card-meta">
            <span className="chip">Sprint: {card.sprint}</span>
            <span className="chip">Reporter: {card.reporter}</span>
            <span className="chip">Updated: {card.updatedAt}</span>
          </div>
        </section>

        <section className="activity-panel">
          <div className="panel-title">
            <h3>Activity</h3>
            <div className="activity-tabs">
              <button className="active">Comments</button>
              <button>History</button>
              <button>Work log</button>
            </div>
          </div>
          <div className="activity-comment">
            <span className="avatar">UI</span>
            <div>
              <strong>Uichan</strong>
              <p>Confluence 페이지와 Jira 카드가 연결되었습니다. 진행상황은 이슈 상태와 문서 링크를 기준으로 추적합니다.</p>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
