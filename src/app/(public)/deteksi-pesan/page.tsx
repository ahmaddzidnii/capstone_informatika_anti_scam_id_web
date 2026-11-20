"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LuLoaderCircle } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const MAX_CHARS = 2000;

export default function DeteksiPesanPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [messageText, setMessageText] = useState("");

  const handleAnalyze = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push("/checks/101/results?type=pesan");
    }, 1200);
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Deteksi Pesan Penipuan</h1>
        <p className="text-sm text-muted-foreground sm:text-base">Tulis atau tempel pesan mencurigakan di sini...</p>
      </div>

      <div className="space-y-2">
        <Textarea
          value={messageText}
          onChange={(e) => setMessageText(e.target.value.slice(0, MAX_CHARS))}
          placeholder="Tulis atau tempel pesan mencurigakan di sini (contoh: SMS hadiah, pesan WhatsApp penipuan, tautan mencurigakan)..."
          className="min-h-[220px] resize-none text-sm sm:text-base p-4"
        />
        <div className="flex justify-end text-xs text-muted-foreground">
          {messageText.length}/{MAX_CHARS}
        </div>
      </div>

      <Button
        onClick={handleAnalyze}
        disabled={!messageText.trim() || isLoading}
        className="w-full h-11 text-sm font-medium"
      >
        Periksa Pesan Sekarang
      </Button>

      {/* Loading Modal */}
      <Dialog open={isLoading}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-xs text-center"
        >
          <DialogHeader className="items-center space-y-3 py-4">
            <LuLoaderCircle className="h-10 w-10 animate-spin text-foreground" />
            <div className="space-y-1 text-center">
              <DialogTitle className="text-base font-semibold">Menganalisis pesan oleh AI...</DialogTitle>
              <DialogDescription className="text-sm">Mohon tunggu</DialogDescription>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
