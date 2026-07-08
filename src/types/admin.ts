// ===================================
// APC Odisha — Admin Domain Types
// ===================================
// Types modeling the backend ADMIN/COORDINATOR API response shapes for the
// Application Details & Document Viewer (Phase 8, Milestone 5).
// Field names mirror the Prisma model + the decrypted `cleanApp` response
// returned by GET /api/v1/applications/:id.

/** Application lifecycle status (mirrors Prisma `ApplicationStatus` enum). */
export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'DOCUMENTS_PENDING'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_CONFIRMED'
  | 'APPROVED'
  | 'REJECTED';

/** Payment status (mirrors Prisma `PaymentStatus` enum). */
export type PaymentStatus = 'PENDING' | 'VERIFIED' | 'FAILED';

/** Verification status (mirrors Prisma `VerificationStatus` enum). */
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'FAILED';

/** Document type (mirrors Prisma `DocumentType` enum). */
export type DocumentType =
  | 'AADHAAR'
  | 'PAN'
  | 'PASSPORT_PHOTO'
  | 'PRODUCER_ACTIVITY_PROOF'
  | 'BANK_PASSBOOK';

/** Upload lifecycle status of a stored document. */
export type UploadStatus = 'PENDING' | 'DONE' | 'FAILED';

/** Virus scan status of a stored document. */
export type VirusScanStatus = 'PENDING' | 'CLEAN' | 'INFECTED' | 'SKIPPED';

/** A producer activity linked to an application. */
export interface ProducerActivity {
  id: string;
  activityName: string;
}

/** Metadata for a document stored against an application (subset selected by the API). */
export interface ApplicationDocument {
  id: string;
  documentType: DocumentType;
  filename: string;
  mimeType: string;
  fileSize: number;
  url?: string;
  uploadStatus: UploadStatus;
  virusScanStatus: VirusScanStatus;
  createdAt: string;
}

/**
 * Full decrypted application record returned by GET /api/v1/applications/:id.
 * Sensitive fields (Aadhaar / PAN / bank account number) are decrypted
 * server-side and only delivered to authorized roles.
 */
export interface ApplicationDetail {
  id: string;
  applicationId: string;

  // Personal details (decrypted where sensitive)
  fullName: string;
  fatherHusbandName: string;
  dateOfBirth: string;
  gender: string;
  aadhaarNumber: string;
  aadhaarMasked: string;
  panNumber: string | null;
  panMasked: string | null;
  mobileNumber: string;
  whatsappNumber: string | null;
  email: string | null;
  occupation: string;

  // Address
  village: string;
  gramPanchayat: string;
  block: string;
  district: string;
  state: string;
  pinCode: string;

  // Share subscription
  numberOfShares: number;
  calculatedContribution: number;

  // Nominee
  nomineeName: string;
  nomineeRelationship: string;
  nomineeAddress: string;
  nomineeMobileNumber: string;

  // Bank details (decrypted where sensitive)
  bankAccountHolderName: string;
  bankName: string;
  bankBranch: string;
  bankAccountNumber: string;
  bankAccountNumberMask: string;
  bankIfscCode: string;

  // Status
  status: ApplicationStatus;
  paymentStatus: PaymentStatus;
  verificationStatus: VerificationStatus;
  reviewNotes: string | null;
  reviewedBy: string | null;

  submittedAt: string;

  // Relations
  producerActivities: ProducerActivity[];
  documents: ApplicationDocument[];
}

/** GET /api/v1/applications/:id success envelope. */
export interface ApplicationDetailResponse {
  success: boolean;
  application: ApplicationDetail;
}

/** Payload for PATCH /api/v1/applications/:id/status. */
export interface StatusUpdatePayload {
  status: ApplicationStatus;
  reviewNotes?: string;
}

/** Response body for PATCH /api/v1/applications/:id/status. */
export interface StatusUpdateResponse {
  success: boolean;
  application: { id: string; status: ApplicationStatus };
}

/** Allowed status-transition map (mirrors backend VALID_TRANSITIONS). */
export type StatusTransitionMap = Record<ApplicationStatus, ApplicationStatus[]>;

/** Audit log actor (when resolved by the API join). */
export interface AuditLogActor {
  email: string;
  fullName: string;
}

/** A single audit log row (mirrors AuditLogsTable's AuditLogRecord). */
export interface AuditLogEntry {
  id: string;
  userId: string | null;
  action: string;
  targetEntity: string;
  targetId: string;
  ipAddress: string | null;
  userAgent: string | null;
  changes: unknown;
  createdAt: string;
  user?: AuditLogActor | null;
}

/** Paginated audit-log response envelope. */
export interface AuditLogsResponse {
  success: boolean;
  logs: AuditLogEntry[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
