'use client';

import React, { useCallback, useEffect, useMemo, useReducer } from 'react';
import { Settings2 } from 'lucide-react';

import { Map, useMap, Marker } from '@/components/ui/map';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { columns } from './cims/columns';
import { DataTable } from './cims/data-table';

import type { Cim } from '@/types/cim';
import type { ValueOf } from '@/types/values-of';
import {
  SecgmentedControl,
  SegmentedControlOption,
} from '@/components/ui/segmented-control';
import { Progress } from '@/components/ui/progress';
import { PUBLIC_API } from '@/lib/api';

const FILTER_TYPE = {
  name: 'name',
  essencial: 'essencial',
  comarca: 'comarca',
  climbed: 'climbed',
} as const;

type FilterType = ValueOf<typeof FILTER_TYPE>;

type FilterState = {
  name?: string;
  essencial?: boolean;
  comarca?: Array<string>;
  climbed?: boolean;
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

type ClimStats = {
  totalAltitude: number;
  totalCims: number;
  climbedAltitude: number;
  climbedCims: number;
  climbedPercentage: number;
  climbedCimsPercentage: number;
};

const filterFns: FilterFn<FilterType> = {
  name: (name: string) => (cim: Cim) => cim.name.toLowerCase().includes(name),
  essencial: (essencial: boolean) => (cim: Cim) => cim.essencial === essencial,
  comarca: (comarca: Array<string>) => (cim: Cim) =>
    cim.comarcas.some((c) => comarca.includes(c.name)),
  climbed: (climbed: boolean) => (cim: Cim) => cim.climbed === climbed,
} as const;

function reducer(state: FilterState, action: Action<FilterType>): FilterState {
  return {
    ...state,
    [action.type]: action.payload,
  };
}

export default function Main({ data: data }: { data: unknown }) {
  const [cims, setCims] = React.useState<Cim[]>([]);
  const map = useMap();
  const [showFilterControls, setShowFilterControls] =
    React.useState<boolean>(false);
  const [filteredCims, setFilteredCims] = React.useState<Cim[]>(cims);
  const [selected, setSelect] = React.useState<string | null>(null);
  const [filter, setFilter] = useReducer(reducer, {});

  console.log('srr', data);

  useEffect(() => {
    fetch(PUBLIC_API + '/demo/thing')
      .then((res) => res.json())
      .catch((err) => err)
      .then((res) => console.log('csr', res));
  }, []);

  const onClickClimb = useCallback((id: string, climbed: boolean) => {
    fetch(`/api/cims/${id}`, {
      method: climbed ? 'DELETE' : 'PUT',
    })
      .then((res) => res.json())
      .then((cims) => cims.map((cim: Cim) => ({ ...cim, onClickClimb })))
      .then((cims) => setCims(cims));
  }, []);

  useEffect(
    function fetchCims() {
      fetch('/api/cims')
        .then((res) => res.json())
        .then((cims) => cims.map((cim: Cim) => ({ ...cim, onClickClimb })))
        .then((cims) => setCims(cims));
    },
    [onClickClimb]
  );

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

      if (filter.climbed) {
        filteredCims = filteredCims.filter(filterFns.climbed(filter.climbed));
      }

      setFilteredCims(filteredCims);
    },
    [cims, filter]
  );

  const stats = useMemo<ClimStats>(
    function calculateStats() {
      const stats = filteredCims.reduce(
        (acc, { altitude, climbed }) => {
          acc.totalAltitude += altitude;
          acc.totalCims += 1;
          acc.climbedAltitude += climbed ? altitude : 0;
          acc.climbedCims += climbed ? 1 : 0;

          return acc;
        },
        { totalAltitude: 0, totalCims: 0, climbedAltitude: 0, climbedCims: 0 }
      );

      const climbedPercentage = Math.round(
        (stats.climbedAltitude / stats.totalAltitude) * 100
      );
      const climbedCimsPercentage = Math.round(
        (stats.climbedCims / stats.totalCims) * 100
      );

      return { ...stats, climbedPercentage, climbedCimsPercentage };
    },
    [filteredCims]
  );

  return (
    <main className="flex grow" style={{ height: 'calc(100% - 5rem)' }}>
      <div className="basis-2/3">
        <Map className="h-full" map={map}>
          {filteredCims.map((cim) => (
            <Marker key={cim.id} {...cim} selected={selected === cim.id} />
          ))}
        </Map>
      </div>
      <aside className="flex basis-1/3 flex-col">
        <div className="flex p-2">
          <Input
            type="search"
            placeholder="Filter cims..."
            value={filter.name ?? ''}
            onChange={(event) =>
              setFilter({ type: FILTER_TYPE.name, payload: event.target.value })
            }
            className="max-w space-x-2"
          />
          <Button
            className="ml-2"
            variant="outline"
            size="icon"
            onClick={() => setShowFilterControls(!showFilterControls)}
          >
            <Settings2 className="h-4 w-4" />
          </Button>
        </div>
        {showFilterControls && (
          <div className="flex p-2">
            <SecgmentedControl
              value={filter.essencial ? 'essentials' : 'all'}
              onValueChange={(value) =>
                setFilter({
                  type: FILTER_TYPE.essencial,
                  payload: value === 'essentials',
                })
              }
            >
              <SegmentedControlOption value="all">All</SegmentedControlOption>
              <SegmentedControlOption value="essentials">
                Essentials
              </SegmentedControlOption>
            </SecgmentedControl>

            <SecgmentedControl
              className="ml-2"
              value={filter.climbed ? 'climbed' : 'all'}
              onValueChange={(value) =>
                setFilter({
                  type: FILTER_TYPE.climbed,
                  payload: value === 'climbed',
                })
              }
            >
              <SegmentedControlOption value="all">All</SegmentedControlOption>
              <SegmentedControlOption value="climbed">
                Acsended
              </SegmentedControlOption>
            </SecgmentedControl>
          </div>
        )}
        <div className="overflow-auto grow p-2">
          <DataTable
            columns={columns}
            data={filteredCims}
            onClickRow={({ id }) => setSelect(id)}
          />
        </div>
        <div className="p-2 text-sm text-muted-foreground text-right grid grid-cols-3 grid-rows-2 items-center">
          <Progress
            value={stats.climbedCimsPercentage}
            className="col-span-2 "
          />
          {stats.climbedCimsPercentage}% ({stats.climbedCims} /{stats.totalCims}
          )
          <Progress value={stats.climbedPercentage} className="col-span-2" />
          {stats.climbedPercentage}% ({stats.climbedAltitude}m /{' '}
          {stats.totalAltitude}m)
        </div>
      </aside>
    </main>
  );
}
