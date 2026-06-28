import { Router, Request, Response } from 'express';
import { prisma } from '../config/db';
import { env } from '../config/env';
import { supabase } from '../utils/s3';

const router = Router();

/**
 * GET /health
 * Returns health metrics for key backend processes
 */
router.get('/health', async (_req: Request, res: Response) => {
  let dbStatus = 'CONNECTED';
  try {
    // Basic connectivity check select
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    dbStatus = 'DISCONNECTED';
  }

  // Real Supabase storage check verifying connection and bucket access
  let storageStatus = 'CONNECTED';
  try {
    const { data, error } = await supabase.storage.getBucket(env.SUPABASE_BUCKET);
    if (error || !data) {
      storageStatus = 'DISCONNECTED';
    }
  } catch (error) {
    storageStatus = 'DISCONNECTED';
  }

  const isHealthy = dbStatus === 'CONNECTED' && storageStatus === 'CONNECTED';
  const status = isHealthy ? 'UP' : 'DOWN';

  res.status(isHealthy ? 200 : 503).json({
    status,
    database: dbStatus,
    storage: storageStatus,
    uptime: process.uptime(),
    version: env.APP_VERSION,
  });
});

/**
 * GET /version
 * Returns semver, environment, and commit details
 */
router.get('/version', (_req: Request, res: Response) => {
  res.status(200).json({
    version: env.APP_VERSION,
    buildDate: env.BUILD_DATE,
    gitCommit: env.GIT_COMMIT,
    environment: env.NODE_ENV,
  });
});

export default router;
