import { forwardRef } from 'react';

import { cn } from '../../lib/utils.js';

export const Input = forwardRef(({ className, type = 'text', ...props }, ref) => (
  <input
    className={cn(
      'flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-slate-950 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-70',
      className,
    )}
    ref={ref}
    type={type}
    {...props}
  />
));

Input.displayName = 'Input';
