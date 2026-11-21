import { adminRouter } from "@/server/api/routers/admin";
import { botRouter } from "@/server/api/routers/bot";
import { checkRouter } from "@/server/api/routers/check";
import { documentRouter } from "@/server/api/routers/document";
import { reportRouter } from "@/server/api/routers/report";
import { createCallerFactory, createTRPCRouter } from "../init";

export const appRouter = createTRPCRouter({
  check: checkRouter,
  document: documentRouter,
  report: reportRouter,
  admin: adminRouter,
  bot: botRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
