import { ZodError } from 'zod';

import { AppError } from '../utils/app-error.js';

const formatZodErrors = (error) =>
  error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));

export const validateRequest = (schema) => (req, _res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    req.body = parsed.body ?? req.body;
    req.params = parsed.params ?? req.params;
    req.query = parsed.query ?? req.query;

    next();
  } catch (error) {
    if (error instanceof ZodError) {
      next(new AppError('Datos invalidos', 400, formatZodErrors(error)));
      return;
    }

    next(error);
  }
};
