"use client";

import { useEffect, useState } from "react";
import { LuRotateCcw, LuSearch } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useHistoryFilter } from "../hooks/use-history-filter";

export function HistoryHeader() {
  const [filters, setFilters] = useHistoryFilter();
  const [searchInput, setSearchInput] = useState(filters.search);

  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        void setFilters({ search: searchInput, page: 1 });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput, filters.search, setFilters]);

  const isFiltered =
    filters.search !== "" ||
    filters.type !== "semua" ||
    filters.status !== "semua";

  const handleReset = () => {
    setSearchInput("");
    void setFilters({
      search: "",
      type: "semua",
      status: "semua",
      page: 1,
    });
  };

  return (
    <>
      {/* Header Halaman */}
      <section className="space-y-1.5">
        <h1 className="font-bold text-2xl tracking-tight sm:text-3xl">
          Riwayat Pemeriksaan
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Daftar riwayat pemeriksaan pesan dan dokumen yang pernah Anda lakukan.
        </p>
      </section>

      {/* Filter & Pencarian */}
      <section className="space-y-3 rounded-xl border bg-card p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 sm:items-end">
          <div className="space-y-1.5 sm:col-span-6">
            <Label htmlFor="search-history" className="font-medium text-xs">
              Pencarian
            </Label>
            <div className="relative">
              <LuSearch className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search-history"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Cari pesan atau nama file..."
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-1.5 sm:col-span-3">
            <Label className="font-medium text-xs">Jenis</Label>
            <Select
              value={filters.type}
              onValueChange={(value) =>
                void setFilters({
                  type: (value as typeof filters.type) ?? "semua",
                  page: 1,
                })
              }
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

          <div className="space-y-1.5 sm:col-span-3">
            <Label className="font-medium text-xs">Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) =>
                void setFilters({
                  status: (value as typeof filters.status) ?? "semua",
                  page: 1,
                })
              }
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
        </div>

        {isFiltered && (
          <div className="flex justify-end border-t pt-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-8 gap-1.5 text-muted-foreground text-xs hover:text-foreground"
            >
              <LuRotateCcw className="h-3.5 w-3.5" />
              Reset Filter
            </Button>
          </div>
        )}
      </section>
    </>
  );
}
