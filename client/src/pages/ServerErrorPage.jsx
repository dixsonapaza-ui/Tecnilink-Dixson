import { Link } from 'react-router-dom';
import { ServerCrash } from 'lucide-react';

import { buttonVariants } from '../components/ui/button.jsx';
import { Card, CardContent } from '../components/ui/card.jsx';

export const ServerErrorPage = () => (
  <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
    <Card className="max-w-md text-center">
      <CardContent className="px-8 py-10">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg bg-red-50 text-red-700">
          <ServerCrash className="h-7 w-7" />
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500">500</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">Error del servidor</h1>
        <p className="mt-3 text-slate-600">
          No se pudo completar la operacion. Verifica el backend o intenta nuevamente.
        </p>
        <Link to="/dashboard" className={buttonVariants({ className: 'mt-6' })}>
          Volver al dashboard
        </Link>
      </CardContent>
    </Card>
  </main>
);
