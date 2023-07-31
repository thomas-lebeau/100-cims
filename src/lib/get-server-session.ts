import { authOptions } from "./next-auth";
import { getServerSession } from "next-auth/next";

export default function _getServerSession() {
  return getServerSession(authOptions);
}
