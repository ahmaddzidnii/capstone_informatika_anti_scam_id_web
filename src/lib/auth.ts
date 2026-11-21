import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createAuthMiddleware } from "better-auth/api";
import { admin } from "better-auth/plugins";
import { env } from "@/env";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: false,
  },
  baseURL: env.BETTER_AUTH_URL,
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  plugins: [admin()],
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      const requestId = ctx.headers?.get("x-request-id") ?? crypto.randomUUID();

      const requestLogger = logger.child({
        requestId,
        source: "better-auth",
      });

      requestLogger.debug({ path: ctx.path }, "Authentication request started");
    }),
  },
  logger: {
    disabled: false,
    level: env.LOG_LEVEL,
    log: (level, message, ...args) => {
      const log = {
        debug: logger.debug.bind(logger),
        info: logger.info.bind(logger),
        warn: logger.warn.bind(logger),
        error: logger.error.bind(logger),
      }[level];

      log({ source: "better-auth", args }, message);
    },
  },
  advanced: {
    database: {
      generateId: false,
    },
  },
});
