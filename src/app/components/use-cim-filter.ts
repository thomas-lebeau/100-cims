import React, { useEffect, useReducer } from 'react';

import type { ValueOf } from '@/types/values-of';
import { Cim } from '@/types/cim';

export const FILTER_TYPE = {
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

export function useCimFilter(
  cims: Cim[]
): [Cim[], FilterState, React.Dispatch<Action<FilterType>>] {
  const [filteredCims, setFilteredCims] = React.useState<Cim[]>(cims);
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

      if (filter.climbed) {
        filteredCims = filteredCims.filter(filterFns.climbed(filter.climbed));
      }

      setFilteredCims(filteredCims);
    },
    [cims, filter]
  );

  return [filteredCims, filter, setFilter];
}
