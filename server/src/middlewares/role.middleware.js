import { AppError } from '../utils/app-error.js';

export const authorizeRoles = (...roles) => (req, _res, next) => {
  if (!req.user) {
    next(new AppError('Autenticacion requerida', 401));
    return;
  }

  if (!roles.includes(req.user.role)) {
    next(new AppError('No tienes permisos para acceder a este recurso', 403));
    return;
  }

  next();
};
