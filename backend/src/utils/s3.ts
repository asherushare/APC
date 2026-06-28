import { createClient } from '@supabase/supabase-js';
import { Readable } from 'stream';
import WebSocket from 'ws';
import { env } from '../config/env';
import { logger } from './logger';

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
  },
  realtime: {
    transport: WebSocket as any,
  },
});

/**
 * Verifies that the required Supabase Storage bucket exists.
 * If it does not exist, fails with a clear error.
 * Does not attempt to create the bucket.
 */
export async function verifyAndCreateBucket(): Promise<void> {
  try {
    const { data, error } = await supabase.storage.getBucket(env.SUPABASE_BUCKET);
    if (error || !data) {
      throw error || new Error(`Bucket "${env.SUPABASE_BUCKET}" could not be retrieved.`);
    }
    logger.info(`Supabase Storage connection verified. Bucket "${env.SUPABASE_BUCKET}" exists.`);
  } catch (error: unknown) {
    const err = error as Error;
    logger.error(`Error connecting to Supabase Storage or verifying bucket "${env.SUPABASE_BUCKET}": ${err.message}`);
    throw error;
  }
}

/**
 * Uploads a file buffer to Supabase Storage.
 */
export async function uploadToS3(key: string, body: Buffer, mimeType: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(env.SUPABASE_BUCKET)
      .upload(key, body, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      throw error;
    }
    logger.info(`Successfully uploaded object to Supabase Storage: "${key}"`);
  } catch (error: unknown) {
    const err = error as Error;
    logger.error(`Failed to upload object to Supabase Storage: "${key}". Error: ${err.message}`);
    throw error;
  }
}

/**
 * Streams an object from Supabase Storage directly to the provided Express response.
 *
 * Returns the resolved MIME type so the controller can set headers consistently.
 */
export async function streamObjectFromS3(
  key: string,
  res: import('express').Response,
  mimeType: string,
  filename: string,
  _fileSize?: number
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(env.SUPABASE_BUCKET)
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

  const nodeStream = Readable.from([buffer]);

  await new Promise<void>((resolve, reject) => {
    nodeStream.on('error', reject);
    res.on('error', reject);
    res.on('finish', () => resolve());
    nodeStream.pipe(res);
  });

  return resolvedType;
}
