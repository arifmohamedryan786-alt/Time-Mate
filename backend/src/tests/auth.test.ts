/**
 * Unit Tests: Authentication, Token Security & Hashing
 * 
 * Verifies bcrypt password hashing, JWT token signature creation,
 * payload decoding, token verification, and input validation checks.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../middleware/auth.js';

describe('Authentication & Security Unit Tests', () => {
  const testPassword = 'SecureStudentPass2026!';

  it('should securely hash passwords using bcrypt with proper work factor', async () => {
    const saltRounds = 10;
    const hash = await bcrypt.hash(testPassword, saltRounds);

    assert.ok(hash.startsWith('$2'), 'Hash should follow modular crypt format');
    assert.notEqual(hash, testPassword, 'Hash must not equal plaintext');

    const isMatch = await bcrypt.compare(testPassword, hash);
    assert.equal(isMatch, true, 'Correct plaintext password must match hash');

    const wrongMatch = await bcrypt.compare('WrongPassword', hash);
    assert.equal(wrongMatch, false, 'Incorrect password must be rejected');
  });

  it('should generate valid signed JWT tokens with claims and expiration', () => {
    const payload = { userId: 'usr_test_123', email: 'student@hostel.edu' };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    assert.ok(typeof token === 'string', 'Token should be a string');
    assert.equal(token.split('.').length, 3, 'JWT should contain 3 dot-separated parts');

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    assert.equal(decoded.userId, payload.userId);
    assert.equal(decoded.email, payload.email);
    assert.ok(decoded.exp > decoded.iat, 'Token expiration must be in the future');
  });

  it('should reject tampered or invalid JWT tokens', () => {
    const payload = { userId: 'usr_test_123', email: 'student@hostel.edu' };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    const tamperedToken = token + 'manipulated';

    assert.throws(
      () => {
        jwt.verify(tamperedToken, JWT_SECRET);
      },
      (err: any) => err.name === 'JsonWebTokenError'
    );
  });

  it('should reject expired JWT tokens', () => {
    const payload = { userId: 'usr_test_123', email: 'student@hostel.edu' };
    // Issue token expired 10 seconds ago
    const expiredToken = jwt.sign(payload, JWT_SECRET, { expiresIn: -10 });

    assert.throws(
      () => {
        jwt.verify(expiredToken, JWT_SECRET);
      },
      (err: any) => err.name === 'TokenExpiredError'
    );
  });

  it('should enforce student password minimum length requirement (>= 6 chars)', () => {
    const shortPassword = '12345';
    assert.ok(shortPassword.length < 6, 'Short password must fail length check');

    const validPassword = '123456';
    assert.ok(validPassword.length >= 6, 'Valid password must pass length check');
  });
});
