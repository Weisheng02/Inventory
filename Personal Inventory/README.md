### Personal Inventory

A mobile-first React + Vite + Tailwind CSS starter with Vercel serverless API for Google OAuth2 and Google Sheets read access.

### Tech

- **React + Vite**: fast dev and build
- **Tailwind CSS**: mobile-first styling
- **Vercel Functions**: API endpoints in `server/api`
- **Google APIs**: OAuth2 + Sheets (readonly)

### Prerequisites

- Node.js 18+ (recommended 20)
- Vercel CLI: `npm i -g vercel`
- Google Cloud project with OAuth Consent Screen (External) and OAuth Client ID (Web)

### Quickstart (Local)

1) Clone or open this folder.

2) Create `.env.local` with the following keys:

```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
OAUTH_REDIRECT_URI=http://localhost:5173/api/auth/callback
GOOGLE_SHEET_ID=17v0q7U6kVey1s5hmhywN89PRMbev0V4rI6UlHLcSfIY
NODE_ENV=development
```

3) Install deps:

```
npm ci
```

4) Run locally (frontend + API):

Option A (recommended): use Vercel to run functions and Vite together

```
vercel dev --listen 5173
```

Option B (frontend only):

```
npm run dev
# API routes will not be available with this option
```

5) Open `http://localhost:5173`. Click "Login with Google" → consent → redirected home.

### Google Cloud setup

1) In Google Cloud Console → APIs & Services:
- Create OAuth consent screen (External) and publish to Testing or Production.
- Create OAuth 2.0 Client ID (Web application).
- Authorized redirect URIs:
  - Local: `http://localhost:5173/api/auth/callback`
  - Production: `https://<your-vercel-domain>/api/auth/callback`

2) Enable APIs:
- Google Sheets API
- People API (for basic profile) or use `userinfo` via OAuth2 v2 (already used here)

3) Put `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` in Vercel Project Env and set `OAUTH_REDIRECT_URI` per environment.

### Deploy to Vercel

1) Push to GitHub and import the repo in Vercel.

2) Project Settings → Environment Variables (Production/Preview):
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `OAUTH_REDIRECT_URI` (e.g., `https://<your-domain>/api/auth/callback`)
- `GOOGLE_SHEET_ID` (optional; a default is included)

3) Framework Preset: Vite (auto-detected). Output dir: `dist`.

4) `vercel.json` already routes `/api/*` → `server/api/*`.

5) Deploy.

### Project structure

```
Personal Inventory/
  src/
    components/
    hooks/
    lib/
    pages/
    styles/
  server/
    api/
      auth/
      sheets/
      _lib/
  index.html
  package.json
  vite.config.js
  tailwind.config.js
  postcss.config.js
  vercel.json
  .env.local.example
```

### Notes

- The app stores the Google OAuth refresh token in an HTTP-only cookie. For full production hardening, consider rotating tokens and encrypting cookies with a KMS.
- Tailwind is configured mobile-first by default and the `container` is tuned for small screens.

### Exact commands to run locally

```
cd "$(pwd)/Personal Inventory"
npm ci
cp .env.local.example .env.local
# edit .env.local values
vercel dev --listen 5173
```


