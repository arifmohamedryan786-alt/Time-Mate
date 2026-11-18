/**
 * TIME-MATE - Focus Session Controller
 * 
 * Manages Pomodoro focus sessions, logging completed focus intervals,
 * associating sessions with optional tasks, and providing analytics data.
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { query, getOne, run } from '../db/database.js';

/**
 * Retrieve all completed focus sessions for the authenticated student.
 * 
 * Route: GET /api/focus-sessions
 * Header: Authorization: Bearer <token>
 * Returns: Array of focus sessions joined with associated task titles.
 */
export const getFocusSessions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }

    const sessions = await query(
      `SELECT f.*, t.title as task_title 
       FROM focus_sessions f 
       LEFT JOIN tasks t ON f.task_id = t.id 
       WHERE f.user_id = ? 
       ORDER BY f.completed_at DESC`,
      [userId]
    );

    return res.json({
      success: true,
      sessions
    });
  } catch (error: any) {
    console.error('[getFocusSessions] Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve focus sessions.' });
  }
};

/**
 * Record a newly completed focus timer session.
 * 
 * Route: POST /api/focus-sessions
 * Header: Authorization: Bearer <token>
 * Body: { duration_minutes: number, task_id?: string }
 */
export const createFocusSession = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }

    const { task_id, duration_minutes } = req.body;

    // Validate that duration is a positive numeric quantity
    if (!duration_minutes || typeof duration_minutes !== 'number' || duration_minutes <= 0) {
      return res.status(400).json({
        success: false,
        error: 'A positive numeric duration in minutes is required.'
      });
    }

    const sessionId = 'foc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    await run(
      'INSERT INTO focus_sessions (id, user_id, task_id, duration_minutes) VALUES (?, ?, ?, ?)',
      [sessionId, userId, task_id || null, duration_minutes]
    );

    const newSession = await getOne(
      `SELECT f.*, t.title as task_title 
       FROM focus_sessions f 
       LEFT JOIN tasks t ON f.task_id = t.id 
       WHERE f.id = ?`,
      [sessionId]
    );

    return res.status(201).json({
      success: true,
      message: 'Focus session recorded successfully.',
      session: newSession,
    });
  } catch (error: any) {
    console.error('[createFocusSession] Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to record focus session.' });
  }
};
