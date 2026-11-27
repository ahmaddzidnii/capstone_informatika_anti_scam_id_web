import { Bot, type Context, InlineKeyboard } from "grammy";
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

// Helper escape HTML agar karakter khusus (<, >, &) pada pesan user tidak merusak format
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ==========================================
// KEYBOARD INTERAKTIF (TOMBOL KLIK)
// ==========================================

const mainMenuKeyboard = new InlineKeyboard()
  .text("Cara Cek Pesan", "menu:cek")
  .text("Panduan Keamanan", "menu:panduan")
  .row()
  .text("Laporkan Penipuan", "menu:lapor")
  .url("Buka Web AntiScamID", "https://antiscamid-dev.ahmadzidni.com");

const backToMenuKeyboard = new InlineKeyboard().text(
  "« Kembali ke Menu Utama",
  "menu:start",
);

// ==========================================
// FORMATTER PESAN PROFESIONAL
// ==========================================

function formatCheckResult(result: {
  predictionLabel: string;
  confidenceScore: number;
  indicators: string[];
  recommendation: string | null;
}) {
  // Pastikan nilai berada di rentang 0 - 1
  const rawScore = Math.min(1, Math.max(0, result.confidenceScore));
  const scamConfidence = Math.round(rawScore * 100);
  const safeConfidence = Math.round((1 - rawScore) * 100);

  let statusText = `<b>[ ${escapeHtml(result.predictionLabel)} ]</b>`;
  let confidenceLine = `Tingkat Keyakinan: <b>${scamConfidence}%</b>`;

  if (result.predictionLabel === "SCAM") {
    statusText = "<b>[ INDIKASI PENIPUAN ]</b>";
    confidenceLine = `Tingkat Keyakinan Penipuan: <b>${scamConfidence}%</b>`;
  } else if (result.predictionLabel === "NORMAL") {
    statusText = "<b>[ PESAN NORMAL ]</b>";
    confidenceLine = `Tingkat Keyakinan Aman: <b>${safeConfidence}%</b>`;
  } else if (result.predictionLabel === "UNCERTAIN") {
    statusText = "<b>[ BELUM DAPAT DIPASTIKAN ]</b>";
    confidenceLine = `Skor Indikasi Risiko: <b>${scamConfidence}%</b>`;
  }

  const indicatorsText =
    result.indicators.length > 0
      ? result.indicators.map((item) => `• ${escapeHtml(item)}`).join("\n")
      : "• Tidak ditemukan pola mencurigakan yang spesifik.";

  const recommendationText = escapeHtml(
    result.recommendation ??
      "Tetap waspada dan lakukan verifikasi melalui saluran resmi instansi terkait.",
  );

  return [
    statusText,
    confidenceLine,
    "────────────────────",
    "<b>Indikator Analisis:</b>",
    indicatorsText,
    "",
    "<b>Rekomendasi Tindakan:</b>",
    recommendationText,
    "────────────────────",
    "<i>Catatan: Hasil analisis ini merupakan deteksi awal sistem dan bukan merupakan keputusan hukum.</i>",
  ].join("\n");
}

function getStartText() {
  return [
    "<b>AntiScamID — Sistem Deteksi Penipuan Digital</b>",
    "",
    "Teruskan (<i>forward</i>) atau tempel teks pesan mencurigakan (SMS, WhatsApp, Telegram) langsung ke ruang obrolan ini untuk analisis otomatis.",
    "",
    "<b>Perintah Tersedia:</b>",
    "• <code>/cek [teks]</code> — Analisis isi pesan",
    "• <code>/lapor [teks]</code> — Kirim laporan ke administrator",
    "• <code>/panduan</code> — Standar pencegahan penipuan",
    "• <code>/bantuan</code> — Informasi penggunaan layanan",
  ].join("\n");
}

function getPanduanText() {
  return [
    "<b>Panduan Pencegahan Penipuan Digital</b>",
    "────────────────────",
    "<b>1. Kerahasiaan Kredensial</b>",
    "Instansi resmi dan perbankan tidak pernah meminta kode OTP, PIN, atau kata sandi melalui pesan singkat.",
    "",
    "<b>2. Validasi Tautan (URL)</b>",
    "Periksa domain secara teliti sebelum membuka tautan. Hindari mengunduh berkas berekstensi <code>.apk</code> dari sumber tidak resmi.",
    "",
    "<b>3. Verifikasi Permintaan Darurat</b>",
    "Konfirmasi ulang melalui panggilan telepon langsung apabila menerima pesan permintaan transfer dana dari kerabat.",
    "",
    "<b>4. Tawaran Tidak Wajar</b>",
    "Waspadai pemberitahuan hadiah atau lowongan kerja yang mensyaratkan biaya administrasi di awal.",
  ].join("\n");
}

// ==========================================
// LOGIKA PEMERIKSAAN TEKS
// ==========================================

async function handleCheckText(
  ctx: Context,
  text: string,
  replyToMessageId?: number,
) {
  if (!ctx.from || !ctx.chat) return;

  const cleanText = text.trim();
  if (cleanText.length < 5) {
    await ctx.reply(
      "Teks terlalu pendek. Masukkan minimal 5 karakter untuk dianalisis.",
    );
    return;
  }

  // Reply ke pesan user agar tombol "Laporkan" bisa mereferensikan teks/caption aslinya
  const waitMsg = await ctx.reply("Menganalisis struktur dan pola pesan...", {
    ...(replyToMessageId
      ? { reply_parameters: { message_id: replyToMessageId } }
      : {}),
  });

  try {
    const caller = await getBotCaller();
    const result = await caller.bot.checkMessage({
      telegramUserId: String(ctx.from.id),
      telegramChatId: String(ctx.chat.id),
      telegramUsername: ctx.from.username,
      text: cleanText,
    });

    // Sisipkan result.id langsung ke callback_data agar checkId ter-link saat dilaporkan
    const resultKeyboard = new InlineKeyboard();
    if (replyToMessageId) {
      resultKeyboard.text("Laporkan Pesan Ini ke Admin", `report:${result.id}`);
    }
    resultKeyboard.row().text("Menu Utama", "menu:start");

    await ctx.api.editMessageText(
      ctx.chat.id,
      waitMsg.message_id,
      formatCheckResult(result),
      {
        parse_mode: "HTML",
        reply_markup: resultKeyboard,
      },
    );
  } catch {
    await ctx.api.editMessageText(
      ctx.chat.id,
      waitMsg.message_id,
      "Layanan analisis sedang tidak merespons. Silakan coba beberapa saat lagi.",
    );
  }
}

// ==========================================
// HANDLER PERINTAH SLASH
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

  await ctx.reply(getStartText(), {
    parse_mode: "HTML",
    reply_markup: mainMenuKeyboard,
  });
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

  await ctx.reply(getPanduanText(), {
    parse_mode: "HTML",
    reply_markup: backToMenuKeyboard,
  });
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
      "<b>Pusat Bantuan AntiScamID</b>",
      "────────────────────",
      "<b>1. Analisis Otomatis</b>",
      "Kirim atau teruskan pesan teks secara langsung tanpa perintah tambahan, atau gunakan <code>/cek [isi pesan]</code>.",
      "",
      "<b>2. Pelaporan Database</b>",
      "Gunakan <code>/lapor [isi pesan]</code> atau tekan tombol <b>Laporkan Pesan Ini ke Admin</b> setelah hasil pemeriksaan muncul.",
    ].join("\n"),
    {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .url("Buka Portal Web", "https://antiscamid-dev.ahmadzidni.com")
        .row()
        .text("« Kembali ke Menu Utama", "menu:start"),
    },
  );
});

bot.command("cek", async (ctx) => {
  const payload = ctx.match;
  if (!payload) {
    await ctx.reply(
      "Format perintah: <code>/cek [isi pesan yang akan diperiksa]</code>",
      { parse_mode: "HTML" },
    );
    return;
  }
  await handleCheckText(ctx, payload, ctx.message?.message_id);
});

bot.command("lapor", async (ctx) => {
  if (!ctx.from || !ctx.chat) return;
  const payload = ctx.match.trim();

  if (payload.length < 5) {
    await ctx.reply(
      "Format perintah: <code>/lapor [isi pesan yang akan dilaporkan]</code>",
      { parse_mode: "HTML" },
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
    [
      "<b>Laporan Berhasil Dikirim</b>",
      "────────────────────",
      `ID Pelaporan: <code>${escapeHtml(String(report.id))}</code>`,
      "Status: <b>Menunggu Verifikasi Admin (PENDING)</b>",
      "",
      "Terima kasih atas kontribusi Anda dalam pembaruan basis data keamanan.",
    ].join("\n"),
    {
      parse_mode: "HTML",
      reply_markup: backToMenuKeyboard,
    },
  );
});

// ==========================================
// HANDLER TOMBOL INLINE (CALLBACK QUERY)
// ==========================================

bot.callbackQuery("menu:start", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText(getStartText(), {
    parse_mode: "HTML",
    reply_markup: mainMenuKeyboard,
  });
});

bot.callbackQuery("menu:panduan", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText(getPanduanText(), {
    parse_mode: "HTML",
    reply_markup: backToMenuKeyboard,
  });
});

bot.callbackQuery("menu:cek", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText(
    [
      "<b>Cara Melakukan Pemeriksaan</b>",
      "────────────────────",
      "Silakan langsung <b>tempel (paste)</b> atau <b>teruskan (forward)</b> pesan mencurigakan ke chat ini.",
      "",
      "<i>Contoh pesan yang dapat diperiksa:</i>",
      "<code>Selamat nomor Anda terpilih mendapatkan dana bantuan Rp15.000.000, klik tautan berikut untuk pencairan...</code>",
    ].join("\n"),
    {
      parse_mode: "HTML",
      reply_markup: backToMenuKeyboard,
    },
  );
});

bot.callbackQuery("menu:lapor", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText(
    [
      "<b>Prosedur Pelaporan Pesan</b>",
      "────────────────────",
      "Anda dapat melaporkan pesan melalui dua cara:",
      "",
      "1. Kirim pesan untuk diperiksa terlebih dahulu, lalu tekan tombol <b>Laporkan Pesan Ini ke Admin</b> pada hasil analisis.",
      "2. Ketik perintah manual: <code>/lapor [tempel isi pesan]</code>",
    ].join("\n"),
    {
      parse_mode: "HTML",
      reply_markup: backToMenuKeyboard,
    },
  );
});

// Handler tombol "Laporkan Pesan Ini ke Admin" dengan checkId tersemat
bot.callbackQuery(/^report:([a-zA-Z0-9_-]+)$/, async (ctx) => {
  const checkId = ctx.match[1];
  const repliedMessage = ctx.callbackQuery.message?.reply_to_message;

  // Mendukung pesan teks biasa maupun media yang memiliki caption
  const originalText = repliedMessage
    ? "text" in repliedMessage && repliedMessage.text
      ? repliedMessage.text
      : "caption" in repliedMessage && repliedMessage.caption
        ? repliedMessage.caption
        : null
    : null;

  if (!originalText || !ctx.from || !ctx.chat) {
    await ctx.answerCallbackQuery({
      text: "Teks asli tidak ditemukan. Gunakan perintah /lapor [teks].",
      show_alert: true,
    });
    return;
  }

  // Jika user mengirim via `/cek teks`, bersihkan prefix `/cek `
  const cleanPayload = originalText.replace(/^\/cek(@\w+)?\s+/i, "").trim();

  // Deteksi apakah pesan asli merupakan hasil forward
  const isForwarded = Boolean(
    repliedMessage &&
      "forward_origin" in repliedMessage &&
      repliedMessage.forward_origin,
  );

  try {
    const caller = await getBotCaller();
    const report = await caller.bot.submitReport({
      telegramUserId: String(ctx.from.id),
      telegramChatId: String(ctx.chat.id),
      telegramUsername: ctx.from.username,
      checkId,
      content: cleanPayload,
      chronology: isForwarded
        ? "Pesan diteruskan (forwarded) langsung oleh pengguna ke bot Telegram."
        : undefined,
    });

    await ctx.answerCallbackQuery();

    // Hapus tombol lapor dari pesan hasil analisis agar tidak diklik ganda
    await ctx.editMessageReplyMarkup({
      reply_markup: new InlineKeyboard().text("Menu Utama", "menu:start"),
    });

    // Kirim pesan balasan baru berisi ID Pelaporan dan Status
    await ctx.reply(
      [
        "<b>Laporan Berhasil Dikirim</b>",
        "────────────────────",
        `ID Pelaporan: <code>${escapeHtml(String(report.id))}</code>`,
        "Status: <b>Menunggu Verifikasi Admin (PENDING)</b>",
        "",
        "Terima kasih. Laporan Anda telah terhubung dengan hasil analisis dan akan segera ditinjau oleh tim admin.",
      ].join("\n"),
      {
        parse_mode: "HTML",
        reply_parameters: { message_id: repliedMessage?.message_id },
        reply_markup: backToMenuKeyboard,
      },
    );
  } catch {
    await ctx.answerCallbackQuery({
      text: "Laporan untuk pesan ini sudah tercatat atau gagal diproses.",
      show_alert: true,
    });
  }
});

// ==========================================
// HANDLER PESAN OTOMATIS (TEKS, CAPTION, & MEDIA)
// ==========================================

// 1. Menangkap teks biasa, teks forward, maupun media yang disertai caption
bot.on(["message:text", "message:caption"], async (ctx) => {
  const rawText = ctx.message.text ?? ctx.message.caption;
  if (!rawText || rawText.startsWith("/")) return;

  await handleCheckText(ctx, rawText, ctx.message.message_id);
});

// 2. Menangkap media tanpa teks (foto, dokumen/PDF, video, voice note, stiker, dll.)
// Menangkap media tanpa teks (foto, dokumen/PDF, video, voice note, stiker, dll.)
bot.on("message", async (ctx) => {
  await ctx.reply(
    [
      "<b>Format Pesan Tidak Didukung</b>",
      "────────────────────",
      "Saat ini layanan bot belum mendukung pemeriksaan dokumen, gambar, atau berkas media lainnya.",
      "",
      "Silakan salin dan kirimkan <b>isi teks pesan</b> yang mencurigakan ke ruang obrolan ini untuk dianalisis.",
    ].join("\n"),
    {
      parse_mode: "HTML",
      reply_parameters: { message_id: ctx.message.message_id },
      reply_markup: backToMenuKeyboard,
    },
  );
});

// Opsional: Panggil sekali saat startup/deploy untuk mendaftarkan tombol Menu di klien Telegram
export async function registerBotCommands() {
  await bot.api.setMyCommands([
    { command: "start", description: "Buka menu utama AntiScamID" },
    { command: "cek", description: "Periksa indikasi penipuan pada teks" },
    { command: "lapor", description: "Laporkan pesan penipuan ke admin" },
    { command: "panduan", description: "Panduan pencegahan penipuan digital" },
    { command: "bantuan", description: "Informasi penggunaan layanan" },
  ]);
}
