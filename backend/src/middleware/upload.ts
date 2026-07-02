import multer from 'multer';
import { ValidationError } from '../utils/errors';

// Hold files temporarily in memory as buffers before streaming them to cloud storage
const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit to support larger PDFs
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
