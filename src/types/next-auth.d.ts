/* eslint-disable no-unused-vars */

import { User } from "next-auth";

type UserId = string;

declare module "next-auth" {
  interface Session {
    user: User & {
      id: UserId;
    };
  }
}
