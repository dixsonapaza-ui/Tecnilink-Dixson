import { z } from 'zod';

import {
  DANGEROUS_INPUT_MESSAGE,
  isSafeInput,
  sanitizeText,
} from '../utils/input-sanitizer.js';

const emptyWhenNotString = (value) => (typeof value === 'string' ? value : '');

const nameRegex = /^[\p{L}\p{M}'\- ]+$/u;

const emailSchema = z
  .preprocess(
    (value) => emptyWhenNotString(value).trim(),
    z
      .string()
      .min(1, 'El correo es obligatorio')
      .max(254, 'El correo no debe superar 254 caracteres')
      .email('El correo no tiene un formato valido'),
  )
  .transform((email) => email.toLowerCase());

const passwordSchema = z
  .preprocess(
    (value) => emptyWhenNotString(value),
    z
      .string()
      .min(8, 'La contrasena debe tener al menos 8 caracteres')
      .max(72, 'La contrasena no debe superar 72 caracteres')
      .refine(
        (value) => /\d/.test(value),
        'La contrasena debe incluir al menos un numero',
      )
      .refine(
        (value) => !/[\x00-\x1F\x7F]/.test(value),
        'La contrasena contiene caracteres de control no permitidos',
      ),
  );

export const registerSchema = z.object({
  body: z.object({
    name: z.preprocess(
      (value) => sanitizeText(emptyWhenNotString(value)),
      z
        .string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'El nombre no debe superar 100 caracteres')
        .refine(
          (value) => nameRegex.test(value),
          'El nombre solo puede contener letras, espacios, apostrofes y guiones',
        )
        .refine(isSafeInput, DANGEROUS_INPUT_MESSAGE),
    ),
    email: emailSchema,
    password: passwordSchema,
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.preprocess(
      (value) => emptyWhenNotString(value),
      z
        .string()
        .min(1, 'La contrasena es obligatoria')
        .max(72, 'La contrasena no debe superar 72 caracteres'),
    ),
  }),
});

export const googleAuthSchema = z.object({
  body: z.object({
    credential: z.string().trim().min(1, 'El token de Google es obligatorio'),
  }),
});

export const registerTechnicianSchema = z.object({
  body: z.object({
    name: z.preprocess(
      (value) => sanitizeText(emptyWhenNotString(value)),
      z
        .string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'El nombre no debe superar 100 caracteres')
        .refine(
          (value) => nameRegex.test(value),
          'El nombre solo puede contener letras, espacios, apostrofes y guiones',
        )
        .refine(isSafeInput, DANGEROUS_INPUT_MESSAGE),
    ),
    email: emailSchema,
    password: passwordSchema,
    dni: z.preprocess(
      (value) => emptyWhenNotString(value).trim(),
      z
        .string()
        .min(1, 'El DNI es obligatorio')
        .regex(/^\d{8}$/, 'El DNI debe tener exactamente 8 digitos numericos'),
    ),
  }),
});
