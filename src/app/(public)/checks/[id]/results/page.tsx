"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  LuCheck,
  LuCircleAlert,
  LuCircleCheck,
  LuClock,
  LuEyeOff,
  LuFileText,
  LuFlag,
  LuImagePlus,
  LuRefreshCw,
  LuRotateCcw,
  LuShieldCheck,
  LuTriangleAlert,
} from "react-icons/lu";
import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTRPC } from "@/trpc/client";
import { AnalyzedTextViewer } from "@/components/analyzed-text-viewer";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}
function getVerdictConfig(label: string) {
  const normalized = label.trim().toUpperCase();

  if (normalized.includes("NORMAL") || normalized.includes("SAFE") || normalized.includes("AMAN") || normalized.includes("LEGIT")) {
    return {
      badge: "Aman / Normal",
      headline: "Tidak Ditemukan Indikasi Penipuan",
      summary: "Konten ini memiliki pola komunikasi wajar dan tidak mengarah pada modus penipuan umum.",
      accentBorder: "border-l-emerald-600",
      badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
      barClass: "bg-emerald-600",
      iconClass: "text-emerald-600 dark:text-emerald-400",
      Icon: LuShieldCheck,
    };
  }

  if (normalized.includes("SUSPICIOUS") || normalized.includes("MENCURIGAKAN") || normalized.includes("WASPADA")) {
    return {
      badge: "Perlu Kewaspadaan",
      headline: "Ditemukan Beberapa Pola Mencurigakan",
      summary: "Terdapat elemen yang patut diverifikasi ulang sebelum Anda merespons atau mengklik tautan.",
      accentBorder: "border-l-amber-500",
      badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
      barClass: "bg-amber-500",
      iconClass: "text-amber-600 dark:text-amber-400",
      Icon: LuTriangleAlert,
    };
  }

  return {
    badge: label.replace(/_/g, " "),
    headline: "Terindikasi Penipuan",
    summary: "Konten ini mengandung pola rekayasa sosial atau ciri penipuan berisiko tinggi.",
    accentBorder: "border-l-red-600",
    badgeClass: "bg-red-500/10 text-red-700 dark:text-red-400",
    barClass: "bg-red-600",
    iconClass: "text-red-600 dark:text-red-400",
    Icon: LuCircleAlert,
  };
}

function ResultPageSkeleton() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 space-y-8">
      <div className="space-y-3">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="h-4 w-48 animate-pulse rounded bg-muted" />
      </div>

      <div className="rounded-xl border p-6 space-y-4">
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

  const hintIsDocument = searchParams.get("type") === "dokumen";

  if (isLoading) {
    return <ResultPageSkeleton />;
  }

  if (isError || !data || data.deletedAt) {
    const isNotFound = !isError && (!data || Boolean(data.deletedAt));

    return (
      <div className="container mx-auto max-w-md px-4 py-24 text-center space-y-5">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <LuCircleAlert className="h-5 w-5" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-lg font-semibold tracking-tight">{isNotFound ? "Hasil Pemeriksaan Tidak Ditemukan" : "Gagal Memuat Data"}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {isNotFound
              ? "Data pemeriksaan mungkin sudah dihapus atau tautan tidak valid."
              : error?.message || "Terjadi kendala saat menghubungkan ke server."}
          </p>
        </div>
        <div className="flex items-center justify-center gap-2.5 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(hintIsDocument ? "/deteksi-dokumen" : "/deteksi-pesan")}
          >
            Kembali
          </Button>
          {!isNotFound && (
            <Button
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching}
              className="gap-1.5"
            >
              <LuRefreshCw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`} />
              Muat Ulang
            </Button>
          )}
        </div>
      </div>
    );
  }

  const isDocument = Boolean(data.document) || data.inputSource.toUpperCase().includes("DOCUMENT");
  const confidencePercent = data.confidenceScore <= 1 ? Math.round(data.confidenceScore * 100) : Math.round(data.confidenceScore);
  const verdict = getVerdictConfig(data.predictionLabel);
  const VerdictIcon = verdict.Icon;

  // Ambil teks dari pesan (data.content) atau hasil OCR dokumen (data.document?.extractedText)
  const extractedDocText = data.document && "extractedText" in data.document ? (data.document.extractedText as string | null) : null;
  const contentText = (data.content ?? extractedDocText)?.trim() ?? "";

  const handleBackToCheck = () => {
    router.push(isDocument ? "/deteksi-dokumen" : "/deteksi-pesan");
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    setIsReportOpen(false);
    setIsSuccessOpen(true);
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 space-y-8">
      {/* Editorial Header */}
      <header className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Hasil Pemeriksaan {isDocument ? "Dokumen" : "Pesan"}</h1>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span className="font-mono">#{data.id.slice(0, 8)}</span>
          <span>·</span>
          <span>{formatDate(data.createdAt)}</span>
          {data.latencyMs !== null && (
            <>
              <span>·</span>
              <span className="tabular-nums">{(data.latencyMs / 1000).toFixed(2)} dtk</span>
            </>
          )}
        </div>
      </header>

      {/* Verdict Summary Card */}
      <section className={`rounded-xl border border-l-4 ${verdict.accentBorder} bg-card p-5 sm:p-6`}>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2">
              <VerdictIcon className={`h-4 w-4 ${verdict.iconClass}`} />
              <span className={`text-xs font-semibold uppercase tracking-wider ${verdict.iconClass}`}>{verdict.badge}</span>
            </div>
            <h2 className="text-lg font-semibold tracking-tight sm:text-xl">{verdict.headline}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{verdict.summary}</p>
          </div>

          {/* Confidence Meter */}
          <div className="shrink-0 sm:w-40 sm:text-right space-y-1.5 border-t pt-4 sm:border-t-0 sm:pt-0">
            <div className="flex items-baseline justify-between sm:justify-end sm:gap-2">
              <span className="text-xs text-muted-foreground">Keyakinan</span>
              <span className="text-2xl font-bold tracking-tight tabular-nums">{confidencePercent}%</span>
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

      {/* Lampiran Dokumen (jika tipe dokumen) */}
      {isDocument && data.document && (
        <section className="flex flex-col gap-3 rounded-xl border bg-card px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
              <LuFileText className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{data.document.fileName}</p>
              <p className="text-xs text-muted-foreground tabular-nums">
                {formatFileSize(data.document.fileSize)}
                {data.document.pageCount ? ` · ${data.document.pageCount} halaman` : ""}
                {data.document.extractionMethod ? ` · ${data.document.extractionMethod}` : ""}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground shrink-0">
            <LuCheck className="h-3.5 w-3.5 text-emerald-600" />
            Ekstraksi {data.document.extractionStatus}
          </span>
        </section>
      )}

      {/* Konten yang Diperiksa */}
      <section className="space-y-2.5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {isDocument ? "Teks Hasil Ekstraksi" : "Isi Pesan yang Diperiksa"}
        </h3>
        {contentText ? (
          <AnalyzedTextViewer
            text={contentText}
            isDocument={isDocument}
          />
        ) : (
          <div className="flex items-start gap-3 rounded-xl border border-dashed bg-muted/20 px-4 py-3.5 text-sm text-muted-foreground">
            <LuEyeOff className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="leading-relaxed">
              {isDocument && data.document?.isPurged
                ? "Teks hasil ekstraksi dokumen telah dihapus otomatis dari server sesuai pengaturan privasi Anda (opsi penyimpanan untuk pelaporan tidak diaktifkan)."
                : "Konten teks tidak disimpan di server."}
            </p>
          </div>
        )}
      </section>

      {/* Indikator & Saran Tindakan */}
      <section className="grid grid-cols-1 gap-6 border-t pt-6 sm:grid-cols-2">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Indikasi Pola</h3>
          {data.indicators.length > 0 ? (
            <ul className="space-y-2 text-sm text-muted-foreground">
              {data.indicators.map((item, idx) => (
                <li
                  key={`${item}-${idx}`}
                  className="flex items-start gap-2.5"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/50" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground leading-relaxed">Tidak ditemukan indikator penipuan atau rekayasa sosial pada teks ini.</p>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Rekomendasi</h3>
          <p className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed">
            {data.recommendation || "Tetap waspada dan pastikan keaslian pengirim melalui saluran resmi sebelum membagikan data sensitif."}
          </p>
        </div>
      </section>

      {/* Footer Actions */}
      <footer className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="outline"
          onClick={handleBackToCheck}
          className="gap-2"
        >
          <LuRotateCcw className="h-4 w-4" />
          Periksa {isDocument ? "Dokumen" : "Pesan"} Lain
        </Button>

        {data.report ? (
          <Button
            variant="secondary"
            disabled
            className="gap-2"
          >
            <LuClock className="h-4 w-4" />
            Sudah Dilaporkan ({data.report.status})
          </Button>
        ) : (
          <Button
            variant="secondary"
            onClick={() => setIsReportOpen(true)}
            className="gap-2"
          >
            <LuFlag className="h-4 w-4" />
            Laporkan {isDocument ? "Dokumen" : "Pesan"} Ini
          </Button>
        )}
      </footer>

      {/* MODAL PELAPORAN */}
      <Dialog
        open={isReportOpen}
        onOpenChange={setIsReportOpen}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Laporkan {isDocument ? "Dokumen" : "Pesan"}</DialogTitle>
            <DialogDescription className="text-xs">Bantu tingkatkan akurasi deteksi dengan melaporkan konten mencurigakan ini.</DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmitReport}
            className="space-y-4 pt-2"
          >
            {contentText ? (
              <div className="space-y-1.5">
                <Label className="text-xs">Konten Terlampir</Label>
                <Textarea
                  value={contentText}
                  readOnly
                  className="min-h-[84px] resize-none bg-muted/50 text-xs text-muted-foreground"
                />
              </div>
            ) : (
              isDocument &&
              data.document?.isPurged && (
                <p className="rounded-lg border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                  Teks dokumen tidak tersimpan di server. Anda tetap dapat mengirim laporan dengan mengisi kronologi di bawah.
                </p>
              )
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Platform Pengirim <span className="text-destructive">*</span>
                </Label>
                <Select defaultValue="whatsapp">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="telegram">Telegram</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">
                  Kategori Dugaan <span className="text-destructive">*</span>
                </Label>
                <Select defaultValue="kategori-ai">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kategori-ai">Klaim Hadiah / Undian</SelectItem>
                    <SelectItem value="phishing">Phishing / Tautan Palsu</SelectItem>
                    <SelectItem value="impersonation">Penyamaran Instansi / Kerabat</SelectItem>
                    <SelectItem value="investasi">Investasi / Tagihan Fiktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="report-chronology"
                className="text-xs"
              >
                Kronologi Singkat <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="report-chronology"
                required
                placeholder="Ceritakan secara singkat bagaimana Anda menerima pesan/dokumen ini..."
                className="min-h-[84px] resize-none text-sm"
              />
            </div>

            <div className="flex flex-col-reverse gap-2.5 pt-2 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
              >
                <LuImagePlus className="h-4 w-4" />
                Bukti Tambahan
              </Button>
              <Button
                type="submit"
                size="sm"
              >
                Kirim Laporan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL SUKSES */}
      <Dialog
        open={isSuccessOpen}
        onOpenChange={setIsSuccessOpen}
      >
        <DialogContent className="sm:max-w-sm text-center">
          <DialogHeader className="items-center space-y-2.5 pt-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              <LuCircleCheck className="h-6 w-6" />
            </div>
            <DialogTitle className="text-lg font-bold">Laporan Terkirim</DialogTitle>
            <Badge
              variant="secondary"
              className="text-xs font-medium"
            >
              Menunggu Verifikasi
            </Badge>
            <DialogDescription className="text-sm text-muted-foreground pt-1">
              Terima kasih, laporan Anda telah masuk dan akan segera ditinjau oleh tim kami.
            </DialogDescription>
          </DialogHeader>

          <div className="pt-3 pb-1 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              className="min-w-[110px]"
              onClick={() => setIsSuccessOpen(false)}
            >
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
