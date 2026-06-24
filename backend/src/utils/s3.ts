import { S3Client, HeadBucketCommand, CreateBucketCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../config/env';
import { logger } from './logger';

export const s3Client = new S3Client({
  endpoint: env.S3_ENDPOINT,
  region: 'us-east-1', // MinIO requires region, us-east-1 is standard default fallback
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true, // Required for local MinIO path-style bucket access
});

/**
 * Verifies that the required S3/MinIO bucket exists.
 * If it does not exist, automatically creates it.
 */
export async function verifyAndCreateBucket(): Promise<void> {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: env.S3_BUCKET_NAME }));
    logger.info(`S3/MinIO Connection verified. Bucket "${env.S3_BUCKET_NAME}" already exists.`);
  } catch (error: unknown) {
    const err = error as Error & { $metadata?: { httpStatusCode?: number } };
    // If bucket does not exist, HeadBucket returns a NotFound error or 404 status
    if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
      logger.warn(`S3/MinIO Bucket "${env.S3_BUCKET_NAME}" does not exist. Creating...`);
      try {
        await s3Client.send(new CreateBucketCommand({ Bucket: env.S3_BUCKET_NAME }));
        logger.info(`Successfully created S3/MinIO Bucket "${env.S3_BUCKET_NAME}".`);
      } catch (createError: unknown) {
        const createErr = createError as Error;
        logger.error(`Failed to create S3/MinIO Bucket "${env.S3_BUCKET_NAME}": ${createErr.message}`);
        throw createError;
      }
    } else {
      logger.error(`Error connecting to S3/MinIO or checking bucket "${env.S3_BUCKET_NAME}": ${err.message}`);
      throw error;
    }
  }
}

/**
 * Uploads a file buffer to S3/MinIO.
 */
export async function uploadToS3(key: string, body: Buffer, mimeType: string): Promise<void> {
  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET_NAME,
        Key: key,
        Body: body,
        ContentType: mimeType,
      })
    );
    logger.info(`Successfully uploaded object to S3: "${key}"`);
  } catch (error: unknown) {
    const err = error as Error;
    logger.error(`Failed to upload object to S3: "${key}". Error: ${err.message}`);
    throw error;
  }
}
