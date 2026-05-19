import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';
import { getActiveUserForAuth } from '../services/auth.service.js';
import { AppError } from '../utils/app-error.js';

const allowedRoles = ['ADMIN', 'CLIENTE', 'TECNICO'];

export const authenticateToken = (req, _res, next) => {
  const authHeader = req.headers.authorization;
  const [scheme, token] = authHeader?.split(' ') ?? [];

  if (scheme !== 'Bearer' || !token) {
    next(new AppError('Token de autenticacion requerido', 401));
    return;
  }

  if (!env.jwtSecret) {
    next(new AppError('JWT_SECRET no esta configurado', 500));
    return;
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);

    if (
      typeof payload !== 'object' ||
      !payload.sub ||
      typeof payload.email !== 'string' ||
      !allowedRoles.includes(payload.role)
    ) {
      next(new AppError('Token invalido o expirado', 401));
      return;
    }

    getActiveUserForAuth(payload.sub)
      .then((user) => {
        req.user = user;
        next();
      })
      .catch(next);
  } catch {
    next(new AppError('Token invalido o expirado', 401));
  }
};
