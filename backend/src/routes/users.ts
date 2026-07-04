import { Router } from 'express';
import { Role } from '@prisma/client';
import {
  listCoordinators,
  createCoordinator,
  updateCoordinator,
  deleteCoordinator,
} from '../controllers/adminUsers';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

// Apply auth limits - Admin role strictly required for all coordinator management operations
router.use(authMiddleware);
router.use(requireRole([Role.ADMIN]));

router.get('/', listCoordinators);
router.post('/', createCoordinator);
router.patch('/:id', updateCoordinator);
router.delete('/:id', deleteCoordinator);

export default router;
