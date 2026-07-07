import { LayoutDashboard, CheckSquare, FileText, PenTool, Settings, Bell, HelpCircle } from "lucide-react";
import type { ViewType } from "../types";
import { cn } from "../lib/utils";

interface SidebarProps {
  currentView: ViewType;
  onChangeView: (view: ViewType) => void;
}

export function Sidebar({ currentView, onChangeView }: SidebarProps) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "tasks", label: "Tasks", icon: CheckSquare },
    { id: "docs", label: "Docs", icon: FileText },
    { id: "canvas", label: "Canvas", icon: PenTool }
  ] as const;

  return (
    <>
      <div className="hidden md:flex h-14 border-b border-slate-800 bg-slate-900/50 items-center justify-between px-4 sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xl tracking-tight">
            <div className="w-6 h-6 bg-indigo-500 rounded flex items-center justify-center text-white">
              <span className="text-xs font-bold leading-none">N</span>
            </div>
            Nexus
          </div>
          <nav className="flex items-center gap-1 ml-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2",
                  currentView === item.id
                    ? "text-indigo-300 bg-slate-800/80"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
            <button className="px-3 py-1.5 text-sm font-medium rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 flex items-center gap-2 transition-colors">
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search Nexus..."
              className="bg-slate-800/80 border border-slate-700 text-slate-200 text-sm rounded-md px-3 py-1.5 w-64 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-500"
            />
            <div className="absolute right-2 top-1.5 flex gap-1">
              <span className="text-[10px] bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded border border-slate-600 font-mono">Cmd</span>
              <span className="text-[10px] bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded border border-slate-600 font-mono">K</span>
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-200">
            <Bell className="w-5 h-5" />
          </button>
          <button className="text-slate-400 hover:text-slate-200">
            <HelpCircle className="w-5 h-5" />
          </button>
          <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="User Avatar" className="w-8 h-8 rounded-full ring-2 ring-slate-800" />
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900 border-t border-slate-800 flex items-center justify-around z-50 pb-safe">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id)}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
              currentView === item.id ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}
