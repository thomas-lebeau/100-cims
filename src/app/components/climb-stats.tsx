import { Progress } from "@/components/ui/progress";

import { useClimbStats } from "./use-climb-stats";
import { Cim } from "@/types/cim";

export default function ClimbStats({ cims }: { cims: Cim[] }) {
  const stats = useClimbStats(cims);

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
