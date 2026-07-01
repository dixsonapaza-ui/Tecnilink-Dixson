import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller.js';
import { asyncHandler } from '../utils/async-handler.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';

const settingsRoutes = Router();

settingsRoutes.use(authenticateToken);

settingsRoutes.get('/', asyncHandler(getSettings));
settingsRoutes.put('/', authorizeRoles('ADMIN'), asyncHandler(updateSettings));

export { settingsRoutes };
