"use client";

import dynamic from "next/dynamic";

export { Map } from "./map";
export { useMap } from "./use-map";

export const Marker = dynamic(() => import("./marker").then((module) => module.Marker), {
  ssr: false,
});
