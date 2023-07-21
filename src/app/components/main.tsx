'use client';

import React, { useEffect, useReducer } from 'react';
import { Cog } from 'lucide-react';

import { Map, useMap, Marker } from '@/components/ui/map';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { columns } from './cims/columns';
import { DataTable } from './cims/data-table';

import type { Cim } from '@/types/cim';
import type { ValueOf } from '@/types/values-of';

const FILTER_TYPE = {
  name: 'name',
  essencial: 'essencial',
  comarca: 'comarca',
} as const;

type FilterType = ValueOf<typeof FILTER_TYPE>;

type FilterState = {
  name?: string;
  essencial?: boolean;
  comarca?: Array<string>;
};

type Action<T extends FilterType> = {
  [K in T]: {
    type: K;
    payload: FilterState[K];
  };
}[T];

type FilterValue<T extends FilterType> = {
  [K in T]: Exclude<FilterState[K], undefined>;
}[T];

type FilterFn<T extends FilterType> = {
  [K in T]: (filterValue: FilterValue<K>) => (cim: Cim) => boolean; // eslint-disable-line no-unused-vars
};

const filterFns: FilterFn<FilterType> = {
  name: (name: string) => (cim: Cim) => cim.name.toLowerCase().includes(name),
  essencial: (essencial: boolean) => (cim: Cim) => cim.essencial === essencial,
  comarca: (comarca: Array<string>) => (cim: Cim) =>
    cim.comarca.some((c) => comarca.includes(c)),
} as const;

function reducer(state: FilterState, action: Action<FilterType>): FilterState {
  if (action.type === FILTER_TYPE.name) {
    return {
      ...state,
      name: action.payload,
    };
  }

  if (action.type === FILTER_TYPE.essencial) {
    return {
      ...state,
      essencial: action.payload,
    };
  }

  if (action.type === FILTER_TYPE.comarca) {
    return {
      ...state,
      comarca: action.payload,
    };
  }

  return state;
}

type MainProps = {
  cims: Cim[];
};

export default function Main({ cims }: MainProps) {
  const map = useMap();
  const [filteredCims, setFilteredCims] = React.useState<Cim[]>(cims);
  const [selected, setSelect] = React.useState<string | null>(null);
  const [filter, setFilter] = useReducer(reducer, {});

  useEffect(
    function applyFilters() {
      let filteredCims = cims;

      if (filter.essencial) {
        filteredCims = filteredCims.filter(
          filterFns.essencial(filter.essencial)
        );
      }

      if (filter.comarca) {
        filteredCims = filteredCims.filter(filterFns.comarca(filter.comarca));
      }

      if (filter.name) {
        filteredCims = filteredCims.filter(filterFns.name(filter.name));
      }

      setFilteredCims(filteredCims);
    },
    [cims, filter]
  );

  return (
    <main className="grid grid-cols-3 gap-2">
      <div className="col-span-2">
        <Map className="h-screen" map={map}>
          {filteredCims.map((cim) => (
            <Marker key={cim.id} {...cim} selected={selected === cim.id} />
          ))}
        </Map>
      </div>
      <div className="max-h-screen overflow-scroll">
        <div className="py-2 flex">
          <Input
            type="search"
            placeholder="Filter cims..."
            value={filter.name ?? ''}
            onChange={(event) =>
              setFilter({ type: FILTER_TYPE.name, payload: event.target.value })
            }
            className="max-w space-x-2"
          />
          <Button className="space-x-2" variant="outline" size="icon">
            <Cog
              className="h-4 w-4"
              onClick={() =>
                setFilter({
                  type: FILTER_TYPE.essencial,
                  payload: !filter.essencial,
                })
              }
            />
          </Button>
        </div>
        <DataTable
          columns={columns}
          data={filteredCims}
          onClickRow={({ id }) => setSelect(id)}
        />
      </div>
    </main>
  );
}
