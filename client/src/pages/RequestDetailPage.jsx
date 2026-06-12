import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MessageSquarePlus, Save, UserPlus, XCircle } from 'lucide-react';
import { toast } from 'sonner';

import { EmptyState } from '../components/EmptyState.jsx';
import { ErrorMessage } from '../components/ErrorMessage.jsx';
import { LoadingState } from '../components/LoadingState.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { Pagination } from '../components/Pagination.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { buttonVariants, Button } from '../components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { ConfirmDialog } from '../components/ui/dialog.jsx';
import { Input } from '../components/ui/input.jsx';
import { Textarea } from '../components/ui/textarea.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  assignRequest,
  cancelRequest,
  createRequestComment,
  getRequestById,
  getRequestComments,
  updateRequestStatus,
  getTechniciansList,
} from '../services/api.js';
import { getApiErrorMessage } from '../utils/api-error.js';
import { sanitizeMultilineText, sanitizeText } from '../utils/input-sanitizer.js';

export const RequestDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsMeta, setCommentsMeta] = useState(null);
  const [commentPage, setCommentPage] = useState(1);
  const [commentContent, setCommentContent] = useState('');
  const [technicianId, setTechnicianId] = useState('');
  const [technicians, setTechnicians] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [status, setStatus] = useState('EN_PROCESO');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadRequest = async () => {
    const result = await getRequestById(id);
    setRequest(result.request);
    setTechnicianId('');
    setStatus(result.request.status === 'ATENDIDA' ? 'ATENDIDA' : 'EN_PROCESO');
  };

  const loadComments = async (targetPage = commentPage) => {
    const result = await getRequestComments(id, { page: targetPage, limit: 10 });
    setComments(result.data);
    setCommentsMeta(result.meta);
    setCommentPage(targetPage);
  };

  const loadTechnicians = async () => {
    if (user?.role === 'ADMIN') {
      try {
        const result = await getTechniciansList();
        setTechnicians(result.technicians || []);
      } catch (err) {
        console.error('No se pudo cargar la lista de tecnicos:', err);
      }
    }
  };

  const loadDetail = async () => {
    setIsLoading(true);
    setError('');

    try {
      await Promise.all([loadRequest(), loadComments(1), loadTechnicians()]);
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, 'No se pudo cargar la solicitud.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [id]);

  const handleAssign = async (event) => {
    event.preventDefault();
    setError('');

    const sanitizedTechnicianId = sanitizeText(technicianId);
    if (!sanitizedTechnicianId) {
      setError('Debes seleccionar un tecnico');
      return;
    }

    try {
      await assignRequest(id, { technicianId: sanitizedTechnicianId });
      toast.success('Tecnico asignado correctamente');
      setSearchFilter('');
      setTechnicianId('');
      await loadRequest();
    } catch (apiError) {
      const message = getApiErrorMessage(apiError, 'No se pudo asignar el tecnico.');
      setError(message);
      toast.error(message);
    }
  };

  const handleStatusUpdate = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await updateRequestStatus(id, { status });
      toast.success('Estado actualizado');
      await loadRequest();
    } catch (apiError) {
      const message = getApiErrorMessage(apiError, 'No se pudo actualizar el estado.');
      setError(message);
      toast.error(message);
    }
  };

  const handleCancel = async () => {
    setError('');

    try {
      await cancelRequest(id);
      toast.success('Solicitud cancelada');
      await loadRequest();
    } catch (apiError) {
      const message = getApiErrorMessage(apiError, 'No se pudo cancelar la solicitud.');
      setError(message);
      toast.error(message);
    }
  };

  const handleComment = async (event) => {
    event.preventDefault();
    setError('');

    const sanitizedContent = sanitizeMultilineText(commentContent);
    if (sanitizedContent.length < 2) {
      setError('El comentario debe tener al menos 2 caracteres validos');
      return;
    }

    try {
      await createRequestComment(id, { content: sanitizedContent });
      setCommentContent('');
      toast.success('Comentario agregado');
      await loadComments(1);
    } catch (apiError) {
      const message = getApiErrorMessage(apiError, 'No se pudo agregar el comentario.');
      setError(message);
      toast.error(message);
    }
  };

  if (isLoading) {
    return <LoadingState message="Cargando solicitud..." />;
  }

  if (!request) {
    return (
      <div>
        <ErrorMessage message={error || 'Solicitud no encontrada.'} />
        <Link className="mt-4 inline-flex text-sm font-semibold text-slate-950 underline" to="/requests">
          Volver a solicitudes
        </Link>
      </div>
    );
  }

  const canCancel = request.status === 'PENDIENTE' && user.role !== 'TECNICO';
  const canUpdateStatus = user.role === 'TECNICO';

  return (
    <div>
      <PageHeader
        title={request.title}
        description="Detalle de la solicitud tecnica y comentarios."
        action={
          <Link className={buttonVariants({ variant: 'outline', size: 'sm' })} to="/requests">
            Volver
          </Link>
        }
      />

      <ErrorMessage message={error} />

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_0.7fr]">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              <StatusBadge value={request.status} />
              <StatusBadge value={request.priority} />
              {request.category?.name && <StatusBadge value={request.category.name} />}
            </div>
            <p className="mt-5 whitespace-pre-wrap text-slate-700">{request.description}</p>
            <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <dt className="font-medium text-slate-500">Cliente</dt>
                <dd className="mt-1 text-slate-950">{request.client?.name || 'Sin dato'}</dd>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <dt className="font-medium text-slate-500">Tecnico</dt>
                <dd className="mt-1 text-slate-950 font-semibold text-emerald-700">
                  {request.technician?.name ? `Asignado a: ${request.technician.name}` : 'Sin asignar'}
                </dd>
              </div>
            </dl>
            {canCancel && (
              <ConfirmDialog
                title="Cancelar solicitud"
                description="Esta accion cambiara el estado a CANCELADA y no podra ser atendida."
                confirmLabel="Cancelar solicitud"
                isDanger
                onConfirm={handleCancel}
              >
                <Button type="button" variant="dangerOutline" className="mt-6">
                  <XCircle className="h-4 w-4" />
                  Cancelar solicitud
                </Button>
              </ConfirmDialog>
            )}
          </CardContent>
        </Card>

        <aside className="space-y-4">
          {user.role === 'ADMIN' && (
            <Card>
              <CardHeader>
                <CardTitle>Asignar tecnico</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAssign}>
                  <p className="text-xs text-slate-500 mb-3">
                    Filtra y selecciona uno de los tecnicos disponibles.
                  </p>
                  
                  <Input
                    className="mb-3 text-sm"
                    value={searchFilter}
                    onChange={(event) => setSearchFilter(event.target.value)}
                    placeholder="🔍 Buscar tecnico por nombre o especialidad..."
                  />

                  <select
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-slate-950/5 focus:outline-none"
                    value={technicianId}
                    onChange={(event) => setTechnicianId(event.target.value)}
                    required
                  >
                    <option value="">-- Seleccionar tecnico --</option>
                    {technicians
                      .filter((tech) => {
                        const term = searchFilter.toLowerCase();
                        const nameMatches = tech.name.toLowerCase().includes(term);
                        const specialtyMatches = tech.specialty
                          ? tech.specialty.toLowerCase().includes(term)
                          : false;
                        return nameMatches || specialtyMatches;
                      })
                      .map((tech) => (
                        <option key={tech.id} value={tech.id}>
                          {tech.name} {tech.specialty ? `(${tech.specialty})` : ''}
                        </option>
                      ))}
                  </select>

                  <Button type="submit" className="mt-4 w-full">
                    <UserPlus className="h-4 w-4" />
                    Asignar
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {canUpdateStatus && (
            <Card>
              <CardHeader>
                <CardTitle>Actualizar estado</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleStatusUpdate}>
                  <select
                    className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                  >
                    <option value="EN_PROCESO">En proceso</option>
                    <option value="ATENDIDA">Atendida</option>
                  </select>
                  <Button type="submit" className="mt-4">
                    <Save className="h-4 w-4" />
                    Guardar estado
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </aside>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Comentarios</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleComment}>
            <Textarea
              className="min-h-24"
              value={commentContent}
              onChange={(event) => setCommentContent(event.target.value)}
              placeholder="Escribe un comentario..."
              required
            />
            <Button type="submit" className="mt-3">
              <MessageSquarePlus className="h-4 w-4" />
              Agregar comentario
            </Button>
          </form>

        <div className="mt-6 space-y-3">
          {comments.length === 0 && (
            <EmptyState title="Sin comentarios" description="Aun no hay seguimiento escrito para esta solicitud." />
          )}
          {comments.map((comment) => (
            <article key={comment.id} className="rounded-md border border-slate-200 p-4">
              <p className="text-sm text-slate-700">{comment.content}</p>
              <p className="mt-2 text-xs text-slate-500">
                {comment.author?.name || 'Usuario'} - {new Date(comment.createdAt).toLocaleString()}
              </p>
            </article>
          ))}
          <Pagination meta={commentsMeta} onPageChange={loadComments} />
        </div>
        </CardContent>
      </Card>
    </div>
  );
};
