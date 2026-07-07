import { Clock, Plus, FileText, CheckCircle2, PenTool } from "lucide-react";
import type { DocPage, Task, ViewType } from "../types";

interface DashboardProps {
  tasks: Task[];
  docs: DocPage[];
  onChangeView: (view: ViewType) => void;
  onOpenDoc: (docId?: string) => void;
}

export function Dashboard({ tasks, docs, onChangeView, onOpenDoc }: DashboardProps) {
  const assigned = tasks.slice(0, 2);
  const recentDocs = docs.slice(0, 3);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-sm font-medium text-slate-400 tracking-wider uppercase mb-1">Tuesday, Jul 7</h2>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-100 tracking-tight">Good morning, Alex.</h1>
        </div>
        <div className="hidden md:flex gap-3">
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-md transition-colors border border-slate-700 flex items-center gap-2">
            <SettingsIcon /> Customize
          </button>
          <button className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-md transition-colors flex items-center gap-2" onClick={() => onChangeView("tasks")}>
            <Plus className="w-4 h-4" /> New Project
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-400" /> Assigned to Me
            </h3>
            <button className="text-slate-400 hover:text-indigo-400 transition-colors" onClick={() => onChangeView("tasks")}>
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            {assigned.map((task, index) => (
              <div
                key={task.id}
                className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 hover:border-slate-700 transition-colors cursor-pointer"
                style={{ borderLeftColor: index === 1 ? "#ef4444" : task.projectColor, borderLeftWidth: index === 1 ? 2 : undefined }}
                onClick={() => onChangeView("tasks")}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">{task.id}</span>
                  <div className="w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center">
                    <FileText className="w-3 h-3 text-slate-400" />
                  </div>
                </div>
                <h4 className="text-slate-200 font-medium text-sm mb-3">{task.title}</h4>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {task.endDate}
                  </span>
                  <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded">{task.status}</span>
                </div>
              </div>
            ))}

            <button className="w-full py-2.5 text-sm text-slate-400 hover:text-slate-200 border border-dashed border-slate-800 rounded-lg transition-colors" onClick={() => onChangeView("tasks")}>
              View all {tasks.length} tasks
            </button>
          </div>
        </div>

        <div className="md:col-span-5 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" /> Recent Docs
            </h3>
            <button className="text-xs font-medium text-slate-400 hover:text-indigo-400 transition-colors uppercase tracking-wider" onClick={() => onChangeView("docs")}>
              Browse
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {recentDocs.map((doc) => (
              <div key={doc.id} className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 hover:border-slate-700 transition-colors cursor-pointer group" onClick={() => onOpenDoc(doc.id)}>
                <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center mb-4 group-hover:bg-indigo-500/20 transition-colors">
                  {doc.type === "canvas" ? <PenTool className="w-4 h-4 text-purple-400" /> : <FileText className="w-4 h-4 text-indigo-400" />}
                </div>
                <h4 className="text-slate-200 font-medium text-sm mb-1">{doc.title}</h4>
                <p className="text-xs text-slate-500">{doc.type === "canvas" ? "Canvas page" : "Markdown page"}</p>
              </div>
            ))}

            <div className="border border-dashed border-slate-800 rounded-lg p-4 hover:border-slate-700 hover:bg-slate-900/30 transition-colors cursor-pointer flex flex-col items-center justify-center text-slate-400 hover:text-indigo-400" onClick={() => onChangeView("docs")}>
              <Plus className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">New Doc</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-3 space-y-6">
          <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" /> Team Feed
          </h3>

          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 space-y-4">
            <div className="flex gap-3">
              <img src="https://i.pravatar.cc/150?u=3" className="w-8 h-8 rounded-full flex-shrink-0" alt="Sarah" />
              <div>
                <p className="text-sm text-slate-300">
                  <span className="font-semibold text-slate-200">Sarah J.</span> commented on <span className="text-indigo-400 cursor-pointer">{docs[0]?.title ?? "Docs"}</span>
                </p>
                <p className="text-xs text-slate-500 mb-2">10 mins ago</p>
                <div className="bg-slate-800/80 rounded p-2 border-l-2 border-indigo-500 text-sm text-slate-300 italic">Linked Jira card and page are synced.</div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-slate-300">
                  <span className="font-semibold text-slate-200">Marcus T.</span> completed task <span className="text-indigo-400 cursor-pointer">{tasks.find((task) => task.status === "done")?.title ?? "Design System Audit"}</span>
                </p>
                <p className="text-xs text-slate-500">2 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 14H14V21H21V14Z"></path>
      <path d="M10 14H3V21H10V14Z"></path>
      <path d="M21 3H14V10H21V3Z"></path>
      <path d="M10 3H3V10H10V3Z"></path>
    </svg>
  );
}
