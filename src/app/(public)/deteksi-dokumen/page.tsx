"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { LuFileText, LuLoaderCircle, LuShieldAlert, LuUpload, LuX } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function DeteksiDokumenPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | undefined) => {
    if (!file) return;
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFileChange(file);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleAnalyze = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push("/checks/102/results?type=dokumen");
    }, 1200);
  };

  const handleReset = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Deteksi Dokumen Mencurigakan</h1>
        <p className="text-sm text-muted-foreground sm:text-base">Unggah dokumen atau gambar untuk mendeteksi potensi penipuan</p>
      </div>

      {/* Peringatan Privasi */}
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 sm:p-5">
        <div className="flex items-start gap-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <LuShieldAlert className="h-5 w-5" />
          </div>

          <div className="space-y-2.5">
            <div className="space-y-1">
              <h2 className="text-sm font-bold tracking-tight text-foreground">Sensor Data Sensitif Sebelum Mengunggah</h2>
              <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                Dokumen diproses oleh AI untuk ekstraksi teks. Pastikan Anda telah menutupi informasi pribadi berikut:
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {["NIK / KTP", "Nomor Rekening", "Kode OTP", "Alamat Lengkap"].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center rounded-md border border-primary/20 bg-background px-2.5 py-0.5 text-xs font-medium text-foreground"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Area (Drag & Drop) */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
          isDragging ? "border-primary bg-muted/70" : "border-muted-foreground/30 hover:border-foreground/50 hover:bg-muted/30"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files?.[0])}
        />

        {!selectedFile ? (
          <div className="flex flex-col items-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-background">
              <LuUpload className="h-6 w-6 text-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold">Tarik &amp; lepas file di sini, atau cari file</p>
              <p className="text-xs text-muted-foreground">Hanya PDF, JPG, PNG | Maksimal 5 MB, Maksimal 5 Halaman</p>
            </div>
          </div>
        ) : (
          <div
            onClick={(e) => e.stopPropagation()}
            className="mx-auto flex max-w-md items-center justify-between gap-3 rounded-lg border bg-background p-3 text-left"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                <LuFileText className="h-5 w-5 text-foreground" />
              </div>
              <div className="truncate">
                <p className="truncate text-sm font-medium">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleReset}
              aria-label="Hapus file"
            >
              <LuX className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Action Button */}
      <Button
        onClick={handleAnalyze}
        disabled={!selectedFile || isLoading}
        className="w-full h-11 text-sm font-medium"
      >
        Mulai Pengecekan
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
              <DialogTitle className="text-base font-semibold">Mengekstrak &amp; menganalisis dokumen...</DialogTitle>
              <DialogDescription className="text-sm">Mohon tunggu</DialogDescription>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
