import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { prisma } from './config/db';
import { verifyAndCreateBucket } from './utils/s3';
import { initSocket } from './utils/socket';

async function startServer() {
  try {
    // 1. Verify Supabase Storage connectivity and ensure bucket exists
    try {
      await verifyAndCreateBucket();
    } catch (err: unknown) {
      if (env.NODE_ENV === 'production') {
        throw err;
      }
      logger.warn(`⚠️ Supabase Storage verification failed: ${(err as Error).message}. Continuing startup in non-production mode.`);
    }

    // 2. Start HTTP server
    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 API Server started in [${env.NODE_ENV}] mode, listening on port: ${env.PORT}`);
      logger.info(`📝 Swagger Documentation available at: http://localhost:${env.PORT}/api-docs`);
    });

    // 3. Initialize Socket.io Server
    initSocket(server);

    // Graceful Shutdown handling
    const gracefulShutdown = async (signal: string): Promise<void> => {
      logger.warn(`Received signal [${signal}]. Shutting down server gracefully...`);
      
      server.close(async () => {
        logger.info('HTTP server closed.');
        
        // Disconnect database client
        await prisma.$disconnect();
        logger.info('Database client disconnected.');
        
        process.exit(0);
      });

      // Force exit after 10s if graceful close hangs
      setTimeout(() => {
        logger.error('Forceful shutdown triggered. Exiting immediately...');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error: unknown) {
    const err = error as Error;
    logger.error('❌ Failed to start server during initialization phase:');
    logger.error(err.message || String(error));
    process.exit(1);
  }
}

startServer();


process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection detected:');
  logger.error(reason as string);
  // eslint-disable-next-line no-console
  console.error(promise);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception crash detected:');
  logger.error(error.message);
  logger.error(error.stack || 'No stack trace');
  process.exit(1);
});
