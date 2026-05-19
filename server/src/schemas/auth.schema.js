import { z } from 'zod';

const emptyWhenNotString = (value) => (typeof value === 'string' ? value : '');

const emailSchema = z
  .preprocess(
    (value) => emptyWhenNotString(value).trim(),
    z
      .string()
      .min(1, 'El correo es obligatorio')
      .email('El correo no tiene un formato valido'),
  )
  .transform((email) => email.toLowerCase());

const passwordSchema = z
  .preprocess(
    (value) => emptyWhenNotString(value),
    z
      .string()
      .min(8, 'La contrasena debe tener al menos 8 caracteres')
      .max(72, 'La contrasena no debe superar 72 caracteres'),
  );

export const registerSchema = z.object({
  body: z.object({
    name: z.preprocess(
      (value) => emptyWhenNotString(value).trim(),
      z
        .string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'El nombre no debe superar 100 caracteres'),
    ),
    email: emailSchema,
    password: passwordSchema,
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
  }),
});
