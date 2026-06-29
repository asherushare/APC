"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const zod_1 = require("zod");
// Load environmental values from .env file
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().transform(Number).default('4000'),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    DATABASE_URL: zod_1.z.string().url('DATABASE_URL must be a valid PostgreSQL connection URL'),
    JWT_SECRET: zod_1.z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
    JWT_REFRESH_SECRET: zod_1.z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters long'),
    ENCRYPTION_KEY: zod_1.z.string().length(64, 'ENCRYPTION_KEY must be exactly 64 hex characters (256-bit key)'),
    SUPABASE_URL: zod_1.z.string().url('SUPABASE_URL must be a valid URL'),
    SUPABASE_SERVICE_ROLE_KEY: zod_1.z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
    SUPABASE_BUCKET: zod_1.z.string().min(1, 'SUPABASE_BUCKET is required'),
    WHATSAPP_ADMIN_NUMBER: zod_1.z.string().regex(/^\d+$/, 'WHATSAPP_ADMIN_NUMBER must be digits only').default('919348747578'),
    APP_VERSION: zod_1.z.string().default('1.0.0'),
    BUILD_DATE: zod_1.z.string().default(() => new Date().toISOString()),
    GIT_COMMIT: zod_1.z.string().default('unknown'),
    CORS_ORIGIN: zod_1.z.string().optional(),
    GLOBAL_RATE_LIMIT: zod_1.z.string().transform(Number).default('500'),
    SMTP_HOST: zod_1.z.string().optional(),
    SMTP_PORT: zod_1.z.string().optional(),
    SMTP_USER: zod_1.z.string().optional(),
    SMTP_PASS: zod_1.z.string().optional(),
    SMTP_FROM: zod_1.z.string().optional(),
    FRONTEND_URL: zod_1.z.string().url('FRONTEND_URL must be a valid URL').default('http://localhost:3000'),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.error('❌ Invalid environment variables configuration:');
    // eslint-disable-next-line no-console
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    process.exit(1);
}
exports.env = parsed.data;
