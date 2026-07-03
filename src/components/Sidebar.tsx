import type { FormEvent } from "react";
import { assignees, categories, issueTypes, priorities } from "../data";
import type { Card, Category, DocPage, IssueType, Priority, Project, View } from "../types";

type SidebarProps = {
  projects: Project[];
  selectedProjectId: string;
  cards: Card[];
  docs: DocPage[];
  view: View;
  onViewChange: (view: View) => void;
  onSelectProject: (projectId: string) => void;
  onCreateProject: (name: string, color: string) => void;
  onCreateCard: (input: {
    title: string;
    projectId: string;
    category: Category;
    issueType: IssueType;
    priority: Priority;
    assignee: string;
    storyPoints: number;
    minutes: number;
  }) => void;
};

export function Sidebar({ projects, selectedProjectId, cards, docs, view, onViewChange, onSelectProject, onCreateProject, onCreateCard }: SidebarProps) {
  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? projects[0];
  const selectedProjectCards = cards.filter((card) => card.projectId === selectedProjectId);
  const selectedProjectDocs = docs.filter((doc) => doc.projectId === selectedProjectId);

  function submitCard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const projectId = String(form.get("projectId"));
    const category = String(form.get("category")) as Category;
    const issueType = String(form.get("issueType")) as IssueType;
    const priority = String(form.get("priority")) as Priority;
    const assignee = String(form.get("assignee"));
    const storyPoints = Number(form.get("storyPoints"));
    const minutes = Number(form.get("minutes"));
    if (!title) return;
    onCreateCard({ title, projectId, category, issueType, priority, assignee, storyPoints, minutes });
    event.currentTarget.reset();
  }

  function submitProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("projectName") ?? "").trim();
    const color = String(form.get("projectColor") ?? "#0c66e4");
    if (!name) return;
    onCreateProject(name, color);
    event.currentTarget.reset();
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">IMC</div>
        <div>
          <strong>{view === "confluence" ? "Confluence" : "Jira"}</strong>
          <span>{selectedProject.name}</span>
        </div>
      </div>

      <section className="sidebar-section product-menu">
        <button className={view === "jira" ? "active" : ""} onClick={() => onViewChange("jira")}>Jira software</button>
        <button className={view === "confluence" ? "active" : ""} onClick={() => onViewChange("confluence")}>Confluence space</button>
      </section>

      <section className="sidebar-section project-switcher">
        <div className="sidebar-title">
          <h2>Projects</h2>
          <span>{projects.length}</span>
        </div>
        <div className="project-nav">
          {projects.map((project) => {
            const issueCount = cards.filter((card) => card.projectId === project.id).length;
            const pageCount = docs.filter((doc) => doc.projectId === project.id).length;
            return (
              <button
                key={project.id}
                className={`project-nav-item ${selectedProjectId === project.id ? "active" : ""}`}
                onClick={() => onSelectProject(project.id)}
              >
                <i style={{ background: project.color }} />
                <span>
                  <strong>{project.name}</strong>
                  <small>{project.key} · {issueCount} issues · {pageCount} pages</small>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {view === "jira" && (
        <section className="sidebar-section space-nav">
          <div className="sidebar-title">
            <h2>Project</h2>
            <span>{selectedProject.key}</span>
          </div>
          {["Summary", "Timeline", "Board", "List", "Calendar", "Issues", "Reports", "Project settings"].map((item) => (
            <button key={item} className={item === "Board" ? "active" : ""}>{item}</button>
          ))}
        </section>
      )}

      {view === "confluence" && (
        <section className="sidebar-section space-nav confluence-tree">
          <div className="sidebar-title">
            <h2>Space</h2>
            <span>{selectedProjectDocs.length}</span>
          </div>
          {["Overview", "Recent", "Pages", "Whiteboards", "Databases", "Blog", "Space settings"].map((item) => (
            <button key={item} className={item === "Pages" ? "active" : ""}>{item}</button>
          ))}
          <div className="mini-tree">
            {selectedProjectDocs.slice(0, 5).map((doc) => (
              <span key={doc.id}>{doc.type === "canvas" ? "Whiteboard" : "Page"} · {doc.title}</span>
            ))}
          </div>
        </section>
      )}

      <section className="quick-capture">
        <div className="sidebar-title">
          <h2>Jira 카드 추가</h2>
          <span>자동 문서 생성</span>
        </div>
        <p className="sidebar-help">여기서 카드를 발행하면 연결된 Confluence Markdown 문서가 즉시 생성됩니다.</p>
        <form className="jira-card-form" key={selectedProjectId} onSubmit={submitCard}>
          <input name="title" type="text" placeholder="Jira 카드 제목" autoComplete="off" required />
          <div className="form-grid">
            <select name="issueType" aria-label="이슈 타입">
              {issueTypes.map((type) => <option key={type}>{type}</option>)}
            </select>
            <select name="priority" aria-label="우선순위">
              {priorities.map((priority) => <option key={priority}>{priority}</option>)}
            </select>
          </div>
          <select name="projectId" aria-label="프로젝트" defaultValue={selectedProjectId}>
            {projects.map((project) => <option value={project.id} key={project.id}>{project.name}</option>)}
          </select>
          <select name="category" aria-label="카테고리">
            {categories.map((category) => <option key={category}>{category}</option>)}
          </select>
          <select name="assignee" aria-label="담당자">
            {assignees.map((assignee) => <option key={assignee}>{assignee}</option>)}
          </select>
          <div className="form-row">
            <input name="minutes" type="number" min="15" max="240" step="15" defaultValue="60" aria-label="예상 시간" />
            <input name="storyPoints" type="number" min="1" max="13" step="1" defaultValue="3" aria-label="스토리 포인트" />
            <button type="submit">발행</button>
          </div>
        </form>
      </section>

      {view === "jira" && (
        <section className="sidebar-section sprint-summary">
          <div className="sidebar-title">
            <h2>Active sprint</h2>
            <span>{selectedProjectCards.length} work items</span>
          </div>
          <div className="sprint-meter">
            <i style={{ width: `${Math.min(100, selectedProjectCards.filter((card) => card.status === "done").length / Math.max(1, selectedProjectCards.length) * 100)}%` }} />
          </div>
        </section>
      )}

      <section className="project-capture">
        <div className="sidebar-title">
          <h2>New project</h2>
          <span>custom</span>
        </div>
        <form onSubmit={submitProject}>
          <input name="projectName" type="text" placeholder="프로젝트 이름" autoComplete="off" />
          <div className="project-form-row">
            <input name="projectColor" type="color" defaultValue="#0c66e4" aria-label="프로젝트 색상" />
            <button type="submit">추가</button>
          </div>
        </form>
      </section>
    </aside>
  );
}
