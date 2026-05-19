import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

import { cn } from '../../lib/utils.js';

const iconByVariant = {
  default: Info,
  destructive: AlertCircle,
  success: CheckCircle2,
};

export const Alert = ({ className, variant = 'default', title, children }) => {
  const Icon = iconByVariant[variant] || Info;
  const variantClass = {
    default: 'border-slate-200 bg-white text-slate-700',
    destructive: 'border-red-200 bg-red-50 text-red-800',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  }[variant];

  return (
    <div className={cn('flex gap-3 rounded-lg border p-4 text-sm', variantClass, className)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        {title && <p className="font-semibold">{title}</p>}
        <div className={cn(title && 'mt-1')}>{children}</div>
      </div>
    </div>
  );
};
