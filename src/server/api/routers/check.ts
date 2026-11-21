import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
} from "@/constants";
import type { Prisma } from "@/generated/prisma/client";
import {
  type PredictTextResponse,
  predictTextAI,
} from "@/server/services/ai-client";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";

const STATUS_MAP = {
  penipuan: "SCAM",
  normal: "NORMAL",
  "belum-pasti": "UNCERTAIN",
} as const;

export const checkRouter = createTRPCRouter({
  // Pemeriksaan teks pesan (dapat diakses tamu maupun pengguna login)[cite: 16]
  analyzeText: baseProcedure
    .input(
      z.object({
        text: z
          .string()
          .trim()
          .min(5, "Pesan terlalu pendek untuk dianalisis.")
          .max(5000, "Pesan melebihi batas maksimal 5.000 karakter."),
        saveContent: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const startTime = performance.now();
      let aiResult: PredictTextResponse;

      try {
        aiResult = await predictTextAI(
          input.text,
          ctx.headers.get("x-request-id") ?? undefined,
        );
      } catch (error) {
        ctx.logger.error(
          { err: error },
          "Failed to communicate with AI prediction service",
        );

        throw new TRPCError({
          code: "SERVICE_UNAVAILABLE",
          message:
            "Layanan deteksi AI sedang tidak tersedia. Silakan coba beberapa saat lagi.",
        });
      }

      const latencyMs = Math.round(performance.now() - startTime);

      const savedCheck = await ctx.prisma.check.create({
        data: {
          userId: ctx.session?.user.id ?? null,
          inputSource: "WEB_TEXT",
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
        "Text check completed",
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
          code: "NOT_FOUND",
          message: "Data pemeriksaan tidak ditemukan.",
        });
      }

      return check;
    }),

  // Riwayat pemeriksaan milik pengguna login[cite: 16]
  getMyHistory: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(DEFAULT_PAGE),
        limit: z
          .number()
          .min(MIN_PAGE_SIZE)
          .max(MAX_PAGE_SIZE)
          .default(DEFAULT_PAGE_SIZE),
        search: z.string().optional().default(""),
        type: z.enum(["semua", "teks", "dokumen"]).default("semua"),
        status: z
          .enum(["semua", "penipuan", "normal", "belum-pasti"])
          .default("semua"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, search, type, status } = input;
      const skip = (page - 1) * limit;

      const where: Prisma.CheckWhereInput = {
        userId: ctx.session.user.id,
        deletedAt: null,
        ...(type !== "semua" && {
          document: type === "dokumen" ? { isNot: null } : { is: null },
        }),
        ...(status !== "semua" && {
          predictionLabel: STATUS_MAP[status],
        }),
        ...(search && {
          OR: [
            { content: { contains: search, mode: "insensitive" } },
            {
              document: {
                fileName: { contains: search, mode: "insensitive" },
              },
            },
          ],
        }),
      };

      const [items, totalCount] = await Promise.all([
        ctx.prisma.check.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            document: {
              select: {
                id: true,
                fileName: true,
                mimeType: true,
                extractedText: true,
              },
            },
            report: {
              select: {
                id: true,
                status: true,
              },
            },
          },
        }),
        ctx.prisma.check.count({ where }),
      ]);

      const totalPages = Math.max(1, Math.ceil(totalCount / limit));

      return {
        items,
        totalCount,
        totalPages,
        page,
        limit,
      };
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
          code: "NOT_FOUND",
          message: "Riwayat tidak ditemukan.",
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
