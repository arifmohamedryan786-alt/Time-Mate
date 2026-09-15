import React from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar, 
  Play, 
  Plus, 
  RefreshCw, 
  ArrowRight, 
  BookOpen, 
  FileText, 
  User, 
  Coffee,
  CheckSquare
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Task, Schedule } from '../types';

interface DashboardPageProps {
  onOpenAddTask: () => void;
  onOpenAddSchedule: () => void;
  onOpenReschedule: (task: Task) => void;
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenAddTask,
  onOpenAddSchedule,
  onOpenReschedule,
  onNavigate,
}) => {
  const { tasks, schedules, toggleTaskComplete, loading } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  // Today's tasks
  const todayTasks = tasks.filter((t) => t.due_date === todayStr);
  const completedTodayCount = todayTasks.filter((t) => t.completed).length;
  const totalTodayCount = todayTasks.length;
  const progressPercent = totalTodayCount > 0 ? Math.round((completedTodayCount / totalTodayCount) * 100) : 0;

  // Next Up Activity from schedules
  const todaySchedules = schedules.filter((s) => s.date === todayStr && !s.completed);
  const nextActivity: Schedule | undefined = todaySchedules[0] || schedules.filter((s) => !s.completed)[0];

  // Daily balance breakdown estimation
  const balanceData = [
    { label: 'Study & Classes', category: 'Study', percent: 45, color: 'bg-warm-500', icon: BookOpen },
    { label: 'Assignments', category: 'Assignment', percent: 25, color: 'bg-amber-600', icon: FileText },
    { label: 'Personal Time', category: 'Personal', percent: 15, color: 'bg-emerald-600', icon: User },
    { label: 'Rest & Meals', category: 'Rest', percent: 15, color: 'bg-slate-500', icon: Coffee },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Grid: Progress & Next Up */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* A. TODAY'S PROGRESS */}
        <div className="bg-surface-card p-6 rounded-2xl border border-surface-border shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Progress</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-warm-100 text-warm-800">
                {completedTodayCount} of {totalTodayCount} completed
              </span>
            </div>
            <div className="flex items-baseline gap-2 my-2">
              <span className="text-4xl font-extrabold text-slate-900">{progressPercent}%</span>
              <span className="text-xs text-slate-500 font-medium">overall completion</span>
            </div>
          </div>

          {/* Progress Ring / Bar */}
          <div className="mt-4">
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                className="bg-warm-500 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              {progressPercent >= 70
                ? 'Great momentum! You are on track with today’s plan.'
                : totalTodayCount === 0
                ? 'No tasks scheduled for today yet.'
                : 'Keep going! Complete high priority tasks first.'}
            </p>
          </div>
        </div>

        {/* C. NEXT UP */}
        <div className="bg-surface-card p-6 rounded-2xl border border-surface-border shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Next Up</span>
              <span className="text-xs font-medium text-warm-700 bg-warm-50 px-2 py-0.5 rounded-full border border-warm-200">
                Upcoming
              </span>
            </div>

            {nextActivity ? (
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-warm-700">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{nextActivity.start_time} – {nextActivity.end_time}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">{nextActivity.title}</h3>
                <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 mt-1">
                  {nextActivity.category}
                </span>
              </div>
            ) : (
              <div className="mt-2 text-slate-500 text-xs py-2">
                No upcoming scheduled activities.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-surface-border flex items-center justify-between">
            <button
              onClick={() => onNavigate('planner')}
              className="text-xs font-semibold text-warm-700 hover:text-warm-800 flex items-center gap-1"
            >
              <span>View Daily Planner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* F. FOCUS SESSION QUICK LAUNCHER */}
        <div className="bg-warm-500 text-white p-6 rounded-2xl shadow-card flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-warm-200 uppercase tracking-wider block mb-1">
              Focus Session
            </span>
            <h3 className="text-xl font-bold mb-2">Ready to focus?</h3>
            <p className="text-xs text-warm-100 leading-relaxed">
              Block out mobile distractions and lock in 25 minutes of high-priority study work.
            </p>
          </div>

          <div className="mt-6">
            <button
              onClick={() => onNavigate('focus')}
              className="w-full py-2.5 px-4 bg-white text-warm-900 hover:bg-warm-50 font-semibold text-xs rounded-xl shadow-subtle transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-warm-700 text-warm-700" />
              <span>Start Focus Session (25 min)</span>
            </button>
          </div>
        </div>

      </div>

      {/* Main Grid: Today's Tasks & Daily Balance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* B. TODAY'S TASKS (2 Columns) */}
        <div className="lg:col-span-2 bg-surface-card p-6 rounded-2xl border border-surface-border shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border">
            <div>
              <h2 className="text-base font-bold text-slate-900">Today's Tasks</h2>
              <p className="text-xs text-slate-500">Prioritized checklist for your day</p>
            </div>
            <button
              onClick={onOpenAddTask}
              className="px-3 py-1.5 text-xs font-semibold text-warm-800 bg-warm-100 hover:bg-warm-200 rounded-lg transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          </div>

          {/* Task List */}
          {todayTasks.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <CheckSquare className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-800">No tasks planned for today yet.</p>
              <p className="text-xs text-slate-500">Add your first task and give your day a clear direction.</p>
              <button
                onClick={onOpenAddTask}
                className="mt-2 px-4 py-2 text-xs font-semibold text-white bg-warm-500 hover:bg-warm-600 rounded-xl inline-flex items-center gap-1.5 shadow-subtle"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Task</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {todayTasks.map((t) => (
                <div
                  key={t.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    t.completed
                      ? 'bg-slate-50 border-slate-200 text-slate-400'
                      : 'bg-surface-bg hover:bg-warm-50/50 border-slate-200 hover:border-warm-300 text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => toggleTaskComplete(t.id)}
                      className="text-slate-400 hover:text-warm-600 transition-colors shrink-0"
                    >
                      {t.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 hover:text-warm-500" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <p className={`text-sm font-medium truncate ${t.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {t.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {t.due_time || 'Today'}
                        </span>
                        <span>•</span>
                        <span className="font-medium text-slate-600">{t.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        t.priority === 'HIGH'
                          ? 'bg-red-100 text-red-700'
                          : t.priority === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {t.priority}
                    </span>

                    {!t.completed && (
                      <button
                        onClick={() => onOpenReschedule(t)}
                        title="Flexible Reschedule"
                        className="p-1.5 text-slate-400 hover:text-warm-700 hover:bg-warm-100 rounded-lg transition-colors text-xs flex items-center gap-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 text-right">
            <button
              onClick={() => onNavigate('tasks')}
              className="text-xs font-semibold text-warm-700 hover:text-warm-800 inline-flex items-center gap-1"
            >
              <span>View All Tasks & Filters</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* E. DAILY BALANCE */}
        <div className="bg-surface-card p-6 rounded-2xl border border-surface-border shadow-subtle flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-1">Daily Time Balance</h2>
            <p className="text-xs text-slate-500 mb-4">Daily routine allocation ratio</p>

            <div className="space-y-3.5">
              {balanceData.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-medium text-slate-700">
                        <Icon className="w-3.5 h-3.5 text-slate-500" />
                        {item.label}
                      </span>
                      <span className="font-semibold text-slate-900">{item.percent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 p-3 bg-warm-50 rounded-xl border border-warm-200 text-xs text-slate-600 leading-relaxed">
            <span className="font-semibold text-warm-900">Student Balance Tip:</span> Aim for a balanced ratio of study blocks, meal routines, and rest to prevent burnout.
          </div>
        </div>

      </div>

    </div>
  );
};
