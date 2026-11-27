import { LuCircleAlert, LuRefreshCw } from "react-icons/lu";
import { Button } from "@/components/ui/button";

export function ResultPageSkeleton() {
  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6 sm:py-14">
      <div className="space-y-3">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="h-4 w-48 animate-pulse rounded bg-muted" />
      </div>

      <div className="space-y-4 rounded-xl border p-6">
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        <div className="h-7 w-72 animate-pulse rounded bg-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
      </div>

      <div className="space-y-3">
        <div className="h-4 w-40 animate-pulse rounded bg-muted" />
        <div className="h-28 w-full animate-pulse rounded-xl bg-muted" />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="h-36 animate-pulse rounded-xl bg-muted" />
        <div className="h-36 animate-pulse rounded-xl bg-muted" />
      </div>
    </div>
  );
}

interface ResultErrorStateProps {
  isNotFound: boolean;
  errorMessage?: string;
  backLabel: string;
  onBack: () => void;
  onRetry: () => void;
  isRetrying: boolean;
}

export function ResultErrorState({
  isNotFound,
  errorMessage,
  backLabel,
  onBack,
  onRetry,
  isRetrying,
}: ResultErrorStateProps) {
  return (
    <div className="container mx-auto max-w-md space-y-5 px-4 py-24 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <LuCircleAlert className="h-5 w-5" />
      </div>
      <div className="space-y-1.5">
        <h1 className="font-semibold text-lg tracking-tight">
          {isNotFound
            ? "Hasil Pemeriksaan Tidak Ditemukan"
            : "Gagal Memuat Data"}
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {isNotFound
            ? "Data pemeriksaan mungkin sudah dihapus atau tautan tidak valid."
            : errorMessage || "Terjadi kendala saat menghubungkan ke server."}
        </p>
      </div>
      <div className="flex items-center justify-center gap-2.5 pt-2">
        <Button variant="outline" size="sm" onClick={onBack}>
          {backLabel}
        </Button>
        {!isNotFound && (
          <Button
            size="sm"
            onClick={onRetry}
            disabled={isRetrying}
            className="gap-1.5"
          >
            <LuRefreshCw
              className={`h-3.5 w-3.5 ${isRetrying ? "animate-spin" : ""}`}
            />
            Muat Ulang
          </Button>
        )}
      </div>
    </div>
  );
}
