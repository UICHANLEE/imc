import type { CSSProperties, PointerEvent } from "react";
import { categories, days, endHour, startHour } from "../data";
import type { Card, Project } from "../types";
import { formatClock, formatHour, getProject } from "../utils";
import { WorkCard } from "./WorkCard";

type PlannerViewProps = {
  cards: Card[];
  selectedProjectId: string;
  projects: Project[];
  onSelectCard: (id: string) => void;
  onScheduleCard: (id: string, day: number, start: number) => void;
  onPlannerPointer: (event: PointerEvent<HTMLElement>, card: Card) => void;
  activeCardId?: string | null;
  draggingCardId?: string | null;
  interactionMode?: "moving" | "resizing" | null;
  onCardDragStart?: (card: Card) => void;
  onCardDragEnd?: () => void;
};

export function PlannerView({
  cards,
  selectedProjectId,
  projects,
  onSelectCard,
  onScheduleCard,
  onPlannerPointer,
  activeCardId,
  draggingCardId,
  interactionMode,
  onCardDragStart,
  onCardDragEnd
}: PlannerViewProps) {
  const project = getProject(projects, selectedProjectId);
  return (
    <section>
      <div className="section-heading project-view-heading" style={{ "--project-color": project.color } as CSSProperties}>
        <div>
          <p className="eyebrow">Calendar Planner</p>
          <h2>{project.name} 주간 계획</h2>
          <p className="section-subtitle">Jira 이슈를 시간 블록으로 변환해 일정과 집중 시간을 함께 관리합니다.</p>
        </div>
        <div className="legend">
          {categories.map((category) => <span key={category}><i className={`dot ${category.toLowerCase()}`}></i>{category}</span>)}
        </div>
      </div>
      <div className="planner-layout">
        <aside className="unscheduled">
          <h3>배치할 카드</h3>
          {cards.filter((card) => card.day === null).map((card) => (
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
        </aside>
        <div className="calendar" aria-label="주간 캘린더">
          <div className="calendar-grid">
            <div className="calendar-head"></div>
            {days.map((day) => <div className="calendar-head" key={day}>{day}요일</div>)}
            {Array.from({ length: endHour - startHour }, (_, index) => startHour + index).map((hour) => (
              <HourRow key={hour} hour={hour} onScheduleCard={onScheduleCard} />
            ))}
            {cards.filter((card) => card.day !== null && card.start !== null).map((card) => (
              <article
                key={card.id}
                className={`planner-card ${activeCardId === card.id ? "is-manipulating" : ""}`}
                data-category={card.category}
                data-priority={card.priority}
                data-interaction={activeCardId === card.id ? interactionMode ?? undefined : undefined}
                style={{
                  gridColumn: (card.day ?? 0) + 2,
                  gridRow: (card.start ?? startHour) - startHour + 2,
                  height: Math.max(30, card.minutes),
                  "--project-color": getProject(projects, card.projectId).color
                } as CSSProperties}
                onClick={() => onSelectCard(card.id)}
                onPointerDown={(event) => onPlannerPointer(event, card)}
              >
                <strong>{card.title}</strong>
                <span>{formatClock((card.start ?? startHour) * 60)} · {card.minutes}m</span>
                <i className="resize-handle" aria-hidden="true" />
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function HourRow({ hour, onScheduleCard }: {
  hour: number;
  onScheduleCard: (id: string, day: number, start: number) => void;
}) {
  return (
    <>
      <div className="time-cell">{formatHour(hour)}</div>
      {days.map((_, day) => (
        <div
          key={`${hour}-${day}`}
          className="calendar-cell"
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "move";
            event.currentTarget.classList.add("drag-over");
          }}
          onDragLeave={(event) => event.currentTarget.classList.remove("drag-over")}
          onDrop={(event) => {
            event.currentTarget.classList.remove("drag-over");
            const cardId = event.dataTransfer.getData("text/plain");
            if (cardId) onScheduleCard(cardId, day, hour);
          }}
        />
      ))}
    </>
  );
}
