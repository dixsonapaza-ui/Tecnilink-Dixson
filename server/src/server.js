import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { prisma } from './config/prisma.js';
import { escalateIdleRequests } from './services/assignment.service.js';

const server = app.listen(env.port, () => {
  logger.info('Tecnilink API started', {
    port: env.port,
    environment: env.nodeEnv,
  });
});

const ESCALATION_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const escalationInterval = setInterval(async () => {
  logger.info('Running background auto-escalation engine...');
  await escalateIdleRequests();
}, ESCALATION_INTERVAL_MS);

const shutdown = async (signal) => {
  logger.info('Shutting down Tecnilink API', { signal });
  clearInterval(escalationInterval);

  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { reason });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error });
  process.exit(1);
});
