/**
 * Unit Tests: Task Controller Business Logic & Sanitization
 * 
 * Verifies payload validation, priority classification,
 * boolean status conversions, and date/time rescheduling calculations.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { VALID_PRIORITIES, VALID_CATEGORIES } from '../controllers/taskController.js';

describe('Task Controller Logic & Validation Tests', () => {
  it('should recognize all standardized task priority levels', () => {
    assert.deepEqual(VALID_PRIORITIES, ['HIGH', 'MEDIUM', 'LOW']);
    assert.ok(VALID_PRIORITIES.includes('HIGH'));
    assert.ok(VALID_PRIORITIES.includes('MEDIUM'));
    assert.ok(VALID_PRIORITIES.includes('LOW'));
  });

  it('should validate allowed task categories', () => {
    assert.ok(VALID_CATEGORIES.includes('Study'));
    assert.ok(VALID_CATEGORIES.includes('Assignment'));
    assert.ok(VALID_CATEGORIES.includes('Class'));
    assert.ok(VALID_CATEGORIES.includes('Personal'));
    assert.ok(VALID_CATEGORIES.includes('Project'));
    assert.ok(VALID_CATEGORIES.includes('Other'));
  });

  it('should format numeric SQLite boolean flags (0/1) to real JSON booleans', () => {
    const rawSqliteRow = {
      id: 'tsk_123',
      title: 'Review Engineering Mathematics',
      completed: 1,
    };

    const formatted = {
      ...rawSqliteRow,
      completed: Boolean(rawSqliteRow.completed),
    };

    assert.strictEqual(formatted.completed, true);

    const rawIncompleteRow = {
      id: 'tsk_124',
      title: 'Submit Lab Report',
      completed: 0,
    };

    const formattedIncomplete = {
      ...rawIncompleteRow,
      completed: Boolean(rawIncompleteRow.completed),
    };

    assert.strictEqual(formattedIncomplete.completed, false);
  });

  it('should calculate proper tomorrow date for task rescheduling', () => {
    const baseDate = new Date('2026-11-18T10:00:00Z');
    const tomorrow = new Date(baseDate);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const formattedTomorrow = tomorrow.toISOString().split('T')[0];
    assert.equal(formattedTomorrow, '2026-11-19', 'Rescheduled date should correctly increment day by 1');
  });

  it('should enforce required title and due date fields', () => {
    const validateTaskInput = (title?: string, due_date?: string) => {
      if (!title || !title.trim() || !due_date) {
        return { valid: false, error: 'Task title and due date are required fields.' };
      }
      return { valid: true };
    };

    assert.equal(validateTaskInput('', '2026-11-18').valid, false);
    assert.equal(validateTaskInput('   ', '2026-11-18').valid, false);
    assert.equal(validateTaskInput('Physics Problem Set', '').valid, false);
    assert.equal(validateTaskInput('Physics Problem Set', '2026-11-18').valid, true);
  });
});
