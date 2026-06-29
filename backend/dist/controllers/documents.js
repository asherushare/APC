"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadApplicationDocument = exports.uploadDocument = void 0;
const client_1 = require("@prisma/client");
const crypto_1 = __importDefault(require("crypto"));
const path_1 = __importDefault(require("path"));
const db_1 = require("../config/db");
const logger_1 = require("../utils/logger");
const s3_1 = require("../utils/s3");
const auth_1 = require("../utils/auth");
const errors_1 = require("../utils/errors");
/**
 * Helper to record audit logs.
 */
async function recordAuditLog(userId, action, targetEntity, targetId, req, changes) {
    try {
        await db_1.prisma.auditLog.create({
            data: {
                userId,
                action,
                targetEntity,
                targetId,
                ipAddress: req.ip || null,
                userAgent: req.headers['user-agent'] || null,
                changes: changes !== undefined ? changes : client_1.Prisma.DbNull,
            },
        });
    }
    catch (error) {
        logger_1.logger.error(`Failed to record audit log for action ${action}: ${error}`);
    }
}
/**
 * POST /api/v1/applications/:id/documents
 * Securely uploads a document file to Supabase Storage and records it in database.
 */
const uploadDocument = async (req, res, next) => {
    try {
        const { id } = req.params;
        const file = req.file;
        const { documentType } = req.body;
        // 1. Validate file exists
        if (!file) {
            throw new errors_1.ValidationError('No file uploaded', { file: 'File is required' });
        }
        // 2. Validate document type enum
        const docType = documentType;
        if (!docType || !Object.values(client_1.DocumentType).includes(docType)) {
            throw new errors_1.ValidationError('Invalid document type', {
                documentType: `Document type must be one of: ${Object.values(client_1.DocumentType).join(', ')}`,
            });
        }
        // 3. Fetch application
        const application = await db_1.prisma.shareholderApplication.findFirst({
            where: {
                OR: [{ id }, { applicationId: id }],
                deletedAt: null,
            },
        });
        if (!application) {
            throw new errors_1.NotFoundError('Shareholder application not found', 'APPLICATION_NOT_FOUND');
        }
        // 4. Secure Authorization Checks
        const authHeader = req.headers.authorization;
        let isAuthorized = false;
        let uploaderId = 'applicant';
        if (authHeader && authHeader.startsWith('Bearer ')) {
            // Access token auth (Admin or Coordinator)
            const token = authHeader.split(' ')[1];
            try {
                const payload = (0, auth_1.verifyAccessToken)(token);
                const userRole = payload.role;
                uploaderId = payload.userId;
                if (userRole === client_1.Role.ADMIN) {
                    isAuthorized = true;
                }
                else if (userRole === client_1.Role.COORDINATOR) {
                    // Block-scoped coordinator check
                    const coordinator = await db_1.prisma.user.findUnique({
                        where: { id: payload.userId },
                    });
                    if (coordinator && coordinator.block === application.block) {
                        isAuthorized = true;
                    }
                }
            }
            catch (err) {
                throw new errors_1.UnauthorizedError('Invalid or expired access token', 'INVALID_ACCESS_TOKEN');
            }
        }
        else {
            // Anonymous applicant auth: Must present valid cryptographically signed uploadToken
            const uploadToken = (req.headers['x-upload-token'] || req.query.token || req.body.token);
            if (!uploadToken) {
                throw new errors_1.UnauthorizedError('Authentication access token or application upload token is required', 'UPLOAD_TOKEN_REQUIRED');
            }
            try {
                const payload = (0, auth_1.verifyUploadToken)(uploadToken);
                // Ensure token belongs to this exact application
                if (payload.applicationId === application.id) {
                    isAuthorized = true;
                }
            }
            catch (err) {
                const errorMsg = err instanceof Error ? err.message : String(err);
                throw new errors_1.ForbiddenError(`Invalid or expired application upload token: ${errorMsg}`, 'INVALID_UPLOAD_TOKEN');
            }
        }
        if (!isAuthorized) {
            throw new errors_1.ForbiddenError('You do not have permission to upload documents for this application', 'INSUFFICIENT_PERMISSIONS');
        }
        // 5. Calculate SHA-256 Checksum
        const checksum = crypto_1.default.createHash('sha256').update(file.buffer).digest('hex');
        // 6. Generate Supabase storage key
        const fileExt = path_1.default.extname(file.originalname);
        const key = `applications/${application.id}/${docType}/${Date.now()}_${crypto_1.default.randomBytes(4).toString('hex')}${fileExt}`;
        // 7. Upload to Supabase Storage
        await (0, s3_1.uploadToS3)(key, file.buffer, file.mimetype);
        // 8. Save Document in DB
        const savedDoc = await db_1.prisma.document.create({
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
                virusScanStatus: client_1.VirusScanStatus.PENDING,
            },
        });
        // 9. Record Audit Log
        await recordAuditLog(uploaderId !== 'applicant' ? uploaderId : null, 'DOCUMENT_UPLOADED', 'Document', savedDoc.id, req, { documentType: docType, filename: file.originalname });
        // 10. Async Mock Virus Scanning Processor
        setTimeout(async () => {
            try {
                const updatedDoc = await db_1.prisma.document.update({
                    where: { id: savedDoc.id },
                    data: { virusScanStatus: client_1.VirusScanStatus.CLEAN },
                });
                logger_1.logger.info(`Virus scan status transition: [PENDING] -> [${updatedDoc.virusScanStatus}] for Document ID: ${updatedDoc.id} (Application: ${application.applicationId})`);
            }
            catch (scanErr) {
                const scanErrMsg = scanErr instanceof Error ? scanErr.message : String(scanErr);
                logger_1.logger.error(`Failed to execute mock virus scan update for document ${savedDoc.id}: ${scanErrMsg}`);
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
    }
    catch (error) {
        next(error);
    }
};
exports.uploadDocument = uploadDocument;
/**
 * GET /api/v1/applications/:id/documents/:documentId/download
 * Streams an uploaded document from Supabase Storage to an authenticated ADMIN or
 * (block-scoped) COORDINATOR. Backend-mediated streaming (no presigned URLs),
 * matching the architecture used for uploads.
 *
 * Query:
 *   - disposition=attachment  forces a download instead of inline preview.
 */
const downloadApplicationDocument = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errors_1.ForbiddenError('Authentication required to download application documents', 'AUTHENTICATION_REQUIRED');
        }
        const { id, documentId } = req.params;
        // 1. Locate the application (accept DB id or human-readable applicationId)
        const application = await db_1.prisma.shareholderApplication.findFirst({
            where: {
                OR: [{ id }, { applicationId: id }],
                deletedAt: null,
            },
        });
        if (!application) {
            throw new errors_1.NotFoundError('Application not found', 'APPLICATION_NOT_FOUND');
        }
        // 2. Role-based block access restriction (same rule as getApplicationDetails)
        if (req.user.role === client_1.Role.COORDINATOR) {
            const coordinator = await db_1.prisma.user.findUnique({
                where: { id: req.user.id },
            });
            if (!coordinator || coordinator.block !== application.block) {
                throw new errors_1.ForbiddenError('You do not have permission to view documents for applications outside your assigned block', 'INSUFFICIENT_PERMISSIONS');
            }
        }
        else if (req.user.role !== client_1.Role.ADMIN) {
            throw new errors_1.ForbiddenError('You do not have permission to perform this action', 'INSUFFICIENT_PERMISSIONS');
        }
        // 3. Locate the document and confirm it belongs to this application
        const document = await db_1.prisma.document.findFirst({
            where: {
                id: documentId,
                applicationId: application.id,
                deletedAt: null,
            },
        });
        if (!document) {
            throw new errors_1.NotFoundError('Document not found', 'DOCUMENT_NOT_FOUND');
        }
        const forceAttachment = req.query.disposition === 'attachment';
        try {
            const mimeType = await (0, s3_1.streamObjectFromS3)(document.storageKey, res, document.mimeType, document.filename, document.fileSize);
            // Override disposition to attachment when explicitly requested
            if (forceAttachment) {
                res.setHeader('Content-Disposition', `attachment; filename="${document.filename.replace(/"/g, '')}"`);
            }
            await recordAuditLog(req.user.id, 'DOCUMENT_DOWNLOADED', 'Document', document.id, req, {
                applicationId: application.id,
                documentType: document.documentType,
                filename: document.filename,
                mimeType,
            });
        }
        catch (streamErr) {
            const msg = streamErr instanceof Error ? streamErr.message : String(streamErr);
            logger_1.logger.error(`Failed to stream document ${document.id} from Supabase Storage: ${msg}`);
            throw streamErr;
        }
    }
    catch (error) {
        next(error);
    }
};
exports.downloadApplicationDocument = downloadApplicationDocument;
