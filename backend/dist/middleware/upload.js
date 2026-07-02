"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const errors_1 = require("../utils/errors");
// Hold files temporarily in memory as buffers before streaming them to cloud storage
const storage = multer_1.default.memoryStorage();
const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
];
exports.upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit to support larger PDFs
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
