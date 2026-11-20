# Anti Scam ID

Anti Scam ID is a Next.js application with PostgreSQL/Prisma, Better Auth, Google OAuth, and an external AI API.

## Prerequisites

- Node.js 20.9 or newer
- npm
- PostgreSQL 14 or newer
- Google OAuth credentials
- A running AI API that exposes `GET /openapi.json`

## Installation

### 1. Clone and install dependencies

```bash
git clone <REPOSITORY_URL>
cd anti-scam-id
npm install
```

Replace `<REPOSITORY_URL>` with the repository URL from GitHub.

### 2. Create a PostgreSQL database

Create a database named `anti_scam_id`, for example in `psql`:

```sql
CREATE DATABASE anti_scam_id;
```

The default example connection string uses:

```text
postgresql://postgres:postgres@localhost:5432/anti_scam_id
```

Update the username, password, host, port, or database name when your local PostgreSQL setup differs.

### 3. Configure environment variables

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS or Linux:

```bash
cp .env.example .env
```

Open `.env` and replace the placeholder values:

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `BETTER_AUTH_URL` | Yes | Public URL of this app, for example `http://localhost:3000` locally |
| `BETTER_AUTH_SECRET` | Yes | Secret used to sign/authenticate sessions |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `AI_API_URL` | Yes | Base URL of the AI API, for example `http://localhost:3001` |
| `LOG_LEVEL` | No | One of `error`, `warn`, `info`, or `debug`; defaults to `info` in the example |
| `NEXT_PUBLIC_APP_NAME` | No | Public application name |

Generate a local auth secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

For Google OAuth, create an OAuth 2.0 Client ID in Google Cloud Console and add this redirect URI:

```text
http://localhost:3000/api/auth/callback/google
```

For a deployed app, replace `http://localhost:3000` in `BETTER_AUTH_URL` and the Google OAuth redirect URI with the deployed origin.

### 4. Initialize the database

For a fresh local database, create the Prisma schema tables:

```bash
npx prisma db push
```

If Prisma migrations are later added to `prisma/migrations`, use:

```bash
npx prisma migrate deploy
```

### 5. Generate the AI API types

With your AI API running, synchronize its OpenAPI schema:

```bash
npm run sync-api
```

This writes `src/types/ai-api.d.ts`. It is safe to run again whenever the AI API changes.

### 6. Start the application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The AI API is not started by this repository. Start it separately and set `AI_API_URL` to its base URL.

## Available npm scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production build |
| `npm run lint` | Run Biome checks |
| `npm run format` | Format the source with Biome |
| `npm run sync-api` | Fetch the AI API OpenAPI schema and regenerate its types |

## Production build

```bash
npm run build
npm run start
```

Set all required environment variables in the deployment platform and use the deployed HTTPS URL as `BETTER_AUTH_URL`.

## Troubleshooting

### Prisma cannot connect to PostgreSQL

- Verify PostgreSQL is running.
- Verify the database exists.
- Verify `DATABASE_URL` credentials and port.
- Test the connection with `npx prisma db push`.

### Google sign-in redirect is invalid

Add `http://localhost:3000/api/auth/callback/google` for local development in Google Cloud Console. Use the deployed equivalent for production.

### Environment variable validation fails

- Ensure `.env` is in the repository root.
- Do not leave placeholder values in `.env`.
- Ensure `BETTER_AUTH_URL` and `AI_API_URL` are valid URLs.
