import { Router } from 'express';
import { Role } from '@prisma/client';
import rateLimit from 'express-rate-limit';
import {
  submitApplication,
  listApplications,
  getApplicationDetails,
  getApplicationStats,
  updateApplicationStatus,
  applyShareholderApplication,
  getMyApplication,
} from '../controllers/applications';
import { authMiddleware, requireRole } from '../middleware/auth';
import { publicAuthMiddleware } from '../middleware/publicAuth';
import { upload } from '../middleware/upload';

const router = Router();

// Strict rate limiter for public shareholder application submissions (max 10 per hour per IP)
const submitRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_SUBMISSION_ATTEMPTS',
      message: 'Too many application submissions from this IP. Please try again after an hour.',
    },
  },
});

// Public route to submit a shareholder application
router.post('/', submitRateLimiter, submitApplication);

// Administrative route to list shareholder applications (scoped by block for coordinators)
router.get('/', authMiddleware, requireRole([Role.ADMIN, Role.COORDINATOR]), listApplications);

// Administrative route to retrieve stats (registered before general /:id parameters)
router.get('/stats', authMiddleware, requireRole([Role.ADMIN, Role.COORDINATOR]), getApplicationStats);

// Administrative route to fetch application details (scoped by block for coordinators)
router.get('/:id', authMiddleware, requireRole([Role.ADMIN, Role.COORDINATOR]), getApplicationDetails);

// Administrative route to update application review status (scoped by block for coordinators)
router.patch('/:id/status', authMiddleware, requireRole([Role.ADMIN, Role.COORDINATOR]), updateApplicationStatus);

// Public portal authenticated application submission and retrieval routes
router.post(
  '/apply',
  publicAuthMiddleware,
  upload.fields([
    { name: 'aadhaar', maxCount: 1 },
    { name: 'pan', maxCount: 1 },
    { name: 'photo', maxCount: 1 },
    { name: 'passbook', maxCount: 1 }
  ]),
  applyShareholderApplication
);

router.get('/my-application', publicAuthMiddleware, getMyApplication);

export default router;
