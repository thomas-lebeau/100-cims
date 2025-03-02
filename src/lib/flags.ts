import { flag } from "flags/next";

export const reactQueryToolbar = flag({
  key: "react-query-toolbar",
  description: "Enable React Query Devtools",
  decide() {
    return false;
  },
});

export const datadogRum = flag({
  key: "datadog-rum",
  description: "Enable Datadog RUM",
  decide() {
    return ["production", "preview"].includes(process.env.NEXT_PUBLIC_VERCEL_ENV);
  },
});

export const vercelToolbar = flag({
  key: "vercel-toolbar",
  description: "Enable Vercel Toolbar",
  decide() {
    return process.env.NEXT_PUBLIC_VERCEL_ENV === "development";
  },
});

export const vercelAnalytics = flag({
  key: "vercel-Analytics",
  description: "Enable Vercel Analytics and Speed Insights",
  decide() {
    return process.env.NEXT_PUBLIC_VERCEL_ENV !== "development";
  },
});

export async function getFeatureFlags() {
  return {
    datadogRum: await datadogRum(),
    vercelToolbar: await vercelToolbar(),
    vercelAnalytics: await vercelAnalytics(),
    reactQueryToolbar: await reactQueryToolbar(),
  };
}
