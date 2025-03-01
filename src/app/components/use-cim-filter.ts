import { useEffect, useReducer, useState, type Dispatch } from "react";

import type { Ascent } from "@/lib/db/ascent";
import type { CimWithComarca as Cim } from "@/lib/db/cims";
import type { ValueOf } from "@/types/values-of";

export const FILTER_TYPE = {
  name: "name",
  essencial: "essencial",
  comarca: "comarca",
  climbed: "climbed",
} as const;

type FilterType = ValueOf<typeof FILTER_TYPE>;

export type FilterState = {
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
  [K in T]: (
    filterValue: FilterValue<K>, // eslint-disable-line no-unused-vars
    ascents: Ascent[] // eslint-disable-line no-unused-vars
  ) => (cim: Cim) => boolean; // eslint-disable-line no-unused-vars
};

export type TSetFilter = Dispatch<Action<FilterType>>;

const filterFns: FilterFn<FilterType> = {
  name: (name) => (cim) => cim.name.toLowerCase().includes(name),
  essencial: (essencial) => (cim) => cim.essencial === essencial,
  comarca: (comarca) => (cim) => cim.comarcas.some((c) => comarca.includes(c.codigo)),
  climbed: (climbed, ascents) => (cim) =>
    climbed ? ascents.some(({ cimId }) => cimId === cim.id) : ascents.every(({ cimId }) => cimId !== cim.id),
} as const;

function reducer(state: FilterState, action: Action<FilterType>): FilterState {
  return {
    ...state,
    [action.type]: action.payload,
  };
}

export function useCimFilter(cims: Cim[], ascents: Ascent[]): [Cim[], FilterState, TSetFilter] {
  const [filteredCims, setFilteredCims] = useState<Cim[]>(cims);
  const [filter, setFilter] = useReducer(reducer, {});

  useEffect(
    function applyFilters() {
      let filteredCims = cims;

      if (filter.essencial) {
        filteredCims = filteredCims.filter(filterFns.essencial(filter.essencial, ascents));
      }

      if (filter.comarca) {
        filteredCims = filteredCims.filter(filterFns.comarca(filter.comarca, ascents));
      }

      if (filter.name) {
        filteredCims = filteredCims.filter(filterFns.name(filter.name, ascents));
      }

      if (filter.climbed) {
        filteredCims = filteredCims.filter(filterFns.climbed(filter.climbed, ascents));
      }

      setFilteredCims(filteredCims);
    },

    [cims, filter, ascents]
  );

  return [filteredCims, filter, setFilter];
}
