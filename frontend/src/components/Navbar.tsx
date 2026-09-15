import React from 'react';
import { Compass, Sparkles, CheckSquare, Clock, BarChart2, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentTab?: string;
  onNavigate: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab = 'landing', onNavigate }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-surface-card/90 backdrop-blur-md border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <button 
          onClick={() => onNavigate(user ? 'dashboard' : 'landing')} 
          className="flex items-center gap-3 text-left group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-warm-500 text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-warm-600 transition-colors">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-lg tracking-tight block leading-none">
              TIME MATE
            </span>
            <span className="text-[11px] text-warm-600 font-medium tracking-wide uppercase block mt-0.5">
              Student Productivity
            </span>
          </div>
        </button>

        {/* Public Landing Nav / User Action */}
        {!user ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('signin')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                currentTab === 'signin' 
                  ? 'bg-warm-100 text-warm-800 font-semibold' 
                  : 'text-slate-700 hover:text-warm-700 hover:bg-warm-50'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
            <button
              onClick={() => onNavigate('signup')}
              className="px-4 py-2 text-sm font-medium text-white bg-warm-500 hover:bg-warm-600 rounded-lg shadow-subtle transition-all flex items-center gap-1.5 active:scale-[0.98]"
            >
              <UserPlus className="w-4 h-4" />
              Get Started
            </button>
          </div>
        ) : null}

      </div>
    </header>
  );
};
