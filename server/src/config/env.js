import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const numberFromEnv = (fallback) =>
  z.preprocess(
    (value) => (value === undefined || value === '' ? fallback : Number(value)),
    z.number().int().positive(),
  );

const booleanFromEnv = (fallback) =>
  z.preprocess((value) => {
    if (value === undefined || value === '') {
      return fallback;
    }

    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }

    return Boolean(value);
  }, z.boolean());

const envSchema = z.object({
  PORT: numberFromEnv(4000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  FRONTEND_URL: z
    .string()
    .trim()
    .min(1, 'FRONTEND_URL es obligatorio')
    .refine(
      (value) =>
        value
          .split(',')
          .map((url) => url.trim())
          .every((url) => {
            try {
              new URL(url);
              return true;
            } catch {
              return false;
            }
          }),
      'FRONTEND_URL debe contener URLs validas separadas por coma',
    )
    .default('http://localhost:5173'),
  DATABASE_URL: z.string().trim().min(1, 'DATABASE_URL es obligatorio'),
  JWT_SECRET: z.string().trim().min(16, 'JWT_SECRET debe tener al menos 16 caracteres'),
  JWT_EXPIRES_IN: z.string().trim().min(1).default('2h'),
  BCRYPT_SALT_ROUNDS: numberFromEnv(10),
  LOGIN_RATE_LIMIT_WINDOW_MS: numberFromEnv(600000),
  LOGIN_RATE_LIMIT_MAX: numberFromEnv(5),
  RATE_LIMIT_WINDOW_MS: numberFromEnv(900000),
  RATE_LIMIT_MAX: numberFromEnv(300),
  ENABLE_REQUEST_LOGS: booleanFromEnv(true),
  GOOGLE_CLIENT_ID: z.string().trim().min(1, 'GOOGLE_CLIENT_ID es obligatorio'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Error en variables de entorno:');
  console.error(parsedEnv.error.issues.map((issue) => `- ${issue.path.join('.')}: ${issue.message}`).join('\n'));
  process.exit(1);
}

const validatedEnv = parsedEnv.data;
const frontendUrls = validatedEnv.FRONTEND_URL.split(',').map((url) => url.trim()).filter(Boolean);

export const env = {
  port: validatedEnv.PORT,
  nodeEnv: validatedEnv.NODE_ENV,
  frontendUrl: frontendUrls[0],
  frontendUrls,
  databaseUrl: validatedEnv.DATABASE_URL,
  jwtSecret: validatedEnv.JWT_SECRET,
  jwtExpiresIn: validatedEnv.JWT_EXPIRES_IN,
  bcryptSaltRounds: validatedEnv.BCRYPT_SALT_ROUNDS,
  loginRateLimitWindowMs: validatedEnv.LOGIN_RATE_LIMIT_WINDOW_MS,
  loginRateLimitMax: validatedEnv.LOGIN_RATE_LIMIT_MAX,
  rateLimitWindowMs: validatedEnv.RATE_LIMIT_WINDOW_MS,
  rateLimitMax: validatedEnv.RATE_LIMIT_MAX,
  enableRequestLogs: validatedEnv.ENABLE_REQUEST_LOGS,
  googleClientId: validatedEnv.GOOGLE_CLIENT_ID,
};
