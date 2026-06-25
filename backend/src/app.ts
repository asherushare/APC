import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { requestTraceMiddleware } from './middleware/requestTrace';
import { errorHandlerMiddleware } from './middleware/errorHandler';
import systemRoutes from './routes/system';
import authRoutes from './routes/auth';
import applicationsRoutes from './routes/applications';
import documentsRouter from './routes/documents';
import auditRoutes from './routes/audit';
import cookieParser from 'cookie-parser';
import { logger } from './utils/logger';
import { env } from './config/env';
import swaggerDocument from './config/swagger.json';

const app = express();

// 1. Request ID Tracing Middleware (must be first)
app.use(requestTraceMiddleware);

// 2. HTTP Request Logger (Morgan piped to Winston logger)
const morganFormat = env.NODE_ENV === 'development' ? 'dev' : 'combined';
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message: string) => {
        logger.http(message.trim());
      },
    },
  })
);

// 3. Security Middlewares (Helmet + Custom Headers)
const defaultHelmet = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ['\'none\''],
      frameAncestors: ['\'none\''],
      sandbox: ['allow-forms'], // allow basic form submits if needed, sandbox by default
    },
  },
  hsts: {
    maxAge: 63072000,
    includeSubDomains: true,
    preload: true,
  },
  frameguard: {
    action: 'deny',
  },
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
});

const swaggerHelmet = helmet({
  contentSecurityPolicy: false,
  hsts: {
    maxAge: 63072000,
    includeSubDomains: true,
    preload: true,
  },
  frameguard: {
    action: 'deny',
  },
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api-docs')) {
    swaggerHelmet(req, res, next);
  } else {
    defaultHelmet(req, res, next);
  }
});

// Explicit manual headers override for Permissions-Policy
app.use((_req, res, next) => {
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), camera=(), microphone=(), payment=()'
  );
  next();
});

// 4. CORS settings
app.use(
  cors({
    origin: env.NODE_ENV === 'production' ? false : true, // restrict in prod, open in dev
    credentials: true,
  })
);

// 5. Cookie & Body Parsing
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 6. Rate Limiting Middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again after 15 minutes',
    },
  },
});
app.use(limiter);

// 7. API Routes Mapping
app.use('/', systemRoutes); // Root level endpoints (/health, /version)
app.use('/api/v1', systemRoutes); // Mount on v1 prefix too
app.use('/api/v1/auth', authRoutes); // Auth routes
app.use('/api/v1/applications', applicationsRoutes); // Applications routes
app.use('/api/v1/applications', documentsRouter); // Documents upload routes
app.use('/api/v1/audit-logs', auditRoutes); // Audit logs routes

// 8. Swagger API Docs Endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 9. 404 Route Catch Handler
app.use((req, res, _next) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`,
      requestId: req.requestId,
    },
  });
});

// 10. Global Error Handling Middleware (must be last)
app.use(errorHandlerMiddleware);

export default app;
