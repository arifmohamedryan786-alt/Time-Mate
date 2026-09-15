import React from 'react';
import { Plus, Calendar, Play, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onOpenAddTask: () => void;
  onOpenAddSchedule: () => void;
  onNavigate: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAddTask, onOpenAddSchedule, onNavigate }) => {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-surface-card p-5 rounded-2xl border border-surface-border shadow-subtle">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {getGreeting()}, <span className="text-warm-600">{user?.name || 'Student'}</span>
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-2">
          <span>{currentDateFormatted}</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-600 font-medium">Small progress today makes tomorrow easier.</span>
        </p>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        <button
          onClick={onOpenAddTask}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-warm-500 hover:bg-warm-600 rounded-xl shadow-subtle transition-all flex items-center gap-1.5 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
        
        <button
          onClick={onOpenAddSchedule}
          className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-warm-100 hover:bg-warm-200 rounded-xl transition-all flex items-center gap-1.5"
        >
          <Calendar className="w-4 h-4 text-warm-700" />
          Plan My Day
        </button>

        <button
          onClick={() => onNavigate('focus')}
          className="px-3.5 py-2 text-xs font-semibold text-warm-900 bg-warm-50 hover:bg-warm-100 border border-warm-200 rounded-xl transition-all flex items-center gap-1.5"
        >
          <Play className="w-4 h-4 fill-warm-600 text-warm-600" />
          Start Focus
        </button>
      </div>
    </div>
  );
};
