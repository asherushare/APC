"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.authMiddleware = void 0;
const auth_1 = require("../utils/auth");
const errors_1 = require("../utils/errors");
/**
 * Middleware to authenticate requests using JWT Access Tokens in the Authorization header.
 */
const authMiddleware = (req, _res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new errors_1.UnauthorizedError('Access token is required', 'ACCESS_TOKEN_REQUIRED');
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = (0, auth_1.verifyAccessToken)(token);
        req.user = {
            id: payload.userId,
            email: payload.email,
            role: payload.role,
        };
        next();
    }
    catch (error) {
        throw new errors_1.UnauthorizedError('Invalid or expired access token', 'INVALID_ACCESS_TOKEN');
    }
};
exports.authMiddleware = authMiddleware;
/**
 * Middleware factory to authorize access based on user roles.
 */
const requireRole = (allowedRoles) => {
    return (req, _res, next) => {
        if (!req.user) {
            throw new errors_1.UnauthorizedError('Authentication required', 'AUTHENTICATION_REQUIRED');
        }
        if (!allowedRoles.includes(req.user.role)) {
            throw new errors_1.ForbiddenError('You do not have permission to perform this action', 'INSUFFICIENT_PERMISSIONS');
        }
        next();
    };
};
exports.requireRole = requireRole;
