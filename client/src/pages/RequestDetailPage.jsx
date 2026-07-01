import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MessageSquarePlus, Save, UserPlus, XCircle, CheckCircle2 } from 'lucide-react';
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
  releaseRequest,
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
  const [assigningStatus, setAssigningStatus] = useState('idle'); // 'idle' | 'loading' | 'success'
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

    setAssigningStatus('loading');
    try {
      await assignRequest(id, { technicianId: sanitizedTechnicianId });
      setAssigningStatus('success');
      toast.success('Técnico asignado correctamente', {
        description: 'El técnico ha sido asignado al caso con éxito y comenzará a atenderlo.',
        duration: 4000,
      });
      
      setTimeout(async () => {
        setSearchFilter('');
        setTechnicianId('');
        setAssigningStatus('idle');
        await loadRequest();
      }, 1500);
    } catch (apiError) {
      setAssigningStatus('idle');
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
      toast.success('Estado actualizado correctamente', {
        description: `El nuevo estado de la solicitud es: ${status === 'EN_PROCESO' ? 'En proceso' : 'Atendida'}.`,
        duration: 4000,
      });
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
      toast.success('Solicitud cancelada con éxito', {
        description: 'La solicitud técnica ha cambiado su estado a CANCELADA.',
        duration: 4000,
      });
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
      toast.success('Comentario agregado con éxito', {
        description: 'Tu comentario ha sido publicado en el hilo de seguimiento.',
        duration: 4000,
      });
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
                <dd className="mt-2 flex items-center gap-3">
                  {request.technician?.name ? (
                    <>
                      {request.technician.avatarUrl ? (
                        <img
                          src={request.technician.avatarUrl}
                          alt={request.technician.name}
                          className="h-10 w-10 rounded-full object-cover border border-slate-200 shadow-sm"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shadow-sm">
                          {request.technician.name[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-emerald-700">
                          Asignado a: {request.technician.name}
                        </p>
                        <p className="text-xs text-slate-500">{request.technician.email}</p>
                      </div>
                    </>
                  ) : (
                    <span className="text-sm text-slate-500 font-medium">Sin asignar</span>
                  )}
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
            <div className="space-y-4">
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
                    <Button type="submit" className="mt-4 w-full">
                      <Save className="h-4 w-4" />
                      Guardar estado
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {request.status === 'EN_PROCESO' && (
                <Card className="border-rose-100 dark:border-rose-950">
                  <CardHeader>
                    <CardTitle className="text-rose-900 dark:text-rose-400">Liberar Trabajo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                      Si tienes alguna emergencia o no puedes completar esta solicitud, puedes devolverla a la bolsa de trabajo para que otro técnico pueda tomarla.
                    </p>
                    <ConfirmDialog
                      title="¿Liberar este trabajo?"
                      description="Esta solicitud técnica volverá a estar disponible para todos los técnicos de tu especialidad."
                      confirmLabel="Sí, liberar trabajo"
                      isDanger
                      onConfirm={async () => {
                        try {
                          await releaseRequest(request.id);
                          toast.success('Trabajo liberado y devuelto a la bolsa');
                          await loadRequest();
                        } catch (err) {
                          toast.error(getApiErrorMessage(err, 'No se pudo liberar el trabajo.'));
                        }
                      }}
                    >
                      <Button variant="dangerOutline" className="w-full">
                        <XCircle className="h-4 w-4" />
                        Liberar Solicitud
                      </Button>
                    </ConfirmDialog>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </aside>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Comentarios</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleComment}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-slate-500">Nuevo Comentario</span>
              <span className="text-xs text-slate-400">{commentContent.length} / 1000</span>
            </div>
            <Textarea
              className="min-h-24"
              value={commentContent}
              onChange={(event) => setCommentContent(event.target.value)}
              placeholder="Escribe un comentario..."
              maxLength={1000}
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

      {/* Loading & Success Modal Overlay */}
      {assigningStatus !== 'idle' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white p-8 shadow-2xl max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200">
            {assigningStatus === 'loading' ? (
              <>
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-100 border-t-slate-950"></div>
                <p className="mt-4 text-base font-bold text-slate-900">Asignando tecnico...</p>
                <p className="mt-1 text-xs text-slate-400">Guardando cambios en el sistema</p>
              </>
            ) : (
              <>
                <div className="rounded-full bg-emerald-50 p-3 text-emerald-600 animate-bounce">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <p className="mt-4 text-base font-extrabold text-slate-900">¡Tecnico asignado!</p>
                <p className="mt-1 text-xs text-slate-400">Solicitud actualizada correctamente</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
