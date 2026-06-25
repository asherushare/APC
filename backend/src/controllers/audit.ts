import { Request, Response, NextFunction } from 'express';
import { Prisma, Role } from '@prisma/client';
import { prisma } from '../config/db';
import { AuditLogQuerySchema } from '../schemas/admin';
import { ForbiddenError, ValidationError } from '../utils/errors';

/**
 * GET /api/v1/audit-logs
 * Retrieve system audit logs with pagination and filters.
 * Admins can access all logs; coordinators are scoped to their block and their own logs.
 */
export const listAuditLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError(
        'Authentication required to list audit logs',
        'AUTHENTICATION_REQUIRED'
      );
    }

    // Validate query parameters
    const parsed = AuditLogQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new ValidationError('Validation failed', parsed.error.format());
    }
    const { page, limit, action, targetEntity, targetId, userId } = parsed.data;

    const whereClause: Prisma.AuditLogWhereInput = {};

    if (action) whereClause.action = action;
    if (targetEntity) whereClause.targetEntity = targetEntity;
    if (targetId) whereClause.targetId = targetId;
    if (userId) whereClause.userId = userId;

    if (req.user.role === Role.COORDINATOR) {
      const coordinator = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      if (!coordinator || !coordinator.block) {
        // If the coordinator has no block assigned, they can only view logs they generated
        whereClause.userId = req.user.id;
      } else {
        // Fetch application IDs belonging to the coordinator's block
        const blockApps = await prisma.shareholderApplication.findMany({
          where: { block: coordinator.block, deletedAt: null },
          select: { id: true },
        });
        const blockAppIds = blockApps.map((a) => a.id);

        // Fetch document IDs belonging to the block applications
        const blockDocs = await prisma.document.findMany({
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
    } else if (req.user.role !== Role.ADMIN) {
      throw new ForbiddenError(
        'You do not have permission to view audit logs',
        'INSUFFICIENT_PERMISSIONS'
      );
    }

    const skip = (page - 1) * limit;

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where: whereClause }),
      prisma.auditLog.findMany({
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
  } catch (error) {
    next(error);
  }
};
