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
    TELEGRAM_BOT_TOKEN: z.string().min(1),
    TELEGRAM_BOT_MODE: z.enum(["polling", "webhook"]).default("polling"),
    TELEGRAM_WEBHOOK_SECRET: z.string().min(16).optional(),
    USE_MOCK_AI: z
      .enum(["true", "false"])
      .default("true")
      .transform((v) => v === "true"),
    AI_API_URL: z.url().optional(),
    AI_API_KEY: z.string().optional(),
    TELEGRAM_WEBHOOK_URL: z.string().url().optional(),
  },

  client: {
    NEXT_PUBLIC_APP_NAME: z.string().default("My Application"),
  },

  experimental__runtimeEnv: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  },
});
