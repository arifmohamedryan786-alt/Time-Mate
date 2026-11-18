/**
 * Unit Tests: Error Boundaries & Centralized Error Middleware
 * 
 * Verifies custom AppError instances, HTTP status code mappings,
 * SQLite constraint mapping, and structured JSON error responses.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AppError, errorHandler, notFoundHandler } from '../middleware/errorHandler.js';

describe('Error Boundaries & Error Handler Tests', () => {
  it('should instantiate AppError with custom message, status code, and metadata', () => {
    const error = new AppError('Resource conflicting', 409, { conflictField: 'email' });

    assert.equal(error.message, 'Resource conflicting');
    assert.equal(error.statusCode, 409);
    assert.equal(error.isOperational, true);
    assert.deepEqual(error.details, { conflictField: 'email' });
    assert.ok(error.stack, 'Error should capture a stack trace');
  });

  it('should default AppError to status 500 when not specified', () => {
    const defaultError = new AppError('Server error');
    assert.equal(defaultError.statusCode, 500);
    assert.equal(defaultError.isOperational, true);
  });

  it('should format 404 route not found error correctly', () => {
    let capturedStatus = 0;
    let capturedBody: any = null;

    const mockReq: any = { method: 'POST', originalUrl: '/api/non-existent' };
    const mockRes: any = {
      status(code: number) {
        capturedStatus = code;
        return this;
      },
      json(body: any) {
        capturedBody = body;
        return this;
      },
    };

    notFoundHandler(mockReq, mockRes);

    assert.equal(capturedStatus, 404);
    assert.equal(capturedBody.success, false);
    assert.equal(capturedBody.error, 'Resource not found: POST /api/non-existent');
    assert.ok(capturedBody.timestamp);
  });

  it('should map SQLite unique constraint violations to HTTP 409 Conflict', () => {
    let capturedStatus = 0;
    let capturedBody: any = null;

    const mockError: any = new Error('UNIQUE constraint failed: users.email');
    mockError.code = 'SQLITE_CONSTRAINT_UNIQUE';

    const mockReq: any = { method: 'POST', originalUrl: '/api/auth/signup' };
    const mockRes: any = {
      status(code: number) {
        capturedStatus = code;
        return this;
      },
      json(body: any) {
        capturedBody = body;
        return this;
      },
    };

    errorHandler(mockError, mockReq, mockRes, (() => {}) as any);

    assert.equal(capturedStatus, 409);
    assert.equal(capturedBody.success, false);
    assert.ok(capturedBody.error.includes('Database constraint violation'));
  });

  it('should map JWT token expiration errors to HTTP 401 Unauthorized', () => {
    let capturedStatus = 0;
    let capturedBody: any = null;

    const mockError: any = new Error('jwt expired');
    mockError.name = 'TokenExpiredError';

    const mockReq: any = { method: 'GET', originalUrl: '/api/tasks' };
    const mockRes: any = {
      status(code: number) {
        capturedStatus = code;
        return this;
      },
      json(body: any) {
        capturedBody = body;
        return this;
      },
    };

    errorHandler(mockError, mockReq, mockRes, (() => {}) as any);

    assert.equal(capturedStatus, 401);
    assert.equal(capturedBody.success, false);
    assert.ok(capturedBody.error.includes('expired'));
  });
});
