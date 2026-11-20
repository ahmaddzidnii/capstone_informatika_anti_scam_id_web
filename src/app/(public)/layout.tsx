import Link from "next/link";
import { Logo } from "@/components/logo";
import { Navbar } from "@/components/navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <div className="flex flex-col justify-between gap-8 sm:flex-row">
            {/* Brand & Disclaimer */}
            <div className="max-w-md space-y-3">
              <div className="flex items-center gap-2">
                <Logo />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Platform pemeriksaan awal berbasis AI untuk membantu masyarakat mengenali indikasi penipuan digital berbahasa Indonesia.
              </p>
              <p className="text-xs text-muted-foreground/80">
                *Hasil deteksi bersifat analisis awal dan bukan merupakan keputusan hukum atau verifikasi resmi.
              </p>
            </div>

            {/* Navigasi Singkat */}
            <div className="flex gap-12 text-sm">
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Layanan</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    <Link
                      href="/deteksi-pesan"
                      className="transition-colors hover:text-foreground"
                    >
                      Deteksi Pesan
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/deteksi-dokumen"
                      className="transition-colors hover:text-foreground"
                    >
                      Deteksi Dokumen
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="transition-colors hover:text-foreground"
                    >
                      Telegram Bot
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Akses</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    <Link
                      href="/login"
                      className="transition-colors hover:text-foreground"
                    >
                      Masuk Akun
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/login"
                      className="transition-colors hover:text-foreground"
                    >
                      Daftar
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Bar & Capstone Credit */}
          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 text-xs text-muted-foreground sm:flex-row">
            <p>&copy; {new Date().getFullYear()} AntiScamID. All rights reserved.</p>
            <p className="font-medium text-foreground/80 text-center sm:text-right">
              Capstone Project Kelompok 7 - Informatika UIN Sunan Kalijaga Yogyakarta Angkatan 2023
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
