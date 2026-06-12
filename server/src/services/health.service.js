import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';

const checkDatabase = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return {
      status: 'up',
    };
  } catch {
    return {
      status: 'down',
    };
  }
};

export const getHealthStatus = async (quick = false) => {
  const database = quick ? { status: 'up' } : await checkDatabase();
  const isHealthy = database.status === 'up';

  return {
    status: isHealthy ? 'ok' : 'degraded',
    message: 'Tecnilink API running',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv,
    database,
  };
};
