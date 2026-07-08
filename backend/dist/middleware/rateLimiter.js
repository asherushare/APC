"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginEmailLimiter = exports.loginIpLimiter = exports.forgotPasswordIpLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("../config/env");
// Rate limiter for forgot-password requests: max 3 requests per 15 minutes per IP
exports.forgotPasswordIpLimiter = (0, express_rate_limit_1.default)({
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
exports.loginIpLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => env_1.env.NODE_ENV !== 'production' && req.headers['x-bypass-rate-limit'] === 'true',
    message: {
        success: false,
        error: {
            code: 'TOO_MANY_LOGIN_ATTEMPTS_IP',
            message: 'Too many login attempts from this IP. Please try again after 15 minutes.',
        },
    },
});
// Rate limiter by Email: max 5 login requests per 15-minute window per email address
exports.loginEmailLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        const email = req.body?.email || '';
        return email.trim().toLowerCase();
    },
    skip: (req) => (env_1.env.NODE_ENV !== 'production' && req.headers['x-bypass-rate-limit'] === 'true') || !req.body?.email,
    message: {
        success: false,
        error: {
            code: 'TOO_MANY_LOGIN_ATTEMPTS_EMAIL',
            message: 'Too many login attempts for this email address. Please try again after 15 minutes.',
        },
    },
});
