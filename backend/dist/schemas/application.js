"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateApplicationSchema = void 0;
const zod_1 = require("zod");
exports.CreateApplicationSchema = zod_1.z.object({
    // Step 1: Personal Details
    fullName: zod_1.z.string().trim().min(1, 'Full name is required').max(100),
    fatherHusbandName: zod_1.z.string().trim().min(1, 'Father or Husband name is required').max(100),
    dateOfBirth: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in YYYY-MM-DD format'),
    gender: zod_1.z.enum(['male', 'female', 'other'], {
        errorMap: () => ({ message: 'Gender must be male, female, or other' }),
    }),
    aadhaarNumber: zod_1.z.string().regex(/^\d{12}$/, 'Aadhaar number must be exactly 12 digits'),
    panNumber: zod_1.z
        .string()
        .toUpperCase()
        .trim()
        .regex(/^[A-Z]{5}\d{4}[A-Z]{1}$/, 'Invalid PAN card format')
        .optional()
        .nullable()
        .or(zod_1.z.literal('')),
    mobileNumber: zod_1.z.string().regex(/^\d{10}$/, 'Mobile number must be exactly 10 digits'),
    whatsappNumber: zod_1.z
        .string()
        .regex(/^\d{10}$/, 'WhatsApp number must be exactly 10 digits')
        .optional()
        .nullable()
        .or(zod_1.z.literal('')),
    email: zod_1.z
        .string()
        .trim()
        .email('Invalid email address')
        .optional()
        .nullable()
        .or(zod_1.z.literal('')),
    occupation: zod_1.z.enum([
        'Farmer',
        'Forest Produce Collector',
        'Horticulture',
        'Livestock',
        'Handicraft',
        'SHG Member',
        'Rural Entrepreneur',
        'Self-Employed',
        'Student',
        'Youth',
        'Employee',
        'Social Worker',
        'Others',
    ], {
        errorMap: () => ({ message: 'Invalid occupation selected' }),
    }),
    // Step 2: Address
    village: zod_1.z.string().trim().min(1, 'Village is required').max(100),
    gramPanchayat: zod_1.z.string().trim().min(1, 'Gram Panchayat is required').max(100),
    block: zod_1.z.string().trim().min(1, 'Block is required').max(100),
    district: zod_1.z.string().trim().min(1, 'District is required').max(100),
    state: zod_1.z.string().trim().min(1, 'State is required').max(100),
    pinCode: zod_1.z.string().regex(/^\d{6}$/, 'Pin code must be exactly 6 digits'),
    // Step 3: Producer Eligibility Checklist
    producerActivities: zod_1.z.array(zod_1.z.string().min(1)).min(1, 'At least one producer activity must be selected'),
    // Step 4: Share Subscription
    numberOfShares: zod_1.z.number().int().min(1, 'Number of shares must be at least 1').max(10, 'Number of shares cannot exceed 10'),
    calculatedContribution: zod_1.z.number().min(10000).max(100000),
    // Step 5: Nominee Details
    nomineeName: zod_1.z.string().trim().min(1, 'Nominee name is required').max(100),
    nomineeRelationship: zod_1.z.string().trim().min(1, 'Nominee relationship is required').max(100),
    nomineeAddress: zod_1.z.string().trim().min(1, 'Nominee address is required').max(200),
    nomineeMobileNumber: zod_1.z.string().regex(/^\d{10}$/, 'Nominee mobile number must be exactly 10 digits'),
    // Step 6: Bank Details
    bankAccountHolderName: zod_1.z.string().trim().min(1, 'Bank account holder name is required').max(100),
    bankName: zod_1.z.string().trim().min(1, 'Bank name is required').max(100),
    bankBranch: zod_1.z.string().trim().min(1, 'Bank branch name is required').max(100),
    bankAccountNumber: zod_1.z.string().regex(/^\d{9,18}$/, 'Bank account number must be between 9 and 18 digits'),
    bankIfscCode: zod_1.z.string().toUpperCase().trim().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format'),
    // Step 7: Declarations (Must be true on submission)
    confirmCorrectInfo: zod_1.z.literal(true, {
        errorMap: () => ({ message: 'You must confirm that all information is correct' }),
    }),
    agreeToRules: zod_1.z.literal(true, {
        errorMap: () => ({ message: 'You must agree to the rules and regulations' }),
    }),
    understandApprovalRequired: zod_1.z.literal(true, {
        errorMap: () => ({ message: 'You must understand that membership is subject to approval' }),
    }),
});
