"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const requestTrace_1 = require("./middleware/requestTrace");
const errorHandler_1 = require("./middleware/errorHandler");
const system_1 = __importDefault(require("./routes/system"));
const auth_1 = __importDefault(require("./routes/auth"));
const publicAuth_1 = __importDefault(require("./routes/publicAuth"));
const applications_1 = __importDefault(require("./routes/applications"));
const documents_1 = __importDefault(require("./routes/documents"));
const audit_1 = __importDefault(require("./routes/audit"));
const notices_1 = __importDefault(require("./routes/notices"));
const users_1 = __importDefault(require("./routes/users"));
const socket_1 = require("./utils/socket");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const logger_1 = require("./utils/logger");
const env_1 = require("./config/env");
const swagger_json_1 = __importDefault(require("./config/swagger.json"));
const app = (0, express_1.default)();
// Trust proxy headers in production when running behind reverse proxies (Render, AWS ALB, Nginx, etc.)
if (env_1.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}
// 1. Request ID Tracing Middleware (must be first)
app.use(requestTrace_1.requestTraceMiddleware);
// 2. HTTP Request Logger (Morgan piped to Winston logger)
const morganFormat = env_1.env.NODE_ENV === 'development' ? 'dev' : 'combined';
app.use((0, morgan_1.default)(morganFormat, {
    stream: {
        write: (message) => {
            logger_1.logger.http(message.trim());
        },
    },
}));
// 3. Security Middlewares (Helmet + Custom Headers)
const defaultHelmet = (0, helmet_1.default)({
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
const swaggerHelmet = (0, helmet_1.default)({
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
    }
    else {
        defaultHelmet(req, res, next);
    }
});
// Explicit manual headers override for Permissions-Policy
app.use((_req, res, next) => {
    res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=(), payment=()');
    next();
});
// 4. CORS settings
const allowedOrigins = [
    'https://apc-rose.vercel.app',
    'http://localhost:3000',
];
if (env_1.env.FRONTEND_URL) {
    // Normalize frontend URL by removing trailing slash if present
    const normalizedFrontend = env_1.env.FRONTEND_URL.replace(/\/$/, '');
    if (!allowedOrigins.includes(normalizedFrontend)) {
        allowedOrigins.push(normalizedFrontend);
    }
}
if (env_1.env.CORS_ORIGIN) {
    const customOrigins = env_1.env.CORS_ORIGIN.split(',')
        .map((o) => o.trim().replace(/\/$/, ''))
        .filter(Boolean);
    customOrigins.forEach((origin) => {
        if (!allowedOrigins.includes(origin)) {
            allowedOrigins.push(origin);
        }
    });
}
const corsOptions = {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Upload-Token'],
};
app.use((0, cors_1.default)(corsOptions));
app.options('*', (0, cors_1.default)(corsOptions));
// 5. Cookie & Body Parsing
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Attach socket.io server instance to requests
app.use((req, _res, next) => {
    try {
        req.io = (0, socket_1.getIO)();
    }
    catch (error) {
        // Fail silently if socket server is not initialized yet (e.g. in test suites)
    }
    next();
});
// 6. Rate Limiting Middleware
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: env_1.env.GLOBAL_RATE_LIMIT, // Configurable rate limit (defaults to 500)
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
app.use('/', system_1.default); // Root level endpoints (/health, /version)
app.use('/api/v1', system_1.default); // Mount on v1 prefix too
app.use('/api/v1/auth', auth_1.default); // Auth routes
app.use('/api/v1/public-auth', publicAuth_1.default); // Public portal auth routes
app.use('/api/v1/applications', applications_1.default); // Applications routes
app.use('/api/v1/applications', documents_1.default); // Documents upload routes
app.use('/api/v1/audit-logs', audit_1.default); // Audit logs routes
app.use('/api/v1/notices', notices_1.default); // Notices board routes
app.use('/api/v1/users', users_1.default); // Users management routes
// 8. Swagger API Docs Endpoint
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_json_1.default));
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
app.use(errorHandler_1.errorHandlerMiddleware);
exports.default = app;
