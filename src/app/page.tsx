import { auth } from "@/lib/next-auth";

import Hydrate, { getQueryClient } from "@/components/hydrate";
import { getAscents } from "@/lib/db/ascent";
import { getCims } from "@/lib/db/cims";
import { getComarcas } from "@/lib/db/comarcas";
import Main from "./components/main";

export default async function Home() {
  const session = await auth();
  const userId = session?.user.id;

  getQueryClient().setQueryData(["cims", true], await getCims(true));
  getQueryClient().setQueryData(["comarcas"], await getComarcas());

  if (userId) {
    getQueryClient().setQueryData(["ascents"], await getAscents(userId));
  }

  return (
    <Hydrate>
      <Main className="grow" />
    </Hydrate>
  );
}
