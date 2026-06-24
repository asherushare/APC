import { Request, Response, NextFunction } from 'express';
import { Prisma, Role, ApplicationStatus, PaymentStatus, VerificationStatus } from '@prisma/client';
import { prisma } from '../config/db';
import { logger } from '../utils/logger';
import {
  encrypt,
  decrypt,
  hashAadhaar,
  maskAadhaar,
  maskPan,
  maskBankAccount,
} from '../utils/crypto';
import {
  ValidationError,
  ConflictError,
  NotFoundError,
  ForbiddenError,
} from '../utils/errors';
import { CreateApplicationSchema } from '../schemas/application';
import { generateUploadToken } from '../utils/auth';

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
 * POST /api/v1/applications
 * Public submission of a shareholder application.
 */
export const submitApplication = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Zod payload validation
    const parsed = CreateApplicationSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError('Validation failed', parsed.error.format());
    }
    const data = parsed.data;

    // 2. Strict backend verification of contribution amount
    if (data.calculatedContribution !== data.numberOfShares * 10000) {
      throw new ValidationError('Calculated contribution mismatch', {
        calculatedContribution: 'Calculated contribution must equal numberOfShares * 10,000',
      });
    }

    // 3. Aadhaar uniqueness check
    const aadhaarHash = hashAadhaar(data.aadhaarNumber);
    const existing = await prisma.shareholderApplication.findUnique({
      where: { aadhaarHash },
    });
    if (existing) {
      throw new ConflictError(
        'A shareholder application has already been submitted with this Aadhaar number',
        'DUPLICATE_AADHAAR'
      );
    }

    // 4. Crypto operations (Encryption & Masking)
    const aadhaarEncrypted = encrypt(data.aadhaarNumber);
    const panEncrypted = data.panNumber ? encrypt(data.panNumber) : null;
    const bankAccountNumberEnc = encrypt(data.bankAccountNumber);

    const aadhaarMasked = maskAadhaar(data.aadhaarNumber);
    const panMasked = data.panNumber ? maskPan(data.panNumber) : null;
    const bankAccountNumberMask = maskBankAccount(data.bankAccountNumber);

    const currentYear = new Date().getFullYear();
    let retries = 5;
    let savedApp = null;

    // 5. Attempt creation with dynamic unique ID and retry loop for concurrency conflicts
    while (retries > 0) {
      try {
        const count = await prisma.shareholderApplication.count({
          where: {
            applicationId: {
              startsWith: `APC-${currentYear}-`,
            },
          },
        });

        const nextSeq = count + 1;
        const formattedSeq = String(nextSeq).padStart(6, '0');
        const applicationId = `APC-${currentYear}-${formattedSeq}`;

        savedApp = await prisma.$transaction(async (tx) => {
          // Double check inside tx if applicationId is already taken (safety fallback)
          const conflictingApp = await tx.shareholderApplication.findUnique({
            where: { applicationId },
          });

          if (conflictingApp) {
            throw new Prisma.PrismaClientKnownRequestError(
              'Application ID conflict',
              { code: 'P2002', clientVersion: '5.22.0', meta: { target: ['applicationId'] } }
            );
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
              calculatedContribution: new Prisma.Decimal(data.calculatedContribution),
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
              status: ApplicationStatus.SUBMITTED,
              paymentStatus: PaymentStatus.PENDING,
              verificationStatus: VerificationStatus.PENDING,
              producerActivities: {
                create: data.producerActivities.map((act) => ({
                  activityName: act,
                })),
              },
            },
          });
        });
        break;
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          const target = err.meta?.target as string[];
          if (target && target.includes('applicationId')) {
            retries--;
            if (retries === 0) throw err;
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
    await recordAuditLog(
      null,
      'APPLICATION_SUBMITTED',
      'ShareholderApplication',
      savedApp.id,
      req
    );

    const uploadToken = generateUploadToken(savedApp.id);

    res.status(201).json({
      success: true,
      applicationId: savedApp.applicationId,
      uploadToken,
      submittedAt: savedApp.submittedAt,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/applications
 * Gated administrative query of shareholder applications.
 */
export const listApplications = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError(
        'Authentication required to list applications',
        'AUTHENTICATION_REQUIRED'
      );
    }

    const whereClause: Prisma.ShareholderApplicationWhereInput = {
      deletedAt: null,
    };

    // Scoping check based on Roles
    if (req.user.role === Role.COORDINATOR) {
      const coordinator = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      if (!coordinator || !coordinator.block) {
        res.status(200).json({
          success: true,
          applications: [],
          pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
        });
        return;
      }
      whereClause.block = coordinator.block;
    } else if (req.user.role !== Role.ADMIN) {
      // Reject staff or any other roles not explicitly permitted
      throw new ForbiddenError(
        'You do not have permission to perform this action',
        'INSUFFICIENT_PERMISSIONS'
      );
    }

    // Query parameters filtering
    if (typeof req.query.status === 'string' && req.query.status.trim()) {
      whereClause.status = req.query.status.trim() as ApplicationStatus;
    }

    if (req.user.role === Role.ADMIN && typeof req.query.block === 'string' && req.query.block.trim()) {
      whereClause.block = req.query.block.trim();
    }

    // Pagination setup
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));
    const skip = (page - 1) * limit;

    const [total, applications] = await Promise.all([
      prisma.shareholderApplication.count({ where: whereClause }),
      prisma.shareholderApplication.findMany({
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
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/applications/:id
 * Gated administrative query of single shareholder application with decryption.
 */
export const getApplicationDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError(
        'Authentication required to retrieve application details',
        'AUTHENTICATION_REQUIRED'
      );
    }

    const { id } = req.params;

    const application = await prisma.shareholderApplication.findFirst({
      where: {
        OR: [{ id }, { applicationId: id }],
        deletedAt: null,
      },
      include: {
        producerActivities: true,
      },
    });

    if (!application) {
      throw new NotFoundError('Application not found', 'APPLICATION_NOT_FOUND');
    }

    // Role-based block access restriction
    if (req.user.role === Role.COORDINATOR) {
      const coordinator = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      if (!coordinator || coordinator.block !== application.block) {
        throw new ForbiddenError(
          'You do not have permission to view applications outside your assigned block',
          'INSUFFICIENT_PERMISSIONS'
        );
      }
    } else if (req.user.role !== Role.ADMIN) {
      throw new ForbiddenError(
        'You do not have permission to perform this action',
        'INSUFFICIENT_PERMISSIONS'
      );
    }

    // Decrypt sensitive information
    const decryptedAadhaar = decrypt(application.aadhaarEncrypted);
    const decryptedPan = application.panEncrypted ? decrypt(application.panEncrypted) : null;
    const decryptedBankAccount = decrypt(application.bankAccountNumberEnc);

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
  } catch (error) {
    next(error);
  }
};
