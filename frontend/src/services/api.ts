import { Task, Schedule, FocusSession, DailyReflection, UserSettings, User } from '../types';

const API_BASE = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('bt_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'API Request Failed');
  }
  return data as T;
}

export const api = {
  auth: {
    signup: async (data: any) => {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse<{ token: string; user: User }>(res);
    },
    login: async (data: any) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse<{ token: string; user: User }>(res);
    },
    logout: async () => {
      localStorage.removeItem('bt_token');
    },
    getMe: async () => {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getHeaders(),
      });
      return handleResponse<{ user: User }>(res);
    },
    changePassword: async (data: { currentPassword: string; newPassword: string; confirmNewPassword: string }) => {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse<{ message: string }>(res);
    },
  },

  tasks: {
    getAll: async () => {
      const res = await fetch(`${API_BASE}/tasks`, { headers: getHeaders() });
      return handleResponse<{ tasks: Task[] }>(res);
    },
    create: async (taskData: Partial<Task>) => {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(taskData),
      });
      return handleResponse<{ message: string; task: Task }>(res);
    },
    update: async (id: string, taskData: Partial<Task>) => {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(taskData),
      });
      return handleResponse<{ message: string; task: Task }>(res);
    },
    delete: async (id: string) => {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return handleResponse<{ message: string; taskId: string }>(res);
    },
  },

  schedules: {
    getAll: async (date?: string) => {
      const url = date ? `${API_BASE}/schedules?date=${date}` : `${API_BASE}/schedules`;
      const res = await fetch(url, { headers: getHeaders() });
      return handleResponse<{ schedules: Schedule[] }>(res);
    },
    create: async (scheduleData: Partial<Schedule>) => {
      const res = await fetch(`${API_BASE}/schedules`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(scheduleData),
      });
      return handleResponse<{ message: string; schedule: Schedule }>(res);
    },
    update: async (id: string, scheduleData: Partial<Schedule>) => {
      const res = await fetch(`${API_BASE}/schedules/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(scheduleData),
      });
      return handleResponse<{ message: string; schedule: Schedule }>(res);
    },
    delete: async (id: string) => {
      const res = await fetch(`${API_BASE}/schedules/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return handleResponse<{ message: string; scheduleId: string }>(res);
    },
  },

  focus: {
    getAll: async () => {
      const res = await fetch(`${API_BASE}/focus-sessions`, { headers: getHeaders() });
      return handleResponse<{ sessions: FocusSession[] }>(res);
    },
    create: async (data: { task_id?: string | null; duration_minutes: number }) => {
      const res = await fetch(`${API_BASE}/focus-sessions`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse<{ message: string; session: FocusSession }>(res);
    },
  },

  reflections: {
    getAll: async () => {
      const res = await fetch(`${API_BASE}/reflections`, { headers: getHeaders() });
      return handleResponse<{ reflections: DailyReflection[] }>(res);
    },
    create: async (data: Partial<DailyReflection>) => {
      const res = await fetch(`${API_BASE}/reflections`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse<{ message: string; reflection: DailyReflection }>(res);
    },
  },

  settings: {
    get: async () => {
      const res = await fetch(`${API_BASE}/settings`, { headers: getHeaders() });
      return handleResponse<{ settings: UserSettings }>(res);
    },
    update: async (data: Partial<UserSettings> & { name?: string }) => {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse<{ message: string; user: User; settings: UserSettings }>(res);
    },
  },
};
