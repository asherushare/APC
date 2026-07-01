import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environmental values from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const envSchema = z.object({
  PORT: z.string().transform(Number).default('4000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim().replace(/^["']|["']$/g, '') : val),
    z.string().url('DATABASE_URL must be a valid PostgreSQL connection URL')
  ),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters long'),
  ENCRYPTION_KEY: z.string().length(64, 'ENCRYPTION_KEY must be exactly 64 hex characters (256-bit key)'),
  SUPABASE_URL: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim().replace(/^["']|["']$/g, '') : val),
    z.string().url('SUPABASE_URL must be a valid URL')
  ),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  SUPABASE_BUCKET: z.string().min(1, 'SUPABASE_BUCKET is required'),
  WHATSAPP_ADMIN_NUMBER: z.string().regex(/^\d+$/, 'WHATSAPP_ADMIN_NUMBER must be digits only').default('919348747578'),
  APP_VERSION: z.string().default('1.0.0'),
  BUILD_DATE: z.string().default(() => new Date().toISOString()),
  GIT_COMMIT: z.string().default('unknown'),
  CORS_ORIGIN: z.string().optional(),
  GLOBAL_RATE_LIMIT: z.string().transform(Number).default('500'),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  FRONTEND_URL: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim().replace(/^["']|["']$/g, '') : val),
    z.string().url('FRONTEND_URL must be a valid URL')
  ).default('http://localhost:3000'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment variables configuration:');
  // eslint-disable-next-line no-console
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const env = parsed.data;
export type EnvSchema = z.infer<typeof envSchema>;
