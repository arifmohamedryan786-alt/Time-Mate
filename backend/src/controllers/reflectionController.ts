import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { query, getOne, run } from '../db/database.js';

export const getReflections = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const reflections = await query(
      'SELECT * FROM daily_reflections WHERE user_id = ? ORDER BY date DESC',
      [userId]
    );

    return res.json({ reflections });
  } catch (error: any) {
    console.error('getReflections error:', error);
    return res.status(500).json({ error: 'Failed to retrieve daily reflections.' });
  }
};

export const createReflection = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { date, distraction_level, focus_level, notes } = req.body;

    if (!distraction_level || !focus_level) {
      return res.status(400).json({ error: 'Distraction level and focus level are required.' });
    }

    const targetDate = date || new Date().toISOString().split('T')[0];
    const existing = await getOne('SELECT id FROM daily_reflections WHERE user_id = ? AND date = ?', [userId, targetDate]);

    if (existing) {
      // Update existing reflection for date
      await run(
        'UPDATE daily_reflections SET distraction_level = ?, focus_level = ?, notes = ? WHERE id = ? AND user_id = ?',
        [distraction_level, focus_level, notes || '', existing.id, userId]
      );
      const updated = await getOne('SELECT * FROM daily_reflections WHERE id = ?', [existing.id]);
      return res.json({ message: 'Daily reflection updated successfully.', reflection: updated });
    } else {
      const refId = 'ref_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      await run(
        'INSERT INTO daily_reflections (id, user_id, date, distraction_level, focus_level, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [refId, userId, targetDate, distraction_level, focus_level, notes || '']
      );
      const newRef = await getOne('SELECT * FROM daily_reflections WHERE id = ?', [refId]);
      return res.status(201).json({ message: 'Daily reflection saved successfully.', reflection: newRef });
    }
  } catch (error: any) {
    console.error('createReflection error:', error);
    return res.status(500).json({ error: 'Failed to save daily reflection.' });
  }
};
