import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/auth';
import { UnauthorizedError } from '../utils/errors';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      publicUser?: {
        id: string;
        phoneNumber: string;
      };
    }
  }
}

/**
 * Middleware to authenticate public users (farmers/producers).
 * Validates JWT access tokens containing the 'PUBLIC_USER' scoped role.
 */
export const publicAuthMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Access token is required', 'ACCESS_TOKEN_REQUIRED');
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token) as any;
    
    // Segregate public user accounts from administrator privileges
    if (payload.role !== 'PUBLIC_USER') {
      throw new UnauthorizedError('Invalid access token role scope', 'INVALID_TOKEN_SCOPE');
    }

    req.publicUser = {
      id: payload.userId,
      phoneNumber: payload.phoneNumber as string,
    };
    next();
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired access token', 'INVALID_ACCESS_TOKEN');
  }
};
