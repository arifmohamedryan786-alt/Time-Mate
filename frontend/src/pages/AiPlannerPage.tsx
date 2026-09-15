import React, { useState } from 'react';
import { Sparkles, Calendar, BookOpen, Clock, CheckCircle, ArrowRight, Zap, Target, BrainCircuit, ShieldAlert, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface StudyPlanItem {
  day: number;
  topic: string;
  duration: string;
  focusArea: string;
  tasks: string[];
}

export const AiPlannerPage: React.FC = () => {
  const { addTask } = useApp();

  const [subjectName, setSubjectName] = useState('');
  const [daysLeft, setDaysLeft] = useState<number>(5);
  const [dailyHours, setDailyHours] = useState<number>(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<StudyPlanItem[] | null>(null);
  const [injectedSuccess, setInjectedSuccess] = useState(false);

  const handleGeneratePlan = () => {
    if (!subjectName.trim()) return;

    setIsGenerating(true);
    setInjectedSuccess(false);

    setTimeout(() => {
      const subject = subjectName.trim();
      const plan: StudyPlanItem[] = [];

      for (let d = 1; d <= daysLeft; d++) {
        let topic = `${subject} - Core Concepts & Fundamentals Part ${d}`;
        let focusArea = 'High-Yield Theory & Formulas';
        let tasks = [
          `Review ${subject} Chapter ${d} key notes`,
          `Complete 5 practice questions`,
          `30-min Pomodoro self-quiz`
        ];

        if (d === daysLeft) {
          topic = `${subject} - Final Mock Test & Formula Sheet Review`;
          focusArea = 'Mock Exam & Quick Memory Recall';
          tasks = [
            `Solve previous year exam paper`,
            `Revise weak formula areas`,
            `Final 1-hour timed mock test`
          ];
        } else if (d === Math.ceil(daysLeft / 2)) {
          topic = `${subject} - Mid-Point Intensive Problem Solving`;
          focusArea = 'Important Problems & Case Studies';
          tasks = [
            `Solve 10 complex numericals/problems`,
            `Create quick mind-map summary`,
            `Group study discussion or peer review`
          ];
        }

        plan.push({
          day: d,
          topic,
          duration: `${dailyHours} Hours`,
          focusArea,
          tasks
        });
      }

      setGeneratedPlan(plan);
      setIsGenerating(false);
    }, 800);
  };

  const handleAddTasksToWorkspace = async () => {
    if (!generatedPlan) return;
    try {
      for (const item of generatedPlan) {
        for (const taskTitle of item.tasks) {
          await addTask({
            title: `[Day ${item.day}] ${taskTitle}`,
            category: 'Study',
            priority: item.day === daysLeft ? 'HIGH' : 'MEDIUM',
            due_date: new Date(Date.now() + (item.day - 1) * 86400000).toISOString().split('T')[0]
          });
        }
      }
      setInjectedSuccess(true);
    } catch (err) {
      console.error('Failed to add generated tasks:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-warm-600 via-warm-500 to-amber-600 p-6 sm:p-8 rounded-3xl text-white shadow-card relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>AI Smart Study & Exam Roadmaps</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            AI Exam & Subject Study Planner
          </h1>
          <p className="text-warm-100 text-xs sm:text-sm max-w-xl leading-relaxed">
            Enter your upcoming exam or topic to generate a personalized, day-by-day study roadmap optimized for maximum retention.
          </p>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-surface-card p-6 rounded-3xl border border-surface-border shadow-subtle space-y-5">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-warm-600" />
          <span>Set Up Your AI Study Goal</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Subject / Exam Name
            </label>
            <input
              type="text"
              placeholder="e.g. Data Structures & Algorithms, Operating Systems, Organic Chemistry"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-bg border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-warm-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Days Available
            </label>
            <select
              value={daysLeft}
              onChange={(e) => setDaysLeft(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-surface-bg border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white transition-colors"
            >
              <option value={3}>3 Days (Crash Course)</option>
              <option value={5}>5 Days (Standard Prep)</option>
              <option value={7}>7 Days (Deep Revision)</option>
              <option value={10}>10 Days (Comprehensive)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Daily Study Capacity
            </label>
            <select
              value={dailyHours}
              onChange={(e) => setDailyHours(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-surface-bg border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white transition-colors"
            >
              <option value={2}>2 Hours / day</option>
              <option value={3}>3 Hours / day</option>
              <option value={4}>4 Hours / day</option>
              <option value={6}>6 Hours / day (Intensive)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGeneratePlan}
              disabled={isGenerating || !subjectName.trim()}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-warm-500 hover:bg-warm-600 disabled:opacity-50 rounded-xl shadow-subtle transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Generating Plan...' : 'Generate Roadmap'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Generated Roadmap Display */}
      {generatedPlan && (
        <div className="space-y-4 animate-in fade-in">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-warm-50 p-4 rounded-2xl border border-warm-200">
            <div>
              <h3 className="text-sm font-bold text-warm-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-warm-700" />
                <span>Generated Study Roadmap: {subjectName}</span>
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                {daysLeft} Days • {dailyHours} Hours Daily • {generatedPlan.reduce((acc, curr) => acc + curr.tasks.length, 0)} Smart Tasks
              </p>
            </div>

            <button
              onClick={handleAddTasksToWorkspace}
              disabled={injectedSuccess}
              className={`px-4 py-2 text-xs font-semibold rounded-xl shadow-subtle transition-all flex items-center gap-1.5 ${
                injectedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-warm-500 hover:bg-warm-600 text-white'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>{injectedSuccess ? 'Added to Priority Tasks!' : 'Add All to My Tasks'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generatedPlan.map((item) => (
              <div key={item.day} className="bg-surface-card p-5 rounded-2xl border border-surface-border shadow-subtle space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-warm-100 text-warm-900 text-xs font-bold border border-warm-200">
                    Day {item.day}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {item.duration}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">{item.topic}</h4>
                  <p className="text-xs text-warm-700 font-medium mt-0.5">{item.focusArea}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  {item.tasks.map((t, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-warm-500 mt-1.5 shrink-0" />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};
