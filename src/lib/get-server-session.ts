import tracer from "dd-trace";
import { authOptions } from "./next-auth";
import { getServerSession as nextAuthGetServerSession } from "next-auth/next";

export default function getServerSession() {
  return tracer.wrap("getServerSession", nextAuthGetServerSession(authOptions));
}
