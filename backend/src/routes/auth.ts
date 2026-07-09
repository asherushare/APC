import { Router } from 'express';
import { login, refresh, logout, me, forgotPassword, resetPassword } from '../controllers/auth';
import { authMiddleware } from '../middleware/auth';
import {
  loginIpLimiter,
  loginEmailLimiter,
  forgotPasswordIpLimiter,
} from '../middleware/rateLimiter';

const router = Router();

router.post('/login', loginIpLimiter, loginEmailLimiter, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authMiddleware, me);
router.post('/forgot-password', forgotPasswordIpLimiter, forgotPassword);
router.post('/reset-password', forgotPasswordIpLimiter, resetPassword);

export default router;
