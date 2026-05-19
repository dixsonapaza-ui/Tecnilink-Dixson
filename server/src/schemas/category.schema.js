import { z } from 'zod';

import { idParamSchema, paginationQuerySchema } from './common.schema.js';

const categoryBodySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(80, 'El nombre no debe superar 80 caracteres'),
    description: z
      .string()
      .trim()
      .min(5, 'La descripcion debe tener al menos 5 caracteres')
      .max(300, 'La descripcion no debe superar 300 caracteres'),
  })
  .strict();

export const listCategoriesSchema = z.object({
  query: paginationQuerySchema,
});

export const createCategorySchema = z.object({
  body: categoryBodySchema,
});

export const updateCategorySchema = z.object({
  params: idParamSchema,
  body: categoryBodySchema
    .extend({
      isActive: z.boolean().optional(),
    })
    .partial()
    .refine((value) => Object.keys(value).length > 0, {
      message: 'Debes enviar al menos un campo para actualizar',
    }),
});

export const categoryIdParamSchema = z.object({
  params: idParamSchema,
});
