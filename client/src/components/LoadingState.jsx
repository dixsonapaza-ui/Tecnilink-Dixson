import { Card, CardContent } from './ui/card.jsx';
import { Skeleton } from './ui/skeleton.jsx';

export const LoadingState = ({ message = 'Cargando...' }) => (
  <Card>
    <CardContent className="space-y-4 pt-6">
      <div className="text-sm font-medium text-slate-600">{message}</div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </CardContent>
  </Card>
);
