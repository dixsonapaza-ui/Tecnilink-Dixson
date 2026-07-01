import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Calendar, MapPin, User, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { PageHeader } from '../components/PageHeader.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { ErrorMessage } from '../components/ErrorMessage.jsx';
import { LoadingState } from '../components/LoadingState.jsx';
import { Pagination } from '../components/Pagination.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { Button } from '../components/ui/button.jsx';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { getAvailableRequests, takeRequest } from '../services/api.js';
import { getApiErrorMessage } from '../utils/api-error.js';

export const AvailableRequestsPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isTakingId, setIsTakingId] = useState(null);
  const [error, setError] = useState('');

  const loadAvailableRequests = async (targetPage = page) => {
    setIsLoading(true);
    setError('');
    try {
      const result = await getAvailableRequests({ page: targetPage, limit: 10 });
      setRequests(result.data);
      setMeta(result.meta);
      setPage(targetPage);
    } catch (apiError) {
      const message = getApiErrorMessage(apiError, 'No se pudieron cargar las solicitudes disponibles.');
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAvailableRequests(1);
  }, []);

  const handleTakeRequest = async (requestId) => {
    setIsTakingId(requestId);
    try {
      const response = await takeRequest(requestId);
      toast.success(response.message || '¡Trabajo asignado correctamente!');
      // Navigate directly to the request details page to start working!
      navigate(`/requests/${requestId}`);
    } catch (apiError) {
      const message = getApiErrorMessage(apiError, 'No se pudo tomar el trabajo.');
      toast.error(message);
      loadAvailableRequests(page); // Reload list in case it was already taken
    } finally {
      setIsTakingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bolsa de Trabajo"
        description="Aquí encontrarás las solicitudes de clientes de tu especialidad listas para ser tomadas. El primer técnico que acepte el trabajo obtiene la asignación."
        action={
          <Button
            variant="outline"
            onClick={() => loadAvailableRequests(page)}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        }
      />

      <ErrorMessage message={error} />

      {isLoading ? (
        <LoadingState message="Buscando trabajos disponibles..." />
      ) : (
        <div className="space-y-6">
          {requests.length === 0 ? (
            <EmptyState
              title="No hay trabajos disponibles"
              description="Por el momento no hay solicitudes pendientes de asignación en tu especialidad. Te avisaremos cuando llegue una nueva."
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
              {requests.map((request) => (
                <Card key={request.id} className="flex flex-col justify-between overflow-hidden border-slate-200 transition-all hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800">
                  <CardHeader className="bg-slate-50/50 pb-4 dark:bg-slate-900/20">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <CardTitle className="line-clamp-1 text-lg font-bold text-slate-900 dark:text-slate-50">
                          {request.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                          <Briefcase className="h-3 w-3" />
                          <span>{request.category?.name}</span>
                        </div>
                      </div>
                      <StatusBadge value={request.priority} />
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-4 text-sm text-slate-600 dark:text-slate-300">
                    <p className="line-clamp-3 mb-4 leading-relaxed">{request.description}</p>
                    
                    <div className="space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        <span>Cliente: <strong className="text-slate-700 dark:text-slate-300">{request.client?.name}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span>Zona: <strong className="text-slate-700 dark:text-slate-300">{request.client?.serviceArea || 'Lima Metropolitana'}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>Publicado el: {new Date(request.createdAt).toLocaleDateString('es-PE', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="bg-slate-50/30 border-t border-slate-100/50 p-4 dark:border-slate-800/50">
                    <Button
                      onClick={() => handleTakeRequest(request.id)}
                      disabled={isTakingId !== null}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-semibold transition-colors"
                    >
                      {isTakingId === request.id ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Aceptando...
                        </>
                      ) : (
                        'Tomar Trabajo'
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {requests.length > 0 && (
            <Pagination meta={meta} onPageChange={(nextPage) => loadAvailableRequests(nextPage)} />
          )}
        </div>
      )}
    </div>
  );
};
