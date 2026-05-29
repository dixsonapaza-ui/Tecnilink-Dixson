/**
 * Centralized input sanitization utilities for Tecnilink frontend.
 *
 * These mirror the backend sanitizers to provide client-side pre-validation
 * before sending requests to the API. The backend remains the authoritative
 * validation layer.
 */

// Unicode control characters and invisible characters to strip.
const INVISIBLE_CHARS_REGEX =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u0080-\u009F\u200B-\u200F\u2028-\u202F\u2060\uFEFF]/g;

// Keys that should never be set via dynamic event.target.name to prevent prototype pollution.
const PROTOTYPE_POLLUTION_KEYS = new Set([
  '__proto__',
  'constructor',
  'prototype',
  'toString',
  'valueOf',
  'hasOwnProperty',
  'isPrototypeOf',
]);

/**
 * Collapse multiple consecutive whitespace characters (spaces, tabs)
 * into a single space.
 */
const collapseSpaces = (value) => value.replace(/[^\S\n]+/g, ' ');

/**
 * Sanitize a single-line text input.
 */
export const sanitizeText = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  let clean = value.replace(INVISIBLE_CHARS_REGEX, '');
  clean = clean.replace(/[\t\r\n]/g, ' ');
  clean = collapseSpaces(clean);
  clean = clean.trim();

  return clean;
};

/**
 * Sanitize a multi-line text input (descriptions, comments).
 */
export const sanitizeMultilineText = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  let clean = value.replace(INVISIBLE_CHARS_REGEX, '');
  clean = clean.replace(/\r\n/g, '\n');
  clean = clean.replace(/\r/g, '\n');
  clean = clean.replace(/\t/g, ' ');
  clean = clean
    .split('\n')
    .map((line) => collapseSpaces(line).trim())
    .join('\n');
  clean = clean.replace(/\n{3,}/g, '\n\n');
  clean = clean.trim();

  return clean;
};

/**
 * Check if a key is a prototype pollution attempt.
 */
export const isPrototypePollutionKey = (key) => PROTOTYPE_POLLUTION_KEYS.has(key);

/**
 * Create a safe handleChange function that rejects prototype pollution keys.
 * Returns a standard React change handler.
 */
export const createSafeChangeHandler = (setter) => (event) => {
  const { name, value } = event.target;

  if (isPrototypePollutionKey(name)) {
    return;
  }

  setter((current) => ({
    ...current,
    [name]: value,
  }));
};

/**
 * Validate email format (basic check for client-side feedback).
 * The backend performs the definitive validation.
 */
export const validateEmail = (email) => {
  const trimmed = (email || '').trim();

  if (!trimmed) {
    return 'El correo es obligatorio';
  }

  if (trimmed.length > 254) {
    return 'El correo no debe superar 254 caracteres';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return 'El correo no tiene un formato valido';
  }

  return '';
};

/**
 * Validate password complexity.
 * Returns an array of human-readable error strings.
 */
export const validatePassword = (password) => {
  const errors = [];

  if (!password) {
    errors.push('La contrasena es obligatoria');
    return errors;
  }

  if (password.length < 8) {
    errors.push('La contrasena debe tener al menos 8 caracteres');
  }

  if (password.length > 72) {
    errors.push('La contrasena no debe superar 72 caracteres');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Debe incluir al menos una letra minuscula');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Debe incluir al menos una letra mayuscula');
  }

  if (!/\d/.test(password)) {
    errors.push('Debe incluir al menos un numero');
  }

  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)) {
    errors.push('Debe incluir al menos un caracter especial');
  }

  return errors;
};

/**
 * Validate a person name.
 */
export const validateName = (name) => {
  const trimmed = sanitizeText(name);

  if (!trimmed) {
    return 'El nombre es obligatorio';
  }

  if (trimmed.length < 2) {
    return 'El nombre debe tener al menos 2 caracteres';
  }

  if (trimmed.length > 100) {
    return 'El nombre no debe superar 100 caracteres';
  }

  if (!/^[\p{L}\p{M}'\- ]+$/u.test(trimmed)) {
    return 'El nombre solo puede contener letras, espacios, apostrofes y guiones';
  }

  return '';
};
