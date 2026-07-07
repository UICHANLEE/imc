import { useMemo, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { Tasks } from "./components/Tasks";
import { Docs } from "./components/Docs";
import { Canvas } from "./components/Canvas";
import { initialState, storageKey } from "./data";
import { usePersistentState } from "./hooks/usePersistentState";
import type {
  AppState,
  BoardPriority,
  CanvasElement,
  CanvasNode,
  Card,
  DocPage,
  Status,
  Task,
  ViewType
} from "./types";

const statusToTaskStatus = (status: Status): Task["status"] => {
  if (status === "done") return "done";
  if (status === "progress" || status === "review") return "in-progress";
  return "todo";
};

const taskStatusToStatus = (status: Task["status"]): Status => {
  if (status === "done") return "done";
  if (status === "in-progress") return "progress";
  return "selected";
};

const priorityToBoardPriority = (priority: Card["priority"]): BoardPriority => {
  if (priority === "Highest" || priority === "High") return "HIGH";
  if (priority === "Medium") return "MEDIUM";
  return "LOW";
};

const avatarFor = (name: string) => {
  if (name === "Unassigned") return [];
  return [`https://i.pravatar.cc/150?u=${encodeURIComponent(name)}`];
};

const docToCanvasNodes = (doc?: DocPage): CanvasNode[] => {
  if (!doc || doc.canvasElements.length === 0) {
    return [
      { id: "node-1", type: "rectangle", x: 400, y: 300, width: 150, height: 60, text: "Start" },
      { id: "node-2", type: "ellipse", x: 650, y: 280, width: 180, height: 80, text: "Check Auth" }
    ];
  }

  return doc.canvasElements.map((element) => ({
    id: element.id,
    type: element.type === "diamond" ? "ellipse" : element.type === "text" || element.type === "note" ? "text" : "rectangle",
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height,
    text: element.text,
    color: element.color
  }));
};

const canvasNodesToElements = (nodes: CanvasNode[]): CanvasElement[] =>
  nodes.map((node) => ({
    id: node.id,
    type: node.type === "ellipse" ? "diamond" : node.type,
    x: node.x,
    y: node.y,
    width: node.width,
    height: node.height,
    text: node.text ?? "",
    color: node.color ?? "#6366f1"
  }));

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");
  const [state, setState] = usePersistentState<AppState>(storageKey, initialState);
  const [selectedDocId, setSelectedDocId] = useState(state.docs[0]?.id ?? "");

  const selectedDoc = state.docs.find((doc) => doc.id === selectedDocId) ?? state.docs[0];

  const tasks = useMemo<Task[]>(() => {
    return state.cards.map((card) => {
      const project = state.projects.find((item) => item.id === card.projectId);
      const linkedDoc = state.docs.find((doc) => doc.id === card.documentId);

      return {
        id: card.id,
        cardId: card.id,
        docId: card.documentId,
        title: card.title,
        description: card.description,
        status: statusToTaskStatus(card.status),
        priority: priorityToBoardPriority(card.priority),
        comments: card.subtasks.filter((subtask) => !subtask.done).length,
        attachments: linkedDoc ? 1 : 0,
        assignees: avatarFor(card.assignee),
        assigneeName: card.assignee,
        projectId: card.projectId,
        projectName: project?.name,
        projectColor: project?.color,
        issueType: card.issueType,
        startDate: card.startDate,
        endDate: card.endDate
      };
    });
  }, [state.cards, state.docs, state.projects]);

  const handleTaskStatusChange = (taskId: string, status: Task["status"]) => {
    setState((current) => ({
      ...current,
      cards: current.cards.map((card) =>
        card.id === taskId ? { ...card, status: taskStatusToStatus(status), updatedAt: new Date().toISOString().slice(0, 10) } : card
      )
    }));
  };

  const handleCreateTask = (status: Task["status"]) => {
    const project = state.projects[0];
    const id = `${project.key}-${Math.floor(Date.now() % 100000)}`;
    const docId = `DOC-${Date.now().toString(36).toUpperCase()}`;

    const card: Card = {
      id,
      title: "New Jira-style card",
      description: "Add scope, dates, assignee, and linked documentation.",
      projectId: project.id,
      category: "Product",
      issueType: "Task",
      status: taskStatusToStatus(status),
      priority: "Medium",
      assignee: "Uichan",
      reporter: "Uichan",
      sprint: "Sprint 1",
      storyPoints: 3,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      documentId: docId,
      labels: ["new"],
      component: "Workspace",
      linkedIssueIds: [],
      subtasks: [],
      updatedAt: new Date().toISOString().slice(0, 10),
      minutes: 50,
      pomodoros: 0,
      day: null,
      start: null,
      page: "Linked Markdown document is ready."
    };

    const doc: DocPage = {
      id: docId,
      title: `${id} Notes`,
      category: "Product",
      projectId: project.id,
      type: "markdown",
      body: `# ${id} Notes\n\n## Summary\n- Define acceptance criteria\n- Link related cards\n- Capture decisions`,
      canvasElements: [],
      cardIds: [id]
    };

    setState((current) => ({
      ...current,
      cards: [...current.cards, card],
      docs: [...current.docs, doc]
    }));
    setSelectedDocId(docId);
  };

  const handleOpenDoc = (docId?: string) => {
    if (!docId) return;
    setSelectedDocId(docId);
    setCurrentView("docs");
  };

  const handleUpdateDocBody = (docId: string, body: string) => {
    setState((current) => ({
      ...current,
      docs: current.docs.map((doc) => (doc.id === docId ? { ...doc, body } : doc))
    }));
  };

  const handleUpdateCanvasNodes = (nodes: CanvasNode[]) => {
    if (!selectedDoc) return;
    setState((current) => ({
      ...current,
      docs: current.docs.map((doc) =>
        doc.id === selectedDoc.id ? { ...doc, type: "canvas", canvasElements: canvasNodesToElements(nodes) } : doc
      )
    }));
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30">
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Sidebar currentView={currentView} onChangeView={setCurrentView} />

        <main className="flex-1 overflow-auto bg-slate-950 pb-16 md:pb-0 relative">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/10 via-slate-950 to-slate-950"></div>
          <div className="relative z-0 h-full w-full">
            {currentView === "dashboard" && (
              <Dashboard tasks={tasks} docs={state.docs} onChangeView={setCurrentView} onOpenDoc={handleOpenDoc} />
            )}
            {currentView === "tasks" && (
              <Tasks tasks={tasks} onTaskStatusChange={handleTaskStatusChange} onCreateTask={handleCreateTask} onOpenDoc={handleOpenDoc} />
            )}
            {currentView === "docs" && (
              <Docs
                docs={state.docs}
                cards={state.cards}
                projects={state.projects}
                selectedDoc={selectedDoc}
                onSelectDoc={setSelectedDocId}
                onUpdateDocBody={handleUpdateDocBody}
                onChangeView={setCurrentView}
              />
            )}
            {currentView === "canvas" && (
              <Canvas nodes={docToCanvasNodes(selectedDoc)} edges={[]} onNodesChange={handleUpdateCanvasNodes} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
