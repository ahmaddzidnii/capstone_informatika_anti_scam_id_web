import "dotenv/config";
import { env } from "@/env";
import { bot } from "@/server/telegram/bot";

const action = process.argv[2] ?? "set";
const webhookUrl = `${env.BETTER_AUTH_URL.replace(/\/$/, "")}/api/telegram/webhook`;

async function main() {
  if (action === "info") {
    const info = await bot.api.getWebhookInfo();
    console.log("ℹ️  Status Webhook Telegram:");
    console.dir(info, { depth: null });
    return;
  }

  if (action === "delete") {
    await bot.api.deleteWebhook({ drop_pending_updates: false });
    console.log(
      "🗑️  Webhook berhasil dihapus. Bot siap dijalankan dalam mode polling.",
    );
    return;
  }

  if (action === "set") {
    if (!webhookUrl.startsWith("https://")) {
      console.error(
        `❌ Gagal: URL webhook wajib HTTPS (saat ini: ${webhookUrl}).\n   Pastikan BETTER_AUTH_URL menggunakan domain HTTPS atau tunnel (Cloudflare Tunnel / ngrok).`,
      );
      process.exit(1);
    }

    await bot.api.setWebhook(webhookUrl, {
      secret_token: env.TELEGRAM_WEBHOOK_SECRET,
      allowed_updates: ["message"],
      drop_pending_updates: false,
    });

    console.log("✅ Webhook berhasil didaftarkan!");
    console.log(`   Target URL : ${webhookUrl}`);
    console.log(
      `   Secret     : ${env.TELEGRAM_WEBHOOK_SECRET ? "Aktif (terpasang)" : "Tidak diset"}`,
    );
    return;
  }

  console.error(
    `❌ Argumen tidak dikenal: "${action}". Gunakan: set | info | delete`,
  );
  process.exit(1);
}

main().catch((err) => {
  console.error("❌ Terjadi kesalahan:", err);
  process.exit(1);
});
