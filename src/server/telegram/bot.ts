import { Bot, type Context } from "grammy";
import { env } from "@/env";
import { createTRPCContext } from "@/trpc/init";
import { createCaller } from "@/trpc/routers/_app";

export const bot = new Bot(env.TELEGRAM_BOT_TOKEN);

// Helper membuat tRPC caller internal
async function getBotCaller() {
  const ctx = await createTRPCContext({
    headers: new Headers(),
    isInternalBot: true,
  });
  return createCaller(ctx);
}

// Helper format hasil pemeriksaan agar konsisten
function formatCheckResult(result: {
  predictionLabel: string;
  confidenceScore: number;
  indicators: string[];
  recommendation: string | null;
}) {
  const labelMap: Record<string, string> = {
    SCAM: "🚨 *INDIKASI PENIPUAN*",
    NORMAL: "✅ *PESAN NORMAL*",
    UNCERTAIN: "⚠️ *BELUM DAPAT DIPASTIKAN*",
  };

  const statusText = labelMap[result.predictionLabel] ?? result.predictionLabel;
  const confidence = Math.round(result.confidenceScore * 100);
  const indicatorsText =
    result.indicators.length > 0
      ? result.indicators.map((item) => `• ${item}`).join("\n")
      : "• Tidak ditemukan indikator aturan khusus";

  return [
    statusText,
    `*Tingkat Keyakinan Model:* ${confidence}%`,
    "",
    "*Indikator yang Ditemukan:*",
    indicatorsText,
    "",
    "*Saran Tindakan:*",
    result.recommendation ??
      "Tetap waspada dan verifikasi melalui saluran resmi.",
    "",
    "_Catatan: Hasil ini merupakan indikasi awal sistem, bukan keputusan hukum._",
  ].join("\n");
}

// Helper eksekusi pemeriksaan teks
async function handleCheckText(ctx: Context, text: string) {
  if (!ctx.from || !ctx.chat) return;

  const cleanText = text.trim();
  if (cleanText.length < 5) {
    await ctx.reply(
      "Teks terlalu pendek. Masukkan minimal 5 karakter pesan untuk diperiksa.",
    );
    return;
  }

  const waitMsg = await ctx.reply("🔍 Sedang menganalisis pesan...");

  try {
    const caller = await getBotCaller();
    const result = await caller.bot.checkMessage({
      telegramUserId: String(ctx.from.id),
      telegramChatId: String(ctx.chat.id),
      telegramUsername: ctx.from.username,
      text: cleanText,
    });

    await ctx.api.editMessageText(
      ctx.chat.id,
      waitMsg.message_id,
      formatCheckResult(result),
      { parse_mode: "Markdown" },
    );
  } catch {
    // Sesuai proposal: jangan mengarang hasil jika API AI gagal[cite: 22]
    await ctx.api.editMessageText(
      ctx.chat.id,
      waitMsg.message_id,
      "❌ Pemeriksaan sedang tidak tersedia karena layanan AI tidak merespons. Silakan coba beberapa saat lagi.",
    );
  }
}

// ==========================================
// DAFTAR PERINTAH BOT SESUAI PROPOSAL[cite: 9]
// ==========================================

bot.command("start", async (ctx) => {
  if (!ctx.from || !ctx.chat) return;
  const caller = await getBotCaller();
  await caller.bot.logCommand({
    telegramUserId: String(ctx.from.id),
    telegramChatId: String(ctx.chat.id),
    telegramUsername: ctx.from.username,
    command: "/start",
  });

  await ctx.reply(
    [
      "👋 *Selamat datang di Bot AntiScamID!*",
      "",
      "Kirimkan langsung teks pesan mencurigakan (SMS/WhatsApp/Telegram) ke chat ini untuk pemeriksaan awal berbasis AI, atau gunakan perintah berikut:",
      "",
      "• `/cek <isi pesan>` — Periksa pesan mencurigakan",
      "• `/lapor <isi pesan>` — Laporkan pesan penipuan ke admin",
      "• `/panduan` — Tips menghindari penipuan digital",
      "• `/bantuan` — Petunjuk penggunaan bot",
    ].join("\n"),
    { parse_mode: "Markdown" },
  );
});

bot.command("panduan", async (ctx) => {
  if (!ctx.from || !ctx.chat) return;
  const caller = await getBotCaller();
  await caller.bot.logCommand({
    telegramUserId: String(ctx.from.id),
    telegramChatId: String(ctx.chat.id),
    telegramUsername: ctx.from.username,
    command: "/panduan",
  });

  await ctx.reply(
    [
      "🛡️ *Panduan Menghindari Penipuan Digital*",
      "",
      "1. *Jangan bagikan OTP/PIN:* Pihak bank atau instansi resmi tidak pernah meminta kode OTP.",
      "2. *Cek ulang tautan:* Waspadai domain tiruan atau tautan singkat yang meminta login ulang.",
      "3. *Verifikasi permintaan darurat:* Hubungi kerabat lewat telepon langsung sebelum mentransfer uang.",
      "4. *Waspada iming-iming hadiah/lowongan:* Hindari transfer biaya administrasi di muka.",
    ].join("\n"),
    { parse_mode: "Markdown" },
  );
});

bot.command("bantuan", async (ctx) => {
  if (!ctx.from || !ctx.chat) return;
  const caller = await getBotCaller();
  await caller.bot.logCommand({
    telegramUserId: String(ctx.from.id),
    telegramChatId: String(ctx.chat.id),
    telegramUsername: ctx.from.username,
    command: "/bantuan",
  });

  await ctx.reply(
    [
      "ℹ️ *Bantuan Penggunaan Bot*",
      "",
      "• *Pemeriksaan Cepat:* Langsung tempel (*paste*) pesan mencurigakan dan kirim ke bot, atau ketik `/cek Selamat Anda menang undian...`",
      "• *Pelaporan:* Ketik `/lapor <isi pesan mencurigakan>` agar pesan ditinjau oleh tim administrator.",
      "• *Pemeriksaan Dokumen (PDF/Gambar):* Silakan gunakan aplikasi web AntiScamID.",
    ].join("\n"),
    { parse_mode: "Markdown" },
  );
});

bot.command("cek", async (ctx) => {
  const payload = ctx.match;
  if (!payload) {
    await ctx.reply("Gunakan format: `/cek <isi pesan yang ingin diperiksa>`", {
      parse_mode: "Markdown",
    });
    return;
  }
  await handleCheckText(ctx, payload);
});

bot.command("lapor", async (ctx) => {
  if (!ctx.from || !ctx.chat) return;
  const payload = ctx.match.trim();

  if (payload.length < 5) {
    await ctx.reply(
      "Gunakan format: `/lapor <isi pesan mencurigakan yang ingin dilaporkan>`",
      {
        parse_mode: "Markdown",
      },
    );
    return;
  }

  const caller = await getBotCaller();
  const report = await caller.bot.submitReport({
    telegramUserId: String(ctx.from.id),
    telegramChatId: String(ctx.chat.id),
    telegramUsername: ctx.from.username,
    content: payload,
  });

  await ctx.reply(
    `✅ Laporan berhasil dicatat dengan ID \`${report.id}\` (Status: *Menunggu Verifikasi*).\nTerima kasih telah membantu meningkatkan keamanan digital.`,
    { parse_mode: "Markdown" },
  );
});

// Teks biasa tanpa slash command otomatis diarahkan ke pemeriksaan pesan[cite: 8]
bot.on("message:text", async (ctx) => {
  if (ctx.message.text.startsWith("/")) return;
  await handleCheckText(ctx, ctx.message.text);
});
