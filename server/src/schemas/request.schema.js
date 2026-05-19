import { z } from 'zod';

import { idParamSchema, paginationQuerySchema } from './common.schema.js';

const requestStatusSchema = z.enum(['PENDIENTE', 'EN_PROCESO', 'ATENDIDA', 'CANCELADA']);
const requestPrioritySchema = z.enum(['BAJA', 'MEDIA', 'ALTA']);

const optionalFilter = (schema) =>
  z.preprocess((value) => (value === undefined || value === '' ? undefined : value), schema.optional());

export const listRequestsSchema = z.object({
  query: paginationQuerySchema.extend({
    status: optionalFilter(requestStatusSchema),
    priority: optionalFilter(requestPrioritySchema),
    categoryId: optionalFilter(z.string().trim().min(1, 'categoryId no puede estar vacio')),
  }),
});

export const createRequestSchema = z.object({
  body: z
    .object({
      title: z
        .string()
        .trim()
        .min(3, 'El titulo debe tener al menos 3 caracteres')
        .max(120, 'El titulo no debe superar 120 caracteres'),
      description: z
        .string()
        .trim()
        .min(10, 'La descripcion debe tener al menos 10 caracteres')
        .max(1000, 'La descripcion no debe superar 1000 caracteres'),
      priority: requestPrioritySchema.default('MEDIA'),
      categoryId: z.string().trim().min(1, 'La categoria es obligatoria'),
    })
    .strict(),
});

export const requestIdParamSchema = z.object({
  params: idParamSchema,
});

export const updateRequestSchema = z.object({
  params: idParamSchema,
  body: z
    .object({
      title: z
        .string()
        .trim()
        .min(3, 'El titulo debe tener al menos 3 caracteres')
        .max(120, 'El titulo no debe superar 120 caracteres')
        .optional(),
      description: z
        .string()
        .trim()
        .min(10, 'La descripcion debe tener al menos 10 caracteres')
        .max(1000, 'La descripcion no debe superar 1000 caracteres')
        .optional(),
      priority: requestPrioritySchema.optional(),
      categoryId: z.string().trim().min(1, 'La categoria es obligatoria').optional(),
    })
    .strict()
    .refine((value) => Object.keys(value).length > 0, {
      message: 'Debes enviar al menos un campo para actualizar',
    }),
});

export const assignRequestSchema = z.object({
  params: idParamSchema,
  body: z
    .object({
      technicianId: z.string().trim().min(1, 'El tecnico es obligatorio'),
    })
    .strict(),
});

export const updateRequestStatusSchema = z.object({
  params: idParamSchema,
  body: z
    .object({
      status: z.enum(['EN_PROCESO', 'ATENDIDA']),
    })
    .strict(),
});

export const listCommentsSchema = z.object({
  params: idParamSchema,
  query: paginationQuerySchema,
});

export const createCommentSchema = z.object({
  params: idParamSchema,
  body: z
    .object({
      content: z
        .string()
        .trim()
        .min(2, 'El comentario debe tener al menos 2 caracteres')
        .max(1000, 'El comentario no debe superar 1000 caracteres'),
    })
    .strict(),
});
