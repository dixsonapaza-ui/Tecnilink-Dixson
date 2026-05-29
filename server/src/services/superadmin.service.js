import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/app-error.js';
import { buildPaginationMeta, getPagination } from '../utils/pagination.js';

export const getGlobalMetrics = async () => {
  const [
    totalUsers,
    totalTechnicians,
    totalRequests,
    pendingRequests,
    attendedRequests,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'CLIENTE' } }),
    prisma.user.count({ where: { role: 'TECNICO' } }),
    prisma.technicalRequest.count(),
    prisma.technicalRequest.count({ where: { status: 'PENDIENTE' } }),
    prisma.technicalRequest.count({ where: { status: 'ATENDIDA' } }),
  ]);

  return {
    users: totalUsers,
    technicians: totalTechnicians,
    requests: totalRequests,
    pendingRequests,
    attendedRequests,
  };
};

export const listAdmins = async () => {
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return admins;
};

export const createAdmin = async ({ name, email, password }) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError('El correo ya esta registrado', 409);
  }

  const hashedPassword = await bcrypt.hash(password, env.bcryptSaltRounds);

  const admin = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: 'ADMIN',
    },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      createdAt: true,
    },
  });

  return admin;
};

export const deactivateAdmin = async (adminId) => {
  const admin = await prisma.user.findUnique({
    where: { id: adminId },
  });

  if (!admin || admin.role !== 'ADMIN') {
    throw new AppError('Administrador no encontrado', 404);
  }

  return prisma.user.update({
    where: { id: adminId },
    data: { isActive: !admin.isActive }, // Toggle active status
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
    },
  });
};

export const listAuditLogs = async (filters) => {
  const pagination = getPagination(filters);

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    }),
    prisma.auditLog.count(),
  ]);

  return {
    data: logs,
    meta: buildPaginationMeta({
      page: pagination.page,
      limit: pagination.limit,
      total,
    }),
  };
};
