'use client';

import React, { useCallback, useEffect } from 'react';
import { Settings2 } from 'lucide-react';

import { Map, Marker } from '@/components/ui/map';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { columns } from './cims/columns';
import { DataTable } from './cims/data-table';

import { cimsSchema, type Cim } from '@/types/cim';
import {
  SecgmentedControl,
  SegmentedControlOption,
} from '@/components/ui/segmented-control';
import { Progress } from '@/components/ui/progress';
import { FILTER_TYPE, useCimFilter } from './use-cim-filter';
import { useCimStats } from './use-cim-stats';
import { cn } from '@/lib/utils';

export default function Main({ className }: { className?: string }) {
  const [cims, setCims] = React.useState<Cim[]>([]);
  const [showFilterControls, setShowFilterControls] =
    React.useState<boolean>(false);
  const [selected, setSelect] = React.useState<string | null>(null);
  const [filteredCims, filter, setFilter] = useCimFilter(cims);
  const stats = useCimStats(filteredCims);

  const onClickClimb = useCallback((id: string, climbed: boolean) => {
    fetch(`/api/cims/${id}`, {
      method: climbed ? 'DELETE' : 'PUT',
    })
      .then((res) => res.json())
      .then((cim) => cimsSchema.parse(cim))
      .then((cims) => cims.map((cim: Cim) => ({ ...cim, onClickClimb })))
      .then((cims) => setCims(cims));
  }, []);

  useEffect(
    function fetchCims() {
      fetch('/api/cims')
        .then((res) => res.json())
        .then((cim) => cimsSchema.parse(cim))
        .then((cims) => cims.map((cim: Cim) => ({ ...cim, onClickClimb })))
        .then((cims) => setCims(cims));
    },
    [onClickClimb]
  );

  return (
    <main
      className={cn(className, 'flex')}
      style={{ height: 'calc(100% - 5rem)' }}
    >
      <div className="basis-2/3">
        <Map className="h-full">
          {filteredCims.map((cim) => (
            <Marker
              key={cim.id}
              {...cim}
              selected={selected === cim.id}
              onClickClimb={onClickClimb}
            />
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
