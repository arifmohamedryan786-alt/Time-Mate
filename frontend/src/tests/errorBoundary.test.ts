/**
 * Frontend Unit Tests: React Error Boundary State & Lifecycle
 * 
 * Verifies that ErrorBoundary correctly derives error state,
 * stores error references, resets state on recovery, and maintains diagnostics.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ErrorBoundary } from '../components/ErrorBoundary.js';

describe('Frontend Error Boundary Unit Tests', () => {
  it('should initialize with default non-error state', () => {
    const boundary = new ErrorBoundary({ children: null });
    assert.equal(boundary.state.hasError, false);
    assert.equal(boundary.state.error, null);
    assert.equal(boundary.state.errorInfo, null);
    assert.equal(boundary.state.showDetails, false);
  });

  it('should derive error state from caught Error instance', () => {
    const testError = new TypeError('Cannot read properties of undefined (reading "title")');
    const derived = ErrorBoundary.getDerivedStateFromError(testError);

    assert.equal(derived.hasError, true);
    assert.equal(derived.error, testError);
    assert.equal(derived.errorInfo, null);
    assert.equal(derived.showDetails, false);
  });

  it('should capture ErrorInfo component stack in componentDidCatch', () => {
    const boundary = new ErrorBoundary({ children: null });
    const mockError = new Error('Render crash in FocusTimerPage');
    const mockErrorInfo = {
      componentStack: '\n    in FocusTimerPage (at App.tsx:142)\n    in main (at App.tsx:191)',
    };

    boundary.componentDidCatch(mockError, mockErrorInfo as any);

    assert.deepEqual(boundary.state.errorInfo, mockErrorInfo);
  });

  it('should reset error state when handleReset is triggered', () => {
    const boundary = new ErrorBoundary({ children: null });
    const testError = new Error('Network error rendering task list');

    // Simulate error state
    boundary.state = {
      hasError: true,
      error: testError,
      errorInfo: { componentStack: 'in TasksPage' } as any,
      showDetails: true,
    };

    // Call private reset handler via instance
    (boundary as any).handleReset();

    assert.equal(boundary.state.hasError, false, 'hasError should reset to false');
    assert.equal(boundary.state.error, null, 'error reference should clear to null');
    assert.equal(boundary.state.errorInfo, null, 'errorInfo should clear to null');
    assert.equal(boundary.state.showDetails, false, 'showDetails should collapse to false');
  });
});
