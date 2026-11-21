import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { HistoryHeader } from "@/features/history/components/history-header";
import { HistoryTable } from "@/features/history/components/history-table";
import { HistoryTableSkeleton } from "@/features/history/components/history-table-skeleton";
import { loadHistoryParams } from "@/features/history/params";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

interface Props {
  searchParams: Promise<SearchParams>;
}

export const metadata: Metadata = {
  title: "Riwayat Pemeriksaan",
};

export default async function RiwayatPage({ searchParams }: Props) {
  const filters = await loadHistoryParams(searchParams);

  prefetch(
    trpc.check.getMyHistory.queryOptions({
      ...filters,
    }),
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background text-foreground">
      <main className="container mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6 sm:py-12">
        <HistoryHeader />
        <HydrateClient>
          <Suspense fallback={<HistoryTableSkeleton />}>
            <HistoryTable />
          </Suspense>
        </HydrateClient>
      </main>
    </div>
  );
}
