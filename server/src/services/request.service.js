import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';
import { buildPaginationMeta, getPagination } from '../utils/pagination.js';
import { logAuditAction } from './audit.service.js';

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
  if (user.role === 'ADMIN') {
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
  const isAdmin = user.role === 'ADMIN';
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

  const request = await prisma.technicalRequest.create({
    data: {
      title: data.title,
      description: data.description,
      priority: data.priority,
      categoryId: data.categoryId,
      clientId: user.id,
    },
    include: requestInclude,
  });

  logAuditAction('CREATE_REQUEST', `Request created: ${request.title}`, user.id);

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

    if (request.status !== 'PENDIENTE') {
      throw new AppError('Solo puedes editar solicitudes pendientes', 409);
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
    data: { technicianId },
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

  if (request.status !== 'PENDIENTE') {
    throw new AppError('Solo se pueden cancelar solicitudes pendientes', 409);
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
