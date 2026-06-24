"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Client = void 0;
exports.verifyAndCreateBucket = verifyAndCreateBucket;
exports.uploadToS3 = uploadToS3;
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
