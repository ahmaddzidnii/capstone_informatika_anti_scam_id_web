"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { LuCheck, LuCircleAlert, LuCircleCheck, LuFileText, LuImagePlus, LuMessageSquareText, LuPlus, LuRotateCcw } from "react-icons/lu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function CheckResultPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const checkType = searchParams.get("type") === "dokumen" ? "dokumen" : "pesan";

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  // Mock data sementara untuk preview UI
  const mockResult =
    checkType === "dokumen"
      ? {
          status: "INDIKASI PENIPUAN",
          confidence: 89,
          fileName: "surat_tagihan_palsu.pdf",
          fileSize: "1.4 MB",
          extractedText:
            "SURAT PEMBERITAHUAN PEMENANG UNDIAN RESMI. Selamat! Nomor Anda terpilih mendapatkan hadiah dana tunai sebesar Rp 50.000.000. Segera lakukan transfer biaya administrasi sebesar Rp 1.500.000 ke rekening berikut sebelum pukul 15.00 WIB hari ini agar hadiah tidak hangus.",
          indicators: ["Klaim Hadiah / Undian Palsu", "Permintaan Transfer Uang", "Tekanan Batas Waktu"],
          suggestions: ["Jangan melakukan transfer ke rekening mana pun", "Verifikasi kebenaran surat langsung ke instansi resmi"],
        }
      : {
          status: "INDIKASI PENIPUAN",
          confidence: 92,
          extractedText:
            "Selamat! Nomor WhatsApp Anda terpilih mendapatkan bantuan dana tunai Rp 25.000.000. Silakan klik tautan berikut dan transfer biaya verifikasi Rp 500.000.",
          indicators: ["Klaim Hadiah / Undian Tidak Resmi", "No Rekening Asing / Minta Transfer Mendesak"],
          suggestions: ["Jangan transfer uang atau kirim data pribadi", "Cek kebenaran informasi melalui saluran resmi"],
        };

  const handleBackToCheck = () => {
    router.push(checkType === "dokumen" ? "/deteksi-dokumen" : "/deteksi-pesan");
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    setIsReportOpen(false);
    setIsSuccessOpen(true);
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 space-y-8">
      {/* Header */}
      <div className="flex flex-col items-center text-center space-y-2">
        <Badge
          variant="outline"
          className="text-xs font-medium"
        >
          ID Pemeriksaan: #{params.id}
        </Badge>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Hasil Pemeriksaan {checkType === "dokumen" ? "Dokumen" : "Pesan"}</h1>
      </div>

      {/* Banner Status & Tingkat Keyakinan */}
      <Card className="border-destructive/40 bg-destructive/5">
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-destructive">
            <LuCircleAlert className="h-6 w-6 shrink-0" />
            <span className="text-lg font-bold tracking-tight uppercase sm:text-xl">{mockResult.status}</span>
          </div>
          <div className="text-sm font-semibold sm:text-base">
            Tingkat Keyakinan: <span className="font-bold">{mockResult.confidence}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Konten yang Diperiksa (Detail File jika Dokumen / Isi Teks) */}
      <div className="space-y-4">
        {checkType === "dokumen" && (
          <Card>
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-muted">
                  <LuFileText className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{mockResult.fileName}</p>
                  <p className="text-xs text-muted-foreground">Ukuran: {mockResult.fileSize}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted">
                  <LuCheck className="h-3.5 w-3.5" />
                </div>
                <span>Status Ekstraksi: Sukses</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              {checkType === "dokumen" ? (
                <LuFileText className="h-4 w-4 text-muted-foreground" />
              ) : (
                <LuMessageSquareText className="h-4 w-4 text-muted-foreground" />
              )}
              {checkType === "dokumen" ? "Teks Hasil Ekstraksi Dokumen" : "Isi Pesan yang Diperiksa"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-44 overflow-y-auto rounded-md border bg-muted/40 p-3.5 text-sm leading-relaxed text-muted-foreground">
              {mockResult.extractedText}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid Indikator & Saran Tindakan */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Indikasi Pola Mencurigakan</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              {mockResult.indicators.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Saran Tindakan</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              {mockResult.suggestions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Action Buttons */}
      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
        <Button
          variant="outline"
          onClick={handleBackToCheck}
          className="gap-2"
        >
          <LuRotateCcw className="h-4 w-4" />
          Periksa {checkType === "dokumen" ? "Dokumen" : "Pesan"} Lain
        </Button>

        <Button
          onClick={() => setIsReportOpen(true)}
          className="gap-2"
        >
          <LuPlus className="h-4 w-4" />
          Laporkan {checkType === "dokumen" ? "Dokumen" : "Pesan"} Ini
        </Button>
      </div>

      {/* MODAL PELAPORAN */}
      <Dialog
        open={isReportOpen}
        onOpenChange={setIsReportOpen}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Laporkan {checkType === "dokumen" ? "Dokumen" : "Pesan"}</DialogTitle>
            <DialogDescription className="sr-only">Formulir pelaporan indikasi penipuan</DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmitReport}
            className="space-y-4 pt-2"
          >
            <div className="space-y-2">
              <Label>{checkType === "dokumen" ? "Dokumen & Teks Terlampir" : "Isi Pesan (Terisi Otomatis)"}</Label>
              <Textarea
                value={mockResult.extractedText}
                readOnly
                className="min-h-[90px] resize-none bg-muted/50 text-sm text-muted-foreground"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  Platform Pengirim <span className="text-destructive">*</span>
                </Label>
                <Select defaultValue="whatsapp">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="telegram">Telegram</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  Kategori Dugaan <span className="text-destructive">*</span>
                </Label>
                <Select defaultValue="kategori-ai">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kategori-ai">Kategori AI (Klaim Hadiah)</SelectItem>
                    <SelectItem value="phishing">Phishing / Tautan Palsu</SelectItem>
                    <SelectItem value="impersonation">Penyamaran Instansi / Kerabat</SelectItem>
                    <SelectItem value="investasi">Investasi / Tagihan Fiktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-chronology">
                Kronologi Singkat (Wajib) <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="report-chronology"
                required
                placeholder="Ceritakan secara singkat bagaimana Anda menerima pesan/dokumen ini..."
                className="min-h-[90px] resize-none text-sm"
              />
            </div>

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="outline"
                className="gap-2"
              >
                <LuImagePlus className="h-4 w-4" />
                Unggah Bukti Tambahan
              </Button>
              <Button type="submit">Kirim Laporan</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL SUKSES */}
      <Dialog
        open={isSuccessOpen}
        onOpenChange={setIsSuccessOpen}
      >
        <DialogContent className="sm:max-w-sm text-center">
          <DialogHeader className="items-center space-y-3 pt-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <LuCircleCheck className="h-7 w-7 text-foreground" />
            </div>
            <DialogTitle className="text-xl font-bold">Laporan Terkirim!</DialogTitle>
            <div>
              <Badge className="px-3 py-1 text-xs font-medium">Menunggu Verifikasi</Badge>
            </div>
            <DialogDescription className="text-sm text-muted-foreground pt-1">
              Terima kasih, laporan Anda berhasil dikirim dan akan ditinjau admin.
            </DialogDescription>
          </DialogHeader>

          <div className="pt-4 pb-2 flex justify-center">
            <Button
              variant="outline"
              className="min-w-[120px]"
              onClick={() => setIsSuccessOpen(false)}
            >
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
