import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Filter, PlusCircle, RotateCcw, XCircle } from 'lucide-react';
import { toast } from 'sonner';

import { EmptyState } from '../components/EmptyState.jsx';
import { ErrorMessage } from '../components/ErrorMessage.jsx';
import { LoadingState } from '../components/LoadingState.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { Pagination } from '../components/Pagination.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { buttonVariants, Button } from '../components/ui/button.jsx';
import { Card, CardContent } from '../components/ui/card.jsx';
import { ConfirmDialog } from '../components/ui/dialog.jsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { cancelRequest, getCategories, getRequests } from '../services/api.js';
import { getApiErrorMessage } from '../utils/api-error.js';

const initialFilters = {
  status: '',
  priority: '',
  categoryId: '',
};

export const RequestsPage = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(initialFilters);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadRequests = async (targetPage = page, targetFilters = filters) => {
    setIsLoading(true);
    setError('');

    try {
      const params = {
        page: targetPage,
        limit: 10,
        ...Object.fromEntries(Object.entries(targetFilters).filter(([, value]) => value)),
      };
      const result = await getRequests(params);
      setRequests(result.data);
      setMeta(result.meta);
      setPage(targetPage);
    } catch (apiError) {
      const message = getApiErrorMessage(apiError, 'No se pudieron cargar las solicitudes.');
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const categoryResult = await getCategories({ page: 1, limit: 100 });
        setCategories(categoryResult.data);
      } catch {
        setCategories([]);
      }

      await loadRequests(1, initialFilters);
    };

    loadInitialData();
  }, []);

  const handleFilterChange = (event) => {
    setFilters((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const applyFilters = (event) => {
    event.preventDefault();
    loadRequests(1, filters);
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    loadRequests(1, initialFilters);
  };

  const handleCancel = async (requestId) => {
    try {
      await cancelRequest(requestId);
      toast.success('Solicitud cancelada');
      await loadRequests(page, filters);
    } catch (apiError) {
      const message = getApiErrorMessage(apiError, 'No se pudo cancelar la solicitud.');
      setError(message);
      toast.error(message);
    }
  };

  return (
    <div>
      <PageHeader
        title="Solicitudes"
        description="Lista paginada segun tu rol. Puedes filtrar por estado, prioridad y categoria."
        action={
          user.role === 'CLIENTE' ? (
            <Link
              to="/requests/new"
              className={buttonVariants()}
            >
              <PlusCircle className="h-4 w-4" />
              Nueva solicitud
            </Link>
          ) : null
        }
      />

      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={applyFilters}>
        <div className="grid gap-4 md:grid-cols-4">
          <label className="text-sm font-medium text-slate-700">
            Estado
            <select
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">Todos</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="EN_PROCESO">En proceso</option>
              <option value="ATENDIDA">Atendida</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Prioridad
            <select
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
              name="priority"
              value={filters.priority}
              onChange={handleFilterChange}
            >
              <option value="">Todas</option>
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
              value={filters.categoryId}
              onChange={handleFilterChange}
            >
              <option value="">Todas</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end gap-2">
            <Button
              type="submit"
            >
              <Filter className="h-4 w-4" />
              Filtrar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={resetFilters}
            >
              <RotateCcw className="h-4 w-4" />
              Limpiar
            </Button>
          </div>
        </div>
          </form>
        </CardContent>
      </Card>

      <ErrorMessage message={error} />

      <Card className="mt-4">
        <CardContent className="pt-6">
        {isLoading ? (
          <LoadingState message="Cargando solicitudes..." />
        ) : (
          <div className="space-y-3">
            {requests.length === 0 && (
              <EmptyState title="Sin solicitudes" description="No hay solicitudes que coincidan con los filtros actuales." />
            )}
            {requests.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Solicitud</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Prioridad</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Responsables</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <Link to={`/requests/${request.id}`} className="font-semibold text-slate-950 hover:underline">
                          {request.title}
                        </Link>
                        <p className="mt-1 line-clamp-2 max-w-md text-xs text-slate-500">{request.description}</p>
                      </TableCell>
                      <TableCell>
                        <StatusBadge value={request.status} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge value={request.priority} />
                      </TableCell>
                      <TableCell>{request.category?.name || 'Sin categoria'}</TableCell>
                      <TableCell>
                        <p className="text-xs text-slate-500">Cliente: {request.client?.name || 'Sin dato'}</p>
                        <p className="mt-1 text-xs text-slate-500">Tecnico: {request.technician?.name || 'Sin asignar'}</p>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-2">
                          <Link to={`/requests/${request.id}`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                            Ver
                          </Link>
                          {request.status === 'PENDIENTE' && user.role !== 'TECNICO' && (
                            <ConfirmDialog
                              title="Cancelar solicitud"
                              description="Esta accion cambiara el estado de la solicitud a CANCELADA."
                              confirmLabel="Cancelar solicitud"
                              isDanger
                              onConfirm={() => handleCancel(request.id)}
                            >
                              <Button type="button" variant="dangerOutline" size="sm">
                                <XCircle className="h-4 w-4" />
                                Cancelar
                              </Button>
                            </ConfirmDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <Pagination meta={meta} onPageChange={(nextPage) => loadRequests(nextPage, filters)} />
          </div>
        )}
        </CardContent>
      </Card>
    </div>
  );
};
