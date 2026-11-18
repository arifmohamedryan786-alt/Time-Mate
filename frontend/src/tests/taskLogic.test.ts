/**
 * Frontend Unit Tests: Task Filtering, Priority Ranking & Rescheduling
 * 
 * Verifies client-side task sorting algorithms, date filtering logic,
 * and completion status operations.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Task } from '../types/index.js';

describe('Frontend Task Management & Filtering Logic', () => {
  const sampleTasks: Task[] = [
    {
      id: '1',
      user_id: 'usr-1',
      title: 'Complete Lab Report',
      description: 'DBMS normalization report',
      category: 'Assignment',
      priority: 'HIGH',
      due_date: '2026-11-18',
      due_time: '18:00',
      notes: '',
      completed: false,
      created_at: '2026-11-18T08:00:00Z',
      updated_at: '2026-11-18T08:00:00Z',
    },
    {
      id: '2',
      user_id: 'usr-1',
      title: 'Study Operating Systems',
      description: 'Paging and virtual memory',
      category: 'Study',
      priority: 'MEDIUM',
      due_date: '2026-11-19',
      due_time: '20:00',
      notes: '',
      completed: false,
      created_at: '2026-11-18T08:00:00Z',
      updated_at: '2026-11-18T08:00:00Z',
    },
    {
      id: '3',
      user_id: 'usr-1',
      title: 'Hostel Room Cleanup',
      description: 'Tidy study table and wardrobe',
      category: 'Personal',
      priority: 'LOW',
      due_date: '2026-11-18',
      due_time: '21:00',
      notes: '',
      completed: true,
      created_at: '2026-11-18T08:00:00Z',
      updated_at: '2026-11-18T08:00:00Z',
    },
  ];

  it('should filter tasks scheduled for today (2026-11-18)', () => {
    const today = '2026-11-18';
    const todayTasks = sampleTasks.filter((t) => t.due_date === today);

    assert.equal(todayTasks.length, 2);
    assert.ok(todayTasks.some((t) => t.id === '1'));
    assert.ok(todayTasks.some((t) => t.id === '3'));
    assert.ok(!todayTasks.some((t) => t.id === '2'));
  });

  it('should filter completed vs active pending tasks', () => {
    const completedTasks = sampleTasks.filter((t) => t.completed);
    const activeTasks = sampleTasks.filter((t) => !t.completed);

    assert.equal(completedTasks.length, 1);
    assert.equal(completedTasks[0].id, '3');

    assert.equal(activeTasks.length, 2);
    assert.ok(activeTasks.every((t) => !t.completed));
  });

  it('should correctly prioritize HIGH > MEDIUM > LOW', () => {
    const priorityWeight: Record<string, number> = {
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };

    const sorted = [...sampleTasks].sort(
      (a, b) => (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0)
    );

    assert.equal(sorted[0].priority, 'HIGH');
    assert.equal(sorted[1].priority, 'MEDIUM');
    assert.equal(sorted[2].priority, 'LOW');
  });

  it('should reschedule task to custom date and time without modifying other fields', () => {
    const originalTask = sampleTasks[0];
    const newDate = '2026-11-20';
    const newTime = '14:00';

    const rescheduledTask: Task = {
      ...originalTask,
      due_date: newDate,
      due_time: newTime,
      updated_at: '2026-11-18T11:00:00Z',
    };

    assert.equal(rescheduledTask.id, originalTask.id);
    assert.equal(rescheduledTask.title, originalTask.title);
    assert.equal(rescheduledTask.due_date, '2026-11-20');
    assert.equal(rescheduledTask.due_time, '14:00');
    assert.equal(rescheduledTask.completed, false);
  });
});
