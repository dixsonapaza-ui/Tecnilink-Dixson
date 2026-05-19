import { forwardRef } from 'react';

import { cn } from '../../lib/utils.js';

export const Textarea = forwardRef(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      'flex min-h-28 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-slate-950 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-70',
      className,
    )}
    ref={ref}
    {...props}
  />
));

Textarea.displayName = 'Textarea';
