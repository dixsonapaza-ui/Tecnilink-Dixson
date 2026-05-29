import { useEffect, useState } from 'react';
import { Edit3, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { EmptyState } from '../components/EmptyState.jsx';
import { ErrorMessage } from '../components/ErrorMessage.jsx';
import { LoadingState } from '../components/LoadingState.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { Pagination } from '../components/Pagination.jsx';
import { Button } from '../components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { ConfirmDialog } from '../components/ui/dialog.jsx';
import { Input } from '../components/ui/input.jsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table.jsx';
import { Textarea } from '../components/ui/textarea.jsx';
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../services/api.js';
import { getApiErrorMessage } from '../utils/api-error.js';
import {
  createSafeChangeHandler,
  sanitizeMultilineText,
  sanitizeText,
} from '../utils/input-sanitizer.js';

const initialForm = {
  name: '',
  description: '',
};

export const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [editingCategory, setEditingCategory] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCategories = async (targetPage = page) => {
    setIsLoading(true);
    setError('');

    try {
      const result = await getCategories({ page: targetPage, limit: 10 });
      setCategories(result.data);
      setMeta(result.meta);
      setPage(targetPage);
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, 'No se pudieron cargar las categorias.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories(1);
  }, []);

  const handleChange = createSafeChangeHandler(setForm);

  const resetForm = () => {
    setForm(initialForm);
    setEditingCategory(null);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setForm({
      name: category.name,
      description: category.description,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    const sanitizedName = sanitizeText(form.name);
    const sanitizedDescription = sanitizeMultilineText(form.description);

    if (sanitizedName.length < 2) {
      setError('El nombre debe tener al menos 2 caracteres validos');
      setIsSubmitting(false);
      return;
    }

    if (sanitizedDescription.length < 5) {
      setError('La descripcion debe tener al menos 5 caracteres validos');
      setIsSubmitting(false);
      return;
    }

    const sanitizedForm = {
      name: sanitizedName,
      description: sanitizedDescription,
    };

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, sanitizedForm);
        setSuccess('Categoria actualizada correctamente.');
        toast.success('Categoria actualizada');
      } else {
        await createCategory(sanitizedForm);
        setSuccess('Categoria creada correctamente.');
        toast.success('Categoria creada');
      }

      resetForm();
      await loadCategories(page);
    } catch (apiError) {
      const message = getApiErrorMessage(apiError, 'No se pudo guardar la categoria.');
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (categoryId) => {
    setError('');
    setSuccess('');

    try {
      await deleteCategory(categoryId);
      setSuccess('Categoria desactivada correctamente.');
      toast.success('Categoria desactivada');
      await loadCategories(page);
    } catch (apiError) {
      const message = getApiErrorMessage(apiError, 'No se pudo desactivar la categoria.');
      setError(message);
      toast.error(message);
    }
  };

  return (
    <div>
      <PageHeader
        title="Categorias"
        description="Gestiona categorias activas de servicio. La eliminacion es logica."
      />

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <CardHeader>
            <CardTitle>{editingCategory ? 'Editar categoria' : 'Nueva categoria'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
            <ErrorMessage message={error} />
            {success && (
              <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {success}
              </p>
            )}
            <label className="block text-sm font-medium text-slate-700">
              Nombre
              <Input
                className="mt-2"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Descripcion
              <Textarea
                className="mt-2"
                name="description"
                value={form.description}
                onChange={handleChange}
                required
              />
            </label>
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                <Plus className="h-4 w-4" />
                {isSubmitting ? 'Guardando...' : 'Guardar'}
              </Button>
              {editingCategory && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categorias activas</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingState message="Cargando categorias..." />
            ) : (
              <div className="space-y-3">
                {categories.length === 0 && (
                  <EmptyState title="Sin categorias" description="Crea una categoria para comenzar a clasificar solicitudes." />
                )}
                {categories.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Descripcion</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium text-slate-950">{category.name}</TableCell>
                          <TableCell>{category.description}</TableCell>
                          <TableCell className="text-right">
                            <div className="inline-flex gap-2">
                              <Button type="button" variant="outline" size="sm" onClick={() => handleEdit(category)}>
                                <Edit3 className="h-4 w-4" />
                                Editar
                              </Button>
                              <ConfirmDialog
                                title="Desactivar categoria"
                                description="La categoria dejara de aparecer como activa. Las solicitudes existentes conservaran su referencia."
                                confirmLabel="Desactivar"
                                isDanger
                                onConfirm={() => handleDelete(category.id)}
                              >
                                <Button type="button" variant="dangerOutline" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                  Desactivar
                                </Button>
                              </ConfirmDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                <Pagination meta={meta} onPageChange={loadCategories} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
