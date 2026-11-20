"use client";

import { useState } from "react";
import { LuChevronLeft, LuChevronRight, LuCircleAlert, LuCircleCheck, LuFileText, LuInfo, LuMessageSquareText, LuSearch } from "react-icons/lu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

type HistoryStatus = "penipuan" | "normal" | "belum-pasti";
type HistoryType = "teks" | "dokumen";

interface HistoryItem {
  id: number;
  date: string;
  type: HistoryType;
  summary: string;
  fullContent: string;
  status: HistoryStatus;
  confidence?: number;
  indicators: string[];
}

const MOCK_HISTORY: HistoryItem[] = [
  {
    id: 1,
    date: "18 Okt 2026 14:30",
    type: "teks",
    summary: "Selamat! Nomor Anda terpilih...",
    fullContent:
      "Selamat! Nomor Anda terpilih mendapatkan hadiah uang tunai Rp 25.000.000. Segera hubungi admin WhatsApp dan transfer biaya administrasi ke rekening 1234567890.",
    status: "penipuan",
    confidence: 92,
    indicators: ["Klaim Hadiah / Undian Tidak Resmi", "Permintaan Transfer ke Rekening Pribadi"],
  },
  {
    id: 2,
    date: "18 Okt 2026 14:30",
    type: "dokumen",
    summary: "surat_tagihan_resmi.pdf",
    fullContent:
      "Dokumen tagihan bulanan layanan internet resmi periode Oktober 2026. Tidak ditemukan tautan mencurigakan maupun nomor rekening anomali.",
    status: "normal",
    indicators: ["Tidak ditemukan indikasi penipuan"],
  },
  {
    id: 3,
    date: "18 Okt 2026 14:30",
    type: "dokumen",
    summary: "Kaka mohon transfer sekarang...",
    fullContent: "Kaka mohon transfer sekarang ya, HP saya lagi error ini pakai nomor teman. Nanti sore langsung diganti.",
    status: "belum-pasti",
    confidence: 51,
    indicators: ["Pola permintaan transfer mendesak", "Konteks pengirim belum dapat dipastikan"],
  },
  {
    id: 4,
    date: "18 Okt 2026 14:30",
    type: "dokumen",
    summary: "lampiran_konfirmasi_akun.pdf",
    fullContent: "Pemberitahuan pembaruan data akun. Harap melakukan konfirmasi ulang sebelum masa berlaku habis.",
    status: "belum-pasti",
    confidence: 51,
    indicators: ["Tekanan batas waktu", "Perlu verifikasi ke saluran resmi"],
  },
  {
    id: 5,
    date: "18 Okt 2026 14:30",
    type: "teks",
    summary: "Kaka mohon transfer sekarang...",
    fullContent: "Kaka mohon transfer sekarang ke rekening baru, rekening lama sedang diblokir sementara.",
    status: "belum-pasti",
    confidence: 51,
    indicators: ["Permintaan transfer dana", "Alasan perubahan rekening"],
  },
];

export default function RiwayatPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("semua");
  const [statusFilter, setStatusFilter] = useState<string>("semua");
  const [selectedDetail, setSelectedDetail] = useState<HistoryItem | null>(null);
  const [reportTarget, setReportTarget] = useState<HistoryItem | null>(null);

  const filteredData = MOCK_HISTORY.filter((item) => {
    const matchesSearch = item.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "semua" || item.type === typeFilter;
    const matchesStatus = statusFilter === "semua" || item.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const renderStatusBadge = (item: HistoryItem) => {
    if (item.status === "penipuan") {
      return (
        <Badge
          variant="destructive"
          className="gap-1.5 font-medium"
        >
          <LuCircleAlert className="h-3.5 w-3.5" />
          Indikasi Penipuan ({item.confidence}%)
        </Badge>
      );
    }

    if (item.status === "normal") {
      return (
        <Badge
          variant="secondary"
          className="gap-1.5 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 font-medium"
        >
          <LuCircleCheck className="h-3.5 w-3.5" />
          Pesan Normal
        </Badge>
      );
    }

    return (
      <Badge
        variant="outline"
        className="gap-1.5 border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium"
      >
        <LuInfo className="h-3.5 w-3.5" />
        Belum Pasti ({item.confidence}%)
      </Badge>
    );
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background text-foreground">
      <main className="container mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12 space-y-8">
        {/* Header Halaman */}
        <section className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Riwayat Pemeriksaan</h1>
          <p className="text-sm text-muted-foreground sm:text-base">Daftar riwayat pemeriksaan pesan dan dokumen yang pernah Anda lakukan.</p>
        </section>

        {/* Filter & Pencarian */}
        <section className="grid grid-cols-1 gap-4 rounded-xl border bg-card p-4 sm:grid-cols-12 sm:items-end">
          {/* Search Input */}
          <div className="space-y-1.5 sm:col-span-6">
            <Label
              htmlFor="search-history"
              className="text-xs font-medium"
            >
              Pencarian
            </Label>
            <div className="relative">
              <LuSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search-history"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari riwayat..."
                className="pl-9"
              />
            </div>
          </div>

          {/* Filter Jenis */}
          <div className="space-y-1.5 sm:col-span-3">
            <Label className="text-xs font-medium">Jenis</Label>
            <Select
              value={typeFilter}
              onValueChange={(value) => setTypeFilter(value ?? "semua")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Semua Jenis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua</SelectItem>
                <SelectItem value="teks">Teks</SelectItem>
                <SelectItem value="dokumen">Dokumen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter Status */}
          <div className="space-y-1.5 sm:col-span-3">
            <Label className="text-xs font-medium">Status</Label>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value ?? "semua")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua</SelectItem>
                <SelectItem value="penipuan">Penipuan</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="belum-pasti">Belum Pasti</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Filter Status */}
          <div className="space-y-1.5 sm:col-span-3">
            <Label className="text-xs font-medium">Status</Label>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value ?? "semua")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua</SelectItem>
                <SelectItem value="penipuan">Penipuan</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="belum-pasti">Belum Pasti</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* Tabel Riwayat */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold">Tabel Riwayat</h2>

          <div className="rounded-xl border bg-card overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-12 text-center">No</TableHead>
                  <TableHead className="whitespace-nowrap">Tanggal &amp; Waktu</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Ringkasan / Nama File</TableHead>
                  <TableHead>Hasil Analisis</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-center font-medium text-muted-foreground">{index + 1}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{item.date}</TableCell>
                      <TableCell>
                        <div className="inline-flex items-center gap-1.5 text-sm font-medium capitalize">
                          {item.type === "teks" ? (
                            <LuMessageSquareText className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <LuFileText className="h-4 w-4 text-muted-foreground" />
                          )}
                          {item.type === "teks" ? "Teks" : "Dokumen"}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate text-sm font-medium">{item.summary}</TableCell>
                      <TableCell className="whitespace-nowrap">{renderStatusBadge(item)}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto px-2 py-1 text-xs underline"
                            onClick={() => setSelectedDetail(item)}
                          >
                            Detail
                          </Button>
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground underline"
                            onClick={() => setReportTarget(item)}
                          >
                            Lapor
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-sm text-muted-foreground"
                    >
                      Tidak ada riwayat pemeriksaan yang sesuai dengan filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col items-center justify-between gap-4 pt-2 sm:flex-row">
            <p className="text-xs text-muted-foreground sm:text-sm">Menampilkan 1-{filteredData.length} dari 48 pemeriksaan</p>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
              >
                <LuChevronLeft className="h-4 w-4" />
                <span className="sr-only">Sebelumnya</span>
              </Button>
              <Button
                variant="default"
                size="sm"
                className="h-8 w-8 p-0"
              >
                1
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                2
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                3
              </Button>
              <span className="px-2 text-xs text-muted-foreground">...</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                5
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
              >
                <LuChevronRight className="h-4 w-4" />
                <span className="sr-only">Berikutnya</span>
              </Button>
            </div>
          </div>
        </section>

        {/* MODAL DETAIL RIWAYAT */}
        <Dialog
          open={!!selectedDetail}
          onOpenChange={(open) => !open && setSelectedDetail(null)}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Detail Hasil Pemeriksaan</DialogTitle>
              <DialogDescription className="text-xs">Diperiksa pada {selectedDetail?.date}</DialogDescription>
            </DialogHeader>

            {selectedDetail && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-3">
                  <span className="text-xs font-medium text-muted-foreground">Status Analisis</span>
                  {renderStatusBadge(selectedDetail)}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Isi Pesan / Ringkasan Dokumen</Label>
                  <div className="rounded-md border bg-muted/30 p-3 text-sm leading-relaxed">{selectedDetail.fullContent}</div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Indikator Analisis</Label>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    {selectedDetail.indicators.map((ind, i) => (
                      <li key={i}>{ind}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedDetail(null)}
                  >
                    Tutup
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* MODAL LAPOR DARI RIWAYAT */}
        <Dialog
          open={!!reportTarget}
          onOpenChange={(open) => !open && setReportTarget(null)}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Laporkan Hasil Pemeriksaan</DialogTitle>
              <DialogDescription className="text-xs">Kirim laporan ini untuk diverifikasi lebih lanjut oleh admin.</DialogDescription>
            </DialogHeader>

            {reportTarget && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setReportTarget(null);
                }}
                className="space-y-4 pt-2"
              >
                <div className="space-y-1.5">
                  <Label>Konten Terlampir</Label>
                  <Textarea
                    readOnly
                    value={reportTarget.fullContent}
                    className="min-h-[80px] resize-none bg-muted/50 text-sm text-muted-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="history-chronology">
                    Kronologi Singkat <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="history-chronology"
                    required
                    placeholder="Tambahkan keterangan atau kronologi singkat..."
                    className="min-h-[80px] resize-none text-sm"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setReportTarget(null)}
                  >
                    Batal
                  </Button>
                  <Button type="submit">Kirim Laporan</Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
