"use client";

import { DataTable } from "@/components/data-table/data-table";
import { columns } from "./columns";
import { useActivitiesQuery } from "@/components/queries/use-activities-query";
import { useAscentsQuery } from "@/components/queries/use-ascents-query";
import { useCimsQuery } from "@/components/queries/use-cims-query";

export default function AscentList() {
  const { data: cims } = useCimsQuery(true);
  const { data: ascents } = useAscentsQuery();
  const { data: activities } = useActivitiesQuery();

  if (!ascents || !cims || !activities) return null;

  const data = ascents
    .map((ascent) => {
      const cim = cims.find((cim) => cim.id === ascent.cimId);
      const activity = activities.find((a) => a.id === ascent.activityId);

      if (!cim || !activity) return null;

      return {
        id: ascent.id,
        cimName: cim.name,
        cimAltitude: cim.altitude,
        activityName: activity.name,
        activityId: activity.originId,
        date: new Date(activity.startDate),
        isEssencial: cim.essencial,
        comarcas: cim.comarcas,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <>
      <h3 className="mt-8 mb-4 text-lg font-medium">Your ascents</h3>
      <div className="border rounded-md">
        <DataTable
          columns={columns}
          data={data}
          meta={{ onClickClimb: () => {}, onClickComarca: () => {} }}
        />
      </div>
    </>
  );
}
