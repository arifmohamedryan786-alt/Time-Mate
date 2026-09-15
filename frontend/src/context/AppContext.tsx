import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Task, Schedule, FocusSession, DailyReflection, UserSettings } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface AppContextType {
  tasks: Task[];
  schedules: Schedule[];
  focusSessions: FocusSession[];
  reflections: DailyReflection[];
  settings: UserSettings | null;
  loading: boolean;

  // Task actions
  addTask: (data: Partial<Task>) => Promise<Task>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<void>;
  rescheduleTask: (id: string, newDate: string, newTime?: string) => Promise<void>;

  // Schedule actions
  addSchedule: (data: Partial<Schedule>) => Promise<Schedule>;
  updateSchedule: (id: string, data: Partial<Schedule>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  toggleScheduleComplete: (id: string) => Promise<void>;

  // Focus actions
  addFocusSession: (taskId: string | null, minutes: number) => Promise<void>;

  // Reflection actions
  addReflection: (data: Partial<DailyReflection>) => Promise<void>;

  // Settings actions
  updateSettings: (data: Partial<UserSettings> & { name?: string }) => Promise<void>;

  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateUserLocal } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [reflections, setReflections] = useState<DailyReflection[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const refreshData = useCallback(async () => {
    if (!user) {
      setTasks([]);
      setSchedules([]);
      setFocusSessions([]);
      setReflections([]);
      setSettings(null);
      return;
    }

    setLoading(true);
    try {
      const [tasksRes, schedulesRes, focusRes, reflectionsRes, settingsRes] = await Promise.all([
        api.tasks.getAll(),
        api.schedules.getAll(),
        api.focus.getAll(),
        api.reflections.getAll(),
        api.settings.get(),
      ]);

      setTasks(tasksRes.tasks || []);
      setSchedules(schedulesRes.schedules || []);
      setFocusSessions(focusRes.sessions || []);
      setReflections(reflectionsRes.reflections || []);
      setSettings(settingsRes.settings || null);
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Task Handlers
  const addTask = async (data: Partial<Task>): Promise<Task> => {
    const res = await api.tasks.create(data);
    setTasks((prev) => [res.task, ...prev]);
    return res.task;
  };

  const updateTask = async (id: string, data: Partial<Task>) => {
    const res = await api.tasks.update(id, data);
    setTasks((prev) => prev.map((t) => (t.id === id ? res.task : t)));
  };

  const deleteTask = async (id: string) => {
    await api.tasks.delete(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTaskComplete = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const updatedStatus = !task.completed;
    await updateTask(id, { completed: updatedStatus });
  };

  const rescheduleTask = async (id: string, newDate: string, newTime?: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    await updateTask(id, {
      due_date: newDate,
      due_time: newTime !== undefined ? newTime : task.due_time,
    });
  };

  // Schedule Handlers
  const addSchedule = async (data: Partial<Schedule>): Promise<Schedule> => {
    const res = await api.schedules.create(data);
    setSchedules((prev) => [...prev, res.schedule].sort((a, b) => a.start_time.localeCompare(b.start_time)));
    return res.schedule;
  };

  const updateSchedule = async (id: string, data: Partial<Schedule>) => {
    const res = await api.schedules.update(id, data);
    setSchedules((prev) => prev.map((s) => (s.id === id ? res.schedule : s)).sort((a, b) => a.start_time.localeCompare(b.start_time)));
  };

  const deleteSchedule = async (id: string) => {
    await api.schedules.delete(id);
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  const toggleScheduleComplete = async (id: string) => {
    const item = schedules.find((s) => s.id === id);
    if (!item) return;
    await updateSchedule(id, { completed: !item.completed });
  };

  // Focus Session Handlers
  const addFocusSession = async (taskId: string | null, minutes: number) => {
    const res = await api.focus.create({ task_id: taskId, duration_minutes: minutes });
    setFocusSessions((prev) => [res.session, ...prev]);
  };

  // Reflection Handlers
  const addReflection = async (data: Partial<DailyReflection>) => {
    const res = await api.reflections.create(data);
    setReflections((prev) => {
      const idx = prev.findIndex((r) => r.id === res.reflection.id || r.date === res.reflection.date);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = res.reflection;
        return copy;
      }
      return [res.reflection, ...prev];
    });
  };

  // Settings Handler
  const updateSettings = async (data: Partial<UserSettings> & { name?: string }) => {
    const res = await api.settings.update(data);
    setSettings(res.settings);
    if (data.name) {
      updateUserLocal(data.name);
    }
  };

  return (
    <AppContext.Provider
      value={{
        tasks,
        schedules,
        focusSessions,
        reflections,
        settings,
        loading,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        rescheduleTask,
        addSchedule,
        updateSchedule,
        deleteSchedule,
        toggleScheduleComplete,
        addFocusSession,
        addReflection,
        updateSettings,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
