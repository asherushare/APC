import { Router } from 'express';
import { Role } from '@prisma/client';
import { listAuditLogs } from '../controllers/audit';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

// Retrieve system audit logs with pagination and filters
router.get('/', authMiddleware, requireRole([Role.ADMIN, Role.COORDINATOR]), listAuditLogs);

export default router;
