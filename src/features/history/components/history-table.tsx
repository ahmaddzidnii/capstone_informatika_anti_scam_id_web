"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  LuChevronLeft,
  LuChevronRight,
  LuCircleAlert,
  LuCircleCheck,
  LuFileText,
  LuInfo,
  LuMessageSquareText,
} from "react-icons/lu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useTRPC } from "@/trpc/client";
import { useHistoryFilter } from "../hooks/use-history-filter";

function formatConfidence(score: number) {
  return score <= 1 ? Math.round(score * 100) : Math.round(score);
}

export function HistoryTable() {
  const trpc = useTRPC();
  const [filters, setFilters] = useHistoryFilter();

  const { data } = useSuspenseQuery(
    trpc.check.getMyHistory.queryOptions({
      page: filters.page,
      search: filters.search,
      type: filters.type,
      status: filters.status,
    }),
  );

  type HistoryItem = (typeof data.items)[number];
  const [selectedDetail, setSelectedDetail] = useState<HistoryItem | null>(
    null,
  );
  const [reportTarget, setReportTarget] = useState<HistoryItem | null>(null);

  const startItem =
    data.totalCount === 0 ? 0 : (data.page - 1) * data.limit + 1;
  const endItem = Math.min(data.page * data.limit, data.totalCount);

  const getDisplayContent = (item: HistoryItem) => {
    if (item.document) {
      return item.document.extractedText || item.document.fileName;
    }
    if (!item.isContentSaved && !item.content) {
      return "Konten pesan tidak disimpan sesuai preferensi privasi.";
    }
    return item.content ?? "-";
  };

  const renderStatusBadge = (item: HistoryItem) => {
    const confidence = formatConfidence(item.confidenceScore);

    if (item.predictionLabel === "SCAM") {
      return (
        <Badge variant="destructive" className="gap-1.5 font-medium">
          <LuCircleAlert className="h-3.5 w-3.5" />
          Indikasi Penipuan ({confidence}%)
        </Badge>
      );
    }

    if (item.predictionLabel === "NORMAL") {
      return (
        <Badge
          variant="secondary"
          className="gap-1.5 bg-emerald-500/15 font-medium text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400"
        >
          <LuCircleCheck className="h-3.5 w-3.5" />
          Pesan Normal
        </Badge>
      );
    }

    return (
      <Badge
        variant="outline"
        className="gap-1.5 border-amber-500/40 bg-amber-500/10 font-medium text-amber-700 dark:text-amber-400"
      >
        <LuInfo className="h-3.5 w-3.5" />
        Belum Pasti ({confidence}%)
      </Badge>
    );
  };

  return (
    <>
      <section className="space-y-3">
        <h2 className="font-semibold text-base">Tabel Riwayat</h2>

        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-12 text-center">No</TableHead>
                <TableHead className="whitespace-nowrap">
                  Tanggal &amp; Waktu
                </TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Ringkasan / Nama File</TableHead>
                <TableHead>Hasil Analisis</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.length > 0 ? (
                data.items.map((item, index) => {
                  const isDocument = Boolean(item.document);
                  const summary = item.document
                    ? item.document.fileName
                    : (item.content ?? "Konten tidak disimpan");

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="text-center font-medium text-muted-foreground">
                        {(data.page - 1) * data.limit + index + 1}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground text-sm">
                        {new Intl.DateTimeFormat("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(new Date(item.createdAt))}
                      </TableCell>
                      <TableCell>
                        <div className="inline-flex items-center gap-1.5 font-medium text-sm">
                          {isDocument ? (
                            <LuFileText className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <LuMessageSquareText className="h-4 w-4 text-muted-foreground" />
                          )}
                          {isDocument ? "Dokumen" : "Teks"}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate font-medium text-sm">
                        {summary}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {renderStatusBadge(item)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1">
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto px-2 py-1 text-xs underline"
                            onClick={() => setSelectedDetail(item)}
                          >
                            Detail
                          </Button>
                          {item.report ? (
                            <span className="px-2 py-1 text-muted-foreground text-xs">
                              Dilaporkan
                            </span>
                          ) : (
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto px-2 py-1 text-muted-foreground text-xs underline hover:text-foreground"
                              onClick={() => setReportTarget(item)}
                            >
                              Lapor
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground text-sm"
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
          <p className="text-muted-foreground text-xs sm:text-sm">
            Menampilkan {startItem}-{endItem} dari {data.totalCount} pemeriksaan
          </p>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={data.page <= 1}
              onClick={() => void setFilters({ page: data.page - 1 })}
            >
              <LuChevronLeft className="h-4 w-4" />
              <span className="sr-only">Sebelumnya</span>
            </Button>

            {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(
              (pageNumber) => (
                <Button
                  key={pageNumber}
                  variant={data.page === pageNumber ? "default" : "ghost"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => void setFilters({ page: pageNumber })}
                >
                  {pageNumber}
                </Button>
              ),
            )}

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={data.page >= data.totalPages}
              onClick={() => void setFilters({ page: data.page + 1 })}
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
            <DialogTitle className="font-bold text-lg">
              Detail Hasil Pemeriksaan
            </DialogTitle>
            <DialogDescription className="text-xs">
              {selectedDetail &&
                `Diperiksa pada ${new Intl.DateTimeFormat("id-ID", {
                  dateStyle: "long",
                  timeStyle: "short",
                }).format(new Date(selectedDetail.createdAt))}`}
            </DialogDescription>
          </DialogHeader>

          {selectedDetail && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-3">
                <span className="font-medium text-muted-foreground text-xs">
                  Status Analisis
                </span>
                {renderStatusBadge(selectedDetail)}
              </div>

              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs">
                  {selectedDetail.document
                    ? `Dokumen: ${selectedDetail.document.fileName}`
                    : "Isi Pesan"}
                </Label>
                <div className="max-h-40 overflow-y-auto rounded-md border bg-muted/30 p-3 text-sm leading-relaxed">
                  {getDisplayContent(selectedDetail)}
                </div>
              </div>

              {selectedDetail.indicators.length > 0 && (
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground text-xs">
                    Indikator Analisis
                  </Label>
                  <ul className="list-disc space-y-1 pl-5 text-muted-foreground text-sm">
                    {selectedDetail.indicators.map((ind, i) => (
                      <li key={i}>{ind}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedDetail.recommendation && (
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground text-xs">
                    Saran Tindakan
                  </Label>
                  <p className="rounded-md border bg-muted/20 p-3 text-muted-foreground text-sm">
                    {selectedDetail.recommendation}
                  </p>
                </div>
              )}

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
            <DialogTitle className="font-bold text-lg">
              Laporkan Hasil Pemeriksaan
            </DialogTitle>
            <DialogDescription className="text-xs">
              Kirim laporan ini untuk diverifikasi lebih lanjut oleh admin.
            </DialogDescription>
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
                  value={getDisplayContent(reportTarget)}
                  className="min-h-[80px] resize-none bg-muted/50 text-muted-foreground text-sm"
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
    </>
  );
}
