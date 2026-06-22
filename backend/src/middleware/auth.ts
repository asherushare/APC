import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { verifyAccessToken } from '../utils/auth';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: Role;
      };
    }
  }
}

/**
 * Middleware to authenticate requests using JWT Access Tokens in the Authorization header.
 */
export const authMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Access token is required', 'ACCESS_TOKEN_REQUIRED');
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role as Role,
    };
    next();
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired access token', 'INVALID_ACCESS_TOKEN');
  }
};

/**
 * Middleware factory to authorize access based on user roles.
 */
export const requireRole = (allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required', 'AUTHENTICATION_REQUIRED');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError(
        'You do not have permission to perform this action',
        'INSUFFICIENT_PERMISSIONS'
      );
    }

    next();
  };
};
