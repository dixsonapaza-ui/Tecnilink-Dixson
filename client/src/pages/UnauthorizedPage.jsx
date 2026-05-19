import { Link } from 'react-router-dom';
import { ShieldX } from 'lucide-react';

import { buttonVariants } from '../components/ui/button.jsx';
import { Card, CardContent } from '../components/ui/card.jsx';

export const UnauthorizedPage = () => (
  <Card>
    <CardContent className="px-8 py-10 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg bg-amber-50 text-amber-700">
        <ShieldX className="h-7 w-7" />
      </div>
      <h1 className="mt-5 text-2xl font-semibold text-slate-950">Sin permisos</h1>
      <p className="mt-2 text-sm text-slate-600">Tu rol no tiene acceso a esta seccion.</p>
      <Link to="/dashboard" className={buttonVariants({ className: 'mt-6' })}>
        Volver al dashboard
      </Link>
    </CardContent>
  </Card>
);
