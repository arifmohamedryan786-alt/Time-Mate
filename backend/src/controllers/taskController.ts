/**
 * TIME-MATE - Task Controller
 * 
 * Provides CRUD operations for student tasks, supporting priority categorization,
 * due date and time tracking, status toggling, and flexible rescheduling.
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { query, getOne, run } from '../db/database.js';

/**
 * Valid task priority levels recognized by the system.
 */
export const VALID_PRIORITIES = ['HIGH', 'MEDIUM', 'LOW'] as const;

/**
 * Valid task categories standard across hostel routines.
 */
export const VALID_CATEGORIES = ['Study', 'Assignment', 'Class', 'Personal', 'Project', 'Other'] as const;

/**
 * Retrieve all tasks for the authenticated student.
 * 
 * Route: GET /api/tasks
 * Header: Authorization: Bearer <token>
 * Returns: Array of tasks sorted by due date, due time, and creation timestamp.
 */
export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }

    const tasks = await query(
      'SELECT * FROM tasks WHERE user_id = ? ORDER BY due_date ASC, due_time ASC, created_at DESC',
      [userId]
    );

    // Format SQLite numeric 0/1 to boolean for frontend compatibility
    const formatted = tasks.map((t) => ({
      ...t,
      completed: Boolean(t.completed),
    }));

    return res.json({
      success: true,
      tasks: formatted
    });
  } catch (error: any) {
    console.error('[getTasks] Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve tasks.' });
  }
};

/**
 * Create a new task for the authenticated student.
 * 
 * Route: POST /api/tasks
 * Header: Authorization: Bearer <token>
 * Body: { title, description, category, priority, due_date, due_time, notes }
 * 
 * Validations:
 * - `title` and `due_date` are mandatory fields.
 * - `priority` defaults to 'MEDIUM' if omitted or invalid.
 * - `category` defaults to 'Study' if omitted.
 */
export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }

    const { title, description, category, priority, due_date, due_time, notes } = req.body;

    // Required field validation
    if (!title || !title.trim() || !due_date) {
      return res.status(400).json({
        success: false,
        error: 'Task title and due date are required fields.'
      });
    }

    // Generate unique ID with collision-resistant entropy
    const taskId = 'tsk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const cat = category && VALID_CATEGORIES.includes(category) ? category : 'Study';
    const prio = priority && VALID_PRIORITIES.includes(priority) ? priority : 'MEDIUM';
    const dTime = due_time || '23:59';
    const desc = description || '';
    const noteStr = notes || '';

    await run(
      'INSERT INTO tasks (id, user_id, title, description, category, priority, due_date, due_time, notes, completed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)',
      [taskId, userId, title.trim(), desc, cat, prio, due_date, dTime, noteStr]
    );

    const newTask = await getOne('SELECT * FROM tasks WHERE id = ?', [taskId]);

    return res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      task: { ...newTask, completed: Boolean(newTask.completed) },
    });
  } catch (error: any) {
    console.error('[createTask] Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to create task.' });
  }
};

/**
 * Update an existing task or reschedule its due date/time.
 * 
 * Route: PUT /api/tasks/:id
 * Header: Authorization: Bearer <token>
 * Body: Partial<Task> { title, description, category, priority, due_date, due_time, notes, completed }
 */
export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }

    const taskId = req.params.id;

    // Verify task existence and ownership
    const existing = await getOne('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [taskId, userId]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Task not found or access unauthorized.' });
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
      success: true,
      message: 'Task updated successfully.',
      task: { ...updated, completed: Boolean(updated.completed) },
    });
  } catch (error: any) {
    console.error('[updateTask] Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update task.' });
  }
};

/**
 * Delete a task belonging to the authenticated student.
 * 
 * Route: DELETE /api/tasks/:id
 * Header: Authorization: Bearer <token>
 */
export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }

    const taskId = req.params.id;

    const existing = await getOne('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [taskId, userId]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Task not found or access unauthorized.' });
    }

    await run('DELETE FROM tasks WHERE id = ? AND user_id = ?', [taskId, userId]);

    return res.json({
      success: true,
      message: 'Task deleted successfully.',
      taskId
    });
  } catch (error: any) {
    console.error('[deleteTask] Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete task.' });
  }
};
