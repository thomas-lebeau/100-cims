/* eslint-disable no-unused-vars */

// This file is a module augmentation.
// Files containing module augmentation must be modules (as opposed to scripts).
// The difference between modules and scripts is that modules have at least one import/export statement.
//
// In order to make TypeScript treat the file as a module, we add one export statement to it.

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_MAPBOX_TOKEN: string;

      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;

      EMAIL_SERVER_HOST: string;
      EMAIL_SERVER_PORT: string;
      EMAIL_SERVER_USER: string;
      EMAIL_SERVER_PASSWORD: string;

      STRAVA_CLIENT_ID: string;
      STRAVA_CLIENT_SECRET: string;
    }
  }
}

export {};
