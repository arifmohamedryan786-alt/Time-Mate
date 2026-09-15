import React from 'react';
import { Award, Flame, Zap, ShieldCheck, CheckCircle, Target, Star, Trophy, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AchievementsPage: React.FC = () => {
  const { tasks, focusSessions } = useApp();

  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const totalFocusSessionsCount = focusSessions.length;
  const totalFocusMinutes = focusSessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);

  // Calculate XP and level
  const xpPoints = (completedTasksCount * 20) + (totalFocusSessionsCount * 25) + (totalFocusMinutes * 2);
  const userLevel = Math.max(1, Math.floor(xpPoints / 100) + 1);
  const currentLevelXP = xpPoints % 100;

  const badges = [
    {
      id: 'first_task',
      title: 'First Step',
      description: 'Complete your first priority task',
      icon: CheckCircle,
      unlocked: completedTasksCount >= 1,
      xp: '+20 XP',
    },
    {
      id: 'focus_pioneer',
      title: 'Focus Pioneer',
      description: 'Complete at least 3 deep focus sessions',
      icon: Trophy,
      unlocked: totalFocusSessionsCount >= 3,
      xp: '+75 XP',
    },
    {
      id: 'task_master',
      title: 'Task Destroyer',
      description: 'Finish 5 or more study tasks',
      icon: Zap,
      unlocked: completedTasksCount >= 5,
      xp: '+100 XP',
    },
    {
      id: 'marathon_mind',
      title: 'Marathon Mind',
      description: 'Accumulate 60+ minutes of total focus time',
      icon: Star,
      unlocked: totalFocusMinutes >= 60,
      xp: '+150 XP',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Level Header Banner */}
      <div className="bg-gradient-to-r from-warm-700 via-warm-600 to-amber-700 p-6 sm:p-8 rounded-3xl text-white shadow-card flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-md">
            <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>5-Day Active Study Streak</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Level {userLevel} Deep Work Scholar
          </h1>
          <p className="text-warm-100 text-xs sm:text-sm">
            Earn XP points by completing priority tasks and focus sessions.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center min-w-[180px]">
          <span className="text-xs text-warm-200 uppercase font-semibold tracking-wider block">Total XP</span>
          <span className="text-3xl font-extrabold text-white">{xpPoints} XP</span>
          
          <div className="mt-2 text-[11px] text-warm-100">
            Progress to Level {userLevel + 1}
          </div>
          <div className="w-full bg-black/20 h-2 rounded-full mt-1 overflow-hidden">
            <div className="bg-amber-300 h-full rounded-full transition-all duration-500" style={{ width: `${currentLevelXP}%` }} />
          </div>
        </div>
      </div>

      {/* Gamified Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-card p-5 rounded-2xl border border-surface-border shadow-subtle flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-warm-100 text-warm-700 flex items-center justify-center font-bold">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Completed Tasks</span>
            <span className="text-xl font-bold text-slate-900">{completedTasksCount} Tasks</span>
          </div>
        </div>

        <div className="bg-surface-card p-5 rounded-2xl border border-surface-border shadow-subtle flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Focus Sessions</span>
            <span className="text-xl font-bold text-slate-900">{totalFocusSessionsCount} Sessions</span>
          </div>
        </div>

        <div className="bg-surface-card p-5 rounded-2xl border border-surface-border shadow-subtle flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Focus Time</span>
            <span className="text-xl font-bold text-slate-900">{totalFocusMinutes} Mins</span>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="bg-surface-card p-6 rounded-3xl border border-surface-border shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-warm-600" />
            <span>Productivity Badges & Milestones</span>
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            {badges.filter(b => b.unlocked).length} of {badges.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {badges.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  b.unlocked
                    ? 'bg-warm-50/80 border-warm-200 shadow-subtle'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                  b.unlocked ? 'bg-warm-500 text-white shadow-subtle' : 'bg-slate-200 text-slate-400'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900">{b.title}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      b.unlocked ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {b.xp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{b.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
