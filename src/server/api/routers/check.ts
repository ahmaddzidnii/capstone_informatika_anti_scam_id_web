import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import {
    createTRPCRouter,
    baseProcedure,
    protectedProcedure,
} from "@/trpc/init";
import { env } from '@/env';
import { predictTextAI, PredictTextResponse } from '@/server/services/ai-client';

interface FastAPIPredictResponse {
    label: 'SCAM' | 'NORMAL' | 'UNCERTAIN';
    score: number;
    model_version: string;
    indicators: string[];
    recommendation: string;
}

export const checkRouter = createTRPCRouter({
    // Pemeriksaan teks pesan (dapat diakses tamu maupun pengguna login)[cite: 16]
    analyzeText: baseProcedure
        .input(
            z.object({
                text: z
                    .string()
                    .trim()
                    .min(5, 'Pesan terlalu pendek untuk dianalisis.')
                    .max(5000, 'Pesan melebihi batas maksimal 5.000 karakter.'),
                saveContent: z.boolean().default(false),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const startTime = performance.now();
            let aiResult: PredictTextResponse;

            try {
                aiResult = await predictTextAI(
                    input.text,
                    ctx.headers.get('x-request-id') ?? undefined,
                );
            } catch (error) {
                ctx.logger.error(
                    { err: error },
                    'Failed to communicate with AI prediction service',
                );

                throw new TRPCError({
                    code: 'SERVICE_UNAVAILABLE',
                    message:
                        'Layanan deteksi AI sedang tidak tersedia. Silakan coba beberapa saat lagi.',
                });
            }

            const latencyMs = Math.round(performance.now() - startTime);

            const savedCheck = await ctx.prisma.check.create({
                data: {
                    userId: ctx.session?.user.id ?? null,
                    inputSource: 'WEB_TEXT',
                    content: input.saveContent ? input.text : null,
                    isContentSaved: input.saveContent,
                    predictionLabel: aiResult.label,
                    confidenceScore: aiResult.score,
                    modelVersion: aiResult.model_version,
                    indicators: aiResult.indicators,
                    recommendation: aiResult.recommendation,
                    latencyMs,
                },
            });

            ctx.logger.info(
                {
                    checkId: savedCheck.id,
                    label: savedCheck.predictionLabel,
                    latencyMs,
                },
                'Text check completed',
            );

            return savedCheck;
        }),

    // Detail satu hasil pemeriksaan
    getById: baseProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const check = await ctx.prisma.check.findFirst({
                where: { id: input.id, deletedAt: null },
                include: {
                    document: {
                        select: {
                            id: true,
                            fileName: true,
                            mimeType: true,
                            fileSize: true,
                            pageCount: true,
                            extractionStatus: true,
                            extractionMethod: true,
                            isPurged: true,
                        },
                    },
                    report: {
                        select: { id: true, status: true, createdAt: true },
                    },
                },
            });

            if (!check) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Data pemeriksaan tidak ditemukan.',
                });
            }

            return check;
        }),

    // Riwayat pemeriksaan milik pengguna login[cite: 16]
    getMyHistory: protectedProcedure
        .input(
            z.object({
                limit: z.number().min(1).max(50).default(10),
                cursor: z.string().optional(),
            }),
        )
        .query(async ({ ctx, input }) => {
            const items = await ctx.prisma.check.findMany({
                where: { userId: ctx.session.user.id, deletedAt: null },
                take: input.limit + 1,
                cursor: input.cursor ? { id: input.cursor } : undefined,
                orderBy: { createdAt: 'desc' },
                include: {
                    document: { select: { fileName: true, mimeType: true } },
                    report: { select: { id: true, status: true } },
                },
            });

            let nextCursor: string | undefined;
            if (items.length > input.limit) {
                const nextItem = items.pop();
                nextCursor = nextItem?.id;
            }

            return { items, nextCursor };
        }),

    // Hapus riwayat pribadi (soft delete + bersihkan isi pesan)
    deleteMyHistory: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const existing = await ctx.prisma.check.findFirst({
                where: {
                    id: input.id,
                    userId: ctx.session.user.id,
                    deletedAt: null,
                },
            });

            if (!existing) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Riwayat tidak ditemukan.',
                });
            }

            await ctx.prisma.check.update({
                where: { id: input.id },
                data: {
                    deletedAt: new Date(),
                    content: null,
                    isContentSaved: false,
                },
            });

            return { success: true };
        }),
});