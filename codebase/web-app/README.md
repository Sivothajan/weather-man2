# The Weather Man Web App

Next.js dashboard and API for The Weather Man environmental sensor station.
The app uses shadcn UI and Prisma/PostgreSQL.

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
NEXT_PUBLIC_DATA_SIZE=24
NEXT_PUBLIC_DEMO_API=false
NEXT_PUBLIC_WEATHER_REFRESH_INTERVAL=5000
NEXT_PUBLIC_WEATHER_REFRESH_ENABLED=true
NTFY_SERVER_DOMAIN="ntfy.sh"
NTFY_CHANNEL_NAME=""
NTFY_USERNAME=""
NTFY_PASSWORD=""
```

## API

### `GET /api/readings`

Returns recent readings. Use `limit` to control the number of rows.

```bash
curl "http://localhost:3000/api/readings?limit=24"
```

### `POST /api/readings`

Stores a new station sample. Payload fields are camelCase.

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

Set `NEXT_PUBLIC_DEMO_API=true` to make the dashboard read from this endpoint.
