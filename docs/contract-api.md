# Kontrak Integrasi API AI — AntiScamID (Web & Bot <-> FastAPI)

## Ketentuan Umum

- **Base URL:** Internal Docker network (misal `http://ai-service:8000`)
- **Format Encoding:** UTF-8
- **Header Opsional:** `x-request-id` (diteruskan untuk tracing log antarlayanan)

---

## 1. Deteksi Pesan Teks

**Endpoint:** `POST /predict`  
**Content-Type:** `application/json`

### Request Body

```json
{
  "text": "Selamat! Anda memenangkan hadiah Rp50.000.000. Segera transfer biaya admin Rp250.000 ke rekening berikut."
}
```

- `text` _(string, wajib)_: Teks pesan yang akan diperiksa (panjang 5 – 5.000 karakter).

### Response Sukses (`200 OK`)

```json
{
  "label": "SCAM",
  "score": 0.92,
  "model_version": "tfidf-logreg-v1.0",
  "indicators": ["Klaim hadiah atau undian", "Permintaan transfer uang"],
  "recommendation": "Jangan mentransfer uang sebelum memverifikasi pengirim melalui saluran resmi."
}
```

### Spesifikasi Field Response

| Field            | Tipe       | Keterangan                                                                                |
| :--------------- | :--------- | :---------------------------------------------------------------------------------------- |
| `label`          | `string`   | Wajib salah satu dari: `"SCAM"`, `"NORMAL"`, atau `"UNCERTAIN"` (jika confidence rendah). |
| `score`          | `float`    | Skor keyakinan model dalam rentang `0.0` sampai `1.0`.                                    |
| `model_version`  | `string`   | Versi/nama model yang dipakai (misal `"tfidf-logreg-v1.0"` atau `"indobert-v1"`).         |
| `indicators`     | `string[]` | Daftar indikator rule-based yang terdeteksi (boleh array kosong `[]` jika tidak ada).     |
| `recommendation` | `string`   | Saran tindakan aman singkat untuk ditampilkan ke pengguna.                                |

---

## 2. Pemeriksaan Awal Dokumen (Ekstraksi + Klasifikasi)

**Endpoint:** `POST /predict-document`  
**Content-Type:** `multipart/form-data`

### Request Form Fields

| Field       | Tipe               | Keterangan                                                                    |
| :---------- | :----------------- | :---------------------------------------------------------------------------- |
| `file`      | `File` _(wajib)_   | File dokumen (`application/pdf`, `image/jpeg`, `image/png`), maksimal `5 MB`. |
| `max_pages` | `int` _(opsional)_ | Batas maksimal halaman PDF (default: `5`).                                    |

### Response Sukses (`200 OK`)

```json
{
  "extracted_text": "SURAT PEMBERITAHUAN PEMENANG UNDIAN...",
  "extraction_method": "PYMUPDF",
  "page_count": 1,
  "label": "SCAM",
  "score": 0.89,
  "model_version": "tfidf-logreg-v1.0",
  "indicators": ["Klaim hadiah atau undian", "Instruksi transfer"],
  "recommendation": "Periksa keabsahan surat melalui kontak resmi instansi terkait."
}
```

### Spesifikasi Field Tambahan Dokumen

| Field               | Tipe          | Keterangan                                                                            |
| :------------------ | :------------ | :------------------------------------------------------------------------------------ |
| `extracted_text`    | `string`      | Teks mentah hasil ekstraksi PDF atau OCR gambar.                                      |
| `extraction_method` | `string`      | Wajib salah satu dari: `"PYMUPDF"` (PDF teks) atau `"TESSERACT"` (gambar / PDF scan). |
| `page_count`        | `int \| null` | Jumlah halaman jika file berupa PDF, atau `null` jika gambar (`JPG`/`PNG`).           |

---

## 3. Penanganan Error (`400` / `422` / `500`)

Jika validasi gagal (misal PDF melebihi 5 halaman, file korup, atau teks tidak terbaca), kembalikan HTTP status `400` atau `422` dengan format standar FastAPI:

```json
{
  "detail": "Jumlah halaman PDF melebihi batas maksimal 5 halaman."
}
```
