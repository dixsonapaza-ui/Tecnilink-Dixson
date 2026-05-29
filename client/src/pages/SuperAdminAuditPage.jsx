import { useEffect, useState } from 'react';

import { PageHeader } from '../components/PageHeader.jsx';
import { LoadingState } from '../components/LoadingState.jsx';
import { ErrorMessage } from '../components/ErrorMessage.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { Pagination } from '../components/Pagination.jsx';
import { Card } from '../components/ui/card.jsx';
import { getAuditLogs } from '../services/api.js';

export const SuperAdminAuditPage = () => {
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLogs(page);
  }, [page]);

  const loadLogs = async (targetPage) => {
    try {
      setIsLoading(true);
      const result = await getAuditLogs({ page: targetPage, limit: 15 });
      setLogs(result.data);
      setMeta(result.meta);
      setError('');
    } catch (err) {
      setError('Error al cargar logs de auditoria');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Auditoria del Sistema"
        description="Historial de acciones importantes realizadas."
      />
      
      <ErrorMessage message={error} />

      {isLoading ? (
        <LoadingState text="Cargando logs..." />
      ) : logs.length === 0 ? (
        <EmptyState
          title="Sin registros"
          description="Aun no hay acciones registradas en el sistema."
        />
      ) : (
        <Card className="mt-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-100 text-xs uppercase text-slate-700">
                <tr>
                  <th className="px-6 py-4 font-semibold">Fecha</th>
                  <th className="px-6 py-4 font-semibold">Accion</th>
                  <th className="px-6 py-4 font-semibold">Detalle</th>
                  <th className="px-6 py-4 font-semibold">Usuario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4">
                      {new Intl.DateTimeFormat('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }).format(new Date(log.createdAt))}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {log.action}
                    </td>
                    <td className="px-6 py-4">
                      {log.details}
                    </td>
                    <td className="px-6 py-4">
                      {log.user ? `${log.user.name} (${log.user.email})` : 'Sistema'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {meta && meta.pages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={meta.page}
            totalPages={meta.pages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};
