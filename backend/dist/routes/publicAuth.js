"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const publicAuth_1 = require("../controllers/publicAuth");
const publicAuth_2 = require("../middleware/publicAuth");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = (0, express_1.Router)();
// Rate limiter for registration requests: max 5 requests per 15 minutes per IP
const registrationLimiter = (0, express_rate_limit_1.default)({
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
const loginLimiter = (0, express_rate_limit_1.default)({
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
router.post('/register', registrationLimiter, publicAuth_1.register);
router.post('/login', loginLimiter, publicAuth_1.login);
router.post('/refresh', publicAuth_1.refresh);
router.post('/logout', publicAuth_1.logout);
router.get('/me', publicAuth_2.publicAuthMiddleware, publicAuth_1.me);
router.post('/forgot-password', rateLimiter_1.forgotPasswordIpLimiter, publicAuth_1.forgotPassword);
router.post('/reset-password', rateLimiter_1.forgotPasswordIpLimiter, publicAuth_1.resetPassword);
exports.default = router;
