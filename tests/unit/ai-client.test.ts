import { describe, it, expect, vi, beforeEach } from 'vitest';
import { predictTextAI, predictDocumentAI } from '@/server/services/ai-client';
import { env } from '@/env';

describe('AI Client Service', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        (env as { USE_MOCK_AI: boolean }).USE_MOCK_AI = true;
    });

    it('mengembalikan SCAM jika terdeteksi >= 2 indikator penipuan', async () => {
        const res = await predictTextAI(
            'Selamat Anda menang hadiah! Segera transfer biaya admin hari ini.',
        );
        expect(res.label).toBe('SCAM');
        expect(res.indicators.length).toBeGreaterThanOrEqual(2);
    });

    it('mengembalikan UNCERTAIN jika hanya terdeteksi 1 indikator', async () => {
        const res = await predictTextAI('Silakan cek tautan berikut https://contoh.com');
        expect(res.label).toBe('UNCERTAIN');
        expect(res.indicators).toHaveLength(1);
    });

    it('mengembalikan NORMAL untuk pesan percakapan biasa', async () => {
        const res = await predictTextAI('Besok kuliah jam 8 pagi di ruang 302.');
        expect(res.label).toBe('NORMAL');
        expect(res.indicators).toHaveLength(0);
    });

    it('melempar error jika server FastAPI merespons status non-200 saat mode live', async () => {
        (env as { USE_MOCK_AI: boolean }).USE_MOCK_AI = false;
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
            new Response(null, { status: 503 }),
        );

        await expect(predictTextAI('Halo dunia')).rejects.toThrow('HTTP 503');
    });

    it('mengekstrak dokumen PDF dengan metode PYMUPDF pada mode mock', async () => {
        const file = new File(['dummy pdf'], 'undian.pdf', {
            type: 'application/pdf',
        });
        const res = await predictDocumentAI(file, 5);

        expect(res.extraction_method).toBe('PYMUPDF');
        expect(res.page_count).toBe(1);
        expect(res.label).toBe('SCAM');
    });
});