import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { query, getOne, run } from '../db/database.js';

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const tasks = await query(
      'SELECT * FROM tasks WHERE user_id = ? ORDER BY due_date ASC, due_time ASC, created_at DESC',
      [userId]
    );

    // Format completed as boolean for JSON response
    const formatted = tasks.map((t) => ({
      ...t,
      completed: Boolean(t.completed),
    }));

    return res.json({ tasks: formatted });
  } catch (error: any) {
    console.error('getTasks error:', error);
    return res.status(500).json({ error: 'Failed to retrieve tasks.' });
  }
};

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { title, description, category, priority, due_date, due_time, notes } = req.body;

    if (!title || !due_date) {
      return res.status(400).json({ error: 'Task title and due date are required.' });
    }

    const taskId = 'tsk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const cat = category || 'Study';
    const prio = priority || 'MEDIUM';
    const dTime = due_time || '23:59';
    const desc = description || '';
    const noteStr = notes || '';

    await run(
      'INSERT INTO tasks (id, user_id, title, description, category, priority, due_date, due_time, notes, completed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)',
      [taskId, userId, title.trim(), desc, cat, prio, due_date, dTime, noteStr]
    );

    const newTask = await getOne('SELECT * FROM tasks WHERE id = ?', [taskId]);

    return res.status(201).json({
      message: 'Task created successfully.',
      task: { ...newTask, completed: Boolean(newTask.completed) },
    });
  } catch (error: any) {
    console.error('createTask error:', error);
    return res.status(500).json({ error: 'Failed to create task.' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const taskId = req.params.id;

    const existing = await getOne('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [taskId, userId]);
    if (!existing) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    const { title, description, category, priority, due_date, due_time, notes, completed } = req.body;

    const newTitle = title !== undefined ? title.trim() : existing.title;
    const newDesc = description !== undefined ? description : existing.description;
    const newCat = category !== undefined ? category : existing.category;
    const newPrio = priority !== undefined ? priority : existing.priority;
    const newDueDate = due_date !== undefined ? due_date : existing.due_date;
    const newDueTime = due_time !== undefined ? due_time : existing.due_time;
    const newNotes = notes !== undefined ? notes : existing.notes;
    const newCompleted = completed !== undefined ? (completed ? 1 : 0) : existing.completed;

    await run(
      `UPDATE tasks SET title = ?, description = ?, category = ?, priority = ?, due_date = ?, due_time = ?, notes = ?, completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`,
      [newTitle, newDesc, newCat, newPrio, newDueDate, newDueTime, newNotes, newCompleted, taskId, userId]
    );

    const updated = await getOne('SELECT * FROM tasks WHERE id = ?', [taskId]);

    return res.json({
      message: 'Task updated successfully.',
      task: { ...updated, completed: Boolean(updated.completed) },
    });
  } catch (error: any) {
    console.error('updateTask error:', error);
    return res.status(500).json({ error: 'Failed to update task.' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const taskId = req.params.id;

    const existing = await getOne('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [taskId, userId]);
    if (!existing) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    await run('DELETE FROM tasks WHERE id = ? AND user_id = ?', [taskId, userId]);

    return res.json({ message: 'Task deleted successfully.', taskId });
  } catch (error: any) {
    console.error('deleteTask error:', error);
    return res.status(500).json({ error: 'Failed to delete task.' });
  }
};
