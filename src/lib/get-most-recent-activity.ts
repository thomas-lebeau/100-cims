import type { ActivityInput } from "./db/activities";

export function getMostRecentActivity(activities: ActivityInput[]) {
  return activities.reduce((acc, curr) => {
    if (!acc) return curr;
    if (new Date(curr.startDate) > new Date(acc.startDate)) return curr;

    return acc;
  }, activities[0]);
}
