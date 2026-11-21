import { beforeEach, describe, expect, it, vi } from "vitest";
import * as aiClient from "@/server/services/ai-client";
import { createTestCaller } from "../helpers/mock-context";

describe("checkRouter", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("menolak teks kurang dari 5 karakter atau lebih dari 5000 karakter", async () => {
    const { caller } = createTestCaller();

    await expect(
      caller.check.analyzeText({ text: "hai", saveContent: false }),
    ).rejects.toThrow();

    await expect(
      caller.check.analyzeText({
        text: "a".repeat(5001),
        saveContent: false,
      }),
    ).rejects.toThrow();
  });

  it("tidak menyimpan isi pesan (content: null) jika saveContent false", async () => {
    const { caller, mockPrisma } = createTestCaller({ role: "user" });

    vi.spyOn(aiClient, "predictTextAI").mockResolvedValueOnce({
      label: "SCAM",
      score: 0.95,
      model_version: "v1",
      indicators: ["OTP"],
      recommendation: "Abaikan",
    });

    mockPrisma.check.create.mockResolvedValueOnce({
      id: "chk-1",
      content: null,
      predictionLabel: "SCAM",
    });

    await caller.check.analyzeText({
      text: "Kirim kode OTP kamu sekarang juga!",
      saveContent: false,
    });

    expect(mockPrisma.check.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          content: null,
          isContentSaved: false,
        }),
      }),
    );
  });

  it("melempar SERVICE_UNAVAILABLE jika layanan AI gagal merespons", async () => {
    const { caller } = createTestCaller();
    vi.spyOn(aiClient, "predictTextAI").mockRejectedValueOnce(
      new Error("Connection refused"),
    );

    await expect(
      caller.check.analyzeText({
        text: "Pesan panjang untuk diuji saat AI mati",
        saveContent: false,
      }),
    ).rejects.toMatchObject({ code: "SERVICE_UNAVAILABLE" });
  });

  it("menolak akses getMyHistory untuk tamu (guest)", async () => {
    const { caller } = createTestCaller({ role: "guest" });

    await expect(
      caller.check.getMyHistory({ limit: 10 }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("deleteMyHistory membersihkan isi pesan dan mengisi deletedAt", async () => {
    const { caller, mockPrisma } = createTestCaller({
      role: "user",
      userId: "u-1",
    });

    mockPrisma.check.findFirst.mockResolvedValueOnce({ id: "chk-99" });
    mockPrisma.check.update.mockResolvedValueOnce({ id: "chk-99" });

    const res = await caller.check.deleteMyHistory({ id: "chk-99" });
    expect(res.success).toBe(true);
    expect(mockPrisma.check.update).toHaveBeenCalledWith({
      where: { id: "chk-99" },
      data: expect.objectContaining({
        content: null,
        isContentSaved: false,
        deletedAt: expect.any(Date),
      }),
    });
  });
});
