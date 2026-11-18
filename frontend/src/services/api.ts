/**
 * TIME-MATE - Frontend API Service Client
 * 
 * Provides typed HTTP communication with the backend Express REST API.
 * Injects JWT Bearer tokens from localStorage, unifies error handling,
 * and formats request/response payloads.
 */

import { Task, Schedule, FocusSession, DailyReflection, UserSettings, User } from '../types';

const API_BASE = '/api';

/**
 * Builds standard HTTP headers for outgoing requests,
 * automatically including the JWT token from localStorage if present.
 */
const getHeaders = () => {
  const token = localStorage.getItem('bt_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/**
 * Unifies JSON response extraction and HTTP status verification.
 * Throws a descriptive Error containing backend error messages.
 */
async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'API Request Failed');
  }
  return data as T;
}

export const api = {
  // Authentication & Identity Endpoints
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

  // Task Management Endpoints
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

  // Daily Schedule Timeline Endpoints
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

  // Pomodoro Focus Timer Endpoints
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

  // Mobile Distraction & Focus Self-Reflection Endpoints
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

  // Student Preferences & Routine Settings Endpoints
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
      return handleResponse<{ message: string; settings: UserSettings; user?: User }>(res);
    },
  },
};
