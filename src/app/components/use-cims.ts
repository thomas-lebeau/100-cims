import { Cim } from '@/types/cim';
import React, { useReducer } from 'react';

type Action = {
  value: boolean;
  cimId: string;
};

function reducer(cims: Cim[], { value, cimId }: Action) {
  const index = cims.findIndex(({ id }) => id === cimId);
  const cim = { ...cims[index], climbed: value };

  return [...cims.slice(0, index), cim, ...cims.slice(index + 1)];
}

export function useCims(initialCims: Cim[]): [Cim[], React.Dispatch<Action>] {
  const [cims, setClimbed] = useReducer(reducer, initialCims);

  return [cims, setClimbed];
}
