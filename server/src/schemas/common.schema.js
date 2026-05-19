import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.string().trim().min(1, 'El id es obligatorio'),
});

export const paginationQuerySchema = z.object({
  page: z.preprocess(
    (value) => (value === undefined || value === '' ? 1 : Number(value)),
    z.number().int('page debe ser un entero').min(1, 'page debe ser mayor o igual a 1'),
  ),
  limit: z.preprocess(
    (value) => (value === undefined || value === '' ? 10 : Number(value)),
    z
      .number()
      .int('limit debe ser un entero')
      .min(1, 'limit debe ser mayor o igual a 1')
      .max(100, 'limit no debe superar 100'),
  ),
});
