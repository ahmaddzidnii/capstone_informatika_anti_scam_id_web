"use client";

import { useState } from "react";

import { FileDropzone } from "@/components/file-dropzone";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/responsive-dialog";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const MAX_EVIDENCE_BYTES = 5 * 1024 * 1024;
const ALLOWED_EVIDENCE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const PLATFORM_OPTIONS = [
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "SMS", label: "SMS" },
  { value: "TELEGRAM", label: "Telegram" },
  { value: "EMAIL", label: "Email" },
  { value: "OTHER", label: "Lainnya" },
] as const;

const SCAM_MODUS_OPTIONS = [
  { value: "FAKE_PRIZE", label: "Klaim Hadiah / Undian" },
  { value: "OTP_PHISHING", label: "Phishing / Tautan Palsu / OTP" },
  { value: "BANK_IMPERSONATION", label: "Penyamaran Bank / Instansi" },
  { value: "INVESTMENT", label: "Investasi / Tagihan Fiktif" },
  { value: "JOB_SCAM", label: "Lowongan Kerja Palsu" },
  { value: "TRANSFER_REQUEST", label: "Permintaan Transfer / Pinjam Dana" },
  { value: "OTHER", label: "Lainnya" },
] as const;

export type PlatformValue = (typeof PLATFORM_OPTIONS)[number]["value"];
export type ScamModusValue = (typeof SCAM_MODUS_OPTIONS)[number]["value"];

export interface ReportFormValues {
  content: string;
  platform: PlatformValue;
  suspectedModus: ScamModusValue;
  chronology?: string;
  checkId?: string;
  documentId?: string;
  evidenceFile: File | null;
}

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isDocument: boolean;
  contentText: string;
  documentFileName?: string;
  checkId?: string;
  documentId?: string;
  isSubmitting?: boolean;
  onSubmitReport: (values: ReportFormValues) => Promise<void>;
}

export function ReportDialog({
  open,
  onOpenChange,
  isDocument,
  contentText,
  documentFileName,
  checkId,
  documentId,
  isSubmitting = false,
  onSubmitReport,
}: ReportDialogProps) {
  const [platform, setPlatform] = useState<PlatformValue>("WHATSAPP");
  const [suspectedModus, setSuspectedModus] = useState<ScamModusValue>("OTHER");
  const [chronology, setChronology] = useState("");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidenceError, setEvidenceError] = useState<string | null>(null);

  const handleEvidenceChange = (file: File | null) => {
    if (!file) {
      setEvidenceFile(null);
      setEvidenceError(null);
      return;
    }

    if (!ALLOWED_EVIDENCE_TYPES.includes(file.type)) {
      setEvidenceError("Format bukti harus JPG, PNG, WebP, atau PDF.");
      return;
    }

    if (file.size > MAX_EVIDENCE_BYTES) {
      setEvidenceError("Ukuran file bukti maksimal 5 MB.");
      return;
    }

    setEvidenceError(null);
    setEvidenceFile(file);
  };

  const resetForm = () => {
    setPlatform("WHATSAPP");
    setSuspectedModus("OTHER");
    setChronology("");
    setEvidenceFile(null);
    setEvidenceError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (evidenceError || isSubmitting) return;

    const resolvedContent =
      contentText.trim().length >= 5
        ? contentText.trim().slice(0, 5000)
        : `[Dokumen Terlampir: ${documentFileName ?? "Tanpa teks ekstraksi"}]`;

    await onSubmitReport({
      content: resolvedContent,
      platform,
      suspectedModus,
      chronology: chronology.trim() || undefined,
      checkId,
      documentId,
      evidenceFile,
    });

    resetForm();
    onOpenChange(false);
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="sm:max-w-lg">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle className="font-bold text-lg">
            Laporkan {isDocument ? "Dokumen" : "Pesan"}
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription className="text-xs">
            Bantu tingkatkan akurasi deteksi dengan melaporkan konten
            mencurigakan ini.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <form
          onSubmit={handleSubmit}
          className="max-h-[75dvh] space-y-4 overflow-y-auto pt-2 pr-1 min-[818px]:max-h-[80dvh]"
        >
          {contentText && (
            <div className="space-y-1.5">
              <Label className="text-xs">Konten Terlampir</Label>
              <Textarea
                value={contentText}
                readOnly
                className="field-sizing-fixed max-h-32 min-h-[84px] resize-none overflow-y-auto bg-muted/50 text-muted-foreground text-xs"
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">
                Platform Pengirim <span className="text-destructive">*</span>
              </Label>
              <Select
                items={PLATFORM_OPTIONS}
                value={platform}
                disabled={isSubmitting}
                onValueChange={(val) => val && setPlatform(val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih platform" />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORM_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">
                Kategori Dugaan <span className="text-destructive">*</span>
              </Label>
              <Select
                items={SCAM_MODUS_OPTIONS}
                value={suspectedModus}
                disabled={isSubmitting}
                onValueChange={(val) => val && setSuspectedModus(val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {SCAM_MODUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="report-chronology" className="text-xs">
              Kronologi Singkat <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="report-chronology"
              required
              maxLength={2000}
              disabled={isSubmitting}
              value={chronology}
              onChange={(e) => setChronology(e.target.value)}
              placeholder="Ceritakan secara singkat bagaimana Anda menerima pesan/dokumen ini..."
              className="field-sizing-fixed max-h-36 min-h-[84px] resize-none overflow-y-auto text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="report-evidence" className="text-xs">
              Lampirkan Bukti{" "}
              <span className="text-muted-foreground">(Opsional)</span>
            </Label>
            <FileDropzone
              id="report-evidence"
              variant="compact"
              disabled={isSubmitting}
              value={evidenceFile}
              onChange={handleEvidenceChange}
              isInvalid={Boolean(evidenceError)}
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              title="Unggah tangkapan layar atau bukti pendukung"
              description="JPG, PNG, WebP, atau PDF (Maks. 5 MB)"
            />
            {evidenceError && (
              <p className="text-destructive text-xs">{evidenceError}</p>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="w-full min-[818px]:w-auto"
            >
              {isSubmitting ? "Mengirim..." : "Kirim Laporan"}
            </Button>
          </div>
        </form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

interface ReportSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId?: string;
}

export function ReportSuccessDialog({
  open,
  onOpenChange,
  reportId,
}: ReportSuccessDialogProps) {
  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        <style>{`
          @keyframes pg-ring {
            0% { stroke-dashoffset: 151; }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes pg-tick {
            0% { stroke-dashoffset: 36; }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes pg-badge-pop {
            0% { transform: scale(0.6); opacity: 0; }
            65% { transform: scale(1.08); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes pg-ripple {
            0% { transform: scale(0.85); opacity: 0.5; }
            100% { transform: scale(1.75); opacity: 0; }
          }
          @keyframes pg-dot-1 {
            0% { transform: translate(0, 0) scale(0); opacity: 1; }
            100% { transform: translate(-26px, -22px) scale(1); opacity: 0; }
          }
          @keyframes pg-dot-2 {
            0% { transform: translate(0, 0) scale(0); opacity: 1; }
            100% { transform: translate(28px, -20px) scale(1); opacity: 0; }
          }
          @keyframes pg-dot-3 {
            0% { transform: translate(0, 0) scale(0); opacity: 1; }
            100% { transform: translate(-28px, 18px) scale(1); opacity: 0; }
          }
          @keyframes pg-dot-4 {
            0% { transform: translate(0, 0) scale(0); opacity: 1; }
            100% { transform: translate(26px, 20px) scale(1); opacity: 0; }
          }
          @keyframes pg-rise {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        <div className="mx-auto flex w-full max-w-[650px] flex-col items-center px-2 pt-4 pb-2 text-center sm:pt-6 sm:pb-3">
          {/* Animated Checkmark + Burst Dots */}
          <div className="relative mb-4 flex h-20 w-20 items-center justify-center sm:mb-5 sm:h-24 sm:w-24">
            <span
              className="absolute inset-2 rounded-full bg-emerald-500/20"
              style={{
                animation:
                  "pg-ripple 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards",
              }}
            />

            <span
              className="absolute h-1.5 w-1.5 rounded-full bg-emerald-500"
              style={{
                animation: "pg-dot-1 0.65s ease-out 0.35s forwards",
                opacity: 0,
              }}
            />
            <span
              className="absolute h-2 w-2 rounded-full bg-emerald-400"
              style={{
                animation: "pg-dot-2 0.65s ease-out 0.38s forwards",
                opacity: 0,
              }}
            />
            <span
              className="absolute h-1.5 w-1.5 rounded-full bg-teal-500"
              style={{
                animation: "pg-dot-3 0.65s ease-out 0.4s forwards",
                opacity: 0,
              }}
            />
            <span
              className="absolute h-1.5 w-1.5 rounded-full bg-emerald-500"
              style={{
                animation: "pg-dot-4 0.65s ease-out 0.36s forwards",
                opacity: 0,
              }}
            />

            <div
              className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/12 shadow-xs sm:h-[76px] sm:w-[76px]"
              style={{
                animation:
                  "pg-badge-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
              }}
            >
              <svg
                viewBox="0 0 52 52"
                className="h-12 w-12 overflow-visible sm:h-14 sm:w-14"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="26"
                  cy="26"
                  r="24"
                  className="stroke-emerald-600 dark:stroke-emerald-400"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeDasharray="151"
                  strokeDashoffset="151"
                  style={{
                    transform: "rotate(-90deg)",
                    transformOrigin: "26px 26px",
                    animation:
                      "pg-ring 0.45s cubic-bezier(0.65, 0, 0.35, 1) 0.05s forwards",
                  }}
                />
                <path
                  d="M16 26.5L22.8 33.2L36.5 19.5"
                  className="stroke-emerald-600 dark:stroke-emerald-400"
                  strokeWidth="3.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="36"
                  strokeDashoffset="36"
                  style={{
                    animation:
                      "pg-tick 0.32s cubic-bezier(0.65, 0, 0.35, 1) 0.38s forwards",
                  }}
                />
              </svg>
            </div>
          </div>

          <ResponsiveDialogHeader
            className="items-center space-y-1.5 text-center!"
            style={{
              opacity: 0,
              animation: "pg-rise 0.38s ease-out 0.28s forwards",
            }}
          >
            <ResponsiveDialogTitle className="font-bold text-lg tracking-tight sm:text-xl">
              Laporan Terkirim
            </ResponsiveDialogTitle>
            <ResponsiveDialogDescription className="max-w-[320px] text-center text-xs leading-relaxed sm:text-sm">
              Terima kasih, laporan Anda telah tercatat dan masuk ke antrean
              moderasi tim kami.
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>

          {/* Compact Receipt Card */}
          <div
            className="mt-6 w-full divide-y rounded-xl border bg-muted/35 px-5 text-sm"
            style={{
              opacity: 0,
              animation: "pg-rise 0.38s ease-out 0.4s forwards",
            }}
          >
            {reportId && (
              <div className="flex items-center justify-between gap-3 py-3">
                <span className="text-muted-foreground">No. Referensi</span>
                <span className="truncate font-mono font-semibold text-foreground">
                  #{reportId.slice(0, 8).toUpperCase()}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 py-3">
              <span className="shrink-0 text-muted-foreground">Status</span>
              <span className="inline-flex items-center gap-1.5 text-right font-medium text-amber-700 dark:text-amber-400">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                Menunggu Verifikasi
              </span>
            </div>
          </div>

          <div
            className="mt-5 w-full sm:mt-6"
            style={{
              opacity: 0,
              animation: "pg-rise 0.38s ease-out 0.5s forwards",
            }}
          >
            <Button
              size="lg"
              className="w-full"
              onClick={() => onOpenChange(false)}
            >
              Selesai
            </Button>
          </div>
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
