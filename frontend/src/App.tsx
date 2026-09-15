import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { TaskModal } from './components/TaskModal';
import { ScheduleModal } from './components/ScheduleModal';
import { RescheduleModal } from './components/RescheduleModal';
import { ReflectionModal } from './components/ReflectionModal';

import { LandingPage } from './pages/LandingPage';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import { DashboardPage } from './pages/DashboardPage';
import { DailyPlannerPage } from './pages/DailyPlannerPage';
import { TasksPage } from './pages/TasksPage';
import { FocusTimerPage } from './pages/FocusTimerPage';
import { ProgressPage } from './pages/ProgressPage';
import { SettingsPage } from './pages/SettingsPage';
import { Task, Schedule } from './types';

import { AiPlannerPage } from './pages/AiPlannerPage';
import { AchievementsPage } from './pages/AchievementsPage';

const MainAppContent: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { addTask, updateTask, addSchedule, updateSchedule, rescheduleTask, addReflection } = useApp();

  const [currentTab, setCurrentTab] = useState<string>('landing');

  // Modals state
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [reschedulingTask, setReschedulingTask] = useState<Task | null>(null);

  const [reflectionModalOpen, setReflectionModalOpen] = useState(false);

  // Automatic redirect logic for protected pages
  React.useEffect(() => {
    if (!authLoading) {
      if (user && (currentTab === 'landing' || currentTab === 'signin' || currentTab === 'signup')) {
        setCurrentTab('dashboard');
      } else if (!user && currentTab !== 'landing' && currentTab !== 'signin' && currentTab !== 'signup') {
        setCurrentTab('signin');
      }
    }
  }, [user, authLoading, currentTab]);

  const handleNavigate = (tab: string) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Task Modal Handlers
  const handleOpenAddTask = () => {
    setEditingTask(null);
    setTaskModalOpen(true);
  };

  const handleOpenEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (editingTask) {
      await updateTask(editingTask.id, taskData);
    } else {
      await addTask(taskData);
    }
  };

  // Schedule Modal Handlers
  const handleOpenAddSchedule = () => {
    setEditingSchedule(null);
    setScheduleModalOpen(true);
  };

  const handleOpenEditSchedule = (sch: Schedule) => {
    setEditingSchedule(sch);
    setScheduleModalOpen(true);
  };

  const handleSaveSchedule = async (schData: Partial<Schedule>) => {
    if (editingSchedule) {
      await updateSchedule(editingSchedule.id, schData);
    } else {
      await addSchedule(schData);
    }
  };

  // Reschedule Modal Handler
  const handleOpenReschedule = (task: Task) => {
    setReschedulingTask(task);
    setRescheduleModalOpen(true);
  };

  const handleRescheduleSubmit = async (taskId: string, newDate: string, newTime: string) => {
    await rescheduleTask(taskId, newDate, newTime);
  };

  // Render Page Component
  const renderCurrentPage = () => {
    switch (currentTab) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />;
      case 'signin':
        return <SignInPage onNavigate={handleNavigate} />;
      case 'signup':
        return <SignUpPage onNavigate={handleNavigate} />;
      case 'dashboard':
        return (
          <DashboardPage
            onOpenAddTask={handleOpenAddTask}
            onOpenAddSchedule={handleOpenAddSchedule}
            onOpenReschedule={handleOpenReschedule}
            onNavigate={handleNavigate}
          />
        );
      case 'planner':
        return (
          <DailyPlannerPage
            onOpenAddSchedule={handleOpenAddSchedule}
            onOpenEditSchedule={handleOpenEditSchedule}
          />
        );
      case 'tasks':
        return (
          <TasksPage
            onOpenAddTask={handleOpenAddTask}
            onOpenEditTask={handleOpenEditTask}
            onOpenReschedule={handleOpenReschedule}
          />
        );
      case 'focus':
        return <FocusTimerPage />;
      case 'ai-planner':
        return <AiPlannerPage />;
      case 'achievements':
        return <AchievementsPage />;
      case 'progress':
        return <ProgressPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-surface-bg flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-warm-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-warm-800 tracking-wide uppercase">
            Loading Workspace...
          </p>
        </div>
      </div>
    );
  }

  const isPublicPage = currentTab === 'landing' || currentTab === 'signin' || currentTab === 'signup';

  return (
    <div className="min-h-screen bg-surface-bg flex flex-col selection:bg-warm-200 selection:text-warm-900">
      
      {/* Top Navbar */}
      <Navbar currentTab={currentTab} onNavigate={handleNavigate} />

      {/* Main Container Layout */}
      {isPublicPage ? (
        <main className="flex-1">{renderCurrentPage()}</main>
      ) : (
        <div className="flex-1 flex max-w-7xl w-full mx-auto pb-16 lg:pb-0">
          
          {/* Left Sidebar */}
          <Sidebar
            currentTab={currentTab}
            onNavigate={handleNavigate}
            onOpenReflection={() => setReflectionModalOpen(true)}
          />

          {/* Main Content Area */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
            {/* Header Greeting Banner (Dashboard Only) */}
            {currentTab === 'dashboard' && (
              <Header
                onOpenAddTask={handleOpenAddTask}
                onOpenAddSchedule={handleOpenAddSchedule}
                onNavigate={handleNavigate}
              />
            )}

            {renderCurrentPage()}
          </main>
        </div>
      )}

      {/* Global Modals */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSave={handleSaveTask}
        initialTask={editingTask}
      />

      <ScheduleModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        onSave={handleSaveSchedule}
        initialSchedule={editingSchedule}
      />

      <RescheduleModal
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        task={reschedulingTask}
        onReschedule={handleRescheduleSubmit}
      />

      <ReflectionModal
        isOpen={reflectionModalOpen}
        onClose={() => setReflectionModalOpen(false)}
        onSave={addReflection}
      />

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <MainAppContent />
      </AppProvider>
    </AuthProvider>
  );
};
export default App;
