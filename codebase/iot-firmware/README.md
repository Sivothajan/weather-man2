# The Weather Man Firmware

Firmware for The Weather Man stack. The firmware posts sensor readings to the
web app API:

```text
POST /api/readings
```

## Architecture

```text
Sensors -> Arduino Mega 2560 -> Serial1 JSON -> NodeMCU ESP8266 -> /api/readings
```

- Arduino Mega 2560 reads sensors, writes local SD logs, updates OLED, and
  queues unsent JSON lines.
- NodeMCU ESP8266 connects to Wi-Fi, receives one JSON payload per line, posts
  it to the API, then replies `ACK` or `NACK`.

## Payload

The Mega sends camelCase JSON matching the Prisma-backed API:

```json
{
  "temperature": 25.0,
  "humidity": 50.0,
  "soilMoisture": 42,
  "soilRaw": 600,
  "rain": false,
  "rainRaw": 700,
  "fire": false
}
```

## Folders

- `weather-station/arduinoMega2560` - sensor reader, display, SD log, resend
  queue.
- `weather-station/nodeMcuV3` - Wi-Fi HTTP/HTTPS JSON forwarder.

## Setup

1. Upload `weather-station/arduinoMega2560/arduinoMega2560.ino` to the Mega.
2. Copy `weather-station/nodeMcuV3/config.example.h` to `config.h`.
3. Update Wi-Fi and API values in `config.h`.
4. Upload `weather-station/nodeMcuV3/nodeMcuV3.ino` to the NodeMCU.

`config.h` is gitignored because it contains Wi-Fi credentials.

## Wiring Musts

- Common ground between Mega and NodeMCU.
- Level shift Mega `TX1/D18` before NodeMCU `D6/GPIO12`.
- NodeMCU `D5/GPIO14` back to Mega `RX1/D19` for ACK/NACK.
- Do not feed 5V logic into ESP8266 pins.
