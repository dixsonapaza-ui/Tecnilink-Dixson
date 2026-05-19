import { Inbox } from 'lucide-react';

import { Card, CardContent } from './ui/card.jsx';

export const EmptyState = ({ title = 'Sin resultados', description = 'No hay datos para mostrar.', action }) => (
  <Card className="border-dashed">
    <CardContent className="flex flex-col items-center justify-center px-6 py-10 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-lg bg-slate-100 text-slate-500">
        <Inbox className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </CardContent>
  </Card>
);
