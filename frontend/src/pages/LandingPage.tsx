import React from 'react';
import { Compass, CheckSquare, Calendar, Timer, RefreshCw, BarChart2, ArrowRight, ShieldCheck, Clock, Award } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-surface-bg flex flex-col">
      
      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
          Plan your day. <br />
          <span className="text-warm-600">Focus on what matters.</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          A simple time-management companion designed for students to organize tasks, build realistic schedules and stay focused.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => onNavigate('signup')}
            className="w-full sm:w-auto px-7 py-3.5 text-base font-semibold text-white bg-warm-500 hover:bg-warm-600 rounded-xl shadow-card transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <a
            href="#features"
            className="w-full sm:w-auto px-7 py-3.5 text-base font-semibold text-slate-700 bg-surface-card hover:bg-warm-50 border border-surface-border rounded-xl transition-all text-center"
          >
            Explore Features
          </a>
        </div>

        {/* Dashboard Preview Mockup */}
        <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-surface-border bg-surface-card p-3 shadow-dropdown overflow-hidden text-left">
          <div className="bg-warm-50/70 p-4 rounded-xl border border-warm-100 flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              <span className="text-xs font-semibold text-slate-500 ml-2">Time Mate Workspace Preview</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-2">
            <div className="bg-surface-bg p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Today's Progress</span>
              <p className="text-2xl font-bold text-warm-600">72% Completed</p>
              <p className="text-xs text-slate-500 mt-1">5 of 7 tasks finished</p>
            </div>
            <div className="bg-surface-bg p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Next Scheduled Activity</span>
              <p className="text-sm font-semibold text-slate-900">Data Structures Study</p>
              <p className="text-xs text-warm-700 mt-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> 10:30 AM – Study Room
              </p>
            </div>
            <div className="bg-surface-bg p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Distraction Awareness</span>
              <p className="text-sm font-semibold text-slate-900">Phone Use: 30–60 min</p>
              <p className="text-xs text-emerald-700 mt-1">Focus Rating: Good 🎯</p>
            </div>
          </div>
        </div>

      </section>

      {/* Problem Section */}
      <section className="py-16 bg-warm-50/60 border-y border-surface-border px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-bold text-warm-600 uppercase tracking-widest block mb-2">The Student Reality</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-4">
            Why students struggle with daily time
          </h2>
          <p className="text-base text-slate-600 leading-relaxed max-w-3xl mx-auto">
            Student life can make time management difficult. Classes, assignments, meals, friends, personal activities and mobile distractions can quickly disrupt a student's plan.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10 text-left">
            <div className="bg-surface-card p-5 rounded-xl border border-surface-border shadow-subtle">
              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-sm mb-3">!</div>
              <h3 className="font-semibold text-slate-900 text-sm mb-1">Mobile Distractions</h3>
              <p className="text-xs text-slate-500 leading-normal">Endless notifications and social scrolling break study focus repeatedly.</p>
            </div>
            <div className="bg-surface-card p-5 rounded-xl border border-surface-border shadow-subtle">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm mb-3">!</div>
              <h3 className="font-semibold text-slate-900 text-sm mb-1">Unstructured Routines</h3>
              <p className="text-xs text-slate-500 leading-normal">Waking up late and irregular hours make rigid schedules collapse.</p>
            </div>
            <div className="bg-surface-card p-5 rounded-xl border border-surface-border shadow-subtle">
              <div className="w-8 h-8 rounded-lg bg-warm-100 text-warm-700 flex items-center justify-center font-bold text-sm mb-3">!</div>
              <h3 className="font-semibold text-slate-900 text-sm mb-1">Unexpected Delays</h3>
              <p className="text-xs text-slate-500 leading-normal">Impromptu group discussions or daily errands cause task pileups.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <span className="text-xs font-bold text-warm-600 uppercase tracking-widest block mb-2">The Solution</span>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-4">
          One practical workspace built for student life
        </h2>
        <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed mb-12">
          Time Mate brings daily planning, task priorities, focus sessions and progress tracking into one simple workspace.
        </p>

        {/* Core Features Grid */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          
          <div className="p-6 bg-surface-card rounded-2xl border border-surface-border shadow-subtle hover:border-warm-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-warm-100 text-warm-700 flex items-center justify-center mb-4">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Daily Planner</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Timeline view to block time for classes, study, meals, and personal rest without rigid pressure.
            </p>
          </div>

          <div className="p-6 bg-surface-card rounded-2xl border border-surface-border shadow-subtle hover:border-warm-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-warm-100 text-warm-700 flex items-center justify-center mb-4">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Priority Tasks</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Categorize tasks into HIGH, MEDIUM, and LOW priority so you know what needs attention first.
            </p>
          </div>

          <div className="p-6 bg-surface-card rounded-2xl border border-surface-border shadow-subtle hover:border-warm-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-warm-100 text-warm-700 flex items-center justify-center mb-4">
              <Timer className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Focus Sessions</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Built-in Pomodoro timer (15, 25, 45, 60 mins) linked directly to your active tasks.
            </p>
          </div>

          <div className="p-6 bg-surface-card rounded-2xl border border-surface-border shadow-subtle hover:border-warm-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-warm-100 text-warm-700 flex items-center justify-center mb-4">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Flexible Rescheduling</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Missed a study block? Effortlessly move tasks to Later Today or Tomorrow with a single click.
            </p>
          </div>

          <div className="p-6 bg-surface-card rounded-2xl border border-surface-border shadow-subtle hover:border-warm-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-warm-100 text-warm-700 flex items-center justify-center mb-4">
              <BarChart2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Daily Progress & Reflection</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Track completion percentages and reflect on daily phone distraction levels to build habits.
            </p>
          </div>

          <div className="p-6 bg-surface-card rounded-2xl border border-surface-border shadow-subtle hover:border-warm-300 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-warm-100 text-warm-700 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Calm & Practical UI</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Zero clutter, no fake metrics. A human-centered tool built around genuine student needs.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-surface-card border-t border-surface-border px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-bold text-warm-600 uppercase tracking-widest block mb-2">4-Step Workflow</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-10">
            How Time Mate works
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-xl bg-warm-50/50 border border-warm-100">
              <div className="w-8 h-8 rounded-full bg-warm-500 text-white font-bold text-sm mx-auto flex items-center justify-center mb-3">1</div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Plan</h4>
              <p className="text-xs text-slate-600">Outline your schedule around classes and meals.</p>
            </div>
            <div className="p-4 rounded-xl bg-warm-50/50 border border-warm-100">
              <div className="w-8 h-8 rounded-full bg-warm-500 text-white font-bold text-sm mx-auto flex items-center justify-center mb-3">2</div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Prioritize</h4>
              <p className="text-xs text-slate-600">Set High, Medium, and Low priorities for assignments.</p>
            </div>
            <div className="p-4 rounded-xl bg-warm-50/50 border border-warm-100">
              <div className="w-8 h-8 rounded-full bg-warm-500 text-white font-bold text-sm mx-auto flex items-center justify-center mb-3">3</div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Focus</h4>
              <p className="text-xs text-slate-600">Run timed focus sessions to tackle high-priority work.</p>
            </div>
            <div className="p-4 rounded-xl bg-warm-50/50 border border-warm-100">
              <div className="w-8 h-8 rounded-full bg-warm-500 text-white font-bold text-sm mx-auto flex items-center justify-center mb-3">4</div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Review</h4>
              <p className="text-xs text-slate-600">Log phone distraction time and review your progress.</p>
            </div>
          </div>

        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center mt-auto">
        <div className="bg-warm-500 text-white rounded-3xl p-8 sm:p-12 shadow-card">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
            Ready to give your day a clear direction?
          </h2>
          <p className="text-warm-100 text-sm sm:text-base max-w-xl mx-auto mb-8">
            Start organizing your tasks and routines with Time Mate today.
          </p>
          <button
            onClick={() => onNavigate('signup')}
            className="px-8 py-3.5 text-base font-semibold text-warm-900 bg-white hover:bg-warm-50 rounded-xl shadow-subtle transition-all active:scale-[0.98]"
          >
            Create Your Free Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-surface-border text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-warm-600" />
            <span className="font-bold text-slate-800">TIME MATE</span>
          </div>
          <p className="italic text-slate-600 font-medium">
            "Do something today that your future self will thank you for."
          </p>
        </div>
      </footer>

    </div>
  );
};
