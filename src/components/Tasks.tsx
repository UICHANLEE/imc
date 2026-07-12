import { useState } from "react";
import type { ReactNode } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { MessageSquare, Paperclip, MoreHorizontal, Plus, Filter, LayoutGrid, List, CalendarDays, X } from "lucide-react";
import type { BoardPriority, Card, DocPage, IssueType, Priority, Project, Status, Task } from "../types";
import { cn } from "../lib/utils";

const columns = [
  { id: "todo", title: "TO DO" },
  { id: "in-progress", title: "IN PROGRESS" },
  { id: "done", title: "DONE" }
] as const;

interface TasksProps {
  tasks: Task[];
  cards: Card[];
  docs: DocPage[];
  projects: Project[];
  onTaskStatusChange: (taskId: string, status: Task["status"]) => void;
  onCreateTask: (status: Task["status"]) => string;
  onOpenDoc: (docId?: string) => void;
  onUpdateCard: (cardId: string, patch: Partial<Card>) => void;
  onDeleteCard: (cardId: string) => void;
}

const statusOptions: Status[] = ["backlog", "selected", "progress", "review", "done"];
const priorityOptions: Priority[] = ["Highest", "High", "Medium", "Low"];
const issueTypeOptions: IssueType[] = ["Epic", "Story", "Task", "Bug", "Sub-task"];

export function Tasks({ tasks, cards, docs, projects, onTaskStatusChange, onCreateTask, onOpenDoc, onUpdateCard, onDeleteCard }: TasksProps) {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const selectedCard = cards.find((card) => card.id === selectedCardId);
  const projectName = tasks[0]?.projectName ?? projects[0]?.name ?? "Project";

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
            <span className="font-medium text-slate-300">{projectName}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">{projectName}</h1>
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
                                  onClick={() => setSelectedCardId(task.cardId ?? task.id)}
                                >
                                  <div className="flex items-center justify-between mb-3">
                                    <span className={cn("text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider", getPriorityColor(task.priority))}>
                                      {task.priority}
                                    </span>
                                    <button className="text-slate-600 hover:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(event) => event.stopPropagation()}>
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
                                        <button
                                          className="flex items-center gap-1 hover:text-indigo-400 cursor-pointer"
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            onOpenDoc(task.docId);
                                          }}
                                        >
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
                          {columnTasks.length === 0 && (
                            <div className="rounded-lg border border-dashed border-slate-800 bg-slate-900/30 px-4 py-6 text-center text-sm text-slate-500">
                              No cards yet
                            </div>
                          )}
                          {provided.placeholder}
                          <button
                            className="w-full py-2.5 text-sm text-slate-500 hover:text-slate-300 hover:bg-slate-900 border border-transparent hover:border-slate-800 rounded-lg transition-colors flex items-center justify-center gap-2"
                            onClick={() => {
                              const cardId = onCreateTask(column.id);
                              setSelectedCardId(cardId);
                            }}
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

      {selectedCard && (
        <TaskDetailModal
          card={selectedCard}
          docs={docs}
          projects={projects}
          onClose={() => setSelectedCardId(null)}
          onOpenDoc={onOpenDoc}
          onSave={(patch) => onUpdateCard(selectedCard.id, patch)}
          onDelete={() => {
            onDeleteCard(selectedCard.id);
            setSelectedCardId(null);
          }}
        />
      )}
    </div>
  );
}

function TaskDetailModal({
  card,
  docs,
  projects,
  onClose,
  onOpenDoc,
  onSave,
  onDelete
}: {
  card: Card;
  docs: DocPage[];
  projects: Project[];
  onClose: () => void;
  onOpenDoc: (docId?: string) => void;
  onSave: (patch: Partial<Card>) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState({
    title: card.title,
    description: card.description,
    projectId: card.projectId,
    issueType: card.issueType,
    status: card.status,
    priority: card.priority,
    assignee: card.assignee,
    reporter: card.reporter,
    sprint: card.sprint,
    storyPoints: String(card.storyPoints),
    startDate: card.startDate,
    endDate: card.endDate,
    documentId: card.documentId,
    labels: card.labels.join(", "),
    component: card.component
  });

  const linkedDoc = docs.find((doc) => doc.id === draft.documentId);

  const updateDraft = (key: keyof typeof draft, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const save = () => {
    onSave({
      title: draft.title,
      description: draft.description,
      projectId: draft.projectId,
      issueType: draft.issueType as IssueType,
      status: draft.status as Status,
      priority: draft.priority as Priority,
      assignee: draft.assignee,
      reporter: draft.reporter,
      sprint: draft.sprint,
      storyPoints: Number(draft.storyPoints) || 0,
      startDate: draft.startDate,
      endDate: draft.endDate,
      dueDate: draft.endDate,
      documentId: draft.documentId,
      labels: draft.labels.split(",").map((label) => label.trim()).filter(Boolean),
      component: draft.component
    });
    onClose();
  };

  const remove = () => {
    if (!window.confirm(`${card.id} 카드를 삭제할까요? 연결된 단독 문서도 함께 정리됩니다.`)) return;
    onDelete();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <p className="text-xs font-mono text-slate-500">{card.id}</p>
            <h2 className="text-xl font-semibold text-slate-100">Jira Card Detail</h2>
          </div>
          <button className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] max-h-[calc(90vh-76px)] overflow-y-auto">
          <div className="p-5 space-y-5">
            <Field label="Title">
              <input value={draft.title} onChange={(event) => updateDraft("title", event.target.value)} className="input-field text-lg font-semibold" />
            </Field>

            <Field label="Description">
              <textarea
                value={draft.description}
                onChange={(event) => updateDraft("description", event.target.value)}
                className="input-field min-h-40 resize-y leading-relaxed"
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Start date">
                <input type="date" value={draft.startDate} onChange={(event) => updateDraft("startDate", event.target.value)} className="input-field" />
              </Field>
              <Field label="End date">
                <input type="date" value={draft.endDate} onChange={(event) => updateDraft("endDate", event.target.value)} className="input-field" />
              </Field>
            </div>

            <Field label="Labels">
              <input value={draft.labels} onChange={(event) => updateDraft("labels", event.target.value)} className="input-field" placeholder="mvp, design, api" />
            </Field>
          </div>

          <aside className="border-t lg:border-t-0 lg:border-l border-slate-800 p-5 space-y-4 bg-slate-950/35">
            <Field label="Project">
              <select value={draft.projectId} onChange={(event) => updateDraft("projectId", event.target.value)} className="input-field">
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Issue type">
                <select value={draft.issueType} onChange={(event) => updateDraft("issueType", event.target.value)} className="input-field">
                  {issueTypeOptions.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </Field>
              <Field label="Priority">
                <select value={draft.priority} onChange={(event) => updateDraft("priority", event.target.value)} className="input-field">
                  {priorityOptions.map((priority) => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Status">
              <select value={draft.status} onChange={(event) => updateDraft("status", event.target.value)} className="input-field">
                {statusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Assignee">
                <input value={draft.assignee} onChange={(event) => updateDraft("assignee", event.target.value)} className="input-field" />
              </Field>
              <Field label="Reporter">
                <input value={draft.reporter} onChange={(event) => updateDraft("reporter", event.target.value)} className="input-field" />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Sprint">
                <input value={draft.sprint} onChange={(event) => updateDraft("sprint", event.target.value)} className="input-field" />
              </Field>
              <Field label="Points">
                <input type="number" value={draft.storyPoints} onChange={(event) => updateDraft("storyPoints", event.target.value)} className="input-field" />
              </Field>
            </div>

            <Field label="Component">
              <input value={draft.component} onChange={(event) => updateDraft("component", event.target.value)} className="input-field" />
            </Field>

            <Field label="Document link">
              <select value={draft.documentId} onChange={(event) => updateDraft("documentId", event.target.value)} className="input-field">
                {docs.map((doc) => (
                  <option key={doc.id} value={doc.id}>{doc.title}</option>
                ))}
              </select>
            </Field>

            <button
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700 transition-colors"
              onClick={() => onOpenDoc(draft.documentId)}
              disabled={!linkedDoc}
            >
              Open linked document
            </button>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/20 transition-colors" onClick={remove}>
                Delete
              </button>
              <button className="rounded-lg bg-indigo-500 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-600 transition-colors" onClick={save}>
                Save
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
      {children}
    </label>
  );
}
