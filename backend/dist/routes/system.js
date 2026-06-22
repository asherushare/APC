"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../config/db");
const env_1 = require("../config/env");
const router = (0, express_1.Router)();
/**
 * GET /health
 * Returns health metrics for key backend processes
 */
router.get('/health', async (_req, res) => {
    let dbStatus = 'CONNECTED';
    try {
        // Basic connectivity check select
        await db_1.prisma.$queryRaw `SELECT 1`;
    }
    catch (error) {
        dbStatus = 'DISCONNECTED';
    }
    // S3 storage check (mocked as connected in 7A base setup, connected to S3 client in 7D)
    const storageStatus = 'CONNECTED';
    const isHealthy = dbStatus === 'CONNECTED' && storageStatus === 'CONNECTED';
    const status = isHealthy ? 'UP' : 'DOWN';
    res.status(isHealthy ? 200 : 503).json({
        status,
        database: dbStatus,
        storage: storageStatus,
        uptime: process.uptime(),
        version: env_1.env.APP_VERSION,
    });
});
/**
 * GET /version
 * Returns semver, environment, and commit details
 */
router.get('/version', (_req, res) => {
    res.status(200).json({
        version: env_1.env.APP_VERSION,
        buildDate: env_1.env.BUILD_DATE,
        gitCommit: env_1.env.GIT_COMMIT,
        environment: env_1.env.NODE_ENV,
    });
});
exports.default = router;
