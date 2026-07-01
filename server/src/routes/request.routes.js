import { Router } from 'express';

import {
  assignRequest,
  changeRequestStatus,
  editRequest,
  indexRequestComments,
  indexRequests,
  removeRequest,
  showRequest,
  storeRequest,
  storeRequestComment,
  listTechnicians,
  indexAvailableRequests,
  takeRequestJob,
  releaseRequestJob,
} from '../controllers/request.controller.js';
import {
  assignRequestSchema,
  createCommentSchema,
  createRequestSchema,
  listCommentsSchema,
  listRequestsSchema,
  requestIdParamSchema,
  updateRequestSchema,
  updateRequestStatusSchema,
} from '../schemas/request.schema.js';
import { asyncHandler } from '../utils/async-handler.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';

const requestRoutes = Router();

requestRoutes.use(authenticateToken);

requestRoutes.get('/', validateRequest(listRequestsSchema), asyncHandler(indexRequests));
requestRoutes.get(
  '/technicians/list',
  authorizeRoles('ADMIN', 'SUPER_ADMIN'),
  asyncHandler(listTechnicians),
);
requestRoutes.post(
  '/',
  authorizeRoles('CLIENTE'),
  validateRequest(createRequestSchema),
  asyncHandler(storeRequest),
);
requestRoutes.get(
  '/available',
  authorizeRoles('TECNICO'),
  asyncHandler(indexAvailableRequests),
);
requestRoutes.get('/:id', validateRequest(requestIdParamSchema), asyncHandler(showRequest));
requestRoutes.put('/:id', validateRequest(updateRequestSchema), asyncHandler(editRequest));
requestRoutes.patch(
  '/:id/assign',
  authorizeRoles('ADMIN'),
  validateRequest(assignRequestSchema),
  asyncHandler(assignRequest),
);
requestRoutes.patch(
  '/:id/status',
  authorizeRoles('TECNICO'),
  validateRequest(updateRequestStatusSchema),
  asyncHandler(changeRequestStatus),
);
requestRoutes.post(
  '/:id/take',
  authorizeRoles('TECNICO'),
  validateRequest(requestIdParamSchema),
  asyncHandler(takeRequestJob),
);
requestRoutes.post(
  '/:id/release',
  authorizeRoles('TECNICO'),
  validateRequest(requestIdParamSchema),
  asyncHandler(releaseRequestJob),
);
requestRoutes.delete('/:id', validateRequest(requestIdParamSchema), asyncHandler(removeRequest));
requestRoutes.get(
  '/:id/comments',
  validateRequest(listCommentsSchema),
  asyncHandler(indexRequestComments),
);
requestRoutes.post(
  '/:id/comments',
  validateRequest(createCommentSchema),
  asyncHandler(storeRequestComment),
);

export { requestRoutes };
