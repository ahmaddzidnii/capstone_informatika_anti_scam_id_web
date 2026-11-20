import { createTRPCRouter, createCallerFactory } from '../init';
import { checkRouter } from '@/server/api/routers/check';
import { documentRouter } from '@/server/api/routers/document';
import { reportRouter } from '@/server/api/routers/report';
import { adminRouter } from '@/server/api/routers/admin';
import { botRouter } from '@/server/api/routers/bot';

export const appRouter = createTRPCRouter({
    check: checkRouter,
    document: documentRouter,
    report: reportRouter,
    admin: adminRouter,
    bot: botRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);