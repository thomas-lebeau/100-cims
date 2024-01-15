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
      EMAIL_SERVER_HOST: string;
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

      CRON_SECRET: string;
    }
  }
}

export {};
