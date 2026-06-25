"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationsQuerySchema = exports.AuditLogQuerySchema = exports.UpdateApplicationStatusSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.UpdateApplicationStatusSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(client_1.ApplicationStatus, {
        errorMap: () => ({ message: 'Invalid application status' }),
    }),
    reviewNotes: zod_1.z.string().trim().max(1000, 'Review notes cannot exceed 1000 characters').optional().nullable(),
});
exports.AuditLogQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(10),
    action: zod_1.z.string().trim().optional(),
    targetEntity: zod_1.z.string().trim().optional(),
    targetId: zod_1.z.string().trim().optional(),
    userId: zod_1.z.string().trim().optional(),
});
exports.ApplicationsQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(10),
    status: zod_1.z.nativeEnum(client_1.ApplicationStatus).optional(),
    block: zod_1.z.string().trim().optional(),
    search: zod_1.z.string().trim().optional(),
    startDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD').optional(),
    endDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be YYYY-MM-DD').optional(),
});
