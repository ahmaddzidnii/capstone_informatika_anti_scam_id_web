"use client";

import { useState } from "react";
import {
  LuChevronLeft,
  LuChevronRight,
  LuImage,
  LuSearch,
  LuShieldAlert,
} from "react-icons/lu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";

type ReportStatus =
  | "Menunggu Verifikasi"
  | "Sedang Ditinjau"
  | "Terverifikasi sebagai penipuan"
  | "Tidak cukup bukti"
  | "Ditolak";

interface ReportItem {
  id: string;
  sender: string;
  snippet: string;
  fullMessage: string;
  date: string;
  platform: string;
  category: string;
  chronology: string;
  aiPrediction: string;
  aiConfidence: number;
  status: ReportStatus;
}

const INITIAL_REPORTS: ReportItem[] = [
  {
    id: "1024",
    sender: "Zahra (Login)",
    snippet: "Selamat! Anda memenangkan...",
    fullMessage:
      "Selamat! Nomor Anda terpilih mendapatkan undian Rp 50.000.000 dari program apresiasi pelanggan.\nHubungi wa.me/6281234567890 untuk klaim hadiah sebelum pukul 17.00 WIB.",
    date: "18 Okt 2026",
    platform: "WhatsApp",
    category: "Undian / Hadiah",
    chronology:
      "Diterima lewat WhatsApp dari nomor tidak dikenal, diminta transfer biaya admin Rp 250.000 terlebih dahulu agar dana dicairkan.",
    aiPrediction: "Indikasi Penipuan",
    aiConfidence: 92,
    status: "Menunggu Verifikasi",
  },
  {
    id: "1023",
    sender: "Guest #892",
    snippet: "Kaka mohon transfer...",
    fullMessage:
      "Kaka mohon transfer dulu ke rekening BCA 8291039481 a.n. Budi Santoso sejumlah Rp 1.500.000, nanti sore langsung saya ganti karena m-banking saya sedang limit.",
    date: "17 Okt 2026",
    platform: "WhatsApp",
    category: "Penyamaran Kerabat",
    chronology:
      "Mengaku sebagai sepupu yang ganti nomor baru dan meminjam uang mendesak.",
    aiPrediction: "Indikasi Penipuan",
    aiConfidence: 88,
    status: "Sedang Ditinjau",
  },
  {
    id: "1022",
    sender: "Guest #892",
    snippet: "Akun Anda akan diblokir...",
    fullMessage:
      "PERINGATAN: Akun mobile banking Anda akan diblokir permanen dalam 24 jam karena pembaruan sistem. Segera verifikasi data Anda di tautan http://verif-akun-id.xyz",
    date: "17 Okt 2026",
    platform: "SMS",
    category: "Phishing / Tautan Palsu",
    chronology:
      "Masuk melalui SMS banking dengan nama pengirim menyerupai bank resmi.",
    aiPrediction: "Indikasi Penipuan",
    aiConfidence: 96,
    status: "Ditolak",
  },
];

function getStatusBadgeVariant(status: ReportStatus) {
  switch (status) {
    case "Terverifikasi sebagai penipuan":
      return "destructive";
    case "Sedang Ditinjau":
      return "secondary";
    case "Ditolak":
    case "Tidak cukup bukti":
      return "outline";
    default:
      return "default";
  }
}

export default function ModerasiLaporanPage() {
  const [reports, setReports] = useState<ReportItem[]>(INITIAL_REPORTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("semua");
  const [currentPage, setCurrentPage] = useState(1);

  // State Modal Detail
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [draftStatus, setDraftStatus] = useState<ReportStatus>(
    "Menunggu Verifikasi",
  );

  const filteredReports = reports.filter((item) => {
    const matchesSearch =
      item.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.snippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.includes(searchQuery);

    const matchesStatus =
      statusFilter === "semua" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOpenDetail = (report: ReportItem) => {
    setSelectedReport(report);
    setDraftStatus(report.status);
  };

  const handleSaveStatus = () => {
    if (!selectedReport) return;

    setReports((prev) =>
      prev.map((item) =>
        item.id === selectedReport.id ? { ...item, status: draftStatus } : item,
      ),
    );

    toast.add({
      type: "success",
      title: `Status laporan #${selectedReport.id} diperbarui`,
    });

    setSelectedReport(null);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header Judul */}
      <div className="space-y-1">
        <h1 className="font-bold text-2xl tracking-tight sm:text-3xl">
          Moderasi Laporan Masuk
        </h1>
        <p className="text-muted-foreground text-sm">
          Daftar laporan pesan/dokumen yang dikirim pengguna untuk ditinjau.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <LuSearch className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari laporan..."
            className="pl-9"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(val) => {
            if (val) setStatusFilter(val);
          }}
        >
          <SelectTrigger className="w-full sm:w-[240px]">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semua">Semua Status</SelectItem>
            <SelectItem value="Menunggu Verifikasi">
              Menunggu Verifikasi
            </SelectItem>
            <SelectItem value="Sedang Ditinjau">Sedang Ditinjau</SelectItem>
            <SelectItem value="Terverifikasi sebagai penipuan">
              Terverifikasi sebagai penipuan
            </SelectItem>
            <SelectItem value="Tidak cukup bukti">Tidak cukup bukti</SelectItem>
            <SelectItem value="Ditolak">Ditolak</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabel Laporan Masuk */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-semibold text-base">
            Tabel Laporan Masuk
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="w-14">No</TableHead>
                  <TableHead>
                    <div>Pengirim</div>
                    <div className="font-normal text-[11px] text-muted-foreground">
                      Guest / ID Pengguna
                    </div>
                  </TableHead>
                  <TableHead>Cuplikan Pesan</TableHead>
                  <TableHead className="whitespace-nowrap">Tanggal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredReports.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground text-sm"
                    >
                      Tidak ada laporan yang sesuai dengan filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReports.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="whitespace-nowrap font-medium">
                        {item.sender}
                      </TableCell>
                      <TableCell className="max-w-[240px] truncate text-muted-foreground">
                        {item.snippet}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {item.date}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusBadgeVariant(item.status)}
                          className="whitespace-nowrap"
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDetail(item)}
                        >
                          Tinjau Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-1.5 pt-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              aria-label="Halaman sebelumnya"
            >
              <LuChevronLeft className="h-4 w-4" />
            </Button>

            {[1, 2, 3].map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                className="h-8 w-8 p-0 text-xs"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage === 3}
              onClick={() => setCurrentPage((p) => Math.min(3, p + 1))}
              aria-label="Halaman berikutnya"
            >
              <LuChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* STATE 2: MODAL DETAIL & MODERASI */}
      <Dialog
        open={Boolean(selectedReport)}
        onOpenChange={(open) => {
          if (!open) setSelectedReport(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-bold text-xl">
              Detail Laporan #{selectedReport?.id}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Detail informasi laporan pengguna dan perubahan status moderasi
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="grid grid-cols-1 gap-6 pt-2 md:grid-cols-12">
              {/* Kolom Kiri: Informasi Laporan */}
              <div className="space-y-4 md:col-span-7">
                <div className="space-y-1.5">
                  <h3 className="font-semibold text-foreground text-sm">
                    Informasi Laporan
                  </h3>
                  <dl className="grid grid-cols-[120px_1fr] gap-y-1 text-xs sm:text-sm">
                    <dt className="text-muted-foreground">Pengirim:</dt>
                    <dd className="font-medium">{selectedReport.sender}</dd>

                    <dt className="text-muted-foreground">Tanggal:</dt>
                    <dd className="font-medium">{selectedReport.date}</dd>

                    <dt className="text-muted-foreground">Platform:</dt>
                    <dd className="font-medium">{selectedReport.platform}</dd>

                    <dt className="text-muted-foreground">Kategori Dugaan:</dt>
                    <dd className="font-medium">{selectedReport.category}</dd>
                  </dl>
                </div>

                <div className="space-y-1.5">
                  <Label className="font-semibold text-xs">Isi Pesan</Label>
                  <Textarea
                    readOnly
                    value={selectedReport.fullMessage}
                    className="min-h-[95px] resize-none bg-muted/40 text-xs leading-relaxed sm:text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="font-semibold text-xs">Kronologi</Label>
                  <Textarea
                    readOnly
                    value={selectedReport.chronology}
                    className="min-h-[75px] resize-none bg-muted/40 text-xs leading-relaxed sm:text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="font-semibold text-xs">
                    Bukti Pendukung
                  </Label>
                  <div className="flex h-32 w-full flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 p-4 text-center">
                    <LuImage className="mb-1.5 h-5 w-5 text-muted-foreground" />
                    <span className="font-medium text-muted-foreground text-xs">
                      [Gambar Bukti Tangkapan Layar]
                    </span>
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Status & Aksi Admin */}
              <div className="flex flex-col justify-between space-y-6 rounded-xl border bg-muted/20 p-4 md:col-span-5">
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground text-sm">
                    Status &amp; Aksi Admin
                  </h3>

                  {/* Prediksi Awal AI */}
                  <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs">
                    <LuShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                    <div>
                      <span className="font-medium text-foreground">
                        Prediksi Awal AI:{" "}
                      </span>
                      <span className="font-bold text-destructive">
                        {selectedReport.aiPrediction} (
                        {selectedReport.aiConfidence}%)
                      </span>
                    </div>
                  </div>

                  {/* Dropdown Ubah Status */}
                  <div className="space-y-2">
                    <Label htmlFor="admin-status-select" className="text-xs">
                      Ubah Status Laporan{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={draftStatus}
                      onValueChange={(val) => {
                        if (val) setDraftStatus(val as ReportStatus);
                      }}
                    >
                      <SelectTrigger
                        id="admin-status-select"
                        className="w-full bg-background"
                      >
                        <SelectValue placeholder="Pilih status baru" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Menunggu Verifikasi">
                          Menunggu Verifikasi
                        </SelectItem>
                        <SelectItem value="Terverifikasi sebagai penipuan">
                          Terverifikasi sebagai penipuan
                        </SelectItem>
                        <SelectItem value="Sedang Ditinjau">
                          Sedang Ditinjau
                        </SelectItem>
                        <SelectItem value="Tidak cukup bukti">
                          Tidak cukup bukti
                        </SelectItem>
                        <SelectItem value="Ditolak">Ditolak</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedReport(null)}
                  >
                    Batal
                  </Button>
                  <Button type="button" onClick={handleSaveStatus}>
                    Simpan Status Baru
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
