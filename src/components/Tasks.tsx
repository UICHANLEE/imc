import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { MessageSquare, Paperclip, MoreHorizontal, Plus, Filter, LayoutGrid, List, CalendarDays } from "lucide-react";
import type { BoardPriority, Task } from "../types";
import { cn } from "../lib/utils";

const columns = [
  { id: "todo", title: "TO DO" },
  { id: "in-progress", title: "IN PROGRESS" },
  { id: "done", title: "DONE" }
] as const;

interface TasksProps {
  tasks: Task[];
  onTaskStatusChange: (taskId: string, status: Task["status"]) => void;
  onCreateTask: (status: Task["status"]) => void;
  onOpenDoc: (docId?: string) => void;
}

export function Tasks({ tasks, onTaskStatusChange, onCreateTask, onOpenDoc }: TasksProps) {
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      onTaskStatusChange(result.draggableId, destination.droppableId as Task["status"]);
    }
  };

  const getPriorityColor = (priority: BoardPriority) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "MEDIUM":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "LOW":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-slate-950">
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
            <span>Projects</span>
            <span className="text-slate-600">›</span>
            <span className="font-medium text-slate-300">{tasks[0]?.projectName ?? "App Launch 2.0"}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">{tasks[0]?.projectName ?? "App Launch 2.0"}</h1>
          <p className="text-sm text-slate-500 mt-1">Sprint board • {tasks.length} synced cards</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {tasks.slice(0, 2).flatMap((task) => task.assignees).slice(0, 2).map((avatar, index) => (
              <img key={avatar} src={avatar} className="w-8 h-8 rounded-full border-2 border-slate-900" alt={`Assignee ${index + 1}`} />
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-xs text-slate-300 font-medium">
              +{Math.max(tasks.length - 2, 0)}
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800"></div>
          <div className="flex bg-slate-900 border border-slate-800 rounded-md p-1">
            <button className="px-3 py-1 bg-slate-800 text-slate-200 rounded text-sm font-medium shadow-sm flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" /> Board
            </button>
            <button className="px-3 py-1 text-slate-400 hover:text-slate-200 rounded text-sm font-medium flex items-center gap-2">
              <List className="w-4 h-4" /> List
            </button>
          </div>
          <button className="px-3 py-1.5 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-md transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
          <div className="flex gap-6 h-full min-w-max">
            {columns.map((column) => {
              const columnTasks = tasks.filter((task) => task.status === column.id);
              return (
                <div key={column.id} className="w-80 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-slate-300 tracking-wider">{column.title}</h3>
                      <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full font-medium">{columnTasks.length}</span>
                    </div>
                    <button className="text-slate-500 hover:text-slate-300">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>

                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          "flex-1 overflow-y-auto min-h-[150px] transition-colors rounded-lg",
                          snapshot.isDraggingOver ? "bg-slate-900/50 ring-1 ring-indigo-500/40" : ""
                        )}
                      >
                        <div className="space-y-3 pb-4">
                          {columnTasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={cn(
                                    "bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm group cursor-grab active:cursor-grabbing transition-transform duration-200",
                                    snapshot.isDragging
                                      ? "shadow-lg shadow-indigo-500/10 border-indigo-500/50 rotate-2 scale-[1.02]"
                                      : "hover:border-slate-700 hover:-translate-y-0.5"
                                  )}
                                  style={{
                                    ...provided.draggableProps.style,
                                    borderLeftColor: task.projectColor,
                                    borderLeftWidth: task.projectColor ? 3 : undefined
                                  }}
                                >
                                  <div className="flex items-center justify-between mb-3">
                                    <span className={cn("text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider", getPriorityColor(task.priority))}>
                                      {task.priority}
                                    </span>
                                    <button className="text-slate-600 hover:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                  </div>

                                  <h4 className="text-slate-200 font-medium text-sm leading-snug mb-2">{task.title}</h4>
                                  <p className="text-slate-400 text-xs line-clamp-2 mb-4 leading-relaxed">{task.description}</p>

                                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-4">
                                    <span className="font-mono">{task.id}</span>
                                    <span className="flex items-center gap-1">
                                      <CalendarDays className="w-3.5 h-3.5" />
                                      {task.startDate} - {task.endDate}
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between mt-auto">
                                    <div className="flex items-center gap-3 text-slate-500 text-xs">
                                      {task.comments > 0 && (
                                        <div className="flex items-center gap-1 hover:text-indigo-400 cursor-pointer">
                                          <MessageSquare className="w-3.5 h-3.5" />
                                          <span>{task.comments}</span>
                                        </div>
                                      )}
                                      {task.attachments > 0 && (
                                        <button className="flex items-center gap-1 hover:text-indigo-400 cursor-pointer" onClick={() => onOpenDoc(task.docId)}>
                                          <Paperclip className="w-3.5 h-3.5" />
                                          <span>{task.attachments}</span>
                                        </button>
                                      )}
                                    </div>

                                    <div className="flex -space-x-1.5">
                                      {task.assignees.map((url, index) => (
                                        <img key={url} src={url} className="w-6 h-6 rounded-full border-2 border-slate-900" alt={task.assigneeName ?? `Assignee ${index + 1}`} />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                          <button
                            className="w-full py-2.5 text-sm text-slate-500 hover:text-slate-300 hover:bg-slate-900 border border-transparent hover:border-slate-800 rounded-lg transition-colors flex items-center justify-center gap-2"
                            onClick={() => onCreateTask(column.id)}
                          >
                            <Plus className="w-4 h-4" /> Add Task
                          </button>
                        </div>
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}
