import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/db';
import {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} from '../utils/auth';
import {
  BadRequestError,
  ValidationError,
  UnauthorizedError,
  NotFoundError,
} from '../utils/errors';
/**
 * Helper to record audit logs.
 */
async function recordAuditLog(
  userId: string | null,
  action: string,
  targetEntity: string,
  targetId: string,
  req: Request,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  changes?: any
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
        changes: changes !== undefined ? changes : null,
      },
    });
  } catch (error) {
    // Fail silently
  }
}

const isProd = process.env.NODE_ENV === 'production';

// Validation schemas
export const PublicRegisterSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100),
  phoneNumber: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  email: z.string().email('Invalid email address').optional().or(z.string().length(0)),
});

export const PublicLoginSchema = z.object({
  phoneNumber: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * POST /api/v1/public-auth/register
 */
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = PublicRegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError('Validation failed', parsed.error.format());
    }

    const { fullName, phoneNumber, password, email } = parsed.data;

    // Check duplicate phone number
    const existingPhone = await prisma.publicUser.findUnique({
      where: { phoneNumber },
    });
    if (existingPhone) {
      throw new BadRequestError('Phone number already registered', 'PHONE_ALREADY_REGISTERED');
    }

    // Check duplicate email if provided
    if (email) {
      const existingEmail = await prisma.publicUser.findUnique({
        where: { email: email.trim().toLowerCase() },
      });
      if (existingEmail) {
        throw new BadRequestError('Email address already registered', 'EMAIL_ALREADY_REGISTERED');
      }
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const publicUser = await prisma.publicUser.create({
      data: {
        fullName: fullName.trim(),
        phoneNumber,
        email: email ? email.trim().toLowerCase() : null,
        passwordHash,
      },
      select: {
        id: true,
        fullName: true,
        phoneNumber: true,
        email: true,
        verified: true,
        createdAt: true,
      },
    });

    await recordAuditLog(null, 'PUBLIC_USER_REGISTERED', 'PublicUser', publicUser.id, req, { phoneNumber });

    res.status(201).json({
      success: true,
      message: 'Account created successfully. You can now login.',
      user: publicUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/public-auth/login
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = PublicLoginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError('Validation failed', parsed.error.format());
    }

    const { phoneNumber, password } = parsed.data;

    const publicUser = await prisma.publicUser.findUnique({
      where: { phoneNumber },
    });

    if (!publicUser) {
      throw new UnauthorizedError('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    const isValid = await verifyPassword(password, publicUser.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    // Create session token pair
    const tokenPayload = {
      userId: publicUser.id,
      email: publicUser.email || '',
      phoneNumber: publicUser.phoneNumber,
      role: 'PUBLIC_USER',
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Persist refresh token in db
    const tokenHash = hashRefreshToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.publicRefreshToken.create({
      data: {
        tokenHash,
        publicUserId: publicUser.id,
        expiresAt,
      },
    });

    await recordAuditLog(null, 'PUBLIC_USER_LOGIN', 'PublicUser', publicUser.id, req, { phoneNumber });

    // Set refresh token cookie
    res.cookie('publicRefreshToken', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      accessToken,
      user: {
        id: publicUser.id,
        fullName: publicUser.fullName,
        phoneNumber: publicUser.phoneNumber,
        email: publicUser.email,
        verified: publicUser.verified,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/public-auth/refresh
 */
export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const incomingToken = req.cookies?.publicRefreshToken;
    if (!incomingToken) {
      throw new UnauthorizedError('Refresh token required', 'REFRESH_TOKEN_REQUIRED');
    }

    const tokenHash = hashRefreshToken(incomingToken);

    // Retrieve active stored token
    const storedToken = await prisma.publicRefreshToken.findUnique({
      where: { tokenHash },
      include: { publicUser: true },
    });

    if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN');
    }

    // Revoke old token
    await prisma.publicRefreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true },
    });

    const publicUser = storedToken.publicUser;

    // Create new session token pair
    const tokenPayload = {
      userId: publicUser.id,
      email: publicUser.email || '',
      phoneNumber: publicUser.phoneNumber,
      role: 'PUBLIC_USER',
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    // Persist new refresh token
    const newHash = hashRefreshToken(newRefreshToken);
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.publicRefreshToken.create({
      data: {
        tokenHash: newHash,
        publicUserId: publicUser.id,
        expiresAt: newExpiresAt,
      },
    });

    // Send new refresh token in cookie
    res.cookie('publicRefreshToken', newRefreshToken, {
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
    // Clear cookies on failure
    res.clearCookie('publicRefreshToken', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'strict',
      path: '/',
    });
    next(error);
  }
};

/**
 * POST /api/v1/public-auth/logout
 */
export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const incomingToken = req.cookies?.publicRefreshToken;

    if (incomingToken) {
      const tokenHash = hashRefreshToken(incomingToken);
      const storedToken = await prisma.publicRefreshToken.findUnique({
        where: { tokenHash },
      });

      if (storedToken) {
        await prisma.publicRefreshToken.update({
          where: { id: storedToken.id },
          data: { revoked: true },
        });
        await recordAuditLog(null, 'PUBLIC_USER_LOGOUT', 'PublicUser', storedToken.publicUserId, req);
      }
    }

    res.clearCookie('publicRefreshToken', {
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
 * GET /api/v1/public-auth/me
 */
export const me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Rely on publicAuthMiddleware to append publicUser to request
    if (!req.publicUser) {
      throw new UnauthorizedError('Authentication required', 'AUTHENTICATION_REQUIRED');
    }

    const user = await prisma.publicUser.findUnique({
      where: { id: req.publicUser.id },
      select: {
        id: true,
        fullName: true,
        phoneNumber: true,
        email: true,
        verified: true,
        createdAt: true,
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
