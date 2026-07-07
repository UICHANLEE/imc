import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { MousePointer2, Square, Circle, Type, Move, ZoomIn, ZoomOut, Download } from "lucide-react";
import type { CanvasEdge, CanvasNode } from "../types";
import { cn } from "../lib/utils";

interface CanvasProps {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  onNodesChange: (nodes: CanvasNode[]) => void;
}

export function Canvas({ nodes: initialNodes, edges: initialEdges, onNodesChange }: CanvasProps) {
  const [nodes, setNodes] = useState<CanvasNode[]>(initialNodes);
  const [edges, setEdges] = useState<CanvasEdge[]>(initialEdges);
  const [activeTool, setActiveTool] = useState<"select" | "hand" | "rectangle" | "ellipse" | "text">("select");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges]);

  const gridPattern = (
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.5" fill="rgba(255,255,255,0.05)" />
    </pattern>
  );

  const handleDoubleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === "select" || activeTool === "hand") return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (event.clientX - rect.left - pan.x) / zoom;
    const y = (event.clientY - rect.top - pan.y) / zoom;
    const node: CanvasNode = {
      id: `node-${Date.now()}`,
      type: activeTool,
      x,
      y,
      width: activeTool === "text" ? 180 : 160,
      height: activeTool === "text" ? 56 : 80,
      text: activeTool === "text" ? "Text" : activeTool === "ellipse" ? "Ellipse" : "Rectangle"
    };
    const nextNodes = [...nodes, node];
    setNodes(nextNodes);
    onNodesChange(nextNodes);
  };

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)] bg-[#0b1221] overflow-hidden" ref={containerRef}>
      <div className="absolute left-1/2 bottom-8 -translate-x-1/2 z-10 bg-slate-800/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700 shadow-xl flex items-center gap-1">
        <ToolButton active={activeTool === "select"} onClick={() => setActiveTool("select")} icon={<MousePointer2 className="w-4 h-4" />} title="Select (V)" />
        <ToolButton active={activeTool === "hand"} onClick={() => setActiveTool("hand")} icon={<Move className="w-4 h-4" />} title="Pan (H)" />
        <div className="w-px h-6 bg-slate-700 mx-1"></div>
        <ToolButton active={activeTool === "rectangle"} onClick={() => setActiveTool("rectangle")} icon={<Square className="w-4 h-4" />} title="Rectangle (R)" />
        <ToolButton active={activeTool === "ellipse"} onClick={() => setActiveTool("ellipse")} icon={<Circle className="w-4 h-4" />} title="Ellipse (E)" />
        <ToolButton active={activeTool === "text"} onClick={() => setActiveTool("text")} icon={<Type className="w-4 h-4" />} title="Text (T)" />
      </div>

      <div className="absolute right-4 top-4 z-10 flex flex-col gap-2">
        <div className="bg-slate-800/90 backdrop-blur-md rounded-lg border border-slate-700 p-1 flex flex-col gap-1 shadow-lg">
          <button className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-700 rounded transition-colors" onClick={() => setZoom((value) => Math.min(value + 0.1, 2))}>
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="text-[10px] text-center font-mono text-slate-500 py-1 border-y border-slate-700">{Math.round(zoom * 100)}%</div>
          <button className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-700 rounded transition-colors" onClick={() => setZoom((value) => Math.max(value - 0.1, 0.1))}>
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-lg shadow-lg flex items-center justify-center transition-colors">
          <Download className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute z-20 pointer-events-none" style={{ left: 600 * zoom + pan.x, top: 400 * zoom + pan.y }}>
        <div className="relative group transition-transform duration-500 ease-out translate-x-10 -translate-y-10">
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-t-[12px] border-t-indigo-400 border-r-[6px] border-r-transparent transform -rotate-12 drop-shadow-md"></div>
          <div className="absolute top-4 left-3 bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap shadow-lg">Sarah Jenkins</div>
        </div>
      </div>

      <motion.div
        className="w-full h-full cursor-grab active:cursor-grabbing origin-top-left"
        drag
        dragConstraints={{ left: -2000, right: 2000, top: -2000, bottom: 2000 }}
        dragElastic={0.1}
        style={{ scale: zoom, x: pan.x, y: pan.y }}
        onDrag={(_, info) => setPan({ x: info.point.x, y: info.point.y })}
        onDoubleClick={handleDoubleClick}
      >
        <svg width="4000" height="4000" className="absolute top-[-2000px] left-[-2000px] pointer-events-none">
          <defs>{gridPattern}</defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {edges.map((edge) => {
            const source = nodes.find((node) => node.id === edge.source);
            const target = nodes.find((node) => node.id === edge.target);
            if (!source || !target) return null;

            const x1 = source.x + source.width / 2 + 2000;
            const y1 = source.y + source.height / 2 + 2000;
            const x2 = target.x + target.width / 2 + 2000;
            const y2 = target.y + target.height / 2 + 2000;

            return <line key={edge.id} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#334155" strokeWidth="2" />;
          })}
        </svg>

        {nodes.map((node) => (
          <div
            key={node.id}
            className={cn(
              "absolute bg-slate-900/80 backdrop-blur border-2 border-slate-600 flex items-center justify-center text-slate-200 font-mono text-sm shadow-xl",
              node.type === "ellipse" ? "rounded-[50%]" : "rounded-lg"
            )}
            style={{
              left: node.x,
              top: node.y,
              width: node.width,
              height: node.height,
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
            }}
          >
            {node.text}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function ToolButton({ active, icon, title, onClick }: { active: boolean; icon: React.ReactNode; title: string; onClick: () => void }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={cn(
        "p-2.5 rounded-lg transition-colors flex items-center justify-center",
        active ? "bg-indigo-500 text-white shadow-md" : "text-slate-400 hover:text-slate-100 hover:bg-slate-700"
      )}
    >
      {icon}
    </button>
  );
}
