import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';
import { toast } from 'sonner';

import { ErrorMessage } from '../components/ErrorMessage.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { Button } from '../components/ui/button.jsx';
import { Card, CardContent } from '../components/ui/card.jsx';
import { Input } from '../components/ui/input.jsx';
import { Textarea } from '../components/ui/textarea.jsx';
import { createRequest, getCategories } from '../services/api.js';
import { getApiErrorMessage } from '../utils/api-error.js';

const initialForm = {
  title: '',
  description: '',
  priority: 'MEDIA',
  categoryId: '',
};

export const CreateRequestPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const result = await getCategories({ page: 1, limit: 100 });
        setCategories(result.data);
        setForm((current) => ({
          ...current,
          categoryId: result.data[0]?.id || '',
        }));
      } catch (apiError) {
        const message = getApiErrorMessage(apiError, 'No se pudieron cargar las categorias.');
        setError(message);
        toast.error(message);
      }
    };

    loadCategories();
  }, []);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await createRequest(form);
      toast.success('Solicitud creada correctamente');
      navigate(`/requests/${result.request.id}`);
    } catch (apiError) {
      const message = getApiErrorMessage(apiError, 'No se pudo crear la solicitud.');
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Nueva solicitud"
        description="Describe el problema tecnico para que pueda ser atendido."
      />
      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit}>
        <ErrorMessage message={error} />
        <label className="mt-5 block text-sm font-medium text-slate-700">
          Titulo
          <Input
            className="mt-2"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </label>
        <label className="mt-4 block text-sm font-medium text-slate-700">
          Descripcion
          <Textarea
            className="mt-2 min-h-36"
            name="description"
            value={form.description}
            onChange={handleChange}
            required
          />
        </label>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Prioridad
            <select
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
              name="priority"
              value={form.priority}
              onChange={handleChange}
            >
              <option value="BAJA">Baja</option>
              <option value="MEDIA">Media</option>
              <option value="ALTA">Alta</option>
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Categoria
            <select
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              required
            >
              {categories.length === 0 && <option value="">Sin categorias disponibles</option>}
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <Button
          type="submit"
          className="mt-6"
          disabled={isSubmitting || categories.length === 0}
        >
          <Send className="h-4 w-4" />
          {isSubmitting ? 'Creando...' : 'Crear solicitud'}
        </Button>
      </form>
        </CardContent>
      </Card>
    </div>
  );
};
