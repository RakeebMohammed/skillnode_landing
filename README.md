# SkillNode Analytics Landing Page + Admin Dashboard

A Next.js + MongoDB analytics starter based on the uploaded admin screenshots.

## Features

- Public landing page with one header, one form and one footer.
- Browser visitor ID + session ID stored in localStorage.
- Page-view tracking.
- Event tracking.
- 15-second heartbeat API for live-user presence.
- Live user dashboard with current page, city/country, IP, device, browser, OS and traffic source.
- Traffic-source classification for UTM campaigns, Google, Facebook, Instagram, LinkedIn, YouTube, referrers and direct traffic.
- Session tracking and user journey.
- MongoDB/Mongoose models for visitors, sessions, events and leads.
- Chart.js traffic and device charts.
- Admin login with an HTTP-only signed cookie.
- Lead management.
- CSV export for leads.
- Optional IP geolocation through `GEOIP_API_URL`.

## 1. Install

```bash
npm install
```

## 2. Configure environment

Copy `.env.example` to `.env.local` and fill in:

- `MONGODB_URI`
- `AUTH_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

For local MongoDB, an example is:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/skillnode_analytics
```

## 3. Start

```bash
npm run dev
```

Open:

- Landing page: http://localhost:3000
- Admin login: http://localhost:3000/login
- Dashboard: http://localhost:3000/admin

The first login automatically creates/updates the admin account using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env.local`.

## 4. Production

```bash
npm run build
npm start
```

Deploy to Vercel and add the same environment variables in Vercel Project Settings.

## Live users

The client sends:

```text
POST /api/analytics/heartbeat
```

every 15 seconds. A visitor is considered live when `lastSeen` is within the last 35 seconds. When a browser closes or loses connectivity, the visitor naturally drops from the live list after the timeout.

This avoids trying to use webhooks for presence. Webhooks are better for external integrations; heartbeat/API is the correct mechanism for live presence.

## Traffic source examples

Instagram paid ad:

```text
https://yourdomain.com/?utm_source=instagram&utm_medium=paid_social&utm_campaign=summer
```

Facebook paid ad:

```text
https://yourdomain.com/?utm_source=facebook&utm_medium=paid_social&utm_campaign=summer
```

Google Ads:

```text
https://yourdomain.com/?utm_source=google&utm_medium=cpc&utm_campaign=summer
```

No UTM/referrer -> Direct.

## Important production notes

1. Add a privacy/cookie notice and obtain consent where required by your visitors' jurisdiction before collecting analytics identifiers/IP information.
2. Restrict admin access and use a strong `AUTH_SECRET` and password.
3. IP geolocation services have rate limits. For high traffic, use a commercial geolocation service or your own cached lookup layer.
4. Add MongoDB indexes and retention policies as traffic grows.
5. For very high live-user volume, move heartbeat aggregation to Redis rather than writing every heartbeat to MongoDB.
6. Do not expose raw IP data to unauthorized users.
