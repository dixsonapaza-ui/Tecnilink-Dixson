import { Link } from 'react-router-dom';
import { SearchX } from 'lucide-react';

import { buttonVariants } from '../components/ui/button.jsx';
import { Card, CardContent } from '../components/ui/card.jsx';

export const NotFoundPage = () => (
  <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
    <Card className="max-w-md text-center">
      <CardContent className="px-8 py-10">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg bg-slate-100 text-slate-500">
          <SearchX className="h-7 w-7" />
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500">404</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">Pagina no encontrada</h1>
        <p className="mt-3 text-slate-600">La ruta que intentas abrir no existe en Tecnilink.</p>
        <Link to="/" className={buttonVariants({ className: 'mt-6' })}>
          Volver al inicio
        </Link>
      </CardContent>
    </Card>
  </main>
);
