import { cva } from 'class-variance-authority';

import { cn } from '../../lib/utils.js';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-slate-950 text-white',
        secondary: 'border-transparent bg-slate-100 text-slate-700',
        outline: 'border-slate-200 bg-white text-slate-700',
        pending: 'border-amber-200 bg-amber-50 text-amber-700',
        progress: 'border-blue-200 bg-blue-50 text-blue-700',
        done: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        canceled: 'border-slate-200 bg-slate-100 text-slate-600',
        low: 'border-teal-200 bg-teal-50 text-teal-700',
        medium: 'border-violet-200 bg-violet-50 text-violet-700',
        high: 'border-red-200 bg-red-50 text-red-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export const Badge = ({ className, variant, ...props }) => (
  <span className={cn(badgeVariants({ variant, className }))} {...props} />
);
