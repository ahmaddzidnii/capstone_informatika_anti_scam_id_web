import Link from "next/link";
import { FaTelegramPlane } from "react-icons/fa";
import { LuArrowRight, LuArrowUpRight, LuImage } from "react-icons/lu";
import { FaqSection } from "@/components/faq-section";
import { LandingAnimator } from "@/components/landing-animator";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <LandingAnimator>
      <div className="bg-background text-foreground">
        {/* 1. TOP ANNOUNCEMENT PILL */}
        <div
          data-animate="hero"
          className="container mx-auto max-w-5xl px-4 pt-5 sm:px-6 sm:pt-6"
        >
          <div className="flex items-start justify-between gap-4 rounded-2xl bg-secondary/80 px-4 py-3 text-xs leading-relaxed sm:items-center sm:rounded-full sm:px-5 sm:py-2.5 sm:text-sm">
            <div className="flex items-start gap-2.5 text-left sm:items-center">
              <FaTelegramPlane className="mt-0.5 h-4 w-4 shrink-0 text-primary sm:mt-0" />
              <p className="text-foreground/90">
                Teruskan pesan mencurigakan dari WhatsApp ke{" "}
                <strong className="font-semibold text-foreground">
                  Bot Telegram AntiScamID
                </strong>{" "}
                untuk cek instan.{" "}
                <Link
                  href="#"
                  className="inline-flex items-center gap-0.5 font-semibold text-primary hover:underline sm:hidden"
                >
                  <span>Buka Bot</span>
                  <LuArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </p>
            </div>

            <Link
              href="#"
              className="hidden shrink-0 items-center gap-1 font-semibold text-primary hover:underline sm:inline-flex"
            >
              <span>Buka Bot</span>
              <LuArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* 2. HERO TYPOGRAPHY & PILL CTA */}
        <section className="container mx-auto max-w-4xl px-4 pt-12 pb-10 text-center sm:px-6 sm:pt-16 sm:pb-14">
          <h1
            data-animate="hero"
            className="mx-auto max-w-3xl font-bold text-4xl tracking-tight sm:text-5xl lg:text-[56px] lg:leading-[1.1]"
          >
            Periksa pesan dan dokumen dari indikasi penipuan
          </h1>

          <p
            data-animate="hero"
            className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg"
          >
            Analisis teks pesan, tautan mencurigakan, serta dokumen PDF atau
            gambar berbahasa Indonesia dalam hitungan detik.
          </p>

          <div
            data-animate="hero"
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Button
              size="lg"
              className="h-11 rounded-full px-7 font-semibold text-sm"
              nativeButton={false}
              render={<Link href="/deteksi-pesan">Periksa Pesan</Link>}
            />
            <Button
              size="lg"
              variant="outline"
              className="h-11 rounded-full bg-card px-7 font-semibold text-sm"
              nativeButton={false}
              render={<Link href="/deteksi-dokumen">Unggah Dokumen</Link>}
            />
          </div>
        </section>

        {/* 3. HERO COLLAGE SHOWCASE */}
        <section
          data-animate="collage-wrap"
          className="container mx-auto max-w-6xl px-4 pb-20 sm:px-6 sm:pb-28"
        >
          <div className="relative mx-auto flex max-w-5xl items-center justify-center">
            {/* Floating Left App Card */}
            <div
              data-animate="collage-side"
              className="relative z-10 -mr-10 hidden w-64 shrink-0 md:block lg:-mr-14 lg:w-72"
            >
              <div
                data-animate="collage-left"
                className="overflow-hidden rounded-2xl border bg-card shadow-xl"
              >
                <div className="flex aspect-[4/3] w-full flex-col items-center justify-center bg-muted/40 p-4 text-center">
                  <LuImage className="mb-1.5 h-5 w-5 text-muted-foreground" />
                  <span className="font-medium text-foreground text-xs">
                    [Foto 1: Input Teks / WA]
                  </span>
                  <span className="mt-0.5 text-[11px] text-muted-foreground">
                    Potongan UI input pesan
                  </span>
                </div>
                <div className="flex items-center justify-between border-t bg-card px-4 py-2.5 font-medium text-xs">
                  <span>Deteksi Pesan</span>
                  <span className="text-primary">Teks &amp; Tautan</span>
                </div>
              </div>
            </div>

            {/* Center Main App Screenshot */}
            <div
              data-animate="collage-center"
              className="relative w-full max-w-2xl overflow-hidden rounded-3xl border bg-card shadow-2xl"
            >
              <div className="flex aspect-[16/10] w-full flex-col items-center justify-center bg-muted/30 p-8 text-center">
                <LuImage className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="font-semibold text-foreground text-sm">
                  [Foto Utama Aplikasi — 1440 × 900 px]
                </p>
                <p className="mt-1 max-w-sm text-muted-foreground text-xs">
                  Tangkapan layar halaman hasil pemeriksaan AntiScamID (skor
                  keyakinan &amp; indikator).
                </p>
              </div>

              <div className="absolute bottom-5 left-5 hidden rounded-full border bg-card/95 px-5 py-2.5 font-semibold text-sm shadow-md backdrop-blur-xs sm:block">
                Hasil Analisis Instan
              </div>
            </div>

            {/* Floating Right App Card */}
            <div
              data-animate="collage-side"
              className="relative z-10 -ml-10 hidden w-60 shrink-0 md:block lg:-ml-14 lg:w-68"
            >
              <div
                data-animate="collage-right"
                className="overflow-hidden rounded-2xl border bg-card shadow-xl"
              >
                <div className="flex aspect-square w-full flex-col items-center justify-center bg-muted/40 p-4 text-center">
                  <LuImage className="mb-1.5 h-5 w-5 text-muted-foreground" />
                  <span className="font-medium text-foreground text-xs">
                    [Foto 2: Dokumen OCR]
                  </span>
                  <span className="mt-0.5 text-[11px] text-muted-foreground">
                    Potongan UI hasil scan PDF
                  </span>
                </div>
                <div className="border-t bg-card px-4 py-2.5">
                  <p className="font-semibold text-xs">Screening Dokumen</p>
                  <p className="text-[11px] text-muted-foreground">
                    PDF, JPG, PNG
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. VIDEO TESTER / DEMO */}
        <section className="border-t bg-secondary/40">
          <div
            data-animate="reveal"
            className="container mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-24"
          >
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-bold text-3xl tracking-tight sm:text-4xl">
                Lihat cara kerja pengujian sistem
              </h2>
              <p className="mt-3 text-muted-foreground text-sm sm:text-base">
                Simulasi pemeriksaan pesan penipuan, pembacaan teks dokumen, dan
                pelaporan kasus.
              </p>
            </div>

            <div className="mt-10 overflow-hidden rounded-3xl border bg-card shadow-lg">
              <div className="aspect-video w-full bg-black">
                <iframe
                  className="h-full w-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="Demo Pengujian AntiScamID"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </section>

        {/* 5. FEATURE SHOWCASE */}
        <section className="container mx-auto max-w-6xl space-y-24 px-4 py-20 sm:px-6 sm:py-28">
          {/* Blok 1 */}
          <div
            data-animate="reveal"
            className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16"
          >
            <div className="space-y-4 lg:col-span-5">
              <h3 className="font-bold text-2xl tracking-tight sm:text-3xl">
                Deteksi pola manipulasi pada pesan singkat
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                Tempel pesan dari WhatsApp atau SMS. Sistem menandai kalimat
                berindikasi penipuan seperti klaim hadiah palsu, desakan
                transfer, hingga tautan phishing.
              </p>
              <div className="pt-2">
                <Link
                  href="/deteksi-pesan"
                  className="inline-flex items-center gap-1.5 font-semibold text-primary text-sm hover:underline"
                >
                  <span>Coba deteksi pesan</span>
                  <LuArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="flex aspect-[16/10] w-full flex-col items-center justify-center overflow-hidden rounded-3xl border bg-card p-6 text-center shadow-sm">
                <LuImage className="mb-2 h-7 w-7 text-muted-foreground" />
                <p className="font-medium text-sm">
                  [Foto Fitur 1: Halaman Hasil Deteksi Pesan]
                </p>
              </div>
            </div>
          </div>

          {/* Blok 2 */}
          <div
            data-animate="reveal"
            className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16"
          >
            <div className="order-2 lg:order-1 lg:col-span-7">
              <div className="flex aspect-[16/10] w-full flex-col items-center justify-center overflow-hidden rounded-3xl border bg-card p-6 text-center shadow-sm">
                <LuImage className="mb-2 h-7 w-7 text-muted-foreground" />
                <p className="font-medium text-sm">
                  [Foto Fitur 2: Halaman Hasil Ekstraksi Dokumen]
                </p>
              </div>
            </div>

            <div className="order-1 space-y-4 lg:order-2 lg:col-span-5">
              <h3 className="font-bold text-2xl tracking-tight sm:text-3xl">
                Periksa keaslian isi surat dan tagihan gambar
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                Unggah file PDF atau tangkapan layar. Teks diekstrak secara
                otomatis untuk mendeteksi pemalsuan kop surat instansi maupun
                invoice fiktif.
              </p>
              <div className="pt-2">
                <Link
                  href="/deteksi-dokumen"
                  className="inline-flex items-center gap-1.5 font-semibold text-primary text-sm hover:underline"
                >
                  <span>Coba deteksi dokumen</span>
                  <LuArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 6. FAQ SECTION */}
        <div data-animate="reveal">
          <FaqSection />
        </div>
      </div>
    </LandingAnimator>
  );
}
