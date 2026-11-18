import { Request, Response, NextFunction } from 'express';

/**
 * Custom application error class for representing operational errors
 * with an associated HTTP status code and optional error details.
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public details?: any;

  /**
   * @param message - User-friendly error message
   * @param statusCode - HTTP status code (default: 500)
   * @param details - Additional structured diagnostic details
   */
  constructor(message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;

    // Capture standard V8 stack trace excluding this constructor
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Centralized Express global error handling middleware.
 * Catches all errors forwarded via next(err) or thrown asynchronously.
 * Normalizes error responses into a consistent JSON envelope:
 * {
 *   success: false,
 *   error: string,
 *   details?: any,
 *   timestamp: string
 * }
 */
export const errorHandler = (
  err: Error | AppError | any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Extract or default status code and message
  let statusCode = (err as AppError).statusCode || 500;
  let message = err.message || 'Internal server error occurred.';
  let details = (err as AppError).details || undefined;

  // Handle SQLite specific constraint errors
  if (err.code === 'SQLITE_CONSTRAINT' || err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    statusCode = 409;
    message = 'Database constraint violation. Duplicate resource or unique constraint failed.';
  } else if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
    statusCode = 400;
    message = 'Foreign key constraint failed. Referenced resource does not exist.';
  }

  // Handle JSON Web Token authentication errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token provided.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired. Please sign in again.';
  }

  // Handle JSON parsing syntax errors from Express body parser
  if (err instanceof SyntaxError && 'body' in err) {
    statusCode = 400;
    message = 'Malformed JSON payload in request body.';
  }

  // Log non-operational (programming or system) errors to server console for debugging
  if (statusCode >= 500) {
    console.error(`[Unhandled Server Error] ${req.method} ${req.originalUrl}:`, err);
  }

  // Send standardized JSON error response
  return res.status(statusCode).json({
    success: false,
    error: message,
    ...(details ? { details } : {}),
    timestamp: new Date().toISOString()
  });
};

/**
 * 404 Route Not Found middleware for unmatched endpoints.
 */
export const notFoundHandler = (req: Request, res: Response) => {
  return res.status(404).json({
    success: false,
    error: `Resource not found: ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString()
  });
};
