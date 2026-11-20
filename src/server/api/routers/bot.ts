import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, botProcedure } from '@/trpc/init';
import { ScamModusEnum } from './report';
import { env } from '@/env';
import { predictTextAI, PredictTextResponse } from '@/server/services/ai-client';

interface FastAPIPredictResponse {
    label: 'SCAM' | 'NORMAL' | 'UNCERTAIN';
    score: number;
    model_version: string;
    indicators: string[];
    recommendation: string;
}

export const botRouter = createTRPCRouter({
    // Pencatatan penggunaan perintah informasi (/start, /panduan, /bantuan)[cite: 9]
    logCommand: botProcedure
        .input(
            z.object({
                telegramUserId: z.string(),
                telegramChatId: z.string(),
                telegramUsername: z.string().optional(),
                command: z.enum([
                    '/start',
                    '/cek',
                    '/lapor',
                    '/panduan',
                    '/bantuan',
                ]),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.botInteraction.create({
                data: {
                    telegramUserId: input.telegramUserId,
                    telegramChatId: input.telegramChatId,
                    telegramUsername: input.telegramUsername ?? null,
                    command: input.command,
                },
            });
        }),

    // Pemeriksaan teks melalui bot Telegram (/cek)[cite: 9, 22]
    checkMessage: botProcedure
        .input(
            z.object({
                telegramUserId: z.string(),
                telegramChatId: z.string(),
                telegramUsername: z.string().optional(),
                text: z.string().trim().min(5).max(5000),
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
                ctx.logger.error({ err: error }, 'Telegram bot AI check failed');

                throw new TRPCError({
                    code: 'SERVICE_UNAVAILABLE',
                    message:
                        'Pemeriksaan sedang tidak tersedia karena layanan AI tidak merespons.',
                });
            }

            const latencyMs = Math.round(performance.now() - startTime);

            const check = await ctx.prisma.check.create({
                data: {
                    inputSource: 'TELEGRAM_BOT',
                    content: null,
                    isContentSaved: false,
                    predictionLabel: aiResult.label,
                    confidenceScore: aiResult.score,
                    modelVersion: aiResult.model_version,
                    indicators: aiResult.indicators,
                    recommendation: aiResult.recommendation,
                    latencyMs,
                    botInteraction: {
                        create: {
                            telegramUserId: input.telegramUserId,
                            telegramChatId: input.telegramChatId,
                            telegramUsername: input.telegramUsername ?? null,
                            command: '/cek',
                        },
                    },
                },
            });

            ctx.logger.info(
                {
                    checkId: check.id,
                    telegramUserId: input.telegramUserId,
                    latencyMs,
                },
                'Bot message check completed',
            );

            return check;
        }),

    // Pelaporan pesan mencurigakan melalui bot Telegram (/lapor)[cite: 9, 22]
    submitReport: botProcedure
        .input(
            z.object({
                telegramUserId: z.string(),
                telegramChatId: z.string(),
                telegramUsername: z.string().optional(),
                content: z.string().trim().min(5).max(5000),
                suspectedModus: ScamModusEnum.default('OTHER'),
                chronology: z.string().max(2000).optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const report = await ctx.prisma.report.create({
                data: {
                    content: input.content,
                    platform: 'TELEGRAM',
                    suspectedModus: input.suspectedModus,
                    chronology: input.chronology ?? null,
                    status: 'PENDING',
                    botInteraction: {
                        create: {
                            telegramUserId: input.telegramUserId,
                            telegramChatId: input.telegramChatId,
                            telegramUsername: input.telegramUsername ?? null,
                            command: '/lapor',
                        },
                    },
                },
            });

            ctx.logger.info(
                {
                    reportId: report.id,
                    telegramUserId: input.telegramUserId,
                },
                'Bot scam report submitted',
            );

            return report;
        }),
});