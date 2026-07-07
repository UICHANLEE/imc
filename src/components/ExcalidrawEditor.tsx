import { useRef, useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import type { DocPage } from "../types";

type ExcalidrawEditorProps = {
  doc: DocPage;
  projectColor: string;
  onUpdateDoc: (docId: string, patch: Partial<DocPage>) => void;
};

export function ExcalidrawEditor({ doc, projectColor, onUpdateDoc }: ExcalidrawEditorProps) {
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
