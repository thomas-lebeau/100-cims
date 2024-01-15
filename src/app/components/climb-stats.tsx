import { Progress } from "@/components/ui/progress";

import { Ascent } from "@/lib/db/ascent";
import { CimWithComarca } from "@/lib/db/cims";
import { useClimbStats } from "./use-climb-stats";

type ClimbStatsProps = {
  cims: CimWithComarca[];
  ascents: Ascent[];
};

export default function ClimbStats({ cims, ascents }: ClimbStatsProps) {
  const stats = useClimbStats(cims, ascents);

  return (
    <div className="p-2 text-sm text-muted-foreground text-right grid grid-cols-3 grid-rows-2 items-center">
      <Progress value={stats.climbedCimsPercentage} className="col-span-2 " />
      {stats.climbedCimsPercentage}% ({stats.climbedCims} /{stats.totalCims}
      )
      <Progress value={stats.climbedPercentage} className="col-span-2" />
      {stats.climbedPercentage}% ({stats.climbedAltitude}m /{" "}
      {stats.totalAltitude}m)
    </div>
  );
}
