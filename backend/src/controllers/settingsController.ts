/**
 * TIME-MATE - Settings Controller
 * 
 * Manages student user preferences including profile name updates,
 * default focus duration presets, morning wake-up hours, and notification toggles.
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { getOne, run } from '../db/database.js';

/**
 * Retrieve personalized settings for the authenticated student.
 * Auto-creates default preferences if no settings record exists.
 * 
 * Route: GET /api/settings
 * Header: Authorization: Bearer <token>
 */
export const getSettings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }

    let settings = await getOne('SELECT * FROM user_settings WHERE user_id = ?', [userId]);

    if (!settings) {
      // Lazy initialization of student routine presets
      const setId = 'set_' + userId;
      await run(
        'INSERT INTO user_settings (id, user_id, wake_up_time, study_start_time, default_focus_duration) VALUES (?, ?, ?, ?, ?)',
        [setId, userId, '07:00', '09:00', 25]
      );
      settings = await getOne('SELECT * FROM user_settings WHERE user_id = ?', [userId]);
    }

    return res.json({
      success: true,
      settings: {
        ...settings,
        task_reminders: Boolean(settings.task_reminders),
        schedule_reminders: Boolean(settings.schedule_reminders),
        focus_reminders: Boolean(settings.focus_reminders),
      },
    });
  } catch (error: any) {
    console.error('[getSettings] Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve settings.' });
  }
};

/**
 * Update student settings and profile metadata.
 * 
 * Route: PUT /api/settings
 * Header: Authorization: Bearer <token>
 * Body: { name?, wake_up_time?, study_start_time?, default_focus_duration?, task_reminders?, schedule_reminders?, focus_reminders? }
 */
export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }

    const {
      name,
      wake_up_time,
      study_start_time,
      default_focus_duration,
      task_reminders,
      schedule_reminders,
      focus_reminders
    } = req.body;

    // Optional student name update
    if (name && name.trim()) {
      await run(
        'UPDATE users SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name.trim(), userId]
      );
    }

    const existingSettings = await getOne('SELECT * FROM user_settings WHERE user_id = ?', [userId]);

    const wakeTime = wake_up_time !== undefined ? wake_up_time : existingSettings?.wake_up_time || '07:00';
    const studyTime = study_start_time !== undefined ? study_start_time : existingSettings?.study_start_time || '09:00';
    const focusDur = default_focus_duration !== undefined ? default_focus_duration : existingSettings?.default_focus_duration || 25;
    const tReminders = task_reminders !== undefined ? (task_reminders ? 1 : 0) : existingSettings?.task_reminders ?? 1;
    const sReminders = schedule_reminders !== undefined ? (schedule_reminders ? 1 : 0) : existingSettings?.schedule_reminders ?? 1;
    const fReminders = focus_reminders !== undefined ? (focus_reminders ? 1 : 0) : existingSettings?.focus_reminders ?? 1;

    if (existingSettings) {
      await run(
        `UPDATE user_settings SET wake_up_time = ?, study_start_time = ?, default_focus_duration = ?, task_reminders = ?, schedule_reminders = ?, focus_reminders = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
        [wakeTime, studyTime, focusDur, tReminders, sReminders, fReminders, userId]
      );
    } else {
      await run(
        `INSERT INTO user_settings (id, user_id, wake_up_time, study_start_time, default_focus_duration, task_reminders, schedule_reminders, focus_reminders) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['set_' + userId, userId, wakeTime, studyTime, focusDur, tReminders, sReminders, fReminders]
      );
    }

    const updatedSettings = await getOne('SELECT * FROM user_settings WHERE user_id = ?', [userId]);
    const updatedUser = await getOne('SELECT id, name, email FROM users WHERE id = ?', [userId]);

    return res.json({
      success: true,
      message: 'Settings updated successfully.',
      user: updatedUser,
      settings: {
        ...updatedSettings,
        task_reminders: Boolean(updatedSettings.task_reminders),
        schedule_reminders: Boolean(updatedSettings.schedule_reminders),
        focus_reminders: Boolean(updatedSettings.focus_reminders),
      },
    });
  } catch (error: any) {
    console.error('[updateSettings] Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update settings.' });
  }
};
