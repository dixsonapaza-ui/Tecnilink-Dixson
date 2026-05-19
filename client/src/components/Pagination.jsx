import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from './ui/button.jsx';

export const Pagination = ({ meta, onPageChange }) => {
  if (!meta) {
    return null;
  }

  const canGoPrevious = meta.page > 1;
  const canGoNext = meta.page < meta.totalPages;

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
      <span>
        Pagina {meta.page} de {meta.totalPages || 1} - {meta.total} registros
      </span>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canGoPrevious}
          onClick={() => onPageChange(meta.page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canGoNext}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
