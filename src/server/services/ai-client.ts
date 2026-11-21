import { env } from "@/env";

export interface PredictTextResponse {
  label: "SCAM" | "NORMAL" | "UNCERTAIN";
  score: number;
  model_version: string;
  indicators: string[];
  recommendation: string;
}

export interface PredictDocumentResponse extends PredictTextResponse {
  extracted_text: string;
  extraction_method: "PYMUPDF" | "TESSERACT";
  page_count: number | null;
}

// Menampung format README baru maupun format lama yang belum lengkap
interface RawAiPredictResponse {
  label?: string | null;
  score?: number | null;
  prob_penipuan?: number | null; // fallback format lama
  model_version?: string | null;
  indicators?: Array<{ kode?: string; keterangan?: string } | string> | null;
  advice?: string[] | string | null;
  processing_ms?: number | null;
}

const LABEL_MAP: Record<string, PredictTextResponse["label"]> = {
  // Sesuai README
  "indikasi penipuan": "SCAM",
  "pesan normal": "NORMAL",
  "belum dapat dipastikan": "UNCERTAIN",
  // Variasi format lama / singkatan
  penipuan: "SCAM",
  scam: "SCAM",
  normal: "NORMAL",
  aman: "NORMAL",
  meragukan: "UNCERTAIN",
  ragu: "UNCERTAIN",
  uncertain: "UNCERTAIN",
};

const DEFAULT_RECOMMENDATIONS: Record<PredictTextResponse["label"], string> = {
  SCAM: "Jangan mentransfer uang, mengklik tautan, atau membagikan kode OTP. Verifikasi pengirim melalui saluran resmi.",
  UNCERTAIN:
    "Pesan mengandung indikasi mencurigakan. Periksa ulang identitas pengirim sebelum menindaklanjuti.",
  NORMAL:
    "Tidak ditemukan indikasi penipuan yang kuat, namun tetap waspada terhadap permintaan data pribadi.",
};

function mapAiResponse(raw: RawAiPredictResponse): PredictTextResponse {
  const normalizedLabel =
    typeof raw.label === "string" ? raw.label.toLowerCase().trim() : "";
  const label: PredictTextResponse["label"] =
    LABEL_MAP[normalizedLabel] ?? "UNCERTAIN";

  // Ambil score baru, fallback ke prob_penipuan lama, pastikan angka valid 0..1
  const rawScore =
    typeof raw.score === "number"
      ? raw.score
      : typeof raw.prob_penipuan === "number"
        ? raw.prob_penipuan
        : 0;
  const score = Number.isFinite(rawScore)
    ? Math.min(1, Math.max(0, rawScore))
    : 0;

  // Handle indicators baik bentuk array of object ({ keterangan }) maupun array of string
  const indicators: string[] = Array.isArray(raw.indicators)
    ? raw.indicators
        .map((item) => {
          if (typeof item === "string") return item.trim();
          if (item && typeof item === "object") {
            return (item.keterangan ?? item.kode ?? "").trim();
          }
          return "";
        })
        .filter(Boolean)
    : [];

  // Handle advice baik array of string maupun single string, dengan fallback sesuai label
  let recommendation = "";
  if (Array.isArray(raw.advice)) {
    recommendation = raw.advice
      .filter((item): item is string => typeof item === "string")
      .map((s) => s.trim())
      .filter(Boolean)
      .join(" ");
  } else if (typeof raw.advice === "string") {
    recommendation = raw.advice.trim();
  }

  if (!recommendation) {
    recommendation = DEFAULT_RECOMMENDATIONS[label];
  }

  return {
    label,
    score,
    model_version:
      typeof raw.model_version === "string" && raw.model_version.trim()
        ? raw.model_version.trim()
        : "unknown",
    indicators,
    recommendation,
  };
}

// Rule-based mock sederhana untuk simulasi sebelum FastAPI siap
function runMockAnalysis(text: string): PredictTextResponse {
  const lower = text.toLowerCase();
  const indicators: string[] = [];

  if (/hadiah|menang|undian|selamat/.test(lower)) {
    indicators.push("Klaim hadiah atau undian tidak jelas");
  }
  if (/transfer|rekening|biaya admin|dana/.test(lower)) {
    indicators.push("Permintaan transfer uang di muka");
  }
  if (/otp|pin|password|kode verifikasi/.test(lower)) {
    indicators.push("Permintaan kode rahasia (OTP/PIN)");
  }
  if (/blokir|segera|hari ini|terakhir/.test(lower)) {
    indicators.push("Ancaman pemblokiran atau desakan segera bertindak");
  }
  if (/http:\/\/|https:\/\/|bit\.ly|klik tautan/.test(lower)) {
    indicators.push("Tautan mencurigakan");
  }

  if (indicators.length >= 2) {
    return {
      label: "SCAM",
      score: 0.91,
      model_version: "mock-rule-v0.1",
      indicators,
      recommendation: DEFAULT_RECOMMENDATIONS.SCAM,
    };
  }

  if (indicators.length === 1) {
    return {
      label: "UNCERTAIN",
      score: 0.58,
      model_version: "mock-rule-v0.1",
      indicators,
      recommendation: DEFAULT_RECOMMENDATIONS.UNCERTAIN,
    };
  }

  return {
    label: "NORMAL",
    score: 0.87,
    model_version: "mock-rule-v0.1",
    indicators: [],
    recommendation: DEFAULT_RECOMMENDATIONS.NORMAL,
  };
}

export async function predictTextAI(
  text: string,
  requestId?: string,
): Promise<PredictTextResponse> {
  if (env.USE_MOCK_AI) {
    await new Promise((r) => setTimeout(r, 300));
    return runMockAnalysis(text);
  }

  const res = await fetch(`${env.AI_API_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(env.AI_API_KEY ? { "X-API-Key": env.AI_API_KEY } : {}),
      ...(requestId ? { "x-request-id": requestId } : {}),
    },
    // Default MAX_CHARS di service AI = 2000, potong aman biar nggak kena 422
    body: JSON.stringify({ text: text.trim().slice(0, 2000) }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    throw new Error(`AI API returned HTTP ${res.status}`);
  }

  const raw = (await res.json()) as RawAiPredictResponse;
  return mapAiResponse(raw ?? {});
}

export async function predictDocumentAI(
  file: File,
  _maxPages: number,
  _requestId?: string,
): Promise<PredictDocumentResponse> {
  if (env.USE_MOCK_AI) {
    await new Promise((r) => setTimeout(r, 600));
    const mockExtracted = `[MOCK EKSTRAKSI ${file.name}] Selamat Anda memenangkan hadiah Rp50.000.000, segera transfer biaya admin.`;
    const analysis = runMockAnalysis(mockExtracted);

    return {
      ...analysis,
      extracted_text: mockExtracted,
      extraction_method:
        file.type === "application/pdf" ? "PYMUPDF" : "TESSERACT",
      page_count: file.type === "application/pdf" ? 1 : null,
    };
  }

  // Endpoint /predict-document belum diimplementasikan oleh tim AI
  throw new Error("Fitur pemeriksaan dokumen sementara dinonaktifkan.");
}

/*
  const formData = new FormData();
  formData.append("file", file);
  formData.append("max_pages", String(maxPages));

  const res = await fetch(`${env.AI_API_URL}/predict-document`, {
    method: "POST",
    headers: {
      ...(env.AI_API_KEY ? { "X-API-Key": env.AI_API_KEY } : {}),
      ...(requestId ? { "x-request-id": requestId } : {}),
    },
    body: formData,
    signal: AbortSignal.timeout(25_000),
  });

  if (!res.ok) {
    const errBody = (await res.json().catch(() => null)) as {
      detail?: string;
    } | null;
    throw new Error(
      errBody?.detail ?? `Document screening failed (${res.status})`,
    );
  }

  return (await res.json()) as PredictDocumentResponse;
  */
