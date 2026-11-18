/**
 * TIME-MATE - REST API Route Manifest
 * 
 * Declares all HTTP API endpoints, parameter bindings, and authentication guards.
 */

import { Router } from 'express';
import { signup, login, logout, getMe, changePassword } from '../controllers/authController.js';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/taskController.js';
import { getSchedules, createSchedule, updateSchedule, deleteSchedule } from '../controllers/scheduleController.js';
import { getFocusSessions, createFocusSession } from '../controllers/focusController.js';
import { getReflections, createReflection } from '../controllers/reflectionController.js';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// ==========================================
// 1. AUTHENTICATION & IDENTITY ROUTES
// ==========================================

/** POST /api/auth/signup - Register new student account */
router.post('/auth/signup', signup);

/** POST /api/auth/login - Authenticate credentials and return JWT token */
router.post('/auth/login', login);

/** POST /api/auth/logout - Sign out session (client clears local token) */
router.post('/auth/logout', logout);

/** GET /api/auth/me - Retrieve current authenticated student profile */
router.get('/auth/me', authenticateToken, getMe);

/** PUT /api/auth/change-password - Update password with existing password verification */
router.put('/auth/change-password', authenticateToken, changePassword);

// ==========================================
// 2. TASK MANAGEMENT ROUTES (PROTECTED)
// ==========================================

/** GET /api/tasks - Retrieve all tasks for authenticated user */
router.get('/tasks', authenticateToken, getTasks);

/** POST /api/tasks - Create a new prioritized task */
router.post('/tasks', authenticateToken, createTask);

/** PUT /api/tasks/:id - Update task properties or reschedule due date/time */
router.put('/tasks/:id', authenticateToken, updateTask);

/** DELETE /api/tasks/:id - Remove a task by ID */
router.delete('/tasks/:id', authenticateToken, deleteTask);

// ==========================================
// 3. DAILY SCHEDULE ROUTES (PROTECTED)
// ==========================================

/** GET /api/schedules - Retrieve schedule timeline blocks (supports ?date=YYYY-MM-DD) */
router.get('/schedules', authenticateToken, getSchedules);

/** POST /api/schedules - Add a daily timeline block */
router.post('/schedules', authenticateToken, createSchedule);

/** PUT /api/schedules/:id - Update timeline block timing or category */
router.put('/schedules/:id', authenticateToken, updateSchedule);

/** DELETE /api/schedules/:id - Delete a timeline block */
router.delete('/schedules/:id', authenticateToken, deleteSchedule);

// ==========================================
// 4. FOCUS TIMER SESSIONS ROUTES (PROTECTED)
// ==========================================

/** GET /api/focus-sessions - List completed Pomodoro focus sessions */
router.get('/focus-sessions', authenticateToken, getFocusSessions);

/** POST /api/focus-sessions - Record a finished focus timer interval */
router.post('/focus-sessions', authenticateToken, createFocusSession);

// ==========================================
// 5. DAILY DISTRACTION & REFLECTION ROUTES (PROTECTED)
// ==========================================

/** GET /api/reflections - Fetch daily distraction self-reflection entries */
router.get('/reflections', authenticateToken, getReflections);

/** POST /api/reflections - Upsert daily distraction and focus level entry */
router.post('/reflections', authenticateToken, createReflection);

// ==========================================
// 6. USER SETTINGS ROUTES (PROTECTED)
// ==========================================

/** GET /api/settings - Fetch student preferences and routine presets */
router.get('/settings', authenticateToken, getSettings);

/** PUT /api/settings - Update routine timings, presets, and notification flags */
router.put('/settings', authenticateToken, updateSettings);

export default router;
