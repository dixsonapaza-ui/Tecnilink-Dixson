import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ShieldCheck, Workflow } from 'lucide-react';

import { ErrorMessage } from '../components/ErrorMessage.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { buttonVariants } from '../components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { getHealthStatus } from '../services/api.js';

export const LandingPage = () => {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadHealth = async () => {
      try {
        const data = await getHealthStatus();
        setHealth(data);
      } catch {
        setError('No se pudo conectar con la API. Verifica que el backend este ejecutandose.');
      }
    };

    loadHealth();
  }, []);

  return (
    <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-6xl items-center gap-10 px-6 py-12 lg:grid-cols-[1.15fr_0.85fr]">
      <div>
        <Badge variant="outline">Soporte tecnico academico</Badge>
        <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
          Tecnilink
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
          Gestiona solicitudes tecnicas con roles, seguimiento de estados y una base lista para pruebas academicas.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/login"
            className={buttonVariants({ size: 'lg' })}
          >
            Iniciar sesion
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/register"
            className={buttonVariants({ variant: 'outline', size: 'lg' })}
          >
            Crear cuenta
          </Link>
        </div>
        <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
          {[
            ['Roles claros', ShieldCheck],
            ['Flujo trazable', Workflow],
            ['API conectada', CheckCircle2],
          ].map(([label, Icon]) => (
            <div key={label} className="flex items-center gap-2 text-sm text-slate-600">
              <Icon className="h-4 w-4 text-slate-950" />
              {label}
            </div>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estado del backend</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorMessage message={error} />
          {!health && !error && <p className="text-sm text-slate-600">Consultando API...</p>}
          {health && (
            <dl className="grid gap-4 text-sm">
              <div>
                <dt className="font-medium text-slate-500">Status</dt>
                <dd className="mt-1 text-emerald-700">{health.status}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">Message</dt>
                <dd className="mt-1 text-slate-950">{health.message}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">Environment</dt>
                <dd className="mt-1 text-slate-950">{health.environment}</dd>
              </div>
            </dl>
          )}
        </CardContent>
      </Card>
    </section>
  );
};
