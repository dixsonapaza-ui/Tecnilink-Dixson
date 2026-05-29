import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/app-error.js';
import { logAuditAction } from './audit.service.js';

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

const getJwtSecret = () => {
  if (!env.jwtSecret) {
    throw new AppError('JWT_SECRET no esta configurado', 500);
  }

  return env.jwtSecret;
};

const signToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    getJwtSecret(),
    {
      expiresIn: env.jwtExpiresIn,
    },
  );

export const registerClient = async ({ name, email, password }) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    throw new AppError('El correo ya esta registrado', 409);
  }

  const hashedPassword = await bcrypt.hash(password, env.bcryptSaltRounds);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: 'CLIENTE',
    },
    select: publicUserSelect,
  });

  return user;
};

export const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.isActive) {
    throw new AppError('Credenciales incorrectas', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError('Credenciales incorrectas', 401);
  }

  const token = signToken(user);
  const { password: _password, ...safeUser } = user;

  logAuditAction('LOGIN', `User ${user.email} logged in`, user.id);

  return {
    token,
    user: safeUser,
  };
};

export const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: publicUserSelect,
  });

  if (!user) {
    throw new AppError('Usuario no encontrado', 404);
  }

  if (!user.isActive) {
    throw new AppError('Usuario inactivo', 403);
  }

  return user;
};

export const getActiveUserForAuth = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: publicUserSelect,
  });

  if (!user) {
    throw new AppError('Token invalido o expirado', 401);
  }

  if (!user.isActive) {
    throw new AppError('Usuario inactivo', 403);
  }

  return user;
};
