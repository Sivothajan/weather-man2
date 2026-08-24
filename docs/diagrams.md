# The Weather Man Diagrams

## System Overview

```mermaid
flowchart LR
  Sensors[Weather sensors] --> Mega[Arduino Mega 2560]
  Mega --> Display[OLED display]
  Mega --> Storage[SD card log]
  Mega --> NodeMcu[NodeMCU ESP8266]
  NodeMcu --> Api[Next.js API]
  Admin[Admin station manager] --> Auth[Better Auth]
  Account[Admin account page] --> Auth
  Admin --> Api
  Auth --> Database
  Api --> Database[(PostgreSQL)]
  Api --> Alerts[ntfy alerts]
  Monitor[Live Station Monitor] --> Api
  Home[Home page] --> Monitor
```

## Reading Flow

```mermaid
sequenceDiagram
  participant Sensors as Sensors
  participant Mega as Arduino Mega 2560
  participant NodeMcu as NodeMCU ESP8266
  participant Api as POST /api/readings
  participant Station as Station API key check
  participant Db as PostgreSQL
  participant Alert as ntfy

  Sensors->>Mega: temperature, humidity, soil, rain, fire
  Mega->>Mega: build camelCase JSON
  Mega->>NodeMcu: serial line payload
  NodeMcu->>Api: HTTP JSON request with station headers
  Api->>Station: verify station code and key hash
  Api->>Api: validate reading
  Api->>Db: store station-linked WeatherReading
  Api-->>NodeMcu: success response
  NodeMcu-->>Mega: ACK
  Api-->>Alert: send rain or fire alert when configured
```

## Web App Runtime

```mermaid
flowchart TB
  Env{NEXT_PUBLIC_DEMO_API}
  Env -->|true| DemoApi[GET /api/demo/readings]
  Env -->|false| ReadApi[GET /api/readings]
  MonitorRoute[Live monitor route] --> Env
  MonitorRoute --> StationList[GET /api/stations]
  StationList --> Polling[Station refresh interval]
  DemoApi --> Generator[Random demo reading generator]
  ReadApi --> Service[Reading service]
  Service --> Prisma[Prisma client]
  Prisma --> Database[(PostgreSQL)]
  Generator --> Charts[Charts, metrics, table]
  Database --> Charts
```

## API Surface

```mermaid
flowchart LR
  Client[Live monitor or device] --> GetReadings[GET /api/readings]
  Device[NodeMCU ESP8266] --> PostReadings[POST /api/readings]
  Monitor[Live monitor demo mode] --> DemoReadings[GET /api/demo/readings]
  Monitor --> Stations[GET /api/stations]
  Admin[Admin pages] --> AuthRoutes[Better Auth /api/auth/*]
  Admin --> AccountPage[Profile and email change]
  Admin --> StationActions[Station server actions]

  GetReadings --> Visibility[Public station or authorized private read]
  Visibility --> Recent[Recent reading list]
  PostReadings --> Credentials[Validate station key]
  Credentials --> Create[Create WeatherReading]
  DemoReadings --> Random[Random reading list]
  StationActions --> StationKeys[Manage stations and API keys]
  AccountPage --> AuthRoutes

  Create --> Database[(PostgreSQL)]
  StationKeys --> Database
  AuthRoutes --> Database
  Database --> Recent
  Database --> Stations
```

## Database Model

```mermaid
erDiagram
  User ||--o{ Session : has
  User ||--o{ Account : has
  WeatherStation ||--o{ StationApiKey : has
  WeatherStation ||--o{ WeatherReading : records

  User {
    string id
    string name
    string email
    boolean emailVerified
    string image
    string role
  }
  Session {
    string id
    string token
    datetime expiresAt
  }
  Account {
    string id
    string providerId
    string issuer
    string accountId
  }
  WeatherStation {
    string id
    string stationCode
    string name
    boolean isActive
    boolean isPublic
    int refreshIntervalMs
  }
  StationApiKey {
    string id
    string keyHash
    string keyPrefix
    datetime lastUsedAt
    datetime revokedAt
  }
  WeatherReading {
    string id
    string stationId
    float temperature
    float humidity
    int soilMoisture
    int soilRaw
    boolean rain
    int rainRaw
    boolean fire
    datetime timestamp
  }
```

## Firmware Loop

```mermaid
stateDiagram-v2
  [*] --> SampleSensors
  SampleSensors --> BuildPayload
  BuildPayload --> UpdateDisplay
  UpdateDisplay --> WriteSdLog
  WriteSdLog --> SendSerial
  SendSerial --> WaitForAck
  WaitForAck --> Sleep: ACK
  WaitForAck --> QueuePayload: NACK or timeout
  QueuePayload --> Sleep
  Sleep --> RetryQueue
  RetryQueue --> SampleSensors
```
