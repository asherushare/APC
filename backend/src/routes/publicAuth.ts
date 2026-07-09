import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, refresh, logout, me, forgotPassword, resetPassword } from '../controllers/publicAuth';
import { publicAuthMiddleware } from '../middleware/publicAuth';
import { forgotPasswordIpLimiter } from '../middleware/rateLimiter';

const router = Router();

// Rate limiter for registration requests: max 5 requests per 15 minutes per IP
const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REGISTRATIONS',
      message: 'Too many accounts created from this IP. Please try again after 15 minutes.',
    },
  },
});

// Rate limiter for login requests: max 10 requests per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_LOGIN_ATTEMPTS',
      message: 'Too many login attempts. Please try again after 15 minutes.',
    },
  },
});

router.post('/register', registrationLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', publicAuthMiddleware, me);
router.post('/forgot-password', forgotPasswordIpLimiter, forgotPassword);
router.post('/reset-password', forgotPasswordIpLimiter, resetPassword);

export default router;
