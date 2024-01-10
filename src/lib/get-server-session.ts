import { authOptions } from "./next-auth";
import { getServerSession as nextAuthGetServerSession } from "next-auth/next";

export default function getServerSession() {
  return nextAuthGetServerSession(authOptions);
}
