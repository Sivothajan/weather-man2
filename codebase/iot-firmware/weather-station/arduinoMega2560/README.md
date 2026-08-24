# Arduino Mega 2560 Firmware

Reads Weather Man sensors, logs locally, displays current values, and sends
camelCase JSON to the NodeMCU over `Serial1`.

## Libraries

Install these in Arduino IDE:

- `DHT sensor library`
- `Adafruit GFX Library`
- `Adafruit SSD1306`

Built-in Arduino libraries used:

- `SD`
- `SPI`
- `Wire`

## Pins

- DHT11 data: `D2`
- Soil analog: `A0`
- Rain analog: `A1`
- Fire digital: `D6`, active low
- SD card CS: `D10`
- SD SPI on Mega defaults: `MOSI D51`, `MISO D50`, `SCK D52`
- OLED SSD1306 I2C: `SDA D20`, `SCL D21`
- NodeMCU serial: `Serial1`, `TX1 D18`, `RX1 D19`

Use a level shifter between Mega `TX1/D18` and NodeMCU RX.

## Files Written To SD

- `datalog.txt` - readable CSV-style log.
- `unsent.txt` - one JSON payload per line when the NodeMCU does not ACK.

On boot, the Mega retries `unsent.txt` entries and keeps only failed lines.

## API Payload

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
