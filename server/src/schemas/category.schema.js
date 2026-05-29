import { z } from 'zod';

import {
  DANGEROUS_INPUT_MESSAGE,
  isSafeInput,
  sanitizeMultilineText,
  sanitizeText,
} from '../utils/input-sanitizer.js';
import { idParamSchema, paginationQuerySchema } from './common.schema.js';

const categoryBodySchema = z
  .object({
    name: z.preprocess(
      (value) => sanitizeText(typeof value === 'string' ? value : ''),
      z
        .string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(80, 'El nombre no debe superar 80 caracteres')
        .refine(isSafeInput, DANGEROUS_INPUT_MESSAGE),
    ),
    description: z.preprocess(
      (value) => sanitizeMultilineText(typeof value === 'string' ? value : ''),
      z
        .string()
        .min(5, 'La descripcion debe tener al menos 5 caracteres')
        .max(300, 'La descripcion no debe superar 300 caracteres')
        .refine(isSafeInput, DANGEROUS_INPUT_MESSAGE),
    ),
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
