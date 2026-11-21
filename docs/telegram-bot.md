# Konfigurasi & Deployment Bot Telegram (AntiScamID)

Bot Telegram AntiScamID dibangun menggunakan **grammY** dan terintegrasi langsung dengan tRPC (`botRouter`). Bot mendukung dua mode operasional yang dapat diatur melalui _environment variable_: **Long Polling** (untuk _development_ lokal) dan **Webhook** (untuk _production_).

---

## 1. Environment Variables

Pastikan variabel berikut sudah terisi di file `.env`:

```env
# Base URL aplikasi (wajib HTTPS jika menggunakan mode webhook)
BETTER_AUTH_URL="[https://domain-anda.com](https://domain-anda.com)"

# Token bot dari @BotFather
TELEGRAM_BOT_TOKEN="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"

# Mode operasi bot: "polling" atau "webhook"
TELEGRAM_BOT_MODE="polling"

# Secret token acak untuk memvalidasi request masuk pada endpoint webhook
TELEGRAM_WEBHOOK_SECRET="isi_dengan_string_acak_yang_kuat"
```

---

## 2. Menjalankan Mode Long Polling (Development)

Mode ini cocok digunakan saat pengembangan di komputer lokal karena tidak memerlukan domain publik maupun sertifikat SSL.

1. Atur mode pada `.env`:
   ```env
   TELEGRAM_BOT_MODE="polling"
   ```
2. Pastikan tidak ada webhook yang masih terdaftar di server Telegram (jika sebelumnya pernah memakai webhook):
   ```bash
   yarn bot:webhook:delete
   ```
3. Jalankan _worker_ polling di terminal terpisah bersamaan dengan server Next.js:
   ```bash
   yarn dev
   yarn bot:polling
   ```

---

## 3. Menjalankan Mode Webhook (Production)

Pada mode webhook, server Telegram akan langsung mengirimkan _update_ pesan ke endpoint `POST /api/telegram/webhook`.

### Prasyarat

- Aplikasi Next.js sudah berjalan dan dapat diakses publik melalui **HTTPS** (`BETTER_AUTH_URL` diawali `https://`).
- Variabel `TELEGRAM_BOT_MODE` sudah diatur ke `"webhook"`.

### Langkah Registrasi Webhook

1. Perbarui `.env` di server _production_:
   ```env
   BETTER_AUTH_URL="[https://domain-anda.com](https://domain-anda.com)"
   TELEGRAM_BOT_MODE="webhook"
   TELEGRAM_WEBHOOK_SECRET="secret_token_anda"
   ```
2. Jalankan perintah registrasi webhook:
   ```bash
   yarn bot:webhook
   ```
3. Verifikasi bahwa webhook sudah aktif dan tidak ada _error_ pengiriman:
   ```bash
   yarn bot:webhook:info
   ```

---

## 4. Perintah Bot yang Tersedia

| Perintah          | Fungsi                                                                        |
| :---------------- | :---------------------------------------------------------------------------- |
| `/start`          | Menampilkan pesan sambutan dan daftar perintah utama                          |
| `/cek <pesan>`    | Menganalisis indikasi penipuan pada teks pesan menggunakan AI                 |
| `/lapor <pesan>`  | Mencatat laporan pesan penipuan ke database untuk ditinjau admin              |
| `/panduan`        | Menampilkan tips pencegahan penipuan digital                                  |
| `/bantuan`        | Menampilkan panduan penggunaan bot                                            |
| _(Teks langsung)_ | Pesan teks biasa tanpa awalan `/` otomatis dianalisis seperti perintah `/cek` |

---

## 5. Troubleshooting

- **Error `409 Conflict: terminated by other getUpdates request`**
  - **Penyebab:** Worker `bot:polling` dijalankan saat webhook masih aktif di server Telegram, atau ada dua proses polling yang berjalan bersamaan.
  - **Solusi:** Hentikan proses polling ganda dan jalankan `yarn bot:webhook:delete`.
- **Bot tidak merespons di mode Webhook**
  - **Penyebab:** URL belum HTTPS, endpoint mengembalikan status `404` (karena `TELEGRAM_BOT_MODE` belum diubah ke `"webhook"`), atau `TELEGRAM_WEBHOOK_SECRET` tidak sinkron.
  - **Solusi:** Jalankan `yarn bot:webhook:info` dan periksa kolom `last_error_message` untuk melihat detail penolakan dari server Telegram.
