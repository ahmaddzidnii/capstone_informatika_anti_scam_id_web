import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTestCaller } from '../helpers/mock-context';
import { env } from '@/env';

describe('botRouter', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('menolak panggilan tanpa isInternalBot dan tanpa header x-internal-api-key', async () => {
        const { caller } = createTestCaller({ isInternalBot: false });

        await expect(
            caller.bot.logCommand({
                telegramUserId: '123',
                telegramChatId: '123',
                command: '/start',
            }),
        ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });

    it('mengizinkan panggilan jika header x-internal-api-key cocok dengan BETTER_AUTH_SECRET', async () => {
        const { caller, mockPrisma } = createTestCaller({
            isInternalBot: false,
            headers: { 'x-internal-api-key': env.BETTER_AUTH_SECRET },
        });

        mockPrisma.botInteraction.create.mockResolvedValueOnce({ id: 'int-1' });

        const res = await caller.bot.logCommand({
            telegramUserId: '123',
            telegramChatId: '123',
            command: '/panduan',
        });

        expect(res.id).toBe('int-1');
    });
});