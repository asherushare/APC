import { Request, Response, NextFunction } from 'express';
import { Prisma, Role, DocumentType, VirusScanStatus } from '@prisma/client';
import crypto from 'crypto';
import path from 'path';
import { prisma } from '../config/db';
import { logger } from '../utils/logger';
import { uploadToS3, streamObjectFromS3 } from '../utils/s3';
import { verifyAccessToken, verifyUploadToken } from '../utils/auth';
import {
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
} from '../utils/errors';

/**
 * Helper to record audit logs.
 */
async function recordAuditLog(
  userId: string | null,
  action: string,
  targetEntity: string,
  targetId: string,
  req: Request,
  changes?: Prisma.InputJsonValue
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        targetEntity,
        targetId,
        ipAddress: req.ip || null,
        userAgent: req.headers['user-agent'] || null,
        changes: changes !== undefined ? changes : Prisma.DbNull,
      },
    });
  } catch (error) {
    logger.error(`Failed to record audit log for action ${action}: ${error}`);
  }
}

/**
 * POST /api/v1/applications/:id/documents
 * Securely uploads a document file to S3/MinIO and records it in database.
 */
export const uploadDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const file = req.file;
    const { documentType } = req.body;

    // 1. Validate file exists
    if (!file) {
      throw new ValidationError('No file uploaded', { file: 'File is required' });
    }

    // 2. Validate document type enum
    const docType = documentType as DocumentType;
    if (!docType || !Object.values(DocumentType).includes(docType)) {
      throw new ValidationError('Invalid document type', {
        documentType: `Document type must be one of: ${Object.values(DocumentType).join(', ')}`,
      });
    }

    // 3. Fetch application
    const application = await prisma.shareholderApplication.findFirst({
      where: {
        OR: [{ id }, { applicationId: id }],
        deletedAt: null,
      },
    });

    if (!application) {
      throw new NotFoundError('Shareholder application not found', 'APPLICATION_NOT_FOUND');
    }

    // 4. Secure Authorization Checks
    const authHeader = req.headers.authorization;
    let isAuthorized = false;
    let uploaderId = 'applicant';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Access token auth (Admin or Coordinator)
      const token = authHeader.split(' ')[1];
      try {
        const payload = verifyAccessToken(token);
        const userRole = payload.role as Role;
        uploaderId = payload.userId;

        if (userRole === Role.ADMIN) {
          isAuthorized = true;
        } else if (userRole === Role.COORDINATOR) {
          // Block-scoped coordinator check
          const coordinator = await prisma.user.findUnique({
            where: { id: payload.userId },
          });
          if (coordinator && coordinator.block === application.block) {
            isAuthorized = true;
          }
        }
      } catch (err) {
        throw new UnauthorizedError('Invalid or expired access token', 'INVALID_ACCESS_TOKEN');
      }
    } else {
      // Anonymous applicant auth: Must present valid cryptographically signed uploadToken
      const uploadToken = (req.headers['x-upload-token'] || req.query.token || req.body.token) as string | undefined;
      if (!uploadToken) {
        throw new UnauthorizedError(
          'Authentication access token or application upload token is required',
          'UPLOAD_TOKEN_REQUIRED'
        );
      }

      try {
        const payload = verifyUploadToken(uploadToken);
        // Ensure token belongs to this exact application
        if (payload.applicationId === application.id) {
          isAuthorized = true;
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        throw new ForbiddenError(
          `Invalid or expired application upload token: ${errorMsg}`,
          'INVALID_UPLOAD_TOKEN'
        );
      }
    }

    if (!isAuthorized) {
      throw new ForbiddenError(
        'You do not have permission to upload documents for this application',
        'INSUFFICIENT_PERMISSIONS'
      );
    }

    // 5. Calculate SHA-256 Checksum
    const checksum = crypto.createHash('sha256').update(file.buffer).digest('hex');

    // 6. Generate S3 storage key
    const fileExt = path.extname(file.originalname);
    const key = `applications/${application.id}/${docType}/${Date.now()}_${crypto.randomBytes(4).toString('hex')}${fileExt}`;

    // 7. Upload to S3/MinIO
    await uploadToS3(key, file.buffer, file.mimetype);

    // 8. Save Document in DB
    const savedDoc = await prisma.document.create({
      data: {
        applicationId: application.id,
        documentType: docType,
        filename: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        storageKey: key,
        checksum,
        uploadStatus: 'DONE',
        uploadedBy: uploaderId,
        virusScanStatus: VirusScanStatus.PENDING,
      },
    });

    // 9. Record Audit Log
    await recordAuditLog(
      uploaderId !== 'applicant' ? uploaderId : null,
      'DOCUMENT_UPLOADED',
      'Document',
      savedDoc.id,
      req,
      { documentType: docType, filename: file.originalname }
    );

    // 10. Async Mock Virus Scanning Processor
    setTimeout(async () => {
      try {
        const updatedDoc = await prisma.document.update({
          where: { id: savedDoc.id },
          data: { virusScanStatus: VirusScanStatus.CLEAN },
        });
        logger.info(
          `Virus scan status transition: [PENDING] -> [${updatedDoc.virusScanStatus}] for Document ID: ${updatedDoc.id} (Application: ${application.applicationId})`
        );
      } catch (scanErr: unknown) {
        const scanErrMsg = scanErr instanceof Error ? scanErr.message : String(scanErr);
        logger.error(`Failed to execute mock virus scan update for document ${savedDoc.id}: ${scanErrMsg}`);
      }
    }, 5000);

    res.status(201).json({
      success: true,
      document: {
        id: savedDoc.id,
        documentType: savedDoc.documentType,
        filename: savedDoc.filename,
        fileSize: savedDoc.fileSize,
        mimeType: savedDoc.mimeType,
        storageKey: savedDoc.storageKey,
        uploadStatus: savedDoc.uploadStatus,
        virusScanStatus: savedDoc.virusScanStatus,
        createdAt: savedDoc.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/applications/:id/documents/:documentId/download
 * Streams an uploaded document from S3/MinIO to an authenticated ADMIN or
 * (block-scoped) COORDINATOR. Backend-mediated streaming (no presigned URLs),
 * matching the architecture used for uploads.
 *
 * Query:
 *   - disposition=attachment  forces a download instead of inline preview.
 */
export const downloadApplicationDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError(
        'Authentication required to download application documents',
        'AUTHENTICATION_REQUIRED'
      );
    }

    const { id, documentId } = req.params;

    // 1. Locate the application (accept DB id or human-readable applicationId)
    const application = await prisma.shareholderApplication.findFirst({
      where: {
        OR: [{ id }, { applicationId: id }],
        deletedAt: null,
      },
    });

    if (!application) {
      throw new NotFoundError('Application not found', 'APPLICATION_NOT_FOUND');
    }

    // 2. Role-based block access restriction (same rule as getApplicationDetails)
    if (req.user.role === Role.COORDINATOR) {
      const coordinator = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      if (!coordinator || coordinator.block !== application.block) {
        throw new ForbiddenError(
          'You do not have permission to view documents for applications outside your assigned block',
          'INSUFFICIENT_PERMISSIONS'
        );
      }
    } else if (req.user.role !== Role.ADMIN) {
      throw new ForbiddenError(
        'You do not have permission to perform this action',
        'INSUFFICIENT_PERMISSIONS'
      );
    }

    // 3. Locate the document and confirm it belongs to this application
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        applicationId: application.id,
        deletedAt: null,
      },
    });

    if (!document) {
      throw new NotFoundError('Document not found', 'DOCUMENT_NOT_FOUND');
    }

    const forceAttachment = req.query.disposition === 'attachment';

    try {
      const mimeType = await streamObjectFromS3(
        document.storageKey,
        res,
        document.mimeType,
        document.filename,
        document.fileSize
      );

      // Override disposition to attachment when explicitly requested
      if (forceAttachment) {
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="${document.filename.replace(/"/g, '')}"`
        );
      }

      await recordAuditLog(
        req.user.id,
        'DOCUMENT_DOWNLOADED',
        'Document',
        document.id,
        req,
        {
          applicationId: application.id,
          documentType: document.documentType,
          filename: document.filename,
          mimeType,
        }
      );
    } catch (streamErr: unknown) {
      const msg = streamErr instanceof Error ? streamErr.message : String(streamErr);
      logger.error(`Failed to stream document ${document.id} from S3: ${msg}`);
      throw streamErr;
    }
  } catch (error) {
    next(error);
  }
};
