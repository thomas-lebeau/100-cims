import { Prisma, PrismaClient } from "@prisma/client";
import tracer from "dd-trace";

declare global {
  var prisma: PrismaClient | undefined; // eslint-disable-line no-unused-vars
}

export const prisma = global.prisma || new PrismaClient();

prisma.$use(async (params, next) => {
  const tags = {
    "span.kind": "client",
    "span.type": "sql",
    "prisma.model": params.model,
    "prisma.action": params.action,
  };

  return tracer.trace("prisma.query", { tags }, () => next(params));
});

prisma.$on("query" as never, (e: Prisma.QueryEvent) => {
  // add query to prisma span
  const span = tracer.scope().active();
  span?.setTag("resource.name", e.query);
});

if (process.env.NODE_ENV === "development") {
  global.prisma = prisma;
}
