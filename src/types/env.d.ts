/* eslint-disable no-unused-vars */

// This file is a module augmentation.
// Files containing module augmentation must be modules (as opposed to scripts).
// The difference between modules and scripts is that modules have at least one import/export statement.
//
// In order to make TypeScript treat the file as a module, we add one export statement to it.

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EMAIL_FROM: string;
      EMAIL_SERVER_USER: string;
      EMAIL_SERVER_PASSWORD: string;
      EMAIL_SERVER_HOST: string | undefined; // email provider disabled on prod.
      EMAIL_SERVER_PORT: string;

      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;

      NEXTAUTH_SECRET: string;
      NEXTAUTH_URL: string;

      NEXT_PUBLIC_MAPBOX_TOKEN: string;

      DATABASE_URL: string;
      DATABASE_SHADOW_URL: string;

      STRAVA_CLIENT_ID: string;
      STRAVA_CLIENT_SECRET: string;
      STRAVA_VERIFY_TOKEN: string;
      STRAVA_SUBSCRIPTION_ID: string;

      CRON_SECRET: string;

      CI: string | undefined;
      GITHUB_ACTIONS: string | undefined;

      PLAYWRIGHT_TEST_BASE_URL: string;

      NEXT_PUBLIC_DATADOG_APPLICATION_ID: string;
      NEXT_PUBLIC_DATADOG_CLIENT_TOKEN: string;
      DATADOG_API_KEY: string;

      NEXT_PUBLIC_VERCEL_ENV: string;
      NEXT_PUBLIC_VERCEL_URL: string;
      NEXT_PUBLIC_VERCEL_BRANCH_URL: string;
      NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL: string;

      VERCEL_AUTOMATION_BYPASS_SECRET: string;

      // make typescript error when using env vars that are not defined in here
      [key: string]: undefined;
    }
  }
}

export {};
