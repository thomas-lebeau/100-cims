import type { User, TokenSet } from "next-auth";

type UserId = string;

declare module "next-auth" {
  interface Session {
    user: User & {
      id: UserId;
    };
    error: string;
  }
}

export type Token = TokenSet & {
  expires_in: number;
};
