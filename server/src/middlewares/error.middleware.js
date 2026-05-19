import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { AppError } from '../utils/app-error.js';
import { sanitizeObject } from '../utils/sanitize.js';

export const notFoundMiddleware = (req, _res, next) => {
  next(new AppError(`Ruta no encontrada: ${req.originalUrl}`, 404));
};

const getStatusCode = (error) => {
  if (error.statusCode) {
    return error.statusCode;
  }

  if (error.type === 'entity.parse.failed') {
    return 400;
  }

  if (error.code === 'P2002') {
    return 409;
  }

  if (error.code === 'P2025') {
    return 404;
  }

  return 500;
};

const getMessage = (error, statusCode) => {
  if (statusCode === 500) {
    return 'Error interno del servidor';
  }

  if (error.type === 'entity.parse.failed') {
    return 'JSON invalido';
  }

  if (error.code === 'P2002') {
    return 'El recurso ya existe';
  }

  if (error.code === 'P2025') {
    return 'Recurso no encontrado';
  }

  return error.message;
};

export const errorMiddleware = (error, req, res, _next) => {
  const statusCode = getStatusCode(error);
  const response = {
    message: getMessage(error, statusCode),
    requestId: req.id,
  };

  if (error.details && statusCode < 500) {
    response.errors = error.details;
  }

  const logMeta = {
    requestId: req.id,
    method: req.method,
    path: req.originalUrl,
    statusCode,
    ip: req.ip,
    userId: req.user?.id,
    role: req.user?.role,
    body: sanitizeObject(req.body),
    query: sanitizeObject(req.query),
    params: sanitizeObject(req.params),
    error: {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: env.nodeEnv === 'production' ? undefined : error.stack,
    },
  };

  if (statusCode >= 500) {
    logger.error('Unhandled request error', logMeta);
  } else if (env.enableRequestLogs && statusCode !== 404) {
    logger.warn('Handled request error', logMeta);
  }

  res.status(statusCode).json(response);
};
