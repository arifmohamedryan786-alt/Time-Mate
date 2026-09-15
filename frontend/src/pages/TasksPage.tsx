import React, { useState } from 'react';
import { Plus, CheckSquare, CheckCircle2, Circle, Clock, RefreshCw, Edit2, Trash2, Filter, ArrowUpDown, Tag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Task, Priority } from '../types';

interface TasksPageProps {
  onOpenAddTask: () => void;
  onOpenEditTask: (task: Task) => void;
  onOpenReschedule: (task: Task) => void;
}

export const TasksPage: React.FC<TasksPageProps> = ({ onOpenAddTask, onOpenEditTask, onOpenReschedule }) => {
  const { tasks, toggleTaskComplete, deleteTask } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'due_time' | 'created'>('priority');

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (filter === 'today') return t.due_date === todayStr && !t.completed;
    if (filter === 'upcoming') return t.due_date > todayStr && !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  // Sort tasks
  const priorityWeight: Record<Priority, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'priority') {
      const pDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
      if (pDiff !== 0) return pDiff;
      return (a.due_time || '23:59').localeCompare(b.due_time || '23:59');
    }
    if (sortBy === 'due_time') {
      return (a.due_time || '23:59').localeCompare(b.due_time || '23:59');
    }
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-card p-5 rounded-2xl border border-surface-border shadow-subtle">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Priority Task Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Organize assignments, study tasks, and personal projects by priority
          </p>
        </div>

        <button
          onClick={onOpenAddTask}
          className="px-4 py-2 text-xs font-semibold text-white bg-warm-500 hover:bg-warm-600 rounded-xl shadow-subtle transition-all flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Task</span>
        </button>
      </div>

      {/* Filter & Sorting Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-card p-4 rounded-2xl border border-surface-border shadow-subtle">
        
        {/* Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'today', 'upcoming', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl capitalize transition-all shrink-0 ${
                filter === tab
                  ? 'bg-warm-500 text-white shadow-subtle'
                  : 'text-slate-600 hover:bg-surface-hover hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-slate-600">
          <ArrowUpDown className="w-4 h-4 text-warm-600 shrink-0" />
          <span className="font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-surface-bg border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-900 focus:outline-none"
          >
            <option value="priority">Priority (High to Low)</option>
            <option value="due_time">Due Time</option>
            <option value="created">Created Date</option>
          </select>
        </div>

      </div>

      {/* Task List */}
      <div className="bg-surface-card p-6 rounded-2xl border border-surface-border shadow-subtle">
        {sortedTasks.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <CheckSquare className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">No tasks planned yet.</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add your first task and give your day a clear direction.
            </p>
            <button
              onClick={onOpenAddTask}
              className="mt-2 px-5 py-2.5 text-xs font-semibold text-white bg-warm-500 hover:bg-warm-600 rounded-xl shadow-subtle inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Task</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedTasks.map((t) => (
              <div
                key={t.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  t.completed
                    ? 'bg-slate-50 border-slate-200 text-slate-400'
                    : 'bg-surface-bg hover:bg-warm-50/60 border-slate-200 hover:border-warm-300 text-slate-900'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <button
                    onClick={() => toggleTaskComplete(t.id)}
                    className="mt-0.5 sm:mt-0 text-slate-400 hover:text-warm-600 transition-colors shrink-0"
                  >
                    {t.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 hover:text-warm-500" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          t.priority === 'HIGH'
                            ? 'bg-red-100 text-red-700'
                            : t.priority === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {t.priority} Priority
                      </span>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-warm-100 text-warm-800 border border-warm-200">
                        {t.category}
                      </span>
                    </div>

                    <h3 className={`text-base font-bold mt-1 ${t.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {t.title}
                    </h3>

                    {t.description && <p className="text-xs text-slate-600 mt-0.5">{t.description}</p>}

                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Due: {t.due_date} at {t.due_time}
                      </span>
                      {t.notes && <span className="italic text-slate-400">— {t.notes}</span>}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {!t.completed && (
                    <button
                      onClick={() => onOpenReschedule(t)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-warm-800 bg-warm-100 hover:bg-warm-200 border border-warm-200 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reschedule</span>
                    </button>
                  )}

                  <button
                    onClick={() => onOpenEditTask(t)}
                    title="Edit Task"
                    className="p-1.5 text-slate-400 hover:text-warm-700 hover:bg-warm-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => deleteTask(t.id)}
                    title="Delete Task"
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
