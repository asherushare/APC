"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.me = exports.logout = exports.refresh = exports.login = void 0;
const client_1 = require("@prisma/client");
const crypto_1 = __importDefault(require("crypto"));
const db_1 = require("../config/db");
const logger_1 = require("../utils/logger");
const env_1 = require("../config/env");
const email_1 = require("../utils/email");
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
        const { email, password, rememberMe } = req.body;
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
        // Check account lockout
        if (user.lockoutUntil && user.lockoutUntil > new Date()) {
            await recordAuditLog(user.id, 'LOGIN_FAILED', 'User', user.id, req, { reason: 'Account locked out' });
            throw new errors_1.ForbiddenError('Account is temporarily locked due to repeated failed login attempts. Please try again later.', 'ACCOUNT_LOCKED');
        }
        const isPasswordValid = await (0, auth_1.verifyPassword)(password, user.passwordHash);
        if (!isPasswordValid) {
            const attempts = user.loginAttempts + 1;
            const lockoutUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
            await db_1.prisma.user.update({
                where: { id: user.id },
                data: {
                    loginAttempts: attempts,
                    lockoutUntil,
                },
            });
            if (lockoutUntil) {
                await recordAuditLog(user.id, 'ACCOUNT_LOCKED', 'User', user.id, req, { attempts });
            }
            await recordAuditLog(user.id, 'LOGIN_FAILED', 'User', user.id, req, { attempts });
            throw new errors_1.UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
        }
        // Reset login attempts on success
        if (user.loginAttempts > 0 || user.lockoutUntil) {
            await db_1.prisma.user.update({
                where: { id: user.id },
                data: {
                    loginAttempts: 0,
                    lockoutUntil: null,
                },
            });
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
        // Remember Me support: 14 days vs 1 day
        const maxAge = rememberMe ? 14 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
        const expiresAt = new Date(Date.now() + maxAge);
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
            sameSite: env_1.env.NODE_ENV === 'production' ? 'none' : 'strict',
            path: '/',
            maxAge,
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
                sameSite: env_1.env.NODE_ENV === 'production' ? 'none' : 'strict',
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
            sameSite: env_1.env.NODE_ENV === 'production' ? 'none' : 'strict',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({
            success: true,
            accessToken: newAccessToken,
        });
    }
    catch (error) {
        // If refresh token fails validation, clear cookie so browser client stops looping/redirecting
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: env_1.env.NODE_ENV === 'production',
            sameSite: env_1.env.NODE_ENV === 'production' ? 'none' : 'strict',
            path: '/',
        });
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
            sameSite: env_1.env.NODE_ENV === 'production' ? 'none' : 'strict',
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
/**
 * POST /api/v1/auth/forgot-password
 */
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            throw new errors_1.BadRequestError('Email is required', 'EMAIL_REQUIRED');
        }
        const user = await db_1.prisma.user.findUnique({
            where: { email: email.trim().toLowerCase() },
        });
        // User enumeration protection: return success even if user not found
        if (!user || user.deletedAt) {
            await recordAuditLog(null, 'PASSWORD_RESET_REQUESTED_UNKNOWN', 'User', 'unknown', req, { email });
            res.status(200).json({
                success: true,
                message: 'If your email is registered with us, a password reset link has been sent.',
            });
            return;
        }
        // Cooldown check: 60-second limit per user email
        const lastToken = await db_1.prisma.passwordResetToken.findFirst({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
        });
        if (lastToken && (Date.now() - lastToken.createdAt.getTime() < 60 * 1000)) {
            throw new errors_1.TooManyRequestsError('A password reset link was recently requested. Please wait 60 seconds before trying again.', 'RESET_COOLDOWN');
        }
        // Generate token
        const token = crypto_1.default.randomBytes(32).toString('hex');
        const tokenHash = crypto_1.default.createHash('sha256').update(token).digest('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        // Persist token hash
        await db_1.prisma.passwordResetToken.create({
            data: {
                tokenHash,
                userId: user.id,
                expiresAt,
            },
        });
        // Send reset link
        const resetLink = `${env_1.env.FRONTEND_URL}/admin/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;
        await email_1.emailService.sendPasswordResetEmail(user.email, resetLink, user.fullName);
        // Audit request
        await recordAuditLog(user.id, 'PASSWORD_RESET_REQUESTED', 'User', user.id, req);
        res.status(200).json({
            success: true,
            message: 'If your email is registered with us, a password reset link has been sent.',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.forgotPassword = forgotPassword;
/**
 * POST /api/v1/auth/reset-password
 */
const resetPassword = async (req, res, next) => {
    try {
        const { email, token, password } = req.body;
        if (!email || !token || !password) {
            throw new errors_1.BadRequestError('Email, token, and password are required', 'MISSING_FIELDS');
        }
        const user = await db_1.prisma.user.findUnique({
            where: { email: email.trim().toLowerCase() },
        });
        if (!user || user.deletedAt) {
            throw new errors_1.BadRequestError('Invalid reset request', 'INVALID_RESET_REQUEST');
        }
        // Validate password strength: min 8 characters, min 1 uppercase, 1 lowercase, 1 number, 1 special character
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            throw new errors_1.BadRequestError('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.', 'WEAK_PASSWORD');
        }
        // Verify token
        const tokenHash = crypto_1.default.createHash('sha256').update(token).digest('hex');
        const storedToken = await db_1.prisma.passwordResetToken.findUnique({
            where: { tokenHash },
        });
        if (!storedToken || storedToken.userId !== user.id || storedToken.used || storedToken.expiresAt < new Date()) {
            throw new errors_1.UnauthorizedError('Invalid or expired reset token', 'INVALID_RESET_TOKEN');
        }
        // Hash password with Argon2id
        const newHash = await (0, auth_1.hashPassword)(password);
        // Update password hash, reset lockout, and mark token used in a transaction
        await db_1.prisma.$transaction([
            db_1.prisma.user.update({
                where: { id: user.id },
                data: {
                    passwordHash: newHash,
                    loginAttempts: 0,
                    lockoutUntil: null,
                },
            }),
            db_1.prisma.passwordResetToken.update({
                where: { id: storedToken.id },
                data: { used: true },
            }),
            // Revoke all refresh tokens for session flush
            db_1.prisma.refreshToken.updateMany({
                where: { userId: user.id },
                data: { revoked: true },
            }),
        ]);
        // Record audit events
        await recordAuditLog(user.id, 'SESSION_REVOKED', 'User', user.id, req, { reason: 'Password reset' });
        await recordAuditLog(user.id, 'PASSWORD_RESET_SUCCESS', 'User', user.id, req);
        // Send confirmation email
        await email_1.emailService.sendPasswordResetConfirmationEmail(user.email, user.fullName);
        res.status(200).json({
            success: true,
            message: 'Password reset successfully.',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.resetPassword = resetPassword;
