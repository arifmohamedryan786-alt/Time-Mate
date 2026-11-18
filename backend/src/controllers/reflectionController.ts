/**
 * TIME-MATE - Daily Reflection Controller
 * 
 * Supports the hostel student self-awareness paradigm:
 * tracks self-reported mobile distraction time and subjective focus levels.
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { query, getOne, run } from '../db/database.js';

/**
 * Valid distraction level categories standard in the research design.
 */
export const VALID_DISTRACTION_LEVELS = [
  'Less than 30 min',
  '30–60 min',
  '1–2 hours',
  '2–3 hours',
  'More than 3 hours'
] as const;

/**
 * Valid focus level ratings standard in the research design.
 */
export const VALID_FOCUS_LEVELS = ['Low', 'Okay', 'Good', 'Excellent'] as const;

/**
 * Retrieve all daily reflection records for the authenticated student.
 * 
 * Route: GET /api/reflections
 * Header: Authorization: Bearer <token>
 * Returns: Array of reflections sorted chronologically descending.
 */
export const getReflections = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }

    const reflections = await query(
      'SELECT * FROM daily_reflections WHERE user_id = ? ORDER BY date DESC',
      [userId]
    );

    return res.json({
      success: true,
      reflections
    });
  } catch (error: any) {
    console.error('[getReflections] Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve daily reflections.' });
  }
};

/**
 * Save or update daily phone distraction and focus level reflection.
 * Performs an upsert based on (user_id, date).
 * 
 * Route: POST /api/reflections
 * Header: Authorization: Bearer <token>
 * Body: { date?: string, distraction_level: string, focus_level: string, notes?: string }
 */
export const createReflection = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }

    const { date, distraction_level, focus_level, notes } = req.body;

    if (!distraction_level || !focus_level) {
      return res.status(400).json({
        success: false,
        error: 'Distraction level and focus level are required fields.'
      });
    }

    const targetDate = date || new Date().toISOString().split('T')[0];
    const existing = await getOne(
      'SELECT id FROM daily_reflections WHERE user_id = ? AND date = ?',
      [userId, targetDate]
    );

    if (existing) {
      // Update existing reflection for today
      await run(
        'UPDATE daily_reflections SET distraction_level = ?, focus_level = ?, notes = ? WHERE id = ? AND user_id = ?',
        [distraction_level, focus_level, notes || '', existing.id, userId]
      );
      const updated = await getOne('SELECT * FROM daily_reflections WHERE id = ?', [existing.id]);
      return res.json({
        success: true,
        message: 'Daily reflection updated successfully.',
        reflection: updated
      });
    } else {
      // Create fresh reflection record
      const refId = 'ref_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      await run(
        'INSERT INTO daily_reflections (id, user_id, date, distraction_level, focus_level, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [refId, userId, targetDate, distraction_level, focus_level, notes || '']
      );
      const newRef = await getOne('SELECT * FROM daily_reflections WHERE id = ?', [refId]);
      return res.status(201).json({
        success: true,
        message: 'Daily reflection saved successfully.',
        reflection: newRef
      });
    }
  } catch (error: any) {
    console.error('[createReflection] Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to save daily reflection.' });
  }
};
