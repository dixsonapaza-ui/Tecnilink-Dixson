import { PrismaClient } from '@prisma/client';

import { env } from './env.js';

const prismaClient =
  globalThis.tecnilinkPrisma ||
  new PrismaClient({
    log: env.nodeEnv === 'development' && env.enableRequestLogs ? ['warn'] : [],
  });

if (env.nodeEnv !== 'production') {
  globalThis.tecnilinkPrisma = prismaClient;
}

export const prisma = prismaClient;
