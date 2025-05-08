"use client";

import { useMemo, useState } from "react";
import { Map, Marker } from "@/components/map";
import { cn } from "@/lib/cn";
import { useSession } from "next-auth/react";
import { useAscentsQuery } from "../../components/queries/use-ascents-query";
import { useCimsQuery } from "../../components/queries/use-cims-query";
import { useCimFilter } from "./use-cim-filter";
import { usePathname } from "next/navigation";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

const INCLUDE_COMARCA = true;
const SNAP_POINTS = ["125px", 0.5, 0.9];

function useCode() {
  const setCode = (code: string | null) => window.history.pushState(null, "", `/${code ?? ""}`);
  const pathname = usePathname();

  return [pathname.replace("/", ""), setCode] as const;
}

type mainProps = {
  className?: string;
};

export default function Main({ className }: mainProps) {
  const [snap, setSnap] = useState<number | string | null>(SNAP_POINTS[0]);

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

  const cim = useMemo(() => cims?.find((c) => c.code === code), [cims, code]);

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
      <Drawer
        open={!!cim}
        modal={false}
        dismissible={false}
        onOpenChange={() => setCode(null)}
        snapPoints={SNAP_POINTS}
        activeSnapPoint={snap}
        setActiveSnapPoint={setSnap}
      >
        <DrawerContent className="z-20 mb-12 pb-6 pr-4 pl-4">
          <DrawerHeader className="flex flex-col items-center">
            <DrawerTitle>{cim?.name}</DrawerTitle>
            {/* <DrawerDescription>{cim?.altitude}m</DrawerDescription> */}
          </DrawerHeader>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad recusandae iste nisi nulla! Reprehenderit
            tempora, tempore commodi eos rerum nemo voluptatum corporis optio ea, magni ducimus, eum officia tenetur
            consequuntur.
          </p>
        </DrawerContent>
      </Drawer>
    </main>
  );
}
