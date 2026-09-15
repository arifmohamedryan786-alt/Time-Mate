import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { query, getOne, run } from '../db/database.js';

export const getSchedules = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { date } = req.query;

    let sql = 'SELECT * FROM schedules WHERE user_id = ?';
    const params: any[] = [userId];

    if (date) {
      sql += ' AND date = ?';
      params.push(date);
    }

    sql += ' ORDER BY start_time ASC';

    const schedules = await query(sql, params);

    const formatted = schedules.map((s) => ({
      ...s,
      completed: Boolean(s.completed),
    }));

    return res.json({ schedules: formatted });
  } catch (error: any) {
    console.error('getSchedules error:', error);
    return res.status(500).json({ error: 'Failed to retrieve schedules.' });
  }
};

export const createSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { title, date, start_time, end_time, category, notes } = req.body;

    if (!title || !date || !start_time || !end_time) {
      return res.status(400).json({ error: 'Title, date, start time, and end time are required.' });
    }

    const scheduleId = 'sch_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const cat = category || 'Study';
    const noteStr = notes || '';

    await run(
      'INSERT INTO schedules (id, user_id, title, date, start_time, end_time, category, notes, completed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)',
      [scheduleId, userId, title.trim(), date, start_time, end_time, cat, noteStr]
    );

    const newSchedule = await getOne('SELECT * FROM schedules WHERE id = ?', [scheduleId]);

    return res.status(201).json({
      message: 'Schedule created successfully.',
      schedule: { ...newSchedule, completed: Boolean(newSchedule.completed) },
    });
  } catch (error: any) {
    console.error('createSchedule error:', error);
    return res.status(500).json({ error: 'Failed to create schedule item.' });
  }
};

export const updateSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const scheduleId = req.params.id;

    const existing = await getOne('SELECT * FROM schedules WHERE id = ? AND user_id = ?', [scheduleId, userId]);
    if (!existing) {
      return res.status(404).json({ error: 'Schedule item not found.' });
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
      message: 'Schedule updated successfully.',
      schedule: { ...updated, completed: Boolean(updated.completed) },
    });
  } catch (error: any) {
    console.error('updateSchedule error:', error);
    return res.status(500).json({ error: 'Failed to update schedule item.' });
  }
};

export const deleteSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const scheduleId = req.params.id;

    const existing = await getOne('SELECT * FROM schedules WHERE id = ? AND user_id = ?', [scheduleId, userId]);
    if (!existing) {
      return res.status(404).json({ error: 'Schedule item not found.' });
    }

    await run('DELETE FROM schedules WHERE id = ? AND user_id = ?', [scheduleId, userId]);

    return res.json({ message: 'Schedule item deleted successfully.', scheduleId });
  } catch (error: any) {
    console.error('deleteSchedule error:', error);
    return res.status(500).json({ error: 'Failed to delete schedule item.' });
  }
};
