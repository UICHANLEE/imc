import { days } from "./data";
import type { Card, Metrics, Project } from "./types";

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

export function formatFocus(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `${hours}h ${String(rest).padStart(2, "0")}m`;
}

export function formatHour(hour: number) {
  return `${String(hour).padStart(2, "0")}:00`;
}

export function formatClock(totalMinutes: number) {
  const hour = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function formatSchedule(card: Card) {
  if (card.day === null || card.start === null) {
    return "아직 플래너에 배치되지 않았습니다. 캘린더 플래너에서 빈 시간으로 드래그하세요.";
  }
  const start = card.start * 60;
  const end = start + card.minutes;
  return `${days[card.day]}요일 ${formatClock(start)} - ${formatClock(end)}에 ${card.minutes}분 블록으로 배치되어 있습니다.`;
}

export function getMetrics(cards: Card[]): Metrics {
  return {
    plannedMinutes: cards.filter((card) => card.day !== null).reduce((sum, card) => sum + card.minutes, 0),
    focusMinutes: cards.reduce((sum, card) => sum + card.pomodoros * card.minutes, 0),
    pomodoros: cards.reduce((sum, card) => sum + card.pomodoros, 0),
    done: cards.filter((card) => card.status === "done").length
  };
}

export function getSubtaskProgress(card: Card) {
  if (card.subtasks.length === 0) return 0;
  return Math.round((card.subtasks.filter((subtask) => subtask.done).length / card.subtasks.length) * 100);
}

export function getInitials(name: string) {
  if (name === "Unassigned") return "UA";
  return name.slice(0, 2).toUpperCase();
}

export function getProject(projects: Project[], projectId: string) {
  return projects.find((project) => project.id === projectId) ?? projects[0];
}

export function getPriorityIcon(priority: Card["priority"]) {
  if (priority === "Highest") return "↑↑";
  if (priority === "High") return "↑";
  if (priority === "Medium") return "→";
  return "↓";
}

export function getDateRange(card: Card) {
  return `${card.startDate.slice(5)} - ${card.endDate.slice(5)}`;
}

export function markdownToBlocks(markdown: string) {
  return markdown.split("\n").map((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return { id: index, type: "space", text: "" };
    if (trimmed.startsWith("### ")) return { id: index, type: "h3", text: trimmed.slice(4) };
    if (trimmed.startsWith("## ")) return { id: index, type: "h2", text: trimmed.slice(3) };
    if (trimmed.startsWith("# ")) return { id: index, type: "h1", text: trimmed.slice(2) };
    if (trimmed.startsWith("- [x] ")) return { id: index, type: "checked", text: trimmed.slice(6) };
    if (trimmed.startsWith("- [ ] ")) return { id: index, type: "todo", text: trimmed.slice(6) };
    if (trimmed.startsWith("- ")) return { id: index, type: "li", text: trimmed.slice(2) };
    return { id: index, type: "p", text: trimmed };
  });
}
