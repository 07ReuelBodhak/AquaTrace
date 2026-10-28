"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";

export interface ResponseTask {
  task_id: string;
  title: string;
  description?: string;
  assigned_role?: string;
  priority: "high" | "medium" | "low" | string;
  status: "pending" | "in_progress" | "completed" | string;
  due_date?: string;
  associated_source_id?: string;
}

interface ResponsePlannerProps {
  sources: Array<{ source_id: string; source_name: string }>;
}

const INITIAL_DEMO_TASKS: ResponseTask[] = [
  {
    task_id: "TASK-01",
    title: "Issue Targeted Boil-Water Advisory (Sector 4 North)",
    description: "Post advisory notices in public squares surrounding Handpump #14.",
    assigned_role: "Community Health Liaison",
    priority: "high",
    status: "in_progress",
    due_date: "Today, 18:00 UTC",
    associated_source_id: "handpump_14",
  },
  {
    task_id: "TASK-02",
    title: "Sanitary Inspection & Membrane Filter Water Sampling",
    description: "Collect 500mL duplicate samples from Handpump #14 for coliform and cholera culture.",
    assigned_role: "Water Quality Field Tech",
    priority: "high",
    status: "pending",
    due_date: "Tomorrow, 08:00 UTC",
    associated_source_id: "handpump_14",
  },
  {
    task_id: "TASK-03",
    title: "Secondary Inspection of Substation-7 Junction Pipe",
    description: "Verify residual chlorine levels and check for pressure drops.",
    assigned_role: "Municipal Water Engineer",
    priority: "medium",
    status: "pending",
    due_date: "Oct 30, 2026",
    associated_source_id: "substation_07",
  },
];

export default function ResponsePlanner({ sources }: ResponsePlannerProps) {
  const [tasks, setTasks] = useState<ResponseTask[]>(INITIAL_DEMO_TASKS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newRole, setNewRole] = useState("Field Sampling Officer");
  const [newPriority, setNewPriority] = useState<"high" | "medium" | "low">("high");
  const [newSourceId, setNewSourceId] = useState(sources[0]?.source_id || "handpump_14");

  const handleToggleStatus = async (taskId: string, currentStatus: string) => {
    let nextStatus = "pending";
    if (currentStatus === "pending") nextStatus = "in_progress";
    else if (currentStatus === "in_progress") nextStatus = "completed";
    else nextStatus = "pending";

    setTasks((prev) =>
      prev.map((t) => (t.task_id === taskId ? { ...t, status: nextStatus } : t))
    );

    try {
      await api.updateTaskStatus(taskId, nextStatus, "current");
    } catch {
      // Keep optimistic client update
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: ResponseTask = {
      task_id: `TASK-0${tasks.length + 1}`,
      title: newTitle.trim(),
      assigned_role: newRole,
      priority: newPriority,
      status: "pending",
      due_date: "Next 24h",
      associated_source_id: newSourceId,
    };

    setTasks([newTask, ...tasks]);
    setNewTitle("");
    setShowAddModal(false);

    try {
      await api.createTask({
        title: newTask.title,
        assigned_role: newTask.assigned_role,
        priority: newTask.priority,
        associated_source_id: newTask.associated_source_id,
      }, "current");
    } catch {
      // Kept in client state
    }
  };

  return (
    <section aria-label="Human-Controlled Response Planner" className="bg-white border border-borderline rounded-2xl p-6 shadow-subtle space-y-5">
      <div className="flex flex-wrap items-center justify-between border-b border-borderline pb-4 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-navy">
              Human-Controlled Response Planner
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-aqua text-teal-dark border border-teal/20 uppercase tracking-wide">
              Human Authority Invariant
            </span>
          </div>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            Tracks physical containment and water testing actions. The system records officer decisions but never issues autonomous orders.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-teal text-white hover:bg-teal-dark rounded-xl text-xs font-bold shadow-subtle hover:shadow-card transition-all flex items-center gap-1.5"
        >
          <span>+ Add Containment Task</span>
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.map((task) => {
          const isDone = task.status === "completed";
          const inProg = task.status === "in_progress";

          return (
            <div
              key={task.task_id}
              className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                isDone
                  ? "bg-canvas/50 border-borderline opacity-70"
                  : inProg
                  ? "bg-aqua/20 border-teal/40 shadow-subtle"
                  : "bg-white border-borderline hover:border-teal/30"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-canvas border border-borderline text-muted">
                    {task.task_id}
                  </span>
                  <span className={`text-xs font-bold ${isDone ? "line-through text-muted" : "text-navy"}`}>
                    {task.title}
                  </span>
                  {task.priority === "high" && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-danger/10 text-danger border border-danger/30">
                      HIGH PRIORITY
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-muted flex flex-wrap items-center gap-3">
                  <span>Assigned: <strong className="text-navy">{task.assigned_role}</strong></span>
                  <span>&bull;</span>
                  <span>Target Source: <strong className="text-teal font-mono">{task.associated_source_id}</strong></span>
                  <span>&bull;</span>
                  <span>Due: {task.due_date}</span>
                </div>
              </div>

              {/* Status Toggle Button */}
              <button
                type="button"
                onClick={() => handleToggleStatus(task.task_id, task.status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isDone
                    ? "bg-success/10 text-success border border-success/30 hover:bg-success/20"
                    : inProg
                    ? "bg-teal text-white shadow-subtle hover:bg-teal-dark"
                    : "bg-canvas border border-borderline text-navy hover:bg-aqua/40"
                }`}
              >
                {isDone ? "Completed [✓]" : inProg ? "In Progress [→]" : "Mark In Progress"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-navy/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-borderline p-6 max-w-md w-full shadow-float space-y-4">
            <div className="flex justify-between items-center border-b border-borderline pb-3">
              <h4 className="font-bold text-navy text-sm uppercase tracking-wide">
                New Containment Intervention
              </h4>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-muted hover:text-navy text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-navy font-semibold mb-1">Task Title / Action</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Inspect chlorination dosing at Well #3"
                  className="w-full border border-borderline px-3 py-2 rounded-lg bg-canvas text-navy focus:outline-none focus:border-teal"
                  required
                />
              </div>

              <div>
                <label className="block text-navy font-semibold mb-1">Target Water Source</label>
                <select
                  value={newSourceId}
                  onChange={(e) => setNewSourceId(e.target.value)}
                  className="w-full border border-borderline px-3 py-2 rounded-lg bg-canvas text-navy focus:outline-none focus:border-teal"
                >
                  {sources.map((s) => (
                    <option key={s.source_id} value={s.source_id}>
                      {s.source_name} ({s.source_id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-navy font-semibold mb-1">Responsible Role</label>
                <input
                  type="text"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full border border-borderline px-3 py-2 rounded-lg bg-canvas text-navy"
                />
              </div>

              <div>
                <label className="block text-navy font-semibold mb-1">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as "high" | "medium" | "low")}
                  className="w-full border border-borderline px-3 py-2 rounded-lg bg-canvas text-navy"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>

              <div className="pt-3 border-t border-borderline flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-borderline text-muted rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal text-white rounded-lg font-bold hover:bg-teal-dark"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
