import { cva } from 'class-variance-authority';
import { forwardRef } from 'react';

import { cn } from '../../lib/utils.js';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-slate-950 text-white hover:bg-slate-800',
        secondary: 'bg-slate-100 text-slate-950 hover:bg-slate-200',
        outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
        ghost: 'text-slate-700 hover:bg-slate-100 hover:text-slate-950',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        dangerOutline: 'border border-red-200 bg-white text-red-700 hover:bg-red-50',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-5',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export const Button = forwardRef(({ className, variant, size, ...props }, ref) => (
  <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
));

Button.displayName = 'Button';

export { buttonVariants };
