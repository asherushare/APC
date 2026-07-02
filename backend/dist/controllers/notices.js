"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotice = exports.updateNotice = exports.createNotice = exports.getNoticeById = exports.listNotices = exports.UpdateNoticeSchema = exports.CreateNoticeSchema = void 0;
const zod_1 = require("zod");
const db_1 = require("../config/db");
const errors_1 = require("../utils/errors");
const cloudinary_1 = require("../utils/cloudinary");
// Zod schemas for validation
exports.CreateNoticeSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').max(200),
    category: zod_1.z.enum(['SCHEME', 'ANNOUNCEMENT', 'EVENT', 'STORY']),
    summary: zod_1.z.string().min(1, 'Summary is required').max(500),
    content: zod_1.z.string().min(1, 'Content is required'),
    pdfUrl: zod_1.z.string().url('PDF link must be a valid URL').nullable().optional().or(zod_1.z.string().length(0)),
    imageUrl: zod_1.z.string().url('Image link must be a valid URL').nullable().optional().or(zod_1.z.string().length(0)),
    isActive: zod_1.z.boolean().optional(),
});
exports.UpdateNoticeSchema = exports.CreateNoticeSchema.partial();
/**
 * GET /api/v1/notices
 * List all notices with filtering, search, and pagination.
 */
const listNotices = async (req, res, next) => {
    try {
        const { category, search, page = '1', limit = '10', admin } = req.query;
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.max(1, parseInt(limit, 10) || 10);
        const skip = (pageNum - 1) * limitNum;
        // Build the query where clause
        const whereClause = {
            deletedAt: null,
        };
        // Public view only shows active notices. Admin view includes drafts.
        const isAdminView = admin === 'true' && !!req.user;
        if (!isAdminView) {
            whereClause.isActive = true;
        }
        if (category) {
            whereClause.category = category;
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
            db_1.prisma.notice.count({ where: whereClause }),
            db_1.prisma.notice.findMany({
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
    }
    catch (error) {
        next(error);
    }
};
exports.listNotices = listNotices;
/**
 * GET /api/v1/notices/:id
 * Retrieve notice details by ID.
 */
const getNoticeById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const notice = await db_1.prisma.notice.findFirst({
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
            throw new errors_1.NotFoundError('Notice record not found');
        }
        // Hide inactive notices from anonymous users
        if (!notice.isActive && !req.user) {
            throw new errors_1.NotFoundError('Notice record not found');
        }
        res.status(200).json({
            success: true,
            notice,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getNoticeById = getNoticeById;
/**
 * POST /api/v1/notices
 * Create a new notice announcement.
 */
const createNotice = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errors_1.UnauthorizedError('Authentication required');
        }
        const bodyData = { ...req.body };
        if (typeof bodyData.isActive === 'string') {
            bodyData.isActive = bodyData.isActive === 'true';
        }
        const files = req.files;
        // Upload files to Cloudinary if they are present in the request
        if (files?.pdf?.[0]) {
            const result = await (0, cloudinary_1.uploadToCloudinary)(files.pdf[0].buffer, 'notices/pdfs', 'raw');
            bodyData.pdfUrl = result.secure_url;
        }
        if (files?.image?.[0]) {
            const result = await (0, cloudinary_1.uploadToCloudinary)(files.image[0].buffer, 'notices/images', 'image');
            bodyData.imageUrl = result.secure_url;
        }
        const parsed = exports.CreateNoticeSchema.safeParse(bodyData);
        if (!parsed.success) {
            throw new errors_1.ValidationError('Validation failed', parsed.error.format());
        }
        const { title, category, summary, content, pdfUrl, imageUrl, isActive } = parsed.data;
        const notice = await db_1.prisma.notice.create({
            data: {
                title,
                category: category,
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
    }
    catch (error) {
        next(error);
    }
};
exports.createNotice = createNotice;
/**
 * PUT /api/v1/notices/:id
 * Update an existing notice announcement.
 */
const updateNotice = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errors_1.UnauthorizedError('Authentication required');
        }
        const { id } = req.params;
        const existingNotice = await db_1.prisma.notice.findFirst({
            where: {
                id,
                deletedAt: null,
            },
        });
        if (!existingNotice) {
            throw new errors_1.NotFoundError('Notice record not found');
        }
        const bodyData = { ...req.body };
        if (typeof bodyData.isActive === 'string') {
            bodyData.isActive = bodyData.isActive === 'true';
        }
        const files = req.files;
        // Upload files to Cloudinary if they are present in the request
        if (files?.pdf?.[0]) {
            const result = await (0, cloudinary_1.uploadToCloudinary)(files.pdf[0].buffer, 'notices/pdfs', 'raw');
            bodyData.pdfUrl = result.secure_url;
        }
        if (files?.image?.[0]) {
            const result = await (0, cloudinary_1.uploadToCloudinary)(files.image[0].buffer, 'notices/images', 'image');
            bodyData.imageUrl = result.secure_url;
        }
        const parsed = exports.UpdateNoticeSchema.safeParse(bodyData);
        if (!parsed.success) {
            throw new errors_1.ValidationError('Validation failed', parsed.error.format());
        }
        const updated = await db_1.prisma.notice.update({
            where: { id },
            data: {
                ...parsed.data,
                category: parsed.data.category ? parsed.data.category : undefined,
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
    }
    catch (error) {
        next(error);
    }
};
exports.updateNotice = updateNotice;
/**
 * DELETE /api/v1/notices/:id
 * Soft delete a notice announcement.
 */
const deleteNotice = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errors_1.UnauthorizedError('Authentication required');
        }
        const { id } = req.params;
        const existingNotice = await db_1.prisma.notice.findFirst({
            where: {
                id,
                deletedAt: null,
            },
        });
        if (!existingNotice) {
            throw new errors_1.NotFoundError('Notice record not found');
        }
        await db_1.prisma.notice.update({
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
    }
    catch (error) {
        next(error);
    }
};
exports.deleteNotice = deleteNotice;
