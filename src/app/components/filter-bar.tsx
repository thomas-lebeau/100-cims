import { useMemo } from 'react';

import {
  SecgmentedControl,
  SegmentedControlOption,
} from '@/components/ui/segmented-control';
import { XIcon } from 'lucide-react';

import { FILTER_TYPE, FilterState, TSetFilter } from './use-cim-filter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FacetPicker } from '@/components/facet-picker';
import { Comarca } from '@/types/cim';

export default function FilterBar({
  filter,
  setFilter,
  comarcas,
}: {
  filter: FilterState;
  setFilter: TSetFilter;
  comarcas: Array<Comarca>;
}) {
  const options = useMemo(() => {
    return comarcas.map(({ name, codigo }) => ({ label: name, value: codigo }));
  }, [comarcas]);

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
      </div>
      <div className="flex p-2 gap-2">
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
        <FacetPicker
          title="Comarca"
          options={options}
          selectedvalues={filter.comarca}
          setValues={(values) =>
            setFilter({
              type: FILTER_TYPE.comarca,
              payload: values,
            })
          }
        />
        {filter.comarca && (
          <Button
            className="h-8 text-muted-foreground font-normal text-xs px-3"
            variant="ghost"
            onClick={() =>
              setFilter({ type: FILTER_TYPE.comarca, payload: undefined })
            }
          >
            Reset
            <XIcon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </>
  );
}
