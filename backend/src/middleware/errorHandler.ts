import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { env } from '../config/env';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandlerMiddleware = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const requestId = req.requestId;
  
  if (err instanceof AppError) {
    err.requestId = requestId;
    logger.warn({
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
  logger.error({
    message: err.message,
    stack: err.stack,
    requestId,
  });

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
      requestId,
      ...(env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  });
};
