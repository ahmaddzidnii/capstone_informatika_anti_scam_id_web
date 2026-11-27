"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  LuArrowLeft,
  LuClock,
  LuEyeOff,
  LuFlag,
  LuRotateCcw,
} from "react-icons/lu";
import { AnalyzedTextViewer } from "@/components/analyzed-text-viewer";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { callbackSDK } from "@/lib/callback-sdk";
import { useTRPC } from "@/trpc/client";
import {
  ReportDialog,
  type ReportFormValues,
  ReportSuccessDialog,
} from "./_components/report-dialog";
import {
  ResultErrorState,
  ResultPageSkeleton,
} from "./_components/result-states";
import { formatDate } from "./_components/result-utils";
import {
  DocumentAttachmentCard,
  VerdictSummaryCard,
} from "./_components/verdict-summary-card";

export default function CheckResultPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const trpc = useTRPC();

  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    ...trpc.check.getById.queryOptions({ id: params.id }),
  });

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const reportMutation = useMutation({
    ...trpc.report.create.mutationOptions(),
    onSuccess: () => {
      setIsSuccessOpen(true);
      refetch();
    },
    onError: (err) => {
      toast.add({
        title: "Gagal mengirim laporan",
        description: err.message || "Silakan coba beberapa saat lagi.",
        type: "error",
      });
    },
  });

  const hintIsDocument = searchParams.get("type") === "dokumen";

  const backToken = searchParams.get("back");
  const backPayload = callbackSDK.decode(backToken);
  const backHref = backPayload ? callbackSDK.toUrl(backToken) : null;
  const backLabel =
    backPayload?.path === "/riwayat" ? "Kembali ke Riwayat" : "Kembali";

  if (isLoading) {
    return <ResultPageSkeleton />;
  }

  if (isError || !data || data.deletedAt) {
    const isNotFound = !isError && (!data || Boolean(data.deletedAt));
    const fallbackHref =
      backHref ?? (hintIsDocument ? "/deteksi-dokumen" : "/deteksi-pesan");

    return (
      <ResultErrorState
        isNotFound={isNotFound}
        errorMessage={error?.message}
        backLabel={backLabel}
        onBack={() => router.push(fallbackHref)}
        onRetry={() => refetch()}
        isRetrying={isRefetching}
      />
    );
  }

  const isDocument =
    Boolean(data.document) ||
    data.inputSource.toUpperCase().includes("DOCUMENT");

  const rawPercent =
    data.confidenceScore <= 1
      ? Math.round(data.confidenceScore * 100)
      : Math.round(data.confidenceScore);

  const normalizedLabel = data.predictionLabel.trim().toUpperCase();
  const isSafeVerdict =
    normalizedLabel.includes("NORMAL") ||
    normalizedLabel.includes("SAFE") ||
    normalizedLabel.includes("AMAN") ||
    normalizedLabel.includes("LEGIT");

  const confidencePercent = isSafeVerdict ? 100 - rawPercent : rawPercent;

  const contentText =
    (data.content ?? data.document?.extractedText)?.trim() ?? "";

  const handleSubmitReport = async (values: ReportFormValues) => {
    const formData = new FormData();
    formData.append("content", values.content);
    formData.append("platform", values.platform);
    formData.append("suspectedModus", values.suspectedModus);

    if (values.chronology) formData.append("chronology", values.chronology);
    if (values.checkId) formData.append("checkId", values.checkId);
    if (values.documentId) formData.append("documentId", values.documentId);
    if (values.evidenceFile) {
      formData.append("evidenceFile", values.evidenceFile);
    }

    await reportMutation.mutateAsync(formData);
  };

  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6 sm:py-14">
      {/* Editorial Header */}
      <header className="space-y-3">
        {backHref && (
          <div>
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 font-medium text-muted-foreground text-xs transition-colors hover:text-foreground"
            >
              <LuArrowLeft className="h-3.5 w-3.5" />
              {backLabel}
            </Link>
          </div>
        )}

        <div className="space-y-1.5">
          <h1 className="font-bold text-2xl tracking-tight sm:text-3xl">
            Hasil Pemeriksaan {isDocument ? "Dokumen" : "Pesan"}
          </h1>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground text-xs">
            <span className="font-mono">#{data.id.slice(0, 8)}</span>
            <span>·</span>
            <span>{formatDate(data.createdAt)}</span>
            {data.latencyMs !== null && (
              <>
                <span>·</span>
                <span className="tabular-nums">
                  {(data.latencyMs / 1000).toFixed(2)} dtk
                </span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Verdict Summary Card */}
      <VerdictSummaryCard
        predictionLabel={data.predictionLabel}
        confidencePercent={confidencePercent}
      />

      {/* Lampiran Dokumen */}
      {isDocument && data.document && (
        <DocumentAttachmentCard
          fileName={data.document.fileName}
          fileSize={data.document.fileSize}
          pageCount={data.document.pageCount}
          extractionMethod={data.document.extractionMethod}
          extractionStatus={data.document.extractionStatus}
        />
      )}

      {/* Konten yang Diperiksa */}
      <section className="space-y-2.5">
        <h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
          {isDocument ? "Teks Hasil Ekstraksi" : "Isi Pesan yang Diperiksa"}
        </h3>
        {contentText ? (
          <AnalyzedTextViewer text={contentText} isDocument={isDocument} />
        ) : (
          <div className="flex items-start gap-3 rounded-xl border border-dashed bg-muted/20 px-4 py-3.5 text-muted-foreground text-sm">
            <LuEyeOff className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="leading-relaxed">
              Konten teks tidak tersedia untuk pemeriksaan ini.
            </p>
          </div>
        )}
      </section>

      {/* Indikator & Saran Tindakan */}
      <section className="grid grid-cols-1 gap-6 border-t pt-6 sm:grid-cols-2">
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Indikasi Pola</h3>
          {data.indicators.length > 0 ? (
            <ul className="space-y-2 text-muted-foreground text-sm">
              {data.indicators.map((item) => (
                <li
                  key={`${item}-${item.charAt(1)}`}
                  className="flex items-start gap-2.5"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/50" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm leading-relaxed">
              Tidak ditemukan indikator penipuan atau rekayasa sosial pada teks
              ini.
            </p>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Rekomendasi</h3>
          <p className="whitespace-pre-line text-muted-foreground text-sm leading-relaxed">
            {data.recommendation ||
              "Tetap waspada dan pastikan keaslian pengirim melalui saluran resmi sebelum membagikan data sensitif."}
          </p>
        </div>
      </section>

      {/* Footer Actions */}
      <footer className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Button
          onClick={() =>
            router.push(isDocument ? "/deteksi-dokumen" : "/deteksi-pesan")
          }
          className="gap-2"
        >
          <LuRotateCcw className="h-4 w-4" />
          Periksa {isDocument ? "Dokumen" : "Pesan"} Lain
        </Button>

        {data.report ? (
          <div className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3.5 font-medium text-amber-700 text-xs dark:text-amber-400">
            <LuClock className="h-3.5 w-3.5 shrink-0" />
            <span>Sudah Dilaporkan · {data.report.status}</span>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={() => setIsReportOpen(true)}
            className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LuFlag className="h-4 w-4" />
            Laporkan {isDocument ? "Dokumen" : "Pesan"} Ini
          </Button>
        )}
      </footer>

      {/* Modals / Drawers */}
      <ReportDialog
        open={isReportOpen}
        onOpenChange={setIsReportOpen}
        isDocument={isDocument}
        contentText={contentText}
        documentFileName={data.document?.fileName}
        checkId={data.id}
        documentId={data.document?.id}
        isSubmitting={reportMutation.isPending}
        onSubmitReport={handleSubmitReport}
      />

      <ReportSuccessDialog
        open={isSuccessOpen}
        onOpenChange={setIsSuccessOpen}
        reportId={reportMutation.data?.id ?? data.report?.id}
      />
    </div>
  );
}
