import { prisma } from '../config/prisma.js';
import { createNotification } from './notification.service.js';
import { logger } from '../config/logger.js';

export const findBestTechnician = async (categoryId) => {
  const category = await prisma.serviceCategory.findUnique({
    where: { id: categoryId },
  });
  if (!category) return null;

  // Find active technicians matching the specialty (contains search, case-insensitive)
  const technicians = await prisma.user.findMany({
    where: {
      role: 'TECNICO',
      isActive: true,
      specialty: {
        contains: category.name,
        mode: 'insensitive',
      },
    },
  });

  if (technicians.length === 0) return null;

  // Get active counts for matching technicians
  const candidateTechs = await Promise.all(
    technicians.map(async (tech) => {
      const activeCount = await prisma.technicalRequest.count({
        where: {
          technicianId: tech.id,
          status: 'EN_PROCESO',
        },
      });
      return { tech, activeCount };
    })
  );

  // Sort by active workload ascending
  candidateTechs.sort((a, b) => a.activeCount - b.activeCount);

  // Get company settings for max active jobs limit
  let settings = await prisma.companySettings.findFirst();
  if (!settings) {
    settings = { maxActiveJobs: 3 };
  }

  const bestCandidate = candidateTechs[0];
  if (bestCandidate && bestCandidate.activeCount < settings.maxActiveJobs) {
    return bestCandidate.tech;
  }

  return null;
};

export const autoAssignRequest = async (requestId) => {
  try {
    const request = await prisma.technicalRequest.findUnique({
      where: { id: requestId },
    });
    if (!request || request.technicianId) return;

    const bestTech = await findBestTechnician(request.categoryId);
    if (bestTech) {
      await prisma.technicalRequest.update({
        where: { id: requestId },
        data: {
          technicianId: bestTech.id,
          status: 'EN_PROCESO',
          acceptedAt: new Date(),
        },
      });

      logger.info('Request automatically assigned to technician', { requestId, technicianId: bestTech.id });
      await createNotification(
        bestTech.id,
        'Nuevo trabajo asignado automáticamente',
        `Se te ha asignado el caso: ${request.title}.`
      );
    } else {
      logger.info('No available technicians found for auto-assignment', { requestId });
    }
  } catch (error) {
    logger.error('Error during auto-assignment of technical request', { requestId, error });
  }
};

export const escalateIdleRequests = async () => {
  try {
    // Escalate requests that have been DISPONIBLE for over 30 minutes and are still unassigned
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const idleRequests = await prisma.technicalRequest.findMany({
      where: {
        status: 'DISPONIBLE',
        technicianId: null,
        createdAt: {
          lt: thirtyMinutesAgo,
        },
        priority: {
          not: 'ALTA',
        },
      },
    });

    if (idleRequests.length === 0) return;

    for (const req of idleRequests) {
      const nextPriority = req.priority === 'BAJA' ? 'MEDIA' : 'ALTA';
      await prisma.technicalRequest.update({
        where: { id: req.id },
        data: { priority: nextPriority },
      });
      logger.info('Technical request auto-escalated', { requestId: req.id, newPriority: nextPriority });

      const category = await prisma.serviceCategory.findUnique({ where: { id: req.categoryId } });
      if (category) {
        const technicians = await prisma.user.findMany({
          where: {
            role: 'TECNICO',
            isActive: true,
            specialty: {
              contains: category.name,
              mode: 'insensitive',
            },
          },
        });
        
        for (const tech of technicians) {
          await createNotification(
            tech.id,
            '⚠️ Trabajo urgente disponible (Escalado)',
            `El caso "${req.title}" lleva más de 30 minutos disponible. Prioridad elevada a ${nextPriority}.`
          );
        }
      }
    }
  } catch (error) {
    logger.error('Error running automatic escalation engine', { error });
  }
};
