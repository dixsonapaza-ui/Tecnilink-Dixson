import { Router } from 'express';

import {
  editCategory,
  listCategories,
  removeCategory,
  storeCategory,
} from '../controllers/category.controller.js';
import {
  categoryIdParamSchema,
  createCategorySchema,
  listCategoriesSchema,
  updateCategorySchema,
} from '../schemas/category.schema.js';
import { asyncHandler } from '../utils/async-handler.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';

const categoryRoutes = Router();

categoryRoutes.use(authenticateToken);

categoryRoutes.get('/', validateRequest(listCategoriesSchema), asyncHandler(listCategories));
categoryRoutes.post(
  '/',
  authorizeRoles('ADMIN'),
  validateRequest(createCategorySchema),
  asyncHandler(storeCategory),
);
categoryRoutes.put(
  '/:id',
  authorizeRoles('ADMIN'),
  validateRequest(updateCategorySchema),
  asyncHandler(editCategory),
);
categoryRoutes.delete(
  '/:id',
  authorizeRoles('ADMIN'),
  validateRequest(categoryIdParamSchema),
  asyncHandler(removeCategory),
);

export { categoryRoutes };
