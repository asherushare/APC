import {
  S3Client,
  HeadBucketCommand,
  CreateBucketCommand,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import type { Readable } from 'stream';
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
export async function streamObjectFromS3(
  key: string,
  res: import('express').Response,
  mimeType: string,
  filename: string,
  fileSize?: number
): Promise<string> {
  const data = await s3Client.send(
    new GetObjectCommand({ Bucket: env.S3_BUCKET_NAME, Key: key })
  );

  const body = data.Body as Readable | undefined;
  if (!body) {
    throw new Error('S3 object response had no readable body');
  }

  const resolvedType = data.ContentType || mimeType;

  // Inline preview + download supported by the browser; never expose the storage key.
  res.setHeader('Content-Type', resolvedType);
  res.setHeader('Content-Disposition', `inline; filename="${filename.replace(/"/g, '')}"`);
  if (data.ContentLength !== undefined) {
    res.setHeader('Content-Length', data.ContentLength.toString());
  } else if (fileSize !== undefined) {
    res.setHeader('Content-Length', fileSize.toString());
  }
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'private, no-store');

  await new Promise<void>((resolve, reject) => {
    body.on('error', reject);
    res.on('error', reject);
    res.on('finish', () => resolve());
    body.pipe(res);
  });

  return resolvedType;
}
