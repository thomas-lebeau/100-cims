import React from "react";

import getServerSession from "@/lib/get-server-session";

import Main from "./components/main";
import { getCims, getUniqueComarcas } from "@/lib/db";

export default async function Home() {
  const session = await getServerSession();
  const initialCims = await getCims(session?.user?.id);
  const comarcas = await getUniqueComarcas();

  return (
    <Main className="grow" initialCims={initialCims} comarcas={comarcas} />
  );
}
