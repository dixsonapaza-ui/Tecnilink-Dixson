import { useEffect, useState } from 'react';

import { getHealthStatus } from '../services/api.js';

export const Home = () => {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHealthStatus = async () => {
      try {
        const data = await getHealthStatus();
        setHealth(data);
      } catch {
        setError('No se pudo conectar con la API de Tecnilink.');
      } finally {
        setIsLoading(false);
      }
    };

    loadHealthStatus();
  }, []);

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-12">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-cyan-300">
          Plataforma de soporte tecnico
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Tecnilink
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-300">
          Base inicial del proyecto academico para gestionar solicitudes de soporte tecnico con roles de administrador,
          cliente y tecnico.
        </p>
      </div>

      <div className="mt-10 max-w-2xl rounded-lg border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/30">
        <h2 className="text-xl font-semibold text-white">Estado del backend</h2>
        {isLoading && <p className="mt-4 text-slate-300">Consultando API...</p>}
        {error && <p className="mt-4 text-red-300">{error}</p>}
        {health && (
          <dl className="mt-5 grid gap-4 text-sm text-slate-300 sm:grid-cols-2">
            <div>
              <dt className="font-medium text-slate-500">Status</dt>
              <dd className="mt-1 text-base text-emerald-300">{health.status}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Environment</dt>
              <dd className="mt-1 text-base text-white">{health.environment}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-medium text-slate-500">Message</dt>
              <dd className="mt-1 text-base text-white">{health.message}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-medium text-slate-500">Timestamp</dt>
              <dd className="mt-1 break-words text-base text-white">{health.timestamp}</dd>
            </div>
          </dl>
        )}
      </div>
    </section>
  );
};
