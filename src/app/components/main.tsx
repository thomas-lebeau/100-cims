'use client';

import React, { useCallback, useEffect } from 'react';

import { Map, Marker } from '@/components/ui/map';

import { columns } from './cims/columns';
import { DataTable } from './cims/data-table';

import { cimsSchema, type Cim } from '@/types/cim';
import { useCimFilter } from './use-cim-filter';
import { cn } from '@/lib/utils';
import ClimbStats from './climb-stats';
import FilterBar from './filter-bar';

export default function Main({ className }: { className?: string }) {
  const [cims, setCims] = React.useState<Cim[]>([]);

  const [selected, setSelect] = React.useState<string | null>(null);
  const [filteredCims, filter, setFilter] = useCimFilter(cims);

  const onClickClimb = useCallback((id: string, climbed: boolean) => {
    fetch(`/api/cims/${id}`, {
      method: climbed ? 'DELETE' : 'PUT',
    })
      .then((res) => res.json())
      .then((cim) => cimsSchema.parse(cim))
      .then((cims) => setCims(cims));
  }, []);

  useEffect(
    function fetchCims() {
      fetch('/api/cims')
        .then((res) => res.json())
        .then((cim) => cimsSchema.parse(cim))
        .then((cims) => setCims(cims));
    },
    [onClickClimb]
  );

  return (
    <main
      className={cn(className, 'flex')}
      style={{ height: 'calc(100% - 5rem)' }}
    >
      <Map className="basis-2/3 h-full">
        {filteredCims.map((cim) => (
          <Marker
            key={cim.id}
            {...cim}
            selected={selected === cim.id}
            onClickClimb={onClickClimb}
          />
        ))}
      </Map>
      <aside className="flex basis-1/3 flex-col">
        <FilterBar filter={filter} setFilter={setFilter} />
        <DataTable
          columns={columns}
          data={filteredCims}
          className="overflow-auto grow p-2"
          onClickRow={({ id }) => setSelect(id)}
          meta={{ onClickClimb }}
        />
        <ClimbStats cims={filteredCims} />
      </aside>
    </main>
  );
}
