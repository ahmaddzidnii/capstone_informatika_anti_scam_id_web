
import superjson from 'superjson';
import { initTRPC, TRPCError } from '@trpc/server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { env } from '@/env';

export const createTRPCContext = async (opts: {
    headers: Headers;
    isInternalBot?: boolean;
}) => {
    const requestId =
        opts.headers.get('x-request-id') || crypto.randomUUID();

    const session = await auth.api.getSession({
        headers: opts.headers,
    });

    const requestLogger = logger.child({
        requestId,
        user: {
            id: session?.user?.id ?? null,
            type: session?.user.id ? 'AUTHENTICATED' : 'GUEST',
        },
    });

    requestLogger.debug('tRPC context initialized');

    return {
        prisma,
        logger: requestLogger,
        session,
        headers: opts.headers,
        isInternalBot: opts.isInternalBot ?? false,
    };
};

const t = initTRPC
    .context<Awaited<ReturnType<typeof createTRPCContext>>>()
    .create({
        transformer: superjson,
    });

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

export const baseProcedure = t.procedure.use(
    async ({ ctx, path, type, next }) => {
        const startedAt = performance.now();

        ctx.logger.debug(
            { path, type },
            'tRPC procedure started',
        );

        try {
            const result = await next();

            const durationMs = Math.round(
                performance.now() - startedAt,
            );

            if (result.ok) {
                ctx.logger.debug(
                    { path, type, durationMs },
                    'tRPC procedure completed',
                );
            } else {
                ctx.logger.warn(
                    {
                        path,
                        type,
                        durationMs,
                        error: result.error,
                    },
                    'tRPC procedure failed',
                );
            }

            return result;
        } catch (error) {
            ctx.logger.error(
                {
                    path,
                    type,
                    durationMs: Math.round(
                        performance.now() - startedAt,
                    ),
                    err: error,
                },
                'Unexpected error in tRPC middleware',
            );

            throw error;
        }
    },
);

export const protectedProcedure = baseProcedure.use(
    async ({ ctx, next }) => {

        if (!ctx.session) {
            ctx.logger.warn(
                'Unauthorized access attempt detected. No valid session found.',
            );

            throw new TRPCError({
                code: 'UNAUTHORIZED',
                message: 'You must be logged in to access this resource.',
            });
        }


        return next({
            ctx: {
                ...ctx,
                session: ctx.session,
            }
        });
    },
);

export const adminProcedure = protectedProcedure.use(
    async ({ ctx, next }) => {
        if (ctx.session.user.role !== 'admin') {
            ctx.logger.warn(
                'Unauthorized access attempt detected. User does not have admin privileges.',
            );

            throw new TRPCError({
                code: 'FORBIDDEN',
                message: 'You are not authorized to access this resource.',
            });
        }

        ctx.logger.debug('Admin authorization validated');

        return next({ ctx });
    },
);

export const botProcedure = baseProcedure.use(
    async ({ ctx, next }) => {
        const apiKey = ctx.headers.get('x-internal-api-key');
        const isAuthorized =
            ctx.isInternalBot ||
            (Boolean(apiKey) && apiKey === env.BETTER_AUTH_SECRET);

        if (!isAuthorized) {
            ctx.logger.warn(
                'Unauthorized bot service request detected.',
            );

            throw new TRPCError({
                code: 'UNAUTHORIZED',
                message: 'Invalid bot service credentials.',
            });
        }

        return next({ ctx });
    },
);
