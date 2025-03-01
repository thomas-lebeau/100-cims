"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Map, Marker } from "@/components/map";

import { DataTable } from "../../components/data-table/data-table";
import { columns } from "./columns-def";

import { cn } from "@/lib/cn";
import { useSession } from "next-auth/react";
import { useAscentMutation } from "../../components/mutations/use-ascents-mutation";
import { useAscentsQuery } from "../../components/queries/use-ascents-query";
import { useCimsQuery } from "../../components/queries/use-cims-query";
import { useComarcas } from "../../components/queries/use-comarcas-query";
import ClimbStats from "./climb-stats";
import FilterBar from "./filter-bar";
import { FILTER_TYPE, useCimFilter } from "./use-cim-filter";

type mainProps = {
  className?: string;
};

const INCLUDE_COMARCA = true;

export default function Main({ className }: mainProps) {
  const { status } = useSession();
  const { data: cims } = useCimsQuery(INCLUDE_COMARCA);
  const { data: comarcas } = useComarcas();
  const { data: ascents } = useAscentsQuery({
    enabled: status === "authenticated",
  });
  const { mutate } = useAscentMutation();
  const [selected, setSelect] = useState<string | null>(null);
  const [filteredCims, filter, setFilter] = useCimFilter(cims, ascents);

  const geoJsonUrl = useMemo(
    () => (filter.comarca ? `/api/comarca/${filter.comarca.join(",")}` : undefined),
    [filter.comarca]
  );

  const onClickClimb = useCallback((cimId: string, action: "ADD" | "REMOVE") => mutate({ cimId, action }), [mutate]);

  const onClickComarca = useCallback(
    (comarcaId: string) => {
      const selectedvalues = new Set(filter.comarca);

      if (selectedvalues.has(comarcaId)) return;

      selectedvalues.add(comarcaId);

      setFilter({
        type: FILTER_TYPE.comarca,
        payload: Array.from(selectedvalues),
      });
    },
    [filter.comarca, setFilter]
  );

  useEffect(() => {
    setSelect(null);
  }, [filter.comarca]);

  return (
    <main className={cn(className, "flex")} style={{ height: "calc(100% - 3rem)" }}>
      <Map className="basis-2/3 h-full" geoJsonUrl={geoJsonUrl}>
        {filteredCims.map((cim) => (
          <Marker
            key={cim.id}
            {...cim}
            climbed={ascents.some((a) => a.cimId === cim.id)}
            selected={selected === cim.id}
            onClickClimb={onClickClimb}
            onClick={setSelect}
          />
        ))}
      </Map>
      <aside className="flex basis-1/3 flex-col">
        <FilterBar filter={filter} setFilter={setFilter} comarcas={comarcas} />
        <DataTable
          columns={columns}
          data={filteredCims}
          className="overflow-auto grow p-2"
          onClickRow={({ id }) => setSelect(id)}
          meta={{ onClickClimb, onClickComarca }}
        />
        <ClimbStats cims={filteredCims} ascents={ascents} />
      </aside>
    </main>
  );
}
