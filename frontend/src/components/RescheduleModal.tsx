import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, ArrowRight, RefreshCw } from 'lucide-react';
import { Task } from '../types';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onReschedule: (taskId: string, newDate: string, newTime: string) => Promise<void>;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({ isOpen, onClose, task, onReschedule }) => {
  if (!isOpen || !task) return null;

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayStr = today.toISOString().split('T')[0];
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [date, setDate] = useState(task.due_date || todayStr);
  const [time, setTime] = useState(task.due_time || '20:00');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setDate(task.due_date);
      setTime(task.due_time || '20:00');
    }
  }, [task]);

  const handleQuickPreset = (preset: 'later_today' | 'tomorrow' | 'weekend') => {
    if (preset === 'later_today') {
      setDate(todayStr);
      setTime('21:00');
    } else if (preset === 'tomorrow') {
      setDate(tomorrowStr);
      setTime('10:00');
    } else if (preset === 'weekend') {
      const nextSaturday = new Date();
      nextSaturday.setDate(today.getDate() + ((6 - today.getDay() + 7) % 7 || 7));
      setDate(nextSaturday.toISOString().split('T')[0]);
      setTime('11:00');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onReschedule(task.id, date, time);
      onClose();
    } catch (err) {
      console.error('Failed to reschedule task:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-card w-full max-w-md rounded-2xl border border-surface-border shadow-dropdown overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between bg-warm-50/50">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <RefreshCw className="w-4 h-4 text-warm-600" />
            <span>Flexible Reschedule</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-warm-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Target Task Summary */}
          <div className="p-3.5 bg-warm-50/60 rounded-xl border border-warm-200 text-xs">
            <span className="text-slate-500 font-medium block uppercase tracking-wider text-[10px] mb-0.5">
              Task to Reschedule
            </span>
            <p className="font-semibold text-slate-900 text-sm truncate">{task.title}</p>
            <p className="text-slate-600 mt-1 flex items-center gap-1.5">
              <span>Current Due:</span>
              <span className="font-medium bg-white px-2 py-0.5 rounded border border-warm-200">
                {task.due_date} at {task.due_time}
              </span>
            </p>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Quick Presets</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickPreset('later_today')}
                className="py-2 px-2 text-xs font-medium bg-surface-bg hover:bg-warm-100 border border-slate-200 hover:border-warm-300 rounded-xl text-slate-800 transition-colors text-center"
              >
                Later Today
                <span className="block text-[10px] text-slate-500 font-normal">9:00 PM</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset('tomorrow')}
                className="py-2 px-2 text-xs font-medium bg-surface-bg hover:bg-warm-100 border border-slate-200 hover:border-warm-300 rounded-xl text-slate-800 transition-colors text-center"
              >
                Tomorrow
                <span className="block text-[10px] text-slate-500 font-normal">10:00 AM</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset('weekend')}
                className="py-2 px-2 text-xs font-medium bg-surface-bg hover:bg-warm-100 border border-slate-200 hover:border-warm-300 rounded-xl text-slate-800 transition-colors text-center"
              >
                Weekend
                <span className="block text-[10px] text-slate-500 font-normal">Saturday</span>
              </button>
            </div>
          </div>

          {/* Custom Date & Time Inputs */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">New Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-surface-bg border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">New Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-surface-bg border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white transition-colors"
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-surface-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-warm-500 hover:bg-warm-600 rounded-xl shadow-subtle transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? 'Updating...' : 'Save Changes'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
