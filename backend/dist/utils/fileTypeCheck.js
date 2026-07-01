"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFileSignature = validateFileSignature;
const file_type_1 = __importDefault(require("file-type"));
/**
 * Validates if the uploaded file buffer matches its declared mime type.
 * Returns true if the file signature matches the expected mimetype.
 */
function validateFileSignature(buffer, declaredMimeType) {
    if (!buffer || buffer.length === 0)
        return false;
    const fileInfo = (0, file_type_1.default)(buffer);
    if (!fileInfo) {
        return false; // Could not detect signature (might be plain text, HTML, or corrupted binary)
    }
    // Support image/jpg mapping to image/jpeg
    const normalizedDeclared = declaredMimeType === 'image/jpg' ? 'image/jpeg' : declaredMimeType;
    const normalizedDetected = fileInfo.mime === 'image/jpg' ? 'image/jpeg' : fileInfo.mime;
    return normalizedDetected === normalizedDeclared;
}
