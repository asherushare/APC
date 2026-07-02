"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const notices_1 = require("../controllers/notices");
const auth_1 = require("../middleware/auth");
const auth_2 = require("../utils/auth");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
/**
 * Middleware to optionally parse access tokens.
 * This allows public queries to check if an administrator is requesting draft entries (by setting admin=true).
 */
const optionalAuthMiddleware = (req, _res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = (0, auth_2.verifyAccessToken)(token);
        req.user = {
            id: payload.userId,
            email: payload.email,
            role: payload.role,
        };
    }
    catch (error) {
        // Fail silently since credentials are optional
    }
    next();
};
// Public notice lookup queries (optional auth is parsed to support admin previews)
router.get('/', optionalAuthMiddleware, notices_1.listNotices);
router.get('/:id', optionalAuthMiddleware, notices_1.getNoticeById);
// Admin / Coordinator / Staff CRUD management endpoints
router.post('/', auth_1.authMiddleware, (0, auth_1.requireRole)([client_1.Role.ADMIN, client_1.Role.STAFF]), upload_1.upload.fields([
    { name: 'pdf', maxCount: 1 },
    { name: 'image', maxCount: 1 }
]), notices_1.createNotice);
router.put('/:id', auth_1.authMiddleware, (0, auth_1.requireRole)([client_1.Role.ADMIN, client_1.Role.STAFF]), upload_1.upload.fields([
    { name: 'pdf', maxCount: 1 },
    { name: 'image', maxCount: 1 }
]), notices_1.updateNotice);
router.delete('/:id', auth_1.authMiddleware, (0, auth_1.requireRole)([client_1.Role.ADMIN]), notices_1.deleteNotice);
exports.default = router;
