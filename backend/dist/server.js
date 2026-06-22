"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const logger_1 = require("./utils/logger");
const db_1 = require("./config/db");
const server = app_1.default.listen(env_1.env.PORT, () => {
    logger_1.logger.info(`🚀 API Server started in [${env_1.env.NODE_ENV}] mode, listening on port: ${env_1.env.PORT}`);
    logger_1.logger.info(`📝 Swagger Documentation available at: http://localhost:${env_1.env.PORT}/api-docs`);
});
// Graceful Shutdown handling
const gracefulShutdown = async (signal) => {
    logger_1.logger.warn(`Received signal [${signal}]. Shutting down server gracefully...`);
    server.close(async () => {
        logger_1.logger.info('HTTP server closed.');
        // Disconnect database client
        await db_1.prisma.$disconnect();
        logger_1.logger.info('Database client disconnected.');
        process.exit(0);
    });
    // Force exit after 10s if graceful close hangs
    setTimeout(() => {
        logger_1.logger.error('Forceful shutdown triggered. Exiting immediately...');
        process.exit(1);
    }, 10000);
};
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('unhandledRejection', (reason, promise) => {
    logger_1.logger.error('Unhandled Promise Rejection detected:');
    logger_1.logger.error(reason);
    // eslint-disable-next-line no-console
    console.error(promise);
});
process.on('uncaughtException', (error) => {
    logger_1.logger.error('Uncaught Exception crash detected:');
    logger_1.logger.error(error.message);
    logger_1.logger.error(error.stack || 'No stack trace');
    process.exit(1);
});
