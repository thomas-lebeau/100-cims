'use client';

import React, { useCallback, useState } from 'react';

import { Map, Marker } from '@/components/ui/map';

import { columns } from './cims/columns';
import { DataTable } from './cims/data-table';

import { type Cim } from '@/types/cim';
import { useCimFilter } from './use-cim-filter';
import { cn } from '@/lib/utils';
import ClimbStats from './climb-stats';
import FilterBar from './filter-bar';
import { useCims } from './use-cims';

type mainProps = {
  initialCims: Cim[];
  className?: string;
};

export default function Main({ className, initialCims }: mainProps) {
  const [cims, setClimbed] = useCims(initialCims);
  const [selected, setSelect] = useState<string | null>(null);
  const [filteredCims, filter, setFilter] = useCimFilter(cims);

  console.log('rendering main');

  const onClickClimb = useCallback(
    (id: string, climbed: boolean) => {
      setClimbed({ cimId: id, value: !climbed });

      fetch(`/api/cims/${id}`, {
        method: climbed ? 'DELETE' : 'PUT',
      }).then((res) => {
        if (res.status !== 200) {
          setClimbed({ cimId: id, value: climbed });
        }
      });
    },
    [setClimbed]
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
