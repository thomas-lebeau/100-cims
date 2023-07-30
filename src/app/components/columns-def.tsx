'use client';

import { Sparkles, CheckCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';

import type { Cim, Comarca } from '@/types/cim';
import type { ColumnDef } from '@tanstack/react-table';
import { HeaderCell } from '../../components/data-table/header-cell';

export const columns: ColumnDef<Cim>[] = [
  {
    accessorKey: 'essencial',
    header: ({ column }) => <HeaderCell column={column} />,
    cell: ({ row }) => {
      return row.getValue<boolean>('essencial') ? (
        <Sparkles className="h-4 w-4 text-yellow-500" />
      ) : null;
    },
  },
  {
    accessorKey: 'climbed',
    header: ({ column }) => <HeaderCell column={column} />,
    cell: ({ row, table }) => {
      const climbed = row.getValue<boolean>('climbed');

      const { id } = row.original;

      return (
        <Button
          className="rounded-full"
          size="icon"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();

            const meta = table.options.meta;

            // meta is of type `unknown`
            if (
              meta &&
              'onClickClimb' in meta &&
              typeof meta.onClickClimb === 'function'
            ) {
              meta.onClickClimb(id, climbed);
            }
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
    header: ({ column }) => <HeaderCell column={column}>Cim</HeaderCell>,
  },
  {
    accessorKey: 'comarcas',
    header: ({ column }) => <HeaderCell column={column}>Comarca</HeaderCell>,
    cell: ({ row, table }) => {
      return row.getValue<Comarca[]>('comarcas')?.map((comarca) => (
        <Badge
          asChild
          className="m-1"
          variant="secondary"
          key={comarca.codigo}
          onClick={(e) => {
            e.stopPropagation();

            const meta = table.options.meta;

            // meta is of type `unknown`
            if (
              meta &&
              'onClickComarca' in meta &&
              typeof meta.onClickComarca === 'function'
            ) {
              meta.onClickComarca(comarca.codigo);
            }
          }}
        >
          <button>{comarca.name}</button>
        </Badge>
      ));
    },
  },
  {
    accessorKey: 'altitude',
    header: ({ column }) => (
      <HeaderCell column={column} className="text-right">
        Altitude
      </HeaderCell>
    ),
    cell: ({ row }) => {
      const altitude = row.getValue<number>('altitude');

      return <div className="text-right">{altitude} m</div>;
    },
  },
];
