import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/app-error.js';
import { logAuditAction } from './audit.service.js';
import { validateDni } from './reniec.service.js';

const googleClient = new OAuth2Client(env.googleClientId);

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  avatarUrl: true,
  phone: true,
  bio: true,
  specialty: true,
  experienceYears: true,
  serviceArea: true,
  dni: true,
  dniVerified: true,
  dniVerifiedAt: true,
  reniecCodigoVerificacion: true,
  reniecNombres: true,
  reniecApellidoPaterno: true,
  reniecApellidoMaterno: true,
  reniecNombreCompleto: true,
  reniecDepartamento: true,
  reniecProvincia: true,
  reniecDistrito: true,
  reniecDireccion: true,
  reniecDireccionCompleta: true,
  reniecUbigeoReniec: true,
  reniecUbigeoSunat: true,
  reniecUbigeo: true,
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

export const registerTechnician = async ({ name, email, password, dni }) => {
  const existingEmail = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingEmail) {
    throw new AppError('El correo ya esta registrado', 409);
  }

  const existingDni = await prisma.user.findUnique({
    where: { dni },
    select: { id: true },
  });

  if (existingDni) {
    throw new AppError('El DNI ya esta registrado en el sistema', 409);
  }

  // Validate DNI against RENIEC/Factiliza API
  const reniecData = await validateDni(dni);

  const hashedPassword = await bcrypt.hash(password, env.bcryptSaltRounds);

  const user = await prisma.user.create({
    data: {
      name: reniecData.reniecNombreCompleto || 'Tecnico Pendiente',
      email,
      password: hashedPassword,
      role: 'TECNICO',
      dniVerified: true,
      dniVerifiedAt: new Date(),
      ...reniecData,
    },
    select: {
      ...publicUserSelect,
      dni: true,
      dniVerified: true,
      reniecNombreCompleto: true,
    },
  });

  logAuditAction('REGISTER', `Technician ${email} registered with DNI ${dni} verified via RENIEC`, user.id);

  return user;
};

export const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.isActive) {
    throw new AppError('Credenciales incorrectas', 401);
  }

  if (!user.password) {
    throw new AppError('Esta cuenta inicio sesion con Google. Por favor, usa la opcion de Google.', 401);
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

export const loginOrCreateGoogleUser = async ({ credential }) => {
  if (!credential) {
    throw new AppError('El token de Google es obligatorio', 400);
  }

  let payload;
  try {
    if (env.nodeEnv === 'development' && credential.endsWith('.mock-signature')) {
      const base64Payload = credential.split('.')[1];
      const decodedPayload = Buffer.from(base64Payload, 'base64').toString('utf-8');
      payload = JSON.parse(decodedPayload);
    } else {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: env.googleClientId,
      });
      payload = ticket.getPayload();
    }
  } catch (error) {
    console.error('Error al verificar token de Google:', error);
    throw new AppError('Token de Google invalido o expirado', 401);
  }

  const { email, email_verified, name, picture, sub: googleId } = payload;

  if (!email) {
    throw new AppError('No se pudo obtener el correo de Google', 400);
  }

  if (!email_verified) {
    throw new AppError('El correo de Google no esta verificado', 400);
  }

  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    // Register new user with CLIENTE role and null password
    user = await prisma.user.create({
      data: {
        name,
        email,
        googleId,
        avatarUrl: picture,
        authProvider: 'GOOGLE',
        role: 'CLIENTE',
      },
    });
    logAuditAction('REGISTER', `User ${email} registered via Google`, user.id);
  } else {
    if (!user.isActive) {
      throw new AppError('Usuario inactivo', 403);
    }
    // Update existing user with Google details if not set
    const updateData = {};
    if (!user.googleId) updateData.googleId = googleId;
    if (!user.authProvider) updateData.authProvider = 'GOOGLE';
    if (!user.avatarUrl && picture) updateData.avatarUrl = picture;

    if (Object.keys(updateData).length > 0) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });
    }
  }

  const token = signToken(user);
  const { password: _password, ...safeUser } = user;

  logAuditAction('LOGIN', `User ${user.email} logged in via Google`, user.id);

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
