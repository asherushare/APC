"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const client_1 = require("@prisma/client");
const documents_1 = require("../controllers/documents");
const auth_1 = require("../middleware/auth");
const errors_1 = require("../utils/errors");
const router = (0, express_1.Router)();
const storage = multer_1.default.memoryStorage();
const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
];
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new errors_1.ValidationError('Invalid file type. Allowed formats: PDF, JPEG, PNG, WebP', {
                file: `File type ${file.mimetype} is not supported. Please upload PDF, JPEG, PNG, or WebP.`,
            }));
        }
    },
});
// POST /api/v1/applications/:id/documents
// Accepts a single file named 'file' and body parameters (documentType)
router.post('/:id/documents', upload.single('file'), documents_1.uploadDocument);
// GET /api/v1/applications/:id/documents/:documentId/download
// Streams a document to an authenticated ADMIN or (block-scoped) COORDINATOR.
// Backend-mediated streaming — no presigned URLs (matches the upload architecture).
router.get('/:id/documents/:documentId/download', auth_1.authMiddleware, (0, auth_1.requireRole)([client_1.Role.ADMIN, client_1.Role.COORDINATOR]), documents_1.downloadApplicationDocument);
exports.default = router;
