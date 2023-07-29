'use client';

import { useCallback, useMemo, useState } from 'react';

import { Map, Marker } from '@/components/map';

import { columns } from './columns-def';
import { DataTable } from '../../components/data-table/data-table';

import { Comarca, type Cim } from '@/types/cim';
import { useCimFilter } from './use-cim-filter';
import { cn } from '@/lib/utils';
import ClimbStats from './climb-stats';
import FilterBar from './filter-bar';
import { useCims } from './use-cims';

type mainProps = {
  initialCims: Cim[];
  className?: string;
  comarcas: Comarca[];
};

export default function Main({ className, initialCims, comarcas }: mainProps) {
  const [cims, setClimbed] = useCims(initialCims);
  const [selected, setSelect] = useState<string | null>(null);
  const [filteredCims, filter, setFilter] = useCimFilter(cims);

  const geoJsonUrl = useMemo(
    () =>
      filter.comarca ? `/api/comarca/${filter.comarca.join(',')}` : undefined,
    [filter.comarca]
  );

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
      style={{ height: 'calc(100% - 3rem)' }}
    >
      <Map className="basis-2/3 h-full" geoJsonUrl={geoJsonUrl}>
        {filteredCims.map((cim) => (
          <Marker
            key={cim.id}
            {...cim}
            selected={selected === cim.id}
            onClickClimb={onClickClimb}
            onClick={setSelect}
          />
        ))}
      </Map>
      <aside className="flex basis-1/3 flex-col">
        <FilterBar filter={filter} setFilter={setFilter} comarcas={comarcas} />
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
