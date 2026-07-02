import type { View } from "../types";

type TopNavigationProps = {
  view: View;
  onViewChange: (view: View) => void;
};

const navItems: { key: View; label: string; caption: string }[] = [
  { key: "workspace", label: "워크스페이스", caption: "Jira board" },
  { key: "planner", label: "캘린더 플래너", caption: "Time blocks" },
  { key: "docs", label: "문서 허브", caption: "Confluence docs" },
  { key: "insights", label: "집중 통계", caption: "Focus report" }
];

export function TopNavigation({ view, onViewChange }: TopNavigationProps) {
  return (
    <nav className="top-nav" aria-label="주요 메뉴">
      {navItems.map((item) => (
        <button key={item.key} className={`top-nav-item ${view === item.key ? "active" : ""}`} onClick={() => onViewChange(item.key)}>
          <span>{item.label}</span>
          <small>{item.caption}</small>
        </button>
      ))}
    </nav>
  );
}
