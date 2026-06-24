import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';

// Type-safe dynamic import for argon2 to handle environments where native build fails
let argon2: typeof import('argon2') | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  argon2 = require('argon2');
} catch (error) {
  // Gracefully fallback to bcrypt
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Hashes a plaintext password using Argon2id, falling back to Bcrypt (12 rounds)
 * if Argon2 is not supported or throws an error.
 */
export async function hashPassword(password: string): Promise<string> {
  if (argon2) {
    try {
      return await argon2.hash(password, {
        type: argon2.argon2id,
      });
    } catch (error) {
      // Fall through to bcrypt
    }
  }
  return bcrypt.hash(password, 12);
}

/**
 * Verifies a plaintext password against a hash.
 * If the hash is a legacy bcrypt hash (starts with $2a$, $2b$, or $2y$), it verifies using bcrypt.
 * Otherwise, it attempts verification using Argon2id with a fallback to bcrypt.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const isBcryptHash =
    hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$');

  if (isBcryptHash) {
    return bcrypt.compare(password, hash);
  }

  if (argon2) {
    try {
      return await argon2.verify(hash, password);
    } catch (error) {
      // Fall through to bcrypt
    }
  }

  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    return false;
  }
}

/**
 * Generates an Access Token (valid for 15 minutes)
 */
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '15m' });
}

/**
 * Generates a Refresh Token (valid for 7 days)
 */
export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

/**
 * Verifies an Access Token
 */
export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}

/**
 * Verifies a Refresh Token
 */
export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
}

/**
 * Generates a SHA-256 hash of a refresh token for database persistence and verification.
 */
export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export interface UploadTokenPayload {
  applicationId: string;
  type: 'upload';
}

/**
 * Generates a signed Upload Token for applicant document upload
 */
export function generateUploadToken(applicationId: string): string {
  return jwt.sign({ applicationId, type: 'upload' }, env.JWT_SECRET, { expiresIn: '24h' });
}

/**
 * Verifies a signed Upload Token
 */
export function verifyUploadToken(token: string): UploadTokenPayload {
  const payload = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
  if (!payload || payload.type !== 'upload') {
    throw new Error('Invalid upload token type');
  }
  return payload as unknown as UploadTokenPayload;
}

