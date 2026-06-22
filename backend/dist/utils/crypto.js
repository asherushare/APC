"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.hashAadhaar = hashAadhaar;
exports.maskAadhaar = maskAadhaar;
exports.maskPan = maskPan;
exports.maskBankAccount = maskBankAccount;
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../config/env");
// ENCRYPTION_KEY is expected to be a 64 hex character string (256-bit key)
const ENCRYPTION_KEY_BUFFER = Buffer.from(env_1.env.ENCRYPTION_KEY, 'hex');
if (ENCRYPTION_KEY_BUFFER.length !== 32) {
    throw new Error('ENCRYPTION_KEY must resolve to exactly 32 bytes (256 bits)');
}
/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Returns a colon-separated string: "iv:authTag:encryptedContent"
 */
function encrypt(text) {
    // Generate a random 12-byte initialization vector (IV)
    const iv = crypto_1.default.randomBytes(12);
    const cipher = crypto_1.default.createCipheriv('aes-256-gcm', ENCRYPTION_KEY_BUFFER, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}
/**
 * Decrypts an encrypted string of the format: "iv:authTag:encryptedContent"
 */
function decrypt(encryptedText) {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
        throw new Error('Invalid encrypted text format. Expected iv:authTag:content');
    }
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encryptedContent = parts[2];
    const decipher = crypto_1.default.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY_BUFFER, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedContent, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
/**
 * Generates a SHA-256 hash of a string (specifically Aadhaar number).
 * Used for database uniqueness constraint checks.
 */
function hashAadhaar(aadhaar) {
    const clean = aadhaar.replace(/\D/g, '');
    return crypto_1.default.createHash('sha256').update(clean).digest('hex');
}
/**
 * Masks a 12-digit Aadhaar number (e.g. XXXX-XXXX-1234)
 */
function maskAadhaar(aadhaar) {
    const clean = aadhaar.replace(/\D/g, '');
    if (clean.length !== 12) {
        // Fallback if formatting is irregular
        return 'XXXX-XXXX-' + clean.slice(-4);
    }
    return `XXXX-XXXX-${clean.slice(8)}`;
}
/**
 * Masks a 10-character PAN Card number (e.g. XXXXXX1234)
 */
function maskPan(pan) {
    const clean = pan.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (clean.length !== 10) {
        return 'XXXXXX' + clean.slice(-4);
    }
    return `XXXXXX${clean.slice(6)}`;
}
/**
 * Masks a Bank Account Number (e.g. XXXXXX5678)
 */
function maskBankAccount(accountNumber) {
    const clean = accountNumber.replace(/[^A-Za-z0-9]/g, '');
    if (clean.length <= 4) {
        return 'XXXXXX' + clean;
    }
    return 'X'.repeat(Math.max(6, clean.length - 4)) + clean.slice(-4);
}
