"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateApplicationStatus = exports.getApplicationStats = exports.getApplicationDetails = exports.listApplications = exports.submitApplication = void 0;
const client_1 = require("@prisma/client");
const db_1 = require("../config/db");
const logger_1 = require("../utils/logger");
const crypto_1 = require("../utils/crypto");
const errors_1 = require("../utils/errors");
const application_1 = require("../schemas/application");
const admin_1 = require("../schemas/admin");
const auth_1 = require("../utils/auth");
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
 * POST /api/v1/applications
 * Public submission of a shareholder application.
 */
const submitApplication = async (req, res, next) => {
    try {
        // 1. Zod payload validation
        const parsed = application_1.CreateApplicationSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new errors_1.ValidationError('Validation failed', parsed.error.format());
        }
        const data = parsed.data;
        // 2. Strict backend verification of contribution amount
        if (data.calculatedContribution !== data.numberOfShares * 10000) {
            throw new errors_1.ValidationError('Calculated contribution mismatch', {
                calculatedContribution: 'Calculated contribution must equal numberOfShares * 10,000',
            });
        }
        // 3. Aadhaar uniqueness check
        const aadhaarHash = (0, crypto_1.hashAadhaar)(data.aadhaarNumber);
        const existing = await db_1.prisma.shareholderApplication.findUnique({
            where: { aadhaarHash },
        });
        if (existing) {
            throw new errors_1.ConflictError('A shareholder application has already been submitted with this Aadhaar number', 'DUPLICATE_AADHAAR');
        }
        // 4. Crypto operations (Encryption & Masking)
        const aadhaarEncrypted = (0, crypto_1.encrypt)(data.aadhaarNumber);
        const panEncrypted = data.panNumber ? (0, crypto_1.encrypt)(data.panNumber) : null;
        const bankAccountNumberEnc = (0, crypto_1.encrypt)(data.bankAccountNumber);
        const aadhaarMasked = (0, crypto_1.maskAadhaar)(data.aadhaarNumber);
        const panMasked = data.panNumber ? (0, crypto_1.maskPan)(data.panNumber) : null;
        const bankAccountNumberMask = (0, crypto_1.maskBankAccount)(data.bankAccountNumber);
        const currentYear = new Date().getFullYear();
        let retries = 5;
        let savedApp = null;
        // 5. Attempt creation with dynamic unique ID and retry loop for concurrency conflicts
        while (retries > 0) {
            try {
                const count = await db_1.prisma.shareholderApplication.count({
                    where: {
                        applicationId: {
                            startsWith: `APC-${currentYear}-`,
                        },
                    },
                });
                const nextSeq = count + 1;
                const formattedSeq = String(nextSeq).padStart(6, '0');
                const applicationId = `APC-${currentYear}-${formattedSeq}`;
                savedApp = await db_1.prisma.$transaction(async (tx) => {
                    // Double check inside tx if applicationId is already taken (safety fallback)
                    const conflictingApp = await tx.shareholderApplication.findUnique({
                        where: { applicationId },
                    });
                    if (conflictingApp) {
                        throw new client_1.Prisma.PrismaClientKnownRequestError('Application ID conflict', { code: 'P2002', clientVersion: '5.22.0', meta: { target: ['applicationId'] } });
                    }
                    return await tx.shareholderApplication.create({
                        data: {
                            applicationId,
                            fullName: data.fullName,
                            fatherHusbandName: data.fatherHusbandName,
                            dateOfBirth: new Date(data.dateOfBirth),
                            gender: data.gender,
                            aadhaarHash,
                            aadhaarEncrypted,
                            aadhaarMasked,
                            panEncrypted,
                            panMasked,
                            mobileNumber: data.mobileNumber,
                            email: data.email || null,
                            occupation: data.occupation,
                            village: data.village,
                            gramPanchayat: data.gramPanchayat,
                            block: data.block,
                            district: data.district,
                            state: data.state,
                            pinCode: data.pinCode,
                            numberOfShares: data.numberOfShares,
                            calculatedContribution: new client_1.Prisma.Decimal(data.calculatedContribution),
                            nomineeName: data.nomineeName,
                            nomineeRelationship: data.nomineeRelationship,
                            nomineeDateOfBirth: new Date(data.nomineeDateOfBirth),
                            nomineeAddress: data.nomineeAddress,
                            nomineeMobileNumber: data.nomineeMobileNumber,
                            bankAccountHolderName: data.bankAccountHolderName,
                            bankName: data.bankName,
                            bankAccountNumberEnc,
                            bankAccountNumberMask,
                            bankIfscCode: data.bankIfscCode,
                            status: client_1.ApplicationStatus.SUBMITTED,
                            paymentStatus: client_1.PaymentStatus.PENDING,
                            verificationStatus: client_1.VerificationStatus.PENDING,
                            producerActivities: {
                                create: data.producerActivities.map((act) => ({
                                    activityName: act,
                                })),
                            },
                        },
                    });
                });
                break;
            }
            catch (err) {
                if (err instanceof client_1.Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
                    const target = err.meta?.target;
                    if (target && target.includes('applicationId')) {
                        retries--;
                        if (retries === 0)
                            throw err;
                        continue;
                    }
                }
                throw err;
            }
        }
        if (!savedApp) {
            throw new Error('Failed to save shareholder application due to system collision');
        }
        // 6. Log audit event
        await recordAuditLog(null, 'APPLICATION_SUBMITTED', 'ShareholderApplication', savedApp.id, req);
        const uploadToken = (0, auth_1.generateUploadToken)(savedApp.id);
        res.status(201).json({
            success: true,
            applicationId: savedApp.applicationId,
            uploadToken,
            submittedAt: savedApp.submittedAt,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.submitApplication = submitApplication;
/**
 * GET /api/v1/applications
 * Gated administrative query of shareholder applications.
 */
const listApplications = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errors_1.ForbiddenError('Authentication required to list applications', 'AUTHENTICATION_REQUIRED');
        }
        const parsed = admin_1.ApplicationsQuerySchema.safeParse(req.query);
        if (!parsed.success) {
            throw new errors_1.ValidationError('Validation failed', parsed.error.format());
        }
        const { page, limit, status, block, search, startDate, endDate } = parsed.data;
        const whereClause = {
            deletedAt: null,
        };
        // Scoping check based on Roles
        if (req.user.role === client_1.Role.COORDINATOR) {
            const coordinator = await db_1.prisma.user.findUnique({
                where: { id: req.user.id },
            });
            if (!coordinator || !coordinator.block) {
                res.status(200).json({
                    success: true,
                    applications: [],
                    pagination: { total: 0, page, limit, totalPages: 0 },
                });
                return;
            }
            whereClause.block = coordinator.block;
        }
        else if (req.user.role === client_1.Role.ADMIN) {
            if (block) {
                whereClause.block = block;
            }
        }
        else {
            // Reject staff or any other roles not explicitly permitted
            throw new errors_1.ForbiddenError('You do not have permission to perform this action', 'INSUFFICIENT_PERMISSIONS');
        }
        // Status filter
        if (status) {
            whereClause.status = status;
        }
        // Search filter
        if (search) {
            whereClause.OR = [
                { fullName: { contains: search, mode: 'insensitive' } },
                { applicationId: { contains: search, mode: 'insensitive' } },
                { mobileNumber: { contains: search } },
            ];
        }
        // Date range filters
        if (startDate || endDate) {
            whereClause.submittedAt = {};
            if (startDate) {
                whereClause.submittedAt.gte = new Date(`${startDate}T00:00:00.000Z`);
            }
            if (endDate) {
                whereClause.submittedAt.lte = new Date(`${endDate}T23:59:59.999Z`);
            }
        }
        // Pagination setup
        const skip = (page - 1) * limit;
        const [total, applications] = await Promise.all([
            db_1.prisma.shareholderApplication.count({ where: whereClause }),
            db_1.prisma.shareholderApplication.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: { submittedAt: 'desc' },
                select: {
                    id: true,
                    applicationId: true,
                    fullName: true,
                    status: true,
                    mobileNumber: true,
                    email: true,
                    village: true,
                    gramPanchayat: true,
                    block: true,
                    district: true,
                    state: true,
                    pinCode: true,
                    numberOfShares: true,
                    calculatedContribution: true,
                    submittedAt: true,
                    aadhaarMasked: true,
                    panMasked: true,
                    bankAccountNumberMask: true,
                },
            }),
        ]);
        res.status(200).json({
            success: true,
            applications,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.listApplications = listApplications;
/**
 * GET /api/v1/applications/:id
 * Gated administrative query of single shareholder application with decryption.
 */
const getApplicationDetails = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errors_1.ForbiddenError('Authentication required to retrieve application details', 'AUTHENTICATION_REQUIRED');
        }
        const { id } = req.params;
        const application = await db_1.prisma.shareholderApplication.findFirst({
            where: {
                OR: [{ id }, { applicationId: id }],
                deletedAt: null,
            },
            include: {
                producerActivities: true,
            },
        });
        if (!application) {
            throw new errors_1.NotFoundError('Application not found', 'APPLICATION_NOT_FOUND');
        }
        // Role-based block access restriction
        if (req.user.role === client_1.Role.COORDINATOR) {
            const coordinator = await db_1.prisma.user.findUnique({
                where: { id: req.user.id },
            });
            if (!coordinator || coordinator.block !== application.block) {
                throw new errors_1.ForbiddenError('You do not have permission to view applications outside your assigned block', 'INSUFFICIENT_PERMISSIONS');
            }
        }
        else if (req.user.role !== client_1.Role.ADMIN) {
            throw new errors_1.ForbiddenError('You do not have permission to perform this action', 'INSUFFICIENT_PERMISSIONS');
        }
        // Decrypt sensitive information
        const decryptedAadhaar = (0, crypto_1.decrypt)(application.aadhaarEncrypted);
        const decryptedPan = application.panEncrypted ? (0, crypto_1.decrypt)(application.panEncrypted) : null;
        const decryptedBankAccount = (0, crypto_1.decrypt)(application.bankAccountNumberEnc);
        // Clean sensitive encrypted properties out of response object
        const cleanApp = {
            ...application,
            aadhaarNumber: decryptedAadhaar,
            panNumber: decryptedPan,
            bankAccountNumber: decryptedBankAccount,
            aadhaarEncrypted: undefined,
            panEncrypted: undefined,
            bankAccountNumberEnc: undefined,
        };
        res.status(200).json({
            success: true,
            application: cleanApp,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getApplicationDetails = getApplicationDetails;
const VALID_TRANSITIONS = {
    [client_1.ApplicationStatus.DRAFT]: [client_1.ApplicationStatus.SUBMITTED],
    [client_1.ApplicationStatus.SUBMITTED]: [client_1.ApplicationStatus.UNDER_REVIEW, client_1.ApplicationStatus.DOCUMENTS_PENDING, client_1.ApplicationStatus.REJECTED],
    [client_1.ApplicationStatus.UNDER_REVIEW]: [client_1.ApplicationStatus.DOCUMENTS_PENDING, client_1.ApplicationStatus.PAYMENT_PENDING, client_1.ApplicationStatus.APPROVED, client_1.ApplicationStatus.REJECTED],
    [client_1.ApplicationStatus.DOCUMENTS_PENDING]: [client_1.ApplicationStatus.UNDER_REVIEW, client_1.ApplicationStatus.SUBMITTED, client_1.ApplicationStatus.REJECTED],
    [client_1.ApplicationStatus.PAYMENT_PENDING]: [client_1.ApplicationStatus.PAYMENT_CONFIRMED, client_1.ApplicationStatus.REJECTED, client_1.ApplicationStatus.UNDER_REVIEW],
    [client_1.ApplicationStatus.PAYMENT_CONFIRMED]: [client_1.ApplicationStatus.APPROVED, client_1.ApplicationStatus.REJECTED, client_1.ApplicationStatus.UNDER_REVIEW],
    [client_1.ApplicationStatus.APPROVED]: [], // Final status
    [client_1.ApplicationStatus.REJECTED]: [client_1.ApplicationStatus.UNDER_REVIEW], // Allow moving back to review
};
/**
 * GET /api/v1/applications/stats
 * Retrieve dashboard status statistics, optionally scoped by coordinator's block.
 */
const getApplicationStats = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errors_1.ForbiddenError('Authentication required to fetch statistics', 'AUTHENTICATION_REQUIRED');
        }
        const whereClause = {
            deletedAt: null,
        };
        if (req.user.role === client_1.Role.COORDINATOR) {
            const coordinator = await db_1.prisma.user.findUnique({
                where: { id: req.user.id },
            });
            if (!coordinator || !coordinator.block) {
                const emptyStats = {
                    DRAFT: 0,
                    SUBMITTED: 0,
                    UNDER_REVIEW: 0,
                    DOCUMENTS_PENDING: 0,
                    PAYMENT_PENDING: 0,
                    PAYMENT_CONFIRMED: 0,
                    APPROVED: 0,
                    REJECTED: 0,
                };
                res.status(200).json({ success: true, stats: emptyStats });
                return;
            }
            whereClause.block = coordinator.block;
        }
        else if (req.user.role !== client_1.Role.ADMIN) {
            throw new errors_1.ForbiddenError('You do not have permission to retrieve statistics', 'INSUFFICIENT_PERMISSIONS');
        }
        const stats = await db_1.prisma.shareholderApplication.groupBy({
            by: ['status'],
            where: whereClause,
            _count: {
                status: true,
            },
        });
        const counts = {
            DRAFT: 0,
            SUBMITTED: 0,
            UNDER_REVIEW: 0,
            DOCUMENTS_PENDING: 0,
            PAYMENT_PENDING: 0,
            PAYMENT_CONFIRMED: 0,
            APPROVED: 0,
            REJECTED: 0,
        };
        for (const group of stats) {
            counts[group.status] = group._count.status;
        }
        res.status(200).json({
            success: true,
            stats: counts,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getApplicationStats = getApplicationStats;
/**
 * PATCH /api/v1/applications/:id/status
 * Update application status and optional reviewer feedback notes with transition constraints.
 */
const updateApplicationStatus = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errors_1.ForbiddenError('Authentication required to update application status', 'AUTHENTICATION_REQUIRED');
        }
        const { id } = req.params;
        // Validate body
        const parsed = admin_1.UpdateApplicationStatusSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new errors_1.ValidationError('Validation failed', parsed.error.format());
        }
        const { status, reviewNotes } = parsed.data;
        // Fetch the target application
        const application = await db_1.prisma.shareholderApplication.findFirst({
            where: {
                OR: [{ id }, { applicationId: id }],
                deletedAt: null,
            },
        });
        if (!application) {
            throw new errors_1.NotFoundError('Application not found', 'APPLICATION_NOT_FOUND');
        }
        // Role-based block access restriction
        if (req.user.role === client_1.Role.COORDINATOR) {
            const coordinator = await db_1.prisma.user.findUnique({
                where: { id: req.user.id },
            });
            if (!coordinator || coordinator.block !== application.block) {
                throw new errors_1.ForbiddenError('You do not have permission to modify applications outside your assigned block', 'INSUFFICIENT_PERMISSIONS');
            }
        }
        else if (req.user.role !== client_1.Role.ADMIN) {
            throw new errors_1.ForbiddenError('You do not have permission to perform this action', 'INSUFFICIENT_PERMISSIONS');
        }
        // Transition constraints validation
        const currentStatus = application.status;
        const allowed = VALID_TRANSITIONS[currentStatus] || [];
        if (!allowed.includes(status)) {
            throw new errors_1.ValidationError(`Invalid status transition from ${currentStatus} to ${status}`, {
                status: `Cannot transition application from ${currentStatus} to ${status}`,
            });
        }
        const now = new Date();
        const changes = {
            before: {
                status: application.status,
                reviewNotes: application.reviewNotes,
                reviewedAt: application.reviewedAt ? application.reviewedAt.toISOString() : null,
            },
            after: {
                status,
                reviewNotes: reviewNotes || null,
                reviewedAt: now.toISOString(),
            },
        };
        // Database transaction to apply updates and insert audit log
        const updatedApplication = await db_1.prisma.$transaction(async (tx) => {
            const updated = await tx.shareholderApplication.update({
                where: { id: application.id },
                data: {
                    status,
                    reviewNotes: reviewNotes || null,
                    reviewedAt: now,
                    coordinatorId: req.user.id,
                },
            });
            await tx.auditLog.create({
                data: {
                    userId: req.user.id,
                    action: 'STATUS_UPDATED',
                    targetEntity: 'ShareholderApplication',
                    targetId: application.id,
                    ipAddress: req.ip || null,
                    userAgent: req.headers['user-agent'] || null,
                    changes,
                },
            });
            return updated;
        });
        res.status(200).json({
            success: true,
            application: updatedApplication,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateApplicationStatus = updateApplicationStatus;
