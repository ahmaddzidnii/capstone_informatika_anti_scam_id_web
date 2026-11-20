import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTestCaller } from '../helpers/mock-context';

describe('reportRouter & adminRouter', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('report.getById menolak user yang bukan pemilik laporan dan bukan admin', async () => {
        const { caller, mockPrisma } = createTestCaller({
            role: 'user',
            userId: 'user-A',
        });

        mockPrisma.report.findFirst.mockResolvedValueOnce({
            id: 'rep-1',
            reporterId: 'user-B',
        });

        await expect(
            caller.report.getById({ id: 'rep-1' }),
        ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('admin.listReports menolak user biasa dengan FORBIDDEN', async () => {
        const { caller } = createTestCaller({ role: 'user' });

        await expect(caller.admin.listReports({})).rejects.toMatchObject({
            code: 'FORBIDDEN',
        });
    });

    it('admin.reviewReport memperbarui status laporan & menyimpan audit ReportReview', async () => {
        const { caller, mockPrisma } = createTestCaller({
            role: 'admin',
            userId: 'admin-1',
        });

        mockPrisma.report.findFirst.mockResolvedValueOnce({
            id: 'rep-10',
            status: 'PENDING',
        });
        mockPrisma.report.update.mockResolvedValueOnce({
            id: 'rep-10',
            status: 'VERIFIED_SCAM',
            isCleanForDataset: true,
        });
        mockPrisma.reportReview.create.mockResolvedValueOnce({ id: 'rev-1' });

        const res = await caller.admin.reviewReport({
            reportId: 'rep-10',
            newStatus: 'VERIFIED_SCAM',
            isCleanForDataset: true,
            notes: 'Valid penipuan',
        });

        expect(res.status).toBe('VERIFIED_SCAM');
        expect(mockPrisma.reportReview.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                reportId: 'rep-10',
                reviewerId: 'admin-1',
                previousStatus: 'PENDING',
                newStatus: 'VERIFIED_SCAM',
            }),
        });
    });

    it('admin.getDashboardStats mengelompokkan tren harian dengan benar', async () => {
        const { caller, mockPrisma } = createTestCaller({ role: 'admin' });

        mockPrisma.check.groupBy.mockResolvedValueOnce([
            { predictionLabel: 'SCAM', _count: { _all: 5 } },
        ]);
        mockPrisma.report.groupBy
            .mockResolvedValueOnce([{ status: 'PENDING', _count: { _all: 2 } }])
            .mockResolvedValueOnce([
                { suspectedModus: 'OTP_PHISHING', _count: { _all: 4 } },
            ]);
        mockPrisma.check.findMany.mockResolvedValueOnce([
            { createdAt: new Date('2026-11-20T08:00:00Z'), predictionLabel: 'SCAM' },
            { createdAt: new Date('2026-11-20T10:00:00Z'), predictionLabel: 'NORMAL' },
        ]);

        const stats = await caller.admin.getDashboardStats({ days: 7 });

        expect(stats.dailyTrend).toEqual([
            { date: '2026-11-20', total: 2, scam: 1 },
        ]);
    });
});