import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAscents } from "@/lib/db/ascent";
import { getCims } from "@/lib/db/cims";
import { auth } from "@/lib/next-auth";

export default async function AscentStats() {
  const session = await auth();
  if (!session) return null; // TODO guard

  const ascents = await getAscents(session.user.id);
  const cims = await getCims();

  if (!ascents || !cims) return null;

  const totalAscents = ascents.length;
  const uniquePeaks = new Set(ascents.map((ascent) => ascent.cimId)).size;

  const totalAltitude = ascents.reduce((acc, ascent) => {
    const cim = cims.find((cim) => cim.id === ascent.cimId);
    return acc + (cim?.altitude || 0);
  }, 0);

  const essentialPeaks = ascents.filter((ascent) => {
    const cim = cims.find((cim) => cim.id === ascent.cimId);
    return cim?.essencial;
  }).length;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Your Statistics</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal">Total Ascents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAscents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal">Unique Peaks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniquePeaks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal">Essential Peaks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{essentialPeaks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal">Total Altitude</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAltitude.toLocaleString()}m</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
