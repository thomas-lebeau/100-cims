"use client";

import { datadogRum } from "@datadog/browser-rum";

datadogRum.init({
  applicationId: "e4e89ba2-a49d-4a8d-8383-37184c7719c0",
  clientToken: "pubebb08bd69e5c015e8cf67803c10a62bd",
  site: "datadoghq.eu",
  service: "100-cims",
  env: process.env.NODE_ENV,
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

export default function DatadogInit() {
  // Render nothing - this component is only included so that the init code
  // above will run client-side
  return null;
}
