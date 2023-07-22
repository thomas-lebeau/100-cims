'use client';

import { ArrowUpDown, Sparkles, CheckCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import type { Cim, Comarca } from '@/types/cim';
import type { ColumnDef } from '@tanstack/react-table';

export const columns: ColumnDef<Cim>[] = [
  {
    accessorKey: 'essencial',
    header: '',
    cell: ({ row }) => {
      return (
        <>
          {row.getValue<boolean>('essencial') ? (
            <Sparkles className="h-4 w-4" />
          ) : null}
        </>
      );
    },
  },
  {
    accessorKey: 'climbed',
    header: '',
    cell: ({ row }) => {
      return (
        <>
          {row.getValue<boolean>('climbed') ? (
            <CheckCircle className="h-4 w-4" />
          ) : null}
        </>
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
      return (
        <>
          {row.getValue<Comarca[]>('comarcas')?.map((comarca) => (
            <Badge className="space-x-2" variant="secondary" key={comarca.id}>
              {comarca.name}
            </Badge>
          ))}
        </>
      );
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
