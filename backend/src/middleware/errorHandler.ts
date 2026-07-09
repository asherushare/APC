import { Request, Response, NextFunction } from 'express';
import { MulterError } from 'multer';
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

  // Intercept Multer errors to return clear bad request errors
  if (err instanceof MulterError) {
    const isSizeLimit = err.code === 'LIMIT_FILE_SIZE';
    logger.warn({
      message: err.message,
      code: err.code,
      requestId,
    });

    res.status(400).json({
      success: false,
      error: {
        code: isSizeLimit ? 'FILE_TOO_LARGE' : 'INVALID_FILE_UPLOAD',
        message: isSizeLimit ? 'File exceeds the maximum allowed size.' : err.message,
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
