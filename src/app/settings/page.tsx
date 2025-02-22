import { Separator } from "@/components/ui/separator";
import AscentList from "./ascent-list";
import AscentStats from "./ascent-stats";
import { getAscents } from "@/lib/db/ascent";
import { getLastSync } from "@/lib/db/sync";
import { getCims } from "@/lib/db/cims";
import { auth } from "@/lib/next-auth";
import { getActivities } from "@/lib/db/activities";
import Hydrate, { seedQueryCache } from "@/components/hydrate";

export default async function SettingAcccountPage() {
  const session = await auth();

  if (!session) return null; // TODO guard
  const userId = session.user.id;

  await seedQueryCache(["cims", false], await getCims());
  await seedQueryCache(["last-sync"], await getLastSync(userId));
  await seedQueryCache(["ascents"], await getAscents(userId));
  await seedQueryCache(["activities"], await getActivities(userId));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">
          This is how others will see you on the site.
        </p>
      </div>

      <Separator />

      <AscentStats />

      <Hydrate>
        <AscentList />
      </Hydrate>
    </div>
  );
}
