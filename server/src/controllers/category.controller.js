import {
  createCategory,
  deactivateCategory,
  listActiveCategories,
  updateCategory,
} from '../services/category.service.js';

export const listCategories = async (req, res) => {
  const result = await listActiveCategories(req.query);

  res.status(200).json(result);
};

export const storeCategory = async (req, res) => {
  const category = await createCategory(req.body);

  res.status(201).json({
    message: 'Categoria creada correctamente',
    category,
  });
};

export const editCategory = async (req, res) => {
  const category = await updateCategory(req.params.id, req.body);

  res.status(200).json({
    message: 'Categoria actualizada correctamente',
    category,
  });
};

export const removeCategory = async (req, res) => {
  const category = await deactivateCategory(req.params.id);

  res.status(200).json({
    message: 'Categoria desactivada correctamente',
    category,
  });
};
