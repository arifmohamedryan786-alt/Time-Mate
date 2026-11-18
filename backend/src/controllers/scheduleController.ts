/**
 * TIME-MATE - Schedule Controller
 * 
 * Manages daily time-blocked timeline items for hostel students,
 * enabling chronological schedule generation, category assignments,
 * completion tracking, and interval adjustments.
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { query, getOne, run } from '../db/database.js';

/**
 * Standard categories recognized for daily student schedule blocks.
 */
export const SCHEDULE_CATEGORIES = ['Study', 'Assignment', 'Class', 'Meal', 'Personal', 'Rest', 'Other'] as const;

/**
 * Retrieve schedule timeline items for the authenticated student.
 * Supports optional date filtering (?date=YYYY-MM-DD).
 * 
 * Route: GET /api/schedules
 * Header: Authorization: Bearer <token>
 * Query: date (optional, format YYYY-MM-DD)
 */
export const getSchedules = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }

    const { date } = req.query;

    let sql = 'SELECT * FROM schedules WHERE user_id = ?';
    const params: any[] = [userId];

    if (date) {
      sql += ' AND date = ?';
      params.push(date);
    }

    sql += ' ORDER BY start_time ASC';

    const schedules = await query(sql, params);

    // Format SQLite numeric boolean 0/1 to standard JSON booleans
    const formatted = schedules.map((s) => ({
      ...s,
      completed: Boolean(s.completed),
    }));

    return res.json({
      success: true,
      schedules: formatted
    });
  } catch (error: any) {
    console.error('[getSchedules] Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve schedules.' });
  }
};

/**
 * Create a new schedule timeline block.
 * 
 * Route: POST /api/schedules
 * Header: Authorization: Bearer <token>
 * Body: { title, date, start_time, end_time, category, notes }
 */
export const createSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }

    const { title, date, start_time, end_time, category, notes } = req.body;

    // Validate mandatory fields
    if (!title || !title.trim() || !date || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        error: 'Title, date, start time, and end time are required fields.'
      });
    }

    const scheduleId = 'sch_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const cat = category && SCHEDULE_CATEGORIES.includes(category) ? category : 'Study';
    const noteStr = notes || '';

    await run(
      'INSERT INTO schedules (id, user_id, title, date, start_time, end_time, category, notes, completed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)',
      [scheduleId, userId, title.trim(), date, start_time, end_time, cat, noteStr]
    );

    const newSchedule = await getOne('SELECT * FROM schedules WHERE id = ?', [scheduleId]);

    return res.status(201).json({
      success: true,
      message: 'Schedule created successfully.',
      schedule: { ...newSchedule, completed: Boolean(newSchedule.completed) },
    });
  } catch (error: any) {
    console.error('[createSchedule] Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to create schedule item.' });
  }
};

/**
 * Update an existing schedule timeline block.
 * 
 * Route: PUT /api/schedules/:id
 * Header: Authorization: Bearer <token>
 * Body: Partial<Schedule>
 */
export const updateSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }

    const scheduleId = req.params.id;

    const existing = await getOne('SELECT * FROM schedules WHERE id = ? AND user_id = ?', [scheduleId, userId]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Schedule item not found or unauthorized.' });
    }

    const { title, date, start_time, end_time, category, notes, completed } = req.body;

    const newTitle = title !== undefined ? title.trim() : existing.title;
    const newDate = date !== undefined ? date : existing.date;
    const newStart = start_time !== undefined ? start_time : existing.start_time;
    const newEnd = end_time !== undefined ? end_time : existing.end_time;
    const newCat = category !== undefined ? category : existing.category;
    const newNotes = notes !== undefined ? notes : existing.notes;
    const newCompleted = completed !== undefined ? (completed ? 1 : 0) : existing.completed;

    await run(
      `UPDATE schedules SET title = ?, date = ?, start_time = ?, end_time = ?, category = ?, notes = ?, completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`,
      [newTitle, newDate, newStart, newEnd, newCat, newNotes, newCompleted, scheduleId, userId]
    );

    const updated = await getOne('SELECT * FROM schedules WHERE id = ?', [scheduleId]);

    return res.json({
      success: true,
      message: 'Schedule updated successfully.',
      schedule: { ...updated, completed: Boolean(updated.completed) },
    });
  } catch (error: any) {
    console.error('[updateSchedule] Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update schedule item.' });
  }
};

/**
 * Delete a schedule timeline block.
 * 
 * Route: DELETE /api/schedules/:id
 * Header: Authorization: Bearer <token>
 */
export const deleteSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }

    const scheduleId = req.params.id;

    const existing = await getOne('SELECT * FROM schedules WHERE id = ? AND user_id = ?', [scheduleId, userId]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Schedule item not found or unauthorized.' });
    }

    await run('DELETE FROM schedules WHERE id = ? AND user_id = ?', [scheduleId, userId]);

    return res.json({
      success: true,
      message: 'Schedule deleted successfully.',
      scheduleId
    });
  } catch (error: any) {
    console.error('[deleteSchedule] Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete schedule item.' });
  }
};
