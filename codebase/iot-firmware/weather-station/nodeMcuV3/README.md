# NodeMCU V3 Firmware

Receives newline-terminated JSON from the Arduino Mega and posts it to the
Weather Man API.

## Libraries

Install the ESP8266 board package in Arduino IDE. The sketch uses these ESP8266
core libraries:

- `ESP8266WiFi`
- `ESP8266HTTPClient`
- `WiFiClientSecureBearSSL`
- `SoftwareSerial`

## Pins

- `D6/GPIO12` - RX from Mega `TX1/D18`, through a level shifter.
- `D5/GPIO14` - TX to Mega `RX1/D19`.
- Common ground with the Mega.

## Configure

Copy:

```text
config.example.h -> config.h
```

Then update Wi-Fi and API values.

```cpp
const char *WIFI_SSID = "your-wifi";
const char *WIFI_PASSWORD = "your-password";
const char *API_BASE_URL = "https://your-weather-man-domain.com";
const char *API_READINGS_PATH = "/api/readings";
const bool API_INSECURE_TLS = true;
```

For local HTTP tunneling or LAN testing, use an HTTP base URL:

```cpp
const char *API_BASE_URL = "http://192.168.1.10:3000";
```

## Behavior

- Valid JSON line received from Mega -> POST to `API_BASE_URL + /api/readings`.
- HTTP 2xx -> replies `ACK`.
- Failed Wi-Fi, bad JSON, timeout, or non-2xx response -> replies `NACK`.
