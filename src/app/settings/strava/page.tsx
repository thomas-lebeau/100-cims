import { Separator } from "@/components/ui/separator";
import { getsStravaAccounts } from "@/lib/db";
import getServerSession from "@/lib/get-server-session";
import StravaImporter from "./strava-importer";
import LinkStrava from "./link-strava";
import Hydrate, { getQueryClient } from "@/components/hydrate";
import { getCims } from "@/lib/db/cims";
import { getAscents } from "@/lib/db/ascent";
import { getActivities } from "@/lib/db/activities";

export default async function SettingStravaPage() {
  const session = await getServerSession();

  if (!session) return null; // TODO guard
  const userId = session.user.id;

  getQueryClient().setQueryData(["cims"], await getCims());
  getQueryClient().setQueryData(["ascents"], await getAscents(userId));
  getQueryClient().setQueryData(
    ["activities", "STRAVA"],
    await getActivities(userId, "STRAVA")
  );

  const stravaAccount = await getsStravaAccounts(userId);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Strava</h3>
        <p className="text-sm text-muted-foreground">
          Connect your Strava account to import your activities.
        </p>
      </div>

      <Separator />

      <Hydrate>{stravaAccount ? <StravaImporter /> : <LinkStrava />}</Hydrate>
    </div>
  );
}
