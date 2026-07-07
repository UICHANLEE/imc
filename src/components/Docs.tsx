import { useState } from "react";
import { Share2, MessageSquare, History, FileText, PenTool } from "lucide-react";
import type { Card, DocPage, Project, ViewType } from "../types";

interface DocsProps {
  docs: DocPage[];
  cards: Card[];
  projects: Project[];
  selectedDoc?: DocPage;
  onSelectDoc: (docId: string) => void;
  onUpdateDocBody: (docId: string, body: string) => void;
  onChangeView: (view: ViewType) => void;
}

export function Docs({ docs, cards, projects, selectedDoc, onSelectDoc, onUpdateDocBody, onChangeView }: DocsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const doc = selectedDoc ?? docs[0];
  const project = projects.find((item) => item.id === doc?.projectId);
  const linkedCards = cards.filter((card) => doc?.cardIds.includes(card.id) || card.documentId === doc?.id);

  if (!doc) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-slate-950 text-slate-400">
        No document selected.
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden bg-slate-950">
      <div className="hidden lg:block w-64 border-r border-slate-800 bg-slate-900/30 overflow-y-auto p-4">
        <h4 className="text-xs font-semibold text-slate-500 tracking-widest uppercase mb-4">Table of Contents</h4>
        <ul className="space-y-1">
          {docs.map((item) => (
            <li key={item.id}>
              <button
                className={item.id === doc.id ? "text-sm text-indigo-400 font-medium block py-1.5 text-left" : "text-sm text-slate-400 hover:text-slate-200 block py-1.5 text-left"}
                onClick={() => onSelectDoc(item.id)}
              >
                {item.title}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        <div className="max-w-3xl mx-auto px-6 lg:px-12 py-10">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
            <span>{project?.name ?? "Engineering"}</span>
            <span className="text-slate-600">/</span>
            <span>{doc.category}</span>
            <span className="text-slate-600">/</span>
            <span className="font-medium text-slate-300 flex items-center gap-1">
              {doc.title}
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1" title="Saved locally"></span>
              <span className="ml-2 rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">Live</span>
            </span>
          </div>

          <div className="relative mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-100 tracking-tight leading-tight">{doc.title}</h1>
            <div className="absolute -left-12 top-2">
              <div className="relative group">
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-t-[10px] border-t-amber-500 border-r-[6px] border-r-transparent transform -rotate-12"></div>
                <div className="absolute top-3 left-2 bg-amber-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap shadow-lg">Sarah C.</div>
              </div>
            </div>
          </div>

          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="inline-flex rounded-lg border border-slate-800 bg-slate-900/60 p-1">
              <button
                className={
                  !isEditing
                    ? "flex items-center gap-1.5 rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-100"
                    : "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200"
                }
                onClick={() => setIsEditing(false)}
              >
                <FileText className="h-3.5 w-3.5" /> 보기
              </button>
              <button
                className={
                  isEditing
                    ? "flex items-center gap-1.5 rounded-md bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white"
                    : "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200"
                }
                onClick={() => setIsEditing(true)}
              >
                <PenTool className="h-3.5 w-3.5" /> 편집
              </button>
            </div>
            {isEditing && (
              <span className="text-[11px] text-slate-500">이 창에서 수정한 내용은 실시간 저장되며 1분 단위로 기록됩니다.</span>
            )}
          </div>

          <div className="prose prose-invert prose-slate max-w-none">
            {isEditing ? (
              <textarea
                value={doc.body}
                onChange={(event) => onUpdateDocBody(doc.id, event.target.value)}
                className="min-h-[60vh] w-full resize-y rounded-lg border border-slate-800 bg-slate-900/40 p-5 font-mono text-sm leading-relaxed text-slate-200 focus:border-indigo-500 focus:outline-none"
                placeholder="# 제목&#10;&#10;- 내용을 입력하세요"
                autoFocus
              />
            ) : (
              <MarkdownPreview body={doc.body} />
            )}

            {doc.type === "canvas" && (
              <div className="my-6 border-l-4 border-indigo-500 bg-indigo-500/10 p-4 rounded-r-lg relative">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-1">Canvas Linked</span>
                <p className="text-slate-300 m-0">This Markdown page also has an Excalidraw scene. Open the Canvas tab to edit diagrams for this document.</p>
                <button className="mt-4 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-md transition-colors" onClick={() => onChangeView("canvas")}>
                  Open Canvas
                </button>
              </div>
            )}

            <h2 className="text-2xl font-semibold text-slate-200 mt-10 mb-4 border-b border-slate-800 pb-2">Linked Jira Cards</h2>
            <ul className="list-none space-y-2 p-0">
              {linkedCards.map((card) => (
                <li key={card.id} className="flex items-center gap-3 text-slate-300">
                  <div className="w-5 h-5 rounded border border-indigo-500 bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <FileText className="w-3 h-3" />
                  </div>
                  <span className="font-mono text-xs text-slate-500">{card.id}</span>
                  <span>{card.title}</span>
                  <span className="ml-auto text-xs px-2 py-1 rounded bg-slate-800 text-slate-300">{card.priority}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="hidden xl:flex flex-col w-80 border-l border-slate-800 bg-slate-900/50">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex -space-x-2">
            <img src="https://i.pravatar.cc/150?u=a" className="w-7 h-7 rounded-full border-2 border-slate-900" title="Sarah Chen" alt="Sarah Chen" />
            <img src="https://i.pravatar.cc/150?u=b" className="w-7 h-7 rounded-full border-2 border-slate-900" title="Mike Ross" alt="Mike Ross" />
            <div className="w-7 h-7 rounded-full border-2 border-slate-900 bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white">EG</div>
          </div>
          <div className="flex gap-2">
            <button className="text-slate-400 hover:text-slate-200 p-1.5 rounded-md hover:bg-slate-800 transition-colors">
              <History className="w-4 h-4" />
            </button>
            <button className="text-slate-400 hover:text-slate-200 p-1.5 rounded-md hover:bg-slate-800 transition-colors">
              <MessageSquare className="w-4 h-4" />
            </button>
            <button className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors">
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <h4 className="text-xs font-semibold text-slate-500 tracking-widest uppercase mb-4 flex justify-between">
            Live Document <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">{doc.revisions?.length ?? 0} Revisions</span>
          </h4>

          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
              <div className="flex gap-3 mb-2">
                <img src="https://i.pravatar.cc/150?u=a" className="w-6 h-6 rounded-full" alt="Sarah Chen" />
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium text-slate-200">Sarah Chen</span>
                    <span className="text-[10px] text-slate-500">10:42 AM</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">This page is connected to the Jira card metadata.</p>
                </div>
              </div>
              <div className="ml-9 mt-3 flex items-center gap-2">
                <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" className="w-6 h-6 rounded-full opacity-50" alt="Current user" />
                <input type="text" placeholder="Reply..." className="bg-transparent border border-slate-800 text-xs text-slate-300 px-2 py-1.5 rounded w-full focus:outline-none focus:border-indigo-500" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-medium text-slate-200">Live Markdown Source</span>
              </div>
              <textarea
                value={doc.body}
                onChange={(event) => onUpdateDocBody(doc.id, event.target.value)}
                className="min-h-64 w-full resize-none rounded-md border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs leading-relaxed text-slate-300 font-mono focus:outline-none focus:border-indigo-500"
                placeholder="# Write markdown here"
              />
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-3">
                <History className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-slate-200">Change History</span>
                <span className="ml-auto rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">1분 단위</span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {(doc.revisions ?? []).length === 0 ? (
                  <p className="text-xs text-slate-500">No edits recorded yet.</p>
                ) : (
                  (doc.revisions ?? []).map((revision) => (
                    <div key={revision.id} className="rounded-md border border-slate-800 bg-slate-950/60 p-2">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-medium text-slate-300">{revision.summary}</p>
                          <p className="text-[10px] text-slate-500">
                            {formatTimestamp(revision.timestamp)} · {revision.author}
                            {revision.edits && revision.edits > 1 ? ` · ${revision.edits}회 편집` : ""}
                          </p>
                        </div>
                        <button
                          className="rounded border border-slate-700 px-2 py-1 text-[10px] font-medium text-slate-300 hover:bg-slate-800"
                          onClick={() => onUpdateDocBody(doc.id, revision.body)}
                        >
                          Restore
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MarkdownPreview({ body }: { body: string }) {
  const lines = body.split("\n");
  let inCodeBlock = false;

  return (
    <>
      {lines.map((line, index) => {
        if (line.startsWith("```")) {
          inCodeBlock = !inCodeBlock;
          return <div key={index} className="h-2" />;
        }
        if (inCodeBlock) {
          return (
            <pre key={index} className="bg-slate-900 rounded-lg px-4 py-1 font-mono text-sm text-indigo-300 overflow-x-auto border border-slate-800">
              {line}
            </pre>
          );
        }
        if (line.startsWith("# ")) {
          return (
            <h2 key={index} className="text-2xl font-semibold text-slate-200 mt-10 mb-4 border-b border-slate-800 pb-2">
              {line.replace(/^# /, "")}
            </h2>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <h3 key={index} className="text-xl font-semibold text-slate-200 mt-8 mb-3">
              {line.replace(/^## /, "")}
            </h3>
          );
        }
        if (line.startsWith("- ")) {
          return (
            <p key={index} className="text-slate-300 leading-relaxed mb-2 flex gap-3">
              <span className="text-indigo-400">-</span>
              <span>{line.replace(/^- /, "")}</span>
            </p>
          );
        }
        if (line.startsWith("1. ") || line.startsWith("2. ") || line.startsWith("3. ")) {
          return (
            <p key={index} className="text-slate-300 leading-relaxed mb-2 flex gap-3">
              <span className="text-indigo-400 font-mono">{line.slice(0, 2)}</span>
              <span>{line.replace(/^\d+\. /, "")}</span>
            </p>
          );
        }
        if (line.startsWith("> ")) {
          return (
            <blockquote key={index} className="border-l-4 border-indigo-500 bg-indigo-500/10 p-4 rounded-r-lg text-slate-300">
              {line.replace(/^> /, "")}
            </blockquote>
          );
        }
        if (!line.trim()) {
          return <div key={index} className="h-3" />;
        }
        return (
          <p key={index} className="text-lg text-slate-300 leading-relaxed mb-6">
            {line}
          </p>
        );
      })}
    </>
  );
}

function formatTimestamp(timestamp: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(timestamp));
}
