/**
 * Frontend Unit Tests: Student Productivity Metrics & Analytics
 * 
 * Verifies mathematical accuracy of task completion percentages,
 * focus minutes aggregation, and distraction self-check metrics.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Student Productivity Metrics Calculation', () => {
  it('should calculate task completion percentage accurately', () => {
    const calculateCompletionRate = (completedCount: number, totalCount: number): number => {
      if (totalCount === 0) return 0;
      return Math.round((completedCount / totalCount) * 100);
    };

    assert.equal(calculateCompletionRate(0, 0), 0);
    assert.equal(calculateCompletionRate(1, 4), 25);
    assert.equal(calculateCompletionRate(2, 3), 67);
    assert.equal(calculateCompletionRate(5, 5), 100);
  });

  it('should sum total focus session duration and convert to hours and minutes', () => {
    const sessions = [
      { duration_minutes: 25 },
      { duration_minutes: 25 },
      { duration_minutes: 45 },
      { duration_minutes: 15 },
    ];

    const totalMinutes = sessions.reduce((acc, s) => acc + s.duration_minutes, 0);
    assert.equal(totalMinutes, 110);

    const hours = Math.floor(totalMinutes / 60);
    const remainingMins = totalMinutes % 60;

    const formatted = `${hours}h ${remainingMins}m`;
    assert.equal(formatted, '1h 50m');
  });

  it('should correctly classify distraction level severity', () => {
    const classifyDistractionSeverity = (level: string): 'LOW' | 'MODERATE' | 'HIGH' => {
      if (level === 'Less than 30 min' || level === '30–60 min') return 'LOW';
      if (level === '1–2 hours') return 'MODERATE';
      return 'HIGH'; // '2–3 hours' or 'More than 3 hours'
    };

    assert.equal(classifyDistractionSeverity('Less than 30 min'), 'LOW');
    assert.equal(classifyDistractionSeverity('30–60 min'), 'LOW');
    assert.equal(classifyDistractionSeverity('1–2 hours'), 'MODERATE');
    assert.equal(classifyDistractionSeverity('2–3 hours'), 'HIGH');
    assert.equal(classifyDistractionSeverity('More than 3 hours'), 'HIGH');
  });
});
