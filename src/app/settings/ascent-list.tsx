import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExternalLink, Sparkles } from "lucide-react";
import { getAscents } from "@/lib/db/ascent";
import { getCims } from "@/lib/db/cims";
import { getActivities } from "@/lib/db/activities";
import getServerSession from "@/lib/get-server-session";

export default async function AscentList() {
  const session = await getServerSession();
  if (!session) return null; // TODO guard

  const ascents = await getAscents(session.user.id);
  const cims = await getCims();
  const activities = await getActivities(session.user.id);

  if (!ascents || !cims || !activities) return null;
  return (
    <>
      <h3 className="mt-8 mb-4 text-lg font-medium">Your ascents</h3>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Peak</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead>Altitude</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ascents?.map((ascent) => {
              const cim = cims.find((cim) => cim.id === ascent.cimId);
              const activity = activities?.find(
                (a) => a.id === ascent.activityId
              );

              if (!cim || !activity) return null;

              return (
                <TableRow key={ascent.id}>
                  <TableCell>
                    {!cim.essencial && (
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                    )}
                    {""}
                    {cim.name}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`https://www.strava.com/activities/${activity.originId}`}
                      target="_blank"
                    >
                      {activity.name}{" "}
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  </TableCell>
                  <TableCell>{cim.altitude}m</TableCell>
                  <TableCell>
                    {new Date(ascent.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
