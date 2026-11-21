import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, adminProcedure } from '@/trpc/init';
import { ScamModusEnum } from './report';

export const ReportStatusEnum = z.enum([
    'PENDING',
    'IN_REVIEW',
    'VERIFIED_SCAM',
    'INSUFFICIENT_EVIDENCE',
    'REJECTED',
]);

export const adminRouter = createTRPCRouter({
    // Antrean laporan masuk untuk moderasi admin[cite: 10]
    listReports: adminProcedure
        .input(
            z.object({
                status: ReportStatusEnum.optional(),
                suspectedModus: ScamModusEnum.optional(),
                search: z.string().optional(),
                page: z.number().min(1).default(1),
                pageSize: z.number().min(1).max(100).default(20),
            }),
        )
        .query(async ({ ctx, input }) => {
            const where = {
                deletedAt: null,
                ...(input.status ? { status: input.status } : {}),
                ...(input.suspectedModus
                    ? { suspectedModus: input.suspectedModus }
                    : {}),
                ...(input.search
                    ? {
                        content: {
                            contains: input.search,
                            mode: 'insensitive' as const,
                        },
                    }
                    : {}),
            };

            const [total, items] = await ctx.prisma.$transaction([
                ctx.prisma.report.count({ where }),
                ctx.prisma.report.findMany({
                    where,
                    skip: (input.page - 1) * input.pageSize,
                    take: input.pageSize,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        reporter: {
                            select: { id: true, name: true, email: true },
                        },
                        check: {
                            select: {
                                predictionLabel: true,
                                confidenceScore: true,
                            },
                        },
                        document: {
                            select: {
                                id: true,
                                fileName: true,
                                isPurged: true,
                            },
                        },
                    },
                }),
            ]);

            return {
                items,
                total,
                page: input.page,
                totalPages: Math.ceil(total / input.pageSize),
            };
        }),

    // Moderasi status laporan + simpan jejak audit ReportReview[cite: 10, 11, 16]
    reviewReport: adminProcedure
        .input(
            z.object({
                reportId: z.string(),
                newStatus: ReportStatusEnum,
                suspectedModus: ScamModusEnum.optional(),
                isCleanForDataset: z.boolean().optional(),
                notes: z.string().max(1000).optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const existing = await ctx.prisma.report.findFirst({
                where: { id: input.reportId, deletedAt: null },
            });

            if (!existing) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Laporan tidak ditemukan.',
                });
            }

            const [updatedReport] = await ctx.prisma.$transaction([
                ctx.prisma.report.update({
                    where: { id: input.reportId },
                    data: {
                        status: input.newStatus,
                        ...(input.suspectedModus
                            ? { suspectedModus: input.suspectedModus }
                            : {}),
                        ...(typeof input.isCleanForDataset === 'boolean'
                            ? { isCleanForDataset: input.isCleanForDataset }
                            : {}),
                    },
                }),
                ctx.prisma.reportReview.create({
                    data: {
                        reportId: input.reportId,
                        reviewerId: ctx.session.user.id,
                        previousStatus: existing.status,
                        newStatus: input.newStatus,
                        notes: input.notes ?? null,
                    },
                }),
            ]);

            ctx.logger.info(
                {
                    reportId: input.reportId,
                    reviewerId: ctx.session.user.id,
                    previousStatus: existing.status,
                    newStatus: input.newStatus,
                },
                'Report moderation updated',
            );

            return updatedReport;
        }),

    // Ekspor laporan terverifikasi yang bersih untuk tim AI[cite: 10, 11]
    exportCleanDataset: adminProcedure.query(async ({ ctx }) => {
        return ctx.prisma.report.findMany({
            where: {
                deletedAt: null,
                isCleanForDataset: true,
                status: { in: ['VERIFIED_SCAM', 'REJECTED'] },
            },
            select: {
                id: true,
                content: true,
                platform: true,
                suspectedModus: true,
                status: true,
                updatedAt: true,
            },
            orderBy: { updatedAt: 'desc' },
        });
    }),

    // Statistik Dashboard Monitoring Penipuan (4 Kelompok Informasi)[cite: 10]
    getDashboardStats: adminProcedure
        .input(
            z.object({
                days: z.number().min(7).max(90).default(14),
            }),
        )
        .query(async ({ ctx, input }) => {
            const sinceDate = new Date();
            sinceDate.setDate(sinceDate.getDate() - input.days);

            const [
                checkGroups,
                reportStatusGroups,
                modusGroups,
                recentChecks,
            ] = await Promise.all([
                // Kelompok 1: Statistik Pemeriksaan
                ctx.prisma.check.groupBy({
                    by: ['predictionLabel'],
                    where: { deletedAt: null },
                    _count: { _all: true },
                    orderBy: { predictionLabel: 'asc' },
                }),
                // Kelompok 2: Statistik Laporan
                ctx.prisma.report.groupBy({
                    by: ['status'],
                    where: { deletedAt: null },
                    _count: { _all: true },
                    orderBy: { status: 'asc' },
                }),
                // Kelompok 3: Statistik Modus
                ctx.prisma.report.groupBy({
                    by: ['suspectedModus'],
                    where: { deletedAt: null },
                    _count: { _all: true },
                    orderBy: { suspectedModus: 'asc' },
                }),
                // Kelompok 4: Data grafik tren harian
                ctx.prisma.check.findMany({
                    where: { deletedAt: null, createdAt: { gte: sinceDate } },
                    select: { createdAt: true, predictionLabel: true },
                    orderBy: { createdAt: 'asc' },
                }),
            ]);

            const trendMap = new Map<
                string,
                { date: string; total: number; scam: number }
            >();
            for (const item of recentChecks) {
                const dateKey = item.createdAt.toISOString().slice(0, 10);
                const current = trendMap.get(dateKey) ?? {
                    date: dateKey,
                    total: 0,
                    scam: 0,
                };
                current.total += 1;
                if (item.predictionLabel === 'SCAM') current.scam += 1;
                trendMap.set(dateKey, current);
            }

            return {
                checkStats: checkGroups.map((g) => ({
                    label: g.predictionLabel,
                    count: g._count._all,
                })),
                reportStats: reportStatusGroups.map((g) => ({
                    status: g.status,
                    count: g._count._all,
                })),
                modusStats: modusGroups.map((g) => ({
                    modus: g.suspectedModus,
                    count: g._count._all,
                })),
                dailyTrend: Array.from(trendMap.values()),
            };
        }),
});