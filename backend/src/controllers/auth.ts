import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/db';
import { logger } from '../utils/logger';
import { env } from '../config/env';
import {
  verifyPassword,
  hashPassword,
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  verifyRefreshToken,
} from '../utils/auth';
import { UnauthorizedError, NotFoundError, BadRequestError } from '../utils/errors';

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
    const { email, password } = req.body;

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

    const isPasswordValid = await verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
      await recordAuditLog(user.id, 'LOGIN_FAILED', 'User', user.id, req);
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
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
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

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
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
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
        secure: env.NODE_ENV === 'production',
        sameSite: env.NODE_ENV === 'production' ? 'none' : 'strict',
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
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'strict',
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
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'strict',
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
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'strict',
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
