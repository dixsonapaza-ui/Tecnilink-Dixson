import { randomUUID } from 'node:crypto';

import { isValidUuid } from '../utils/input-sanitizer.js';

export const requestContextMiddleware = (req, res, next) => {
  const externalId = req.headers['x-request-id'];
  const requestId = (typeof externalId === 'string' && isValidUuid(externalId))
    ? externalId
    : randomUUID();

  req.id = requestId;
  res.setHeader('X-Request-Id', requestId);

  next();
};
