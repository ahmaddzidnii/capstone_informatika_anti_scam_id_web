"use client";

import { useState } from "react";
import { LuCircleCheck, LuCircleHelp, LuTriangleAlert } from "react-icons/lu";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TREND_DATA_HARIAN = [
  { day: "Sen", volume: 1420 },
  { day: "Sel", volume: 1890 },
  { day: "Rab", volume: 1510 },
  { day: "Kam", volume: 2340 },
  { day: "Jum", volume: 1680 },
  { day: "Sab", volume: 1920 },
  { day: "Min", volume: 1690 },
];

const TREND_DATA_MINGGUAN = [
  { day: "Mgg 1", volume: 8200 },
  { day: "Mgg 2", volume: 9650 },
  { day: "Mgg 3", volume: 11100 },
  { day: "Mgg 4", volume: 12450 },
];

const MODUS_DATA = [
  { modus: "Hadiah Palsu", total: 1980 },
  { modus: "Lowongan Kerja", total: 1420 },
  { modus: "Atas Nama Bank", total: 1150 },
  { modus: "Investasi Bodong", total: 780 },
  { modus: "Minta Transfer", total: 510 },
];

const trendChartConfig = {
  volume: {
    label: "Volume Pemeriksaan",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const modusChartConfig = {
  total: {
    label: "Jumlah Kasus",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export default function AdminDashboardPage() {
  const [trendRange, setTrendRange] = useState("harian");
  const [modusFilter, setModusFilter] = useState("semua");

  const activeTrendData = trendRange === "harian" ? TREND_DATA_HARIAN : TREND_DATA_MINGGUAN;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header Judul */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard Admin</h1>
        <p className="text-sm text-muted-foreground">Statistik Sistem &amp; Pemantauan Penipuan</p>
      </div>

      {/* Section 1: Kartu Statistik */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Kartu Statistik</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Pemeriksaan */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Pemeriksaan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-3xl font-bold tracking-tight">12,450</p>
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">+12% minggu ini</p>
            </CardContent>
          </Card>

          {/* Indikasi Penipuan */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Indikasi Penipuan</CardTitle>
              <LuTriangleAlert className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold tracking-tight">5,840</p>
            </CardContent>
          </Card>

          {/* Pesan Normal */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pesan Normal</CardTitle>
              <LuCircleCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold tracking-tight">4,910</p>
            </CardContent>
          </Card>

          {/* Belum Pasti */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Belum Pasti</CardTitle>
              <LuCircleHelp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold tracking-tight">1,700</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Section 2: Visualisasi Data */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Visualisasi Data</h2>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Grafik Kiri: Tren Pemeriksaan */}
          <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4">
              <CardTitle className="text-base font-semibold">Tren Pemeriksaan</CardTitle>

              <Select
                value={trendRange}
                onValueChange={(val) => {
                  if (val) setTrendRange(val);
                }}
              >
                <SelectTrigger className="h-8 w-[155px] text-xs">
                  <SelectValue placeholder="Harian / Mingguan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="harian">Harian (7 Hari)</SelectItem>
                  <SelectItem value="mingguan">Mingguan (1 Bulan)</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>

            <CardContent className="flex-1 pt-2">
              <ChartContainer
                config={trendChartConfig}
                className="h-[260px] w-full"
              >
                <AreaChart
                  data={activeTrendData}
                  margin={{ top: 10, right: 12, left: -12, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="fillVolume"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--color-volume)"
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-volume)"
                        stopOpacity={0.0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                  />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    width={45}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Area
                    dataKey="volume"
                    type="natural"
                    fill="url(#fillVolume)"
                    stroke="var(--color-volume)"
                    strokeWidth={2.5}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Grafik Kanan: Statistik Modus Penipuan */}
          <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4">
              <CardTitle className="text-base font-semibold">Statistik Modus Penipuan</CardTitle>

              <Select
                value={modusFilter}
                onValueChange={(val) => {
                  if (val) setModusFilter(val);
                }}
              >
                <SelectTrigger className="h-8 w-[130px] text-xs">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Waktu</SelectItem>
                  <SelectItem value="minggu">Minggu Ini</SelectItem>
                  <SelectItem value="bulan">Bulan Ini</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>

            <CardContent className="flex-1 pt-2">
              <ChartContainer
                config={modusChartConfig}
                className="h-[260px] w-full"
              >
                <BarChart
                  data={MODUS_DATA}
                  layout="vertical"
                  margin={{ top: 4, right: 20, left: 10, bottom: 4 }}
                >
                  <CartesianGrid
                    horizontal={false}
                    strokeDasharray="3 3"
                  />
                  <YAxis
                    dataKey="modus"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    width={115}
                    tick={{ fontSize: 12 }}
                  />
                  <XAxis
                    type="number"
                    hide
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar
                    dataKey="total"
                    fill="var(--color-total)"
                    radius={[0, 6, 6, 0]}
                    barSize={22}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
