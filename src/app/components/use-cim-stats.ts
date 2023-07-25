import { Cim } from '@/types/cim';
import { useMemo } from 'react';

type ClimStats = {
  totalAltitude: number;
  totalCims: number;
  climbedAltitude: number;
  climbedCims: number;
  climbedPercentage: number;
  climbedCimsPercentage: number;
};

export function useCimStats(filteredCims: Cim[]): ClimStats {
  return useMemo<ClimStats>(
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
}
