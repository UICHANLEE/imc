import type { AppState, Category, IssueType, Priority, Project, Status } from "./types";

export const columns: { key: Status; label: string; wipLimit?: number; description: string }[] = [
  { key: "backlog", label: "Backlog", description: "아직 우선순위 조정 전" },
  { key: "selected", label: "Selected", wipLimit: 4, description: "이번 스프린트 후보" },
  { key: "progress", label: "In Progress", wipLimit: 3, description: "현재 작업 중" },
  { key: "review", label: "Review", wipLimit: 2, description: "검토와 문서 정리" },
  { key: "done", label: "Done", description: "완료된 작업" }
];

export const categories: Category[] = ["Product", "Design", "Development", "Personal"];
export const issueTypes: IssueType[] = ["Epic", "Story", "Task", "Bug", "Sub-task"];
export const priorities: Priority[] = ["Highest", "High", "Medium", "Low"];
export const assignees = ["Uichan", "Mina", "Joon", "Unassigned"];
export const days = ["월", "화", "수", "목", "금"];
export const startHour = 8;
export const endHour = 20;
export const hourHeight = 60;
export const storageKey = "imc-react-state-v4";

export const initialProjects: Project[] = [
  { id: "prj-imc", name: "It's My Calendar", key: "IMC", color: "#0c66e4" },
  { id: "prj-mobile", name: "Mobile App", key: "MOB", color: "#7c3aed" },
  { id: "prj-growth", name: "Growth Ops", key: "GRO", color: "#0f766e" }
];

export const initialState: AppState = {
  version: 4,
  lastSavedAt: null,
  projects: initialProjects,
  review: "",
  cards: [],
  docs: []
};
