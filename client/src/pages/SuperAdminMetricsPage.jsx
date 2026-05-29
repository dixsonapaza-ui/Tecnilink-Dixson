import { useEffect, useState } from 'react';
import { ShieldAlert, Users, TicketCheck, ClipboardList, Clock } from 'lucide-react';
import { toast } from 'sonner';

import { PageHeader } from '../components/PageHeader.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { LoadingState } from '../components/LoadingState.jsx';
import { ErrorMessage } from '../components/ErrorMessage.jsx';
import { getSuperAdminMetrics } from '../services/api.js';

export const SuperAdminMetricsPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setIsLoading(true);
      const data = await getSuperAdminMetrics();
      setMetrics(data);
      setError('');
    } catch (err) {
      setError('Error al cargar metricas globales');
      toast.error('Error de conexion');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingState text="Cargando metricas..." />;

  return (
    <div>
      <PageHeader
        title="Metricas Globales"
        description="Resumen de la actividad en toda la plataforma."
      />
      <ErrorMessage message={error} />
      
      {metrics && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <Users className="h-4 w-4" /> Usuarios (Clientes)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{metrics.users}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <ShieldAlert className="h-4 w-4" /> Tecnicos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{metrics.technicians}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <ClipboardList className="h-4 w-4" /> Total Solicitudes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{metrics.requests}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <Clock className="h-4 w-4" /> Solicitudes Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">{metrics.pendingRequests}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <TicketCheck className="h-4 w-4" /> Solicitudes Atendidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">{metrics.attendedRequests}</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
