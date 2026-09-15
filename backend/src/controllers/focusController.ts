import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { query, getOne, run } from '../db/database.js';

export const getFocusSessions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const sessions = await query(
      `SELECT f.*, t.title as task_title 
       FROM focus_sessions f 
       LEFT JOIN tasks t ON f.task_id = t.id 
       WHERE f.user_id = ? 
       ORDER BY f.completed_at DESC`,
      [userId]
    );

    return res.json({ sessions });
  } catch (error: any) {
    console.error('getFocusSessions error:', error);
    return res.status(500).json({ error: 'Failed to retrieve focus sessions.' });
  }
};

export const createFocusSession = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { task_id, duration_minutes } = req.body;

    if (!duration_minutes || duration_minutes <= 0) {
      return res.status(400).json({ error: 'Valid duration in minutes is required.' });
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
      message: 'Focus session recorded successfully.',
      session: newSession,
    });
  } catch (error: any) {
    console.error('createFocusSession error:', error);
    return res.status(500).json({ error: 'Failed to record focus session.' });
  }
};
