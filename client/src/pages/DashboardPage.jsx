import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CheckCircle,
  ClipboardList,
  Clock,
  FolderTree,
  PlusCircle,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  TicketCheck,
  UserCircle,
} from 'lucide-react';

import { LoadingState } from '../components/LoadingState.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { buttonVariants } from '../components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getRequests } from '../services/api.js';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch requests to calculate metrics on client-side
      const result = await getRequests({ page: 1, limit: 100 });
      setRequests(result.data || []);
    } catch (err) {
      console.error('Error al cargar datos del dashboard:', err);
      setError('No se pudieron cargar los datos del panel de control.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <LoadingState message="Cargando panel de control..." />;
  }

  // Count states based on the retrieved list (scoped automatically by role on backend)
  const total = requests.length;
  const pending = requests.filter((r) => r.status === 'PENDIENTE').length;
  const inProgress = requests.filter((r) => r.status === 'EN_PROCESO').length;
  const completed = requests.filter((r) => r.status === 'ATENDIDA').length;

  const recentRequests = requests.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 p-6 text-white shadow-lg">
        <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800/80 px-3 py-1 text-xs font-semibold text-slate-300 ring-1 ring-white/10">
              {user.role === 'SUPER_ADMIN' && <ShieldAlert className="h-3 w-3 text-red-400" />}
              {user.role === 'ADMIN' && <ShieldCheck className="h-3 w-3 text-sky-400" />}
              {user.role === 'TECNICO' && <ClipboardList className="h-3 w-3 text-emerald-400" />}
              {user.role === 'CLIENTE' && <TicketCheck className="h-3 w-3 text-amber-400" />}
              {user.role}
            </span>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              ¡Hola de nuevo, {user.name}! 👋
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              {user.role === 'ADMIN' && 'Monitorea y asigna las solicitudes técnicas de la plataforma.'}
              {user.role === 'SUPER_ADMIN' && 'Panel global de administración y auditoría del sistema.'}
              {user.role === 'TECNICO' && 'Revisa tus trabajos asignados y actualiza su estado de atención.'}
              {user.role === 'CLIENTE' && 'Administra tus solicitudes y reporta nuevos requerimientos técnicos.'}
            </p>
          </div>
          <button
            onClick={loadData}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 active:scale-95 transition-all self-start sm:self-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </button>
        </div>
        {/* Abstract background gradient decorations */}
        <div className="absolute right-0 top-0 -mr-20 -mt-20 h-60 w-60 rounded-full bg-blue-500/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 -mb-10 h-40 w-40 rounded-full bg-emerald-500/5 blur-3xl"></div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* KPI Stats Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">Solicitudes Totales</p>
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <Activity className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold tracking-tight text-slate-900">{total}</p>
              <p className="text-xs text-slate-500 mt-1">Registradas en el sistema</p>
            </div>
          </CardContent>
        </Card>

        {/* Pending Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">Pendientes</p>
              <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold tracking-tight text-slate-900">{pending}</p>
              <p className="text-xs text-slate-500 mt-1">Esperando asignación o inicio</p>
            </div>
          </CardContent>
        </Card>

        {/* In Progress Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">En Proceso</p>
              <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                <RefreshCw className="h-5 w-5 animate-spin-slow" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold tracking-tight text-slate-900">{inProgress}</p>
              <p className="text-xs text-slate-500 mt-1">Técnico trabajando en la solución</p>
            </div>
          </CardContent>
        </Card>

        {/* Completed Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">Atendidas</p>
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold tracking-tight text-slate-900">{completed}</p>
              <p className="text-xs text-slate-500 mt-1">Servicios finalizados con éxito</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Split Content Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Side: Recent Requests list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Solicitudes Recientes</h2>
            <Link to="/requests" className="text-xs font-semibold text-slate-900 hover:underline flex items-center gap-1">
              Ver todas <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentRequests.length === 0 ? (
              <Card className="flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
                <ClipboardList className="h-8 w-8 text-slate-400" />
                <p className="mt-3 text-sm font-semibold text-slate-700">Sin solicitudes registradas</p>
                <p className="text-xs text-slate-500 mt-1">Aquí se mostrarán las solicitudes de soporte técnico.</p>
                {user.role === 'CLIENTE' && (
                  <Link to="/requests/new" className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800">
                    <PlusCircle className="h-3.5 w-3.5" /> Crear solicitud
                  </Link>
                )}
              </Card>
            ) : (
              recentRequests.map((req) => (
                <Card key={req.id} className="hover:border-slate-350 transition-colors">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge value={req.status} />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {req.category?.name || 'Soporte'}
                        </span>
                      </div>
                      <h3 className="mt-1 text-sm font-bold text-slate-900 truncate">
                        {req.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 truncate">
                        {req.description}
                      </p>
                      <div className="mt-2 text-[11px] text-slate-400">
                        {user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? (
                          <span>Cliente: {req.client?.name}</span>
                        ) : (
                          <span>Técnico: {req.technician?.name || 'Sin asignar'}</span>
                        )}
                        <span className="mx-2">•</span>
                        <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Link
                      to={`/requests/${req.id}`}
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:scale-95 transition-all"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Quick Actions Panel */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Accesos Rápidos</h2>
          <Card>
            <CardContent className="p-4 space-y-2">
              {user.role === 'SUPER_ADMIN' && (
                <>
                  <Link to="/superadmin/metrics" className="flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="rounded-md bg-red-50 p-2 text-red-600">
                        <ShieldAlert className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-semibold text-slate-900">Métricas Globales</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <Link to="/superadmin/admins" className="flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="rounded-md bg-slate-100 p-2 text-slate-800">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-semibold text-slate-900">Gestionar Administradores</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <Link to="/superadmin/audit" className="flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="rounded-md bg-slate-100 p-2 text-slate-800">
                        <Activity className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-semibold text-slate-900">Registros de Auditoría</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </>
              )}

              {user.role === 'ADMIN' && (
                <>
                  <Link to="/requests" className="flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="rounded-md bg-sky-50 p-2 text-sky-600">
                        <ClipboardList className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-semibold text-slate-900">Ver Solicitudes</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <Link to="/categories" className="flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="rounded-md bg-amber-50 p-2 text-amber-600">
                        <FolderTree className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-semibold text-slate-900">Gestionar Categorías</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </>
              )}

              {user.role === 'CLIENTE' && (
                <>
                  <Link to="/requests/new" className="flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="rounded-md bg-amber-50 p-2 text-amber-600">
                        <PlusCircle className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-semibold text-slate-900">Crear Nueva Solicitud</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <Link to="/requests" className="flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="rounded-md bg-slate-100 p-2 text-slate-800">
                        <TicketCheck className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-semibold text-slate-900">Mis Solicitudes Técnicas</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </>
              )}

              {user.role === 'TECNICO' && (
                <Link to="/requests" className="flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-emerald-50 p-2 text-emerald-600">
                      <ClipboardList className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-slate-900">Mis Asignaciones</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )}

              <Link to="/profile" className="flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-slate-100 p-2 text-slate-800">
                    <UserCircle className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold text-slate-900">Ver Mi Perfil</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
