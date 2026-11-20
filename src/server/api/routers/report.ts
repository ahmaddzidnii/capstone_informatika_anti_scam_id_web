import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import {
    createTRPCRouter,
    baseProcedure,
    protectedProcedure,
} from '@/trpc/init';

export const PlatformEnum = z.enum([
    'SMS',
    'WHATSAPP',
    'TELEGRAM',
    'EMAIL',
    'OTHER',
]);

export const ScamModusEnum = z.enum([
    'FAKE_PRIZE',
    'JOB_SCAM',
    'BANK_IMPERSONATION',
    'INVESTMENT',
    'TRANSFER_REQUEST',
    'OTP_PHISHING',
    'OTHER',
]);

export const reportRouter = createTRPCRouter({
    // Kirim laporan pesan mencurigakan[cite: 10]
    create: baseProcedure
        .input(
            z.object({
                content: z
                    .string()
                    .trim()
                    .min(5, 'Isi pesan laporan minimal 5 karakter.')
                    .max(5000),
                platform: PlatformEnum,
                suspectedModus: ScamModusEnum.default('OTHER'),
                suspiciousLink: z
                    .string()
                    .url('Format tautan tidak valid.')
                    .optional()
                    .or(z.literal('')),
                chronology: z.string().max(2000).optional(),
                checkId: z.string().optional(),
                documentId: z.string().optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const report = await ctx.prisma.report.create({
                data: {
                    reporterId: ctx.session?.user.id ?? null,
                    checkId: input.checkId ?? null,
                    documentId: input.documentId ?? null,
                    content: input.content,
                    platform: input.platform,
                    suspectedModus: input.suspectedModus,
                    suspiciousLink: input.suspiciousLink || null,
                    chronology: input.chronology ?? null,
                    status: 'PENDING', // Menunggu verifikasi administrator[cite: 10]
                },
            });

            ctx.logger.info(
                { reportId: report.id, platform: report.platform },
                'Scam report submitted',
            );

            return report;
        }),

    // Daftar laporan milik pengguna login
    getMyReports: protectedProcedure
        .input(
            z.object({
                limit: z.number().min(1).max(50).default(10),
                cursor: z.string().optional(),
            }),
        )
        .query(async ({ ctx, input }) => {
            const items = await ctx.prisma.report.findMany({
                where: { reporterId: ctx.session.user.id, deletedAt: null },
                take: input.limit + 1,
                cursor: input.cursor ? { id: input.cursor } : undefined,
                orderBy: { createdAt: 'desc' },
                include: {
                    reviews: {
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                        select: {
                            newStatus: true,
                            notes: true,
                            createdAt: true,
                        },
                    },
                },
            });

            let nextCursor: string | undefined;
            if (items.length > input.limit) {
                const nextItem = items.pop();
                nextCursor = nextItem?.id;
            }

            return { items, nextCursor };
        }),

    // Detail laporan (hanya pemilik laporan atau admin)
    getById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const report = await ctx.prisma.report.findFirst({
                where: { id: input.id, deletedAt: null },
                include: {
                    check: true,
                    document: true,
                    reviews: {
                        orderBy: { createdAt: 'desc' },
                        include: {
                            reviewer: { select: { id: true, name: true } },
                        },
                    },
                },
            });

            if (!report) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Laporan tidak ditemukan.',
                });
            }

            if (
                ctx.session.user.role !== 'admin' &&
                report.reporterId !== ctx.session.user.id
            ) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Anda tidak memiliki akses ke laporan ini.',
                });
            }

            return report;
        }),
});