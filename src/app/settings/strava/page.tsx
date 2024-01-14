import Hydrate from "@/components/hydrate";
import { Separator } from "@/components/ui/separator";
import { getsStravaAccounts } from "@/lib/db";
import getServerSession from "@/lib/get-server-session";
import LinkStrava from "./link-strava";
import StravaImporter from "./strava-importer";

export default async function SettingStravaPage() {
  const session = await getServerSession();

  if (!session) return null; // TODO guard
  const userId = session.user.id;

  // getQueryClient().setQueryData(["cims"], await getCims());
  // getQueryClient().setQueryData(["last-sync"], await getLastSync(userId));
  // getQueryClient().setQueryData(["ascents"], await getAscents(userId));
  // getQueryClient().setQueryData(["activities"], await getActivities(userId));

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
