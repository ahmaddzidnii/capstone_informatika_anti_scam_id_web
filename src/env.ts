import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    server: {
        DATABASE_URL: z.string().min(1),
        BETTER_AUTH_SECRET: z.string().min(1),
        BETTER_AUTH_URL: z.url(),
        GOOGLE_CLIENT_ID: z.string().min(1),
        GOOGLE_CLIENT_SECRET: z.string().min(1),
        LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("debug"),
    },

    client: {
        NEXT_PUBLIC_APP_NAME: z.string().default("My Application"),
    },

    experimental__runtimeEnv: {
        NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    },
});