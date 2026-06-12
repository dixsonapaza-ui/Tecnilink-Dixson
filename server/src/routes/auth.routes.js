import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import { login, me, register, googleLogin } from '../controllers/auth.controller.js';
import { env } from '../config/env.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';
import { loginSchema, registerSchema, googleAuthSchema } from '../schemas/auth.schema.js';
import { validateRequest } from '../middlewares/validate.middleware.js';

const authRoutes = Router();

const loginRateLimiter = rateLimit({
  windowMs: env.loginRateLimitWindowMs,
  limit: env.loginRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      message: 'Demasiadas solicitudes de login. Intenta nuevamente mas tarde.',
      requestId: req.id,
    });
  },
  skipSuccessfulRequests: true,
});

authRoutes.post('/register', validateRequest(registerSchema), asyncHandler(register));
authRoutes.post('/login', loginRateLimiter, validateRequest(loginSchema), asyncHandler(login));
authRoutes.post('/google', validateRequest(googleAuthSchema), asyncHandler(googleLogin));
authRoutes.get('/me', authenticateToken, asyncHandler(me));

export { authRoutes };
