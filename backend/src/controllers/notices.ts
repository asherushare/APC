import { Request, Response, NextFunction } from 'express';
import { Prisma, NoticeCategory } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../config/db';
import { NotFoundError, ValidationError, UnauthorizedError } from '../utils/errors';
import { uploadToCloudinary } from '../utils/cloudinary';

// Zod schemas for validation
export const CreateNoticeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  category: z.enum(['SCHEME', 'ANNOUNCEMENT', 'EVENT', 'STORY']),
  summary: z.string().min(1, 'Summary is required').max(500),
  content: z.string().min(1, 'Content is required'),
  pdfUrl: z.string().url('PDF link must be a valid URL').nullable().optional().or(z.string().length(0)),
  imageUrl: z.string().url('Image link must be a valid URL').nullable().optional().or(z.string().length(0)),
  isActive: z.boolean().optional(),
});

export const UpdateNoticeSchema = CreateNoticeSchema.partial();

/**
 * GET /api/v1/notices
 * List all notices with filtering, search, and pagination.
 */
export const listNotices = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category, search, page = '1', limit = '10', admin } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit as string, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    // Build the query where clause
    const whereClause: Prisma.NoticeWhereInput = {
      deletedAt: null,
    };

    // Public view only shows active notices. Admin view includes drafts.
    const isAdminView = admin === 'true' && !!req.user;
    if (!isAdminView) {
      whereClause.isActive = true;
    }

    if (category) {
      whereClause.category = category as NoticeCategory;
    }

    if (search) {
      const searchStr = String(search).trim();
      whereClause.OR = [
        { title: { contains: searchStr, mode: 'insensitive' } },
        { summary: { contains: searchStr, mode: 'insensitive' } },
        { content: { contains: searchStr, mode: 'insensitive' } },
      ];
    }

    const [total, notices] = await Promise.all([
      prisma.notice.count({ where: whereClause }),
      prisma.notice.findMany({
        where: whereClause,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      notices,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/notices/:id
 * Retrieve notice details by ID.
 */
export const getNoticeById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const notice = await prisma.notice.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!notice) {
      throw new NotFoundError('Notice record not found');
    }

    // Hide inactive notices from anonymous users
    if (!notice.isActive && !req.user) {
      throw new NotFoundError('Notice record not found');
    }

    res.status(200).json({
      success: true,
      notice,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/notices
 * Create a new notice announcement.
 */
export const createNotice = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const bodyData = { ...req.body };
    if (typeof bodyData.isActive === 'string') {
      bodyData.isActive = bodyData.isActive === 'true';
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    // Upload files to Cloudinary if they are present in the request
    if (files?.pdf?.[0]) {
      const result = await uploadToCloudinary(files.pdf[0].buffer, 'notices/pdfs', 'raw');
      bodyData.pdfUrl = result.secure_url;
    }
    if (files?.image?.[0]) {
      const result = await uploadToCloudinary(files.image[0].buffer, 'notices/images', 'image');
      bodyData.imageUrl = result.secure_url;
    }

    const parsed = CreateNoticeSchema.safeParse(bodyData);
    if (!parsed.success) {
      throw new ValidationError('Validation failed', parsed.error.format());
    }

    const { title, category, summary, content, pdfUrl, imageUrl, isActive } = parsed.data;

    const notice = await prisma.notice.create({
      data: {
        title,
        category: category as NoticeCategory,
        summary,
        content,
        pdfUrl: pdfUrl || null,
        imageUrl: imageUrl || null,
        isActive: isActive !== undefined ? isActive : true,
        authorId: req.user.id,
      },
    });
    // Emit real-time creation event
    req.io?.emit('notice:created', notice);
    res.status(201).json({
      success: true,
      notice,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/notices/:id
 * Update an existing notice announcement.
 */
export const updateNotice = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const { id } = req.params;

    const existingNotice = await prisma.notice.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingNotice) {
      throw new NotFoundError('Notice record not found');
    }

    const bodyData = { ...req.body };
    if (typeof bodyData.isActive === 'string') {
      bodyData.isActive = bodyData.isActive === 'true';
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    // Upload files to Cloudinary if they are present in the request
    if (files?.pdf?.[0]) {
      const result = await uploadToCloudinary(files.pdf[0].buffer, 'notices/pdfs', 'raw');
      bodyData.pdfUrl = result.secure_url;
    }
    if (files?.image?.[0]) {
      const result = await uploadToCloudinary(files.image[0].buffer, 'notices/images', 'image');
      bodyData.imageUrl = result.secure_url;
    }

    const parsed = UpdateNoticeSchema.safeParse(bodyData);
    if (!parsed.success) {
      throw new ValidationError('Validation failed', parsed.error.format());
    }

    const updated = await prisma.notice.update({
      where: { id },
      data: {
        ...parsed.data,
        category: parsed.data.category ? (parsed.data.category as NoticeCategory) : undefined,
        pdfUrl: parsed.data.pdfUrl !== undefined ? (parsed.data.pdfUrl || null) : undefined,
        imageUrl: parsed.data.imageUrl !== undefined ? (parsed.data.imageUrl || null) : undefined,
      },
    });
    // Emit real-time update event
    req.io?.emit('notice:updated', updated);
    res.status(200).json({
      success: true,
      notice: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/notices/:id
 * Soft delete a notice announcement.
 */
export const deleteNotice = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const { id } = req.params;

    const existingNotice = await prisma.notice.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingNotice) {
      throw new NotFoundError('Notice record not found');
    }

    await prisma.notice.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
    // Emit real-time delete event
    req.io?.emit('notice:deleted', { id });
    res.status(200).json({
      success: true,
      message: 'Notice announcement soft-deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
