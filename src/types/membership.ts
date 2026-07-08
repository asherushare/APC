export interface ShareholderApplication {
  // Step 1: Personal Details
  fullName: string;
  fatherHusbandName: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: 'male' | 'female' | 'other' | '';
  aadhaarNumber: string; // 12 digits
  panNumber?: string; // Optional (10 chars)
  mobileNumber: string; // 10 digits
  whatsappNumber?: string; // 10 digits
  email?: string;
  occupation: string; // Primary activity

  // Step 2: Address
  village: string;
  gramPanchayat: string;
  block: string;
  district: string;
  state: string;
  pinCode: string;

  // Step 3: Producer Eligibility Checklist
  producerActivities: string[]; // Selected from official categories

  // Step 4: Share Subscription
  numberOfShares: number; // Value: 1 to 10
  calculatedContribution: number; // numberOfShares * 10000

  // Step 5: Nominee Details
  nomineeName: string;
  nomineeRelationship: string;
  nomineeAddress: string;
  nomineeMobileNumber: string;

  // Step 6: Bank Details
  bankAccountHolderName: string;
  bankName: string;
  bankBranch: string;
  bankAccountNumber: string;
  bankIfscCode: string;

  // Step 7: Declaration Checkboxes
  confirmCorrectInfo: boolean;
  agreeToRules: boolean;
  understandApprovalRequired: boolean;

  // Step 8: Uploaded Supporting Documents (serializable metadata)
  uploadedDocuments?: {
    aadhaarCard?: UploadedDocumentMetadata;
    panCard?: UploadedDocumentMetadata;
    passportPhoto?: UploadedDocumentMetadata;
    producerActivityProof?: UploadedDocumentMetadata;
    bankPassbook?: UploadedDocumentMetadata;
  };

  // Future-proofing fields for backend integration
  applicationId?: string;
  submittedAt?: string;
  status?: 'draft' | 'submitted' | 'pending_review' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewNotes?: string;
  paymentStatus?: 'pending' | 'verified' | 'failed';
  verificationStatus?: 'pending' | 'verified' | 'failed';
}

export interface UploadedDocumentMetadata {
  filename: string;
  fileSize: number; // in bytes
  mimeType: string;
  uploadTimestamp: string;
  backendUrl?: string; // Optional for future backend integrations
  uploadStatus: 'idle' | 'uploading' | 'done' | 'error';
}
