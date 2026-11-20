import { env } from '@/env';

export interface PredictTextResponse {
    label: 'SCAM' | 'NORMAL' | 'UNCERTAIN';
    score: number;
    model_version: string;
    indicators: string[];
    recommendation: string;
}

export interface PredictDocumentResponse extends PredictTextResponse {
    extracted_text: string;
    extraction_method: 'PYMUPDF' | 'TESSERACT';
    page_count: number | null;
}

// Rule-based mock sederhana untuk simulasi sebelum FastAPI siap
function runMockAnalysis(text: string): PredictTextResponse {
    const lower = text.toLowerCase();
    const indicators: string[] = [];

    if (/hadiah|menang|undian|selamat/.test(lower)) {
        indicators.push('Klaim hadiah atau undian tidak jelas');
    }
    if (/transfer|rekening|biaya admin|dana/.test(lower)) {
        indicators.push('Permintaan transfer uang di muka');
    }
    if (/otp|pin|password|kode verifikasi/.test(lower)) {
        indicators.push('Permintaan kode rahasia (OTP/PIN)');
    }
    if (/blokir|segera|hari ini|terakhir/.test(lower)) {
        indicators.push('Ancaman pemblokiran atau desakan segera bertindak');
    }
    if (/http:\/\/|https:\/\/|bit\.ly|klik tautan/.test(lower)) {
        indicators.push('Tautan mencurigakan');
    }

    if (indicators.length >= 2) {
        return {
            label: 'SCAM',
            score: 0.91,
            model_version: 'mock-rule-v0.1',
            indicators,
            recommendation:
                'Jangan mentransfer uang, mengklik tautan, atau membagikan kode OTP. Verifikasi pengirim melalui saluran resmi.',
        };
    }

    if (indicators.length === 1) {
        return {
            label: 'UNCERTAIN',
            score: 0.58,
            model_version: 'mock-rule-v0.1',
            indicators,
            recommendation:
                'Pesan mengandung indikasi mencurigakan. Periksa ulang identitas pengirim sebelum menindaklanjuti.',
        };
    }

    return {
        label: 'NORMAL',
        score: 0.87,
        model_version: 'mock-rule-v0.1',
        indicators: [],
        recommendation:
            'Tidak ditemukan pola penipuan umum, namun tetap berhati-hati terhadap permintaan data pribadi.',
    };
}

export async function predictTextAI(
    text: string,
    requestId?: string,
): Promise<PredictTextResponse> {
    if (env.USE_MOCK_AI) {
        await new Promise((r) => setTimeout(r, 300)); // Simulasi latency jaringan
        return runMockAnalysis(text);
    }

    const res = await fetch(`${env.AI_API_URL}/predict`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(requestId ? { 'x-request-id': requestId } : {}),
        },
        body: JSON.stringify({ text }),
        signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
        throw new Error(`AI API returned HTTP ${res.status}`);
    }

    return (await res.json()) as PredictTextResponse;
}

export async function predictDocumentAI(
    file: File,
    maxPages: number,
    requestId?: string,
): Promise<PredictDocumentResponse> {
    if (env.USE_MOCK_AI) {
        await new Promise((r) => setTimeout(r, 600));
        const mockExtracted = `[MOCK EKSTRAKSI ${file.name}] Selamat Anda memenangkan hadiah Rp50.000.000, segera transfer biaya admin.`;
        const analysis = runMockAnalysis(mockExtracted);

        return {
            ...analysis,
            extracted_text: mockExtracted,
            extraction_method:
                file.type === 'application/pdf' ? 'PYMUPDF' : 'TESSERACT',
            page_count: file.type === 'application/pdf' ? 1 : null,
        };
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('max_pages', String(maxPages));

    const res = await fetch(`${env.AI_API_URL}/predict-document`, {
        method: 'POST',
        headers: {
            ...(requestId ? { 'x-request-id': requestId } : {}),
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
}