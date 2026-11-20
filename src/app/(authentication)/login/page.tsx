"use client";

import { useState } from "react";
import Link from "next/link";
import { LuArrowLeft, LuLoaderCircle, LuShieldCheck } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.73 7.18l7.27 5.64c4.25-3.92 7.5-9.72 7.5-17.29Z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19Z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.9-5.8l-7.27-5.64c-2.02 1.35-4.61 2.14-8.63 2.14-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleGoogleLogin() {
    setIsLoading(true);

    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/riwayat",
      });

      if (result.error) {
        toast.add({
          type: "error",
          title: "Autentikasi gagal",
        });
        setIsLoading(false);
      }
    } catch {
      toast.add({
        type: "error",
        title: "Terjadi kesalahan saat masuk",
      });
      setIsLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-background text-foreground lg:grid-cols-12">
      {/* Panel Kiri: Tetap Minimalis */}
      <div className="relative hidden flex-col justify-center overflow-hidden border-r border-border bg-muted/20 px-12 lg:col-span-5 lg:flex xl:px-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-48 opacity-40"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "14px 14px",
            maskImage: "linear-gradient(to right, black, transparent)",
            WebkitMaskImage: "linear-gradient(to right, black, transparent)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl"
        />

        <div className="relative space-y-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-background">
            <LuShieldCheck className="h-6 w-6 text-foreground" />
          </div>

          <h2 className="max-w-xs text-2xl font-bold leading-snug tracking-tight xl:text-3xl">Periksa pesan &amp; dokumen sebelum terlambat.</h2>
        </div>
      </div>

      {/* Panel Kanan: Area Login */}
      <div className="relative flex flex-col justify-between p-6 sm:p-10 lg:col-span-7">
        {/* Top Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <LuArrowLeft className="h-4 w-4" />
            <span>Beranda</span>
          </Link>
        </div>

        {/* Center Auth Box */}
        <div className="mx-auto w-full max-w-xs space-y-6 text-center">
          <div className="space-y-2.5">
            <h1 className="text-2xl font-bold tracking-tight">Masuk ke AntiScamID</h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Simpan riwayat pemeriksaan pesan dan dokumen Anda secara otomatis, serta laporkan indikasi penipuan.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-11 w-full gap-3 font-medium"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            {isLoading ? <LuLoaderCircle className="h-4 w-4 animate-spin" /> : <GoogleIcon className="h-4 w-4 shrink-0" />}
            <span>{isLoading ? "Memproses..." : "Lanjutkan dengan Google"}</span>
          </Button>
        </div>

        {/* Bottom Legal Note */}
        <p className="mx-auto max-w-xs text-center text-xs text-muted-foreground">
          Dengan masuk, Anda menyetujui Ketentuan Layanan dan Kebijakan Privasi AntiScamID.
        </p>
      </div>
    </div>
  );
}
