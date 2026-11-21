import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LuArrowLeft, LuShieldCheck } from "react-icons/lu";
import { auth } from "@/lib/auth";
import { callbackSDK } from "@/lib/callback-sdk";
import { LoginAction } from "./login-action";

interface LoginPageProps {
  searchParams: Promise<{ cb?: string | string[] }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [session, resolvedParams] = await Promise.all([
    auth.api.getSession({
      headers: await headers(),
    }),
    searchParams,
  ]);

  const rawCb = Array.isArray(resolvedParams.cb) ? resolvedParams.cb[0] : resolvedParams.cb;
  const callbackURL = callbackSDK.toUrl(rawCb, "/riwayat");

  if (session) {
    redirect(callbackURL);
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

          <LoginAction callbackURL={callbackURL} />
        </div>

        {/* Bottom Legal Note */}
        <p className="mx-auto max-w-xs text-center text-xs text-muted-foreground">
          Dengan masuk, Anda menyetujui Ketentuan Layanan dan Kebijakan Privasi AntiScamID.
        </p>
      </div>
    </div>
  );
}
