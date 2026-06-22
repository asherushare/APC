"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandlerMiddleware = void 0;
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
const env_1 = require("../config/env");
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandlerMiddleware = (err, req, res, _next) => {
    const requestId = req.requestId;
    if (err instanceof errors_1.AppError) {
        err.requestId = requestId;
        logger_1.logger.warn({
            message: err.message,
            code: err.code,
            statusCode: err.statusCode,
            requestId,
            details: err.details,
        });
        res.status(err.statusCode).json({
            success: false,
            error: {
                code: err.code,
                message: err.message,
                details: err.details,
                requestId,
            },
        });
        return;
    }
    // System (non-operational) errors
    logger_1.logger.error({
        message: err.message,
        stack: err.stack,
        requestId,
    });
    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: env_1.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
            requestId,
            ...(env_1.env.NODE_ENV !== 'production' && { stack: err.stack }),
        },
    });
};
exports.errorHandlerMiddleware = errorHandlerMiddleware;
