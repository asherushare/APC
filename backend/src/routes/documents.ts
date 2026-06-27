import { Router } from 'express';
import multer from 'multer';
import { Role } from '@prisma/client';
import { uploadDocument, downloadApplicationDocument } from '../controllers/documents';
import { authMiddleware, requireRole } from '../middleware/auth';
import { ValidationError } from '../utils/errors';

const router = Router();

const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new ValidationError('Invalid file type. Allowed formats: PDF, JPEG, PNG, WebP', {
          file: `File type ${file.mimetype} is not supported. Please upload PDF, JPEG, PNG, or WebP.`,
        }) as unknown as Error
      );
    }
  },
});

// POST /api/v1/applications/:id/documents
// Accepts a single file named 'file' and body parameters (documentType)
router.post('/:id/documents', upload.single('file'), uploadDocument);

// GET /api/v1/applications/:id/documents/:documentId/download
// Streams a document to an authenticated ADMIN or (block-scoped) COORDINATOR.
// Backend-mediated streaming — no presigned URLs (matches the upload architecture).
router.get(
  '/:id/documents/:documentId/download',
  authMiddleware,
  requireRole([Role.ADMIN, Role.COORDINATOR]),
  downloadApplicationDocument
);

export default router;
