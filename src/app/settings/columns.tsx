"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Sparkles, ExternalLink } from "lucide-react";
import Link from "next/link";
import { HeaderCell } from "@/components/data-table/header-cell";
import { Badge } from "@/components/ui/badge";
import type { Comarca } from "@/lib/db/comarcas";

type Ascent = {
  id: string;
  cimName: string;
  cimAltitude: number;
  activityName: string;
  activityId: string | null;
  date: Date;
  isEssencial: boolean;
  comarcas: Comarca[];
};

export const columns: ColumnDef<Ascent>[] = [
  {
    accessorKey: "isEssencial",
    header: ({ column }) => <HeaderCell column={column} />,
    cell: ({ cell }) => (
      <div className="flex items-center justify-center">
        {cell.getValue<boolean>() && <Sparkles className="h-4 w-4 text-yellow-500" />}
      </div>
    ),
  },
  {
    accessorKey: "cimName",
    header: ({ column }) => <HeaderCell column={column}>Peak</HeaderCell>,
    cell: ({ row }) => <div>{row.getValue("cimName")}</div>,
  },
  {
    accessorKey: "comarcas",
    header: ({ column }) => <HeaderCell column={column}>Comarca</HeaderCell>,
    cell: ({ row }) => {
      return row.getValue<Comarca[]>("comarcas")?.map((comarca) => (
        <Badge asChild className="m-1" variant="secondary" key={comarca.codigo}>
          <button>{comarca.name}</button>
        </Badge>
      ));
    },
  },
  {
    accessorKey: "activityName",
    header: ({ column }) => <HeaderCell column={column}>Activity</HeaderCell>,
    cell: ({ row }) => (
      <Link
        href={`https://www.strava.com/activities/${row.original.activityId}`}
        target="_blank"
        className="flex items-center gap-1 hover:underline"
      >
        {row.getValue("activityName")}
        <ExternalLink className="h-4 w-4 text-muted-foreground" />
      </Link>
    ),
  },
  {
    accessorKey: "cimAltitude",
    header: ({ column }) => (
      <HeaderCell column={column} className="text-right">
        Altitude
      </HeaderCell>
    ),
    cell: ({ row }) => <div className="text-right">{row.getValue<number>("cimAltitude")}m</div>,
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <HeaderCell column={column} className="text-right">
        Date
      </HeaderCell>
    ),
    cell: ({ row }) => <div className="text-right">{new Date(row.getValue<string>("date")).toLocaleDateString()}</div>,
  },
];
