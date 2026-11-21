import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  type PredictDocumentResponse,
  predictDocumentAI,
} from "@/server/services/ai-client";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // Maksimal 5 MB
const MAX_PDF_PAGES = 5; // Maksimal 5 halaman PDF

export const documentRouter = createTRPCRouter({
  // Unggah & periksa dokumen mencurigakan menggunakan FormData biner
  screenDocument: baseProcedure
    .input(
      z.instanceof(FormData).transform((fd, ctx) => {
        const file = fd.get("file");
        const keepForReport = fd.get("keepForReport") === "true";
        const consentAccepted = fd.get("consentAccepted") === "true";

        if (!(file instanceof File)) {
          ctx.addIssue({
            code: "custom",
            message: "File dokumen wajib diunggah.",
          });
          return z.NEVER;
        }

        if (
          !ALLOWED_MIME_TYPES.includes(
            file.type as (typeof ALLOWED_MIME_TYPES)[number],
          )
        ) {
          ctx.addIssue({
            code: "custom",
            message: "Format dokumen hanya mendukung PDF, JPG, atau PNG.",
          });
          return z.NEVER;
        }

        if (file.size <= 0 || file.size > MAX_FILE_SIZE_BYTES) {
          ctx.addIssue({
            code: "custom",
            message: "Ukuran file maksimal 5 MB.",
          });
          return z.NEVER;
        }

        if (!consentAccepted) {
          ctx.addIssue({
            code: "custom",
            message: "Persetujuan pemrosesan dokumen wajib disetujui.",
          });
          return z.NEVER;
        }

        return { file, keepForReport };
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const startTime = performance.now();
      let docResult: PredictDocumentResponse;

      try {
        docResult = await predictDocumentAI(
          input.file,
          MAX_PDF_PAGES,
          ctx.headers.get("x-request-id") ?? undefined,
        );
      } catch (error) {
        ctx.logger.error(
          { err: error, fileName: input.file.name },
          "Document screening failed",
        );

        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            error instanceof Error
              ? error.message
              : "Gagal mengekstrak atau menganalisis dokumen.",
        });
      }

      if (docResult.page_count && docResult.page_count > MAX_PDF_PAGES) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Jumlah halaman PDF melebihi batas maksimal ${MAX_PDF_PAGES} halaman.`,
        });
      }

      const latencyMs = Math.round(performance.now() - startTime);
      // File/teks sementara langsung dibersihkan kecuali akan dilampirkan ke laporan
      const shouldPurgeNow = !input.keepForReport;

      const createdCheck = await ctx.prisma.check.create({
        data: {
          userId: ctx.session?.user.id ?? null,
          inputSource: "WEB_DOCUMENT",
          content: null,
          isContentSaved: false,
          predictionLabel: docResult.label,
          confidenceScore: docResult.score,
          modelVersion: docResult.model_version,
          indicators: docResult.indicators,
          recommendation: docResult.recommendation,
          latencyMs,
          document: {
            create: {
              fileName: input.file.name,
              mimeType: input.file.type,
              fileSize: input.file.size,
              pageCount: docResult.page_count,
              extractionStatus: "SUCCESS",
              extractionMethod: docResult.extraction_method,
              extractedText: shouldPurgeNow ? null : docResult.extracted_text,
              storagePath: null,
              isPurged: shouldPurgeNow,
              purgedAt: shouldPurgeNow ? new Date() : null,
            },
          },
        },
        include: { document: true },
      });

      ctx.logger.info(
        {
          checkId: createdCheck.id,
          isPurged: shouldPurgeNow,
          latencyMs,
        },
        "Document screening completed",
      );

      return createdCheck;
    }),

  // Menandai metadata/teks dokumen sementara telah dibersihkan
  markPurged: baseProcedure
    .input(z.object({ documentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const doc = await ctx.prisma.document.update({
        where: { id: input.documentId },
        data: {
          extractedText: null,
          storagePath: null,
          isPurged: true,
          purgedAt: new Date(),
        },
      });

      ctx.logger.info(
        { documentId: doc.id },
        "Temporary document marked as purged",
      );

      return {
        id: doc.id,
        isPurged: doc.isPurged,
        purgedAt: doc.purgedAt,
      };
    }),
});
