import { Router, Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import {
  listNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
} from '../controllers/notices';
import { authMiddleware, requireRole } from '../middleware/auth';
import { verifyAccessToken } from '../utils/auth';

const router = Router();

/**
 * Middleware to optionally parse access tokens.
 * This allows public queries to check if an administrator is requesting draft entries (by setting admin=true).
 */
const optionalAuthMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role as Role,
    };
  } catch (error) {
    // Fail silently since credentials are optional
  }
  next();
};

// Public notice lookup queries (optional auth is parsed to support admin previews)
router.get('/', optionalAuthMiddleware, listNotices);
router.get('/:id', optionalAuthMiddleware, getNoticeById);

// Admin / Coordinator / Staff CRUD management endpoints
router.post('/', authMiddleware, requireRole([Role.ADMIN, Role.STAFF]), createNotice);
router.put('/:id', authMiddleware, requireRole([Role.ADMIN, Role.STAFF]), updateNotice);
router.delete('/:id', authMiddleware, requireRole([Role.ADMIN]), deleteNotice);

export default router;
