"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = exports.logout = exports.refresh = exports.login = void 0;
const client_1 = require("@prisma/client");
const db_1 = require("../config/db");
const logger_1 = require("../utils/logger");
const env_1 = require("../config/env");
const auth_1 = require("../utils/auth");
const errors_1 = require("../utils/errors");
/**
 * Helper to record audit logs.
 */
async function recordAuditLog(userId, action, targetEntity, targetId, req, changes) {
    try {
        await db_1.prisma.auditLog.create({
            data: {
                userId,
                action,
                targetEntity,
                targetId,
                ipAddress: req.ip || null,
                userAgent: req.headers['user-agent'] || null,
                changes: changes !== undefined ? changes : client_1.Prisma.DbNull,
            },
        });
    }
    catch (error) {
        logger_1.logger.error(`Failed to record audit log for action ${action}: ${error}`);
    }
}
/**
 * POST /api/v1/auth/login
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new errors_1.BadRequestError('Email and password are required', 'EMAIL_PASSWORD_REQUIRED');
        }
        const user = await db_1.prisma.user.findUnique({
            where: { email: email.trim().toLowerCase() },
        });
        if (!user || user.deletedAt) {
            // Record failed attempt for auditing
            await recordAuditLog(null, 'LOGIN_FAILED', 'User', 'unknown', req, { email });
            throw new errors_1.UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
        }
        const isPasswordValid = await (0, auth_1.verifyPassword)(password, user.passwordHash);
        if (!isPasswordValid) {
            await recordAuditLog(user.id, 'LOGIN_FAILED', 'User', user.id, req);
            throw new errors_1.UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
        }
        // Progressive Migration: Upgrade legacy Bcrypt hashes to Argon2id
        const isBcrypt = user.passwordHash.startsWith('$2a$') ||
            user.passwordHash.startsWith('$2b$') ||
            user.passwordHash.startsWith('$2y$');
        if (isBcrypt) {
            try {
                const newArgonHash = await (0, auth_1.hashPassword)(password);
                await db_1.prisma.user.update({
                    where: { id: user.id },
                    data: { passwordHash: newArgonHash },
                });
                logger_1.logger.info(`Successfully migrated user password hash to Argon2id for: ${user.email}`);
            }
            catch (hashError) {
                logger_1.logger.error(`Failed to upgrade password hash to Argon2id for user ${user.id}: ${hashError}`);
            }
        }
        // Generate token payloads
        const payload = { userId: user.id, email: user.email, role: user.role };
        const accessToken = (0, auth_1.generateAccessToken)(payload);
        const refreshToken = (0, auth_1.generateRefreshToken)(payload);
        // Save refresh token in database (SHA-256 hash)
        const tokenHash = (0, auth_1.hashRefreshToken)(refreshToken);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        await db_1.prisma.refreshToken.create({
            data: {
                tokenHash,
                userId: user.id,
                expiresAt,
            },
        });
        // Write audit log
        await recordAuditLog(user.id, 'LOGIN_SUCCESS', 'User', user.id, req);
        // Set refresh token in HTTP-only cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: env_1.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({
            success: true,
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                block: user.block,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
/**
 * POST /api/v1/auth/refresh
 */
const refresh = async (req, res, next) => {
    try {
        const incomingToken = req.cookies?.refreshToken;
        if (!incomingToken) {
            throw new errors_1.UnauthorizedError('Refresh token is required', 'REFRESH_TOKEN_REQUIRED');
        }
        let payload;
        try {
            payload = (0, auth_1.verifyRefreshToken)(incomingToken);
        }
        catch (verifyError) {
            throw new errors_1.UnauthorizedError('Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN');
        }
        const tokenHash = (0, auth_1.hashRefreshToken)(incomingToken);
        // Check database for active token
        const storedToken = await db_1.prisma.refreshToken.findUnique({
            where: { tokenHash },
        });
        // Token reuse detection (RTR)
        if (storedToken && storedToken.revoked) {
            // Revoke all tokens for this user immediately (token theft mitigation)
            await db_1.prisma.refreshToken.updateMany({
                where: { userId: storedToken.userId },
                data: { revoked: true },
            });
            await recordAuditLog(storedToken.userId, 'TOKEN_REUSE_DETECTED', 'User', storedToken.userId, req, {
                tokenHash,
            });
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: env_1.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
            });
            throw new errors_1.UnauthorizedError('Token reuse detected. All active sessions have been terminated.', 'TOKEN_REUSE_DETECTED');
        }
        if (!storedToken) {
            throw new errors_1.UnauthorizedError('Invalid refresh token', 'INVALID_REFRESH_TOKEN');
        }
        if (new Date() > storedToken.expiresAt) {
            throw new errors_1.UnauthorizedError('Refresh token is expired', 'REFRESH_TOKEN_EXPIRED');
        }
        // Revoke the old token
        await db_1.prisma.refreshToken.update({
            where: { id: storedToken.id },
            data: { revoked: true },
        });
        // Generate new token pair
        const tokenPayload = { userId: payload.userId, email: payload.email, role: payload.role };
        const newAccessToken = (0, auth_1.generateAccessToken)(tokenPayload);
        const newRefreshToken = (0, auth_1.generateRefreshToken)(tokenPayload);
        // Persist new refresh token
        const newHash = (0, auth_1.hashRefreshToken)(newRefreshToken);
        const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await db_1.prisma.refreshToken.create({
            data: {
                tokenHash: newHash,
                userId: payload.userId,
                expiresAt: newExpiresAt,
            },
        });
        // Audit token refresh
        await recordAuditLog(payload.userId, 'TOKEN_REFRESH', 'User', payload.userId, req);
        // Send new refresh token in cookie
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: env_1.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({
            success: true,
            accessToken: newAccessToken,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.refresh = refresh;
/**
 * POST /api/v1/auth/logout
 */
const logout = async (req, res, next) => {
    try {
        const incomingToken = req.cookies?.refreshToken;
        if (incomingToken) {
            const tokenHash = (0, auth_1.hashRefreshToken)(incomingToken);
            const storedToken = await db_1.prisma.refreshToken.findUnique({
                where: { tokenHash },
            });
            if (storedToken) {
                // Revoke token
                await db_1.prisma.refreshToken.update({
                    where: { id: storedToken.id },
                    data: { revoked: true },
                });
                await recordAuditLog(storedToken.userId, 'LOGOUT', 'User', storedToken.userId, req);
            }
        }
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: env_1.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
        });
        res.status(200).json({
            success: true,
            message: 'Logged out successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
/**
 * GET /api/v1/auth/me
 */
const me = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errors_1.UnauthorizedError('Not authenticated', 'AUTHENTICATION_REQUIRED');
        }
        const user = await db_1.prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                block: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            throw new errors_1.NotFoundError('User not found', 'USER_NOT_FOUND');
        }
        res.status(200).json({
            success: true,
            user,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.me = me;
