import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function HistoryTableSkeleton() {
  return (
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
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell className="text-center">
                  <Skeleton className="mx-auto h-4 w-5" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-48" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-36 rounded-full" />
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex items-center gap-2">
                    <Skeleton className="h-4 w-10" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Skeleton */}
      <div className="flex flex-col items-center justify-between gap-4 pt-2 sm:flex-row">
        <Skeleton className="h-4 w-48" />
        <div className="flex items-center gap-1">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>
    </section>
  );
}
