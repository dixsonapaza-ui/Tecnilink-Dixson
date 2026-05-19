import { Router } from 'express';

import { getHealth } from '../controllers/health.controller.js';
import { asyncHandler } from '../utils/async-handler.js';

const healthRoutes = Router();

healthRoutes.get('/', asyncHandler(getHealth));

export { healthRoutes };
