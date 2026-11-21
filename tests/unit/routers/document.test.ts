import { beforeEach, describe, expect, it, vi } from "vitest";
import * as aiClient from "@/server/services/ai-client";
import { createTestCaller } from "../helpers/mock-context";

function buildFormData(params: {
  file?: File;
  keepForReport?: boolean;
  consentAccepted?: boolean;
}) {
  const fd = new FormData();
  if (params.file) fd.append("file", params.file);
  if (typeof params.keepForReport === "boolean") {
    fd.append("keepForReport", String(params.keepForReport));
  }
  if (typeof params.consentAccepted === "boolean") {
    fd.append("consentAccepted", String(params.consentAccepted));
  }
  return fd;
}

describe("documentRouter", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("menolak format file selain PDF, JPG, atau PNG", async () => {
    const { caller } = createTestCaller();
    const exeFile = new File(["binary"], "virus.exe", {
      type: "application/x-msdownload",
    });

    const fd = buildFormData({
      file: exeFile,
      consentAccepted: true,
    });

    await expect(caller.document.screenDocument(fd)).rejects.toThrow(
      /PDF, JPG, atau PNG/,
    );
  });

  it("menolak file dengan ukuran lebih dari 5 MB", async () => {
    const { caller } = createTestCaller();
    const bigBuffer = new Uint8Array(5 * 1024 * 1024 + 10);
    const bigPdf = new File([bigBuffer], "besar.pdf", {
      type: "application/pdf",
    });

    const fd = buildFormData({
      file: bigPdf,
      consentAccepted: true,
    });

    await expect(caller.document.screenDocument(fd)).rejects.toThrow(
      /maksimal 5 MB/,
    );
  });

  it("menolak jika consentAccepted tidak disetujui", async () => {
    const { caller } = createTestCaller();
    const validImg = new File(["img"], "bukti.png", { type: "image/png" });

    const fd = buildFormData({
      file: validImg,
      consentAccepted: false,
    });

    await expect(caller.document.screenDocument(fd)).rejects.toThrow(
      /Persetujuan/,
    );
  });

  it("menolak PDF yang jumlah halamannya melebihi 5 halaman", async () => {
    const { caller } = createTestCaller();
    const pdf = new File(["pdf"], "panjang.pdf", { type: "application/pdf" });

    vi.spyOn(aiClient, "predictDocumentAI").mockResolvedValueOnce({
      extracted_text: "teks",
      extraction_method: "PYMUPDF",
      page_count: 8,
      label: "NORMAL",
      score: 0.9,
      model_version: "v1",
      indicators: [],
      recommendation: "Aman",
    });

    const fd = buildFormData({
      file: pdf,
      consentAccepted: true,
    });

    await expect(caller.document.screenDocument(fd)).rejects.toThrow(
      /melebihi batas maksimal 5 halaman/,
    );
  });

  it("langsung purge extractedText jika keepForReport bernilai false", async () => {
    const { caller, mockPrisma } = createTestCaller();
    const pdf = new File(["pdf"], "surat.pdf", { type: "application/pdf" });

    vi.spyOn(aiClient, "predictDocumentAI").mockResolvedValueOnce({
      extracted_text: "Isi surat rahasia",
      extraction_method: "PYMUPDF",
      page_count: 2,
      label: "SCAM",
      score: 0.88,
      model_version: "v1",
      indicators: ["Transfer"],
      recommendation: "Waspada",
    });

    mockPrisma.check.create.mockResolvedValueOnce({
      id: "chk-doc-1",
      document: { id: "doc-1", isPurged: true },
    });

    const fd = buildFormData({
      file: pdf,
      keepForReport: false,
      consentAccepted: true,
    });

    await caller.document.screenDocument(fd);

    expect(mockPrisma.check.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          document: {
            create: expect.objectContaining({
              extractedText: null,
              isPurged: true,
            }),
          },
        }),
      }),
    );
  });
});
