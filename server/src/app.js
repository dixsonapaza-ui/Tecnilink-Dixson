import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env.js';
import { httpLogStream } from './config/logger.js';
import { authRoutes } from './routes/auth.routes.js';
import { categoryRoutes } from './routes/category.routes.js';
import {
  errorMiddleware,
  notFoundMiddleware,
} from './middlewares/error.middleware.js';
import { healthRoutes } from './routes/health.routes.js';
import { requestContextMiddleware } from './middlewares/request-context.middleware.js';
import { requestRoutes } from './routes/request.routes.js';
import { superadminRoutes } from './routes/superadmin.routes.js';
import { profileRoutes } from './routes/profile.routes.js';
import { AppError } from './utils/app-error.js';

const app = express();

app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: 'cross-origin',
    },
  }),
);
app.use(requestContextMiddleware);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.frontendUrls.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new AppError('Origen no permitido por CORS', 403));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(
  morgan(env.nodeEnv === 'production' ? 'combined' : 'dev', {
    stream: httpLogStream,
    skip: (req) => !env.enableRequestLogs || req.path === '/api/health',
  }),
);

const globalRateLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  limit: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      message: 'Demasiadas solicitudes. Intenta nuevamente mas tarde.',
      requestId: req.id,
    });
  },
});

app.use('/api/health', healthRoutes);

app.use(globalRateLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/profile', profileRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export { app };
