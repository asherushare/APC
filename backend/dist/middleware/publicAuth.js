"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicAuthMiddleware = void 0;
const auth_1 = require("../utils/auth");
const errors_1 = require("../utils/errors");
/**
 * Middleware to authenticate public users (farmers/producers).
 * Validates JWT access tokens containing the 'PUBLIC_USER' scoped role.
 */
const publicAuthMiddleware = (req, _res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new errors_1.UnauthorizedError('Access token is required', 'ACCESS_TOKEN_REQUIRED');
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = (0, auth_1.verifyAccessToken)(token);
        // Segregate public user accounts from administrator privileges
        if (payload.role !== 'PUBLIC_USER') {
            throw new errors_1.UnauthorizedError('Invalid access token role scope', 'INVALID_TOKEN_SCOPE');
        }
        req.publicUser = {
            id: payload.userId,
            phoneNumber: payload.phoneNumber,
        };
        next();
    }
    catch (error) {
        throw new errors_1.UnauthorizedError('Invalid or expired access token', 'INVALID_ACCESS_TOKEN');
    }
};
exports.publicAuthMiddleware = publicAuthMiddleware;
