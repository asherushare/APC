"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAuditLogs = void 0;
const client_1 = require("@prisma/client");
const db_1 = require("../config/db");
const admin_1 = require("../schemas/admin");
const errors_1 = require("../utils/errors");
/**
 * GET /api/v1/audit-logs
 * Retrieve system audit logs with pagination and filters.
 * Admins can access all logs; coordinators are scoped to their block and their own logs.
 */
const listAuditLogs = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errors_1.ForbiddenError('Authentication required to list audit logs', 'AUTHENTICATION_REQUIRED');
        }
        // Validate query parameters
        const parsed = admin_1.AuditLogQuerySchema.safeParse(req.query);
        if (!parsed.success) {
            throw new errors_1.ValidationError('Validation failed', parsed.error.format());
        }
        const { page, limit, action, targetEntity, targetId, userId } = parsed.data;
        const whereClause = {};
        if (action)
            whereClause.action = action;
        if (targetEntity)
            whereClause.targetEntity = targetEntity;
        if (targetId)
            whereClause.targetId = targetId;
        if (userId)
            whereClause.userId = userId;
        if (req.user.role === client_1.Role.COORDINATOR) {
            const coordinator = await db_1.prisma.user.findUnique({
                where: { id: req.user.id },
            });
            if (!coordinator || !coordinator.block) {
                // If the coordinator has no block assigned, they can only view logs they generated
                whereClause.userId = req.user.id;
            }
            else {
                // Fetch application IDs belonging to the coordinator's block
                const blockApps = await db_1.prisma.shareholderApplication.findMany({
                    where: { block: coordinator.block, deletedAt: null },
                    select: { id: true },
                });
                const blockAppIds = blockApps.map((a) => a.id);
                // Fetch document IDs belonging to the block applications
                const blockDocs = await db_1.prisma.document.findMany({
                    where: { applicationId: { in: blockAppIds }, deletedAt: null },
                    select: { id: true },
                });
                const blockDocIds = blockDocs.map((d) => d.id);
                // Coordinator is restricted to:
                // - Logs they generated themselves
                // - Logs targeting shareholder applications in their block
                // - Logs targeting documents in their block
                whereClause.AND = [
                    {
                        OR: [
                            { userId: req.user.id },
                            {
                                targetEntity: 'ShareholderApplication',
                                targetId: { in: blockAppIds },
                            },
                            {
                                targetEntity: 'Document',
                                targetId: { in: blockDocIds },
                            },
                        ],
                    },
                ];
            }
        }
        else if (req.user.role !== client_1.Role.ADMIN) {
            throw new errors_1.ForbiddenError('You do not have permission to view audit logs', 'INSUFFICIENT_PERMISSIONS');
        }
        const skip = (page - 1) * limit;
        const [total, logs] = await Promise.all([
            db_1.prisma.auditLog.count({ where: whereClause }),
            db_1.prisma.auditLog.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            fullName: true,
                            role: true,
                        },
                    },
                },
            }),
        ]);
        res.status(200).json({
            success: true,
            logs,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.listAuditLogs = listAuditLogs;
