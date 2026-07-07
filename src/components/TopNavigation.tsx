import type { View } from "../types";

type TopNavigationProps = {
  view: View;
  onViewChange: (view: View) => void;
};

const navItems: { key: View; label: string; caption: string }[] = [
  { key: "dashboard", label: "Home", caption: "Today · Activity · Focus" },
  { key: "jira", label: "Jira", caption: "Cards · Board · Issues" },
  { key: "confluence", label: "Confluence", caption: "Pages · Whiteboards" },
  { key: "planner", label: "계획", caption: "Calendar blocks" },
  { key: "insights", label: "리포트", caption: "Focus report" }
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
