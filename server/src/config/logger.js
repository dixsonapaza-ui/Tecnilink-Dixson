import fs from 'node:fs';
import path from 'node:path';
import winston from 'winston';

import { env } from './env.js';
import { sanitizeObject } from '../utils/sanitize.js';

const logsDirectory = path.resolve('logs');

if (env.nodeEnv !== 'test') {
  fs.mkdirSync(logsDirectory, { recursive: true });
}

const sanitizeFormat = winston.format((info) => {
  const sanitized = sanitizeObject(info);
  Object.assign(info, sanitized);
  return info;
});

const consoleFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  sanitizeFormat(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaText = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level}] ${message}${metaText}`;
  }),
);

const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  sanitizeFormat(),
  winston.format.json(),
);

const transports = [
  new winston.transports.Console({
    format: consoleFormat,
  }),
];

if (env.nodeEnv !== 'test') {
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDirectory, 'error.log'),
      level: 'error',
      format: jsonFormat,
    }),
    new winston.transports.File({
      filename: path.join(logsDirectory, 'combined.log'),
      format: jsonFormat,
    }),
  );
}

export const logger = winston.createLogger({
  level: env.nodeEnv === 'production' ? 'info' : 'debug',
  levels: winston.config.npm.levels,
  defaultMeta: {
    service: 'tecnilink-api',
    environment: env.nodeEnv,
  },
  transports,
  exitOnError: false,
});

export const httpLogStream = {
  write: (message) => {
    logger.http(message.trim());
  },
};
