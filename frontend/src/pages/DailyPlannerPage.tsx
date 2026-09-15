import React, { useState } from 'react';
import { Plus, Calendar, Clock, CheckCircle2, Circle, Edit2, Trash2, Tag, BookOpen, Coffee, Utensils, User, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Schedule, ScheduleCategory } from '../types';

interface DailyPlannerPageProps {
  onOpenAddSchedule: () => void;
  onOpenEditSchedule: (schedule: Schedule) => void;
}

export const DailyPlannerPage: React.FC<DailyPlannerPageProps> = ({ onOpenAddSchedule, onOpenEditSchedule }) => {
  const { schedules, toggleScheduleComplete, deleteSchedule } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const filteredSchedules = schedules.filter((s) => s.date === selectedDate);

  const getCategoryBadge = (cat: ScheduleCategory) => {
    switch (cat) {
      case 'Study':
        return 'bg-warm-100 text-warm-800 border-warm-200';
      case 'Assignment':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Class':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Meal':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Personal':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Rest':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getCategoryIcon = (cat: ScheduleCategory) => {
    switch (cat) {
      case 'Study':
      case 'Class':
        return <BookOpen className="w-3.5 h-3.5" />;
      case 'Meal':
        return <Utensils className="w-3.5 h-3.5" />;
      case 'Rest':
        return <Coffee className="w-3.5 h-3.5" />;
      default:
        return <User className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-card p-5 rounded-2xl border border-surface-border shadow-subtle">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Daily Planner</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Timeline schedule for classes, meals, study sessions, and rest
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-surface-bg border border-slate-300 rounded-xl px-3 py-1.5 text-xs">
            <Calendar className="w-4 h-4 text-warm-600 shrink-0" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent font-medium text-slate-900 focus:outline-none"
            />
          </div>

          <button
            onClick={onOpenAddSchedule}
            className="px-4 py-2 text-xs font-semibold text-white bg-warm-500 hover:bg-warm-600 rounded-xl shadow-subtle transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Plan Activity</span>
          </button>
        </div>
      </div>

      {/* Schedule Timeline */}
      <div className="bg-surface-card p-6 rounded-2xl border border-surface-border shadow-subtle">
        {filteredSchedules.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">Your day is still open.</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add a few activities to create a realistic plan for classes, meals, and focus sessions.
            </p>
            <button
              onClick={onOpenAddSchedule}
              className="mt-2 px-5 py-2.5 text-xs font-semibold text-white bg-warm-500 hover:bg-warm-600 rounded-xl shadow-subtle inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Activity</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSchedules.map((item) => (
              <div key={item.id} className="relative group">
                
                {/* Schedule Card */}
                <div
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    item.completed
                      ? 'bg-slate-50 border-slate-200 text-slate-400'
                      : 'bg-surface-bg hover:bg-warm-50/60 border-slate-200 hover:border-warm-300 text-slate-900'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <button
                      onClick={() => toggleScheduleComplete(item.id)}
                      className="mt-0.5 sm:mt-0 text-slate-400 hover:text-warm-600 transition-colors shrink-0"
                    >
                      {item.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 hover:text-warm-500" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-warm-700 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {item.start_time} – {item.end_time}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${getCategoryBadge(
                            item.category
                          )}`}
                        >
                          {getCategoryIcon(item.category)}
                          {item.category}
                        </span>
                      </div>

                      <h3 className={`text-base font-bold mt-1 ${item.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {item.title}
                      </h3>

                      {item.notes && <p className="text-xs text-slate-500 mt-0.5">{item.notes}</p>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => onOpenEditSchedule(item)}
                      title="Edit Activity"
                      className="p-1.5 text-slate-400 hover:text-warm-700 hover:bg-warm-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteSchedule(item.id)}
                      title="Delete Activity"
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
