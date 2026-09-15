import React, { useState } from 'react';
import { X, Smartphone, Brain, Sparkles, CheckCircle2 } from 'lucide-react';
import { DistractionLevel, FocusLevel, DailyReflection } from '../types';

interface ReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<DailyReflection>) => Promise<void>;
  existingReflection?: DailyReflection | null;
}

export const ReflectionModal: React.FC<ReflectionModalProps> = ({ isOpen, onClose, onSave, existingReflection }) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  const [distractionLevel, setDistractionLevel] = useState<DistractionLevel>(
    existingReflection?.distraction_level || '30–60 min'
  );
  const [focusLevel, setFocusLevel] = useState<FocusLevel>(
    existingReflection?.focus_level || 'Good'
  );
  const [notes, setNotes] = useState(existingReflection?.notes || '');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const distractionOptions: DistractionLevel[] = [
    'Less than 30 min',
    '30–60 min',
    '1–2 hours',
    '2–3 hours',
    'More than 3 hours',
  ];

  const focusOptions: { level: FocusLevel; emoji: string; desc: string }[] = [
    { level: 'Low', emoji: '💤', desc: 'Frequent distractions, lost momentum' },
    { level: 'Okay', emoji: '😐', desc: 'Completed basic tasks, moderate focus' },
    { level: 'Good', emoji: '🎯', desc: 'Well-structured day, steady progress' },
    { level: 'Excellent', emoji: '🔥', desc: 'Deep focus, completed key priorities' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        date: todayStr,
        distraction_level: distractionLevel,
        focus_level: focusLevel,
        notes: notes.trim(),
      });
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to save daily reflection:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-card w-full max-w-lg rounded-2xl border border-surface-border shadow-dropdown overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between bg-warm-50/50">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Smartphone className="w-5 h-5 text-warm-600" />
            <span>Daily Focus & Phone Distraction Self-Check</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-warm-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {saved ? (
          <div className="p-10 text-center flex flex-col items-center justify-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 animate-bounce" />
            <h3 className="text-lg font-bold text-slate-900">Daily Reflection Saved!</h3>
            <p className="text-xs text-slate-500">Self-awareness is the first step toward better daily routines.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Context Note */}
            <p className="text-xs text-slate-600 bg-warm-50 p-3 rounded-xl border border-warm-200 leading-relaxed">
              <span className="font-semibold text-warm-900">Research Note:</span> Student life involves constant mobile notifications and peer interruptions. Taking 30 seconds to reflect builds personal time awareness.
            </p>

            {/* Question 1: Distraction */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-2 flex items-center justify-between">
                <span>How much time did you spend on distracting phone use today?</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {distractionOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setDistractionLevel(opt)}
                    className={`py-2.5 px-3 text-xs font-medium rounded-xl border transition-all text-left flex items-center justify-between ${
                      distractionLevel === opt
                        ? 'bg-warm-500 text-white border-warm-500 font-semibold shadow-subtle'
                        : 'bg-surface-bg text-slate-700 border-slate-200 hover:border-warm-300 hover:bg-warm-50'
                    }`}
                  >
                    <span>{opt}</span>
                    {distractionLevel === opt && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 2: Focus Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-2 flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-warm-600" />
                <span>How focused did you feel today overall?</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {focusOptions.map((item) => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setFocusLevel(item.level)}
                    className={`p-3 rounded-xl border transition-all text-center flex flex-col items-center gap-1 ${
                      focusLevel === item.level
                        ? 'bg-warm-50 text-warm-900 border-warm-500 font-bold shadow-subtle ring-1 ring-warm-500'
                        : 'bg-surface-bg text-slate-700 border-slate-200 hover:border-warm-300 hover:bg-warm-50'
                    }`}
                  >
                    <span className="text-xl">{item.emoji}</span>
                    <span className="text-xs">{item.level}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Reflection Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reflection Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Put phone in silent mode during evening study session"
                className="w-full px-3.5 py-2.5 bg-surface-bg border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white transition-colors"
              />
            </div>

            {/* Actions */}
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
                className="px-5 py-2 text-sm font-semibold text-white bg-warm-500 hover:bg-warm-600 rounded-xl shadow-subtle transition-all disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Reflection'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
