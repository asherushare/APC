"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCoordinator = exports.updateCoordinator = exports.createCoordinator = exports.listCoordinators = void 0;
const zod_1 = require("zod");
const db_1 = require("../config/db");
const auth_1 = require("../utils/auth");
const errors_1 = require("../utils/errors");
const client_1 = require("@prisma/client");
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
const CoordinatorQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(10),
    search: zod_1.z.string().trim().optional(),
    block: zod_1.z.string().trim().optional(),
});
const CreateCoordinatorSchema = zod_1.z.object({
    fullName: zod_1.z.string().trim().min(1, 'Full name is required').max(100),
    email: zod_1.z.string().trim().email('Invalid email address'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters long'),
    phoneNumber: zod_1.z.string().trim().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits').optional().nullable(),
    block: zod_1.z.string().trim().min(1, 'Assigned block is required'),
});
const UpdateCoordinatorSchema = zod_1.z.object({
    fullName: zod_1.z.string().trim().min(1, 'Full name is required').max(100).optional(),
    phoneNumber: zod_1.z.string().trim().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits').optional().nullable(),
    block: zod_1.z.string().trim().min(1, 'Assigned block is required').optional(),
});
/**
 * GET /api/v1/users
 * Lists coordinators (Admin only).
 */
const listCoordinators = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== client_1.Role.ADMIN) {
            throw new errors_1.ForbiddenError('Only administrators can manage coordinators', 'INSUFFICIENT_PERMISSIONS');
        }
        const queryData = { ...req.query };
        if (queryData.page === undefined || queryData.page === '') {
            queryData.page = 1;
        }
        else if (typeof queryData.page === 'string') {
            queryData.page = parseInt(queryData.page, 10);
        }
        if (queryData.limit === undefined || queryData.limit === '') {
            queryData.limit = 10;
        }
        else if (typeof queryData.limit === 'string') {
            queryData.limit = parseInt(queryData.limit, 10);
        }
        if (queryData.block === '') {
            delete queryData.block;
        }
        if (queryData.search === '') {
            delete queryData.search;
        }
        const parsed = CoordinatorQuerySchema.safeParse(queryData);
        if (!parsed.success) {
            throw new errors_1.ValidationError('Validation failed', parsed.error.format());
        }
        const { page, limit, search, block } = parsed.data;
        const whereClause = {
            role: client_1.Role.COORDINATOR,
            deletedAt: null,
        };
        if (block) {
            whereClause.block = block;
        }
        if (search) {
            whereClause.OR = [
                { fullName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [coordinators, total] = await Promise.all([
            db_1.prisma.user.findMany({
                where: whereClause,
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phoneNumber: true,
                    block: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            db_1.prisma.user.count({ where: whereClause }),
        ]);
        res.status(200).json({
            success: true,
            coordinators,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit) || 1,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.listCoordinators = listCoordinators;
/**
 * POST /api/v1/users
 * Creates a coordinator (Admin only).
 */
const createCoordinator = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== client_1.Role.ADMIN) {
            throw new errors_1.ForbiddenError('Only administrators can manage coordinators', 'INSUFFICIENT_PERMISSIONS');
        }
        const parsed = CreateCoordinatorSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new errors_1.ValidationError('Validation failed', parsed.error.format());
        }
        const { fullName, email, password, phoneNumber, block } = parsed.data;
        // Email unique check
        const existing = await db_1.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (existing) {
            throw new errors_1.BadRequestError('A user with this email address already exists', 'EMAIL_ALREADY_EXISTS');
        }
        // Password regex complexity validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._\-#+^=])[A-Za-z\d@$!%*?&._\-#+^=]{8,}$/;
        if (!passwordRegex.test(password)) {
            throw new errors_1.BadRequestError('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.', 'WEAK_PASSWORD');
        }
        // Hash password with Argon2
        const passwordHash = await (0, auth_1.hashPassword)(password);
        const coordinator = await db_1.prisma.user.create({
            data: {
                fullName,
                email: email.toLowerCase(),
                passwordHash,
                phoneNumber: phoneNumber || null,
                block,
                role: client_1.Role.COORDINATOR,
            },
            select: {
                id: true,
                fullName: true,
                email: true,
                phoneNumber: true,
                block: true,
                createdAt: true,
            },
        });
        await recordAuditLog(req.user.id, 'COORDINATOR_CREATED', 'User', coordinator.id, req);
        res.status(201).json({
            success: true,
            coordinator,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createCoordinator = createCoordinator;
/**
 * PATCH /api/v1/users/:id
 * Updates coordinator profile properties (Admin only).
 */
const updateCoordinator = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== client_1.Role.ADMIN) {
            throw new errors_1.ForbiddenError('Only administrators can manage coordinators', 'INSUFFICIENT_PERMISSIONS');
        }
        const { id } = req.params;
        const parsed = UpdateCoordinatorSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new errors_1.ValidationError('Validation failed', parsed.error.format());
        }
        const coordinator = await db_1.prisma.user.findFirst({
            where: { id, role: client_1.Role.COORDINATOR, deletedAt: null },
        });
        if (!coordinator) {
            throw new errors_1.NotFoundError('Coordinator profile not found', 'COORDINATOR_NOT_FOUND');
        }
        const { fullName, phoneNumber, block } = parsed.data;
        const before = {
            fullName: coordinator.fullName,
            phoneNumber: coordinator.phoneNumber,
            block: coordinator.block,
        };
        const updated = await db_1.prisma.user.update({
            where: { id: coordinator.id },
            data: {
                fullName: fullName !== undefined ? fullName : undefined,
                phoneNumber: phoneNumber !== undefined ? phoneNumber : undefined,
                block: block !== undefined ? block : undefined,
            },
            select: {
                id: true,
                fullName: true,
                email: true,
                phoneNumber: true,
                block: true,
                createdAt: true,
            },
        });
        const changes = {
            before,
            after: {
                fullName: updated.fullName,
                phoneNumber: updated.phoneNumber,
                block: updated.block,
            },
        };
        await recordAuditLog(req.user.id, 'COORDINATOR_UPDATED', 'User', updated.id, req, changes);
        res.status(200).json({
            success: true,
            coordinator: updated,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateCoordinator = updateCoordinator;
/**
 * DELETE /api/v1/users/:id
 * Soft deletes a coordinator profile (Admin only).
 */
const deleteCoordinator = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== client_1.Role.ADMIN) {
            throw new errors_1.ForbiddenError('Only administrators can manage coordinators', 'INSUFFICIENT_PERMISSIONS');
        }
        const { id } = req.params;
        const coordinator = await db_1.prisma.user.findFirst({
            where: { id, role: client_1.Role.COORDINATOR, deletedAt: null },
        });
        if (!coordinator) {
            throw new errors_1.NotFoundError('Coordinator profile not found', 'COORDINATOR_NOT_FOUND');
        }
        // Transaction to soft delete and revoke active sessions
        await db_1.prisma.$transaction([
            db_1.prisma.user.update({
                where: { id: coordinator.id },
                data: { deletedAt: new Date() },
            }),
            db_1.prisma.refreshToken.updateMany({
                where: { userId: coordinator.id },
                data: { revoked: true },
            }),
        ]);
        await recordAuditLog(req.user.id, 'COORDINATOR_DELETED', 'User', coordinator.id, req);
        res.status(200).json({
            success: true,
            message: 'Coordinator account successfully deactivated',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCoordinator = deleteCoordinator;
