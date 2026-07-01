import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';
import { buildPaginationMeta, getPagination } from '../utils/pagination.js';
import { logAuditAction } from './audit.service.js';
import { getCompanySettings } from './settings.service.js';
import { autoAssignRequest } from './assignment.service.js';
import { createNotification } from './notification.service.js';

const userSummarySelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  avatarUrl: true,
};

const requestInclude = {
  client: {
    select: userSummarySelect,
  },
  technician: {
    select: userSummarySelect,
  },
  category: true,
};

const commentInclude = {
  author: {
    select: userSummarySelect,
  },
};

const getRequestAccessWhere = (user) => {
  if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
    return {};
  }

  if (user.role === 'CLIENTE') {
    return { clientId: user.id };
  }

  return { technicianId: user.id };
};

const ensureRequestExists = async (requestId) => {
  const request = await prisma.technicalRequest.findUnique({
    where: { id: requestId },
    include: requestInclude,
  });

  if (!request) {
    throw new AppError('Solicitud no encontrada', 404);
  }

  return request;
};

const ensureRequestAccess = (request, user) => {
  const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
  const isOwner = user.role === 'CLIENTE' && request.clientId === user.id;
  const isAssignedTechnician =
    user.role === 'TECNICO' && request.technicianId === user.id;

  if (!isAdmin && !isOwner && !isAssignedTechnician) {
    throw new AppError('No tienes permisos para acceder a esta solicitud', 403);
  }
};

const ensureActiveCategory = async (categoryId) => {
  const category = await prisma.serviceCategory.findUnique({
    where: { id: categoryId },
  });

  if (!category || !category.isActive) {
    throw new AppError('Categoria no encontrada o inactiva', 404);
  }

  return category;
};

export const listRequests = async (user, filters) => {
  const pagination = getPagination(filters);
  const where = {
    ...getRequestAccessWhere(user),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.priority ? { priority: filters.priority } : {}),
    ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
  };

  const [requests, total] = await prisma.$transaction([
    prisma.technicalRequest.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: 'desc' },
      include: requestInclude,
    }),
    prisma.technicalRequest.count({ where }),
  ]);

  return {
    data: requests,
    meta: buildPaginationMeta({
      page: pagination.page,
      limit: pagination.limit,
      total,
    }),
  };
};

export const createRequest = async (user, data) => {
  if (user.role !== 'CLIENTE') {
    throw new AppError('Solo los clientes pueden crear solicitudes', 403);
  }

  await ensureActiveCategory(data.categoryId);

  const settings = await getCompanySettings();
  let initialStatus = 'PENDIENTE';
  if (settings.assignmentMode === 'SELF_ASSIGNMENT') {
    initialStatus = 'DISPONIBLE';
  }

  const request = await prisma.technicalRequest.create({
    data: {
      title: data.title,
      description: data.description,
      priority: data.priority,
      categoryId: data.categoryId,
      clientId: user.id,
      status: initialStatus,
    },
    include: requestInclude,
  });

  logAuditAction('CREATE_REQUEST', `Request created: ${request.title}`, user.id);

  if (settings.assignmentMode === 'AUTO') {
    await autoAssignRequest(request.id);
    return prisma.technicalRequest.findUnique({
      where: { id: request.id },
      include: requestInclude,
    });
  }

  if (settings.assignmentMode === 'SELF_ASSIGNMENT') {
    const category = await prisma.serviceCategory.findUnique({ where: { id: data.categoryId } });
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
          'Trabajo disponible',
          `Hay una nueva solicitud disponible en tu especialidad: "${request.title}".`
        );
      }
    }
  }

  return request;
};

export const getRequestById = async (user, requestId) => {
  const request = await ensureRequestExists(requestId);

  ensureRequestAccess(request, user);

  return request;
};

export const updateRequest = async (user, requestId, data) => {
  const request = await ensureRequestExists(requestId);

  if (user.role === 'TECNICO') {
    throw new AppError('Los tecnicos no pueden editar datos generales de solicitudes', 403);
  }

  if (user.role === 'CLIENTE') {
    if (request.clientId !== user.id) {
      throw new AppError('No tienes permisos para editar esta solicitud', 403);
    }

    if (request.status !== 'PENDIENTE' && request.status !== 'DISPONIBLE') {
      throw new AppError('Solo puedes editar solicitudes pendientes o disponibles', 409);
    }
  }

  if (data.categoryId) {
    await ensureActiveCategory(data.categoryId);
  }

  return prisma.technicalRequest.update({
    where: { id: requestId },
    data,
    include: requestInclude,
  });
};

export const assignRequestTechnician = async (user, requestId, technicianId) => {
  await ensureRequestExists(requestId);

  const technician = await prisma.user.findUnique({
    where: { id: technicianId },
    select: userSummarySelect,
  });

  if (!technician || !technician.isActive || technician.role !== 'TECNICO') {
    throw new AppError('Tecnico no encontrado o inactivo', 404);
  }

  const updatedRequest = await prisma.technicalRequest.update({
    where: { id: requestId },
    data: {
      technicianId,
      status: 'EN_PROCESO',
      acceptedAt: new Date(),
    },
    include: requestInclude,
  });

  logAuditAction('ASSIGN_REQUEST', `Request ${requestId} assigned to technician ${technicianId}`, user.id);

  return updatedRequest;
};

export const updateAssignedRequestStatus = async (user, requestId, status) => {
  const request = await ensureRequestExists(requestId);

  if (request.technicianId !== user.id) {
    throw new AppError('Solo el tecnico asignado puede actualizar el estado', 403);
  }

  if (request.status === 'CANCELADA') {
    throw new AppError('No se puede actualizar una solicitud cancelada', 409);
  }

  const updatedRequest = await prisma.technicalRequest.update({
    where: { id: requestId },
    data: { status },
    include: requestInclude,
  });

  logAuditAction('STATUS_CHANGE', `Request ${requestId} status changed to ${status}`, user.id);

  return updatedRequest;
};

export const cancelRequest = async (user, requestId) => {
  const request = await ensureRequestExists(requestId);

  if (user.role === 'TECNICO') {
    throw new AppError('Los tecnicos no pueden cancelar solicitudes', 403);
  }

  if (user.role === 'CLIENTE' && request.clientId !== user.id) {
    throw new AppError('No tienes permisos para cancelar esta solicitud', 403);
  }

  if (request.status !== 'PENDIENTE' && request.status !== 'DISPONIBLE') {
    throw new AppError('Solo se pueden cancelar solicitudes pendientes o disponibles', 409);
  }

  return prisma.technicalRequest.update({
    where: { id: requestId },
    data: { status: 'CANCELADA' },
    include: requestInclude,
  });
};

export const listRequestComments = async (user, requestId, filters) => {
  const request = await ensureRequestExists(requestId);
  ensureRequestAccess(request, user);

  const pagination = getPagination(filters);
  const where = { requestId };

  const [comments, total] = await prisma.$transaction([
    prisma.requestComment.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: 'asc' },
      include: commentInclude,
    }),
    prisma.requestComment.count({ where }),
  ]);

  return {
    data: comments,
    meta: buildPaginationMeta({
      page: pagination.page,
      limit: pagination.limit,
      total,
    }),
  };
};

export const createRequestComment = async (user, requestId, { content }) => {
  const request = await ensureRequestExists(requestId);
  ensureRequestAccess(request, user);

  return prisma.requestComment.create({
    data: {
      content,
      requestId,
      authorId: user.id,
    },
    include: commentInclude,
  });
};

export const getActiveTechnicians = async () => {
  return prisma.user.findMany({
    where: {
      role: 'TECNICO',
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      specialty: true,
      serviceArea: true,
    },
    orderBy: {
      name: 'asc',
    },
  });
};

export const listAvailableRequestsForTechnician = async (user, filters) => {
  if (user.role !== 'TECNICO') {
    throw new AppError('Solo los técnicos pueden ver trabajos disponibles', 403);
  }

  const techUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  const pagination = getPagination(filters);
  const where = {
    status: 'DISPONIBLE',
    technicianId: null,
  };

  if (techUser.specialty) {
    const specialties = techUser.specialty.split(',').map((s) => s.trim()).filter(Boolean);
    if (specialties.length > 0) {
      where.category = {
        OR: specialties.map((sp) => ({
          name: { contains: sp, mode: 'insensitive' },
        })),
      };
    }
  }

  const [requests, total] = await prisma.$transaction([
    prisma.technicalRequest.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: 'desc' },
      include: requestInclude,
    }),
    prisma.technicalRequest.count({ where }),
  ]);

  return {
    data: requests,
    meta: buildPaginationMeta({
      page: pagination.page,
      limit: pagination.limit,
      total,
    }),
  };
};

export const takeRequest = async (user, requestId) => {
  if (user.role !== 'TECNICO') {
    throw new AppError('Solo los técnicos pueden tomar trabajos', 403);
  }

  const settings = await getCompanySettings();
  if (settings.assignmentMode !== 'SELF_ASSIGNMENT') {
    throw new AppError('El modo de autoasignación no está habilitado actualmente.', 400);
  }

  const activeCount = await prisma.technicalRequest.count({
    where: {
      technicianId: user.id,
      status: 'EN_PROCESO',
    },
  });

  if (activeCount >= settings.maxActiveJobs) {
    throw new AppError(`Has alcanzado el límite máximo de ${settings.maxActiveJobs} trabajos activos simultáneos. Termina un caso antes de tomar otro.`, 400);
  }

  const request = await prisma.technicalRequest.findUnique({
    where: { id: requestId },
    include: { category: true },
  });

  if (!request) {
    throw new AppError('Solicitud no encontrada', 404);
  }

  const techUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (techUser && techUser.specialty) {
    const specialties = techUser.specialty.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    const categoryName = request.category?.name.toLowerCase() || '';
    const isMatch = specialties.some((sp) => categoryName.includes(sp));
    if (!isMatch) {
      throw new AppError('No cuentas con la especialidad necesaria para tomar esta solicitud.', 403);
    }
  }

  if (request.status !== 'DISPONIBLE' || request.technicianId !== null) {
    throw new AppError('Esta solicitud ya fue tomada por otro técnico.', 409);
  }

  const updated = await prisma.technicalRequest.updateMany({
    where: {
      id: requestId,
      status: 'DISPONIBLE',
      technicianId: null,
    },
    data: {
      technicianId: user.id,
      status: 'EN_PROCESO',
      acceptedAt: new Date(),
    },
  });

  if (updated.count === 0) {
    throw new AppError('Esta solicitud ya fue tomada por otro técnico.', 409);
  }

  logAuditAction('TAKE_REQUEST', `Technician ${user.id} took request ${requestId}`, user.id);

  return prisma.technicalRequest.findUnique({
    where: { id: requestId },
    include: requestInclude,
  });
};

export const releaseRequest = async (user, requestId) => {
  if (user.role !== 'TECNICO') {
    throw new AppError('Solo los técnicos pueden liberar trabajos', 403);
  }

  const request = await ensureRequestExists(requestId);

  if (request.technicianId !== user.id) {
    throw new AppError('No tienes asignada esta solicitud', 403);
  }

  if (request.status !== 'EN_PROCESO') {
    throw new AppError('Solo se pueden liberar solicitudes que estén en proceso', 409);
  }

  const updatedRequest = await prisma.technicalRequest.update({
    where: { id: requestId },
    data: {
      technicianId: null,
      status: 'DISPONIBLE',
      acceptedAt: null,
    },
    include: requestInclude,
  });

  logAuditAction('RELEASE_REQUEST', `Technician ${user.id} released request ${requestId}`, user.id);

  const category = await prisma.serviceCategory.findUnique({ where: { id: request.categoryId } });
  if (category) {
    const technicians = await prisma.user.findMany({
      where: {
        role: 'TECNICO',
        isActive: true,
        specialty: {
          contains: category.name,
          mode: 'insensitive',
        },
        id: { not: user.id },
      },
    });
    for (const tech of technicians) {
      await createNotification(
        tech.id,
        'Trabajo devuelto a la cola',
        `El caso "${request.title}" está disponible nuevamente para ser tomado.`
      );
    }
  }

  return updatedRequest;
};
