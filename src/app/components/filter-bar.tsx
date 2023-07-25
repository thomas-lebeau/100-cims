import { Input } from '@/components/ui/input';
import { FILTER_TYPE, FilterState, TSetFilter } from './use-cim-filter';
import { Button } from '@/components/ui/button';
import React from 'react';
import {
  SecgmentedControl,
  SegmentedControlOption,
} from '@/components/ui/segmented-control';
import { Settings2 } from 'lucide-react';

export default function FilterBar({
  filter,
  setFilter,
}: {
  filter: FilterState;
  setFilter: TSetFilter;
}) {
  const [showFilterControls, setShowFilterControls] =
    React.useState<boolean>(false);

  return (
    <>
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
    </>
  );
}
