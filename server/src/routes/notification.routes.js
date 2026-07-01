import { Router } from 'express';
import { indexNotifications, readNotifications } from '../controllers/notification.controller.js';
import { asyncHandler } from '../utils/async-handler.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const notificationRoutes = Router();

notificationRoutes.use(authenticateToken);

notificationRoutes.get('/', asyncHandler(indexNotifications));
notificationRoutes.put('/read', asyncHandler(readNotifications));

export { notificationRoutes };
