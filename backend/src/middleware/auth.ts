import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * Secret key used to sign and verify JSON Web Tokens (JWT).
 * Falls back to a deterministic development key if not specified in environment.
 */
export const JWT_SECRET = process.env.JWT_SECRET || 'better_tomorrow_super_secret_hostel_key_2026';

/**
 * Extended Express Request interface incorporating the authenticated user's token payload.
 */
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

/**
 * Middleware: Verifies the JWT Bearer token supplied in the HTTP Authorization header.
 * 
 * Flow:
 * 1. Checks for the presence of the `Authorization: Bearer <token>` header.
 * 2. Returns 401 Unauthorized if the header or token is missing.
 * 3. Verifies token validity and signature using `JWT_SECRET`.
 * 4. Returns 403 Forbidden if the token has been tampered with or has expired.
 * 5. Attaches the decoded payload (`userId`, `email`) to `req.user` and yields control to the next handler.
 * 
 * @param req - Authenticated request containing headers
 * @param res - Express response object for returning HTTP error statuses
 * @param next - Next middleware callback function
 */
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication token required. Please provide a valid Bearer token.'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) {
      const isExpired = err.name === 'TokenExpiredError';
      return res.status(403).json({
        success: false,
        error: isExpired
          ? 'Authentication token has expired. Please log in again.'
          : 'Invalid or malformed authentication token.'
      });
    }
    req.user = decoded;
    next();
  });
};
