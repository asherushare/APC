"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_1 = require("../controllers/auth");
const auth_2 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Rate limiter by IP: max 5 login requests per 15-minute window
const loginIpLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: {
            code: 'TOO_MANY_LOGIN_ATTEMPTS_IP',
            message: 'Too many login attempts from this IP. Please try again after 15 minutes.',
        },
    },
});
// Rate limiter by Email: max 5 login requests per 15-minute window per email address
const loginEmailLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        const email = req.body?.email || '';
        return email.trim().toLowerCase();
    },
    skip: (req) => !req.body?.email,
    message: {
        success: false,
        error: {
            code: 'TOO_MANY_LOGIN_ATTEMPTS_EMAIL',
            message: 'Too many login attempts for this email address. Please try again after 15 minutes.',
        },
    },
});
router.post('/login', loginIpLimiter, loginEmailLimiter, auth_1.login);
router.post('/refresh', auth_1.refresh);
router.post('/logout', auth_1.logout);
router.get('/me', auth_2.authMiddleware, auth_1.me);
exports.default = router;
