import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import crypto from 'crypto';
import { prisma } from '../config/db';
import { logger } from '../utils/logger';
import { env } from '../config/env';
import { emailService } from '../utils/email';
import {
  verifyPassword,
  hashPassword,
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  verifyRefreshToken,
} from '../utils/auth';
import {
  UnauthorizedError,
  NotFoundError,
  BadRequestError,
  ForbiddenError,
  TooManyRequestsError,
} from '../utils/errors';

const isProd = env.NODE_ENV === 'production' || process.env.NODE_ENV === 'production';
// eslint-disable-next-line no-console
console.log(`[Auth Module] Initializing. isProd = ${isProd}, process.env.NODE_ENV = ${process.env.NODE_ENV}, env.NODE_ENV = ${env.NODE_ENV}`);

/**
 * Helper to record audit logs.
 */
async function recordAuditLog(
  userId: string | null,
  action: string,
  targetEntity: string,
  targetId: string,
  req: Request,
  changes?: Prisma.InputJsonValue
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        targetEntity,
        targetId,
        ipAddress: req.ip || null,
        userAgent: req.headers['user-agent'] || null,
        changes: changes !== undefined ? changes : Prisma.DbNull,
      },
    });
  } catch (error) {
    logger.error(`Failed to record audit log for action ${action}: ${error}`);
  }
}

/**
 * POST /api/v1/auth/login
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      throw new BadRequestError('Email and password are required', 'EMAIL_PASSWORD_REQUIRED');
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user || user.deletedAt) {
      // Record failed attempt for auditing
      await recordAuditLog(null, 'LOGIN_FAILED', 'User', 'unknown', req, { email });
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Check account lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      await recordAuditLog(user.id, 'LOGIN_FAILED', 'User', user.id, req, { reason: 'Account locked out' });
      throw new ForbiddenError(
        'Too many failed attempts. Account locked.',
        'ACCOUNT_LOCKED'
      );
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
      const attempts = user.failedLoginAttempts + 1;
      const lockedUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: attempts,
          lockedUntil,
        },
      });

      if (lockedUntil) {
        await recordAuditLog(user.id, 'ACCOUNT_LOCKED', 'User', user.id, req, { attempts });
      }
      await recordAuditLog(user.id, 'LOGIN_FAILED', 'User', user.id, req, { attempts });

      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Reset login attempts on success
    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      });
    }

    // Progressive Migration: Upgrade legacy Bcrypt hashes to Argon2id
    const isBcrypt =
      user.passwordHash.startsWith('$2a$') ||
      user.passwordHash.startsWith('$2b$') ||
      user.passwordHash.startsWith('$2y$');

    if (isBcrypt) {
      try {
        const newArgonHash = await hashPassword(password);
        await prisma.user.update({
          where: { id: user.id },
          data: { passwordHash: newArgonHash },
        });
        logger.info(`Successfully migrated user password hash to Argon2id for: ${user.email}`);
      } catch (hashError) {
        logger.error(`Failed to upgrade password hash to Argon2id for user ${user.id}: ${hashError}`);
      }
    }

    // Generate token payloads
    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Save refresh token in database (SHA-256 hash)
    const tokenHash = hashRefreshToken(refreshToken);
    
    // Remember Me support: 14 days vs 1 day
    const maxAge = rememberMe ? 14 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + maxAge);

    await prisma.refreshToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    // Write audit log
    await recordAuditLog(user.id, 'LOGIN_SUCCESS', 'User', user.id, req);

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'strict',
      path: '/',
      maxAge,
    });

    res.status(200).json({
      success: true,
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        block: user.block,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/refresh
 */
export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const incomingToken = req.cookies?.refreshToken;

    if (!incomingToken) {
      throw new UnauthorizedError('Refresh token is required', 'REFRESH_TOKEN_REQUIRED');
    }

    let payload;
    try {
      payload = verifyRefreshToken(incomingToken);
    } catch (verifyError) {
      throw new UnauthorizedError('Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN');
    }

    const tokenHash = hashRefreshToken(incomingToken);

    // Check database for active token
    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    // Token reuse detection (RTR)
    if (storedToken && storedToken.revoked) {
      // Revoke all tokens for this user immediately (token theft mitigation)
      await prisma.refreshToken.updateMany({
        where: { userId: storedToken.userId },
        data: { revoked: true },
      });

      await recordAuditLog(storedToken.userId, 'TOKEN_REUSE_DETECTED', 'User', storedToken.userId, req, {
        tokenHash,
      });

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'strict',
        path: '/',
      });

      throw new UnauthorizedError(
        'Token reuse detected. All active sessions have been terminated.',
        'TOKEN_REUSE_DETECTED'
      );
    }

    if (!storedToken) {
      throw new UnauthorizedError('Invalid refresh token', 'INVALID_REFRESH_TOKEN');
    }

    if (new Date() > storedToken.expiresAt) {
      throw new UnauthorizedError('Refresh token is expired', 'REFRESH_TOKEN_EXPIRED');
    }

    // Revoke the old token
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true },
    });

    // Generate new token pair
    const tokenPayload = { userId: payload.userId, email: payload.email, role: payload.role };
    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    // Persist new refresh token
    const newHash = hashRefreshToken(newRefreshToken);
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        tokenHash: newHash,
        userId: payload.userId,
        expiresAt: newExpiresAt,
      },
    });

    // Audit token refresh
    await recordAuditLog(payload.userId, 'TOKEN_REFRESH', 'User', payload.userId, req);

    // Send new refresh token in cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    // If refresh token fails validation, clear cookie so browser client stops looping/redirecting
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'strict',
      path: '/',
    });
    next(error);
  }
};

/**
 * POST /api/v1/auth/logout
 */
export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const incomingToken = req.cookies?.refreshToken;

    if (incomingToken) {
      const tokenHash = hashRefreshToken(incomingToken);
      
      const storedToken = await prisma.refreshToken.findUnique({
        where: { tokenHash },
      });

      if (storedToken) {
        // Revoke token
        await prisma.refreshToken.update({
          where: { id: storedToken.id },
          data: { revoked: true },
        });

        await recordAuditLog(storedToken.userId, 'LOGOUT', 'User', storedToken.userId, req);
      }
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'strict',
      path: '/',
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/auth/me
 */
export const me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Not authenticated', 'AUTHENTICATION_REQUIRED');
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        block: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/forgot-password
 */
export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new BadRequestError('Email is required', 'EMAIL_REQUIRED');
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    // User enumeration protection: return success even if user not found
    if (!user || user.deletedAt) {
      await recordAuditLog(null, 'PASSWORD_RESET_REQUESTED_UNKNOWN', 'User', 'unknown', req, { email });
      res.status(200).json({
        success: true,
        message: 'If your email is registered with us, a password reset link has been sent.',
      });
      return;
    }

    // Cooldown check: 60-second limit per user email
    const lastToken = await prisma.passwordResetToken.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    if (lastToken && (Date.now() - lastToken.createdAt.getTime() < 60 * 1000)) {
      throw new TooManyRequestsError(
        'A password reset link was recently requested. Please wait 60 seconds before trying again.',
        'RESET_COOLDOWN'
      );
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Persist token hash
    await prisma.passwordResetToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    // Send reset link
    const resetLink = `${env.FRONTEND_URL}/staff-portal/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;
    await emailService.sendPasswordResetEmail(user.email, resetLink, user.fullName);

    // Audit request
    await recordAuditLog(user.id, 'PASSWORD_RESET_REQUESTED', 'User', user.id, req);

    res.status(200).json({
      success: true,
      message: 'If your email is registered with us, a password reset link has been sent.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/reset-password
 */
export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, token, password } = req.body;

    if (!email || !token || !password) {
      throw new BadRequestError('Email, token, and password are required', 'MISSING_FIELDS');
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user || user.deletedAt) {
      throw new BadRequestError('Invalid reset request', 'INVALID_RESET_REQUEST');
    }

    // Validate password strength: min 8 characters, min 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      throw new BadRequestError(
        'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
        'WEAK_PASSWORD'
      );
    }

    // Verify token
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const storedToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!storedToken || storedToken.userId !== user.id || storedToken.used || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Invalid or expired reset token', 'INVALID_RESET_TOKEN');
    }

    // Hash password with Argon2id
    const newHash = await hashPassword(password);

    // Update password hash, reset lockout, and mark token used in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: newHash,
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      }),
      prisma.passwordResetToken.update({
        where: { id: storedToken.id },
        data: { used: true },
      }),
      // Revoke all refresh tokens for session flush
      prisma.refreshToken.updateMany({
        where: { userId: user.id },
        data: { revoked: true },
      }),
    ]);

    // Record audit events
    await recordAuditLog(user.id, 'SESSION_REVOKED', 'User', user.id, req, { reason: 'Password reset' });
    await recordAuditLog(user.id, 'PASSWORD_RESET_SUCCESS', 'User', user.id, req);

    // Send confirmation email
    await emailService.sendPasswordResetConfirmationEmail(user.email, user.fullName);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully.',
    });
  } catch (error) {
    next(error);
  }
};
