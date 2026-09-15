export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

export type TaskCategory = 'Study' | 'Assignment' | 'Class' | 'Personal' | 'Project' | 'Other';

export type ScheduleCategory = 'Study' | 'Assignment' | 'Class' | 'Meal' | 'Personal' | 'Rest' | 'Other';

export type DistractionLevel = 'Less than 30 min' | '30–60 min' | '1–2 hours' | '2–3 hours' | 'More than 3 hours';

export type FocusLevel = 'Low' | 'Okay' | 'Good' | 'Excellent';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: Priority;
  due_date: string; // YYYY-MM-DD
  due_time: string; // HH:MM
  notes: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Schedule {
  id: string;
  user_id: string;
  title: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  category: ScheduleCategory;
  notes: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface FocusSession {
  id: string;
  user_id: string;
  task_id: string | null;
  task_title?: string;
  duration_minutes: number;
  completed_at: string;
  created_at: string;
}

export interface DailyReflection {
  id: string;
  user_id: string;
  date: string;
  distraction_level: DistractionLevel;
  focus_level: FocusLevel;
  notes: string;
  created_at: string;
}

export interface UserSettings {
  id?: string;
  user_id?: string;
  wake_up_time: string;
  study_start_time: string;
  default_focus_duration: number;
  task_reminders: boolean;
  schedule_reminders: boolean;
  focus_reminders: boolean;
}
