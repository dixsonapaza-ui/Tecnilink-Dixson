import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';
import { buildPaginationMeta, getPagination } from '../utils/pagination.js';

export const listActiveCategories = async ({ page, limit }) => {
  const pagination = getPagination({ page, limit });
  const where = { isActive: true };

  const [categories, total] = await prisma.$transaction([
    prisma.serviceCategory.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.serviceCategory.count({ where }),
  ]);

  return {
    data: categories,
    meta: buildPaginationMeta({
      page: pagination.page,
      limit: pagination.limit,
      total,
    }),
  };
};

export const createCategory = async ({ name, description }) =>
  prisma.serviceCategory.create({
    data: {
      name,
      description,
    },
  });

export const updateCategory = async (categoryId, data) => {
  const category = await prisma.serviceCategory.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new AppError('Categoria no encontrada', 404);
  }

  return prisma.serviceCategory.update({
    where: { id: categoryId },
    data,
  });
};

export const deactivateCategory = async (categoryId) => {
  const category = await prisma.serviceCategory.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new AppError('Categoria no encontrada', 404);
  }

  if (!category.isActive) {
    return category;
  }

  return prisma.serviceCategory.update({
    where: { id: categoryId },
    data: { isActive: false },
  });
};
