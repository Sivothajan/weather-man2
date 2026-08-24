# The Weather Man

The Weather Man is a multi-station environmental sensor project with a Next.js
web app under [codebase/web-app](codebase/web-app/README.md).

The active web app uses:

- Next.js App Router
- shadcn UI components
- Better Auth for email/password auth, Google OAuth, email verification, and
  password reset
- admin account management for profile edits and verified email changes
- Prisma with PostgreSQL
- `/api/readings` for station-authenticated reading ingestion and monitor data
- public/private station visibility with private reads protected by admin auth
  or station API keys
- per-station Live Station Monitor refresh intervals
- ntfy alerts for rain and fire events when configured

## Diagrams

Mermaid diagrams for the web app, API, database, and firmware flow are in
[docs/diagrams.md](docs/diagrams.md).

## Firmware

Fresh Arduino/ESP8266 firmware lives under
[codebase/iot-firmware](codebase/iot-firmware/README.md).

- Arduino Mega 2560 reads sensors, writes SD logs, displays values on OLED, and
  sends camelCase JSON over `Serial1`.
- NodeMCU V3 receives that JSON and posts it to `POST /api/readings` with
  `X-Station-Id` and `X-Station-Key` headers.
- `config.h` is gitignored; copy `config.example.h` before uploading the
  NodeMCU sketch.

## Web App

```bash
cd codebase/web-app
bun install
bun run prisma:generate
bun run dev
```

Create `codebase/web-app/.env` from `codebase/web-app/.env.example` before
running with a real database.

Useful checks:

```bash
bun run lint
bun run knip
bun run build
```
