import { Component, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import type { Card, DocPage, DocType, Project } from "../types";
import { getProject, markdownToBlocks } from "../utils";

type DocsViewProps = {
  docs: DocPage[];
  cards: Card[];
  projects: Project[];
  selectedProjectId: string;
  selectedDocId: string;
  onSelectDoc: (docId: string) => void;
  onNewPage: (type: DocType) => void;
  onUpdateDoc: (docId: string, patch: Partial<DocPage>) => void;
  onOpenIssue: (cardId: string) => void;
};

export function DocsView({ docs, cards, projects, selectedProjectId, selectedDocId, onSelectDoc, onNewPage, onUpdateDoc, onOpenIssue }: DocsViewProps) {
  const projectDocs = docs.filter((doc) => doc.projectId === selectedProjectId);
  const selectedDoc = projectDocs.find((doc) => doc.id === selectedDocId) ?? projectDocs[0] ?? docs[0];
  const linkedCards = cards.filter((card) => selectedDoc.cardIds.includes(card.id));
  const project = getProject(projects, selectedDoc.projectId);
  const markdownDocs = projectDocs.filter((doc) => doc.type === "markdown");
  const canvasDocs = projectDocs.filter((doc) => doc.type === "canvas");

  return (
    <section>
      <div className="section-heading project-view-heading" style={{ "--project-color": project.color } as CSSProperties}>
        <div>
          <p className="eyebrow">Confluence</p>
          <h2>{project.name} Confluence Space</h2>
          <p className="section-subtitle">페이지와 화이트보드를 관리하고, 연결된 Jira 카드를 바로 열 수 있습니다.</p>
        </div>
        <div className="doc-actions">
          <button className="ghost-button" onClick={() => onNewPage("markdown")}>Markdown 문서</button>
          <button className="ghost-button" onClick={() => onNewPage("canvas")}>Excalidraw 문서</button>
        </div>
      </div>

      <div className="docs-workspace">
        <aside className="doc-sidebar">
          <div className="space-card">
            <i style={{ background: project.color }} />
            <strong>{project.name}</strong>
            <small>{project.key} space · {projectDocs.length} pages</small>
          </div>
          <DocTree title="Pages" docs={markdownDocs} selectedDocId={selectedDoc.id} projectColor={project.color} onSelectDoc={onSelectDoc} />
          <DocTree title="Whiteboards" docs={canvasDocs} selectedDocId={selectedDoc.id} projectColor={project.color} onSelectDoc={onSelectDoc} />
        </aside>

        <article className="doc-editor-shell" style={{ "--project-color": project.color } as CSSProperties}>
          <div className="confluence-breadcrumb">
            <span>Spaces</span>
            <b>/</b>
            <span>{project.name}</span>
            <b>/</b>
            <strong>{selectedDoc.title}</strong>
          </div>
          <header className="doc-editor-header">
            <div>
              <p className="issue-key"><i style={{ background: project.color }} />{project.name}</p>
              <input className="doc-title-input" value={selectedDoc.title} onChange={(event) => onUpdateDoc(selectedDoc.id, { title: event.target.value })} />
            </div>
            <div className="confluence-actions">
              <select value={selectedDoc.type} onChange={(event) => onUpdateDoc(selectedDoc.id, { type: event.target.value as DocType })}>
                <option value="markdown">Page</option>
                <option value="canvas">Whiteboard</option>
              </select>
              <button>Share</button>
              <button>Watch</button>
              <button className="publish-button">Publish</button>
            </div>
          </header>

          <div className="confluence-editor-toolbar">
            {["Normal text", "Bold", "Italic", "Link", "Bullet list", "Task", "Table", "Mention", "More"].map((item) => (
              <button key={item}>{item}</button>
            ))}
          </div>

          <div className="doc-linked-row">
            <strong>Linked Jira cards</strong>
            {linkedCards.length === 0 ? (
              <span className="chip">연결된 Jira 카드 없음</span>
            ) : linkedCards.map((card) => (
              <button className="linked-issue-button" key={card.id} onClick={() => onOpenIssue(card.id)}>
                {card.id} · {card.title}
              </button>
            ))}
          </div>

          {selectedDoc.type === "markdown" ? (
            <MarkdownEditor doc={selectedDoc} onUpdateDoc={onUpdateDoc} />
          ) : (
            <CanvasErrorBoundary key={selectedDoc.id}>
              <ExcalidrawEditor doc={selectedDoc} projectColor={project.color} onUpdateDoc={onUpdateDoc} />
            </CanvasErrorBoundary>
          )}
        </article>
      </div>
    </section>
  );
}

function DocTree({ title, docs, selectedDocId, projectColor, onSelectDoc }: {
  title: string;
  docs: DocPage[];
  selectedDocId: string;
  projectColor: string;
  onSelectDoc: (docId: string) => void;
}) {
  return (
    <div className="doc-tree">
      <h3>{title}</h3>
      {docs.length === 0 ? (
        <p>아직 문서가 없습니다.</p>
      ) : docs.map((doc) => (
        <button className={`doc-list-item ${doc.id === selectedDocId ? "active" : ""}`} key={doc.id} onClick={() => onSelectDoc(doc.id)}>
          <i style={{ background: projectColor }} />
          <span>{doc.title}</span>
          <small>{doc.type === "canvas" ? "whiteboard" : "page"}</small>
        </button>
      ))}
    </div>
  );
}

class CanvasErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; message: string }> {
  state = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error) {
    console.error("Excalidraw render failed", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="excalidraw-fallback">
          <h3>Excalidraw 캔버스를 불러오지 못했어요.</h3>
          <p>앱은 계속 사용할 수 있습니다. 새로고침 후 다시 시도하거나, 아래 링크로 Excalidraw 원본 에디터를 열어 작업하세요.</p>
          {this.state.message && <code>{this.state.message}</code>}
          <a href="https://excalidraw.com/" target="_blank" rel="noreferrer">Excalidraw 원본 열기</a>
        </div>
      );
    }

    return this.props.children;
  }
}

function MarkdownEditor({ doc, onUpdateDoc }: { doc: DocPage; onUpdateDoc: (docId: string, patch: Partial<DocPage>) => void }) {
  return (
    <div className="confluence-page-editor">
      <div className="markdown-preview confluence-page-body">
        {markdownToBlocks(doc.body).map((block) => {
          if (block.type === "space") return <br key={block.id} />;
          if (block.type === "h1") return <h1 key={block.id}>{block.text}</h1>;
          if (block.type === "h2") return <h2 key={block.id}>{block.text}</h2>;
          if (block.type === "h3") return <h3 key={block.id}>{block.text}</h3>;
          if (block.type === "li") return <p className="md-list" key={block.id}>• {block.text}</p>;
          if (block.type === "checked") return <p className="md-check done" key={block.id}>✓ {block.text}</p>;
          if (block.type === "todo") return <p className="md-check" key={block.id}>□ {block.text}</p>;
          return <p key={block.id}>{block.text}</p>;
        })}
        <p className="slash-command">Type / to insert elements, mention people, add Jira work, or create a table.</p>
      </div>
      <div className="markdown-source-panel">
        <strong>Markdown source</strong>
        <textarea
          className="markdown-input"
          value={doc.body}
          onChange={(event) => onUpdateDoc(doc.id, { body: event.target.value })}
          placeholder="# 제목&#10;&#10;- 해야 할 일&#10;- [ ] 체크리스트"
        />
      </div>
    </div>
  );
}

function ExcalidrawEditor({ doc, projectColor, onUpdateDoc }: {
  doc: DocPage;
  projectColor: string;
  onUpdateDoc: (docId: string, patch: Partial<DocPage>) => void;
}) {
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const [savedMessage, setSavedMessage] = useState("아직 저장 전");
  const scene = doc.excalidrawData ?? { elements: [], appState: { viewBackgroundColor: "#ffffff" }, files: {} };

  function saveScene() {
    const api = apiRef.current;
    if (!api) return;

    const appState = api.getAppState();
    onUpdateDoc(doc.id, {
      excalidrawData: {
        elements: api.getSceneElements() as readonly unknown[],
        appState: {
          viewBackgroundColor: appState.viewBackgroundColor,
          gridSize: appState.gridSize,
          scrollX: appState.scrollX,
          scrollY: appState.scrollY,
          zoom: appState.zoom
        } as Record<string, unknown>,
        files: api.getFiles() as unknown as Record<string, unknown>
      }
    });
    setSavedMessage(`저장됨 · ${new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}`);
  }

  return (
    <div className="excalidraw-shell">
      <div className="excalidraw-note">
        <div>
          <span style={{ background: projectColor }} />
          실제 Excalidraw 컴포넌트입니다. 도형, 펜, 화살표, 텍스트, 이미지, 라이브러리, 내보내기 기능을 사용할 수 있습니다.
        </div>
        <div className="excalidraw-save-actions">
          <small>{savedMessage}</small>
          <button className="text-button" onClick={saveScene}>캔버스 저장</button>
        </div>
      </div>
      <div className="excalidraw-host">
        <Excalidraw
          key={doc.id}
          excalidrawAPI={(api) => {
            apiRef.current = api;
          }}
          initialData={{
            elements: scene.elements as never[],
            appState: getInitialExcalidrawAppState(scene.appState) as never,
            files: scene.files as never
          }}
          name={doc.title}
          langCode="ko-KR"
          theme="light"
          gridModeEnabled
          autoFocus
        />
      </div>
    </div>
  );
}

function getInitialExcalidrawAppState(appState?: Record<string, unknown>) {
  return {
    viewBackgroundColor: typeof appState?.viewBackgroundColor === "string" ? appState.viewBackgroundColor : "#ffffff",
    gridSize: typeof appState?.gridSize === "number" ? appState.gridSize : undefined,
    scrollX: typeof appState?.scrollX === "number" ? appState.scrollX : undefined,
    scrollY: typeof appState?.scrollY === "number" ? appState.scrollY : undefined,
    zoom: typeof appState?.zoom === "object" && appState.zoom !== null ? appState.zoom : undefined
  };
}
