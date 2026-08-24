# The Weather Man Web App

Next.js live monitor, admin console, and API for The Weather Man environmental
sensor stations. The app uses shadcn UI, Better Auth, Nodemailer, and
Prisma/PostgreSQL.

## Setup

```bash
bun install
bun run prisma:generate
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

```env
DATABASE_URL="postgresql://user:password@localhost:5432/weather_man"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
APP_BASE_URL="http://localhost:3000"
AUTH_SECRET="replace-with-a-long-random-secret"
BETTER_AUTH_SECRET="replace-with-a-long-random-secret"
AUTH_SIGNUP_ENABLED=true
NEXT_PUBLIC_DATA_SIZE=24
NEXT_PUBLIC_DEMO_API=false
NEXT_PUBLIC_WEATHER_REFRESH_INTERVAL=5000
NEXT_PUBLIC_WEATHER_REFRESH_ENABLED=true
SMTP_HOST=""
SMTP_PORT=587
SMTP_USER=""
SMTP_PASSWORD=""
SMTP_FROM=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
NTFY_SERVER_DOMAIN="ntfy.sh"
NTFY_CHANNEL_NAME=""
NTFY_USERNAME=""
NTFY_PASSWORD=""
```

## Admin

Better Auth powers `/signin`, `/signup`, Google OAuth, email verification,
verified email changes, and password reset. Set `AUTH_SIGNUP_ENABLED=false` to
disable public email/password signup. The first created user becomes `ADMIN`;
later users default to `VIEWER`.

Admin station management lives at `/admin/stations`. Admin account management
lives at `/admin/account`, where the signed-in admin can edit profile metadata
and request a verified email change.

- Create stations and copy the generated station code into firmware.
- Mark stations public or private.
- Set each station's Live Station Monitor fetch interval in milliseconds.
- Create station API keys and copy the full key immediately; only the hash is
  stored.
- Revoke old keys during rotation.

Public stations appear in the Live Station Monitor and public station list.
Private stations are hidden from the public monitor. Their readings require an
admin session or a matching station API key.

The Live Station Monitor has a private playground mode. Enter a private station
name or code plus that station's API key to fetch its readings without exposing
the private station list. Private mode also lets you override the monitor fetch
interval from the page.

When demo API mode is enabled, or when `DATABASE_URL` is missing, demo auth is
available without mutating real account records:

```text
admin@weather-man.demo / DemoAdmin123!
viewer@weather-man.demo / DemoViewer123!
```

Demo pages are kept separate from real administration under
`/admin/demo-stations`.

## API

### `GET /api/readings`

Returns recent public readings. Use `limit` to control the number of rows and
`station` to filter by station code.

```bash
curl "http://localhost:3000/api/readings?limit=24&station=main-station"
```

Private station reads require the station key:

```bash
curl "http://localhost:3000/api/readings?limit=24&station=private-station" \
  -H "X-Station-Key: generated-key"
```

### `POST /api/readings`

Stores a new station sample. Requests must include station credentials created
in the admin console.

```bash
curl -X POST "http://localhost:3000/api/readings" \
  -H "Content-Type: application/json" \
  -H "X-Station-Id: main-station" \
  -H "X-Station-Key: generated-key"
```

Payload fields are camelCase.

```json
{
  "temperature": 25,
  "humidity": 50,
  "soilMoisture": 42,
  "soilRaw": 600,
  "rain": false,
  "rainRaw": 700,
  "fire": false
}
```

### `GET /api/demo/readings`

Returns randomly generated readings with the same response shape as
`GET /api/readings`.

Set `NEXT_PUBLIC_DEMO_API=true` to make the Live Station Monitor read from this
endpoint. Demo mode includes Main, Roof, Greenhouse, and Field stations with
different refresh intervals.

Demo mode also includes private playground stations:

```text
Lab Station / lab-station / wm_demo_lab_station_key
Storage Station / storage-station / wm_demo_storage_station_key
```

## Development Checks

```bash
bun run lint
bun run knip
bun run build
```

This package is nested under `codebase/web-app` while the Git repository root is
two levels above it. The `prepare` script installs Husky hooks from the Git root
and points them at `codebase/web-app/.husky`; the pre-commit hook then changes
back into this package before running `lint-staged`.
