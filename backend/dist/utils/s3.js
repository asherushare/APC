"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Client = void 0;
exports.verifyAndCreateBucket = verifyAndCreateBucket;
exports.uploadToS3 = uploadToS3;
exports.streamObjectFromS3 = streamObjectFromS3;
const client_s3_1 = require("@aws-sdk/client-s3");
const env_1 = require("../config/env");
const logger_1 = require("./logger");
exports.s3Client = new client_s3_1.S3Client({
    endpoint: env_1.env.S3_ENDPOINT,
    region: 'us-east-1', // MinIO requires region, us-east-1 is standard default fallback
    credentials: {
        accessKeyId: env_1.env.S3_ACCESS_KEY_ID,
        secretAccessKey: env_1.env.S3_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true, // Required for local MinIO path-style bucket access
});
/**
 * Verifies that the required S3/MinIO bucket exists.
 * If it does not exist, automatically creates it.
 */
async function verifyAndCreateBucket() {
    try {
        await exports.s3Client.send(new client_s3_1.HeadBucketCommand({ Bucket: env_1.env.S3_BUCKET_NAME }));
        logger_1.logger.info(`S3/MinIO Connection verified. Bucket "${env_1.env.S3_BUCKET_NAME}" already exists.`);
    }
    catch (error) {
        const err = error;
        // If bucket does not exist, HeadBucket returns a NotFound error or 404 status
        if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
            logger_1.logger.warn(`S3/MinIO Bucket "${env_1.env.S3_BUCKET_NAME}" does not exist. Creating...`);
            try {
                await exports.s3Client.send(new client_s3_1.CreateBucketCommand({ Bucket: env_1.env.S3_BUCKET_NAME }));
                logger_1.logger.info(`Successfully created S3/MinIO Bucket "${env_1.env.S3_BUCKET_NAME}".`);
            }
            catch (createError) {
                const createErr = createError;
                logger_1.logger.error(`Failed to create S3/MinIO Bucket "${env_1.env.S3_BUCKET_NAME}": ${createErr.message}`);
                throw createError;
            }
        }
        else {
            logger_1.logger.error(`Error connecting to S3/MinIO or checking bucket "${env_1.env.S3_BUCKET_NAME}": ${err.message}`);
            throw error;
        }
    }
}
/**
 * Uploads a file buffer to S3/MinIO.
 */
async function uploadToS3(key, body, mimeType) {
    try {
        await exports.s3Client.send(new client_s3_1.PutObjectCommand({
            Bucket: env_1.env.S3_BUCKET_NAME,
            Key: key,
            Body: body,
            ContentType: mimeType,
        }));
        logger_1.logger.info(`Successfully uploaded object to S3: "${key}"`);
    }
    catch (error) {
        const err = error;
        logger_1.logger.error(`Failed to upload object to S3: "${key}". Error: ${err.message}`);
        throw error;
    }
}
/**
 * Streams an object from S3/MinIO directly to the provided Express response.
 *
 * This mirrors the backend-mediated architecture used by uploads (multer -> PutObjectCommand):
 * the server holds the only S3 credentials, validates authorization, then proxies the bytes.
 * No presigned URLs are generated and the bucket is never exposed publicly.
 *
 * Returns the resolved MIME type (object metadata when present, falling back to the
 * caller-supplied `mimeType`) so the controller can set headers consistently.
 */
async function streamObjectFromS3(key, res, mimeType, filename, fileSize) {
    const data = await exports.s3Client.send(new client_s3_1.GetObjectCommand({ Bucket: env_1.env.S3_BUCKET_NAME, Key: key }));
    const body = data.Body;
    if (!body) {
        throw new Error('S3 object response had no readable body');
    }
    const resolvedType = data.ContentType || mimeType;
    // Inline preview + download supported by the browser; never expose the storage key.
    res.setHeader('Content-Type', resolvedType);
    res.setHeader('Content-Disposition', `inline; filename="${filename.replace(/"/g, '')}"`);
    if (data.ContentLength !== undefined) {
        res.setHeader('Content-Length', data.ContentLength.toString());
    }
    else if (fileSize !== undefined) {
        res.setHeader('Content-Length', fileSize.toString());
    }
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'private, no-store');
    await new Promise((resolve, reject) => {
        body.on('error', reject);
        res.on('error', reject);
        res.on('finish', () => resolve());
        body.pipe(res);
    });
    return resolvedType;
}
