# Frontend (React + Vite)

This is the frontend client for CloudLanguage.

- Fetches lessons from backend API (`/api/lessons`).
- Uses lesson metadata (`level`, `unit`, `topic`) for unit navigation.
- Stores progress in browser `localStorage`.
- Mobile-first UI with bottom navigation tabs.

## Local Run

1. `npm install`
2. `cp .env.example .env.local`
3. Required key in env:
   - `VITE_API_BASE_URL=/api`
4. Optional Supabase auth keys (for Bearer-token API auth):
   - `VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co`
   - `VITE_SUPABASE_ANON_KEY=<public_anon_key>`
5. `npm run dev`

Default local frontend URL: `http://localhost:3000`

## QA

- Mobile pre-push check: `MOBILE_SMOKE_TEST.md`

## iPhone Prototype

CloudLanguage can use Capacitor as a thin iOS wrapper around the current web app.

For the current prototype, the iOS wrapper points at the live VPS site by default so lessons load without a local mobile backend setup.

1. `npm run build`
2. `npm run cap:sync:ios`
3. `npm run cap:open:ios`

Open the generated `ios` project in Xcode and run it on:

- iPhone Simulator
- your real iPhone

Optional override for a different server:

- `CAPACITOR_SERVER_URL=https://your-server.example npm run cap:sync:ios`

