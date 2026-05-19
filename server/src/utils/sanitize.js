const sensitiveKeys = ['password', 'token', 'authorization', 'jwt', 'secret'];

export const sanitizeObject = (value) => {
  if (!value || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeObject(item));
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => {
      const normalizedKey = key.toLowerCase();
      const isSensitive = sensitiveKeys.some((sensitiveKey) => normalizedKey.includes(sensitiveKey));

      return [key, isSensitive ? '[REDACTED]' : sanitizeObject(item)];
    }),
  );
};
