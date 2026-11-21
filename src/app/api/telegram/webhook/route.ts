import { webhookCallback } from "grammy";
import { type NextRequest, NextResponse } from "next/server";
import { env } from "@/env";
import { bot } from "@/server/telegram/bot";

const handleUpdate = webhookCallback(bot, "std/http", {
  secretToken: env.TELEGRAM_WEBHOOK_SECRET,
});

export async function POST(req: NextRequest) {
  if (env.TELEGRAM_BOT_MODE !== "webhook") {
    return NextResponse.json(
      { ok: false, error: "Webhook mode is disabled" },
      { status: 404 },
    );
  }

  return handleUpdate(req);
}
