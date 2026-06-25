import { z } from 'zod';
import { ApplicationStatus } from '@prisma/client';

export const UpdateApplicationStatusSchema = z.object({
  status: z.nativeEnum(ApplicationStatus, {
    errorMap: () => ({ message: 'Invalid application status' }),
  }),
  reviewNotes: z.string().trim().max(1000, 'Review notes cannot exceed 1000 characters').optional().nullable(),
});

export const AuditLogQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  action: z.string().trim().optional(),
  targetEntity: z.string().trim().optional(),
  targetId: z.string().trim().optional(),
  userId: z.string().trim().optional(),
});

export const ApplicationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.nativeEnum(ApplicationStatus).optional(),
  block: z.string().trim().optional(),
  search: z.string().trim().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be YYYY-MM-DD').optional(),
});
