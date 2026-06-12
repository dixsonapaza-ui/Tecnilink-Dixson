import { Router } from 'express';
import { getProfile, updateProfile, uploadAvatar } from '../controllers/profile.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';
import { uploadAvatarMiddleware } from '../middlewares/upload.middleware.js';

const profileRoutes = Router();

// All profile endpoints require authentication
profileRoutes.use(authenticateToken);

profileRoutes.get('/me', asyncHandler(getProfile));
profileRoutes.patch('/me', asyncHandler(updateProfile));
profileRoutes.post('/avatar', uploadAvatarMiddleware, asyncHandler(uploadAvatar));

export { profileRoutes };
export default profileRoutes;
