import 'dotenv/config';
import { bot } from '../src/server/telegram/bot';
import { env } from '../src/env';

async function main() {
    if (env.TELEGRAM_BOT_MODE !== 'polling') {
        console.error(
            `Ubah TELEGRAM_BOT_MODE="polling" di .env terlebih dahulu (sekarang: "${env.TELEGRAM_BOT_MODE}").`,
        );
        process.exit(1);
    }

    await bot.api.deleteWebhook({ drop_pending_updates: true });

    await bot.api.setMyCommands([
        { command: 'start', description: 'Informasi dan panduan awal' },
        { command: 'cek', description: 'Periksa pesan mencurigakan' },
        { command: 'lapor', description: 'Laporkan pesan penipuan' },
        { command: 'panduan', description: 'Tips menghindari penipuan' },
        { command: 'bantuan', description: 'Petunjuk penggunaan bot' },
    ]);

    console.log('🤖 Bot Telegram AntiScamID aktif (LONG POLLING)...');
    await bot.start();
}

main().catch((err) => {
    console.error('Bot error:', err);
    process.exit(1);
});