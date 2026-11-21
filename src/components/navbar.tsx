"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/logo";
import { UserButton } from "@/components/user-button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      setIsScrolled(currentScrollY > 10);

      if (currentScrollY > lastScrollY.current && currentScrollY > 64) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/85 backdrop-blur-md transition-transform duration-300 ease-in-out",
        isVisible ? "translate-y-0" : "-translate-y-full",
        isScrolled && "shadow-2xs",
      )}
    >
      <div className="container mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" aria-label="AntiScamID Beranda">
            <Logo size="md" />
          </Link>
        </div>

        <nav className="hidden items-center gap-6 font-medium text-muted-foreground text-sm md:flex">
          <Link
            href="/deteksi-pesan"
            className="transition-colors hover:text-foreground"
          >
            Deteksi Pesan
          </Link>
          {/* <Link
            href="/deteksi-dokumen"
            className="transition-colors hover:text-foreground"
          >
            Deteksi Dokumen
          </Link> */}
          <Link
            href="/riwayat"
            className="transition-colors hover:text-foreground"
          >
            Riwayat
          </Link>
        </nav>

        <UserButton />
      </div>
    </header>
  );
}
