## Personal Inventory

Full-stack web app without auth. Frontend (React + Tailwind) talks to a backend (Express) that stores data in Google Sheets via a Service Account.

### Google Sheet Format
Create a Google Sheet and name a worksheet `Items` (or set `SHEET_NAME`). Add this header row in A1:H1 exactly:

```
id | name | category | purchase_date | price | status | notes | image_url
```

Data rows begin on row 2. The backend will maintain `id` as the sheet row number.

Share the sheet with your Service Account email as Editor.

### Backend (Express)

- Location: `backend/`
- Node 18+ required
- Endpoints:
  - GET `/items`
  - POST `/items`
  - PUT `/items/:id`
  - DELETE `/items/:id`

Env (.env):

```
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
SHEET_ID=your-google-sheet-id
SHEET_NAME=Items
FRONTEND_ORIGIN=http://localhost:5173
PORT=4000
```

Local run:

```
cd backend
npm i
npm run dev
```

Deploy options:

- Vercel: `api/index.js` is the serverless entry. Set env vars in the dashboard. Optionally include `vercel.json`.
- Netlify Functions: use `netlify/functions/app.js` as handler. Set env in site settings.
- Cloudflare Workers: wrap `src/app.js` with a workers adapter (not included here), or deploy the Node server via Pages Functions.

### Frontend (React + Tailwind)

- Location: `frontend/`
- Env (.env):

```
VITE_BACKEND_URL=http://localhost:4000
```

Local run:

```
cd frontend
npm i
npm run dev
```

Build:

```
npm run build
```

Deploy to Vercel/Netlify. Set `VITE_BACKEND_URL` to your deployed backend URL.

### Notes

- CORS is enabled on the backend. Set `FRONTEND_ORIGIN` to your frontend origin in production.
- The backend replaces literal `\n` in `GOOGLE_PRIVATE_KEY` with newlines automatically.


