# AI 新葡京 · SecondMe Hackathon Demo

Next.js App Router + TypeScript + Tailwind + Prisma demo for Second Me AI Game track.

## What this demo includes

- Massive-live atmosphere
  - `LiveTicker` top strip updates every 3s
  - `HotRooms` + `LeaderboardAndReports` from `/api/feeds`
- Growth loop
  - referral capture (`?ref=xxx`) via `middleware.ts` + localStorage/cookie
  - OAuth join CTAs + copy/share invite
  - telemetry + conversion metrics (`/api/telemetry`, `GrowthDashboard`)
- Playable A2A game loop
  - Hallucination Poker round-based simulation
  - create match, progress rounds, logs, winner settlement, battle report
  - deterministic with seed (judge reproducible)
- Safety baseline
  - manual input sanitization and length limits
  - in-memory rate limiting per route/IP
  - no token returned to frontend
  - no real money/payment paths (simulated chips only)

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma ORM

## Environment variables

Copy `.env.example` to `.env.local` and fill values.

Required:

- `DATABASE_URL` (Postgres, Vercel-friendly)
- `SECONDME_CLIENT_ID`
- `SECONDME_CLIENT_SECRET`
- `SECONDME_ALLOWED_SCOPES`
- `SECONDME_API_BASE_URL`
- `SECONDME_API_PREFIX`
- `SECONDME_OAUTH_URL`
- `SECONDME_TOKEN_ENDPOINT`

Optional:

- `SECONDME_REDIRECT_URI` (if empty, app auto uses `{current-origin}/api/auth/callback`)

## Local run

```bash
npm install --registry=https://registry.npmmirror.com
npx prisma generate
npx prisma db push
npm run dev
```

Open `http://localhost:3000`.

## Build check

```bash
npm run build
```

## Vercel deploy notes

1. Use a managed Postgres (Neon/Supabase/Vercel Postgres).
2. Configure all env vars in Vercel Project Settings.
3. Set callback URL in SecondMe app allowlist to include your domain callback:
   - `https://YOUR_DOMAIN/api/auth/callback`
4. If Vercel env `SECONDME_REDIRECT_URI` is set to localhost, OAuth will fail. Set it to your Vercel domain callback or leave it empty for auto origin fallback.
5. On deploy, run schema sync once:
   - `npx prisma db push`

## API overview

- `GET /api/feeds`
  - live rooms/leaderboard/reports + growth snapshot
- `POST /api/telemetry`
  - records CTA/visit/referral/match events
- `GET /api/telemetry`
  - quick growth snapshot + recent events
- `POST /api/matches`
  - create/progress Hallucination Poker matches

## Judge demo flow (5 min)

1. Open homepage; point to live ticker and room list refreshing.
2. Click copy invite in `InviteCard`; explain referral capture (`?ref=` + telemetry).
3. Click `一键 OAuth 上桌`; explain conversion event (`oauth_login`, `referral_conversion`).
4. Show `GrowthDashboard` counters increasing after CTA actions.
5. Open Hallucination Poker panel:
   - create match with seed `hackathon-2026`
   - run rounds with different strategies
   - show deterministic logs, settlement, winner, report summary
6. Show `HotRooms`/`LeaderboardAndReports` and spectate/bet/follow actions triggering telemetry.
7. Close with security constraints: simulated chips only, validation + rate limit + no token leakage.

## Key folders

- `src/app/api/*` API routes
- `src/components/*` UI modules
- `src/hooks/*` client state/telemetry hooks
- `src/lib/*` auth, match engine, mock data, safety utilities
- `src/types/domain.ts` shared domain types
