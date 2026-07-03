export type View = "jira" | "confluence" | "planner" | "insights";
export type Status = "backlog" | "selected" | "progress" | "review" | "done";
export type Category = "Product" | "Design" | "Development" | "Personal";
export type Priority = "Highest" | "High" | "Medium" | "Low";
export type IssueType = "Epic" | "Story" | "Task" | "Bug" | "Sub-task";
export type DocType = "markdown" | "canvas";
export type CanvasTool = "select" | "rectangle" | "diamond" | "note" | "text";

export type Project = {
  id: string;
  name: string;
  key: string;
  color: string;
};

export type Subtask = {
  id: string;
  title: string;
  done: boolean;
};

export type Card = {
  id: string;
  title: string;
  description: string;
  projectId: string;
  category: Category;
  issueType: IssueType;
  status: Status;
  priority: Priority;
  assignee: string;
  reporter: string;
  sprint: string;
  storyPoints: number;
  startDate: string;
  endDate: string;
  dueDate: string;
  documentId: string;
  labels: string[];
  component: string;
  linkedIssueIds: string[];
  subtasks: Subtask[];
  updatedAt: string;
  minutes: number;
  pomodoros: number;
  day: number | null;
  start: number | null;
  page: string;
};

export type CanvasElement = {
  id: string;
  type: Exclude<CanvasTool, "select">;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  color: string;
};

export type ExcalidrawSceneData = {
  elements: readonly unknown[];
  appState?: Record<string, unknown>;
  files?: Record<string, unknown>;
};

export type DocPage = {
  id: string;
  title: string;
  category: Category;
  projectId: string;
  type: DocType;
  body: string;
  excalidrawData?: ExcalidrawSceneData;
  canvasElements: CanvasElement[];
  cardIds: string[];
};

export type AppState = {
  projects: Project[];
  cards: Card[];
  docs: DocPage[];
  review: string;
};

export type TimerState = {
  cardId: string | null;
  remaining: number;
  running: boolean;
};

export type Metrics = {
  plannedMinutes: number;
  focusMinutes: number;
  pomodoros: number;
  done: number;
};
