"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const documents_1 = require("../controllers/documents");
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
exports.default = router;
