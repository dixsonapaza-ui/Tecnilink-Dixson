import { Router } from 'express';
import { z } from 'zod';
import {
  getMetrics,
  indexAdmins,
  indexAuditLogs,
  storeAdmin,
  toggleAdminStatus,
} from '../controllers/superadmin.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { idParamSchema, paginationQuerySchema } from '../schemas/common.schema.js';
import { registerSchema } from '../schemas/auth.schema.js'; // reusing register schema for admin creation
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.use(authenticateToken);
router.use(authorizeRoles('SUPER_ADMIN'));

router.get('/metrics', asyncHandler(getMetrics));

router.get('/admins', asyncHandler(indexAdmins));

router.post(
  '/admins',
  validateRequest(z.object({ body: registerSchema })),
  asyncHandler(storeAdmin)
);

router.patch(
  '/admins/:id/deactivate',
  validateRequest(z.object({ params: idParamSchema })),
  asyncHandler(toggleAdminStatus)
);

router.get(
  '/audit',
  validateRequest(z.object({ query: paginationQuerySchema })),
  asyncHandler(indexAuditLogs)
);

export { router as superadminRoutes };
