"use client";

import { datadogRum } from "@datadog/browser-rum";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

if (process.env.NEXT_PUBLIC_VERCEL_ENV !== "development") {
  init();
}

function init() {
  datadogRum.init({
    applicationId: process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID,
    clientToken: process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN,
    site: "datadoghq.eu",
    service: "100-cims",
    env: process.env.NEXT_PUBLIC_VERCEL_ENV,
    version: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
    sessionSampleRate: 100,
    sessionReplaySampleRate: 20,
    compressIntakeRequests: true,
    defaultPrivacyLevel: "mask-user-input",

    allowedTracingUrls: [
      getMatchOptions(process.env.NEXT_PUBLIC_VERCEL_URL),
      getMatchOptions(process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL),
      getMatchOptions(process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL),
    ],
  });

  datadogRum.setGlobalContextProperty(
    "prNumber",
    process.env.NEXT_PUBLIC_VERCEL_GIT_PULL_REQUEST_ID
  );
}

function getMatchOptions(url: string) {
  return {
    match: "https://" + url + "/api/",
    propagatorTypes: ["tracecontext" as const],
  };
}

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

  return null;
}
