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

  let stats = {
    technicians: 500,
    services: 2500,
    satisfaction: 98,
    time: 15,
  };

  if (!quick && isHealthy) {
    try {
      const activeTechs = await prisma.user.count({
        where: { role: 'TECNICO', isActive: true },
      });
      const completedServices = await prisma.technicalRequest.count({
        where: { status: 'ATENDIDA' },
      });

      // Calcular tiempo promedio de respuesta en minutos
      const assignedRequests = await prisma.technicalRequest.findMany({
        where: {
          acceptedAt: { not: null },
        },
        select: {
          createdAt: true,
          acceptedAt: true,
        },
      });

      let avgTime = 15;
      if (assignedRequests.length > 0) {
        const totalMinutes = assignedRequests.reduce((sum, req) => {
          const diffMs = new Date(req.acceptedAt) - new Date(req.createdAt);
          return sum + Math.max(0, diffMs / 1000 / 60);
        }, 0);
        avgTime = Math.max(1, Math.round(totalMinutes / assignedRequests.length));
      }

      stats = {
        technicians: activeTechs,
        services: completedServices,
        satisfaction: 98,
        time: avgTime,
      };
    } catch (e) {
      console.error('Error fetching landing page stats:', e);
    }
  }

  return {
    status: isHealthy ? 'ok' : 'degraded',
    message: 'Tecnilink API running',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv,
    database,
    stats,
  };
};
