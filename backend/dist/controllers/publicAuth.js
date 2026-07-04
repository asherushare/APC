"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.me = exports.logout = exports.refresh = exports.login = exports.register = exports.PublicLoginSchema = exports.PublicRegisterSchema = void 0;
const zod_1 = require("zod");
const crypto_1 = __importDefault(require("crypto"));
const db_1 = require("../config/db");
const auth_1 = require("../utils/auth");
const errors_1 = require("../utils/errors");
const email_1 = require("../utils/email");
const env_1 = require("../config/env");
/**
 * Helper to record audit logs.
 */
async function recordAuditLog(userId, action, targetEntity, targetId, req, 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
changes) {
    try {
        await db_1.prisma.auditLog.create({
            data: {
                userId,
                action,
                targetEntity,
                targetId,
                ipAddress: req.ip || null,
                userAgent: req.headers['user-agent'] || null,
                changes: changes !== undefined ? changes : null,
            },
        });
    }
    catch (error) {
        // Fail silently
    }
}
const isProd = process.env.NODE_ENV === 'production';
// Validation schemas
exports.PublicRegisterSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(1, 'Full name is required').max(100),
    phoneNumber: zod_1.z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters long'),
    email: zod_1.z.string().email('Invalid email address').optional().or(zod_1.z.string().length(0)),
});
exports.PublicLoginSchema = zod_1.z.object({
    phoneNumber: zod_1.z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
/**
 * POST /api/v1/public-auth/register
 */
const register = async (req, res, next) => {
    try {
        const parsed = exports.PublicRegisterSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new errors_1.ValidationError('Validation failed', parsed.error.format());
        }
        const { fullName, phoneNumber, password, email } = parsed.data;
        // Check duplicate phone number
        const existingPhone = await db_1.prisma.publicUser.findUnique({
            where: { phoneNumber },
        });
        if (existingPhone) {
            throw new errors_1.BadRequestError('Phone number already registered', 'PHONE_ALREADY_REGISTERED');
        }
        // Check duplicate email if provided
        if (email) {
            const existingEmail = await db_1.prisma.publicUser.findUnique({
                where: { email: email.trim().toLowerCase() },
            });
            if (existingEmail) {
                throw new errors_1.BadRequestError('Email address already registered', 'EMAIL_ALREADY_REGISTERED');
            }
        }
        // Hash password
        const passwordHash = await (0, auth_1.hashPassword)(password);
        // Create user
        const publicUser = await db_1.prisma.publicUser.create({
            data: {
                fullName: fullName.trim(),
                phoneNumber,
                email: email ? email.trim().toLowerCase() : null,
                passwordHash,
            },
            select: {
                id: true,
                fullName: true,
                phoneNumber: true,
                email: true,
                verified: true,
                createdAt: true,
            },
        });
        await recordAuditLog(null, 'PUBLIC_USER_REGISTERED', 'PublicUser', publicUser.id, req, { phoneNumber });
        res.status(201).json({
            success: true,
            message: 'Account created successfully. You can now login.',
            user: publicUser,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
/**
 * POST /api/v1/public-auth/login
 */
const login = async (req, res, next) => {
    try {
        const parsed = exports.PublicLoginSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new errors_1.ValidationError('Validation failed', parsed.error.format());
        }
        const { phoneNumber, password } = parsed.data;
        const publicUser = await db_1.prisma.publicUser.findUnique({
            where: { phoneNumber },
        });
        if (!publicUser) {
            throw new errors_1.UnauthorizedError('Invalid credentials', 'INVALID_CREDENTIALS');
        }
        const isValid = await (0, auth_1.verifyPassword)(password, publicUser.passwordHash);
        if (!isValid) {
            throw new errors_1.UnauthorizedError('Invalid credentials', 'INVALID_CREDENTIALS');
        }
        // Create session token pair
        const tokenPayload = {
            userId: publicUser.id,
            email: publicUser.email || '',
            phoneNumber: publicUser.phoneNumber,
            role: 'PUBLIC_USER',
        };
        const accessToken = (0, auth_1.generateAccessToken)(tokenPayload);
        const refreshToken = (0, auth_1.generateRefreshToken)(tokenPayload);
        // Persist refresh token in db
        const tokenHash = (0, auth_1.hashRefreshToken)(refreshToken);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        await db_1.prisma.publicRefreshToken.create({
            data: {
                tokenHash,
                publicUserId: publicUser.id,
                expiresAt,
            },
        });
        await recordAuditLog(null, 'PUBLIC_USER_LOGIN', 'PublicUser', publicUser.id, req, { phoneNumber });
        // Set refresh token cookie
        res.cookie('publicRefreshToken', refreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'strict',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({
            success: true,
            accessToken,
            user: {
                id: publicUser.id,
                fullName: publicUser.fullName,
                phoneNumber: publicUser.phoneNumber,
                email: publicUser.email,
                verified: publicUser.verified,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
/**
 * POST /api/v1/public-auth/refresh
 */
const refresh = async (req, res, next) => {
    try {
        const incomingToken = req.cookies?.publicRefreshToken;
        if (!incomingToken) {
            throw new errors_1.UnauthorizedError('Refresh token required', 'REFRESH_TOKEN_REQUIRED');
        }
        const tokenHash = (0, auth_1.hashRefreshToken)(incomingToken);
        // Retrieve active stored token
        const storedToken = await db_1.prisma.publicRefreshToken.findUnique({
            where: { tokenHash },
            include: { publicUser: true },
        });
        if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
            throw new errors_1.UnauthorizedError('Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN');
        }
        // Revoke old token
        await db_1.prisma.publicRefreshToken.update({
            where: { id: storedToken.id },
            data: { revoked: true },
        });
        const publicUser = storedToken.publicUser;
        // Create new session token pair
        const tokenPayload = {
            userId: publicUser.id,
            email: publicUser.email || '',
            phoneNumber: publicUser.phoneNumber,
            role: 'PUBLIC_USER',
        };
        const newAccessToken = (0, auth_1.generateAccessToken)(tokenPayload);
        const newRefreshToken = (0, auth_1.generateRefreshToken)(tokenPayload);
        // Persist new refresh token
        const newHash = (0, auth_1.hashRefreshToken)(newRefreshToken);
        const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await db_1.prisma.publicRefreshToken.create({
            data: {
                tokenHash: newHash,
                publicUserId: publicUser.id,
                expiresAt: newExpiresAt,
            },
        });
        // Send new refresh token in cookie
        res.cookie('publicRefreshToken', newRefreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'strict',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({
            success: true,
            accessToken: newAccessToken,
        });
    }
    catch (error) {
        // Clear cookies on failure
        res.clearCookie('publicRefreshToken', {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'strict',
            path: '/',
        });
        next(error);
    }
};
exports.refresh = refresh;
/**
 * POST /api/v1/public-auth/logout
 */
const logout = async (req, res, next) => {
    try {
        const incomingToken = req.cookies?.publicRefreshToken;
        if (incomingToken) {
            const tokenHash = (0, auth_1.hashRefreshToken)(incomingToken);
            const storedToken = await db_1.prisma.publicRefreshToken.findUnique({
                where: { tokenHash },
            });
            if (storedToken) {
                await db_1.prisma.publicRefreshToken.update({
                    where: { id: storedToken.id },
                    data: { revoked: true },
                });
                await recordAuditLog(null, 'PUBLIC_USER_LOGOUT', 'PublicUser', storedToken.publicUserId, req);
            }
        }
        res.clearCookie('publicRefreshToken', {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'strict',
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
 * GET /api/v1/public-auth/me
 */
const me = async (req, res, next) => {
    try {
        // Rely on publicAuthMiddleware to append publicUser to request
        if (!req.publicUser) {
            throw new errors_1.UnauthorizedError('Authentication required', 'AUTHENTICATION_REQUIRED');
        }
        const user = await db_1.prisma.publicUser.findUnique({
            where: { id: req.publicUser.id },
            select: {
                id: true,
                fullName: true,
                phoneNumber: true,
                email: true,
                verified: true,
                createdAt: true,
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
const PublicForgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().trim().email('Invalid email address'),
});
const PublicResetPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().trim().email('Invalid email address'),
    token: zod_1.z.string().min(1, 'Token is required'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters long'),
});
/**
 * POST /api/v1/public-auth/forgot-password
 */
const forgotPassword = async (req, res, next) => {
    try {
        const parsed = PublicForgotPasswordSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new errors_1.ValidationError('Validation failed', parsed.error.format());
        }
        const { email } = parsed.data;
        const user = await db_1.prisma.publicUser.findUnique({
            where: { email: email.toLowerCase() },
        });
        // Enforce user enumeration protection: return success even if user not found
        if (!user) {
            res.status(200).json({
                success: true,
                message: 'If your email is registered with us, a password reset link has been sent.',
            });
            return;
        }
        // Cooldown check: 60-second limit per user email
        if (user.resetPasswordToken &&
            user.updatedAt &&
            Date.now() - user.updatedAt.getTime() < 60 * 1000) {
            throw new errors_1.BadRequestError('A password reset link was recently requested. Please wait 60 seconds before trying again.', 'RESET_COOLDOWN');
        }
        // Generate crypto token
        const token = crypto_1.default.randomBytes(32).toString('hex');
        const tokenHash = crypto_1.default.createHash('sha256').update(token).digest('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        // Save token hash and expiry to database
        await db_1.prisma.publicUser.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: tokenHash,
                resetPasswordExpires: expiresAt,
            },
        });
        // Send reset link using emailService
        const resetLink = `${env_1.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;
        await email_1.emailService.sendPasswordResetEmail(user.email, resetLink, user.fullName);
        await recordAuditLog(user.id, 'PUBLIC_PASSWORD_RESET_REQUESTED', 'PublicUser', user.id, req);
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
 * POST /api/v1/public-auth/reset-password
 */
const resetPassword = async (req, res, next) => {
    try {
        const parsed = PublicResetPasswordSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new errors_1.ValidationError('Validation failed', parsed.error.format());
        }
        const { email, token, password } = parsed.data;
        const user = await db_1.prisma.publicUser.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (!user) {
            throw new errors_1.BadRequestError('Invalid reset request', 'INVALID_RESET_REQUEST');
        }
        // Validate password strength: min 8 characters, min 1 uppercase, 1 lowercase, 1 number, 1 special character
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            throw new errors_1.BadRequestError('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.', 'WEAK_PASSWORD');
        }
        // Verify token hash and expiry
        const tokenHash = crypto_1.default.createHash('sha256').update(token).digest('hex');
        if (!user.resetPasswordToken ||
            user.resetPasswordToken !== tokenHash ||
            !user.resetPasswordExpires ||
            user.resetPasswordExpires < new Date()) {
            throw new errors_1.UnauthorizedError('Invalid or expired reset token', 'INVALID_RESET_TOKEN');
        }
        // Hash password with Argon2id
        const newHash = await (0, auth_1.hashPassword)(password);
        // Update password hash, reset lockout, and clear token in a transaction
        await db_1.prisma.$transaction([
            db_1.prisma.publicUser.update({
                where: { id: user.id },
                data: {
                    passwordHash: newHash,
                    resetPasswordToken: null,
                    resetPasswordExpires: null,
                },
            }),
            // Revoke all refresh tokens for session flush
            db_1.prisma.publicRefreshToken.updateMany({
                where: { publicUserId: user.id },
                data: { revoked: true },
            }),
        ]);
        await recordAuditLog(user.id, 'PUBLIC_SESSION_REVOKED', 'PublicUser', user.id, req, {
            reason: 'Password reset',
        });
        await recordAuditLog(user.id, 'PUBLIC_PASSWORD_RESET_SUCCESS', 'PublicUser', user.id, req);
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
