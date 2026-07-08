import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

// Rate limiter for forgot-password requests: max 3 requests per 15 minutes per IP
export const forgotPasswordIpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many password reset requests from this IP. Please try again after 15 minutes.',
    },
  },
});

// Rate limiter by IP: max 5 login requests per 15-minute window
export const loginIpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => env.NODE_ENV !== 'production' && req.headers['x-bypass-rate-limit'] === 'true',
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_LOGIN_ATTEMPTS_IP',
      message: 'Too many login attempts from this IP. Please try again after 15 minutes.',
    },
  },
});

// Rate limiter by Email: max 5 login requests per 15-minute window per email address
export const loginEmailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = req.body?.email || '';
    return email.trim().toLowerCase();
  },
  skip: (req) => (env.NODE_ENV !== 'production' && req.headers['x-bypass-rate-limit'] === 'true') || !req.body?.email,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_LOGIN_ATTEMPTS_EMAIL',
      message: 'Too many login attempts for this email address. Please try again after 15 minutes.',
    },
  },
});
