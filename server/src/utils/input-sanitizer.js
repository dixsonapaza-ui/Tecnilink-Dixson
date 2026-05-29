/**
 * Centralized input sanitization utilities for Tecnilink API.
 *
 * These functions are designed to be used inside Zod schemas as
 * `.preprocess()` transformations and `.refine()` checks, integrating
 * seamlessly with the existing validateRequest middleware.
 */

// Unicode control characters and invisible characters to strip.
// Ranges: C0 controls (except \n \r \t), DEL, C1 controls,
// zero-width and directional formatting characters, BOM.
const INVISIBLE_CHARS_REGEX =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u0080-\u009F\u200B-\u200F\u2028-\u202F\u2060\uFEFF]/g;

// Dangerous patterns that indicate XSS, HTML injection, or SQL injection attempts.
// Each entry is [regex, label] for clear error reporting.
const DANGEROUS_PATTERNS = [
  [/<\s*script/i, 'etiquetas script'],
  [/<\s*\/\s*script/i, 'etiquetas script'],
  [/javascript\s*:/i, 'protocolo javascript'],
  [/on\w+\s*=/i, 'event handlers HTML'],
  [/<\s*iframe/i, 'etiquetas iframe'],
  [/<\s*object/i, 'etiquetas object'],
  [/<\s*embed/i, 'etiquetas embed'],
  [/<\s*form/i, 'etiquetas form'],
  [/<\s*img[^>]+onerror/i, 'img con onerror'],
  [/<\s*svg[^>]+onload/i, 'svg con onload'],
  [/(\b)(DROP|ALTER|TRUNCATE)\s+(TABLE|DATABASE)\b/i, 'sentencias SQL destructivas'],
  [/(\b)UNION\s+(ALL\s+)?SELECT\b/i, 'UNION SELECT'],
  [/;\s*--/i, 'comentarios SQL inline'],
  [/'\s*OR\s+'?\d/i, 'OR injection'],
  [/'\s*OR\s+'[^']*'\s*=/i, 'OR injection con strings'],
];

/**
 * Remove invisible/control characters from a string.
 * Preserves printable characters, spaces, and standard punctuation.
 */
const stripInvisibleChars = (value) => value.replace(INVISIBLE_CHARS_REGEX, '');

/**
 * Collapse multiple consecutive whitespace characters (spaces, tabs)
 * into a single space.
 */
const collapseSpaces = (value) => value.replace(/[^\S\n]+/g, ' ');

/**
 * Collapse multiple consecutive blank lines into a single newline.
 */
const collapseNewlines = (value) => value.replace(/\n{3,}/g, '\n\n');

/**
 * Sanitize a single-line text input.
 * - Strips invisible Unicode characters
 * - Removes tabs and newlines
 * - Collapses multiple spaces
 * - Trims leading/trailing whitespace
 * - Normalizes to NFC
 */
export const sanitizeText = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  let clean = stripInvisibleChars(value);
  clean = clean.replace(/[\t\r\n]/g, ' ');
  clean = collapseSpaces(clean);
  clean = clean.trim();
  clean = clean.normalize('NFC');

  return clean;
};

/**
 * Sanitize a multi-line text input (descriptions, comments).
 * - Strips invisible Unicode characters
 * - Preserves legitimate newlines
 * - Removes tabs and carriage returns
 * - Collapses excessive whitespace within lines
 * - Collapses excessive blank lines
 * - Trims leading/trailing whitespace
 * - Normalizes to NFC
 */
export const sanitizeMultilineText = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  let clean = stripInvisibleChars(value);
  clean = clean.replace(/\r\n/g, '\n');
  clean = clean.replace(/\r/g, '\n');
  clean = clean.replace(/\t/g, ' ');
  clean = clean
    .split('\n')
    .map((line) => collapseSpaces(line).trim())
    .join('\n');
  clean = collapseNewlines(clean);
  clean = clean.trim();
  clean = clean.normalize('NFC');

  return clean;
};

/**
 * Check if a string contains dangerous patterns (XSS, SQL injection, HTML injection).
 * Returns true if the input is safe (no dangerous patterns found).
 */
export const isSafeInput = (value) => {
  if (typeof value !== 'string') {
    return true;
  }

  return !DANGEROUS_PATTERNS.some(([regex]) => regex.test(value));
};

/**
 * Zod refinement message for dangerous input.
 */
export const DANGEROUS_INPUT_MESSAGE = 'El texto contiene caracteres o patrones no permitidos';

/**
 * Validate that a string matches CUID format.
 * Prisma uses CUID by default for @id @default(cuid()).
 */
export const isValidCuid = (value) => {
  if (typeof value !== 'string') {
    return false;
  }

  return /^c[a-z0-9]{20,}$/.test(value);
};

/**
 * Validate UUID v4 format (for x-request-id headers).
 */
export const isValidUuid = (value) => {
  if (typeof value !== 'string') {
    return false;
  }

  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
};
