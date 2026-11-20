import { describe, it, expect, afterAll } from 'vitest';
import { createCaller } from '../../src/trpc/routers/_app';
import { createTRPCContext } from '../../src/trpc/init';

import prisma from '@/lib/prisma';

// Helper membuat caller berdasarkan role
async function makeCaller(options?: {
    userId?: string;
    role?: 'user' | 'admin';
    isInternalBot?: boolean;
}) {
    const ctx = await createTRPCContext({
        headers: new Headers(),
        isInternalBot: options?.isInternalBot ?? false,
    });

    if (options?.userId) {
        ctx.session = {
            user: {
                id: options.userId,
                name: 'Test User',
                email: `${options.userId}@test.local`,
                role: options.role ?? 'user',
                emailVerified: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            session: {
                id: 'sess-test',
                userId: options.userId,
                token: 'tok-test',
                expiresAt: new Date(Date.now() + 3600_000),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        } as typeof ctx.session;
    }

    return createCaller(ctx);
}

describe('AntiScamID End-to-End Flow', () => {
    let createdReportId: string;

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it('1. Tamu dapat memeriksa teks penipuan & privasi terjaga', async () => {
        const guestCaller = await makeCaller();
        const res = await guestCaller.check.analyzeText({
            text: 'Selamat Anda menang hadiah Rp50.000.000, segera transfer biaya admin!',
            saveContent: false,
        });

        expect(res.predictionLabel).toBe('SCAM');
        expect(res.content).toBeNull(); // Memastikan teks tidak disimpan jika saveContent = false
        expect(res.indicators.length).toBeGreaterThan(0);
    });

    it('2. Bot Telegram dapat memeriksa pesan & mengirim laporan', async () => {
        const botCaller = await makeCaller({ isInternalBot: true });

        const botCheck = await botCaller.bot.checkMessage({
            telegramUserId: '999001',
            telegramChatId: '999001',
            telegramUsername: 'tester_e2e',
            text: 'Akun Anda akan diblokir hari ini, kirim kode OTP sekarang.',
        });
        expect(botCheck.inputSource).toBe('TELEGRAM_BOT');

        const botReport = await botCaller.bot.submitReport({
            telegramUserId: '999001',
            telegramChatId: '999001',
            content: 'Penipuan mengatasnamakan bank meminta kode OTP.',
        });
        expect(botReport.status).toBe('PENDING');
        createdReportId = botReport.id;
    });

    it('3. User biasa ditolak mengakses prosedur admin', async () => {
        const userCaller = await makeCaller({ userId: 'user-biasa', role: 'user' });

        await expect(
            userCaller.admin.getDashboardStats({ days: 7 }),
        ).rejects.toThrow(/authorized/i);
    });

    it('4. Admin dapat memverifikasi laporan & mencatat audit trail', async () => {
        // Pastikan akun admin dummy ada di DB untuk foreign key reviewer_id
        const adminUser = await prisma.user.upsert({
            where: { email: 'admin-e2e@test.local' },
            update: { role: 'admin' },
            create: {
                name: 'Admin E2E',
                email: 'admin-e2e@test.local',
                role: 'admin',
            },
        });

        const adminCaller = await makeCaller({
            userId: adminUser.id,
            role: 'admin',
        });

        const reviewed = await adminCaller.admin.reviewReport({
            reportId: createdReportId,
            newStatus: 'VERIFIED_SCAM',
            suspectedModus: 'OTP_PHISHING',
            isCleanForDataset: true,
            notes: 'Terbukti pola phishing OTP.',
        });

        expect(reviewed.status).toBe('VERIFIED_SCAM');
        expect(reviewed.isCleanForDataset).toBe(true);

        const stats = await adminCaller.admin.getDashboardStats({ days: 7 });
        expect(stats.checkStats.length).toBeGreaterThan(0);
    });
});