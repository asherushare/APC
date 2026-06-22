import { z } from 'zod';

export const CreateApplicationSchema = z.object({
  // Step 1: Personal Details
  fullName: z.string().trim().min(1, 'Full name is required').max(100),
  fatherHusbandName: z.string().trim().min(1, 'Father or Husband name is required').max(100),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in YYYY-MM-DD format'),
  gender: z.enum(['male', 'female', 'other'], {
    errorMap: () => ({ message: 'Gender must be male, female, or other' }),
  }),
  aadhaarNumber: z.string().regex(/^\d{12}$/, 'Aadhaar number must be exactly 12 digits'),
  panNumber: z
    .string()
    .toUpperCase()
    .trim()
    .regex(/^[A-Z]{5}\d{4}[A-Z]{1}$/, 'Invalid PAN card format')
    .optional()
    .nullable()
    .or(z.literal('')),
  mobileNumber: z.string().regex(/^\d{10}$/, 'Mobile number must be exactly 10 digits'),
  email: z
    .string()
    .trim()
    .email('Invalid email address')
    .optional()
    .nullable()
    .or(z.literal('')),
  occupation: z.string().trim().min(1, 'Occupation is required').max(100),

  // Step 2: Address
  village: z.string().trim().min(1, 'Village is required').max(100),
  gramPanchayat: z.string().trim().min(1, 'Gram Panchayat is required').max(100),
  block: z.string().trim().min(1, 'Block is required').max(100),
  district: z.string().trim().min(1, 'District is required').max(100),
  state: z.string().trim().min(1, 'State is required').max(100),
  pinCode: z.string().regex(/^\d{6}$/, 'Pin code must be exactly 6 digits'),

  // Step 3: Producer Eligibility Checklist
  producerActivities: z.array(z.string().min(1)).min(1, 'At least one producer activity must be selected'),

  // Step 4: Share Subscription
  numberOfShares: z.number().int().min(1, 'Number of shares must be at least 1').max(10, 'Number of shares cannot exceed 10'),
  calculatedContribution: z.number().min(10000).max(100000),

  // Step 5: Nominee Details
  nomineeName: z.string().trim().min(1, 'Nominee name is required').max(100),
  nomineeRelationship: z.string().trim().min(1, 'Nominee relationship is required').max(100),
  nomineeDateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Nominee date of birth must be in YYYY-MM-DD format'),
  nomineeAddress: z.string().trim().min(1, 'Nominee address is required').max(200),
  nomineeMobileNumber: z.string().regex(/^\d{10}$/, 'Nominee mobile number must be exactly 10 digits'),

  // Step 6: Bank Details
  bankAccountHolderName: z.string().trim().min(1, 'Bank account holder name is required').max(100),
  bankName: z.string().trim().min(1, 'Bank name is required').max(100),
  bankAccountNumber: z.string().regex(/^\d{9,18}$/, 'Bank account number must be between 9 and 18 digits'),
  bankIfscCode: z.string().toUpperCase().trim().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format'),

  // Step 7: Declarations (Must be true on submission)
  confirmCorrectInfo: z.literal(true, {
    errorMap: () => ({ message: 'You must confirm that all information is correct' }),
  }),
  agreeToRules: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the rules and regulations' }),
  }),
  understandApprovalRequired: z.literal(true, {
    errorMap: () => ({ message: 'You must understand that membership is subject to approval' }),
  }),
});
