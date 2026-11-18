/**
 * TIME-MATE - Authentication Controller
 * 
 * Handles student registration, credential validation, JWT token creation,
 * authenticated profile retrieval, and password modifications.
 */

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getOne, run } from '../db/database.js';
import { JWT_SECRET, AuthRequest } from '../middleware/auth.js';

/**
 * Register a new student account.
 * 
 * Route: POST /api/auth/signup
 * Body: { name, email, password, confirmPassword }
 * 
 * Validations:
 * - Name, email, and password must not be empty.
 * - Password and confirmPassword must match identically.
 * - Password must be at least 6 characters long.
 * - Email must be unique (case-insensitive check).
 * 
 * Returns: 201 Created with JWT token and user profile on success.
 */
export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Field presence validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Full name, email, and password are required fields.'
      });
    }

    // Password confirmation match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Passwords do not match. Please verify both password entries.'
      });
    }

    // Minimum password security criteria
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Prevent duplicate email registrations
    const existingUser = await getOne('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email address already exists. Please sign in instead.'
      });
    }

    // Generate unique user identifier & securely hash password with bcrypt (10 rounds)
    const userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const passwordHash = await bcrypt.hash(password, 10);

    // Persist new user entity
    await run(
      'INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)',
      [userId, name.trim(), normalizedEmail, passwordHash]
    );

    // Seed default hostel routine settings for new student
    await run(
      'INSERT INTO user_settings (id, user_id, wake_up_time, study_start_time, default_focus_duration) VALUES (?, ?, ?, ?, ?)',
      ['set_' + userId, userId, '07:00', '09:00', 25]
    );

    // Issue signed JWT token valid for 7 days
    const token = jwt.sign(
      { userId, email: normalizedEmail },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: userId,
        name: name.trim(),
        email: normalizedEmail,
      },
    });
  } catch (error: any) {
    console.error('[signup] Internal Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during student registration.'
    });
  }
};

/**
 * Authenticate student credentials and return a signed JWT token.
 * 
 * Route: POST /api/auth/login
 * Body: { email, password }
 * 
 * Returns: 200 OK with JWT token and student record on success.
 * Returns: 401 Unauthorized for mismatched credentials.
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email address and password are required.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Lookup user by unique email address
    const user = await getOne<{ id: string; name: string; email: string; password_hash: string }>(
      'SELECT id, name, email, password_hash FROM users WHERE email = ?',
      [normalizedEmail]
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email address or password.'
      });
    }

    // Verify bcrypt password hash match
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email address or password.'
      });
    }

    // Generate authenticated session token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Signed in successfully.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error('[login] Internal Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during authentication.'
    });
  }
};

/**
 * Fetch profile data for the currently authenticated student session.
 * 
 * Route: GET /api/auth/me
 * Header: Authorization: Bearer <token>
 */
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Token missing or invalid.'
      });
    }

    const user = await getOne<{ id: string; name: string; email: string; created_at: string }>(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Student profile record not found.'
      });
    }

    return res.json({
      success: true,
      user
    });
  } catch (error: any) {
    console.error('[getMe] Internal Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while retrieving student profile.'
    });
  }
};

/**
 * Sign out user session (client-side token removal acknowledgment).
 * 
 * Route: POST /api/auth/logout
 */
export const logout = async (req: Request, res: Response) => {
  return res.json({
    success: true,
    message: 'Signed out successfully.'
  });
};

/**
 * Update authenticated student password.
 * 
 * Route: POST /api/auth/change-password
 * Header: Authorization: Bearer <token>
 * Body: { currentPassword, newPassword, confirmNewPassword }
 */
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.'
      });
    }

    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password, new password, and confirmation are required.'
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        error: 'New passwords do not match.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long.'
      });
    }

    const user = await getOne<{ id: string; password_hash: string }>(
      'SELECT id, password_hash FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Student profile not found.'
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect.'
      });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await run(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newPasswordHash, userId]
    );

    return res.json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (error: any) {
    console.error('[changePassword] Internal Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while changing password.'
    });
  }
};
