import { Router } from 'express';
import { signup, login, logout, getMe, changePassword } from '../controllers/authController.js';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/taskController.js';
import { getSchedules, createSchedule, updateSchedule, deleteSchedule } from '../controllers/scheduleController.js';
import { getFocusSessions, createFocusSession } from '../controllers/focusController.js';
import { getReflections, createReflection } from '../controllers/reflectionController.js';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Public auth routes
router.post('/auth/signup', signup);
router.post('/auth/login', login);
router.post('/auth/logout', logout);

// Protected auth routes
router.get('/auth/me', authenticateToken, getMe);
router.put('/auth/change-password', authenticateToken, changePassword);

// Tasks API
router.get('/tasks', authenticateToken, getTasks);
router.post('/tasks', authenticateToken, createTask);
router.put('/tasks/:id', authenticateToken, updateTask);
router.delete('/tasks/:id', authenticateToken, deleteTask);

// Schedules API
router.get('/schedules', authenticateToken, getSchedules);
router.post('/schedules', authenticateToken, createSchedule);
router.put('/schedules/:id', authenticateToken, updateSchedule);
router.delete('/schedules/:id', authenticateToken, deleteSchedule);

// Focus Sessions API
router.get('/focus-sessions', authenticateToken, getFocusSessions);
router.post('/focus-sessions', authenticateToken, createFocusSession);

// Reflections API
router.get('/reflections', authenticateToken, getReflections);
router.post('/reflections', authenticateToken, createReflection);

// Settings API
router.get('/settings', authenticateToken, getSettings);
router.put('/settings', authenticateToken, updateSettings);

export default router;
