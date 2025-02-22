import Hydrate, { seedQueryCache } from "@/components/hydrate";
import { Separator } from "@/components/ui/separator";
import { getAccount } from "@/lib/db/accounts";
import { getActivities } from "@/lib/db/activities";
import { getAscents } from "@/lib/db/ascent";
import { getCims } from "@/lib/db/cims";
import { getLastSync } from "@/lib/db/sync";
import { auth } from "@/lib/next-auth";
import LinkStrava from "./link-strava";
import StravaImporter from "./strava-importer";

export default async function SettingStravaPage() {
  const session = await auth();

  if (!session) return null; // TODO guard
  const userId = session.user.id;

  await seedQueryCache(["cims", false], await getCims());
  await seedQueryCache(["last-sync"], await getLastSync(userId));
  await seedQueryCache(["ascents"], await getAscents(userId));
  await seedQueryCache(["activities"], await getActivities(userId));

  const isLinkedToStrava = (await getAccount(userId, "strava")).length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Strava</h3>
        <p className="text-sm text-muted-foreground">
          Connect your Strava account to import your activities.
        </p>
      </div>

      <Separator />

      <Hydrate>
        {isLinkedToStrava ? <StravaImporter /> : <LinkStrava />}
      </Hydrate>
    </div>
  );
}
