"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.generateAccessToken = generateAccessToken;
exports.generateRefreshToken = generateRefreshToken;
exports.verifyAccessToken = verifyAccessToken;
exports.verifyRefreshToken = verifyRefreshToken;
exports.hashRefreshToken = hashRefreshToken;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../config/env");
// Type-safe dynamic import for argon2 to handle environments where native build fails
let argon2 = null;
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    argon2 = require('argon2');
}
catch (error) {
    // Gracefully fallback to bcrypt
}
/**
 * Hashes a plaintext password using Argon2id, falling back to Bcrypt (12 rounds)
 * if Argon2 is not supported or throws an error.
 */
async function hashPassword(password) {
    if (argon2) {
        try {
            return await argon2.hash(password, {
                type: argon2.argon2id,
            });
        }
        catch (error) {
            // Fall through to bcrypt
        }
    }
    return bcrypt_1.default.hash(password, 12);
}
/**
 * Verifies a plaintext password against a hash.
 * If the hash is a legacy bcrypt hash (starts with $2a$, $2b$, or $2y$), it verifies using bcrypt.
 * Otherwise, it attempts verification using Argon2id with a fallback to bcrypt.
 */
async function verifyPassword(password, hash) {
    const isBcryptHash = hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$');
    if (isBcryptHash) {
        return bcrypt_1.default.compare(password, hash);
    }
    if (argon2) {
        try {
            return await argon2.verify(hash, password);
        }
        catch (error) {
            // Fall through to bcrypt
        }
    }
    try {
        return await bcrypt_1.default.compare(password, hash);
    }
    catch (error) {
        return false;
    }
}
/**
 * Generates an Access Token (valid for 15 minutes)
 */
function generateAccessToken(payload) {
    return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, { expiresIn: '15m' });
}
/**
 * Generates a Refresh Token (valid for 7 days)
 */
function generateRefreshToken(payload) {
    return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}
/**
 * Verifies an Access Token
 */
function verifyAccessToken(token) {
    return jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
}
/**
 * Verifies a Refresh Token
 */
function verifyRefreshToken(token) {
    return jsonwebtoken_1.default.verify(token, env_1.env.JWT_REFRESH_SECRET);
}
/**
 * Generates a SHA-256 hash of a refresh token for database persistence and verification.
 */
function hashRefreshToken(token) {
    return crypto_1.default.createHash('sha256').update(token).digest('hex');
}
