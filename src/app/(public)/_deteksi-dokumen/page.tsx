"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LuCheck, LuLoaderCircle, LuShieldAlert } from "react-icons/lu";
import * as z from "zod";
import { FileDropzone } from "@/components/file-dropzone";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { useTRPC } from "@/trpc/client";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;
const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"];

const documentFormSchema = z.object({
  file: z
    .custom<File | null>((val) => val instanceof File, {
      message: "Silakan pilih dokumen atau gambar terlebih dahulu.",
    })
    .superRefine((file, ctx) => {
      if (!(file instanceof File)) return;

      if (file.size === 0) {
        ctx.addIssue({
          code: "custom",
          message: "File kosong atau rusak. Silakan pilih file lain.",
        });
        return;
      }

      const fileName = file.name.toLowerCase();
      const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) =>
        fileName.endsWith(ext),
      );
      const hasValidMime = ALLOWED_MIME_TYPES.includes(
        file.type as (typeof ALLOWED_MIME_TYPES)[number],
      );

      if (!hasValidMime && !hasValidExtension) {
        ctx.addIssue({
          code: "custom",
          message: "Format tidak didukung. Gunakan file PDF, JPG, atau PNG.",
        });
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        ctx.addIssue({
          code: "custom",
          message: `Ukuran file terlalu besar (maksimal ${MAX_FILE_SIZE_MB} MB).`,
        });
      }
    }),
  consentAccepted: z.boolean().refine((val) => val === true, {
    message: "Persetujuan pemrosesan dokumen wajib dicentang.",
  }),
  keepForReport: z.boolean(),
});

const DOCUMENT_ANALYSIS_STEPS = [
  { threshold: 0, label: "Memvalidasi struktur & metadata berkas..." },
  { threshold: 30, label: "Mengekstrak teks & elemen visual (OCR)..." },
  { threshold: 65, label: "Mendeteksi pola pemalsuan & rekayasa sosial..." },
  { threshold: 88, label: "Menyusun skor risiko & kesimpulan..." },
];

export default function DeteksiDokumenPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  const trpc = useTRPC();

  const mutation = useMutation({
    ...trpc.document.screenDocument.mutationOptions(),
  });

  const form = useForm({
    defaultValues: {
      file: null as File | null,
      consentAccepted: false,
      keepForReport: false,
    },
    validators: {
      onSubmit: documentFormSchema,
    },
    onSubmit: async ({ value }) => {
      if (!value.file) return;

      const formData = new FormData();
      formData.append("file", value.file);
      formData.append("consentAccepted", String(value.consentAccepted));
      formData.append("keepForReport", String(value.keepForReport));

      mutation.mutate(formData, {
        onSuccess: (data) => {
          router.push(`/checks/${data.id}/results`);
        },
        onError: (error) => {
          toast.add({
            title: "Terjadi kesalahan saat memproses dokumen",
            description: error.message || "Silakan coba beberapa saat lagi.",
            type: "error",
          });
        },
      });
    },
  });

  useEffect(() => {
    if (!mutation.isPending) {
      setProgress(0);
      return;
    }

    setProgress(10);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95;
        const remaining = 95 - prev;
        const step = Math.max(
          1,
          Math.round(remaining * (Math.random() * 0.16 + 0.06)),
        );
        return Math.min(95, prev + step);
      });
    }, 450);

    return () => clearInterval(interval);
  }, [mutation.isPending]);

  const currentStep =
    [...DOCUMENT_ANALYSIS_STEPS]
      .reverse()
      .find((s) => progress >= s.threshold) ?? DOCUMENT_ANALYSIS_STEPS[0];

  return (
    <div className="container mx-auto max-w-2xl space-y-6 px-4 py-12 sm:px-6 sm:py-16">
      <div className="space-y-2 text-center">
        <h1 className="font-bold text-2xl tracking-tight sm:text-3xl">
          Deteksi Dokumen Mencurigakan
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Unggah dokumen atau gambar untuk mendeteksi potensi penipuan
        </p>
      </div>

      {/* Peringatan Privasi */}
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 sm:p-5">
        <div className="flex items-start gap-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <LuShieldAlert className="h-5 w-5" />
          </div>

          <div className="space-y-2.5">
            <div className="space-y-1">
              <h2 className="font-bold text-foreground text-sm tracking-tight">
                Sensor Data Sensitif Sebelum Mengunggah
              </h2>
              <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
                Pastikan Anda telah menutupi informasi pribadi berikut sebelum
                memulai ekstraksi teks:
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                "NIK / KTP",
                "Nomor Rekening",
                "Kode OTP",
                "Alamat Lengkap",
              ].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center rounded-md border border-primary/20 bg-background px-2.5 py-0.5 font-medium text-foreground text-xs"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Form Upload & Persetujuan */}
      <form
        id="analyze-document-form"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="space-y-5"
      >
        <FieldGroup className="space-y-4">
          {/* Field 1: File Dropzone */}
          <form.Field
            name="file"
            validators={{
              onChange: documentFormSchema.shape.file,
            }}
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FileDropzone
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(file) => field.handleChange(file)}
                    onBlur={field.handleBlur}
                    disabled={mutation.isPending}
                    isInvalid={isInvalid}
                    accept=".pdf,.jpg,.jpeg,.png"
                    description={`Hanya PDF, JPG, PNG | Maksimal ${MAX_FILE_SIZE_MB} MB, Maksimal 5 Halaman`}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          {/* Box Persetujuan & Retensi Data */}
          <div className="space-y-4 rounded-xl border bg-card p-4">
            {/* Field 2: Consent Wajib */}
            <form.Field
              name="consentAccepted"
              validators={{
                onChange: documentFormSchema.shape.consentAccepted,
              }}
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={field.name}
                        checked={Boolean(field.state.value)}
                        disabled={mutation.isPending}
                        aria-invalid={isInvalid}
                        onCheckedChange={(checked) => {
                          field.handleChange(checked === true);
                          field.handleBlur();
                        }}
                        className="mt-0.5"
                      />
                      <div className="space-y-1 leading-snug">
                        <FieldLabel
                          htmlFor={field.name}
                          className="cursor-pointer font-medium text-sm"
                        >
                          Saya menyetujui pemrosesan dokumen ini untuk analisis
                          keamanan <span className="text-destructive">*</span>
                        </FieldLabel>
                        <FieldDescription className="text-xs">
                          File fisik tidak disimpan secara permanen di server
                          setelah ekstraksi selesai.
                        </FieldDescription>
                      </div>
                    </div>
                    {isInvalid && (
                      <FieldError
                        errors={field.state.meta.errors}
                        className="pl-7"
                      />
                    )}
                  </Field>
                );
              }}
            />

            <div className="border-t" />

            {/* Field 3: Keep For Report (Opsional) */}
            <form.Field
              name="keepForReport"
              children={(field) => (
                <Field>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={field.name}
                      checked={Boolean(field.state.value)}
                      disabled={mutation.isPending}
                      onCheckedChange={(checked) =>
                        field.handleChange(checked === true)
                      }
                      className="mt-0.5"
                    />
                    <div className="space-y-1 leading-snug">
                      <FieldLabel
                        htmlFor={field.name}
                        className="cursor-pointer font-medium text-sm"
                      >
                        Simpan teks hasil ekstraksi sementara untuk pelaporan
                      </FieldLabel>
                      <FieldDescription className="text-xs">
                        Jika tidak dicentang, teks hasil ekstraksi akan langsung
                        dihapus setelah analisis selesai.
                      </FieldDescription>
                    </div>
                  </div>
                </Field>
              )}
            />
          </div>
        </FieldGroup>

        <Button
          type="submit"
          form="analyze-document-form"
          disabled={mutation.isPending}
          className="h-11 w-full font-medium text-sm"
        >
          Mulai Pengecekan
        </Button>
      </form>

      {/* Loading Modal dengan Progress Bar */}
      <Dialog open={mutation.isPending}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader className="space-y-1 text-left">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                <LuShieldAlert className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="font-semibold text-base">
                  Memeriksa Keamanan Dokumen
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Proses ekstraksi &amp; analisis memakan waktu beberapa detik
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">
                  {currentStep.label}
                </span>
                <span className="font-mono text-muted-foreground tabular-nums">
                  {progress}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5 rounded-lg border bg-muted/40 p-3 text-xs">
              {DOCUMENT_ANALYSIS_STEPS.map((step, idx) => {
                const isDone =
                  progress >
                  (DOCUMENT_ANALYSIS_STEPS[idx + 1]?.threshold ?? 100);
                const isActive = currentStep.threshold === step.threshold;

                return (
                  <div
                    key={step.threshold}
                    className={`flex items-center gap-2 transition-opacity ${isDone || isActive ? "opacity-100" : "opacity-40"}`}
                  >
                    {isDone ? (
                      <LuCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    ) : isActive ? (
                      <LuLoaderCircle className="h-3.5 w-3.5 shrink-0 animate-spin text-primary" />
                    ) : (
                      <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-muted-foreground/40" />
                    )}
                    <span
                      className={
                        isActive
                          ? "font-medium text-foreground"
                          : "text-muted-foreground"
                      }
                    >
                      {step.label.replace("...", "")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
