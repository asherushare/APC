import { Router } from 'express';
import { Role } from '@prisma/client';
import {
  submitApplication,
  listApplications,
  getApplicationDetails,
  getApplicationStats,
  updateApplicationStatus,
} from '../controllers/applications';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

// Public route to submit a shareholder application
router.post('/', submitApplication);

// Administrative route to list shareholder applications (scoped by block for coordinators)
router.get('/', authMiddleware, requireRole([Role.ADMIN, Role.COORDINATOR]), listApplications);

// Administrative route to retrieve stats (registered before general /:id parameters)
router.get('/stats', authMiddleware, requireRole([Role.ADMIN, Role.COORDINATOR]), getApplicationStats);

// Administrative route to fetch application details (scoped by block for coordinators)
router.get('/:id', authMiddleware, requireRole([Role.ADMIN, Role.COORDINATOR]), getApplicationDetails);

// Administrative route to update application review status (scoped by block for coordinators)
router.patch('/:id/status', authMiddleware, requireRole([Role.ADMIN, Role.COORDINATOR]), updateApplicationStatus);

export default router;
