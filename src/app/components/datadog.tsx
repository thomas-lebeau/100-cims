"use client";

import { datadogRum } from "@datadog/browser-rum";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

datadogRum.init({
  applicationId: process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID,
  clientToken: process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN,
  site: "datadoghq.eu",
  service: "100-cims",
  env: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV,
  version: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
  sessionSampleRate: 100,
  sessionReplaySampleRate: 20,
  trackUserInteractions: true,
  trackResources: true,
  trackLongTasks: true,
  defaultPrivacyLevel: "mask-user-input",

  // Specify URLs to propagate trace headers for connection between RUM and backend trace
  allowedTracingUrls: [
    {
      match: "https://100-cims.vercel.app/api/",
      propagatorTypes: ["tracecontext"],
    },
  ],
});

datadogRum.setGlobalContext({
  prNumber: process.env.NEXT_PUBLIC_VERCEL_GIT_PULL_REQUEST_ID,
  vercelUrl: process.env.NEXT_PUBLIC_VERCEL_URL,
});

export default function DatadogRum() {
  const session = useSession();

  useEffect(() => {
    if (session.status === "authenticated") {
      const { id, name, email } = session.data.user;

      datadogRum.setUser({
        id,
        ...(name ? { name } : {}),
        ...(email ? { email } : {}),
      });
    }

    () => datadogRum.clearUser();
  }, [session]);

  // Render nothing - this component is only included so that the init code
  // above will run client-side
  return null;
}
