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
    S3_ENDPOINT: zod_1.z.string().url('S3_ENDPOINT must be a valid URL'),
    S3_ACCESS_KEY_ID: zod_1.z.string().min(1, 'S3_ACCESS_KEY_ID is required'),
    S3_SECRET_ACCESS_KEY: zod_1.z.string().min(1, 'S3_SECRET_ACCESS_KEY is required'),
    S3_BUCKET_NAME: zod_1.z.string().min(1, 'S3_BUCKET_NAME is required'),
    WHATSAPP_ADMIN_NUMBER: zod_1.z.string().regex(/^\d+$/, 'WHATSAPP_ADMIN_NUMBER must be digits only').default('919348747578'),
    APP_VERSION: zod_1.z.string().default('1.0.0'),
    BUILD_DATE: zod_1.z.string().default(() => new Date().toISOString()),
    GIT_COMMIT: zod_1.z.string().default('unknown'),
    CORS_ORIGIN: zod_1.z.string().optional(),
    GLOBAL_RATE_LIMIT: zod_1.z.string().transform(Number).default('500'),
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
