'use client';

import { ArrowUpDown, Sparkles, CheckCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import type { Cim, Comarca } from '@/types/cim';
import type { ColumnDef } from '@tanstack/react-table';
import { cn } from '@/lib/utils';

export const columns: ColumnDef<Cim>[] = [
  {
    accessorKey: 'essencial',
    header: '',
    cell: ({ row }) => {
      return row.getValue<boolean>('essencial') ? (
        <Sparkles className="h-4 w-4 text-yellow-500" />
      ) : null;
    },
  },
  {
    accessorKey: 'climbed',
    header: '',
    cell: ({ row }) => {
      const climbed = row.getValue<boolean>('climbed');

      // TODO: fix this type!
      // @ts-expect-error
      const { id, onClickClimb } = row.original;

      return (
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();

            onClickClimb(id, climbed);
          }}
        >
          <CheckCircle
            strokeWidth={3}
            className={cn(
              'h-4 w-4',
              climbed ? 'text-green-500' : 'text-gray-300'
            )}
          />
        </Button>
      );
    },
  },
  {
    accessorKey: 'name',
    header: 'Cim',
  },
  {
    accessorKey: 'comarcas',
    header: 'Comarca',
    cell: ({ row }) => {
      return row.getValue<Comarca[]>('comarcas')?.map((comarca) => (
        <Badge className="m-1" variant="secondary" key={comarca.id}>
          {comarca.name}
        </Badge>
      ));
    },
  },
  {
    accessorKey: 'altitude',
    header: ({ column }) => {
      return (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Altitude
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const altitude = row.getValue<number>('altitude');

      return <div className="text-right">{altitude} m</div>;
    },
  },
];
