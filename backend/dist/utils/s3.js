"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
exports.verifyAndCreateBucket = verifyAndCreateBucket;
exports.uploadToS3 = uploadToS3;
exports.streamObjectFromS3 = streamObjectFromS3;
const supabase_js_1 = require("@supabase/supabase-js");
const stream_1 = require("stream");
const ws_1 = __importDefault(require("ws"));
const env_1 = require("../config/env");
const logger_1 = require("./logger");
exports.supabase = (0, supabase_js_1.createClient)(env_1.env.SUPABASE_URL, env_1.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        persistSession: false,
    },
    realtime: {
        transport: ws_1.default,
    },
});
/**
 * Verifies that the required Supabase Storage bucket exists.
 * If it does not exist, fails with a clear error.
 * Does not attempt to create the bucket.
 */
async function verifyAndCreateBucket() {
    try {
        const { data, error } = await exports.supabase.storage.getBucket(env_1.env.SUPABASE_BUCKET);
        if (error || !data) {
            throw error || new Error(`Bucket "${env_1.env.SUPABASE_BUCKET}" could not be retrieved.`);
        }
        logger_1.logger.info(`Supabase Storage connection verified. Bucket "${env_1.env.SUPABASE_BUCKET}" exists.`);
    }
    catch (error) {
        const err = error;
        logger_1.logger.error(`Error connecting to Supabase Storage or verifying bucket "${env_1.env.SUPABASE_BUCKET}": ${err.message}`);
        throw error;
    }
}
/**
 * Uploads a file buffer to Supabase Storage.
 */
async function uploadToS3(key, body, mimeType) {
    try {
        const { error } = await exports.supabase.storage
            .from(env_1.env.SUPABASE_BUCKET)
            .upload(key, body, {
            contentType: mimeType,
            upsert: true,
        });
        if (error) {
            throw error;
        }
        logger_1.logger.info(`Successfully uploaded object to Supabase Storage: "${key}"`);
    }
    catch (error) {
        const err = error;
        logger_1.logger.error(`Failed to upload object to Supabase Storage: "${key}". Error: ${err.message}`);
        throw error;
    }
}
/**
 * Streams an object from Supabase Storage directly to the provided Express response.
 *
 * Returns the resolved MIME type so the controller can set headers consistently.
 */
async function streamObjectFromS3(key, res, mimeType, filename, _fileSize) {
    const { data, error } = await exports.supabase.storage
        .from(env_1.env.SUPABASE_BUCKET)
        .download(key);
    if (error || !data) {
        throw error || new Error('Supabase Storage object response was empty or failed');
    }
    const resolvedType = data.type || mimeType;
    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.setHeader('Content-Type', resolvedType);
    res.setHeader('Content-Disposition', `inline; filename="${filename.replace(/"/g, '')}"`);
    res.setHeader('Content-Length', buffer.length.toString());
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'private, no-store');
    const nodeStream = stream_1.Readable.from([buffer]);
    await new Promise((resolve, reject) => {
        nodeStream.on('error', reject);
        res.on('error', reject);
        res.on('finish', () => resolve());
        nodeStream.pipe(res);
    });
    return resolvedType;
}
