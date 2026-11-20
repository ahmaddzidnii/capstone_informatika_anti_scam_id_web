# Anti Scam ID

Anti Scam ID adalah aplikasi web untuk mendeteksi indikasi penipuan dari pesan dan dokumen. Aplikasi ini menggunakan Next.js, PostgreSQL, Prisma, Better Auth, Google OAuth, dan AI API eksternal. Aplikasi juga menyediakan bot Telegram untuk pemeriksaan pesan dan pelaporan penipuan.

## Fitur

- Deteksi pesan mencurigakan melalui web.
- Deteksi dokumen.
- Riwayat hasil pemeriksaan.
- Pelaporan pesan atau akun yang diduga melakukan penipuan.
- Dashboard administrator dan moderasi laporan.
- Login dengan Google OAuth.
- Bot Telegram dengan perintah `/cek`, `/lapor`, `/panduan`, dan `/bantuan`.
- Mock AI untuk development dan pengujian tanpa AI API eksternal.

## Prasyarat

- Node.js 20.9 atau lebih baru
- npm
- PostgreSQL 14 atau lebih baru
- Kredensial Google OAuth
- AI API yang aktif dan menyediakan `GET /openapi.json`
- Token bot Telegram jika ingin menjalankan bot

## Instalasi

### 1. Clone repository dan install dependency

```bash
git clone <REPOSITORY_URL>
cd anti-scam-id
npm install
```

Ganti `<REPOSITORY_URL>` dengan URL repository GitHub.

### 2. Siapkan PostgreSQL

Buat database bernama `anti_scam_id`, misalnya melalui `psql`:

```sql
CREATE DATABASE anti_scam_id;
```

Contoh connection string:

```text
postgresql://postgres:postgres@localhost:5432/anti_scam_id
```

Sesuaikan username, password, host, port, atau nama database dengan konfigurasi PostgreSQL lokal.

### 3. Buat file environment

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS atau Linux:

```bash
cp .env.example .env
```

Edit `.env` dan ganti semua placeholder. Variabel yang digunakan aplikasi:

| Variabel | Wajib | Keterangan |
| --- | --- | --- |
| `DATABASE_URL` | Ya | Connection string PostgreSQL |
| `BETTER_AUTH_URL` | Ya | URL aplikasi, gunakan `http://localhost:3000` untuk lokal |
| `BETTER_AUTH_SECRET` | Ya | Secret untuk autentikasi session |
| `GOOGLE_CLIENT_ID` | Ya | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Ya | Google OAuth Client Secret |
| `AI_API_URL` | Ya | URL dasar AI API, misalnya `http://localhost:3001` |
| `TELEGRAM_BOT_TOKEN` | Ya | Token bot dari BotFather |
| `TELEGRAM_BOT_MODE` | Tidak | `polling` atau `webhook`; default `polling` |
| `TELEGRAM_WEBHOOK_SECRET` | Tidak | Secret webhook, minimal 16 karakter |
| `USE_MOCK_AI` | Tidak | `true` untuk mock AI, `false` untuk AI API asli; default `true` |
| `LOG_LEVEL` | Tidak | `error`, `warn`, `info`, atau `debug` |
| `NEXT_PUBLIC_APP_NAME` | Tidak | Nama aplikasi yang ditampilkan ke pengguna |

Generate secret autentikasi lokal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Untuk login Google, tambahkan redirect URI berikut pada Google Cloud Console:

```text
http://localhost:3000/api/auth/callback/google
```

Untuk deployment, gunakan domain deployment pada `BETTER_AUTH_URL` dan redirect URI Google.

### 4. Inisialisasi database

Untuk database lokal baru:

```bash
npx prisma db push
```

Perintah tersebut membuat tabel sesuai schema Prisma. Jika repository sudah memiliki migration, gunakan:

```bash
npx prisma migrate deploy
```

### 5. Sinkronisasi tipe AI API

Pastikan AI API aktif dan `AI_API_URL` mengarah ke URL yang benar, lalu jalankan:

```bash
npm run sync-api
```

Perintah ini mengambil schema dari `${AI_API_URL}/openapi.json` dan menghasilkan `src/types/ai-api.d.ts`.

Jika hanya ingin menjalankan aplikasi dengan mock AI, tetap gunakan `USE_MOCK_AI=true`. AI API tetap diperlukan ketika menjalankan `npm run sync-api`, kecuali tipe hasil generate sudah tersedia.

## Menjalankan aplikasi

Jalankan server Next.js:

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

### Menjalankan bot Telegram

Bot polling dijalankan di terminal terpisah:

```bash
npm run bot:polling
```

Pastikan:

- `TELEGRAM_BOT_TOKEN` valid.
- `TELEGRAM_BOT_MODE=polling`.
- Server Next.js dan database sudah berjalan.
- `USE_MOCK_AI` diatur sesuai kebutuhan.

Script polling akan menghapus webhook yang aktif dan mendaftarkan command bot secara otomatis. Jangan menjalankan lebih dari satu instance polling untuk token bot yang sama.

Mode `webhook` memerlukan konfigurasi deployment dan URL webhook Telegram yang dapat diakses publik. Repository menyediakan endpoint webhook di `/api/telegram/webhook`, tetapi tidak menyediakan script deployment webhook otomatis.

## NPM scripts

| Command | Kegunaan |
| --- | --- |
| `npm run dev` | Menjalankan Next.js development server |
| `npm run build` | Membuat production build |
| `npm run start` | Menjalankan production build |
| `npm run lint` | Menjalankan pemeriksaan Biome |
| `npm run format` | Memformat source code dengan Biome |
| `npm run sync-api` | Mengambil OpenAPI schema AI API dan membuat tipe TypeScript |
| `npm run bot:polling` | Menjalankan bot Telegram dalam mode long polling |
| `npm test` | Menjalankan seluruh test sekali |
| `npm run test:unit` | Menjalankan unit test di `tests/unit` |
| `npm run test:e2e` | Menjalankan end-to-end flow Anti Scam ID |

## Pengujian

Untuk menjalankan seluruh test:

```bash
npm test
```

Untuk unit test saja:

```bash
npm run test:unit
```

Untuk end-to-end test:

```bash
npm run test:e2e
```

Test menggunakan konfigurasi Vitest pada `vitest.config.ts` dan berjalan pada environment Node.js. Gunakan `USE_MOCK_AI=true` agar test tidak bergantung pada AI API eksternal.

## Production

```bash
npm run build
npm run start
```

Pastikan seluruh environment variable wajib telah dikonfigurasi pada platform deployment. Untuk production:

- Gunakan HTTPS pada `BETTER_AUTH_URL`.
- Gunakan database PostgreSQL production.
- Gunakan `USE_MOCK_AI=false` jika ingin memakai AI API asli.
- Atur kredensial Google OAuth sesuai domain production.
- Gunakan mode Telegram `webhook` jika bot dijalankan melalui endpoint publik.

## Troubleshooting

### Prisma tidak dapat terhubung ke PostgreSQL

- Pastikan PostgreSQL sedang berjalan.
- Pastikan database `anti_scam_id` sudah dibuat.
- Periksa username, password, port, dan host pada `DATABASE_URL`.
- Jalankan `npx prisma db push` untuk menguji koneksi.

### Login Google gagal atau redirect tidak valid

Pastikan redirect URI berikut terdaftar di Google Cloud Console:

```text
http://localhost:3000/api/auth/callback/google
```

### Bot Telegram tidak berjalan

- Pastikan token berasal dari BotFather dan tidak memiliki spasi tambahan.
- Pastikan `TELEGRAM_BOT_MODE=polling`.
- Hentikan instance bot lain yang memakai token sama.
- Pastikan `.env` berada di root repository.

### Sinkronisasi AI API gagal

- Pastikan AI API sedang aktif.
- Pastikan endpoint `${AI_API_URL}/openapi.json` dapat diakses.
- Periksa nilai `AI_API_URL` agar tidak memiliki path `/openapi.json` ganda.

### Validasi environment gagal

- Pastikan `.env` berada di root repository.
- Ganti semua nilai placeholder.
- Pastikan `BETTER_AUTH_URL` dan `AI_API_URL` merupakan URL yang valid.
- Pastikan `TELEGRAM_WEBHOOK_SECRET` memiliki minimal 16 karakter jika digunakan.
