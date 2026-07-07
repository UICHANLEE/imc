import { useRef, useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { Save, FileText } from "lucide-react";
import type { DocPage } from "../types";

interface CanvasProps {
  doc?: DocPage;
  projectColor: string;
  onUpdateDoc: (docId: string, patch: Partial<DocPage>) => void;
}

export function Canvas({ doc, projectColor, onUpdateDoc }: CanvasProps) {
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const [savedMessage, setSavedMessage] = useState("Not saved yet");

  if (!doc) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-slate-950 text-slate-400">
        No canvas document selected.
      </div>
    );
  }

  const scene = doc.excalidrawData ?? { elements: [], appState: { viewBackgroundColor: "#ffffff" }, files: {} };

  const saveScene = () => {
    const api = apiRef.current;
    if (!api) return;

    const appState = api.getAppState();
    onUpdateDoc(doc.id, {
      type: "canvas",
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
    setSavedMessage(`Saved ${new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-slate-950">
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
            <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: projectColor }} />
            <span>Canvas Document</span>
            <span className="text-slate-600">›</span>
            <span className="font-medium text-slate-300">{doc.id}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            {doc.title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">{savedMessage}</span>
          <button className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-md transition-colors flex items-center gap-2" onClick={saveScene}>
            <Save className="w-4 h-4" /> Save Canvas
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-white">
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
