# The Weather Man

The Weather Man is an environmental sensor station project with a Next.js web
app under [codebase/web-app](codebase/web-app/README.md).

The active web app uses:

- Next.js App Router
- shadcn UI components
- Prisma with PostgreSQL
- `/api/readings` for reading ingestion and dashboard data
- ntfy alerts for rain and fire events when configured

## Diagrams

Mermaid diagrams for the web app, API, database, and firmware flow are in
[docs/diagrams.md](docs/diagrams.md).

## Firmware

Fresh Arduino/ESP8266 firmware lives under
[codebase/iot-firmware](codebase/iot-firmware/README.md).

- Arduino Mega 2560 reads sensors, writes SD logs, displays values on OLED, and
  sends camelCase JSON over `Serial1`.
- NodeMCU V3 receives that JSON and posts it to `POST /api/readings`.
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
