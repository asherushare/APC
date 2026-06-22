import { Router } from 'express';
import { Role } from '@prisma/client';
import {
  submitApplication,
  listApplications,
  getApplicationDetails,
} from '../controllers/applications';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

// Public route to submit a shareholder application
router.post('/', submitApplication);

// Administrative route to list shareholder applications (scoped by block for coordinators)
router.get('/', authMiddleware, requireRole([Role.ADMIN, Role.COORDINATOR]), listApplications);

// Administrative route to fetch application details (scoped by block for coordinators)
router.get('/:id', authMiddleware, requireRole([Role.ADMIN, Role.COORDINATOR]), getApplicationDetails);

export default router;
