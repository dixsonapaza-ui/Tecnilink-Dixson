import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';

import { cn } from '../../lib/utils.js';

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

export const DropdownMenuContent = ({ className, sideOffset = 6, ...props }) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      className={cn(
        'z-50 min-w-44 overflow-hidden rounded-md border border-slate-200 bg-white p-1 text-slate-950 shadow-md',
        className,
      )}
      sideOffset={sideOffset}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
);

export const DropdownMenuItem = ({ className, ...props }) => (
  <DropdownMenuPrimitive.Item
    className={cn(
      'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100',
      className,
    )}
    {...props}
  />
);
