import React, { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw, CheckCircle2, Award, BookOpen, Plus, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const FocusTimerPage: React.FC = () => {
  const { tasks, addTask, addFocusSession } = useApp();

  const activeTasks = tasks.filter((t) => !t.completed);

  const [durationMinutes, setDurationMinutes] = useState(25);
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [customMinutesInput, setCustomMinutesInput] = useState<number>(0);
  const [customSecondsInput, setCustomSecondsInput] = useState<number>(30);

  const [timeLeftSeconds, setTimeLeftSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [showNewTaskInput, setShowNewTaskInput] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  const [completedModalOpen, setCompletedModalOpen] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync timer when duration preset or custom min/sec changes while not running
  useEffect(() => {
    if (!isRunning) {
      if (isCustomDuration) {
        const total = customMinutesInput * 60 + customSecondsInput;
        setTimeLeftSeconds(total > 0 ? total : 1);
      } else {
        setTimeLeftSeconds(durationMinutes * 60);
      }
    }
  }, [durationMinutes, isCustomDuration, customMinutesInput, customSecondsInput, isRunning]);

  // Timer interval ticker
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            handleFinishSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const handleStart = async () => {
    if (newTaskTitle.trim() && !selectedTaskId) {
      try {
        setIsAddingTask(true);
        const created = await addTask({
          title: newTaskTitle.trim(),
          priority: 'MEDIUM',
          category: 'Study',
        });
        if (created && created.id) {
          setSelectedTaskId(created.id);
        }
        setNewTaskTitle('');
      } catch (err) {
        console.error('Failed to create focus task on start:', err);
      } finally {
        setIsAddingTask(false);
      }
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    if (isCustomDuration) {
      const total = customMinutesInput * 60 + customSecondsInput;
      setTimeLeftSeconds(total > 0 ? total : 1);
    } else {
      setTimeLeftSeconds(durationMinutes * 60);
    }
  };

  const handleFinishSession = async () => {
    setIsRunning(false);
    const sessionMins = isCustomDuration
      ? Math.max(1, Math.round((customMinutesInput * 60 + customSecondsInput) / 60))
      : durationMinutes;
    await addFocusSession(selectedTaskId || null, sessionMins);
    setCompletedModalOpen(true);
  };

  const handleCreateNewTask = async () => {
    if (!newTaskTitle.trim()) return;
    try {
      setIsAddingTask(true);
      const created = await addTask({
        title: newTaskTitle.trim(),
        priority: 'MEDIUM',
        category: 'Study',
      });
      if (created && created.id) {
        setSelectedTaskId(created.id);
      }
      setNewTaskTitle('');
      setShowNewTaskInput(false);
    } catch (err) {
      console.error('Failed to create task:', err);
    } finally {
      setIsAddingTask(false);
    }
  };

  const handleSelectDurationPreset = (mins: number) => {
    setIsCustomDuration(false);
    setDurationMinutes(mins);
  };

  const handleSelectCustomDuration = () => {
    setIsCustomDuration(true);
    const total = customMinutesInput * 60 + customSecondsInput;
    setTimeLeftSeconds(total > 0 ? total : 30);
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Main Focus Card */}
      <div className="bg-surface-card p-8 rounded-3xl border border-surface-border shadow-card text-center space-y-6">
        
        {/* Custom Focus Task Input */}
        {!isRunning && (
          <div className="max-w-sm mx-auto text-left space-y-1.5">
            <label className="block text-[11px] font-semibold text-slate-600">
              Enter your custom focus task:
            </label>
            
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="e.g. Physics Ch 4, OS Lab"
                value={newTaskTitle}
                onChange={(e) => {
                  setNewTaskTitle(e.target.value);
                  if (selectedTaskId) setSelectedTaskId('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateNewTask()}
                className="flex-1 px-3 py-1.5 bg-surface-bg border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:border-warm-500 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={handleCreateNewTask}
                disabled={isAddingTask || !newTaskTitle.trim()}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-warm-500 hover:bg-warm-600 disabled:opacity-40 rounded-lg shadow-subtle transition-all flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAddingTask ? 'Adding...' : 'Add Task'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Selected Task Active Badge */}
        {selectedTask && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-warm-100 text-warm-900 text-xs font-semibold border border-warm-200">
            <BookOpen className="w-4 h-4 text-warm-700" />
            <span>Focusing on: {selectedTask.title}</span>
          </div>
        )}

        {/* Duration Selector Presets & Custom Time */}
        {!isRunning && (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {[15, 25, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleSelectDurationPreset(mins)}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
                    !isCustomDuration && durationMinutes === mins
                      ? 'bg-warm-500 text-white border-warm-500 shadow-subtle'
                      : 'bg-surface-bg text-slate-700 border-slate-200 hover:border-warm-300'
                  }`}
                >
                  {mins} min
                </button>
              ))}

              <button
                onClick={handleSelectCustomDuration}
                className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
                  isCustomDuration
                    ? 'bg-warm-500 text-white border-warm-500 shadow-subtle'
                    : 'bg-surface-bg text-slate-700 border-slate-200 hover:border-warm-300'
                }`}
              >
                Custom Time
              </button>
            </div>

            {/* Custom Minutes & Seconds Input Box */}
            {isCustomDuration && (
              <div className="inline-flex items-center justify-center gap-3 px-4 py-2.5 bg-surface-bg border border-warm-300 rounded-2xl animate-in fade-in flex-wrap">
                <span className="text-xs font-semibold text-slate-700">Set duration:</span>
                
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="480"
                    value={customMinutesInput}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setCustomMinutesInput(isNaN(val) || val < 0 ? 0 : val);
                    }}
                    className="w-14 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-center text-slate-900 focus:outline-none focus:border-warm-500"
                  />
                  <span className="text-xs font-medium text-slate-600">min</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={customSecondsInput}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setCustomSecondsInput(isNaN(val) || val < 0 ? 0 : Math.min(59, val));
                    }}
                    className="w-14 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-center text-slate-900 focus:outline-none focus:border-warm-500"
                  />
                  <span className="text-xs font-medium text-slate-600">sec</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Big Timer Circle Display */}
        <div className="py-6">
          <div className="w-64 h-64 mx-auto rounded-full bg-warm-50/60 border-4 border-warm-200 flex flex-col items-center justify-center shadow-subtle px-4 text-center">
            <span className="text-6xl font-extrabold text-slate-900 font-mono tracking-tighter">
              {formatTime(timeLeftSeconds)}
            </span>
            <span className="text-xs text-warm-800 font-bold uppercase tracking-wide mt-3 max-w-[210px] line-clamp-2 px-1">
              {selectedTask ? selectedTask.title : newTaskTitle.trim() ? newTaskTitle.trim() : 'Focus Session'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="px-8 py-3.5 text-base font-semibold text-white bg-warm-500 hover:bg-warm-600 rounded-2xl shadow-card transition-all flex items-center gap-2 active:scale-[0.98]"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Start Focus</span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="px-8 py-3.5 text-base font-semibold text-warm-900 bg-warm-100 hover:bg-warm-200 rounded-2xl transition-all flex items-center gap-2"
            >
              <Pause className="w-5 h-5 fill-warm-800" />
              <span>Pause</span>
            </button>
          )}

          <button
            onClick={handleReset}
            title="Reset Timer"
            className="p-3.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-colors border border-slate-200"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {isRunning && (
            <button
              onClick={handleFinishSession}
              className="px-5 py-3.5 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-2xl transition-all"
            >
              Finish Early
            </button>
          )}
        </div>

      </div>

      {/* Completion Modal */}
      {completedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface-card max-w-sm w-full p-6 rounded-3xl border border-surface-border shadow-dropdown text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Focus Session Completed!</h3>
            <p className="text-xs text-slate-600">
              You completed <span className="font-bold text-warm-700">
                {isCustomDuration ? `${customMinutesInput}m ${customSecondsInput}s` : `${durationMinutes} minutes`}
              </span> of deep study focus. Saved to your database!
            </p>
            <button
              onClick={() => setCompletedModalOpen(false)}
              className="w-full py-2.5 text-sm font-semibold text-white bg-warm-500 hover:bg-warm-600 rounded-xl shadow-subtle transition-all"
            >
              Great Work
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
