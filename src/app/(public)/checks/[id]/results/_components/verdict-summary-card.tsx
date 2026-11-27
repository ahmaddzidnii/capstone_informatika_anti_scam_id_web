import { LuCheck, LuFileText } from "react-icons/lu";
import { formatFileSize } from "@/components/file-dropzone";
import { getVerdictConfig } from "./result-utils";

interface VerdictSummaryCardProps {
  predictionLabel: string;
  confidencePercent: number;
}

export function VerdictSummaryCard({
  predictionLabel,
  confidencePercent,
}: VerdictSummaryCardProps) {
  const verdict = getVerdictConfig(predictionLabel);
  const VerdictIcon = verdict.Icon;

  return (
    <section
      className={`rounded-xl border border-l-4 ${verdict.accentBorder} bg-card p-5 sm:p-6`}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xl space-y-2">
          <div className="inline-flex items-center gap-2">
            <VerdictIcon className={`h-4 w-4 ${verdict.iconClass}`} />
            <span
              className={`font-semibold text-xs uppercase tracking-wider ${verdict.iconClass}`}
            >
              {verdict.badge}
            </span>
          </div>
          <h2 className="font-semibold text-lg tracking-tight sm:text-xl">
            {verdict.headline}
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {verdict.summary}
          </p>
        </div>

        {/* Confidence Meter */}
        <div className="shrink-0 space-y-1.5 border-t pt-4 sm:w-40 sm:border-t-0 sm:pt-0 sm:text-right">
          <div className="flex items-baseline justify-between sm:justify-end sm:gap-2">
            <span className="text-muted-foreground text-xs">Keyakinan</span>
            <span className="font-bold text-2xl tabular-nums tracking-tight">
              {confidencePercent}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={`h-full rounded-full transition-all ${verdict.barClass}`}
              style={{ width: `${confidencePercent}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

interface DocumentAttachmentCardProps {
  fileName: string;
  fileSize: number;
  pageCount?: number | null;
  extractionMethod?: string | null;
  extractionStatus: string;
}

export function DocumentAttachmentCard({
  fileName,
  fileSize,
  pageCount,
  extractionMethod,
  extractionStatus,
}: DocumentAttachmentCardProps) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border bg-card px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
          <LuFileText className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium text-sm">{fileName}</p>
          <p className="text-muted-foreground text-xs tabular-nums">
            {formatFileSize(fileSize)}
            {pageCount ? ` · ${pageCount} halaman` : ""}
            {extractionMethod ? ` · ${extractionMethod}` : ""}
          </p>
        </div>
      </div>
      <span className="inline-flex shrink-0 items-center gap-1.5 font-medium text-muted-foreground text-xs">
        <LuCheck className="h-3.5 w-3.5 text-emerald-600" />
        Ekstraksi {extractionStatus}
      </span>
    </section>
  );
}
