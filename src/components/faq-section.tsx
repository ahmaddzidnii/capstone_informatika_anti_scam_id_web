"use client";

import { useState } from "react";
import { LuChevronsUpDown, LuPlus } from "react-icons/lu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ_ITEMS = [
  {
    id: "item-1",
    question: "Bagaimana cara kerja deteksi penipuan di AntiScamID?",
    answer:
      "AntiScamID menggunakan model AI yang dilatih untuk mengenali pola rekayasa sosial, urgensi palsu, tautan mencurigakan, serta struktur penipuan yang umum beredar dalam bahasa Indonesia—baik melalui teks pesan maupun dokumen.",
  },
  {
    id: "item-2",
    question: "Apakah pesan dan dokumen yang saya unggah aman?",
    answer:
      "Ya. Pemeriksaan dilakukan hanya untuk keperluan analisis. Namun, kami tetap menyarankan Anda menyensor informasi pribadi sensitif seperti NIK, nomor rekening, atau kode OTP sebelum mengunggah dokumen.",
  },
  {
    id: "item-3",
    question: "Format dokumen apa saja yang didukung untuk pemeriksaan?",
    answer:
      "Anda dapat mengunggah file berformat PDF, JPG, dan PNG dengan ukuran maksimal 5 MB (hingga 5 halaman untuk dokumen PDF). Sistem akan mengekstrak teks secara otomatis sebelum menganalisisnya.",
  },
  {
    id: "item-4",
    question: "Apakah hasil analisis AI menjamin 100% kebenaran?",
    answer:
      "Tidak. Hasil pemeriksaan bersifat analisis awal berbasis probabilitas (ditampilkan bersama skor tingkat keyakinan) untuk membantu kewaspadaan Anda. Selalu lakukan verifikasi ulang melalui saluran resmi instansi terkait.",
  },
  {
    id: "item-5",
    question: "Apakah saya harus login untuk menggunakan AntiScamID?",
    answer:
      "Tidak wajib. Pemeriksaan pesan dan dokumen dapat digunakan langsung tanpa akun. Login dengan Google hanya diperlukan jika Anda ingin menyimpan riwayat pemeriksaan dan mengirim laporan kasus penipuan.",
  },
];

export function FaqSection() {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const isAllExpanded = openItems.length === FAQ_ITEMS.length;

  const handleToggleAll = () => {
    if (isAllExpanded) {
      setOpenItems([]);
    } else {
      setOpenItems(FAQ_ITEMS.map((item) => item.id));
    }
  };

  return (
    <section className="container mx-auto max-w-4xl px-4 py-20 sm:px-6 sm:py-24">
      {/* Judul Tengah */}
      <h2 className="text-center font-bold text-3xl tracking-tight sm:text-4xl">
        Pertanyaan umum (FAQ)
      </h2>

      {/* Tombol Luaskan Semua */}
      <div className="mt-8 mb-4 flex justify-end">
        <button
          type="button"
          onClick={handleToggleAll}
          className="inline-flex cursor-pointer items-center gap-1.5 font-medium text-primary text-sm transition-opacity hover:opacity-80"
        >
          <span>{isAllExpanded ? "Tutup semua" : "Luaskan semua"}</span>
          <LuChevronsUpDown className="h-4 w-4" />
        </button>
      </div>

      {/* Daftar Accordion Pill */}
      <Accordion
        multiple
        value={openItems}
        onValueChange={setOpenItems}
        className="space-y-3.5"
      >
        {FAQ_ITEMS.map((item) => (
          <AccordionItem
            key={item.id}
            value={item.id}
            className="rounded-[28px] border border-border bg-card px-6 transition-colors data-[open]:bg-muted/30 data-[state=open]:bg-muted/30 sm:px-8"
          >
            <AccordionTrigger className="py-5 text-left font-medium text-base hover:no-underline [&>svg:not(.faq-plus)]:hidden [&[data-panel-open]_.faq-plus]:rotate-45 [&[data-state=open]_.faq-plus]:rotate-45">
              <span className="pr-4">{item.question}</span>
              <LuPlus className="faq-plus h-5 w-5 shrink-0 text-foreground transition-transform duration-200" />
            </AccordionTrigger>
            <AccordionContent className="pb-6 text-muted-foreground text-sm leading-relaxed sm:text-base">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
