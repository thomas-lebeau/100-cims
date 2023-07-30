import { type ReactNode } from 'react';
import { ChevronsUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';

import type { Column } from '@tanstack/react-table';

export function HeaderCell<TData, TValue>({
  column,
  children,
  className,
}: {
  column: Column<TData, TValue>;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={className}>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        {children}
        <ChevronsUpDown className={cn(children ? 'ml-2' : null, 'h-4 w-4')} />
      </Button>
    </div>
  );
}
