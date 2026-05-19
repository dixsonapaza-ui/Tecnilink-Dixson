import { cn } from '../../lib/utils.js';

export const Skeleton = ({ className, ...props }) => (
  <div className={cn('animate-pulse rounded-md bg-slate-200', className)} {...props} />
);
