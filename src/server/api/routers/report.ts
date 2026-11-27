import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getEvidenceSignedUrl, uploadEvidenceToS3 } from "@/lib/s3";
import {
  adminProcedure,
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";

export const PlatformEnum = z.enum([
  "SMS",
  "WHATSAPP",
  "TELEGRAM",
  "EMAIL",
  "OTHER",
]);

export const ScamModusEnum = z.enum([
  "FAKE_PRIZE",
  "JOB_SCAM",
  "BANK_IMPERSONATION",
  "INVESTMENT",
  "TRANSFER_REQUEST",
  "OTP_PHISHING",
  "OTHER",
]);

const createReportSchema = z.object({
  content: z
    .string()
    .trim()
    .min(5, "Isi pesan laporan minimal 5 karakter.")
    .max(5000),
  platform: PlatformEnum,
  suspectedModus: ScamModusEnum.default("OTHER"),
  chronology: z.string().max(2000).optional(),
  checkId: z.string().optional(),
  documentId: z.string().optional(),
});

const ALLOWED_EVIDENCE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export const reportRouter = createTRPCRouter({
  create: baseProcedure
    .input(z.instanceof(FormData))
    .mutation(async ({ ctx, input }) => {
      const parsed = createReportSchema.safeParse({
        content: input.get("content"),
        platform: input.get("platform"),
        suspectedModus: input.get("suspectedModus") || undefined,
        chronology: input.get("chronology") || undefined,
        checkId: input.get("checkId") || undefined,
        documentId: input.get("documentId") || undefined,
      });

      if (!parsed.success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: parsed.error.issues[0]?.message ?? "Input tidak valid.",
        });
      }

      let evidenceUrl: string | null = null;
      const file = input.get("evidenceFile");

      if (file instanceof File && file.size > 0) {
        if (!ALLOWED_EVIDENCE_TYPES.includes(file.type)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Format bukti harus JPG, PNG, WebP, atau PDF.",
          });
        }
        if (file.size > 5 * 1024 * 1024) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Ukuran file bukti maksimal 5 MB.",
          });
        }

        evidenceUrl = await uploadEvidenceToS3(file);
      }

      const report = await ctx.prisma.report.create({
        data: {
          reporterId: ctx.session?.user.id ?? null,
          checkId: parsed.data.checkId ?? null,
          documentId: parsed.data.documentId ?? null,
          content: parsed.data.content,
          platform: parsed.data.platform,
          suspectedModus: parsed.data.suspectedModus,
          chronology: parsed.data.chronology ?? null,
          evidenceUrl,
          status: "PENDING",
        },
      });

      ctx.logger.info(
        { reportId: report.id, platform: report.platform },
        "Scam report submitted",
      );

      return report;
    }),

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
        orderBy: { createdAt: "desc" },
        include: {
          reviews: {
            orderBy: { createdAt: "desc" },
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

  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const report = await ctx.prisma.report.findFirst({
        where: { id: input.id, deletedAt: null },
        include: {
          check: true,
          document: true,
          reviews: {
            orderBy: { createdAt: "desc" },
            include: {
              reviewer: { select: { id: true, name: true } },
            },
          },
        },
      });

      if (!report) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Laporan tidak ditemukan.",
        });
      }

      const signedEvidenceUrl = report.evidenceUrl
        ? await getEvidenceSignedUrl(report.evidenceUrl)
        : null;

      return {
        ...report,
        evidenceUrl: signedEvidenceUrl,
      };
    }),
});
