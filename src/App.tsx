import type { PointerEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { CardDetail } from "./components/CardDetail";
import { BoardView } from "./components/BoardView";
import { DocsView } from "./components/DocsView";
import { InsightsView } from "./components/InsightsView";
import { PlannerView } from "./components/PlannerView";
import { Sidebar } from "./components/Sidebar";
import { Toast } from "./components/Toast";
import { TopNavigation } from "./components/TopNavigation";
import { days, endHour, hourHeight, initialState, startHour, storageKey } from "./data";
import { usePersistentState } from "./hooks/usePersistentState";
import type { AppState, Card, Category, DocPage, DocType, IssueType, Priority, Status, TimerState, View } from "./types";
import { clamp, formatClock, formatFocus, getMetrics } from "./utils";

type InteractionState = {
  mode: "moving" | "resizing";
  title: string;
  detail: string;
} | null;

export default function App() {
  const [view, setView] = useState<View>("workspace");
  const [state, setState] = usePersistentState<AppState>(storageKey, initialState);
  const [selectedCardId, setSelectedCardId] = useState(initialState.cards[0].id);
  const [selectedDocId, setSelectedDocId] = useState(initialState.docs[0].id);
  const [search, setSearch] = useState("");
  const [issueTypeFilter, setIssueTypeFilter] = useState<"All" | IssueType>("All");
  const [assigneeFilter, setAssigneeFilter] = useState<"All" | string>("All");
  const [toast, setToast] = useState("");
  const [timer, setTimer] = useState<TimerState>({ cardId: null, remaining: 0, running: false });
  const [interaction, setInteraction] = useState<InteractionState>(null);
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [plannerInteractionId, setPlannerInteractionId] = useState<string | null>(null);

  const selectedCard = state.cards.find((card) => card.id === selectedCardId) ?? state.cards[0];
  const selectedDoc = state.docs.find((doc) => doc.id === selectedCard.documentId) ?? state.docs.find((doc) => doc.cardIds.includes(selectedCard.id));
  const metrics = useMemo(() => getMetrics(state.cards), [state.cards]);
  const visibleCards = useMemo(() => {
    const query = search.trim().toLowerCase();
    return state.cards.filter((card) => {
      const matchesSearch = !query ||
        card.id.toLowerCase().includes(query) ||
        card.title.toLowerCase().includes(query) ||
        card.labels.some((label) => label.toLowerCase().includes(query));
      const matchesType = issueTypeFilter === "All" || card.issueType === issueTypeFilter;
      const matchesAssignee = assigneeFilter === "All" || card.assignee === assigneeFilter;
      return matchesSearch && matchesType && matchesAssignee;
    });
  }, [assigneeFilter, issueTypeFilter, search, state.cards]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    if (!timer.running) return;
    const interval = window.setInterval(() => {
      setTimer((current) => {
        if (current.remaining <= 1) {
          window.clearInterval(interval);
          setToast("집중 세션이 끝났어요.");
          return { ...current, remaining: 0, running: false };
        }
        return { ...current, remaining: current.remaining - 1 };
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timer.running]);

  function updateCard(cardId: string, patch: Partial<Card>) {
    setState((current) => ({
      ...current,
      cards: current.cards.map((card) => card.id === cardId ? { ...card, ...patch } : card)
    }));
  }

  function updateDoc(docId: string, patch: Partial<DocPage>) {
    setState((current) => ({
      ...current,
      docs: current.docs.map((doc) => doc.id === docId ? { ...doc, ...patch } : doc)
    }));
  }

  function beginDrag(card: Card) {
    setSelectedCardId(card.id);
    setDraggingCardId(card.id);
    setInteraction({
      mode: "moving",
      title: card.title,
      detail: "놓을 컬럼이나 시간 칸 위로 이동하세요"
    });
  }

  function clearInteraction() {
    setDraggingCardId(null);
    setPlannerInteractionId(null);
    setInteraction(null);
  }

  function createProject(name: string, color: string) {
    const key = name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase() || "PRJ";
    const project = {
      id: `prj-${Date.now()}`,
      name,
      key,
      color
    };
    setState((current) => ({ ...current, projects: [...current.projects, project] }));
    setToast(`${name} 프로젝트를 추가했어요.`);
  }

  function createCard(input: {
    title: string;
    projectId: string;
    category: Category;
    issueType: IssueType;
    priority: Priority;
    assignee: string;
    storyPoints: number;
    minutes: number;
  }) {
    const project = state.projects.find((item) => item.id === input.projectId) ?? state.projects[0];
    const id = `${project.key}-${Math.floor(100 + Math.random() * 900)}`;
    const docId = `DOC-${state.docs.length + 1}`;
    const card: Card = {
      id,
      title: input.title,
      description: "빠른 생성으로 발행된 이슈입니다. 상세 패널에서 설명, 라벨, 서브태스크를 정리하세요.",
      projectId: input.projectId,
      category: input.category,
      issueType: input.issueType,
      status: "backlog",
      priority: input.priority,
      assignee: input.assignee,
      reporter: "Uichan",
      sprint: "Backlog",
      storyPoints: input.storyPoints,
      startDate: "2026-06-11",
      endDate: "2026-06-20",
      dueDate: "2026-06-20",
      documentId: docId,
      labels: ["triage"],
      component: "Inbox",
      linkedIssueIds: [],
      subtasks: [
        { id: `${id}-1`, title: "요구사항 정리", done: false },
        { id: `${id}-2`, title: "일정 배치", done: false }
      ],
      updatedAt: "2026-06-10",
      minutes: input.minutes,
      pomodoros: 0,
      day: null,
      start: null,
      page: `${input.title}에 대한 요구사항, 진행 로그, 회고를 기록하는 연결 페이지입니다.`
    };

    setState((current) => ({
      ...current,
      cards: [card, ...current.cards],
      docs: [{
        id: docId,
        title: `${input.title} 노트`,
        category: input.category,
        projectId: input.projectId,
        type: "markdown",
        body: `# ${input.title}\n\n## Context\n새 카드에서 자동 생성된 문서입니다.\n\n## Decisions\n- 결정 사항을 정리하세요.\n\n## Next actions\n- [ ] 다음 액션 추가`,
        canvasElements: [],
        cardIds: [id]
      }, ...current.docs]
    }));
    setSelectedCardId(id);
    setSelectedDocId(docId);
    setToast("새 카드를 발행했어요.");
  }

  function moveCard(cardId: string, status: Status) {
    updateCard(cardId, { status });
    clearInteraction();
    setToast("카드 상태를 변경했어요.");
  }

  function scheduleCard(cardId: string, day: number, start: number) {
    updateCard(cardId, { day, start });
    setSelectedCardId(cardId);
    clearInteraction();
    setToast(`${days[day]}요일 ${formatClock(start * 60)}에 배치했어요.`);
  }

  function autoSchedule() {
    let day = 0;
    let hour = 10;
    setState((current) => ({
      ...current,
      cards: current.cards.map((card) => {
        if (card.day !== null) return card;
        const scheduled = { ...card, day, start: hour };
        hour += Math.ceil(card.minutes / 60);
        if (hour >= 17) {
          day = (day + 1) % days.length;
          hour = 10;
        }
        return scheduled;
      })
    }));
    setToast("배치되지 않은 카드를 빈 시간에 자동 배치했어요.");
  }

  function startTimer(card: Card) {
    setTimer({ cardId: card.id, remaining: card.minutes * 60, running: true });
    updateCard(card.id, { pomodoros: card.pomodoros + 1 });
    setToast(`${card.minutes}분 집중을 시작했어요.`);
  }

  function resetTimer(card: Card) {
    setTimer({ cardId: card.id, remaining: card.minutes * 60, running: false });
  }

  function toggleSubtask(cardId: string, subtaskId: string) {
    setState((current) => ({
      ...current,
      cards: current.cards.map((card) => card.id === cardId ? {
        ...card,
        subtasks: card.subtasks.map((subtask) => subtask.id === subtaskId ? { ...subtask, done: !subtask.done } : subtask),
        updatedAt: "2026-06-10"
      } : card)
    }));
  }

  function createDoc(type: DocType) {
    const project = state.projects[0];
    const doc: DocPage = {
      id: `DOC-${state.docs.length + 1}`,
      title: type === "markdown" ? "새 Markdown 문서" : "새 Canvas 문서",
      category: "Product",
      projectId: project.id,
      type,
      body: type === "markdown" ? "# 새 문서\n\n- [ ] 내용을 작성하세요." : "",
      canvasElements: type === "canvas" ? [{
        id: `el-${Date.now()}`,
        type: "note",
        x: 80,
        y: 80,
        width: 180,
        height: 90,
        text: "새 아이디어",
        color: project.color
      }] : [],
      cardIds: []
    };
    setState((current) => ({ ...current, docs: [doc, ...current.docs] }));
    setSelectedDocId(doc.id);
    setToast(`${type === "markdown" ? "Markdown" : "Canvas"} 문서를 추가했어요.`);
  }

  function handlePlannerPointer(event: PointerEvent<HTMLElement>, card: Card) {
    const target = event.target as HTMLElement;
    const isResize = target.classList.contains("resize-handle");
    const grid = document.querySelector(".calendar-grid");
    if (!grid) return;

    const bounds = grid.getBoundingClientRect();
    const startY = event.clientY;
    const startHeight = event.currentTarget.offsetHeight;
    const activeElement = event.currentTarget;
    setSelectedCardId(card.id);
    setPlannerInteractionId(card.id);
    setInteraction({
      mode: isResize ? "resizing" : "moving",
      title: card.title,
      detail: isResize ? `${card.minutes}분 블록을 조정 중` : "캘린더 격자에서 새 위치를 찾는 중"
    });
    event.preventDefault();
    activeElement.setPointerCapture(event.pointerId);

    function onMove(moveEvent: globalThis.PointerEvent) {
      if (isResize) {
        const minutes = clamp(Math.round((startHeight + moveEvent.clientY - startY) / 15) * 15, 30, 240);
        updateCard(card.id, { minutes });
        setInteraction({
          mode: "resizing",
          title: card.title,
          detail: `${minutes}분 블록으로 확장 중`
        });
        return;
      }

      const x = moveEvent.clientX - bounds.left - 72;
      const y = moveEvent.clientY - bounds.top - 43;
      const dayWidth = Math.max(1, (bounds.width - 72) / 5);
      const nextDay = clamp(Math.floor(x / dayWidth), 0, 4);
      const nextStart = clamp(startHour + Math.round(y / hourHeight), startHour, endHour - 1);
      updateCard(card.id, {
        day: nextDay,
        start: nextStart
      });
      setInteraction({
        mode: "moving",
        title: card.title,
        detail: `${days[nextDay]}요일 ${formatClock(nextStart * 60)}로 이동 중`
      });
    }

    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      if (activeElement.hasPointerCapture(event.pointerId)) {
        activeElement.releasePointerCapture(event.pointerId);
      }
      clearInteraction();
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  return (
    <div className="app-shell">
      <Sidebar projects={state.projects} onCreateProject={createProject} onCreateCard={createCard} />

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">React MVP</p>
            <h1>카드를 시간으로 옮기고, 문서와 집중 기록까지 이어가기</h1>
          </div>
          <div className="today-chip">
            <span>오늘 집중</span>
            <strong>{formatFocus(metrics.focusMinutes)}</strong>
          </div>
        </header>
        <TopNavigation view={view} onViewChange={setView} />
        {interaction && (
          <div className={`interaction-banner ${interaction.mode}`} role="status">
            <strong>{interaction.mode === "moving" ? "이동 중" : "시간 조정 중"}</strong>
            <span>{interaction.title}</span>
            <small>{interaction.detail}</small>
          </div>
        )}

        {view === "workspace" && (
          <section className="workspace-grid">
            <BoardView
              cards={visibleCards}
              projects={state.projects}
              totalCards={state.cards.length}
              search={search}
              issueTypeFilter={issueTypeFilter}
              assigneeFilter={assigneeFilter}
              onSearchChange={setSearch}
              onIssueTypeFilterChange={setIssueTypeFilter}
              onAssigneeFilterChange={setAssigneeFilter}
              onAutoSchedule={autoSchedule}
              onMoveCard={moveCard}
              onSelectCard={setSelectedCardId}
              draggingCardId={draggingCardId}
              onCardDragStart={beginDrag}
              onCardDragEnd={clearInteraction}
            />
            <CardDetail
              card={selectedCard}
              doc={selectedDoc}
              docs={state.docs}
              projects={state.projects}
              timer={timer}
              onStart={startTimer}
              onReset={resetTimer}
              onUpdate={(cardId, patch) => updateCard(cardId, { ...patch, updatedAt: "2026-06-10" })}
              onToggleSubtask={toggleSubtask}
              onOpenDoc={(docId) => {
                setSelectedDocId(docId);
                setView("docs");
              }}
            />
          </section>
        )}

        {view === "planner" && (
          <PlannerView
            cards={state.cards}
            projects={state.projects}
            onSelectCard={setSelectedCardId}
            onScheduleCard={scheduleCard}
            onPlannerPointer={handlePlannerPointer}
            activeCardId={plannerInteractionId}
            draggingCardId={draggingCardId}
            interactionMode={interaction?.mode ?? null}
            onCardDragStart={beginDrag}
            onCardDragEnd={clearInteraction}
          />
        )}

        {view === "docs" && (
          <DocsView
            docs={state.docs}
            cards={state.cards}
            projects={state.projects}
            selectedDocId={selectedDocId}
            onSelectDoc={setSelectedDocId}
            onNewPage={createDoc}
            onUpdateDoc={updateDoc}
          />
        )}

        {view === "insights" && (
          <InsightsView
            metrics={metrics}
            review={state.review}
            onReviewChange={(review) => setState((current) => ({ ...current, review }))}
          />
        )}
      </main>

      <Toast message={toast} />
    </div>
  );
}
