"use client";

import { useMemo } from "react";
import { Map, Marker } from "@/components/map";
import { cn } from "@/lib/cn";
import { useSession } from "next-auth/react";
import { useAscentsQuery } from "../../components/queries/use-ascents-query";
import { useCimsQuery } from "../../components/queries/use-cims-query";
import { useCimFilter } from "./use-cim-filter";
import { usePathname } from "next/navigation";

type mainProps = {
  className?: string;
};

const INCLUDE_COMARCA = true;

function useCode() {
  const setCode = (code: string) => window.history.pushState(null, "", "/" + code);
  const pathname = usePathname();

  return [pathname.replace("/", ""), setCode] as const;
}

export default function Main({ className }: mainProps) {
  const [code, setCode] = useCode();
  const { status } = useSession();
  const { data: cims } = useCimsQuery(INCLUDE_COMARCA);
  const { data: ascents } = useAscentsQuery({
    enabled: status === "authenticated",
  });
  const [filteredCims, filter] = useCimFilter(cims, ascents);

  const geoJsonUrl = useMemo(
    () => (filter.comarca ? `/api/comarca/${filter.comarca.join(",")}` : undefined),
    [filter.comarca]
  );

  return (
    <main className={cn(className, "flex")} style={{ height: "calc(100% - 3rem)" }}>
      <Map className="w-full h-full" geoJsonUrl={geoJsonUrl}>
        {filteredCims.map((cim) => (
          <Marker
            key={cim.id}
            {...cim}
            climbed={ascents.some((a) => a.cimId === cim.id)}
            selected={code === cim.code}
            onClick={() => setCode(cim.code)}
          />
        ))}
      </Map>
    </main>
  );
}
