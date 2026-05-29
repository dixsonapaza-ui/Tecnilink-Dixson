import { z } from 'zod';

import { isValidCuid } from '../utils/input-sanitizer.js';

export const idParamSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1, 'El id es obligatorio')
    .refine(isValidCuid, { message: 'El id tiene un formato invalido' }),
});

export const paginationQuerySchema = z.object({
  page: z.preprocess(
    (value) => {
      if (value === undefined || value === '') {
        return 1;
      }

      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : NaN;
    },
    z.number({ invalid_type_error: 'page debe ser un numero valido' })
      .int('page debe ser un entero')
      .min(1, 'page debe ser mayor o igual a 1'),
  ),
  limit: z.preprocess(
    (value) => {
      if (value === undefined || value === '') {
        return 10;
      }

      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : NaN;
    },
    z.number({ invalid_type_error: 'limit debe ser un numero valido' })
      .int('limit debe ser un entero')
      .min(1, 'limit debe ser mayor o igual a 1')
      .max(100, 'limit no debe superar 100'),
  ),
});
