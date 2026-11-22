"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "nextjs-toploader/app";
import { useEffect, useState } from "react";
import {
  LuCheck,
  LuCircleAlert,
  LuLoaderCircle,
  LuShieldAlert,
} from "react-icons/lu";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { toast } from "@/components/ui/toast";
import { useTRPC } from "@/trpc/client";

const MIN_CHARS = 5;
const MAX_CHARS = 2000;

const formSchema = z.object({
  text: z
    .string()
    .trim()
    .min(MIN_CHARS, `Minimal ${MIN_CHARS} karakter untuk dapat dianalisis.`)
    .max(MAX_CHARS, `Pesan maksimal ${MAX_CHARS} karakter.`),
});

const ANALYSIS_STEPS = [
  { threshold: 0, label: "Memindai struktur kalimat & tautan..." },
  {
    threshold: 35,
    label: "Mendeteksi pola rekayasa sosial (social engineering)...",
  },
  { threshold: 68, label: "Mencocokkan modus penipuan umum..." },
  { threshold: 88, label: "Menyusun skor risiko & kesimpulan..." },
];

export default function DeteksiPesanPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  const trpc = useTRPC();

  const mutation = useMutation({
    ...trpc.check.analyzeText.mutationOptions(),
    onSuccess: (data) => {
      router.push(`/checks/${data.id}/results`);
    },
    onError: (error) => {
      toast.add({
        title: "Gagal menganalisis pesan",
        description:
          error.message || "Terjadi kesalahan pada server. Silakan coba lagi.",
        type: "error",
      });
    },
  });

  const form = useForm({
    defaultValues: {
      text: "",
    },
    validators: {
      onSubmit: formSchema,
      onChange: formSchema,
    },
    onSubmit: async ({ value }) => {
      mutation.mutate({ text: value.text.trim(), saveContent: true });
    },
  });

  useEffect(() => {
    if (!mutation.isPending) {
      setProgress(0);
      return;
    }

    setProgress(12);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95;
        const remaining = 95 - prev;
        const step = Math.max(
          1,
          Math.round(remaining * (Math.random() * 0.18 + 0.06)),
        );
        return Math.min(95, prev + step);
      });
    }, 450);

    return () => clearInterval(interval);
  }, [mutation.isPending]);

  const currentStep =
    [...ANALYSIS_STEPS].reverse().find((s) => progress >= s.threshold) ??
    ANALYSIS_STEPS[0];

  return (
    <div className="container mx-auto max-w-3xl space-y-6 px-4 py-12 sm:px-6 sm:py-16">
      <div className="space-y-2 text-center">
        <h1 className="font-bold text-2xl tracking-tight sm:text-3xl">
          Deteksi Pesan Penipuan
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Tulis atau tempel pesan mencurigakan di sini...
        </p>
      </div>

      <form
        id="analyze-message-form"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <FieldGroup>
          <form.Field name="text">
            {(field) => {
              const showError =
                (field.state.meta.isTouched ||
                  form.state.submissionAttempts > 0) &&
                !field.state.meta.isValid;

              const firstError = field.state.meta.errors[0];
              const errorMessage =
                typeof firstError === "string"
                  ? firstError
                  : firstError?.message;

              const trimmedLength = field.state.value.trim().length;

              return (
                <Field data-invalid={showError}>
                  <InputGroup
                    className={
                      showError
                        ? "border-destructive ring-2 ring-destructive/15 transition-colors"
                        : "transition-colors"
                    }
                  >
                    <InputGroupTextarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(e.target.value.slice(0, MAX_CHARS))
                      }
                      placeholder="Tulis atau tempel pesan mencurigakan di sini (contoh: SMS hadiah, pesan WhatsApp penipuan, tautan mencurigakan)..."
                      rows={8}
                      className="min-h-[220px] resize-none text-sm sm:text-base"
                      aria-invalid={showError}
                      disabled={mutation.isPending}
                    />

                    <InputGroupAddon
                      align="block-end"
                      className="flex items-center justify-between gap-2 border-t bg-muted/30 px-3 py-2"
                    >
                      {showError && errorMessage ? (
                        <span
                          role="alert"
                          className="flex items-center gap-1.5 font-medium text-destructive text-xs"
                        >
                          <LuCircleAlert className="h-3.5 w-3.5 shrink-0" />
                          <span>{errorMessage}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          {trimmedLength > 0 && trimmedLength < MIN_CHARS
                            ? `Kurang ${MIN_CHARS - trimmedLength} karakter lagi`
                            : `Minimal ${MIN_CHARS} karakter`}
                        </span>
                      )}

                      <InputGroupText
                        className={`ml-auto shrink-0 text-xs tabular-nums ${
                          showError ? "font-medium text-destructive" : ""
                        }`}
                      >
                        {field.state.value.length}/{MAX_CHARS}
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                </Field>
              );
            }}
          </form.Field>
        </FieldGroup>

        <Button
          type="submit"
          form="analyze-message-form"
          disabled={mutation.isPending}
          className="h-11 w-full font-medium text-sm"
        >
          Periksa Pesan Sekarang
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
                  Memeriksa Keamanan Pesan
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Proses ini biasanya memakan waktu beberapa detik
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">
                  {currentStep?.label}
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
              {ANALYSIS_STEPS.map((step, idx) => {
                const isDone =
                  progress > (ANALYSIS_STEPS[idx + 1]?.threshold ?? 100);
                const isActive = currentStep?.threshold === step.threshold;

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
