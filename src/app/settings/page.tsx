import { Separator } from "@/components/ui/separator";
import { getProviders } from "next-auth/react";

export default async function SettingAcccountPage() {
  const providers = await getProviders();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">
          This is how others will see you on the site.
        </p>
      </div>
      <Separator />
      <pre>
        <code>{JSON.stringify(providers, null, 2)}</code>
      </pre>
    </div>
  );
}
