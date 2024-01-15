import getServerSession from "@/lib/get-server-session";

import Hydrate, { getQueryClient } from "@/components/hydrate";
import { getAscents } from "@/lib/db/ascent";
import { getCims } from "@/lib/db/cims";
import { getComarcas } from "@/lib/db/comarcas";
import Main from "./components/main";

export default async function Home() {
  const session = await getServerSession();
  const userId = session?.user.id;

  getQueryClient().setQueryData(["cims", true], await getCims(true));

  if (userId) {
    getQueryClient().setQueryData(["ascents"], await getAscents(userId));
  }

  const comarcas = await getComarcas();

  return (
    <Hydrate>
      <Main className="grow" comarcas={comarcas} />
    </Hydrate>
  );
}
