import { Separator } from "@/components/ui/separator";
import { getCims, getsStravaAccounts } from "@/lib/db";
import getServerSession from "@/lib/get-server-session";
import StravaImporter from "./strava-importer";
import LinkStrava from "./link-strava";

export default async function SettingStravaPage() {
  const session = await getServerSession();

  if (!session) return null;

  const cims = await getCims(session.user.id);
  const stravaAccount = await getsStravaAccounts(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Strava</h3>
        <p className="text-sm text-muted-foreground">
          Connect your Strava account to import your activities.
        </p>
      </div>

      <Separator />

      {stravaAccount ? <StravaImporter initialCims={cims} /> : <LinkStrava />}
    </div>
  );
}
